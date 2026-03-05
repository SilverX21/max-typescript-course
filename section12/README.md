# TypeScript Experimental (Legacy) Decorators

## Table of Contents

- [What Are Experimental Decorators?](#what-are-experimental-decorators)
- [Enabling Experimental Decorators](#enabling-experimental-decorators)
- [How They Differ from Stage 3 Decorators](#how-they-differ-from-stage-3-decorators)
- [Types of Decorators](#types-of-decorators)
  - [Class Decorators](#class-decorators)
  - [Method Decorators](#method-decorators)
  - [Property Decorators](#property-decorators)
  - [Accessor Decorators](#accessor-decorators)
  - [Parameter Decorators](#parameter-decorators)
- [Decorator Factories](#decorator-factories)
- [Composing Multiple Decorators](#composing-multiple-decorators)
- [Decorator Execution Order](#decorator-execution-order)
- [Metadata Reflection (reflect-metadata)](#metadata-reflection-reflect-metadata)
- [Use Cases](#use-cases)
- [Frameworks That Use Legacy Decorators](#frameworks-that-use-legacy-decorators)
- [Best Practices](#best-practices)
- [Things to Avoid](#things-to-avoid)
- [Migrating to Stage 3 Decorators](#migrating-to-stage-3-decorators)

---

## What Are Experimental Decorators?

Experimental decorators are TypeScript's original implementation of decorators, based on an older TC39 proposal (Stage 2). They were introduced early in TypeScript's history and became widely adopted by frameworks like Angular, NestJS, and TypeORM before the decorator proposal was finalized.

They use the same `@` syntax as Stage 3 decorators but have a **completely different function signature**. Instead of receiving a context object, legacy decorators receive raw arguments like the prototype, property name, and property descriptor.

## Enabling Experimental Decorators

Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES6"
  }
}
```

- `experimentalDecorators` — enables the `@decorator` syntax with legacy signatures.
- `emitDecoratorMetadata` — emits design-time type metadata (used by libraries like `reflect-metadata`). Optional but commonly needed.

## How They Differ from Stage 3 Decorators

| Feature | Experimental (Legacy) | Stage 3 (Modern) |
|---|---|---|
| **Compiler flag** | Requires `experimentalDecorators: true` | No flag needed (TS 5.0+) |
| **Class decorator args** | `(constructor)` | `(target, context)` |
| **Method decorator args** | `(prototype, name, descriptor)` | `(method, context)` |
| **Property decorator args** | `(prototype, name)` | `(undefined, context)` |
| **Parameter decorators** | Supported | Not supported |
| **Context object** | None | `ClassDecoratorContext`, etc. |
| **`addInitializer`** | Not available | Available via context |
| **Metadata** | Via `reflect-metadata` polyfill | Built-in `Symbol.metadata` |
| **Property descriptors** | Directly accessible in method decorators | Not exposed |
| **`accessor` keyword** | Not supported | Supported |
| **Spec status** | Abandoned proposal | TC39 Stage 3 (standard) |

## Types of Decorators

### Class Decorators

A class decorator receives the **constructor function** as its only argument.

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
```

To **replace** the class, return a new constructor:

```ts
function withTimestamp<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    createdAt = new Date();
  };
}

@withTimestamp
class Document {
  title: string;
  constructor(title: string) {
    this.title = title;
  }
}

const doc = new Document("Notes");
console.log((doc as any).createdAt); // current date
```

> **Note:** TypeScript won't automatically recognize the added `createdAt` property on the type. This is a known limitation of legacy class decorators — the return type is not merged with the original class type.

### Method Decorators

A method decorator receives three arguments:

1. **`target`** — the prototype of the class (or the constructor for static methods).
2. **`propertyKey`** — the name of the method (string or symbol).
3. **`descriptor`** — the `PropertyDescriptor` for the method.

```ts
function log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Calling add with args: [2, 3]
// add returned: 5
```

**Autobind example** (common pattern):

```ts
function autobind(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      return originalMethod.bind(this);
    },
  };

  return adjDescriptor;
}

class Button {
  label = "Submit";

  @autobind
  handleClick() {
    console.log(`Button: ${this.label}`);
  }
}

const btn = new Button();
const handler = btn.handleClick;
handler(); // "Button: Submit" — `this` is correctly bound
```

> This autobind approach uses a **getter** on the descriptor to lazily bind the method when accessed. This was the standard pattern before Stage 3 introduced `addInitializer`.

### Property Decorators

Property decorators receive **two arguments** (no descriptor — properties don't have descriptors at definition time):

1. **`target`** — the prototype of the class.
2. **`propertyKey`** — the name of the property.

```ts
function required(target: any, propertyKey: string) {
  let value: any;

  Object.defineProperty(target, propertyKey, {
    get() {
      if (value === undefined) {
        throw new Error(`Property "${propertyKey}" is required`);
      }
      return value;
    },
    set(newValue: any) {
      value = newValue;
    },
    enumerable: true,
    configurable: true,
  });
}

class Config {
  @required
  apiKey!: string;
}

const config = new Config();
// config.apiKey; // throws: Property "apiKey" is required
config.apiKey = "abc123";
console.log(config.apiKey); // "abc123"
```

> **Limitation:** because there is no descriptor, you cannot intercept the initial assignment cleanly. The `Object.defineProperty` approach shown above works but shares the value across instances (a common footgun — see [Things to Avoid](#things-to-avoid)).

### Accessor Decorators

Accessor decorators work the same as method decorators but are applied to `get` or `set` accessors. The descriptor will contain the `get` and/or `set` functions.

```ts
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;

  constructor(x: number) {
    this._x = x;
  }

  @configurable(false)
  get x() {
    return this._x;
  }
}
```

### Parameter Decorators

Parameter decorators are **unique to experimental decorators** — Stage 3 does not support them. They receive:

1. **`target`** — the prototype of the class.
2. **`propertyKey`** — the name of the method.
3. **`parameterIndex`** — the index of the parameter.

```ts
function logParameter(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  const existingParams: number[] =
    Reflect.getOwnMetadata("log_params", target, propertyKey) || [];
  existingParams.push(parameterIndex);
  Reflect.defineMetadata("log_params", existingParams, target, propertyKey);
}

class UserService {
  greet(@logParameter name: string, @logParameter age: number) {
    return `Hello, ${name}! You are ${age} years old.`;
  }
}
```

> Parameter decorators are typically used alongside `reflect-metadata` to store metadata that other decorators (like method decorators) can then read and act on.

## Decorator Factories

A decorator factory is a function that returns a decorator. This lets you pass options.

```ts
function component(options: { selector: string; template: string }) {
  return function (constructor: Function) {
    (constructor as any).selector = options.selector;
    (constructor as any).template = options.template;
  };
}

@component({
  selector: "app-root",
  template: "<h1>Hello</h1>",
})
class AppComponent {}

console.log((AppComponent as any).selector); // "app-root"
```

This is the pattern Angular uses for `@Component()`, `@Injectable()`, etc.

## Composing Multiple Decorators

Multiple decorators are evaluated **bottom-up** (closest to the class first):

```ts
function first() {
  console.log("first(): factory");
  return function (target: any) {
    console.log("first(): applied");
  };
}

function second() {
  console.log("second(): factory");
  return function (target: any) {
    console.log("second(): applied");
  };
}

@first()
@second()
class Example {}

// Output:
// first(): factory
// second(): factory
// second(): applied
// first(): applied
```

Factories run **top-down**, decorators apply **bottom-up**.

## Decorator Execution Order

When a class has decorators on different member types, they execute in this order:

1. **Parameter decorators** — for each method, left to right
2. **Method / Accessor / Property decorators** — for each instance member, in declaration order
3. **Parameter decorators** — for each static method, left to right
4. **Method / Accessor / Property decorators** — for each static member, in declaration order
5. **Parameter decorators** — for the constructor
6. **Class decorators** — bottom to top

```ts
function classDecorator(constructor: Function) {
  console.log("7. class decorator");
}

function methodDecorator(t: any, k: string, d: PropertyDescriptor) {
  console.log(`4. method decorator (${k})`);
}

function propertyDecorator(t: any, k: string) {
  console.log(`3. property decorator (${k})`);
}

function parameterDecorator(t: any, k: string, i: number) {
  console.log(`2. parameter decorator (${k}, index ${i})`);
}

@classDecorator
class Demo {
  @propertyDecorator
  name: string = "";

  @methodDecorator
  greet(@parameterDecorator message: string) {
    return message;
  }
}

// Output:
// 3. property decorator (name)
// 2. parameter decorator (greet, index 0)
// 4. method decorator (greet)
// 7. class decorator
```

## Metadata Reflection (reflect-metadata)

The `reflect-metadata` library is a polyfill that enables runtime type reflection when `emitDecoratorMetadata` is enabled. TypeScript emits type metadata that you can read at runtime.

```bash
npm install reflect-metadata
```

```ts
import "reflect-metadata";

function validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
  console.log(`${propertyKey} parameter types:`, paramTypes);
  // e.g. [String, Number]
}

class Service {
  @validate
  process(name: string, count: number) {}
}
```

Three metadata keys are emitted automatically:

| Key | Description |
|---|---|
| `design:type` | Type of a property |
| `design:paramtypes` | Array of parameter types for a method |
| `design:returntype` | Return type of a method |

This is heavily used by NestJS and TypeORM for dependency injection and column type inference.

## Use Cases

| Use Case | Example Framework/Library |
|---|---|
| **Component metadata** | Angular (`@Component`, `@Directive`) |
| **Dependency injection** | NestJS (`@Injectable`, `@Inject`), Angular |
| **Route definitions** | NestJS (`@Get`, `@Post`, `@Controller`) |
| **ORM column mapping** | TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`) |
| **Validation** | class-validator (`@IsString`, `@Min`, `@MaxLength`) |
| **Serialization** | class-transformer (`@Expose`, `@Exclude`, `@Transform`) |
| **Guards & middleware** | NestJS (`@UseGuards`, `@UseInterceptors`) |
| **Swagger/OpenAPI docs** | `@nestjs/swagger` (`@ApiProperty`, `@ApiResponse`) |
| **Autobind methods** | Custom autobind decorators |
| **Logging & profiling** | Custom method decorators |

## Frameworks That Use Legacy Decorators

These major frameworks rely on experimental decorators and `emitDecoratorMetadata`:

- **Angular** — `@Component`, `@NgModule`, `@Injectable`, `@Input`, `@Output`
- **NestJS** — `@Controller`, `@Get`, `@Injectable`, `@Module`, `@Body`
- **TypeORM** — `@Entity`, `@Column`, `@ManyToOne`, `@Repository`
- **MikroORM** — `@Entity`, `@Property`, `@ManyToOne`
- **class-validator** — `@IsEmail`, `@IsNotEmpty`, `@Min`, `@Max`
- **class-transformer** — `@Expose`, `@Exclude`, `@Type`
- **MobX** — `@observable`, `@action`, `@computed`

> Many of these are in the process of migrating to Stage 3 decorators, but the transition is gradual and legacy support will remain for some time.

## Best Practices

1. **Understand the descriptor** — the `PropertyDescriptor` is the core of method/accessor decorators. Know the difference between `value`, `get`, `set`, `writable`, `configurable`, and `enumerable`.

2. **Always return the descriptor** — when modifying a method decorator, return the modified descriptor so TypeScript can apply the changes.

3. **Preserve `this` context** — when wrapping methods, use `function` (not arrow functions) and `apply`/`call` to preserve the correct `this`.

   ```ts
   // Correct
   descriptor.value = function (...args: any[]) {
     return originalMethod.apply(this, args);
   };

   // Wrong — loses `this`
   descriptor.value = (...args: any[]) => {
     return originalMethod(...args);
   };
   ```

4. **Use factories for configurable decorators** — wrap decorators in a factory when they need options.

5. **Keep decorators small and composable** — one responsibility per decorator.

6. **Type parameter decorators with reflect-metadata** — if using parameter decorators, pair them with `reflect-metadata` to store and retrieve type information.

7. **Be explicit about side effects** — document what a decorator modifies (prototype, descriptor, metadata) so other developers know what to expect.

8. **Separate metadata storage from behavior** — use one decorator to store metadata and another to read and act on it. This is the pattern NestJS follows.

## Things to Avoid

1. **Don't share state via property decorators naively** — because property decorators modify the prototype, a closure-based value is shared across all instances:

   ```ts
   // BUG: all instances share the same `value` variable
   function defaultValue(val: any) {
     return function (target: any, propertyKey: string) {
       let value = val;
       Object.defineProperty(target, propertyKey, {
         get: () => value,
         set: (v) => (value = v),
       });
     };
   }
   ```

   Use a `WeakMap` keyed by the instance instead:

   ```ts
   function defaultValue(val: any) {
     return function (target: any, propertyKey: string) {
       const values = new WeakMap();
       Object.defineProperty(target, propertyKey, {
         get() { return values.get(this) ?? val; },
         set(v) { values.set(this, v); },
       });
     };
   }
   ```

2. **Don't mix experimental and Stage 3 decorators** — they have incompatible signatures. A single project should use one or the other.

3. **Don't assume decorator metadata is always available** — `emitDecoratorMetadata` only emits metadata for decorated elements. Undecorated methods won't have `design:paramtypes`.

4. **Don't rely on decorators for type safety** — decorators operate at runtime. They can't add compile-time type checking.

5. **Don't overuse parameter decorators** — they can't modify behavior by themselves. They only store metadata for other decorators to read, which adds complexity.

6. **Don't forget that class decorator return types aren't merged** — if you return a new class from a class decorator, TypeScript won't know about the new members. You'll need type assertions or declaration merging.

7. **Don't modify the prototype without understanding the consequences** — changes to the prototype affect all instances, past and future. This can lead to subtle bugs.

8. **Don't depend on experimental decorators for new projects** — if you're starting fresh and don't need a framework that requires them, use Stage 3 decorators instead.

## Migrating to Stage 3 Decorators

If you're considering moving from experimental to Stage 3 decorators, here's what changes:

| Legacy Pattern | Stage 3 Equivalent |
|---|---|
| `(target, key, descriptor)` for methods | `(method, context)` — no descriptor access |
| `(target, key)` for properties | `(undefined, context)` — return an initializer |
| Autobind via getter descriptor | Autobind via `context.addInitializer()` |
| `reflect-metadata` for type info | `Symbol.metadata` (built-in) |
| Parameter decorators | No equivalent — use method decorators with metadata |
| `Object.defineProperty` in property decorators | Return a function from the decorator |

The migration is not always straightforward, especially for frameworks heavily relying on `emitDecoratorMetadata` and parameter decorators. Wait for your framework to officially support Stage 3 before migrating.
