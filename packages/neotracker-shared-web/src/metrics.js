/* @flow */
// $FlowFixMe
import {
  AggregationType,
  globalStats,
  MeasureUnit,
} from '@neo-one/client-switch';
import { labelsToTags } from '@neo-one/utils';
// $FlowFixMe
import { labels } from '@neotracker/shared-utils';

export const privateKeyTotal = globalStats.createMeasureInt64(
  'neotracker/new_private_keys',
  MeasureUnit.UNIT,
);
export const privateKeyFailures = globalStats.createMeasureInt64(
  'neotracker/private_key_failures',
  MeasureUnit.UNIT,
);
export const passwordsTotal = globalStats.createMeasureInt64(
  'neotracker/new_passwords',
  MeasureUnit.UNIT,
);
export const passwordFailures = globalStats.createMeasureInt64(
  'neotracker/password_failures',
  MeasureUnit.UNIT,
);
export const totalKeystores = globalStats.createMeasureInt64(
  'neotracker/new_keystores',
  MeasureUnit.UNIT,
);
export const keystoreFailures = globalStats.createMeasureInt64(
  'neotracker/keystore_failures',
  MeasureUnit.UNIT,
);
export const upsellClickTotal = globalStats.createMeasureInt64(
  'neotracker/upsell_clicks',
  MeasureUnit.UNIT,
);

export const NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_private_key_total',
  privateKeyTotal,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow private key total',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_TOTAL);

export const NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_FAILURES_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_private_key_failures_total',
  privateKeyFailures,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow private key total failures',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_FAILURES_TOTAL);

export const NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_password_total',
  passwordsTotal,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow password total',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_TOTAL);

export const NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_FAILURES_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_password_failures_total',
  passwordFailures,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow password total failures',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_FAILURES_TOTAL);

export const NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_keystore_total',
  totalKeystores,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow keystore total',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_TOTAL);

export const NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_FAILURES_TOTAL = globalStats.createView(
  'neotracker_wallet_new_flow_keystore_failures_total',
  keystoreFailures,
  AggregationType.COUNT,
  labelsToTags([labels.CREATE_KEYSTORE_NEW]),
  'neotracker wallet new flow keystores total failures',
);
globalStats.registerView(NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_FAILURES_TOTAL);

export const NEOTRACKER_WALLET_UPSELL_CLICK_TOTAL = globalStats.createView(
  'neotracker_wallet_upsell_click_total',
  upsellClickTotal,
  AggregationType.COUNT,
  labelsToTags([labels.CLICK_SOURCE]),
  'neotracker wallet upsell click total',
);
globalStats.registerView(NEOTRACKER_WALLET_UPSELL_CLICK_TOTAL);
