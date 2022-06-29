/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-14 09:30:31
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-06-05 19:24:21
 * @FilePath: \advancend-react\src\components\3_react_principle\17_hooks_principle\index.jsx
 * @Description: Hooks 原理
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

export default function Index() {
  const [number, setNumber] = React.useState(0); // 第一个hooks
  const [num, setNum] = React.useState(1); // 第二个hooks
  const dom = React.useRef(null); // 第三个hooks
  React.useEffect(() => {
    // 第四个hooks
    console.log(dom.current);
  }, []);
  return (
    <div ref={dom}>
      <div onClick={() => setNumber(number + 1)}> {number} </div>
      <div onClick={() => setNum(num + 1)}> {num}</div>
    </div>
  );
}

function HooksIfDemo({ showNumber }) {
  let number, setNumber;
  showNumber && ([number, setNumber] = React.useState(0)); // 第一个hooks
  const [num, setNum] = React.useState(1); // 第二个hooks
  const dom = React.useRef(null); // 第三个hooks
  React.useEffect(() => {
    // 第四个hooks
    console.log(dom.current);
  }, []);
  return (
    <div ref={dom}>
      <div onClick={() => setNumber(number + 1)}> {number} </div>
      <div onClick={() => setNum(num + 1)}> {num}</div>
    </div>
  );
}

export function HooksIfDemoContainer() {
  const [showNumber, setShowNumber] = React.useState(true);
  return (
    <div>
      <HooksIfDemo showNumber={showNumber} />
      <button onClick={() => setShowNumber(!showNumber)}>toggle</button>
    </div>
  );
}

// function mountState(initialState){
//   const hook = mountWorkInProgressHook();
//  if (typeof initialState === 'function') {initialState = initialState() } // 如果 useState 第一个参数为函数，执行函数得到初始化state
//   hook.memoizedState = hook.baseState = initialState;
//  const queue = (hook.queue = { ... }); // 负责记录更新的各种状态。
//  const dispatch = (queue.dispatch = (dispatchAction.bind(  null,currentlyRenderingFiber,queue, ))) // dispatchAction 为更新调度的主要函数
//  return [hook.memoizedState, dispatch];
// }

export function HooksUpdate() {
  const [number, setNumber] = React.useState(0);
  const handleClick = () => {
    setNumber((num) => num + 1); // num = 1
    setNumber((num) => num + 2); // num = 3
    setNumber((num) => num + 3); // num = 6
  };
  const handleClick2 = () => {
    setNumber(number + 1);
    setNumber(number + 2);
    setNumber(number + 3);
  };
  return (
    <div>
      <button onClick={() => handleClick()}>传函数点击 {number} </button>
      <button onClick={() => handleClick2()}>传值点击 {number} </button>
    </div>
  );
}

// function updateReducer() {
//   // 第一步把待更新的pending队列取出来。合并到 baseQueue
//   const first = baseQueue.next;
//   let update = first;
//   do {
//     /* 得到新的 state */
//     newState = reducer(newState, action);
//   } while (update !== null && update !== first);
//   hook.memoizedState = newState;
//   return [hook.memoizedState, dispatch];
// }


export class ClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
    };
  }
  handleClick = () => {
    for (let i = 0; i < 5; ++i) {
      setTimeout(() => {
        this.setState({ number: this.state.number + 1 });
        console.log('class num:', this.state.number);
      }, 1000);
    }
  };
  render() {
    return (
      <div>
        <h1>class number:{this.state.number}</h1>
        <button onClick={this.handleClick}>num++</button>
      </div>
    );
  }
}

export function FunctionComponent() {
  const [num, setNum] = React.useState(0);
  const handleClick = () => {
    for (let i = 0; i < 5; ++i) {
      setTimeout(() => {
        setNum(num + 1);
        console.log("function num:", num);
      }, 1000);
    }
  };
  return (
    <div>
      <h1>function num:{num}</h1>
      <button onClick={handleClick}>num++</button>
    </div>
  );
}
