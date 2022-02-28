function SuperType() {
  this.names = "test";
  this.colors = ["red", "blue"];
}

SuperType.prototype.sayHello = function () {
  console.log("hello");
};

function Subtype() {
  SuperType.call(this);
}

// Subtype.prototype = Object.create(SuperType.prototype);
let proto = Object.create(SuperType.prototype);
console.log("====", proto.constructor);
proto.constructor = Subtype;
console.log("====", proto.constructor);

Subtype.prototype = proto;

let child = new Subtype();

console.log(child.names);

child.sayHello();

console.log(Subtype.name);
