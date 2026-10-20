import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ClaimCheckChallenge } from '../../../core/models';
import { RoundEngine } from './round-engine';

@Component({
  selector: 'app-claim-check-engine',
  imports: [DecimalPipe],
  template: `
    <div class="stack">
      <div class="engine-header">
        <span class="pill">Review {{ index() + 1 }} / {{ total() }}</span>
        <span class="progress"><span [style.width.%]="progressPct()"></span></span>
        @if (scores().length) {
          <span class="small muted">Average: {{ averageScore() | number: '1.0-0' }}%</span>
        }
      </div>

      @let r = round();
      @if (r.code) {
        <pre class="code" [textContent]="r.code"></pre>
      }
      <div class="grid grid-2">
        <div class="passage">
          <span class="eyebrow">{{ challenge().contextLabel }}</span>
          <p>{{ r.context }}</p>
        </div>
        <div class="passage answer">
          <span class="eyebrow">{{ challenge().answerLabel }}</span>
          <p>{{ r.answer }}</p>
        </div>
      </div>

      <p class="prompt">Tick every claim that is <em>wrong</em>.</p>
      <div class="stack-sm">
        @for (claim of r.claims; track $index) {
          @let flagged = flags().includes($index);
          @if (phase() === 'answer') {
            <label class="checkbox">
              <input type="checkbox" [checked]="flagged" (change)="toggle($index)" />
              <span>{{ claim.text }}</span>
            </label>
          } @else {
            @let right = flagged === !claim.supported;
            <div class="feedback" [class.good]="right" [class.bad]="!right">
              <div class="row row-between" style="gap: 8px">
                <strong>{{ claim.text }}</strong>
                <span
                  class="pill"
                  [class.pill-good]="claim.supported"
                  [class.pill-bad]="!claim.supported"
                >
                  {{ claim.supported ? 'True' : 'Wrong' }}
                </span>
              </div>
              <p class="small" style="margin-top: 6px">
                @if (!right) {
                  <strong>{{
                    flagged ? 'You flagged a true statement.' : 'You missed this one.'
                  }}</strong>
                }
                {{ claim.why }}
              </p>
            </div>
          }
        }
      </div>

      @if (phase() === 'answer') {
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="check()">Submit review</button>
        </div>
      } @else {
        <div class="feedback info">
          <div class="feedback-title">
            {{ correctCount() }} / {{ r.claims.length }} claims judged correctly —
            {{ roundScore() }}%
          </div>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="next()">
            {{ isLast() ? 'See results' : 'Next review' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class ClaimCheckEngine extends RoundEngine {
  readonly challenge = input.required<ClaimCheckChallenge>();
  override readonly total = computed(() => this.challenge().rounds.length);
  readonly round = computed(() => this.challenge().rounds[this.index()]);
  readonly flags = signal<number[]>([]);
  readonly correctCount = computed(
    () =>
      this.round().claims.filter((claim, i) => this.flags().includes(i) === !claim.supported)
        .length,
  );

  toggle(index: number): void {
    this.flags.update((flags) =>
      flags.includes(index) ? flags.filter((i) => i !== index) : [...flags, index],
    );
  }

  check(): void {
    this.reveal(Math.round((this.correctCount() / this.round().claims.length) * 100));
  }

  protected override onRoundStart(): void {
    this.flags.set([]);
  }

  protected override feats(): string[] {
    const scores = this.scores();
    return scores.length === this.total() && scores.every((score) => score === 100)
      ? ['all-claims-right']
      : [];
  }

  protected override summary(): string {
    return `${Math.round(this.averageScore())}% of claims judged correctly`;
  }
}
