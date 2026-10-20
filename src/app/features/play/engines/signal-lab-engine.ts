import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { setF1 } from '../../../core/domain/scoring';
import { simulate, SimulationRun } from '../../../core/domain/signal-sim';
import { SignalLabChallenge, SignalLabNode } from '../../../core/models';
import { RoundEngine } from './round-engine';

const NODE_W = 132;
const NODE_H = 46;
const KIND_ICON: Record<string, string> = { signal: '◉', computed: 'ƒ', effect: '⚡' };

type NodeStatus = 'correct' | 'wrong' | 'missed' | 'none';

@Component({
  selector: 'app-signal-lab-engine',
  imports: [DecimalPipe],
  template: `
    <div class="stack">
      <div class="engine-header">
        <span class="pill">Scenario {{ index() + 1 }} / {{ total() }}</span>
        <span class="progress"><span [style.width.%]="progressPct()"></span></span>
        @if (scores().length) {
          <span class="small muted">Average F1: {{ averageScore() | number: '1.0-0' }}%</span>
        }
      </div>

      @let r = round();
      <div class="grid grid-2">
        <pre class="code" [textContent]="r.code"></pre>
        <div class="stack-sm">
          <p class="prompt" style="margin: 0">{{ r.prompt }}</p>
          <div class="passage mono small">
            {{ r.action.id }}.set({{ display(r.action.value) }}) — then the template reads
            {{ r.reads.length ? r.reads.join('(), ') + '()' : 'nothing' }}.
          </div>
          <p class="small muted">
            Click every <strong>computed</strong> you expect to recompute and every
            <strong>effect</strong> you expect to run. Signals themselves never "recompute". Then
            run the simulation.
          </p>
        </div>
      </div>

      <svg
        class="graph"
        [attr.viewBox]="'0 0 640 ' + height()"
        role="img"
        aria-label="Dependency graph"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
        @for (edge of edges(); track edge.from + edge.to) {
          <line
            [attr.x1]="edge.x1"
            [attr.y1]="edge.y1"
            [attr.x2]="edge.x2"
            [attr.y2]="edge.y2"
            class="edge"
            [class.untracked]="edge.untracked"
            marker-end="url(#arrow)"
          />
        }
        @for (node of r.nodes; track node.id) {
          @let status = statusOf(node.id);
          <g
            class="node"
            [class.clickable]="phase() === 'answer' && node.kind !== 'signal'"
            [class.selected]="phase() === 'answer' && predicted().includes(node.id)"
            [class.correct]="status === 'correct'"
            [class.wrong]="status === 'wrong'"
            [class.missed]="status === 'missed'"
            [class.acted]="node.id === r.action.id"
            [attr.transform]="'translate(' + (node.x - half.w) + ',' + (node.y - half.h) + ')'"
            (click)="toggle(node)"
            [attr.role]="node.kind !== 'signal' ? 'button' : null"
            [attr.aria-pressed]="node.kind !== 'signal' ? predicted().includes(node.id) : null"
            tabindex="0"
            (keydown.enter)="toggle(node)"
          >
            <rect [attr.width]="nodeW" [attr.height]="nodeH" rx="10" />
            <text x="12" y="19" class="kind">{{ icon(node.kind) }} {{ node.kind }}</text>
            <text x="12" y="37" class="name">
              {{ node.id }}{{ node.kind === 'effect' ? '' : ' = ' + display(currentValue(node.id)) }}
            </text>
          </g>
        }
      </svg>

      @if (phase() === 'answer') {
        <div class="actions">
          <span class="small muted" style="margin-right: auto"
            >{{ predicted().length }} node{{ predicted().length === 1 ? '' : 's' }} predicted</span
          >
          <button type="button" class="btn btn-ghost" (click)="predicted.set([])">Clear</button>
          <button type="button" class="btn btn-primary" (click)="run()">
            Run {{ r.action.id }}.set({{ display(r.action.value) }})
          </button>
        </div>
      } @else {
        @let sim = result()!;
        <div
          class="feedback"
          [class.good]="roundScore() >= 90"
          [class.info]="roundScore() >= 60 && roundScore() < 90"
          [class.bad]="roundScore() < 60"
        >
          <div class="feedback-title">
            F1 {{ roundScore() }}% — actually recomputed:
            {{ sim.recomputed.length ? sim.recomputed.join(', ') : 'nothing' }} · effects run:
            {{ sim.effectsRun.length ? sim.effectsRun.join(', ') : 'none' }}
          </div>
          <p>{{ r.explanation }}</p>
        </div>
        <div class="table-wrap">
          <table class="data mono small">
            <thead>
              <tr>
                <th>node</th>
                <th>kind</th>
                <th>before</th>
                <th>after</th>
                <th>computations</th>
              </tr>
            </thead>
            <tbody>
              @for (node of r.nodes; track node.id) {
                <tr>
                  <td>{{ node.id }}</td>
                  <td>{{ node.kind }}</td>
                  <td>{{ node.kind === 'effect' ? '—' : display(sim.before[node.id]) }}</td>
                  <td [class.changed]="sim.before[node.id] !== sim.after[node.id]">
                    {{
                      node.kind === 'effect'
                        ? sim.effectsRun.includes(node.id)
                          ? 'ran'
                          : 'skipped'
                        : display(sim.after[node.id])
                    }}
                  </td>
                  <td>{{ node.kind === 'signal' ? '—' : (sim.computations[node.id] ?? 0) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="next()">
            {{ isLast() ? 'See results' : 'Next scenario' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .graph {
      width: 100%;
      max-height: 360px;
      background: #0b1222;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-family: var(--mono);
    }
    .edge {
      stroke: var(--border-strong);
      stroke-width: 2;
    }
    .edge.untracked {
      stroke-dasharray: 6 5;
      opacity: 0.6;
    }
    .node rect {
      fill: var(--surface-2);
      stroke: var(--border-strong);
      stroke-width: 2;
    }
    .node.clickable {
      cursor: pointer;
    }
    .node.clickable:hover rect {
      stroke: var(--accent);
    }
    .node.selected rect {
      fill: color-mix(in srgb, var(--accent) 24%, var(--surface-2));
      stroke: var(--accent);
    }
    .node.correct rect {
      fill: color-mix(in srgb, var(--success) 24%, var(--surface-2));
      stroke: var(--success);
    }
    .node.wrong rect {
      fill: color-mix(in srgb, var(--danger) 24%, var(--surface-2));
      stroke: var(--danger);
    }
    .node.missed rect {
      stroke: var(--warning);
      stroke-dasharray: 6 4;
    }
    .node.acted rect {
      stroke: var(--accent-2);
    }
    .kind {
      font-size: 11px;
      fill: var(--text-muted);
    }
    .name {
      font-size: 13px;
      font-weight: 700;
      fill: var(--text);
    }
    .changed {
      color: var(--accent);
      font-weight: 800;
    }
  `,
})
export class SignalLabEngine extends RoundEngine {
  readonly challenge = input.required<SignalLabChallenge>();
  override readonly total = computed(() => this.challenge().rounds.length);
  readonly round = computed(() => this.challenge().rounds[this.index()]);
  readonly predicted = signal<string[]>([]);
  readonly result = signal<SimulationRun | null>(null);
  readonly nodeW = NODE_W;
  readonly nodeH = NODE_H;
  readonly half = { w: NODE_W / 2, h: NODE_H / 2 };

