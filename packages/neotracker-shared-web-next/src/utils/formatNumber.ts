import BigNumber from 'bignumber.js';

interface Options {
  readonly decimalPlaces?: number;
}

export const formatNumber = (numberIn: number | string, optionsIn?: Options): string => {
  const options = optionsIn === undefined ? {} : optionsIn;
  const value = new BigNumber(numberIn);
  const decimalPlaces = options.decimalPlaces === undefined ? value.decimalPlaces() : options.decimalPlaces;

  return value.toFormat(decimalPlaces);
};
