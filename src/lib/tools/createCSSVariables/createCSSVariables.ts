import type { ColorType, ColorsArray, CreateVariablesOptions, SplittedHSL } from './types';

function getIndividualColorType(color: string): ColorType {
	if (color.includes('hsl')) {
		return 'hsl';
	}

	if (color.includes('#') || color.length === 6 || color.length === 3) {
		return 'hex';
	}

	if (color.includes('rgb')) {
		return 'rgb';
	}

	throw new Error('Invalid color format');
}

function getColorsType(colors: ColorsArray): string {
	let colorType: ColorType = getIndividualColorType(colors[0]);

	const consistent = colors.every((color) => getIndividualColorType(color) === colorType);

	if (consistent) {
		return colorType;
	} else {
		throw new Error('All colors must have the same type (RGB, HSL or HEX)');
	}
}

function hexToHSLArray(hex: string): SplittedHSL {
	// Remove the hash sign if it's included

	hex = hex.replace(/^#/, '');
	console.log('hex', hex);
	let splittedHEX = hex.split('');

	if (hex.length !== 3 && hex.length !== 6) {
		throw new Error('Invalid hex format');
	}

	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((n) => n.repeat(2))
			.join('');
	}

	// Parse hexadecimal values for red, green, and blue
	var r = parseInt(hex.substring(0, 2), 16) / 255;
	var g = parseInt(hex.substring(2, 4), 16) / 255;
	var b = parseInt(hex.substring(4, 6), 16) / 255;

	// Find the maximum and minimum values for RGB
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);

	// Calculate the lightness
	var l = (max + min) / 2;
	var s, h;

	// Check for saturation
	if (max === min) {
		s = 0; // Achromatic
		h = 0; // It doesn't matter what value it has
	} else {
		// Calculate the saturation
		s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

		// Calculate the hue
		if (max === r) {
			h = (g - b) / (max - min);
		} else if (max === g) {
			h = 2 + (b - r) / (max - min);
		} else {
			h = 4 + (r - g) / (max - min);
		}

		// Convert hue to degrees
		h *= 60;
		if (h < 0) {
			h += 360;
		}
	}

	// Round values to two decimal places and return as an object
	return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHSLArray(rgb: string): SplittedHSL {
	const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;

	const match = rgb.match(rgbRegex);
	let r = 0;
	let g = 0;
	let b = 0;

	if (match) {
		r = Number(match[1]) / 255;
		g = Number(match[2]) / 255;
		b = Number(match[3]) / 255;
	}

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
				break;
			case g:
				h = ((b - r) / d + 2) * 60;
				break;
			case b:
				h = ((r - g) / d + 4) * 60;
				break;
		}
	}

	return [Math.round(h!), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHSLArray(hsl: string): SplittedHSL {
	const cleanString = hsl.replaceAll('%', '');
	const valuesStart = cleanString.indexOf('(');
	const valuesEnd = cleanString.indexOf(')');
	const [h, s, l] = cleanString
		.substring(valuesStart + 1, valuesEnd)
		.split(',')
		.map((s) => Number(s.trim()));

	return [h, s, l];
}

function convertToHSL(color: string): SplittedHSL {
	let colorType = getIndividualColorType(color);

	switch (colorType) {
		case 'hsl':
			return hslToHSLArray(color);
		case 'rgb':
			return rgbToHSLArray(color);
		case 'hex':
			return hexToHSLArray(color);
		default:
			throw new Error('Invalid color format');
	}
}

function getBaseColorName(splittedHSL: SplittedHSL): string | void {
	const [h, s, l] = splittedHSL;

	const hShades = [
		{
			name: 'red',
			min: 0,
			max: 20
		},
		{
			name: 'orange',
			min: 20,
			max: 45
		},
		{
			name: 'yellow',
			min: 45,
			max: 70
		},
		{
			name: 'lime',
			min: 70,
			max: 90
		},
		{
			name: 'green',
			min: 90,
			max: 160
		},
		{
			name: 'cyan',
			min: 160,
			max: 180
		},
		{
			name: 'blue',
			min: 180,
			max: 260
		},
		{
			name: 'purple',
			min: 260,
			max: 335
		},
		{
			name: 'red',
			min: 335,
			max: 360
		}
	];

	let color = null;

	if (l <= 10) {
		return (color = 'black');
	}

	if (l >= 90) {
		return (color = 'white');
	}

	if (s < 15) {
		return (color = 'grey');
	}

	for (const shade of hShades) {
		if (h >= shade.min && h <= shade.max) {
			return (color = shade.name);
		}
	}

	if (!color) {
		throw new Error('Something went wrong');
	}
}

function modifyHSL(hsl: SplittedHSL, result: 'darker' | 'lighter'): SplittedHSL {
	let [h, s, l] = hsl;

	if (result === 'lighter') {
		let newLightness = l + 10;
		if (newLightness > 100) newLightness = 100;
		return [h, s, newLightness];
	}

	if (result === 'darker') {
		let newLightness = l - 10;
		if (newLightness < 0) newLightness = 0;
		return [h, s, newLightness];
	}

	return hsl;
}

function createVariables(colorsArray: ColorsArray, options?: CreateVariablesOptions): string {
	const hslArray = colorsArray.map((color) => convertToHSL(color));

	const variablesArray: string[] = [];

	const format = options?.variableFormat || 'cl-';

	const formatHSL = (hsl: SplittedHSL) => {
		const formattedArray = hsl.map((n, i) => {
			return i === 0 ? n : String(n) + '%';
		});
		return `hsl(${formattedArray.join(', ')})`;
	};

	for (const hsl of hslArray) {
		const [h, s, l] = hsl;
		let baseColorName = getBaseColorName(hsl);

		const tone = Math.floor(l / 10) * 100;

		variablesArray.push(`--${format}${baseColorName}-${tone}: ${formatHSL(hsl)};`);

		if (options?.createShades) {
			const lighterHSL = modifyHSL(hsl, 'lighter');
			const darkerHSL = modifyHSL(hsl, 'darker');
			variablesArray.unshift(
				`--${format}${baseColorName}-${tone - 100}: ${formatHSL(lighterHSL)};`
			);
			variablesArray.push(`--${format}${baseColorName}-${tone + 100}: ${formatHSL(darkerHSL)};`);
		}
	}

	return variablesArray.join('\n');
}

export { hexToHSLArray as hexToHSL, getColorsType, getBaseColorName, createVariables };
