/* @flow */
import {
  NEP5_CONTRACT_TYPE,
  Action as ActionModel,
  Block as BlockModel,
  Contract as ContractModel,
  Transaction as TransactionModel,
} from 'neotracker-server-db';
import { type ActionRaw, abi } from '@neo-one/client';
import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import type { Monitor } from '@neo-one/monitor';

import { find } from 'ix/asynciterable';

import { type Context } from '../types';

import { insertNEP5Assets } from './resyncActions';

import { add0x } from '../utils';
import {
  getCurrentHeight,
  processInputOutputResult,
  processChanges,
  saveTransfer,
} from '../run$';

const findActionRaw = async (
  context: Context,
  monitor: Monitor,
  action: ActionModel,
): Promise<ActionRaw> =>
  monitor.captureSpan(
    async span => {
      const actions = context.client
        .smartContract(add0x(action.script_hash), { functions: [] })
        .iterActionsRaw({
          indexStart: action.block_index,
          indexStop: action.block_index + 1,
          monitor: span,
        });

      const foundAction = await find(
        AsyncIterableX.from(actions),
        actionRaw =>
          action.block_index === actionRaw.blockIndex &&
          action.transaction_index === actionRaw.transactionIndex &&
          action.index === actionRaw.index,
      );

      if (foundAction == null) {
        throw new Error('Could not find action');
      }

      return foundAction;
    },
    { name: 'neotracker_scrape_fix_skipped_transfers_find_action_raw' },
  );

const processAction = async (
  context: Context,
  monitor: Monitor,
  action: ActionModel,
) =>
  monitor.captureSpan(
    async span => {
      const [
        actionRaw,
        transactionModel,
        blockModel,
        contractABI,
      ] = await Promise.all([
        findActionRaw(context, span, action),
        TransactionModel.query(context.db)
          .context(context.makeQueryContext(span))
          .findById(action.transaction_id),
        BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('index', action.block_index)
          .first(),
        abi.NEP5(context.client, add0x(action.script_hash)),
      ]);

      if (transactionModel == null) {
        throw new Error('Could not find transaction');
      }

      if (blockModel == null) {
        throw new Error('Could not find block');
      }

      const contract = context.client.smartContract(
        add0x(action.script_hash),
        contractABI,
      );

      const change = await saveTransfer(
        context,
        span,
        actionRaw,
        action,
        (transactionModel: TransactionModel),
        (blockModel: BlockModel),
        contract,
        { errorOnNull: true },
      );

      if (change == null) {
        throw new Error('Did not save transfer');
      }

      const result = await processChanges(context, span, [change]);
      await processInputOutputResult(context, span, result, transactionModel);

      return change;
    },
    { name: 'neotracker_scrape_fix_skipped_transfers_process_action' },
  );

const findActions = async (context: Context, monitor: Monitor) =>
  monitor.captureSpan(
    async span => {
      const [nep5Contracts, height] = await Promise.all([
        ContractModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('type', NEP5_CONTRACT_TYPE),
        getCurrentHeight(context, span),
      ]);

      const actionModels = await ActionModel.query(context.db)
        .context(context.makeQueryContext(span))
        .leftOuterJoin('transfer', 'action.id', 'transfer.id')
        .where('action.args_raw', 'like', '%7472616e73666572%')
        .whereNull('transfer.id')
        .whereIn(
          'action.script_hash',
          nep5Contracts.map(contract => contract.id),
        )
        .where('action.block_index', '<=', height);
      span.setData({ 'actions.size': actionModels.length });

      return actionModels;
    },
    { name: 'neotracker_scrape_fix_skipped_transfers_find_actions' },
  );

const processActions = (
  context: Context,
  monitor: Monitor,
  actions: Array<ActionModel>,
) =>
  monitor.captureSpan(
    async span => {
      for (const action of actions) {
        // eslint-disable-next-line
        await processAction(context, span, action);
      }
    },
    { name: 'neotracker_scrape_fix_skipped_transfers_process_actions' },
  );

export default (
  context: Context,
  monitor: Monitor,
  // eslint-disable-next-line
  checkpoint: string,
) =>
  monitor.at('scrape_migration_fix_skipped_transfers').captureLog(
    async span => {
      await insertNEP5Assets(context, span);
      const actions = await findActions(context, span);
      await processActions(context, span, actions);
    },
    { name: 'neotracker_scrape_fix_skipped_transfers_main' },
  );
