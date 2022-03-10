/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 10:52:15
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 10:53:19
 * @FilePath: \advancend-react\src\components\2_optimization\13_detail_process\clear_in_time.jsx
 * @Description: 及时清除定时器/延时器/监听器
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

export class ClearInTimeDemo extends React.Component {
  current = null;
  poll = () => {}; /* 轮训 */
  handleScroll = () => {}; /* 处理滚动事件 */
  componentDidMount() {
    this.timer = setInterval(() => {
      this.poll(); /* 2 秒进行一次轮训事件 */
    }, 2000);
    this.current.addEventListener("scroll", this.handleScroll);
  }
  componentWillUnmount() {
    clearInterval(this.timer); /* 清除定时器 */
    this.current.removeEventListener("scroll", this.handleScroll);
  }
  render() {
    return (
      <div ref={(node) => (this.current = node)}>hello,let us learn React!</div>
    );
  }
}

export function ClearInTimeDemo2() {
  const dom = React.useRef(null);
  const poll = () => {};
  const handleScroll = () => {};
  React.useEffect(() => {
    let timer = setInterval(() => {
      poll(); /* 2 秒进行一次轮训事件 */
    }, 2000);
    dom.current.addEventListener("scroll", handleScroll);
    return function () {
      clearInterval(timer);
      dom.current.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return <div ref={dom}>hello,let us learn React!</div>;
}
