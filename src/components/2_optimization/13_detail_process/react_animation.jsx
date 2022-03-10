/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 10:42:19
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 10:49:17
 * @FilePath: \advancend-react\src\components\2_optimization\13_detail_process\react_animation.jsx
 * @Description: React 动画
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";
import "./react_animation.css";

// 1 首选 动态添加类名
export function DynamicAddClassName() {
  const [isAnimation, setAnimation] = React.useState(false);
  return (
    <div>
      <button onClick={() => setAnimation(true)}>改变颜色</button>
      <div className={isAnimation ? "current animation" : "current"}></div>
    </div>
  );
}

// 2 其次 操纵原生 DOM
export function ManipulateNativeDOM() {
  const dom = React.useRef(null);
  const changeColor = () => {
    const target = dom.current;
    target.style.background = "#c00";
    setTimeout(() => {
      target.style.background = "orange";
      setTimeout(() => {
        target.style.background = "yellowgreen";
      }, 500);
    }, 500);
  };
  return (
    <div>
      <button onClick={changeColor}>改变颜色</button>
      <div className="current" ref={dom}></div>
    </div>
  );
}

// 3 再者 setState + CSS3
export function SetStateCSS3() {
  const [position, setPosition] = React.useState({ left: 0, top: 0 });
  const changePosition = () => {
    let time = 0;
    let timer = setInterval(() => {
      if (time === 30) clearInterval(timer);
      setPosition({ left: time * 10, top: time * 10 });
      time++;
    }, 30);
  };
  const { left, top } = position;
  return (
    <div>
      <button onClick={changePosition}>改变位置</button>
      <div
        className="current"
        style={{ transform: `translate(${left}px,${top}px )` }}
      ></div>
    </div>
  );
}
