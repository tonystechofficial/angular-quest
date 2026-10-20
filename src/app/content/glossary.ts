import { GlossaryEntry } from '../core/models';

export const GLOSSARY: GlossaryEntry[] = [
  // ---- components & templates
  {
    term: 'Standalone component',
    world: 'components',
    definition:
      'A component that declares its own dependencies in `imports` instead of belonging to an NgModule. The default since Angular 19; RAG Quest has no module at all.',
  },
  {
    term: 'imports (component)',
    world: 'components',
    definition:
      'The list of components, directives and pipes a template may use. A missing entry is a compile error ("No pipe found with name…"), not a runtime surprise.',
  },
  {
    term: 'Signal inputs — input(), input.required()',
    world: 'components',
    definition:
      'Component inputs exposed as read-only signals: `level = input.required<Level>()`, read as `level()`. Tests set them with `fixture.componentRef.setInput(…)`.',
  },
  {
    term: 'output()',
    world: 'components',
    definition:
      'A function-based output: `completed = output<ChallengeResult>()`, fired with `.emit(value)`, listened to in templates with `(completed)="…"`.',
  },
  {
    term: 'model()',
    world: 'components',
    definition:
      'A writable signal input that also emits changes (two-way binding with `[(value)]`). RAG Quest does not need it; know it exists.',
  },
  {
    term: 'Built-in control flow — @if, @for, @switch, @let',
    world: 'components',
    definition:
      'Template syntax that replaced *ngIf / *ngFor / ngSwitch. `@for` requires a `track` expression; `@let` declares a template-local variable; `@if (x; as y)` aliases the value.',
  },
  {
    term: 'track',
    world: 'components',
    definition:
      'The identity function of a `@for` loop. Tracking by a stable id lets Angular move DOM nodes instead of recreating them; `track $index` is the escape hatch for static lists.',
  },
  {
    term: 'Property, attribute and class bindings',
    world: 'components',
    definition:
      '`[disabled]="x"` sets a DOM property, `[attr.aria-pressed]="x"` an attribute, `[class.selected]="x"` toggles a class, `[style.width.%]="x"` a style with a unit.',
  },
  // ---- signals & reactivity
  {
    term: 'signal()',
    world: 'signals',
    definition:
      'A writable reactive value: `count = signal(0)`, read with `count()`, changed with `.set(v)` or `.update(fn)`. Setting an equal value (Object.is) notifies nobody.',
  },
  {
    term: 'computed()',
    world: 'signals',
    definition:
      'A derived, read-only, memoized signal. Lazy: it recomputes only when read after one of its producers changed, and only propagates when its own value changed.',
  },
  {
    term: 'effect()',
    world: 'signals',
    definition:
      'Code that re-runs when a tracked signal it read changes — for side effects such as logging, storage or DOM APIs, never to derive state (use computed for that).',
  },
  {
    term: 'linkedSignal()',
    world: 'signals',
    definition:
      'A writable signal whose value resets from a source when the source changes: the "editable copy of an input" pattern without an effect.',
  },
  {
    term: 'untracked()',
    world: 'signals',
    definition:
      'Reads a signal inside a reactive context without creating a dependency. RAG Quest uses it in an effect to reset page state when the level changes without tracking the state itself.',
  },
  {
    term: 'Zoneless change detection',
    world: 'signals',
    definition:
      'No zone.js: Angular schedules a check when a signal read by a template changes, an event handler runs or `markForCheck` is called. Mutating a plain field updates nothing.',
  },
  {
    term: 'Glitch-free',
    world: 'signals',
    definition:
      'In a diamond (a → b, a → c, d reads b and c), d recomputes once with both inputs fresh, never with a half-updated graph.',
  },
  {
    term: 'toSignal / toObservable',
    world: 'signals',
    definition:
      'Bridges between RxJS and signals: `toSignal(obs$)` exposes the latest value as a signal; `toObservable(sig)` emits on change. Use them at the boundary, not everywhere.',
  },
  // ---- architecture & delivery
  {
    term: 'inject()',
    world: 'architecture',
    definition:
      'Function-based dependency injection: `progress = inject(ProgressService)` in a field initializer or constructor. Clearer than constructor parameters, works in inheritance.',
  },
  {
    term: 'providedIn: root',
    world: 'architecture',
    definition:
      'A tree-shakable singleton service available app-wide without being listed in any providers array. The progress service of RAG Quest is one.',
  },
  {
    term: 'Lazy route — loadComponent',
    world: 'architecture',
    definition:
      '`loadComponent: () => import("./page").then(m => m.Page)`: the page becomes its own JavaScript chunk, downloaded on first navigation.',
  },
  {
    term: 'withComponentInputBinding()',
    world: 'architecture',
    definition:
      'Router feature that binds route parameters, query params and resolved data to component inputs: `/play/:levelId` fills `levelId = input.required<string>()`.',
  },
  {
    term: 'TestBed',
    world: 'architecture',
    definition:
      "Angular's test harness: `TestBed.createComponent(X)`, `fixture.componentRef.setInput`, `await fixture.whenStable()` under zoneless, `providers: [provideRouter([])]` when a template uses routerLink.",
  },
  {
    term: 'Vitest (Angular test runner)',
    world: 'architecture',
    definition:
      'The default unit-test runner of new Angular projects since v21 (`@angular/build:unit-test`), running specs in jsdom. `ng test --watch=false` for a single run.',
  },
  {
    term: 'Budgets',
    world: 'architecture',
    definition:
      "Size limits in angular.json: the initial bundle (warning 500 kB, error 1 MB by default) and each component's styles (4 kB / 8 kB). Exceeding the error budget fails the build.",
  },
  {
    term: 'Application builder output',
    world: 'architecture',
    definition:
      'Since Angular 17 the `application` builder writes the browser bundle to `dist/<project>/browser`. Static hosts must point at that folder and rewrite unknown routes to index.html.',
  },
];
