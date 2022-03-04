import "./App.css";
import React from "react";
import {
  ProviderDemo,
  ProviderDemo2,
} from "./components/basic/7_context/advanced_context";
import { AdvancedPractiveChangeTheme } from "./components/basic/7_context/advanced_practive_change_theme";
// import { ProviderDemo } from "./components/basic/7_context/dynamic_context";
// import { B, GrandFather } from "./components/basic/7_context";
// import { PropsComponentDemo, FatherIndex } from "./components/basic/4_props";
// import FormDemo from "./components/basic/4_props/form";
// import { LifeCycleF, LifeCycleC } from "./components/basic/5_lifeCycle";
// import {
//   FuncComponent,
//   FunctionLifeCycleContainer,
//   TestClassComponent,
// } from "./components/basic/5_lifeCycle";

// import {
//   AutoFocusTextInput,
//   ClassComponent,
//   CustomTextInput,
//   DemoRef,
//   DemoRef2,
//   FatherCC,
//   ForwardSonFCContainer,
//   FuncComponent,
//   FunctionComponentStoreData,
//   GrandFather,
//   HOCForward,
//   Home,
// } from "./components/basic/6_ref";

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
      {/* <DemoRef />
      <DemoRef2 /> */}
      {/* <B /> */}
      {/* <GrandFather /> */}

      {/* 7. context */}
      {/* <ProviderDemo /> */}

      {/* 嵌套 Provider */}
      {/* <ProviderDemo /> */}

      {/* 逐层传递 Provider */}
      {/* <ProviderDemo2 /> */}

      <AdvancedPractiveChangeTheme />
    </div>
  );
}

export default App;
