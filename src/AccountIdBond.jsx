const React = require('react');
const {Bond} = require('oo7');
const {ReactiveComponent, Rimg} = require('oo7-react');
const Identicon = require('polkadot-identicon').default;
const {Label, Input} = require('semantic-ui-react');
const {InputBond} = require('./InputBond');
const nacl = require('tweetnacl');
const {stringToSeed, hexToBytes, bytesToHex, ss58_decode, ss58_encode, secretStore} = require('oo7-polkadot');

class AccountIdBond extends InputBond {
	constructor () { super() }
	makeIcon (p) {
		return p ? 'left' : this.state.ok
				? (<i style={{opacity: 1}} className='icon'>
					<Identicon
						id={this.state.external}
						style={{marginTop: '3px'}}
						size='32'
					/></i>)
				: undefined;
	}

	render () {
		const labelStyle = {
			position: 'absolute',
			zIndex: this.props.labelZIndex || 10
		};
		return (
			<div>
				{InputBond.prototype.render.call(this)}
				<div>
					{/*this.state.ok && this.state.extra.knowSecret
						? (<Label pointing color='green' basic content='Available for signing' style={labelStyle} />)
					: ''*/}
				</div>
			</div>
		);
	}
}
AccountIdBond.defaultProps = {
	placeholder: 'Name or address',
	validator: a => {
		let x = ss58_decode(a);
		if (x) {
			return { external: x, internal: a, ok: true, extra: { knowSecret: !!secretStore.keys[a] } };
		}
		let y = secretStore.find(a);
		if (y) {
			return { external: ss58_decode(y.address), internal: a, ok: true, extra: { knowSecret: true } };
		}
		return null;
	},
	defaultValue: ''
};


class SignerBond extends AccountIdBond {
	constructor () { super() }
}

SignerBond.defaultProps = {
	placeholder: 'Name or address',
	validator: a => {
		let x = ss58_decode(a);
		if (x && secretStore.keys[a]) {
			return { external: x, internal: a, ok: true };
		}
		let y = secretStore.find(a);
		if (y) {
			return { external: ss58_decode(y.address), internal: a, ok: true };
		}
		return null;
	},
	defaultValue: ''
};

module.exports = { AccountIdBond, SignerBond };
