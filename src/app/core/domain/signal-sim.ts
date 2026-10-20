/**
 * A tiny simulator of Angular's signal graph, faithful on the points that matter for intuition:
 *  - `set` with an equal value (Object.is) changes nothing,
 *  - computeds are lazy: they recompute only when read, and only if a producer actually changed,
 *  - a computed whose recomputed value is equal to the old one does not disturb its consumers,
 *  - a diamond recomputes each node once (no glitches),
 *  - effects re-run only when a TRACKED dependency changed; `untracked` reads do not count.
 * It is not Angular's implementation; it reproduces its observable behaviour on small graphs.
 */
export type Value = number | string | boolean;
export type Values = Record<string, Value>;

export interface SignalNode {
  id: string;
  kind: 'signal';
  value: Value;
}

export interface ComputedNode {
  id: string;
  kind: 'computed';
  deps: string[];
  compute: (values: Values) => Value;
}

export interface EffectNode {
  id: string;
  kind: 'effect';
  deps: string[];
  /** Dependencies read inside `untracked(() => …)`: never trigger the effect. */
  untrackedDeps?: string[];
}

export type GraphNode = SignalNode | ComputedNode | EffectNode;

export interface GraphSpec {
  nodes: GraphNode[];
}

export interface Action {
  set: { id: string; value: Value };
}

export interface SimulationRun {
  /** Signal and computed values before the action. */
  before: Values;
  /** Consistent values after the action (read without being recorded). */
  after: Values;
  /** Computeds that actually recomputed because something read them, in order. */
  recomputed: string[];
  /** Effects that re-ran, in declaration order. */
  effectsRun: string[];
  /** recomputed + effectsRun: what a player has to predict. */
  touched: string[];
  /** Number of recomputations per computed during the run. */
  computations: Record<string, number>;
}

interface ProducerState {
  value: Value;
  version: number;
  /** Versions of the producers seen at the last computation (computeds and effects). */
  seen: Record<string, number>;
}

export function simulate(spec: GraphSpec, action: Action | null, reads: string[]): SimulationRun {
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const state = new Map<string, ProducerState>();
  const recomputed: string[] = [];
  const computations: Record<string, number> = {};
  let recording = false;

  const node = (id: string): GraphNode => {
    const found = nodes.get(id);
    if (!found) {
      throw new Error(`unknown node "${id}"`);
    }
    return found;
  };

  const depValues = (deps: string[]): Values =>
    Object.fromEntries(deps.map((dep) => [dep, read(dep)]));

  /** Bring a computed up to date (recomputing only if a producer changed) and return its value. */
  const read = (id: string): Value => {
    const current = node(id);
    if (current.kind === 'effect') {
      throw new Error(`effect "${id}" has no value`);
    }
    if (current.kind === 'signal') {
      return state.get(id)!.value;
    }
    const existing = state.get(id);
    if (existing && !producersChanged(current.deps, existing.seen)) {
      return existing.value;
    }
    const value = current.compute(depValues(current.deps));
    const seen = snapshot(current.deps);
    if (!existing) {
      state.set(id, { value, version: 0, seen });
      return value;
    }
    const changed = !Object.is(existing.value, value);
    state.set(id, { value, version: existing.version + (changed ? 1 : 0), seen });
    if (recording) {
      recomputed.push(id);
      computations[id] = (computations[id] ?? 0) + 1;
    }
    return value;
  };

  /** Refresh the computed producers first, then compare versions with what was last seen. */
  const producersChanged = (deps: string[], seen: Record<string, number>): boolean => {
    for (const dep of deps) {
      if (node(dep).kind === 'computed') {
        read(dep);
      }
    }
    return deps.some((dep) => state.get(dep)!.version !== seen[dep]);
  };

  const snapshot = (deps: string[]): Record<string, number> =>
    Object.fromEntries(deps.map((dep) => [dep, state.get(dep)!.version]));

  // --- initial evaluation (not recorded)
  for (const current of spec.nodes) {
    if (current.kind === 'signal') {
      state.set(current.id, { value: current.value, version: 0, seen: {} });
    }
  }
  for (const current of spec.nodes) {
    if (current.kind === 'computed') {
      read(current.id);
    }
  }
  const effectSeen = new Map<string, Record<string, number>>();
  for (const current of spec.nodes) {
    if (current.kind === 'effect') {
      producersChanged(current.deps, {});
      effectSeen.set(current.id, snapshot(current.deps));
    }
  }
  const before = values();

  // --- the action
  if (action) {
    const target = node(action.set.id);
    if (target.kind !== 'signal') {
      throw new Error(`only signals can be set ("${action.set.id}" is a ${target.kind})`);
    }
    const current = state.get(target.id)!;
    if (!Object.is(current.value, action.set.value)) {
      state.set(target.id, { ...current, value: action.set.value, version: current.version + 1 });
    }
  }

  // --- template reads, then effects
  recording = true;
  for (const id of reads) {
    read(id);
  }
  const effectsRun: string[] = [];
  for (const current of spec.nodes) {
    if (current.kind === 'effect') {
      const seen = effectSeen.get(current.id) ?? {};
      if (producersChanged(current.deps, seen)) {
        effectsRun.push(current.id);
        effectSeen.set(current.id, snapshot(current.deps));
      }
    }
  }
  recording = false;
  const after = values();

  return {
    before,
    after,
    recomputed,
    effectsRun,
    touched: [...recomputed, ...effectsRun],
    computations,
  };

  function values(): Values {
    const result: Values = {};
    for (const current of spec.nodes) {
      if (current.kind !== 'effect') {
        result[current.id] = read(current.id);
      }
    }
    return result;
  }
}
