type FileData = {
  path: string;
  content: string;
};

type DatabaseData = {
  connectionUrl: string;
  credentials: string;
};

type Status = {
  isOpen: boolean;
  errorMessage?: string;
};

// we can intersect two types using the "&" operator like this:
type AccessedFile = FileData & Status;
type AccessedDatabaseData = DatabaseData & Status;

// we can also intersect interfaces like this:
interface UserA {
  name: string;
  age: number;
}
interface UserB {
  name: string;
  age: number;
}

interface UserC extends UserA, UserB {}
