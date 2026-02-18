type FileSource = { type: "file"; path: string };
const fileSource: FileSource = { type: "file", path: "path/to/file.txt" };

type DBSource = { type: "db"; connectionUrl: string };
const dbSource: DBSource = { type: "db", connectionUrl: "localhost:5432" };

type Source = FileSource | DBSource;

//here we will have this check because we will reuse it in other places
//as you can see, the return type is not defined, but typescript will add some extra sauce to it and if you hover it
//you can see it's of type FileSource
function isFile(source: Source) {
  return source.type === "file";
}

function loadData(source: Source) {
  //guards are used to check if a value is of a specific type
  //we can use the 'in' operator to check if a value is of a specific type
  if ("path" in source) {
    console.log(source.path);
  }

  //we can also use discriminated unions to check if a value is of a specific type
  //for that we can add a type property to the object, and then use it to check if the value is of a specific type
  if (isFile(source)) {
    //inside this if statement, typescript knows that source is of type FileSource
    console.log(source.path);
  } else if (source.type === "db") {
    console.log(source.connectionUrl);
  }
}

class User3 {
  constructor(
    public name: string,
    public age: number,
  ) {}

  join() {}
}

class Admin {
  constructor(public permissions: string[]) {}

  scan() {}
}

const user3 = new User3("John", 20);
const admin = new Admin(["ban", "restore"]);

type Entity = User3 | Admin;

function initEntity(entity: Entity) {
  //we can also use guards using the 'instanceof' operator
  if (entity instanceof User3) {
    entity.join();
    return;
  }

  //as before, given typescript knows that we have the context of the code, it will know that if it continues to this code
  //is that the entity is of the type Admin
  entity.scan();
}
