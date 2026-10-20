import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { findLevel } from '../../../content/worlds';
import { simulate } from '../../../core/domain/signal-sim';
import {
  BucketSortChallenge,
  Challenge,
  ChallengeResult,
  ClaimCheckChallenge,
  ClozeChallenge,
  CodeSelectChallenge,
  McqChallenge,
  OrderStepsChallenge,
  PickKChallenge,
  SignalLabChallenge,
  TokenSelectChallenge,
} from '../../../core/models';
import { BucketSortEngine } from './bucket-sort-engine';
import { ClaimCheckEngine } from './claim-check-engine';
import { ClozeEngine } from './cloze-engine';
import { CodeSelectEngine } from './code-select-engine';
import { McqEngine } from './mcq-engine';
import { OrderStepsEngine } from './order-steps-engine';
import { PickKEngine } from './pick-k-engine';
import { SignalLabEngine } from './signal-lab-engine';
import { TokenSelectEngine } from './token-select-engine';

function challengeOf<T extends Challenge>(levelId: string, kind: T['kind']): T {
  const level = findLevel(levelId);
  if (!level || level.challenge.kind !== kind) {
    throw new Error(`level ${levelId} with a ${kind} challenge not found`);
  }
  return level.challenge as T;
}

interface Mounted<T> {
  fixture: ComponentFixture<T>;
  el: HTMLElement;
  results: ChallengeResult[];
  stable: () => Promise<void>;
}

async function mount<
  T extends { completed: { subscribe: (cb: (r: ChallengeResult) => void) => unknown } },
>(component: Type<T>, challenge: Challenge): Promise<Mounted<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.componentRef.setInput('challenge', challenge);
  const results: ChallengeResult[] = [];
  fixture.componentInstance.completed.subscribe((result) => results.push(result));
  await fixture.whenStable();
  return {
    fixture,
    el: fixture.nativeElement as HTMLElement,
    results,
    stable: () => fixture.whenStable(),
  };
}

function buttons(el: HTMLElement, selector = 'button'): HTMLButtonElement[] {
  return Array.from(el.querySelectorAll<HTMLButtonElement>(selector));
}

function buttonByText(el: HTMLElement, text: string): HTMLButtonElement {
  const button = buttons(el).find((candidate) => candidate.textContent?.includes(text));
  if (!button) throw new Error(`no button containing "${text}"`);
  return button;
}

describe('McqEngine', () => {
  it('renders code blocks and scores 100% for all-correct answers', async () => {
    const challenge = challengeOf<McqChallenge>('inputs-outputs', 'mcq');
    const { el, results, stable } = await mount(McqEngine, challenge);
    expect(el.querySelector('pre.code')?.textContent).toContain('input.required');
    for (const question of challenge.questions) {
      buttons(el, '.option')[question.answer].click();
      await stable();
      buttonByText(el, 'Check answer').click();
      await stable();
      expect(el.querySelector('.feedback.good')).not.toBeNull();
      buttons(el)
        .find((b) => /Next question|See results/.test(b.textContent ?? ''))!
        .click();
      await stable();
    }
    expect(results[0]?.scorePct).toBe(100);
    expect(results[0]?.flawless).toBe(true);
  });
});

