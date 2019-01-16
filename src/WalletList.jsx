import React from 'react';
import {List, Icon, Button, Label, Popup} from 'semantic-ui-react';
import {ReactiveComponent} from 'oo7-react';
import {runtime, secretStore} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';

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
			switch (display) {
				case null:
					display = 'seed'
					break
				case 'seed':
					if (Math.random() < 0.1) {
						display = 'phrase'
						break
					}
				default:
					display = null
			}
			that.setState({ display })
		}
		return this.state.display === 'phrase'
			? <Label
				basic
				icon='privacy'
				onClick={toggle}
				content='Seed phrase'
				detail={this.props.phrase}
			/>
			: this.state.display === 'seed'
			? <Label
				basic
				icon='key'
				onClick={toggle}
				content='Validator seed'
				detail={'0x' + bytesToHex(this.props.seed)}
			/>
			: <Popup trigger={<Icon
				circular
				name='eye slash'
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
						<SecretItem phrase={key.phrase} seed={key.seed}/>
						<Button size='small' onClick={() => secretStore().forget(key)}>Delete</Button>
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
