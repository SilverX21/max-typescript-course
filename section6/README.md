# TypeScript: Classes, Interfaces, and Object-Oriented Programming

This guide covers essential TypeScript features for object-oriented programming, including classes, interfaces, and related concepts.

## Table of Contents

1. [Classes](#classes)
2. [Public vs Private Properties](#public-vs-private-properties)
3. [Readonly Fields](#readonly-fields)
4. [Getters](#getters)
5. [Setters](#setters)
6. [Static Properties and Methods](#static-properties-and-methods)
7. [Inheritance](#inheritance)
8. [Protected Modifier](#protected-modifier)
9. [Abstract Classes](#abstract-classes)
10. [Interfaces](#interfaces)
11. [Interface as Object Types](#interface-as-object-types)
12. [Using Interfaces to Define Function Types](#using-interfaces-to-define-function-types)
13. [Implementing Interfaces](#implementing-interfaces)
14. [Ensuring Base Types with Interfaces](#ensuring-base-types-with-interfaces)
15. [Extending Interfaces](#extending-interfaces)
16. [Summary](#summary)

---

## Classes

### Explanation

Classes are blueprints for creating objects with predefined properties and methods. They encapsulate data and behavior together, providing a foundation for object-oriented programming in TypeScript.

### Examples

```typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
  }
}

const person1 = new Person("Alice", 30);
person1.greet(); // "Hello, I'm Alice and I'm 30 years old."
```

### Best Practices

- Use PascalCase for class names
- Keep classes focused on a single responsibility
- Initialize all properties either in declaration or constructor
- Use constructor parameter properties for cleaner code

```typescript
// Good: Constructor parameter properties
class User {
  constructor(
    public name: string,
    public email: string,
  ) {}
}
```

### What to Avoid

- ❌ Creating god classes with too many responsibilities
- ❌ Leaving properties uninitialized without definite assignment assertion
- ❌ Using classes when simple objects or functions would suffice

```typescript
// Bad: Uninitialized property without proper handling
class BadExample {
  name: string; // Error: Property 'name' has no initializer
}

// Bad: Unnecessary class for simple data
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
// Better: Use a type or interface with object literal
type Point = { x: number; y: number };
```

---

## Public vs Private Properties

### Explanation

Access modifiers control the visibility of class members:

- `public`: Accessible from anywhere (default)
- `private`: Only accessible within the class
- `#private`: ECMAScript private fields (hard private, runtime enforced)

### Examples

```typescript
class BankAccount {
  public accountHolder: string;
  private balance: number;
  #pin: number; // ES private field

  constructor(holder: string, initialBalance: number, pin: number) {
    this.accountHolder = holder;
    this.balance = initialBalance;
    this.#pin = pin;
  }

  public deposit(amount: number) {
    this.balance += amount;
  }

  public getBalance() {
    return this.balance;
  }

  private validatePin(pin: number): boolean {
    return this.#pin === pin;
  }
}

const account = new BankAccount("John", 1000, 1234);
console.log(account.accountHolder); // ✓ OK
console.log(account.balance); // ✗ Error: 'balance' is private
console.log(account.#pin); // ✗ Error: Private field '#pin' must be declared in an enclosing class
```

### Best Practices

- Default to `private` or `protected` and only make members `public` when necessary
- Use `#private` fields for true encapsulation at runtime
- Use private modifier for TypeScript-only compile-time checks
- Expose private data through public methods when needed

```typescript
// Good: Controlled access to private data
class ShoppingCart {
  private items: string[] = [];

  addItem(item: string) {
    this.items.push(item);
  }

  getItems(): readonly string[] {
    return this.items;
  }
}
```

### What to Avoid

- ❌ Making everything public by default
- ❌ Accessing private members from outside (TypeScript allows at runtime)
- ❌ Using private when you need protected for inheritance

```typescript
// Bad: Everything public
class User {
  public password: string; // Sensitive data should be private!
  public internalId: number;
}

// Bad: Trying to access private members
class Test {
  private secret = "hidden";
}
const t = new Test();
console.log(t.secret); // Compile error, but works at runtime!
```

---

## Readonly Fields

### Explanation

The `readonly` modifier prevents reassignment of a property after initialization. Properties can be initialized in their declaration or in the constructor.

### Examples

```typescript
class Configuration {
  readonly apiUrl: string;
  readonly maxRetries: number = 3;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  updateUrl(newUrl: string) {
    this.apiUrl = newUrl; // ✗ Error: Cannot assign to 'apiUrl' because it is a read-only property
  }
}

const config = new Configuration("https://api.example.com");
console.log(config.apiUrl); // ✓ Reading is OK
config.apiUrl = "https://new-url.com"; // ✗ Error
```

### Best Practices

- Use `readonly` for values that should never change after initialization
- Combine with `private` for immutable internal state
- Use `readonly` arrays/objects to prevent reassignment (but not mutation)

```typescript
// Good: Immutable configuration
class AppConfig {
  constructor(
    private readonly appName: string,
    private readonly version: string,
  ) {}

  getInfo() {
    return `${this.appName} v${this.version}`;
  }
}

// Note: readonly doesn't make arrays/objects deeply immutable
class Container {
  readonly items: string[] = [];

  addItem(item: string) {
    this.items.push(item); // ✓ This works! readonly prevents reassignment, not mutation
  }
}
```

### What to Avoid

- ❌ Confusing `readonly` with deep immutability
- ❌ Overusing `readonly` when values legitimately need to change
- ❌ Forgetting that `readonly` is compile-time only

```typescript
// Bad: Thinking readonly makes objects immutable
class Bad {
  readonly data = { value: 1 };
}
const b = new Bad();
b.data.value = 2; // ✓ This works! Only reassignment is prevented

// Bad: Using readonly for values that need to change
class Counter {
  readonly count = 0; // Can't increment!

  increment() {
    this.count++; // ✗ Error
  }
}
```

---

## Getters

### Explanation

Getters are accessor methods that allow you to define a property-like interface while executing code when the value is accessed. They're defined using the `get` keyword.

### Examples

```typescript
class Rectangle {
  constructor(
    private width: number,
    private height: number,
  ) {}

  get area(): number {
    return this.width * this.height;
  }

  get perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

const rect = new Rectangle(10, 5);
console.log(rect.area); // 50 (accessed like a property, not a method)
```

### Best Practices

- Use getters for computed properties
- Keep getters pure and side-effect free
- Use getters to provide controlled access to private fields
- Ensure getters are fast and don't perform expensive operations

```typescript
// Good: Computed property
class Circle {
  constructor(private radius: number) {}

  get diameter(): number {
    return this.radius * 2;
  }

  get area(): number {
    return Math.PI * this.radius ** 2;
  }
}

// Good: Controlled access
class User {
  constructor(
    private firstName: string,
    private lastName: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

### What to Avoid

- ❌ Performing expensive operations in getters
- ❌ Having side effects in getters
- ❌ Returning different values on consecutive calls without state changes
- ❌ Throwing errors in getters (use methods instead)

```typescript
// Bad: Expensive operation in getter
class Database {
  get allRecords() {
    return this.fetchFromDatabase(); // Expensive operation!
  }
}

// Bad: Side effects in getter
class Bad {
  private counter = 0;

  get value() {
    this.counter++; // Side effect!
    return this.counter;
  }
}

// Bad: Non-deterministic getter
class Random {
  get value() {
    return Math.random(); // Different value each time
  }
}
```

---

## Setters

### Explanation

Setters are accessor methods that allow you to execute code when a property is assigned a value. They're defined using the `set` keyword and provide validation and transformation logic.

### Examples

```typescript
class Temperature {
  private _celsius: number = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature below absolute zero!");
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    return (this._celsius * 9) / 5 + 32;
  }

  set fahrenheit(value: number) {
    this.celsius = ((value - 32) * 5) / 9;
  }
}

const temp = new Temperature();
temp.celsius = 25;
console.log(temp.fahrenheit); // 77
```

### Best Practices

- Use setters for validation and sanitization
- Always pair setters with getters
- Keep setter logic focused and simple
- Use private backing fields with naming convention (`_propertyName`)

```typescript
// Good: Validation in setter
class User {
  private _email: string = "";

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    if (!value.includes("@")) {
      throw new Error("Invalid email format");
    }
    this._email = value.toLowerCase().trim();
  }
}

// Good: Transformation in setter
class Product {
  private _price: number = 0;

  set price(value: number) {
    this._price = Math.max(0, value); // Ensure non-negative
  }

  get price(): number {
    return this._price;
  }
}
```

### What to Avoid

- ❌ Creating setters without corresponding getters
- ❌ Performing complex operations or side effects in setters
- ❌ Throwing errors for normal values (validate earlier in the flow)
- ❌ Modifying other properties unexpectedly

```typescript
// Bad: Setter without getter
class Bad {
  private _value: number = 0;

  set value(v: number) {
    this._value = v;
  }
  // No getter! Users can't read the value
}

// Bad: Complex logic in setter
class Worse {
  set data(value: any) {
    // Sending HTTP request in a setter!
    fetch("/api/data", {
      method: "POST",
      body: JSON.stringify(value),
    });
  }
}

// Bad: Unexpected side effects
class Confusing {
  private _x: number = 0;
  private _y: number = 0;

  set x(value: number) {
    this._x = value;
    this._y = value * 2; // Unexpectedly modifying another property!
  }
}
```

---

## Static Properties and Methods

### Explanation

Static members belong to the class itself rather than to instances. They're shared across all instances and can be accessed without creating an instance.

### Examples

```typescript
class MathUtils {
  static PI = 3.14159;
  static E = 2.71828;

  static calculateCircleArea(radius: number): number {
    return this.PI * radius ** 2;
  }

  static max(...numbers: number[]): number {
    return Math.max(...numbers);
  }
}

// Access without instantiation
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.calculateCircleArea(5)); // 78.53975

// No need to create instances
// const utils = new MathUtils(); // Unnecessary
```

### Best Practices

- Use static methods for utility functions that don't require instance state
- Use static properties for constants and configuration
- Use static factory methods for alternative constructors
- Keep static methods pure when possible

```typescript
// Good: Static factory method
class User {
  constructor(
    public name: string,
    public email: string,
  ) {}

  static createGuest(): User {
    return new User("Guest", "guest@example.com");
  }

  static fromJSON(json: string): User {
    const data = JSON.parse(json);
    return new User(data.name, data.email);
  }
}

const guest = User.createGuest();
const user = User.fromJSON('{"name":"Alice","email":"alice@example.com"}');

// Good: Static configuration
class Database {
  static readonly MAX_CONNECTIONS = 100;
  static readonly DEFAULT_TIMEOUT = 5000;

  static validateConnectionCount(count: number): boolean {
    return count <= this.MAX_CONNECTIONS;
  }
}
```

### What to Avoid

- ❌ Using static methods when instance methods are more appropriate
- ❌ Accessing instance members from static methods
- ❌ Overusing static methods (leads to procedural code)
- ❌ Modifying static mutable state (leads to hard-to-track bugs)

```typescript
// Bad: Should be instance method
class Calculator {
  constructor(private value: number) {}

  static add(calc: Calculator, n: number) {
    // Awkward!
    return calc.value + n;
  }
}
// Better as instance method
class BetterCalculator {
  constructor(private value: number) {}

  add(n: number) {
    return this.value + n;
  }
}

// Bad: Trying to access instance members
class Bad {
  instanceProp = 10;

  static method() {
    console.log(this.instanceProp); // ✗ Error: instanceProp doesn't exist on typeof Bad
  }
}

// Bad: Mutable static state
class Counter {
  static count = 0; // Shared across all code!

  increment() {
    Counter.count++; // Hard to track and test
  }
}
```

---

## Inheritance

### Explanation

Inheritance allows a class to extend another class, inheriting its properties and methods. The child class (subclass) can add new members or override existing ones from the parent class (superclass).

### Examples

```typescript
class Animal {
  constructor(public name: string) {}

  move(distance: number = 0) {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof! Woof!");
  }
}

class Bird extends Animal {
  move(distance: number = 5) {
    console.log(`${this.name} flew ${distance}m.`);
  }
}

const dog = new Dog("Buddy");
dog.move(10); // "Buddy moved 10m."
dog.bark(); // "Woof! Woof!"

const bird = new Bird("Tweety");
bird.move(); // "Tweety flew 5m." (overridden method)
```

### Best Practices

- Use `super()` to call the parent constructor (required)
- Use `super.method()` to call parent methods
- Favor composition over inheritance when appropriate
- Keep inheritance hierarchies shallow (2-3 levels max)
- Use inheritance for "is-a" relationships

```typescript
// Good: Proper use of super
class Vehicle {
  constructor(
    public brand: string,
    protected speed: number = 0,
  ) {}

  accelerate(amount: number) {
    this.speed += amount;
  }
}

class Car extends Vehicle {
  constructor(
    brand: string,
    private doors: number,
  ) {
    super(brand); // Must call parent constructor
  }

  accelerate(amount: number) {
    super.accelerate(amount); // Call parent method
    console.log(`Car accelerated to ${this.speed} km/h`);
  }
}

// Good: "is-a" relationship
class ElectricCar extends Car {
  constructor(
    brand: string,
    doors: number,
    private batteryCapacity: number,
  ) {
    super(brand, doors);
  }
}
```

### What to Avoid

- ❌ Deep inheritance hierarchies (more than 3 levels)
- ❌ Using inheritance just for code reuse (use composition)
- ❌ Forgetting to call `super()` in derived class constructors
- ❌ Violating the Liskov Substitution Principle

```typescript
// Bad: Deep inheritance hierarchy
class A {}
class B extends A {}
class C extends B {}
class D extends C {}
class E extends D {} // Too deep!

// Bad: Inheritance for code reuse instead of composition
class ArrayList extends Array {
  // Using inheritance just to get array methods
}
// Better: Use composition
class ArrayList {
  private items: any[] = [];

  add(item: any) {
    this.items.push(item);
  }
}

// Bad: Forgetting super()
class Parent {
  constructor(public name: string) {}
}
class Child extends Parent {
  constructor(
    name: string,
    public age: number,
  ) {
    // Missing super(name);
    this.age = age; // ✗ Error: 'super' must be called before accessing 'this'
  }
}

// Bad: Violating Liskov Substitution Principle
class Rectangle {
  constructor(
    protected width: number,
    protected height: number,
  ) {}

  setWidth(w: number) {
    this.width = w;
  }
  setHeight(h: number) {
    this.height = h;
  }
  getArea() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // Breaks parent class expectations!
  }
}
```

---

## Protected Modifier

### Explanation

The `protected` modifier makes members accessible within the class and its subclasses, but not from outside. It's a middle ground between `private` and `public`.

### Examples

```typescript
class BankAccount {
  protected balance: number;

  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }

  protected logTransaction(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

class SavingsAccount extends BankAccount {
  private interestRate: number;

  constructor(initialBalance: number, interestRate: number) {
    super(initialBalance);
    this.interestRate = interestRate;
  }

  addInterest() {
    const interest = this.balance * this.interestRate; // ✓ Can access protected member
    this.balance += interest;
    this.logTransaction(`Interest added: ${interest}`); // ✓ Can access protected method
  }
}

const savings = new SavingsAccount(1000, 0.05);
savings.addInterest();
console.log(savings.balance); // ✗ Error: 'balance' is protected
```

### Best Practices

- Use `protected` for members that subclasses need to access
- Use `protected` for template method patterns
- Document protected members well (they're part of the subclass API)
- Use `protected` constructors to prevent direct instantiation

```typescript
// Good: Template method pattern
abstract class DataProcessor {
  protected abstract validate(data: any): boolean;
  protected abstract transform(data: any): any;
  protected abstract save(data: any): void;

  public process(data: any) {
    if (!this.validate(data)) {
      throw new Error("Invalid data");
    }
    const transformed = this.transform(data);
    this.save(transformed);
  }
}

class JSONProcessor extends DataProcessor {
  protected validate(data: any): boolean {
    return typeof data === "object";
  }

  protected transform(data: any): any {
    return JSON.stringify(data);
  }

  protected save(data: any): void {
    console.log("Saving:", data);
  }
}

// Good: Protected constructor for factory pattern
class Configuration {
  protected constructor(private settings: Record<string, any>) {}

  static createDefault(): Configuration {
    return new Configuration({ theme: "light", lang: "en" });
  }

  static createFromFile(path: string): Configuration {
    // Load settings from file
    return new Configuration({});
  }
}
```

### What to Avoid

- ❌ Using `protected` as a lazy alternative to proper encapsulation
- ❌ Overusing `protected` (most things should be `private`)
- ❌ Changing protected member behavior in ways that break subclasses
- ❌ Making everything protected "just in case"

```typescript
// Bad: Everything protected "just in case"
class Bad {
  protected name: string; // Should be private
  protected age: number; // Should be private
  protected email: string; // Should be private
  // Nothing is actually used by subclasses!
}

// Bad: Breaking subclass expectations
class Parent {
  protected value: number = 0;

  protected increment() {
    this.value++;
  }
}

class Child extends Parent {
  doSomething() {
    this.increment();
    console.log(this.value); // Expects value to be incremented by 1
  }
}

class BrokenParent extends Parent {
  protected increment() {
    this.value += 10; // Breaks subclass expectations!
  }
}

// Bad: Should be composition instead
class Engine {
  protected horsePower: number;
  protected start() {}
  protected stop() {}
}

class Car extends Engine {
  // Car is not an Engine!
  // Better to have an engine as a property
}
```

---

## Abstract Classes

### Explanation

Abstract classes are base classes that cannot be instantiated directly. They can contain abstract members (without implementation) that must be implemented by derived classes, as well as concrete members with implementations.

### Examples

```typescript
abstract class Shape {
  constructor(protected color: string) {}

  // Abstract method - must be implemented by subclasses
  abstract getArea(): number;
  abstract getPerimeter(): number;

  // Concrete method - shared by all subclasses
  describe(): string {
    return `A ${this.color} shape with area ${this.getArea()}`;
  }
}

class Circle extends Shape {
  constructor(
    color: string,
    private radius: number,
  ) {
    super(color);
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(
    color: string,
    private width: number,
    private height: number,
  ) {
    super(color);
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// const shape = new Shape("red"); // ✗ Error: Cannot create an instance of an abstract class
const circle = new Circle("blue", 5);
console.log(circle.describe()); // "A blue shape with area 78.53981633974483"
```

### Best Practices

- Use abstract classes to define a common interface with some shared implementation
- Make methods abstract only when subclasses must provide their own implementation
- Provide concrete helper methods that use abstract methods (template pattern)
- Use abstract classes for "is-a" relationships with shared code

```typescript
// Good: Template method with abstract and concrete methods
abstract class HTTPHandler {
  // Template method
  handle(request: Request): Response {
    if (!this.authenticate(request)) {
      return new Response(401);
    }

    const data = this.parseRequest(request);
    const result = this.processRequest(data);
    return this.formatResponse(result);
  }

  // Concrete methods with default implementation
  protected authenticate(request: Request): boolean {
    return true; // Default: allow all
  }

  protected formatResponse(data: any): Response {
    return new Response(200, JSON.stringify(data));
  }

  // Abstract methods - must be implemented
  protected abstract parseRequest(request: Request): any;
  protected abstract processRequest(data: any): any;
}

class UserHandler extends HTTPHandler {
  protected parseRequest(request: Request): any {
    return JSON.parse(request.body);
  }

  protected processRequest(data: any): any {
    // Process user data
    return { userId: 123, ...data };
  }

  // Override default authentication
  protected authenticate(request: Request): boolean {
    return request.headers.has("Authorization");
  }
}

// Good: Abstract class with shared state
abstract class Repository<T> {
  protected items: T[] = [];

  abstract validate(item: T): boolean;
  abstract getId(item: T): string;

  add(item: T): void {
    if (!this.validate(item)) {
      throw new Error("Invalid item");
    }
    this.items.push(item);
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => this.getId(item) === id);
  }
}
```

### What to Avoid

- ❌ Making all methods abstract (use an interface instead)
- ❌ Using abstract classes when you don't need shared implementation
- ❌ Making too many methods abstract (defeats the purpose)
- ❌ Forgetting to implement all abstract members in derived classes

```typescript
// Bad: All methods abstract - should be an interface
abstract class AllAbstract {
  abstract method1(): void;
  abstract method2(): void;
  abstract method3(): void;
  // No shared implementation - use interface instead!
}

// Better: Use interface
interface Better {
  method1(): void;
  method2(): void;
  method3(): void;
}

// Bad: No shared implementation
abstract class NoSharedCode {
  abstract doSomething(): void;
  // No concrete methods - why is this abstract?
}

// Bad: Forgetting to implement abstract methods
abstract class Parent {
  abstract required(): void;
}

class Child extends Parent {
  // ✗ Error: Non-abstract class 'Child' does not implement abstract member 'required'
}

// Bad: Too many abstract methods
abstract class TooManyAbstractMethods {
  abstract method1(): void;
  abstract method2(): void;
  abstract method3(): void;
  abstract method4(): void;
  abstract method5(): void;
  // If everything is abstract, consider interfaces or splitting into smaller abstractions
}
```

---

## Interfaces

### Explanation

Interfaces define contracts that objects must fulfill. They describe the shape of an object, specifying what properties and methods it should have, without providing implementation.

### Examples

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional property
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};

interface Logger {
  log(message: string): void;
  error(message: string, error: Error): void;
}

const consoleLogger: Logger = {
  log(message: string) {
    console.log(message);
  },
  error(message: string, error: Error) {
    console.error(message, error);
  },
};
```

### Best Practices

- Use interfaces for defining object shapes and contracts
- Prefer interfaces over type aliases for object types
- Use interfaces to enable better TypeScript tooling and error messages
- Name interfaces with clear, descriptive names (avoid "I" prefix)

```typescript
// Good: Clear, descriptive interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

interface ShoppingCart {
  items: Product[];
  total: number;
  addItem(product: Product): void;
  removeItem(productId: string): void;
}

// Good: Optional and readonly properties
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
  retryCount?: number;
  debug?: boolean;
}

// Good: Index signatures for dynamic properties
interface Dictionary<T> {
  [key: string]: T;
}

const scores: Dictionary<number> = {
  alice: 95,
  bob: 87,
  charlie: 92,
};
```

### What to Avoid

- ❌ Using "I" prefix for interfaces (not a TypeScript convention)
- ❌ Creating overly complex or large interfaces
- ❌ Using interfaces when type aliases are more appropriate
- ❌ Duplicate property definitions

```typescript
// Bad: "I" prefix (C# convention, not TypeScript)
interface IUser {
  name: string;
}
// Good: No prefix
interface User {
  name: string;
}

// Bad: Overly complex interface
interface MegaInterface {
  prop1: string;
  prop2: number;
  // ... 50 more properties
  method1(): void;
  method2(): void;
  // ... 20 more methods
  // Split into smaller, focused interfaces!
}

// Bad: Using interface for unions (use type instead)
// interface StringOrNumber = string | number; // ✗ Not possible
type StringOrNumber = string | number; // ✓ Use type for unions

// Bad: Duplicate properties
interface Bad {
  name: string;
  name: string; // ✗ Duplicate identifier
}
```

---

## Interface as Object Types

### Explanation

Interfaces are primarily used to define the structure of objects, specifying what properties an object should have and their types.

### Examples

```typescript
interface Point {
  x: number;
  y: number;
}

interface Person {
  firstName: string;
  lastName: string;
  age: number;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

function greet(person: Person): string {
  return `Hello, ${person.firstName} ${person.lastName}!`;
}

const john: Person = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};

console.log(greet(john)); // "Hello, John Doe!"

// Structural typing - shape matters, not name
const jane = {
  firstName: "Jane",
  lastName: "Smith",
  age: 25,
  email: "jane@example.com", // Extra property is OK
};

console.log(greet(jane)); // ✓ Works! Has all required properties
```

### Best Practices

- Use interfaces to document object structures
- Leverage structural typing (duck typing)
- Use optional properties (`?`) for properties that may not exist
- Use `readonly` for properties that shouldn't be modified
- Nest interfaces for complex structures

```typescript
// Good: Well-structured interface
interface BlogPost {
  readonly id: string;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  publishedAt?: Date;
  updatedAt?: Date;
}

interface Author {
  readonly id: string;
  name: string;
  email: string;
}

// Good: Using type guards with interfaces
interface Dog {
  type: "dog";
  bark(): void;
}

interface Cat {
  type: "cat";
  meow(): void;
}

type Pet = Dog | Cat;

function handlePet(pet: Pet) {
  if (pet.type === "dog") {
    pet.bark(); // TypeScript knows it's a Dog
  } else {
    pet.meow(); // TypeScript knows it's a Cat
  }
}
```

### What to Avoid

- ❌ Excess property checking issues with object literals
- ❌ Confusing interfaces with runtime values
- ❌ Overly permissive types with index signatures

```typescript
// Bad: Excess property checking with object literals
interface Config {
  timeout: number;
}

function configure(config: Config) {}

configure({ timeout: 1000, retries: 3 }); // ✗ Error: 'retries' does not exist
// Fix: Use a variable or extend the interface
const myConfig = { timeout: 1000, retries: 3 };
configure(myConfig); // ✓ OK

// Bad: Thinking interfaces exist at runtime
interface User {
  name: string;
}

// console.log(User); // ✗ Error: 'User' only refers to a type
// if (obj instanceof User) {} // ✗ Error: 'User' only refers to a type

// Bad: Overly permissive index signature
interface AnyObject {
  [key: string]: any; // Too permissive - no type safety!
}

// Better: Be specific
interface UserRecord {
  [userId: string]: {
    name: string;
    email: string;
  };
}
```

---

## Using Interfaces to Define Function Types

### Explanation

Interfaces can define function signatures, specifying the parameters and return type of functions. This is useful for callback types and function contracts.

### Examples

```typescript
// Function type using interface
interface MathOperation {
  (a: number, b: number): number;
}

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;

// Interface with both properties and methods
interface Calculator {
  name: string;
  (a: number, b: number): number; // Call signature
}

// More complex example
interface SearchFunction {
  (query: string, caseSensitive?: boolean): string[];
  maxResults: number;
}

const search: SearchFunction = (query: string, caseSensitive = false) => {
  // Implementation
  return [];
};
search.maxResults = 100;

// Callback interface
interface EventHandler {
  (event: Event): void;
}

function addEventListener(event: string, handler: EventHandler): void {
  // Implementation
}
```

### Best Practices

- Use interfaces for function types when they have additional properties
- Use type aliases for simple function signatures
- Be explicit about optional parameters and return types
- Use interfaces for callback patterns

```typescript
// Good: Function type with properties
interface Validator {
  (value: string): boolean;
  errorMessage: string;
}

const emailValidator: Validator = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
emailValidator.errorMessage = "Invalid email format";

// Good: Clear callback interface
interface ResponseHandler<T> {
  onSuccess(data: T): void;
  onError(error: Error): void;
  onComplete?(): void;
}

function fetchData<T>(url: string, handler: ResponseHandler<T>): void {
  fetch(url)
    .then((res) => res.json())
    .then((data) => handler.onSuccess(data))
    .catch((error) => handler.onError(error))
    .finally(() => handler.onComplete?.());
}
```

### What to Avoid

- ❌ Using interfaces for simple function types (use type instead)
- ❌ Confusing call signatures with method signatures
- ❌ Overcomplicating function interfaces

```typescript
// Bad: Interface for simple function type
interface SimpleFunction {
  (x: number): number;
}
// Better: Use type alias
type SimpleFunction = (x: number) => number;

// Bad: Mixing call and method signatures incorrectly
interface Confusing {
  (x: number): void; // Call signature
  method(x: number): void; // Method signature
  // This creates confusion about how to use the interface
}

// Bad: Overcomplicated
interface OverlyComplex {
  <T, U, V>(
    arg1: T,
    arg2: U,
    arg3: V,
    callback: (a: T, b: U) => V,
    options?: { timeout: number; retries: number },
  ): Promise<Array<T | U | V>>;
}
// Simplify or use type alias for complex signatures

// Good: Clear separation
interface EventEmitter {
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data: any): void;
}

type EventHandler = (data: any) => void;
```

---

## Implementing Interfaces

### Explanation

Classes can implement interfaces using the `implements` keyword. This ensures that the class adheres to the contract defined by the interface, providing all required properties and methods.

### Examples

```typescript
interface Drawable {
  draw(): void;
  setColor(color: string): void;
}

class Circle implements Drawable {
  constructor(
    private radius: number,
    private color: string = "black",
  ) {}

  draw(): void {
    console.log(`Drawing a ${this.color} circle with radius ${this.radius}`);
  }

  setColor(color: string): void {
    this.color = color;
  }

  // Class can have additional members
  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Drawable {
  constructor(
    private width: number,
    private height: number,
    private color: string = "black",
  ) {}

  draw(): void {
    console.log(`Drawing a ${this.color} rectangle ${this.width}x${this.height}`);
  }

  setColor(color: string): void {
    this.color = color;
  }
}

// Implementing multiple interfaces
interface Movable {
  move(x: number, y: number): void;
}

interface Resizable {
  resize(scale: number): void;
}

class Sprite implements Drawable, Movable, Resizable {
  constructor(
    private x: number = 0,
    private y: number = 0,
    private scale: number = 1,
    private color: string = "white",
  ) {}

  draw(): void {
    console.log(`Drawing sprite at (${this.x}, ${this.y})`);
  }

  setColor(color: string): void {
    this.color = color;
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  resize(scale: number): void {
    this.scale = scale;
  }
}
```

### Best Practices

- Use `implements` to enforce contracts on classes
- Implement multiple interfaces for flexible, composable designs
- Keep interfaces focused and cohesive (Interface Segregation Principle)
- Use interfaces to enable dependency inversion

```typescript
// Good: Dependency inversion with interfaces
interface DataStorage {
  save(key: string, value: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
}

class LocalStorageAdapter implements DataStorage {
  async save(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async load(key: string): Promise<any> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

class APIStorageAdapter implements DataStorage {
  async save(key: string, value: any): Promise<void> {
    await fetch(`/api/data/${key}`, {
      method: "POST",
      body: JSON.stringify(value),
    });
  }

  async load(key: string): Promise<any> {
    const response = await fetch(`/api/data/${key}`);
    return response.json();
  }

  async delete(key: string): Promise<void> {
    await fetch(`/api/data/${key}`, { method: "DELETE" });
  }
}

// Service depends on interface, not concrete implementation
class UserService {
  constructor(private storage: DataStorage) {}

  async saveUser(user: any): Promise<void> {
    await this.storage.save(`user_${user.id}`, user);
  }
}

// Good: Interface Segregation
interface Reader {
  read(): string;
}

interface Writer {
  write(data: string): void;
}

class FileHandler implements Reader, Writer {
  read(): string {
    return "file contents";
  }

  write(data: string): void {
    console.log("Writing:", data);
  }
}

class ReadOnlyFile implements Reader {
  read(): string {
    return "file contents";
  }
  // Doesn't need to implement Writer
}
```

### What to Avoid

- ❌ Forgetting to implement all interface members
- ❌ Using incorrect signatures when implementing
- ❌ Creating fat interfaces (violates Interface Segregation Principle)
- ❌ Implementing interfaces in classes that don't need them

```typescript
// Bad: Missing implementation
interface Complete {
  method1(): void;
  method2(): void;
}

class Incomplete implements Complete {
  method1(): void {
    console.log("Method 1");
  }
  // ✗ Error: Class 'Incomplete' incorrectly implements interface 'Complete'
  // Property 'method2' is missing
}

// Bad: Wrong signature
interface Contract {
  process(data: string): number;
}

class WrongImplementation implements Contract {
  process(data: number): string {
    // ✗ Wrong parameter and return types!
    return "";
  }
}

// Bad: Fat interface (violates ISP)
interface FatInterface {
  method1(): void;
  method2(): void;
  method3(): void;
  method4(): void;
  method5(): void;
  // Too many unrelated methods!
}

class Forced implements FatInterface {
  method1(): void {}
  method2(): void {}
  method3(): void {}
  method4(): void {} // Forced to implement methods it doesn't need
  method5(): void {}
}

// Better: Split into focused interfaces
interface Interface1 {
  method1(): void;
  method2(): void;
}

interface Interface2 {
  method3(): void;
}

class Focused implements Interface1 {
  method1(): void {}
  method2(): void {}
  // Only implements what it needs
}

// Bad: Unnecessary implementation
class SimpleClass implements Object {
  // Pointless
  toString(): string {
    return "simple";
  }
}
```

---

## Ensuring Base Types with Interfaces

### Explanation

Interfaces can be used to ensure that classes or objects conform to a specific structure. This is useful for type checking, polymorphism, and ensuring consistency across different implementations.

### Examples

```typescript
interface Animal {
  name: string;
  makeSound(): void;
}

// Ensuring function parameters match interface
function handleAnimal(animal: Animal): void {
  console.log(`${animal.name} says:`);
  animal.makeSound();
}

class Dog implements Animal {
  constructor(public name: string) {}

  makeSound(): void {
    console.log("Woof!");
  }
}

class Cat implements Animal {
  constructor(public name: string) {}

  makeSound(): void {
    console.log("Meow!");
  }
}

const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");

handleAnimal(dog); // Works
handleAnimal(cat); // Works

// Even works with object literals (structural typing)
handleAnimal({
  name: "Bird",
  makeSound() {
    console.log("Tweet!");
  },
}); // Works!

// Type guards with interfaces
interface Success {
  status: "success";
  data: any;
}

interface Failure {
  status: "failure";
  error: string;
}

type Result = Success | Failure;

function handleResult(result: Result) {
  if (result.status === "success") {
    console.log(result.data); // TypeScript knows it's Success
  } else {
    console.error(result.error); // TypeScript knows it's Failure
  }
}
```

### Best Practices

- Use interfaces to define contracts for polymorphic behavior
- Leverage discriminated unions for type-safe conditional logic
- Use interfaces as function parameter types for flexibility
- Use structural typing to your advantage

```typescript
// Good: Polymorphic behavior through interfaces
interface PaymentMethod {
  processPayment(amount: number): Promise<boolean>;
}

class CreditCard implements PaymentMethod {
  async processPayment(amount: number): Promise<boolean> {
    console.log(`Processing credit card payment: $${amount}`);
    return true;
  }
}

class PayPal implements PaymentMethod {
  async processPayment(amount: number): Promise<boolean> {
    console.log(`Processing PayPal payment: $${amount}`);
    return true;
  }
}

class Checkout {
  constructor(private paymentMethod: PaymentMethod) {}

  async pay(amount: number): Promise<void> {
    const success = await this.paymentMethod.processPayment(amount);
    if (success) {
      console.log("Payment successful");
    }
  }
}

// Good: Discriminated unions
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "circle":
      return Math.PI * shape.radius ** 2;
  }
}

// Good: Generic interfaces for type safety
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation
    return null;
  }

  async save(user: User): Promise<void> {
    // Implementation
  }

  async delete(id: string): Promise<void> {
    // Implementation
  }
}
```

### What to Avoid

- ❌ Not using discriminated unions when you should
- ❌ Using `any` type and bypassing interface checks
- ❌ Casting types unsafely
- ❌ Creating interfaces that are too generic

```typescript
// Bad: Not using discriminated unions
interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function handle(response: APIResponse) {
  if (response.success) {
    console.log(response.data); // data might be undefined!
  } else {
    console.log(response.error); // error might be undefined!
  }
}

// Better: Discriminated union
interface SuccessResponse {
  success: true;
  data: any;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type BetterAPIResponse = SuccessResponse | ErrorResponse;

function betterHandle(response: BetterAPIResponse) {
  if (response.success) {
    console.log(response.data); // Guaranteed to exist
  } else {
    console.log(response.error); // Guaranteed to exist
  }
}

// Bad: Using 'any' and bypassing checks
function bad(animal: any) {
  animal.makeSound(); // No type safety!
}

// Bad: Unsafe casting
const obj = {} as Animal; // Dangerous! obj doesn't actually implement Animal
obj.makeSound(); // Runtime error!

// Bad: Overly generic interface
interface Thing {
  data: any;
  doSomething(param: any): any;
  // Too generic - no type safety
}
```

---

## Extending Interfaces

### Explanation

Interfaces can extend other interfaces, inheriting their properties and methods. This allows you to build complex types from simpler ones and create hierarchies of related types.

### Examples

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  name: "John Doe",
  age: 30,
  employeeId: 12345,
  department: "Engineering",
};

// Extending multiple interfaces
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Identifiable {
  id: string;
}

interface User extends Person, Timestamped, Identifiable {
  email: string;
  role: "admin" | "user";
}

const user: User = {
  id: "user-123",
  name: "Alice",
  age: 28,
  email: "alice@example.com",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Overriding properties when extending
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  age: number; // Can re-declare with same or more specific type
  breed: string;
}
```

### Best Practices

- Use interface extension for "is-a" relationships
- Build complex interfaces from simple, reusable pieces
- Create base interfaces for common properties
- Use extension for progressive disclosure of types

```typescript
// Good: Reusable base interfaces
interface Auditable {
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;
}

interface Entity extends Auditable, SoftDeletable {
  id: string;
}

interface Product extends Entity {
  name: string;
  price: number;
  inStock: boolean;
}

interface Order extends Entity {
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  total: number;
}

// Good: Progressive disclosure
interface BasicConfig {
  apiUrl: string;
  timeout: number;
}

interface AdvancedConfig extends BasicConfig {
  retryCount: number;
  retryDelay: number;
  cacheEnabled: boolean;
}

interface ExpertConfig extends AdvancedConfig {
  customHeaders: Record<string, string>;
  interceptors: RequestInterceptor[];
  logger: Logger;
}

// Good: Extending for specialization
interface Vehicle {
  brand: string;
  model: string;
  year: number;
}

interface Car extends Vehicle {
  doors: number;
  transmission: "manual" | "automatic";
}

interface ElectricCar extends Car {
  batteryCapacity: number;
  range: number;
  chargingTime: number;
}
```

### What to Avoid

- ❌ Creating deep inheritance hierarchies
- ❌ Extending interfaces with conflicting properties
- ❌ Using extension when composition is more appropriate
- ❌ Circular interface dependencies

```typescript
// Bad: Deep hierarchy
interface A {}
interface B extends A {}
interface C extends B {}
interface D extends C {}
interface E extends D {} // Too deep!

// Bad: Conflicting properties
interface Base {
  value: string;
}

interface Extended extends Base {
  value: number; // ✗ Error: Types are incompatible
}

// Bad: Should use composition
interface WithLogger {
  logger: Logger;
}

interface WithCache {
  cache: Cache;
}

// Instead of extending, use composition in the implementing class
interface Service extends WithLogger, WithCache {
  doSomething(): void;
}

// Better: Compose in the class
interface Service {
  doSomething(): void;
}

class ServiceImpl implements Service {
  constructor(
    private logger: Logger,
    private cache: Cache,
  ) {}

  doSomething(): void {
    this.logger.log("Doing something");
  }
}

// Bad: Circular dependency
interface A extends B {
  a: string;
}

interface B extends A {
  // ✗ Error: Interface 'B' circularly references itself
  b: string;
}

// Bad: Over-extending
interface Everything extends Interface1, Interface2, Interface3, Interface4, Interface5, Interface6 {
  // Too many interfaces - consider refactoring
}
```

---

## Summary

This guide covered the essential TypeScript features for object-oriented programming:

1. **Classes**: Blueprints for creating objects with properties and methods
2. **Access Modifiers**: Control visibility with `public`, `private`, and `protected`
3. **Readonly Fields**: Prevent reassignment after initialization
4. **Getters/Setters**: Control property access and modification
5. **Static Members**: Class-level properties and methods
6. **Inheritance**: Extend classes to create specialized versions
7. **Abstract Classes**: Base classes that can't be instantiated directly
8. **Interfaces**: Define contracts for object shapes and behaviors
9. **Interface Extension**: Build complex types from simpler ones

### Key Principles

- **Encapsulation**: Hide implementation details using access modifiers
- **Inheritance**: Reuse code through class hierarchies (prefer shallow)
- **Polymorphism**: Use interfaces for flexible, interchangeable implementations
- **Composition over Inheritance**: Favor composition when possible
- **Interface Segregation**: Keep interfaces focused and cohesive
- **Dependency Inversion**: Depend on abstractions (interfaces), not concretions

### When to Use What

- **Classes**: When you need instances with shared behavior and state
- **Interfaces**: When you need to define contracts or object shapes
- **Abstract Classes**: When you need shared implementation + contract enforcement
- **Inheritance**: For true "is-a" relationships with shared code
- **Composition**: For "has-a" relationships and flexible code reuse
