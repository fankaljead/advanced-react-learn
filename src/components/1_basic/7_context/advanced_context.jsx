// context 高阶用法
import React, { useState } from "react";

// 1. 嵌套 Provider
const ThemeContext = React.createContext(null);
const LanContext = React.createContext(null);

function ConsumerDemo() {
  return (
    <ThemeContext.Consumer>
      {(themeContextValue) => {
        return (
          <LanContext.Consumer>
            {(lanContextValue) => {
              const { color, background } = themeContextValue;
              return (
                <div style={{ color, background }}>
                  {lanContextValue === "CH"
                    ? "大家好, 让我们一起学习React!"
                    : "Hello, let us learn React!"}
                </div>
              );
            }}
          </LanContext.Consumer>
        );
      }}
    </ThemeContext.Consumer>
  );
}

const Son = React.memo(() => <ConsumerDemo />);
Son.displayName = "Son";

export function ProviderDemo() {
  const [themeContextValue, setThemeContextValue] = useState({
    color: "#FFF",
    background: "blue",
  });
  const [lanContextValue, setLanContextValue] = React.useState("CH"); // CH -> 中文 ， EN -> 英文

  return (
    <div>
      <ThemeContext.Provider value={themeContextValue}>
        <LanContext.Provider value={lanContextValue}>
          <Son />
        </LanContext.Provider>
      </ThemeContext.Provider>
      <button
        onClick={() =>
          setLanContextValue(lanContextValue === "CH" ? "EN" : "CH")
        }
      >
        改变语言
      </button>
      <button
        onClick={() =>
          setThemeContextValue(
            themeContextValue.color === "#FFF"
              ? {
                  color: "#ccc",
                  background: "cyan",
                }
              : {
                  color: "#FFF",
                  background: "blue",
                }
          )
        }
      >
        改变主题
      </button>
    </div>
  );
}

// 逐层传递 Provider
function Son2() {
  return (
    <ThemeContext.Consumer>
      {(themeContextValue2) => {
        const { color, background, margin } = themeContextValue2;
        return (
          <div className="sonbox" style={{ color, background, margin }}>
            第二层Provder
          </div>
        );
      }}
    </ThemeContext.Consumer>
  );
}

function SSon() {
  const { color, background, marginBottom } = React.useContext(ThemeContext);
  const [themeContextValue2] = React.useState({
    color: "#fff",
    background: "blue",
    margin: "40px",
  });
  /* 第二层 Provder 传递内容 */
  return (
    <div className="box" style={{ color, background, marginBottom }}>
      第一层Provder
      <ThemeContext.Provider value={themeContextValue2}>
        <Son2 />
      </ThemeContext.Provider>
    </div>
  );
}

export function ProviderDemo2() {
  const [themeContextValue] = React.useState({
    color: "orange",
    background: "pink",
    marginBottom: "40px",
  });
  /* 第一层  Provider 传递内容  */
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <SSon />
    </ThemeContext.Provider>
  );
}
