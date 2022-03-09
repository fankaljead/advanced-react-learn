/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-09 10:23:49
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-09 10:24:53
 * @FilePath: \advancend-react\src\components\2_optimization\11_render_tuning\react_lazy.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

import React from "react";

const LazyComponent = React.lazy(() => import("./suspense"));

export function ReactLazyDemo() {
  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}
