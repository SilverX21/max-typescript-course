class ListNode<T> {
    //this will be the link to the next object in the list
    next?: ListNode<T>;

    constructor(public value: T) {
    }
}

class LinkedList<T> {
    //root is define as an optional property
    private root?: ListNode<T>;
    //this is the last node
    private tail?: ListNode<T>;
    private length = 0;

    add(value: T) {
        //here we create a new node and pass the value we received
        const node = new ListNode(value);
        if (!this.root || !this.tail) {
            this.root = node;
            this.tail = node;
        } else {
            this.tail.next = node;
        }
        this.length++;
    }

    getNumberOfElements() {
        return this.length;
    }

    print() {
        let current = this.root;
        while (current) {
            console.log(current.value);
            current = current.next;
        }
    }
}

class Test {
    constructor(public id: number, public name?: string) {
    }
}

const numberList = new LinkedList<number>();
const nameList = new LinkedList<string>();

//we can use the methods like this:
const testList = new LinkedList<Test>();
testList.add(new Test(1, "Hello"))
console.log(testList);