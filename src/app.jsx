import React from 'react';
require('semantic-ui-css/semantic.min.css');
const {Button, Icon, Label, Menu, Dropdown} = require('semantic-ui-react');
const {blake2b} = require('blakejs');

import oo7 from 'oo7';
import {ReactiveComponent, If, Rspan} from 'oo7-react';
import {AccountId, bytesToHex, pretty, substrate} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';
import {AccountIdBond, SignerBond} from './AccountIdBond.jsx';
import {BalanceBond} from './BalanceBond.jsx';
import {TransactButton} from './TransactButton.jsx';

export class Dot extends ReactiveComponent {
	constructor () {
		super(["value", "default", "className"])
	}
	render () {
		if (this.ready() || this.props.default == null) {
			return (<span className={this.state.className} name={this.props.name}>
				{(this.props.prefix || '') + pretty(this.state.value) + (this.props.suffix || '')}
			</span>)
		} else {
			return <span>{this.props.default}</span>			
		}
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

export class WithSubstrate extends React.Component {
	constructor () {
		super ()
		this.state = {ready: false}
		let that = this
		substrate().whenReady(() => that.setState({ready: true}))
	}
	render () {
		if (this.state.ready) {
			return this.props.children
		} else {
			return <div/>
		}
	}
}

export class App extends React.Component {
	constructor () {
		super();
		/*const denominationInfoDOT = {
			denominations: {
				dot: 15,
				point: 12,
				µdot: 9,
			},
			primary: 'dot',
			unit: 'planck',
			ticker: 'DOT'
		}*/
		const denominationInfoBBQ = {
			denominations: {
				bbq: 15,
			},
			primary: 'bbq',
			unit: 'birch',
			ticker: 'BBQ'
		}
		this.pd = substrate(denominationInfoBBQ);
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
		window.substrate = this.pd;
		this.source = new oo7.Bond;
		this.amount = new oo7.Bond;
		this.destination = new oo7.Bond;
		this.tx = {
			sender: this.source,
			call: substrate().call.balances.transfer(this.destination, this.amount)
		};
	}
	// TODO: catch subscription throws. 
	render() {
		return (<div>
			<div>
				<Label>Name <Label.Detail><Dot className="value" value={this.pd.system.name}/></Label.Detail></Label>
				<Label>Chain <Label.Detail><Dot className="value" value={this.pd.system.chain}/></Label.Detail></Label>
				<Label>Version <Label.Detail><Dot className="value" value={this.pd.system.version}/></Label.Detail></Label>
				<Label>Height <Label.Detail><Dot className="value" value={this.pd.chain.height}/></Label.Detail></Label>
				<Label>Authorities <Label.Detail><Rspan className="value">{this.pd.state.authorities.mapEach(a => <Identicon key={a} id={a} size={16}/>)}</Rspan></Label.Detail></Label>
			</div>
			<SignerBond bond={this.source}/>
			<If condition={this.source.ready()} then={<span>
				<Label>Balance
					<Label.Detail>
						<Dot value={this.pd.runtime.balances.balance(this.source)}/>
					</Label.Detail>
				</Label>
				<Label>Nonce
					<Label.Detail>
						<Dot value={this.pd.runtime.system.accountNonce(this.source)}/>
					</Label.Detail>
				</Label>
			</span>}/>
			<BalanceBond bond={this.amount}/>
			<AccountIdBond bond={this.destination}/>
			<If condition={this.destination.ready()} then={
				<Label>Balance
					<Label.Detail>
						<Dot value={this.pd.runtime.balances.balance(this.destination)}/>
					</Label.Detail>
				</Label>
			}/>
			<TransactButton
				content="Send"
				tx={this.tx}
				enabled={Bond.all([this.tx]).ready()}
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
