/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-04 13:13:59
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-05 10:31:38
 * @FilePath: \advancend-react\src\components\basic\8_modular_css\index.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

// 8. 模块化 CSS
import React from "react";
// import styles from "./style.module.less";
import style from "./style.js";

export function CSSModuleDemo() {
  console.log("style:", style);
  // return <div style={styles.text}>验证 CSS Modules</div>;
  return <div style={style.text}>验证 CSS Modules</div>;
}
