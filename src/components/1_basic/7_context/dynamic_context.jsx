// 动态 context
import React, { useContext, useState } from "react";

const ThemeContext = React.createContext(null);
ThemeContext.displayName = "dynamic theme context";

function ConsumerDemo() {
  const { color, background } = useContext(ThemeContext);
  return <div style={{ color, background }}>消费者</div>;
}
const Son = React.memo(() => {
  console.log("son render");
  return <ConsumerDemo />;
});
Son.displayName = "son";

export function ProviderDemo() {
  const [contextValue, setContextValue] = useState({
    color: "#ccc",
    background: "pink",
  });

  return (
    <div>
      <ThemeContext.Provider value={contextValue}>
        <Son />
        {React.useMemo(() => {
          console.log("use memo render");
          return <ConsumerDemo />;
        }, [])}
      </ThemeContext.Provider>
      <button
        onClick={() => setContextValue({ color: "#fff", background: "blue" })}
      >
        切换主题
      </button>
    </div>
  );
}
