import React, {
  Component,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";

export function LifeCycleF({ name }) {
  return <h1>{name}</h1>;
}

LifeCycleF.propTypes = {
  name: PropTypes.string,
};

export class LifeCycleC extends Component {
  static propTypes = {
    name: PropTypes.string,
  };
  state = {
    count: 1,
  };

  // ===== mountClassInstance begin =====
  // 1.
  constructor(props) {
    super(props);
    console.log(`constructor: `, props);
  }

  // 2. 存在 getDerivedStateFromProps 则不执行 componentWillMount
  static getDerivedStateFromProps(nextProps, preState) {
    console.log("getDerivedStateFromProps preState:", preState);
    console.log("getDerivedStateFromProps nextProps:", nextProps);

    return Object.assign({}, preState, nextProps);
  }

  // 2. 或者
  // UNSAFE_componentWillMount() {
  //   console.log("componentWillMount");
  // }

  // 3.
  render() {
    console.log("render this:", this);
    const { name } = this.props;
    return (
      <div>
        <h1>
          {name} {this.state.count}
        </h1>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          increase
        </button>
      </div>
    );
  }

  // ===== mountClassInstance end =====

  // commit 阶段
  // componentDidMount 针对初始化
  componentDidMount() {
    console.log("componentDidMount");
  }

  // componentDidUpdate 针对更新
  componentDidUpdate(preProps, preState, snapshot) {
    console.log("componentDidUpdate preProps: ", preProps);
    console.log("componentDidUpdate preState: ", preState);
    console.log("componentDidUpdate snapshot: ", snapshot);
  }

  // stop working in react 17
  // componentWillReceiveProps(nextProps, nextContext) {
  //   console.log("UNSAFE_componentWillReceiveProps nextProps: ", nextProps);
  //   console.log("UNSAFE_componentWillReceiveProps nextContext: ", nextContext);
  // }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    console.log("shouldComponentUpdate nextProps: ", nextProps);
    console.log("shouldComponentUpdate nextState: ", nextState);
    console.log("shouldComponentUpdate nextContext: ", nextContext);
    return true;
  }

  UNSAFE_componentWillUpdate() {}

  getSnapshotBeforeUpdate(prevProps, preState) {
    return {
      ...prevProps,
      ...preState,
    };
  }

  // 更新阶段
  UNSAFE_componentWillReceiveProps(newProps, nextContext) {
    console.log("UNSAFE_componentWillReceiveProps newProps:", newProps);
    console.log("UNSAFE_componentWillReceiveProps nextContext:", nextContext);
  }
}

// React 两个重要阶段
// 1. render 调和阶段
//    遍历 React fiber 树，目的是发现不同 diff
// 2. commit

// 函数组件生命周期替代
export function FuncComponent(props) {
  const [count, setCount] = useState(0);
  const [x, setX] = useState(0);
  const [color, setColor] = useState("red");
  useEffect(() => {
    console.log("useEffect");
  });
  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  });

  // componentDidMount 替代方案
  useEffect(() => {
    // 请求数据 事件监听 操纵dom
    console.log("useEffect 模拟 componentDidMount");
  }, []);

  // componentWillUnmount 替代方案
  useEffect(() => {
    // 请求数据 事件监听 操纵dom 添加定时器、掩饰其
    return function componentWillUnmount() {
      // 解除事件监听 清楚定时器、延时器
    };
  }, []); // dep=[]

  // componentWillReceiveProps 代替方案
  useEffect(() => {
    console.log("props变化: componentWillReceiveProps");
  }, [props]);
  useEffect(() => {
    console.log("props.number变化: componentWillReceiveProps");
  }, [props.number]);

  // componentDidUpdate 替代方案
  useEffect(() => {
    console.log("组件更新完成: componentDidUpdate");
  }); // 没有 dep 依赖项

  return (
    <div>
      <h1>this is function component</h1>
      <h2 style={{ color: color }}>count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>increment</button>
      <button onClick={() => setX(x + 1)}>change x</button>
      <button onClick={() => setColor("yellow")}>change color</button>
    </div>
  );
}

FuncComponent.propTypes = {
  number: PropTypes.number,
};

function FunctionLifeCycle(props) {
  const [num, setNum] = useState(0);

  // 模拟 componentDidMount
  useEffect(() => {
    /* 请求数据 ， 事件监听 ， 操纵dom  ， 增加定时器 ， 延时器 */
    console.log("组件挂载完成: componentDidMount");

    // 模拟 componentWillUnmount
    return function componentWillUnmount() {
      /* 解除事件监听器 ，清除 */
      console.log("组件销毁: componentWillUnmount");
    };
  }, []); /* 切记 dep = [] */

  useEffect(() => {
    console.log("props变化: componentWillReceiveProps");
  }, [props]);

  let ref = useRef(false);
  useEffect(() => {
    /*  */
    if (ref.current) {
      console.log(" 组件更新完成: componentDidUpdate ");
    } else {
      ref.current = true;
    }
  });

  return (
    <div>
      <div> props : {props.number} </div>
      <div> states : {num} </div>
      <button onClick={() => setNum((state) => state + 1)}>改变state</button>
    </div>
  );
}

