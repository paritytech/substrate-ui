import {Bond, TimeBond, TransformBond} from 'oo7';
import XXH from 'xxhashjs';
const {blake2b} = require('blakejs');
const bs58 = require('bs58');

export function ss58_decode(address) {
	let a;
	try {
		a = bs58.decode(address);
	}
	catch (e) {
		return null;
	}
	if (a[0] == 42) {
		if (a.length == 32 + 1 + 2) {
			let address = a.slice(0, 33);
			let hash = blake2b(address);
			if (a[33] == hash[0] && a[34] == hash[1]) {
				return address.slice(1);
			} else {
				// invalid checksum
				return null;
			}
		} else {
			// Invalid length.
			return null;
		}
	} else {
		// Invalid version.
		return null;
	}
}

export function ss58_encode(address) {
	if (address.length != 32) {
		return null;
	}
	let bytes = new Uint8Array([42, ...address]);
	let hash = blake2b(bytes);
	let complete = new Uint8Array([...bytes, hash[0], hash[1]]);
	return bs58.encode(complete);
}

export const Calls = {0: {
	name: 'consensus',
	calls: interpretRustCalls(`
fn report_misbehavior(aux, report: MisbehaviorReport) = 0;
	`),
	priv_calls: interpretRustCalls(`
fn set_code(new: Vec<u8>) = 0;
fn set_storage(items: Vec<KeyValue>) = 1;
	`)
}, 1: {
	name: 'session',
	calls: interpretRustCalls(`
fn set_key(aux, key: T::SessionKey) = 0;
	`),
	priv_calls: interpretRustCalls(`
fn set_length(new: T::BlockNumber) = 0;
fn force_new_session() = 1;
	`)
}, 2: {
	name: 'staking',
	calls: interpretRustCalls(`
fn transfer(aux, dest: T::AccountId, value: T::Balance) = 0;
fn stake(aux) = 1;
fn unstake(aux) = 2;
	`),
	priv_calls: interpretRustCalls(`
fn set_sessions_per_era(new: T::BlockNumber) = 0;
fn set_bonding_duration(new: T::BlockNumber) = 1;
fn set_validator_count(new: u32) = 2;
fn force_new_era() = 3;
	`)
}, 3: {
	name: 'timestamp',
	calls: [],
	priv_calls: []
}, 5: {
	name: 'democracy',
	calls: interpretRustCalls(`
fn propose(aux, proposal: Box<T::Proposal>, value: T::Balance) = 0;
fn second(aux, proposal: PropIndex) = 1;
fn vote(aux, ref_index: ReferendumIndex, approve_proposal: bool) = 2;
	`),
	priv_calls: interpretRustCalls(`
fn start_referendum(proposal: Box<T::Proposal>, vote_threshold: VoteThreshold) = 0;
fn cancel_referendum(ref_index: ReferendumIndex) = 1;
	`)
}, 6: {
	name: 'council',
	calls: interpretRustCalls(`
fn set_approvals(aux, votes: Vec<bool>, index: VoteIndex) = 0;
fn reap_inactive_voter(aux, signed_index: u32, who: T::AccountId, who_index: u32, assumed_vote_index: VoteIndex) = 1;
fn retract_voter(aux, index: u32) = 2;
fn submit_candidacy(aux, slot: u32) = 3;
fn present_winner(aux, candidate: T::AccountId, total: T::Balance, index: VoteIndex) = 4;
	`),
	priv_calls: interpretRustCalls(`
fn set_desired_seats(count: u32) = 0;
fn remove_member(who: T::AccountId) = 1;
fn set_presentation_duration(count: T::BlockNumber) = 2;
fn set_term_duration(count: T::BlockNumber) = 3;
	`)
}, 7: {
	name: 'council_voting',
	calls: interpretRustCalls(`
fn propose(aux, proposal: Box<T::Proposal>) = 0;
fn vote(aux, proposal: T::Hash, approve: bool) = 1;
fn veto(aux, proposal_hash: T::Hash) = 2;
	`),
	priv_calls: interpretRustCalls(`
fn set_cooloff_period(blocks: T::BlockNumber) = 0;
fn set_voting_period(blocks: T::BlockNumber) = 1;
	`)
}};
function interpretRustCalls(s) {
	var r = {};
	s.split('\n')
		.map(s => s.trim())
		.filter(s => !s.startsWith('//') && !s.length == 0)
		.map(s => s.match(/fn ([a-z_]*)\((aux,? ?)?(.*)\) = ([0-9]+);/))
		.map(([_0, name, _2, p, index], i) => {
			let params = p.length == 0 ? [] : p.split(',').map(p => {
				let m = p.match(/([a-z_]*): *([A-Za-z][A-Za-z<>:0-9]+)/);
				let name = m[1];
				var type = m[2].replace('T::', '');
				type = type.match(/^Box<.*>$/) ? type.slice(4, -1) : type;
				return { name, type };
			});
			r[index] = { name, params };
		});
	return r;
}