  readonly height = computed(() => Math.max(...this.round().nodes.map((node) => node.y)) + NODE_H);
  readonly initial = computed(() => simulate({ nodes: this.round().nodes }, null, []).before);
  readonly edges = computed(() => {
    const byId = new Map(this.round().nodes.map((node) => [node.id, node]));
    const edges: {
      from: string;
      to: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      untracked: boolean;
    }[] = [];
    for (const node of this.round().nodes) {
      if (node.kind === 'signal') continue;
      const deps = [
        ...node.deps.map((dep) => ({ dep, untracked: false })),
        ...(node.kind === 'effect'
          ? (node.untrackedDeps ?? []).map((dep) => ({ dep, untracked: true }))
          : []),
      ];
      for (const { dep, untracked } of deps) {
        const from = byId.get(dep);
        if (!from) continue;
        edges.push({ from: dep, to: node.id, ...anchor(from, node), untracked });
      }
    }
    return edges;
  });

  icon(kind: string): string {
    return KIND_ICON[kind] ?? '';
  }

  display(value: unknown): string {
    return typeof value === 'string' ? `'${value}'` : String(value);
  }

  currentValue(id: string): unknown {
    const run = this.result();
    return run ? run.after[id] : this.initial()[id];
  }

  toggle(node: SignalLabNode): void {
    if (this.phase() !== 'answer' || node.kind === 'signal') {
      return;
    }
    this.predicted.update((ids) =>
      ids.includes(node.id) ? ids.filter((id) => id !== node.id) : [...ids, node.id],
    );
  }

  statusOf(id: string): NodeStatus {
    const run = this.result();
    if (this.phase() !== 'feedback' || !run) return 'none';
    const touched = run.touched.includes(id);
    const picked = this.predicted().includes(id);
    if (picked && touched) return 'correct';
    if (picked) return 'wrong';
    if (touched) return 'missed';
    return 'none';
  }

  run(): void {
    const r = this.round();
    const sim = simulate({ nodes: r.nodes }, { set: r.action }, r.reads);
    this.result.set(sim);
    this.reveal(Math.round(setF1(this.predicted(), sim.touched).f1 * 100));
  }

  protected override onRoundStart(): void {
    this.predicted.set([]);
    this.result.set(null);
  }

  protected override feats(): string[] {
    return this.scores().some((score) => score === 100) ? ['signal-seer'] : [];
  }

  protected override summary(): string {
    return `Average F1 of ${Math.round(this.averageScore())}% over ${this.total()} scenarios`;
  }
}

/** Edge end points: from the right side of the producer to the left side of the consumer. */
function anchor(from: { x: number; y: number }, to: { x: number; y: number }) {
  const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  if (horizontal) {
    const dir = to.x >= from.x ? 1 : -1;
    return { x1: from.x + dir * (NODE_W / 2), y1: from.y, x2: to.x - dir * (NODE_W / 2), y2: to.y };
  }
  const dir = to.y >= from.y ? 1 : -1;
  return { x1: from.x, y1: from.y + dir * (NODE_H / 2), x2: to.x, y2: to.y - dir * (NODE_H / 2) };
}
