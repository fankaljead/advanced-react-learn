/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-08 14:53:01
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-08 15:07:24
 * @FilePath: \advancend-react\src\components\2_optimization\10_render_control\shouldComponentUpdate.jsx
 * @Description: shouldComponentUpdate
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

class Children extends React.Component {
  state = {
    numberA: 0,
    numberB: 0,
  };

  shouldComponentUpdate(newProps, newState, newContext) {
    /* 只有当 props 中 propsNumA 和 state 中 numberA 变化时，更新组件  */
    if (
      newProps.propsNumA !== this.props.propsNumA ||
      newState.numberA !== this.state.numberA
    ) {
      return true;
    }
    return false;
  }

  render() {
    console.log("组件渲染");
    const { numberA, numberB } = this.state;

    return (
      <div>
        <button onClick={() => this.setState({ numberA: numberA + 1 })}>
          改变state中 numberA
        </button>
        <button onClick={() => this.setState({ numberB: numberB + 1 })}>
          改变stata中 numberB
        </button>
        <div>hello,let us learn React!</div>
      </div>
    );
  }
}

export function ShouldComponentUpdate() {
  // 父组件
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <button onClick={() => setNumberA(numberA + 1)}>改变props中numA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变props中numB</button>
      <Children propsNumA={numberA} propsNumB={numberB} />
    </div>
  );
}
