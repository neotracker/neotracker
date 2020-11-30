/* @flow */
const currencyCode = 'neo';
const colorCode = encodeURIComponent('#00e599');
const enabledPaymentMethods = encodeURIComponent(
  'credit_debit_card,sepa_bank_transfer,gbp_bank_transfer,gbp_open_banking_payment',
);

export type MoonPayUrlOptions = {|
  moonpayPublicApiKey: string,
  moonpayUrl: string,
  redirectLink: string,
|};

export const createBaseMoonPayUrl = ({
  moonpayPublicApiKey,
  moonpayUrl,
  redirectLink,
}: MoonPayUrlOptions): string => {
  return `${moonpayUrl}?apiKey=${moonpayPublicApiKey}&currencyCode=${currencyCode}&colorCode=${colorCode}&redirectLink=${encodeURIComponent(
    redirectLink,
  )}&enabledPaymentMethods=${enabledPaymentMethods}&showWalletAddressForm=true`;
};

export default createBaseMoonPayUrl;
