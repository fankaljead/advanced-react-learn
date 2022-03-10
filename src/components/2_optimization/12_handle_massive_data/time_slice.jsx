/*
 * @Author: Zhou Xianghui
 * @Date: 2022-03-10 09:46:17
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-10 10:20:33
 * @FilePath: \advancend-react\src\components\2_optimization\12_handle_massive_data\time_slice.jsx
 * @Description: 时间分片
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";
import "./style.css";

// 实践一个时间分片的 demo ，一次性加载 20000 个元素块，元素块的位置和颜色是随机的

/* 获取随机颜色 */
function getColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ",0.8)";
}

/* 获取随机位置 */
function getPostion(position) {
  const { width, height } = position;
  return {
    left: Math.ceil(Math.random() * width) + "px",
    top: Math.ceil(Math.random() * height) + "px",
  };
}

/* 色块组件 */
function Circle({ position }) {
  //用 useMemo缓存，计算出来的随机位置和色值。
  const style = React.useMemo(() => {
    return {
      background: getColor(),
      ...getPostion(position),
    };
  }, []);
  return <div style={style} className="circle" />;
}

// 父组件
class TimeSliceDemo extends React.Component {
  state = {
    dataList: [], // 数据源列表
    renderList: [], // 渲染列表
    position: { width: 0, height: 0 }, // 位置信息
  };
  box = React.createRef();
  componentDidMount() {
    const { offsetHeight, offsetWidth } = this.box.current;
    const originList = new Array(20000).fill(1);
    this.setState({
      position: { height: offsetHeight, width: offsetWidth },
      dataList: originList,
      renderList: originList,
    });
  }
  render() {
    const { renderList, position } = this.state;
    return (
      <div className="bigData_index" ref={this.box}>
        {renderList.map((item, index) => (
          <Circle position={position} key={index} />
        ))}
      </div>
    );
  }
}

/* 控制展示Index */
export const TimeSliceContainerDemo1 = () => {
  const [show, setShow] = React.useState(false);
  const [btnShow, setBtnShow] = React.useState(true);
  const handleClick = () => {
    setBtnShow(false);
    setTimeout(() => {
      setShow(true);
    }, []);

    // setShow(true);
  };
  return (
    <div>
      {btnShow && <button onClick={handleClick}>show</button>}
      {show && <TimeSliceDemo2 />}
    </div>
  );
};

// 改进方案
class TimeSliceDemo2 extends React.Component {
  state = {
    dataList: [], //数据源列表
    renderList: [], //渲染列表
    position: { width: 0, height: 0 }, // 位置信息
    eachRenderNum: 500, // 每次渲染数量
  };
  box = React.createRef();
  componentDidMount() {
    const { offsetHeight, offsetWidth } = this.box.current;
    const originList = new Array(20000).fill(1);
    const times = Math.ceil(
      originList.length / this.state.eachRenderNum
    ); /* 计算需要渲染此次数*/
    let index = 1;
    this.setState(
      {
        dataList: originList,
        position: { height: offsetHeight, width: offsetWidth },
      },
      () => {
        this.toRenderList(index, times);
      }
    );
  }
  toRenderList = (index, times) => {
    if (index > times) return; /* 如果渲染完成，那么退出 */
    const { renderList } = this.state;
    renderList.push(
      this.renderNewList(index)
    ); /* 通过缓存element把所有渲染完成的list缓存下来，下一次更新，直接跳过渲染 */
    this.setState({
      renderList,
    });
    requestIdleCallback(() => {
      /* 用 requestIdleCallback 代替 setTimeout 浏览器空闲执行下一批渲染 */
      this.toRenderList(++index, times);
    });
  };
  renderNewList(index) {
    /* 得到最新的渲染列表 */
    const { dataList, position, eachRenderNum } = this.state;
    const list = dataList.slice(
      (index - 1) * eachRenderNum,
      index * eachRenderNum
    );
    return (
      <React.Fragment key={index}>
        {list.map((item, index) => (
          <Circle key={index} position={position} />
        ))}
      </React.Fragment>
    );
  }
  render() {
    return (
      <div className="bigData_index" ref={this.box}>
        {this.state.renderList}
      </div>
    );
  }
}
