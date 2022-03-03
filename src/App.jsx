import "./App.css";
import React from "react";
// import { PropsComponentDemo, FatherIndex } from "./components/basic/4_props";
// import FormDemo from "./components/basic/4_props/form";
// import { LifeCycleF, LifeCycleC } from "./components/basic/5_lifeCycle";
// import {
//   FuncComponent,
//   FunctionLifeCycleContainer,
//   TestClassComponent,
// } from "./components/basic/5_lifeCycle";

import {
  AutoFocusTextInput,
  ClassComponent,
  CustomTextInput,
  DemoRef,
  DemoRef2,
  FatherCC,
  ForwardSonFCContainer,
  FuncComponent,
  FunctionComponentStoreData,
  GrandFather,
  HOCForward,
  Home,
} from "./components/basic/6_ref";

function App() {
  return (
    <div className="App">
      {/* <PropsComponentDemo />
      <FatherIndex />
      <FormDemo /> */}
      {/* <LifeCycleF name="hello fcuntion" />
      <LifeCycleC name="hello class" /> */}
      {/* <FuncComponent />
      <FunctionLifeCycleContainer />
      <TestClassComponent /> */}
      {/* ref */}
      {/* <CustomTextInput />
      <AutoFocusTextInput />
      <ClassComponent />
      <FuncComponent />
      <GrandFather />
      <Home />
      <HOCForward />
      <FatherCC />
      <ForwardSonFCContainer /> */}
      {/* <FunctionComponentStoreData id={1} /> */}
      <DemoRef />
      <DemoRef2 />
    </div>
  );
}

export default App;
