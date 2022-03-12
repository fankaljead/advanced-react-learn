/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-12 10:29:33
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-12 12:24:19
 * @FilePath: \advancend-react\src\components\3_react_principle\16_reconcile_fiber\index.jsx
 * @Description: 调和与 fiber
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

// element 与 fiber 之间的关系
// export const FunctionComponent = 0;       // 对应函数组件
// export const ClassComponent = 1;          // 对应的类组件
// export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件
// export const HostRoot = 3;                // Root Fiber 可以理解为跟元素 ， 通过reactDom.render()产生的根元素
// export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal
// export const HostComponent = 5;           // dom 元素 比如 <div>
// export const HostText = 6;                // 文本节点
// export const Fragment = 7;                // 对应 <React.Fragment>
// export const Mode = 8;                    // 对应 <React.StrictMode>
// export const ContextConsumer = 9;         // 对应 <Context.Consumer>
// export const ContextProvider = 10;        // 对应 <Context.Provider>
// export const ForwardRef = 11;             // 对应 React.ForwardRef
// export const Profiler = 12;               // 对应 <Profiler/ >
// export const SuspenseComponent = 13;      // 对应 <Suspense>
// export const MemoComponent = 14;          // 对应 React.memo 返回的组件

// fiber 保存的信息
// react-reconciler/src/ReactFiber.js
// function FiberNode(){

//   this.tag = tag;                  // fiber 标签 证明是什么类型fiber。
//   this.key = key;                  // key调和子节点时候用到。
//   this.type = null;                // dom元素是对应的元素类型，比如div，组件指向组件对应的类或者函数。
//   this.stateNode = null;           // 指向对应的真实dom元素，类组件指向组件实例，可以被ref获取。

//   this.return = null;              // 指向父级fiber
//   this.child = null;               // 指向子级fiber
//   this.sibling = null;             // 指向兄弟fiber
//   this.index = 0;                  // 索引

//   this.ref = null;                 // ref指向，ref函数，或者ref对象。

//   this.pendingProps = pendingProps;// 在一次更新中，代表element创建
//   this.memoizedProps = null;       // 记录上一次更新完毕后的props
//   this.updateQueue = null;         // 类组件存放setState更新队列，函数组件存放
//   this.memoizedState = null;       // 类组件保存state信息，函数组件保存hooks信息，dom元素为null
//   this.dependencies = null;        // context或是时间的依赖项

//   this.mode = mode;                //描述fiber树的模式，比如 ConcurrentMode 模式

//   this.effectTag = NoEffect;       // effect标签，用于收集effectList
//   this.nextEffect = null;          // 指向下一个effect

//   this.firstEffect = null;         // 第一个effect
//   this.lastEffect = null;          // 最后一个effect

//   this.expirationTime = NoWork;    // 通过不同过期时间，判断任务是否过期， 在v17版本用lane表示。

//   this.alternate = null;           //双缓存树，指向缓存的fiber。更新阶段，两颗树互相交替。
// }

// fiber 建立关联
export default class Index extends React.Component {
  state = { number: 666 };
  handleClick = () => {
    this.setState({
      number: this.state.number + 1,
    });
  };
  render() {
    return (
      <div>
        hello,world
        <p> 《React进阶实践指南》 {this.state.number} 👍 </p>
        <button onClick={this.handleClick}>点赞</button>
      </div>
    );
  }
}
