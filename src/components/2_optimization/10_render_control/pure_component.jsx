/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-07 11:28:58
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-08 14:47:32
 * @FilePath: \advancend-react\src\components\2_optimization\10_render_control\pure_component.jsx
 * @Description: PureComponent
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

class Children extends React.PureComponent {
  state = {
    name: "zxh",
    age: 24,
    obj: {
      number: 1,
    },
  };
  changeObjNumber = () => {
    const { obj } = this.state;
    obj.number++;
    this.setState({ obj: { ...obj } });
  };
  render() {
    console.log("组件渲染");
    return (
      <div>
        <div> 组件本身改变state </div>
        <button onClick={() => this.setState({ name: "zxh" })}>
          state相同情况
        </button>
        <button onClick={() => this.setState({ age: this.state.age + 1 })}>
          state不同情况
        </button>
        <button onClick={this.changeObjNumber}>state为引用数据类型时候</button>
        <div>hello,my name is alien,let us learn React!</div>
      </div>
    );
  }
}
/* 父组件 */
export function PureComponentDemo1() {
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <div> 父组件改变props </div>
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
      <Children number={numberA} />
    </div>
  );
}

// PureComponent 注意事项
// 1. 避免使用箭头函数
class Children2 extends React.PureComponent {
  render() {
    console.log("子组件 PureComponent render");
    return <div>这是子组件 PureComponents: {this.props.numberA}</div>;
  }
}

const callback = () => {};
export class PureComponentDemo2 extends React.Component {
  state = {
    numberA: 1,
    numberB: 100,
  };
  render = () => (
    <div>
      <Children2 callback={() => {}} numberA={this.state.numberA} />
      {/* <Children2 callback={callback} numberA={this.state.numberA} /> */}
      <button
        onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
      >
        改变numberA
      </button>
      <button
        onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
      >
        改变numberB
      </button>
    </div>
  );
}

// 2. PureComponent 的父组件是函数组件的情况
class Children3 extends React.PureComponent {
  render() {
    console.log("子组件 PureComponent render");
    return <div>这是子组件 PureComponents: {this.props.numberA}</div>;
  }
}

export function PureComponentDemo3() {
  /* 每一次函数组件执行重新声明一个新的callback，PureComponent浅比较会认为不想等，促使组件更新  */
  const callback = function handlerCallback() {};
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <div> 父组件改变props </div>
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
      <Children3 number={numberA} callback={callback} numberA={numberA} />
    </div>
  );
}

export function PureComponentDemo4() {
  // 使用 useCallback
  const callback = React.useCallback(function handlerCallback() {}, []);
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <div> 父组件改变props </div>
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
      <Children3 number={numberA} callback={callback} numberA={numberA} />
    </div>
  );
}
