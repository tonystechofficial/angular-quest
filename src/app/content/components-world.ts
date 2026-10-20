import { Level } from '../core/models';

export const COMPONENTS_LEVELS: Level[] = [
  {
    id: 'component-anatomy',
    world: 'components',
    title: 'Anatomy of a Component',
    tagline: 'Fill the blanks of three real RAG Quest components.',
    concept: 'Standalone components',
    minutes: 4,
    xp: 100,
    story:
      'Nia opens the smallest component of RAG Quest, the three stars. Someone replaced half the keywords with holes.',
    hint: 'Every blank is one of the modern Angular functions: inputs are functions, derived values are computed, templates only use what imports lists.',
    takeaway:
      'A modern component is a class with a `@Component` decorator holding `selector`, `imports` and `template`. Inputs are signals ' +
      '(`input()`, `input.required()`), outputs are `output()`, derived values are `computed()`. Everything is read with parentheses.',
    challenge: {
      kind: 'cloze',
      intro:
        'Pick the right identifier for each blank. The snippets are lifted from RAG Quest, blanks included.',
      rounds: [
        {
          prompt: 'The Stars component shows three stars, the first `count` of them lit.',
          code:
            "import { Component, [[1]] } from '@angular/core';\n\n" +
            '@Component({\n' +
            "  selector: 'app-stars',\n" +
            '  template: `\n' +
            '    <span class="stars">\n' +
            '      @for (i of [1, 2, 3]; [[2]] i) {\n' +
            '        <span [class.off]="i > count[[3]]">★</span>\n' +
            '      }\n' +
            '    </span>\n' +
            '  `,\n' +
            '})\n' +
            'export class Stars {\n' +
            '  readonly count = [[4]]<number>();\n' +
            '}',
          blanks: [
            {
              options: ['input', 'Input', 'signal', 'inject'],
              answer: 'input',
              why: 'Signal inputs come from the lowercase `input` function; the `@Input()` decorator is the legacy API.',
            },
            {
              options: ['track', 'trackBy', 'key', 'index'],
              answer: 'track',
              why: '`@for` requires a `track` expression. For a static list of numbers the value itself is a fine key.',
            },
            {
              options: ['()', '.value', '', '$'],
              answer: '()',
              why: 'A signal input is a function: read it with parentheses, in templates as in the class.',
            },
            {
              options: ['input.required', 'input', 'signal', 'computed'],
              answer: 'input.required',
              why: '`input.required<number>()` forces the parent to bind it and types the value as `number`, not `number | undefined`.',
            },
          ],
          explanation:
            'Four blanks carry the modern component: import `input`, iterate with `@for … track`, read the signal with `()`, declare a required input.',
        },
        {
          prompt: 'The result panel of a quest: an input, an output and a derived value.',
          code:
            '@Component({\n' +
            "  selector: 'app-result-panel',\n" +
            '  [[1]]: [RouterLink, Stars],\n' +
            '  template: `\n' +
            '    <app-stars [count]="outcome().stars" />\n' +
            '    <a [routerLink]="[\'/world\', level().world]">Wing map</a>\n' +
            '    <button type="button" (click)="retry.[[2]]()">Retry</button>\n' +
            '  `,\n' +
            '})\n' +
            'export class ResultPanel {\n' +
            '  readonly level = input.required<Level>();\n' +
            '  readonly outcome = input.required<RecordOutcome>();\n' +
            '  readonly retry = [[3]]<void>();\n' +
            '  readonly next = [[4]](() => nextLevel(this.level().id));\n' +
            '}',
          blanks: [
            {
              options: ['imports', 'declarations', 'providers', 'dependencies'],
              answer: 'imports',
              why: 'A standalone component lists the components, directives and pipes its template uses in `imports`. `declarations` belongs to NgModules.',
            },
            {
              options: ['emit', 'next', 'fire', 'trigger'],
              answer: 'emit',
              why: 'An `output()` is fired with `.emit(value)`; here the payload is `void`.',
            },
            {
              options: ['output', 'EventEmitter', 'signal', 'input'],
              answer: 'output',
              why: '`output<void>()` is the function-based output; `@Output() x = new EventEmitter()` is the legacy form.',
            },
            {
              options: ['computed', 'signal', 'effect', 'input'],
              answer: 'computed',
              why: 'A value derived from another signal is a `computed`: memoized, lazy, read as `next()`.',
            },
          ],
          explanation:
            'imports for the template, output + emit for events, computed for derived state. No module, no decorator properties.',
        },
        {
          prompt: 'Bindings on a multiple-choice option button.',
          code:
            'template: `\n' +
            '  <button\n' +
            '    type="button"\n' +
            '    class="option"\n' +
            '    [[[1]].selected]="selected() === $index"\n' +
            '    [[[2]].aria-checked]="selected() === $index"\n' +
            '    [disabled]="phase() === \'feedback\'"\n' +
            '    [[3]]="selected.set($index)"\n' +
            '  >\n' +
            '    <span class="progress"><span [[[4]].width.%]="progressPct()"></span></span>\n' +
            '  </button>\n' +
            '`',
          blanks: [
            {
              options: ['class', 'ngClass', 'css', 'style'],
              answer: 'class',
              why: '`[class.name]="bool"` toggles one class without any directive; `[ngClass]` needs an import and an object.',
            },
            {
              options: ['attr', 'aria', 'prop', 'bind'],
              answer: 'attr',
              why: 'ARIA attributes are not DOM properties: bind them with the `attr.` prefix.',
            },
            {
              options: ['(click)', 'onClick', '@click', '[click]'],
              answer: '(click)',
              why: 'Parentheses bind an event, square brackets bind a property.',
            },
            {
              options: ['style', 'css', 'attr', 'class'],
              answer: 'style',
              why: '`[style.width.%]` sets a style with a unit suffix; Angular appends the `%`.',
            },
          ],
          explanation:
            'Property `[x]`, event `(x)`, class `[class.x]`, attribute `[attr.x]`, style with unit `[style.x.unit]`. That is the whole binding alphabet.',
        },
      ],
    },
  },
  {
    id: 'control-flow',
    world: 'components',
    title: 'Control Flow Sorter',
    tagline: '@if, @for, @switch, @let — or a fossil?',
    concept: 'Built-in control flow',
    minutes: 3,
    xp: 100,
    story:
      'The template linter flagged fourteen structural directives in one file. Nia wants them sorted before anything is rewritten.',
    hint: 'Blocks start with @ and are part of the template language; anything with a * prefix or an [ngSomething] directive is the legacy form.',
    takeaway:
      'Since Angular 17 the control flow is built into the template language: `@if … @else`, `@for … track … @empty`, `@switch`, and `@let` ' +
      'for a local variable. No import, better type narrowing, and `track` is mandatory so the diffing strategy is always explicit.',
    challenge: {
      kind: 'bucket-sort',
      intro: 'Sort each template fragment into the block it belongs to, or into the legacy pile.',
      mono: true,
      buckets: [
        { id: 'if', name: '@if', hint: 'A condition, optionally aliased with `as`' },
        { id: 'for', name: '@for', hint: 'Iteration with a mandatory track' },
        { id: 'switch', name: '@switch', hint: 'One of several cases' },
        { id: 'let', name: '@let', hint: 'A template-local variable' },
        {
          id: 'legacy',
          name: 'Legacy directive',
          hint: 'Pre-v17 syntax, still works, not recommended',
        },
      ],
      cards: [
        {
          id: 'if-as',
          text: '@if (result(); as res) { … } @else { … }',
          bucket: 'if',
          why: 'The `as` alias stores the value so the signal is called once.',
        },
        {
          id: 'for-empty',
          text: '@for (level of levels(); track level.id) { … } @empty { … }',
          bucket: 'for',
          why: 'Tracking by a stable id; `@empty` renders when the list is empty.',
        },
        {
          id: 'switch-kind',
          text: "@switch (c.kind) { @case ('mcq') { … } @default { … } }",
          bucket: 'switch',
          why: 'Multi-way branching on one expression.',
        },
        {
          id: 'let-total',
          text: '@let total = price() * qty();',
          bucket: 'let',
          why: 'Declares a variable for the rest of the template; re-evaluated when its signals change.',
        },
        {
          id: 'ngif',
          text: '<div *ngIf="ready; else loading">',
          bucket: 'legacy',
          why: '`*ngIf` needs `NgIf` imported and an `else` template reference. `@if … @else` replaces it.',
        },
        {
          id: 'ngfor',
          text: '<li *ngFor="let item of items; trackBy: byId">',
          bucket: 'legacy',
          why: 'Needs `NgFor` and a `trackBy` method; `@for … track` is built in.',
        },
        {
          id: 'for-stars',
          text: '@for (i of [1, 2, 3]; track i) { ★ }',
          bucket: 'for',
          why: 'A literal list still needs `track`; the value itself is fine here.',
        },
        {
          id: 'if-else-if',
          text: "@if (phase() === 'answer') { … } @else if (phase() === 'feedback') { … }",
          bucket: 'if',
          why: '`@else if` chains without nesting.',
        },
        {
          id: 'ngswitch',
          text: '<div [ngSwitch]="kind"><p *ngSwitchCase="\'mcq\'">…</p></div>',
          bucket: 'legacy',
          why: 'Three directives to import (`NgSwitch`, `NgSwitchCase`, `NgSwitchDefault`); `@switch` needs none.',
        },
        {
          id: 'let-hinted',
          text: '@let hinted = showHint();',
          bucket: 'let',
          why: 'A readable name for a signal read used several times below.',
        },
      ],
    },
  },
  {
    id: 'template-bugs',
    world: 'components',
    title: 'Spot the Template Bug',
    tagline: 'Three files, five bugs, one compiler that caught only some.',
    concept: 'Template type-checking & signal reads',
    minutes: 5,
    xp: 100,
    story:
      'The intern pushed three components on Friday evening. Two compile, one does not, none of them works. Nia hands you the diff.',
    hint: 'Ask of every expression: is this a signal that needs parentheses? Is this directive or pipe imported? Does this handler actually call the method?',
    takeaway:
      'The three classic template bugs: a signal read without `()`, a directive or pipe used without being imported (a compile error, e.g. ' +
      '"No pipe found with name"), and an event handler that names a method without calling it. Strict templates catch the typed ones; the others ' +
      'show up as a page that renders a function or a button that does nothing.',
    challenge: {
      kind: 'code-select',
      intro:
        'Click every line that contains a bug. Click again to unflag. Lines that merely look odd are not bugs.',
      labels: [{ id: 'bug', name: 'Bug' }],
      rounds: [
        {
          prompt: 'A counter with a derived value.',
          lines: [
            '@Component({',
            "  selector: 'app-counter',",
            '  template: `',
            '    <p>Count: {{ count }}</p>',
            '    <p>Double: {{ double() }}</p>',
            '    @for (item of items(); track item.id) {',
            '      <li>{{ item.name }}</li>',
            '    }',
            '    <button (click)="count.set(count() + 1)">+1</button>',
            '  `,',
            '})',
            'export class Counter {',
            '  readonly count = signal(0);',
            '  readonly double = computed(() => this.count * 2);',
            '  readonly items = signal<Item[]>([]);',
            '}',
          ],
          answers: { 3: 'bug', 13: 'bug' },
          notes: {
            3: '`count` is a signal: without parentheses the template prints the function itself. Angular even has a diagnostic for it (interpolated signal not invoked).',
            13: 'Inside a computed, read the signal with `this.count()`. Multiplying the function gives NaN, and TypeScript flags the type.',
          },
          explanation:
            'Signals are functions everywhere: in templates and in the class. The `@for` with `track item.id` and the `(click)` handler are correct.',
        },
        {
          prompt: 'A level list using a child component, a router link and a pipe.',
          lines: [
            '@Component({',
            "  selector: 'app-level-list',",
            '  imports: [Stars],',
            '  template: `',
            '    @for (level of levels(); track $index) {',
            '      <app-stars [count]="starsFor(level.id)" />',
            '      <a [routerLink]="[\'/play\', level.id]">{{ level.title }}</a>',
            '      <span>{{ level.minutes | number }} min</span>',
            '    }',
            '  `,',
            '})',
            'export class LevelList {',
            '  readonly levels = input.required<Level[]>();',
            '  private readonly progress = inject(ProgressService);',
            '  starsFor(id: string): number {',
            '    return this.progress.results()[id]?.stars ?? 0;',
            '  }',
            '}',
          ],
          answers: { 6: 'bug', 7: 'bug' },
          notes: {
            6: '`[routerLink]` is a directive. Without `RouterLink` in `imports`, the compiler says it cannot bind to `routerLink` on an `<a>`.',
            7: 'The `number` pipe is `DecimalPipe`. Not imported → "No pipe found with name number" at build time. RAG Quest hit exactly this with `lowercase`.',
          },
          explanation:
            'Both bugs are missing imports, both are compile errors. `track $index` is not a bug, but a smell: tracking entities by index recreates DOM when the list reorders — prefer `track level.id`.',
        },
        {
          prompt: 'A hint box with a checkbox and a class binding.',
          lines: [
            '@Component({',
            "  selector: 'app-hint',",
            '  template: `',
            '    <button type="button" (click)="askNia">Ask Nia</button>',
            '    @if (showHint()) {',
            '      <p class="hint">{{ level().hint }}</p>',
            '    }',
            '    <input type="checkbox" [checked]="freePlay()" (change)="setFreePlay($event.target.checked)" />',
            '    <div [class]="{ active: showHint() }"></div>',
            '  `,',
            '})',
            'export class Hint {',
            '  readonly level = input.required<Level>();',
            '  readonly freePlay = input(false);',
            '  readonly showHint = signal(false);',
            '  askNia() { this.showHint.set(true); }',
            '  setFreePlay(on: boolean) { /* … */ }',
            '}',
          ],
          answers: { 3: 'bug', 7: 'bug' },
          notes: {
            3: '`(click)="askNia"` evaluates to the method reference and never calls it. Handlers are expressions: write `askNia()`.',
            7: '`$event.target` is typed `EventTarget | null`, which has no `checked`: strict templates reject it. Use `$any($event.target).checked` or a typed handler.',
          },
          explanation:
            '`[class]="{ active: … }"` is valid: the class binding accepts a string, an array or an object. The two real bugs are the uncalled handler and the untyped event target.',
        },
      ],
    },
  },
  {
    id: 'inputs-outputs',
    world: 'components',
    title: 'Inputs & Outputs',
    tagline: 'How data goes down and events come up — as signals.',
    concept: 'Signal inputs, outputs, model',
    minutes: 4,
    xp: 100,
    story:
      'A parent template refuses to compile since the result panel was rewritten with signal inputs. Nia asks you to explain the error before fixing it.',
    hint: 'Inputs are read-only signals set by the parent (or by setInput in tests); outputs emit; model() is the one that does both.',
    takeaway:
      'Signal inputs are read-only signals: `input()` with a default, `input.required()` enforced at compile time. Outputs are `output()` and fire with `emit`. ' +
      '`model()` is a writable input that also emits, which powers `[(value)]`. In tests, inputs are set through `fixture.componentRef.setInput`.',
    challenge: {
      kind: 'mcq',
      intro: 'Six questions on the component API of RAG Quest.',
      questions: [
        {
          prompt: 'How do you read this input inside the class or the template?',
          code: 'readonly level = input.required<Level>();',
          options: ['this.level', 'this.level()', 'this.level.value', 'this.level.get()'],
          answer: 1,
          explanation:
            'A signal input is a `Signal<Level>`: a function. Call it. In the template: `{{ level().title }}`.',
        },
        {
          prompt:
            'A parent template writes `<app-result-panel [level]="lvl" />` and forgets `[result]`, which is `input.required`. What happens?',
          options: [
            'The input is undefined at runtime',
            'A compile-time error: required inputs must be bound',
            'Angular uses a default value',
            'A console warning in development mode',
          ],
          answer: 1,
          explanation:
            'Required inputs are checked by the template compiler (NG8008). The error appears in `ng build` and in the IDE, never in production.',
        },
        {
          prompt: 'How does a parent listen to this output?',
          code: 'readonly retry = output<void>();',
          options: [
            '(retry)="retry()"',
            '[retry]="retry()"',
            '@retry="retry()"',
            'retry.subscribe() in the template',
          ],
          answer: 0,
          explanation:
            'Outputs are listened to with event-binding parentheses. In code (tests, imperative use) `retry.subscribe(cb)` works too.',
        },
        {
          prompt: 'In a test, how do you provide a required signal input?',
          options: [
            'fixture.componentInstance.level = level',
            "fixture.componentRef.setInput('level', level)",
            'fixture.componentInstance.level.set(level)',
            'TestBed.inject(Level)',
          ],
          answer: 1,
          explanation:
            'Inputs are read-only signals, so there is no `.set`. `setInput` goes through the framework, triggers input change tracking and marks the view for check.',
        },
        {
          prompt: '`model()` differs from `input()` because it…',
          options: [
            'is always required',
            'is writable and emits changes, enabling [(value)] two-way binding',
            'can only hold strings',
            'replaces signal() inside components',
          ],
          answer: 1,
          explanation:
            'A model is a `WritableSignal` the component may `set`, and every change also emits a `valueChange` output: that is what `[(value)]` binds to.',
        },
        {
          prompt: 'Why the `?? 0` in this binding?',
          code: '<app-stars [count]="result()?.stars ?? 0" />\n\n// Stars: readonly count = input.required<number>();',
          options: [
            'Because `count` is typed number and strict templates refuse `number | undefined`',
            'Because signals can never be undefined',
            'To avoid an extra change-detection cycle',
            'Because `?.` is not allowed in templates',
          ],
          answer: 0,
          explanation:
            'Template type-checking is strict in new projects: the bound expression must be assignable to the input type. `?.` yields `undefined` when there is no result; `?? 0` fixes the type.',
        },
      ],
    },
  },
  {
    id: 'imports-review',
    world: 'components',
    title: "Forge Master's Review",
    tagline: 'Pick exactly what each template needs to import.',
    concept: 'Component imports',
    minutes: 4,
    xp: 100,
    story:
      'Wing review. Nia shows you three templates and asks the only question that matters in a standalone world: what does this component need to import?',
    hint: 'Look for directives (routerLink), child components (app-*), and pipes (|). Built-in control flow and native bindings need nothing.',
    takeaway:
      'A standalone component imports exactly what its template uses: child components, directives such as `RouterLink`, and pipes such as `DecimalPipe`. ' +
      'Control flow blocks, property/event/class/style bindings and native elements need nothing. `CommonModule` works but drags in everything; import the pieces.',
    challenge: {
      kind: 'pick-k',
      intro: 'For each template, pick the imports it needs. Pick exactly the required number.',
      rounds: [
        {
          query: 'This template needs three imports. Which?',
          code:
            '<a [routerLink]="[\'/play\', level.id]">{{ level.title }}</a>\n' +
            '<app-stars [count]="stars()" />\n' +
            "<span>{{ level.minutes | number: '1.0-0' }} min</span>",
          k: 3,
          items: [
            {
              id: 'a',
              text: 'RouterLink',
              relevance: 3,
              note: 'The `[routerLink]` binding is a directive from @angular/router.',
            },
            {
              id: 'b',
              text: 'Stars',
              relevance: 3,
              note: 'The `<app-stars>` element is a standalone component.',
            },
            {
              id: 'c',
              text: 'DecimalPipe',
              relevance: 3,
              note: 'The `number` pipe lives in DecimalPipe (@angular/common).',
            },
            {
              id: 'd',
              text: 'CommonModule',
              relevance: 1,
              note: 'Would work (it re-exports DecimalPipe) but drags in NgIf, NgFor and friends. Import the pipe you use.',
            },
            {
              id: 'e',
              text: 'RouterOutlet',
              relevance: 0,
              note: 'No `<router-outlet>` in this template.',
            },
            {
              id: 'f',
              text: 'NgIf',
              relevance: 0,
              note: 'No `*ngIf` here; conditions use `@if`, which needs no import.',
            },
          ],
          explanation:
            'One directive, one component, one pipe. CommonModule is the lazy answer that costs bundle size and hides what the template really depends on.',
        },
        {
          query: 'This template needs three imports. Which?',
          code:
            '@if (outcome(); as o) {\n' +
            '  <app-result-panel [level]="level()" [outcome]="o" (retry)="retry()" />\n' +
            '} @else {\n' +
            '  <app-mcq-engine [challenge]="challenge()" (completed)="onCompleted($event)" />\n' +
            '}\n' +
            '<p>{{ title() | uppercase }}</p>',
          k: 3,
          items: [
            {
              id: 'a',
              text: 'ResultPanel',
              relevance: 3,
              note: 'A child component used as `<app-result-panel>`.',
            },
            {
              id: 'b',
              text: 'McqEngine',
              relevance: 3,
              note: 'A child component used as `<app-mcq-engine>`.',
            },
            { id: 'c', text: 'UpperCasePipe', relevance: 3, note: 'The `uppercase` pipe.' },
            {
              id: 'd',
              text: 'NgIf',
              relevance: 0,
              note: '`@if` is part of the template language. Nothing to import.',
            },
            { id: 'e', text: 'FormsModule', relevance: 0, note: 'No `ngModel` anywhere.' },
            {
              id: 'f',
              text: 'AsyncPipe',
              relevance: 0,
              note: 'No `| async`: the state is signals, not observables.',
            },
          ],
          explanation:
            'Control flow is free; components and pipes are not. Output bindings `(retry)` and `(completed)` need nothing beyond the child component.',
        },
        {
          query: 'How many imports does this template need? Pick the one true statement.',
          code:
            '<input type="search" [value]="query()" (input)="query.set($any($event.target).value)" />\n' +
            '<img [src]="preview()" alt="Preview" />\n' +
            '<div [style.width.%]="pct()"></div>',
          k: 1,
          items: [
            {
              id: 'a',
              text: 'FormsModule, for the input binding',
              relevance: 0,
              note: 'Only `[(ngModel)]` needs FormsModule. `[value]` + `(input)` are native bindings.',
            },
            {
              id: 'b',
              text: 'NgStyle, for the width',
              relevance: 0,
              note: '`[style.width.%]` is a native style binding; `NgStyle` is for object maps and is rarely needed.',
            },
            {
              id: 'c',
              text: 'NgOptimizedImage, mandatory for <img>',
              relevance: 1,
              note: 'Optional: `ngSrc` would optimize loading, but a plain `[src]` works without any import.',
            },
            {
              id: 'd',
              text: 'CommonModule, always',
              relevance: 0,
              note: 'Nothing here comes from CommonModule.',
            },
            {
              id: 'e',
              text: 'Nothing: these are all native property, event and style bindings',
              relevance: 3,
              note: 'Correct. Native elements and bindings are understood by the compiler without imports.',
            },
            {
              id: 'f',
              text: 'RouterLink, for the image link',
              relevance: 0,
              note: 'There is no link at all.',
            },
          ],
          explanation:
            'A template made of native elements with property, event and style bindings imports nothing. Imports are for your components, directives and pipes.',
        },
      ],
    },
  },
];
