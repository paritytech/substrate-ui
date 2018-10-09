import React from 'react';
require('semantic-ui-css/semantic.min.css');
const {Button, Icon, Label, Menu, Dropdown, Header, Segment, Divider} = require('semantic-ui-react');
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
		this.state = { ready: false }
		substrate()	// get things ready early now for when it does eventually mount
	}

	componentDidMount () {
		console.log('HERE')
		let that = this
		substrate().whenReady(() => that.setState({ ready: true }))
	}

	render () {
		if (this.state.ready) {
			return this.props.children
		} else {
			return <div/>
		}
	}
}

let intentionIndexOf = id =>
	new oo7.TransformBond((i, id) => {
		let ss58 = ss58_encode(id);
		return i.findIndex(a => ss58_encode(a) === ss58);
	}, [substrate().runtime.staking.intentions, id])

let validatorIndexOf = id =>
	new oo7.TransformBond((i, id) => {
		let ss58 = ss58_encode(id);
		return i.findIndex(a => ss58_encode(a) === ss58);
	}, [substrate().runtime.session.validators, id])

let bondageOf = id =>
	new oo7.TransformBond(
		(b, h) => h >= b ? null : (b - h),
		[substrate().runtime.staking.bondage(id), substrate().chain.height]
	)

let nominationIndex = (val, nom) =>
	new oo7.TransformBond((i, id) => {
		let ss58 = ss58_encode(id);
		return i.findIndex(a => ss58_encode(a) === ss58);
	}, [substrate().runtime.staking.nominatorsFor(nom), val])

export class StakingStatusLabel extends ReactiveComponent {
	constructor () {
		super (['id'], {
			intentionIndex: ({id}) => intentionIndexOf(id),
			validatorIndex: ({id}) => validatorIndexOf(id),
			bondage: ({id}) => bondageOf(id),
			nominating: ({id}) => substrate().runtime.staking.nominating(id)
		})
	}
	render () {
		let staked = this.state.intentionIndex !== -1
		let validating = this.state.validatorIndex !== -1
		let bondage = this.state.bondage
		let nominating = this.state.nominating && this.state.nominating.length === 32
		return staked && validating
			? <Label><Icon name='certificate'/>Staked<Label.Detail>Validating</Label.Detail></Label>
			: nominating
			? <Label><Icon name='hand point right'/>Staked<Label.Detail>Nominating</Label.Detail></Label>
			: staked
			? <Label><Icon name='pause'/>Staked<Label.Detail>Idle</Label.Detail></Label>
			: !staked && validating
			? <Label><Icon name='sign out'/>Staked<Label.Detail>Retiring</Label.Detail></Label>
			: !staked && bondage !== null
			? <Label><Icon name='clock outline'/>Unstaking<Label.Detail>{bondage} blocks to go</Label.Detail></Label>
			: <Label><Icon name='times'/>Not staked</Label>
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
		this.pd = substrate();
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
		window.that = this;
		window.intentionIndexOf = intentionIndexOf;
		window.validatorIndexOf = validatorIndexOf;
		this.source = new oo7.Bond;
		this.amount = new oo7.Bond;
		this.destination = new oo7.Bond;
		this.staker = new oo7.Bond;
		this.nomination = new oo7.Bond;
	}

	render() {
		return (<div>
			<div>
				<Label>Name <Label.Detail><Dot className="value" value={this.pd.system.name}/></Label.Detail></Label>
				<Label>Chain <Label.Detail><Dot className="value" value={this.pd.system.chain}/></Label.Detail></Label>
				<Label>Version <Label.Detail><Dot className="value" value={this.pd.system.version}/></Label.Detail></Label>
				<Label>Height <Label.Detail><Dot className="value" value={this.pd.chain.height}/></Label.Detail></Label>
				<Label>Authorities <Label.Detail><Rspan className="value">{this.pd.state.authorities.mapEach(a => <Identicon key={a} id={a} size={16}/>)}</Rspan></Label.Detail></Label>
			</div>
			<Segment style={{margin: '1em'}}>
				<Header as='h2'>
					<Icon name='send' />
					<Header.Content>
						Send Funds
						<Header.Subheader>Send funds from your account to another</Header.Subheader>
					</Header.Content>
				</Header>
  				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>from</div>
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
				</div>
				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>to</div>
					<AccountIdBond bond={this.destination}/>
					<If condition={this.destination.ready()} then={
						<Label>Balance
							<Label.Detail>
								<Dot value={this.pd.runtime.balances.balance(this.destination)}/>
							</Label.Detail>
						</Label>
					}/>
				</div>
				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>amount</div>
					<BalanceBond bond={this.amount}/>
				</div>
				<TransactButton
					content="Send"
					icon='send'
					tx={{
						sender: substrate().runtime.balances.tryIndex(this.source),
						call: substrate().call.balances.transfer(substrate().runtime.balances.tryIndex(this.destination), this.amount)
					}}
				/>
			</Segment>
			<Divider hidden />
			<Segment style={{margin: '1em'}} padded>
				<Header as='h2'>
					<Icon name='certificate' />
					<Header.Content>
						Stake and Nominate
						<Header.Subheader>Lock your funds and register your validator node or nominate another</Header.Subheader>
					</Header.Content>
				</Header>
  				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>staking account</div>
					<SignerBond bond={this.staker}/>
					<If condition={this.staker.ready()} then={<span>
						<Label>Balance
							<Label.Detail>
								<Dot value={this.pd.runtime.balances.balance(this.staker)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Dot value={this.pd.runtime.system.accountNonce(this.staker)}/>
							</Label.Detail>
						</Label>
						<StakingStatusLabel id={this.staker}/>
					</span>}/>
				</div>

  				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>nominated account</div>
					<SignerBond bond={this.nomination}/>
					<If condition={this.nomination.ready()} then={<span>
						<Label>Balance
							<Label.Detail>
								<Dot value={this.pd.runtime.balances.balance(this.nomination)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Dot value={this.pd.runtime.system.accountNonce(this.nomination)}/>
							</Label.Detail>
						</Label>
						<StakingStatusLabel id={this.nomination}/>
					</span>}/>
				</div>
					
				<div style={{paddingBottom: '1em'}}>
					<TransactButton
						content="Stake"
						icon="sign in"
						tx={{
							sender: substrate().runtime.balances.tryIndex(this.staker),
							call: substrate().call.staking.stake()
						}}
						positive
						enabled={intentionIndexOf(this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unstake"
						icon="sign out"
						tx={{
							sender: substrate().runtime.balances.tryIndex(this.staker),
							call: substrate().call.staking.unstake(intentionIndexOf(this.staker))
						}}
						negative
						enabled={intentionIndexOf(this.staker).map(i => i !== -1).default(false)}
					/>
					<TransactButton
						content="Nominate"
						icon="hand point right"
						tx={{
							sender: substrate().runtime.balances.tryIndex(this.staker),
							call: substrate().call.staking.nominate(substrate().runtime.balances.tryIndex(this.nomination))
						}}
						positive
						enabled={nominationIndex(this.nomination, this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unnominate"
						icon="thumbs down"
						tx={{
							sender: substrate().runtime.balances.tryIndex(this.staker),
							call: substrate().call.staking.unnominate(nominationIndex(this.nomination, this.staker))
						}}
						negative
						enabled={nominationIndex(this.nomination, this.staker).map(i => i !== -1).default(false)}
					/>
				</div>
			</Segment>
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
