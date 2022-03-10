/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-09 13:50:03
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 09:31:07
 * @FilePath: \advancend-react\src\components\2_optimization\11_render_tuning\practice.jsx
 * @Description: React.lazy + Suspence 模拟异步组件功能
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

import React from "react";
import PropTypes from "prop-types";

function AysncComponent(Component, api) {
  const AysncComponentPromise = () =>
    new Promise(async (resolve) => {
      const data = await api();
      resolve({
        default: (props) => <Component rdata={data} {...props} />,
      });
    });
  return React.lazy(AysncComponentPromise);
}

const getData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: "zxh", say: "let us learn react" });
    }, 1000);
  });
};

function Test({ rdata, age }) {
  const { name, say } = rdata;
  console.log("组件渲染");
  return (
    <div>
      <div> hello , my name is {name} </div>
      <div>age : {age} </div>
      <div> i want to say {say} </div>
    </div>
  );
}
Test.propTypes = {
  rdata: PropTypes.object,
  age: PropTypes.number,
};

export class ReactLazySuspecePractice extends React.Component {
  /* 需要每一次在组件内部声明，保证每次父组件挂载，都会重新请求数据 ，防止内存泄漏。 */
  LazyTest = AysncComponent(Test, getData);
  render() {
    const { LazyTest } = this;

    return (
      <div>
        <React.Suspense fallback={<div>loading...</div>}>
          <LazyTest age={18} />
        </React.Suspense>
      </div>
    );
  }
}
