/* global fetch */

import React from 'react';
import bind from 'memoize-bind';

import _isString from 'lodash/isString';

import t from 'transit-js';
const kw = t.keyword;

import widgetBuilder from '../widget-builder';

import classNames from 'classnames';
import style from './style.module.css';

function addCSRF(headers) {
  const meta = document.querySelector('meta[name=csrf-token]');
  const token = meta && meta.content;
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
}

function send({url, method, data, onRedirect, onErrors, onFatal}) {
  const writer = t.writer('json');
  const reader = t.reader('json');

  const body = writer.write(data);
  const headers = {
    'Content-Type': 'application/transit+json'
  };
  addCSRF(headers);

  fetch(url, {method, body, headers, credentials: 'include'})
    .then(resp => {
      if (resp.status === 422) {
        resp.text().then(text => {
          const errors = reader.read(text);
          onErrors(errors);
        });
      } else if (resp.status === 201) {
        const location = resp.headers.get('Location');
        onRedirect(location);
      } else {
        onFatal();
      }
    });
}

export default function Submit(desc) {
  const url = desc.get(kw('url'));
  if (!_isString(url))
    throw new TypeError('submit: url must be a string');

  const method = desc.get(kw('method'));
  if (!t.isKeyword(method))
    throw new TypeError('submit: method must be a keyword');

  const nested = desc.get(kw('nested'));
  if (!t.isMap(nested))
    throw new TypeError('submit: nested must be a transit map');

  const name = desc.get(kw('name'));
  if (!_isString(name))
    throw new TypeError('submit: name must be a string');

  const Nested = widgetBuilder(nested);

  return class extends React.Component {
    static displayName = 'Submit$'

    constructor(props) {
      super(props);

      this.state = { loading: false };
    }

    onChange(data) {
      if (this.state.loading) return;
      this.props.onChange(data);
    }

    setErrors(errors) {
      if (this.state.loading) return;
      this.props.setErrors(errors);
    }

    onSubmit() {
      if (this.state.loading) return;
      this.setState({ loading: true });
      send({
        url,
        method: method.name(),
        data: this.props.data,
        onRedirect: location => {
          window.location = location;
        },
        onErrors: errors => {
          this.setState({ loading: false });
          this.setErrors(errors);
        },
        onFatal: () => {
          this.setState({ loading: false });
          alert("Fatal server error. Try later.");
        }
      });
    }

    render() {
      const buttonClass = classNames(
        style['c-button'],
        style['c-button--info'],
      );

      return (
        <form>
          <Nested data={this.props.data}
                  errors={this.props.errors}
                  onChange={bind(this.onChange, this)} />
          <button type="submit"
                  className={buttonClass}
                  disabled={this.state.loading}
                  onClick={bind(this.onSubmit, this)}>
            {name}
          </button>
        </form>
      );
    }
  };
}
