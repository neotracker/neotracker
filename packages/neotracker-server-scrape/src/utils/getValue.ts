export const getValue = <T>(asset: string, values: { readonly [asset: string]: T | undefined }, defaultValue: T): T => {
  const value = values[asset];

  return value === undefined ? defaultValue : value;
};
