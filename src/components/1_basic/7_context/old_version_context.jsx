import React, { Component } from "react";
import PropTypes from "prop-types";

// 老版本提供者
export class ProviderDemo extends Component {
  static childContextTypes = {
    theme: PropTypes.object,
  };
  getChildContext() {
    // 提供者要提供的主题颜色，供消费者消费
    const theme = {
      color: "#ccc",
      background: "pink",
    };
    return theme;
  }
  render() {
    return <div>ProviderDemo</div>;
  }
}

// 老版本消费者
class ConsumerDemo extends React.Component {
  static contextTypes = {
    theme: PropTypes.object,
  };
  render() {
    console.log(this.context.theme); // {  color:'#ccc',  bgcolor:'pink' }
    const { color, background } = this.context.theme;
    return <div style={{ color, background }}>消费者</div>;
  }
}

export const Son = () => <ConsumerDemo />;


// 老版本的 API 用起来流程可能会很繁琐，而且还依赖于 propsTypes 等第三方库