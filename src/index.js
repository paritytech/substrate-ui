import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import {render} from 'react-dom';
import {App, WithPolkadot} from './app.jsx';

render(<WithPolkadot><App/></WithPolkadot>, document.getElementById('app'));
