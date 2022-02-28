import React from "react";
import PropTypes from "prop-types";
/* children 组件 */
function ChidrenComponent() {
  return <div> In this chapter, let us learn about react props ! </div>;
}

/* props 接受处理 */
class PropsComponent extends React.Component {
  componentDidMount() {
    console.log(this, "_this");
  }
  static propTypes = {
    children: PropTypes.array,
    mes: PropTypes.string,
    renderName: PropTypes.func,
    say: PropTypes.func,
    Component: PropTypes.func,
  };
  render() {
    const { children, mes, renderName, say, Component } = this.props;
    const renderFunction = children[0];
    const renderComponent = children[1];
    /* 对于子组件，不同的props是怎么被处理 */
    return (
      <div>
        {renderFunction()}
        {mes}
        {renderName()}
        {renderComponent}
        <Component />
        <button onClick={() => say()}> change content </button>
      </div>
    );
  }
}

/* props 定义绑定 */
export class PropsComponentDemo extends React.Component {
  state = {
    mes: "hello,React",
  };
  node = null;
  say = () => this.setState({ mes: "let us learn React!" });
  render() {
    return (
      <div style={{ border: "2px solid cyan", backgroundColor: "wheat" }}>
        {/* 在标签内部的属性和方法会直接绑定在 props 对象的属性上 */}
        <PropsComponent
          mes={this.state.mes} // ①  props 作为一个渲染数据源
          say={this.say} // ②  props 作为一个回调函数 callback
          Component={ChidrenComponent} // ③  props 作为一个组件
          renderName={() => <div> my name is alien </div>} // ④  function props 作为渲染函数
        >
          {/* 对于组件的插槽会被绑定在 props 的 Children 属性中 */}
          {() => <div>hello,world</div>} {/* ⑤  render function props */}
          {/* 插槽组件 */}
          <ChidrenComponent /> {/* ⑥  render component */}
        </PropsComponent>
      </div>
    );
  }
}

export function Index() {
  const [num, setNumber] = React.useState(0);
  const handerClick = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        // setNumber(num+1);
        setNumber((num) => num + 1);
        console.log(num);
      }, 1000);
    }
  };
  return <button onClick={handerClick}>{num}</button>;
}

// 混入 props
function Son(props) {
  console.log(props); // {name: "alien", age: "28", mes: "let us learn React !"}
  return <div> hello,world </div>;
}
// 隐式注入 props                                 
function Father(prop) {
  return React.cloneElement(prop.children, { mes: "let us learn React !" });
}
export function FatherIndex() {
  return (
    <Father>
      <Son name="alien" age="28" />
    </Father>
  );
}

const Children = (props) => (
  <div>
    <div>hello, my name is {props.name}</div>
    <div>{props.ms}</div>
  </div>
);

Children.propTypes = {
  name: PropTypes.string,
  ms: PropTypes.string,
};

function Container(props) {
  const ContainerProps = {
    name: "zxh",
    ms: "lets learn react",
  };
  return props.children.map((item) => {
    if (React.isValidElement(item)) {
      return React.cloneElement(
        item,
        { ...ContainerProps },
        item.props.children
      );
    } else if (typeof item === "function") {
      return item(ContainerProps);
    } else {
      return null;
    }
  });
}
