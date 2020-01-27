/* @flow */
import { type Transaction } from '@neo-one/client-common';

export default (type: $PropertyType<Transaction, 'type'>) => {
  let icon;
  switch (type) {
    case 'MinerTransaction':
      icon = 'build';
      break;
    case 'IssueTransaction':
      icon = 'account_balance';
      break;
    case 'ClaimTransaction':
      icon = 'redeem';
      break;
    case 'EnrollmentTransaction':
      icon = 'supervisor_account';
      break;
    case 'RegisterTransaction':
      icon = 'assignment';
      break;
    case 'ContractTransaction':
      icon = 'payment';
      break;
    case 'PublishTransaction':
      icon = 'description';
      break;
    case 'InvocationTransaction':
      icon = 'play_arrow';
      break;
    case 'StateTransaction':
      icon = 'perm_identity';
      break;
    default:
      // eslint-disable-next-line
      (type: empty);
      break;
  }

  return icon;
};
