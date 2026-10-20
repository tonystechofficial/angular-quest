import { bossOf, wingOrder } from '../core/domain/progression';
import { simulate } from '../core/domain/signal-sim';
import { GLOSSARY } from './glossary';
import { MENTOR, mentorLine } from './mentor';
import {
  LEVELS,
  QUEST_ORDER,
  TOTAL_XP,
  WORLDS,
  findLevel,
  levelsForWorld,
  nextLevel,
} from './worlds';

describe('quest registry', () => {
  it('has unique ids, known wings, at least three quests per wing and enough xp for the top rank', () => {
    const ids = LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
    const worldIds = new Set(WORLDS.map((world) => world.id));
    for (const level of LEVELS) {
      expect(worldIds.has(level.world)).toBe(true);
    }
    for (const world of WORLDS) {
      expect(levelsForWorld(world.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(TOTAL_XP).toBeGreaterThanOrEqual(1500);
  });

  it('follows QUEST_ORDER, groups wings contiguously and ends each wing with its review', () => {
    expect([...QUEST_ORDER].sort()).toEqual(LEVELS.map((level) => level.id).sort());
    expect(LEVELS.map((level) => level.id)).toEqual(QUEST_ORDER);
    expect(wingOrder(LEVELS)).toEqual(['components', 'signals', 'architecture']);
    expect(bossOf('components', LEVELS)?.id).toBe('imports-review');
    expect(bossOf('signals', LEVELS)?.id).toBe('reactivity-exam');
    expect(bossOf('architecture', LEVELS)?.id).toBe('release-night');
    expect(nextLevel(LEVELS[0].id)?.id).toBe(LEVELS[1].id);
    expect(nextLevel(LEVELS[LEVELS.length - 1].id)).toBeUndefined();
    expect(findLevel('nope')).toBeUndefined();
  });

  it('has a story, a hint, a takeaway and an intro everywhere', () => {
    for (const level of LEVELS) {
      expect(level.story.length).toBeGreaterThan(30);
      expect(level.hint.length).toBeGreaterThan(40);
      expect(level.takeaway.length).toBeGreaterThan(60);
      expect(level.challenge.intro.length).toBeGreaterThan(20);
    }
    for (const world of WORLDS) {
      expect(world.wing.startsWith('The ')).toBe(true);
      expect(world.story.length).toBeGreaterThan(80);
    }
  });
});

describe('challenge content is internally consistent', () => {
  it('mcq answers point at an existing, unique option', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind !== 'mcq') continue;
      for (const question of level.challenge.questions) {
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.options.length);
        expect(new Set(question.options).size).toBe(question.options.length);
      }
    }
  });

  it('token-select and code-select answers reference existing tokens, lines and labels', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind === 'token-select') {
        const labelIds = new Set(level.challenge.labels.map((label) => label.id));
        for (const round of level.challenge.rounds) {
          for (const [index, label] of Object.entries(round.answers)) {
            expect(Number(index)).toBeLessThan(round.tokens.length);
            expect(labelIds.has(label)).toBe(true);
          }
        }
      }
      if (level.challenge.kind === 'code-select') {
        const labelIds = new Set(level.challenge.labels.map((label) => label.id));
        for (const round of level.challenge.rounds) {
          expect(Object.keys(round.answers).length).toBeGreaterThan(0);
          for (const [index, label] of Object.entries(round.answers)) {
            expect(Number(index)).toBeLessThan(round.lines.length);
            expect(labelIds.has(label)).toBe(true);
            expect(round.notes[Number(index)]?.length).toBeGreaterThan(20);
          }
        }
      }
    }
  });

  it('bucket cards reference existing buckets and have unique ids', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind !== 'bucket-sort') continue;
      const bucketIds = new Set(level.challenge.buckets.map((bucket) => bucket.id));
      const cardIds = level.challenge.cards.map((card) => card.id);
      expect(new Set(cardIds).size).toBe(cardIds.length);
      for (const card of level.challenge.cards) {
        expect(bucketIds.has(card.bucket)).toBe(true);
      }
    }
  });

  it('order-steps have unique ids and pick-k rounds have a reachable k', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind === 'order-steps') {
        const ids = level.challenge.steps.map((step) => step.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBeGreaterThanOrEqual(5);
      }
      if (level.challenge.kind === 'pick-k') {
        for (const round of level.challenge.rounds) {
          const ids = round.items.map((item) => item.id);
          expect(new Set(ids).size).toBe(ids.length);
          expect(round.k).toBeGreaterThan(0);
          expect(round.k).toBeLessThan(round.items.length);
          expect(round.items.filter((item) => item.relevance === 3).length).toBe(round.k);
        }
      }
    }
  });

  it('claim-check rounds mix true and wrong claims', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind !== 'claim-check') continue;
      for (const round of level.challenge.rounds) {
        expect(round.claims.some((claim) => claim.supported)).toBe(true);
        expect(round.claims.some((claim) => !claim.supported)).toBe(true);
      }
    }
  });

  it('cloze placeholders match the blanks one to one, and every answer is among its options', () => {
    for (const level of LEVELS) {
      if (level.challenge.kind !== 'cloze') continue;
      for (const round of level.challenge.rounds) {
        const placeholders = [...round.code.matchAll(/\[\[(\d+)\]\]/g)]
          .map((m) => Number(m[1]))
          .sort((a, b) => a - b);
        expect(placeholders).toEqual(round.blanks.map((_, i) => i + 1));
        for (const blank of round.blanks) {
          expect(blank.options).toContain(blank.answer);
          expect(new Set(blank.options).size).toBe(blank.options.length);
          expect(blank.why.length).toBeGreaterThan(20);
        }
      }
    }
  });

  it('signal-lab scenarios are well-formed, simulate without error and cover both outcomes', () => {
    let withChanges = 0;
    let withoutChanges = 0;
    for (const level of LEVELS) {
      if (level.challenge.kind !== 'signal-lab') continue;
      for (const round of level.challenge.rounds) {
        const ids = round.nodes.map((node) => node.id);
        expect(new Set(ids).size).toBe(ids.length);
        const byId = new Map(round.nodes.map((node) => [node.id, node]));
        for (const node of round.nodes) {
          if (node.kind !== 'signal') {
            for (const dep of node.deps) expect(byId.has(dep)).toBe(true);
          }
          if (node.kind === 'effect') {
            for (const dep of node.untrackedDeps ?? []) expect(byId.has(dep)).toBe(true);
          }
        }
        expect(byId.get(round.action.id)?.kind).toBe('signal');
        for (const read of round.reads) expect(byId.get(read)?.kind).not.toBe('effect');
        const run = simulate({ nodes: round.nodes }, { set: round.action }, round.reads);
        if (run.touched.length) withChanges++;
        else withoutChanges++;
      }
    }
    expect(withChanges).toBeGreaterThan(0);
    expect(withoutChanges).toBeGreaterThan(0);
  });

  it('glossary terms are unique and the mentor has lines for every star count', () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(new Set(terms).size).toBe(terms.length);
    for (let stars = 0; stars <= 3; stars++) {
      expect(mentorLine(stars, 0).length).toBeGreaterThan(10);
    }
    expect(MENTOR.wingOpened.signals).toBeTruthy();
    expect(MENTOR.wingOpened.architecture).toBeTruthy();
  });
});
