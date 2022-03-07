import React, { Component } from "react";
import { useState } from "react";

export default class ClassComponentDemo extends Component {
  // constructor(props) {
  //   super(props);
  //   console.log("props:", this.props);
  // }
  constructor(...arg) {
    super(...arg);
  }
  state = {};
  static number = 1;
  handleClick = () => console.log(111);
  componentDidMount() {
    console.log(ClassComponentDemo.number, ClassComponentDemo.number1);
  }

  render() {
    return (
      <div>
        <h1 onClick={this.handleClick}>this is class componet</h1>
      </div>
    );
  }
}

ClassComponentDemo.number1 = 2;
ClassComponentDemo.prototype.handleClick = () => {
  console.log(222);
};

export function FunctionComponent() {
  console.log(FunctionComponent.number);
  const [message, setMessage] = useState("hello world");

  return (
    <div
      onClick={() => {
        setMessage("let's learn react!");
      }}
    >
      {message}
    </div>
  );
}
FunctionComponent.number = 1;

// 子组件
function Son(props) {
  const { fatherSay, sayFather } = props;
  return (
    <div
      style={{
        backgroundColor: "lightyellow",
        border: "2px solid red",
        padding: "4px",
        margin: "5px",
      }}
    >
      我是子组件
      <div>父组件对我说: {fatherSay}</div>
      <input
        placeholder="我对父组件说"
        onChange={(e) => sayFather(e.target.value)}
      />
    </div>
  );
}

/* 父组件 */
export function Father() {
  const [childSay, setChildSay] = useState("");
  const [fatherSay, setFatherSay] = useState("");
  return (
    <div
      className="box father"
      style={{ padding: "10px", border: "2px solid orange" }}
    >
      我是父组件
      <div> 子组件对我说：{childSay} </div>
      <input
        placeholder="我对子组件说"
        onChange={(e) => setFatherSay(e.target.value)}
      />
      <Son fatherSay={fatherSay} sayFather={setChildSay} />
    </div>
  );
}

// 类组件继承
class Person extends Component {
  constructor(props) {
    super(props);
    console.log("hello, i am person");
  }
  componentDidMount() {
    console.log(1111);
  }
  eat() {
    /* 吃饭 */
  }
  sleep() {
    /* 睡觉 */
  }
  ddd() {
    console.log("打豆豆"); /* 打豆豆 */
  }
  render() {
    return <div>大家好，我是一个person</div>;
  }
}
/* 程序员 */
export class Programmer extends Person {
  constructor(props) {
    super(props);
    console.log("hello , i am Programmer too");
  }
  componentDidMount() {
    console.log(this);
  }
  code() {
    /* 敲代码 */
  }
  render() {
    return (
      <div
        style={{
          marginTop: "50px",
          border: "2px solid red",
          backgroundColor: "lightcyan",
        }}
      >
        {super.render()} {/* 让 Person 中的 render 执行 */}
        我还是一个程序员！ {/* 添加自己的内容 */}
      </div>
    );
  }
}
