# [React 进阶实践](https://juejin.cn/book/6945998773818490884) 阅读记录 + 代码

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

如果在一次调和的过程中，发现了一个 `fiber tag = 1 ` 类组件的情况，就会按照类组件的逻辑来处理。对于类组件的处理逻辑，首先判断类组件是否已经被创建过，首先来看看源码里怎么写的。

```js
// react-reconciler/src/ReactFiberBeginWork.js

/* workloop React 处理类组件的主要功能方法 */
function updateClassComponent(){
    let shouldUpdate
    const instance = workInProgress.stateNode // stateNode 是 fiber 指向 类组件实例的指针。
     if (instance === null) { // instance 为组件实例,如果组件实例不存在，证明该类组件没有被挂载过，那么会走初始化流程
        constructClassInstance(workInProgress, Component, nextProps); // 组件实例将在这个方法中被new。
        //初始化挂载组件流程
        mountClassInstance(workInProgress, Component, nextProps,renderExpirationTime );
        shouldUpdate = true; // shouldUpdate 标识用来证明 组件是否需要更新。
     }else{
        shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps, renderExpirationTime) // 更新组件流程
     }
     if(shouldUpdate){
         nextChildren = instance.render(); /* 执行render函数 ，得到子节点 */
         reconcileChildren(current,workInProgress,nextChildren,renderExpirationTime) /* 继续调和子节点 */
     }
}
```

几个重要概念：

- ①  `instance` 类组件对应实例。
- ②  `workInProgress` 树，当前正在调和(render)的 fiber 树 ，一次更新中，React 会自上而下深度遍历子代 fiber ，如果遍历到一个 fiber ，会把当前 fiber 指向 workInProgress。
- ③  `current` 树，在初始化更新中，current = null ，在第一次 fiber 调和之后，会将  workInProgress 树赋值给 current 树。React 来用workInProgress 和 current  来确保一次更新中，快速构建，并且状态不丢失。
- ④  `Component` 就是项目中的 class 组件。
- ⑤  `nextProps` 作为组件在一次更新中新的 props 。
- ⑥  `renderExpirationTime` 作为下一次渲染的过期时间。

在组件实例上可以通过 `_reactInternals` 属性来访问组件对应的 fiber 对象。在 fiber 对象上，可以通过 `stateNode` 来访问当前 fiber 对应的组件实例:

![lifecycle3.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/018a9cbd20df478a955b84beba770674~tplv-k3u1fbpfcp-watermark.awebp)

#### 5.1.1 React 类组件生命周期过程

React 的大部分生命周期的执行，都在 `mountClassInstance` 和`updateClassInstance` 这两个方法中执行

