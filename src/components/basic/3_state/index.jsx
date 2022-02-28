// 玄学 state
import React, { Component, useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default class ClassStateComponent extends Component {
  state = {
    name: "zxh",
    count: 1,
    number: 1,
  };
  componentDidUpdate() {
    console.log(this.state);
  }
  // state 对象未变化更新 使用 PureComponent 不会触发更新
  handleClick = () => {z
    this.setState({ name: "zxh", count: this.state.count + 1 - 1 }, () => {
      console.log("handleClick:", this.state);
    });
  };

  // state 批量更新
  handleClick2 = () => {
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("callback1", this.state.number);
    });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("callback2", this.state.number);
    });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("callback3", this.state.number);
    });
    console.log(this.state.number);
  };

  // 使用 flushSync 设置高优先级的更新
  handleClick3 = () => {
    setTimeout(() => {
      this.setState({ number: 1 });
    });
    this.setState({ number: 2 });
    ReactDOM.flushSync(() => {
      this.setState({ number: 3 });
    });
    this.setState({ number: 4 });
  };

  // 异步更新 setTimeout
  handleClick4 = () => {
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log("callback1", this.state.number);
      });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log("callback2", this.state.number);
      });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 }, () => {
        console.log("callback3", this.state.number);
      });
      console.log(this.state.number);
    }, 0);
  };

  // Promise 更新
  handleClick5 = () => {
    Promise.resolve("promise click1").then((v) => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log(v, this.state.number);
      });
    });
    Promise.resolve("promise click1").then((v) => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log(v, this.state.number);
      });
    });
    Promise.resolve("promise click3").then((v) => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log(v, this.state.number);
      });
    });
  };

  // 异步批量更新
  handleClick6 = () => {
    setTimeout(() => {
      ReactDOM.unstable_batchedUpdates(() => {
        this.setState({ number: this.state.number + 1 }, () => {
          console.log("异步批量更新 callback1", this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log("异步批量更新 callback2", this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log("异步批量更新 callback3", this.state.number);
        });
        console.log(this.state.number);
      });
    }, 0);
  };
  handleClick7 = () => {
    this.setState((state, props) => {
      console.log("state:", state);
      console.log("props:", props);
      return { number: this.state.number + 1 };
    });
  };
  handleClick8 = () => {
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log("异步 settimeout 更新 number: ", this.state.number);
      });
    }, 0);
    Promise.resolve("resolve").then((v) => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log(`异步 promise ${v} 更新 number: `, this.state.number);
      });
    }, 0);
    this.setState({ number: 20 }, () => {
      console.log(`正常更新 number: ${this.state.number}`);
    });
    ReactDOM.flushSync(() => {
      this.setState({ number: 3 }, () => {
        console.log(`flush sync number: ${this.state.number}`);
      });
    });
    this.setState({ number: 4 }, () => {
      console.log(`正常更新 number: ${this.state.number}`);
    });
  };
  render() {
    return (
      <div
        style={{
          border: "2px solid blue",
          backgroundColor: "darkcyan",
          padding: "10px",
        }}
        onClick={this.handleClick}
      >
        <h1>
          this is class component {this.state.name} {this.state.count}
        </h1>
        <h1>this.state.number: {this.state.number}</h1>
        <button onClick={this.handleClick2}>
          click me! {this.state.number}
        </button>
        <button onClick={this.handleClick3}>
          flush sync click! {this.state.number}
        </button>
        <button onClick={this.handleClick4}>
          settimeout click {this.state.number}
        </button>
        <button onClick={this.handleClick5}>
          promise click {this.state.number}
        </button>
        <button onClick={this.handleClick6}>异步批量更新</button>
        <button onClick={this.handleClick7}>setState第一个参数为函数</button>
        <button onClick={this.handleClick8}>
          异步 settimeout promise 更新
        </button>
      </div>
    );
  }
}

export function StateFunctionComponent() {
  const [number, setNumber] = useState(0);
  useEffect(() => {
    console.log("监听 number 变化, number: ", number);
  }, [number]);
  const handleClick = () => {
    ReactDOM.flushSync(() => {
      setNumber(2);
    });
    setNumber(1);
    setTimeout(() => {
      setNumber(3);
    });
  };
  const handleClick2 = () => {
    setNumber((state) => state + 1);
    setNumber((state) => state + 1);
    setNumber(number + 20);
    setNumber(number + 30);
  };
  const handleClick3 = () => {
    setTimeout(() => {
      setNumber(number + 1);
    }, 0);
    setTimeout(() => {
      setNumber(number + 1);
    }, 0);
    setTimeout(() => {
      setNumber(number + 1);
    }, 0);
  };
  const handleClick4 = () => {
    setTimeout(() => {
      setNumber((number) => number + 1);
    }, 0);
    setTimeout(() => {
      setNumber((number) => number + 1);
    }, 0);
    setTimeout(() => {
      setNumber((number) => number + 1);
    }, 0);
  };
  const handleClick5 = () => {
    for (let i = 0; i < 5; ++i) {
      setNumber(number + 1);
      console.log("for 循环 number: ", number);
    }
  };
  const handleClick6 = () => {
    for (let i = 0; i < 5; ++i) {
      setTimeout(() => {
        setNumber(number + 1);
        console.log("for 循环异步 number: ", number);
      }, 1000);
    }
  };
  const handleClick7 = () => {
    for (let i = 0; i < 5; ++i) {
      setTimeout(() => {
        setNumber((number) => number + 1);
        console.log("for 循环异步setNumber参数为函数 number: ", number);
      }, 1000 * i);
    }
  };
  console.log("sfc number: ", number);
  return (
    <div
      style={{
        backgroundColor: "greenyellow",
        padding: "4px",
        border: "2px solid red",
      }}
    >
      <h1>this is function component</h1>
      <h1>number: {number}</h1>
      <button onClick={handleClick}>number++</button>
      <button onClick={handleClick2}>dispatch 参数是一个函数 </button>
      <button onClick={handleClick3}>settimeout click</button>
      <button onClick={handleClick4}>settimeout click dispatch 为参数</button>
      <button onClick={handleClick5}>for 循环 setNumber</button>
      <button onClick={handleClick6}>for 循环异步 setNumber</button>
      <button onClick={handleClick7}>
        for 循环异步 setNumber参数为函数 setNumber
      </button>
    </div>
  );
}
