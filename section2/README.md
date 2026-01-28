# TypeScript Feature Cheatsheet (with examples)

This guide explains common TypeScript features with practical examples and a few “gotchas” that tend to bite in real projects. All examples assume **`"strict": true`** in your `tsconfig.json`.

## Table of contents

- [Union types](#union-types)
- [Generic types](#generic-types)
- [Tuples](#tuples)
- [Record type](#record-type)
- [Enums](#enums)
- [Literal types](#literal-types)
- [Type aliases and custom types](#type-aliases-and-custom-types)
- [Function return value types](#function-return-value-types)
- [The `void` type](#the-void-type)
- [The `never` type](#the-never-type)
- [Functions as types](#functions-as-types)
- [Type narrowing](#type-narrowing)
- [Type casting (type assertions)](#type-casting-type-assertions)
- [The `unknown` type](#the-unknown-type)
- [Optional values](#optional-values)
- [Nullish coalescing (`??`)](#nullish-coalescing-)
- [Bonus: optional chaining (`?.`)](#bonus-optional-chaining-)
- [Suggested next step](#suggested-next-step)

---

## Union types

A **union type** means a value can be _one of several types_.

```ts
type Id = string | number;

function printId(id: Id) {
  console.log(id);
}

printId("abc");
printId(123);
```

### Why they’re useful

- Modeling input that can come in more than one shape (e.g., legacy API + new API).
- Representing “either success or error”.
- Building small “state machines” (loading/error/success).

### Important: you must narrow unions

If you have `string | number`, you can’t call string-only methods until you narrow:

```ts
function normalize(input: string | number) {
  // input.toUpperCase(); // ❌ can't, input might be number

  if (typeof input === "string") {
    return input.trim().toUpperCase();
  }
  return input.toFixed(0);
}
```

### Prefer discriminated unions for complex cases

Instead of “optional fields everywhere”, give each variant a `kind`/`status` field:

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code?: string };

function handle(r: Result<number>) {
  if (r.ok) console.log(r.value);
  else console.error(r.error, r.code);
}
```

---

## Generic types

**Generics** let you write reusable, type-safe code that works for many types.

### Generic function (classic)

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const a = first([1, 2, 3]); // number | undefined
const b = first(["a", "b"]); // string | undefined
```

### Generic type alias (common in APIs)

```ts
type ApiResponse<T> = {
  data: T;
  status: number;
  requestId: string;
};

type User = { id: string; name: string };

const response: ApiResponse<User> = {
  data: { id: "1", name: "Nuno" },
  status: 200,
  requestId: "req_123",
};
```

### Constraining generics

Sometimes you need “T must have an id”:

```ts
type HasId = { id: string };

function indexById<T extends HasId>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((i) => [i.id, i])) as Record<string, T>;
}
```

### Default generics

Useful when callers usually want one type but can override:

```ts
type Paginated<T = unknown> = {
  items: T[];
  page: number;
  total: number;
};
```

### Common pitfall: over-generic code

If a generic makes usage harder without real reuse, keep it simple. Generics are power tools—great, but you can cut your hand.

---

## Tuples

A **tuple** is an array with a fixed length and fixed element types per position.

```ts
type Point2D = [x: number, y: number];

const p: Point2D = [10, 20];
```

### When tuples shine

- Function returns with multiple values
- “pair” data structures
- Interop with some libraries

Example: `[value, error]` pattern:

```ts
type ParseResult = [value: number, error?: string];

const ok: ParseResult = [42];
const bad: ParseResult = [0, "Invalid input"];
```

### Tuple vs array

A tuple is not “array of numbers”—it’s specifically **two numbers in order**:

```ts
const nums: number[] = [10, 20, 30];
const point: [number, number] = [10, 20];
// const badPoint: [number, number] = [10, 20, 30]; // ❌
```

### Tip: label tuple elements

Labels don’t affect runtime but help readability:

```ts
type RGB = [r: number, g: number, b: number];
```

---

## Record type

`Record<K, V>` describes an object whose keys are `K` and values are `V`.

```ts
type Role = "admin" | "user";

const permissions: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  user: ["read"],
};
```

### Why it’s handy

- Forces you to provide **all keys** in `K` (great for completeness).
- Helps build “lookup tables”.

### Record vs index signature

Index signature is “any string key”, Record is “only these keys”:

```ts
type Loose = { [key: string]: number };
type Strict = Record<"a" | "b", number>;

const x: Loose = { anyKey: 1 };
const y: Strict = { a: 1, b: 2 };
// const z: Strict = { a: 1 }; // ❌ missing b
```

### Real-world example: mapping statuses to UI labels

```ts
type Status = "loading" | "error" | "success";

const labels: Record<Status, string> = {
  loading: "Loading...",
  error: "Something went wrong",
  success: "All good!",
};
```

---

## Enums

`enum` creates a set of named constants. There are **numeric enums** and **string enums**.

### String enum (usually safer)

```ts
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Error = "ERROR",
}

function isDone(status: Status) {
  return status === Status.Success || status === Status.Error;
}
```

### Numeric enums (be careful)

Numeric enums generate reverse mappings at runtime and can be confusing:

```ts
enum Mode {
  Off,
  On,
}
Mode.Off === 0; // true
```

### Common best practice: prefer `as const` objects

This gives you:

- great type inference
- zero enum runtime quirks (still runtime values, but plain objects)
- easy integration with JSON / APIs

```ts
const Status2 = {
  Pending: "PENDING",
  Success: "SUCCESS",
  Error: "ERROR",
} as const;

type Status2 = (typeof Status2)[keyof typeof Status2];

function setStatus(s: Status2) {}
setStatus(Status2.Success);
```

**Rule of thumb:** If you don’t need enum-specific behavior, use `as const` + union.

---

## Literal types

A **literal type** is a specific value as a type.

```ts
type Direction = "left" | "right" | "up" | "down";
```

### Why it’s useful

- Strong constraints (you can’t pass “north” if it’s not allowed).
- Better autocomplete.
- Works brilliantly with unions + narrowing.

```ts
function move(dir: Direction) {}
move("left");
// move("north"); // ❌
```

### `as const` creates literal types

Without `as const`, TS widens values:

```ts
const a = "left"; // type is "left"
const b = { dir: "left" }; // type is { dir: string }  (widened!)
const c = { dir: "left" } as const; // type is { readonly dir: "left" }
```

---

## Type aliases and custom types

A **type alias** gives a name to a type.

```ts
type UserId = string;

type User = {
  id: UserId;
  name: string;
};
```

### Aliases don’t prevent mixing types

`type UserId = string` is still just `string`, so you can accidentally pass an email where a UserId is expected.

### Branded/opaque custom types (stronger)

```ts
type UserId2 = string & { readonly __brand: "UserId" };

function asUserId(value: string): UserId2 {
  if (!/^usr_[a-z0-9]+$/i.test(value)) throw new Error("Invalid user id");
  return value as UserId2;
}

function loadUser(id: UserId2) {}

const id = asUserId("usr_abc123");
loadUser(id);
// loadUser("usr_abc123"); // ❌ won't compile (good!)
```

### Tip: keep branding at boundaries

Don’t brand everything—brand identifiers and other values where mixing would be expensive.

---

## Function return value types

TypeScript can often infer return types, but you may want to **annotate** them to:

- lock down a public API,
- prevent accidental breaking changes,
- document intent.

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

### Prefer explicit returns on exported/public functions

For internal functions, inference is usually fine. For exported ones, explicit types are great.

### Returning unions (success/error patterns)

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseIntSafe(input: string): Result<number> {
  const n = Number.parseInt(input, 10);
  return Number.isNaN(n)
    ? { ok: false, error: "Not a number" }
    : { ok: true, value: n };
}
```

### Async return types

```ts
async function fetchUser(id: string): Promise<{ id: string; name: string }> {
  // ...
  return { id, name: "Nuno" };
}
```

---

## The `void` type

`void` means a function **does not return a meaningful value**.

```ts
function logMessage(msg: string): void {
  console.log(msg);
}
```

### `void` is common in callbacks

```ts
function onClick(handler: () => void) {
  // call handler later
}
```

### Subtlety: `void` vs `undefined`

- A `void` function returns `undefined` at runtime.
- But `void` as a type means “ignore the result”.

Example: `Array.prototype.forEach` takes a callback returning `void`, because the return value is ignored.

---

## The `never` type

`never` means something **cannot happen**:

- a function always throws,
- an infinite loop,
- an unreachable branch.

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

### Exhaustiveness checking (a must-have pattern)

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "square":
      return s.size ** 2;
    default: {
      const _exhaustive: never = s; // 🔥 compile error if a new variant is added
      return _exhaustive;
    }
  }
}
```

This is how you make refactors safer: add a new union variant → compiler guides you to all missing cases.

---

## Functions as types

You can describe a function using a **function type**.

```ts
type Comparator<T> = (a: T, b: T) => number;

const byNumberAsc: Comparator<number> = (a, b) => a - b;
```

### Function types in parameters

```ts
function map<T, R>(items: T[], fn: (item: T) => R): R[] {
  return items.map(fn);
}
```

### Call signatures (object that is callable)

Sometimes a function has extra properties:

```ts
type Logger = {
  (msg: string): void; // callable
  level: "debug" | "info" | "error";
};

const logger: Logger = Object.assign((msg: string) => console.log(msg), {
  level: "info" as const,
});
```

---

## Type narrowing

**Narrowing** is how TypeScript reduces a broad type (like a union) to a more specific one.

### `typeof` for primitives

```ts
function format(value: string | number) {
  if (typeof value === "number") return value.toFixed(2);
  return value.toUpperCase();
}
```

### Truthiness checks (careful with empty strings/0)

```ts
function printName(name: string | null) {
  if (name == null) return; // checks null OR undefined
  console.log(name.toUpperCase());
}
```

### `in` operator for object shapes

```ts
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function speak(pet: Cat | Dog) {
  if ("meow" in pet) pet.meow();
  else pet.bark();
}
```

### `instanceof` for classes

```ts
function handle(e: Error | TypeError) {
  if (e instanceof TypeError) {
    // ...
  }
}
```

### User-defined type guards (super useful)

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function shout(value: unknown) {
  if (!isString(value)) return;
  console.log(value.toUpperCase());
}
```

### Discriminated unions (the cleanest narrowing)

```ts
type ApiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: string[] };

function render(state: ApiState) {
  switch (state.status) {
    case "success":
      return state.data.join(", ");
    case "error":
      return state.message;
    case "loading":
      return "Loading...";
    default: {
      const _x: never = state;
      return _x;
    }
  }
}
```

---

## Type casting (type assertions)

Type assertions tell TS “treat this value as this type”. Use them sparingly and mostly at **boundaries** (DOM, JSON, external libs).

```ts
const el = document.querySelector("#app") as HTMLDivElement;
```

### Prefer narrowing checks when possible

```ts
const el2 = document.querySelector("#app");
if (!(el2 instanceof HTMLDivElement)) {
  throw new Error("Expected #app to be a div");
}
// el2 is HTMLDivElement here
```

### Non-null assertion `!` (use carefully)

```ts
const el3 = document.querySelector("#app")!;
```

This says “trust me, it’s not null”. If it _is_ null, you’ll crash at runtime—so only use it when you truly control the environment.

### Smell: double assertion

```ts
const x = someValue as any as MyType; // 🚫 usually a smell
```

If you find yourself doing this, you probably need runtime validation or better narrowing.

---

## The `unknown` type

`unknown` is the safe alternative to `any`. You must narrow it before using it.

```ts
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

const data = parseJson('{"x": 1}');
// data.x // ❌ Property 'x' does not exist on type 'unknown'
```

### Narrow with runtime checks

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

if (isRecord(data) && typeof data["x"] === "number") {
  console.log(data["x"] + 1);
}
```

### Why `unknown` is great at boundaries

- `fetch()` JSON
- `localStorage`
- environment variables
- third-party payloads

You validate once, then the rest of your code stays clean and safe.

---

## Optional values

Optional properties use `?`.

```ts
type UserProfile = {
  name: string;
  bio?: string;
};

const u: UserProfile = { name: "Nuno" };
```

### Optional means “may be missing or undefined”

So you must handle it:

```ts
function renderBio(p: UserProfile) {
  return p.bio?.trim() ?? "No bio yet";
}
```

### Optional parameters

```ts
function greet(name: string, title?: string) {
  return title ? `${title} ${name}` : name;
}
```

### `exactOptionalPropertyTypes` note

If enabled, `bio?: string` is **not** the same as `bio: string | undefined` in assignments. This catches subtle bugs and makes optional properties more precise.

---

## Nullish coalescing (`??`)

`??` falls back only when the left side is **null or undefined**, not when it’s falsy like `0` or `""`.

```ts
const pageSize = userInput ?? 20;
```

### `??` vs `||`

```ts
const a = 0 || 10; // 10  (0 is falsy)
const b = 0 ?? 10; // 0   (0 is not null/undefined)

const c = "" || "x"; // "x"
const d = "" ?? "x"; // ""
```

### Great for defaults with optional chaining

```ts
type Config = { api?: { timeoutMs?: number } };

function getTimeout(cfg: Config) {
  return cfg.api?.timeoutMs ?? 5000;
}
```

---

## Bonus: optional chaining (`?.`)

Optional chaining safely stops access when something is `null`/`undefined`.

```ts
const city = user.address?.city ?? "Unknown";
```

It works for:

- property access: `obj?.prop`
- array access: `arr?.[0]`
- function calls: `fn?.()`

---

## Suggested next step

If you want to go from “syntax” to “mastery”, I can extend this file with:

- `keyof`, `typeof`, indexed access types (`T[K]`)
- `satisfies` (highly recommended)
- mapped types + utility types (`Partial`, `Pick`, `Omit`, `Readonly`)
- template literal types (e.g. ``type Route = `/users/${string}` ``)
- runtime validation patterns (Zod/Valibot) and pairing them with `unknown`
- a small “mini-project” section that ties all of this together (API DTO → parse → domain types → result union)
