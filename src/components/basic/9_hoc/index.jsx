/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-05 10:47:01
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-05 14:15:01
 * @FilePath: \advancend-react\src\components\basic\9_hoc\index.jsx
 * @Description: 高阶组件
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */

import React from "react";

// 1. 属性代理
function HOC(WrapComponent) {
  return class Advance extends React.Component {
    state = {
      name: "zxh",
    };
    render() {
      return <WrapComponent {...this.props} {...this.state} />;
    }
  };
}

// 2. 反向继承
class Index extends React.Component {
  render() {
    return <div>hello world</div>;
  }
}

function HOC2(Component) {
  return class wrapComponent extends Component {};
}

export default HOC2(Index);

// 高阶组件功能说明
// 1. 强化 props
const RouterContext = React.createContext(null);
export function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = ({ wrappedComponentRef, ...remainingProps }) => {
    return (
      <RouterContext.Consumer>
        {(context) => {
          return (
            <Component
              {...remainingProps}
              {...context}
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };
  C.displayName = displayName;
  C.WrapComponent = Component;

  return hoistStatics(C, Component);
}

// 2. 渲染控制
// 渲染劫持
const HOC3 = (WrapComponent) => {
  class Index extends WrapComponent {
    render() {
      return this.props.visible ? super.render() : <div>暂无数据</div>;
    }
  }
};

// 修改渲染树
(function () {
  class Index extends React.Component {
    render() {
      return (
        <div>
          <ul>
            <li>react</li>
            <li>vue</li>
            <li>Angular</li>
          </ul>
        </div>
      );
    }
  }
  function HOC(Component) {
    return class Advance extends Component {
      render() {
        const element = super.render();
        const otherProps = {
          name: "alien",
        };
        /* 替换 Angular 元素节点 */
        const appendElement = React.createElement(
          "li",
          {},
          `hello ,world , my name  is ${otherProps.name}`
        );
        const newchild = React.Children.map(
          element.props.children.props.children,
          (child, index) => {
            if (index === 2) return appendElement;
            return child;
          }
        );
        return React.cloneElement(element, element.props, newchild);
      }
    };
  }
})();

// 动态加载
export function dynamicHoc(loadRouter) {
  return class Content extends React.Component {
    state = { Component: null };
    componentDidMount() {
      this.state.Component &&
        loadRouter()
          .then((module) => module.default)
          .then((Component) => this.setState({ Component }));
    }
    render() {
      const { Component } = this.state;
      return Component ? <Component {...this.props} /> : <Loading />;
    }
  };
}

const Loading = () => <div>loading...</div>;

const DynamicHocDemo = dynamicHoc(() => import("./Banner.jsx"));

export const UseDynamicHocDemo = () => {
  const [show, setShow] = React.useState(true);
  return (
    <div>
      {show && <DynamicHocDemo />}
      <button onClick={() => setShow(!show)}>toggle</button>
    </div>
  );
};

// ref 获取实例
(function () {
  function Hoc(Component) {
    return class WrapComponent extends React.Component {
      constructor() {
        super();
        this.node = null; /* 获取实例，可以做一些其他的操作。 */
      }
      render() {
        return <Component {...this.props} ref={(node) => (this.node = node)} />;
      }
    };
  }
});

// 事件监控
function ClickHoc(Component) {
  return function Wrap(props) {
    const dom = React.useRef(null);
    React.useEffect(() => {
      const handlerClick = () => console.log("发生点击事件");
      dom.current.addEventListener("click", handlerClick);
      return () => dom.current.removeEventListener("click", handlerClick);
    }, []);
    return (
      <div ref={dom}>
        <Component {...props} />
      </div>
    );
  };
}

class Demo extends React.Component {
  render() {
    return (
      <div className="index">
        <p>hello world</p>
        <button>组件内部点击</button>
      </div>
    );
  }
}

export function UseEventWatchDemo() {
  const C = ClickHoc(Demo);
  return <C />;
}

// 高阶组件注意事项
// 1. 谨慎修改原型链
(function () {
  function HOC(Component) {
    const proDidMount = Component.prototype.componentDidMount;
    Component.prototype.componentDidMount = function () {
      console.log("劫持生命周期：componentDidMount");
      proDidMount.call(this);
    };
    return Component;
  }
})();

// 2. 不要在函数组件内部或类组件render函数中使用HOC
(function () {
  class ClassDemo extends React.Component {
    render() {
      const WrapHome = HOC(Home);
      return <WrapHome />;
    }
  }
  function FuncDemo() {
    const WrapHome = HOC(Home);
    return <WrapHome />;
  }
})();
