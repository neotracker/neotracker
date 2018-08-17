import _ from 'lodash';
import { ProxyProps, ReactElement } from '../../types';
import { cloneElement } from '../utils';

export function AutoMockPropsProxy<E extends ReactElement>({ element: elementIn, props }: ProxyProps<E>) {
  const element = cloneElement(elementIn, props);
  const { children: _children, ...newProps } = element.props;

  return cloneElement(element, decorateProps(newProps));
}

// tslint:disable-next-line no-any
const mapValuesDeep = (obj: any, fn: (val: any, key: keyof any, obj: any) => any): any =>
  _.mapValues(obj, (val, key) => (_.isPlainObject(val) ? mapValuesDeep(val, fn) : fn(val, key, obj)));

function decorateProps<P>(props: P): P {
  if (!inJestEnv()) {
    return props;
  }

  return mapValuesDeep(props, addJestWrapper);
}

function inJestEnv(): boolean {
  try {
    jest.fn();

    return true;
  } catch {
    return false;
  }
}

// tslint:disable-next-line no-any
function addJestWrapper(prop: any): any {
  return isFunctionButNotClass(prop) ? jest.fn(prop) : prop;
}

// tslint:disable-next-line no-any
function isFunctionButNotClass(prop: any): boolean {
  // Inspired from https://stackoverflow.com/a/32235930
  return typeof prop === 'function' && !/^(?:class\s+|function\s+(?:_class|_default|[A-Z]))/.test(prop.toString());
}
