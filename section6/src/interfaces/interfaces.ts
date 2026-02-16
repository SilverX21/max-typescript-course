//interfaces only exist in typescript, javascript doesn't have this feature
interface Authenticatable {
  //here we only have an object type, we don't have the implementation
  email: string;
  password: string;

  login(): void;
  logout(): void;
}

//we can define the same interface name again to add some features like this
//with this, the compiler will know that this interface will have all of these features
//this could be useful when extending a library or something we don't totally control
interface Authenticatable {
  userName: string;
}

let user: Authenticatable;
//when something inherits or uses an interface, it needs to implement it's methods
user = {
  email: "test1@gmail.com",
  password: "123",
  userName: "test1",
  login() {
    console.log(`User ${this.email} just logged in!`);
  },
  logout() {
    console.log(`User ${this.email} just logged out!`);
  },
};

user.login();
user.logout();

//a class can also implement an interface like this
class AuthenticatableUser implements Authenticatable {
  //we can have the implementation of the properties by using a constructor like this
  constructor(
    public email: string,
    public password: string,
    public userName: string,
  ) {}

  login(): void {
    console.log(`User ${this.userName} just logged in!`);
  }
  logout(): void {
    console.log(`User ${this.userName} just logged out!`);
  }
}

const user2 = new AuthenticatableUser("test2@gmail.com", "123", "test2");
user2.login();
user2.logout();

//we can also extend interfaces like this, this is a good way to extend an interface with a new property
interface AuthenticatableAdmin extends Authenticatable {
  //this will use all of the properties from the Authenticatable interface
  //and add the userName property
  role: "admin" | "superadmin";
}

const admin: AuthenticatableAdmin = {
  email: "admin@gmail.com",
  password: "123",
  userName: "admin",
  role: "admin",
  login() {
    console.log(`Admin ${this.userName} just logged in!`);
  },
  logout() {
    console.log(`Admin ${this.userName} just logged out!`);
  },
};

admin.login();
admin.logout();
