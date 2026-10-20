import { BADGES, PlayerSnapshot, unlockedBadgeIds } from './achievements';
import { QuestRef } from './progression';

const quests: QuestRef[] = [
  { id: 'c1', world: 'components' },
  { id: 'c2', world: 'components' },
  { id: 's1', world: 'signals' },
  { id: 'a1', world: 'architecture' },
];

function snapshot(partial: Partial<PlayerSnapshot> = {}): PlayerSnapshot {
  return { results: {}, streakDays: 0, glossaryOpened: false, ...partial };
}

const done = (stars: number, feats: string[] = []) => ({ stars, feats });

describe('badge catalogue', () => {
  it('has unique ids with a title, a description and an icon', () => {
    const ids = BADGES.map((badge) => badge.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(12);
    for (const badge of BADGES) {
      expect(badge.title.length).toBeGreaterThan(2);
      expect(badge.description.length).toBeGreaterThan(10);
      expect(badge.icon.length).toBeGreaterThan(0);
    }
  });
});

describe('unlockedBadgeIds', () => {
  it('unlocks nothing for a fresh player and first-steps after the first star', () => {
    expect(unlockedBadgeIds(snapshot(), quests)).toEqual([]);
    expect(unlockedBadgeIds(snapshot({ results: { c1: done(1) } }), quests)).toContain(
      'first-steps',
    );
  });

  it('feat badges follow the feats recorded on any quest', () => {
    const ids = unlockedBadgeIds(
      snapshot({
        results: {
          c1: done(3, ['all-bugs-found', 'flawless']),
          s1: done(2, ['cloze-perfect', 'comeback', 'signal-seer']),
          a1: done(1, ['all-claims-right']),
        },
      }),
      quests,
    );
    expect(ids).toEqual(
      expect.arrayContaining([
        'bug-hunter',
        'flawless',
        'autocomplete',
        'comeback',
        'signal-seer',
        'code-reviewer',
      ]),
    );
  });

  it('wing keepers need three stars on every quest of the wing', () => {
    expect(
      unlockedBadgeIds(snapshot({ results: { c1: done(3), c2: done(2) } }), quests),
    ).not.toContain('wing-keeper-components');
    expect(unlockedBadgeIds(snapshot({ results: { c1: done(3), c2: done(3) } }), quests)).toContain(
      'wing-keeper-components',
    );
  });

  it('green-build needs a star everywhere, grandmaster three stars everywhere', () => {
    const everything = { c1: done(1), c2: done(1), s1: done(1), a1: done(1) };
    const ids = unlockedBadgeIds(snapshot({ results: everything }), quests);
    expect(ids).toContain('green-build');
    expect(ids).not.toContain('grandmaster');
    const perfect = { c1: done(3), c2: done(3), s1: done(3), a1: done(3) };
    expect(unlockedBadgeIds(snapshot({ results: perfect }), quests)).toContain('grandmaster');
  });

  it('streak and docs-reader badges come from the player state, in catalogue order', () => {
    expect(unlockedBadgeIds(snapshot({ streakDays: 3 }), quests)).toContain('streak-3');
    expect(unlockedBadgeIds(snapshot({ streakDays: 2 }), quests)).not.toContain('streak-3');
    const ids = unlockedBadgeIds(
      snapshot({ glossaryOpened: true, results: { c1: done(3, ['flawless']) } }),
      quests,
    );
    expect(ids).toContain('docs-reader');
    const order = BADGES.map((badge) => badge.id);
    expect(ids).toEqual([...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  });
});
