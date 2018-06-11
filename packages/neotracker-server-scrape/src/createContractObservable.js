/* @flow */
import {
  NEP5_BLACKLIST_CONTRACT_TYPE,
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
import { Observable, type Observer, merge } from 'rxjs';

import _ from 'lodash';
import type knex from 'knex';
import {
  distinctUntilChanged,
  map,
  scan,
  filter,
  switchMap,
} from 'rxjs/operators';

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
          .where('asset_id', asset.id);
        await asset
          .$query(db)
          .context(makeQueryContext(span))
          .delete();
      }

      await contract
        .$query(db)
        .context(makeQueryContext(span))
        .patch({ type: NEP5_BLACKLIST_CONTRACT_TYPE });
    },
    { name: 'neotracker_scrape_contract_delete_nep5' },
  );

const handleBlacklist$ = (
  monitorIn: Monitor,
  db: knex<*>,
  makeQueryContext: (monitor: Monitor) => QueryContext,
  blacklistHashes$: Observable<Array<string>>,
): Observable<void> => {
  const monitor = monitorIn.at('scrape_contract');
  return blacklistHashes$.pipe(
    switchMap(hashes =>
      monitor.captureSpan(
        async span => {
          const hashesSet = new Set(hashes);
          const currentModels = await ContractModel.query(db)
            .context(makeQueryContext(span))
            .where('type', NEP5_CONTRACT_TYPE);
          await Promise.all(
            currentModels
              .filter(model => hashesSet.has(model.id))
              .map(model => deleteNEP5(span, db, makeQueryContext, model)),
          );
          await ContractModel.query(db)
            .context(makeQueryContext(span))
            .patch({ type: UNKNOWN_CONTRACT_TYPE })
            .where('type', NEP5_BLACKLIST_CONTRACT_TYPE)
            .whereNotIn('id', hashes);
        },
        { name: 'neotracker_scrape_contract_process_nep5_blacklist_hashes' },
      ),
    ),
  );
};

const CONTRACT_POLL_TIME_MS = 10000;

class ContractPoller {
  _monitor: Monitor;
  _db: knex<*>;
  _makeQueryContext: (monitor: Monitor) => QueryContext;
  _running: boolean;
  _observer: Observer<Array<ContractModel>>;
  _seenContracts: Set<string>;
  _pollTimeout: ?TimeoutID;

  constructor(
    monitor: Monitor,
    db: knex<*>,
    makeQueryContext: (monitor: Monitor) => QueryContext,
    observer: Observer<Array<ContractModel>>,
  ) {
    this._monitor = monitor;
    this._db = db;
    this._makeQueryContext = makeQueryContext;
    this._observer = observer;
    this._running = false;
    this._seenContracts = new Set();
    this._pollTimeout = null;
  }

  start(): void {
    this._running = true;
    this._poll();
  }

  async _poll(): Promise<void> {
    if (!this._running) {
      return;
    }

    try {
      await this._doPoll();
      this._pollTimeout = setTimeout(() => this._poll(), CONTRACT_POLL_TIME_MS);
    } catch (error) {
      this._running = false;
      this._observer.error(error);
    }
  }

  async _doPoll(): Promise<void> {
    const contractModels = await ContractModel.query(this._db)
      .context(this._makeQueryContext(this._monitor))
      .where('type', NEP5_CONTRACT_TYPE)
      .orWhere('type', UNKNOWN_CONTRACT_TYPE);

    if (this._running) {
      this._observer.next(
        contractModels.filter(
          contractModel => contractModel.type === NEP5_CONTRACT_TYPE,
        ),
      );

      await Promise.all(
        contractModels
          .filter(contractModel => contractModel.type === UNKNOWN_CONTRACT_TYPE)
          .map(contractModel => this._checkNEP5(contractModel)),
      );
    }
  }

  async _checkNEP5(contractModel: ContractModel): Promise<void> {
    const isNEP5 = await this._isNEP5(contractModel);
    if (isNEP5) {
      await contractModel
        .$query(this._db)
        .context(this._makeQueryContext(this._monitor))
        .patch({ type: NEP5_CONTRACT_TYPE });
    }
  }

  async _isNEP5(contractModel: ContractModel): Promise<boolean> {
    const attributes = [
      'totalSupply',
      'name',
      'symbol',
      'decimals',
      'balanceOf',
      'transfer',
    ];

    return attributes.every(attribute => {
      const hex = Buffer.from(attribute, 'utf8').toString('hex');
      return contractModel.script.includes(hex);
    });
  }

  unsubscribe(): void {
    this._running = false;
    if (this._pollTimeout != null) {
      clearTimeout(this._pollTimeout);
      this._pollTimeout = null;
    }
  }
}

export default (
  monitor: Monitor,
  db: knex<*>,
  makeQueryContext: (monitor: Monitor) => QueryContext,
  blacklistHashes$: Observable<Array<string>>,
): Observable<Array<ContractModel>> => {
  const contracts$ = Observable.create(observer => {
    const poller = new ContractPoller(monitor, db, makeQueryContext, observer);
    poller.start();
    return poller;
  });

  const blacklist$ = handleBlacklist$(
    monitor,
    db,
    makeQueryContext,
    blacklistHashes$,
  );

  return merge(contracts$, blacklist$).pipe(
    scan((prev, current) => (current == null ? prev : current)),
    filter(contracts => contracts != null),
    map(contracts => {
      if (contracts == null) {
        throw new Error('For Flow');
      }
      return contracts;
    }),
    distinctUntilChanged(
      (a, b) =>
        !_.isEqual(
          a.map(contract => contract.id).sort(),
          b.map(contract => contract.id).sort(),
        ),
    ),
  );
};
