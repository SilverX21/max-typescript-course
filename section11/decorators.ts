//decorators are an experimental feature in typescript, and they allow us to add extra functionality to classes, methods, properties, or parameters. They are functions that are called at runtime and can modify the behavior of the decorated element.

// To enable decorators in TypeScript, you need to set the "experimentalDecorators" option to true in your tsconfig.json file. This allows you to use the @ symbol to apply decorators to your classes, methods, properties, or parameters.

//decorators are just functions, below we have an example on how to create a simple decorator
//we can add two arguments, the first one is the target the second one is the context, which contains information about the decorated element, such as its name, kind, and whether it is static or not. In this case, we are not using the context, but we could use it to add extra functionality to the decorated element. We use ClassDecoratorContext that is a type provided by TypeScript that describes the context of a class decorator. It contains information about the decorated class, such as its name, whether it is abstract or not, and its members.
//we can also use generics to specify the type of the target, in this case, we are specifying that the target is a class constructor, which is a function that can be called with the new keyword to create an instance of the class. The type of the target is T, which extends new (...args: any[]) => any, which means that it is a constructor function that can take any number of arguments and return any type of object.
function logger<T extends new (...args: any[]) => any>(
  target: T,
  ctx: ClassDecoratorContext,
) {
  console.log("Target...");
  console.log(target);

  console.log("Context...");
  console.log(ctx);

  //we can modify the class by returning a new class that extends the original class. This way, we can add extra functionality to the class without modifying the original class. In this case, we are just returning a new class that extends the original class, but we could add extra functionality to it if we wanted to.
  return class extends target {
    constructor(...args: any[]) {
      //we need to call the super constructor to initialize the original class, and then we can add any extra functionality that we want. In this case, we are just adding an age property to the new class, but we could add any other properties or methods that we want
      super(...args);
      console.log("class constructor");
    }
  };
}

//we can also have method decorators
function autobind(
  target: (...arfs: any[]) => any,
  ctx: ClassMethodDecoratorContext, //we use the class method decorator context
) {
  console.log(target);
  console.log(ctx);
}

//we can use decorators like this, by adding the @ symbol
//decorators are just functions, and they receive the target of the decoration as an argument. In this case, the target is the Person class. We can use this target to modify the class or add extra functionality to it
@logger
class Person {
  name = "Silver";

  constructor() {
    //this allows us to bind the greet method to the instance of the class
    this.greet = this.greet.bind(this);
  }

  @autobind
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

//when we create an instance of the Person class, the logger decorator will be called, and it will log the target and the context to the console. It will also return a new class that extends the original class, which means that the new class will have all the properties and methods of the original class, plus any extra functionality that we added in the decorator. In this case, we added an age property to the new class, so when we create an instance of the Person class, it will have the age property as well. When we log the person object to the console, we will see that it has both the name and age properties, as well as the greet method.
const person = new Person();
console.log(person);

const greet = person.greet;
greet();
