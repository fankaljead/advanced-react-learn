/*
 * @Author: Zhou Xianghui
 * @Date: 2022-01-13 12:57:54
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-06-07 19:08:16
 * @FilePath: \advancend-react\src\App.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import "./App.css";
import React from "react";
// import {
//   ProviderDemo,
//   ProviderDemo2,
// } from "./components/basic/7_context/advanced_context";
// import { AdvancedPractiveChangeTheme } from "./components/basic/7_context/advanced_practive_change_theme";
// import { CSSModuleDemo } from "./components/basic/8_modular_css";
// import { StyleComponentDemo } from "./components/basic/8_modular_css/style_component";
// import { UseDynamicHocDemo, UseEventWatchDemo } from "./components/basic/9_hoc";
// import {
//   StoreReactElementDemo1,
//   StoreReactElementDemo2,
//   StoreReactElementDemo3,
//   UseMemoDemo1,
// } from "./components/2_optimization/10_render_control";
// import {
//   PureComponentDemo1,
//   PureComponentDemo2,
//   PureComponentDemo3,
//   PureComponentDemo4,
// } from "./components/2_optimization/10_render_control/pure_component";
// import { ShouldComponentUpdate } from "./components/2_optimization/10_render_control/shouldComponentUpdate";
// import { ReactMemoDemo } from "./components/2_optimization/10_render_control/react_memo";
import {
  ProfilePage,
  SuspenseDemo,
} from "./components/2_optimization/11_render_tuning/suspense";
import { ReactLazyDemo } from "./components/2_optimization/11_render_tuning/react_lazy";
import { ErrorBoundaryDemo } from "./components/2_optimization/11_render_tuning/error_boundary";
import { ReactLazySuspecePractice } from "./components/2_optimization/11_render_tuning/practice";
import { TimeSliceContainerDemo1 } from "./components/2_optimization/12_handle_massive_data/time_slice";
import { VirtualList } from "./components/2_optimization/12_handle_massive_data/vitual_list";
import { DebounceDemo } from "./components/2_optimization/13_detail_process";
import {
  DynamicAddClassName,
  ManipulateNativeDOM,
  SetStateCSS3,
} from "./components/2_optimization/13_detail_process/react_animation";
import {
  EventDemo,
  OneClickEvent,
  StopPropgation,
} from "./components/3_react_principle/14_event_principle";
import {
  ClassComponent,
  FunctionComponent,
  HooksIfDemoContainer,
  HooksUpdate,
} from "./components/3_react_principle/17_hooks_principle";
import {
  FuncComponentLifeCycleContainer,
  GetDrivedStateFromPropsDemo,
  UseeUpdateDemo,
  UseRefUpdate,
} from "./components/1_basic/5_lifeCycle";
import { DocumentQueryDemo } from "./components/1_basic/6_ref";
import { ReactReduxDemo } from "./components/3_react_ecosystems/19_react_redux";
import {
  CustomHooksDemo,
  UseAsyncStateDemo,
  UseDebounceStateDemo,
  UseEffectPropsDemo,
  UseGetDOMDemo,
  UseUpdateDemo,
} from "./components/5_practice/21_customed_hooks";
import ClassStateComponent from "./components/1_basic/3_state";
import { UseMemoDemo1 } from "./components/2_optimization/10_render_control";
import { UseEffectDemo } from "./components/5_practice/21_customed_hooks/hooks_test";
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

      {/* ?????? Provider */}
      {/* <ProviderDemo /> */}

      {/* ???????????? Provider */}
      {/* <ProviderDemo2 /> */}

      {/* <AdvancedPractiveChangeTheme /> */}
      {/* <CSSModuleDemo /> */}
      {/* <StyleComponentDemo /> */}

      {/* <UseDynamicHocDemo /> */}
      {/* <UseEventWatchDemo /> */}

      {/* <StoreReactElementDemo1 /> */}
      {/* <StoreReactElementDemo2 /> */}
      {/* <StoreReactElementDemo3 /> */}
      {/* <UseMemoDemo1 /> */}
      {/* <PureComponentDemo1 /> */}
      {/* <PureComponentDemo2 /> */}
      {/* <PureComponentDemo3 /> */}
      {/* <PureComponentDemo4 /> */}
      {/* <ShouldComponentUpdate /> */}
      {/* <ReactMemoDemo /> */}

      {/* <SuspenseDemo /> */}
      {/* <ReactLazyDemo /> */}
      {/* <ErrorBoundaryDemo /> */}
      {/* <ReactLazySuspecePractice /> */}

      {/* <TimeSliceContainerDemo1 /> */}
      {/* <VirtualList /> */}

      {/* <DebounceDemo /> */}
      {/* <DynamicAddClassName /> */}
      {/* <ManipulateNativeDOM /> */}
      {/* <SetStateCSS3 /> */}

      {/* <EventDemo /> */}
      {/* <StopPropgation /> */}
      {/* <OneClickEvent /> */}

      {/* <HooksIfDemoContainer /> */}
      {/* <HooksUpdate /> */}

      {/* <FuncComponentLifeCycleContainer /> */}
      {/* <DocumentQueryDemo /> */}
      {/* <ReactReduxDemo /> */}

      {/* <GetDrivedStateFromPropsDemo /> */}

      {/* <ProfilePage /> */}

      {/* <CustomHooksDemo /> */}
      {/* <UseDebounceStateDemo /> */}

      {/* <UseAsyncStateDemo /> */}
      {/* <UseGetDOMDemo /> */}
      {/* <UseEffectPropsDemo /> */}
      {/* <ClassStateComponent /> */}
      {/* <UseUpdateDemo /> */}

      {/* <UseMemoDemo1 /> */}
      {/* <UseEffectDemo /> */}

      {/* <ClassComponent />
      <FunctionComponent /> */}
      {/* <UseRefUpdate /> */}
      <UseeUpdateDemo />
    </div>
  );
}

export default App;
