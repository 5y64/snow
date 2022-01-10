// params
const snowCount = 200;
const snowLayers = 4;
const duneCount = 8;
const minDuneLength = 300;
const maxDuneLength = 1000;
// dune height is from 100-200, scales with length
const viewboxHeight = 400;
const viewboxWidth = 3000;
// store hex of current colors
let currentSkyColor1 = "";
let currentSkyColor2 = "";
let currentSnowColor = "";

// UTILITIES ----------------------------------------------------------------------------------------

const styleObjToString = (style) => {
	let str = "";

	Object.entries(style).map(([k, v]) => {
		str += `${k}: ${v}; `;
	});

	return str;
}

const isValidHexColor = (str) => {
	const hexRegex = /^#[a-fA-F0-9]{6}$/g;
	if (str.match(hexRegex)) {
		return true;
	}
	return false;
}

// return an array of rgb, caller can separate them out
// don't need to validate since it'll only be called 
// after validation
// ref: https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
const hexToRGB = (hexStr) => {
	let hexVal = '0x'+hexStr.substring(1);
	return [(hexVal>>16)&255, (hexVal>>8)&255, hexVal&255];
}


// GRAPHICS ----------------------------------------------------------------------------------------
const makeSnow = () => {
	// make snow and attach to dom
	const canvas = document.getElementById('canvas');

	[...Array(snowCount).keys()].map((idx) => {
		const xpos = Math.random() * 100;
		const xTravel = (Math.random() * 20) - 10;
		const animationLength = Math.random() * 2 + (idx % snowLayers + 5);
		const size = Math.random() * 10;

		let animation = `snowfall-x ${animationLength}s infinite cubic-bezier(.2,.48,.83,.67)`;
		if (Math.random() > 0.5){
		animation = `snowfall-x ${animationLength}s infinite cubic-bezier(.5, 10, .5, -10)`;
		}
		animation += `, snowfall-y ${animationLength}s infinite linear`

		const [snowR, snowG, snowB] = hexToRGB(currentSnowColor);

		let style = {
			"background-color": `rgba(${snowR}, ${snowG}, ${snowB}, ${(Math.random())/3 * (snowLayers -(idx % snowLayers))})`,
			"height": `${size}px`,
			"width": `${size}px`,
			"--x": `${xpos}vw`,
			"--y": `${-(Math.random() * 500)}vh`,
			"--x-travel": `${xTravel}px`,
			"animation": animation
		};

		const snow = document.createElement('div');
		snow.setAttribute('style', styleObjToString(style));
		snow.setAttribute('class', 'snow');

		canvas.appendChild(snow);
	})	
}


const makeDunes = () => {
	// make some snow dunes
	const dunes = document.getElementById('dunes');
	const bucketSize = viewboxWidth / duneCount;

	[...Array(duneCount).keys()].map((idx) => {
		const dune = document.createElementNS("http://www.w3.org/2000/svg", 'path');

		// if < floor dune count / 2 then make darker and shallower

		// xOffset - random within bucket. bucket decided by number of dunes.
		// screen width / duneCount is the size of the bucket.
		// x offset begins at bucket size * idx and ends at bucket size * idx + 1
		const bucketStart = bucketSize * idx;
		const xOffset = Math.random() * (bucketSize / 2) + bucketStart;

		// set points 
		const move = `M ${xOffset} 100`;
		let controlPoint1 = ``;
		const controlPoint2 = ``;
		const duneLength = Math.random() * (maxDuneLength - minDuneLength) + minDuneLength; 
		const endPoint = `${duneLength},0`;

		if (idx % 2 === 0) {
			// right curve, controlPoint1 is free
			const x1 = Math.random() * (duneLength/2);
			const y1 = Math.random() * (-0.5 * duneLength);
			controlPoint1 = `${x1},${y1}`;
		} else {
			// left curve, y1 = y2
			const x1 = Math.random() * duneLength;
			const y1 = Math.random() * (-0.5 * duneLength);
			controlPoint1 = `${x1},${y1}`;
		}

		dune.setAttribute('d', `${move} c ${controlPoint1} 400,0 ${endPoint}`);
		dune.setAttribute('fill', currentSnowColor);

		dunes.appendChild(dune);
	});
}

/*
                   x1  y1  x2  y2  x y
<path d="M 0 50 c 200,-100 400,0 400,0" stroke="white" stroke-width="5" fill="black" />
^ right curve
y2 = y
x > x2
maxDuneHeight < y1 < 0

                   x1   y1  x2  y2  x   y
<path d="M 0 100 c 100,-100 30,-100 400,0" stroke="white" stroke-width="5" fill="black" />
^ left curve
y1 = y2
maxDuneHeight < y1 < 0
*/

const updateSky = () => {
	const canvas = document.getElementById('canvas');
	
	const canvasStyle = {
		"background": `linear-gradient(0deg, ${currentSkyColor1} 0%, ${currentSkyColor2} 100%)`
	};

	canvas.setAttribute('style', styleObjToString(canvasStyle));
}

// EVENT HANDLERS ----------------------------------------------------------------------------------------

const showSettings = () => {
	document.getElementById('settings').setAttribute('style', 'visibility:visible');
}

const hideSettings = () => {
	document.getElementById('settings').setAttribute('style', 'visibility:hidden');
}

const handleSettingsSubmit = () => {
	const skyGradient1 = document.getElementById('sky-gradient-1').value;
	const skyGradient2 = document.getElementById('sky-gradient-2').value;
	const snowColor = document.getElementById('snow-color').value;

	[skyGradient1, skyGradient2, snowColor].map((elem, idx) => {
		if (elem) {
			if (isValidHexColor(elem)) {
				let settingsArr = [null, null, null];
				settingsArr[idx] = elem;
				saveSettings(...settingsArr);
				if (idx < 2) {
					updateSky();
				} else {
					location.reload();
				}
			} else {
				alert(`${elem} is not a valid color! Format like this: #ffffff`);
			}
		}
	});

	hideSettings();
}

const saveSettings = (skyGradient1, skyGradient2, snowColor) => {
	if (skyGradient1) {
		currentSkyColor1 = skyGradient1;
		window.localStorage['skyGradient1'] = skyGradient1;	
	}
	
	if (skyGradient2) {
		currentSkyColor2 = skyGradient2;
		window.localStorage['skyGradient2'] = skyGradient2;	
	}
	
	if (snowColor) {
		[snowR, snowG, snowB] = hexToRGB(snowColor);
		window.localStorage['snowColor'] = snowColor;	
	}
}


window.onload = () => {
	currentSkyColor1 = (window.localStorage['skyGradient1'] ? window.localStorage['skyGradient1'] : "#090979");
	currentSkyColor2 = (window.localStorage['skyGradient2'] ? window.localStorage['skyGradient2'] : "#020024");
	currentSnowColor = window.localStorage['snowColor'] ? window.localStorage['snowColor'] : "#ffffff";

	updateSky();

	makeSnow();
	makeDunes();
}

