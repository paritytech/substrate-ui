import React from 'react';
import {List, Button} from 'semantic-ui-react';
import {ReactiveComponent} from 'oo7-react';
import {runtime} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';

export class WalletList extends ReactiveComponent {
	constructor () {
		super([], {
			secretStore: secretStore(),
			shortForm: secretStore().map(ss => {
				let r = {}
				ss.keys.forEach(key => r[key] = runtime.balances.ss58Encode(runtime.balances.tryIndex(key.account)))
				return r
			})
		})
	}

	readyRender () {
		return <List divided verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'scroll', height: '20em'}}>{
			this.state.secretStore.keys.map(key =>
				<List.Item key={key.name}>
					<List.Content floated='right'>
						<Button size='small' onClick={() => secretStore().forget(key)}>Delete</Button>
					</List.Content>
					<span className='ui avatar image' style={{minWidth: '36px'}}>
						<Identicon account={key.account} />
					</span>
					<List.Content>
						<List.Header>{key.name}</List.Header>
						<List.Description>
							Address: {this.state.shortForm[key]}
						</List.Description>
					</List.Content>
				</List.Item>
			)
		}</List>
	}
}
