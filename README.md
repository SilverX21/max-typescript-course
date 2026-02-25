# Node.js + npm Most-Used Features (Practical Cheat Sheet)

## Table of Contents

- [Node.js + npm Most-Used Features (Practical Cheat Sheet)](#nodejs--npm-most-used-features-practical-cheat-sheet)
  - [Table of Contents](#table-of-contents)
  - [1) `npm init` - Create a project](#1-npm-init---create-a-project)
  - [2) `npm install` / `npm i` - Add dependencies](#2-npm-install--npm-i---add-dependencies)
  - [3) `npm run` scripts - Standardize commands](#3-npm-run-scripts---standardize-commands)
  - [4) `npx` - Run package binaries without global install](#4-npx---run-package-binaries-without-global-install)
  - [5) `tsx` - Run TypeScript directly in Node workflows](#5-tsx---run-typescript-directly-in-node-workflows)
  - [6) `tsc` - TypeScript compiler and type checker](#6-tsc---typescript-compiler-and-type-checker)
  - [7) `package-lock.json` - Deterministic installs](#7-package-lockjson---deterministic-installs)
  - [8) `npm ci` - Fast, reproducible CI install](#8-npm-ci---fast-reproducible-ci-install)
  - [9) Semantic versioning (`^`, `~`) in dependencies](#9-semantic-versioning---in-dependencies)
  - [10) `.nvmrc` / Node version pinning](#10-nvmrc--node-version-pinning)
  - [11) `npm outdated` + `npm audit`](#11-npm-outdated--npm-audit)
  - [12) `npm link` / workspaces for local packages](#12-npm-link--workspaces-for-local-packages)
  - [Quick "Best Practices" Summary](#quick-best-practices-summary)

This is a practical guide to the Node.js/npm features and tools most developers use daily.
Each section includes:

- What it does
- Good example (best use)
- Bad example (worst use / anti-pattern)

## 1) `npm init` - Create a project

What it does:

- Creates `package.json`, the config file for scripts, dependencies, and metadata.

Good example:

```bash
npm init -y
```

Great for quickly bootstrapping a project.

Bad example:

```bash
npm init -y
# and never editing package.json
```

Anti-pattern: leaving default values forever in a real project.

## 2) `npm install` / `npm i` - Add dependencies

What it does:

- Installs packages and updates `package.json` + `package-lock.json`.

Good example:

```bash
npm i express
npm i -D typescript tsx @types/node
```

Runtime deps in `dependencies`, tooling in `devDependencies`.

Bad example:

```bash
npm i -D express
```

Anti-pattern: installing runtime dependencies as dev-only.

## 3) `npm run` scripts - Standardize commands

What it does:

- Runs scripts from `package.json` so everyone uses the same commands.

Good example (`package.json`):

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

Bad example:

```json
{
  "scripts": {
    "dev": "node src/index.ts"
  }
}
```

Anti-pattern: plain `node` cannot execute TypeScript directly.

## 4) `npx` - Run package binaries without global install

What it does:

- Executes CLI tools from local `node_modules` or temporary download.

Good example:

```bash
npx tsx src/index.ts
npx eslint . --fix
npx create-vite@latest my-app
```

Bad example:

```bash
npx some-unknown-package
```

Anti-pattern: running random packages without checking trust/popularity.

## 5) `tsx` - Run TypeScript directly in Node workflows

Official documentation can be found [here](https://tsx.is/)

What it does:

- Transpiles TS on the fly and runs it quickly.
- Great for scripts, APIs, tools, and local dev.

Good example:

```bash
npx tsx src/index.ts
npx tsx watch src/index.ts
```

Bad example:

```bash
npx tsx src/index.ts
# and assuming that means production is ready
```

Anti-pattern: using runtime transpilation as production deployment strategy.

## 6) `tsc` - TypeScript compiler and type checker

What it does:

- Compiles `.ts` to `.js`.
- Can also run pure type-check with `--noEmit`.

Good example:

```bash
npx tsc --noEmit
npx tsc -p tsconfig.json
```

Bad example:

```bash
npx tsc
# ignoring all compiler errors and still shipping
```

Anti-pattern: treating TypeScript diagnostics as optional in serious projects.

## 7) `package-lock.json` - Deterministic installs

What it does:

- Locks exact versions so team and CI install the same dependency tree.

Good example:

- Commit `package-lock.json` for apps and services.

Bad example:

- Deleting lockfile repeatedly to "fix" issues.
  Anti-pattern: hiding real dependency/version conflicts.

## 8) `npm ci` - Fast, reproducible CI install

What it does:

- Installs exactly from lockfile (clean install), usually faster in CI.

Good example:

```bash
npm ci
npm run build
npm test
```

Bad example:

```bash
npm ci
# without lockfile committed
```

Anti-pattern: `npm ci` fails by design if lockfile is missing/out of sync.

## 9) Semantic versioning (`^`, `~`) in dependencies

What it does:

- Controls how dependency versions can update.

Good example:

```json
{
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

Allows non-breaking minor/patch updates.

Bad example:

```json
{
  "dependencies": {
    "express": "*"
  }
}
```

Anti-pattern: unbounded versions cause unstable installs.

## 10) `.nvmrc` / Node version pinning

What it does:

- Keeps everyone on the same Node version.

Good example (`.nvmrc`):

```txt
22
```

Also enforce in `package.json`:

```json
{
  "engines": {
    "node": ">=22 <23"
  }
}
```

Bad example:

- Team uses random Node versions and debugs inconsistent behavior.

## 11) `npm outdated` + `npm audit`

What it does:

- `npm outdated`: shows newer package versions.
- `npm audit`: surfaces known vulnerabilities.

Good example:

```bash
npm outdated
npm audit
npm audit fix
```

Bad example:

```bash
npm audit fix --force
```

Anti-pattern: force-upgrading blindly can introduce breaking changes.

## 12) `npm link` / workspaces for local packages

What it does:

- `npm link`: symlink local package for development.
- Workspaces: monorepo-style local package management.

Good example:

- Prefer npm workspaces for multi-package repos.
- Use `npm link` for quick local package debugging.

Bad example:

- Using `npm link` in CI or production-like environments.
  Anti-pattern: symlink behavior can differ across environments.

---

## Quick "Best Practices" Summary

1. Use `npm run` scripts so commands are shared and repeatable.
2. Use `npx` for one-off CLIs, local installs for regular tooling.
3. Use `tsx` for local TS execution, `tsc` for build/type-check pipelines.
4. Commit `package-lock.json` and use `npm ci` in CI.
5. Pin Node versions and avoid wildcard dependency versions.
