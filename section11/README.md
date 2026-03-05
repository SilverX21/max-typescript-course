# TypeScript Decorators

## Table of Contents

- [What Are Decorators?](#what-are-decorators)
- [Enabling Decorators](#enabling-decorators)
- [Types of Decorators](#types-of-decorators)
  - [Class Decorators](#class-decorators)
  - [Method Decorators](#method-decorators)
  - [Property Decorators](#property-decorators)
  - [Accessor Decorators](#accessor-decorators)
  - [Parameter Decorators (Legacy)](#parameter-decorators-legacy)
- [Decorator Factories](#decorator-factories)
- [Composing Multiple Decorators](#composing-multiple-decorators)
- [Use Cases](#use-cases)
- [Best Practices](#best-practices)
- [Things to Avoid](#things-to-avoid)

---

## What Are Decorators?

Decorators are functions that can modify or extend the behavior of classes, methods, properties, or accessors at definition time. They use the `@` syntax and are applied directly above the element they decorate.

At their core, a decorator is just a function that receives information about the decorated element and can optionally return a replacement.

```ts
function myDecorator(target: any, context: ClassDecoratorContext) {
  console.log(`Decorating class: ${context.name}`);
}

@myDecorator
class MyClass {}
```

TypeScript supports two decorator implementations:

- **Stage 3 decorators** (TC39 proposal) — the modern standard, available since TypeScript 5.0.
- **Legacy/experimental decorators** — enabled via the `experimentalDecorators` compiler flag. Used by older frameworks like Angular and NestJS.

This guide focuses on the **Stage 3** decorators (the ones used in the course).

## Enabling Decorators

For **Stage 3 decorators** (TypeScript 5.0+), no special flag is needed — they work out of the box as long as you target ES2022 or later.

For **legacy decorators**, add this to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Types of Decorators

### Class Decorators

A class decorator is applied to the class constructor. It receives the class itself and a `ClassDecoratorContext` as arguments.

```ts
function logger<T extends new (...args: any[]) => any>(
  target: T,
  ctx: ClassDecoratorContext
) {
  console.log(`Class "${String(ctx.name)}" was defined`);

  // Optionally return a new class that extends the original
  return class extends target {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Instance of "${String(ctx.name)}" created`);
    }
  };
}

@logger
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const user = new User("Alice");
// Logs: Class "User" was defined
// Logs: Instance of "User" created
```

**Key points:**
- Runs once when the class is defined, not when instances are created.
- Can return a new class to replace the original.
- The generic constraint `new (...args: any[]) => any` ensures the target is a constructor.

### Method Decorators

A method decorator is applied to a class method. It receives the method function and a `ClassMethodDecoratorContext`.

```ts
function autobind(
  target: (...args: any[]) => any,
  ctx: ClassMethodDecoratorContext
) {
  ctx.addInitializer(function (this: any) {
    this[ctx.name] = this[ctx.name].bind(this);
  });
}

class Button {
  label = "Click me";

  @autobind
  handleClick() {
    console.log(`Button: ${this.label}`);
  }
}

const btn = new Button();
const handler = btn.handleClick;
handler(); // "Button: Click me" — `this` is correctly bound
```

**Key points:**
- `ctx.addInitializer()` registers a callback that runs when a class instance is created.
- Can return a replacement function to wrap or replace the original method.

### Property Decorators

Property decorators (Stage 3) use `ClassFieldDecoratorContext`. They can return an initializer function that transforms the initial value.

```ts
function uppercase(
  _target: undefined,
  ctx: ClassFieldDecoratorContext
) {
  return function (this: any, initialValue: string) {
    return initialValue.toUpperCase();
  };
}

class Greeting {
  @uppercase
  message = "hello world";
}

const g = new Greeting();
console.log(g.message); // "HELLO WORLD"
```

### Accessor Decorators

Accessor decorators apply to `accessor` fields (auto-accessor syntax) and can intercept get/set operations.

```ts
function clamp(min: number, max: number) {
  return function (
    _target: ClassAccessorDecoratorTarget<any, number>,
    ctx: ClassAccessorDecoratorContext
  ): ClassAccessorDecoratorResult<any, number> {
    return {
      set(value: number) {
        return Math.max(min, Math.min(max, value));
      },
    };
  };
}

class Slider {
  @clamp(0, 100)
  accessor value = 50;
}

const slider = new Slider();
slider.value = 150;
console.log(slider.value); // 100
```

### Parameter Decorators (Legacy)

Parameter decorators are only available with the `experimentalDecorators` flag. Stage 3 decorators do **not** support parameter decorators.

```ts
// Legacy only
function logParam(target: any, methodName: string, paramIndex: number) {
  console.log(`Parameter ${paramIndex} of ${methodName} was decorated`);
}

class Service {
  greet(@logParam name: string) {
    return `Hello, ${name}`;
  }
}
```

## Decorator Factories

A decorator factory is a function that **returns** a decorator. This allows you to pass configuration to your decorators.

```ts
function log(prefix: string) {
  return function (
    target: (...args: any[]) => any,
    ctx: ClassMethodDecoratorContext
  ) {
    return function (this: any, ...args: any[]) {
      console.log(`[${prefix}] Calling ${String(ctx.name)}`);
      return target.apply(this, args);
    };
  };
}

class MathService {
  @log("MATH")
  add(a: number, b: number) {
    return a + b;
  }
}

const math = new MathService();
math.add(2, 3); // [MATH] Calling add
```

## Composing Multiple Decorators

You can stack multiple decorators on a single element. They are **evaluated bottom-up** (closest to the target runs first).

```ts
function first(target: any, ctx: ClassDecoratorContext) {
  console.log("first applied");
}

function second(target: any, ctx: ClassDecoratorContext) {
  console.log("second applied");
}

@first
@second
class Example {}
// Logs: "second applied"
// Logs: "first applied"
```

For decorator factories, the factories themselves are called **top-down**, but the resulting decorators are applied **bottom-up**.

## Use Cases

| Use Case | Description |
|---|---|
| **Logging** | Automatically log method calls, arguments, and return values |
| **Autobind** | Bind methods to their class instance to prevent `this` issues in callbacks |
| **Validation** | Validate method arguments or property values at runtime |
| **Memoization** | Cache method results for repeated calls with the same arguments |
| **Access Control** | Restrict method execution based on roles or permissions |
| **Dependency Injection** | Automatically inject services into class constructors (NestJS, Angular) |
| **Serialization** | Mark properties for JSON serialization/deserialization (class-transformer) |
| **ORM Mapping** | Map class properties to database columns (TypeORM, MikroORM) |
| **Route Handling** | Define HTTP routes and middleware declaratively (NestJS) |
| **Timing/Profiling** | Measure execution time of methods |

## Best Practices

1. **Keep decorators focused** — each decorator should do one thing well. Compose multiple decorators instead of building monolithic ones.

2. **Use decorator factories for configuration** — if your decorator needs options, return the decorator from a factory function rather than hardcoding values.

3. **Prefer Stage 3 decorators** — unless you must use a framework that requires legacy decorators, use the standard Stage 3 syntax for forward compatibility.

4. **Type your decorators properly** — use the built-in context types (`ClassDecoratorContext`, `ClassMethodDecoratorContext`, etc.) and generics to maintain type safety.

5. **Use `addInitializer` for per-instance setup** — instead of trying to modify the prototype directly, use `ctx.addInitializer()` for logic that should run per instance.

6. **Document decorator behavior** — decorators are implicit; make sure consumers know what side effects a decorator introduces.

7. **Make decorators idempotent** — applying the same decorator twice should not cause unexpected behavior.

8. **Handle errors gracefully** — if a decorator wraps a method, ensure errors from the original method still propagate correctly.

## Things to Avoid

1. **Don't use decorators for simple logic** — if a plain function call or class method achieves the same result, don't reach for a decorator. They add indirection.

2. **Don't mix Stage 3 and legacy decorators** — they have incompatible signatures and behavior. Pick one and stick with it across your project.

3. **Don't mutate the target directly when a return value is expected** — return a new value instead of modifying the original in place. This makes the decorator predictable.

4. **Don't hide critical business logic in decorators** — decorators should handle cross-cutting concerns (logging, validation, binding), not core domain logic.

5. **Don't create deeply nested decorator stacks** — too many stacked decorators make debugging difficult. If you have more than 3-4 on a single element, consider refactoring.

6. **Don't rely on decorator execution order for correctness** — while the order is well-defined (bottom-up), writing code that depends on subtle ordering between decorators is fragile.

7. **Don't ignore the performance cost** — each decorator that wraps a method adds a function call to the call stack. Avoid heavy computation inside decorators that run frequently.

8. **Don't use decorators on plain functions** — decorators only work on class members and classes themselves, not standalone functions.
