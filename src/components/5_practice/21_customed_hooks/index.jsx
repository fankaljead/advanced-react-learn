/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-26 12:38:36
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-04-01 12:14:08
 * @FilePath: \advancend-react\src\components\5_practice\21_customed_hooks\index.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
// 一个传统的自定义 hooks
// function useXXX(paraA, paraB) {
//   /*
//    ...自定义 hooks 逻辑
//    内部应用了其他 React Hooks —— useState | useEffect | useRef ...
//   */
//   return [xxx,...]
// }
// 使用
// const [ xxx , ... ] = useXXX(paraA, paraB...)

import React from "react";

const useUpdate = (fn = () => {}, deps = []) => {
  const ref = React.useRef(false);

  React.useEffect(() => {
    if (ref.current) {
      fn();
    } else {
      ref.current = true;
    }
  }, deps);
};

function UseEffectClean({ count }) {
  React.useEffect(() => {
    console.log("no deps UseEffectClean");
    return () => {
      console.log("no deps clean");
    };
  });

  React.useEffect(() => {
    console.log("count UseEffectClean");
    return () => {
      console.log("count clean");
    };
  }, [count]);

  React.useEffect(() => {
    console.log("[ ] UseEffectClean");
    return () => {
      console.log("[] clean");
    };
  }, []);
  return <h1>use effect clean count:{count}</h1>;
}

export function UseUpdateDemo() {
  const [count, setCount] = React.useState(0);
  const [count2, setCount2] = React.useState(0);
  const [count3, setCount3] = React.useState(0);
  const [show, setShow] = React.useState(true);

  useUpdate(() => {
    console.log("count: ", count);
  }, [count]);

  useUpdate(() => {
    console.log("count2: ", count2);
  }, [count2]);

  React.useEffect(() => {
    console.log("useeffect count3: ", count3);
  }, [count3]);

  return (
    <div>
      {show && <UseEffectClean count={count} />}
      <button onClick={() => setCount(count + 1)}>count + 1</button>
      <button onClick={() => setCount2(count2 + 1)}>count2 + 1</button>
      <button onClick={() => setCount3(count3 + 1)}>count3 + 1</button>
      <button onClick={() => setShow(!show)}>toggle show</button>
    </div>
  );
}

// 自定义 hook 记录函数状态的执行次数和是否是第一次渲染
function useRenderCount() {
  const isFirstRender = React.useRef(true);
  const renderCount = React.useRef(1);

  React.useEffect(() => {
    isFirstRender.current = false;
  }, []);

  React.useEffect(() => {
    if (!isFirstRender.current) {
      renderCount.current++;
    }
  });

  return [renderCount.current, isFirstRender.current];
}

export function CustomHooksDemo() {
  const [renderCount, isFirstRender] = useRenderCount();

  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>renderCount: {renderCount}</h1>
      {/* <h1>isFirstCount: {isFirstRender}</h1> */}
      {isFirstRender && <h1>hello world</h1>}
      <h1>count: {count}</h1>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        plus
      </button>
    </div>
  );
}

function debounce(fn, time) {
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  };
}

export function useDebounceState(defaultValue, time) {
  const [value, setValue] = React.useState(defaultValue);

  // 对 setValue 做防抖处理
  const newChange = React.useMemo(() => debounce(setValue, time), [time]);

  return [value, newChange];
}

export function UseDebounceStateDemo() {
  const [value, setValue] = useDebounceState("", 300);

  console.log(value);

  return (
    <div>
      hello world value: {value}
      <input
        type="text"
        placeholder=""
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

function useAsyncState(defaultValue) {
  const value = React.useRef(defaultValue);
  const [, forceUpdate] = React.useState(null);

  const dispatch = (fn) => {
    let newValue;
    if (typeof fn === "function") {
      newValue = fn(value.current);
    } else {
      newValue = fn;
    }
    value.current = newValue;
    forceUpdate({});
  };
  return [value, dispatch];
}

export function UseAsyncStateDemo() {
  const [data, setData] = useAsyncState(0);

  return (
    <div style={{ marginTop: "50px" }}>
      《React 进阶实践指南》 点赞 👍 {data.current}
      <button
        onClick={() => {
          setData((num) => num + 1);
          console.log(data.current); //打印到最新的值
        }}
      >
        点击
      </button>
    </div>
  );
}

// 操纵原生 dom
function useGetDOM() {
  const dom = React.useRef();

  React.useEffect(() => {
    /* 做一些基于 dom 的操作 */
    console.log(dom.current);
  }, []);

  return dom;
}

export function UseGetDOMDemo() {
  const dom = useGetDOM();
  return (
    <div ref={dom}>
      《React进阶实践指南》
      <button>点赞</button>
    </div>
  );
}

// 执行副作用
function useEffectProps(value, cb) {
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    /* 防止第一次执行 */
    isMounted.current && cb && cb();
  }, [value]);

  React.useEffect(() => {
    /* 第一次挂载 */
    isMounted.current = true;
  }, []);
}

function UseEffectPropsSon({ a }) {
  useEffectProps(a, () => {
    console.log("props a 变化: ", a);
  });

  return <div>子组件 a: {a}</div>;
}

export function UseEffectPropsDemo() {
  const [a, setA] = React.useState(0);
  const [b, setB] = React.useState(0);

  return (
    <div>
      <UseEffectPropsSon a={a} b={b} />
      <button onClick={() => setA(a + 1)}>改变 props a </button>
      <button onClick={() => setB(b + 1)}>改变 props b </button>
    </div>
  );
}

const useUser = () => {
  const [user, setUser] = React.useState({
    name: "",
    age: "",
  });

  React.useEffect(() => {
    console.log("user", user);
  }, [user]);

  return [user, setUser];
};
