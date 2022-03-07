// 7. 提供者 context
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";

// context 基本使用
// 1. React.createContext 基本用法
const ThemeContext = React.createContext(null);
const ThemeProvider = ThemeContext.Provider; // 提供者
const ThemeConsumer = ThemeContext.Consumer; // 订阅消费者

// 2. 提供者用法
export function ProviderDemo() {
  const [contextValue, setContextValue] = React.useState({
    color: "#ccc",
    background: "pink",
  });
  return (
    <div>
      <ThemeProvider value={contextValue}>
        <Son />
      </ThemeProvider>
    </div>
  );
}

// 3. 消费者用法
// 3.1 类组件 - contextType 方式
export class ConsumerDemo1 extends React.Component {
  render() {
    const { color, background } = this.context;
    return <div style={{ color, background }}>消费者</div>;
  }
}

// 3.2 函数组件 - useContext 方式
function ConsumerDemo2() {
  const contextValue = React.useContext(ThemeContext);
  const { color, background } = contextValue;
  return <div style={{ color, background }}>消费者</div>;
}

// 3.3 订阅者 - Consumer 方式
function ConsumerDemo3({ color, background }) {
  return <div style={{ color, background }}>消费者</div>;
}

const Son3 = () => {
  <ThemeConsumer>
    {/* 将 context 内容转化成 props  */}
    {(contextValue) => <ConsumerDemo3 {...contextValue} />}
  </ThemeConsumer>;
};

/* ======================================== */
// 函数组件模拟 componentWillUnmount
function A({ count }) {
  const aR = useRef(false);
  const aR2 = useRef(false);
  useEffect(() => {
    if (!aR.current) {
      aR.current = true;
    } else {
      console.log("useEffect 组件更新了 componentDidUpdate");
    }
  });
  useEffect(() => {
    console.log("useEffect componentDidMount");
    return function componentWillUnmount() {
      console.log("useEffect 函数组件卸载中 componentWillUnmount");
    };
  }, []);
  useEffect(() => {
    // 这里替代 componentWillReceiveProps 比较牵强
    console.log("useEffect props 变化 componentWillReceiveProps count:", count);
  }, [count]);

  useLayoutEffect(() => {
    if (!aR2.current) {
      aR2.current = true;
    } else {
      console.log("useLayoutEffect 组件更新了 componentDidUpdate");
    }
  });
  useLayoutEffect(() => {
    console.log("useLayoutEffect componentDidMount");
    return function componentWillUnmount() {
      console.log("useLayoutEffect 函数组件卸载中 componentWillUnmount");
    };
  }, []);
  useLayoutEffect(() => {
    console.log(
      "useLayoutEffect props 变化 componentWillReceiveProps count:",
      count
    );
  }, [count]);
  return <div>this is child component {count}</div>;
}

A.propTypes = {
  count: PropTypes.number,
};

export function B() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(1);
  const toggleA = () => {
    setShow(!show);
  };
  return (
    <div>
      {show && <A count={count} />}
      <button onClick={toggleA}>toggleA</button>
      <button onClick={() => setCount(count + 1)}>count++</button>
    </div>
  );
}

// forward 转发
// 跨层级获取
// 孙组件
function Son({ grandRef }) {
  return (
    <div>
      <div> i am alien </div>
      <span ref={grandRef}>这个是想要获取元素</span>
    </div>
  );
}

// 父组件
class FatherA extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}

const NewFather = React.forwardRef((props, ref) => (
  <FatherA grandRef={ref} {...props} />
));

class FatherB extends React.Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    grandRef: PropTypes.object,
  };
  render() {
    return (
      <div>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}

// 爷组件
export class GrandFather extends React.Component {
  constructor(props) {
    super(props);
    this.grandSonDom = React.createRef(null);
    this.grandSon = React.createRef(null);
  }
  node = null;
  componentDidMount() {
    console.log("GrandFather: ", this.node); // span #text 这个是想要获取元素
    console.log("GrandFather's grandSonDom: ", this.grandSonDom); // span #text 这个是想要获取元素
    console.log("FatherB's grandSon: ", this.grandSon); // span #text 这个是想要获取元素
  }
  render() {
    return (
      <div>
        <NewFather ref={(node) => (this.node = node)} />
        <NewFather ref={this.grandSonDom} />
        <FatherB grandRef={this.grandSon} />
      </div>
    );
  }
}
