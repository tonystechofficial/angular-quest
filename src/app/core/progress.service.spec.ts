import { TestBed } from '@angular/core/testing';
import { GAME } from '../content/game';
import { LEVELS, levelsForWorld } from '../content/worlds';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('records a result with xp, bonuses, feats, badges and unlocks', () => {
    const service = TestBed.inject(ProgressService);
    const outcome = service.record(
      LEVELS[0],
      { scorePct: 95, summary: 'x', flawless: true, feats: ['cloze-perfect'] },
      false,
    );
    expect(outcome.stars).toBe(3);
    expect(outcome.bonus).toEqual({ firstTry: 10, flawless: 20, total: 30 });
    expect(outcome.xpGained).toBe(130);
    expect(outcome.newBadges.map((badge) => badge.id)).toEqual(
      expect.arrayContaining(['first-steps', 'autocomplete', 'flawless']),
    );
    expect(outcome.unlockedQuests.map((quest) => quest.id)).toEqual([LEVELS[1].id]);
    expect(service.totalXp()).toBe(130);
    expect(service.streak()).toBe(1);
    expect(service.toasts().length).toBeGreaterThan(0);
  });

  it('keeps the best score, counts attempts and awards the comeback feat', () => {
    const service = TestBed.inject(ProgressService);
    service.record(LEVELS[0], { scorePct: 40, summary: 'x' }, false);
    const second = service.record(LEVELS[0], { scorePct: 85, summary: 'x' }, false);
    expect(second.improved).toBe(true);
    expect(second.previousBest).toBe(40);
    expect(service.resultFor(LEVELS[0].id)).toMatchObject({ bestScore: 85, stars: 2, attempts: 2 });
    expect(service.resultFor(LEVELS[0].id)?.feats).toContain('comeback');
  });

  it('a hint cancels the flawless bonus', () => {
    const service = TestBed.inject(ProgressService);
    const outcome = service.record(LEVELS[0], { scorePct: 95, summary: 'x', flawless: true }, true);
    expect(outcome.bonus.flawless).toBe(0);
    expect(service.resultFor(LEVELS[0].id)?.feats).not.toContain('flawless');
  });

  it('opens the next wing when the review of the current wing is passed', () => {
    const service = TestBed.inject(ProgressService);
    const wing = levelsForWorld('components');
    expect(service.isWingOpen('signals')).toBe(false);
    for (const level of wing.slice(0, -1))
      service.record(level, { scorePct: 60, summary: 'x' }, false);
    expect(service.isWingOpen('signals')).toBe(false);
    const outcome = service.record(wing.at(-1)!, { scorePct: 60, summary: 'x' }, false);
    expect(outcome.unlockedWings.map((world) => world.id)).toEqual(['signals']);
    expect(service.nextQuest()?.id).toBe(levelsForWorld('signals')[0].id);
  });

  it('free play unlocks everything and persists under the game storage key', () => {
    const service = TestBed.inject(ProgressService);
    expect(service.isUnlocked('release-night')).toBe(false);
    service.setFreePlay(true);
    expect(service.isUnlocked('release-night')).toBe(true);
    const stored = JSON.parse(localStorage.getItem(GAME.storageKey) ?? '{}');
    expect(stored.freePlay).toBe(true);
  });

  it('reset wipes everything', () => {
    const service = TestBed.inject(ProgressService);
    service.record(LEVELS[0], { scorePct: 95, summary: 'x' }, false);
    service.reset();
    expect(service.totalXp()).toBe(0);
    expect(service.badges()).toEqual([]);
  });
});
