import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { GAME } from '../content/game';
import { findLevel, LEVELS, levelsForWorld, WORLDS } from '../content/worlds';
import { ProgressService } from '../core/progress.service';
import { BadgesPage } from './badges/badges-page';
import { GlossaryPage } from './glossary/glossary-page';
import { HomePage } from './home/home-page';
import { PlayPage } from './play/play-page';
import { WorldPage } from './world/world-page';

function clear(progress: ProgressService, levelId: string, score = 95): void {
  progress.record(findLevel(levelId)!, { scorePct: score, summary: 'test' }, false);
}

describe('pages', () => {
  let progress: ProgressService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    progress = TestBed.inject(ProgressService);
    progress.reset();
  });

  it('home shows the three wings, the mentor and invites to start the first quest', async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.world-card')).toHaveLength(WORLDS.length);
    expect(el.querySelectorAll('.world-card.lock')).toHaveLength(WORLDS.length - 1);
    expect(el.textContent).toContain('Start playing');
    expect(el.textContent).toContain(LEVELS[0].title);
    expect(el.textContent).toContain('Nia');
    expect(el.textContent).toContain(GAME.world);
  });

  it('home offers to continue with the next reachable quest', async () => {
    clear(progress, LEVELS[0].id);
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Continue');
    expect(el.textContent).toContain(LEVELS[1].title);
    expect(el.textContent).toContain('110 /');
  });

  it('wing page shows the path with locks, the review and played quests', async () => {
    const fixture = TestBed.createComponent(WorldPage);
    fixture.componentRef.setInput('worldId', 'components');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const wing = levelsForWorld('components');
    expect(el.querySelectorAll('.level')).toHaveLength(wing.length);
    expect(el.querySelectorAll('.level.lock')).toHaveLength(wing.length - 1);
    expect(el.querySelectorAll('.level.boss')).toHaveLength(1);
    clear(progress, wing[0].id, 70);
    await fixture.whenStable();
    expect(el.querySelectorAll('.level.lock')).toHaveLength(wing.length - 2);
    expect(el.textContent).toContain('best 70%');
  });

  it('a locked wing explains which review to pass', async () => {
    const fixture = TestBed.createComponent(WorldPage);
    fixture.componentRef.setInput('worldId', 'signals');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const boss = levelsForWorld('components').at(-1)!;
    expect(el.textContent).toContain(`Pass ${boss.title}`);
    expect(el.querySelectorAll('.level.lock')).toHaveLength(levelsForWorld('signals').length);
  });

  it('play page blocks a locked quest and points to the previous one', async () => {
    const fixture = TestBed.createComponent(PlayPage);
    fixture.componentRef.setInput('levelId', LEVELS[1].id);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('One file at a time');
    expect(el.textContent).toContain(`Go to ${LEVELS[0].title}`);
  });

  it('play page mounts the signal lab, offers a hint and records the result with bonuses', async () => {
    progress.setFreePlay(true);
    const fixture = TestBed.createComponent(PlayPage);
    fixture.componentRef.setInput('levelId', 'signal-lab');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-signal-lab-engine')).not.toBeNull();
    expect(el.textContent).toContain('Ask Nia');
    fixture.componentInstance.askMentor();
    await fixture.whenStable();
    expect(el.textContent).toContain(findLevel('signal-lab')!.hint);

    fixture.componentInstance.onCompleted({ scorePct: 92, summary: 'test run', flawless: true });
    await fixture.whenStable();
    expect(el.querySelector('app-result-panel')).not.toBeNull();
    expect(el.textContent).toContain('+110 XP');
    expect(el.textContent).toContain('flawless, but hinted');
    expect(progress.resultFor('signal-lab')?.stars).toBe(3);
  });

  it('passing a wing review opens the next wing on the result screen', async () => {
    const wing = levelsForWorld('components');
    for (const level of wing.slice(0, -1)) clear(progress, level.id);
    const fixture = TestBed.createComponent(PlayPage);
    fixture.componentRef.setInput('levelId', wing.at(-1)!.id);
    await fixture.whenStable();
    fixture.componentInstance.onCompleted({ scorePct: 75, summary: 'review' });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Wing opened');
    expect(el.textContent).toContain('The Signal Observatory');
    expect(progress.isWingOpen('signals')).toBe(true);
  });

  it('play page explains an unknown quest', async () => {
    const fixture = TestBed.createComponent(PlayPage);
    fixture.componentRef.setInput('levelId', 'does-not-exist');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Unknown quest');
  });

  it('badges page locks the certificate until the build is green', async () => {
    const fixture = TestBed.createComponent(BadgesPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.badge').length).toBeGreaterThan(10);
    expect(el.textContent).toContain('Turn the build green');
    progress.setFreePlay(true);
    for (const level of LEVELS) clear(progress, level.id, 60);
    await fixture.whenStable();
    expect(progress.hasBadge('green-build')).toBe(true);
    expect(el.textContent).toContain(GAME.restoredTitle);
  });

  it('glossary filters entries and earns the Docs Reader badge', async () => {
    const fixture = TestBed.createComponent(GlossaryPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(progress.hasBadge('docs-reader')).toBe(true);
    const before = el.querySelectorAll('.card-soft').length;
    fixture.componentInstance.query.set('zoneless');
    await fixture.whenStable();
    const after = el.querySelectorAll('.card-soft').length;
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });
});
