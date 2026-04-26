# Section 16: Using JavaScript Libraries with TypeScript

## Table of Contents

- [Using JavaScript Libraries with TypeScript](#using-javascript-libraries-with-typescript)
- [Installing @types Packages](#installing-types-packages)
- [Using "declare" Manually](#using-declare-manually)
- [Libraries with Better TypeScript Support](#libraries-with-better-typescript-support)
- [Exploring Zod: A TypeScript-First Library](#exploring-zod-a-typescript-first-library)
- [Diving Deeper into Zod](#diving-deeper-into-zod)
- [Runtime vs Compile-Time Types with Zod](#runtime-vs-compile-time-types-with-zod)

---

## Using JavaScript Libraries with TypeScript

Most npm packages are written in plain JavaScript. TypeScript doesn't know their shapes — so without extra type info, every import is typed as `any`, and you lose all type safety.

```ts
import _ from 'lodash';

_.chunk([1, 2, 3, 4], 2);  // TypeScript has no idea what this returns
//  ^? any
```

There are three ways to fix this:

1. **Install `@types/*`** — community types from DefinitelyTyped (most common)
2. **Write your own `declare` statements** — for obscure libraries with no types
3. **Use a library that ships its own types** — the best experience

---

## Installing @types Packages

[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) is a community repo of TypeScript declarations for thousands of JS libraries. They're published under the `@types` scope.

```bash
npm install --save-dev @types/lodash
npm install --save-dev @types/express
npm install --save-dev @types/node
npm install --save-dev @types/uuid
```

After installing, TypeScript picks them up automatically — no config needed.

```ts
import _ from 'lodash';

const result = _.chunk([1, 2, 3, 4], 2);
//    ^? number[][]   ← fully typed now
```

### How to check if @types exists

```bash
npm info @types/some-library    # exists if it prints package info
```

Or search on [npmjs.com](https://www.npmjs.com) for `@types/your-library`.

### Version alignment

Keep `@types/foo` in sync with `foo`:

```json
{
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "@types/express": "^4.17.0" }  // major version should match
}
```

### Pros & Cons

| Pros | Cons |
|---|---|
| Zero config — install and use | Types may lag behind the library version |
| Community-maintained, battle-tested | Types can be incomplete or wrong |
| Works with any JS library | Extra devDependency to manage |

---

## Using "declare" Manually

When a library has no `@types` package, you can write your own ambient declarations to silence TypeScript errors and add basic types.

### Quick fix — declare the whole module as `any`

```ts
// src/declarations.d.ts
declare module 'some-untyped-library';
// Now TypeScript treats every import from it as `any` — not great, but unblocks you
```

### Better — declare the specific API you use

```ts
// src/declarations.d.ts
declare module 'some-chart-library' {
  export interface ChartOptions {
    type: 'bar' | 'line' | 'pie';
    data: number[];
    label?: string;
  }

  export function createChart(el: HTMLElement, options: ChartOptions): void;
  export function destroyChart(el: HTMLElement): void;
}
```

### Declare global variables (e.g. from a CDN script tag)

If a library is loaded via `<script>` and adds a global variable:

```html
<script src="https://cdn.example.com/analytics.js"></script>
```

```ts
// src/declarations.d.ts
declare const Analytics: {
  track(event: string, data?: Record<string, unknown>): void;
  identify(userId: string): void;
};
```

Now `Analytics.track(...)` is typed everywhere without any import.

### Best practices for manual declarations

- Put all custom declarations in a single `src/declarations.d.ts` file
- Type only what you actually use — don't try to mirror the full library API
- Add a comment linking to the library docs so future maintainers know where it came from
- Replace with proper `@types` if one becomes available

---

## Libraries with Better TypeScript Support

Some libraries ship their own TypeScript declarations inside the package itself (no `@types` needed). These tend to offer the best experience because types are maintained by the same people who write the code.

### How to tell if a library includes its own types

```bash
npm info some-library types    # prints the types entry if it exists
```

Or check `package.json` inside `node_modules/some-library`:

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts"   // ← ships its own types
}
```

### Libraries that ship their own types (no @types needed)

| Library | Category |
|---|---|
| `zod` | Schema validation |
| `prisma` | ORM / database |
| `trpc` | API layer |
| `axios` | HTTP client |
| `date-fns` | Date utilities |
| `zustand` | State management |
| `vite` | Build tool |
| `vitest` | Testing |
| `drizzle-orm` | ORM |

### Libraries that need @types

| Library | Install |
|---|---|
| `express` | `@types/express` |
| `lodash` | `@types/lodash` |
| `node` (built-ins) | `@types/node` |
| `jest` | `@types/jest` |
| `react` | `@types/react` |

**Rule of thumb:** prefer TypeScript-first libraries when choosing between equivalents. You'll get better autocomplete, fewer surprises, and types that stay in sync with the implementation.

---

## Exploring Zod: A TypeScript-First Library

Zod is a schema declaration and validation library. You define a schema once and get both **runtime validation** and **TypeScript types** from it.

### Install

```bash
npm install zod
```

### Basic usage

```ts
import { z } from 'zod';

// Define a schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']),
});

// Parse (throws on invalid data)
const user = UserSchema.parse({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
});

// Safe parse (returns { success, data } or { success, error })
const result = UserSchema.safeParse(unknownData);
if (result.success) {
  console.log(result.data.name);  // fully typed
} else {
  console.error(result.error.issues);  // structured error info
}
```

### Common schema types

```ts
z.string()
z.number()
z.boolean()
z.date()
z.undefined()
z.null()
z.any()
z.unknown()

z.literal('active')           // exact value
z.enum(['a', 'b', 'c'])       // union of literals
z.union([z.string(), z.number()])
z.array(z.string())
z.tuple([z.string(), z.number()])
z.record(z.string(), z.number())  // { [key: string]: number }
z.object({ ... })

// Optional and nullable
z.string().optional()         // string | undefined
z.string().nullable()         // string | null
z.string().nullish()          // string | null | undefined
```

### String validators

```ts
z.string().min(3)
z.string().max(100)
z.string().length(10)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/^\d{5}$/)
z.string().startsWith('prefix_')
z.string().trim()             // trims before validating
z.string().toLowerCase()
```

### Number validators

```ts
z.number().min(0)
z.number().max(100)
z.number().int()              // must be integer
z.number().positive()
z.number().negative()
z.number().multipleOf(5)
```

---

## Diving Deeper into Zod

### Transformations

Zod can transform data during parsing, not just validate it:

```ts
const DateSchema = z.string().transform((val) => new Date(val));

const date = DateSchema.parse('2024-01-15');
//    ^? Date  ← transformed from string to Date
```

```ts
const TrimmedString = z.string().trim().toLowerCase();

TrimmedString.parse('  HELLO  ');  // → 'hello'
```

### Default values

```ts
const ConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(3000),
  debug: z.boolean().default(false),
});

ConfigSchema.parse({});
// → { host: 'localhost', port: 3000, debug: false }
```

### Extending and merging schemas

```ts
const BaseSchema = z.object({ id: z.number(), createdAt: z.date() });
const UserSchema = z.object({ name: z.string(), email: z.string().email() });

// Merge two objects
const UserWithMeta = BaseSchema.merge(UserSchema);

// Extend an existing schema
const AdminSchema = UserSchema.extend({ permissions: z.array(z.string()) });

// Pick/omit fields
const PublicUser = UserSchema.pick({ name: true });
const NoEmail = UserSchema.omit({ email: true });
```

### Discriminated unions

```ts
const ResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), data: z.string() }),
  z.object({ status: z.literal('error'), message: z.string() }),
]);

