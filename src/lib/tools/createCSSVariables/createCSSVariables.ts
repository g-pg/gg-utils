import type { ColorType, ColorsArray, CreateVariablesOptions, SplittedHSL } from './types';

function getIndividualColorType(color: string): ColorType {
	if (color.includes('hsl')) {
		return 'hsl';
	}

	if (color.includes('rgb')) {
		return 'rgb';
	}
	if (/^#?([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
		return 'hex';
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
	hex = hex.replace(/^#/, '');
	if (Number.isNaN(hex)) {
		throw new Error('Invalid color format');
	}

	if (hex.length !== 3 && hex.length !== 6) {
		throw new Error('Invalid hex format');
	}

	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((n) => n.repeat(2))
			.join('');
	}

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
		s = 0;
		h = 0;
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

	if (!match) {
		throw new Error('Invalid RGB format');
	}

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
		h = s = 0;
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
	if (valuesStart === -1 || valuesEnd === -1) {
		throw new Error('Invalid color format');
	}

	const [h, s, l] = cleanString
		.substring(valuesStart + 1, valuesEnd)
		.split(',')
		.map((s) => Number(s.trim()));

	if (cleanString.length !== 3) {
		throw new Error('Invalid HSL format');
	}
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

function getBaseColorName(splittedHSL: SplittedHSL): string {
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

	let color = '';

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

	return color;
}

function modifyHSL(hsl: SplittedHSL, result: 'darker' | 'lighter', step: number): SplittedHSL {
	let [h, s, l] = hsl;
	step = step * 10;

	if (result === 'lighter') {
		let newLightness = l + step;
		if (newLightness > 100) newLightness = 100;
		return [h, s, newLightness];
	}

	if (result === 'darker') {
		let newLightness = l - step;
		if (newLightness < 0) newLightness = 0;
		return [h, s, newLightness];
	}

	return hsl;
}

function formatVariable(
	baseColorName: string,
	tone: number,
	hsl: SplittedHSL,
	variableFormat?: string
) {
	const [h, s, l] = hsl;
	const format = variableFormat || 'cl-';
	const formatHSL = (hsl: SplittedHSL) => {
		const formattedArray = hsl.map((n, i) => {
			return i === 0 ? n : String(n) + '%';
		});
		return `hsl(${formattedArray.join(', ')})`;
	};

	const writeTone = baseColorName != 'white' && baseColorName !== 'black';

	return `--${format}${baseColorName}${writeTone ? '-' + tone : ''}: ${formatHSL(hsl)};`;
}

function removeRepetitions(variablesArray: string[]) {
	const set = new Set(variablesArray);

	let white = 0;
	let black = 0;

	set.forEach((v) => {
		if (v.includes('white')) {
			white++;
			if (white > 1) set.delete(v);
		}
		if (v.includes('black')) {
			black++;
			if (black > 1) set.delete(v);
		}
	});
	return Array.from(set);
}
export default function createVariables(
	colorsArray: ColorsArray,
	options?: CreateVariablesOptions
): string | string[] {
	const hslArray = colorsArray.map((color) => convertToHSL(color));

	let variablesArray: string[] = [];

	for (const hsl of hslArray) {
		const [h, s, l] = hsl;
		let baseColorName = getBaseColorName(hsl);

		const tone = Math.floor(l / 10) * 100;
		variablesArray.push(formatVariable(baseColorName, tone, hsl, options?.variableFormat));

		if (options?.createShades?.create) {
			let numberOfShades = options.createShades.number || 1;

			for (let i = 0; i < numberOfShades; i++) {
				let lighter = modifyHSL(hsl, 'lighter', i + 1);
				let darker = modifyHSL(hsl, 'darker', i + 1);
				variablesArray.push(
					formatVariable(
						getBaseColorName(lighter),
						tone + 100 * (i + 1),
						lighter,
						options?.variableFormat
					)
				);
				variablesArray.unshift(
					formatVariable(
						getBaseColorName(darker),
						tone - 100 * (i + 1),
						darker,
						options?.variableFormat
					)
				);
			}
		}
	}

	variablesArray = removeRepetitions(variablesArray);
	return options?.returnFormat === 'array' ? variablesArray : variablesArray.join('\n');
}

export { hexToHSLArray, getColorsType, getBaseColorName, createVariables };
