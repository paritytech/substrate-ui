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
import { ReactiveComponent } from 'oo7-react';
import { pretty } from 'oo7-substrate';

export class Pretty extends ReactiveComponent {
	constructor () {
		super(["value", "default", "className"])
	}
	render () {
		if (this.ready() || this.props.default == null) {
			return (<span className={this.state.className} name={this.props.name}>
				{(this.props.prefix || '') + pretty(this.state.value) + (this.props.suffix || '')}
			</span>)
		} else {
			return <span>{this.props.default}</span>
		}
	}
}
