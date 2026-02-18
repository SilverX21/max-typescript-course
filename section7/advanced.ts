//If we want more people to use our type, but can given them freedom to add more properties, we can use the Index type
type DataStore = {
  //this tells typescript that this is a property that could have any name, with the type we define, it's like a placeholder
  //after the second ":" we define the types that the user can have for the property, for example, if the user set's a property like this:
  // store.name = "test" it will give an error
  [prop: string]: number | boolean;
};

let store: DataStore = {};

//here we can create whichever properties we want, if they are boolean or number
store.id = 5;
store.isOpen = false;

//in this case, we define roles1 as a const,
const roles1: string[] = ["admin", "guest", "editor"];
roles1.push("tester"); //as you can see, we can change roles1 here

//when we use "as const", we say to typescript to create as narrowly possible, this will be a readonly variable
//this will make that the variable can only be read, so no one can update it
let roles = ["admin", "guest", "editor"] as const;