FunctionLifeCycle.propTypes = {
  number: PropTypes.number,
};

export function FunctionLifeCycleContainer() {
  const [number, setNumber] = React.useState(0);
  const [isRender, setRender] = React.useState(true);
  return (
    <div>
      {isRender && <FunctionLifeCycle number={number} />}
      <button onClick={() => setNumber((state) => state + 1)}>改变props</button>
      <br />
      <button onClick={() => setRender(true)}>添加组件</button>
      <br />
      <button onClick={() => setRender(false)}>卸载组件</button>
    </div>
  );
}

class TestClassComponentBase extends Component {
  // UNSAFE_componentWillReceiveProps(newProps, nextContext) {
  //   console.log("UNSAFE_componentWillReceiveProps newProps:", newProps);
  //   console.log("UNSAFE_componentWillReceiveProps nextContext:", nextContext);
  // }
  state = {};
  static propTypes = {
    number: PropTypes.number,
  };

  render() {
    const { number } = this.props;
    return (
      <div>
        <h1>prop number: {number}</h1>
      </div>
    );
  }

  static getDerivedStateFromProps(nextProps, preState) {
    console.log("getDerivedStateFromProps newProps:", nextProps);
    console.log("getDerivedStateFromProps preState:", preState);
    return Object.assign({}, preState);
  }

  getSnapshotBeforeUpdate(preProps, preState) {
    console.log("getDerivedStateFromProps preProps:", preProps);
    console.log("getDerivedStateFromProps preState:", preState);
    return Object.assign({ name: "zxh" }, preState);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("componentDidUpdate preProps: ", prevProps);
    console.log("componentDidUpdate prevState: ", prevState);
    console.log("componentDidUpdate snapshot: ", snapshot);
  }
}

export class TestClassComponent extends Component {
  state = {
    number: 0,
  };
  render() {
    return (
      <div>
        <TestClassComponentBase number={this.state.number} />
        <button
          onClick={() => this.setState({ number: this.state.number + 1 })}
        >
          change state
        </button>
      </div>
    );
  }
}

function FuncComponentLifeCycle() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log("componentDidUpdate0");
    return () => {
      console.log("componentWillUmount20 ");
    };
  });

  useEffect(() => {
    console.log("num:", num);
    return () => {
      console.log("componentWillUmount num:", num);
    };
  }, [num]);

  useEffect(() => {
    return () => {
      console.log("componentWillUmount1 ");
    };
  }, []);

  useEffect(() => {
    console.log("componentDidUpdate");
    return () => {
      console.log("componentWillUmount2 ");
    };
  });

  return (
    <div>
      <h1>Num: {num}</h1>
      <button onClick={() => setNum(num + 1)}>increment</button>
    </div>
  );
}

export function FuncComponentLifeCycleContainer() {
  const [show, setShow] = useState(true);

  return (
    <div>
      {show && <FuncComponentLifeCycle />}
      <button onClick={() => setShow(!show)}>toggle</button>
    </div>
  );
}

class GetDrivedStateFromPropsClass extends React.PureComponent {
  state = {};
  static propTypes = {
    number: PropTypes.number,
  };
  static getDerivedStateFromProps(nextProps, preState) {
    console.log("getDerivedStateFromProps newProps:", nextProps);
    console.log("getDerivedStateFromProps preState:", preState);
    return Object.assign({}, preState);
  }

  render() {
    return <h1>子组件 props number: {this.props.number}</h1>;
  }
}

export function GetDrivedStateFromPropsDemo() {
  const [number, setNumber] = useState(0);
  const [number2, setNumber2] = useState(0);
  return (
    <div>
      <GetDrivedStateFromPropsClass number={number} />
      <h1>number1:{number}</h1>
      <h1>number2:{number2}</h1>
      <button onClick={() => setNumber(number + 1)}>increment</button>
      <button onClick={() => setNumber2(number2 + 1)}>increment</button>
    </div>
  );
}
const log = console.log;
export function UseRefUpdate() {
  log("UseRefUpdate");
  const ref = useRef(0);
  const [number, setNumber] = useState(0);
  useEffect(() => {
    if (ref.current == 2) {
      log("组件更新完成: componentDidUpdate");
    } else {
      ref.current++;
    }
  });

  return (
    <div>
      <h1>number: {number}</h1>
      <button onClick={() => setNumber(number + 1)}>increment</button>
    </div>
  );
}


const useUpdate = (fn) => {
  const ref = useRef(0);
  useEffect(() => {
    if (ref.current >= 2) {
      fn();
    }
    ref.current++;
  });
};

export function UseeUpdateDemo() {
  const [number, setNumber] = useState(0);
  useUpdate(() => {
    log("UseUpdateDemo update");
  });
  return (
    <div>
      <h1>useUpdate number: {number}</h1>
      <button onClick={() => setNumber(number + 1)}>increment</button>
    </div>
  );
}