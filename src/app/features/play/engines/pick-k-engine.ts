import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { pickScore } from '../../../core/domain/scoring';
import { PickItem, PickKChallenge } from '../../../core/models';
import { RoundEngine } from './round-engine';

const RELEVANCE_LABELS = ['Wrong', 'Marginal', 'Useful', 'Essential'];

@Component({
  selector: 'app-pick-k-engine',
  imports: [DecimalPipe],
  template: `
    <div class="stack">
      <div class="engine-header">
        <span class="pill">Round {{ index() + 1 }} / {{ total() }}</span>
        <span class="progress"><span [style.width.%]="progressPct()"></span></span>
        @if (scores().length) {
          <span class="small muted">Average: {{ averageScore() | number: '1.0-0' }}%</span>
        }
      </div>

      @let r = round();
      @if (r.code) {
        <pre class="code" [textContent]="r.code"></pre>
      }
      <p class="prompt">{{ r.query }}</p>
      <p class="small muted">
        Pick exactly <strong>{{ r.k }}</strong> · {{ picked().length }} / {{ r.k }} selected
      </p>

      <div class="stack-sm">
        @for (item of r.items; track item.id) {
          @let isPicked = picked().includes(item.id);
          @if (phase() === 'answer') {
            <button
              type="button"
              class="option"
              [class.selected]="isPicked"
              [attr.aria-pressed]="isPicked"
              [disabled]="!isPicked && picked().length >= r.k"
              (click)="toggle(item)"
            >
              <span class="key">{{ item.id.toUpperCase() }}</span>
              <span class="mono" style="flex: 1; white-space: pre-wrap">{{ item.text }}</span>
            </button>
          } @else {
            <div
              class="option result"
              [class.correct]="isPicked && item.relevance >= 2"
              [class.wrong]="isPicked && item.relevance < 2"
              [class.selected]="!isPicked && bestIds().includes(item.id)"
            >
              <span class="key">{{ item.id.toUpperCase() }}</span>
              <div style="flex: 1" class="stack-sm">
                <span class="mono" style="white-space: pre-wrap">{{ item.text }}</span>
                <div class="row small" style="gap: 8px">
                  <span
                    class="pill"
                    [class.pill-good]="item.relevance === 3"
                    [class.pill-warn]="item.relevance === 2"
                    [class.pill-bad]="item.relevance === 0"
                  >
                    {{ relevanceLabel(item.relevance) }}
                  </span>
                  @if (isPicked) {
                    <span class="pill">your pick</span>
                  }
                  @if (bestIds().includes(item.id)) {
                    <span class="pill pill-good">in the best set</span>
                  }
                </div>
                <span class="small muted">{{ item.note }}</span>
              </div>
            </div>
          }
        }
      </div>

      @if (phase() === 'answer') {
        <div class="actions">
          <button type="button" class="btn btn-ghost" (click)="picked.set([])">Clear</button>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="picked().length !== r.k"
            (click)="check()"
          >
            Check selection
          </button>
        </div>
      } @else {
        <div
          class="feedback"
          [class.good]="roundScore() >= 90"
          [class.info]="roundScore() >= 60 && roundScore() < 90"
          [class.bad]="roundScore() < 60"
        >
          <div class="feedback-title">
            {{ roundScore() }}% of the best achievable · best set: {{ bestLabel() }}
          </div>
          <p>{{ r.explanation }}</p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="next()">
            {{ isLast() ? 'See results' : 'Next round' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .option.result {
      cursor: default;
    }
  `,
})
export class PickKEngine extends RoundEngine {
  readonly challenge = input.required<PickKChallenge>();
  override readonly total = computed(() => this.challenge().rounds.length);
  readonly round = computed(() => this.challenge().rounds[this.index()]);
  readonly picked = signal<string[]>([]);

  readonly bestIds = computed(() =>
    [...this.round().items]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, this.round().k)
      .map((item) => item.id),
  );
  readonly bestLabel = computed(() =>
    [...this.bestIds()]
      .sort()
      .map((id) => id.toUpperCase())
      .join(' + '),
  );

  toggle(item: PickItem): void {
    this.picked.update((picked) =>
      picked.includes(item.id) ? picked.filter((id) => id !== item.id) : [...picked, item.id],
    );
  }

  relevanceLabel(relevance: number): string {
    return RELEVANCE_LABELS[relevance] ?? '';
  }

  check(): void {
    this.reveal(Math.round(pickScore(this.picked(), this.round().items, this.round().k)));
  }

  protected override onRoundStart(): void {
    this.picked.set([]);
  }

  protected override summary(): string {
    return `Average of ${Math.round(this.averageScore())}% of the best achievable selection`;
  }
}
