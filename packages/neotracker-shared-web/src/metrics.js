/* @flow */
import { labels } from 'neotracker-shared-utils';
import { metrics } from '@neo-one/monitor';

export const NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_TOTAL = metrics.createCounter(
  {
    name: 'neotracker_wallet_new_flow_private_key_total',
    labelNames: [labels.CREATE_KEYSTORE_NEW],
  },
);
export const NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_FAILURES_TOTAL = metrics.createCounter(
  {
    name: 'neotracker_wallet_new_flow_private_key_failures_total',
    labelNames: [labels.CREATE_KEYSTORE_NEW],
  },
);
export const NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_TOTAL = metrics.createCounter({
  name: 'neotracker_wallet_new_flow_password_total',
  labelNames: [labels.CREATE_KEYSTORE_NEW],
});
export const NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_FAILURES_TOTAL = metrics.createCounter(
  {
    name: 'neotracker_wallet_new_flow_password_failures_total',
    labelNames: [labels.CREATE_KEYSTORE_NEW],
  },
);
export const NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_TOTAL = metrics.createCounter({
  name: 'neotracker_wallet_new_flow_keystore_total',
  labelNames: [labels.CREATE_KEYSTORE_NEW],
});
export const NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_FAILURES_TOTAL = metrics.createCounter(
  {
    name: 'neotracker_wallet_new_flow_keystore_failures_total',
    labelNames: [labels.CREATE_KEYSTORE_NEW],
  },
);
export const NEOTRACKER_WALLET_UPSELL_CLICK_TOTAL = metrics.createCounter({
  name: 'neotracker_wallet_upsell_click_total',
  labelNames: [labels.CLICK_SOURCE],
});
