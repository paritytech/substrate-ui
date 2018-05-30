import oo7 from 'oo7';
import {Rspan} from 'oo7-react';
import React from 'react';
import {Polkadot, ss58_decode, ss58_encode, bytesToHex, pretty} from './polkadot.js';
import {AccountIdBond} from './AccountIdBond.jsx';

export class App extends React.Component {
	constructor () {
		super();
		this.pd = new Polkadot;
		this.who = new oo7.Bond;
	}
	render() {
		return (<div>
			<div>Chain: <div style={{marginLeft: '1em'}}>
				<div>Height: <Rspan>{this.pd.header(this.pd.head).number}</Rspan></div>
				<div>Code: <Rspan>{this.pd.codeSize}</Rspan> bytes (<Rspan>{this.pd.codeHash.map(bytesToHex)}</Rspan>)</div>
			</div></div>
			<div>Democracy: <div style={{marginLeft: '1em'}}>
				<div>Active referenda: <Rspan>{this.pd.democracy.active.map(pretty)}</Rspan></div>
				<div>Proposed referenda: <Rspan>{this.pd.democracy.proposed.map(pretty)}</Rspan></div>
				<div>Launch period: <Rspan>{this.pd.democracy.launchPeriod.map(pretty)}</Rspan></div>
				<div>Minimum deposit: <Rspan>{this.pd.democracy.minimumDeposit.map(pretty)}</Rspan></div>
				<div>Voting period: <Rspan>{this.pd.democracy.votingPeriod.map(pretty)}</Rspan></div>
			</div></div>
			<div>Council: <div style={{marginLeft: '1em'}}>
				<div>Members: <Rspan>{this.pd.council.active.map(pretty)}</Rspan></div>
				<div>Candidates: <Rspan>{this.pd.council.candidates.map(pretty)}</Rspan></div>
				<div>Candidacy bond: <Rspan>{this.pd.council.candidacyBond.map(pretty)}</Rspan></div>
				<div>Voting bond: <Rspan>{this.pd.council.votingBond.map(pretty)}</Rspan></div>
				<div>Present slash per voter: <Rspan>{this.pd.council.presentSlashPerVoter.map(pretty)}</Rspan></div>
				<div>Carry count: <Rspan>{this.pd.council.carryCount.map(pretty)}</Rspan></div>
				<div>Presentation duration: <Rspan>{this.pd.council.presentationDuration.map(pretty)}</Rspan></div>
				<div>Inactive grace period: <Rspan>{this.pd.council.inactiveGracePeriod.map(pretty)}</Rspan></div>
				<div>Voting period: <Rspan>{this.pd.council.votingPeriod.map(pretty)}</Rspan></div>
				<div>Term duration: <Rspan>{this.pd.council.termDuration.map(pretty)}</Rspan></div>
				<div>Desired seats: <Rspan>{this.pd.council.desiredSeats.map(pretty)}</Rspan></div>
			</div></div>
			<div>Council Voting: <div style={{marginLeft: '1em'}}>
				<div>Voting Period: <Rspan>{this.pd.councilVoting.votingPeriod.map(pretty)}</Rspan></div>
				<div>Cooloff Period: <Rspan>{this.pd.councilVoting.cooloffPeriod.map(pretty)}</Rspan></div>
				<div>Proposals: <Rspan>{this.pd.councilVoting.proposals.map(pretty)}</Rspan></div>
			</div></div>
			<div>
			<AccountIdBond bond={this.who} />
			Balance of <Rspan style={{fontFamily: 'monospace', fontSize: 'small'}}>{this.who.map(ss58_encode)}</Rspan> is <Rspan>{this.pd.staking.balance(this.who)}</Rspan>
			</div>
			<div>
			Note that balance for Gav is at 30631a0fe1de6942745c512fb664c265
			</div>
		</div>);
	}
}
/*




*/
