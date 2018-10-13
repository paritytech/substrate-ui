import React from 'react';
require('semantic-ui-css/semantic.min.css');
const { generateMnemonic } = require('bip39')
import {Icon, List, Label, Header, Segment, Divider, Button} from 'semantic-ui-react';
import {Bond, TransformBond} from 'oo7';
import {ReactiveComponent, If, Rspan} from 'oo7-react';
import {calls, runtime, chain, system, runtimeUp, ss58Encode, addressBook, secretStore} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';
import {AccountIdBond, SignerBond} from './AccountIdBond.jsx';
import {BalanceBond} from './BalanceBond.jsx';
import {InputBond} from './InputBond.jsx';
import {TransactButton} from './TransactButton.jsx';
import {StakingStatusLabel} from './StakingStatusLabel';
import {WalletList} from './WalletList';
import {AddressBookList} from './AddressBookList';
import {TransformBondButton} from './TransformBondButton';
import {Pretty} from './Pretty';

export class App extends ReactiveComponent {
	constructor () {
		super([], { ensureRuntime: runtimeUp })

		// For debug only.
		window.runtime = runtime;
		window.secretStore = secretStore;
		window.addressBook = addressBook;
		window.chain = chain;
		window.calls = calls;
		window.that = this;

		this.source = new Bond;
		this.amount = new Bond;
		this.destination = new Bond;
		this.staker = new Bond;
		this.nomination = new Bond;
		this.nick = new Bond;
		this.lookup = new Bond;
		this.name = new Bond;
		this.seed = new Bond;
		this.seedAccount = this.seed.map(s => s ? secretStore().accountFromSeed(s) : undefined)
		this.seedAccount.use()
	}

