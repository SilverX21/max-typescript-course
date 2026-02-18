//here we have method overloading, it's basically having the same method name with various parameters that don't match
//Also, we can have multiple return types like below, and Typescript will know which will be the return type given the parameters
function getLenght(value: string): string;
function getLenght(value: any[]): number;
function getLenght(val: string | any[]) {
  if (typeof val === "string") {
    const numberOfWords = val.split(" ").length;
    return `${numberOfWords} words`;
  }

  return val.length;
}

const numOfWords = getLenght("Hello from the words example!");
console.log("Number of words: ", numOfWords);
const numItems = getLenght(["Sports", "Cookies"]);
console.log("Number of items: ", numItems);
