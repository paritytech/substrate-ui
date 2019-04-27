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

const React = require('react');
const {ReactiveComponent} = require('oo7-react');
const {Label, Icon} = require('semantic-ui-react');

function styleStatus (value) {
	console.log('styleStatus', value);
	return (
		value.signing ? { text: 'signing', icon: 'key', color: 'grey' } :
		value.sending ? { text: 'sending', icon: 'wifi', color: 'grey' } :
		(value.broadcast || value === 'ready') ? { text: 'finalising', icon: 'cog', color: 'grey', loading: true } :
		value.finalized ? { text: 'finalized', icon: 'check', color: 'green' } :
		value.failed ? { text: 'failed', icon: 'exclamation', color: 'red' } :
		{ text: value.toString(), icon: 'question', color: 'blue' }
	);
}

class TransactionProgressLabel extends ReactiveComponent {
	constructor() {
		super(['value']);
	}
	render() {
		if (!this.state.value) {
			return (<span/>);
		}
		let status = styleStatus(this.state.value);
		return (<Label
			pointing={this.props.pointing}
			color={this.props.color || status.color}
			basic={false}
		>
			{this.props.showIcon ? (<Icon
				name={status.icon}
				loading={status.loading}
			/>) : null}
			{this.props.showContent ? status.text : null}
			{this.props.total < 2 ? null : (
				<Label.Detail>{Math.min(this.props.total, this.props.current)} of {this.props.total}</Label.Detail>
			)}
		</Label>);
	}
}
TransactionProgressLabel.defaultProps = {
	showContent: true,
	showIcon: true,
	current: 0,
	total: 0
};

module.exports = { styleStatus, TransactionProgressLabel };
