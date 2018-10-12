import React from 'react';
import {Button} from 'semantic-ui-react';
import {Bond} from 'oo7';
import {ReactiveComponent} from 'oo7-react';

export class TransformBondButton extends ReactiveComponent {
	constructor () {
		super (['content', 'disabled', 'icon'])

		this.state = { bond: null, result: null }
	}

	clicked () {
		if (this.state.result) {
			this.setState({ result: null })
			return
		}

		let bond = this.props.bond
			? this.props.bond()
			: this.props.transform
			? Bond.all(this.props.args).latched().map(args => this.props.transform(...args))
			: undefined
		if (bond) {
			this.setState({ bond })
			let that = this
			bond.map(result => that.setState({ result }))
			bond.then(result => that.setState({ bond: null, result }))
		}
	}

	render () {
		return <Button
			content={this.state.content}
			onClick={() => this.clicked()}
			disabled={this.state.disabled || !!this.state.bond}
			icon={this.state.result ? this.state.result.icon ? this.state.result.icon : 'tick' : this.state.icon }
			label={this.state.result ? this.state.result.label ? this.state.result.label : 'Done' : this.state.label }
		/>
	}
}
