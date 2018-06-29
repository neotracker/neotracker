import BigNumber from 'bignumber.js';

export function isActionProcessed(
  action: { readonly blockIndex: number; readonly globalIndex: BigNumber },
  processed: { readonly blockIndex: number; readonly globalIndex: BigNumber },
): boolean {
  if (processed.globalIndex.eq(-1)) {
    return processed.blockIndex >= action.blockIndex;
  }

  if (action.globalIndex.eq(-1)) {
    return processed.blockIndex > action.blockIndex;
  }

  return new BigNumber(processed.globalIndex).gte(action.globalIndex);
}
