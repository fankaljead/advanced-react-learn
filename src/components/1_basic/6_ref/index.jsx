// 6. ref 的基本概念和使用
import React, {
  Component,
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// 用 ref 去存储 DOM 节点的引用
export class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // 创建一个 ref 来存储 textInput 的 DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：我们通过 "current" 来访问 DOM 节点
    this.textInput.current.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到
    // 构造器里创建的 `textInput` 上
    return (
      <div>
        <input type="text" ref={this.textInput} />{" "}
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}

export class AutoFocusTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  componentDidMount() {
    this.textInput.current.focusTextInput();
  }

  render() {
    return <CustomTextInput ref={this.textInput} />;
  }
}

class Children extends Component {
  render = () => <div>hello,world</div>;
}

export class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.currentDom = React.createRef(null);
  }
  componentDidMount() {
    console.log("ClassComponent this.currentDom:", this.currentDom);
    console.log("ClassComponent: ", this);
  }
  // render() {
  //   return <div ref={this.currentDom}>ClassComponent</div>;
  // }

  // 1. 使用字符串 ref 属性被废弃
  // render = () => (
  //   <div>
  //     <div ref="currentDom">字符串模式获取元素或组件</div>
  //     <Children ref="currentComInstance" />
  //   </div>
  // );

  // 2. Ref 属性是一个函数
  render = () => (
    <div>
      <div ref={(node) => (this.currentDom = node)}>Ref模式获取元素或组件</div>
      <Children ref={(node) => (this.currentComponentInstance = node)} />
    </div>
  );
}

export function FuncComponent() {
  const currentDom = React.useRef(null);
  useEffect(() => {
    console.log("FuncComponent currentDom:", currentDom);
  });

  return <div ref={currentDom}>FuncComponent</div>;
}

// 高阶用法
// 1. 跨层级获取
// 孙组件
function Son(props) {
  const { grandRef } = props;
  return (
    <div>
      <div> i am alien </div>
      <span ref={grandRef}>这个是想要获取元素</span>
    </div>
  );
}
// 父组件
class Father extends React.Component {
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

class Father2 extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div style={{ border: "1px solid red" }}>
        <h1>this father2</h1>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}

const NewFather = React.forwardRef((props, ref) => (
  <Father grandRef={ref} {...props} />
));
// 爷组件
export class GrandFather extends React.Component {
  constructor(props) {
    super(props);
    this.grandSonDom = React.createRef(null);
  }
  node = null;
  componentDidMount() {
    console.log("GrandFather: ", this.node); // span #text 这个是想要获取元素
    console.log("GrandFather's grandSomDom: ", this.grandSonDom); // span #text 这个是想要获取元素
    console.log("GrandFather's grandSomDom2: ", this.node2); // span #text 这个是想要获取元素
  }
  render() {
    return (
      <div>
        <NewFather ref={(node) => (this.node = node)} />
        <NewFather ref={this.grandSonDom} />
        <Father2 grandRef={(node) => (this.node2 = node)} />
      </div>
    );
  }
}

// 合并转发 ref
// 表单组件
class Form extends React.Component {
  render() {
    return <div>hello world</div>;
  }
}
// index 组件
class Index extends React.Component {
  componentDidMount() {
    const { forwardRef } = this.props;
    forwardRef.current = {
      form: this.form, // 给form组件实例 ，绑定给 ref form属性
      index: this, // 给index组件实例 ，绑定给 ref index属性
      button: this.button, // 给button dom 元素，绑定给 ref button属性
    };
  }
  form = null;
  button = null;
  render() {
    return (
      <div>
        <button ref={(button) => (this.button = button)}>点击</button>
        <Form ref={(form) => (this.form = form)} />
      </div>
    );
  }
}
const ForwardRefIndex = React.forwardRef((props, ref) => (
  <Index {...props} forwardRef={ref} />
));
// home 组件
export function Home() {
  const ref = useRef(null);
  useEffect(() => {
    console.log(ref);
  }, []);
  return <ForwardRefIndex ref={ref} />;
}

// 3. 高阶组件转发
function HOC(Component) {
  class Wrap extends React.Component {
    render() {
      const { forwardedRef, ...otherprops } = this.props;
      return <Component ref={forwardedRef} {...otherprops} />;
    }
  }
  return React.forwardRef((props, ref) => (
    <Wrap forwardedRef={ref} {...props} />
  ));
}

class IIndex extends React.Component {
  render() {
    return <div>hello,world</div>;
  }
}
const HocIndex = HOC(IIndex);
export function HOCForward() {
  const node = useRef(null);
  useEffect(() => {
    console.log("高阶组件转发:", node);
  }, []);
  return <HocIndex ref={node} />;
}

