const React = require('react');
const {Bond} = require('oo7');
const {ReactiveComponent, Rimg} = require('oo7-react');
const {Label, Input} = require('semantic-ui-react');
const {InputBond} = require('./InputBond');
const nacl = require('tweetnacl');
const {stringToSeed, hexToBytes, bytesToHex, ss58_decode, ss58_encode} = require('./polkadot.js');

/*
				<div>
					{this.state.ok
						? ''
						: this.state.extra.noChecksum
							? (<Label pointing color='orange' basic content='No checksum' style={labelStyle} />)
							: (<Label pointing basic content='Unknown/invalid address' style={labelStyle} />)}
				</div>
*/

class AccountIdBond extends InputBond {
	constructor () {
		super();
	}

	render () {
		const labelStyle = {
			position: 'absolute',
			zIndex: this.props.labelZIndex || 10
		};
		return (
			<div>
				{InputBond.prototype.render.call(this)}
					{
					this.state.extra && this.state.extra.noChecksum
						? (<Label pointing='left' color='orange' content='No checksum' style={labelStyle} />)
					: this.state.extra && this.state.extra.secretSeed
						? (<Label pointing='left' color='red' content='Secret key' style={labelStyle} />)
					: ''
					}
			</div>
		);
	}
}
AccountIdBond.defaultProps = {
	placeholder: '0xHexAddress or Secret',
	validator: a => {
		let x = ss58_decode(a);
		if (x) {
			return { external: x, internal: a, ok: true };
		}
		let m = a.match(/^(0x)([a-fA-F0-9]+)$/);
		if (m) {
			if (m[2].length != 64) {
				return null;
			}
			let addr = m[2];
			return { external: hexToBytes(addr), internal: a, corrected: ss58_encode(hexToBytes(addr)), extra: { noChecksum: true } };
		}
		else {
			let p = nacl.sign.keyPair.fromSeed(stringToSeed(a));
			return { external: p.publicKey, internal: a, corrected: ss58_encode(p.publicKey), extra: { secretSeed: true } };
		}
	},
	defaultValue: ''
};

module.exports = { AccountIdBond };