function stringify(input, type) {
	if (typeof type === 'object') {
		return type.map(t => stringify(input, t));
	}
	switch (type) {
		case 'Call': {
			let c = Calls[input.data[0]];
			let res = c.name + '.';
			c = c.calls[input.data[1]];
			input.data = input.data.slice(2);
			return res + c.name + '(' + c.params.map(p => p.name + "=" + stringify(input, p.type)).join(', ') + ')';
		}
		case 'Proposal': {
			let c = Calls[input.data[0]];
			let res = c.name + '.';
			c = c.priv_calls[input.data[1]];
			input.data = input.data.slice(2);
			return res + c.name + '(' + c.params.map(p => p.name + "=" + stringify(input, p.type)).join(', ') + ')';
		}
		case 'AccountId': {
			let res = ss58_encode(input.data.slice(0, 32));
			input.data = input.data.slice(32);
			return res;
		}
		case 'Hash': {
			let res = '0x' + bytesToHex(input.data.slice(0, 32));
			input.data = input.data.slice(32);
			return res;
		}
		case 'Balance':
		case 'BlockNumber': {
			let res = '' + leToNumber(input.data.slice(0, 8));
			input.data = input.data.slice(8);
			return res;
		}
		case 'VoteThreshold': {
			const VOTE_THRESHOLD = ['SuperMajorityApprove', 'NotSuperMajorityAgainst', 'SimpleMajority'];
			let res = VOTE_THRESHOLD[input.data[0]];
			input.data = input.data.slice(1);
			return res;
		}
		case 'u32':
		case 'VoteIndex':
		case 'PropIndex':
		case 'ReferendumIndex': {
			let res = '' + leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			return res;
		}
		case 'bool': {
			let res = input.data[0] ? 'true' : 'false';
			input.data = input.data.slice(1);
			return res;
		}
		case 'KeyValue': {
			return stringify(input, '(Vec<u8>, Vec<u8>)');
		}
		case 'Vec<bool>': {
			let size = leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			let res = '[' + [...input.data.slice(0, size)].join('') + ']';
			input.data = input.data.slice(size);
			return res;
		}
		case 'Vec<u8>': {
			let size = leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			let res = '[' + bytesToHex(input.data.slice(0, size)) + ']';
			input.data = input.data.slice(size);
			return res;
		}
		default: {
			let v = type.match(/^Vec<(.*)>$/);
			if (v) {
				let size = leToNumber(input.data.slice(0, 4));
				input.data = input.data.slice(4);
				let res = '[' + [...new Array(size)].map(() => stringify(input, v[1])).join(', ') + ']';
				return res;
			}
			let t = type.match(/^\((.*)\)$/);
			if (t) {
				return '(' + stringify(input, t[1].split(', ')).join(', ') + ')';
			}
			throw 'Unknown type to stringify: ' + type;
		}
	}
}

class AccountId extends Uint8Array {}
class Hash extends Uint8Array {}
class VoteThreshold extends String {}
class Tuple extends Array {}
class CallProposal extends Object { constructor (isCall) { super(); this.isCall = isCall; } }
class Proposal extends Object { constructor () { super(false); }}
class Call extends Object { constructor () { super(true); }}