// 6.2.2 ref 实现组件通信
// 1. 类组件 ref
/* 子组件 */
class SonCC extends React.PureComponent {
  state = {
    fatherMes: "",
    sonMes: "",
  };
  fatherSay = (fatherMes) =>
    this.setState({ fatherMes }); /* 提供给父组件的API */
  render() {
    const { fatherMes, sonMes } = this.state;
    return (
      <div className="sonbox">
        <div className="title">子组件</div>
        <p>父组件对我说：{fatherMes}</p>
        <div className="label">对父组件说</div>{" "}
        <input
          onChange={(e) => this.setState({ sonMes: e.target.value })}
          className="input"
        />
        <button
          className="searchbtn"
          onClick={() => this.props.toFather(sonMes)}
        >
          to father
        </button>
      </div>
    );
  }
}
/* 父组件 */
export function FatherCC() {
  const [sonMes, setSonMes] = React.useState("");
  const sonInstance = React.useRef(null); /* 用来获取子组件实例 */
  const [fatherMes, setFatherMes] = React.useState("");
  const toSon = () =>
    sonInstance.current.fatherSay(
      fatherMes
    ); /* 调用子组件实例方法，改变子组件state */
  return (
    <div className="box">
      <div className="title">父组件</div>
      <p>子组件对我说：{sonMes}</p>
      <div className="label">对子组件说</div>{" "}
      <input onChange={(e) => setFatherMes(e.target.value)} className="input" />
      <button className="searchbtn" onClick={toSon}>
        to son
      </button>
      <SonCC ref={sonInstance} toFather={setSonMes} />
    </div>
  );
}

// 2. 函数组件 forwardRef + useImperativeHandle 通信
function SonFC(props, ref) {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  useImperativeHandle(
    ref,
    () => {
      const handleRefs = {
        onFocus() {
          /* 声明方法用于聚焦input框 */
          inputRef.current.focus();
        },
        onChangeValue(value) {
          /* 声明方法用于改变input的值 */
          setInputValue(value);
        },
      };
      return handleRefs;
    },
    []
  );
  return (
    <div>
      <input placeholder="请输入内容" ref={inputRef} value={inputValue} />
    </div>
  );
}

const ForwardSonFC = React.forwardRef(SonFC);

export class ForwardSonFCContainer extends Component {
  cur = null;
  handleClick = () => {
    console.log("函数组件 useImperativeHanlde this.cur: ", this.cur);
    const { onFocus, onChangeValue } = this.cur;
    onFocus();
    onChangeValue("lets learn react");
  };
  render() {
    return (
      <div style={{ marginTop: "50px" }}>
        <ForwardSonFC ref={(cur) => (this.cur = cur)} />
        <button onClick={this.handleClick}>操控子组件</button>
      </div>
    );
  }
}

// 3. 函数组件缓存数据
const toLearn = [
  { type: 1, mes: "let us learn React" },
  { type: 2, mes: "let us learn Vue3.0" },
];

export function FunctionComponentStoreData() {
  const typeInfo = useRef(toLearn[0]);
  const [id, setId] = useState(0);
  const changeType = (info) => {
    typeInfo.current = info; /* typeInfo 的改变，不需要视图变化 */
  };
  useEffect(() => {
    if (typeInfo.current.type === 1) {
      /* ... */
      console.log("函数组件缓存数据 type=1 typeInfo:", typeInfo);
    } else if (typeInfo.current.type === 2) {
      /* ... */
      console.log("函数组件缓存数据 type=2 typeInfo:", typeInfo);
    }
  }, [id]); /* 无须将 typeInfo 添加依赖项  */
  return (
    <div>
      <h1>id:{id}</h1>
      {toLearn.map((item) => (
        <button key={item.type} onClick={changeType.bind(null, item)}>
          {item.mes}
        </button>
      ))}
      <br />
      <button onClick={() => setId(id + 1)}>id++</button>
    </div>
  );
}

const log = console.log;
// 四 ref 原理揭秘
export class DemoRef extends Component {
  state = { num: 0 };
  node = null;
  render() {
    return (
      <div>
        <div
          ref={(node) => {
            this.node = node;
            log("此时的参数是什么: ", this.node);
          }}
        >
          ref元素节点1
        </div>
        <button onClick={() => this.setState({ num: this.state.num + 1 })}>
          点击
        </button>
      </div>
    );
  }
}

export class DemoRef2 extends Component {
  state = { num: 0 };
  node = null;
  getDom = (node) => {
    this.node = node;
    console.log("此时的参数是什么: ", this.node);
  };
  render() {
    return (
      <div>
        <div ref={this.getDom}>ref元素节点2</div>
        <button onClick={() => this.setState({ num: this.state.num + 1 })}>
          点击
        </button>
      </div>
    );
  }
}