describe('ClozeEngine', () => {
  it('renders one select per blank and scores the chosen answers', async () => {
    const challenge = challengeOf<ClozeChallenge>('component-anatomy', 'cloze');
    const { fixture, el, stable } = await mount(ClozeEngine, challenge);
    const round = challenge.rounds[0];
    expect(el.querySelectorAll('select.blank')).toHaveLength(round.blanks.length);
    expect(buttonByText(el, 'Check').disabled).toBe(true);

    round.blanks.forEach((blank, i) => fixture.componentInstance.choose(i, blank.answer));
    await stable();
    expect(buttonByText(el, 'Check').disabled).toBe(false);
    buttonByText(el, 'Check').click();
    await stable();
    expect(el.querySelector('.feedback.good')?.textContent).toContain(
      `${round.blanks.length} / ${round.blanks.length}`,
    );
    expect(el.querySelectorAll('select.blank.correct')).toHaveLength(round.blanks.length);
  });

  it('gives a partial score for a wrong blank', async () => {
    const challenge = challengeOf<ClozeChallenge>('inject-it', 'cloze');
    const { fixture, el, stable } = await mount(ClozeEngine, challenge);
    const round = challenge.rounds[0];
    round.blanks.forEach((blank, i) =>
      fixture.componentInstance.choose(
        i,
        i === 0 ? blank.options.find((o) => o !== blank.answer)! : blank.answer,
      ),
    );
    await stable();
    buttonByText(el, 'Check').click();
    await stable();
    expect(fixture.componentInstance.roundScore()).toBe(
      Math.round(((round.blanks.length - 1) / round.blanks.length) * 100),
    );
    expect(el.querySelectorAll('select.blank.wrong')).toHaveLength(1);
  });
});

describe('CodeSelectEngine', () => {
  it('flags the buggy lines and scores F1 100%', async () => {
    const challenge = challengeOf<CodeSelectChallenge>('template-bugs', 'code-select');
    const { el, stable } = await mount(CodeSelectEngine, challenge);
    const round = challenge.rounds[0];
    expect(el.querySelectorAll('.code-line')).toHaveLength(round.lines.length);
    for (const index of Object.keys(round.answers).map(Number)) {
      buttons(el, '.code-line')[index].click();
      await stable();
    }
    buttonByText(el, 'Check').click();
    await stable();
    expect(el.querySelector('.feedback')?.textContent).toContain('F1 score 100%');
    expect(el.querySelectorAll('.code-line.correct')).toHaveLength(
      Object.keys(round.answers).length,
    );
    expect(el.textContent).toContain(round.notes[Number(Object.keys(round.answers)[0])]);
  });

  it('penalizes a false alarm', async () => {
    const challenge = challengeOf<CodeSelectChallenge>('template-bugs', 'code-select');
    const { fixture, el, stable } = await mount(CodeSelectEngine, challenge);
    buttons(el, '.code-line')[0].click();
    await stable();
    buttonByText(el, 'Check').click();
    await stable();
    expect(fixture.componentInstance.roundScore()).toBe(0);
    expect(el.querySelector('.code-line.wrong')).not.toBeNull();
    expect(el.textContent).toContain('Nothing wrong on this line');
  });
});

describe('SignalLabEngine', () => {
  it('draws the graph, scores an exact prediction and reveals the simulation', async () => {
    const challenge = challengeOf<SignalLabChallenge>('signal-lab', 'signal-lab');
    const { fixture, el, stable } = await mount(SignalLabEngine, challenge);
    const round = challenge.rounds[0];
    expect(el.querySelectorAll('g.node')).toHaveLength(round.nodes.length);
    expect(el.querySelectorAll('line.edge').length).toBeGreaterThan(0);

    const expected = simulate({ nodes: round.nodes }, { set: round.action }, round.reads).touched;
    for (const node of round.nodes) {
      if (expected.includes(node.id)) fixture.componentInstance.toggle(node);
    }
    await stable();
    buttonByText(el, 'Run').click();
    await stable();
    expect(fixture.componentInstance.roundScore()).toBe(100);
    expect(el.querySelectorAll('g.node.correct')).toHaveLength(expected.length);
    expect(el.textContent).toContain('computations');
  });

  it('scores 100% when correctly predicting that nothing happens', async () => {
    const challenge = challengeOf<SignalLabChallenge>('signal-lab', 'signal-lab');
    const { fixture, el, stable } = await mount(SignalLabEngine, challenge);
    fixture.componentInstance.next(); // round 2: same value set
    await stable();
    expect(fixture.componentInstance.index()).toBe(1);
    buttonByText(el, 'Run').click();
    await stable();
    expect(fixture.componentInstance.roundScore()).toBe(100);
    expect(el.textContent).toContain('actually recomputed: nothing');
  });

  it('ignores clicks on signal nodes', async () => {
    const challenge = challengeOf<SignalLabChallenge>('signal-lab', 'signal-lab');
    const { fixture } = await mount(SignalLabEngine, challenge);
    fixture.componentInstance.toggle(challenge.rounds[0].nodes[0]);
    expect(fixture.componentInstance.predicted()).toEqual([]);
  });
});

