import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { seededShuffle } from '../../../core/domain/ordering';
import { fractionCorrect } from '../../../core/domain/scoring';
import { ClozeChallenge } from '../../../core/models';
import { RoundEngine } from './round-engine';

interface Segment {
  text: string;
  /** 0-based blank index, or null for plain code. */
  blank: number | null;
}

@Component({
  selector: 'app-cloze-engine',
  imports: [DecimalPipe],
  template: `
    <div class="stack">
      <div class="engine-header">
        <span class="pill">Snippet {{ index() + 1 }} / {{ total() }}</span>
        <span class="progress"><span [style.width.%]="progressPct()"></span></span>
        @if (scores().length) {
          <span class="small muted">Average: {{ averageScore() | number: '1.0-0' }}%</span>
        }
      </div>

      @let r = round();
      <p class="prompt">{{ r.prompt }}</p>

      <pre
        class="code cloze"
      >@for (segment of segments(); track $index) {@if (segment.blank === null) {<span [textContent]="segment.text"></span>} @else {<select
              class="blank"
              [class.correct]="phase() === 'feedback' && isRight(segment.blank)"
              [class.wrong]="phase() === 'feedback' && !isRight(segment.blank)"
              [disabled]="phase() === 'feedback'"
              [attr.aria-label]="'Blank ' + (segment.blank + 1)"
              (change)="choose(segment.blank, $any($event.target).value)"
            ><option value="" [selected]="!answers()[segment.blank]">…</option>@for (option of optionsFor(segment.blank); track option) {<option [value]="option" [selected]="answers()[segment.blank] === option">{{ option }}</option>}</select>}}</pre>

      @if (phase() === 'answer') {
        <div class="actions">
          <span class="small muted" style="margin-right: auto"
            >{{ filled() }} / {{ r.blanks.length }} blanks filled</span
          >
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="filled() < r.blanks.length"
            (click)="check()"
          >
            Check
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
            {{ correctCount() }} / {{ r.blanks.length }} blanks right — {{ roundScore() }}%
          </div>
          <p>{{ r.explanation }}</p>
        </div>
        <div class="stack-sm">
          @for (blank of r.blanks; track $index) {
            <div class="card-soft small row" style="gap: 10px">
              <span
                class="pill"
                [class.pill-good]="isRight($index)"
                [class.pill-bad]="!isRight($index)"
              >
                blank {{ $index + 1 }}
              </span>
              <code>{{ blank.answer }}</code>
              @if (!isRight($index)) {
                <span class="muted"
                  >(you chose <code>{{ answers()[$index] || '—' }}</code
                  >)</span
                >
              }
              <span class="muted">{{ blank.why }}</span>
            </div>
          }
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="next()">
            {{ isLast() ? 'See results' : 'Next snippet' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class ClozeEngine extends RoundEngine {
  readonly challenge = input.required<ClozeChallenge>();
  override readonly total = computed(() => this.challenge().rounds.length);
  readonly round = computed(() => this.challenge().rounds[this.index()]);
  readonly answers = signal<Record<number, string>>({});

  readonly segments = computed<Segment[]>(() => {
    const parts = this.round().code.split(/\[\[(\d+)\]\]/);
    return parts.map((part, i) =>
      i % 2 === 0 ? { text: part, blank: null } : { text: '', blank: Number(part) - 1 },
    );
  });
  readonly filled = computed(() => Object.values(this.answers()).filter(Boolean).length);
  readonly correctCount = computed(
    () => this.round().blanks.filter((blank, i) => this.answers()[i] === blank.answer).length,
  );

  optionsFor(blank: number): string[] {
    const options = this.round().blanks[blank]?.options ?? [];
    return seededShuffle(options, blank * 31 + this.index() * 7 + 11);
  }

  choose(blank: number, value: string): void {
    this.answers.update((answers) => ({ ...answers, [blank]: value }));
  }

  isRight(blank: number): boolean {
    return this.answers()[blank] === this.round().blanks[blank]?.answer;
  }

  check(): void {
    this.reveal(fractionCorrect(this.correctCount(), this.round().blanks.length));
  }

  protected override onRoundStart(): void {
    this.answers.set({});
  }

  protected override feats(): string[] {
    return this.scores().some((score) => score === 100) ? ['cloze-perfect'] : [];
  }

  protected override summary(): string {
    return `${Math.round(this.averageScore())}% of blanks filled correctly`;
  }
}
