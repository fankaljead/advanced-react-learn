/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-09 09:19:09
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-09 10:25:51
 * @FilePath: \advancend-react\src\components\2_optimization\11_render_tuning\suspense.jsx
 * @Description: 异步渲染 suspense
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";
import { getUserInfo } from "./network";

function UserInfo() {
  // 获取数据 然后渲染组件
  // let content;
  // getUserInfo().then((data) => {
  //   // content = JSON.parse(data);
  //   content = data;
  //   console.log("content: ", content);
  //   console.log(Object.prototype.toString.call(content));
  // });
  // return (
  //   <ul>
  //     {content.map((item) => (
  //       <li key={item.id}>item.name, item.email</li>
  //     ))}
  //   </ul>
  // );

  return <h1>hello world</h1>;
}

export function SuspenseDemo() {
  return (
    <React.Suspense fallback={<h1>Loading...</h1>}>
      <UserInfo />
    </React.Suspense>
  );
}

export default function TextDemo() {
  return <h1>hello world</h1>;
}
