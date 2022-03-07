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
