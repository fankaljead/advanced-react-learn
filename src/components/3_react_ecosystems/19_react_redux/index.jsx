/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-21 12:39:12
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-21 13:33:41
 * @FilePath: \advancend-react\src\components\3_react_ecosystems\19_react_redux\index.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";
import { connect, Provider } from "react-redux";
import { store, add, decrement } from "./store";

function Coo(props) {
  console.log("props", props);
  return (
    <div>
      <h1>React Redux Demo</h1>
      <h2>Count: {props.count}</h2>
      <button onClick={() => props.plus(1)}>add</button>
      <button onClick={() => props.minus(2)}>decrement</button>
    </div>
  );
}
const mapStateToProps = (state) => {
  console.log("mapStateToProps state", state);
  return {
    count: state.pp.count,
  };
};

const mapDispatchToProps = (dispatch) => ({
  plus: (data) => dispatch(add(data)),
  minus: (data) => dispatch(decrement(data)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  console.log("mergeProps stateProps", stateProps);
  console.log("mergeProps dispatchProps", dispatchProps);
  console.log("mergeProps ownProps", ownProps);
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
  };
};

const Cooo = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Coo);

export function ReactReduxDemo() {
  return (
    <Provider store={store}>
      <div>
        <Cooo />
      </div>
    </Provider>
  );
}
