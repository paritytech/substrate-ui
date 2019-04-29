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
            data-jdenticon-value={bytesToHex(this.state.account)}
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