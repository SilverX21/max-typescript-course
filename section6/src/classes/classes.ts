class User {
  //readonly properties cannot be assigned a new value, but can be mutated
  readonly hobbies: string[] = [];

  //if we add public before the property name, we won't need to define the properties inside the class
  //they will be created automatically
  constructor(
    public name: string,
    public age: number,
  ) {}
}

class User1 {
  constructor(
    private firstName: string,
    private lastName: string,
  ) {}

  //getters are like properties where we can generate them on the fly
  get fullName(): string {
    return this.firstName + " " + this.lastName;
  }
}

class User2 {
  private _firstName = "";
  private _lastName = "";

  //we can have private properties where we assign their value using setters
  set firstName(name: string) {
    if (name.trim() === "") {
      throw new Error("Invalid name");
    }
    this._firstName = name;
  }

  set lastName(name: string) {
    if (name.trim() === "") {
      throw new Error("Invalid name");
    }
    this._lastName = name;
  }

  get fullName() {
    return this._firstName + " " + this._lastName;
  }

  //we can also add static methods/properties, this way we don't need to instantiate a new User
  static Id = "123";

  static greet() {
    console.log("Hey there, mate!");
  }
}

const silver = new User1("Silver", "1");
const gold = new User("Gold", 30);

//here we are mutating the hobbies, not reassigning a new value (using =)
// (example of assigning new value: gold.hobbies = ["Sports"])
gold.hobbies.push("Football");

console.log(silver.fullName);
console.log(gold.hobbies);

const red = new User2();
red.firstName = "Red";
red.lastName = "The man";
console.log(red);
console.log(red.fullName);

//we can use static methods and properties like this, without creating a new instance
console.log(User2.Id);

console.log(User2.greet());

//we can also extend classes using inheritance like this:
class Employee extends User {
  constructor(
    public name: string,
    public age: number,
    public jobTitle: string,
  ) {
    //when we inherit from a class that has a constructor, we need to use super to reference to it's constructor
    //this way we can pass the properties it requires, using the class that is inheriting to provide those values
    super(name, age);
  }

  work() {
    console.log("Working and debugging");
  }
}

const man = new Employee("Max", 21, "Programmer");
console.log(man.hobbies);

//we can have abstract classes like this
abstract class UIElement {
  constructor(public identifier: string) {}

  clone(targetLocation: string) {}
}

//abstract classes should be extended by other classes
class SideDrawerElement extends UIElement {
  constructor(
    public identifier: string,
    public position: "left" | "right",
  ) {
    //we can use super to pass the identifier property that is required in the abstract class constructor!
    super(identifier);
  }
}

const drawer = new SideDrawerElement("drawer", "left");
console.log(drawer.identifier);
console.log(drawer.position);
