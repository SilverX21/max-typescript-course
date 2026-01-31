# Modern JavaScript/TypeScript Basics Cheatsheet (with examples)

This guide covers a handful of everyday JS/TS features you’ll use constantly: `let` vs `const`, arrow functions, spread/rest, and destructuring. Examples are TypeScript-friendly (but work in JS too).

---

## Table of contents

- [Modern JavaScript/TypeScript Basics Cheatsheet (with examples)](#modern-javascripttypescript-basics-cheatsheet-with-examples)
  - [Table of contents](#table-of-contents)
  - [let vs const](#let-vs-const)
    - [What they are](#what-they-are)
    - [Reassignment vs mutation](#reassignment-vs-mutation)
    - [Block scope and temporal dead zone](#block-scope-and-temporal-dead-zone)
    - [Best-practice rules of thumb](#best-practice-rules-of-thumb)
  - [Arrow functions](#arrow-functions)
    - [Syntax and return styles](#syntax-and-return-styles)
    - [`this` behavior](#this-behavior)
    - [When not to use arrows](#when-not-to-use-arrows)
  - [Spread operator (`...`)](#spread-operator-)
    - [Arrays](#arrays)
    - [Objects](#objects)
    - [Gotchas](#gotchas)
  - [Rest parameters (`...`)](#rest-parameters-)
    - [Function rest](#function-rest)
    - [Destructuring rest](#destructuring-rest)
  - [Array and object destructuring](#array-and-object-destructuring)
    - [Array destructuring](#array-destructuring)
    - [Object destructuring](#object-destructuring)
    - [Destructuring in function parameters](#destructuring-in-function-parameters)
    - [Common gotchas](#common-gotchas)

---

## let vs const

### What they are

- **`const`**: creates a **block-scoped** variable that **cannot be reassigned**.
- **`let`**: creates a **block-scoped** variable that **can be reassigned**.

```ts
const a = 1;
// a = 2; // ❌ Error: cannot reassign const

let b = 1;
b = 2; // ✅ OK
```

### Reassignment vs mutation

This is the biggest “gotcha” people confuse:

- **Reassignment** = pointing the variable to a different value (not allowed for `const`)
- **Mutation** = changing the contents of an object/array (allowed for `const`)

```ts
const user = { name: "Nuno" };
user.name = "Nuno Silva"; // ✅ mutation is allowed

// user = { name: "Other" }; // ❌ reassignment is not allowed
```

Same for arrays:

```ts
const xs = [1, 2, 3];
xs.push(4); // ✅ allowed
// xs = [1];      // ❌ not allowed
```

If you want to avoid mutation, use immutable patterns:

```ts
const xs2 = [...xs, 5]; // new array
const user2 = { ...user, name: "New" }; // new object
```

### Block scope and temporal dead zone

Both `let` and `const` are **block scoped**, meaning they live inside `{ }`.

```ts
if (true) {
  const x = 10;
}
// console.log(x); // ❌ x is not defined
```

They also have a **temporal dead zone (TDZ)**: you can’t use them before they are declared.

```ts
// console.log(x); // ❌ TDZ
const x = 1;
```

### Best-practice rules of thumb

- Default to **`const`**.
- Use **`let`** only when you genuinely need reassignment.
- Avoid `var` in modern code (function scoped + hoisting surprises).

Example: a classic “use let” case:

```ts
let total = 0;
for (const n of [1, 2, 3]) {
  total += n;
}
```

---

## Arrow functions

Arrow functions are a concise way to write functions:

```ts
const add = (a: number, b: number) => a + b;
```

### Syntax and return styles

**Expression body** (implicit return):

```ts
const double = (n: number) => n * 2;
```

**Block body** (explicit return):

```ts
const double2 = (n: number) => {
  const result = n * 2;
  return result;
};
```

**Returning an object literal** needs parentheses:

```ts
const makeUser = (name: string) => ({ name, createdAt: new Date() });
```

### `this` behavior

Arrow functions **do not have their own `this`**. They capture `this` from the surrounding scope.

That’s great for callbacks:

```ts
class Timer {
  private seconds = 0;

  start() {
    setInterval(() => {
      this.seconds += 1; // ✅ "this" refers to Timer instance
    }, 1000);
  }
}
```

If you used a regular function:

```ts
setInterval(function () {
  // this.seconds += 1; // ❌ "this" is not Timer instance here
}, 1000);
```

### When not to use arrows

Avoid arrows when you _need_ a dynamic `this` (like some DOM/event APIs) or you want a named function for recursion/debugging.

Example (DOM events often prefer function to get the element as `this`):

```ts
button.addEventListener("click", function () {
  // here, `this` can be the button element (depending on TS DOM typings)
});
```

---

## Spread operator (`...`)

Spread expands an iterable (like an array) or an object into individual elements/properties.

### Arrays

Copy an array:

```ts
const a = [1, 2, 3];
const copy = [...a];
```

Merge arrays:

```ts
const b = [4, 5];
const merged = [...a, ...b]; // [1,2,3,4,5]
```

Insert values:

```ts
const withZero = [0, ...a]; // [0,1,2,3]
```

### Objects

Copy an object:

```ts
const user = { id: "1", name: "Nuno" };
const copy = { ...user };
```

Override properties:

```ts
const updated = { ...user, name: "Nuno Silva" };
```

Merge objects (later wins):

```ts
const base = { theme: "dark", lang: "en" };
const override = { lang: "pt" };
const config = { ...base, ...override }; // lang becomes "pt"
```

### Gotchas

1. **Spread is shallow**  
   Nested objects/arrays are still shared references.

```ts
const original = { meta: { enabled: true } };
const copied = { ...original };

copied.meta.enabled = false;
console.log(original.meta.enabled); // false 😅
```

2. **Order matters**

```ts
const x = { a: 1, b: 2 };
const y = { b: 999 };

const z = { ...x, ...y }; // b is 999
const w = { ...y, ...x }; // b is 2
```

---

## Rest parameters (`...`)

Rest is “the opposite of spread”: it **collects** multiple values into an array/object.

### Function rest

```ts
function sum(...nums: number[]) {
  return nums.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3); // 6
```

Rest must be the **last** parameter:

```ts
// function bad(...a: number[], b: number) {} // ❌ rest must be last
```

### Destructuring rest

In arrays:

```ts
const [head, ...tail] = [1, 2, 3, 4];
// head = 1, tail = [2,3,4]
```

In objects:

```ts
const { password, ...safeUser } = { id: "1", name: "Nuno", password: "secret" };
// safeUser = { id: "1", name: "Nuno" }
```

---

## Array and object destructuring

Destructuring pulls values out of arrays/objects into variables.

### Array destructuring

```ts
const coords = [10, 20] as const;
const [x, y] = coords;
```

Skip items:

```ts
const xs = [1, 2, 3];
const [first, , third] = xs; // first=1, third=3
```

Default values:

```ts
const [a = 0, b = 0] = [5]; // a=5, b=0
```

### Object destructuring

```ts
const user = { id: "1", name: "Nuno", role: "admin" as const };

const { id, name } = user;
```

Rename variables:

```ts
const { id: userId } = user; // userId gets user.id
```

Default values:

```ts
type Settings = { theme?: "light" | "dark" };
const settings: Settings = {};

const { theme = "light" } = settings; // theme is "light"
```

### Destructuring in function parameters

```ts
type Props = { title: string; subtitle?: string };

function Header({ title, subtitle = "—" }: Props) {
  return `${title} ${subtitle}`;
}
```

Options objects:

```ts
type FetchOptions = { timeoutMs?: number; retries?: number };

function fetchWithRetry(
  url: string,
  { timeoutMs = 5000, retries = 3 }: FetchOptions = {},
) {
  // ...
}
```

Notice `= {}` on the parameter: it allows calling `fetchWithRetry(url)` without passing options.

### Common gotchas

1. **Destructuring `undefined` throws**

```ts
// const { x } = undefined; // 💥 runtime error
```

2. **Name collisions**

```ts
const { id: userId } = user;
const { id: orderId } = { id: "ord_1" };
```

3. **Destructuring doesn’t clone**

```ts
const original = { meta: { enabled: true } };
const { meta } = original; // meta is a reference
```

If you want immutability, pair destructuring with spread:

```ts
const { meta: m, ...rest } = original;
const copy = { ...rest, meta: { ...m } };
```

---

If you want, I can also create a follow-up file with:

- `==` vs `===`
- `map/filter/reduce` patterns (with typing)
- async/await + error handling patterns
- modules: `import/export` (ESM) best practices