function deslice(input, type) {
	if (typeof input.data === 'undefined') {
		input = { data: input };
	}
	if (typeof type === 'object') {
		return type.map(t => deslice(input, t));
	}
	switch (type) {
		case 'Call':
		case 'Proposal': {
			let c = Calls[input.data[0]];
			let res = type === 'Call' ? new Call : new Proposal;
			res.module = c.name;
			c = c[type == 'Call' ? 'calls' : 'priv_calls'][input.data[1]];
			input.data = input.data.slice(2);
			res.name = c.name;
			res.params = c.params.map(p => ({ name: p.name, type: p.type, value: deslice(input, p.type) }));
			return res;
		}
		case 'AccountId': {
			let res = new AccountId(input.data.slice(0, 32));
			input.data = input.data.slice(32);
			return res;
		}
		case 'Hash': {
			let res = new Hash(input.data.slice(0, 32));
			input.data = input.data.slice(32);
			return res;
		}
		case 'Balance':
		case 'BlockNumber': {
			let res = leToNumber(input.data.slice(0, 8));
			input.data = input.data.slice(8);
			return res;
		}
		case 'VoteThreshold': {
			const VOTE_THRESHOLD = ['SuperMajorityApprove', 'NotSuperMajorityAgainst', 'SimpleMajority'];
			let res = new VoteThreshold(VOTE_THRESHOLD[input.data[0]]);
			input.data = input.data.slice(1);
			return res;
		}
		case 'u32':
		case 'VoteIndex':
		case 'PropIndex':
		case 'ReferendumIndex': {
			let res = leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			return res;
		}
		case 'bool': {
			let res = !!input.data[0];
			input.data = input.data.slice(1);
			return res;
		}
		case 'KeyValue': {
			return deslice(input, '(Vec<u8>, Vec<u8>)');
		}
		case 'Vec<bool>': {
			let size = leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			let res = [...input.data.slice(0, size)].map(a => !!a);
			input.data = input.data.slice(size);
			return res;
		}
		case 'Vec<u8>': {
			let size = leToNumber(input.data.slice(0, 4));
			input.data = input.data.slice(4);
			let res = input.data.slice(0, size);
			input.data = input.data.slice(size);
			return res;
		}
		default: {
			let v = type.match(/^Vec<(.*)>$/);
			if (v) {
				let size = leToNumber(input.data.slice(0, 4));
				input.data = input.data.slice(4);
				return [...new Array(size)].map(() => deslice(input, v[1]));
			}
			let t = type.match(/^\((.*)\)$/);
			if (t) {
				return new Tuple(...deslice(input, t[1].split(', ')));
			}
			throw 'Unknown type to deslice: ' + type;
		}
	}
}

export function pretty(expr) {
	if (expr === null) {
		return 'null';
	}
	if (expr instanceof VoteThreshold) {
		return 'VoteThreshold.' + expr;
	}
	if (expr instanceof Hash) {
		return '0x' + bytesToHex(expr);
	}
	if (expr instanceof AccountId) {
		return ss58_encode(expr);
	}
	if (expr instanceof Tuple) {
		return '(' + expr.map(pretty).join(', ') + ')';
	}
	if (expr instanceof Uint8Array) {
		return '[' + bytesToHex(expr) + ']';
	}
	if (expr instanceof Array) {
		return '[' + expr.map(pretty).join(', ') + ']';
	}
	if (expr instanceof Call || expr instanceof Proposal) {
		return expr.module + '.' + expr.name + '(' + expr.params.map(p => p.name + '=' + pretty(p.value)).join(', ') + ')';
	}
	if (typeof expr === 'object') {
		return '{' + Object.keys(expr).map(k => k + ': ' + pretty(expr[k])).join(', ') + '}';
	}
	return '' + expr;
}

export function req(method, params = []) {
	try {
		return fetch("http://127.0.0.1:9933/", {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				"jsonrpc": "2.0",
				"id": "1",
				"method": method,
				"params": params
			}),
			headers: new Headers({ 'Content-Type': 'application/json' })
		}).then(r => r.json()).then(r => r.result || null);
	}
	catch (e) {
		return new Promise();
	}
}

