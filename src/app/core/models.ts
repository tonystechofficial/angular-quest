import { GraphNode, Value } from './domain/signal-sim';

export type WorldId = 'components' | 'signals' | 'architecture';

export interface World {
  id: WorldId;
  name: string;
  /** Narrative name of the wing of the Workshop ("The Template Forge"). */
  wing: string;
  tagline: string;
  description: string;
  icon: string;
  story: string;
  mentorIntro: string;
}

export type ChallengeKind =
  | 'mcq'
  | 'token-select'
  | 'order-steps'
  | 'bucket-sort'
  | 'pick-k'
  | 'claim-check'
  | 'cloze'
  | 'code-select'
  | 'signal-lab';

export interface Level {
  id: string;
  world: WorldId;
  title: string;
  tagline: string;
  concept: string;
  minutes: number;
  xp: number;
  story: string;
  hint: string;
  challenge: Challenge;
  takeaway: string;
}

export type Challenge =
  | McqChallenge
  | TokenSelectChallenge
  | OrderStepsChallenge
  | BucketSortChallenge
  | PickKChallenge
  | ClaimCheckChallenge
  | ClozeChallenge
  | CodeSelectChallenge
  | SignalLabChallenge;

// ---------------------------------------------------------------- multiple choice
export interface McqQuestion {
  prompt: string;
  /** Optional plain-text passage shown above the options. */
  context?: string;
  /** Optional code block shown above the options (rendered in a <pre>). */
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface McqChallenge {
  kind: 'mcq';
  intro: string;
  questions: McqQuestion[];
}

// ---------------------------------------------------------------- token selection
export interface TokenLabel {
  id: string;
  name: string;
}

export interface TokenSelectRound {
  prompt: string;
  tokens: string[];
  /** token index -> label id */
  answers: Record<number, string>;
  explanation: string;
}

export interface TokenSelectChallenge {
  kind: 'token-select';
  intro: string;
  labels: TokenLabel[];
  /** Render tokens in monospace (code fragments). */
  mono?: boolean;
  rounds: TokenSelectRound[];
}

// ---------------------------------------------------------------- ordering
export interface OrderStep {
  id: string;
  title: string;
  detail: string;
  phase: string;
}

export interface OrderStepsChallenge {
  kind: 'order-steps';
  intro: string;
  /** In the correct order. */
  steps: OrderStep[];
}

// ---------------------------------------------------------------- bucket sort
export interface Bucket {
  id: string;
  name: string;
  hint: string;
}

export interface BucketCard {
  id: string;
  text: string;
  bucket: string;
  why: string;
}

export interface BucketSortChallenge {
  kind: 'bucket-sort';
  intro: string;
  buckets: Bucket[];
  cards: BucketCard[];
  /** Render cards in monospace (code fragments). */
  mono?: boolean;
}

// ---------------------------------------------------------------- pick k
export interface PickItem {
  id: string;
  text: string;
  /** Ground-truth relevance 0..3. */
  relevance: number;
  note: string;
}

export interface PickRound {
  query: string;
  code?: string;
  k: number;
  items: PickItem[];
  explanation: string;
}

export interface PickKChallenge {
  kind: 'pick-k';
  intro: string;
  rounds: PickRound[];
}

// ---------------------------------------------------------------- claim check
export interface Claim {
  text: string;
  supported: boolean;
  why: string;
}

export interface ClaimCheckRound {
  /** The reference material (docs excerpt, behaviour description). */
  context: string;
  /** Optional code the claims talk about. */
  code?: string;
  /** The text under review (PR description, comment, answer…). */
  answer: string;
  claims: Claim[];
}

export interface ClaimCheckChallenge {
  kind: 'claim-check';
  intro: string;
  contextLabel: string;
  answerLabel: string;
  rounds: ClaimCheckRound[];
}

// ---------------------------------------------------------------- cloze (fill the blanks)
export interface ClozeBlank {
  options: string[];
  answer: string;
  why: string;
}

export interface ClozeRound {
  prompt: string;
  /** Code with [[1]], [[2]]… placeholders, 1-based, one per blank. */
  code: string;
  blanks: ClozeBlank[];
  explanation: string;
}

export interface ClozeChallenge {
  kind: 'cloze';
  intro: string;
  rounds: ClozeRound[];
}

// ---------------------------------------------------------------- code select (spot the bug)
export interface CodeSelectRound {
  prompt: string;
  lines: string[];
  /** line index -> label id */
  answers: Record<number, string>;
  /** line index -> why this line is flagged */
  notes: Record<number, string>;
  explanation: string;
}

export interface CodeSelectChallenge {
  kind: 'code-select';
  intro: string;
  labels: TokenLabel[];
  rounds: CodeSelectRound[];
}

// ---------------------------------------------------------------- signal lab (graph simulator)
export type SignalLabNode = GraphNode & { x: number; y: number };

export interface SignalLabRound {
  prompt: string;
  nodes: SignalLabNode[];
  /** The Angular code this graph stands for. */
  code: string;
  action: { id: string; value: Value };
  /** Nodes "read by the template" after the action (leaves that are rendered). */
  reads: string[];
  explanation: string;
}

export interface SignalLabChallenge {
  kind: 'signal-lab';
  intro: string;
  rounds: SignalLabRound[];
}

// ---------------------------------------------------------------- results
export interface ChallengeResult {
  scorePct: number;
  summary: string;
  flawless?: boolean;
  feats?: string[];
}

export interface GlossaryEntry {
  term: string;
  world: WorldId;
  definition: string;
}
