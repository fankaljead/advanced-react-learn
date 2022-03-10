/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 11:02:53
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 12:48:24
 * @FilePath: \advancend-react\src\components\3_react_principle\14_event_principle\index.jsx
 * @Description: 事件原理
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

// 冒泡阶段和捕获阶段
export function EventDemo() {
  const handleClick = () => {
    console.log("模拟冒泡阶段执行");
  };
  const handleClickCapture = () => {
    console.log("模拟捕获阶段执行");
  };
  return (
    <div>
      <button onClick={handleClick} onClickCapture={handleClickCapture}>
        点击
      </button>
    </div>
  );
}

// 阻止冒泡
export function StopPropgation() {
  const handleClick = (e) => {
    e.stopPropagation(); /* 阻止事件冒泡，handleFatherClick 事件讲不在触发 */
    console.log("子 div 点击");
  };
  const handleChange = (e) => {
    console.log("handleChange:", e.target.value);
  };
  const handleFatherClick = () => console.log("冒泡到父级");
  return (
    <div onClick={handleFatherClick}>
      <div onClick={handleClick}>点击</div>
      <input onChange={handleChange} />
    </div>
  );
}

// 事件绑定
export function EventBind() {
  const handleClick = () => console.log("点击事件");
  const handleChange = () => console.log("change事件");
  return (
    <div>
      <input onChange={handleChange} />
      <button onClick={handleClick}>点击</button>
    </div>
  );
}

// 事件触发
// 一次点击事件
export function OneClickEvent() {
  const handleClick1 = () => console.log(1);
  const handleClick2 = () => console.log(2);
  const handleClick3 = () => console.log(3);
  const handleClick4 = () => console.log(4);
  return (
    <div onClick={handleClick3} onClickCapture={handleClick4}>
      <button onClick={handleClick1} onClickCapture={handleClick2}>
        点击
      </button>
    </div>
  );
}
