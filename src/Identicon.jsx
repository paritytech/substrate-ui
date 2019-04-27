// Copyright 2017-2019 Parity Technologies (UK) Ltd
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const PolkadotIdenticon = require('polkadot-identicon').default;
const jdenticon = require('jdenticon');
const {ReactiveComponent} = require('oo7-react');
const React = require('react');
const {bytesToHex} = require('oo7-substrate');

const copyToClipboard = str => {
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};

class Jdenticon extends ReactiveComponent {
	constructor () {
		super(["account"])
        jdenticon()
    }
    readyRender () {
        let v
        try {
            v = ss58Encode(this.state.account)
        }
        catch (e) {
            return <span></span>
        }
		return (<svg
			id={this.props.id}
            name={this.props.name}
            data-jdenticon-value={bytesToHex(this.state.account).substr(2)}
			className={this.props.className}
			style={this.props.style}
			width={this.props.width || this.props.size}
			height={this.props.height || this.props.size}
			onClick={() => { copyToClipboard(ss58); this.props.onCopied && this.props.onCopied(ss58); }}
        ></svg>)
    }
    componentDidMount () {
        jdenticon()
        jdenticon.update()
    }
    componentDidUpdate () {
        jdenticon()
        jdenticon.update()
    }
}

window.jdenticon = jdenticon;

let s_identicon = Jdenticon;

function Identicon(...args) {
    return new s_identicon(...args)
}

function setIdenticonType(type) {
    switch (type) {
        case 'polkadot': { s_identicon = PolkadotIdenticon; break; }
        default: { s_identicon = Jdenticon; break; }
    }
}

setTimeout(() => {
	const { system } = require('oo7-substrate')
	system.chain.tie(name => {
		switch (name) {
			case 'Alexander': { setIdenticonType('polkadot'); break; }
			default: { setIdenticonType('substrate'); break; }
		}
	}),
	0
})
module.exports = { Identicon, setIdenticonType }