// Zod uses 'status' to pick the right branch — faster and cleaner error messages
```

### Recursive schemas

```ts
type Category = { name: string; subcategories: Category[] };

const CategorySchema: z.ZodType<Category> = z.object({
  name: z.string(),
  subcategories: z.lazy(() => CategorySchema.array()),
});
```

### Custom validation with `.refine()`

```ts
const PasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords don't match", path: ['confirmPassword'] }
);
```

### Error handling

```ts
const result = UserSchema.safeParse(badData);

if (!result.success) {
  result.error.issues.forEach((issue) => {
    console.log(issue.path);     // ['email'] — where the error is
    console.log(issue.message);  // 'Invalid email'
    console.log(issue.code);     // 'invalid_string'
  });

  // Flatten to a simple { fieldName: string[] } map
  const flat = result.error.flatten();
  console.log(flat.fieldErrors);  // { email: ['Invalid email'] }
}
```

---

## Runtime vs Compile-Time Types with Zod

This is the core problem Zod solves.

### The gap TypeScript leaves

TypeScript types exist **only at compile time**. They're erased from the JavaScript output. So this is valid TypeScript but broken at runtime:

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

// TypeScript trusts you — no runtime check
async function getUser(): Promise<User> {
  const res = await fetch('/api/user');
  return res.json() as User;  // cast with no validation — dangerous!
}

// If the API returns { id: "abc", name: null } — TypeScript won't catch it
// Your app crashes at runtime with a type mismatch
```

### Zod bridges the gap

```ts
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// Infer the TypeScript type FROM the schema — single source of truth
type User = z.infer<typeof UserSchema>;
//   ^? { id: number; name: string; email: string }

async function getUser(): Promise<User> {
  const res = await fetch('/api/user');
  const data = await res.json();
  return UserSchema.parse(data);  // validated at runtime — throws if wrong shape
}
```

### z.infer — deriving types from schemas

```ts
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published', 'archived']),
});

type Product = z.infer<typeof ProductSchema>;
// Equivalent to:
// type Product = {
//   id: string;
//   name: string;
//   price: number;
//   tags: string[];
//   status: 'draft' | 'published' | 'archived';
// }
```

**You never write the type manually.** Change the schema → the type updates automatically.

### Where to validate

| Boundary | Validate with Zod? | Why |
|---|---|---|
| API response (fetch) | Yes | Server can return anything |
| Form input | Yes | Users can submit anything |
| URL params / query strings | Yes | Can be manipulated |
| `process.env` / config | Yes | Missing vars cause subtle bugs |
| Internal function calls | No | TypeScript already guarantees this |
| Database query results (with Prisma) | No | Prisma already validates |

### Environment variable validation (common pattern)

```ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),  // coerce: converts "3000" string to 3000
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_KEY: z.string().min(1),
});

// Validate at startup — fail fast if config is wrong
export const env = EnvSchema.parse(process.env);
//             ^? fully typed, autocompleted everywhere you import env
```

### Compile-time vs runtime — summary

| | TypeScript types | Zod schemas |
|---|---|---|
| When checked | Compile time only | Runtime (and compile time via inference) |
| Erased in output | Yes — no JS output | No — validation code runs in production |
| External data safe | No | Yes |
| Single source of truth | No (type + validation separately) | Yes (`z.infer` derives the type) |
| Performance cost | Zero | Small (parsing overhead) |

**The pattern to follow:** define Zod schemas at system boundaries (API, forms, env vars), infer TypeScript types from them with `z.infer`, and let TypeScript handle everything internal.
