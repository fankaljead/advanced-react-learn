/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 10:55:00
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 10:56:04
 * @FilePath: \advancend-react\src\components\2_optimization\13_detail_process\proper_use_of_state.jsx
 * @Description: 合理使用state
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

export class ProperUseState extends React.Component {
  node = null;
  scrollTop = 0;
  handleScroll = () => {
    const { scrollTop } = this.node;
    this.scrollTop = scrollTop;
  };
  render() {
    return (
      <div
        ref={(node) => (this.node = node)}
        onScroll={this.handleScroll}
      ></div>
    );
  }
}

export function ProperUseStateFn() {
  const dom = React.useRef(null);
  const scrollTop = React.useRef(0);
  const handleScroll = () => {
    scrollTop.current = dom.current.scrollTop;
  };
  return <div ref={dom} onScroll={handleScroll}></div>;
}
