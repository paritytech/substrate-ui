import oo7 from 'oo7';
import {Rspan} from 'oo7-react';
import React from 'react';
import {Polkadot, AccountId, ss58_decode, ss58_encode, bytesToHex, pretty} from 'oo7-polkadot';
import {AccountIdBond} from './AccountIdBond.jsx';
import {ReactiveComponent} from 'oo7-react';
import Identicon from 'polkadot-identicon';

export class Dot extends ReactiveComponent {
	constructor () {
		super(["value", "className"])
	}
	render() {
		return (<span className={this.state.className} name={this.props.name}>
			{(this.props.prefix || '') + pretty(this.state.value) + (this.props.suffix || '')}
		</span>)
	}
}

export class ValidatorBalances extends ReactiveComponent {
	constructor () {
		super(["value", "className"])
	}
	render() {
		if (!this.state.value) return (<div/>)
		return (<div className={this.state.className || 'validator-balances'} name={this.props.name}>
			{this.state.value.map((v, i) => (<div key={i} className="validator-balance">
				<div className="validator"><Identicon id={v.who} size={52}/></div>
				<div className="nominators">{v.nominators.map(a => <Identicon id={a} size={24}/>)}</div>
				<div className="AccountId">{pretty(v.who).substr(0, 8) + '…'}</div>
				<div className="Balance">{pretty(v.balance)}</div>
				{
					(v.otherBalance > 0
						? <div className="paren">{' (incl. ' + pretty(v.otherBalance) + ' nominated)'}</div>
						: null
					)
				}
			</div>))}
		</div>)
	}
}

export class App extends React.Component {
	constructor () {
		super();
		var polkadot = new Polkadot;
		this.pd = polkadot;
		this.validators = polkadot.session.validators
			.map(v => v.map(who => ({
				who,
				ownBalance: polkadot.staking.votingBalance(who),
				otherBalance: polkadot.staking.currentNominatedBalance(who),
				nominators: polkadot.staking.currentNominatorsFor(who)
			})), 2)
			.map(v => v
				.map(i => Object.assign({balance: i.ownBalance.add(i.otherBalance)}, i))
				.sort((a, b) => b.balance - a.balance)
			);
		this.nextThreeUp = polkadot.staking.intentions.map(
			l => ([polkadot.session.validators, l.map(who => ({
				who, ownBalance: polkadot.staking.votingBalance(who), otherBalance: polkadot.staking.nominatedBalance(who)
			}) ) ]), 3
		).map(([c, l]) => l
			.map(i => Object.assign({balance: i.ownBalance.add(i.otherBalance)}, i))
			.sort((a, b) => b.balance - a.balance)
			.filter(i => !c.some(x => x+'' == i.who+''))
			.slice(0, 3)
		);	
	}
	render() {
		return (<div>
			<div><Identicon size='32' id={new AccountId([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])}/></div>
			<div>Chain: <div style={{marginLeft: '1em'}}>
				<div>Height: <Dot value={this.pd.header(this.pd.head).number}/></div>
				<div>Code: <Dot value={this.pd.codeSize}/> bytes (<Dot value={this.pd.codeHash.map(bytesToHex)}/>)</div>
				<div>Authorities: <Dot value={this.pd.consensus.authorities}/></div>
				<div>Validators: <ValidatorBalances value={this.validators}/></div>
				<div>Next 3 Up: <Dot value={this.nextThreeUp}/></div>
			</div></div>
			<div>Democracy: <div style={{marginLeft: '1em'}}>
				<div>Active referenda: <Dot value={this.pd.democracy.active}/></div>
				<div>Proposed referenda: <Dot value={this.pd.democracy.proposed}/></div>
				<div>Launch period: <Dot value={this.pd.democracy.launchPeriod}/></div>
				<div>Minimum deposit: <Dot value={this.pd.democracy.minimumDeposit}/></div>
				<div>Voting period: <Dot value={this.pd.democracy.votingPeriod}/></div>
			</div></div>
			<div>Council: <div style={{marginLeft: '1em'}}>
				<div>Members: <Dot value={this.pd.council.active}/></div>
				<div>Candidates: <Dot value={this.pd.council.candidates}/></div>
				<div>Candidacy bond: <Dot value={this.pd.council.candidacyBond}/></div>
				<div>Voting bond: <Dot value={this.pd.council.votingBond}/></div>
				<div>Present slash per voter: <Dot value={this.pd.council.presentSlashPerVoter}/></div>
				<div>Carry count: <Dot value={this.pd.council.carryCount}/></div>
				<div>Presentation duration: <Dot value={this.pd.council.presentationDuration}/></div>
				<div>Inactive grace period: <Dot value={this.pd.council.inactiveGracePeriod}/></div>
				<div>Voting period: <Dot value={this.pd.council.votingPeriod}/></div>
				<div>Term duration: <Dot value={this.pd.council.termDuration}/></div>
				<div>Desired seats: <Dot value={this.pd.council.desiredSeats}/></div>
			</div></div>
			<div>Council Voting: <div style={{marginLeft: '1em'}}>
				<div>Voting Period: <Dot value={this.pd.councilVoting.votingPeriod}/></div>
				<div>Cooloff Period: <Dot value={this.pd.councilVoting.cooloffPeriod}/></div>
				<div>Proposals: <Dot value={this.pd.councilVoting.proposals}/></div>
			</div></div>
		</div>);
	}
}
/*




*/
