# React 进阶实践

[toc]

[React 进阶实践](https://juejin.cn/book/6945998773818490884)

- 1-9 章为基础篇
- 10-13 章为优化篇
- 14-17 章为原理篇

## 1. JSX

### 1.1 JSX 最终变成什么

- JSX 会被编译为 ReactElement 形式，React.createElement 用法如下：

    ```js
    React.createElement(
      type,
      [props],
      [...children]
    )
    ```

    `createElement` 参数

    1. 第一个参数：如果是组件类型，会传入组件对应的类或函数；如果是 dom 元素类型，传入 div 或者 span 之类的字符串。
    2. 第二个参数：一个对象，在 dom 类型中为标签属性，在组件类型中为 props 。
    3. 其他参数：依次为 children，根据顺序排列。

    例如 ：

    ```jsx
    <div>
       <TextComponent />
       <div>hello,world</div>
       let us learn React!
    </div>
    ```

    会被编译为：

    ```js
     React.createElement("div", null,
            React.createElement(TextComponent, null),
            React.createElement("div", null, "hello,world"),
            "let us learn React!"
        )
    ```

    > [You no longer need to import React from 'react' ](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
    >
    > React 17 后，在函数组件中不需要显示的引入 React 了
    >
    > before:
    >
    > ```jsx
    > import React from 'react';
    >
    > function App() {
    > return <h1>Hello World</h1>;
    > }
    > ```
    >
    > now:
    >
    > ```jsx
    > function App() {
    > return <h1>Hello World</h1>;
    > }
    > ```
    >
    > 最新的 JSX transform 把上面的编译为：
    >
    > ```js
    > // Inserted by a compiler (don't import it yourself!)
    > import {jsx as _jsx} from 'react/jsx-runtime';
    >
    > function App() {
    > return _jsx('h1', { children: 'Hello world' });
    > }
    > ```
    >
    >

- `createElement` 处理后的样子

    | `jsx`元素类型     | `react.createElement` 转换后                      | `type` 属性                    |
    | ----------------- | ------------------------------------------------- | ------------------------------ |
    | `elment`元素类型  | `react element`类型                               | 标签字符串，例如 `div`         |
    | `fragment`类型    | `react element`类型                               | `symbol`  `react.fragment`类型 |
    | 文本类型          | 直接字符串                                        | 无                             |
    | 数组类型          | 返回数组结构，里面元素被`react.createElement`转换 | 无                             |
    | 组件类型          | `react element`类型                               | 组件类或者组件函数本身         |
    | 三元运算 / 表达式 | 先执行三元运算，然后按照上述规则处理              | 看三元运算返回结果             |
    | 函数执行          | 先执行函数，然后按照上述规则处理                  | 看函数执行返回结果             |

- React 底层调和处理后，终将变成什么

    最终，在调和阶段，上述 React element 对象的每一个子节点都会形成一个与之对应的 fiber 对象，然后通过 sibling、return、child 将每一个 fiber 对象联系起来。

    不同种类的 fiber tag 如下：

    ```js
    export const FunctionComponent = 0;       // 函数组件
    export const ClassComponent = 1;          // 类组件
    export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件
    export const HostRoot = 3;                // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素
    export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal
    export const HostComponent = 5;           // dom 元素 比如 <div>
    export const HostText = 6;                // 文本节点
    export const Fragment = 7;                // 对应 <React.Fragment>
    export const Mode = 8;                    // 对应 <React.StrictMode>
    export const ContextConsumer = 9;         // 对应 <Context.Consumer>
    export const ContextProvider = 10;        // 对应 <Context.Provider>
    export const ForwardRef = 11;             // 对应 React.ForwardRef
    export const Profiler = 12;               // 对应 <Profiler/ >
    export const SuspenseComponent = 13;      // 对应 <Suspense>
    export const MemoComponent = 14;          // 对应 React.memo 返回的组件
    ```

    ```jsx
    <div>
        { /* element 元素类型 */}
        <div>hello,world</div>
        { /* fragment 类型 */}
        <React.Fragment>
            <div> 👽👽 </div>
        </React.Fragment>
        { /* text 文本类型 */}
        my name is alien
        { /* 数组节点类型 */}
        {toLearn.map(item => <div key={item} >let us learn {item} </div>)}
        { /* 组件类型 */}
        <TextComponent />
        { /* 三元运算 */}
        {status ? <TextComponent /> : <div>三元运算</div>}
        { /* 函数执行 */}
        {renderFoot()}
        <button onClick={() => console.log(this)} >打印行内 this 的内容</button>
    </div>
    ```

    上面 jsx 最终形成的 fiber 结构图：

    ![jsx7.jpg](https://s2.loli.net/2022/01/10/gFbPRvXa1U5AHuZ.jpg)

    fiber 对应关系

    - child： 一个由父级 fiber 指向子级 fiber 的指针。
    - return：一个子级 fiber 指向父级 fiber 的指针。
    - sibiling: 一个 fiber 指向下一个兄弟 fiber 的指针。

    **注意**：

    - 对于上述在 jsx 中写的 map 数组结构的子节点，外层会被加上 fragment ；
    - map 返回数组结构，作为 fragment 的子节点。

### 1.3 进阶-可控性 render

- **受控组件**  React 的 state 成为“唯一数据源”， 染表单的 React 组件还控制着用户输入过程中表单发生的操作。被 React 以这种方式控制取值的表单输入元素就叫做“受控组件”。
- **非受控组件** 表单数据将交由 DOM 节点来处理。

上面的 demo 暴露了下面问题：

1. 返回的 `children` 虽然是一个数组，但是数组里面的数据类型却是不确定的，有对象类型( 如`ReactElement` ) ，有数组类型(如 `map` 遍历返回的子节点)，还有字符串类型(如文本)
2. 无法对 render 后的 React element 元素进行可控性操作

针对上面问题，我们需要进行：

1. 将上述children扁平化处理，将数组类型的子节点打开 ；

2. 干掉children中文本类型节点；

3. 向children最后插入

    say goodbye

    元素；

4. 克隆新的元素节点并渲染。

5. `React.Children.toArray` 扁平化，规范化 children 数组

    ```js
    const flatChildren = React.Children.toArray(children)
    console.log(flatChildren)
    ```

6. 遍历 children,验证 React.elment 元素节点，除去文本节点

    ```js
    const newChildren :any= []
    React.Children.forEach(flatChildren,(item)=>{
        if(React.isValidElement(item)) newChildren.push(item)
    })
    ```



3. 用 React.createElement ，插入到 children 最后

    ```js
     /* 第三步，插入新的节点 */
    const lastChildren = React.createElement(`div`,{ className :'last' } ,`say goodbye`)
    newChildren.push(lastChildren)
    ```



4. **已经修改了 children，现在做的是，通过 cloneElement 创建新的容器元素**

    ```js
    /* 第 4 步：修改容器节点 */
    const newReactElement =  React.cloneElement(reactElement,{} ,...newChildren )
    ```

### 1.3 问题

- **"数据类型却是不确定的" 这有啥问题？**
- **“进行可控性操作” 为什么要做这个？好处是什么?**
- **看结果也只是过滤了些东西，为什么叫可控性操作？**
- **什么情况下还需要在render后操作？**

## 2. Component

```jsx
/* 类 */
class textClass {
    sayHello=()=>console.log('hello, my name is alien')
}
/* 类组件 */
class Index extends React.Component{
    state={ message:`hello ，world!` }
    sayHello=()=> this.setState({ message : 'hello, my name is alien' })
    render(){
        return <div style={{ marginTop:'50px' }} onClick={ this.sayHello } > { this.state.message }  </div>
    }
}
/* 函数 */
function textFun (){
    return 'hello, world'
}
/* 函数组件 */
function FunComponent(){
    const [ message , setMessage ] = useState('hello,world')
    return <div onClick={ ()=> setMessage('hello, my name is alien')  } >{ message }</div>
}
```

- **组件本质上就是类和函数**，但是与常规的类和函数不同的是，**组件承载了渲染视图的 UI 和更新视图的 setState 、 useState 等方法**。React 在底层逻辑上会像正常实例化类和正常执行函数那样处理的组件。

- 函数与类上的特性在 React 组件上同样具有，比如原型链，继承，静态属性等，所以不要把 React 组件和类与函数独立开来。

- React 对 class 组件的处理流程

    - 对于类组件的执行，是在 `react-reconciler/src/ReactFiberClassComponent.js` 中

        ```js
        function constructClassInstance(
            workInProgress, // 当前正在工作的 fiber 对象
            ctor,           // 我们的类组件
            props           // props
        ){
             /* 实例化组件，得到组件实例 instance */
             const instance = new ctor(props, context)
        }
        ```

    - 对于函数组件的执行是在， `react-reconciler/src/ReactFiberHooks.js` 中

        ```js
        function renderWithHooks(
          current,          // 当前函数组件对应的 `fiber`， 初始化
          workInProgress,   // 当前正在工作的 fiber 对象
          Component,        // 我们函数组件
          props,            // 函数组件第一个参数 props
          secondArg,        // 函数组件其他参数
          nextRenderExpirationTime, //下次渲染过期时间
        ){
             /* 执行我们的函数组件，得到 return 返回的 React.element对象 */
             let children = Component(props, secondArg);
        }
        ```



### 2.1 class 类组件

- **类组件的定义**

    在 class 组件中，除了继承 React.Component ，底层还加入了 updater 对象，组件中调用的 setState 和  forceUpdate 本质上是调用了 updater 对象上的 enqueueSetState 和 enqueueForceUpdate  方法。

    ```js
    // react/src/ReactBaseClasses.js
    function Component(props, context, updater) {
      this.props = props;      //绑定props
      this.context = context;  //绑定context
      this.refs = emptyObject; //绑定ref
      this.updater = updater || ReactNoopUpdateQueue; //上面所属的updater 对象
    }
    /* 绑定setState 方法 */
    Component.prototype.setState = function(partialState, callback) {
      this.updater.enqueueSetState(this, partialState, callback, 'setState');
    }
    /* 绑定forceupdate 方法 */
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
    }
    ```

    如上可以看出 Component 底层 React 的处理逻辑是，类组件执行构造函数过程中会在实例上绑定 props 和 context  ，初始化置空 refs 属性，原型链上绑定setState、forceUpdate 方法。对于 updater，React  在实例化类组件之后会单独绑定 update 对象。

- 如果没有在 `contructor` 中的 `super` 函数中传递 `props` ，那么接下来的 `this.props` 就取不到 `props`

    这是由于绑定 `props` 是在父类 `Component` 构造函数中，执行 `super` 等于执行 `Componet` 函数

- 在 class 类内部，**箭头函数是直接绑定在实例对象上的**，而第二个 handleClick 是绑定在 prototype 原型链上的，它们的优先级是：**实例对象上方法属性 原型链对象上方法属性。**

### 2.2 函数组件

ReactV16.8 hooks 问世以来，对函数组件的功能加以强化，可以在 function  组件中，做类组件一切能做的事情，甚至完全取缔类组件。

```jsx
function Index(){
    console.log(Index.number) // 打印 1
    const [ message , setMessage  ] = useState('hello,world') /* hooks  */
    return <div onClick={() => setMessage('let us learn React!')  } > { message } </div> /* 返回值 作为渲染ui */
 }
 Index.number = 1 /* 绑定静态属性 */
```

**注意** 不**要尝试给函数组件 prototype 绑定属性或方法，即使绑定了也没有任何作用，因为通过上面源码中 React 对函数组件的调用，是采用直接执行函数的方式，而不是通过new的方式**。

### 2.3 区别

**对于类组件来说，底层只需要实例化一次，实例中保存了组件的 state 等状态。对于每一次更新只需要调用 render 方法以及对应的生命周期就可以了。**

**但是在函数组件中，每一次更新都是一次新的函数执行，一次函数组件的更新，里面的变量会重新声明。**

为了能让函数组件可以保存一些状态，执行一些副作用钩子，React Hooks 应运而生，它可以帮助记录 React 中组件的状态，处理一些额外的副作用。

### 2.4 组件通信方式

React 一共有 5 种主流的通信方式：

1. props 和 callback 方式

    props 和 callback 可以作为 React 组件最基本的通信方式，父组件可以通过 props 将信息传递给子组件，子组件可以通过执行 props 中的回调函数 callback 来触发父组件的方法，实现父与子的消息通讯。

    - 父组件 -> 通过自身 state 改变，重新渲染，传递 props -> 通知子组件

    - 子组件 -> 通过调用父组件 props 方法 -> 通知父组件。

2. ref 方式。

3. React-redux 或 React-mobx 状态管理方式。

4. context 上下文方式。

5. event bus 事件总线。

### 2.5 组件的强化方式

1. **类组件继承**
2. **函数组件自定义 Hooks**
3. **HOC 高阶组件**

## 3. state

**一个问题：** **state 是同步还是异步的 ？**

batchUpdate 批量更新概念，以及批量更新被打破的条件

React 是有多种模式的，基本平时用的都是 legacy 模式下的 React，除了`legacy` 模式，还有 `blocking` 模式和 `concurrent` 模式， blocking 可以视为 concurrent 的优雅降级版本和过渡版本，React 最终目的，不久的未来将以 concurrent 模式作为默认版本，这个模式下会开启一些新功能。

对于 concurrent 模式下，会采用不同 State 更新逻辑。前不久透露出未来的Reactv18 版本，concurrent 将作为一个稳定的功能出现。

### 3.1 类组件中的 state

- **`setState` 用法**

    React 项目中 UI 的改变来源于 state 改变，类组件中 `setState` 是更新组件，渲染视图的主要方式。

    - **基本用法**

        ```js
        setState(obj,callback)
        ```

        - 第一个参数：当 obj 为一个对象，则为即将合并的 state ；如**果 obj 是一个函数，那么当前组件的 state 和 props 将作为参数，返回值用于合并新的 state。**

        - 第二个参数 callback ：callback 为一个函数，**函数执行上下文中可以获取当前 setState 更新后的最新 state 的值**，可以作为依赖 state 变化的副作用函数，可以用来做一些基于 DOM 的操作。

            ```js
            /* 第一个参数为function类型 */
            this.setState((state,props)=>{
                return { number:1 }
            })
            /* 第一个参数为object类型 */
            this.setState({ number:1 },()=>{
                console.log(this.state.number) //获取最新的number
            })
            ```

        假如一次事件中触发一次如上 setState ，在 React 底层主要做了那些事呢？

        - 首先，setState 会产生当前更新的优先级（老版本用 expirationTime ，新版本用 lane ）。

        - 接下来 React 会从 fiber Root 根部 fiber 向下调和子节点，调和阶段将对比发生更新的地方，更新对比  expirationTime ，找到发生更新的组件，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render  阶段。

        - 接下来到 commit 阶段，commit 阶段，替换真实 DOM ，完成此次更新流程。

        - 此时仍然在 commit 阶段，会执行 setState 中 callback 函数,如上的`()=>{ console.log(this.state.number)  }`，到此为止完成了一次 setState 全过程。

            ![02.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d5e25a4ed464547bdd0e7c3a44d0ccc~tplv-k3u1fbpfcp-watermark.awebp)

            **先后顺序：render 阶段 render 函数执行 ->  commit 阶段真实 DOM 替换 -> setState 回调函数执行 callback **

    - **类组件如何限制 state 更新视图**

        对于类组件如何限制 state 带来的更新作用的呢？

        - ①  pureComponent 可以对 state 和 props 进行浅比较，如果没有发生变化，那么组件不更新。
        - ②  shouldComponentUpdate 生命周期可以通过判断前后 state 变化来决定组件需不需要更新，需要更新返回true，否则返回false。

    -

- **setState 原理**

    对于类组件，类组件初始化过程中绑定了负责更新的`Updater`对象，对于如果调用 setState 方法，实际上是 React 底层调用 Updater 对象上的 enqueueSetState 方法。

    因为要弄明白 state 更新机制，所以接下来要从两个方向分析：

    - 一是揭秘 enqueueSetState 到底做了些什么？
    - 二是 React 底层是如何进行批量更新的？

    > react-reconciler/src/ReactFiberClassComponent.js

    ```js
    enqueueSetState(){
         /* 每一次调用`setState`，react 都会创建一个 update 里面保存了 */
         const update = createUpdate(expirationTime, suspenseConfig);
         /* callback 可以理解为 setState 回调函数，第二个参数 */
         callback && (update.callback = callback)
         /* enqueueUpdate 把当前的update 传入当前fiber，待更新队列中 */
         enqueueUpdate(fiber, update);
         /* 开始调度更新 */
         scheduleUpdateOnFiber(fiber, expirationTime);
    }
    ```

    **enqueueSetState** 作用实际很简单，就是创建一个 update ，然后放入当前 fiber 对象的待更新队列中，最后开启调度更新，进入上述讲到的更新流程

    那么问题来了，React 的 batchUpdate 批量更新是什么时候加上去的呢？

    正常 **state 更新**、**UI 交互**，都离不开用户的事件，比如点击事件，表单输入等，React 是采用事件合成的形式，**每一个事件都是由 React 事件系统统一调度的，那么 State 批量更新正是和事件系统息息相关的。**

    >  react-dom/src/events/DOMLegacyEventPluginSystem.js

    ```js
    /* 在`legacy`模式下，所有的事件都将经过此函数同一处理 */
    function dispatchEventForLegacyPluginEventSystem(){
        // handleTopLevel 事件处理函数
        batchedEventUpdates(handleTopLevel, bookKeeping);
    }
    ```

     batchedEventUpdates 方法：

    >  react-dom/src/events/ReactDOMUpdateBatching.js

    ```js
    function batchedEventUpdates(fn,a){
        /* 开启批量更新  */
       isBatchingEventUpdates = true;
      try {
        /* 这里执行了的事件处理函数， 比如在一次点击事件中触发setState,那么它将在这个函数内执行 */
        return batchedEventUpdatesImpl(fn, a, b);
      } finally {
        /* try 里面 return 不会影响 finally 执行  */
        /* 完成一次事件，批量更新  */
        isBatchingEventUpdates = false;
      }
    }
    ```

    如上可以分析出流程，在 React 事件执行之前通过 `isBatchingEventUpdates=true` 打开开关，开启事件批量更新，当该事件结束，再通过 `isBatchingEventUpdates = false;` 关闭开关，**然后在 scheduleUpdateOnFiber 中根据这个开关来确定是否进行批量更新。**

    举一个例子，如下组件中这么写：

    ```jsx
    export default class index extends React.Component{
        state = { number:0 }
        handleClick= () => {
              this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
              console.log(this.state.number)
              this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback2', this.state.number)  })
              console.log(this.state.number)
              this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback3', this.state.number)  })
              console.log(this.state.number)
        }
        render(){
            return <div>
                { this.state.number }
                <button onClick={ this.handleClick }  >number++</button>
            </div>
        }
    }
    ```

    点击打印：**0, 0, 0, callback1 1 ,callback2 1 ,callback3 1**

    如上代码，在整个 React 上下文执行栈中会变成这样：

    ![03.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/478aef991b4146c898095b83fe3dc0e7~tplv-k3u1fbpfcp-watermark.awebp)

    那么，为什么异步操作里面的批量更新规则会被打破呢？比如用 promise 或者 setTimeout 在 handleClick 中这么写：

    ```js
    setTimeout(()=>{
        this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
        console.log(this.state.number)
        this.setState({ number:this.state.number + 1 },()=>{    console.log( 'callback2', this.state.number)  })
        console.log(this.state.number)
        this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback3', this.state.number)  })
        console.log(this.state.number)
    })
    ```

    打印 ： **callback1 1  ,  1, callback2 2 , 2,callback3 3  , 3**

    那么在整个 React 上下文执行栈中就会变成如下图这样:

    ![04.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48e730fc687c4ce087e5c0eab2832273~tplv-k3u1fbpfcp-watermark.awebp)

    **所以批量更新规则被打破**。

    **那么，如何在如上异步环境下，继续开启批量更新模式呢？**

    React-Dom 中提供了批量更新方法 `unstable_batchedUpdates`，可以去手动批量更新，可以将上述 setTimeout 里面的内容做如下修改:

    ```js
    import ReactDOM from 'react-dom'
    const { unstable_batchedUpdates } = ReactDOM
    ```

    ```js
    setTimeout(()=>{
        unstable_batchedUpdates(()=>{
            this.setState({ number:this.state.number + 1 })
            console.log(this.state.number)
            this.setState({ number:this.state.number + 1})
            console.log(this.state.number)
            this.setState({ number:this.state.number + 1 })
            console.log(this.state.number)
        })
    })
    ```

    打印： **0 , 0 , 0 , callback1 1 , callback2 1 ,callback3 1**

    在实际工作中，unstable_batchedUpdates 可以用于 Ajax 数据交互之后，合并多次 setState，或者是多次  useState 。原因很简单，所有的数据交互都是在异步环境下，如果没有批量更新处理，一次数据交互多次改变 state 会促使视图多次渲染。

    **那么如何提升更新优先级呢？**

    React-dom 提供了 flushSync ，flushSync 可以将回调函数中的更新任务，放在一个较高的优先级中。React 设定了很多不同优先级的更新任务。如果一次更新任务在 flushSync 回调函数内部，那么将获得一个较高优先级的更新。

    ```js
    handerClick=()=>{
        setTimeout(()=>{
            this.setState({ number: 1  })
        })
        this.setState({ number: 2  })
        ReactDOM.flushSync(()=>{
            this.setState({ number: 3  })
        })
        this.setState({ number: 4  })
    }
    render(){
       console.log(this.state.number)
       return ...
    }
    ```

    打印 **3 4 1** :

    - 首先 `flushSync` `this.setState({ number: 3  })`设定了一个高优先级的更新，所以 2 和 3 被批量更新到 3 ，所以 3 先被打印。
    - 更新为 4。
    - 最后更新 setTimeout 中的 number = 1。

    **flushSync补充说明**：flushSync 在同步条件下，会合并之前的 setState |  useState，可以理解成，如果发现了 flushSync ，就会先执行更新，如果之前有未更新的 setState ｜ useState  ，就会一起合并了，所以就解释了如上，2 和 3 被批量更新到 3 ，所以 3 先被打印。

    综上所述， React 同一级别**更新优先级**关系是:

    flushSync 中的 setState **>** 正常执行上下文中 setState **>** Promise > setTimeout 中的 setState。

### 3.2 函数组件中的 state

 useState 可以使函数组件像类组件一样拥有 state，也就说明函数组件可以通过 useState 改变 UI 视图。

- **useState 用法**

    - **基本用法**

        ```js
         [ ①state , ②dispatch ] = useState(③initData)
        ```

        - ①  state，目的提供给 UI ，作为渲染视图的数据源。

        - ②  dispatch 改变 state 的函数，可以理解为推动函数组件渲染的渲染函数。

            - dispatch的参数, 第一种非函数情况，此时将作为新的值，赋予给 state，作为下一次渲染使用;

                ```js
                const [ number , setNumbsr ] = React.useState(0)
                /* 一个点击事件 */
                const handleClick=()=>{
                   setNumber(1)
                   setNumber(2)
                   setNumber(3)
                }
                ```

            - 第二种是函数的情况，如果 dispatch 的参数为一个函数，这里可以称它为reducer，reducer 参数，是上一次返回最新的 state，返回值作为新的 state

                ```js
                const [ number , setNumbsr ] = React.useState(0)
                const handleClick=()=>{
                   setNumber((state)=> state + 1)  // state - > 0 + 1 = 1
                   setNumber(8)  // state - > 8
                   setNumber((state)=> state + 1)  // state - > 8 + 1 = 9
                }
                ```

        - ③  initData 有两种情况，第一种情况是非函数，将作为 state 初始化的值。 第二种情况是函数，函数的返回值作为 useState 初始化的值。

            - initData  为非函数的情况:

            ```js
            /* 此时将把 0 作为初使值 */
            const [ number , setNumber ] = React.useState(0)
            ```

            - initData 为函数的情况:

                ```js
                 const [ number , setNumber ] = React.useState(()=>{
                       /*  props 中 a = 1 state 为 0-1 随机数 ， a = 2 state 为 1 -10随机数 ， 否则，state 为 1 - 100 随机数   */
                       if(props.a === 1) return Math.random()
                       if(props.a === 2) return Math.ceil(Math.random() * 10 )
                       return Math.ceil(Math.random() * 100 )
                    })
                ```

    - **如何监听 state 变化**

        类组件 setState 中，有第二个参数 callback 或者是生命周期componentDidUpdate 可以检测监听到 state 改变或是组件更新。

        那么在函数组件中，如何怎么监听 state 变化呢？这个时候就需要 useEffect 出场了，通常可以把 state 作为依赖项传入 useEffect 第二个参数 deps ，但是注意 useEffect 初始化会默认执行一次。

        ```jsx
        export default function Index(props){
            const [ number , setNumber ] = React.useState(0)
            /* 监听 number 变化 */
            React.useEffect(()=>{
                console.log('监听number变化，此时的number是:  ' + number )
            },[ number ])
            const handerClick = ()=>{
                /** 高优先级更新 **/
                ReactDOM.flushSync(()=>{
                    setNumber(2)
                })
                /* 批量更新 */
                setNumber(1)
                /* 滞后更新 ，批量更新规则被打破 */
                setTimeout(()=>{
                    setNumber(3)
                })

            }
            console.log(number)
            return <div>
                <span> { number }</span>
                <button onClick={ handerClick }  >number++</button>
            </div>
        }
        ```

        效果:

        ![01.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ac7c4b4be454d6b937b1da56eab8984~tplv-k3u1fbpfcp-watermark.awebp)

- **`dispatch` 更新特点**

    上述讲的批量更新和 flushSync ，在函数组件中，dispatch 更新效果和类组件是一样的，但是 useState  有一点值得注意，就是当调用改变 state 的函数dispatch，**在本次函数执行上下文中，是获取不到最新的 state 值的**，把上述demo  如下这么改：

    ```js
    const [ number , setNumber ] = React.useState(0)
    const handleClick = ()=>{
        ReactDOM.flushSync(()=>{
            setNumber(2)
            console.log(number)
        })
        setNumber(1)
        console.log(number)
        setTimeout(()=>{
            setNumber(3)
            console.log(number)
        })
    }
    ```

    **结果： 0 0 0**

    原因很简单，**函数组件更新就是函数的执行，在函数一次执行过程中，函数内部所有变量重新声明，所以改变的 state ，只有在下一次函数组件执行时才会被更新。**所以在如上同一个函数执行上下文中，number 一直为0，无论怎么打印，都拿不到最新的 state 。

- **useState 注意事项**

    在使用 useState 的 dispatchAction 更新 state 的时候，记得不要传入相同的 state，这样会使视图不更新。比如下面这么写：

    ```jsx
    export default function Index(){
        const [ state  , dispatchState ] = useState({ name:'alien' })
        const  handleClick = ()=>{ // 点击按钮，视图没有更新。
            state.name = 'Alien'
            dispatchState(state) // 直接改变 `state`，在内存中指向的地址相同。
        }
        return <div>
             <span> { state.name }</span>
            <button onClick={ handleClick }  >changeName++</button>
        </div>
    }
    ```

    如上例子中，当点击按钮后，发现视图没有改变，为什么会造成这个原因呢？

    在 useState 的 dispatchAction 处理逻辑中，**会浅比较两次 state ，发现 state 相同，不会开启更新调度任务**； demo 中两次   state 指向了相同的内存空间，所以默认为 state 相等，就不会发生视图更新了。

    解决问题： 把上述的 dispatchState 改成 dispatchState({...state}) 根本解决了问题，浅拷贝了对象，重新申请了一个内存空间。



- **useState 原理**

### 3.3 异同

类组件中的 `setState` 和函数组件中的 `useState` 有什么异同？

- **相同点：**
    - 首先从原理角度出发，setState和 useState 更新视图，底层都调用了 scheduleUpdateOnFiber 方法，
    - 而且事件驱动情况下都有批量更新规则。
- **不同点：**
    - 在不是 pureComponent 组件模式下， setState 不会浅比较两次 state 的值，只要调用  setState，在没有其他优化手段的前提下，就会执行更新。**但是 useState 中的 dispatchAction 会默认比较两次  state 是否相同，然后决定是否更新组件。**
    - setState 有专门监听 state 变化的回调函数 callback，可以获取最新state；但是在函数组件中，只能通过 useEffect 来执行 state 变化引起的副作用。
    - setState 在底层处理逻辑上主要是和老 state 进行合并处理，而 **useState 更倾向于重新赋值。**

## 4. props

### 4.1 理解 props

1. **props 式什么**

    首先应该明确一下什么是 props ，对于在 React 应用中写的子组件，无论是函数组件 `FunComponent` ，还是类组件 `ClassComponent` ，父组件绑定在它们标签里的属性/方法，最终会变成 props 传递给它们。但是这也不是绝对的，对于一些特殊的属性，比如说 ref 或者 key ，React 会在底层做一些额外的处理。首先来看一下 React 中 props 可以是些什么东西？

    React 中的 props ，还是很灵活的，接下来先来看一个 demo ：

    ```jsx
    /* children 组件 */
    function ChidrenComponent(){
        return <div> In this chapter, let's learn about react props ! </div>
    }
    /* props 接受处理 */
    class PropsComponent extends React.Component{
        componentDidMount(){
            console.log(this,'_this')
        }
        render(){
            const {  children , mes , renderName , say ,Component } = this.props
            const renderFunction = children[0]
            const renderComponent = children[1]
            /* 对于子组件，不同的props是怎么被处理 */
            return <div>
                { renderFunction() }
                { mes }
                { renderName() }
                { renderComponent }
                <Component />
                <button onClick={ () => say() } > change content </button>
            </div>
        }
    }
    /* props 定义绑定 */
    class Index extends React.Component{
        state={
            mes: "hello,React"
        }
        node = null
        say= () =>  this.setState({ mes:'let us learn React!' })
        render(){
            return <div>
                <PropsComponent
                   mes={this.state.mes}  // ① props 作为一个渲染数据源
                   say={ this.say  }     // ② props 作为一个回调函数 callback
                   Component={ ChidrenComponent } // ③ props 作为一个组件
                   renderName={ ()=><div> my name is alien </div> } // ④ props 作为渲染函数
                >
                    { ()=> <div>hello,world</div>  } { /* ⑤render props */ }
                    <ChidrenComponent />             { /* ⑥render component */ }
                </PropsComponent>
            </div>
        }
    }
    ```

    ![image-20220117102325039](https://s2.loli.net/2022/01/17/LNuYkZMmaHFDevI.png)

    props 可以是：

    - ①  props 作为一个子组件渲染数据源。
    - ②  props 作为一个通知父组件的回调函数。
    - ③  props 作为一个单纯的组件传递。
    - ④  props 作为渲染函数。
    - ⑤  render props ， 和④的区别是放在了 children 属性上。
    - ⑥  render component 插槽组件。

    那么如上 props 在组件实例上是什么样子：

    PropsComponent 如果是一个类组件，那么可以直接通过 this.props 访问到它：

    ![image-20220117102357656](https://s2.loli.net/2022/01/17/u5X9W8xTQVhK1zS.png)

    在标签内部的属性和方法会直接绑定在 props 对象的属性上，**对于组件的插槽会被绑定在 props 的 Children 属性中**。

2. **React 如何定义 props**

    - **在 React 组件层级 props 充当的角色**

        一方面父组件 props 可以把数据层传递给子组件去渲染消费。另一方面子组件可以通过 props 中的 callback ，来向父组件传递信息。还有一种可以将视图容器作为 props 进行渲染。

    - **从 React 更新机制中 props 充当的角色**

        在 React 中，props 在组件更新中充当了重要的角色，在 fiber 调和阶段中，diff 可以说是 React 更新的驱动器，熟悉  vue 的同学都知道 vue 中基于响应式，数据的变化，就会颗粒化到组件层级，通知其更新，但是在 React  中，无法直接检测出数据更新波及到的范围，props 可以作为组件是否更新的重要准则，变化即更新，于是有了 PureComponent ，memo 等性能优化方案。

    - **从React插槽层面props充当的角色**

        React 可以把组件的闭合标签里的插槽，转化成 Children 属性

3. **监听props改变**

    - **类组件中**

        componentWillReceiveProps 可以作为监听props的生命周期，但是 React 已经不推荐使用  componentWillReceiveProps ，未来版本可能会被废弃，因为这个生命周期超越了 React  的可控制的范围内，可能引起多次执行等情况发生。于是出现了这个生命周期的替代方案 getDerivedStateFromProps

    - **函数组件中**

        函数组件中同理可以用 useEffect 来作为 props 改变后的监听函数。(不过有一点值得注意, useEffect 初始化会默认执行一次)

        ```js
        React.useEffect(()=>{
            // props 中number 改变，执行这个副作用。
            console.log('props改变：' ，props.number  )
        },[ props.number ])
        ```

4. **props children模式**

    props + children 模式 在 React 中非常常用，尤其对一些优秀开源组件库。比如 react-router 中的 Switch 和  Route ，  antd  中的 Form  和  FormItem。

    1. **props 插槽组件**

        ```jsx
        <Container>
            <Children>
        </Container>
        ```

        上述可以在 Container 组件中，通过 props.children 属性访问到 Children 组件，为 React element 对象。

        作用：

        - 1 可以根据需要控制 Children 是否渲染。
        - 2 像上一节所说的， Container 可以用 React.cloneElement 强化 props (混入新的 props )，或者修改 Children 的子元素。

    2. **render props模式**

        ```jsx
        <Container>
           { (ContainerProps)=> <Children {...ContainerProps}  /> }
        </Container>
        ```

        这种情况，在 Container 中， props.children 属性访问到是函数，并不是 React element 对象，针对这种情况，像下面这种情况下 children 是不能直接渲染的，直接渲染会报错。

        ```jsx
        function  Container(props) {
             return  props.children
        }
        ```

        如果上述直接这么写，会报如下的错误：

        ![image-20220117102854728](https://s2.loli.net/2022/01/17/5OpSzkQKE8GhPgH.png)

        改成如下方式，就可以了:

        ```jsx
        function  Container(props) {
            const  ContainerProps = {
                name: 'alien',
                mes:'let us learn react'
            }
             return  props.children(ContainerProps)
        }
        ```

        这种方式作用是：

        - 1 根据需要控制 Children 渲染与否。
        - 2 可以将需要传给 Children 的 props 直接通过函数参数的方式传递给执行函数 children

    3. **混合模式**

        如果 Container 的 Children  既有函数也有组件，这种情况应该怎么处理呢？

        ```jsx
        <Container>
            <Children />
            { (ContainerProps)=> <Children {...ContainerProps} name={'haha'}  />  }
        </Container>
        ```

        首先在 Container 里打印 Children 看看是什么？

        ```jsx
        const Children = (props)=> (<div>
            <div>hello, my name is {  props.name } </div>
            <div> { props.mes } </div>
        </div>)

        function  Container(props) {
            const ContainerProps = {
                name: 'alien',
                mes:'let us learn react'
            }
             return props.children.map(item=>{
                if(React.isValidElement(item)){ // 判断是 react elment  混入 props
                    return React.cloneElement(item,{ ...ContainerProps },item.props.children)
                }else if(typeof item === 'function'){
                    return item(ContainerProps)
                }else return null
             })
        }

        const Index = ()=>{
            return <Container>
                <Children />
                { (ContainerProps)=> <Children {...ContainerProps} name={'haha'}  />  }
            </Container>
        }
        ```

        这种情况需要先遍历 children ，判断 children 元素类型：

        - 针对 element 节点，通过 cloneElement 混入 props ；

        - 针对函数，直接传递参数，执行函数。



5. **操作 props 小技巧**

    - **抽象 props**

        抽象 props 一般用于跨层级传递 props ，一般不需要具体指出 props 中某个属性，而是将 props 直接传入或者是抽离到子组件中。

    - **混入 props**

        ```jsx
        function Son(props){
            console.log(props)
            return <div> hello,world </div>
        }
        function Father(props){
            const fatherProps={
                mes:'let us learn React !'
            }
            return <Son {...props} { ...fatherProps }  />
        }
        function Index(){
            const indexProps = {
                name:'alien',
                age:'28',
            }
            return <Father { ...indexProps }  />
        }
        ```

        ![prop3.jpg](https://s2.loli.net/2022/01/17/S3XQdkz4HepjlI9.jpg)

    - **抽离props**

        有的时候想要做的恰恰和上面相反，比如想要从父组件 props 中抽离某个属性，再传递给子组件，那么应该怎么做呢？

        ```jsx
        function Son(props){
            console.log(props)
            return <div> hello,world </div>
        }

        function Father(props){
            const { age,...fatherProps  } = props
            return <Son  { ...fatherProps }  />
        }
        function Index(){
            const indexProps = {
                name:'alien',
                age:'28',
                mes:'let us learn React !'
            }
            return <Father { ...indexProps }  />
        }
        ```

        ![prop4.jpg](https://s2.loli.net/2022/01/17/GRDeZAgELJ4b5Pl.jpg)

6. **注入 props**

    - **显示注入 props**

        显式注入 props ，就是能够直观看见标签中绑定的 props 。

        ```jsx
        function Son(props){
             console.log(props) // {name: "alien", age: "28"}
             return <div> hello,world </div>
        }
        function Father(prop){
            return prop.children
        }
        function Index(){
            return <Father>
                <Son  name="alien"  age="28"  />
            </Father>
        }
        ```

    - **隐式注入 props**

        这种方式，一般通过 `React.cloneElement` 对 props.chidren 克隆再混入新的 props 。

        ```jsx
        function Son(props){
             console.log(props) // {name: "alien", age: "28", mes: "let us learn React !"}
             return <div> hello,world </div>
        }
        function Father(prop){
            return React.cloneElement(prop.children,{  mes:'let us learn React !' })
        }
        function Index(){
            return <Father>
                <Son  name="alien"  age="28"  />
            </Father>
        }
        ```

        `React.cloneElements()` 几乎等同于：

        ```jsx
        <element.type {...element.props} {...props}>{children}</element.type>
        ```

        但是，也保留了组件的 `ref`。这意味着当通过 `ref` 获取子节点时，你将不会意外地从你祖先节点上窃取它。相同的 `ref` 将添加到克隆后的新元素中。如果存在新的 `ref` 或 `key` 将覆盖之前的。

### 4.2 进阶实践-实现简单的 `<form> <FormItem>` 嵌套组件

```jsx
import React from "react";
import PropTypes from "prop-types";

const FormDemo = () => {
  const form = React.useRef(null);
  const submit = () => {
    /* 表单提交 */
    form.current.submitForm((formValue) => {
      console.log(formValue);
    });
  };
  const reset = () => {
    /* 表单重置 */
    form.current.resetForm();
  };
  return (
    <div className="box">
      <Form ref={form}>
        <FormItem name="name" label="我是">
          <Input />
        </FormItem>
        <FormItem name="mes" label="我想对大家说">
          <Input />
        </FormItem>
        {/* 自动忽略除 FormItem 之外的元素 */}
        <input placeholder="不需要的input" />
        <Input />
      </Form>
      <div className="btns">
        <button className="searchbtn" onClick={submit}>
          提交
        </button>
        <button className="concellbtn" onClick={reset}>
          重置
        </button>
      </div>
    </div>
  );
};

FormDemo.displayName = "FormDemo";

export default FormDemo;

class Form extends React.Component {
  state = {
    formData: {},
  };
  /* 用于提交表单数据 */
  submitForm = (cb) => {
    cb({ ...this.state.formData });
  };
  /* 获取重置表单数据 */
  resetForm = () => {
    const { formData } = this.state;
    Object.keys(formData).forEach((item) => {
      formData[item] = "";
    });
    this.setState({
      formData,
    });
  };
  /* 设置表单数据层 */
  setValue = (name, value) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
    });
  };
  static propTypes = {
    children: PropTypes.array,
  };
  render() {
    const { children } = this.props;
    const renderChildren = [];
    React.Children.forEach(children, (child) => {
      if (child.type.displayName === "formItem") {
        const { name } = child.props;
        /* 克隆`FormItem`节点，混入改变表单单元项的方法 */
        const Children = React.cloneElement(
          child,
          {
            key: name /* 加入key 提升渲染效果 */,
            handleChange: this.setValue /* 用于改变 value */,
            value: this.state.formData[name] || "" /* value 值 */,
          },
          child.props.children
        );
        renderChildren.push(Children);
      }
    });
    return renderChildren;
  }
}
/* 增加组件类型type  */
Form.displayName = "form";

function FormItem(props) {
  const { children, name, handleChange, value, label } = props;
  const onChange = (value) => {
    /* 通知上一次value 已经改变 */
    handleChange(name, value);
  };
  return (
    <div className="form">
      <span className="label">{label}:</span>
      {React.isValidElement(children) && children.type.displayName === "input"
        ? React.cloneElement(children, { onChange, value })
        : null}
    </div>
  );
}

FormItem.propTypes = {
  children: PropTypes.object,
  name: PropTypes.string,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string,
};

FormItem.displayName = "formItem";

/* Input 组件, 负责回传value值 */
function Input({ onChange, value }) {
  return (
    <input
      className="input"
      onChange={(e) => onChange && onChange(e.target.value)}
      value={value}
    />
  );
}

/* 给Component 增加标签 */
Input.displayName = "input";
Input.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};
```

- 设计思想：

    - 首先考虑到 `<Form>` 在不使用 `forwardRef` 前提下，最好是类组件，因为只有类组件才能获取实例。

    - 创建一个 state 下的 formData属性，用于收集表单状态。

    - 要封装 **重置表单**，**提交表单**，**改变表单单元项**的方法。

    - 要过滤掉除了 `FormItem` 元素之外的其他元素，那么怎么样知道它是不是`FormItem`，这里教大家一种方法，可以给函数组件或者类组件绑定静态属性来证明它的身份，然后在遍历 props.children 的时候就可以在 React element 的 type 属性(类或函数组件本身)上，验证这个身份，在这个  demo 项目，给函数绑定的 displayName 属性，证明组件身份。

    - 要克隆 `FormItem` 节点，将改变表单单元项的方法 handleChange 和表单的值 value 混入 props 中。

- `<FormItem>`

    ```jsx
    function FormItem(props) {
      const { children, name, handleChange, value, label } = props;
      const onChange = (value) => {
        /* 通知上一次value 已经改变 */
        handleChange(name, value);
      };
      return (
        <div className="form">
          <span className="label">{label}:</span>
          {React.isValidElement(children) && children.type.displayName === "input"
            ? React.cloneElement(children, { onChange, value })
            : null}
        </div>
      );
    }

    FormItem.propTypes = {
      children: PropTypes.object,
      name: PropTypes.string,
      handleChange: PropTypes.func,
      value: PropTypes.string,
      label: PropTypes.string,
    };

    FormItem.displayName = "formItem";
    ```

    设计思想：

    - `FormItem`一定要绑定 displayName 属性，用于让 `<Form>` 识别`<FormItem />`
    - 声明 `onChange` 方法，通过 props 提供给`<Input>`，作为改变 value 的回调函数。
    - `FormItem`过滤掉除了 `input` 以外的其他元素。

- `<Input>`

    ```jsx
    /* Input 组件, 负责回传value值 */
    function Input({ onChange, value }) {
      return (
        <input
          className="input"
          onChange={(e) => onChange && onChange(e.target.value)}
          value={value}
        />
      );
    }

    /* 给Component 增加标签 */
    Input.displayName = "input";
    Input.propTypes = {
      onChange: PropTypes.func,
      value: PropTypes.string,
    };
    ```

    设计思想：

    - 绑定 displayName 标识`input`。
    - `input` DOM 元素，绑定 onChange 方法，用于传递 value 。

-

![props](https://s2.loli.net/2022/01/17/tQUvq6LnwDdJy1h.gif)

## 5. lifeCycle

React 类组件为开发者提供了一些生命周期钩子函数，能让开发者在 React 执行的重要阶段，在钩子函数里做一些该做的事。自从 React Hooks 问世以来，函数组件也能优雅地使用 Hooks ，弥补函数组件没有生命周期的缺陷。

### 5.1 类组件生命周期

React 两个重要阶段，

1. **render 阶段** React 在调和( render )阶段会深度遍历 React fiber 树，**目的就是发现不同( diff )**，不同的地方就是接下来需要更新的地方
2. **commit 阶段** 对于变化的组件，就会执行 render  函数。在一次调和过程完毕之后，就到了commit 阶段，**commit 阶段会创建修改真实的 DOM 节点。**

如果在一次调和的过程中，发现了一个 `fiber tag = 1 ` 类组件的情况，就会按照类组件的逻辑来处理。

**对于类组件的处理逻辑，首先判断类组件是否已经被创建过**，首先来看看源码里怎么写的。

```js
// react-reconciler/src/ReactFiberBeginWork.js

/* workloop React 处理类组件的主要功能方法 */
function updateClassComponent(){
    let shouldUpdate
    const instance = workInProgress.stateNode // stateNode 是 fiber 指向 类组件实例的指针
	// instance 为组件实例,如果组件实例不存在，证明该类组件没有被挂载过，那么会走初始化流程
    if (instance === null) {
        constructClassInstance(workInProgress, Component, nextProps); // 组件实例将在这个方法中被new。
        // 初始化挂载组件流程
        mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime );
        shouldUpdate = true; // shouldUpdate 标识用来证明 组件是否需要更新。
    }else{
        shouldUpdate = updateClassInstance(current, workInProgress,
                                           Component, nextProps, renderExpirationTime) // 更新组件流程
    }

    if(shouldUpdate){
        nextChildren = instance.render(); /* 执行render函数 ，得到子节点 */
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime) /* 继续调和子节点 */
    }
}
```

几个重要概念：

- ①   `instance` 类组件对应实例。
- ②   `workInProgress` 树，当前正在调和(render)的 fiber 树 ，一次更新中，React 会自上而下深度遍历子代 fiber ，如果遍历到一个 fiber ，会把当前 fiber 指向 workInProgress。
- ③   `current` 树，在初始化更新中，current = null ，在第一次 fiber 调和之后，会将  workInProgress 树赋值给 current 树。React 来用workInProgress 和 current  来确保一次更新中，快速构建，并且状态不丢失。
- ④   `Component` 就是项目中的 class 组件。
- ⑤   `nextProps` 作为组件在一次更新中新的 props 。
- ⑥   `renderExpirationTime` 作为下一次渲染的过期时间。

在组件实例上可以通过 `_reactInternals` 属性来访问组件对应的 fiber 对象。在 fiber 对象上，可以通过 `stateNode` 来访问当前 fiber 对应的组件实例:

![lifecycle3.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/018a9cbd20df478a955b84beba770674~tplv-k3u1fbpfcp-watermark.awebp)

#### 5.1.1 React 类组件生命周期过程

React 的大部分生命周期的执行，都在 **`mountClassInstance` 和 `updateClassInstance`** 这两个方法中执行

- **初始化阶段**

    1. **`contructor` 执行** -> `constructClassInstance(workInProgress, Component, nextProps)`

        在 mount 阶段，首先执行的 constructClassInstance 函数 ，在实例化组件之后，会调用 mountClassInstance 组件初始化。

        ```jsx
        // react-reconciler/src/ReactFiberClassComponent.js

        function mountClassInstance(workInProgress, ctor, newProps, renderExpirationTime){
            const instance = workInProgress.stateNode;
             /* ctor 就是我们写的类组件，获取类组件的静态方法 */
            const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

            // 存在 getDerivedStateFromProps 生命周期
            if (typeof getDerivedStateFromProps === 'function') {
                /* 这个时候执行 getDerivedStateFromProps 生命周期 ，得到将合并的state */
                const partialState = getDerivedStateFromProps(nextProps, prevState);
                // 合并state
                const memoizedState = partialState === null || partialState === undefined ? prevState :
                					  Object.assign({}, prevState, partialState);

                workInProgress.memoizedState = memoizedState;
                /* 将state 赋值给我们实例上，instance.state  就是我们在组件中 this.state获取的state */
                instance.state = workInProgress.memoizedState;
            }

            // 没有使用 getDerivedStateFromProps getSnapshotBeforeUpdate componentWillMount
            // 执行 componentWillMount
            if(typeof ctor.getDerivedStateFromProps !== 'function' &&
               typeof instance.getSnapshotBeforeUpdate !== 'function' &&
               typeof instance.componentWillMount === 'function' ){
                instance.componentWillMount();
            }
        }
        ```



    2. **`getDerivedStateFromProps` 执行**

        在初始化阶段，`getDerivedStateFromProps` 是第二个执行的生命周期，值得注意的是它是从 ctor 类上**直接绑定的静态方法**，传入 `props ，state`。 返回值将和之前的 state 合并，作为新的 state ，传递给组件实例使用。

    3. ~~**`componentWillMount` 执行**~~

        如果存在 `getDerivedStateFromProps` 和 `getSnapshotBeforeUpdate` 就不会执行生命周期 `componentWillMount`。

    4. **`render` 函数执行**

        到此为止 `mountClassInstance` 函数完成， `updateClassComponent` 函数在执行完 `mountClassInstancec` 后，执行了 render 渲染函数，形成了 children ， 接下来 React 调用 reconcileChildren 方法深度调和 children 。

    5. **`componentDidMount` 执行**

        一旦 React 调和完所有的 fiber 节点，就会到 commit 阶段，在组件初始化 commit 阶段，会调用 `componentDidMount` 生命周期。

        ```jsx
        // react-reconciler/src/ReactFiberCommitWork.js

        function commitLifeCycles(finishedRoot,current,finishedWork){
            switch (finishedWork.tag) {       /* fiber tag 在第一节讲了不同fiber类型 */
                case ClassComponent: {                              /* 如果是 类组件 类型 */
                    const instance = finishedWork.stateNode        /* 类实例 */
                    if(current === null) {                          /* 类组件第一次调和渲染 */
                        instance.componentDidMount()
                    } else {                                         /* 类组件更新 */
                        instance.componentDidUpdate(prevProps,prevState，
                                                    instance.__reactInternalSnapshotBeforeUpdate);
                    }
                }
            }
        }
        ```

        执行顺序：`constructor -> getDerivedStateFromProps / componentWillMount -> render -> componentDidMount`

        ![lifesycle4.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9838872f404c474b87612400c3a6c504~tplv-k3u1fbpfcp-watermark.awebp)

- **更新阶段**

    最开始 `updateClassComponent` 函数了，当发现 current 不为 null 的情况时，说明该类组件被挂载过，那么直接按照更新逻辑来处理

    ```jsx
    function updateClassInstance(current, workInProgress, ctor, newProps, renderExpirationTime){
        const instance = workInProgress.stateNode; // 类组件实例

        // 判断是否具有 getDerivedStateFromProps 生命周期
        const hasNewLifecycles =  typeof ctor.getDerivedStateFromProps === 'function'

        // 当没有 getDerivedStateFromProps 但是有生命周期 componentWillReceiveProps
        if(!hasNewLifecycles && typeof instance.componentWillReceiveProps === 'function' ){
            if (oldProps !== newProps || oldContext !== nextContext) {     // 浅比较 props 不相等
                // 执行生命周期 componentWillReceiveProps
                instance.componentWillReceiveProps(newProps, nextContext);
            }
        }

        let newState = (instance.state = oldState);

        // 具有生命周期 getDerivedStateFromProps
        if (typeof getDerivedStateFromProps === 'function') {
            /* 执行生命周期getDerivedStateFromProps  ，逻辑和mounted类似 ，合并state  */
            ctor.getDerivedStateFromProps(nextProps,prevState)
            // newState 传递给了 shouldComponentUpdate
            newState = workInProgress.memoizedState;
        }

        let shouldUpdate = true

         /* 执行生命周期 shouldComponentUpdate 返回值决定是否执行render ，调和子节点 */
        if(typeof instance.shouldComponentUpdate === 'function' ){
            shouldUpdate = instance.shouldComponentUpdate(newProps, newState, nextContext);
        }

        if(shouldUpdate){
            if (typeof instance.componentWillUpdate === 'function') {
                instance.componentWillUpdate(); /* 执行生命周期 componentWillUpdate  */
            }
        }

        return shouldUpdate
    }
    ```

    1. **`componentWillRecieveProps` 执行**

        首先判断 `getDerivedStateFromProps` 生命周期是否存在，如果不存在就执行`componentWillReceiveProps`生命周期。传入该生命周期两个参数，分别是 newProps 和 nextContext 。

    2. **`getDerivedStateFromProps` 执行**

        接下来执行生命周期 `getDerivedStateFromProps`， 返回的值用于合并state，生成新的state

    3. **`shouldComponentUpdate` 执行**

        接下来执行生命周期 `shouldComponentUpdate`，传入新的 props ，新的 state ，和新的 context ，返回值决定是否继续执行 render 函数，调和子节点。这里应该注意一个问题，`getDerivedStateFromProps` 的返回值可以作为新的 state ，传递给 shouldComponentUpdate

    4. **`componentWillUpdate` 执行**

        接下来执行生命周期 `componentWillUpdate`。updateClassInstance 方法到此执行完毕了

    5. **执行 `render` 函数**

        接下来会执行 render 函数，得到最新的 React element 元素。然后继续调和子节点

    6. **执行 `getSnapshotBeforeUpdate`**

        ```jsx
        // react-reconciler/src/ReactFiberCommitWork.js

        function commitBeforeMutationLifeCycles(current, finishedWork){
            switch (finishedWork.tag) {
                case ClassComponent:{
                    /* 执行生命周期 getSnapshotBeforeUpdate   */
                    const snapshot = instance.getSnapshotBeforeUpdate(prevProps,prevState)
                     /* 返回值将作为 __reactInternalSnapshotBeforeUpdate
                     传递给 componentDidUpdate 生命周期  */

                    instance.__reactInternalSnapshotBeforeUpdate = snapshot;
                }
            }
        }
        ```

        `getSnapshotBeforeUpdate` 的执行也是在 commit 阶段，commit 阶段细分为 `before Mutation`( DOM 修改前)，`Mutation` ( DOM 修改)，`Layout`( DOM 修改后) 三个阶段，getSnapshotBeforeUpdate 发生在`before Mutation` 阶段，生命周期的返回值，将作为第三个参数 __reactInternalSnapshotBeforeUpdate 传递给 componentDidUpdate

    7. **执行 `componentDidUpdate`**

        接下来执行生命周期 componentDidUpdate ，此时 DOM 已经修改完成。可以操作修改之后的 DOM 。到此为止更新阶段的生命周期执行完毕。

        ![lifecycle5.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de17c24547b040b9a93b01706d9e585b~tplv-k3u1fbpfcp-watermark.awebp)

        更新阶段对应的生命周期的执行顺序：

        componentWillReceiveProps( props 改变) / **getDerivedStateFromProp** ->  shouldComponentUpdate -> componentWillUpdate -> render  ->  getSnapshotBeforeUpdate ->  componentDidUpdate

- **销毁阶段**

    ```jsx
    // react-reconciler/src/ReactFiberCommitWork.js

    function callComponentWillUnmountWithTimer(){
        instance.componentWillUnmount();
    }
    ```

    1. **执行 `componentWillUmount`**

        销毁阶段就比较简单了，在一次调和更新中，如果发现元素被移除，就会打对应的 Deletion 标签 ，然后在 commit 阶段就会调用 `componentWillUnmount` 生命周期，接下来统一卸载组件以及 DOM 元素。

        ![lifecycle6.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37d76e8437764f2fb605c03332d5fb0f~tplv-k3u1fbpfcp-watermark.awebp)

三个阶段生命周期+无状态组件总览图：

![lifesycyle8.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7066da719fda4a91aa2c432f60c58a48~tplv-k3u1fbpfcp-watermark.awebp)

#### 5.1.2 React 类组件各生命周期能做什么

1. **`constructor(props)`**

    constructor 在类组件创建实例时调用，而且初始化的时候执行一次，所以可以在 constructor 做一些初始化的工作。

    - **初始化 state** ，比如可以用来截取路由中的参数，赋值给 state 。
    - 对类组件的事件做一些处理，比如 **绑定 this ， 节流，防抖**等。
    - **对类组件进行一些必要生命周期的劫持，渲染劫持**，这个功能更适合反向继承的 高阶组件HOC

    ```jsx
    constructor(props){
        super(props)        // 执行 super ，别忘了传递props,才能在接下来的上下文中，获取到props。
        this.state = {       // ① 可以用来初始化state，比如可以用来获取路由中的
            name:'alien'
        }
        this.handleClick = this.handleClick.bind(this) /* ② 绑定 this */
        this.handleInputChange = debounce(this.handleInputChange , 500) /* ③ 绑定防抖函数，防抖 500 毫秒 */
        const _render = this.render
        this.render = function(){
            return _render.bind(this)  /* ④ 劫持修改类组件上的一些生命周期 */
        }
    }
    /* 点击事件 */
    handleClick(){ /* ... */ }
    /* 表单输入 */
    handleInputChange(){ /* ... */ }
    ```



2. **`getDerivedStateFromProp(nextProps, prevState)`**

    `getDerivedStateFromProps` 方法作为类的静态属性方法执行，内部是访问不到 `this` 的，它更趋向于纯函数，取缔 `componentWillMount` 和 `componentWillReceiveProps` 。

    这个生命周期用于，在初始化和更新阶段，接受父组件的 props 数据， **可以对 props 进行格式化，过滤等操作，返回值将作为新的 state 合并到 state 中，供给视图渲染层消费。**

    getDerivedStateFromProps 作用：

    - 代替 `componentWillMount` 和 `componentWillReceiveProps`
    - **组件初始化或者更新时，将 props 映射到 state。**
    - 返回值与 state 合并完，可以作为 shouldComponentUpdate 第二个参数  newState  ，可以判断是否渲染组件。(请不要把 getDerivedStateFromProps 和 shouldComponentUpdate  强行关联到一起，两者没有必然联系)

    ```jsx
    static getDerivedStateFromProps(newProps){
        const { type } = newProps
        switch(type){
            case 'fruit' :
                 /* ① 接受 props 变化 ， 返回值将作为新的 state ，用于 渲染 或 传递给s houldComponentUpdate */
                return { list:['苹果','香蕉','葡萄' ] }
            case 'vegetables':
                return { list:['菠菜','西红柿','土豆']}
        }
    }
    render(){
        return <div>{ this.state.list.map((item)=><li key={item} >{ item  }</li>) }</div>
    }
    ```

    **只要组件更新，就会执行 `getDerivedStateFromProps`**，不管是 props 改变，还是 setState ，或是 forceUpdate

3. **`UNSAFE_componentWillMount`**

    在 React V16.3 componentWillMount ，componentWillReceiveProps ， componentWillUpdate 三个生命周期加上了不安全的标识符 `UNSAFE`，变成了如下形式:

    - UNSAFE_componentWillMount
    - UNSAFE_componentWillReceiveProps
    - UNSAFE_componentWillUpdate

    这三个生命周期，都是在 render 之前执行的，React 对于执行 render 函数有着像 shouldUpdate  等条件制约，但是**对于执行在 render 之前生命周期没有限制，存在一定隐匿风险**，如果 updateClassInstance  执行多次，React 开发者滥用这几个生命周期，可能导致生命周期内的上下文多次被执行。

4. **`UNSAFE_componentWillRecieveProps`**

    UNSAFE_componentWillReceiveProps 函数的执行是在更新组件阶段，该生命周期执行驱动是因为父组件更新带来的  props 修改，**但是只要父组件触发 render 函数，调用 React.createElement 方法，那么 props  就会被重新创建，生命周期 componentWillReceiveProps 就会执行了。这就解释了即使 props 没变，该生命周期也会执行。**

    **作用：**

    - **componentWillReceiveProps 可以用来监听父组件是否执行 render 。**
    - componentWillReceiveProps 可以用来接受 props 改变，组件可以根据props改变，来决定是否更新  state ，因为可以访问到 this ， 所以可以在异步成功回调(接口请求数据)改变 state 。这个是  getDerivedStateFromProps  不能实现的。

5. **`UNSAFE_componentWillUpdate`**

    `UNSAFE_componentWillUpdate` 可以意味着在更新之前，此时的 DOM 还没有更新（render 之前）。在这里可以做一些获取 DOM  的操作。就比如说在一次更新中，**保存 DOM 之前的信息**(记录上一次位置)。但是 React 已经出了新的生命周期  getSnapshotBeforeUpdate (render 之后) 来代替 UNSAFE_componentWillUpdate。

6. **`render`**

    一次 render 的过程，就是创建 React.element 元素的过程, 那么可以在render里面做一些, **createElement创建元素** , **cloneElement 克隆元素** ，**React.children 遍历 children** 的操作

7. **`getSnapshotBeforeUpdate(prevProps, preState)`**

    **获取更新前的快照**，可以进一步理解为 获取更新前 DOM 的状态。

    该生命周期是在 commit 阶段的 before Mutation ( DOM 修改前)，此时 DOM 还没有更新，但是在接下来的  Mutation 阶段会被替换成真实 DOM 。此时是获取 DOM 信息的最佳时期，getSnapshotBeforeUpdate  将返回一个值作为一个 `snapShot`(快照)，传递给 componentDidUpdate作为第三个参数。

    ```jsx
    getSnapshotBeforeUpdate(prevProps,preState){
        const style = getComputedStyle(this.node)
        return { /* 传递更新前的元素位置 */
            cx:style.cx,
            cy:style.cy
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        /* 获取元素绘制之前的位置 */
        console.log(snapshot)
    }
    ```

    当然这个快照 `snapShot` 不限于 DOM 的信息，也可以是根据 DOM 计算出来产物

    **getSnapshotBeforeUpdate 这个生命周期意义就是配合 componentDidUpdate 一起使用，计算形成一个 snapShot 传递给 componentDidUpdate 。保存一次更新前的信息。**

8. **`componentDidUpdate(prevProps, prevState, snapshot)`**

    ```jsx
    componentDidUpdate(prevProps, prevState, snapshot){
        const style = getComputedStyle(this.node)
        const newPosition = { /* 获取元素最新位置信息 */
            cx:style.cx,
            cy:style.cy
        }
    }
    ```

    三个参数：

    - prevProps 更新之前的 props ；
    - prevState 更新之前的 state ；
    - snapshot 为 getSnapshotBeforeUpdate 返回的快照，可以是更新前的 DOM 信息。

    **作用**

    - componentDidUpdate 生命周期执行，此时 DOM 已经更新，可以直接获取 DOM 最新状态。**这个函数里面如果想要使用 setState ，一定要加以限制，否则会引起无限循环。**
    - **接受 getSnapshotBeforeUpdate 保存的快照 snapshot 信息**。

9. **`componentDidMount`**

    componentDidMount 生命周期执行时机和 componentDidUpdate 一样，一个是在**初始化**，一个是**组件更新**。此时 DOM 已经创建完，既然 DOM 已经创建挂载，就可以做一些基于 DOM 操作，DOM 事件监听器。

    ```jsx
    async componentDidMount(){
        this.node.addEventListener('click',()=>{
            /* 事件监听 */
        })
        const data = await this.getData() /* 数据请求 */
    }
    ```

    作用：

    - 可以做一些关于 DOM 操作，比如基于 DOM 的事件监听器。
    - **对于初始化向服务器请求数据**，渲染视图，这个生命周期也是蛮合适的

10. **`shouldComponentUpdate`**

    ```jsx
    shouldComponentUpdate(newProps,newState,nextContext){}
    ```

    shouldComponentUpdate 三个参数:

    - 第一个参数新的 props
    - 第二个参数新的 state
    - 第三个参数新的 context

    ```js
    shouldComponentUpdate(newProps,newState){
        if(newProps.a !== this.props.a ){ /* props中a属性发生变化 渲染组件 */
            return true
        } else if(newState.b !== this.props.b){ /* state 中b属性发生变化 渲染组件 */
            return true
        }else{ /* 否则组件不渲染 */
            return false
        }
    }
    ```

    这个生命周期，**一般用于性能优化**，shouldComponentUpdate **返回值决定是否重新渲染的类组件**。需要重点关注的是第二个参数  newState ，如果有 getDerivedStateFromProps 生命周期 ，它的返回值将合并到 newState ，供  shouldComponentUpdate 使用。

11. **`componentWillUnmount`**

    **componentWillUnmount 是组件销毁阶段唯一执行的生命周期**，主要做一些收尾工作，比如清除一些可能造成内存泄漏的定时器，延时器，或者是一些事件监听器。

    ```jsx
    componentWillUnmount(){
        clearTimeout(this.timer)  /* 清除延时器 */
        this.node.removeEventListener('click',this.handerClick) /* 卸载事件监听器 */
    }
    ```

    作用

    - 清除延时器，定时器。
    - 一些基于 DOM 的操作，比如事件监听器。

### 5.2 函数组件生命周期替代方案

React hooks也提供了 api ，用于弥补函数组件没有生命周期的缺陷。其原理主要是运用了 hooks 里面的 `useEffect` 和 `useLayoutEffect`。

1. **`useEffect` 和 `useLayoutEffect`**

    - **`useEffect`**

        ```jsx
        useEffect(()=>{
            return destory
        },dep)
        ```

        useEffect 第一个参数 callback, 返回的 destory ， destory 作为下一次callback执行之前调用，用于清除上一次 callback 产生的副作用。

        第二个参数作为依赖项，是一个数组，可以有多个依赖项，依赖项改变，执行上一次callback 返回的 destory ，和执行新的 effect 第一个参数 callback 。

        传给 `useEffect` 的函数会在浏览器完成布局与绘制 **之后**，在一个延迟事件中被调用。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因为绝大多数操作不应阻塞浏览器对屏幕的更新。

        对于 useEffect 执行， React 处理逻辑是采用 **异步调用** ，对于每一个 effect 的 callback， React 会向 `setTimeout` 回调函数一样，**放入任务队列**，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。**所以 effect 回调函数不会阻塞浏览器绘制视图**

    - **`useLayoutEffect`**

        useLayoutEffect 和 useEffect 不同的地方是采用了 **同步执行** ，与 useEffect 的区别在于：

        - 首先 useLayoutEffect 是在DOM **绘制之前**，这样可以方便修改 DOM ，这样浏览器只会绘制一次，如果修改 DOM 布局放在  useEffect ，那 **useEffect 执行是在浏览器绘制视图之后，接下来又改 DOM  ，就可能会导致浏览器再次回流和重绘**。而且由于两次绘制，视图上可能会造成闪现突兀的效果
        - useLayoutEffect callback **中代码执行会阻塞浏览器绘制**

    - **一句话概括如何选择 useEffect 和 useLayoutEffect ：修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 。**

    - React.useEffect 回调函数 和 componentDidMount / componentDidUpdate 执行时机的区别：

        useEffect 对 React 执行栈来看是**异步**执行的，而 componentDidMount / componentDidUpdate  是**同步**执行的，useEffect代码不会阻塞浏览器绘制。在时机上 ，**componentDidMount / componentDidUpdate 和 useLayoutEffect 更类似**

2. **`componentDidMount` 替代方案**

    ```jsx
    // componentDidMount 替代方案
      useEffect(() => {
        // 请求数据 事件监听 操纵dom
      }, []);
    ```

    这里要记住 **`dep = []`** ，这样当前 effect 没有任何依赖项，也就只有初始化执行一次

3. **`componentWillUmount` 替代方案**

    ```jsx
    // componentWillUnmount 替代方案
    useEffect(() => {
        // 请求数据 事件监听 操纵dom 添加定时器、掩饰其
        return function componentWillUnmount() {
            // 解除事件监听 清楚定时器、延时器
        };
    }, []); // dep=[]
    ```

    在 componentDidMount 的前提下，useEffect 第一个函数的返回函数，可以作为 componentWillUnmount 使用。

4. **`componentWillReceiveProps` 代替方案**

    **useEffect 代替 componentWillReceiveProps 比较牵强**：

    - **首先因为二者的执行阶段根本不同，一个是在render阶段，一个是在commit阶段**
    - 其次 **useEffect 会初始化执行一次**，但是 componentWillReceiveProps 只有组件更新 props 变化的时候才会执行

    ```jsx
    // componentWillReceiveProps 代替方案
    useEffect(() => {
        console.log("props变化: componentWillReceiveProps");
    }, [props]);
    ```

    此时依赖项就是 props，props 变化，执行此时的 useEffect 钩子。

    ```jsx
    useEffect(() => {
        console.log("props.number变化: componentWillReceiveProps");
    }, [props.number]);
    ```

    useEffect 还可以针对 props 的某一个属性进行追踪。此时的依赖项为 props 的追踪属性。如上述代码，只有 props 中 number 变化，执行 effect

5. **`componentDidUpdate` 替代方案**

    useEffect 和 componentDidUpdate 在执行时期虽然有点差别，useEffect  是异步执行，componentDidUpdate 是同步执行 ，但都是在 commit 阶段 。但是向上面所说 useEffect  会默认执行一次，而 componentDidUpdate 只有在组件更新完成后执行。

    ```jsx
    // componentDidUpdate 替代方案
    useEffect(() => {
        console.log("组件更新完成: componentDidUpdate");
    }); // 没有 dep 依赖项
    ```

    **注意此时useEffect没有第二个参数**。

    没有第二个参数，那么每一次执行函数组件，都会执行该 effect。



## 6. 多功能 Ref

### 6.1 ref 的基本概念和使用

 Ref 除了 **获取真实 DOM 元素和获取类组件实例层面上** 这两项功能之外，在使用上还有很多小技巧

#### 6.1.1 **Ref 对象的创建**

所谓 ref 对象就是用 `createRef` 或者 `useRef` 创建出来的对象，一个标准的 ref 对象应该是如下的样子：

```js
{
    current:null , // current指向ref对象获取到的实际内容，可以是dom元素，组件实例，或者其他。
}
```

当 ref 被传递给 `render` 中的元素时，对该节点的引用可以在 ref 的 `current` 属性中被访问。

```js
const node = this.myRef.current;
```

ref 的值根据节点的类型而有所不同：

- 当 `ref` 属性用于 HTML 元素时，构造函数中使用 `React.createRef()` 创建的 `ref` 接收底层 DOM 元素作为其 `current` 属性。
- 当 `ref` 属性用于自定义 class 组件时，`ref` 对象接收组件的挂载实例作为其 `current` 属性。
- **不能在函数组件上使用 `ref` 属性**，因为他们没有实例。

React 提供两种方法创建 Ref 对象，

1. **类组件React.createRef**

    ```js
    class ClassComponent extends Component {
      constructor(props) {
        super(props);
        this.currentDom = React.createRef(null);
      }
      componentDidMount() {
        console.log("ClassComponent this.currentDom:", this.currentDom);
        console.log("ClassComponent: ", this);
      }
      render() {
        return <div ref={this.currentDom}>ClassComponent</div>;
      }
    }
    ```

    ![image-20220302101243856](https://s2.loli.net/2022/03/02/dXQBAhgrTMPz4i1.png)

    React.createRef 的底层逻辑很简单:

    ```js
    export function createRef() {
      const refObject = {
        current: null,
      }
      return refObject;
    }
    ```

    createRef 只做了一件事，就是创建了一个对象，对象上的 current 属性，用于保存通过 ref 获取的 DOM  元素，组件实例等。 createRef 一般用于类组件创建 Ref 对象，可以将 Ref 对象绑定在类组件实例上，这样更方便后续操作 Ref。

    > **注意：不要在函数组件中使用 createRef，否则会造成 Ref 对象内容丢失等情况**

2. **函数组件 useRef**

    ```js
    function FuncComponent() {
      const currentDom = React.useRef(null);
      useEffect(() => {
        console.log("FuncComponent currentDom:", currentDom);
      });

      return <div ref={currentDom}>FuncComponent</div>;
    }
    ```

    ![image-20220302101411955](https://s2.loli.net/2022/03/02/nY9OEUqMdS3T2bL.png)

    useRef 底层逻辑是和 createRef 差不多，就是 **ref 保存位置不相同**

    - 类组件有一个实例 instance 能够维护像 ref  这种信息，
    - 但是由于函数组件每次更新都是一次新的开始，所有变量重新声明，所以 useRef 不能像 createRef 把 ref  对象直接暴露出去，如果这样每一次函数组件执行就会重新声明 Ref，此时 ref 就会随着函数组件执行被重置，这就解释了在函数组件中为什么不能用  createRef 的原因。

    为了解决这个问题，hooks 和函数组件对应的 fiber 对象建立起关联，**将 useRef 产生的 ref 对象挂到函数组件对应的 fiber 上**，函数组件每次执行，只要组件不被销毁，函数组件对应的 fiber 对象一直存在，所以 ref 等信息就会被保存下来。

#### 6.1.2 **React 对 Ref 属性的处理-标记 ref**

首先明确一个问题是 **DOM 元素**和**组件实例** 必须用 ref 对象获取吗？答案是否定的，React 类组件提供了多种方法获取 **DOM 元素**和**组件实例**，说白了就是 React 对标签里面 ref 属性的处理逻辑多样化。

- **类组件获取 Ref 三种方式**

    1. **Ref属性是一个字符串** (已废弃)

        ```js
        class Children extends Component {
          render = () => <div>hello,world</div>;
        }

        export class ClassComponent extends Component {
          constructor(props) {
            super(props);
            this.currentDom = React.createRef(null);
          }
          componentDidMount() {
            console.log("ClassComponent this.currentDom:", this.currentDom);
            console.log("ClassComponent: ", this);
          }

          // 使用字符串 ref 属性被废弃
          render = () => (
            <div>
              <div ref="currentDom">字符串模式获取元素或组件</div>
              <Children ref="currentComInstance" />
            </div>
          );
        }
        ```

        ![image-20220302101748508](https://s2.loli.net/2022/03/02/Rub7PFsNGYj2iqU.png)

        如上面代码片段，用一个字符串 ref 标记一个 DOM 元素，一个类组件(函数组件没有实例，不能被 Ref 标记)。React  在底层逻辑，会判断类型，如果是 DOM 元素，会把真实 DOM 绑定在组件 this.refs (组件实例下的 refs  )属性上，如果是类组件，会把子组件的实例绑定在 this.refs 上。

    2. **Ref 属性是一个函数。**

        ```js
        class Children extends Component {
          render = () => <div>hello,world</div>;
        }

        export class ClassComponent extends Component {
          constructor(props) {
            super(props);
            this.currentDom = React.createRef(null);
          }
          componentDidMount() {
            console.log("ClassComponent this.currentDom:", this.currentDom);
            console.log("ClassComponent: ", this);
          }

          // 2. Ref 属性是一个函数
          render = () => (
            <div>
              <div ref={(node) => (this.currentDom = node)}>Ref模式获取元素或组件</div>
              <Children ref={(node) => (this.currentComponentInstance = node)} />
            </div>
          );
        }
        ```

        ![image-20220302102155650](https://s2.loli.net/2022/03/02/K76uR19NqgmXbj8.png)

        如上代码片段，当用一个函数来标记 Ref 的时候，将作为 callback 形式，等到真实 DOM 创建阶段，执行 callback ，获取的 DOM 元素或组件实例，将以回调函数第一个参数形式传入，所以可以像上述代码片段中，用组件实例下的属性 `currentDom`和 `currentComponentInstance` 来接收真实 DOM 和组件实例。

        > 这里的 `this.refs` 为一个空对象

    3. **Ref 属性是一个ref对象** 即上面使用 `React.createRef()` 创建

### 6.2 ref 高阶用法

#### 6.2.1 forwardRef 转发 Ref

forwardRef 的初衷就是解决 ref 不能跨层级捕获和传递的问题。 forwardRef 接受了父级元素标记的 ref 信息，并把它转发下去，使得子组件可以通过 props 来接受到上一层级或者是更上层级的ref。

1. **场景一：跨层级获取**

    比如想要通过标记子组件 ref ，来获取孙组件的某一 DOM 元素，或者是组件实例。

    > 场景：想要在 GrandFather 组件通过标记 ref ，来获取孙组件 Son 的组件实例。

    ```js
    // 孙组件
    function Son(props) {
      const { grandRef } = props;
      return (
        <div>
          <div> i am alien </div>
          <span ref={grandRef}>这个是想要获取元素</span>
        </div>
      );
    }

    // 父组件
    class Father extends React.Component {
      constructor(props) {
        super(props);
      }
      render() {
        return (
          <div>
            <Son grandRef={this.props.grandRef} />
          </div>
        );
      }
    }

    const NewFather = React.forwardRef((props, ref) => (
      <Father grandRef={ref} {...props} />
    ));

    // 爷组件
    export class GrandFather extends React.Component {
      constructor(props) {
        super(props);
        this.grandSonDom = React.createRef(null);
      }
      node = null;
      componentDidMount() {
        console.log("GrandFather: ", this.node); // span #text 这个是想要获取元素
        console.log("GrandFather's grandSomDom: ", this.grandSonDom); // span #text 这个是想要获取元素
      }
      render() {
        return (
          <div>
            <NewFather ref={(node) => (this.node = node)} />
            <NewFather ref={this.grandSonDom} />
          </div>
        );
      }
    }
    ```

    ![image-20220302103403898](https://s2.loli.net/2022/03/02/LczUy9Vf37TFDSk.png)

    ```js
    const NewFather = React.forwardRef((props, ref) => (
      <Father grandRef={ref} {...props} />
    ));
    ```

    forwardRef 把 ref 变成了可以通过 props 传递和转发

    如果不添加 `forward` 转发，那么 `ref` 将会直接指向 Father 组件

    如果直接使用一个 `grandRef` 的 `props` 也能实现

    ```jsx
    <FatherB grandRef={this.grandSon} />
    ```



2. **场景二：合并转发 ref**

    通过 forwardRef 转发的 ref 不要理解为只能用来直接获取组件实例，DOM 元素，也可以用来传递合并之后的自定义的 ref

    > 场景：想通过Home绑定ref，来获取子组件Index的实例index，dom元素button，以及孙组件Form的实例

    ```js
    // 表单组件
    class Form extends React.Component {
      render() {
        return <div>...</div>;
      }
    }
    // index 组件
    class Index extends React.Component {
      componentDidMount() {
        const { forwardRef } = this.props;
        forwardRef.current = {
          form: this.form, // 给form组件实例 ，绑定给 ref form属性
          index: this, // 给index组件实例 ，绑定给 ref index属性
          button: this.button, // 给button dom 元素，绑定给 ref button属性
        };
      }
      form = null;
      button = null;
      render() {
        return (
          <div>
            <button ref={(button) => (this.button = button)}>点击</button>
            <Form ref={(form) => (this.form = form)} />
          </div>
        );
      }
    }
    const ForwardRefIndex = React.forwardRef((props, ref) => (
      <Index {...props} forwardRef={ref} />
    ));
    // home 组件
    export function Home() {
      const ref = useRef(null);
      useEffect(() => {
        console.log(ref.current);
      }, []);
      return <ForwardRefIndex ref={ref} />;
    }
    ```

    ![image-20220302104721826](https://s2.loli.net/2022/03/02/lcH9VsXkf3NuGpg.png)

    如上代码所示，流程主要分为几个方面：

    - 1 通过 useRef 创建一个 ref 对象，通过 forwardRef 将当前 ref 对象传递给子组件。
    - 2 向 Home 组件传递的 ref 对象上，绑定 form 孙组件实例，index 子组件实例，和 button DOM 元素。

    `forwardRef` 让 ref 可以通过 props 传递，那么如果用 **ref 对象**标记的 ref ，那么 ref 对象就可以通过 props 的形式，提供给子孙组件消费，当然子孙组件也可以改变 ref  对象里面的属性，或者像如上代码中赋予新的属性，这种 forwardref  +  ref 模式一定程度上打破了 React  单向数据流动的原则。当然绑定在 ref 对象上的属性，不限于组件实例或者 DOM 元素，也可以是属性值或方法。

3. **场景三：高阶组件转发**

    如果通过高阶组件包裹一个原始类组件，就会产生一个问题，如果高阶组件 HOC 没有处理 ref ，那么由于高阶组件本身会返回一个新组件，所以当使用 HOC 包装后组件的时候，标记的 ref 会指向 HOC 返回的组件，而并不是 HOC  包裹的原始类组件，为了解决这个问题，forwardRef 可以对 HOC 做一层处理。

    ```js
    function HOC(Component) {
      class Wrap extends React.Component {
        render() {
          const { forwardedRef, ...otherprops } = this.props;
          return <Component ref={forwardedRef} {...otherprops} />;
        }
      }
      return React.forwardRef((props, ref) => (
        <Wrap forwardedRef={ref} {...props} />
      ));
    }

    class IIndex extends React.Component {
      render() {
        return <div>hello,world</div>;
      }
    }
    const HocIndex = HOC(IIndex);
    export function HOCForward() {
      const node = useRef(null);
      useEffect(() => {
        console.log("高阶组件转发:", node);
      }, []);
      return <HocIndex ref={node} />;
    }
    ```

    ![image-20220302110955518](https://s2.loli.net/2022/03/02/ZTzs7BvlSEKxyjP.png)

    经过 forwardRef 处理后的 HOC ，就可以正常访问到 Index 组件实例了

    > 和跨层级转发相似



#### 6.2.2 ref 实现组件通信

如果有种场景不想通过父组件 render 改变 props 的方式，来触发子组件的更新，也就是子组件通过 state 单独管理数据层，针对这种情况父组件可以通过 ref 模式标记子组件实例，从而操纵子组件方法，这种情况通常发生在一些 **数据层托管** 的组件上，比如 `<Form/>` 表单，经典案例可以参考 antd 里面的 form 表单，暴露出对外的 `resetFields` ， `setFieldsValue` 等接口，可以通过表单实例调用这些 API 。

1. **类组件 ref 相互通信**

    对于类组件可以通过 ref 直接获取组件实例，实现组件通信。

    ```js
    /* 子组件 */
    class SonCC extends React.PureComponent {
      state = {
        fatherMes: "",
        sonMes: "",
      };
      fatherSay = (fatherMes) =>
        this.setState({ fatherMes }); /* 提供给父组件的API */
      render() {
        const { fatherMes, sonMes } = this.state;
        return (
          <div className="sonbox">
            <div className="title">子组件</div>
            <p>父组件对我说：{fatherMes}</p>
            <div className="label">对父组件说</div>{" "}
            <input
              onChange={(e) => this.setState({ sonMes: e.target.value })}
              className="input"
            />
            <button
              className="searchbtn"
              onClick={() => this.props.toFather(sonMes)}
            >
              to father
            </button>
          </div>
        );
      }
    }
    /* 父组件 */
    export function FatherCC() {
      const [sonMes, setSonMes] = React.useState("");
      const sonInstance = React.useRef(null); /* 用来获取子组件实例 */
      const [fatherMes, setFatherMes] = React.useState("");
      const toSon = () =>
        sonInstance.current.fatherSay(
          fatherMes
        ); /* 调用子组件实例方法，改变子组件state */
      return (
        <div className="box">
          <div className="title">父组件</div>
          <p>子组件对我说：{sonMes}</p>
          <div className="label">对子组件说</div>{" "}
          <input onChange={(e) => setFatherMes(e.target.value)} className="input" />
          <button className="searchbtn" onClick={toSon}>
            to son
          </button>
          <SonCC ref={sonInstance} toFather={setSonMes} />
        </div>
      );
    }
    ```

    ![image-20220302113005149](https://s2.loli.net/2022/03/02/h3GupMvqt4ZXD6r.png)

2. **函数组件 forwardRef + useImperativeHandle 通信**

    对于函数组件，本身是没有实例的，但是 React Hooks 提供了，useImperativeHandle 一方面第一个参数接受父组件传递的  ref 对象，另一方面第二个参数是一个函数，函数返回值，作为 ref 对象获取的内容。一起看一下 useImperativeHandle  的基本使用。

    useImperativeHandle 接受三个参数：

    - 第一个参数 ref : 接受 forWardRef 传递过来的 ref 。
    - 第二个参数 createHandle ：处理函数，返回值作为暴露给父组件的 ref 对象。
    - 第三个参数 deps :依赖项 deps，依赖项更改形成新的 ref 对象。

    forwardRef + useImperativeHandle 可以完全让函数组件也能流畅的使用 Ref 通信。其原理图如下所示：

    ![ref6.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59238390306849e89069e6a4bb6ded9d~tplv-k3u1fbpfcp-watermark.awebp)

    ```js
    function SonFC(props, ref) {
      const inputRef = useRef(null);
      const [inputValue, setInputValue] = useState("");
      useImperativeHandle(
        ref,
        () => {
          const handleRefs = {
            onFocus() {
              /* 声明方法用于聚焦input框 */
              inputRef.current.focus();
            },
            onChangeValue(value) {
              /* 声明方法用于改变input的值 */
              setInputValue(value);
            },
          };
          return handleRefs;
        },
        []
      );
      return (
        <div>
          <input placeholder="请输入内容" ref={inputRef} value={inputValue} />
        </div>
      );
    }

    const ForwardSonFC = React.forwardRef(SonFC);

    export class ForwardSonFCContainer extends Component {
      cur = null;
      handleClick = () => {
        const { onFocus, onChangeValue } = this.cur;
        onFocus();
        onChangeValue("lets learn react");
      };
      render() {
        return (
          <div style={{ marginTop: "50px" }}>
            <ForwardSonFC ref={(cur) => (this.cur = cur)} />
            <button onClick={this.handleClick}>操控子组件</button>
          </div>
        );
      }
    }
    ```

    ![useImperativeHandle](https://s2.loli.net/2022/03/03/Eh2yOpjXMoK31Ia.gif)

    流程分析：

    - 父组件用 ref 标记子组件，由于子组件 SonFC 是函数组件没有实例，所以用 forwardRef 转发 ref。
    - 子组件 Son 用 useImperativeHandle 接收父组件 ref，将让 input 聚焦的方法 onFocus 和 改变 input 输入框的值的方法 onChangeValue 传递给 ref 。
    - 父组件可以通过调用 ref 下的 onFocus 和 onChangeValue 控制子组件中 input 赋值和聚焦。

3. **函数组件缓存数据**

    函数组件每一次 render  ，函数上下文会重新执行，那么有一种情况就是，在执行一些事件方法改变数据或者保存新数据的时候，有没有必要更新视图，有没有必要把数据放到 state 中。如果视图层更新不依赖想要改变的数据，那么 state 改变带来的更新效果就是多余的。这时候更新无疑是一种性能上的浪费。

    这种情况下，useRef 就派上用场了，上面讲到过，useRef 可以创建出一个 ref 原始对象，只要组件没有销毁，ref 对象就一直存在，那么完全可以把一些不依赖于视图更新的数据储存到 ref 对象中。这样做的好处有两个：

    - 第一个能够直接修改数据，不会造成函数组件冗余的更新作用。
    - 第二个 useRef 保存数据，如果有 useEffect ，useMemo 引用 ref 对象中的数据，无须将 ref 对象添加成 dep 依赖项，因为 useRef 始终指向一个内存空间，**所以这样一点好处是可以随时访问到变化后的值。**

    ```jsx
    const toLearn = [
      { type: 1, mes: "let us learn React" },
      { type: 2, mes: "let us learn Vue3.0" },
    ];

    export function FunctionComponentStoreData() {
      const typeInfo = useRef(toLearn[0]);
      const [id, setId] = useState(0);
      const changeType = (info) => {
        typeInfo.current = info; /* typeInfo 的改变，不需要视图变化 */
      };
      useEffect(() => {
        if (typeInfo.current.type === 1) {
          /* ... */
          console.log("函数组件缓存数据 type=1 typeInfo:", typeInfo);
        } else if (typeInfo.current.type === 2) {
          /* ... */
          console.log("函数组件缓存数据 type=2 typeInfo:", typeInfo);
        }
      }, [id]); /* 无须将 typeInfo 添加依赖项  */
      return (
        <div>
          <h1>id:{id}</h1>
          {toLearn.map((item) => (
            <button key={item.type} onClick={changeType.bind(null, item)}>
              {item.mes}
            </button>
          ))}
          <br />
          <button onClick={() => setId(id + 1)}>id++</button>
        </div>
      );
    }
    ```

    ![函数组件缓存数据](https://s2.loli.net/2022/03/03/QnDYKZI8EUPh5Jq.gif)

    设计思路：

    - 用一个 useRef 保存 type 的信息，type 改变不需要视图变化。
    - 按钮切换直接改变 useRef 内容。
    - useEffect 里面可以直接访问到改变后的 typeInfo 的内容，不需要添加依赖项。

### 6.3 ref 原理

对于 Ref 标签引用，React 是如何处理的呢？ 接下来先来看看一段 demo 代码 （称之为 DemoRef :

```jsx
export class DemoRef extends Component {
  state = { num: 0 };
  node = null;
  render() {
    return (
      <div>
        <div
          ref={(node) => {
            this.node = node;
            console.log("此时的参数是什么: ", this.node);
          }}
        >
          ref元素节点
        </div>
        <button onClick={() => this.setState({ num: this.state.num + 1 })}>
          点击
        </button>
      </div>
    );
  }
}
```

用回调函数方式处理 Ref ，**如果点击一次按钮，会打印几次 console.log ？**

![demoRef点击](https://s2.loli.net/2022/03/03/VTL2eHzrBUQN7mY.gif)

此时加载完毕后后首先打印一次 `console.log`

然后点击按钮，会首先打印一次 `null` ，然后再打印一次 ref 指向的节点

这样的原因和意义？

#### 6.3.1 **ref 执行时机和处理逻辑**

**React 将在组件挂载时，会调用 `ref` 回调函数并传入 DOM 元素(这里解释了为什么加载完成后也打印了节点)，当卸载时调用它并传入 `null`。在 `componentDidMount` 或 `componentDidUpdate` 触发前，React 会保证 refs 一定是最新的。**

在生命周期中，提到了一次更新的两个阶段- render 阶段和 commit 阶段，后面的 fiber 章节会详细介绍两个阶段。**对于整个  Ref 的处理，都是在 commit 阶段发生的**。之前了解过 commit 阶段会进行真正的 Dom 操作，此时 ref 就是用来获取真实的  DOM 以及组件实例的，所以需要 commit 阶段处理。

但是对于 Ref 处理函数，React 底层用两个方法处理：**commitDetachRef(DOM 更新之前)**  和 **commitAttachRef(DOM 更新之后)** ，上述两次 console.log 一次为 null，一次为div 就是分别调用了上述的方法。

这两次正正好好，一次在 DOM 更新之前，一次在 DOM 更新之后。

- 第一阶段：一次更新中，在 commit 的 mutation 阶段, 执行commitDetachRef，commitDetachRef 会清空之前ref值，使其重置为 null。

    **置空的原因在于：先置空，防止在一次更新中，fiber节点卸载了，但是 ref 引用没有卸载，指向了原来的元素或者组件** [ref 先置空原因](https://github.com/facebook/react/issues/9328#issuecomment-292029340)

    结合源码：

    ```js
    // react-reconciler/src/ReactFiberCommitWork.js

    function commitDetachRef(current: Fiber) {
      const currentRef = current.ref;
      if (currentRef !== null) {
        if (typeof currentRef === 'function') { /* function 和 字符串获取方式。 */
          currentRef(null); // 执行 ref 函数
        } else {   /* Ref对象获取方式 */
          currentRef.current = null;
        }
      }
    }
    ```

- 第二阶段：DOM 更新阶段，这个阶段会根据不同的 effect 标签，真实的操作 DOM 。

- 第三阶段：layout 阶段，在更新真实元素节点之后，此时需要更新 ref 。

    ```js
    // react-reconciler/src/ReactFiberCommitWork.js

    function commitAttachRef(finishedWork: Fiber) {
      const ref = finishedWork.ref;
      if (ref !== null) {
        const instance = finishedWork.stateNode;
        let instanceToUse;
        switch (finishedWork.tag) {
          case HostComponent: //元素节点 获取元素
            instanceToUse = getPublicInstance(instance);
            break;
          default:  // 类组件直接使用实例
            instanceToUse = instance;
        }
        if (typeof ref === 'function') {
          ref(instanceToUse);  //* function 和 字符串获取方式。 */
        } else {
          ref.current = instanceToUse; /* ref对象方式 */
        }
      }
    }
    ```

    这一阶段，主要判断 ref 获取的是组件还是 DOM 元素标签，如果 DOM 元素，就会获取更新之后最新的 DOM 元素。上面流程中讲了三种获取 ref 的方式。 **如果是字符串 ref="node" 或是 函数式 `ref={(node)=> this.node = node }` 会执行 ref 函数，重置新的 ref** 。

    如果是 ref 对象方式。

    ```js
    node = React.createRef()
    <div ref={ node } ></div>
    ```

    会更新 ref 对象的 current 属性。达到更新 ref 对象的目的。

    > 但是为什么 `ref="node"` 字符串，最后会按照函数方式处理呢？
    >
    > 是因为**当 ref 属性是一个字符串的时候，React 会自动绑定一个函数**，用来处理 ref 逻辑
    >
    > ```js
    > // react-reconciler/src/ReactChildFiber.js
    >
    > const ref = function(value) {
    >  let refs = inst.refs;
    >  if (refs === emptyRefsObject) {
    >      refs = inst.refs = {};
    >  }
    >  if (value === null) {
    >      delete refs[stringRef];
    >  } else {
    >      refs[stringRef] = value;
    >  }
    > };
    > ```
    >
    > 所以当这样绑定ref="node"，会被绑定在组件实例的refs属性下面。比如
    >
    > ```js
    > <div ref="node" ></div>
    > ```
    >
    > ref 函数 在 commitAttachRef 中最终会这么处理：
    >
    > ```js
    > ref(<div>)
    > 等于 inst.refs.node = <div>
    > ```

#### 6.3.2 ref 的处理特性

React 中被 ref 标记的 fiber，那么每一次 fiber 更新都会调用 **commitDetachRef**  和 **commitAttachRef** 更新 Ref 吗 ？

**答案是否定的，只有在 ref 更新的时候，才会调用如上方法更新 ref ，究其原因还要从如上两个方法的执行时期说起**

#### 6.3.3 更新 ref

在 commit 阶段 commitDetachRef 和 commitAttachRef 是在什么条件下被执行的呢 ？

**`commitDetachRef` 调用时机**

```js
// react-reconciler/src/ReactFiberWorkLoop.js

function commitMutationEffects(){
    if (effectTag & Ref) {
        const current = nextEffect.alternate;
        if (current !== null) {
            commitDetachRef(current);
        }
    }
}
```

**`commitAttachRef` 调用时机**

```js
function commitLayoutEffects(){
    if (effectTag & Ref) {
        commitAttachRef(nextEffect);
    }
}
```

从上可以清晰的看到只有含有 `Ref` tag 的时候，才会执行更新 ref，那么是每一次更新都会打 `Ref` tag 吗？

```js
// react-reconciler/src/ReactFiberBeginWork.js

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||      // 初始化的时候
    (current !== null && current.ref !== ref)  // ref 指向发生改变
  ) {
    workInProgress.effectTag |= Ref;
  }
}
```

首先 `markRef` 方法执行在两种情况下：

- **第一种就是类组件的更新过程中**。
- 第二种就是更新 `HostComponent` 的时候，什么是 HostComponent 就不必多说了，比如 `<div />` 等元素。

`markRef` 会在以下两种情况下给 effectTag 标记 Ref，只有标记了 Ref tag 才会有后续的 `commitAttachRef` 和 `commitDetachRef` 流程。（ current 为当前调和的 fiber 节点 ）

- 第一种` current === null && ref !== null`：就是在 fiber 初始化的时候，第一次 ref 处理的时候，是一定要标记 Ref 的。
- 第二种` current !== null && current.ref !== ref`：就是 fiber 更新的时候，但是 ref 对象的指向变了。

只有在 Ref tag 存在的时候才会更新 ref ，那么回到最初的 **DemoRef** 上来，为什么每一次按钮，都会打印 ref ，那么也就是 ref 的回调函数执行了，ref 更新了。

```js
<div ref={(node)=>{
               this.node = node
               console.log('此时的参数是什么：', this.node )
}}  >ref元素节点</div>
```

如上很简单，**每一次更新的时候(执行 render 后面dom变化)，都给 ref 赋值了新的函数**，那么 `markRef` 中就会判断成 `current.ref !== ref`，所以就会重新打 Ref 标签，那么在 commit 阶段，就会更新 ref 执行 ref 回调函数了。

如果给 **DemoRef** 做如下修改：

```jsx
export class DemoRef2 extends Component {
  state = { num: 0 };
  node = null;
  getDom = (node) => {
    this.node = node;
    console.log("此时的参数是什么: ", this.node);
  }; // ref 每次都指向同一个函数
  render() {
    return (
      <div>
        <div ref={this.getDom}>ref元素节点</div>
        <button onClick={() => this.setState({ num: this.state.num + 1 })}>
          点击
        </button>
      </div>
    );
  }
}
```

这个时候，在点击按钮更新的时候，由于此时 ref 指向相同的函数 `getDom` ，所以就不会打 Ref 标签，不会更新 ref 逻辑，直观上的体现就是 `getDom` 函数不会再执行。

#### 6.3.4 卸载 ref

当组件或者元素卸载的时候，ref 的处理逻辑是怎么样的。

```js
// react-reconciler/src/ReactFiberCommitWork.js
this.state.isShow && <div ref={()=>this.node = node} >元素节点</div>
```

如上，在一次更新的时候，改变 `isShow` 属性，使之由 `true` 变成了 `false`， 那么 `div` 元素会被卸载，那么 ref 会怎么处理呢？

被卸载的 fiber 会被打成 `Deletion` effect tag ，然后在 commit 阶段会进行 commitDeletion 流程。对于有 ref 标记的 ClassComponent （类组件） 和 HostComponent （元素），会统一走 `safelyDetachRef` 流程，这个方法就是用来卸载 ref。

```js
// react-reconciler/src/ReactFiberCommitWork.js

function safelyDetachRef(current) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === 'function') {  // 函数式 ｜ 字符串
        ref(null)
    } else {
      ref.current = null;  // ref 对象
    }
  }
}
```

- 对于字符串 `ref="dom"` 和函数类型 `ref={(node)=> this.node = node }` 的 ref，会执行传入 null 置空 ref 。
- 对于 ref 对象类型，会清空 ref 对象上的 current 属性。

借此完成卸载 ref 流程。

![image-20220303131152702](https://s2.loli.net/2022/03/03/IvPx6KX2NsfOgzU.png)

## 7. 提供者 context

首先来思考为什么 React 会提供 context 的 API 呢？

带着这个疑问，首先假设一个场景：在 React 的项目有一个全局变量 theme（ theme  可能是初始化数据交互获得的，也有可能是切换主题变化的），有一些视图 UI 组件（比如表单 input 框、button 按钮），需要 theme 里面的变量来做对应的视图渲染，现在的问题是怎么能够把 theme 传递下去，合理分配到**用到这个 theme** 的地方。

那么，首先想到的是 **props 的可行性**，如果让 props  来解决上述问题可以是可以，不过会有两个问题。假设项目的组件树情况如下图所示，因为在设计整个项目的时候，不确定将来哪一个模块需要 theme  ，所以必须将 theme 在根组件 A 注入，但是需要给组件 N 传递 props ，需要在上面每一层都去手动绑定 props  ，如果将来其他子分支上有更深层的组件需要 theme ，还需要把上一级的组件全部绑定传递 props ，这样维护成本是巨大的。

假设需要动态改变 theme ，那么需要从根组件更新，只要需要 theme 的组件，由它开始到根组件的一条组件链结构都需要更新，会造成牵一发动全身的影响。props 方式看来不切实际。

![image-20220304100300984](https://s2.loli.net/2022/03/04/V2mRP3dCeolfc4i.png)

为了解决上述 props  传递的两个问题，React提供了 `context` 上下文 模式，具体模式是这样的，React组件树A节点，用Provider提供者注入theme，然后在需要theme的地方，用 Consumer 消费者形式取出theme，供给组件渲染使用即可，这样减少很多无用功。用官网上的一句话形容就是Context  提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

但是必须注意一点是，**提供者永远要在消费者上层**，正所谓水往低处流，提供者一定要是消费者的某一层父级。

### 7.1 老版本的 context

在`v16.3.0`之前，React 用 PropTypes 来声明 context 类型，提供者需要 getChildContext 来返回需要提供的 context ，并且用静态属性  childContextTypes 声明需要提供的 context 数据类型。具体如下

- **老版本提供者**

    ```jsx
    import React, { Component } from "react";
    import PropTypes from "prop-types";

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
        return <div>hello, let us learn React!</div>;
      }
    }
    ```

    老版本 api 在 v16 版本还能正常使用，对于提供者，需要通过 getChildContext 方法，将传递的 theme 信息返回出去，并通过 childContextTypes 声明要传递的 theme 是一个对象结构。声明类型需要`propsTypes`库来助力。

- **老版本消费者**

    ```jsx
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
    ```

    ![image-20220304101231862](https://s2.loli.net/2022/03/04/oB4KnprgsvFHcAC.png)

    作为消费者，需要在组件的静态属性指明我到底需要哪个提供者提供的状态，在 demo 项目中，ConsumerDemo 的 contextTypes 明确的指明了需要 ProviderDemo 提供的 theme信息，然后就可以通过 this.context.theme 访问到 theme  ，用做渲染消费。

    这种模式和 vue 中的 provide 和 inject 数据传输模式很像，在提供者中声明到底传递什么，然后消费者指出需要哪个提供者提供的  context  。打个比方，就好比去一个高档餐厅，每一个厨师都可以理解成一个提供者，而且每个厨师各有所长，有的擅长中餐，有的擅长西餐，每个厨师都把擅长的用 `childContextTypes` 贴出来，你作为消费者，用 `contextTypes` 明确出想要吃哪个厨师做的餐饮，借此做到物尽所需。

### 7.2 新版本 context 基本使用

上述的 API 用起来流程可能会很繁琐，而且还依赖于 propsTypes 等第三方库。所以 `v16.3.0` 之后，context api 正式发布了，所以可以直接用 createContext 创建出一个 context 上下文对象，context 对象提供两个组件，`Provider`和 `Consumer`作为新的提供者和消费者，这种 context 模式，更便捷的传递 context ，还增加了一些新的特性，但是也引出了一些新的问题。

1. **createContext**

    ```jsx
    const ThemeContext = React.createContext(null);
    const ThemeProvider = ThemeContext.Provider; // 提供者
    const ThemeConsumer = ThemeContext.Consumer; // 订阅消费者
    ```

    createContext 接受一个参数，作为初始化 context 的内容，返回一个context 对象，Context 对象上的 Provider 作为提供者，Context 对象上的 Consumer 作为消费者。

2. **新版本提供者**

    ```jsx
    const ThemeProvider = ThemeContext.Provider;
    export function ProviderDemo() {
      const [contextValue, setContextValue] = React.useState({
        color: "#ccc",
        background: "pink",
      });
      return (
        <div>
          <ThemeProvider value={contextValue}>
            <Son />
          </ThemeProvider>
        </div>
      );
    }
    ```

    provider 作用有两个：

    - value 属性传递 context，供给 Consumer 使用。
    - value 属性改变，ThemeProvider 会让消费 Provider value 的组件重新渲染。

3. **新版本消费者**

    对于新版本想要获取 context 的消费者，React 提供了3种形式

    1. **类组件 contextType 方式**

        `React v16.6` 提供了 contextType 静态属性，用来获取上面 Provider 提供的 value 属性，这里注意的是 contextType ，不是上述老版的contextTypes, 对于 React 起的这两个名字，真是太相像了。

        ```jsx
        // 1. 类组件 - contextType 方式
        export class ConsumerDemo1 extends React.Component {
          render() {
            const { color, background } = this.context;
            return <div style={{ color, background }}>消费者</div>;
          }
        }
        ```

        - 类组件的静态属性上的 contextType 属性，指向需要获取的 context（ demo 中的 ThemeContext ），就可以方便获取到最近一层 Provider 提供的 contextValue 值。
        - 记住这种方式只适用于类组件。

    2. **函数组件 useContext 方式**

        v16.8 React hooks 提供了 `useContext`

        ```jsx
        const ThemeContext = React.createContext(null);

        function ConsumerDemo2() {
          const contextValue = React.useContext(ThemeContext);
          const { color, background } = contextValue;
          return <div style={{ color, background }}>消费者</div>;
        }
        ```

        useContext 接受一个参数，就是想要获取的 context ，返回一个 value 值，就是最近的 provider 提供 contextValue 值。

    3. **订阅者 Consumer 方式**

        React 还提供了一种 Consumer 订阅消费者方式

        ```jsx
        function ConsumerDemo3({ color, background }) {
          return <div style={{ color, background }}>消费者</div>;
        }

        const Son3 = () => {
          <ThemeConsumer>
            {/* 将 context 内容转化成 props  */}
            {(contextValue) => <ConsumerDemo3 {...contextValue} />}
          </ThemeConsumer>;
        };
        ```

        Consumer 订阅者采取 render props 方式，接受最近一层 provider 中value 属性，作为 render props 函数的参数，可以将参数取出来，作为 props 混入 `ConsumerDemo` 组件，说白了就是 context 变成了 props。

4. **动态 context**

    上面讲到的 context 都是静态的，不变的，但是实际的场景下，context 可能是动态的，可变的，比如说回到了本章节最开始的话题切换主题，因为切换主题就是在动态改变 context 的内容。所以接下来看一下动态改变 context 。

    ```jsx
    import React, { useContext, useState } from "react";

    const ThemeContext = React.createContext(null);

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
          </ThemeContext.Provider>
          <button
            onClick={() => setContextValue({ color: "#fff", background: "blue" })}
          >
            切换主题
          </button>
        </div>
      );
    }
    ```

    ![动态context](https://s2.loli.net/2022/03/04/wc7ABP3sniK9ryY.gif)

    Provider 模式下 context 有一个显著的特点，就是 **Provder 的 value 改变，会使所有消费 value 的组件重新渲染**，如上通过一个 useState 来改变 contextValue 的值，contextValue 改变，会使 ConsumerDemo  自动更新，注意这个更新并不是由父组件 son render 造成的，因为给 son 用 memo 处理过，这种情况下，Son 没有触发  render，而是 ConsumerDemo 自发的render。

    **总结：在 Provider 里 value 的改变，会使引用`contextType`,`useContext` 消费该 context 的组件重新 render ，同样会使 Consumer 的 children 函数重新执行，与前两种方式不同的是 Consumer 方式，当 context 内容改变的时候，不会让引用 Consumer 的父组件重新更新。**

    **上面暴露的问题**

    但是上述的 demo 暴露出一个问题，就是在上述 son 组件是用 memo 处理的，如果没有 memo 处理，useState 会让 `ProviderDemo` 重新 render ，此时 son 没有处理，就会跟随父组件 render ，问题是如果 son 还有很多子组件，那么全部 render 一遍。那么**如何阻止 Provider value 改变造成的 children （ demo 中的 Son ）不必要的渲染？**

    - ①  第一种就是利用 memo，pureComponent 对子组件 props 进行浅比较处理

        ```jsx
        const Son = React.memo(()=> <ConsumerDemo />)
        ```

    - ②  第二种就是 React 本身对 React element 对象的缓存。React 每次执行 render 都会调用  createElement 形成新的 React element 对象，如果把 React element  缓存下来，下一次调和更新时候，就会跳过该 React element 对应 fiber 的更新。

        ```jsx
        {React.useMemo(() => {
            console.log("use memo render");
            return <ConsumerDemo  />;
        }, [])}
        ```



5. **其他 api**

    1. **displayName**

        context 对象接受一个名为 `displayName` 的 property，类型为字符串。React DevTools 使用该字符串来确定 context 要显示的内容。

        ```jsx
        const ThemeContext = React.createContext(null);
        ThemeContext.displayName = "dynamic theme context";
        ```

        ![image-20220304105855268](https://s2.loli.net/2022/03/04/Zb62VIq5SBTNuDx.png)

- **context 与 props 和 react-redux 的对比？**

    context 解决了

    - 解决了 props 需要每一层都手动添加 props 的缺陷。
    - 解决了改变 value ，组件全部重新渲染的缺陷。

    react-redux 就是通过 Provider 模式把 redux 中的 store 注入到组件中的。

### 7.3 context 高阶用法

#### 7.3.1 嵌套 Provider

多个 Provider 之间可以相互嵌套，来保存/切换一些全局数据：

```jsx
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
```

![嵌套Provider](https://s2.loli.net/2022/03/04/BezC4fVZ5OK2IuG.gif)

- ThemeContext 保存主题信息，用 LanContext 保存语言信息。
- 两个 Provider 嵌套来传递全局信息。
- 用两个 Consumer 嵌套来接受信息。

#### 7.4.2 逐层传递 Provider

Provider 还有一个良好的特性，就是可以逐层传递 context ，也就是一个 context 可以用多个 Provder  传递，下一层级的 Provder 会覆盖上一层级的 Provder 。React-redux 中 connect  就是用这个良好特性传递订阅器的。

```jsx
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
```

![image-20220304124118679](https://s2.loli.net/2022/03/04/HyUT7oqYgQ8tVdc.png)

- 全局只有一个 ThemeContext ，两次用 provider 传递两个不同 context 。
- 组件获取 context 时候，会获取离当前组件最近的上一层 Provider 。
- 下一层的 provider 会覆盖上一层的 provider 。

Provider 特性总结：

- 1 Provider 作为提供者传递 context ，provider中value属性改变会使所有消费context的组件重新更新。
- 2 Provider可以逐层传递context，下一层Provider会覆盖上一层Provider。

### 7.4 进阶实践 切换主题模式

```jsx
// 进阶实践 切换主题模式
import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import {
  HomeOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const ThemeContext = React.createContext(null);

const theme = {
  //主题颜色
  dark: {
    color: "#1890ff",
    background: "#1890ff",
    border: "1px solid blue",
    type: "dark",
  },
  light: {
    color: "#fc4838",
    background: "#fc4838",
    border: "1px solid pink",
    type: "light",
  },
};

// input 输入框 useContext 模式
function Input({ label, placeholder }) {
  const { color, border } = useContext(ThemeContext);
  return (
    <div>
      <label style={{ color }}>{label}</label>
      <input className="input" placeholder={placeholder} style={{ border }} />
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

// 容器组件 Consumer 模式
function Box(props) {
  return (
    <ThemeContext.Consumer>
      {(themeContextValue) => {
        const { border, color } = themeContextValue;
        return (
          <div className="context_box" style={{ border, color }}>
            {props.children}
          </div>
        );
      }}
    </ThemeContext.Consumer>
  );
}

Box.propTypes = {
  children: PropTypes.any,
};

function Checkbox({ label, name, onChange }) {
  const { type, color } = useContext(ThemeContext);
  return (
    <div className="checkbox" onClick={onChange}>
      <label htmlFor="name"> {label} </label>
      <input
        type="checkbox"
        id={name}
        value={type}
        name={name}
        checked={type === name}
        style={{ color }}
      />
    </div>
  );
}
Checkbox.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

// contextType 模式
class App extends React.PureComponent {
  static contextType = ThemeContext;
  render() {
    const { border, setTheme, color, background } = this.context;
    return (
      <div className="context_app" style={{ border, color }}>
        <div className="context_change_theme">
          <span> 选择主题： </span>
          <Checkbox
            label="light"
            name="light"
            onChange={() => setTheme(theme.light)}
          />
          <Checkbox
            label="dark"
            name="dark"
            onChange={() => setTheme(theme.dark)}
          />
        </div>
        <div className="box_content">
          <Box>
            <Input label="姓名: " placeholder="请输入姓名" />
            <Input label="age: " placeholder="请输入年龄" />
            <button className="searchbtn" style={{ background }}>
              确定
            </button>
            <button className="concellbtn" style={{ color }}>
              取消
            </button>
          </Box>
          <Box>
            <HomeOutlined twoToneColor={color} />
            <SettingFilled twoToneColor={color} />
            <SmileOutlined twoToneColor={color} />
            <SyncOutlined spin twoToneColor={color} />
            <SmileOutlined twoToneColor={color} rotate={180} />
            <LoadingOutlined twoToneColor={color} />
          </Box>
          <Box>
            <div className="person_des" style={{ color: "#fff", background }}>
              I am alien <br />
              let us learn React!
            </div>
          </Box>
        </div>
      </div>
    );
  }
}

export function AdvancedPractiveChangeTheme() {
  const [themeContextValue, setThemeContextValue] = useState(theme.dark);
  /* 传递颜色主题 和 改变主题的方法 */
  return (
    <ThemeContext.Provider
      value={{ ...themeContextValue, setTheme: setThemeContextValue }}
    >
      <App />
    </ThemeContext.Provider>
  );
}
```

![高阶实践](https://s2.loli.net/2022/03/04/ygbaxT4IHAvwSEO.gif)

流程分析：

- 在 Root 组件中，用 Provider 把主题颜色 `themeContextValue` 和改变主题的 `setTheme` 传入 context 。
- 在 App 中切换主题。
- 封装统一的 Input Checkbox Box 组件，组件内部消费主题颜色的 context ，主题改变，统一更新，这样就不必在每一个模块都绑定主题，统一使用主体组件就可以了。


## 8. 模块化 CSS

### 8.1 模块化 CSS 的作用

css 模块化一直是 React 痛点，为什么这么说呢？ 因为 React 没有像 Vue 中 `style scoped` 的模版写法，可以直接在 .vue 文件中声明 css 作用'域'。随着 React 项目日益复杂化、繁重化，React 中 css 面临很多问题，比如样式类名全局污染、命名混乱、样式覆盖等。这时， css 模块化就显得格外重要。

 **css 模块化的几个重要作用，如下**

1. 防止全局污染，样式被覆盖

    全局污染、样式覆盖是很容易面临的一个问题。首先假设一个场景，比如小明在参与一个项目开发，不用 css 模块化，在 React 一个组件对应的 css 文件中这么写：

    ```css
    .button{
        background:red;
    }
    ```

    但是在浏览器中并没有生效，于是小明开始排查，结果发现，在其他组件中，其他小伙伴这么写：

    ```css
    .button{
        background:red;
    }
    ```

    由于权重问题，样式被覆盖了。

    上述是一个很简单的例子，但是如果不规范 css 的话，这种情况在实际开发中会变得更加棘手，有时候甚至不得不用 `!important` 或者 `行内样式` 来解决，但是只是一时痛快，如果后续有其他样式冲突，那么更难解决这个问题。 Web Components 标准中的 Shadow DOM 能彻底解决这个问题，但它的做法有点极端，样式彻底局部化，造成外部无法重写样式，损失了灵活性。

2. 命名混乱

    没有 css 模块化和统一的规范，会使得多人开发，没有一个规范，比如命名一个类名，有的人用驼峰`.contextBox`，有的人用下划线`.context_box`，还有的人用中划线`.context-box`，使得项目不堪入目。

3. css 代码冗余，体积庞大

    这种情况也普遍存在，因为 React 中各个组件是独立的，所以导致引入的 css 文件也是相互独立的，比如在两个 css 中，有很多相似的样式代码，如果没有用到 css 模块化，构建打包上线的时候全部打包在一起，那么无疑会增加项目的体积。

为了解决如上问题 css 模块化也就应运而生了，关于 React 使用 css 模块化的思路主要有两种：

- 第一种 `css module` ，依赖于 webpack 构建和 css-loader 等 loader 处理，将 css 交给 js 来动态加载。
- 第二种就是直接放弃 css ，`css in js`用 js 对象方式写 css ，然后作为 style 方式赋予给 React 组件的 DOM 元素，这种写法将不需要 .css .less .scss 等文件，取而代之的是每一个组件都有一个写对应样式的 js 文件。

### 8.2 CSS Modules

css Modules ，使得项目中可以像加载 js 模块一样加载 css ，本质上通过一定自定义的命名规则生成唯一性的 css  类名，从根本上解决 css 全局污染，样式覆盖的问题。对于 css modules 的配置，推荐使用 css-loader，因为它对 CSS  Modules 的支持最好，而且很容易使用。接下来介绍一下配置的流程。

**css-loader配置**

```js
{
    test: /\.css$/,/* 对于 css 文件的处理 */
    use:[
       'css-loader?modules' /* 配置css-loader ,加一个 modules */
    ]
}
```

**css文件**

```css
.text{
    color: blue;
}
```

**js文件**

```js
import style from './style.css'
export default ()=><div>
    <div className={ style.text } >验证 css modules </div>
</div>
```

### 8.3 CSS in JS

#### 8.3.1 概念和使用

`CSS IN JS` 相比 CSS Modules 更加简单， CSS IN JS 放弃css ，用 js 对象形式直接写 style

组件：

```jsx
import React from "react";
import style from "./style.js";

export function CSSModuleDemo() {
  console.log("style:", style);
  return <div style={style.text}>验证 CSS Modules</div>;
}
```

在同级目录下，新建 style.js 用来写样式

```js
const text = {
  color: "cyan",
  fontSize: "3em",
};

export default {
  text
}
```

![image-20220305103211831](https://s2.loli.net/2022/03/05/GC9wLabvsAmOPeu.png)

#### 8.3.2 灵活运用

由于 CSS IN JS 本质上就是运用 js 中对象形式保存样式， 所以 js 对象的操作方法都可以灵活的用在 CSS IN JS上。

- **拓展运算符实现样式继承**

    ```js
    const baseStyle = { /* 基础样式 */ }

    const containerStyle = {
        ...baseStyle,  // 继承  baseStyle 样式
        color:'#ccc'   // 添加的额外样式
    }
    ```

- **动态添加样式变得更加灵活**

    ```js
    /* 暗色调  */
    const dark = {
        backgroundColor:'black',
    }
    /* 亮色调 */
    const light = {
        backgroundColor:'white',
    }
    ```

    ```js
    <span style={ theme==='light' ? Style.light : Style.dark  }  >hi , i am CSS IN JS!</span>
    ```

    更加复杂的结构：

    ```js
     <span style={ { ...Style.textStyle , ...(theme==='light' ? Style.light : Style.dark  ) }} >
         hi , i am CSS IN JS!
     </span>
    ```

- style-components库使用

    CSS IN JS 也可以由一些第三方库支持，比如 `style-components`。 `style-components` 可以把写好的 css 样式注入到组件中，项目中应用的已经是含有样式的组件。

    - **安装**

        ```bash
        yarn add styled-components
        ```

    - 基础使用

        ```jsx
        import React from "react";
        import styled from "styled-components";

        /* 给button标签添加样式，形成 Button React 组件 */
        const Button = styled.button`
          background: #6a8bad;
          color: #fff;
          min-width: 96px;
          height: 36px;
          border: none;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-left: 20px !important;
        `;

        export function StyleComponentDemo() {
          return (
            <div>
              StyleComponentDemo
              <Button>按钮</Button>
            </div>
          );
        }
        ```

        ![image-20220305103844835](https://s2.loli.net/2022/03/05/NgTto32JmDfEPnG.png)

    - 基于 props 动态添加样式

        style-components 可以通过给生成的组件添加 props 属性 ，来动态添加样式。

        ```jsx
        const PropsButton = styled.button`
            background: ${ props => props.theme ? props.theme : '#6a8bad'  };
            color: #fff;
            min-width: 96px;
            height :36px;
            border :none;
            border-radius: 18px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-left: 20px !important;
        `

        export function StyleComponentDemo() {
            return (
                <div>
                    StyleComponentDemo
                    <Button>按钮</Button>
                    <PropsButton theme={'#fc4838'}  >props主题按钮</PropsButton>
                </div>
            );
        }
        ```

        ![image-20220305104047969](https://s2.loli.net/2022/03/05/OSaFqT8yGslEdD7.png)



    - 继承样式

        style-components 可以通过继承方式来达到样式的复用。

        ```jsx
        const NewButton = styled(Button)`
          background: cyan;
          color: yellow;
        `;

        export function StyleComponentDemo() {
          return (
            <div>
              StyleComponentDemo
              <Button>按钮</Button>
              <PropsButton theme={"#fc4838"}>props主题按钮</PropsButton>
              <NewButton> 继承按钮</NewButton>
            </div>
          );
        }
        ```

        ![image-20220305104229165](https://s2.loli.net/2022/03/05/gl84pyjneEfKcOd.png)

    - 编辑器扩展

        vscode 可以使用 vscode-styled-components 来进行代码高亮和语法提示

        ![image-20220305104530098](https://s2.loli.net/2022/03/05/tZgQ5RvYXLjAKz9.png)



## 9. 高阶组件


**高阶组件 HOC (higher order components )** 是 React 中用于复用组件逻辑的一种高级技巧。

具体而言，**高阶组件是参数为组件，返回值为新组件的函数。**

```jsx
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

组件是将 props 转换为 UI，而高阶组件是将组件转换为另一个组件。

### 9.1 高阶组件基本介绍

#### 9.1.1 高阶组件能解决什么问题

高级组件到底能够解决什么问题？举一个特别简单的例子，话说小明负责开发一个 web 应用，应用的结构如下所示，而且这个功能小明已经开发完了。

![hoc](https://s2.loli.net/2022/03/05/8a736ACJb9HqXgn.png)

但是，有一天老板突然提出了一个权限隔离的需求，就是部分模块组件受到权限控制，后台的数据交互的结果权限控制着模块展示与否，而且没有权限会默认展示无权限提示页面。（如下图，黄色部分是受到权限控制的组件模块）

![hoc2](https://s2.loli.net/2022/03/05/snywaeZICNB1Jq5.png)

那么小明面临的问题是，如何给需要权限隔离的模块，绑定权限呢？那第一种思路是把所有的需要权限隔离的模块重新绑定权限，通过权限来判断组件是否展示。

![hoc3](https://s2.loli.net/2022/03/05/OdZ6PFHjMr5IxYa.png)

这样无疑会给小明带来很多的工作量，而且后续项目可能还有受权限控制的页面或者组件，都需要手动绑定权限。那么如何解决这个问题呢，思考一下，既然是判断权限，那么可以把逻辑都写在一个容器里，然后将每个需要权限的组件通过容器包装一层，这样不就不需要逐一手动绑定权限了吗？所以 HOC 可以合理的解决这个问题，通过 HOC 模式结构如下图所示：

![image-20220305111422131](https://s2.loli.net/2022/03/05/LmQB4bKjn7AceWP.png)

综上所述，HOC的产生根本作用就是解决大量的代码复用，逻辑复用问题。既然说到了逻辑复用，那么具体复用了哪些逻辑呢？

- 首先第一种就是像上述的拦截问题，本质上是对渲染的控制，对渲染的控制可不仅仅指是否渲染组件，还可以像 dva 中 dynamic 那样懒加载/动态加载组件。
- 还有一种场景，比如项目中想让一个非 Route 组件，也能通过 props 获取路由实现跳转，但是不想通过父级路由组件层层绑定 props ，这个时候就需要一个 HOC 把改变路由的 history 对象混入 props 中，于是 withRoute 诞生了。所以 HOC  还有一个重要的作用就是让 props 中混入一些你需要的东西。
- 还有一种情况，如果不想改变组件，只是监控组件的内部状态，对组件做一些赋能，HOC 也是一个不错的选择，比如对组件内的点击事件做一些监控，或者加一次额外的生命周期，我之前写过一个开源项目 `react-keepalive-router`，可以缓存页面，项目中的 keepaliveLifeCycle 就是通过 HOC 方式，给业务组件增加了额外的生命周期。

#### 9.1.2 高阶组件基础概念

**高阶组件就是一个将函数作为参数并且返回值也是函数的函数**。高阶组件是**以组件作为参数，返回组件的函数**。返回的组件把传进去的组件进行功能强化

![高阶组件](https://s2.loli.net/2022/03/05/kThl7aOyUPxdRSv.png)

- **两种不同的高阶组件**

    常用的高阶组件有**属性代理**和**反向继承**两种，两者之间有一些共性和区别。

    - **属性代理**

        **属性代理，就是用组件包裹一层代理组件**，在代理组件上，可以做一些，对源组件的强化操作。这里注意属性代理返回的是一个新组件，被包裹的原始组件，将在新的组件里被挂载。

        ```jsx
        function HOC(WrapComponent) {
          return class Advance extends React.Component {
            state = {
              name: "zxh",
            };
            render() {
              return <WrapComponent {...this.props} {...this.state} />;
            }
          };
        }
        ```

        **优点：**

        - ①  属性代理可以和业务组件低耦合，零耦合，对于条件渲染和 props 属性增强，只负责控制子组件渲染和传递额外的 props  就可以了，所以无须知道，业务组件做了些什么。所以正向属性代理，更适合做一些开源项目的 HOC ，目前开源的 HOC 基本都是通过这个模式实现的。
        - ②  同样适用于类组件和函数组件。
        - ③  可以完全隔离业务组件的渲染，因为属性代理说白了是一个新的组件，相比反向继承，可以完全控制业务组件是否渲染。
        - ④  可以嵌套使用，多个 HOC 是可以嵌套使用的，而且一般不会限制包装 HOC 的先后顺序。

        **缺点：**

        - ①  一般无法直接获取原始组件的状态，如果想要获取，需要 ref 获取组件实例。
        - ②  无法直接继承静态属性。如果需要继承需要手动处理，或者引入第三方库。
        - ③  因为本质上是产生了一个新组件，所以需要配合 forwardRef 来转发 ref。

    - **反向继承**

        反向继承和属性代理有一定的区别，在于包装后的组件继承了原始组件本身，所以此时无须再去挂载业务组件。

        ```jsx
        class Index extends React.Component {
          render() {
            return <div>hello world</div>;
          }
        }

        function HOC(Component) {
          return class wrapComponent extends Component {};
        }

        export default HOC(Index);
        ```

        **优点：**

        - ①  方便获取组件内部状态，比如 state ，props ，生命周期，绑定的事件函数等。
        - ②  es6继承可以良好继承静态属性。所以无须对静态属性和方法进行额外的处理。

        **缺点：**

        - ①  函数组件无法使用。
        - ②  和被包装的组件耦合度高，需要知道被包装的原始组件的内部状态，具体做了些什么？
        - ③  如果多个反向继承 HOC 嵌套在一起，当前状态会覆盖上一个状态。这样带来的隐患是非常大的，比如说有多个  componentDidMount ，当前 componentDidMount 会覆盖上一个 componentDidMount  。这样副作用串联起来，影响很大。

### 9.2 高阶组件功能说明

#### 9.2.1 强化 props

强化 props 就是在原始组件的 props 基础上，加入一些其他的 props ，强化原始组件功能。举个例子，为了让组件也可以获取到路由对象，进行路由跳转等操作，所以 React Router 提供了类似 withRouter 的 HOC 。

```jsx
export function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = ({ wrappedComponentRef, ...remainingProps }) => {
    return (
      <RouterContext.Consumer>
        {(context) => {
          return (
            <Component
              {...remainingProps}
              {...context}
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };
  C.displayName = displayName;
  C.WrapComponent = Component;

  return hoistStatics(C, Component);
}
```

流程分析：

- 分离出 props 中 wrappedComponentRef 和 remainingProps ， remainingProps 是原始组件真正的 props， wrappedComponentRef 用于转发 ref。
- 用 Context.Consumer 上下文模式获取保存的路由信息。（ React Router 中路由状态是通过 context 上下文保存传递的）
- 将路由对象和原始 props 传递给原始组件，所以可以在原始组件中获取 history ，location 等信息。

#### 9.2.2 控制渲染

1. **渲染劫持**

    HOC 反向继承模式，可以通过 super.render() 得到 render 之后的内容，利用这一点，可以做渲染劫持 ，更有甚者可以修改 render 之后的 React element 对象。

    ```jsx
    const HOC3 = (WrapComponent) => {
      class Index extends WrapComponent {
        render() {
          return this.props.visible ? super.render() : <div>暂无数据</div>;
        }
      }
    };
    ```



2. **修改渲染树**

    ```jsx
    (function () {
      class Index extends React.Component {
        render() {
          return (
            <div>
              <ul>
                <li>react</li>
                <li>vue</li>
                <li>Angular</li>
              </ul>
            </div>
          );
        }
      }
      function HOC(Component) {
        return class Advance extends Component {
          render() {
            const element = super.render();
            const otherProps = {
              name: "alien",
            };
            /* 替换 Angular 元素节点 */
            const appendElement = React.createElement(
              "li",
              {},
              `hello ,world , my name  is ${otherProps.name}`
            );
            const newchild = React.Children.map(
              element.props.children.props.children,
              (child, index) => {
                if (index === 2) return appendElement;
                return child;
              }
            );
            return React.cloneElement(element, element.props, newchild);
          }
        };
      }
    })();
    ```



3. **动态加载**

    dva 中 dynamic 就是配合 import ，实现组件的动态加载的，而且每次切换路由，都会有 Loading 效果，接下来看看大致的实现思路。

    ```jsx
    export function dynamicHoc(loadRouter) {
      return class Content extends React.Component {
        state = { Component: null };
        componentDidMount() {
          this.state.Component &&
            loadRouter()
              .then((module) => module.default)
              .then((Component) => this.setState({ Component }));
        }
        render() {
          const { Component } = this.state;
          return Component ? <Component {...this.props} /> : <Loading />;
        }
      };
    }

    const Loading = () => <div>loading...</div>;
    ```

    **使用：**

    ```jsx
    const DynamicHocDemo = dynamicHoc(() => import("./Banner.jsx"));
    ```

    实现思路：

    - DynamicHocDemo 组件中，在 componentDidMount 生命周期动态加载上述的路由组件Component，如果在切换路由或者没有加载完毕时，显示的是 Loading 效果。

#### 9.2.3 组件赋能

1. **ref 获取实例**

    对于属性代理虽然不能直接获取组件内的状态，但是可以通过 ref 获取组件实例，获取到组件实例，就可以获取组件的一些状态，或是手动触发一些事件，进一步强化组件，但是注意的是：类组件才存在实例，函数组件不存在实例。

    ```jsx
    function Hoc(Component){
      return class WrapComponent extends React.Component{
          constructor(){
            super()
            this.node = null /* 获取实例，可以做一些其他的操作。 */
          }
          render(){
            return <Component {...this.props}  ref={(node) => this.node = node }  />
          }
      }
    }
    ```



2. **事件监控**

    HOC 不一定非要对组件本身做些什么？也可以单纯增加一些事件监听，错误监控。接下来，接下来做一个 `HOC` ，只对组件内的点击事件做一个监听效果。

    ```jsx
    function ClickHoc(Component) {
      return function Wrap(props) {
        const dom = React.useRef();
        React.useEffect(() => {
          const handlerClick = () => console.log("发生点击事件");
          dom.current.addEventListener("click", handlerClick);
          return () => dom.current.removeEventListener("click", handlerClick);
        }, []);
        return (
          <div ref={dom}>
            <Component {...props} />
          </div>
        );
      };
    }

    class Demo extends React.Component {
      render() {
        return (
          <div className="index">
            <p>hello world</p>
            <button>组件内部点击</button>
          </div>
        );
      }
    }

    export function UseEventWatchDemo() {
      const C = ClickHoc(Demo)
      return <C />;
    }
    ```

    ![事件监控](https://s2.loli.net/2022/03/05/YWhb4TpZDmjEkQy.gif)

## 9.3 高阶组件注意事项

#### 9.3.1 谨慎修改原型链

```jsx
function HOC (Component){
  const proDidMount = Component.prototype.componentDidMount
  Component.prototype.componentDidMount = function(){
     console.log('劫持生命周期：componentDidMount')
     proDidMount.call(this)
  }
  return  Component
}
```

如上 HOC 作用仅仅是修改了原来组件原型链上的 componentDidMount 生命周期。但是这样有一个弊端就是如果再用另外一个 HOC 修改原型链上的 componentDidMount ，那么这个HOC的功能即将失效。

#### 9.3.2 不要在函数组件内部或类组件render函数中使用HOC

类组件中🙅错误写法：

```js
class Index extends React.Component{
  render(){
     const WrapHome = HOC(Home)
     return <WrapHome />
  }
}
```

函数组件中🙅错误写法：

```js
function Index(){
     const WrapHome = HOC(Home)
     return  <WrapHome />
}
```

这么写的话每一次类组件触发 render 或者函数组件执行都会产生一个新的WrapHome，`react diff` 会判定两次不是同一个组件，那么就会卸载老组件，重新挂载新组件，老组件内部的真实 DOM 节点，都不会合理的复用，从而造成了性能的浪费，而且原始组件会被初始化多次。

#### 9.3.3 ref 的处理

**高阶组件的约定是将所有 props 传递给被包装组件，但这对于 ref 并不适用**。那是因为 ref 实际上并不是一个 prop ， 就像 key 一样，对于 ref 属性它是由 React 专门处理的。那么如何通过 ref 正常获取到原始组件的实例呢？可以用 `forwardRef`做 ref 的转发处理。

#### 9.3.4 注意多个HOC嵌套顺序问题

多个HOC嵌套，应该留意一下HOC的顺序，还要分析出要各个 HOC 之间是否有依赖关系。

对于 class 声明的类组件，可以用装饰器模式，对类组件进行包装：

```js
@HOC1(styles)
@HOC2
@HOC3
class Index extends React.Componen{
    /* ... */
}
```

对于函数组件：

```js
function Index(){
    /* .... */
}
export default HOC1(styles)(HOC2( HOC3(Index) ))
```

HOC1 -> HOC2 -> HOC3 -> Index

![image-20220305141812457](https://s2.loli.net/2022/03/05/TS6tpQRkH5xuBVa.png)

**要注意一下包装顺序，越靠近 `Index` 组件的，就是越内层的 HOC ,离组件 `Index` 也就越近。**

还有一些其他的小细节：

- 1 如果2个 HOC 相互之间有依赖。比如 HOC1 依赖 HOC2 ，那么 HOC1 应该在 HOC2 内部。
- 2 如果想通过 HOC 方式给原始组件添加一些额外生命周期，因为涉及到获取原始组件的实例 instance ，那么当前的 HOC 要离原始组件最近。

#### 9.3.5 继承静态属性

上述讲到在属性代理 HOC 本质上返回了一个新的 component ，那么如果给原来的 component 绑定一些静态属性方法，如果不处理，新的 component 上就会丢失这些静态属性方法。那么如何解决这个问题呢。

- **手动继承**

    当然可以手动将原始组件的静态方法 copy 到 HOC 组件上来，但前提是必须准确知道应该拷贝哪些方法。

    ```jsx
    function HOC(Component) {
        class WrappedComponent extends React.Component {
            //
        }
        // 必须准确知道应该拷贝哪些方法
        WrappedComponent.staticMethod = Component.staticMethod;
        return WrappedComponent;
    }
    ```



- **引入第三方库**

    每个静态属性方法都手动绑定会很累，尤其对于开源的 HOC ，对原生组件的静态方法是未知 ，为了解决这个问题可以使用 `hoist-non-react-statics` 自动拷贝所有的静态方法:

    ```jsx
    import hoistNonReactStatic from "hoist-non-react-statics";
    function HOC(Component) {
        class WrappedComponent extends React.Component {
            //
        }
        hoistNonReactStatic(WrappedComponent, Component);
        return WrappedComponent;
    }
    ```



### 9.4 进阶实践-权限拦截



## 10. 渲染控制

### 10.1 React 渲染

对于 React 渲染，你不要仅仅理解成类组件触发 render 函数，函数组件本身执行，事实上，从调度更新任务到调和  fiber，再到浏览器渲染真实 DOM，每一个环节都是渲染的一部分，至于对于每个环节的性能优化，React  在底层已经处理了大部分优化细节，包括设立任务优先级、异步调度、diff算法、时间分片都是 React  为了提高性能，提升用户体验采取的手段。所以，开发者只需要告诉 React 哪些组件需要更新，哪些组件不需要更新。于是，React 提供了  PureComponent，shouldComponentUpdated，memo 等优化手段。

**render 阶段的作用**

首先来思考一个问题，组件在一次更新中，类组件执行 render ，执行函数组件 renderWithHooks （ renderWithHook 内部执行 React 函数组件本身），他们的作用是什么呢？ 他们真实渲染了 DOM 了吗？显然不是，真实 DOM 是在 commit  阶段挂载的，之前章节打印过 render 后的内容。

那么**render的作用** **是根据一次更新中产生的新状态值，通过 React.createElement  ，替换成新的状态，得到新的 React element 对象**，新的 element 对象上，保存了最新状态值。 createElement  会产生一个全新的props。到此 render 函数使命完成了。

接下来，React 会调和由 render 函数产生 chidlren，将子代 element 变成  fiber（这个过程如果存在  alternate，会复用 alternate 进行克隆，如果没有 alternate ，那么将创建一个），将 props 变成  pendingProps ，至此当前组件更新完毕。然后如果 children 是组件，会继续重复上一步，直到全部 fiber 调和完毕。完成  render 阶段。

### 10.2 React 几种控制 render 方法

React 提供了几种控制 render 的方式。我这里会介绍原理和使用。说到对render 的控制，究其本质，主要有以下两种方式：

- 第一种就是从父组件直接隔断子组件的渲染，经典的就是 memo，缓存 element 对象。
- 第二种就是组件从自身来控制是否 render ，比如：PureComponent ，shouldComponentUpdate 。

#### 10.2.1 缓存 React.element 对象

第一种是对 React.element 对象的缓存。这是一种父对子的渲染控制方案，来源于一种情况，父组件 render ，子组件有没有必要跟着父组件一起 render ，如果没有必要，则就需要阻断更新流，如下先举两个小例子🌰：

```jsx
function Children({ number }) {
  console.log("子组件渲染");
  return <div>let us learn react {number}</div>;
}
Children.propTypes = {
  number: PropTypes.number,
};

// 父组件
export class StoreReactElementDemo1 extends React.Component {
  state = {
    numberA: 0,
    numberB: 0,
  };

  render() {
    return (
      <div>
        <Children number={this.state.numberA} />
        <button
          onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
        >
          改变numberA -{this.state.numberA}
        </button>
        <button
          onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
        >
          改变numberB -{this.state.numberB}
        </button>
      </div>
    );
  }
}
```

![缓存 React.element 对象1](https://s2.loli.net/2022/03/07/uUMxSNt3Oaby6nA.gif)

那么怎么样用缓存 element 来避免 children 没有必要的更新呢？将如上父组件做如下修改。

```jsx
export class StoreReactElementDemo2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numberA: 0,
      numberB: 0,
    };
    this.component = <Children number={this.state.numberA} />;
  }

  constrolComponentRender = () => {
    const { props } = this.component;
    /* 只有 numberA 变化的时候，重新创建 element 对象  */
    if (props.number != this.state.numberA) {
      return (this.component = React.cloneElement(this.component, {
        number: this.state.numberA,
      }));
    }
    return this.component;
  };

  render() {
    return (
      <div>
        {this.constrolComponentRender()}
        <button
          onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
        >
          改变numberA -{this.state.numberA}
        </button>
        <button
          onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
        >
          改变numberB -{this.state.numberB}
        </button>
      </div>
    );
  }
}
```

- 首先把 Children 组件对应的 element 对象，挂载到组件实例的 component 属性下。
- 通过 controllComponentRender 控制渲染 Children 组件，如果 numberA 变化了，证明  Children的props 变化了，那么通过 cloneElement  返回新的 element 对象，并重新赋值给 component  ，如果没有变化，那么直接返回缓存的 component 。

![缓存 React.element 对象2](https://s2.loli.net/2022/03/07/4ItEi1cyDb9OwdZ.gif)

**完美达到效果**

这里不推荐在 React 类组价中这么写。推荐大家在函数组件里用 `useMemo` 达到同样的效果，代码如下所示。

```jsx
export const StoreReactElementDemo3 = () => {
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      {(React.useMemo(() => <Children number={numberA} />), [numberA])}
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
    </div>
  );
};
```

用 React.useMemo 可以达到同样的效果， 需要更新的值 numberA 放在 deps 中，numberA  改变，重新形成element对象，否则通过 useMemo 拿到上次的缓存值。达到如上同样效果。比起类组件，更推荐函数组件用 useMemo  这种方式。

- **useMemo 的用法**

    ```js
    const cacheSomething = useMemo(create,deps)
    ```

    - `create`：第一个参数为一个函数，函数的返回值作为缓存值，如上 demo 中把 Children 对应的 element 对象，缓存起来。
    - `deps`： 第二个参数为一个数组，存放当前 useMemo 的依赖项，在函数组件下一次执行的时候，会对比 deps 依赖项里面的状态，是否有改变，如果有改变重新执行 create ，得到新的缓存值。
    - `cacheSomething`：返回值，执行 create 的返回值。如果 deps 中有依赖项改变，返回的重新执行 create 产生的值，否则取上一次缓存值。

- **useMemo 原理**

    useMemo 会记录上一次执行 create 的返回值，并把它绑定在函数组件对应的 fiber 对象上，只要组件不销毁，缓存值就一直存在，但是 deps 中如果有一项改变，就会重新执行 create ，返回值作为新的值记录到 fiber 对象上。

    所以，即使 deps 变了，而函数组件的render没有改变，也会重新 render

    ```jsx
    function Children2({ numberA, numberB }) {
      console.log("子组件渲染 numberA:", numberA);
      console.log("子组件渲染 numberB:", numberB);
      return <div>let us learn react {numberA}</div>;
    }
    Children2.propTypes = {
      numberA: PropTypes.number,
      numberB: PropTypes.number,
    };

    export const UseMemoDemo1 = () => {
      const [numberA, setNumberA] = React.useState(0);
      const [numberB, setNumberB] = React.useState(0);
      return (
        <div>
          {React.useMemo(
            () => (
              <Children2 numberA={numberA} numberB={numberB} />
            ),
            [numberA, numberB]
          )}
          <button onClick={() => setNumberA(numberA + 1)}>
            改变numberA: {numberA}
          </button>
          <button onClick={() => setNumberB(numberB + 1)}>
            改变numberB {numberB}
          </button>
        </div>
      );
    };
    ```

    ![useMemo原理1](https://s2.loli.net/2022/03/07/gYuEi3A6DsWhnzV.gif)

- **useMemo 应用场景**

    - 可以缓存 element 对象，从而达到按条件渲染组件，优化性能的作用。
    - 如果组件中不期望每次 render 都重新计算一些值,可以利用 useMemo 把它缓存起来。
    - 可以把函数和属性缓存起来，作为 PureComponent 的绑定方法，或者配合其他Hooks一起使用。

**缓存 React.element 对象的原理**

原理很简单，上述每次执行 render 本质上 createElement 会产生一个新的 props，这个 props 将作为对应 fiber 的 `pendingProps` ，在此 fiber 更新调和阶段，React 会对比 fiber 上老 oldProps 和新的 newProp （ pendingProps ）是否相等，如果相等函数组件就会放弃子组件的调和更新，从而子组件不会重新渲染；如果上述把 element 对象缓存起来，上面 props  也就和 fiber 上 oldProps 指向相同的内存空间，也就是相等，从而跳过了本次更新。

#### 10.2.2 PureComponent

纯组件是一种发自组件本身的渲染优化策略，当开发类组件选择了继承 PureComponent ，就意味这要遵循其渲染规则。规则就是**浅比较 state 和 props 是否相等**。 PureComponent 的基本使用。

```jsx
import React from "react";

class Children extends React.PureComponent {
  state = {
    name: "zxh",
    age: 24,
    obj: {
      number: 1,
    },
  };
  changeObjNumber = () => {
    const { obj } = this.state;
    obj.number++;
    this.setState({ obj: { ...obj } });
  };
  render() {
    console.log("组件渲染");
    return (
      <div>
        <div> 组件本身改变state </div>
        <button onClick={() => this.setState({ name: "zxh" })}>
          state相同情况
        </button>
        <button onClick={() => this.setState({ age: this.state.age + 1 })}>
          state不同情况
        </button>
        <button onClick={this.changeObjNumber}>state为引用数据类型时候</button>
        <div>hello,my name is alien,let us learn React!</div>
      </div>
    );
  }
}
/* 父组件 */
export function PureComponentDemo1() {
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <div> 父组件改变props </div>
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
      <Children number={numberA} />
    </div>
  );
}
```

![PureComponentDemo1](https://s2.loli.net/2022/03/08/mFhxZ2aNRQwUGAo.gif)

- 对于 props ，PureComponent 会浅比较 props 是否发生改变，再决定是否渲染组件，所以只有点击 numberA 才会促使组件重新渲染。
- 对于 state ，如上也会浅比较处理，当上述触发 ‘ state 相同情况’ 按钮时，组件没有渲染。
- 浅比较只会比较基础数据类型，对于引用类型，比如 demo 中 state 的 obj ，单纯的改变 obj  下属性是不会促使组件更新的，因为浅比较两次 obj 还是指向同一个内存空间，想要解决这个问题也容易，浅拷贝就可以解决，将如上  changeObjNumber 这么修改。这样就是重新创建了一个 obj ，所以浅比较会不相等，组件就会更新了。

```jsx
changeObjNumber=()=>{
    const { obj } = this.state
    obj.number++
    this.setState({ obj:{...obj} })
}
```

**PureComponent 原理及其浅比较原则**

PureComponent 内部是如何工作的呢，首先当选择基于 PureComponent 继承的组件。原型链上会有 isPureReactComponent 属性。

创建 PureComponent 时候：

```jsx
// react/src/ReactBaseClasses.js

/* pureComponentPrototype 纯组件构造函数的 prototype 对象，
*  绑定isPureReactComponent 属性。
*/
pureComponentPrototype.isPureReactComponent = true;
```

`isPureReactComponent` 这个属性在更新组件 `updateClassInstance` 方法中使用的，在生命周期章节中已经讲过，相信看过的同学都会有印象，这个函数在更新组件的时候被调用，在这个函数内部，有一个专门负责检查是否更新的函数  `checkShouldComponentUpdate` 。

```jsx
// react/react-reconciler/ReactFiberClassComponent.js

function checkShouldComponentUpdate(){
    if (typeof instance.shouldComponentUpdate === 'function') {
         /* shouldComponentUpdate 逻辑 */
        return instance.shouldComponentUpdate(newProps,newState,nextContext)
    }
    if (ctor.prototype && ctor.prototype.isPureReactComponent) {
        return  !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    }
}
```

- isPureReactComponent 就是判断当前组件是不是纯组件的，如果是 PureComponent 会浅比较 props 和 state 是否相等。
- 还有一点值得注意的就是 shouldComponentUpdate 的权重，会大于 PureComponent。
- shallowEqual 是如何浅比较的呢，过程如下：

shallowEqual 浅比较流程：

- 第一步，首先会直接比较新老 props 或者新老 state 是否相等。如果相等那么不更新组件。
- 第二步，判断新老 state 或者 props ，有不是对象或者为 null 的，那么直接返回 false ，更新组件。
- 第三步，通过 Object.keys 将新老 props 或者新老 state 的属性名 key 变成数组，判断数组的长度是否相等，如果不相等，证明有属性增加或者减少，那么更新组件。
- 第四步，遍历老 props 或者老 state ，判断对应的新 props 或新 state ，有没有与之对应并且相等的（这个相等是浅比较），如果有一个不对应或者不相等，那么直接返回 false ，更新组件。

**PureComponent注意事项**

PureComponent 可以让组件自发的做一层性能上的调优，但是，父组件给是 PureComponent 的子组件绑定事件要格外小心，避免两种情况发生：

1. **避免使用箭头函数**。不要给是 PureComponent 子组件绑定箭头函数，因为父组件每一次 render  ，如果是箭头函数绑定的话，都会重新生成一个新的箭头函数， PureComponent 对比新老 props  时候，因为是新的函数，所以会判断不相等，而让组件直接渲染，PureComponent 作用终会失效。

    ```jsx
    class Children2 extends React.PureComponent {
      render() {
        console.log("子组件 PureComponent render");
        return <div>这是子组件 PureComponents: {this.props.numberA}</div>;
      }
    }

    const callback = () => {};
    export class PureComponentDemo2 extends React.Component {
      state = {
        numberA: 1,
        numberB: 100,
      };
      render = () => (
        <div>
          <Children2 callback={()=>{}} numberA={this.state.numberA} />
          {/* <Children2 callback={callback} numberA={this.state.numberA} /> */}
          <button
            onClick={() => this.setState({ numberA: this.state.numberA + 1 })}
          >
            改变numberA
          </button>
          <button
            onClick={() => this.setState({ numberB: this.state.numberB + 1 })}
          >
            改变numberB
          </button>
        </div>
      );
    }
    ```

    ![PureComponentDemo2](https://s2.loli.net/2022/03/08/yun3oB9fbST4Zel.gif)

2. PureComponent 的父组件是函数组件的情况，绑定函数要用 useCallback 或者 useMemo  处理。这种情况还是很容易发生的，就是在用 class + function  组件开发项目的时候，如果父组件是函数，子组件是  PureComponent ，那么绑定函数要小心，因为函数组件每一次执行，如果不处理，还会声明一个新的函数，所以 PureComponent  对比同样会失效，如下情况：

    ```js
    class Children3 extends React.PureComponent {
      render() {
        console.log("子组件 PureComponent render");
        return <div>这是子组件 PureComponents: {this.props.numberA}</div>;
      }
    }

    export function PureComponentDemo3() {
      /* 每一次函数组件执行重新声明一个新的callback，PureComponent浅比较会认为不想等，促使组件更新  */
      const callback = function handlerCallback() {};
      const [numberA, setNumberA] = React.useState(0);
      const [numberB, setNumberB] = React.useState(0);
      return (
        <div>
          <div> 父组件改变props </div>
          <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
          <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
          <Children3 number={numberA} callback={callback} numberA={numberA} />
        </div>
      );
    }
    ```

​	·![PureComponentDemo3](https://s2.loli.net/2022/03/08/jHUc8aDJmw53zfM.gif)

综上可以用 useCallback 或者 useMemo 解决这个问题，useCallback 首选，这个 hooks 初衷就是为了解决这种情况的。

```jsx
export function PureComponentDemo4() {
  // 使用 useCallback
  const callback = React.useCallback(function handlerCallback() {}, []);
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <div> 父组件改变props </div>
      <button onClick={() => setNumberA(numberA + 1)}>改变numberA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变numberB</button>
      <Children3 number={numberA} callback={callback} numberA={numberA} />
    </div>
  );
}
```

![PureComponentDemo4](https://s2.loli.net/2022/03/08/bYhCqopuVn7szBF.gif)

useCallback 接受二个参数，第一个参数就是需要缓存的函数，第二个参数为deps, deps 中依赖项改变返回新的函数。如上处理之后，就能从根本上解决 PureComponent 失效问题。

**`useCallback` 和 `useMemo` 有什么区别？**

useCallback 第一个参数就是缓存的内容，useMemo 需要执行第一个函数，返回值为缓存的内容，比起 useCallback ，  useMemo 更像是缓存了一段逻辑，或者说执行这段逻辑获取的结果。那么对于缓存 element 用 useCallback  可以吗，答案是当然可以了。



#### 10.2.3 shouldComponentUpdate

有的时候，把控制渲染，性能调优交给 React 组件本身处理显然是靠不住的，React  需要提供给使用者一种更灵活配置的自定义渲染方案，使用者可以自己决定是否更新当前组件，shouldComponentUpdate  就能达到这种效果。在生命周期章节介绍了 shouldComponentUpdate 的用法，接下来试一下  shouldComponentUpdate 如何使用。

```jsx
import React from "react";

class Children extends React.Component {
  state = {
    numberA: 0,
    numberB: 0,
  };

  shouldComponentUpdate(newProps, newState, newContext) {
    /* 只有当 props 中 propsNumA 和 state 中 numberA 变化时，更新组件  */
    if (
      newProps.propsNumA !== this.props.propsNumA ||
      newState.numberA !== this.state.numberA
    ) {
      return true;
    }
    return false;
  }

  render() {
    console.log("组件渲染");
    const { numberA, numberB } = this.state;

    return (
      <div>
        <button onClick={() => this.setState({ numberA: numberA + 1 })}>
          改变state中 numberA
        </button>
        <button onClick={() => this.setState({ numberB: numberB + 1 })}>
          改变stata中 numberB
        </button>
        <div>hello,let us learn React!</div>
      </div>
    );
  }
}

export function ShouldComponentUpdate() {
  // 父组件
  const [numberA, setNumberA] = React.useState(0);
  const [numberB, setNumberB] = React.useState(0);
  return (
    <div>
      <button onClick={() => setNumberA(numberA + 1)}>改变props中numA</button>
      <button onClick={() => setNumberB(numberB + 1)}>改变props中numB</button>
      <Children propsNumA={numberA} propsNumB={numberB} />
    </div>
  );
}
```

![shouldComponentUpdateDemo1](https://s2.loli.net/2022/03/08/kSWNu9qVbCv3EZz.gif)

shouldComponentUpdate 可以根据传入的新的 props 和 state ，或者  newContext  来确定是否更新组件，如上面例子🌰，只有当 props 中 propsNumA 属性和 state 中 stateNumA  改变的时候，组件才渲染。但是有一种情况就是如果子组件的 props 是引用数据类型，比如 object  ，还是不能直观比较是否相等。那么如果想有对比新老属性相等，怎么对比呢，而且很多情况下，组件中数据可能来源于服务端交互，对于属性结构是未知的。

`immutable.js` 可以解决此问题，immutable.js 不可变的状态，对 Immutable  对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象。鉴于这个功能，所以可以把需要对比的 props 或者 state  数据变成 Immutable 对象，通过对比 Immutable 是否相等，来证明状态是否改变，从而确定是否更新组件。

对于 shouldComponentUpdate 生命周期篇章和上面都有提及，它的执行是在 checkShouldComponentUpdate，会执行此生命周期。

#### 10.2.4 React.memo

```js
React.memo(Component,compare)
```

React.memo 可作为一种容器化的控制渲染方案，可以对比 props 变化，来决定是否渲染组件，首先先来看一下 memo  的基本用法。React.memo 接受两个参数，第一个参数 Component 原始组件本身，第二个参数 compare  是一个函数，可以根据一次更新中 props 是否相同决定原始组件是否重新渲染。

memo的几个特点是：

- React.memo: 第二个参数 **返回 true 组件不渲染** ， 返回 false 组件重新渲染。和  shouldComponentUpdate 相反，shouldComponentUpdate : 返回 true 组件渲染 ， 返回 false 组件不渲染。
- memo 当二个参数 compare 不存在时，会用**浅比较原则**处理 props ，相当于仅比较 props 版本的 pureComponent 。
- memo 同样适合类组件和函数组件。

被 memo 包裹的组件，element 会被打成 `REACT_MEMO_TYPE` 类型的 element 标签，在 element 变成 fiber 的时候， fiber 会被标记成 MemoComponent 的类型。

```jsx
// react/src/ReactMemo.js

function memo(type,compare){
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,  // 我们的组件
    compare: compare === undefined ? null : compare,  //第二个参数，一个函数用于判断prop，控制更新方向。
  };
  return elementType
}
```

```js
// react-reconciler/src/ReactFiber.js

case REACT_MEMO_TYPE:
fiberTag = MemoComponent;
```

那么对于 MemoComponent React 内部又是如何处理的呢？首先 React 对 MemoComponent 类型的 fiber 有单独的更新处理逻辑 updateMemoComponent 。首先一起看一下主要逻辑：

```js
// react-reconciler/src/ReactFiberBeginWork.js

function updateMemoComponent(){
    if (updateExpirationTime < renderExpirationTime) {
        let compare = Component.compare;
        // 如果 memo 有第二个参数，则用二个参数判定，没有则浅比较props是否相等。
        compare = compare !== null ? compare : shallowEqual
        if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
            // 已经完成工作停止向下调和节点。
            return bailoutOnAlreadyFinishedWork(current,workInProgress,renderExpirationTime);
        }
    }
    // 返回将要更新组件,memo包装的组件对应的fiber，继续向下调和更新。
}
```

memo 主要逻辑是

- 通过 memo 第二个参数，判断是否执行更新，如果没有那么第二个参数，那么以浅比较 props 为 diff 规则。如果相等，当前 fiber 完成工作，停止向下调和节点，所以被包裹的组件即将不更新。
- memo 可以理解为包了一层的高阶组件，它的阻断更新机制，是通过控制下一级 children ，也就是 memo 包装的组件，是否继续调和渲染，来达到目的的。

一个小案例，利用 memo 做到自定义 props 渲染。 规则： 控制 props 中的 number 。

- 1 只有 number 更改，组件渲染。
- 2 只有 number 小于 5 ，组件渲染。

```jsx
import React from "react";

function TextDemo(props) {
  console.log("子组件渲染");
  return <div>hello world</div>;
}

const controlIsRender = (pre, next) => {
  return (
    pre.number === next.number ||
    (pre.number !== next.number && next.number > 5)
  );
};

const NewTextMemo = React.memo(TextDemo, controlIsRender);

export class ReactMemoDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 1,
      num: 1,
    };
  }

  render() {
    const { num, number } = this.state;
    return (
      <div>
        <div>
          改变num:当前值 {num}
          <button onClick={() => this.setState({ num: num + 1 })}>num++</button>
          <button onClick={() => this.setState({ num: num - 1 })}>num--</button>
        </div>
        <div>
          改变number:  当前值 {number}
          <button onClick={() => this.setState({ number: number + 1 })}>
            number ++
          </button>
          <button onClick={() => this.setState({ number: number - 1 })}>
            number --
          </button>
        <NewTextMemo num={num} number={number} />
      </div>
    );
  }
}
```



![ReactMemoDemo](https://s2.loli.net/2022/03/08/DkZ7AHwFLf1cjb4.gif)

memo 注意事项，像如下这样，一般情况下不要试图组件通过第二个参数直接返回 true 来阻断渲染。这样可能会造成很多麻烦。

```js
// 尽量不要这么尝试
const NewIndex = React.memo(Index,() => true )
```



#### 10.2.5 打破渲染限制

- **forceUpdate**。类组件更新如果调用的是 forceUpdate 而不是  setState ，会跳过 PureComponent  的浅比较和 shouldComponentUpdate 自定义比较。其原理是组件中调用 forceUpdate 时候，全局会开启一个  hasForceUpdate 的开关。当组件更新的时候，检查这个开关是否打开，如果打开，就直接跳过 shouldUpdate 。
- **context穿透**，上述的几种方式，都不能本质上阻断 context 改变，而带来的渲染穿透，所以开发者在使用 Context 要格外小心，既然选择了消费 context ，就要承担 context 改变，带来的更新作用。

#### 10.2.6 渲染控制流程图

![渲染控制流程图](https://s2.loli.net/2022/03/08/voHRGUl2qKJZhdY.png)

### 10.3 对于 render 的思考

#### 10.3.1 有没有必要在乎组件不必要渲染

在正常情况下，无须过分在乎 React 没有必要的渲染，要理解执行 render 不等于真正的浏览器渲染视图，render 阶段执行是在 js  当中，js 中运行代码远快于浏览器的 Rendering 和 Painting 的，更何况 React 还提供了 diff  算法等手段，去复用真实 DOM 。

#### 10.3.2  什么时候需要注意渲染节流

但是对于以下情况，值得开发者注意，需要采用渲染节流：

- 第一种情况数据可视化的模块组件（展示了大量的数据），这种情况比较小心因为一次更新，可能伴随大量的 diff ，数据量越大也就越浪费性能，所以 **对于数据展示模块组件，有必要采取 memo ， shouldComponentUpdate 等方案控制自身组件渲染**
- **第二种情况含有大量表单的页面**，React 一般会采用受控组件的模式去管理表单数据层，表单数据层完全托管于 props 或是 state ，而用户操作表单往往是频繁的，需要频繁改变数据层，所以很有可能让整个页面组件高频率 render 。
- 第三种情况就是越是靠近 app root 根组件越值得注意，根组件渲染会波及到整个组件树重新 render ，子组件 render  ，一是浪费性能，二是可能执行 useEffect ，componentWillReceiveProps 等钩子，造成意想不到的情况发生。

#### 10.3.3 一些开发中的细节问题

- 开发过程中对于大量数据展示的模块，开发者有必要用 shouldComponentUpdate ，PureComponent来优化性能。
- 对于表单控件，最好办法单独抽离组件，独自管理自己的数据层，这样可以让 state 改变，波及的范围更小。
- 如果需要更精致化渲染，可以配合 immutable.js 。
- 组件颗粒化，配合 memo 等 api ，可以制定私有化的渲染空间。


## 11. 渲染调优

 React 渲染过程中细节问题， Suspense 用法和原理，React.lazy 用法和配合 Suspense 实现代码分割，渲染错误边界、渲染异常的处理手段， 以及 diff 流程以及 key 的合理使用。

### 11.1 懒加载与异步渲染

#### 11.1.1 异步渲染

Suspense 是 React 提出的一种同步的代码来实现异步操作的方案。Suspense 让组件 **等待** 异步操作，异步请求结束后在进行组件的渲染，也就是所谓的异步渲染，但是这个功能目前还在实验阶段，相信不久这种异步渲染的方式就能和大家见面了。

- **Suspense用法**

    Suspense 是组件，有一个 fallback 属性，用来代替当 Suspense 处于 loading 状态下渲染的内容，Suspense 的 children 就是异步组件。多个异步组件可以用 Suspense 嵌套使用。

    ```jsx
    // 子组件
    function UserInfo() {
        // 获取用户数据信息，然后再渲染组件。
        const user = getUserInfo();
        return <h1>{user.name}</h1>;
    }
    // 父组件
    export default function Index(){
        return (
            <Suspense fallback={<h1>Loading...</h1>}>
                <UserInfo/>
            </Suspense>
        )
    }
    ```

    Suspense 包裹异步渲染组件 UserInfo ，当 UserInfo 处于数据加载状态下，展示 Suspense 中 fallback 的内容。

    如上所示，异步渲染的 UserInfo 组件可以直接通过 getUserInfo 请求数据，直接用数据 user  进行渲染，很显然现在是做不到的。现在的异步请求方式比较繁琐，主要是是通过类组件 componentDidMount 或者函数组件  useEffect 进行数据交互，获得数据后通过调用 setState 或 useState 改变 state 触发视图的更新。

    传统模式：挂载组件-> 请求数据 -> 再渲染组件。
     异步模式：请求数据-> 渲染组件。

    那么异步渲染相比传统数据交互相比好处就是：

    - 不再需要 componentDidMount 或 useEffect 配合做数据交互，也不会因为数据交互后，改变 state 而产生的二次更新作用。
    - 代码逻辑更简单，清晰。

#### 11.1.2 动态加载（懒加载）

现在的 Suspense 配合 React.lazy 可以实现动态加载功能。

- **React.lazy()**

    ```jsx
    const LazyComponent = React.lazy(()=>import('./text'))
    ```

    React.lazy 接受一个函数，这个函数需要动态调用 `import()` 。它必须返回一个 Promise ，该 Promise 需要 resolve 一个 default export 的 React 组件。

    基本使用：

    ```jsx
    const LazyComponent = React.lazy(() => import('./test.js'))

    export default function Index(){
       return <Suspense fallback={<div>loading...</div>} >
           <LazyComponent />
       </Suspense>
    }
    ```

    用 React.lazy 动态引入 test.js 里面的组件，配合 Suspense 实现动态加载组件效果。**这样很利于代码分割，不会让初始化的时候加载大量的文件。**

#### 11.1.3 **React.lazy和Suspense实现动态加载原理**

整个 render 过程都是同步执行一气呵成的，但是在 Suspense 异步组件情况下允许**调用 Render => 发现异步请求 => 悬停，等待异步请求完毕 => 再次渲染展示数据**。

那么整个流程是如何实现的，逐步分析一下：

- **Suspense原理：**

    Suspense 在执行内部可以通过 `try{}catch{}` 方式捕获异常，这个异常通常是一个 `Promise` ，可以在这个 Promise 中进行数据请求工作，Suspense 内部会处理这个 Promise ，Promise 结束后，Suspense 会再一次重新 render 把数据渲染出来，达到异步渲染的效果。

    ![suspense原理](https://s2.loli.net/2022/03/09/GOU34lFpSwAh2aK.png)

- **React.lazy原理：**

    再看一下 React.lazy，lazy 内部模拟一个 promiseA 规范场景。完全可以理解 React.lazy 用 Promise  模拟了一个请求数据的过程，但是请求的结果不是数据，而是一个动态的组件。下一次渲染就直接渲染这个组件，所以是 React.lazy 利用  Suspense **接收 Promise ，执行 Promise ，然后再渲染**这个特性做到动态加载的。说到这可能有很多同学不明白什么意思，不要紧，接下来通过以下代码加深一下对 lazy + susponse 的理解。

    ```jsx
    // react/src/ReactLazy.js

    function lazy(ctor){
        return {
            $$typeof: REACT_LAZY_TYPE,
            _payload:{
                _status: -1,  //初始化状态
                _result: ctor,
            },
            _init:function(payload){
                if(payload._status===-1){ /* 第一次执行会走这里  */
                    const ctor = payload._result;
                    const thenable = ctor();
                    payload._status = Pending;
                    payload._result = thenable;
                    thenable.then((moduleObject)=>{
                        const defaultExport = moduleObject.default;
                        resolved._status = Resolved; // 1 成功状态
                        resolved._result = defaultExport; /* defaultExport 为我们动态加载的组件本身  */
                    })
                }
                if(payload._status === Resolved){ // 成功状态
                    return payload._result;
                }
                else {  //第一次会抛出Promise异常给Suspense
                    throw payload._result;
                }
            }
        }
    }
    ```

    整个流程是这样的，React.lazy 包裹的组件会标记 `REACT_LAZY_TYPE` 类型的 element，在调和阶段会变成 LazyComponent 类型的 fiber ，React 对 LazyComponent 会有单独的处理逻辑：

    - 第一次渲染首先会执行 init 方法，里面会执行 lazy 的第一个函数，得到一个Promise，绑定 Promise.then 成功回调，回调里得到将要渲染组件 `defaultExport` ，这里要注意的是，如上面的函数当第二个 if 判断的时候，因为此时状态不是 Resolved ，所以会走 else ，抛出异常 Promise，抛出异常会让当前渲染终止。
    - 这个异常 Promise 会被 Suspense 捕获到，Suspense 会处理 Promise ，Promise 执行成功回调得到  defaultExport（将想要渲染组件），然后 Susponse 发起第二次渲染，第二次 init 方法已经是 Resolved  成功状态，那么直接返回 result 也就是真正渲染的组件。这时候就可以正常渲染组件了。

    ![React.lazy原理](https://s2.loli.net/2022/03/09/YUuQIwiVLFZn8Ps.png)

​

### 11.2 渲染错误边界

React 组件渲染过程如果有一个环节出现问题，就会导致整个组件渲染失败，那么整个组件的 UI 层都会显示不出来，这样造成的危害是巨大的，如果越靠近 APP 应用的根组件，渲染过程中出现问题造成的影响就越大，有可能直接造成白屏的情况。

```jsx
import React from "react";

function ErrorTest() {
  return;
}

function Test() {
  return <div>let us learn react</div>;
}

export class ErrorBoundaryDemo extends React.Component {
  componentDidCatch(...arg) {
    console.log(arg);
  }

  render() {
    return (
      <div>
        <ErrorTest />
        <div>hello, my name is zxh</div>
        <Test />
      </div>
    );
  }
}
```

造成错误，由于 ErrorTest 不是一个真正的组件但是却用来渲染，结果会造成整个 ErrorBoundaryDemo组件渲染异常，Test 也会受到牵连，UI 都不能正常显示。

为了防止如上的渲染异常情况 React 增加了 `componentDidCatch` 和 `static getDerivedStateFromError()` 两个额外的生命周期，去挽救由于渲染阶段出现问题造成 UI 界面无法显示的情况。

![error boundary](https://s2.loli.net/2022/03/09/pdYTgeIUJ4j3NBQ.png)

#### 11.2.1 componentDidCatch

componentDidCatch 可以捕获异常，它接受两个参数：

1. error —— 抛出的错误。

2. info —— 带有 componentStack key 的对象，其中包含有关组件引发错误的栈信息。

![生命周期 componentDidCatch 参数](https://s2.loli.net/2022/03/09/GvIejsQrSDwVmaC.png)

那么 componentDidCatch 中可以再次触发 setState，来降级UI渲染，componentDidCatch() 会在commit阶段被调用，因此允许执行副作用。

```jsx
export class ErrorBoundaryDemo extends React.Component {
  state = { hasError: false };
  componentDidCatch(...arg) {
    // uploadErrorLog(arg); // 上传错误日志
    console.log(arg);
    this.setState({ hasError: true });
  }

  render() {
    const { hasError } = this.state;
    return (
      <div>
        {/* <ErrorTest /> */}
        {hasError ? <div>组件出现错误</div> : <ErrorTest />}
        <div>hello, my name is zxh</div>
        <Test />
      </div>
    );
  }
}
```

![image-20220309104450491](https://s2.loli.net/2022/03/09/zIfphncqu24ldZV.png)

**componentDidCatch 作用**：

- 可以调用 setState 促使组件渲染，并做一些错误拦截功能。
- 监控组件，发生错误，上报错误日志。

#### 11.2.2 static getDerivedStateFromError

React更期望用 getDerivedStateFromError 代替 componentDidCatch  用于处理渲染异常的情况。getDerivedStateFromError 是静态方法，内部不能调用  setState。getDerivedStateFromError 返回的值可以合并到 state，作为渲染使用。用  getDerivedStateFromError 解决如上的情况。

```jsx
export class ErrorBoundaryDemo extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    const { hasError } = this.state;
    return (
      <div>
        {hasError ? <div>组件出现错误</div> : <ErrorTest />}
        <div>hello, my name is zxh</div>
        <Test />
      </div>
    );
  }
}
```

![image-20220309104717253](https://s2.loli.net/2022/03/09/SLVxDih1oYNJqOg.png)

如上完美解决了 ErrorTest 错误的问题。

注意事项： **如果存在 getDerivedStateFromError 生命周期钩子，那么将不需要 componentDidCatch 生命周期再降级 ui。**

### 11.3 从diff children看key的合理使用

上述内容讲了异步渲染和渲染错误边界，都是对一些特殊情况下渲染的处理。上章节讲到，大部分优化环节 React  都自己在内部处理了。但是有一种情况也值得开发者注意，那就是列表中 key 的使用。合理的使用 key 有助于能精准的找到用于新节点复用的老节点。 React 是如何 diff children 的呢。

首先 React 在一次更新中当发现通过 render 得到的 children 如果是一个数组的话。就会调用 reconcileChildrenArray 来调和子代 fiber ，整个对比的流程就是在这个函数中进行的。

**diff children 流程**

- **第一步：遍历新 children ，复用 oldFiber**

    ```jsx
    function reconcileChildrenArray(){
        /* 第一步  */
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
            } else {
                nextOldFiber = oldFiber.sibling;
            }
            const newFiber = updateSlot(returnFiber,oldFiber,newChildren[newIdx],expirationTime,);
            if (newFiber === null) { break }
            // ..一些其他逻辑
        }
        if (shouldTrackSideEffects) {  // shouldTrackSideEffects 为更新流程。
            /* 找到了与新节点对应的fiber，但是不能复用，那么直接删除老节点 */
            if (oldFiber && newFiber.alternate === null) {
                deleteChild(returnFiber, oldFiber);
            }
        }
    }
    }
    ```

    - 第一步对于 React.createElement 产生新的 child 组成的数组，首先会遍历数组，因为 fiber  对于同一级兄弟节点是用 sibling 指针指向，所以在遍历children 遍历，sibling 指针同时移动，找到与 child 对应的  oldFiber 。
    - 然后通过调用 updateSlot ，updateSlot 内部会判断当前的 tag 和 key 是否匹配，如果匹配复用老 fiber 形成新的 fiber ，如果不匹配，返回 null ，此时 newFiber 等于 null 。
    - 如果是处于更新流程，找到与新节点对应的老 fiber ，但是不能复用 `alternate === null `，那么会删除老 fiber 。

- **第二部：统一删除oldfiber**

    ```jsx
    if (newIdx === newChildren.length) {
        deleteRemainingChildren(returnFiber, oldFiber);
        return resultingFirstChild;
    }
    ```

    - 第二步适用于以下情况，当第一步结束完 `newIdx === newChildren.length` 此时证明所有 newChild 已经全部被遍历完，那么剩下没有遍历 oldFiber 也就没有用了，那么调用 deleteRemainingChildren 统一删除剩余 oldFiber 。

    - 情况一：节点删除

        - **oldChild: A B C D**
        - **newChild: A B**

        A , B 经过第一步遍历复制完成，那么 newChild 遍历完成，此时 C D 已经没有用了，那么统一删除 C D。

- **第三步：统一创建newFiber**

    ```jsc
    if(oldFiber === null){
       for (; newIdx < newChildren.length; newIdx++) {
           const newFiber = createChild(returnFiber,newChildren[newIdx],expirationTime,)
           // ...
       }
    }
    ```

    第三步适合如下的情况，当经历过第一步，oldFiber 为 null ， 证明 oldFiber 复用完毕，那么如果还有新的 children ，说明都是新的元素，只需要调用 createChild 创建新的 fiber 。

    情况二：节点增加

    - **oldChild: A B**
    - **newChild: A B C D**

    A B 经过第一步遍历复制完，oldFiber 没有可以复用的了，那么直接创建 C D。

- **第四步：针对发生移动和更复杂的情况**

    ```jsx
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
    for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = updateFromMap(existingChildren,returnFiber)
        /* 从mapRemainingChildren删掉已经复用oldFiber */
    }
    ```

    - mapRemainingChildren 返回一个 map ，map 里存放剩余的老的 fiber 和对应的 key (或 index )的映射关系。

    - 接下来遍历剩下没有处理的 Children ，通过 updateFromMap ，判断 mapRemainingChildren 中有没有可以复用 oldFiber ，如果有，那么复用，如果没有，新创建一个 newFiber 。

    - 复用的 oldFiber 会从 mapRemainingChildren 删掉

    情况三：节点位置改变

    - **oldChild: A B C D**
    - **newChild: A B D C**

    如上 A B 在第一步被有效复用，第二步和第三步不符合，直接进行第四步，C D 被完全复用，existingChildren 为空。

- **第五步：删除剩余没有复用的oldFiber**

    ```js
    if (shouldTrackSideEffects) {
        /* 移除没有复用到的oldFiber */
        existingChildren.forEach(child => deleteChild(returnFiber, child));
    }
    ```

    最后一步，对于没有复用的 oldFiber ，统一删除处理。

    情况四：复杂情况(删除 + 新增 + 移动)

    - **oldChild: A B C D**
    - **newChild: A E D B**

    首先 A 节点，在第一步被复用，接下来直接到第四步，遍历 newChild ，E被创建，D B 从 existingChildren 中被复用，existingChildren 还剩一个 C 在第五步会删除 C ，完成整个流程

**关于diffChild思考和key的使用**

1. React diffChild 时间复杂度 O(n^3) 优化到 O(n)。

2. React key 最好选择唯一性的id，如上述流程，如果选择 Index 作为 key ，如果元素发生移动，那么从移动节点开始，接下来的 fiber 都不能做得到合理的复用。 index 拼接其他字段也会造成相同的效果

### 11.4 实践 - React.lazy + Susponse模拟异步组件功能

**实现效果：**

- 异步组件要实现的功能，异步请求数据，请求完数据再挂载组件。没有加载完数据显示 loading 效果。
- 可量化生产。

**主要思路：**

- 可以使用 React.lazy 实现动态加载，那么可以先请求数据，然后再加载组件，这时候以 props 形式将数据传递给目标组件，实现异步效果。

```jsx
function AysncComponent(Component, api) {
  const AysncComponentPromise = () =>
    new Promise(async (resolve) => {
      const data = await api();
      resolve({
        default: (props) => <Component rdata={data} {...props} />,
      });
    });
  return React.lazy(AysncComponentPromise);
}
```

**思路：**

- 用 AysncComponent 作为一个 HOC 包装组件，接受两个参数，第一个参数为当前组件，第二个参数为请求数据的 api 。
- 声明一个函数给 React.lazy 作为回调函数，React.lazy 要求这个函数必须是返回一个 Promise 。在 Promise 里面通过调用 api 请求数据，然后根据返回来的数据 rdata 渲染组件，别忘了接受并传递 props 。

**使用：**

```jsx
const getData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: "zxh", say: "let us learn react" });
    }, 1000);
  });
};

function Test({ rdata, age }) {
  const { name, say } = rdata;
  console.log("组件渲染");
  return (
    <div>
      <div> hello , my name is {name} </div>
      <div>age : {age} </div>
      <div> i want to say {say} </div>
    </div>
  );
}
Test.propTypes = {
  rdata: PropTypes.object,
  age: PropTypes.number,
};

export class ReactLazySuspecePractice extends React.Component {
  /* 需要每一次在组件内部声明，保证每次父组件挂载，都会重新请求数据 ，防止内存泄漏。 */
  LazyTest = AysncComponent(Test, getData);
  render() {
    const { LazyTest } = this;

    return (
      <div>
        <React.Suspense fallback={<div>loading...</div>}>
          <LazyTest age={18} />
        </React.Suspense>
      </div>
    );
  }
}
```

**效果：**

![ReactLazySuspense实践](https://s2.loli.net/2022/03/09/JuGmcSTaMWvLiqD.gif)


## 12. 处理海量数据

 React 对于大量数据的处理方案，对于项目中大量数据通常存在两种情况：

- 第一种就是数据可视化，比如像热力图，地图，大量的数据点位的情况。
- 第二种情况是长列表渲染。

### 12.1 时间分片

**时间分片主要解决，初次加载，一次性渲染大量数据造成的卡顿现象**。

**浏览器执 js 速度要比渲染 DOM 速度快的多。**时间分片，并没有本质减少浏览器的工作量，而是把一次性任务分割开来，给用户一种流畅的体验效果。就像造一个房子，如果一口气完成，那么会把人累死，所以可以设置任务，每次完成任务一部分，这样就能有效合理地解决问题。

所以接下来实践一个时间分片的 demo ，一次性加载 20000 个元素块，元素块的位置和颜色是随机的。首先假设对 demo 不做任何优化处理。

色块组件：

```jsx
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
  //用 useMemo缓存，计算出来的随机位置和色值
  const style = React.useMemo(() => {
    return {
      background: getColor(),
      ...getPostion(position),
    };
  }, []);

  return <div style={style} className="circle"></div>;
}
```

子组件接受父组件的位置范围信息。并通过 useMemo 缓存计算出来随机的颜色，位置，并绘制色块。

父组件：

```jsx
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
  };
  return (
    <div>
      {btnShow && <button onClick={handleClick}>show</button>}
      {show && <TimeSliceDemo />}
    </div>
  );
};
```

父组件在 componentDidMount 模拟数据交互，用ref获取真实的DOM元素容器的宽高，渲染列表。

效果：

![没有时间分片](https://s2.loli.net/2022/03/10/mIJ9AzHSOGEXjoK.gif)

可以直观看到这种方式渲染的速度特别慢，而且是一次性突然出现，体验不好，所以接下来要用时间分片做性能优化。

```jsx
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
```

- 第一步：计算时间片，首先用 eachRenderNum 代表一次渲染多少个，那么除以总数据就能得到渲染多少次。
- 第二步：开始渲染数据，通过 `index>times` 判断渲染完成，如果没有渲染完成，那么通过 requestIdleCallback 代替 setTimeout 浏览器空闲执行下一帧渲染。
- 第三步：通过 renderList 把已经渲染的 element 缓存起来，渲染控制章节讲过，这种方式可以直接跳过下一次的渲染。实际每一次渲染的数量仅仅为 demo 中设置的 500 个。

完美达到效果（这个是 gif 形式，会出现丢帧的情况，在真实场景，体验感更好）：

![时间分片](https://s2.loli.net/2022/03/10/JL23afwzy8lg1Nn.gif)

### 12.2 虚拟列表

虚拟列表是一种长列表的解决方案，现在滑动加载是 M 端和 PC  端一种常见的数据请求加载场景，这种数据交互有一个问题就是，如果没经过处理，加载完成后数据展示的元素，都显示在页面上，如果伴随着数据量越来越大，会使页面中的 DOM 元素越来越多，即便是像 React 可以良好运用 diff 来复用老节点，但也不能保证大量的 diff  带来的性能开销。所以虚拟列表的出现，就是解决大量 DOM 存在，带来的性能问题。

何为虚拟列表，就是在长列表滚动过程中，只有视图区域显示的是真实 DOM ，滚动过程中，不断截取视图的有效区域，让人视觉上感觉列表是在滚动。达到无限滚动的效果。

虚拟列表划分可以分为三个区域：视图区 + 缓冲区 + 虚拟区。

![虚拟列表](https://s2.loli.net/2022/03/10/DU8vnAwdYI5klGp.png)

- 视图区：视图区就是能够直观看到的列表区，此时的元素都是真实的 DOM 元素。
- 缓冲区：缓冲区是为了防止用户上滑或者下滑过程中，出现白屏等效果。（缓冲区和视图区为渲染真实的 DOM ）
- 虚拟区：对于用户看不见的区域（除了缓冲区），剩下的区域，不需要渲染真实的 DOM 元素。虚拟列表就是通过这个方式来减少页面上 DOM 元素的数量。

具体实现思路。

- 通过 useRef 获取元素，缓存变量。
- useEffect 初始化计算容器的高度。截取初始化列表长度。这里需要 div 占位，撑起滚动条。
- 通过监听滚动容器的 onScroll 事件，根据 scrollTop 来计算渲染区域向上偏移量, 这里需要注意的是，当用户向下滑动的时候，为了渲染区域，能在可视区域内，可视区域要向上滚动；当用户向上滑动的时候，可视区域要向下滚动。
- 通过重新计算 end 和 start 来重新渲染列表。

![虚拟列表](https://s2.loli.net/2022/03/10/OcXmqW91hMaik7J.gif)



## 13. 细节处理

### 13.1 React 中的防抖与节流

- **防抖**

    防抖和节流在 React 应用中是很常用的，防抖很适合 React 表单的场景，比如点击按钮防抖，search 输入框。举一个简单的例子。

    ```jsx
    export class DebounceDemo extends React.Component {
      constructor(props) {
        super(props);
      }
      handleClick = () => {
        console.log("点击事件-表单提交-调用接口");
      };
      handleChange = (e) => {
        console.log("搜索框-请求数据");
      };
      render() {
        return (
          <div>
            <input placeholder="搜索表单" onChange={this.handleChange} />
            <br />
            <button onClick={this.handleClick}> 点击 </button>
          </div>
        );
      }
    }
    ```

    如上，当点击按钮的时候，向服务端发起数据交互；输入 input 时候，同样会向服务端进行数据交互，请求搜索的数据。对于如上的情况如果不做任何优化处理的话，连续点击按钮，或者 input 输入内容的时候，就会出现这种情况。

    ![没有防抖](https://s2.loli.net/2022/03/10/2wEDrQ6BmftzPoK.gif)

    如上，会频繁和服务端交互，很显然这种情况是不符合常理的。所以需要防抖处理。

    ```js
    constructor(props){
        super(props)
        this.handleClick = debounce(this.handleClick,500)  /* 防抖 500 毫秒  */
        this.handleChange = debounce(this.handleChange,300) /* 防抖 300 毫秒 */
    }
    ```

    ![使用防抖](https://s2.loli.net/2022/03/10/lJYLhTVbpegqnBd.gif)

- **节流**

    节流函数一般也用于频繁触发的事件中，比如监听滚动条滚动。

    ```jsx
    export function ThrottleDemo() {
      /* useCallback 防止每次组件更新都重新绑定节流函数  */
      const handleScroll = React.useCallback(
        throttle(function () {
          /* 可以做一些操作，比如曝光上报等 */
        }, 300)
      );
      return (
        <div className="scrollIndex" onScroll={handleScroll}>
          <div className="scrollContent">hello,world</div>
        </div>
      );
    }
    ```

    如上将监听滚动函数做节流处理，300 毫秒触发一次。用 useCallback 防止每一次组件更新重新绑定节流函数。

防抖节流总结：

- **防抖函数**一般用于表单搜索，点击事件等场景，**目的就是为了防止短时间内多次触发事件**。
- **节流函数一般为了降低函数执行的频率**，比如滚动条滚动。

### 13.2 按需引入

按需引入本质上是为项目瘦身，开发者在做 React 项目的时候，会用到 antd 之类的 UI 库，值得思考的一件事是，开发者如果只是用到了  antd 中的个别组件，比如 Button，就要把整个样式库引进来，打包就会发现，体积因为引入了整个样式文件大了很多。所以可以通过 `.babelrc` 实现按需引入。

瘦身前体积：

![按需引入之前文件大小 (2)](https://s2.loli.net/2022/03/10/S6v1wBnrGALP3dy.png)

.babelrc 增加对 antd 样式按需引入：

```json
["import", {
    "libraryName":
    "antd",
    "libraryDirectory": "es",
    "style": true
}]
```

瘦身后体积：

![按需引入之后文件大小 (2)](https://s2.loli.net/2022/03/10/mMJW3I4bn2DGc9T.png)

### 13.3 React 动画

React 写动画也是一个比较棘手的问题。高频率的 setState 会给应用性能带来挑战，这种情况在 M 端更加明显，因为 M  端的渲染能力受到手机性能的影响较大。所以对 React 动画的处理要格外注意。我这里总结了三种 React 使用动画的方式，以及它们的权重。

#### 13.3.1 首选 动态添加类名

第一种方式是通过 transition，animation 实现动画然后写在 class 类名里面，通过动态切换类名，达到动画的目的。

```jsx
import React from "react";
import "./react_animation.css";

export function DynamicAddClassName() {
  const [isAnimation, setAnimation] = React.useState(false);
  return (
    <div>
      <button onClick={() => setAnimation(true)}>改变颜色</button>
      <div className={isAnimation ? "current animation" : "current"}></div>
    </div>
  );
}
```

```css
.current {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #ccc;
}

.animation {
  animation: 1s changeColor;
  background: yellowgreen;
}

@keyframes changeColor {
  0% {
    background: #c00;
  }

  50% {
    background: orange;
  }

  100% {
    background: yellowgreen;
  }
}
```

![动态添加类名](https://s2.loli.net/2022/03/10/pnBzmofFJVLGEbe.gif)

这种方式是最优先推荐的方式，这种方式既不需要频繁 setState ，也不需要改变 DOM 。

#### 13.3.2 其次 操纵原生 DOM

如果第一种方式不能满足要求的话，或者必须做一些 js 实现复杂的动画效果，那么可以获取原生 DOM ，然后单独操作 DOM 实现动画功能，这样就避免了 setState  改变带来 React Fiber 深度调和渲染的影响。

```jsx
export function ManipulateNativeDOM() {
  const dom = React.useRef(null);
  const changeColor = () => {
    const target = dom.current;
    target.style.background = "#c00";
    setTimeout(() => {
      target.style.background = "orange";
      setTimeout(() => {
        target.style.background = "yellowgreen";
      }, 500);
    }, 500);
  };
  return (
    <div>
      <button onClick={changeColor}>改变颜色</button>
      <div className="current" ref={dom}></div>
    </div>
  );
}
```

同样达到如上的效果

#### 13.3.3 再者 setState + CSS3

如果 ①  和 ②  都不能满足要求，一定要使用 setState 实时改变DOM元素状态的话，那么尽量采用 css3 ， css3 开启硬件加速，使 GPU (Graphics Processing Unit) 发挥功能，从而提升性能。

比如想要改变元素位置 left ，top 值，可以换一种思路通过改变 transform: translate，**transform 是由 GPU 直接控制渲染的，所以不会造成浏览器的重排。**

```jsx
export function SetStateCSS3() {
  const [position, setPosition] = React.useState({ left: 0, top: 0 });
  const changePosition = () => {
    let time = 0;
    let timer = setInterval(() => {
      if (time === 30) clearInterval(timer);
      setPosition({ left: time * 10, top: time * 10 });
      time++;
    }, 30);
  };
  const { left, top } = position;
  return (
    <div>
      <button onClick={changePosition}>改变位置</button>
      <div
        className="current"
        style={{ transform: `translate(${left}px,${top}px )` }}
      ></div>
    </div>
  );
}
```

![SetStateCSS3](https://s2.loli.net/2022/03/10/KbDXNfwQLm5gYOR.gif)

### 13.4 及时清除定时器/延时器/监听器

如果在 React 项目中，用到了定时器，延时器和事件监听器，注意要在对应的生命周期，清除它们，不然可能会造成内部泄露的情况。

```jsx
export class ClearInTimeDemo extends React.Component {
  current = null;
  poll = () => {}; /* 轮训 */
  handleScroll = () => {}; /* 处理滚动事件 */
  componentDidMount() {
    this.timer = setInterval(() => {
      this.poll(); /* 2 秒进行一次轮训事件 */
    }, 2000);
    this.current.addEventListener("scroll", this.handleScroll);
  }
  componentWillUnmount() {
    clearInterval(this.timer); /* 清除定时器 */
    this.current.removeEventListener("scroll", this.handleScroll);
  }
  render() {
    return (
      <div ref={(node) => (this.current = node)}>hello,let us learn React!</div>
    );
  }
}
```

在 componentWillUnmount 生命周期及时清除延时器和事件监听器。

```jsx
export function ClearInTimeDemo2() {
  const dom = React.useRef(null);
  const poll = () => {};
  const handleScroll = () => {};
  React.useEffect(() => {
    let timer = setInterval(() => {
      poll(); /* 2 秒进行一次轮训事件 */
    }, 2000);
    dom.current.addEventListener("scroll", handleScroll);
    return function () {
      clearInterval(timer);
      dom.current.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return <div ref={dom}>hello,let us learn React!</div>;
}
```

在 useEffect 或者 useLayoutEffect 第一个参数 create 的返回函数 destory 中，做一些清除定时器/延时器的操作。

### 13.5 合理使用 state

React 并不像 vue 那样响应式数据流。 在 vue 中有专门的 dep 做依赖收集，可以自动收集字符串模版的依赖项，只要没有引用的 data 数据， 通过 `this.aaa = bbb` ，在 vue 中是不会更新渲染的。**但是在 React 中只要触发 setState 或 useState  ，如果没有渲染控制的情况下，组件就会渲染，暴露一个问题就是，如果视图更新不依赖于当前 state  ，那么这次渲染也就没有意义。所以对于视图不依赖的状态，就可以考虑不放在 state 中。**

打个比方，比如想在滚动条滚动事件中，记录一个 scrollTop 位置，那么在这种情况下，用 state 保存 scrollTop 就没有任何意义而且浪费性能。

```jsx
export class ProperUseState extends React.Component {
  node = null;
  scrollTop = 0;
  handleScroll = () => {
    const { scrollTop } = this.node;
    this.scrollTop = scrollTop;
  };
  render() {
    return (
      <div
        ref={(node) => (this.node = node)}
        onScroll={this.handleScroll}
      ></div>
    );
  }
}
```

上述把 scrollTop 直接绑定在 this 上，而不是通过 state 管理，这样好处是滚动条滚动不需要触发 setState ，从而避免了无用的更新。

对于函数组件，因为不存在组件实例，但是函数组件有 hooks ，所以可以通过一个 useRef 实现同样的效果。

```jsx
export function ProperUseStateFn() {
  const dom = React.useRef(null);
  const scrollTop = React.useRef(0);
  const handleScroll = () => {
    scrollTop.current = dom.current.scrollTop;
  };
  return <div ref={dom} onScroll={handleScroll}></div>;
}
```

如上用 useRef ，来记录滚动条滚动时 scrollTop 的值。

### 13.6 建议不要在 hooks 的参数中执行函数或者 new 实例

有一种场景是平时比较容易忽略的，就是在 `hooks` 的参数中执行函数或者 new 实例，比如如下这样：

```js
const hook1 = useRef(fn())
const hook2 = useRef(new Fn())
```

不建议这么写。为什么呢？

- 首先函数每次 `rerender` 都会执行 hooks ，那么在执行 hooks 函数的同时，也会执行函数的参数，比如上面的代码片段中的 `fn()` 和 `new Fn()`，也就是每一次 rerender 都会执行 fn 或者是 new 一个实例。这可能不是开发者期望的，而执行函数，或创建实例也成了一种性能浪费，在一些极端情况下，可能会造成内存泄漏，比如在创建新的 dom 元素，但是没有进行有效的回收。
- 在 hooks 原理章节讲到过，函数组件在**初始化**和**更新**流程中，会使用不同的 hooks 对象，还是以 `useRef` 为例子，在初始化阶段用的是 `mountRef`函数，在更新阶段用的是 `updateRef`函数，开发者眼睛看见的是 `useRef`，在 React 底层却悄悄的替换成了不同的函数。 **更重要的是大部分的 hooks 参数都作为初始化的参数，在更新阶段压根没有用到，那么传入的参数也就没有了意义**，回到上述代码片段，`fn()` 和 `new Fn()`在更新阶段根本就没有被 `useRef`接收， 无辜的成了流浪者。

还是以 `useRef` 为例子，看一下它在不同阶段的真正面目

**初始化**

```js
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}
```

初始化的时候用到了 initialValue ，也就是第一个参数。

**更新阶段**

```js
function updateRef(initialValue) {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

在更新阶段根本没有用到 initialValue。

那么回到最初的目的上来，如果开发者真的想在 hooks 中，以函数组件执行结果或者是实例对象作为参数的话，那么应该怎么处理呢。这个很简单，可以用 useMemo 包装一下。比如：

```js
const hook = useRef(null)
const value = useMemo(()=>{
     hook.current = new Fn()
},[ changeValue ])
```

如上，通过 useMemo 派生出来的 value ，作为初始化 Ref 的值，这样做还有一个好处，如果 Ref 的值，依赖于 `changeValue` ，当 changeValue 改变的时候，会重新给 Ref 对象赋值。


## 14. 事件原理

- React 为什么有自己的事件系统？
- 什么是事件合成 ？
- 如何实现的批量更新？
- 事件系统如何模拟冒泡和捕获阶段？
- 如何通过 dom 元素找到与之匹配的fiber？
- 为什么不能用 return false 来阻止事件的默认行为？
- 事件是绑定在真实的dom上吗？如何不是绑定在哪里？
- V17 对事件系统有哪些改变？

**在 React 应用中，我们所看到的React事件都是‘假’的！**

- 1 给元素绑定的事件，不是真正的事件处理函数。
- 2 在冒泡/捕获阶段绑定的事件，也不是在冒泡/捕获阶段执行的。
- 3 甚至在事件处理函数中拿到的事件源 e ，也不是真正的事件源 e 。

React 为什么要写出一套自己的事件系统呢？

- 首先，对于不同的浏览器，对事件存在不同的兼容性，React 想实现一个**兼容全浏览器**的框架， 为了实现这个目标就需要创建一个兼容全浏览器的事件系统，以此抹平不同浏览器的差异。

- 其次，**v17 之前 React 事件都是绑定在 document 上，v17 之后 React 把事件绑定在应用对应的容器  container 上**，将事件绑定在同一容器统一管理，防止很多事件直接绑定在原生的 DOM 元素上。造成一些不可控的情况。由于不是绑定在真实的  DOM 上，所以 React 需要模拟一套事件流：事件捕获-> 事件源 -> 事件冒泡，也包括重写一下事件源对象 event 。

- 最后，这种事件系统，大部分处理逻辑都在底层处理了，这对后期的 ssr 和跨端支持度很高。

### 14.1 独特的事件处理

- **冒泡阶段和捕获阶段**

    ```jsx
    export function EventDemo() {
      const handleClick = () => {
        console.log("模拟冒泡阶段执行");
      };
      const handleClickCapture = () => {
        console.log("模拟捕获阶段执行");
      };
      return (
        <div>
          <button onClick={handleClick} onClickCapture={handleClickCapture}>
            点击
          </button>
        </div>
      );
    }
    ```

    - 冒泡阶段：开发者正常给 React 绑定的事件比如 onClick，onChange，默认会在模拟冒泡阶段执行。
    - 捕获阶段：如果想要**在捕获阶段执行可以将事件后面加上 Capture 后缀**，比如 onClickCapture，onChangeCapture。

    ![冒泡阶段和捕获阶段](https://s2.loli.net/2022/03/10/bWaKHyRt4rSZQfp.gif)

- **阻止冒泡**

    React 中如果想要阻止事件向上冒泡，可以用 `e.stopPropagation()` 。

    ```jsx
    // 阻止冒泡
    export function StopPropgation() {
      const handleClick = (e) => {
        e.stopPropagation(); /* 阻止事件冒泡，handleFatherClick 事件讲不在触发 */
        console.log("子 div 点击");
      };
      const handleChange = (e) => {
        console.log("handleChange:", e.target.value);
      };
      const handleFatherClick = () => console.log("冒泡到父级");
      return (
        <div onClick={handleFatherClick}>
          <div onClick={handleClick}>点击</div>
          <input onChange={handleChange} />
        </div>
      );
    }
    ```

    React 阻止冒泡和原生事件中的写法差不多，当如上 handleClick上 阻止冒泡，父级元素的 handleFatherClick 将不再执行，但是底层原理完全不同，接下来会讲到其功能实现。

    ![阻止冒泡](https://s2.loli.net/2022/03/10/ujf7IvPQmisEJYB.gif)

- **阻止默认行为**

    React 阻止默认行为和原生的事件也有一些区别。

    - **原生事件：** `e.preventDefault()` 和 `return false` 可以用来阻止事件默认行为，由于在 React 中给元素的事件并不是真正的事件处理函数。**所以导致 return false 方法在 React 应用中完全失去了作用。**
    - **React事件** 在React应用中，**可以用 e.preventDefault() 阻止事件默认行为**，这个方法并非是原生事件的 preventDefault ，由于 React 事件源 e 也是独立组建的，所以 preventDefault 也是单独处理的。



### 14.2 事件合成

React 事件系统可分为三个部分：

- 第一个部分是 **事件合成系统**，初始化会注册不同的事件插件。
- 第二个就是在一次渲染过程中，**对事件标签中事件的收集**，向 container 注册事件。
- 第三个就是一次用户交互，事件触发，到事件执行一系列过程。

#### 14.2.1 事件合成概念

首先需要弄清楚什么叫事件合成呢？

比如在整个 React 应用中只绑定一个事件：

```jsx
export default function Index(){
  const handleClick = () => {}
  return <div >
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

上面在 button 元素绑定的事件中，没有找到 handleClick 事件。但是在 document 上绑定一个 onclick 事件,如下：

![image-20220310123156408](https://s2.loli.net/2022/03/10/SWsLGBZvRIkVyDJ.png)

于是如下将应用中再添加一个 input 并绑定一个 onChange 事件：

```jsx
export default function Index(){
  const handleClick = () => {}
  const handleChange =() => {}
  return <div >
     <input onChange={ handleChange }  />
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

在 input上还是没有找到绑定的事件 handleChange ，但是 document 的事件如下：

![image-20220310123624102](https://s2.loli.net/2022/03/10/zlWDUH8VITXvbtA.png)

多了 blur，change ，focus ，keydown，keyup 等事件。

上面的是 React 17 之前的表示

如上可以作出的总结是：

- React 的事件不是绑定在元素上的，而是统一绑定在顶部容器上，在 v17 之前是绑定在 document 上的，在 **v17 改成了 app 容器上。这样更利于一个 html 下存在多个应用（微前端）。**
- 绑定事件并不是一次性绑定所有事件，比如发现了 onClick 事件，就会绑定 click 事件，比如发现 onChange 事件，会绑定 `[blur，change ，focus ，keydown，keyup]` 多个事件。
- **React 事件合成的概念**：React 应用中，元素绑定的事件并不是原生事件，而是React 合成的事件，比如 onClick 是由 click 合成，onChange 是由 blur ，change ，focus 等多个事件合成。

#### 14.2.2 事件插件机制

React 有一种事件插件机制，比如上述 onClick 和 onChange ，会有不同的事件插件 SimpleEventPlugin  ，ChangeEventPlugin 处理，先不必关心事件插件做了些什么，只需要先记住两个对象。这个对于后续的了解很有帮助。

**第一个 registrationNameModules ：**

```js
const registrationNameModules = {
    onBlur: SimpleEventPlugin,
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    onChangeCapture: ChangeEventPlugin,
    onMouseEnter: EnterLeaveEventPlugin,
    onMouseLeave: EnterLeaveEventPlugin,
    ...
}
```

registrationNameModules 记录了 React 事件（比如 onBlur ）和与之对应的处理插件的映射，比如上述的  onClick ，就会用 SimpleEventPlugin 插件处理，onChange 就会用 ChangeEventPlugin  处理。应用于事件触发阶段，根据不同事件使用不同的插件。

> 问：为什么要用不同的事件插件处理不同的 React 事件 ?
>
> 答：首先对于不同的事件，有不同的处理逻辑；对应的事件源对象也有所不同，React 的事件和事件源是自己合成的，所以对于不同事件需要不同的事件插件处理。

**第二个registrationNameDependencies**

```js
{
    onBlur: ['blur'],
    onClick: ['click'],
    onClickCapture: ['click'],
    onChange: ['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange'],
    onMouseEnter: ['mouseout', 'mouseover'],
    onMouseLeave: ['mouseout', 'mouseover'],
    ...
}
```

这个对象保存了 React 事件和原生事件对应关系，这就解释了为什么上述只写了一个 onChange ，会有很多原生事件绑定在 document 上。在事件绑定阶段，如果发现有 React 事件，比如 onChange ，就会找到对应的原生事件数组，逐一绑定。

### 14.3 事件绑定

所谓事件绑定，就是在 React 处理 props 时候，如果遇到事件比如 onClick ，就会通过 addEventListener  注册原生事件，讲解事件注册之前先来想一个问题，还是上述的 demo ，给元素绑定的事件 handleClick ，handleChange  ，最后去了哪里呢？

```jsx
export function EventBind() {
  const handleClick = () => console.log("点击事件");
  const handleChange = () => console.log("change事件");
  return (
    <div>
      <input onChange={handleChange} />
      <button onClick={handleClick}>点击</button>
    </div>
  );
}
```

对于如上结构，最后 onChange 和 onClick 会保存在对应 DOM 元素类型 fiber 对象（ hostComponent ）的 memoizedProps 属性上，如上结构会变成这样。

![image-20220310124201451](https://s2.loli.net/2022/03/10/mC49dg6W2rJbTYG.png)

接下来就是 React 根据事件注册事件监听器。

```js
// react-dom/src/client/ReactDOMComponent.js

function diffProperties(){
    /* 判断当前的 propKey 是不是 React合成事件 */
    if(registrationNameModules.hasOwnProperty(propKey)){
        /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
        legacyListenToEvent(registrationName, document）;
     }
}
```

`diffProperties` 函数在 diff props 如果发现是合成事件( onClick ) 就会调用 legacyListenToEvent 函数。注册事件监听器。接下来看一下 `legacyListenToEvent` 是如何注册事件的。

```js
// react-dom/src/events/DOMLegacyEventPluginSystem.js

function legacyListenToEvent(registrationName，mountAt){
    // 根据 onClick 获取  onClick 依赖的事件数组 [ 'click' ]。
    const dependencies = registrationNameDependencies[registrationName];
    for (let i = 0; i < dependencies.length; i++) {
    	const dependency = dependencies[i];
    	//  addEventListener 绑定事件监听器
    	...
 	}
}
```

这个就是应用上述 registrationNameDependencies 对 React 合成事件，分别绑定原生事件的事件监听器。比如发现是 onChange ，那么取出 `['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange']` 遍历绑定。

**那么有一个疑问，绑定在 document 的事件处理函数是如上写的handleChange，handleClick 吗？**

答案是否定的，绑定在 document 的事件，是 React 统一的事件处理函数 dispatchEvent ，React 需要一个统一流程去代理事件逻辑，包括 React 批量更新等逻辑。

只要是 **React 事件触发，首先执行的就是 dispatchEvent** ，那么有的同学会问，dispatchEvent 是如何知道是什么事件触发的呢？实际在注册的时候，就已经通过 bind ，把参数绑定给 dispatchEvent 了。

比如绑定 click 事件:

```js
const listener = dispatchEvent.bind(null, 'click', eventSystemFlags, document)
/* TODO: 重要, 这里进行真正的事件绑定。*/
document.addEventListener('click', listener, false)
```

### 14.4 事件触发

#### 14.4.1 一次点击事件

假设 DOM 结构是如下这样的：

```jsx
export function OneClickEvent() {
  const handleClick1 = () => console.log(1);
  const handleClick2 = () => console.log(2);
  const handleClick3 = () => console.log(3);
  const handleClick4 = () => console.log(4);
  return (
    <div onClick={handleClick3} onClickCapture={handleClick4}>
      <button onClick={handleClick1} onClickCapture={handleClick2}>
        点击
      </button>
    </div>
  );
}
```

![一次点击事件](https://s2.loli.net/2022/03/10/bz1vGPU8mkcfnNL.gif)

如果上述点击按钮，触发点击事件，那么在 React 系统中，整个流程会是这个样子的：

- **第一步：批量更新**

    首先上面讲到执行 dispatchEvent ，dispatchEvent 执行会传入真实的事件源 button 元素本身。通过元素可以找到 button 对应的 fiber ，fiber 和原生 DOM 之间是如何建立起联系的呢？

    React 在初始化真实 DOM 的时候，用一个随机的 key internalInstanceKey  指针指向了当前 DOM 对应的 fiber 对象，fiber 对象用 stateNode 指向了当前的 DOM 元素。

    ![image-20220310125131913](https://s2.loli.net/2022/03/10/ZvIqe8WHiljQsod.png)

    接下来就是批量更新环节:

    ```js
    // react-dom/src/events/ReactDOMUpdateBatching.js

    export function batchedEventUpdates(fn,a){
        isBatchingEventUpdates = true; //打开批量更新开关
        try{
           fn(a)  // 事件在这里执行
        }finally{
            isBatchingEventUpdates = false //关闭批量更新开关
        }
    }
    ```

    第一阶段模型：

    ![image-20220310125248865](https://s2.loli.net/2022/03/10/4vGutiBYo3578pr.png)

- **第二步：合成事件源**

    接下来会通过 onClick 找到对应的处理插件 SimpleEventPlugin ，合成新的事件源 e ，里面包含了 preventDefault 和 stopPropagation 等方法。

    第二阶段模型：

    ![image-20220310125346168](https://s2.loli.net/2022/03/10/1PsfhELNt6BoMuF.png)

- **第三步：形成事件执行队列**

    在第一步通过原生 DOM 获取到对应的 fiber ，接着会从这个 fiber 向上遍历，遇到元素类型 fiber ，就会收集事件，用一个数组收集事件：

    - 如果遇到捕获阶段事件 onClickCapture ，就会 unshift 放在数组前面。以此模拟事件捕获阶段。
    - 如果遇到冒泡阶段事件 onClick ，就会 push 到数组后面，模拟事件冒泡阶段。
    - 一直收集到最顶端 app ，形成执行队列，在接下来阶段，依次执行队列里面的函数。

    ```js
     while (instance !== null) {
        const {stateNode, tag} = instance;
        if (tag === HostComponent && stateNode !== null) { /* DOM 元素 */
            const currentTarget = stateNode;
            if (captured !== null) { /* 事件捕获 */
                /* 在事件捕获阶段,真正的事件处理函数 */
                const captureListener = getListener(instance, captured); // onClickCapture
                if (captureListener != null) {
                /* 对应发生在事件捕获阶段的处理函数，逻辑是将执行函数unshift添加到队列的最前面 */
                    dispatchListeners.unshift(captureListener);

                }
            }
            if (bubbled !== null) { /* 事件冒泡 */
                /* 事件冒泡阶段，真正的事件处理函数，逻辑是将执行函数push到执行队列的最后面 */
                const bubbleListener = getListener(instance, bubbled); //
                if (bubbleListener != null) {
                    dispatchListeners.push(bubbleListener); // onClick
                }
            }
        }
        instance = instance.return;
    }
    ```

    那么如上点击一次按钮，4个事件执行顺序是这样的：

    - 首先第一次收集是在 button 上，handleClick1 冒泡事件 push 处理，handleClick2 捕获事件 unshift 处理。形成结构 `[ handleClick2 , handleClick1  ]`
    - 然后接着向上收集，遇到父级，收集父级 div 上的事件，handleClick3 冒泡事件 push 处理，handleClick4 捕获事件 unshift 处理。`[handleClick4, handleClick2 , handleClick1,handleClick3  ]`
    - 依次执行数组里面的事件，所以打印 4 2 1 3。

    第三阶段模型：

    ![image-20220310125851547](https://s2.loli.net/2022/03/10/z9WZdy3bHEJFRfc.png)



#### 14.4.2 React如何模拟阻止事件冒泡

那么 React 是如何阻止事件冒泡的呢。来看一下事件队列是怎么执行的。

```js
// legacy-events/EventBatching.js

function runEventsInBatch(){
    const dispatchListeners = event._dispatchListeners;
    if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) { /* 判断是否已经阻止事件冒泡 */
        break;
      }
      dispatchListeners[i](event) /* 执行真正的处理函数 及handleClick1... */
    }
  }
}
```

对于上述队列 `[handleClick4, handleClick2 , handleClick1, handleClick3  ]`

假设在上述队列中，handleClick2 中调用 `e.stopPropagation()`，那么事件源里将有状态证明此次事件已经停止冒泡，那么下次遍历的时候， `event.isPropagationStopped()` 就会返回 true ，所以跳出循环，handleClick1, handleClick3 将不再执行，模拟了阻止事件冒泡的过程。