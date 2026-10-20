import {
  bossOf,
  isBossQuest,
  isQuestUnlocked,
  isWingUnlocked,
  nextQuest,
  QuestRef,
  unlockedQuestIds,
  unlockedWings,
  wingStars,
} from './progression';

const quests: QuestRef[] = [
  { id: 'c1', world: 'components' },
  { id: 'c2', world: 'components' },
  { id: 'c3', world: 'components' },
  { id: 's1', world: 'signals' },
  { id: 's2', world: 'signals' },
  { id: 'a1', world: 'architecture' },
];

const stars = (map: Record<string, number>) =>
  Object.fromEntries(Object.entries(map).map(([id, value]) => [id, { stars: value }]));

describe('wingStars and bosses', () => {
  it('sums the stars of the quests of a wing and names the last quest boss', () => {
    expect(wingStars('components', quests, stars({ c1: 3, c2: 1, s1: 2 }))).toBe(4);
    expect(bossOf('components', quests)?.id).toBe('c3');
    expect(isBossQuest('c3', quests)).toBe(true);
    expect(isBossQuest('c1', quests)).toBe(false);
  });
});

describe('isWingUnlocked', () => {
  it('opens wings in order once the previous boss has a star, or all of them in free play', () => {
    expect(isWingUnlocked('components', quests, {}, false)).toBe(true);
    expect(isWingUnlocked('signals', quests, stars({ c1: 3, c2: 3 }), false)).toBe(false);
    expect(isWingUnlocked('signals', quests, stars({ c3: 1 }), false)).toBe(true);
    expect(isWingUnlocked('architecture', quests, stars({ c3: 1 }), false)).toBe(false);
    expect(isWingUnlocked('architecture', quests, stars({ c3: 1, s2: 2 }), false)).toBe(true);
    expect(isWingUnlocked('architecture', quests, {}, true)).toBe(true);
  });
});

describe('isQuestUnlocked', () => {
  it('unlocks quests one after another inside an open wing', () => {
    expect(isQuestUnlocked('c1', quests, {}, false)).toBe(true);
    expect(isQuestUnlocked('c2', quests, {}, false)).toBe(false);
    expect(isQuestUnlocked('c2', quests, stars({ c1: 1 }), false)).toBe(true);
    expect(isQuestUnlocked('s1', quests, stars({ c1: 3, c2: 3 }), false)).toBe(false);
    expect(isQuestUnlocked('s1', quests, stars({ c3: 1 }), false)).toBe(true);
    expect(isQuestUnlocked('nope', quests, {}, true)).toBe(false);
    expect(isQuestUnlocked('a1', quests, {}, true)).toBe(true);
  });
});

describe('unlockedQuestIds, unlockedWings and nextQuest', () => {
  it('lists what is reachable and what to play next', () => {
    expect(unlockedQuestIds(quests, stars({ c1: 2, c2: 1 }), false)).toEqual(['c1', 'c2', 'c3']);
    expect(unlockedWings(quests, stars({ c3: 1 }), false)).toEqual(['components', 'signals']);
    expect(nextQuest(quests, {}, false)?.id).toBe('c1');
    expect(nextQuest(quests, stars({ c1: 3 }), false)?.id).toBe('c2');
    expect(nextQuest(quests, stars({ c1: 3, c2: 3, c3: 3 }), false)?.id).toBe('s1');
    expect(nextQuest(quests, stars({ c1: 2, c2: 1, c3: 3, s1: 1, s2: 2, a1: 3 }), false)?.id).toBe(
      'c2',
    );
    expect(
      nextQuest(quests, stars({ c1: 3, c2: 3, c3: 3, s1: 3, s2: 3, a1: 3 }), false),
    ).toBeUndefined();
  });
});
