/* @flow */
import { type Transaction } from '@neo-one/client-common';

const TRANSACTION_LENGTH = 'Transaction'.length;

export default (type: $PropertyType<Transaction, 'type'>) =>
  type.substring(0, type.length - TRANSACTION_LENGTH);
