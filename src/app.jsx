require('semantic-ui-css/semantic.min.css');

import oo7 from 'oo7';
import {Rspan} from 'oo7-react';
import React from 'react';
import {Polkadot, AccountId, ss58_decode, ss58_encode, bytesToHex, pretty, polkadot} from 'oo7-polkadot';
import {AccountIdBond, SignerBond} from './AccountIdBond.jsx';
import {BalanceBond} from './BalanceBond.jsx';
import {TransactButton} from './TransactButton.jsx';
import {ReactiveComponent} from 'oo7-react';
import Identicon from 'polkadot-identicon';
const {Button, Icon, Label, Menu, Dropdown} = require('semantic-ui-react');
const {blake2b} = require('blakejs');

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

export class WithPolkadot extends React.Component {
	constructor () {
		super ()
		this.state = {ready: false}
		let that = this
		polkadot().whenReady(() => that.setState({ready: true}))
	}
	render () {
		if (this.state.ready) {
			return this.props.children
		} else {
			return <div/>
		}
	}
}

const options = [
	{ key: 1, text: 'Choice 1', value: 1 },
	{ key: 2, text: 'Choice 2', value: 2 },
	{ key: 3, text: 'Choice 3', value: 3 },
  ]
  

export class App extends React.Component {
	constructor () {
		super();
		this.pd = polkadot();
/*		this.validators = polkadot.session.validators
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
		);*/
		window.blake2b = blake2b;
		window.polkadot = polkadot();
		this.source = new oo7.Bond;
		this.amount = new oo7.Bond;
		this.destination = new oo7.Bond;
	}
	render() {
		return (<div>
			<div><Identicon size='32' id={new AccountId([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])}/></div>
			<div>System: <div style={{marginLeft: '1em'}}>
				<div>Name: <Dot className="value" value={this.pd.system.name}/></div>
				<div>Chain: <Dot className="value" value={this.pd.system.chain}/></div>
				<div>Version: <Dot className="value" value={this.pd.system.version}/></div>
			</div></div>
			<div>Chain: <div style={{marginLeft: '1em'}}>
				<div>Height: <Dot className="value" value={this.pd.chain.height}/></div>
				<div>Code: <Dot className="value" value={this.pd.state.codeSize}/> bytes (<Dot className="value" value={this.pd.state.codeHash.map(bytesToHex)}/>)</div>
				<div>Authorities: <Dot className="value" value={this.pd.state.authorities}/></div>
			</div></div>
			<SignerBond bond={this.source}/>
			(balance: <Dot value={this.pd.runtime.balances.balance(this.source)} />,
			nonce: <Dot value={this.pd.runtime.system.accountNonce(this.source)} />)
			<BalanceBond bond={this.amount}/>
			<AccountIdBond bond={this.destination}/>
			(balance: <Dot value={this.pd.runtime.balances.balance(this.destination)} />)
			<TransactButton
				content="Send"
				tx={{
					sender: this.source,
					call: oo7.Bond
						.all([this.destination, this.amount])
						.map(([d, a]) => polkadot().call.balances.transfer(d, a))
				}}
			/>
		</div>);
	}
}
/*

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


*/
