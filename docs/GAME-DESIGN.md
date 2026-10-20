# Angular Quest — game design

Angular Quest reuses the game layer designed for [RAG Quest](https://github.com/tonystechofficial/rag-quest/blob/main/docs/GAME-DESIGN.md): the same progression, economy, badges, mentor hints, streak and certificate. This document only records what differs.

## Fantasy

You join the team maintaining the RAG Quest codebase. The build is red, the last commits broke things in instructive ways, and **Nia**, the tech lead, walks you through the three wings of **the Workshop**:

| Wing | Topic | Review (boss) |
| --- | --- | --- |
| The Template Forge | components, templates, control flow, imports | Forge Master's Review: pick the imports |
| The Signal Observatory | signals, computed, effect, zoneless | Reactivity Exam |
| The Shipping Dock | DI, routing, testing, build & deploy | Release Night: fact-check release notes |

Every snippet is taken from, or modelled on, RAG Quest, so the player learns Angular on code that exists and runs.

## Mechanics specific to this game

- **Cloze (fill the blanks)** — real snippets with `[[n]]` holes and a dropdown of plausible identifiers per hole. Teaches API names and syntax where the hand has to type them. Score = share of blanks right.
- **Code select (spot the line)** — a file as clickable lines; flag the buggy ones. Scored by F1 so false alarms cost points. Each flagged line gets a note explaining the bug, each wrongly flagged line says so. Traps are planted (`[class]="{…}"` is valid; `track $index` is a smell, not a bug).
- **Signal Lab (predict, then run)** — a dependency graph drawn as SVG next to the Angular code it stands for. The player marks the computeds that will recompute and the effects that will run, then runs a real simulation (`core/domain/signal-sim.ts`) and sees the before/after values and the recomputation counts. Scored by F1 against the simulated set; predicting "nothing happens" correctly scores 100. Scenarios: full cascade, equal-value set, equality stopping propagation, diamond, `untracked`.
- **Claim check as code review** — PR descriptions, onboarding summaries and release notes with planted false statements; the context is the code or the known facts.

## Ranks

Intern → Junior Developer → Component Crafter → Signal Smith → Angular Architect → Angular Grandmaster (1500 XP).

## Badges

First Commit, Bug Hunter (perfect code-select round), Autocomplete (perfect cloze round), Signal Seer (perfect lab prediction), Code Reviewer (every claim right), Flawless, Comeback, three Keepers (one per wing), Three Days Running, Docs Reader, Green Build (a star everywhere), Angular Grandmaster.

## Accuracy policy

Facts about Angular are stated only where they are stable and verifiable in the Angular 22 behaviour used by RAG Quest. Timing details that changed across versions (effect scheduling order) are deliberately left out of the quizzes.
