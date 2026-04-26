# Section 14: Namespaces & ES Modules in TypeScript

## Table of Contents

- [Namespaces](#namespaces)
  - [Referencing across files](#referencing-across-files)
- [The Problem with Namespaces](#the-problem-with-namespaces)
- [ES Modules (the modern way)](#es-modules-the-modern-way)
- [tsconfig for ES Modules vs Namespaces](#tsconfig-for-es-modules-vs-namespaces)
- [Import & Export Syntax Cheatsheet](#import--export-syntax-cheatsheet)
- [Type Imports](#type-imports)
- [How Module Code Executes](#how-module-code-executes)
- [Pros & Cons](#pros--cons)
- [Best Practices](#best-practices)

---

## Namespaces

TypeScript namespaces wrap code in a named scope to avoid polluting the global namespace.

```ts
namespace App {
  export class Project { ... }   // exported = visible to other files in the same namespace
  class InternalHelper { ... }   // NOT exported = private to this file
}

// Usage (same namespace, another file):
const p = new App.Project(...)
```

### Referencing across files

Namespaces alone don't auto-import anything. You must use **triple-slash directives** to tell TypeScript (and the bundler) about dependencies:

```ts
/// <reference path="base-component.ts" />
/// <reference path="../models/project.ts" />

namespace App {
  export class ProjectInput extends Component<...> { ... }
}
```

**Order matters.** The entry file (`app.ts`) must pull in everything — or the dependency chain must be correct bottom-up.

---

## The Problem with Namespaces

- **Manual dependency management.** Every file needs `/// <reference path="..." />`. Miss one → runtime crash, no clear error.
- **Requires `outFile`** bundling (AMD or SystemJS only). Not compatible with Node.js `require` or native browser ESM.
- **No tree-shaking.** Everything ends up in one bundle, used or not.
- **Refactoring pain.** Move a file → update all reference paths manually.
- **No circular dep detection.** Circular namespace references silently produce broken runtime code.

**Bottom line:** Namespaces were TypeScript's pre-module solution. They still work, but ES Modules are the right choice today.

---

## ES Modules (the modern way)

Every file is its own module. Explicit `import`/`export` — no globals, no reference paths.

```ts
// models/project.ts
export enum ProjectStatus { Active, Finished }
export class Project { ... }

// state/project-state.ts
import { Project, ProjectStatus } from '../models/project.js'; // note: .js extension at runtime
export const projectState = ProjectState.getInstance();

// app.ts
import { ProjectInput } from './components/project-input.js';
import { ProjectList } from './components/project-list.js';
```

---

## tsconfig for ES Modules vs Namespaces

| Option | Namespaces | ES Modules |
|---|---|---|
| `"module"` | `"amd"` or `"system"` | `"es2015"` / `"esnext"` / `"commonjs"` |
| `"outFile"` | Required (bundles all files) | Remove it — bundler or Node handles it |
| `"outDir"` | `"./dist"` | `"./dist"` |
| `"rootDir"` | `"./src"` | `"./src"` |

**Current project** uses `"module": "amd"` + `"outFile": "./dist/bundle.js"` — the namespace approach. To switch to ESM:

```json
{
  "compilerOptions": {
    "module": "es2015",
    "target": "es6"
    // remove "outFile"
  }
}
```

And in `index.html`:
```html
<script type="module" src="dist/app.js"></script>
```

---

## Import & Export Syntax Cheatsheet

```ts
// Named export
export class Foo {}
export const bar = 42;
export function baz() {}

// Default export (one per file)
export default class Foo {}

// Named import
import { Foo, bar } from './foo.js';

// Default import
import Foo from './foo.js';

// Rename on import
import { Foo as MyFoo } from './foo.js';

// Import everything into a namespace object
import * as Utils from './utils.js';
Utils.validate(...)

// Re-export (barrel pattern)
export { Foo } from './foo.js';
export * from './utils.js';

// Type-only import (erased at compile time, zero runtime cost)
import type { Project } from './models/project.js';
```

---

## Type Imports

`import type` is erased entirely at compile time — it never ends up in the emitted JS.

```ts
// Good: type-only, zero runtime overhead
import type { Project } from './models/project.js';

function render(project: Project) { ... }

// Bad: imports the whole module at runtime just for a type
import { Project } from './models/project.js';
```

**When to use `import type`:**
- Importing interfaces, type aliases, or enums used only as types
- Avoiding circular dependency issues caused by runtime imports
- Keeping bundles lean (especially useful with `isolatedModules: true`)

---

## How Module Code Executes

Modules execute **once**, when first imported. Every subsequent import gets the same cached instance.

```ts
// logger.ts
console.log('logger loaded'); // prints ONCE, no matter how many files import this
export const log = (msg: string) => console.log(msg);

// a.ts
import { log } from './logger.js'; // 'logger loaded' prints here

// b.ts
import { log } from './logger.js'; // logger.ts does NOT run again
```

This is why singletons via module-level variables work:

```ts
// project-state.ts
const instance = new ProjectState(); // created once
export { instance as projectState };
```

No class-level singleton pattern needed — the module system already guarantees a single instance.

---

## Pros & Cons

### Namespaces

| Pros | Cons |
|---|---|
| Simple to set up for small scripts | Manual `/// <reference>` chains break easily |
| Single output file (no bundler needed) | No tree-shaking |
| Familiar for C# / Java developers | AMD/System only — not compatible with Node or native ESM |
| Nesting gives logical grouping | Refactoring reference paths is painful |

### ES Modules

| Pros | Cons |
|---|---|
| Standard — works in Node, browsers, all bundlers | Requires a build step or bundler for older browsers |
| Explicit imports = clear dependency graph | `.js` extension quirks with TypeScript (you write `.js`, TS resolves `.ts`) |
| Tree-shakeable | More boilerplate than namespaces for tiny scripts |
| Circular dep detection by tools | |
| `import type` for zero-cost type imports | |

---

## Best Practices

1. **Use ES Modules** for any real project. Namespaces are legacy.
2. **Always use `import type`** when importing something only used as a type — it makes intent clear and avoids circular dep issues.
3. **Use barrel files** (`index.ts`) to re-export from a folder so consumers import from one place:
   ```ts
   // components/index.ts
   export { ProjectInput } from './project-input.js';
   export { ProjectList } from './project-list.js';

   // app.ts
   import { ProjectInput, ProjectList } from './components/index.js';
   ```
4. **Don't mix namespaces and ES Modules** — pick one and be consistent.
5. **Keep `outFile` only if you're using namespaces with AMD**. Remove it when switching to ESM.
6. **Enable `"isolatedModules": true`** in new projects — it forces each file to be a valid standalone module and catches issues early.
7. **Module-level singletons > class-level singletons** — rely on the module cache instead of writing `getInstance()` patterns.
