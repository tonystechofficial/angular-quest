import {
  bonusXp,
  fractionCorrect,
  pickScore,
  playerRank,
  precisionRecallF1,
  setF1,
  starsForScore,
  xpForResult,
} from './scoring';

describe('starsForScore', () => {
  it.each([
    [100, 3],
    [90, 3],
    [89, 2],
    [60, 2],
    [59, 1],
    [30, 1],
    [29, 0],
  ])('%i%% gives %i stars', (pct, stars) => {
    expect(starsForScore(pct)).toBe(stars);
  });
});

describe('xpForResult', () => {
  it('awards xp proportional to the stars', () => {
    expect(xpForResult(100, 95)).toBe(100);
    expect(xpForResult(100, 60)).toBe(67);
    expect(xpForResult(100, 10)).toBe(0);
  });
});

describe('playerRank', () => {
  it('starts as an Intern and climbs', () => {
    expect(playerRank(0).title).toBe('Intern');
    expect(playerRank(100).title).toBe('Junior Developer');
    expect(playerRank(1500).title).toBe('Angular Grandmaster');
    expect(playerRank(150).progress).toBeCloseTo(50 / 200);
    expect(playerRank(99999).next).toBeNull();
  });
});

describe('precision / recall / f1', () => {
  it('computes from counts and from sets', () => {
    expect(precisionRecallF1(3, 1, 1).f1).toBeCloseTo(0.75);
    expect(precisionRecallF1(0, 0, 0).f1).toBe(1);
    expect(precisionRecallF1(0, 0, 2).f1).toBe(0);
    expect(setF1(['a', 'b', 'x'], ['a', 'b', 'c']).f1).toBeCloseTo(2 / 3);
  });
});

describe('fractionCorrect', () => {
  it('is the share of correct items as a rounded percentage', () => {
    expect(fractionCorrect(3, 4)).toBe(75);
    expect(fractionCorrect(2, 3)).toBe(67);
    expect(fractionCorrect(0, 5)).toBe(0);
  });

  it('is 100 when there is nothing to get right', () => {
    expect(fractionCorrect(0, 0)).toBe(100);
  });
});

describe('pickScore', () => {
  const items = [
    { id: 'a', relevance: 3 },
    { id: 'b', relevance: 2 },
    { id: 'c', relevance: 0 },
    { id: 'd', relevance: 2 },
  ];

  it('is the picked relevance over the best achievable with k picks', () => {
    expect(pickScore(['a', 'c', 'd'], items, 3)).toBeCloseTo((5 / 7) * 100);
    expect(pickScore(['a', 'b', 'd'], items, 3)).toBe(100);
  });
});

describe('bonusXp', () => {
  it('first try and flawless bonuses, flawless forfeited by a hint', () => {
    expect(bonusXp({ scorePct: 92, attempts: 1, flawless: true, hinted: false }).total).toBe(30);
    expect(bonusXp({ scorePct: 92, attempts: 1, flawless: true, hinted: true }).total).toBe(10);
    expect(bonusXp({ scorePct: 80, attempts: 1, flawless: false, hinted: false }).total).toBe(0);
  });
});
