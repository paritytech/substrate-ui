const React = require('react');
const {ReactiveComponent} = require('oo7-react');
const {Label, Icon} = require('semantic-ui-react');

function styleStatus (value) {
	return (
		value.broadcasting ? { text: 'broadcasting', icon: 'bullseye', color: 'blue', basic: true } :
		value.broadcast ? { text: 'finalising', icon: 'spinner', color: 'green', basic: true, loading: true } :
		value.finalised ? { text: 'finalised', icon: 'check', color: 'green', basic: false } :
		value.failed ?
			value.failed.code == -32015 ? { text: 'invalid', icon: 'exclamation', color: 'red', basic: true } :
			value.failed.code == -32040 ? { text: 'rejected', icon: 'x', color: 'grey', basic: true } :
			value.failed.code == -32040 ? { text: 'usurped', icon: 'x', color: 'grey', basic: true } :
			null :
		null
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
			basic={this.props.basic == null ? status.basic : this.props.basic}
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
	basic: null,
	current: 0,
	total: 0
};

module.exports = { styleStatus, TransactionProgressLabel };
