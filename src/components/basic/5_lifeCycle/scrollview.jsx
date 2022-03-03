import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

/* item 完全是单元项的渲染ui */
function Item({ item }) {
  return (
    <div className="goods_item">
      <img src={item.giftImage} className="item_image" />
      <div className="item_content">
        <div className="goods_name">{item.giftName}</div>
        <div className="hold_price" />
        <div className="new_price">
          <div className="new_price">
            <div className="one view">¥ {item.price}</div>
          </div>
        </div>
        <img className="go_share  go_text" />
      </div>
    </div>
  );
}

Item.propTypes = {
  item: PropTypes.object,
};

export function ScrollViewContainer() {
  const [data, setData] = useState({
    list: [],
    page: 0,
    pageCount: 1,
  }); /* 记录列表数据 */
  /* 请求数据 */
  const getData = async () => {
    if (data.page === data.pageCount) return console.log("没有数据了～");
    const res = await fetchData(data.page + 1);
    if (res.code === 0)
      setData({
        ...res,
        list: res.page === 1 ? res.list : data.list.concat(res.list),
      });
  };
  /* 滚动到底部触发 */
  const handerScrolltolower = () => {
    console.log("scroll已经到底部");
    getData();
  };
  /* 初始化请求数据 */
  useEffect(() => {
    getData();
  }, []);
  return (
    <ScrollView
      data={data} /*  */
      component={Item} /* Item 渲染的单元组件 */
      scrolltolower={handerScrolltolower}
      scroll={() => {}}
    />
  );
}
class ScrollView extends React.Component {
  /* -----自定义事件---- */
  /* 控制滚动条滚动 */
  handerScroll = (e) => {
    const { scroll } = this.props;
    scroll && scroll(e);
    this.handerScrolltolower();
  };
  /* 判断滚动条是否到底部 */
  handerScrolltolower() {
    const { scrolltolower } = this.props;
    const { scrollHeight, scrollTop, offsetHeight } = this.node;
    if (scrollHeight === scrollTop + offsetHeight) {
      /* 到达容器底部位置 */
      scrolltolower && scrolltolower();
    }
  }
  node = null;

  /* ---——---生命周期------- */
  constructor(props) {
    super(props);
    this.state = {
      /* 初始化 Data */ list: [],
    };
    this.handerScrolltolower = debounce(
      this.handerScrolltolower,
      200
    ); /* 防抖处理 */
  }
  /* 接收props, 合并到state */
  static getDerivedStateFromProps(newProps) {
    const { data } = newProps;
    return {
      list: data.list || [],
    };
  }
  /* 性能优化，只有列表数据变化，渲染列表 */
  shouldComponentUpdate(newProps, newState) {
    return newState.list !== this.state.list;
  }
  /* 获取更新前容器高度 */
  getSnapshotBeforeUpdate() {
    return this.node.scrollHeight;
  }
  /* 获取更新后容器高度 */
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("scrollView容器高度变化:", this.node.scrollHeight - snapshot);
  }
  /* 绑定事件监听器 - 监听scorll事件 */
  componentDidMount() {
    this.node.addEventListener("scroll", this.handerScroll);
  }
  /* 解绑事件监听器 */
  componentWillUnmount() {
    this.node.removeEventListener("scroll", this.handerScroll);
  }
  render() {
    const { list } = this.state;
    const { component } = this.props;
    return (
      <div className="list_box" ref={(node) => (this.node = node)}>
        <div>
          {list.map(
            (item) => React.createElement(component, { item, key: item.id }) //渲染 Item 列表内容。
          )}
        </div>
      </div>
    );
  }
}
