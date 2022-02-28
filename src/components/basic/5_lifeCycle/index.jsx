import React, { Component } from "react";
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

  // 2.
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

  componentDidMount() {
    console.log("componentDidMount");
  }

  componentDidUpdate(preProps, preState) {
    console.log("componentDidUpdate preProps: ", preProps);
    console.log("componentDidUpdate preState: ", preState);
  }

  // stop working in react 17
  // componentWillReceiveProps(nextProps, nextContext) {
  //   console.log("UNSAFE_componentWillReceiveProps nextProps: ", nextProps);
  //   console.log("UNSAFE_componentWillReceiveProps nextContext: ", nextContext);
  // }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("shouldComponentUpdate nextProps: ", nextProps);
    console.log("shouldComponentUpdate nextState: ", nextState);
    return true;
  }

}

// React 两个重要阶段
// 1. render 调和阶段
//    遍历 React fiber 树，目的是发现不同 diff
// 2. commit
