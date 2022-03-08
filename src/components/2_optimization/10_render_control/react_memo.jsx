/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-08 15:14:25
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-08 15:35:15
 * @FilePath: \advancend-react\src\components\2_optimization\10_render_control\react_memo.jsx
 * @Description: React.memo
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

function TextDemo(props) {
  console.log("子组件渲染");
  return <div>hello world</div>;
}

const controlIsRender = (pre, next) => {
  return (
    pre.number === next.number ||
    (pre.number !== next.number && next.number > 5)
  );
};

const NewTextMemo = React.memo(TextDemo, controlIsRender);

export class ReactMemoDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 1,
      num: 1,
    };
  }

  render() {
    const { num, number } = this.state;
    return (
      <div>
        <div>
          改变num:当前值 {num}
          <button onClick={() => this.setState({ num: num + 1 })}>num++</button>
          <button onClick={() => this.setState({ num: num - 1 })}>num--</button>
        </div>
        <div>
          改变number: 当前值 {number}
          <button onClick={() => this.setState({ number: number + 1 })}>
            number ++
          </button>
          <button onClick={() => this.setState({ number: number - 1 })}>
            number --
          </button>
        </div>
        <NewTextMemo num={num} number={number} />
      </div>
    );
  }
}

// 一般情况下不要试图组件通过第二个参数直接返回 true 来阻断渲染
// 这样可能会造成很多麻烦
// 尽量不要这么尝试
export const NewIndex = React.memo(Index, () => true);
