# Dependency justifications

- `next`, `react`, `react-dom`: required for the fixed Next.js App Router + TypeScript architecture.
- `@playwright/test`: browser smoke tests for locale roots, market links, and third-party requests.
- `@fontsource-variable/inter` and `@fontsource/ibm-plex-sans-arabic`: self-hosted fonts required by the architecture; avoids runtime font CDN requests. Both are distributed under OFL.
- `eslint`, `typescript-eslint`, `typescript`, `prettier`: required TypeScript lint, type-check, and formatting gates; `typescript-eslint` avoids shipping an unnecessary Next-specific lint dependency.
- `size-limit` and `@size-limit/file`: enforce the static-page JavaScript budget.
- No additional runtime dependencies are approved for P1.
