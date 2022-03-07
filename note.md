# React 进阶实践

[toc]

[React 进阶实践](https://juejin.cn/book/6945998773818490884)

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

