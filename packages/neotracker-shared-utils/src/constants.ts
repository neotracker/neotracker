export type NEOAssetIDType = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';

export const NEO_ASSET_HASH = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';
export const NEO_ASSET_HASH_0X = `0x${NEO_ASSET_HASH}`;
export const NEO_ASSET_ID = NEO_ASSET_HASH;
export type GASAssetIDType = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7';

export const GAS_ASSET_HASH = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7';
export const GAS_ASSET_HASH_0X = `0x${GAS_ASSET_HASH}`;
export const GAS_ASSET_ID = GAS_ASSET_HASH;

export const NEO_COIN_ASSET = {
  id: `Asset:${NEO_ASSET_HASH}`,
  transaction_id: `Transaction:${NEO_ASSET_HASH}`,
  name: [{ lang: 'zh-CN', name: '小蚁股' }, { lang: 'en', name: 'AntShare' }],
  symbol: 'NEO',
};

export const GAS_COIN_ASSET = {
  id: `Asset:${GAS_ASSET_HASH}`,
  transaction_id: `Transaction:${GAS_ASSET_HASH}`,
  name: [{ lang: 'zh-CN', name: '小蚁币' }, { lang: 'en', name: 'AntCoin' }],
  symbol: 'GAS',
};