export function balanceOf(pubkey) {
	let loc = new Uint8Array([...stringToBytes('sta:bal:'), ...hexToBytes(pubkey)]);
	return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)])
		.then(r => r ? leHexToNumber(r.substr(2)) : 0);
}

export function indexOf(pubkey) {
	let loc = new Uint8Array([...stringToBytes('sys:non'), ...hexToBytes(pubkey)]);
	return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)])
		.then(r => r ? leHexToNumber(r.substr(2)) : 0);
}

export function stringToSeed(s) {
	var data = new Uint8Array(32);
	data.fill(32);
	for (var i = 0; i < s.length; i++){
		data[i] = s.charCodeAt(i);
	}
	return data;
}
export function stringToBytes(s) {
	var data = new Uint8Array(s.length);
	for (var i = 0; i < s.length; i++){
		data[i] = s.charCodeAt(i);
	}
	return data;
}
export function hexToBytes(str) {
	if (!str) {
		return new Uint8Array();
	}
	var a = [];
	for (var i = str.startsWith('0x') ? 2 : 0, len = str.length; i < len; i += 2) {
		a.push(parseInt(str.substr(i, 2), 16));
	}

	return new Uint8Array(a);
}
export function bytesToHex(uint8arr) {
	if (!uint8arr) {
		return '';
	}
	var hexStr = '';
	for (var i = 0; i < uint8arr.length; i++) {
		var hex = (uint8arr[i] & 0xff).toString(16);
		hex = (hex.length === 1) ? '0' + hex : hex;
		hexStr += hex;
	}

	return hexStr.toLowerCase();
}
export function toLEHex(val, bytes) {
	let be = ('00'.repeat(bytes) + val.toString(16)).slice(-bytes * 2);
	var le = '';
	for (var i = 0; i < be.length; i += 2) {
		le = be.substr(i, 2) + le;
	}
	return le;
}
export function leHexToNumber(le) {
	var be = '';
	for (var i = le.startsWith('0x') ? 2 : 0; i < le.length; i += 2) {
		be = le.substr(i, 2) + be;
	}
	return Number.parseInt(be, 16);
}

export function toLE(val, bytes) {
	let r = new Uint8Array(bytes);
	for (var o = 0; val > 0; ++o) {
		r[o] = val % 256;
		val /= 256;
	}
	return r;
}

export function leToNumber(le) {
	let r = 0;
	le.forEach((x, i) => r += (x << (i * 8)));
	return r;
}

String.prototype.chunks = function(size) {
	var r = [];
	var count = this.length / size;
	for (var i = 0; i < count; ++i) {
		r.push(this.substr(i * size, size));
	}
	return r;
}

String.prototype.mapChunks = function(sizes, f) {
	var r = [];
	var count = this.length / sizes.reduce((a, b) => a + b, 0);
	var offset = 0;
	for (var i = 0; i < count; ++i) {
		r.push(f(sizes.map(s => {
			let r = this.substr(offset, s);
			offset += s;
			return r;
		})));
	}
	return r;
}

Uint8Array.prototype.mapChunks = function(sizes, f) {
	var r = [];
	var count = this.length / sizes.reduce((a, b) => a + b, 0);
	var offset = 0;
	for (var i = 0; i < count; ++i) {
		r.push(f(sizes.map(s => {
			offset += s;
			return this.slice(offset - s, offset);
		})));
	}
	return r;
}

