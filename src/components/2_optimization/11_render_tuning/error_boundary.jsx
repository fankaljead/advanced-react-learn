/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-09 10:35:43
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-09 10:45:48
 * @FilePath: \advancend-react\src\components\2_optimization\11_render_tuning\error_boundary.jsx
 * @Description: 错误边界
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

import React from "react";

function ErrorTest() {
  return;
}

function Test() {
  return <div>let us learn react</div>;
}

export class ErrorBoundaryDemo extends React.Component {
  state = { hasError: false };
  // componentDidCatch(...arg) {
  //   // uploadErrorLog(arg); // 上传错误日志
  //   console.log(arg);
  //   this.setState({ hasError: true });
  // }

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    const { hasError } = this.state;
    return (
      <div>
        {/* <ErrorTest /> */}
        {hasError ? <div>组件出现错误</div> : <ErrorTest />}
        <div>hello, my name is zxh</div>
        <Test />
      </div>
    );
  }
}
