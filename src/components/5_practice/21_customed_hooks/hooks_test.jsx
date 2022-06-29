/*
 * @Author: Zhou Xianghui
 * @Date: 2022-04-08 19:41:32
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-04-08 19:48:07
 * @FilePath: \advancend-react\src\components\5_practice\21_customed_hooks\hooks_test.jsx
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import React from "react";

export function UseEffectDemo() {
  const [person, setPerson] = React.useState({ name: "zhou", age: 18 });

  React.useEffect(() => {
    console.log("person useEffect", person);
  }, [person]);

  return (
    <div>
      <h1>{person.name}</h1>
      <h1>{person.age}</h1>
      <button onClick={() => setPerson({ name: "zhou", age: 28 })}>
        change
      </button>
      <button
        onClick={() => {
          person.age = person.age + 1;
          console.log("person:", person);
          setPerson({ ...person });
        }}
      >
        age + 1 改变对象
      </button>
      <button
        onClick={() => {
          person.age = person.age + 1;
          console.log("person:", person);
          setPerson(person);
        }}
      >
        age + 1 不改变对象
      </button>
    </div>
  );
}
