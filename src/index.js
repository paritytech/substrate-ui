import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import {render} from 'react-dom';
import {App} from './app.jsx';
import { setNodeUri } from 'oo7-substrate'
require('./denominations')

//setNodeUri(['ws://127.0.0.1:9944/', 'wss://substrate-rpc.parity.io/', 'wss://poc3-rpc.polkadot.io/', 'ws://104.211.54.233:9944/'])
//setNodeUri(['ws://127.0.0.1:9944/', 'wss://poc3-rpc.polkadot.io/'])
//setNodeUri(['ws://127.0.0.1:9944/', 'wss://substrate-rpc.parity.io/'])
//setNodeUri(['wss://substrate-rpc.parity.io/'])
setNodeUri(['wss://poc3-rpc.polkadot.io/'])

render(<App/>, document.getElementById('app'));