	readyRender() {
		return (<div>
			<div>
				<Label>Name <Label.Detail>
					<Pretty className="value" value={system.name}/>
				</Label.Detail></Label>
				<Label>Chain <Label.Detail>
					<Pretty className="value" value={system.chain}/>
				</Label.Detail></Label>
				<Label>Version <Label.Detail>
					<Pretty className="value" value={system.version}/>
				</Label.Detail></Label>
				<Label>Height <Label.Detail>
					<Pretty className="value" value={chain.height}/>
				</Label.Detail></Label>
				<Label>Authorities <Label.Detail>
					<Rspan className="value">{
						runtime.core.authorities.mapEach(a => <Identicon key={a} account={a} size={16}/>)
					}</Rspan>
				</Label.Detail></Label>
			</div>
			<Segment style={{margin: '1em'}}>
				<Header as='h2'>
					<Icon name='key' />
					<Header.Content>
						Wallet
						<Header.Subheader>Manage your secret keys</Header.Subheader>
					</Header.Content>
				</Header>
				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>seed</div>
					<InputBond
						bond={this.seed}
						reversible
						placeholder='Some seed for this key'
						validator={n => n || null}
						action={<Button content="Another" onClick={() => this.seed.trigger(generateMnemonic())} />}
						iconPosition='left'
						icon={<i style={{opacity: 1}} className='icon'><Identicon account={this.seedAccount} size={28} style={{marginTop: '5px'}}/></i>}
					/>
				</div>
				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>name</div>
					<InputBond
						bond={this.name}
						placeholder='A name for this key'
						validator={n => n ? secretStore().map(ss => ss.byName[n] ? null : n) : null}
						action={<TransformBondButton
							content='Create'
							transform={(name, seed) => secretStore().submit(seed, name)}
							args={[this.name, this.seed]}
						/>}
					/>
				</div>
				<div style={{paddingBottom: '1em'}}>
					<WalletList/>
				</div>
			</Segment>
			<Divider hidden />
			<Segment style={{margin: '1em'}} padded>
				<Header as='h2'>
					<Icon name='search' />
					<Header.Content>
						Address Book
						<Header.Subheader>Inspect the status of any account and name it for later use</Header.Subheader>
					</Header.Content>
				</Header>
  				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>lookup account</div>
					<AccountIdBond bond={this.lookup}/>
					<If condition={this.lookup.ready()} then={<div>
						<Label>Balance
							<Label.Detail>
								<Pretty value={runtime.balances.balance(this.lookup)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Pretty value={runtime.system.accountNonce(this.lookup)}/>
							</Label.Detail>
						</Label>
						<StakingStatusLabel id={this.lookup}/>
						<If condition={runtime.balances.tryIndex(this.lookup, null).map(x => x !== null)} then={
							<Label>Short-form
								<Label.Detail>
									<Rspan>{runtime.balances.tryIndex(this.lookup).map(ss58Encode)}</Rspan>
								</Label.Detail>
							</Label>
						}/>
						<Label>Address
							<Label.Detail>
								<Pretty value={this.lookup}/>
							</Label.Detail>
						</Label>
					</div>}/>
				</div>
				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>name</div>
					<InputBond
						bond={this.nick}
						placeholder='A name for this address'
						validator={n => n ? addressBook().map(ss => ss.byName[n] ? null : n) : null}
						action={<TransformBondButton
							content='Add'
							transform={(name, account) => { addressBook().submit(account, name); return true }}
							args={[this.nick, this.lookup]}
						/>}
					/>
				</div>
				<div style={{paddingBottom: '1em'}}>
					<AddressBookList/>
				</div>
			</Segment>
			<Divider hidden />
			<Segment style={{margin: '1em'}} padded>
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
								<Pretty value={runtime.balances.balance(this.source)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Pretty value={runtime.system.accountNonce(this.source)}/>
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
								<Pretty value={runtime.balances.balance(this.destination)}/>
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
						sender: runtime.balances.tryIndex(this.source),
						call: calls.balances.transfer(runtime.balances.tryIndex(this.destination), this.amount)
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
								<Pretty value={runtime.balances.balance(this.staker)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Pretty value={runtime.system.accountNonce(this.staker)}/>
							</Label.Detail>
						</Label>
						<StakingStatusLabel id={this.staker}/>
					</span>}/>
				</div>

  				<div style={{paddingBottom: '1em'}}>
					<div style={{fontSize: 'small'}}>nominated account</div>
					<AccountIdBond bond={this.nomination}/>
					<If condition={this.nomination.ready()} then={<span>
						<Label>Balance
							<Label.Detail>
								<Pretty value={runtime.balances.balance(this.nomination)}/>
							</Label.Detail>
						</Label>
						<Label>Nonce
							<Label.Detail>
								<Pretty value={runtime.system.accountNonce(this.nomination)}/>
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
							sender: runtime.balances.tryIndex(this.staker),
							call: calls.staking.stake()
						}}
						positive
						enabled={runtime.staking.intentionIndexOf(this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unstake"
						icon="sign out"
						tx={{
							sender: runtime.balances.tryIndex(this.staker),
							call: calls.staking.unstake(runtime.staking.intentionIndexOf(this.staker))
						}}
						negative
						enabled={runtime.staking.intentionIndexOf(this.staker).map(i => i !== -1).default(false)}
					/>
					<TransactButton
						content="Nominate"
						icon="hand point right"
						tx={{
							sender: runtime.balances.tryIndex(this.staker),
							call: calls.staking.nominate(runtime.balances.tryIndex(this.nomination))
						}}
						positive
						enabled={runtime.staking.nominationIndex(this.nomination, this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unnominate"
						icon="thumbs down"
						tx={{
							sender: runtime.balances.tryIndex(this.staker),
							call: calls.staking.unnominate(runtime.staking.nominationIndex(this.staker))
						}}
						negative
						enabled={runtime.staking.nominationIndex(this.staker).map(i => i !== -1).default(false)}
					/>
				</div>
			</Segment>
		</div>);
	}
}



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

/*
				<div>Validators: <ValidatorBalances value={this.validators}/></div>
				<div>Next 3 Up: <Pretty value={this.nextThreeUp}/></div>
			</div></div>
			<div>Democracy: <div style={{marginLeft: '1em'}}>
				<div>Active referenda: <Pretty value={runtime.democracy.active}/></div>
				<div>Proposed referenda: <Pretty value={runtime.democracy.proposed}/></div>
				<div>Launch period: <Pretty value={runtime.democracy.launchPeriod}/></div>
				<div>Minimum deposit: <Pretty value={runtime.democracy.minimumDeposit}/></div>
				<div>Voting period: <Pretty value={runtime.democracy.votingPeriod}/></div>
			</div></div>
			<div>Council: <div style={{marginLeft: '1em'}}>
				<div>Members: <Pretty value={runtime.council.active}/></div>
				<div>Candidates: <Pretty value={runtime.council.candidates}/></div>
				<div>Candidacy bond: <Pretty value={runtime.council.candidacyBond}/></div>
				<div>Voting bond: <Pretty value={runtime.council.votingBond}/></div>
				<div>Present slash per voter: <Pretty value={runtime.council.presentSlashPerVoter}/></div>
				<div>Carry count: <Pretty value={runtime.council.carryCount}/></div>
				<div>Presentation duration: <Pretty value={runtime.council.presentationDuration}/></div>
				<div>Inactive grace period: <Pretty value={runtime.council.inactiveGracePeriod}/></div>
				<div>Voting period: <Pretty value={runtime.council.votingPeriod}/></div>
				<div>Term duration: <Pretty value={runtime.council.termDuration}/></div>
				<div>Desired seats: <Pretty value={runtime.council.desiredSeats}/></div>
			</div></div>
			<div>Council Voting: <div style={{marginLeft: '1em'}}>
				<div>Voting Period: <Pretty value={runtime.councilVoting.votingPeriod}/></div>
				<div>Cooloff Period: <Pretty value={runtime.councilVoting.cooloffPeriod}/></div>
				<div>Proposals: <Pretty value={runtime.councilVoting.proposals}/></div>


*/
