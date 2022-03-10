/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 10:25:05
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 10:33:39
 * @FilePath: \advancend-react\src\components\2_optimization\13_detail_process\index.jsx
 * @Description: 细节处理
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

export class DebounceDemo extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = debounce(this.handleClick, 500); /* 防抖 500 毫秒  */
    this.handleChange = debounce(this.handleChange, 300); /* 防抖 300 毫秒 */
  }
  handleClick = () => {
    console.log("点击事件-表单提交-调用接口");
  };
  handleChange = (e) => {
    console.log("搜索框-请求数据");
  };
  render() {
    return (
      <div>
        <input placeholder="搜索表单" onChange={this.handleChange} />
        <br />
        <button onClick={this.handleClick}> 点击 </button>
      </div>
    );
  }
}

function debounce(fn, delay) {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

export function ThrottleDemo() {
  /* useCallback 防止每次组件更新都重新绑定节流函数  */
  const handleScroll = React.useCallback(
    throttle(function () {
      /* 可以做一些操作，比如曝光上报等 */
    }, 300)
  );
  return (
    <div className="scrollIndex" onScroll={handleScroll}>
      <div className="scrollContent">hello,world</div>
    </div>
  );
}

function throttle(fn, delay) {
  let timer = null;
  return function () {
    if (timer) {
      return false;
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay);
  };
}
