import "./App.css";
import React from "react";
// import { PropsComponentDemo, FatherIndex } from "./components/basic/4_props";
// import FormDemo from "./components/basic/4_props/form";
// import { LifeCycleF, LifeCycleC } from "./components/basic/5_lifeCycle";
import {
  FuncComponent,
  FunctionLifeCycleContainer,
} from "./components/basic/5_lifeCycle";

function App() {
  return (
    <div className="App">
      {/* <PropsComponentDemo />
      <FatherIndex />
      <FormDemo /> */}
      {/* <LifeCycleF name="hello fcuntion" />
      <LifeCycleC name="hello class" /> */}
      <FuncComponent />
      <FunctionLifeCycleContainer />
    </div>
  );
}

export default App;
