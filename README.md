# NEO Tracker
[![CircleCI](https://circleci.com/gh/neotracker/neotracker.svg?style=shield)](https://circleci.com/gh/neotracker/neotracker) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)

NEO Tracker is a NEO blockchain explorer and wallet.

## Contributing

Welcome to the NEO Tracker community! We're always looking for more contributors and are happy to have you. Documentation on how to contribute can be found [here](.github/CONTRIBUTING.md).

## Environment Setup

The following instructions for how to setup your development environment for NEO Tracker are known to work on Mac, but should work on any Unix-like system.

### Requirements

 - [Postgres 10.3](https://www.postgresql.org/download/)
 - [Node 9.11.1](https://github.com/creationix/nvm)
 - [NEO•ONE](https://neo-one.io/)

### Setup Postgres

We will use the `$PGDATA` environment variable in the following examples. You may set this variable with `export PGDATA=<directory to store database>` if it's not set. For example, on Mac you can use the default data directory with `export PGDATA=/usr/local/var/postgres`

  - `initdb $PGDATA` (initialize the data directory)
  - `pg_ctl -D $PGDATA start` (start postgres)
  - `createdb neotracker_priv` (create the database for NEO Tracker)

### Start a NEO•ONE private network

NEO Tracker is best developed against a private network, which we can setup easily with NEO•ONE.

  - `yarn global add @neo-one/cli` (install NEO•ONE)
  - `neo-one create network priv` (create the private network)
  - `neo-one bootstrap --network priv` (bootstrap the private network with test data)

By default, NEO•ONE will create a private network with the RPC url `http://localhost:40200/rpc`, but in case it's different on your setup, you can look it up with `neo-one describe network priv` for use in the next step.

### Start NEO Tracker

  - `yarn develop:scrape` (start the scraper which populates postgres with blockchain data)
  - `yarn develop:web` (start the webserver on http://localhost:1340)

In both of the above commands, prefix with `NEOTRACKER_RPC_URL=<rpc_url>` where `rpc_url` is the one you found with `neo-one describe network priv` if it's different from the default. E.g. `NEOTRACKER_RPC_URL=http://localhost:40200/rpc yarn develop:scrape`.

### General Tips

  - List wallets on the private network using `neo-one get wallet --network priv`. Grab the private key for a wallet to use for testing with `neo-one describe wallet <wallet_name> --network priv`.
  - Start from a clean slate by deleting the NEO•ONE network and dropping the postgres tables
    - `neo-one delete network priv` (delete the NEO•ONE private network)
    - `yarn develop:drop-tables` (drop the NEO Tracker tables)

## License

NEO Tracker is [MIT licensed](./LICENSE).
