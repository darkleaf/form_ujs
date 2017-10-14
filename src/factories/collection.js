import React from 'react';
import ReactDOM from 'react-dom';
import bind from 'memoize-bind';
import t from 'transit-js';
const kw = t.keyword;

import widgetBuilder from '../widget-builder';

export default function Collection(desc) {
  const name = desc.get(kw('id'));
  const nested = desc.get(kw('nested'));
  const Widget = widgetBuilder(nested);
  const defaultData = [];

  return class extends React.PureComponent {
    static displayName = `Collection(${name})`

    data() {
      return this.props.data || defaultData;
    }

    onChange(idx, value) {
      const data = this.data().slice();
      data[idx] = value;
      this.props.onChange(data);
    }

    render() {
      return (
        <div>
          <label>{name.toString()}</label>
          {this.data().map((itemData, idx) => {
            const itemErrors = null; //TODO
            const itemOnChange = bind(this.onChange, this, idx);
            return (
              <div className="card mb-3" key={idx}> {/* todo check key */}
                <div className="card-body">
                  <Widget data={itemData}
                          onChange={itemOnChange} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };
}