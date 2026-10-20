import { WorldId } from '../core/models';

/** Nia, the tech lead: the voice that frames every quest and comments every result. */
export const MENTOR = {
  name: 'Nia',
  role: 'Tech Lead',
  welcome:
    'Welcome aboard. The RAG Quest codebase is good Angular — standalone, signals, zoneless — but the last ' +
    'few commits broke it in instructive ways. Walk the three wings with me; by the end you will read this ' +
    'code like your own.',
  byStars: {
    0: [
      'The CI would have caught that. Read the explanations, then try again — that is the whole job.',
      'Not green yet. Every red test is a sentence of the docs you have not read; go read it.',
    ],
    1: [
      'It compiles. The explanations are where the real knowledge is — collect them.',
      'You found the shape of it. One more pass and it will click.',
    ],
    2: [
      'Solid. I would approve this with one comment. Go find the comment.',
      'Good. The app re-renders a little less for nothing already.',
    ],
    3: [
      'Approved without comments. The Workshop is a bit more modern thanks to you.',
      'Clean. I am adding you as a code owner for this wing.',
    ],
  } as Record<number, string[]>,
  wingOpened: {
    signals:
      'The Signal Observatory is open. Here we learn why the app knows what to re-render — and when it does not.',
    architecture:
      'The Shipping Dock is open. Injection, routing, tests and the build: everything between a component and production.',
  } as Partial<Record<WorldId, string>>,
  bossBeaten: 'That was the wing review. The next door is open.',
  restored:
    'Green build, every wing reviewed. You are not the intern anymore — go modernize something that matters.',
  hintCaption: 'Ask Nia for a hint (forfeits the Flawless bonus)',
};

export function mentorLine(stars: number, seed: number): string {
  const lines = MENTOR.byStars[Math.max(0, Math.min(3, stars))] ?? MENTOR.byStars[0];
  return lines[Math.abs(seed) % lines.length];
}
