// Copyright 2017-2019 Parity Technologies (UK) Ltd
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
//setNodeUri(['wss://poc3-rpc.polkadot.io/'])
setNodeUri(['ws://127.0.0.1:9944/'])
//setNodeUri(['ws://127.0.0.1:9955/'])

render(<App/>, document.getElementById('app'));
