const { setNetworkDefault, denominationInfo: { init } } = require('oo7-substrate')

setNetworkDefault(42)

const denominationInfoDOT = {
	denominations: {
		dot: 15,
		point: 12,
		µdot: 9,
	},
	primary: 'dot',
	unit: 'planck',
	ticker: 'DOT'
}

const denominationInfoCHR = {
	denominations: {
		chr: 15,
	},
	primary: 'chr',
	unit: 'cherry',
	ticker: 'CHR'
}

const denominationInfoELM = {
	denominations: {
		chr: 15,
	},
	primary: 'elm',
	unit: 'ember',
	ticker: 'ELM'
}

setTimeout(() => {
	const { system } = require('oo7-substrate')
	system.chain.tie(name => {
		switch (name) {
			case 'Alexander': { init(denominationInfoDOT); break; }
			case 'Charred Cherry': { init(denominationInfoCHR); break; }
			case 'Emberic Elm': { init(denominationInfoELM); break; }
		}
	}),
	0
})