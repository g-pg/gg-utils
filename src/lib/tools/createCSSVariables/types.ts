type ColorType = 'hsl' | 'rgb' | 'hex';
type ColorsArray = string[];
type SplittedHSL = [number, number, number];

type CreateVariablesOptions = {
	createShades?: {
		create: true;
		number: number;
	};
	variableFormat?: string;
	returnFormat?: 'array' | 'string';
};
export type { ColorsArray, ColorType, SplittedHSL, CreateVariablesOptions };
