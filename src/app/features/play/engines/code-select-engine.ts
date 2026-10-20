import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { PrfMetrics, setF1 } from '../../../core/domain/scoring';
import { CodeSelectChallenge } from '../../../core/models';
import { RoundEngine } from './round-engine';

type LineStatus = 'correct' | 'wrong' | 'missed' | 'none';

@Component({
  selector: 'app-code-select-engine',
  imports: [DecimalPipe, PercentPipe],
  template: `
    <div class="stack">
      <div class="engine-header">
        <span class="pill">File {{ index() + 1 }} / {{ total() }}</span>
        <span class="progress"><span [style.width.%]="progressPct()"></span></span>
        @if (scores().length) {
          <span class="small muted">Average F1: {{ averageScore() | number: '1.0-0' }}%</span>
        }
      </div>

      @let r = round();
      @let multi = challenge().labels.length > 1;
      <p class="prompt">{{ r.prompt }}</p>

      @if (multi) {
        <div class="row">
          <span class="small muted">Active label:</span>
          @for (label of challenge().labels; track label.id) {
            <button
              type="button"
              class="chip"
              [class.selected]="activeLabel() === label.id"
              [disabled]="phase() === 'feedback'"
              (click)="activeLabel.set(label.id)"
            >
              <span class="chip-label">{{ label.id }}</span> {{ label.name }}
            </button>
          }
        </div>
      }

      <div class="code-lines" role="group" aria-label="Code lines">
        @for (line of r.lines; track $index) {
          @let status = statusOf($index);
          @let mine = selection()[$index];
          <button
            type="button"
            class="code-line"
            [attr.aria-pressed]="!!mine"
            [class.selected]="phase() === 'answer' && !!mine"
            [class.correct]="status === 'correct'"
            [class.wrong]="status === 'wrong'"
            [class.missed]="status === 'missed'"
            [disabled]="phase() === 'feedback'"
            (click)="toggle($index)"
          >
            <span class="ln">{{ $index + 1 }}</span>
            <span [textContent]="line || ' '"></span>
            @if (mine && multi) {
              <span class="chip-label">{{ mine }}</span>
            }
          </button>
          @if (
            phase() === 'feedback' &&
            (status === 'correct' || status === 'missed' || status === 'wrong')
          ) {
            <div
              class="line-note small"
              [class.ok]="status === 'correct'"
              [class.ko]="status !== 'correct'"
            >
              @if (status === 'wrong') {
                Nothing wrong on this line.
              } @else {
                {{ r.notes[$index] }}
              }
            </div>
          }
        }
      </div>

      @if (phase() === 'answer') {
        <div class="actions">
          <button type="button" class="btn btn-ghost" (click)="selection.set({})">Clear</button>
          <button type="button" class="btn btn-primary" (click)="check()">Check</button>
        </div>
      } @else {
        <div
          class="feedback"
          [class.good]="roundScore() >= 90"
          [class.info]="roundScore() >= 60 && roundScore() < 90"
          [class.bad]="roundScore() < 60"
        >
          <div class="feedback-title">
            F1 score {{ roundScore() }}% — precision {{ metrics()?.precision ?? 0 | percent }} ·
            recall {{ metrics()?.recall ?? 0 | percent }}
          </div>
          <p>{{ r.explanation }}</p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="next()">
            {{ isLast() ? 'See results' : 'Next file' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .line-note {
      margin: 0 12px 6px 12px;
      padding: 6px 10px;
      border-radius: 8px;
      font-family: var(--font);
      white-space: normal;
    }
    .line-note.ok {
      background: color-mix(in srgb, var(--success) 14%, transparent);
    }
    .line-note.ko {
      background: color-mix(in srgb, var(--warning) 14%, transparent);
    }
  `,
})
export class CodeSelectEngine extends RoundEngine {
  readonly challenge = input.required<CodeSelectChallenge>();
  override readonly total = computed(() => this.challenge().rounds.length);
  readonly round = computed(() => this.challenge().rounds[this.index()]);
  readonly activeLabel = signal<string>('');
  readonly selection = signal<Record<number, string>>({});
  readonly metrics = signal<PrfMetrics | null>(null);

  toggle(index: number): void {
    const label = this.activeLabel() || this.challenge().labels[0].id;
    this.selection.update((current) => {
      const next = { ...current };
      if (next[index] === label) {
        delete next[index];
      } else {
        next[index] = label;
      }
      return next;
    });
  }

  check(): void {
    const predicted = Object.entries(this.selection()).map(([i, label]) => `${i}:${label}`);
    const expected = Object.entries(this.round().answers).map(([i, label]) => `${i}:${label}`);
    const metrics = setF1(predicted, expected);
    this.metrics.set(metrics);
    this.reveal(Math.round(metrics.f1 * 100));
  }

  statusOf(index: number): LineStatus {
    if (this.phase() !== 'feedback') {
      return 'none';
    }
    const expected = this.round().answers[index];
    const mine = this.selection()[index];
    if (mine && mine === expected) return 'correct';
    if (mine) return 'wrong';
    if (expected) return 'missed';
    return 'none';
  }

  protected override onRoundStart(): void {
    this.selection.set({});
    this.metrics.set(null);
  }

  protected override feats(): string[] {
    return this.scores().some((score) => score === 100) ? ['all-bugs-found'] : [];
  }

  protected override summary(): string {
    return `Average F1 of ${Math.round(this.averageScore())}% over ${this.total()} files`;
  }
}
