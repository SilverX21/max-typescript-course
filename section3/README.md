# `tsconfig.json` Cheatsheet (TypeScript compiler config)

When you run `tsc --init`, TypeScript generates a **`tsconfig.json`** file. This file tells the TypeScript compiler (and your editor) **how to type-check your code, how to resolve modules, and how to emit output** (JS, `.d.ts`, sourcemaps, etc.).

It affects:

- `tsc` (build output + type-checking)
- editors via TypeScript Server (autocomplete, errors, go-to-definition)
- tools that read TS config (Vite, Jest, ESLint, ts-node, bundlers)

---

Some cool commands:

- **Watch mode**: `tsc --watch` the compiler will be checking for new updates to the files and compile them when saved (for example)

---

Types modules:

Some features from Node.js might not be available in TypeScript, for that we need to install the types packages.
Each package has a `@types` packages associated that can be used in TypeScript, we can enable it like this:

- **NPM init**: first we run `npm init`
- **package.json modules**: then, change the `type` to `module`, so it supports modern features
- **Node Types**: now, let's install Node.js core features: `npm install @types/node --save-dev`
- **Enable in tsconfig.json**: in `tsconfig.json`, you'll find a section named `types`, inside the array add `node`

---

## Table of contents

- [`tsconfig.json` Cheatsheet (TypeScript compiler config)](#tsconfigjson-cheatsheet-typescript-compiler-config)
  - [Table of contents](#table-of-contents)
  - [What `tsconfig.json` is for](#what-tsconfigjson-is-for)
  - [How TypeScript finds and uses it](#how-typescript-finds-and-uses-it)
    - [`tsc` in a folder](#tsc-in-a-folder)
    - [`tsc -p`](#tsc--p)
    - [Editor behavior](#editor-behavior)
  - [Your example `tsconfig.json` annotated](#your-example-tsconfigjson-annotated)
    - [`compilerOptions`](#compileroptions)
    - [File layout: `rootDir` and `outDir`](#file-layout-rootdir-and-outdir)
    - [Environment settings: `module`, `target`, `types`, (`lib`)](#environment-settings-module-target-types-lib)
      - [`module: "nodenext"`](#module-nodenext)
      - [`target: "esnext"`](#target-esnext)
      - [`types: []`](#types-)
      - [`lib`](#lib)
    - [Other outputs: `sourceMap`, `declaration`, `declarationMap`](#other-outputs-sourcemap-declaration-declarationmap)
      - [`sourceMap: true`](#sourcemap-true)
      - [`declaration: true`](#declaration-true)
      - [`declarationMap: true`](#declarationmap-true)
    - [Stricter typechecking options](#stricter-typechecking-options)
      - [`noUncheckedIndexedAccess: true`](#nouncheckedindexedaccess-true)
      - [`exactOptionalPropertyTypes: true`](#exactoptionalpropertytypes-true)
    - [Style options (commented out)](#style-options-commented-out)
      - [`noImplicitReturns`](#noimplicitreturns)
      - [`noUnusedLocals` / `noUnusedParameters`](#nounusedlocals--nounusedparameters)
      - [`noImplicitOverride`](#noimplicitoverride)
    - [Recommended options section](#recommended-options-section)
      - [`strict: true`](#strict-true)
      - [`jsx: "react-jsx"`](#jsx-react-jsx)
      - [`verbatimModuleSyntax: true`](#verbatimmodulesyntax-true)
      - [`isolatedModules: true`](#isolatedmodules-true)
      - [`noUncheckedSideEffectImports: true`](#nouncheckedsideeffectimports-true)
      - [`moduleDetection: "force"`](#moduledetection-force)
      - [`skipLibCheck: true`](#skiplibcheck-true)
  - [Key concepts you should know](#key-concepts-you-should-know)
    - [Type-checking vs emitting](#type-checking-vs-emitting)
    - [Modules and module resolution](#modules-and-module-resolution)
    - [Targets and libs](#targets-and-libs)
    - [Declaration files](#declaration-files)
    - [Source maps](#source-maps)
    - [Strictness options](#strictness-options)
    - [JSX options](#jsx-options)
  - [Other important `tsconfig` features](#other-important-tsconfig-features)
    - [`include`, `exclude`, `files`](#include-exclude-files)
    - [`extends` (shared base configs)](#extends-shared-base-configs)
    - [Path aliases: `baseUrl` + `paths`](#path-aliases-baseurl--paths)
    - [Project references (`references`)](#project-references-references)
    - [Incremental builds](#incremental-builds)
  - [Common real-world presets](#common-real-world-presets)
    - [Node (ESM) app](#node-esm-app)
    - [React app](#react-app)
    - [Library package](#library-package)
  - [Gotchas and best practices](#gotchas-and-best-practices)

---

## What `tsconfig.json` is for

Think of `tsconfig.json` as **the contract** between your codebase and the TypeScript compiler.

It answers questions like:

- Which files are part of the project?
- What JS should TS output (ES2017? ESNext?) and how?
- How should imports be resolved (NodeNext, classic, bundler)?
- How strict is type-checking?
- Should we emit `.d.ts` files for consumers?
- Should we generate sourcemaps?

---

## How TypeScript finds and uses it

### `tsc` in a folder

If you run `tsc` with no args, TypeScript:

1. searches for the closest `tsconfig.json` in the current folder (and parents),
2. uses it as the project config.

### `tsc -p`

You can explicitly choose a config:

```bash
tsc -p ./tsconfig.json
tsc -p ./packages/api/tsconfig.json
```

### Editor behavior

Your editor typically uses `tsconfig.json` to decide:

- what files belong to the project
- which options are active
- which errors to show

So even if you’re using a bundler (Vite/Next), your dev experience still heavily depends on `tsconfig.json`.

---

## Your example `tsconfig.json` annotated

Here is your exact example (kept as-is), and below it you’ll find explanations section-by-section:

```jsonc
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    // "rootDir": "./src",
    // "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "esnext",
    "types": [],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  },
}
```

### `compilerOptions`

Everything inside `compilerOptions` changes how TS checks and emits.

---

### File layout: `rootDir` and `outDir`

These are commented out in your file, but they matter a lot when using `tsc` to emit JS.

- **`rootDir`**: where TS considers your source root to be.
- **`outDir`**: where emitted files go.

Example:

```jsonc
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
  },
}
```

If you have `src/index.ts`, output becomes `dist/index.js` (and related files).

---

### Environment settings: `module`, `target`, `types`, (`lib`)

#### `module: "nodenext"`

This controls **how imports/exports are emitted** and how TS resolves modules **with Node’s ESM rules**.

What you get:

- ESM-aware resolution (`package.json` `"type"`, `.mts/.cts`, and `exports` support)
- correct behavior when mixing ESM + CJS in Node ecosystems

Typical Node ESM import:

```ts
import { readFile } from "node:fs/promises";
```

If you’re writing a Node app/library that will run in Node and uses modern ESM patterns, `"nodenext"` is a solid default.

#### `target: "esnext"`

This controls the **JavaScript language level** TS emits.

- `esnext` means: “don’t downlevel modern syntax; emit the latest JS”.
- Great when your runtime/bundler supports modern JS (Node 20+, modern browsers, Vite, etc.)
- If you need older runtime support, use something like `"es2019"` or `"es2020"`.

Example impact:

```ts
const x = foo?.bar ?? "default";
```

With a lower target, TS may rewrite optional chaining / nullish coalescing into older JS. With `esnext`, it will usually keep it.

#### `types: []`

This controls which **global type packages** are included.

- `[]` means “don’t automatically include `@types/*` globals”.
- This can reduce “type pollution” (random globals showing up), but…

**For Node projects**, you usually want:

```jsonc
{
  "compilerOptions": {
    "types": ["node"],
  },
}
```

…and install:

```bash
npm i -D @types/node
```

#### `lib`

`lib` defines which **built-in platform APIs** are available at type level (e.g., `DOM`, `ES2022`, etc.).

Examples:

- Browser app: `["DOM", "DOM.Iterable", "ESNext"]`
- Node app: `["ESNext"]`

If you omit `lib`, TS chooses defaults based on `target`, but in many projects you’ll set it explicitly.

---

### Other outputs: `sourceMap`, `declaration`, `declarationMap`

#### `sourceMap: true`

Generates `.map` files so you can debug TS as if it were TS, even after emitting JS.

Useful for:

- debugging in Node
- debugging in browsers
- stack traces mapped to `.ts`

#### `declaration: true`

Emits `.d.ts` files (type definitions).

This is essential when:

- you’re publishing a library
- you have multiple packages and one depends on another
- you want consumers to get strong typing from your package

Output:

- `dist/index.d.ts`

#### `declarationMap: true`

Emits `.d.ts.map` files. This enables “go to definition” to jump into your original `.ts` sources (nice DX for consumers).

---

### Stricter typechecking options

#### `noUncheckedIndexedAccess: true`

Makes indexed access safer by adding `undefined` when a key might not exist.

Without it:

```ts
const xs: string[] = [];
const v = xs[0]; // string  (unsafe!)
```

With it:

```ts
const xs: string[] = [];
const v = xs[0]; // string | undefined  ✅ safer
```

You’ll be nudged to handle the missing case.

#### `exactOptionalPropertyTypes: true`

Makes optional properties more precise.

```ts
type User = { bio?: string };
```

With this flag:

- `bio?: string` means “either missing OR present with a string”
- It is _not the same_ as `bio: string | undefined` in assignments

It catches subtle bugs where you accidentally assign `undefined` to mean “missing”.

---

### Style options (commented out)

These don’t change runtime output, but they catch common mistakes.

A few highlights:

#### `noImplicitReturns`

Ensures functions return on all paths (or explicitly return `undefined`).

```ts
function f(x: number) {
  if (x > 0) return x;
  // ❌ missing return
}
```

#### `noUnusedLocals` / `noUnusedParameters`

Catch dead code and unused params.

Note: some teams prefer ESLint for these, but TS options work well too.

#### `noImplicitOverride`

For class hierarchies, forces `override` keyword when overriding (prevents silent mistakes).

---

### Recommended options section

#### `strict: true`

Enables a bundle of strict checks (the #1 setting you want in professional TS codebases).

This includes things like:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- etc.

#### `jsx: "react-jsx"`

Uses React 17+ “new JSX transform”.

- No need to `import React from "react"` just for JSX.
- Great default for modern React.

#### `verbatimModuleSyntax: true`

Keeps your import/export statements more “as written” and avoids TS rewriting them in surprising ways.

This helps prevent issues like:

- importing types turning into runtime imports
- TS eliding imports you expected to exist at runtime

Common best practice with this option: use **type-only imports**:

```ts
import type { User } from "./types";
```

#### `isolatedModules: true`

Ensures every file can be safely compiled in isolation (important for bundlers like Vite, SWC, Babel).

It prevents TS features that require cross-file analysis from sneaking in.

If you use a bundler for transpile, `isolatedModules` helps align TS checks with what your build tool can actually do.

#### `noUncheckedSideEffectImports: true`

Flags imports that are “just for side effects” when TS can’t be sure they’re safe/intentional.

Example side-effect import:

```ts
import "./setupPolyfills";
```

This option encourages you to be explicit about side-effectful code, which can reduce nasty “why did this run?” surprises.

#### `moduleDetection: "force"`

Forces TS to treat files as modules even if they don’t have imports/exports (helps consistency).

It reduces edge cases where a file becomes a script and leaks globals.

#### `skipLibCheck: true`

Skips type-checking of `.d.ts` files in `node_modules`.

Pros:

- Faster builds
- Fewer “noise” errors from third-party types

Cons:

- You might miss legitimate issues coming from external type defs (rare, but possible)

Most production projects keep this `true` unless they have a specific reason.

---

## Key concepts you should know

### Type-checking vs emitting

TypeScript does two different jobs:

1. **Type-check** (find errors)
2. **Emit** JavaScript and type files

You can turn off emitting:

```jsonc
{ "compilerOptions": { "noEmit": true } }
```

Useful if a separate tool (Vite/SWC/Babel) handles output and you only want TS for type-checking.

---

### Modules and module resolution

Your module settings must match your runtime/bundler:

- Node ESM: `module: "nodenext"` (or sometimes `"esnext"` + `"moduleResolution": "bundler"` depending on tooling)
- Bundlers: often pair with `"moduleResolution": "bundler"` (not shown in your config)

If imports behave weirdly, it’s _usually_ module + moduleResolution mismatch.

---

### Targets and libs

- **`target`** controls output syntax level.
- **`lib`** controls available built-in types (DOM, ESNext, etc.).

If TS says `Property 'fetch' does not exist...`, you likely need `lib` to include `DOM` (or a fetch types package in Node).

---

### Declaration files

- `declaration: true` is mainly for libraries or multi-package repos.
- For apps (not published), you can often set it to `false`.

If you publish to npm, declarations are basically non-negotiable.

---

### Source maps

- `sourceMap: true` helps debugging.
- Can be disabled for certain production builds, but many keep it on for better stack traces.

---

### Strictness options

Your config already includes:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

That’s a strong baseline. It pushes you towards writing code that is correct _and_ explicit.

---

### JSX options

`jsx: "react-jsx"` is correct for modern React.

If you’re not using React at all, remove or change it:

- `preserve` (let bundler handle JSX transform)
- `react-jsx` (React)
- `react-jsxdev` (dev)
- `react` (older transform)

---

## Other important `tsconfig` features

### `include`, `exclude`, `files`

These decide which files belong to your project.

Example:

```jsonc
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["dist", "node_modules"],
}
```

- `files`: explicit list (rare for large projects)
- `include`: glob patterns (most common)
- `exclude`: omit patterns

If you don’t specify them, TS uses defaults that might surprise you in monorepos.

---

### `extends` (shared base configs)

You can share config across projects:

`tsconfig.json`:

```jsonc
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
  },
  "include": ["src"],
}
```

`tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
  },
}
```

This is common in monorepos.

---

### Path aliases: `baseUrl` + `paths`

Avoid ugly relative imports:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
    },
  },
}
```

Then:

```ts
import { foo } from "@/utils/foo";
```

⚠️ Important: your bundler/runtime must also understand these aliases (TS alone doesn’t rewrite runtime imports).

---

### Project references (`references`)

For big codebases / monorepos, references enable faster builds and clear boundaries.

```jsonc
{
  "files": [],
  "references": [{ "path": "./packages/shared" }, { "path": "./packages/api" }],
}
```

Referenced projects usually have:

```jsonc
{ "compilerOptions": { "composite": true } }
```

---

### Incremental builds

Speed up repeated builds:

```jsonc
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",
  },
}
```

Great in CI + large repos.

---

## Common real-world presets

### Node (ESM) app

```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "es2022",
    "lib": ["es2022"],
    "types": ["node"],
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
  },
  "include": ["src"],
}
```

### React app

```jsonc
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
  },
  "include": ["src"],
}
```

### Library package

```jsonc
{
  "compilerOptions": {
    "module": "esnext",
    "target": "es2019",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
  },
  "include": ["src"],
}
```

---

## Gotchas and best practices

- **Don’t confuse `target` and `lib`.**  
  `target` affects output JS, `lib` affects available built-in types.

- **If you use path aliases, configure your bundler too.**  
  TS won’t magically make runtime understand `@/…`.

- **Use `import type` with `verbatimModuleSyntax`.**  
  It prevents type imports from turning into runtime imports.

- **`skipLibCheck` is usually fine.**  
  If you hit weird library type issues, temporarily set it to `false` to debug.

- **If your build tool transpiles TS, consider `noEmit: true`.**  
  Then run `tsc --noEmit` in CI for type-checking only.

- **Pick the right module mode early.**  
  Switching between Node ESM/CJS later can be painful.

---
