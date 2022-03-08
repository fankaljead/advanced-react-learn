/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-07 10:38:01
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-07 11:10:12
 * @FilePath: \advancend-react\src\components\2_optimization\10_render_control\index.jsx
 * @Description: 10 渲染控制
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";
import PropTypes from "prop-types";

// 10.2 控制 render 方法
// 10.2.1 缓存 React.element 对象
// 子组件
function Children({ number }) {
  console.log("子组件渲染");
  return <div>let us learn react {number}</div>;
}
Children.propTypes = {
  number: PropTypes.number,
};

// 父组件
export class StoreReactElementDemo1 extends React.Component {
  state = {
    numberA: 0,
    numberB: 0,
  };

  render() {
    return (
      <div>
        <Children number={this.state.numberA} />
        <button
          onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
        >
          改变numberA -{this.state.numberA}
        </button>
        <button
          onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
        >
          改变numberB -{this.state.numberB}
        </button>
      </div>
    );
  }
}

export class StoreReactElementDemo2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numberA: 0,
      numberB: 0,
    };
    this.component = <Children number={this.state.numberA} />;
  }

  constrolComponentRender = () => {
    const { props } = this.component;
    /* 只有 numberA 变化的时候，重新创建 element 对象  */
    if (props.number != this.state.numberA) {
      return (this.component = React.cloneElement(this.component, {
        number: this.state.numberA,
      }));
    }
    return this.component;
  };

  render() {
    return (
      <div>
        {this.constrolComponentRender()}
        <button
          onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
        >
          改变numberA -{this.state.numberA}
        </button>
        <button
          onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
        >
          改变numberB -{this.state.numberB}
        </button>
      </div>
    );
  }
}

// 达到完美效果 函数组件使用 useMemo
export const StoreReactElementDemo3 = () => {
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      {(React.useMemo(() => <Children number={numberA} />), [numberA])}
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
    </div>
  );
};

// useMemo 使用
function Children2({ numberA, numberB }) {
  console.log("子组件渲染 numberA:", numberA);
  console.log("子组件渲染 numberB:", numberB);
  return <div>let us learn react {numberA}</div>;
}
Children2.propTypes = {
  numberA: PropTypes.number,
  numberB: PropTypes.number,
};

export const UseMemoDemo1 = () => {
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      {React.useMemo(
        () => (
          <Children2 numberA={numberA} numberB={numberB} />
        ),
        [numberA, numberB]
      )}
      <button onClick={() => setNumberA(numberA + 1)}>
        改变numberA: {numberA}
      </button>
      <button onClick={() => setNumberB(numberB + 1)}>
        改变numberB {numberB}
      </button>
    </div>
  );
};
