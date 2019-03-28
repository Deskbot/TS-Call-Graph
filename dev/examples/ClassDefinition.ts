declare class Declaration {
    field: number;
}

class Example1 {
    public field1 = "field";
    private field2 = [1,2,3];
    protected field3 = {
        a: "a",
    };
    readonly field4 = 100;

    static staticField1 = [];

    constructor() {
        this.field1 = "field";
        let a = this.field1;
        this.field2[2] = 1;
        this["field1"] = "hi"; // won't get picked up by the program
        this.field3.a;
        let o = { a: 1 };
        let b = o.a;
        this.method2();
        console.log("expression");
    }

    method1() {
        this.field3;

        if (this.field1 === "hello") {
            this.field1 = "bye";
            this.method1();
        }
    }

    method2() {
        this.field1;
        this.field2;
        Example1.staticMethod;
    }

    method3() {

    }

    get property() {
        this.field1;
        return "hi";
    }

    set property(arg) {
        this.field4;
        Example1.staticField1;
    }

    static staticMethod() {
        Example1.staticField1;
    }
}

let cls = class Example2 {
    exField2 = "field2";
}
