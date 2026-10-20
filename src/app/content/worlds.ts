import { Level, World, WorldId } from '../core/models';
import { ARCHITECTURE_LEVELS } from './architecture-world';
import { COMPONENTS_LEVELS } from './components-world';
import { SIGNALS_LEVELS } from './signals-world';

export const WORLDS: World[] = [
  {
    id: 'components',
    name: 'Components & Templates',
    wing: 'The Template Forge',
    tagline: 'Where the UI is forged.',
    description: 'Standalone components, inputs and outputs, the new control flow, imports.',
    icon: '🧩',
    story:
      'Every screen of RAG Quest is a standalone component: a class, a template, an imports list and nothing ' +
      'else. The Forge is where templates are shaped — @if, @for, bindings, signals read with parentheses. The ' +
      'last intern left broken templates everywhere; the compiler caught some, the users caught the rest.',
    mentorIntro:
      'Rule one of the Forge: a template can only use what the component imports, and a signal is a function.',
  },
  {
    id: 'signals',
    name: 'Signals & Reactivity',
    wing: 'The Signal Observatory',
    tagline: 'See what re-renders, and why.',
    description:
      'signal, computed, effect, linkedSignal, equality, laziness, zoneless change detection.',
    icon: '📡',
    story:
      'RAG Quest runs without zone.js. Nothing re-renders because "something happened": the template reads ' +
      'signals, and only a changed signal schedules a check. The Observatory is where you watch the dependency ' +
      'graph do its work — and where you learn why a value that did not change stops the whole cascade.',
    mentorIntro:
      'Up here we predict before we run. If you cannot say which computed recomputes, you do not know the graph yet.',
  },
  {
    id: 'architecture',
    name: 'Architecture & Delivery',
    wing: 'The Shipping Dock',
    tagline: 'From a component to production.',
    description:
      'Dependency injection, lazy routes, services with signals, Vitest, build and deploy.',
    icon: '🚢',
    story:
      'A component alone ships nothing. The Dock holds the rest of RAG Quest: a progress service injected ' +
      'everywhere, lazy routes that bind URL parameters to inputs, component tests that click real DOM, a ' +
      'production build with budgets, and a Vercel deployment that rewrites every route to index.html.',
    mentorIntro:
      'Last wing. Everything here is boring on purpose: the boring parts are what keeps a build green at 2 a.m.',
  },
];

/** Order of the quests. The last quest of each wing is its boss. */
export const QUEST_ORDER: string[] = [
  // The Template Forge
  'component-anatomy',
  'control-flow',
  'template-bugs',
  'inputs-outputs',
  'imports-review',
  // The Signal Observatory
  'signal-lab',
  'reactive-primitives',
  'signal-reads',
  'refactor-to-signals',
  'zoneless-detective',
  'reactivity-exam',
  // The Shipping Dock
  'inject-it',
  'lazy-routes',
  'testing-lab',
  'state-service',
  'ship-it',
  'release-night',
];

const ALL_LEVELS: Level[] = [...COMPONENTS_LEVELS, ...SIGNALS_LEVELS, ...ARCHITECTURE_LEVELS];

export const LEVELS: Level[] = [...ALL_LEVELS].sort(
  (a, b) => QUEST_ORDER.indexOf(a.id) - QUEST_ORDER.indexOf(b.id),
);

export function findWorld(id: string): World | undefined {
  return WORLDS.find((world) => world.id === id);
}

export function levelsForWorld(id: WorldId): Level[] {
  return LEVELS.filter((level) => level.world === id);
}

export function findLevel(id: string): Level | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function nextLevel(id: string): Level | undefined {
  const index = LEVELS.findIndex((level) => level.id === id);
  return index === -1 ? undefined : LEVELS[index + 1];
}

export function previousInWing(id: string): Level | undefined {
  const level = findLevel(id);
  if (!level) return undefined;
  const wing = levelsForWorld(level.world);
  const index = wing.findIndex((candidate) => candidate.id === id);
  return index > 0 ? wing[index - 1] : undefined;
}

export const TOTAL_XP = LEVELS.reduce((sum, level) => sum + level.xp, 0);
