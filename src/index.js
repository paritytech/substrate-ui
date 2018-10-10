import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import {render} from 'react-dom';
import {App} from './app.jsx';
require('./denominations')

render(<App/>, document.getElementById('app'));
