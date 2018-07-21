import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

const CONTAINER_ID = 'explorer-root';

// tslint:disable-next-line no-let
let codeRevision = 0;
const render = () => {
  // tslint:disable-next-line
  const config = require('!!../node/entry/config-loader!./entry.tsx');
  ReactDOM.render(<App config={config} codeRevision={codeRevision} />, document.getElementById(CONTAINER_ID));
};

// tslint:disable-next-line no-any
const currentModule = module as any;
if (currentModule.hot) {
  currentModule.hot.accept('!!../node/entry/config-loader!./entry.tsx', () => {
    codeRevision += 1;
    render();
  });
}

render();
