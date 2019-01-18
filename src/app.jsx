import React from 'react';
require('semantic-ui-css/semantic.min.css');
const { generateMnemonic } = require('bip39')
import {Icon, List, Label, Header, Segment, Divider, Button} from 'semantic-ui-react';
import {Bond, TransformBond} from 'oo7';
import {ReactiveComponent, If, Rspan} from 'oo7-react';
import {calls, runtime, chain, system, runtimeUp, ss58Encode, addressBook, secretStore, metadata, nodeService} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';
import {AccountIdBond, SignerBond} from './AccountIdBond.jsx';
import {BalanceBond} from './BalanceBond.jsx';
import {InputBond} from './InputBond.jsx';
import {TransactButton} from './TransactButton.jsx';
import {FileUploadBond} from './FileUploadBond.jsx';
import {StakingStatusLabel} from './StakingStatusLabel';
import {WalletList, SecretItem} from './WalletList';
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
		window.system = system;
		window.that = this;
		window.metadata = metadata;

		this.source = new Bond;
		this.amount = new Bond;
		this.destination = new Bond;
		this.nick = new Bond;
		this.lookup = new Bond;
		this.name = new Bond;
		this.seed = new Bond;
		this.seedAccount = this.seed.map(s => s ? secretStore().accountFromPhrase(s) : undefined)
		this.seedAccount.use()
		this.runtime = new Bond;
		this.parachainBinary = new Bond;
		this.parachainId = new Bond;
		this.parachainHead = new Bond;
		this.storageKey = new Bond;
		this.storageValue = new Bond;
		this.validatorCount = new Bond;
		this.staker = new Bond;
		this.nomination = new Bond;
	}

	readyRender() {
		return (<div>
			<div>
				<If
					condition={nodeService().status.map(x => !!x.connected)}
					then={<Label>Connected <Label.Detail>
						<Pretty className="value" value={nodeService().status.sub('connected')}/>
					</Label.Detail></Label>}
					else={<Label>Not connected</Label>}
				/>
				<Label>Name <Label.Detail>
					<Pretty className="value" value={system.name}/> v<Pretty className="value" value={system.version}/>
				</Label.Detail></Label>
				<Label>Chain <Label.Detail>
					<Pretty className="value" value={system.chain}/>
				</Label.Detail></Label>
				<Label>Runtime <Label.Detail>
					<Pretty className="value" value={runtime.version.specName}/> v<Pretty className="value" value={runtime.version.specVersion}/> (
						<Pretty className="value" value={runtime.version.implName}/> v<Pretty className="value" value={runtime.version.implVersion}/>
					)
				</Label.Detail></Label>
				<Label>Height <Label.Detail>
					<Pretty className="value" value={chain.height}/> (with <Pretty className="value" value={chain.lag}/> lag)
				</Label.Detail></Label>
				<Label>Authorities <Label.Detail>
					<Rspan className="value">{
						runtime.core.authorities.mapEach(a => <Identicon key={a} account={a} size={16}/>)
					}</Rspan>
				</Label.Detail></Label>
				<Label>Validators <Label.Detail>
					<Rspan className="value">{
						runtime.staking.validators.mapEach(a => <Identicon key={a.who} account={a.who} className={a.invulnerable ? 'invulnerable' : ''} size={16}/>)
					}</Rspan>
				</Label.Detail></Label>
				<Label>Total issuance <Label.Detail>
					<Pretty className="value" value={runtime.balances.totalIssuance}/>
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
							immediate
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
						<If condition={runtime.indices.tryIndex(this.lookup, null).map(x => x !== null)} then={
							<Label>Short-form
								<Label.Detail>
									<Rspan>{runtime.indices.tryIndex(this.lookup).map(ss58Encode)}</Rspan>
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
							immediate
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
						sender: runtime.indices.tryIndex(this.source),
						call: calls.balances.transfer(this.destination, this.amount),
						compact: false,
						longevity: true
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
							sender: runtime.indices.tryIndex(this.staker),
							call: calls.staking.stake()
						}}
						positive
						enabled={runtime.staking.intentionIndexOf(this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unstake"
						icon="sign out"
						tx={{
							sender: runtime.indices.tryIndex(this.staker),
							call: calls.staking.unstake(runtime.staking.intentionIndexOf(this.staker))
						}}
						negative
						enabled={runtime.staking.intentionIndexOf(this.staker).map(i => i !== -1).default(false)}
					/>
					<TransactButton
						content="Nominate"
						icon="hand point right"
						tx={{
							sender: runtime.indices.tryIndex(this.staker),
							call: calls.staking.nominate(runtime.indices.tryIndex(this.nomination))
						}}
						positive
						enabled={runtime.staking.nominationIndex(this.nomination, this.staker).map(i => i === -1).default(false)}
					/>
					<TransactButton
						content="Unnominate"
						icon="thumbs down"
						tx={{
							sender: runtime.indices.tryIndex(this.staker),
							call: calls.staking.unnominate(runtime.staking.nominationIndex(this.staker))
						}}
						negative
						enabled={runtime.staking.nominationIndex(this.staker).map(i => i !== -1).default(false)}
					/>
				</div>
			</Segment>			
			<Divider hidden />
			<If condition={runtime.metadata.map(m => m.modules && m.modules.some(o => o.prefix === 'sudo') || m.modules.some(o => o.prefix === 'upgrade_key'))} then={
				<Segment style={{margin: '1em'}} padded>
					<Header as='h2'>
						<Icon name='search' />
						<Header.Content>
							Runtime Upgrade
							<Header.Subheader>Upgrade the runtime using the UpgradeKey module</Header.Subheader>
						</Header.Content>
					</Header>
					<div style={{paddingBottom: '1em'}}></div>
					<FileUploadBond bond={this.runtime} content='Select Runtime' />
					<TransactButton
						content="Upgrade"
						icon='warning'
						tx={{
							sender: runtime.sudo ? runtime.sudo.key : runtime.upgrade_key.key,
							call: calls.sudo ? calls.sudo.sudo(calls.consensus.setCode(this.runtime)) : calls.upgrade_key.upgrade(this.runtime)
						}}
					/>
				</Segment>
			}/>
			<Divider hidden />
			<If condition={runtime.metadata.map(m => m.modules && m.modules.some(o => o.prefix === 'sudo'))} then={
				<Segment style={{margin: '1em'}} padded>
					<Header as='h2'>
						<Icon name='search' />
						<Header.Content>
							Poke
							<Header.Subheader>Set a particular key of storage to a particular value</Header.Subheader>
						</Header.Content>
					</Header>
					<div style={{paddingBottom: '1em'}}></div>
					<InputBond bond={this.storageKey} placeholder='Storage key e.g. 0xf00baa' />
					<InputBond bond={this.storageValue} placeholder='Storage value e.g. 0xf00baa' />
					<TransactButton
						content="Poke"
						icon='warning'
						tx={{
							sender: runtime.sudo ? runtime.sudo.key : null,
							call: calls.sudo ? calls.sudo.sudo(calls.consensus.setStorage([[this.storageKey.map(hexToBytes), this.storageValue.map(hexToBytes)]])) : null
						}}
					/>
				</Segment>
			}/>
			<Divider hidden />
			<If condition={runtime.metadata.map(m => m.modules && m.modules.some(o => o.prefix === 'sudo') && m.modules.some(o => o.prefix === 'parachains'))} then={
				<Segment style={{margin: '1em'}} padded>
					<Header as='h2'>
						<Icon name='chain' />
						<Header.Content>
							Parachain Registration
							<Header.Subheader>Add a new Parachain</Header.Subheader>
						</Header.Content>
					</Header>
					<div style={{paddingBottom: '1em'}}></div>
					<InputBond bond={this.parachainId} placeholder='Enter a Parachain ID'/>
					<InputBond bond={this.parachainHead} placeholder='Initial head data for the Parachain'/>
					<FileUploadBond bond={this.parachainBinary} content='Select Parachain Binary' />
					<TransactButton
						content="Register"
						icon='warning'
						tx={{
							sender: runtime.sudo ? runtime.sudo.key : null,
							call: calls.sudo && calls.parachains ? calls.sudo.sudo(calls.parachains.registerParachain(this.parachainId, this.parachainBinary, this.parachainHead.map(hexToBytes))) : null
						}}
					/>
				</Segment>
			}/>
			<Divider hidden />
			<If condition={runtime.metadata.map(m => m.modules && m.modules.some(o => o.prefix === 'sudo'))} then={
				<Segment style={{margin: '1em'}} padded>
					<Header as='h2'>
						<Icon name='chain' />
						<Header.Content>
							Validator Group
							<Header.Subheader>Manipulate the validator group</Header.Subheader>
						</Header.Content>
					</Header>
					<div style={{paddingBottom: '1em'}}></div>
					<InputBond bond={this.validatorCount} placeholder='Enter a new number of validators'/>
					<TransactButton
						content="Set"
						icon='warning'
						tx={{
							sender: runtime.sudo ? runtime.sudo.key : null,
							call: calls.sudo ? calls.sudo.sudo(calls.staking.setValidatorCount(this.validatorCount)) : null
						}}
					/>
				</Segment>
			}/>
		</div>);
	}
}
