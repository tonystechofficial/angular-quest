# Angular Quest

**Learn modern Angular by playing — on a real codebase.**

The build is red and Nia, the tech lead, needs help modernizing the Workshop. Through 17 quests across three wings you learn the Angular actually used in [RAG Quest](https://rag-quest.vercel.app) (an open-source Angular 22 game): standalone components, the built-in control flow, signal inputs and outputs, `signal` / `computed` / `effect`, zoneless change detection, `inject()`, lazy routes with input binding, Vitest component tests, and the production build.

No backend, no account. Progress is stored in `localStorage`.

**Play it:** https://angular-quest.vercel.app

## The three wings

| Wing | Quest | Mechanic | What you learn |
| --- | --- | --- | --- |
| 🧩 The Template Forge | Anatomy of a Component | fill the blanks | `@Component`, `imports`, `input.required`, `output`, `computed`, bindings |
| | Control Flow Sorter | sort | `@if`, `@for … track`, `@switch`, `@let` vs legacy directives |
| | Spot the Template Bug | click the buggy lines | signal reads without `()`, missing imports, uncalled handlers, `$event.target` typing |
| | Inputs & Outputs | quiz on code | `input()`, `input.required()`, `output()`, `model()`, `setInput` |
| | Forge Master's Review 👑 | pick the imports | exactly what a template needs to import, and what it does not |
| 📡 The Signal Observatory | Signal Lab | predict then simulate | laziness, equality, memoization, diamonds, `untracked` — on a real simulator |
| | signal, computed, effect or linkedSignal? | sort | choosing the right reactive primitive |
| | Find the Signal Reads | click the reads | what in a template actually subscribes |
| | Refactor to Signals | fill the blanks | fields → signals, `toSignal`, `effect` + `untracked` |
| | Zoneless Detective | review claims | what refreshes a view without zone.js |
| | Reactivity Exam 👑 | quiz | signals end to end |
| 🚢 The Shipping Dock | Inject It | fill the blanks | `@Injectable`, `providedIn: 'root'`, `inject()`, `provideRouter`, TestBed providers |
| | Lazy Route Journey | order the steps | from a click to a rendered lazy page with bound inputs |
| | Testing with Vitest | fill the blanks | `createComponent`, `setInput`, `whenStable`, outputs, `it.each` |
| | State in a Service | review claims | the signal-store pattern of the progress service |
| | Ship It | quiz | `dist/<project>/browser`, budgets, SPA rewrite, lazy chunks, Node floor |
| | Release Night 👑 | review claims | everything, as release notes to fact-check |

👑 = wing review. One star on the review opens the next wing.

## The game

Same engine and design as RAG Quest ([docs/GAME-DESIGN.md](docs/GAME-DESIGN.md)): stars at 30 / 60 / 90 %, 100 XP per quest plus first-try and flawless bonuses, sequential unlocking with a free-play toggle, a hint per quest from the mentor, a daily streak, 14 badges and a certificate when the build is green.

The **Signal Lab** runs on a small reimplementation of Angular's signal semantics (`src/app/core/domain/signal-sim.ts`, tested): equality short-circuit, lazy memoized computeds whose unchanged values stop the cascade, glitch-free diamonds, and effects that ignore `untracked` reads.

## How it is built

- **Angular 22** (standalone, signals, zoneless, lazy routes), **TypeScript 6**, **Vitest**.
- `src/app/core/domain/` — pure logic, written test-first: signal simulator, scoring and bonuses, progression, streak, badges.
- `src/app/content/` — the quests as data (code snippets included), validated by `content.spec.ts`: every cloze placeholder matches a blank, every answer is an option, every signal-lab scenario is well-formed and simulates.
- `src/app/features/play/engines/` — one component per mechanic: multiple choice, fill-the-blanks (`cloze`), spot-the-line (`code-select`), signal lab, token select, ordering, bucket sort, pick-k, claim check.

## Run it locally

```bash
npm install
npm start          # http://localhost:4200
npm run test:ci    # unit + component tests (Vitest)
npm run build      # production build in dist/angular-quest/browser
```

Requires Node 22.22+ (Angular 22).

## Deploy

Static site on Vercel (`vercel.json`: output directory and SPA rewrite).

```bash
npx vercel --prod
```

## License

[MIT](LICENSE)
