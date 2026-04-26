# Section 15: Building TypeScript Projects

## Table of Contents

- [Problems with the TypeScript Compiler](#problems-with-the-typescript-compiler)
- [Building with Webpack](#building-with-webpack)
- [Building with ESBuild](#building-with-esbuild)
- [Using Vite](#using-vite)
- [Installing TypeScript Per-Project](#installing-typescript-per-project)
- [Making Sense of .d.ts Files](#making-sense-of-dts-files)
- [Importing Non-TS Files](#importing-non-ts-files)

---

## Problems with the TypeScript Compiler

`tsc` is a type-checker and transpiler, not a bundler. Running it alone leaves you with several gaps:

**What `tsc` does:**
- Type-checks your code
- Transpiles `.ts` → `.js`
- Respects `outDir`, `rootDir`, `target`, `module`

**What `tsc` does NOT do:**
- Bundle multiple files into one (unless using `outFile` + AMD — a legacy approach)
- Bundle assets (CSS, images, JSON)
- Optimise or minify output
- Handle non-TS imports (`.css`, `.svg`, `.png`)
- Run a dev server with HMR (hot module replacement)
- Tree-shake unused code

**Current project** runs just `tsc` via `npm run build`. That works for learning, but for any real app you need a bundler on top.

```
src/app.ts  →  tsc  →  dist/app.js   ← no bundling, no minification, no dev server
```

---

## Building with Webpack

Webpack is the most battle-tested bundler. It processes a dependency graph starting from an entry file and outputs optimised bundles.

### Setup

```bash
npm install --save-dev webpack webpack-cli ts-loader typescript
```

### webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],  // resolve .ts files without explicit extension
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',        // ts-loader calls tsc under the hood
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',           // 'production' enables minification
};
```

### tsconfig adjustments for Webpack

```json
{
  "compilerOptions": {
    "module": "es2015",   // Webpack handles module bundling, not tsc
    "sourceMap": true     // enables browser devtools debugging
    // remove "outFile" — Webpack controls the output
  }
}
```

### package.json scripts

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development"  // needs webpack-dev-server
  }
}
```

### Pros & Cons

| Pros | Cons |
|---|---|
| Extremely configurable | Complex config for large projects |
| Huge ecosystem of loaders/plugins | Slow cold-start on big projects |
| CSS, images, fonts — handles everything | Steep learning curve |
| Mature, production-proven | Verbose config vs modern alternatives |

---

## Building with ESBuild

ESBuild is written in Go and is 10–100x faster than Webpack. Minimal config, great for CI and large codebases.

### Setup

```bash
npm install --save-dev esbuild
```

### Build script (package.json)

```json
{
  "scripts": {
    "build": "esbuild src/app.ts --bundle --outfile=dist/bundle.js --platform=browser",
    "dev": "esbuild src/app.ts --bundle --outfile=dist/bundle.js --platform=browser --watch"
  }
}
```

### Or via JS config (esbuild.config.mjs)

```js
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  minify: true,  // for production
});
```

> **Important:** ESBuild strips types but does **not** type-check. Run `tsc --noEmit` separately for type checking.

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && esbuild src/app.ts --bundle --outfile=dist/bundle.js"
  }
}
```

### Pros & Cons

| Pros | Cons |
|---|---|
| Extremely fast (Go-based) | No type checking — must run tsc separately |
| Minimal config | Smaller plugin ecosystem than Webpack |
| Great for CI pipelines | Less mature for complex asset pipelines |
| Handles TS, JSX, CSS modules out of the box | |

---

## Using Vite

Vite is the modern default for frontend TypeScript projects. It uses ESBuild for dev (fast) and Rollup for production builds (optimised).

### Setup (new project)

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app && npm install && npm run dev
```

### Add to existing project

```bash
npm install --save-dev vite
```

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Move `index.html` to the project root (Vite uses it as the entry point, not `src/`):

```html
<!-- index.html -->
<script type="module" src="/src/app.ts"></script>  <!-- Vite handles .ts directly -->
```

### tsconfig for Vite

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",  // Vite's resolution mode
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Pros & Cons

| Pros | Cons |
|---|---|
| Near-instant dev server startup (ESBuild) | Rollup-based prod builds differ from dev (ESBuild) |
| HMR out of the box | Slightly more opinionated than Webpack |
| Native ESM in dev — no bundling during development | Less suited for non-browser targets (Node apps) |
| TypeScript, CSS, JSON, assets — all work without config | |
| Great DX with framework plugins (React, Vue, Svelte) | |

**TL;DR — pick one:**
- **Vite** → frontend apps, best DX, modern default
- **ESBuild** → CI pipelines, libraries, speed-critical builds
- **Webpack** → complex legacy projects or when you need maximum plugin flexibility

---

## Installing TypeScript Per-Project

Avoid global TypeScript installs. Pin the version per project so everyone on the team compiles with the same `tsc`.

### Install locally

```bash
npm install --save-dev typescript
```

### Run the local tsc

```bash
npx tsc              # uses node_modules/.bin/tsc
npx tsc --version    # verify which version you're running
```

### package.json

```json
{
  "scripts": {
    "build": "tsc",       // uses local tsc, not global
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

### Why this matters

| Global install | Per-project install |
|---|---|
| All projects share one version | Each project pins its own version |
| Upgrading TS can break other projects | Upgrade one project at a time |
| CI machine version may differ from local | `package-lock.json` locks the exact version |
| `tsc` available everywhere | Run via `npx tsc` or npm scripts |

> Always commit `package-lock.json` (or `yarn.lock` / `pnpm-lock.yaml`) so CI uses the exact same TS version as you.

---

## Making Sense of .d.ts Files

`.d.ts` files are **declaration files** — they describe the types of a module without any runtime code. They're the bridge between JavaScript libraries and TypeScript.

```ts
// math.js  (plain JavaScript — no types)
export function add(a, b) { return a + b; }

// math.d.ts  (declaration file — types only, no runtime code)
export declare function add(a: number, b: number): number;
```

### Where they come from

**1. TypeScript libraries** ship their own `.d.ts` alongside `.js` files — you get types automatically.

**2. DefinitelyTyped (`@types/*`)** — community-maintained types for JS libraries:

```bash
npm install --save-dev @types/lodash   # types for lodash
npm install --save-dev @types/node     # types for Node.js built-ins
```

**3. Generated by `tsc`** — enable `"declaration": true` in tsconfig to emit `.d.ts` files for your own library:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./types"
  }
}
```

**4. Hand-written** — for libraries with no types at all (see next section).

### skipLibCheck

```json
{ "compilerOptions": { "skipLibCheck": true } }
```

Skips type-checking `.d.ts` files from `node_modules`. Almost always the right call — faster builds, avoids conflicts between library type versions.

### Reading a .d.ts file

```ts
// node_modules/@types/lodash/index.d.ts (simplified)
export declare function chunk<T>(array: T[], size?: number): T[][];
export declare function debounce<T extends (...args: any) => any>(
  func: T,
  wait?: number
): T;
```

No function bodies — just shapes. TypeScript uses these shapes to type-check your code; the actual JS in `node_modules/lodash` runs at runtime.

---

## Importing Non-TS Files

TypeScript only understands `.ts`, `.tsx`, `.js`, and `.d.ts` by default. Importing CSS, images, or other assets causes a type error unless you tell TypeScript what they are.

### CSS Modules

```ts
import styles from './app.module.css'; // Error: cannot find module
```

Fix — create a declaration file (e.g. `src/declarations.d.ts`):

```ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

### Images & SVGs

```ts
import logo from './logo.svg'; // Error without declaration
```

```ts
// declarations.d.ts
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}
```

### JSON files

TypeScript supports JSON imports natively with two tsconfig options:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,   // allows importing .json files
    "esModuleInterop": true
  }
}
```

```ts
import config from './config.json';  // fully typed — TS infers the shape
console.log(config.apiUrl);          // typed as string
```

### Wildcard module declarations

For anything else (fonts, WASM, text files):

```ts
// declarations.d.ts
declare module '*.wasm' {
  const url: string;
  export default url;
}

declare module '*.txt' {
  const content: string;
  export default content;
}
```

### Bundler support

Vite and Webpack handle the actual loading of these files at runtime via loaders/plugins. The `.d.ts` declarations just tell TypeScript "trust me, this import is valid and has this type." Without the bundler, importing a CSS file would still fail at runtime even if TypeScript is happy.

| File type | TypeScript fix | Bundler needed |
|---|---|---|
| `.json` | `resolveJsonModule: true` | No (Node handles it) |
| `.css` / `.module.css` | Custom `*.css` declaration | Yes (css-loader / Vite) |
| `.svg` / `.png` | Custom `*.svg` declaration | Yes (asset handling) |
| `.wasm` | Custom `*.wasm` declaration | Yes |
