# Agent Context

## Project

`@prb/derivation-paths` is a Bun-managed TypeScript ESM library for HD derivation-path data, parsing, rendering, and
recognition. It has no runtime dependencies; source lives under `src/`, generated package output goes to ignored
`dist/`, and npm tarballs (`*.tgz`) are ignored build artifacts.

## Commands

- Install dependencies with `just install --frozen` when `node_modules/` is missing or stale.
- Prefer `just` recipes over direct tool calls. `just --list` shows imported recipes from `@prb/devkit`.
- Use `just test` for the full Vitest suite, or pass a narrow filter/file through `just test <args>`.
- Use `just type-check` for TypeScript checking and `just full-check` for the CI-style lint/format/type pass.
- Use `just build` before packaging-sensitive changes. It cleans `dist/`, runs `tsc -p tsconfig.build.json`, and runs
  `npm pack --quiet`, which writes an ignored `.tgz`.
- For Markdown edits, use `just prettier-write <paths>` and verify with `just prettier-check <paths>`.

## Lint Rules

After generating code, run these commands in order.

File argument rules:

- Changed fewer than 10 files? Pass specific paths or globs.
- Changed 10+ files? Omit file arguments to process all files.

Command sequence:

1. Identify which file types changed.
2. `just biome-lint <files>` - lint JS/TS/JSON/JSONC files; skip if none changed.
3. `just prettier-check <files>` - check Markdown/YAML formatting; skip if none changed.
4. `just type-check` - verify TypeScript types on the whole project when `.ts` files changed.

Examples:

```bash
# Fewer than 10 files: use specific paths and/or globs
just biome-lint src/index.ts package.json
just prettier-check AGENTS.md

# 10+ files: run default commands
just biome-lint
just prettier-check

# TypeScript check runs on the whole project
just type-check
```

If any command fails, analyze the errors and fix only those related to files you changed.

## Architecture

- `src/path/template.ts` is the single source of truth for path templates: the same `Template` drives `render`,
  `renderTemplate`, `toMatcher`, and `match`.
- Add or change derivation standards by modeling them as templates in the relevant `src/profiles/*.ts` module and
  exporting them through `src/profiles/index.ts` / `src/profiles/registry.ts`.
- Keep registry IDs stable and unique. `DERIVATION_PROFILES` order matters because `recognizePath` returns the first
  matching profile.
- Use `minValue` on template params to keep overlapping shapes disjoint instead of adding special-case recognition code.
- Substrate secret-URI parsing is intentionally separate in `src/substrate-suri.ts`; it is not a BIP-32 `m/...` profile.
- Package exports in `package.json` must stay aligned with public re-exports from `src/index.ts` and subpath entry
  points.

## Testing

- When changing templates or profiles, run
  `just test src/path/template.test.ts src/profiles/registry.test.ts src/profiles/parity.test.ts`.
- Preserve the round-trip laws in `src/path/template.test.ts` and the hand-written-regex parity fixtures in
  `src/profiles/parity.test.ts`.
- When changing parsing/building behavior, add or update focused tests next to the module (`*.test.ts`) and run that
  file through `just test`.

## Style And Safety

- Follow the existing TypeScript style: ESM imports with `.js` specifiers, readonly data where practical, explicit
  exported types for public APIs, and narrow helpers near their call sites.
- Prefer alphabetical ordering where order carries no meaning — e.g. enum-like `as const` member lists that only source
  a union type (`SIGNATURE_SCHEMES`, `ADDRESS_KINDS`, `STANDARDS`) and object keys. Do not alphabetize where order is
  semantic: `DERIVATION_PROFILES` (first-match recognition) and positional path-level arrays (`POSITIONAL_FIELDS`,
  `ORDER`, `SEGMENT_ROLES`).
- Do not add runtime crypto, key derivation, RPC/explorer, descriptor, wallet-UX, or network dependencies; the package
  scope is pure data and path utilities.
- Do not commit generated `dist/` output or `.tgz` package artifacts unless the user explicitly asks.