describe('TokenSelectEngine', () => {
  it('scores F1 100% when exactly the signal reads are selected', async () => {
    const challenge = challengeOf<TokenSelectChallenge>('signal-reads', 'token-select');
    const { el, stable } = await mount(TokenSelectEngine, challenge);
    const chips = () => buttons(el).filter((b) => b.classList.contains('chip'));
    for (const index of Object.keys(challenge.rounds[0].answers).map(Number)) {
      chips()[index].click();
      await stable();
    }
    buttonByText(el, 'Check').click();
    await stable();
    expect(el.querySelector('.feedback')?.textContent).toContain('F1 score 100%');
  });
});

describe('BucketSortEngine', () => {
  it('sorts every fragment into its block and scores 100%', async () => {
    const challenge = challengeOf<BucketSortChallenge>('control-flow', 'bucket-sort');
    const { el, results, stable } = await mount(BucketSortEngine, challenge);
    for (let i = 0; i < challenge.cards.length; i++) {
      const chip = el.querySelector<HTMLButtonElement>('.card-soft .chip')!;
      const card = challenge.cards.find(
        (candidate) => candidate.text === chip.textContent?.trim(),
      )!;
      chip.click();
      await stable();
      const bucketIndex = challenge.buckets.findIndex((bucket) => bucket.id === card.bucket);
      el.querySelectorAll<HTMLElement>('.bucket')[bucketIndex].click();
      await stable();
    }
    buttonByText(el, 'Check').click();
    await stable();
    buttonByText(el, 'See results').click();
    expect(results[0]?.scorePct).toBe(100);
  });
});

describe('OrderStepsEngine', () => {
  it('scores the lazy-route journey', async () => {
    const challenge = challengeOf<OrderStepsChallenge>('lazy-routes', 'order-steps');
    const { fixture, el, results, stable } = await mount(OrderStepsEngine, challenge);
    expect(el.querySelectorAll('.step')).toHaveLength(challenge.steps.length);
    fixture.componentInstance.order.set(challenge.steps.map((step) => step.id));
    await stable();
    buttonByText(el, 'Check order').click();
    await stable();
    buttonByText(el, 'See results').click();
    expect(results[0]?.scorePct).toBe(100);
  });
});

describe('PickKEngine', () => {
  it('scores 100% for the essential imports', async () => {
    const challenge = challengeOf<PickKChallenge>('imports-review', 'pick-k');
    const { el, stable } = await mount(PickKEngine, challenge);
    const round = challenge.rounds[0];
    expect(el.querySelector('pre.code')?.textContent).toContain('routerLink');
    round.items.forEach((item, i) => {
      if (item.relevance === 3) buttons(el, '.option')[i].click();
    });
    await stable();
    buttonByText(el, 'Check selection').click();
    await stable();
    expect(el.querySelector('.feedback.good')?.textContent).toContain(
      '100% of the best achievable',
    );
  });
});

describe('ClaimCheckEngine', () => {
  it('scores 100% when exactly the wrong claims are flagged', async () => {
    const challenge = challengeOf<ClaimCheckChallenge>('zoneless-detective', 'claim-check');
    const { el, stable } = await mount(ClaimCheckEngine, challenge);
    expect(el.querySelector('pre.code')?.textContent).toContain('setInterval');
    const boxes = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));
    challenge.rounds[0].claims.forEach((claim, i) => {
      if (!claim.supported) boxes[i].click();
    });
    await stable();
    buttonByText(el, 'Submit review').click();
    await stable();
    expect(el.querySelector('.feedback.info')?.textContent).toContain('— 100%');
  });
});
