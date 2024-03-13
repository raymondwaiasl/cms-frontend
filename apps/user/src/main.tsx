import App from './app/app';
import 'libs/common/src/lib/i18n';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

ReactDOM.render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
  document.getElementById('root') as HTMLElement
);
