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

import React from 'react';
import {List, Icon, Button, Label, Popup} from 'semantic-ui-react';
import {ReactiveComponent} from 'oo7-react';
import {runtime, secretStore} from 'oo7-substrate';
import {Identicon} from './Identicon';

export class SecretItem extends ReactiveComponent {
	constructor () {
		super()

		this.state = {
			display: null
		}
	}

	render () {
		let that = this
		let toggle = () => {
			let display = that.state.display
			if (display === null) {
				display = 'uri'
				window.setTimeout(() => that.setState({ display: null }), 5000)
				that.setState({ display })
			}
		}
		return this.state.display === 'uri'
			? <Label
				basic
				icon='privacy'
				onClick={toggle}
				content='URI '
				detail={this.props.uri}
			/>
			: <Popup trigger={<Icon
				circular
				className='eye slash'
				onClick={toggle}
			/>} content='Click to uncover seed/secret' />
	}
}

export class WalletList extends ReactiveComponent {
	constructor () {
		super([], {
			secretStore: secretStore(),
			shortForm: secretStore().map(ss => {
				let r = {}
				ss.keys.forEach(key => r[key.name] = runtime.indices.ss58Encode(runtime.indices.tryIndex(key.account)))
				return r
			})
		})
	}

	readyRender () {
		return <List divided verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'auto', maxHeight: '20em'}}>{
			this.state.secretStore.keys.map(key =>
				<List.Item key={key.name}>
					<List.Content floated='right'>
						<SecretItem uri={key.uri}/>
						<Button size='small' onClick={() => secretStore().forget(key)}>Delete</Button>
					</List.Content>
					<List.Content floated='right'>
						<div>Crypto</div>
						<div style={{fontWeight: 'bold', width: '4em', color: key.type == 'sr25519' ? '#050' : '#daa'}}>
							{key.type == 'ed25519' ? 'Ed25519' : key.type == 'sr25519' ? 'Sr25519' : '???'}
						</div>
					</List.Content>
					<span className='ui avatar image' style={{minWidth: '36px'}}>
						<Identicon account={key.account} />
					</span>
					<List.Content>
						<List.Header>{key.name}</List.Header>
						<List.Description>
							{this.state.shortForm[key.name]}
						</List.Description>
					</List.Content>
				</List.Item>
			)
		}</List>
	}
}
