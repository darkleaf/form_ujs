import React from 'react';
import ReactDOM from 'react-dom';
import bind from 'memoize-bind';
import t from 'transit-js';
const kw = t.keyword;

export default function Input(desc) {
  const name = desc.get(kw('id'));
  return class extends React.PureComponent {
    static displayName = `Input(${name})`

    onChange(e) {
      this.props.onChange(e.target.value);
    }

    render() {
      return (
        <div className="form-group">
          <label>{name.toString()}</label>
          <input className="form-control"
                 value={this.props.data}
                 onChange={bind(this.onChange, this)} />
        </div>
      );
    }
  };
}
