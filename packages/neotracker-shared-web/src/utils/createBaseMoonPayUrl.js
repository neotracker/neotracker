/* @flow */
const currencyCode = 'neo';
const colorCode = encodeURIComponent('#00e599');
const enabledPaymentMethods = encodeURIComponent(
  'credit_debit_card,sepa_bank_transfer,gbp_bank_transfer',
);

export type MoonPayUrlOptions = {|
  moonpayPublicApiKey: string,
  moonpayUrl: string,
  walletAddress?: string,
  redirectLink: string,
|};

export const createBaseMoonPayUrl = ({
  moonpayPublicApiKey,
  moonpayUrl,
  walletAddress,
  redirectLink,
}: MoonPayUrlOptions): string => {
  const baseUrl = `${moonpayUrl}?apiKey=${moonpayPublicApiKey}&currencyCode=${currencyCode}&colorCode=${colorCode}&redirectLink=${encodeURIComponent(
    redirectLink,
  )}&enabledPaymentMethods=${enabledPaymentMethods}`;

  return walletAddress
    ? `${baseUrl}&showWalletAddressForm=true&walletAddress=${walletAddress}`
    : baseUrl;
};

export default createBaseMoonPayUrl;
