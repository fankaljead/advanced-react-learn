/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-11 09:41:06
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-11 10:46:22
 * @FilePath: \advancend-react\src\components\2_optimization\14_scheduler_reconciler\index.jsx
 * @Description: 调度和调和
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

// 接下来模拟一下 setTimeout 4毫秒延时的真实场景：
(function () {
  let time = 0;
  let nowTime = +new Date();
  let timer;
  const poll = function () {
    timer = setTimeout(() => {
      const lastTime = nowTime;
      nowTime = +new Date();
      console.log("递归setTimeout(fn,0)产生时间差：", nowTime - lastTime);
      poll();
    }, 0);
    time++;
    if (time === 20) clearTimeout(timer);
  };
  poll();
})();

// 模拟一下 MessageChannel 如何触发异步宏任务的
(function () {
  let isMessageLoopRunning, requestHostCallback;
  let scheduledHostCallback = null;
  /* 建立一个消息通道 */
  var channel = new MessageChannel();
  /* 建立一个port发送消息 */
  var port = channel.port2;

  channel.port1.onmessage = function () {
    /* 执行任务 */
    scheduledHostCallback();
    /* 执行完毕，清空任务 */
    scheduledHostCallback = null;
  };

  /* 向浏览器请求执行更新任务 */
  requestHostCallback = function (callback) {
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
      isMessageLoopRunning = true;
      port.postMessage(null);
    }
  };
})();