export class Polkadot {
	constructor () {
		let head = new TransformBond(() => req('chain_getHead'), [], [new TimeBond])
		this.head = head;
		this.header = hashBond => new TransformBond(hash => req('chain_getHeader', [hash]), [hashBond], [new TimeBond]).subscriptable();
		this.storage = locBond => new TransformBond(loc => req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]), [locBond], [head]);
		this.code = new TransformBond(() => req('state_getStorage', ['0x' + bytesToHex(stringToBytes(":code"))]).then(hexToBytes), [], [head]);
		this.codeHash = this.code.map(a => blake2b(a));
		function storageMap(prefix, formatResult = r => r, formatArg = x => x, postApply = x => x) {
			let prefixBytes = stringToBytes(prefix);
			return argBond => postApply(new TransformBond(
				arg => {
					let loc = new Uint8Array([...prefixBytes, ...formatArg(arg)]);
					return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]).then(r => formatResult(r && hexToBytes(r), arg));
				},
				[argBond],
				[head]
			));
		}
		function storageValue(stringLocation, formatResult = r => r) {
			return new TransformBond(
				arg => {
					let loc = stringToBytes(stringLocation);
					return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]).then(r => formatResult(r && hexToBytes(r), arg))
				},
				[],
				[head]
			);
		}

		this.system = {
			index: storageMap('sys:non', r => r ? leToNumber(r) : 0)
		};

		this.staking = {
			balance: storageMap('sta:bal:', r => r ? leToNumber(r) : 0)
		};

		this.council = {
			active: storageValue('cou:act', r => deslice(r, 'Vec<(AccountId, BlockNumber)>').map(i => ({ id: i[0], expires: i[1] })))
		};

		let referendumCount = storageValue('dem:rco', r => r ? leToNumber(r) : 0);
		let nextTally = storageValue('dem:nxt', r => r ? leToNumber(r) : 0);
		let referendumVoters = storageMap('dem:vtr:', r => r ? deslice(r, 'Vec<AccountId>') : [], i => toLE(i, 4));
		let referendumVoteOf = storageMap('dem:vot:', r => r && !!r[0], i => new Uint8Array([...toLE(i[0], 4), ...i[1]]));
		let referendumInfoOf = storageMap('dem:pro:', (r, index) => {
			if (r == null) return null;
			let [ends, proposal, voteThreshold] = deslice(r, ['BlockNumber', 'Proposal', 'VoteThreshold']);
			let votes = referendumVoters(index).map(r => r || []).mapEach(v => Bond.all([referendumVoteOf([index, v]), this.staking.balance(v)])).map(x => {
				var r = [0, 0];
				x.forEach(([v, b]) => r[v ? 1 : 0] += b);
				return {aye: r[1], nay: r[0]};
			});
			return { index, ends, proposal, voteThreshold, votes };
		}, i => toLE(i, 4), x => x.map(x=>x, 1));

		this.democracy = {
			proposed: storageValue('dem:pub', r => r ? deslice(r, 'Vec<(PropIndex, Proposal, AccountId)>').map(i => ({ index: i[0], proposal: i[1], proposer: i[2] })) : []),
			active: Bond.all([nextTally, referendumCount]).map(([f, t]) => [...Array(t - f)].map((_, i) => referendumInfoOf(f + i)), 1)
		};

		let proposalVoters = storageMap('cov:voters:', r => r && deslice(r, 'Vec<AccountId>'));
		let proposalVoteOf = storageMap('cov:vote:', r => !!r[0], i => new Uint8Array([...i[0], ...i[1]]));

		this.councilVoting = {
			cooloffPeriod: storageValue('cov:cooloff', r => deslice(r, 'BlockNumber')),
			votingPeriod: storageValue('cov:period', r => deslice(r, 'BlockNumber')),
			proposals: storageValue('cov:prs', r => deslice(r, 'Vec<(BlockNumber, Hash)>').map(i => ({
				ends: i[0],
				hash: i[1],
				proposal: storageMap('cov:pro', r => r && deslice(r, 'Proposal'))(i[1]),
				votes: proposalVoters(i[1]).map(r => r || []).mapEach(v => proposalVoteOf([i[1], v])).map(x => {
					var r = [0, 0];
					x.forEach(i => r[i ? 1 : 0]++);
					return {aye: r[1], nay: r[0]};
				})
			}))).map(x=>x, 2)
		};

		window.polkadot = this;
		window.req = req;
		window.ss58_encode = ss58_encode;
		window.ss58_decode = ss58_decode;
		window.bytesToHex = bytesToHex;
		window.stringToBytes = stringToBytes;
		window.hexToBytes = hexToBytes;
		window.that = this;
		window.storageMap = storageMap;
		window.storageValue = storageValue;
		window.toLE = toLE;
		window.leToNumber = leToNumber;
		window.stringify = stringify;
		window.pretty = pretty;
		window.deslice = deslice;
	}
}
