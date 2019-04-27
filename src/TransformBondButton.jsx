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
import {Button} from 'semantic-ui-react';
import {Bond} from 'oo7';
import {ReactiveComponent} from 'oo7-react';

export class TransformBondButton extends ReactiveComponent {
	constructor () {
		super (['content', 'disabled', 'icon'])

		this.state = { bond: null, result: undefined }
	}

	clicked () {
		if (this.state.result) {
			this.setState({ result: undefined })
			return
		}

		let bond = this.props.bond
			? this.props.bond()
			: this.props.transform
			? this.argsBond.latched().map(args => this.props.transform(...args))
			: undefined
		if (bond) {
			this.setState({ bond })
			let that = this
			bond.map(result => that.setState({ result }))
			bond.then(result => that.setState({ bond: null, result: that.props.immediate ? undefined : result }))
		}
	}

	render () {
		this.argsBond = Bond.all(this.props.args);
		return <TransformBondButtonAux
			content={this.state.content}
			onClick={() => this.clicked()}
			disabled={this.state.disabled || !!this.state.bond}
			forceEnabled={this.state.result && !this.state.bond}
			icon={this.state.result ? this.state.result.icon ? this.state.result.icon : 'tick' : this.state.icon }
			label={this.state.result ? this.state.result.label ? this.state.result.label : 'Done' : this.state.label }
			ready={this.argsBond.ready()}
		/>
	}
}

class TransformBondButtonAux extends ReactiveComponent {
	constructor () {
		super(['ready'])
	}
	render () {
		return <Button
			content={this.props.content}
			onClick={this.props.onClick}
			disabled={(this.props.disabled || !this.state.ready) && !this.props.forceEnabled}
			icon={this.props.icon}
			label={this.props.label}
		/>
	}
}