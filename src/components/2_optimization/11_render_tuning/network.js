/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-09 09:23:58
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-09 09:56:58
 * @FilePath: \advancend-react\src\components\2_optimization\11_render_tuning\network.js
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

export async function getUserInfo() {
  const response = await fetch("https://gorest.co.in/public/v2/users", {
    method: "GET",
    mode: "cors",
  });
  return response.json();
}
