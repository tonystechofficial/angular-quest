import { GraphSpec, simulate } from './signal-sim';

/** price=10, qty=2 → total=price*qty → label=`Total: ${total}` → effect logs label. */
const chain: GraphSpec = {
  nodes: [
    { id: 'price', kind: 'signal', value: 10 },
    { id: 'qty', kind: 'signal', value: 2 },
    {
      id: 'total',
      kind: 'computed',
      deps: ['price', 'qty'],
      compute: (v) => Number(v['price']) * Number(v['qty']),
    },
    { id: 'label', kind: 'computed', deps: ['total'], compute: (v) => `Total: ${v['total']}` },
    { id: 'log', kind: 'effect', deps: ['label'] },
  ],
};

describe('simulate: a chain of signals, computeds and an effect', () => {
  it('recomputes every dependent and runs the effect when a source changes', () => {
    const run = simulate(chain, { set: { id: 'qty', value: 3 } }, ['label']);
    expect(run.recomputed).toEqual(['total', 'label']);
    expect(run.effectsRun).toEqual(['log']);
    expect(run.after['total']).toBe(30);
    expect(run.after['label']).toBe('Total: 30');
    expect(run.before['total']).toBe(20);
  });

  it('does nothing when the signal is set to an equal value (Object.is)', () => {
    const run = simulate(chain, { set: { id: 'qty', value: 2 } }, ['label']);
    expect(run.recomputed).toEqual([]);
    expect(run.effectsRun).toEqual([]);
  });

  it('is lazy: a dirty computed that nobody reads is not recomputed', () => {
    const noEffect: GraphSpec = { nodes: chain.nodes.filter((node) => node.kind !== 'effect') };
    const run = simulate(noEffect, { set: { id: 'price', value: 99 } }, []);
    expect(run.recomputed).toEqual([]);
    expect(run.computations['total'] ?? 0).toBe(0);
    // the final snapshot is still consistent: it is read without being recorded
    expect(run.after['total']).toBe(198);
  });

  it('an effect forces the recomputation of what it reads, even when the template reads nothing', () => {
    const run = simulate(chain, { set: { id: 'price', value: 99 } }, []);
    expect(run.recomputed).toEqual(['total', 'label']);
    expect(run.effectsRun).toEqual(['log']);
  });

  it('returns the initial state when there is no action', () => {
    const run = simulate(chain, null, []);
    expect(run.before['label']).toBe('Total: 20');
    expect(run.touched).toEqual([]);
  });
});

describe('simulate: equality stops propagation', () => {
  const parity: GraphSpec = {
    nodes: [
      { id: 'n', kind: 'signal', value: 5 },
      { id: 'isEven', kind: 'computed', deps: ['n'], compute: (v) => Number(v['n']) % 2 === 0 },
      {
        id: 'msg',
        kind: 'computed',
        deps: ['isEven'],
        compute: (v) => (v['isEven'] ? 'even' : 'odd'),
      },
      { id: 'show', kind: 'effect', deps: ['msg'] },
    ],
  };

  it('recomputes the direct dependent but not the ones whose input did not change', () => {
    const run = simulate(parity, { set: { id: 'n', value: 7 } }, ['msg']);
    expect(run.recomputed).toEqual(['isEven']);
    expect(run.effectsRun).toEqual([]);
    expect(run.after['msg']).toBe('odd');
  });

  it('propagates when the derived value does change', () => {
    const run = simulate(parity, { set: { id: 'n', value: 8 } }, ['msg']);
    expect(run.recomputed).toEqual(['isEven', 'msg']);
    expect(run.effectsRun).toEqual(['show']);
  });
});

describe('simulate: diamond dependencies are glitch-free', () => {
  const diamond: GraphSpec = {
    nodes: [
      { id: 'a', kind: 'signal', value: 1 },
      { id: 'b', kind: 'computed', deps: ['a'], compute: (v) => Number(v['a']) * 2 },
      { id: 'c', kind: 'computed', deps: ['a'], compute: (v) => Number(v['a']) + 1 },
      {
        id: 'd',
        kind: 'computed',
        deps: ['b', 'c'],
        compute: (v) => Number(v['b']) + Number(v['c']),
      },
    ],
  };

  it('recomputes each node exactly once, in dependency order', () => {
    const run = simulate(diamond, { set: { id: 'a', value: 5 } }, ['d']);
    expect(run.recomputed).toEqual(['b', 'c', 'd']);
    expect(run.after['d']).toBe(16);
    expect(run.computations['d']).toBe(1);
  });
});

describe('simulate: untracked reads', () => {
  const spec: GraphSpec = {
    nodes: [
      { id: 'tracked', kind: 'signal', value: 1 },
      { id: 'ignored', kind: 'signal', value: 1 },
      { id: 'fx', kind: 'effect', deps: ['tracked'], untrackedDeps: ['ignored'] },
    ],
  };

  it('does not re-run an effect when only an untracked dependency changes', () => {
    expect(simulate(spec, { set: { id: 'ignored', value: 2 } }, []).effectsRun).toEqual([]);
    expect(simulate(spec, { set: { id: 'tracked', value: 2 } }, []).effectsRun).toEqual(['fx']);
  });
});

describe('simulate: guards', () => {
  it('rejects setting a computed or an unknown node', () => {
    expect(() => simulate(chain, { set: { id: 'total', value: 1 } }, [])).toThrow();
    expect(() => simulate(chain, { set: { id: 'nope', value: 1 } }, [])).toThrow();
  });

  it('lists the nodes touched by a run (recomputed plus effects) for scoring', () => {
    const run = simulate(chain, { set: { id: 'qty', value: 3 } }, ['label']);
    expect(run.touched).toEqual(['total', 'label', 'log']);
  });
});
