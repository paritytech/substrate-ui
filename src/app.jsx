import oo7 from 'oo7';
import {Rspan} from 'oo7-react';
import React from 'react';
import {Polkadot, ss58_decode, ss58_encode, bytesToHex} from './polkadot.js';
import {AccountIdBond} from './AccountIdBond.jsx';

export class App extends React.Component {
	constructor () {
		super();
		this.pd = new Polkadot;
		this.who = new oo7.Bond;
	}
	render() {
		return (<div>
			<div>Height: <Rspan>{this.pd.header(this.pd.head).number}</Rspan></div>
			<div>Code hash: <Rspan>{this.pd.codeHash.map(bytesToHex)}</Rspan></div>
			<div>Active council: <Rspan>{this.pd.activeCouncil.map(JSON.stringify)}</Rspan></div>
			<div>Council Proposals: <Rspan>{this.pd.proposals.map(JSON.stringify)}</Rspan></div>
			<div>Active Referenda: <Rspan>{this.pd.referenda.map(JSON.stringify)}</Rspan></div>
			<div>
			Balance of <AccountIdBond bond={this.who} /> <Rspan style={{fontFamily: 'monospace', fontSize: 'small'}}>{this.who.map(ss58_encode)}</Rspan> is <Rspan>{this.pd.balance(this.who)}</Rspan>
			</div>
		</div>);
	}
}
