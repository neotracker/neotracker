/* @flow */
import {
  NEP5_CONTRACT_TYPE,
  UNKNOWN_CONTRACT_TYPE,
  type QueryContext,
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Coin as CoinModel,
  Contract as ContractModel,
  KnownContract as KnownContractModel,
  Transfer as TransferModel,
} from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';
import { Observable, of as _of } from 'rxjs';

import type knex from 'knex';
import { switchMap } from 'rxjs/operators';

const deleteNEP5 = async (
  monitor: Monitor,
  db: knex<*>,
  makeQueryContext: (monitor: Monitor) => QueryContext,
  contract: ContractModel,
): Promise<void> =>
  monitor.captureSpan(
    async span => {
      const asset = await AssetModel.query(db)
        .context(makeQueryContext(span))
        .where('id', contract.id)
        .first();
      if (asset != null) {
        await Promise.all([
          AddressToTransferModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .from(db.raw('address_to_transfer USING transfer'))
            .where(db.raw('address_to_transfer.id2 = transfer.id'))
            .where('transfer.id', asset.id),
          CoinModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .where('asset_id', asset.id),
          AssetToTransactionModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .where('id1', asset.id),
          // Deleting AddressToTransaction is tricky because we probably want to
          // keep the ones where they transferred assets.
          KnownContractModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .where('id', contract.id),
        ]);
        await TransferModel.query(db)
          .context(makeQueryContext(span))
          .delete()
          .where('id', asset.id);
        await asset
          .$query(db)
          .context(makeQueryContext(span))
          .delete();
      }

      await contract
        .$query(db)
        .context(makeQueryContext(span))
        .patch({ type: UNKNOWN_CONTRACT_TYPE });
    },
    { name: 'neotracker_scrape_contract_delete_nep5' },
  );

export default (
  monitorIn: Monitor,
  db: knex<*>,
  makeQueryContext: (monitor: Monitor) => QueryContext,
  hashes$: Observable<Array<string>>,
): Observable<ContractModel> => {
  const monitor = monitorIn.at('scrape_contract');
  return hashes$.pipe(
    switchMap(hashes =>
      monitor.captureSpan(
        async span => {
          const hashesSet = new Set(hashes);
          const currentModels = await ContractModel.query(db)
            .context(makeQueryContext(span))
            .where('type', NEP5_CONTRACT_TYPE);
          await Promise.all(
            currentModels
              .filter(model => !hashesSet.has(model.id))
              .map(model => deleteNEP5(span, db, makeQueryContext, model)),
          );
          const [contracts] = await Promise.all([
            ContractModel.query(db)
              .context(makeQueryContext(span))
              .whereIn('id', hashes),
            ContractModel.query(db)
              .context(makeQueryContext(span))
              .patch({ type: NEP5_CONTRACT_TYPE })
              .whereIn('id', hashes),
          ]);

          return contracts;
        },
        { name: 'neotracker_scrape_contract_process_nep5_hashes' },
      ),
    ),
    switchMap(contracts => _of(...contracts)),
  );
};
