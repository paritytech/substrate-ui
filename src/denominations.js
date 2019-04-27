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