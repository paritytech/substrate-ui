const React = require('react');
const { Icon, Label } = require('semantic-ui-react');

import { ReactiveComponent } from 'oo7-react';
import { runtime } from 'oo7-substrate';

export class StakingStatusLabel extends ReactiveComponent {
	constructor () {
		super (['id'], {
			intentionIndex: ({id}) => runtime.staking.intentionIndexOf(id),
			validatorIndex: ({id}) => runtime.session.validatorIndexOf(id),
			bondage: ({id}) => runtime.staking.bondageOf(id),
			nominating: ({id}) => runtime.staking.nominating(id)
		})
	}
	render () {
		let staked = this.state.intentionIndex !== -1
		let validating = this.state.validatorIndex !== -1
		let bondage = this.state.bondage
		let nominating = this.state.nominating && this.state.nominating.length === 32
		return staked && validating
			? <Label><Icon name='certificate'/>Staked<Label.Detail>Validating</Label.Detail></Label>
			: nominating
			? <Label><Icon name='hand point right'/>Staked<Label.Detail>Nominating</Label.Detail></Label>
			: staked
			? <Label><Icon name='pause'/>Staked<Label.Detail>Idle</Label.Detail></Label>
			: !staked && validating
			? <Label><Icon name='sign out'/>Staked<Label.Detail>Retiring</Label.Detail></Label>
			: !staked && bondage !== null
			? <Label><Icon name='clock outline'/>Unstaking<Label.Detail>{bondage} blocks to go</Label.Detail></Label>
			: <Label><Icon name='times'/>Not staked</Label>
	}
}
