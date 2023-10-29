import { createVariables, getBaseColorName, getColorsType, hexToHSL } from './createCSSVariables';
import { expect, test } from 'vitest';

// test('Color types should be consistent', () => {
// 	expect(getColorsType(['#000', '#123456'])).toBe('hex');
// 	expect(() => getColorsType(['#000', 'hsl(123456)'])).toThrowError();
// });

// test('Get color name by h value', () => {
// 	expect(getBaseColorName([85, 100, 50])).toBe('lime');
// 	expect(() => getBaseColorName([380, 100, 50])).toThrowError();
// });

test('Should create variables', () => {
	expect(createVariables(['04aa6d', 'rgb(39, 41, 53)'], { createShades: false })).toEqual(
		'--cl--blue-500: hsl(0, 0, 0);'
	);
});

// test('Should return splittedHSL', () => {
// 	expect(hexToHSL('282a36')).toEqual([231, 15, 18]);
// });
