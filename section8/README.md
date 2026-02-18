# Section 8 — Generic Types in TypeScript

## Table of Contents

1. [What Are Generics?](#1-what-are-generics)
2. [Creating and Using a Generic Type](#2-creating-and-using-a-generic-type)
3. [Generic Functions and Inference](#3-generic-functions-and-inference)
4. [Working with Multiple Generic Parameters](#4-working-with-multiple-generic-parameters)
5. [Generics and Constraints](#5-generics-and-constraints)
6. [Constraints and Multiple Generic Types](#6-constraints-and-multiple-generic-types)
7. [Working with Generic Classes and Interfaces](#7-working-with-generic-classes-and-interfaces)
8. [Modern TypeScript — What Else You Should Know](#8-modern-typescript--what-else-you-should-know)
   - [Built-in Utility Types](#built-in-utility-types)
   - [Const Type Parameters](#const-type-parameters-typescript-50)
   - [Conditional Types and `infer`](#conditional-types-and-infer)
   - [Template Literal Types with Generics](#template-literal-types-with-generics)
   - [`NoInfer<T>`](#nofert-typescript-54)
   - [Inferred Type Predicates](#inferred-type-predicates-typescript-55)
   - [Variadic Tuple Types](#variadic-tuple-types)
9. [Best Practices](#9-best-practices)
10. [What to Avoid](#10-what-to-avoid)
11. [Summary](#11-summary)

---

## 1. What Are Generics?

Generics allow you to write **reusable, type-safe code** that works with a variety of types without sacrificing type information. Instead of hardcoding a specific type (or falling back to `any`), you define a **type parameter** — a placeholder filled in at the point of use.

```ts
// Without generics — you lose type info
function identity(value: any): any {
  return value;
}

// With generics — type is preserved
function identity<T>(value: T): T {
  return value;
}

const result = identity("hello"); // TypeScript knows result is string
```

The `<T>` is the **type parameter**. By convention, single uppercase letters are used (`T`, `U`, `K`, `V`), but descriptive names are encouraged when they improve readability.

---

## 2. Creating and Using a Generic Type

You can define generic type aliases that act as reusable type "templates":

```ts
// Generic type alias
type Box<T> = {
  value: T;
  label: string;
};

// Usage — T is filled in at the point of use
const numberBox: Box<number> = { value: 42, label: "age" };
const stringBox: Box<string> = { value: "hello", label: "greeting" };
```

You can also create generic types that build on other types:

```ts
type Nullable<T> = T | null;
type Optional<T> = T | null | undefined;

type ApiResponse<T> = {
  data: T;
  status: number;
  error: string | null;
};

const response: ApiResponse<{ id: number; name: string }> = {
  data: { id: 1, name: "Alice" },
  status: 200,
  error: null,
};
```

**When to use a generic type alias vs an interface:**
- Use `type` for unions, intersections, mapped types, and conditional types.
- Use `interface` when you expect the type to be extended or implemented by a class.

---

## 3. Generic Functions and Inference

TypeScript can **infer** type parameters from the arguments you pass — you rarely need to write them explicitly.

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}

// TypeScript infers T = number automatically
const wrapped = wrap(42);      // { value: number }
const wrappedStr = wrap("hi"); // { value: string }
```

### When inference works well

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNum = first([1, 2, 3]);   // inferred as number | undefined
const firstStr = first(["a", "b"]);  // inferred as string | undefined
```

### When to be explicit

Inference sometimes widens to a broader type than you want. In those cases, supply the type argument explicitly:

```ts
// TypeScript infers string[], but you want a tuple ["a", "b"]
const inferred = wrap(["a", "b"]);         // T = string[]
const explicit = wrap<["a", "b"]>(["a", "b"]); // T = ["a", "b"] — literal tuple
```

### Return type inference

TypeScript infers the return type of a generic function automatically:

```ts
function transform<TInput, TOutput>(
  items: TInput[],
  fn: (item: TInput) => TOutput
): TOutput[] {
  return items.map(fn);
}

const lengths = transform(["hello", "world"], (s) => s.length);
// lengths is inferred as number[]
```

---

## 4. Working with Multiple Generic Parameters

A function or type can have more than one type parameter when two or more independent types need to be tracked:

```ts
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b } as T & U;
}

const merged = merge({ name: "Alice" }, { age: 30 });
// merged is { name: string; age: number }
```

### Real-world example — key/value pair

```ts
function pair<TKey, TValue>(key: TKey, value: TValue): [TKey, TValue] {
  return [key, value];
}

const entry = pair("id", 123); // [string, number]
```

### Map / transform with two type params

```ts
function mapObject<TKey extends string, TValue, TResult>(
  obj: Record<TKey, TValue>,
  fn: (value: TValue, key: TKey) => TResult
): Record<TKey, TResult> {
  const result = {} as Record<TKey, TResult>;
  for (const key in obj) {
    result[key] = fn(obj[key], key);
  }
  return result;
}

const scores = { alice: 10, bob: 8 };
const doubled = mapObject(scores, (v) => v * 2);
// { alice: number; bob: number }
```

---

## 5. Generics and Constraints

Without constraints, a type parameter `T` can be literally anything — you can't safely access properties on it. Use `extends` to **constrain** what `T` can be.

```ts
// T must have a .length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");        // 5
getLength([1, 2, 3]);      // 3
getLength({ length: 7 });  // 7
// getLength(42);           // Error — number has no .length
```

### `keyof` constraint

A very common pattern — constrain `K` to be a valid key of `T`, so you get safe property access:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Bob", age: 25 };

const name = getProperty(user, "name");  // string
const age  = getProperty(user, "age");   // number
// getProperty(user, "email");           // Error — "email" is not a key of user
```

### Constraining to a union

```ts
type Direction = "north" | "south" | "east" | "west";

function move<T extends Direction>(dir: T, steps: number): string {
  return `Moving ${steps} step(s) ${dir}`;
}

move("north", 3); // OK
// move("up", 3); // Error — "up" is not a Direction
```

---

## 6. Constraints and Multiple Generic Types

You can combine multiple type parameters with constraints, and one type parameter can even **depend on** another:

```ts
// K must be a key of T — K depends on T
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user = { id: 1, name: "Alice", email: "alice@example.com" };
const preview = pick(user, ["id", "name"]);
// { id: number; name: string }
```

### Dependent constraints across parameters

```ts
// TValue must be assignable to the element type of TArray
function appendItem<TArray extends unknown[], TValue extends TArray[number]>(
  arr: TArray,
  item: TValue
): [...TArray, TValue] {
  return [...arr, item];
}
```

### Chained generic constraints

```ts
function sortBy<TItem extends object, TKey extends keyof TItem>(
  items: TItem[],
  key: TKey
): TItem[] {
  return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1));
}

const users = [
  { name: "Charlie", age: 28 },
  { name: "Alice", age: 32 },
];

sortBy(users, "name"); // sorted alphabetically
sortBy(users, "age");  // sorted numerically
// sortBy(users, "email"); // Error — "email" is not a key of the item type
```

---

## 7. Working with Generic Classes and Interfaces

### Generic Interface

```ts
interface Repository<T> {
  findById(id: number): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: number): void;
}

interface User {
  id: number;
  name: string;
}

class UserRepository implements Repository<User> {
  private users: User[] = [];

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findAll(): User[] {
    return this.users;
  }

  save(user: User): void {
    this.users.push(user);
  }

  delete(id: number): void {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
```

### Generic Class

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
console.log(numStack.pop()); // 2

const strStack = new Stack<string>();
strStack.push("hello");
```

### Generic class with constraint

```ts
class KeyValueStore<TKey extends string | number, TValue> {
  private store = new Map<TKey, TValue>();

  set(key: TKey, value: TValue): void {
    this.store.set(key, value);
  }

  get(key: TKey): TValue | undefined {
    return this.store.get(key);
  }

  has(key: TKey): boolean {
    return this.store.has(key);
  }
}

const cache = new KeyValueStore<string, number>();
cache.set("score", 100);
cache.get("score"); // number | undefined
```

### Extending a generic class

```ts
// A concrete subclass locks in the type parameter
class NumberStack extends Stack<number> {
  sum(): number {
    return [...Array(this.size)].reduce((acc) => acc, 0);
  }
}

// A generic subclass that stays generic
class LimitedStack<T> extends Stack<T> {
  constructor(private readonly limit: number) {
    super();
  }

  push(item: T): void {
    if (this.size >= this.limit) {
      throw new Error(`Stack is full (limit: ${this.limit})`);
    }
    super.push(item);
  }
}
```

---

## 8. Modern TypeScript — What Else You Should Know

### Built-in Utility Types

TypeScript ships with a set of generic helpers that cover the most common type transformations:

| Utility              | Description                                        |
|----------------------|----------------------------------------------------|
| `Partial<T>`         | All properties of `T` become optional              |
| `Required<T>`        | All properties of `T` become required              |
| `Readonly<T>`        | All properties of `T` become read-only             |
| `Pick<T, K>`         | Keep only the specified keys from `T`              |
| `Omit<T, K>`         | Remove the specified keys from `T`                 |
| `Record<K, V>`       | Object type with keys `K` and values `V`           |
| `ReturnType<T>`      | Extract the return type of a function type         |
| `Parameters<T>`      | Extract the parameter types of a function as tuple |
| `Awaited<T>`         | Unwrap `Promise<T>` recursively                    |
| `NonNullable<T>`     | Remove `null` and `undefined` from `T`             |
| `Exclude<T, U>`      | Remove types in `U` from the union `T`             |
| `Extract<T, U>`      | Keep only types in `T` that are assignable to `U`  |

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser    = Partial<User>;               // all fields optional
type UserPreview    = Pick<User, "id" | "name">;   // only id and name
type UserWithoutId  = Omit<User, "id">;            // everything except id

async function fetchUser(): Promise<User> { /* ... */ return {} as User; }
type ResolvedUser   = Awaited<ReturnType<typeof fetchUser>>; // User
```

---

### Const Type Parameters (TypeScript 5.0+)

Before TypeScript 5.0, getting a generic function to infer a **literal / tuple type** instead of widening to `string[]` required workarounds like `as const`. Now you can add `const` to the type parameter itself:

```ts
// Without const — T is inferred as string[]
function makeArray<T>(items: T[]): T[] {
  return items;
}
const a = makeArray(["a", "b", "c"]); // string[]

// With const — T is inferred as the literal tuple ["a", "b", "c"]
function makeArrayConst<const T>(items: T): T {
  return items;
}
const b = makeArrayConst(["a", "b", "c"]); // readonly ["a", "b", "c"]
```

This is particularly useful for building APIs that need to capture exact literal types (e.g., route definitions, event names, configuration objects).

---

### Conditional Types and `infer`

Conditional types let you express logic at the type level: "if `T` extends `X`, use `Y`, otherwise `Z`".

```ts
type IsArray<T> = T extends unknown[] ? true : false;

type A = IsArray<string[]>;  // true
type B = IsArray<number>;    // false
```

**`infer`** lets you extract part of a type inside a conditional:

```ts
// Extract the element type from an array type
type ElementType<T> = T extends (infer E)[] ? E : never;

type Num = ElementType<number[]>;     // number
type Str = ElementType<string[]>;     // string
type No  = ElementType<boolean>;      // never

// Extract the resolved value from a Promise
type Unwrap<T> = T extends Promise<infer R> ? R : T;

type Resolved = Unwrap<Promise<string>>; // string
type Plain    = Unwrap<number>;          // number
```

This is how TypeScript's own `Awaited<T>`, `ReturnType<T>`, and `Parameters<T>` are implemented internally.

---

### Template Literal Types with Generics

You can combine template literal types with generics to produce precise string types:

```ts
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent  = EventName<"click">;   // "onClick"
type ChangeEvent = EventName<"change">;  // "onChange"

// Build a strongly-typed event handler map
type EventMap<T extends string> = {
  [K in T as EventName<K>]: () => void;
};

type ButtonEvents = EventMap<"click" | "focus" | "blur">;
// {
//   onClick: () => void;
//   onFocus: () => void;
//   onBlur:  () => void;
// }
```

This pattern is used by frameworks like Vue, Solid, and various form libraries to derive event types automatically.

---

### `NoInfer<T>` (TypeScript 5.4+)

`NoInfer<T>` tells TypeScript to **stop** using a particular position to infer `T`. This is handy when you want inference to come from one argument but not another:

```ts
// Without NoInfer — TypeScript uses both arguments to infer T
// so passing an invalid default widens the type instead of erroring
function createState<T>(initial: T, fallback: T): T {
  return initial ?? fallback;
}

// "hello" widens T to string | number instead of erroring
const s = createState(42, "hello"); // T inferred as string | number

// With NoInfer — inference only comes from `initial`; `fallback` must match
function createStateSafe<T>(initial: T, fallback: NoInfer<T>): T {
  return initial ?? fallback;
}

// Error: Argument of type 'string' is not assignable to parameter of type 'number'
const s2 = createStateSafe(42, "hello");
```

---

### Inferred Type Predicates (TypeScript 5.5+)

Before 5.5, TypeScript couldn't automatically infer that a filter callback was narrowing the type — you had to write an explicit type predicate. Now it can infer it:

```ts
const values = [1, null, 2, undefined, 3];

// Before 5.5 — you had to write: (v): v is number => v !== null
const numbers = values.filter((v) => v !== null);
// TypeScript 5.5+ infers: numbers is (number | undefined)[] — closer to correct

// Explicit type predicate still works and gives the most precise result
const numbersPrecise = values.filter((v): v is number => v != null);
// numbersPrecise is number[]
```

This reduces boilerplate in real-world array filtering and makes generic utility functions easier to write correctly.

---

### Variadic Tuple Types

Generics can capture and spread **tuple types**, allowing you to write type-safe wrappers around functions with arbitrary signatures:

```ts
// Prepend an element type to a tuple
type Prepend<T, Tuple extends unknown[]> = [T, ...Tuple];

type WithId = Prepend<number, [string, boolean]>; // [number, string, boolean]

// Typed function composition
function pipe<T extends unknown[], R>(
  fn: (...args: T) => R,
  ...args: T
): R {
  return fn(...args);
}

const add = (a: number, b: number) => a + b;
const result = pipe(add, 1, 2); // 3 — fully typed
```

This is the foundation for how libraries like `zod`, `trpc`, and `ts-rest` achieve end-to-end type safety across function boundaries.

---

## 9. Best Practices

**Use descriptive type parameter names when context is complex:**

```ts
// Single-letter T is fine for simple cases
function first<T>(arr: T[]): T | undefined { return arr[0]; }

// Descriptive names help when there are multiple parameters
function transform<TInput, TOutput>(
  items: TInput[],
  fn: (item: TInput) => TOutput
): TOutput[] {
  return items.map(fn);
}
```

**Prefer generics over `any`:**

```ts
// Bad — you lose all type information on the way out
function first(arr: any[]): any { return arr[0]; }

// Good — the return type matches the input element type
function first<T>(arr: T[]): T | undefined { return arr[0]; }
```

**Write the concrete version first, then extract the generic:**
Don't start with a generic. Write a function that works for one type, verify it, then parameterize it once you actually need reuse.

**Use constraints to communicate intent:**
Constraints are documentation. `<T extends { id: number }>` immediately tells the caller what `T` must provide.

---

## 10. What to Avoid

**Generics for their own sake:**

```ts
// Pointless — T is just string; use string directly
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}
```

**Unconstrained generics where a union or interface is clearer:**

```ts
// Too loose — what can you actually do with T?
function process<T>(value: T): void { console.log(value); }

// Better — explicit about what's accepted
function process(value: string | number): void { console.log(value); }
```

**Too many type parameters:**

```ts
// Hard to follow — probably doing too much
function complicated<A, B, C, D>(a: A, b: B, c: C): D { /* ... */ }
```

If you need four or more type params, consider splitting the function.

**Casting away generics with `as`:**

```ts
// The cast hides a real type error — fix the logic instead
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b } as T & U; // "as" here suppresses a legitimate warning
}
```

---

## 11. Summary

| Concept                    | When to use                                                    |
|----------------------------|----------------------------------------------------------------|
| Basic generic `<T>`        | When a function/class should work with any type                |
| Constraint `extends`       | When `T` must have a specific shape or property                |
| Multiple params `<T, U>`   | When two or more independent types need to be tracked          |
| `keyof T`                  | When working with object keys dynamically                      |
| Conditional types + `infer`| When you need to extract or transform parts of a type          |
| `const T` (TS 5.0+)        | When you need literal/tuple inference without `as const`       |
| `NoInfer<T>` (TS 5.4+)     | When you want to control which argument drives inference        |
| Variadic tuples            | When wrapping functions with arbitrary typed signatures        |
| Built-in utility types     | When you need common transformations of existing types         |

Generics are most valuable when they eliminate duplication **and** preserve type safety. When in doubt, write a concrete version first, then extract the generic only when you genuinely need the reuse.
