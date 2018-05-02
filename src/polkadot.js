import {Bond, TimeBond, TransformBond} from 'oo7';
import XXH from 'xxhashjs';
const {blake2b} = require('blakejs');
const bs58 = require('bs58');

export function ss58_decode(address) {
	let a;
	try {
		console.log("Decoding", address);
		a = bs58.decode(address);
		console.log("Decoded", a);
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
	for (var i = 0, len = str.length; i < len; i += 2) {
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
	for (var i = 0; i < le.length; i += 2) {
		be = le.substr(i, 2) + be;
	}
	return Number.parseInt(be, 16);
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

//x => typeof(x) === 'string' ? hexToBytes(x) : x
export class Polkadot {
	constructor () {
		let head = new TransformBond(() => req('chain_getHead'), [], [new TimeBond])
		this.head = head;
		this.header = hashBond => new TransformBond(hash => req('chain_getHeader', [hash]), [hashBond], [new TimeBond]).subscriptable();
		this.storage = locBond => new TransformBond(loc => req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]), [locBond], [head]);
		this.code = new TransformBond(() => req('state_getStorage', ['0x' + bytesToHex(stringToBytes(":code"))]).then(hexToBytes), [], [head]);
		this.codeHash = this.code.map(a => blake2b(a));
		function storageMap(prefix, formatResult = r => r, formatArg = x => x) {
			let prefixBytes = stringToBytes(prefix);
			return argBond => new TransformBond(
				arg => {
					let loc = new Uint8Array([...prefixBytes, ...formatArg(arg)]);
					return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]).then(r => formatResult(r, arg));
				},
				[argBond],
				[head]
			);
		}
		function storageValue(stringLocation, formatResult = r => r) {
			return new TransformBond(
				arg => {
					let loc = stringToBytes(stringLocation);
					return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)]).then(r => formatResult(r, arg))
				},
				[],
				[head]
			);
		}
		this.balance = storageMap('sta:bal:', r => r ? leHexToNumber(r.substr(2)) : 0);
		this.index = storageMap('sys:non', r => r ? leHexToNumber(r.substr(2)) : 0);
		this.activeCouncil = storageValue('cou:act', r => r.substr(10).mapChunks([64, 16], i => ({ id: ss58_encode(hexToBytes(i[0])), expires: leHexToNumber(i[1]) })));
		this.proposalVoters = storageMap('cov:voters:', r => r.substr(10).mapChunks([64], i => hexToBytes(i[0])));
		this.proposalVoteOf = storageMap('cov:vote:', r => r !== '0x00', i => new Uint8Array([...i[0], ...i[1]]));
		this.proposals = storageValue('cov:prs', r => r.substr(10).mapChunks([16, 64], i => ({
			ends: leHexToNumber(i[0]),
			hash: i[1],
			proposal: storageMap('cov:pro')(hexToBytes(i[1])),
			votes: this.proposalVoters(hexToBytes(i[1])).mapEach(v => this.proposalVoteOf([hexToBytes(i[1]), v])).map(x => {
				var r = [0, 0];
				x.forEach(i => r[i ? 1 : 0]++);
				return r;
			})
		}))).map(x=>x, 2);
		this.referendumInfoOf = storageMap('dem:pro:', (r, arg) => {
			const VOTE_THRESHOLD = ['SuperMajorityApprove', 'NotSuperMajorityAgainst', 'SimpleMajority'];
			return r ? {
				index: arg,
				ends: leHexToNumber(r.substr(2, 16)),
				proposal: hexToBytes(r.substr(18, r.length - 2 - 16 - 2)),
				voteThreshold: VOTE_THRESHOLD[+r.slice(-2)]
			} : null;
		}, i => hexToBytes(toLEHex(i, 4)));
		this.referendumCount = storageValue('dem:rco', r => leHexToNumber(r.substr(2)));
		this.nextTally = storageValue('dem:nxt', r => leHexToNumber(r.substr(2)));
		this.referenda = Bond.all([this.nextTally, this.referendumCount]).map(([f, t]) => [...Array(t - f)].map((_, i) => this.referendumInfoOf(i)), 1);
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
	}
}
