# Visual Regression

This folder stores screenshot fixtures used to score export fidelity against Figma benchmarks.

Fixture format:

```json
{
  "name": "related-offerings",
  "baseline": "regression/fixtures/baseline-related-offerings.png",
  "candidate": "regression/fixtures/candidate-related-offerings.png",
  "diff": "regression/output/related-offerings-diff.png",
  "threshold": 0.1
}
```

Run a fixture:

```bash
npm run regression:score -- --fixture regression/fixtures/example.fixture.json
```

Run direct comparison:

```bash
npm run regression:score -- baseline.png candidate.png --diff regression/output/diff.png
```

The score is raw screenshot similarity:

- `100%` means pixel-identical
- lower scores indicate more visual drift
- the diff image highlights mismatched pixels
