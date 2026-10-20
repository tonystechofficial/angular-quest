import { Level } from '../core/models';

export const SIGNALS_LEVELS: Level[] = [
  {
    id: 'signal-lab',
    world: 'signals',
    title: 'Signal Lab',
    tagline: 'Predict what recomputes, then run the graph.',
    concept: 'signal · computed · effect semantics',
    minutes: 6,
    xp: 100,
    story:
      'The Observatory projects the dependency graph of a component on the wall. Nia sets a signal and asks you, before anything moves: what will run?',
    hint: 'A computed only recomputes if it is read AND a producer changed. If its new value equals the old one, nothing downstream notices. Effects only track what they read outside untracked().',
    takeaway:
      'Signals notify consumers only when the value changes (Object.is). Computeds are lazy and memoized: they recompute on read when a producer changed, and ' +
      'an unchanged result stops the cascade. Diamonds recompute each node once. Effects re-run for tracked reads only; `untracked()` reads are invisible to them.',
    challenge: {
      kind: 'signal-lab',
      intro:
        'Each scenario shows a small signal graph and the Angular code it stands for. Click the computeds you expect to recompute and the effects you expect to run, ' +
        'then run the simulation. It uses a tiny reimplementation of signal semantics.',
      rounds: [
        {
          prompt: 'qty goes from 2 to 3, and the template renders label().',
          code:
            'const price = signal(10);\n' +
            'const qty = signal(2);\n' +
            'const total = computed(() => price() * qty());\n' +
            'const label = computed(() => `Total: ${total()}`);\n' +
            'effect(() => console.log(label()));\n\n' +
            'qty.set(3);',
          nodes: [
            { id: 'price', kind: 'signal', value: 10, x: 80, y: 70 },
            { id: 'qty', kind: 'signal', value: 2, x: 80, y: 190 },
            {
              id: 'total',
              kind: 'computed',
              deps: ['price', 'qty'],
              compute: (v) => Number(v['price']) * Number(v['qty']),
              x: 250,
              y: 130,
            },
            {
              id: 'label',
              kind: 'computed',
              deps: ['total'],
              compute: (v) => `Total: ${v['total']}`,
              x: 420,
              y: 130,
            },
            { id: 'log', kind: 'effect', deps: ['label'], x: 574, y: 130 },
          ],
          action: { id: 'qty', value: 3 },
          reads: ['label'],
          explanation:
            'total recomputes (20 → 30) because it is read and qty changed; label recomputes because total changed; the effect re-runs because label changed. A full cascade.',
        },
        {
          prompt: 'qty is set to 2 — the value it already has. The template renders label().',
          code:
            'const price = signal(10);\n' +
            'const qty = signal(2);\n' +
            'const total = computed(() => price() * qty());\n' +
            'const label = computed(() => `Total: ${total()}`);\n' +
            'effect(() => console.log(label()));\n\n' +
            'qty.set(2); // same value',
          nodes: [
            { id: 'price', kind: 'signal', value: 10, x: 80, y: 70 },
            { id: 'qty', kind: 'signal', value: 2, x: 80, y: 190 },
            {
              id: 'total',
              kind: 'computed',
              deps: ['price', 'qty'],
              compute: (v) => Number(v['price']) * Number(v['qty']),
              x: 250,
              y: 130,
            },
            {
              id: 'label',
              kind: 'computed',
              deps: ['total'],
              compute: (v) => `Total: ${v['total']}`,
              x: 420,
              y: 130,
            },
            { id: 'log', kind: 'effect', deps: ['label'], x: 574, y: 130 },
          ],
          action: { id: 'qty', value: 2 },
          reads: ['label'],
          explanation:
            'Signals compare with Object.is. An equal value changes nothing: no version bump, no recomputation, no effect, no render. Setting a signal is not the same as changing it.',
        },
        {
          prompt: 'n goes from 5 to 7. The template renders msg().',
          code:
            'const n = signal(5);\n' +
            'const isEven = computed(() => n() % 2 === 0);\n' +
            "const msg = computed(() => (isEven() ? 'even' : 'odd'));\n" +
            'effect(() => (document.title = msg()));\n\n' +
            'n.set(7);',
          nodes: [
            { id: 'n', kind: 'signal', value: 5, x: 80, y: 130 },
            {
              id: 'isEven',
              kind: 'computed',
              deps: ['n'],
              compute: (v) => Number(v['n']) % 2 === 0,
              x: 250,
              y: 130,
            },
            {
              id: 'msg',
              kind: 'computed',
              deps: ['isEven'],
              compute: (v) => (v['isEven'] ? 'even' : 'odd'),
              x: 420,
              y: 130,
            },
            { id: 'show', kind: 'effect', deps: ['msg'], x: 574, y: 130 },
          ],
          action: { id: 'n', value: 7 },
          reads: ['msg'],
          explanation:
            'isEven recomputes because n changed, but 7 is as odd as 5: its value stays false, its version does not move, so msg is NOT recomputed and the effect does not run. Equality checks stop cascades early.',
        },
        {
          prompt: 'a goes from 1 to 5 in a diamond. The template renders d().',
          code:
            'const a = signal(1);\n' +
            'const b = computed(() => a() * 2);\n' +
            'const c = computed(() => a() + 1);\n' +
            'const d = computed(() => b() + c());\n' +
            'effect(() => console.log(d()));\n\n' +
            'a.set(5);',
          nodes: [
            { id: 'a', kind: 'signal', value: 1, x: 80, y: 130 },
            {
              id: 'b',
              kind: 'computed',
              deps: ['a'],
              compute: (v) => Number(v['a']) * 2,
              x: 250,
              y: 60,
            },
            {
              id: 'c',
              kind: 'computed',
              deps: ['a'],
              compute: (v) => Number(v['a']) + 1,
              x: 250,
              y: 200,
            },
            {
              id: 'd',
              kind: 'computed',
              deps: ['b', 'c'],
              compute: (v) => Number(v['b']) + Number(v['c']),
              x: 420,
              y: 130,
            },
            { id: 'log', kind: 'effect', deps: ['d'], x: 574, y: 130 },
          ],
          action: { id: 'a', value: 5 },
          reads: ['d'],
          explanation:
            'b, c and d each recompute exactly once, in dependency order: d is evaluated only after both b and c are fresh. No intermediate "glitch" with a stale b.',
        },
        {
          prompt: 'theme changes, but the effect reads it inside untracked(). Nothing is rendered.',
          code:
            "const user = signal('ada');\n" +
            "const theme = signal('dark');\n" +
            'effect(() => {\n' +
            '  console.log(user(), untracked(() => theme()));\n' +
            '});\n\n' +
            "theme.set('light');",
          nodes: [
            { id: 'user', kind: 'signal', value: 'ada', x: 80, y: 70 },
            { id: 'theme', kind: 'signal', value: 'dark', x: 80, y: 190 },
            {
              id: 'save',
              kind: 'effect',
              deps: ['user'],
              untrackedDeps: ['theme'],
              x: 330,
              y: 130,
            },
          ],
          action: { id: 'theme', value: 'light' },
          reads: [],
          explanation:
            'untracked() reads the current value without subscribing. The effect depends on user only, so a theme change does not re-run it. This is how RAG Quest resets page state inside an effect without tracking that state.',
        },
      ],
    },
  },
  {
    id: 'reactive-primitives',
    world: 'signals',
    title: 'signal, computed, effect or linkedSignal?',
    tagline: 'Pick the right primitive for each piece of state.',
    concept: 'Choosing a reactive primitive',
    minutes: 3,
    xp: 100,
    story:
      'A new feature branch declares everything as effects. Nia wants each piece of state assigned to the primitive it deserves.',
    hint: 'Source of truth → signal. Derived from other signals → computed. Something that happens in the outside world → effect. Editable but reset by a source → linkedSignal.',
    takeaway:
      'State you own is a `signal`. State derived from other state is a `computed` — never an effect writing a signal. Side effects on the outside world ' +
      '(storage, title, logging, DOM APIs) are `effect`s. A value the user edits but that must reset when its source changes is a `linkedSignal`.',
    challenge: {
      kind: 'bucket-sort',
      intro: 'Sort each need into the primitive you would use in RAG Quest.',
      buckets: [
        { id: 'signal', name: 'signal()', hint: 'Writable source of truth' },
        { id: 'computed', name: 'computed()', hint: 'Derived, memoized, read-only' },
        { id: 'effect', name: 'effect()', hint: 'Side effect when tracked signals change' },
        { id: 'linked', name: 'linkedSignal()', hint: 'Writable, resets from a source' },
      ],
      cards: [
        {
          id: 'selected',
          text: 'The option index selected in the current quiz round',
          bucket: 'signal',
          why: 'Owned, written by clicks: a plain writable signal.',
        },
        {
          id: 'xp',
          text: 'Total XP summed over every saved result',
          bucket: 'computed',
          why: 'Pure derivation of the results signal; memoized until results change.',
        },
        {
          id: 'persist',
          text: 'Write the progress to localStorage whenever it changes',
          bucket: 'effect',
          why: 'The outside world (storage) is a side effect. RAG Quest does it in the mutation method instead, which is also fine; an effect is the reactive form.',
        },
        {
          id: 'islast',
          text: 'Whether the current round is the last one',
          bucket: 'computed',
          why: '`index() >= total() - 1`: derived from two signals.',
        },
        {
          id: 'query',
          text: 'The text typed in the glossary search box',
          bucket: 'signal',
          why: 'User input is a source of truth.',
        },
        {
          id: 'title',
          text: 'Set document.title when the quest changes',
          bucket: 'effect',
          why: 'The document title is outside Angular: an effect reading the level signal.',
        },
        {
          id: 'draft',
          text: 'An editable copy of an input value that resets when the input changes',
          bucket: 'linked',
          why: 'The textbook linkedSignal: `linkedSignal(() => this.value())`, then `.set` locally.',
        },
        {
          id: 'filtered',
          text: 'The glossary entries filtered by the current query',
          bucket: 'computed',
          why: 'Derived from entries and query; recomputed only when the query changes.',
        },
        {
          id: 'toasts',
          text: 'The toasts currently displayed',
          bucket: 'signal',
          why: 'A list the service pushes to and removes from: owned state.',
        },
        {
          id: 'log',
          text: 'Log every badge unlock to the console',
          bucket: 'effect',
          why: 'Logging is a side effect of the badges signal changing.',
        },
        {
          id: 'name',
          text: 'A name field pre-filled from the saved player name, editable before saving',
          bucket: 'linked',
          why: 'Starts from a source, stays editable, resets if the source changes: linkedSignal.',
        },
      ],
    },
  },
  {
    id: 'signal-reads',
    world: 'signals',
    title: 'Find the Signal Reads',
    tagline: 'Which template expressions actually subscribe?',
    concept: 'Reactive reads in templates',
    minutes: 4,
    xp: 100,
    story:
      'A template re-renders on every click and Nia suspects nobody knows which expressions are reactive. Prove you do.',
    hint: 'A signal read is a call to a signal or computed: `count()`, `level().title`, `progress.nextQuest()`. Method calls, output emits and plain fields are not reads.',
    takeaway:
      'Only calls to signals and computeds create dependencies: `phase()`, `level().title`, `service.total()`. A method call like `check()`, an `emit()` ' +
      'or a plain property creates none. Under zoneless, the set of signal reads in a template is exactly what can refresh it.',
    challenge: {
      kind: 'token-select',
      intro:
        'Click every expression that reads a signal or a computed. The class members are listed in the prompt.',
      labels: [{ id: 'read', name: 'Signal read' }],
      mono: true,
      rounds: [
        {
          prompt:
            "Class: level = input.required<Level>() · phase = signal('answer') · locked = computed(…) · letters = ['A', 'B'] · check() is a method.",
          tokens: [
            '{{ level().title }}',
            '[class.selected]="phase() === \'answer\'"',
            '(click)="check()"',
            '{{ letters[0] }}',
            '[disabled]="locked()"',
            '{{ level().xp }} XP',
          ],
          answers: { 0: 'read', 1: 'read', 4: 'read', 5: 'read' },
          explanation:
            '`level()`, `phase()` and `locked()` are signal reads. `check()` is a method invoked by an event, not a dependency; `letters[0]` is a plain field.',
        },
        {
          prompt:
            'Class: outcome = input.required<RecordOutcome>() · result = input.required<ChallengeResult>() · retry = output<void>() · isBoss = computed(…) · next = computed(…) · mentorName is a string field · progress.nextQuest is a computed on the service.',
          tokens: [
            '{{ outcome().stars }}',
            '{{ result().summary }}',
            '(click)="retry.emit()"',
            '@if (isBoss()) { … }',
            '{{ mentorName }}',
            '@if (next(); as n) { … }',
            '{{ progress.nextQuest()?.title }}',
          ],
          answers: { 0: 'read', 1: 'read', 3: 'read', 5: 'read', 6: 'read' },
          explanation:
            'Inputs, computeds and a computed on an injected service are all reads. `retry.emit()` fires an output, `mentorName` is static text.',
        },
      ],
    },
  },
  {
    id: 'refactor-to-signals',
    world: 'signals',
    title: 'Refactor to Signals',
    tagline: 'From plain fields and observables to signals.',
    concept: 'Migrating state to signals',
    minutes: 4,
    xp: 100,
    story: 'Three legacy snippets block the zoneless migration. Nia hands you the blanks.',
    hint: 'A mutable field becomes a signal, mutation becomes set/update, an observable crosses the border with toSignal, and a reaction with side effects is an effect.',
    takeaway:
      'Migrating to signals: fields become `signal()`, mutations become `.set` / `.update`, derived values become `computed`, observables cross the boundary ' +
      'with `toSignal`, and reactions with side effects become `effect` (with `untracked` around writes that must not be tracked).',
    challenge: {
      kind: 'cloze',
      intro: 'Complete each refactoring.',
      rounds: [
        {
          prompt: 'A counter: before, a plain field incremented in place.',
          code:
            '// before: count = 0;  increment() { this.count++; }\n\n' +
            'readonly count = [[1]](0);\n' +
            'increment() {\n' +
            '  this.count.[[2]]((c) => c + 1);\n' +
            '}\n' +
            '// template: <p>{{ count[[3]] }}</p>',
          blanks: [
            {
              options: ['signal', 'computed', 'ref', 'state'],
              answer: 'signal',
              why: 'Owned, writable state is a signal.',
            },
            {
              options: ['update', 'set', 'next', 'push'],
              answer: 'update',
              why: '`update` derives the new value from the old one; `set` replaces it with a known value.',
            },
            {
              options: ['()', '', '.value', '.get()'],
              answer: '()',
              why: 'Read the signal in the template with parentheses.',
            },
          ],
          explanation:
            'signal → update → read with (). Under zoneless, `this.count++` on a plain field would never refresh the view.',
        },
        {
          prompt: 'An HTTP observable consumed by a template.',
          code:
            "readonly user$ = this.http.get<User>('/me');\n" +
            'readonly user = [[1]](this.user$); // Signal<User | undefined>\n' +
            "readonly greeting = [[2]](() => `Hi ${this.user()?.name ?? 'stranger'}`);",
          blanks: [
            {
              options: ['toSignal', 'toObservable', 'signal', 'firstValueFrom'],
              answer: 'toSignal',
              why: '`toSignal` subscribes and exposes the latest emission as a signal (undefined until the first value, unless an initialValue is given).',
            },
            {
              options: ['computed', 'effect', 'signal', 'linkedSignal'],
              answer: 'computed',
              why: 'A greeting derived from the user is a computed; it updates when the user signal does.',
            },
          ],
          explanation:
            'Bridge observables at the boundary with toSignal, then stay in signal land with computed. No `| async`, no manual subscription.',
        },
        {
          prompt:
            'The play page of RAG Quest resets its state and the document title when the level changes.',
          code:
            'constructor() {\n' +
            '  [[1]](() => {\n' +
            '    const level = this.level();\n' +
            '    [[2]](() => {\n' +
            '      this.result.set(null);\n' +
            "      this.titleService.setTitle(level ? `${level.title} · Quest` : 'Quest');\n" +
            '    });\n' +
            '  });\n' +
            '}',
          blanks: [
            {
              options: ['effect', 'computed', 'afterRender', 'ngOnInit'],
              answer: 'effect',
              why: 'Reacting to a signal change with side effects (title, state reset) is what effect is for.',
            },
            {
              options: ['untracked', 'computed', 'signal', 'queueMicrotask'],
              answer: 'untracked',
              why: 'The reset writes signals and reads none that should re-trigger the effect; untracked keeps the dependency list to `level` only.',
            },
          ],
          explanation:
            "Track what should trigger (the level), untrack the reaction. This is the exact code of RAG Quest's play page.",
        },
      ],
    },
  },
  {
    id: 'zoneless-detective',
    world: 'signals',
    title: 'Zoneless Detective',
    tagline: 'What refreshes the view when zone.js is gone?',
    concept: 'Zoneless change detection',
    minutes: 5,
    xp: 100,
    story:
      'Three pull requests describe how their components update. Two descriptions are wrong, and the author is convinced. Review them.',
    hint: 'Under zoneless, a view refreshes when a signal it reads changes, when a template-bound event handler runs, or when something calls markForCheck. Timers and promises alone refresh nothing.',
    takeaway:
      'Without zone.js, Angular refreshes a view when a signal read by its template changes, when a template-bound event handler runs, or when ' +
      '`markForCheck` is called (also when inputs change). A plain field mutated by a timer or an HTTP callback updates nothing — which is why state lives in signals.',
    challenge: {
      kind: 'claim-check',
      intro: 'Read the component and the PR description. Tick every statement that is wrong.',
      contextLabel: 'Known facts',
      answerLabel: "Author's PR description",
      rounds: [
        {
          code:
            "@Component({ selector: 'app-timer', template: `<p>{{ seconds }} s</p>` })\n" +
            'export class Timer {\n' +
            '  seconds = 0;\n' +
            '  constructor() {\n' +
            '    setInterval(() => this.seconds++, 1000);\n' +
            '  }\n' +
            '}',
          context:
            'The app is bootstrapped without zone.js (zoneless change detection, the default for new Angular projects).',
          answer:
            'The timer shows the elapsed seconds, updating every second. If it ever stops updating, converting `seconds` to a signal or calling markForCheck in the interval would fix it; zone.js is not needed.',
          claims: [
            {
              text: 'The seconds counter updates every second in the UI',
              supported: false,
              why: 'A plain field changed by a timer marks nothing dirty. The view keeps showing 0 until something else triggers a check.',
            },
            {
              text: 'Converting `seconds` to a signal would make it update',
              supported: true,
              why: '`seconds = signal(0)` + `update` notifies the template, which schedules a refresh.',
            },
            {
              text: 'Calling ChangeDetectorRef.markForCheck() inside the interval would make it update',
              supported: true,
              why: 'markForCheck schedules a check under zoneless too. Signals are cleaner, but this works.',
            },
            {
              text: 'With zone.js this component would have updated automatically',
              supported: true,
              why: 'Zone.js patches setInterval and runs change detection after each callback — the behaviour everyone used to rely on.',
            },
          ],
        },
        {
          code:
            '@Component({ template: `<button (click)="add()">Add</button> {{ items.length }}` })\n' +
            'export class Cart {\n' +
            '  items: string[] = [];\n' +
            "  add() { this.items.push('x'); }\n" +
            '}',
          context: 'Zoneless change detection. `items` is a plain array mutated in place.',
          answer:
            'Clicking Add never updates the count because items is not a signal. Making items a signal would fix it, and would also cover updates coming from timers or HTTP callbacks.',
          claims: [
            {
              text: 'Clicking Add never updates the count',
              supported: false,
              why: 'A template-bound event handler marks the view for refresh: after `add()`, `items.length` is re-read and shows 1. Signals are not the only trigger.',
            },
            {
              text: 'Event handlers bound in the template trigger a refresh even without signals',
              supported: true,
              why: 'Yes: the listener wrapper marks the component dirty and schedules change detection.',
            },
            {
              text: 'Making `items` a signal would also cover changes coming from timers or HTTP callbacks',
              supported: true,
              why: 'Those paths have no event handler; only a signal (or markForCheck) refreshes the view from them.',
            },
          ],
        },
        {
          code:
            '@Component({\n' +
            '  changeDetection: ChangeDetectionStrategy.OnPush,\n' +
            '  template: `{{ user().name }}`,\n' +
            '})\n' +
            'export class Profile {\n' +
            '  readonly user = input.required<User>();\n' +
            '}\n' +
            '// parent template: <app-profile [user]="currentUser()" />',
          context: 'The parent holds `currentUser = signal<User>(…)`. Zoneless change detection.',
          answer:
            'OnPush means the profile never updates when currentUser changes, so Default strategy is required here. Mutating the user object in place (currentUser().name = "x") updates the view.',
          claims: [
            {
              text: 'An OnPush component updates when its input receives a new value',
              supported: true,
              why: 'A new input reference marks the component for check; that is the contract of OnPush.',
            },
            {
              text: 'Default strategy is required for the profile to update',
              supported: false,
              why: 'OnPush is fine: `currentUser.set(newUser)` changes the input, which refreshes the profile.',
            },
            {
              text: 'Mutating the current user object in place updates the view',
              supported: false,
              why: 'The signal is not set (same reference, no notification) and the input is unchanged. Replace the object: `currentUser.set({ ...u, name })`.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'reactivity-exam',
    world: 'signals',
    title: 'Reactivity Exam',
    tagline: 'The Observatory review: seven questions, no simulator.',
    concept: 'Signals, end to end',
    minutes: 5,
    xp: 100,
    story: 'Wing review. Nia closes the projector and asks the questions she asks every candidate.',
    hint: 'Laziness, equality, computed for derivation, untracked for silent reads, and the three zoneless triggers. Everything you saw in the lab.',
    takeaway:
      'Computeds are lazy (never evaluated until read) and memoized; equal values stop propagation; derivation belongs in computed, side effects in effect; ' +
      '`untracked` reads silently; `linkedSignal` is the editable-copy pattern; under zoneless only signals, template events and markForCheck refresh a view.',
    challenge: {
      kind: 'mcq',
      intro: 'Seven questions. Explanations after each.',
      questions: [
        {
          prompt: 'How many times has the function passed to `computed` run at this point?',
          code: 'const a = signal(1);\nconst b = computed(() => a() * 2);\na.set(5);\n// nobody has read b() yet',
          options: ['0', '1', '2', '5'],
          answer: 0,
          explanation:
            'Computeds are lazy: the function runs on the first read, never at creation, and not on producer changes either.',
        },
        {
          prompt: 'Calling `count.set(count())` — setting the value it already has — will…',
          options: [
            're-render the template',
            'do nothing: equal values are ignored',
            'throw in development mode',
            'schedule every effect',
          ],
          answer: 1,
          explanation:
            'Writable signals compare with Object.is (customizable with `equal`). No change, no notification.',
        },
        {
          prompt: 'Where does a value derived from other state belong?',
          options: [
            'In an effect that writes another signal',
            'In a computed',
            'In the constructor',
            'In ngOnChanges',
          ],
          answer: 1,
          explanation:
            'computed is memoized and glitch-free. An effect writing a signal introduces an extra pass and ordering issues; Angular discourages it.',
        },
        {
          prompt: '`untracked(() => theme())` inside an effect…',
          options: [
            'makes theme read-only',
            'reads theme without making the effect depend on it',
            'runs the effect twice',
            'caches theme forever',
          ],
          answer: 1,
          explanation:
            'untracked reads the current value outside the reactive context: the effect will not re-run when theme changes.',
        },
        {
          prompt: 'Under zoneless change detection, which of these does NOT refresh a view?',
          options: [
            'A (click) handler bound in the template',
            'A change of a signal read by the template',
            'A plain field mutated inside a setTimeout callback',
            'ChangeDetectorRef.markForCheck()',
          ],
          answer: 2,
          explanation:
            'Timers are not patched anymore. Without a signal, an event handler or markForCheck, Angular has no reason to check the view.',
        },
        {
          prompt: '`linkedSignal` is the right tool when…',
          options: [
            'you need a side effect',
            'you need a writable value that resets when a source signal changes',
            'you need an input',
            'you need RxJS interop',
          ],
          answer: 1,
          explanation:
            'The "editable copy" pattern: `linkedSignal(() => this.source())` stays writable and snaps back when the source changes.',
        },
        {
          prompt:
            'In a diamond where d = computed(() => b() + c()) and both b and c derive from a: after a.set(…) and one read of d(), how many times does d recompute?',
          options: ['2', '0', '1', 'It depends on the order of declaration'],
          answer: 2,
          explanation:
            'Angular refreshes producers before consumers, so d sees fresh b and c and computes once. No glitches, no double work.',
        },
      ],
    },
  },
];
