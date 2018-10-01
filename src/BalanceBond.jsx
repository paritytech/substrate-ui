const React = require('react');
const {Dropdown} = require('semantic-ui-react');
const {InputBond} = require('./InputBond');
const {denominations, interpretRender, formatValueNoDenom, combineValue, defDenom} = require('oo7-polkadot');

class BalanceBond extends InputBond {
	constructor () { super(); }
	
	getUnits () {
		return this.state.ok ? denominations[this.state.internal ? this.state.internal.denom : 4] : null;
	}

	setUnits (v) {
		let s = this.state.internal;
		let d = denominations.indexOf(v);
		s.denom = d;
		this.state.internal = s;
		this.handleEdit(this.state.display);
	}

	handleBlur () {
		let s = this.state;
		if (typeof(s.corrected) === 'string') {
			s.display = s.corrected;
			delete s.corrected;
			this.setState(s);
		}
	}

	makeAction (p) {
		return p ? 'right' : (<Dropdown
			button
			basic
			floating
			onChange={(_, v) => this.setUnits(v.value)}
			value={this.getUnits()}
			options={denominations
				.filter(x => x[0] == x[0].toLowerCase())
				.map(d => ({key: d, value: d, text: d}))
			}
		/>)
	}
}
BalanceBond.defaultProps = {
	placeholder: '0',
	defaultValue: '0',
	validator: (u, s) => {
		let q = u === '' ? { denom: s.internal.denom || 4, units: '0', decimals: '', origNum: '', origDenom: ''} : interpretRender(u, null);
		let d = q && q.denom !== null ? q.origNum : undefined;
		if (q) {
			defDenom(q, s.internal ? s.internal.denom : 4);
		}
		return q ? {
			internal: q,
			display: d,
			corrected: formatValueNoDenom(q),
			external: combineValue(q),
			ok: true
		} : null;
	}
};

module.exports = { BalanceBond };
