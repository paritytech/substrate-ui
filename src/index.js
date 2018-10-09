import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import {render} from 'react-dom';
import {App, WithSubstrate} from './app.jsx';
require('./denominations')

render(<WithSubstrate><App/></WithSubstrate>, document.getElementById('app'));
