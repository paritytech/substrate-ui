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
import {Button, Label} from 'semantic-ui-react';
import {Bond} from 'oo7';
import {ReactiveComponent} from 'oo7-react';
import * as uuid from 'uuid';

export class FileUploadBond extends ReactiveComponent {
	constructor () {
		super(['content', 'disabled']);

		this.changed = this.changed.bind(this)
		this.state = { length: null }
		this.id = uuid.v1()
	}

	changed () {
		const fileButton = document.getElementById(this.id)
		const file = fileButton ? fileButton.files[0] : null
		
		if (file) {
			var fileReader = new FileReader()
			fileReader.onloadend = e => {
				let fileContents = new Uint8Array(e.target.result)
				this.props.bond.trigger(fileContents)
				this.setState({length: fileContents.length})
			}
			fileReader.readAsArrayBuffer(file)
		}
	}

	render () {
		return <div>
			<Button
				content={this.state.content}
				disabled={this.state.disabled}
				as="label"
				htmlFor={this.id}
				label={this.state.length
					? `${this.state.length} bytes`
					: null
				}
			></Button>
			<input
				hidden
				id={this.id}
				multiple
				type="file"
				onChange={this.changed}
			/>
		</div>
	}
}
