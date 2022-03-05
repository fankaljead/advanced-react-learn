/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-05 10:34:51
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-05 10:44:59
 * @FilePath: \advancend-react\src\components\basic\8_modular_css\style_component.jsx
 * @Description: 使用 style-components
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

import React from "react";
import styled from "styled-components";

/* 给button标签添加样式，形成 Button React 组件 */
const Button = styled.button`
  background: #6a8bad;
  color: #fff;
  min-width: 96px;
  height: 36px;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 20px !important;
`;

const PropsButton = styled.button`
  background: ${(props) => (props.theme ? props.theme : "#6a8bad")};
  color: #fff;
  min-width: 96px;
  height: 36px;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 20px !important;
`;

const NewButton = styled(Button)`
  background: cyan;
  color: yellow;
`;

export function StyleComponentDemo() {
  return (
    <div>
      StyleComponentDemo
      <Button>按钮</Button>
      <PropsButton theme={"#fc4838"}>props主题按钮</PropsButton>
      <NewButton> 继承按钮</NewButton>
    </div>
  );
}
