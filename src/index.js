import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import {render} from 'react-dom';
import {App} from './app.jsx';
import { setNodeUri } from 'oo7-substrate'
require('./denominations')

setNodeUri(['ws://bbq-birch.parity.io:9944/', 'wss://substrate-rpc.parity.io/'])

render(<App/>, document.getElementById('app'));
