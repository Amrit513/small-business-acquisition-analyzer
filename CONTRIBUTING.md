# Contributing

Thanks for considering a contribution — this project is meant to be genuinely useful to people evaluating a business acquisition, and it gets better with more eyes on the finance and the code.

## Ground rules

- **Calculation logic belongs in `lib/calculations`, nowhere else.** No math inside `.tsx` components.
- **Every calculation function needs a test.** PRs touching `lib/calculations` without a corresponding test update will be asked to add one.
- **Cite your sources.** If you're adding or adjusting an industry benchmark multiple in `lib/benchmarks/industryMultiples.ts`, include where the number comes from in the `source` field.
- **Keep `docs/FORMULAS.md` in sync.** If a PR changes a formula or a scoring weight, update the doc in the same PR.

## Getting started

```bash
git clone https://github.com/<your-username>/small-business-acquisition-analyzer.git
cd small-business-acquisition-analyzer
npm install
npm test        # confirm the existing suite passes before you start
npm run dev     # start the local dev server at localhost:3000
```

## Making a change

1. Open an issue first for anything nontrivial (new feature, formula change, architecture change) so we can align before you invest time.
2. Branch from `main`: `git checkout -b feature/short-description`.
3. Write the test alongside the code, not after.
4. Run `npm test` and `npm run lint` before opening a PR.
5. Keep PRs focused — one logical change per PR is easier to review and merge.

## Good first issues

- Add or refine an industry to `lib/benchmarks/industryMultiples.ts` with a cited source.
- Build a results component (see `CLAUDE.md` → "Not yet built" for the current roadmap).
- Improve test coverage on an existing calculation module.
- Improve accessibility of form components.

## Code style

- TypeScript strict mode is on — don't add `any` to silence an error; fix the type.
- Functional components, hooks over classes.
- Prefer small, composable functions over large ones, especially in `lib/calculations`.

## Questions

Open an issue or start a discussion — this is a learning project as much as a shipping one, so "why does this formula work this way" questions are welcome, not just bug reports.
