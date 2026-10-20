import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME } from '../../content/game';
import { MENTOR } from '../../content/mentor';
import { LEVELS } from '../../content/worlds';
import { BADGES } from '../../core/domain/achievements';
import { ProgressService } from '../../core/progress.service';
import { downloadCanvas, drawCertificate } from './certificate';

@Component({
  selector: 'app-badges-page',
  imports: [RouterLink],
  template: `
    <div class="container page stack">
      <header>
        <span class="eyebrow">{{ progress.badges().length }} of {{ badges.length }} earned</span>
        <h1>Badges</h1>
        <p class="muted" style="margin: 0">
          Feats of an Angular developer. Most come from playing well, a few from playing often.
        </p>
      </header>

      <div class="grid grid-3">
        @for (badge of badges; track badge.id) {
          @let earned = progress.hasBadge(badge.id);
          <div
            class="card badge"
            [class.earned]="earned"
            [class.lock]="!earned"
            [title]="badge.description"
          >
            <div class="badge-icon">{{ earned ? badge.icon : '🔒' }}</div>
            <div>
              <strong>{{ badge.title }}</strong>
              <div class="small muted">{{ badge.description }}</div>
            </div>
          </div>
        }
      </div>

      <section class="card stack certificate" [class.ready]="restored()">
        <div>
          <span class="eyebrow">Certificate</span>
          <h2>
            {{ restored() ? game.restoredTitle : 'Turn the build green to earn your certificate' }}
          </h2>
          <p class="muted">
            @if (restored()) {
              {{ mentor.restored }}
            } @else {
              Earn at least one star on every quest of the Workshop —
              {{ progress.completedLevels() }} / {{ levelCount }} cleared so far.
            }
          </p>
        </div>
        @if (restored()) {
          <div class="row" style="gap: 12px; align-items: flex-end">
            <label class="stack-sm" style="gap: 4px; flex: 1; min-width: 220px">
              <span class="small muted">Name on the certificate</span>
              <input
                type="text"
                maxlength="40"
                placeholder="Your name"
                [value]="progress.playerName()"
                (input)="progress.setPlayerName($any($event.target).value)"
              />
            </label>
            <button type="button" class="btn btn-primary" (click)="download()">
              Download the certificate (PNG)
            </button>
          </div>
          @if (preview(); as url) {
            <img [src]="url" alt="Preview of your certificate" class="preview" />
          }
          @if (unsupported()) {
            <p class="small" style="color: var(--warning)">
              This browser cannot draw the certificate.
            </p>
          }
        } @else {
          <div class="progress">
            <span [style.width.%]="(progress.completedLevels() / levelCount) * 100"></span>
          </div>
          <div><a class="btn btn-primary" routerLink="/">Back to the Workshop</a></div>
        }
      </section>
    </div>
  `,
  styles: `
    .badge {
      display: flex;
      gap: 14px;
      align-items: center;
      transition: transform 0.15s ease;
    }
    .badge.earned {
      border-color: color-mix(in srgb, var(--warning) 50%, var(--border));
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--warning) 8%, var(--surface)),
        var(--surface)
      );
    }
    .badge.earned:hover {
      transform: translateY(-2px);
    }
    .badge.lock {
      opacity: 0.6;
    }
    .badge-icon {
      font-size: 2rem;
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: var(--surface-3);
      flex: none;
    }
    .certificate.ready {
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
    }
    .preview {
      width: 100%;
      max-width: 720px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
  `,
})
export class BadgesPage {
  protected readonly progress = inject(ProgressService);
  protected readonly badges = BADGES;
  protected readonly game = GAME;
  protected readonly mentor = MENTOR;
  protected readonly levelCount = LEVELS.length;
  protected readonly unsupported = signal(false);

  readonly restored = computed(() => this.progress.hasBadge(GAME.restoredBadge));
  readonly preview = computed(() => {
    if (!this.restored()) return null;
    const canvas = drawCertificate(this.data());
    return canvas ? canvas.toDataURL('image/png') : null;
  });

  download(): void {
    const canvas = drawCertificate(this.data());
    if (!canvas) {
      this.unsupported.set(true);
      return;
    }
    downloadCanvas(canvas, 'angular-quest-certificate.png');
  }

  private data() {
    return {
      name: this.progress.playerName(),
      quests: this.progress.completedLevels(),
      totalQuests: LEVELS.length,
      stars: this.progress.totalStars(),
      totalStars: LEVELS.length * 3,
      xp: this.progress.totalXp(),
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }
}