- **初始化阶段**

    1. **`contructor` 执行**

        在 mount 阶段，首先执行的 constructClassInstance 函数 ，在实例化组件之后，会调用 mountClassInstance 组件初始化。

        ```jsx
        // react-reconciler/src/ReactFiberClassComponent.js

        function mountClassInstance(workInProgress, ctor, newProps, renderExpirationTime){
            const instance = workInProgress.stateNode;
             /* ctor 就是我们写的类组件，获取类组件的静态方法 */
            const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

            if (typeof getDerivedStateFromProps === 'function') {
                /* 这个时候执行 getDerivedStateFromProps 生命周期 ，得到将合并的state */
                const partialState = getDerivedStateFromProps(nextProps, prevState);
                const memoizedState = partialState === null || partialState === undefined ? prevState :
                Object.assign({}, prevState, partialState); // 合并state
                workInProgress.memoizedState = memoizedState;
                /* 将state 赋值给我们实例上，instance.state  就是我们在组件中 this.state获取的state*/
                instance.state = workInProgress.memoizedState;
            }

            if(typeof ctor.getDerivedStateFromProps !== 'function' &&
               typeof instance.getSnapshotBeforeUpdate !== 'function' &&
               typeof instance.componentWillMount === 'function' ){
                 /* 当 getDerivedStateFromProps 和 getSnapshotBeforeUpdate 不存在的时候 ，
                 执行 componentWillMount*/
                instance.componentWillMount();
            }
        }
        ```



    2. **`getDerivedStateFromProps` 执行**

        在初始化阶段，`getDerivedStateFromProps` 是第二个执行的生命周期，值得注意的是它是从 ctor 类上直接绑定的**静态**方法，传入 `props ，state`。 返回值将和之前的 state 合并，作为新的 state ，传递给组件实例使用。

    3. ~~**`componentWillMount` 执行**~~

        如果存在 `getDerivedStateFromProps` 和 `getSnapshotBeforeUpdate` 就不会执行生命周期 `componentWillMount`。

    4. **`render` 函数执行**

        到此为止 `mountClassInstance` 函数完成，但是上面 `updateClassComponent` 函数， 在执行完 `mountClassInstancec` 后，执行了 render 渲染函数，形成了 children ， 接下来 React 调用 reconcileChildren 方法深度调和 children 。

    5. **`componentDidMount` 执行**

        一旦 React 调和完所有的 fiber 节点，就会到 commit 阶段，在组件初始化 commit 阶段，会调用 `componentDidMount` 生命周期。

        ```jsx
        // react-reconciler/src/ReactFiberCommitWork.js

        function commitLifeCycles(finishedRoot,current,finishedWork){
            switch (finishedWork.tag){       /* fiber tag 在第一节讲了不同fiber类型 */
                case ClassComponent: {                              /* 如果是 类组件 类型 */
                    const instance = finishedWork.stateNode        /* 类实例 */
                    if(current === null){                          /* 类组件第一次调和渲染 */
                        instance.componentDidMount()
                    }else{                                         /* 类组件更新 */
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
        if(!hasNewLifecycles && typeof instance.componentWillReceiveProps === 'function' ){
            if (oldProps !== newProps || oldContext !== nextContext) {     // 浅比较 props 不相等
                // 执行生命周期 componentWillReceiveProps
                instance.componentWillReceiveProps(newProps, nextContext);
            }
        }

        let newState = (instance.state = oldState);
        if (typeof getDerivedStateFromProps === 'function') {
            /* 执行生命周期getDerivedStateFromProps  ，逻辑和mounted类似 ，合并state  */
            ctor.getDerivedStateFromProps(nextProps,prevState)
            newState = workInProgress.memoizedState;
        }

        let shouldUpdate = true
         /* 执行生命周期 shouldComponentUpdate 返回值决定是否执行render ，调和子节点 */
        if(typeof instance.shouldComponentUpdate === 'function' ){
            shouldUpdate = instance.shouldComponentUpdate(newProps,newState,nextContext,);
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

        接下来执行生命周期`getDerivedStateFromProps`， 返回的值用于合并state，生成新的state

    3. **`shouldComponentUpdate` 执行**

        接下来执行生命周期`shouldComponentUpdate`，传入新的 props ，新的 state ，和新的 context ，返回值决定是否继续执行 render 函数，调和子节点。这里应该注意一个问题，`getDerivedStateFromProps` 的返回值可以作为新的 state ，传递给 shouldComponentUpdate

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

        componentWillReceiveProps( props 改变) / getDerivedStateFromProp ->  shouldComponentUpdate -> componentWillUpdate -> render  ->  getSnapshotBeforeUpdate ->  componentDidUpdate

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

    - **初始化 state** ，比如可以用来截取路由中的参数，赋值给 state 。
    - 对类组件的事件做一些处理，比如**绑定 this ， 节流，防抖**等。
    - **对类组件进行一些必要生命周期的劫持，渲染劫持**，这个功能更适合反向继承的HOC ，在 HOC 环节，会详细讲解反向继承这种模式。

    ```jsx
    constructor(props){
        super(props)        // 执行 super ，别忘了传递props,才能在接下来的上下文中，获取到props。
        this.state={       // ① 可以用来初始化state，比如可以用来获取路由中的
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

    只要组件更新，就会执行 `getDerivedStateFromProps`，不管是 props 改变，还是 setState ，或是 forceUpdate

3. **`componentWillMount` 和 `UNSAFE_componentWillMount`**

    在 React V16.3 componentWillMount ，componentWillReceiveProps ， componentWillUpdate 三个生命周期加上了不安全的标识符 `UNSAFE`，变成了如下形式:

    - UNSAFE_componentWillMount
    - UNSAFE_componentWillReceiveProps
    - UNSAFE_componentWillUpdate

    这三个生命周期，都是在 render 之前执行的，React 对于执行 render 函数有着像 shouldUpdate  等条件制约，但是**对于执行在 render 之前生命周期没有限制，存在一定隐匿风险**，如果 updateClassInstance  执行多次，React 开发者滥用这几个生命周期，可能导致生命周期内的上下文多次被执行。

4. **`componentWillRecieveProps` 和 `UNSAFE_componentWillRecieveProps`**

    UNSAFE_componentWillReceiveProps 函数的执行是在更新组件阶段，该生命周期执行驱动是因为父组件更新带来的  props 修改，但是只要父组件触发 render 函数，调用 React.createElement 方法，那么 props  就会被重新创建，生命周期 componentWillReceiveProps 就会执行了。这就解释了即使 props 没变，该生命周期也会执行。

    **作用：**

    - **componentWillReceiveProps 可以用来监听父组件是否执行 render 。**
    - componentWillReceiveProps 可以用来接受 props 改变，组件可以根据props改变，来决定是否更新  state ，因为可以访问到 this ， 所以可以在异步成功回调(接口请求数据)改变 state 。这个是  getDerivedStateFromProps  不能实现的。

5. **`componentWillUpdate` 和 `UNSAFE_componentWillUpdate`**

    UNSAFE_componentWillUpdate 可以意味着在更新之前，此时的 DOM 还没有更新。在这里可以做一些获取 DOM  的操作。就比如说在一次更新中，保存 DOM 之前的信息(记录上一次位置)。但是 React 已经出了新的生命周期  getSnapshotBeforeUpdate 来代替 UNSAFE_componentWillUpdate。

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

    **getSnapshotBeforeUpdate 这个生命周期意义就是配合componentDidUpdate 一起使用，计算形成一个 snapShot 传递给 componentDidUpdate 。保存一次更新前的信息。**

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

    作用

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

    这个生命周期，**一般用于性能优化**，shouldComponentUpdate 返回值决定是否重新渲染的类组件。需要重点关注的是第二个参数  newState ，如果有 getDerivedStateFromProps 生命周期 ，它的返回值将合并到 newState ，供  shouldComponentUpdate 使用。

11. **`componentWillUnmount`**

    componentWillUnmount 是组件销毁阶段唯一执行的生命周期，主要做一些收尾工作，比如清除一些可能造成内存泄漏的定时器，延时器，或者是一些事件监听器。

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

        对于 useEffect 执行， React 处理逻辑是采用 **异步调用** ，对于每一个 effect 的 callback， React 会向 `setTimeout` 回调函数一样，**放入任务队列**，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。**所以 effect 回调函数不会阻塞浏览器绘制视图**

    - **`useLayoutEffect`**

        useLayoutEffect 和 useEffect 不同的地方是采用了**同步执行** ，与 useEffect 的区别在于：

        - 首先 useLayoutEffect 是在DOM **绘制之前**，这样可以方便修改 DOM ，这样浏览器只会绘制一次，如果修改 DOM 布局放在  useEffect ，那 **useEffect 执行是在浏览器绘制视图之后，接下来又改 DOM  ，就可能会导致浏览器再次回流和重绘**。而且由于两次绘制，视图上可能会造成闪现突兀的效果
        - useLayoutEffect callback **中代码执行会阻塞浏览器绘制**

    - **一句话概括如何选择 useEffect 和 useLayoutEffect ：修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 。**

    - React.useEffect 回调函数 和 componentDidMount / componentDidUpdate 执行时机的区别：

        useEffect 对 React 执行栈来看是**异步**执行的，而 componentDidMount / componentDidUpdate  是**同步**执行的，useEffect代码不会阻塞浏览器绘制。在时机上 ，**componentDidMount / componentDidUpdate 和 useLayoutEffect 更类似**

2. **`componentDidMOunt` 替代方案**

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

    useEffect 代替 componentWillReceiveProps 比较牵强：

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

6.

