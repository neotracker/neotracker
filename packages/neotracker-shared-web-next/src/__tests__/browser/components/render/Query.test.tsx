import { createTestContext } from '@neotracker/component-explorer';
import { examples } from '../../../../components/render/Query.example';
import { resolveWith, resolveWithInterval, resolveWithIntervalLoop } from '../../../data/utils';

const { mount, getWrapper, setFixtureData, getRef } = createTestContext({ example: examples[0] });

describe('Query', () => {
  const block = (hash: string) => ({
    hash,
    id: 'id',
    transactions: {
      edges: [{ node: { hash: 'transaction-hash', __typename: 'TransactionHash' }, __typename: 'Transaction' }],
      __typename: 'BlockToTransactionsConnection',
    },
    __typename: 'Block',
  });

  beforeEach(async () => {
    await mount();
  });

  test('renders', async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    expect(getWrapper().text()).toEqual('f63jpjfmauhqqlcqfbndm9oju62brw866hk73iv5');
  });

  test('access ref', () => {
    const ref = getRef();
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeDefined();
  });

  test('change fixture data', async () => {
    const hash = 'block-hash';
    const newFixtureData = {
      appContext: {
        apollo: {
          Block: () => block(hash),
        },
      },
    };
    setFixtureData(newFixtureData);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));

    expect(
      getWrapper()
        .text()
        .substr(0, 10),
    ).toEqual(hash);
  });

  test('resolveWith - immediate return', async () => {
    const hash = 'block-hash';
    const blockReturn = {
      data: { block: block(hash) },
    };

    const newFixtureData = {
      appContext: {
        apollo: {
          Block: resolveWith(blockReturn),
        },
      },
    };
    setFixtureData(newFixtureData);

    await new Promise<void>((resolve) => setTimeout(resolve, 5));

    expect(
      getWrapper()
        .text()
        .substr(0, 10),
    ).toEqual(hash);
  });

  test('resolveWith - delayed return', async () => {
    const hash = 'block-hash';
    const blockReturn = {
      data: { block: block(hash) },
    };

    const newFixtureData = {
      appContext: {
        apollo: {
          Block: resolveWith(blockReturn, 100),
        },
      },
    };
    setFixtureData(newFixtureData);

    await new Promise<void>((resolve) => setTimeout(resolve, 5));

    expect(
      getWrapper()
        .text()
        .substr(0, 10),
    ).toEqual('Loading...');

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    expect(
      getWrapper()
        .text()
        .substr(0, 10),
    ).toEqual(hash);
  });

  test('resolveWithInterval', async () => {
    const blockReturns = [
      {
        data: { block: block('hash1') },
      },
      {
        data: { block: block('hash2') },
      },
      {
        data: { block: block('hash3') },
      },
    ];

    const newFixtureData = {
      appContext: {
        apollo: {
          Block: resolveWithInterval(blockReturns, 190),
        },
      },
    };
    setFixtureData(newFixtureData);

    await new Promise<void>((resolve) => setTimeout(resolve, 200));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash1');

    await new Promise<void>((resolve) => setTimeout(resolve, 240));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash2');

    await new Promise<void>((resolve) => setTimeout(resolve, 360));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash3');

    await new Promise<void>((resolve) => setTimeout(resolve, 480));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash3');
  });

  test('resolveWithIntervalLoop', async () => {
    const blockReturns = [
      {
        data: { block: block('hash1') },
      },
      {
        data: { block: block('hash2') },
      },
      {
        data: { block: block('hash3') },
      },
    ];

    const newFixtureData = {
      appContext: {
        apollo: {
          Block: resolveWithIntervalLoop(blockReturns, 49),
        },
      },
    };
    setFixtureData(newFixtureData);

    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash1');

    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash2');

    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash3');

    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    expect(
      getWrapper()
        .text()
        .substr(0, 5),
    ).toEqual('hash1');
  });
});
