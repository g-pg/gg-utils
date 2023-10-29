type ColorType = 'hsl' | 'rgb' | 'hex';
type ColorsArray = string[];
type SplittedHSL = [number, number, number];

type CreateVariablesOptions = {
	createShades?: boolean;
	variableFormat?: string;
};
export type { ColorsArray, ColorType, SplittedHSL, CreateVariablesOptions };
