import { WorldId } from '../models';
import { QuestRef } from './progression';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface QuestOutcome {
  stars: number;
  feats: string[];
}

export interface PlayerSnapshot {
  results: Record<string, QuestOutcome | undefined>;
  streakDays: number;
  glossaryOpened: boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first-steps',
    title: 'First Commit',
    description: 'Finish your first quest with at least one star.',
    icon: '🥾',
  },
  {
    id: 'bug-hunter',
    title: 'Bug Hunter',
    description: 'Flag every bug in a file and nothing else.',
    icon: '🐛',
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    description: 'Fill every blank of a snippet correctly.',
    icon: '✍️',
  },
  {
    id: 'signal-seer',
    title: 'Signal Seer',
    description: 'Predict a signal-graph run exactly: every recomputation, every effect.',
    icon: '🔭',
  },
  {
    id: 'code-reviewer',
    title: 'Code Reviewer',
    description: 'Judge every claim correctly through a whole review quest.',
    icon: '🕵️',
  },
  {
    id: 'flawless',
    title: 'Flawless',
    description: 'Score 90% or more on every round of a quest without asking Nia for a hint.',
    icon: '💎',
  },
  {
    id: 'comeback',
    title: 'Comeback',
    description: 'Improve one of your best scores by 30 points or more.',
    icon: '📈',
  },
  {
    id: 'wing-keeper-components',
    title: 'Keeper of the Forge',
    description: 'Three stars on every quest of the Template Forge.',
    icon: '🔨',
  },
  {
    id: 'wing-keeper-signals',
    title: 'Keeper of the Observatory',
    description: 'Three stars on every quest of the Signal Observatory.',
    icon: '📡',
  },
  {
    id: 'wing-keeper-architecture',
    title: 'Keeper of the Dock',
    description: 'Three stars on every quest of the Shipping Dock.',
    icon: '⚓',
  },
  {
    id: 'streak-3',
    title: 'Three Days Running',
    description: 'Play on three consecutive days.',
    icon: '🔥',
  },
  {
    id: 'docs-reader',
    title: 'Docs Reader',
    description: 'Open the glossary at least once.',
    icon: '📚',
  },
  {
    id: 'green-build',
    title: 'Green Build',
    description: 'Earn at least one star on every quest of the Workshop.',
    icon: '🟢',
  },
  {
    id: 'grandmaster',
    title: 'Angular Grandmaster',
    description: 'Three stars on every quest of the Workshop.',
    icon: '👑',
  },
];

const FEAT_BADGES: Record<string, string> = {
  'all-bugs-found': 'bug-hunter',
  'cloze-perfect': 'autocomplete',
  'signal-seer': 'signal-seer',
  'all-claims-right': 'code-reviewer',
  flawless: 'flawless',
  comeback: 'comeback',
};

const WINGS: WorldId[] = ['components', 'signals', 'architecture'];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

/** Badge ids unlocked by a player snapshot, in catalogue order. */
export function unlockedBadgeIds(snapshot: PlayerSnapshot, quests: QuestRef[]): string[] {
  const unlocked = new Set<string>();
  const outcomes = Object.values(snapshot.results).filter(
    (outcome): outcome is QuestOutcome => !!outcome,
  );
  const starsOf = (id: string) => snapshot.results[id]?.stars ?? 0;

  if (outcomes.some((outcome) => outcome.stars >= 1)) {
    unlocked.add('first-steps');
  }
  for (const outcome of outcomes) {
    for (const feat of outcome.feats) {
      const badge = FEAT_BADGES[feat];
      if (badge) {
        unlocked.add(badge);
      }
    }
  }
  for (const world of WINGS) {
    const wing = quests.filter((quest) => quest.world === world);
    if (wing.length && wing.every((quest) => starsOf(quest.id) === 3)) {
      unlocked.add(`wing-keeper-${world}`);
    }
  }
  if (quests.length && quests.every((quest) => starsOf(quest.id) >= 1)) {
    unlocked.add('green-build');
  }
  if (quests.length && quests.every((quest) => starsOf(quest.id) === 3)) {
    unlocked.add('grandmaster');
  }
  if (snapshot.streakDays >= 3) {
    unlocked.add('streak-3');
  }
  if (snapshot.glossaryOpened) {
    unlocked.add('docs-reader');
  }
  return BADGES.map((badge) => badge.id).filter((id) => unlocked.has(id));
}
