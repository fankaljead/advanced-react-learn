/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-21 12:42:18
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-21 13:30:08
 * @FilePath: \advancend-react\src\components\3_react_ecosystems\19_react_redux\store.js
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import { createStore, combineReducers } from "redux";

const ADD = "ADD";
const DECREMENT = "DECREMENT";

const defaultState = {
  count: 0,
};

export const actionTypes = {
  ADD,
  DECREMENT,
};

export const add = (data) => {
  return {
    type: ADD,
    data,
  };
};

export const decrement = (data) => {
  return {
    type: DECREMENT,
    data,
  };
};

export const ppReducer = (state = defaultState, action) => {
  console.log("state", state);
  console.log("action", action);
  switch (action.type) {
    case ADD:
      return { ...state, count: state.count + action.data };
    case DECREMENT:
      return { ...state, count: state.count - action.data };
    default:
      return state;
  }
};
export const store = createStore(combineReducers({ pp: ppReducer }));
