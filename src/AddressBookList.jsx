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
import {List, Button} from 'semantic-ui-react';
import {ReactiveComponent} from 'oo7-react';
import {runtime, addressBook} from 'oo7-substrate';
import {Identicon} from './Identicon';

export class AddressBookList extends ReactiveComponent {
	constructor () {
		super([], {
			addressBook: addressBook(),
			shortForm: addressBook().map(ss => {
				let r = {}
				ss.accounts.forEach(account => r[account.name] = runtime.indices.ss58Encode(runtime.indices.tryIndex(account.account)))
				return r
			})
		})
	}

	readyRender () {
		return <List divided verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'auto', maxHeight: '20em'}}>{
			this.state.addressBook.accounts.map(account =>
				<List.Item key={account.name}>
					<List.Content floated='right'>
						<Button size='small' onClick={() => addressBook().forget(account)}>Delete</Button>
					</List.Content>
					<span className='ui avatar image' style={{minWidth: '36px'}}>
						<Identicon account={account.account} />
					</span>
					<List.Content>
						<List.Header>{account.name}</List.Header>
						<List.Description>
							{this.state.shortForm[account.name]}
						</List.Description>
					</List.Content>
				</List.Item>
			)
		}</List>
	}
}
