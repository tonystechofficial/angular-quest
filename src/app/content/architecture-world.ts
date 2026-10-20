import { Level } from '../core/models';

export const ARCHITECTURE_LEVELS: Level[] = [
  {
    id: 'inject-it',
    world: 'architecture',
    title: 'Inject It',
    tagline: 'Services, providers and the inject() function.',
    concept: 'Dependency injection',
    minutes: 4,
    xp: 100,
    story:
      'The progress service is used by every page of RAG Quest and declared nowhere. Nia asks you how that is even possible.',
    hint: 'A root-provided service is a singleton available everywhere; components get it with inject(). Providers configure the app in app.config.ts.',
    takeaway:
      "`@Injectable({ providedIn: 'root' })` makes a tree-shakable singleton; components and other services obtain it with `inject(Service)` in a field " +
      'initializer. App-wide features are configured with `provide*` functions in `app.config.ts`; tests add providers to `TestBed.configureTestingModule`.',
    challenge: {
      kind: 'cloze',
      intro: 'Complete the three injection snippets.',
      rounds: [
        {
          prompt: 'The progress service and a page that uses it.',
          code:
            '@[[1]]({ providedIn: [[2]] })\n' +
            'export class ProgressService {\n' +
            '  private readonly state = signal<ProgressState>(load());\n' +
            '  readonly totalXp = computed(() => sum(this.state().results));\n' +
            '}\n\n' +
            'export class HomePage {\n' +
            '  protected readonly progress = [[3]](ProgressService);\n' +
            '}',
          blanks: [
            {
              options: ['Injectable', 'Component', 'Service', 'NgModule'],
              answer: 'Injectable',
              why: 'Services are classes decorated with @Injectable so the injector can create them.',
            },
            {
              options: ["'root'", "'platform'", "'any'", 'null'],
              answer: "'root'",
              why: "providedIn: 'root' = one tree-shakable singleton for the whole app, with no providers array anywhere.",
            },
            {
              options: ['inject', 'new', 'provide', 'import'],
              answer: 'inject',
              why: '`inject()` in a field initializer replaces constructor parameters. It must run in an injection context: field initializers, constructors, factories.',
            },
          ],
          explanation:
            'Declare once with providedIn root, consume with inject(). RAG Quest has no providers array for its service at all.',
        },
        {
          prompt: 'The application configuration with the router.',
          code:
            'export const appConfig: ApplicationConfig = {\n' +
            '  providers: [\n' +
            '    provideBrowserGlobalErrorListeners(),\n' +
            '    [[1]](\n' +
            '      routes,\n' +
            '      [[2]](),\n' +
            "      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),\n" +
            '    ),\n' +
            '  ],\n' +
            '};',
          blanks: [
            {
              options: [
                'provideRouter',
                'RouterModule.forRoot',
                'provideRoutes',
                'importProvidersFrom',
              ],
              answer: 'provideRouter',
              why: 'The standalone way to configure the router; `RouterModule.forRoot` is the NgModule era.',
            },
            {
              options: [
                'withComponentInputBinding',
                'withRouterInputs',
                'withParams',
                'bindInputs',
              ],
              answer: 'withComponentInputBinding',
              why: 'Binds route parameters to component inputs, so a page can declare `levelId = input.required<string>()`.',
            },
          ],
          explanation:
            'Features are plugged into provideRouter with `with*` functions. No modules, no decorators: plain function calls.',
        },
        {
          prompt: 'A component test for a template that uses routerLink.',
          code:
            'await TestBed.configureTestingModule({\n' +
            '  providers: [[[1]]([])],\n' +
            '}).compileComponents();\n\n' +
            'const progress = TestBed.[[2]](ProgressService);\n' +
            'progress.reset();',
          blanks: [
            {
              options: ['provideRouter', 'RouterTestingModule', 'provideLocation', 'provideRoutes'],
              answer: 'provideRouter',
              why: 'A template with `routerLink` needs the router providers; an empty route list is enough for rendering.',
            },
            {
              options: ['inject', 'get', 'resolve', 'createService'],
              answer: 'inject',
              why: '`TestBed.inject(Token)` returns the instance from the test injector — the same singleton the component will receive.',
            },
          ],
          explanation:
            'Tests use the same DI: provide what templates need, inject what you want to inspect or reset.',
        },
      ],
    },
  },
  {
    id: 'lazy-routes',
    world: 'architecture',
    title: 'Lazy Route Journey',
    tagline: 'What happens between a click and a rendered page.',
    concept: 'Lazy routes & input binding',
    minutes: 4,
    xp: 100,
    story:
      'A user clicks "Chunk Master" for the first time. Nia wants the whole journey, in order, from the click to the title in the tab.',
    hint: 'Interception, matching, download, creation, input binding, derivation, render, title. The chunk is downloaded before the component can exist.',
    takeaway:
      'A lazy route (`loadComponent`) is a separate JavaScript chunk fetched on first navigation. The router matches the URL, loads the chunk, creates the ' +
      "component in the outlet, binds route params to inputs (`withComponentInputBinding`), and the component's signals derive everything else. The route title is applied last.",
    challenge: {
      kind: 'order-steps',
      intro: 'Put the steps of the first navigation to /play/chunk-master in order.',
      steps: [
        {
          id: 'click',
          title: 'The click on [routerLink] is intercepted',
          detail: 'No full page reload: the router handles the navigation in the SPA.',
          phase: 'Navigation',
        },
        {
          id: 'match',
          title: 'The router matches play/:levelId',
          detail: "The URL yields the parameter levelId = 'chunk-master'.",
          phase: 'Navigation',
        },
        {
          id: 'load',
          title: 'loadComponent downloads the lazy chunk',
          detail:
            "import('./features/play/play-page') fetches the page's JavaScript on first visit.",
          phase: 'Loading',
        },
        {
          id: 'create',
          title: 'The router outlet creates PlayPage',
          detail: 'The component instance exists only now that its code is loaded.',
          phase: 'Rendering',
        },
        {
          id: 'bind',
          title: 'The levelId input is set from the URL',
          detail: 'withComponentInputBinding writes the route param into input.required<string>().',
          phase: 'Rendering',
        },
        {
          id: 'derive',
          title: 'Computed signals derive the level; the effect sets the document title',
          detail: 'level = computed(() => findLevel(levelId())) and friends run on first read.',
          phase: 'Rendering',
        },
        {
          id: 'render',
          title: 'The template renders and @if picks the engine',
          detail: "@if (c.kind === 'chunk-lab') creates the matching engine component.",
          phase: 'Rendering',
        },
        {
          id: 'title',
          title: 'The route title is applied',
          detail: "The TitleStrategy sets 'Quest · Angular Quest' once navigation ends.",
          phase: 'After navigation',
        },
      ],
    },
  },
  {
    id: 'testing-lab',
    world: 'architecture',
    title: 'Testing with Vitest',
    tagline: 'Component tests that click real DOM, zoneless style.',
    concept: 'TestBed & Vitest',
    minutes: 4,
    xp: 100,
    story: 'The suite has 199 tests and Nia wants you to be able to write the 200th before lunch.',
    hint: 'createComponent, setInput for required inputs, await whenStable() after every interaction, subscribe to outputs, it.each for tables, toBe for primitives.',
    takeaway:
      'Component tests: `TestBed.createComponent`, `fixture.componentRef.setInput` for signal inputs, `await fixture.whenStable()` after each interaction (zoneless), ' +
      '`output.subscribe` to capture emissions, and `provideRouter([])` when templates use routerLink. Domain logic is tested without TestBed, written before the code.',
    challenge: {
      kind: 'cloze',
      intro: 'Complete three tests taken from the suite.',
      rounds: [
        {
          prompt: 'The shell renders the brand and the starting rank.',
          code:
            "it('renders the brand and the starting rank', async () => {\n" +
            '  await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();\n' +
            '  const fixture = TestBed.[[1]](App);\n' +
            '  await fixture.[[2]]();\n' +
            '  const el = fixture.nativeElement as HTMLElement;\n' +
            "  [[3]](el.querySelector('.xp-rank')?.textContent).toContain('Intern');\n" +
            '});',
          blanks: [
            {
              options: ['createComponent', 'inject', 'overrideComponent', 'render'],
              answer: 'createComponent',
              why: 'Creates the component fixture: instance + host element + change detection handle.',
            },
            {
              options: ['whenStable', 'detectChanges', 'autoDetectChanges', 'tick'],
              answer: 'whenStable',
              why: 'Under zoneless, change detection is scheduled; awaiting whenStable lets it run. detectChanges works too, whenStable is the idiom.',
            },
            {
              options: ['expect', 'assert', 'should', 'check'],
              answer: 'expect',
              why: 'Vitest exposes expect as a global (vitest/globals in tsconfig.spec.json).',
            },
          ],
          explanation:
            'createComponent, whenStable, expect: the three verbs of every component test in RAG Quest.',
        },
        {
          prompt: 'An engine test: set the input, capture the output, click an option.',
          code:
            'const fixture = TestBed.createComponent(McqEngine);\n' +
            "fixture.componentRef.[[1]]('challenge', challenge);\n" +
            'const results: ChallengeResult[] = [];\n' +
            'fixture.componentInstance.completed.[[2]]((r) => results.push(r));\n' +
            'await fixture.whenStable();\n' +
            "el.querySelectorAll<HTMLButtonElement>('.option')[0].[[3]]();\n" +
            'await fixture.whenStable();',
          blanks: [
            {
              options: ['setInput', 'setProperty', 'set', 'input'],
              answer: 'setInput',
              why: 'Signal inputs are read-only: setInput is the framework-aware way to provide them in tests.',
            },
            {
              options: ['subscribe', 'emit', 'on', 'pipe'],
              answer: 'subscribe',
              why: 'OutputEmitterRef exposes subscribe for tests and imperative listeners.',
            },
            {
              options: ['click', 'dispatch', 'press', 'trigger'],
              answer: 'click',
              why: 'A real DOM click: the template-bound (click) handler runs, then whenStable flushes the refresh.',
            },
          ],
          explanation:
            'Drive the component the way a user would: real inputs, real clicks, real outputs.',
        },
        {
          prompt: 'A domain test written before the implementation (red first).',
          code:
            '// scoring.spec.ts, written BEFORE scoring.ts\n' +
            "describe('starsForScore', () => {\n" +
            "  it.[[1]]([[100, 3], [60, 2], [29, 0]])('%i%% gives %i stars', (pct, stars) => {\n" +
            '    expect(starsForScore(pct)).[[2]](stars);\n' +
            '  });\n' +
            '});\n' +
            '// first run against a stub returning -1: 3 failures, then implement.',
          blanks: [
            {
              options: ['each', 'every', 'forEach', 'table'],
              answer: 'each',
              why: 'it.each turns a table into one test per row, with the values in the title.',
            },
            {
              options: ['toBe', 'toEqual', 'toBeCloseTo', 'toMatch'],
              answer: 'toBe',
              why: 'Primitives compare with toBe (Object.is); toEqual is for objects and arrays, toBeCloseTo for floats.',
            },
          ],
          explanation:
            'Pure domain logic needs no TestBed. Seeing the red against a stub proves each assertion discriminates.',
        },
      ],
    },
  },
  {
    id: 'state-service',
    world: 'architecture',
    title: 'State in a Service',
    tagline: 'One signal to hold them all.',
    concept: 'Signal-based services',
    minutes: 4,
    xp: 100,
    story:
      'A teammate summarized how the progress service works for the onboarding doc. Nia asks you to fact-check it against the code.',
    hint: 'Private writable signal, public computeds, mutations through methods, persistence inside the mutation. Root singleton.',
    takeaway:
      'The signal-store pattern of RAG Quest: a root-provided service holds one private `signal` of state, exposes `computed` views (XP, rank, badges, ' +
      'next quest), mutates through methods that `set` the whole state and persist it, and components simply read the computeds in their templates.',
    challenge: {
      kind: 'claim-check',
      intro:
        'Read the code facts and the summary. Tick every statement of the summary that is wrong.',
      contextLabel: 'What the code does',
      answerLabel: "Teammate's summary",
      rounds: [
        {
          code:
            "@Injectable({ providedIn: 'root' })\n" +
            'export class ProgressService {\n' +
            '  private readonly state = signal<ProgressState>(load());\n' +
            '  readonly results = computed(() => this.state().results);\n' +
            '  readonly totalXp = computed(() =>\n' +
            '    Object.values(this.state().results).reduce((sum, r) => sum + r.xp + r.bonusXp, 0));\n' +
            '  readonly rank = computed(() => playerRank(this.totalXp()));\n\n' +
            '  record(level: Level, result: ChallengeResult, hinted: boolean): RecordOutcome {\n' +
            '    // …compute the next result, then:\n' +
            '    this.commit((state) => ({ ...state, results: { ...state.results, [level.id]: next } }));\n' +
            '  }\n\n' +
            '  private commit(mutate: (s: ProgressState) => ProgressState): Badge[] {\n' +
            '    const updated = mutate(this.state());\n' +
            '    save(updated);           // localStorage\n' +
            '    this.state.set(updated);\n' +
            '    return newBadges;\n' +
            '  }\n' +
            '}',
          context:
            'The state signal is private. Every mutation goes through commit(), which saves to localStorage and then sets the signal. The service is provided in root.',
          answer:
            'Components bind to progress.totalXp() and re-render when it changes. Components can also call progress.state.set(…) directly when they need to update progress. Reading totalXp() in ten components recomputes the sum ten times per change. Every state change is written to localStorage.',
          claims: [
            {
              text: 'Components re-render when totalXp changes',
              supported: true,
              why: 'The template reads a computed; when the state signal changes, the computed changes and the view is refreshed.',
            },
            {
              text: 'Components can call progress.state.set(…) directly',
              supported: false,
              why: '`state` is private. Mutations go through methods such as record(), setFreePlay(), reset(): the invariants live in one place.',
            },
            {
              text: 'Reading totalXp() in ten components recomputes the sum ten times per change',
              supported: false,
              why: 'A computed is memoized: one recomputation per state change, however many readers.',
            },
            {
              text: 'Every state change is written to localStorage',
              supported: true,
              why: 'commit() calls save(updated) before setting the signal.',
            },
          ],
        },
        {
          code:
            '// app.config.ts has no mention of ProgressService.\n' +
            '// home-page.ts:   protected readonly progress = inject(ProgressService);\n' +
            '// play-page.ts:   protected readonly progress = inject(ProgressService);\n' +
            '// progress.service.ts:\n' +
            '  reset(): void {\n' +
            '    const empty = emptyState();\n' +
            '    save(empty);\n' +
            '    this.state.set(empty);\n' +
            '    this.toasts.set([]);\n' +
            '  }',
          context:
            'Pages are lazy-loaded routes. The service is providedIn root and has no effect() anywhere; persistence happens inside commit().',
          answer:
            'Because the service is providedIn root, each lazy-loaded page gets its own instance of it. The service persists state with an effect() that runs whenever the state changes. reset() replaces the state with an empty one and clears the toasts.',
          claims: [
            {
              text: 'Each lazy-loaded page gets its own instance of the service',
              supported: false,
              why: "providedIn: 'root' is a single instance for the whole application; lazy loading does not change that.",
            },
            {
              text: 'Persistence is implemented with an effect()',
              supported: false,
              why: 'No effect: save() is called explicitly inside commit(). Both designs work; this one keeps writes synchronous and testable.',
            },
            {
              text: 'reset() replaces the state with an empty one and clears the toasts',
              supported: true,
              why: 'Exactly what the code shows.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'ship-it',
    world: 'architecture',
    title: 'Ship It',
    tagline: 'Build output, budgets and the static-host trap.',
    concept: 'Build & deploy',
    minutes: 4,
    xp: 100,
    story:
      'Release day. The build is green locally, the static host serves a 404 on refresh and Nia wants the root cause, not a workaround.',
    hint: 'dist/<project>/browser, budgets that fail the build, a rewrite to index.html for deep links, lazy chunks, Node floor, and what ng test does not compile.',
    takeaway:
      'The application builder writes to `dist/<project>/browser`; budgets (initial bundle, per-component styles) turn size into build errors; a static host ' +
      'must rewrite unknown paths to `index.html` for deep links; lazy routes become chunks; the CLI has a Node floor; and only `ng build` type-checks every template.',
    challenge: {
      kind: 'mcq',
      intro: 'Six questions from the Shipping Dock.',
      questions: [
        {
          prompt: 'Where does `ng build` write the browser bundle with the application builder?',
          options: ['dist/<project>/', 'dist/<project>/browser', 'build/', 'public/'],
          answer: 1,
          explanation:
            'Since Angular 17 the output has a `browser` subfolder (and `server` when SSR is on). Static hosts must point at it — RAG Quest sets outputDirectory in vercel.json.',
        },
        {
          prompt: "A component's inline styles grow to 9 kB. With the default budgets, `ng build`…",
          options: [
            'succeeds silently',
            'fails: the anyComponentStyle error budget is 8 kB',
            'only warns',
            'strips the styles',
          ],
          answer: 1,
          explanation:
            'Default budgets: warning at 4 kB, error at 8 kB per component style, and 500 kB / 1 MB for the initial bundle. Shared styles belong in styles.scss.',
        },
        {
          prompt: 'On a static host, refreshing /world/signals returns 404. The right fix?',
          options: [
            'Switch to hash-based routing',
            'Rewrite every unknown path to /index.html',
            'Enable server-side rendering',
            'List every route in vercel.json as a page',
          ],
          answer: 1,
          explanation:
            'The SPA owns its routes; the host only has index.html. A catch-all rewrite serves it for deep links while real files (favicon, chunks) are served as-is.',
        },
        {
          prompt: 'How do `loadComponent` routes affect the production bundle?',
          options: [
            'They have no effect on the output',
            'Each lazy page becomes its own chunk, downloaded on first navigation',
            'They double the bundle size',
            'They disable output hashing',
          ],
          answer: 1,
          explanation:
            'RAG Quest ships a 93 kB initial bundle and a chunk per page. The browser downloads a page only when the user goes there.',
        },
        {
          prompt:
            'Angular CLI 22 refuses to start on a machine running Node 22.11. Most likely reason?',
          options: [
            'npm is too old',
            'Node is below the required 22.22',
            'zone.js is missing',
            'Windows is not supported',
          ],
          answer: 1,
          explanation:
            'The CLI checks the Node version before anything else and prints the minimum (22.22.3, 24.15 or 26). nvm install 22 fixed it in two minutes.',
        },
        {
          prompt:
            '`ng test` is green but `ng build` fails with "No pipe found with name \'lowercase\'". Why did the tests not catch it?',
          options: [
            'Tests ignore pipes',
            'The test build compiles only specs and their imports; that component had no spec',
            'Vitest cannot compile templates',
            'The pipe is deprecated',
          ],
          answer: 1,
          explanation:
            'A component nobody imports in a spec is never compiled by ng test. The production build is the only full template check — or give every page a spec.',
        },
      ],
    },
  },
  {
    id: 'release-night',
    world: 'architecture',
    title: 'Release Night',
    tagline: 'The final review: three release notes, every wing at once.',
    concept: 'Modern Angular, end to end',
    minutes: 5,
    xp: 100,
    story:
      'Release night. Three drafts of the release notes are on the table; each one gets a few facts wrong. Nia signs nothing until you have struck them out.',
    hint: 'Standalone, built-in control flow, signal inputs, zoneless provider, lazy chunks, input binding, Vitest limits. Everything from the three wings.',
    takeaway:
      'Modern Angular in one breath: standalone components with explicit imports, built-in control flow, signal inputs and outputs, signals and computeds ' +
      'for state, zoneless change detection, inject() and root services, lazy routes with input binding, Vitest tests and a static build with budgets.',
    challenge: {
      kind: 'claim-check',
      intro: 'Tick every statement of the release notes that is wrong.',
      contextLabel: 'Codebase facts',
      answerLabel: 'Release notes draft',
      rounds: [
        {
          context:
            'RAG Quest: Angular 22, standalone components only, built-in control flow, signal inputs, zoneless (new project default), lazy routes with withComponentInputBinding, Vitest, static deploy on Vercel.',
          answer:
            'This release migrates all components to standalone, so the app has no NgModule left. Zoneless change detection is enabled simply by removing zone.js from an existing app. Templates still use *ngIf for conditions. Route parameters are read through ActivatedRoute subscriptions.',
          claims: [
            {
              text: 'The app has no NgModule left',
              supported: true,
              why: 'Standalone components, `bootstrapApplication` and `provide*` functions: not a single module.',
            },
            {
              text: 'Removing zone.js alone enables zoneless change detection in an existing app',
              supported: false,
              why: 'An existing app also needs `provideZonelessChangeDetection()` in its providers; new projects get it by default.',
            },
            {
              text: 'Templates use *ngIf for conditions',
              supported: false,
              why: 'Every condition is an `@if` block; no structural directive is imported anywhere.',
            },
            {
              text: 'Route parameters are read through ActivatedRoute subscriptions',
              supported: false,
              why: 'withComponentInputBinding binds them to signal inputs: `levelId = input.required<string>()`.',
            },
          ],
        },
        {
          context:
            'Engines are small components, one per challenge type. The play page selects an engine with @if / @else if branches on challenge.kind, which narrows the discriminated union for type-checking. Engines report results through output().',
          answer:
            'The play page narrows the challenge union with @if chains on kind. Engines talk to the page through a shared service rather than outputs. Adding a new mechanic means adding an engine component and a branch in the play page. Adding a new quest also requires a new component.',
          claims: [
            {
              text: 'The play page narrows the challenge union with @if chains on kind',
              supported: true,
              why: 'Template type-checking narrows `c` inside each `@if (c.kind === …)` block, so `[challenge]="c"` type-checks.',
            },
            {
              text: 'Engines talk to the page through a shared service rather than outputs',
              supported: false,
              why: 'Each engine has `completed = output<ChallengeResult>()`; the page listens with `(completed)`.',
            },
            {
              text: 'Adding a new mechanic means adding an engine and a branch in the play page',
              supported: true,
              why: 'Plus a union member in the models. That is the whole extension point.',
            },
            {
              text: 'Adding a new quest requires a new component',
              supported: false,
              why: 'Quests are data objects in the content files, rendered by the existing engines.',
            },
          ],
        },
        {
          context:
            'Tests: 199 Vitest tests. Domain logic is pure and written test-first without TestBed. Component tests use setInput and whenStable. The production build is the only full check of every template.',
          answer:
            'ng test type-checks every template in the app. Domain rules such as progression, streak and badges are tested without TestBed. whenStable is awaited because zoneless change detection is scheduled asynchronously. A page without a spec can still ship a template error that only ng build catches.',
          claims: [
            {
              text: 'ng test type-checks every template in the app',
              supported: false,
              why: 'Only components imported by a spec are compiled. A spec-less page is checked by ng build alone.',
            },
            {
              text: 'Domain rules are tested without TestBed',
              supported: true,
              why: 'Pure functions, plain Vitest, red before green.',
            },
            {
              text: 'whenStable is awaited because zoneless change detection is scheduled asynchronously',
              supported: true,
              why: 'A signal change or a click schedules a refresh; awaiting whenStable lets it run before asserting on the DOM.',
            },
            {
              text: 'A page without a spec can ship a template error that only ng build catches',
              supported: true,
              why: 'It happened to RAG Quest with a missing LowerCasePipe import.',
            },
          ],
        },
      ],
    },
  },
];
