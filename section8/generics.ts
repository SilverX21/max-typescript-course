//Generic types can be used like this
type DataStore<T> = {
  [key: string]: T;
};

//we can pass union types, classes, types, etc
let store: DataStore<string | boolean> = {};
store.name = "test";
store.isOpen = true;

//we can also define generic functions like this
function merge<T>(a: T, b: T) {
  return [a, b];
}

//we can use a function that uses generics like this
const ids = merge<number>(1, 2);
//we can also use inference, that typescript can check which type it needs to be
const otherIds = merge(3, 4);

//we can also have different types like this:
function merge2<T, U>(a: T, b: U) {
  return [a, b];
}
//here we are saying that the first parameter will be of type number and the second will be string
const id = merge2(21, "Silver");

//we can have constraints, where we define a constraint for the type you require
//we can use the 'extends' keyword to set a constraint like this, where we give
//the parameters different types that extend the object type
function mergeObj<T extends object, U extends object>(a: T, b: U) {
  return { ...a, ...b };
}

const merged = mergeObj({ username: "Silver" }, { age: 30 });
console.log(merged);

//we can also have generic classes like this
class User5<T> {
  constructor(public id: T) {}
}

const user = new User5(1);

//also, we can have generic interfaces
interface Role<T> {
  DoStuff(): string;
}
