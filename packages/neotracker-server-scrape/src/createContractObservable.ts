import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import * as _ from 'lodash';
import {
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Coin as CoinModel,
  Contract as ContractModel,
  KnownContract as KnownContractModel,
  NEP5_BLACKLIST_CONTRACT_TYPE,
  NEP5_CONTRACT_TYPE,
  QueryContext,
  Transfer as TransferModel,
  UNKNOWN_CONTRACT_TYPE,
} from 'neotracker-server-db';
import { utils } from 'neotracker-shared-utils';
import { merge, Observable, Observer } from 'rxjs';
import { distinctUntilChanged, filter, scan, switchMap, take } from 'rxjs/operators';

const deleteNEP5 = async (
  monitor: Monitor,
  db: Knex,
  makeQueryContext: ((monitor: Monitor) => QueryContext),
  contract: ContractModel,
): Promise<void> =>
  monitor.captureSpan(
    async (span) => {
      const asset = await AssetModel.query(db)
        .context(makeQueryContext(span))
        .where('id', contract.id)
        .first();
      if (asset !== undefined) {
        await Promise.all([
          AddressToTransferModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .from(db.raw('address_to_transfer USING transfer'))
            .where(db.raw('address_to_transfer.id2 = transfer.id'))
            .where('transfer.asset_id', asset.id),
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
  db: Knex,
  makeQueryContext: ((monitor: Monitor) => QueryContext),
  blacklistHashes$: Observable<ReadonlyArray<string>>,
): Observable<void> => {
  const monitor = monitorIn.at('scrape_contract');

  return blacklistHashes$.pipe(
    switchMap(async (hashes) =>
      monitor.captureSpan(
        async (span) => {
          const hashesSet = new Set(hashes);
          const currentModels = await ContractModel.query(db)
            .context(makeQueryContext(span))
            .where('type', NEP5_CONTRACT_TYPE);
          await Promise.all(
            currentModels
              .filter((model) => hashesSet.has(model.id))
              .map(async (model) => deleteNEP5(span, db, makeQueryContext, model)),
          );

          await ContractModel.query(db)
            .context(makeQueryContext(span))
            .patch({ type: UNKNOWN_CONTRACT_TYPE })
            .where('type', NEP5_BLACKLIST_CONTRACT_TYPE)
            .whereNotIn('id', [...hashes]);
        },
        { name: 'neotracker_scrape_contract_process_nep5_blacklist_hashes' },
      ),
    ),
  );
};

const CONTRACT_POLL_TIME_MS = 10000;

class ContractPoller {
  private readonly monitor: Monitor;
  private readonly db: Knex;
  private readonly makeQueryContext: ((monitor: Monitor) => QueryContext);
  private mutableRunning: boolean;
  private readonly observer: Observer<ReadonlyArray<ContractModel>>;
  private readonly blacklistHashes$: Observable<ReadonlyArray<string>>;
  private mutablePollTimeout: NodeJS.Timer | undefined;

  public constructor(
    monitor: Monitor,
    db: Knex,
    makeQueryContext: ((monitor: Monitor) => QueryContext),
    observer: Observer<ReadonlyArray<ContractModel>>,
    blacklistHashes$: Observable<ReadonlyArray<string>>,
  ) {
    this.monitor = monitor;
    this.db = db;
    this.makeQueryContext = makeQueryContext;
    this.observer = observer;
    this.blacklistHashes$ = blacklistHashes$;
    this.mutableRunning = false;
  }

  public start(): void {
    this.mutableRunning = true;

    // tslint:disable-next-line no-floating-promises
    this.poll();
  }

  public unsubscribe(): void {
    this.mutableRunning = false;
    if (this.mutablePollTimeout !== undefined) {
      clearTimeout(this.mutablePollTimeout);
      this.mutablePollTimeout = undefined;
    }
  }

  private async poll(): Promise<void> {
    if (!this.mutableRunning) {
      return;
    }

    try {
      await this.doPoll();
      this.mutablePollTimeout = setTimeout(() => {
        // tslint:disable-next-line no-floating-promises
        this.poll();
      }, CONTRACT_POLL_TIME_MS);
    } catch (error) {
      this.mutableRunning = false;
      this.observer.error(error);
    }
  }

  private async doPoll(): Promise<void> {
    const contractModels = await ContractModel.query(this.db)
      .context(this.makeQueryContext(this.monitor))
      .where('type', NEP5_CONTRACT_TYPE)
      .orWhere('type', UNKNOWN_CONTRACT_TYPE);

    if (this.mutableRunning) {
      const nep5Contracts = await Promise.all(
        contractModels
          .filter((contractModel) => contractModel.type === NEP5_CONTRACT_TYPE)
          .map(async (contractModel) => {
            const blacklisted = await this.isBlacklisted(contractModel);

            return blacklisted ? undefined : contractModel;
          }),
      );
      this.observer.next(nep5Contracts.filter(utils.notNull));

      await Promise.all(
        contractModels
          .filter((contractModel) => contractModel.type === UNKNOWN_CONTRACT_TYPE)
          .map(async (contractModel) => this.checkNEP5(contractModel)),
      );
    }
  }

  private async checkNEP5(contractModel: ContractModel): Promise<void> {
    const isNEP5 = await this.isNEP5(contractModel);
    if (isNEP5) {
      await contractModel
        .$query(this.db)
        .context(this.makeQueryContext(this.monitor))
        .patch({ type: NEP5_CONTRACT_TYPE });
    }
  }

  private async isNEP5(contractModel: ContractModel): Promise<boolean> {
    const blacklisted = await this.isBlacklisted(contractModel);
    if (blacklisted) {
      return false;
    }

    const attributes = ['totalSupply', 'name', 'symbol', 'decimals', 'balanceOf', 'transfer'];

    return attributes.every((attribute) => {
      const hex = Buffer.from(attribute, 'utf8').toString('hex');

      return contractModel.script.includes(hex);
    });
  }

  private async isBlacklisted(contractModel: ContractModel): Promise<boolean> {
    const blacklistHashes = await this.blacklistHashes$.pipe(take(1)).toPromise();
    const hashesSet = new Set(blacklistHashes);

    return hashesSet.has(contractModel.id);
  }
}

export const createContractObservable = (
  monitor: Monitor,
  db: Knex,
  makeQueryContext: ((monitor: Monitor) => QueryContext),
  blacklistHashes$: Observable<ReadonlyArray<string>>,
): Observable<ReadonlyArray<ContractModel>> => {
  const contracts$ = Observable.create((observer: Observer<ReadonlyArray<ContractModel>>) => {
    const poller = new ContractPoller(monitor, db, makeQueryContext, observer, blacklistHashes$);

    poller.start();

    return poller;
  });

  const blacklist$ = handleBlacklist$(monitor, db, makeQueryContext, blacklistHashes$);

  return merge(contracts$, blacklist$).pipe(
    scan((prev, current) => (current === undefined ? prev : current)),
    filter(utils.notNull),
    distinctUntilChanged((a, b) =>
      // tslint:disable-next-line no-array-mutation
      _.isEqual(a.map((contract) => contract.id).sort(), b.map((contract) => contract.id).sort()),
    ),
  );
};
