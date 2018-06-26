export const labels = {
  CLUSTER_NAME: 'cluster.name',
  // Was this for a new keystore or an existing private key?
  CREATE_KEYSTORE_NEW: 'create.keystore.new',
  // Differentiates click locations
  CLICK_SOURCE: 'click.source',
  // React component stack
  COMPONENT_STACK: 'react.component_stack',
  // Websocket related properties
  WEBSOCKET_URL: 'websocket.url',
  WEBSOCKET_CLOSE_CODE: 'websocket.close.code',
  WEBSOCKET_CLOSE_REASON: 'websocket.close.reason',
  WEBSOCKET_MESSAGE_TYPE: 'websocket.message.type',
  WEBSOCKET_MESSAGEJSON: 'websocket.message_json',
  WEBSOCKET_PROTOCOLS: 'websocket.protocols',
  // GraphQL related propreties
  GRAPHQL_QUERY: 'graphql.query',
  GRAPHQL_VARIABLES: 'graphql.variables',
  GRAPHQL_LIVE_NAME: 'graphql.live.name',
  GRAPHQL_PATH: 'graphql.path',
  // User agent
  UA: 'ua.raw',
  UA_BROWSER_NAME: 'ua.browser.name',
  UA_BROWSER_VERSION: 'ua.browser.version',
  UA_DEVICE_MODEL: 'ua.device.model',
  UA_DEVICE_TYPE: 'ua.device.type',
  UA_DEVICE_VENDOR: 'ua.device.vendor',
  UA_ENGINE_NAME: 'ua.engine.name',
  UA_ENGINE_VERSION: 'ua.engine.version',
  UA_OS_NAME: 'ua.os.name',
  UA_OS_VERSION: 'ua.os.version',
  UA_CPU_ARCHITECTURE: 'ua.cpu.architecture',
  // App version
  APP_VERSION: 'app.version',
  // Client side stack capture
  STACK_MESSAGE: 'client_error.stack.message',
  STACK_LINENUMBER: 'client_error.stack.line_number',
  STACK_COLUMNNUMBER: 'client_error.stack.column_number',
  // Kubernetes
  POD_NAME: 'pod.name',
  // LetsEncrypt
  LETSENCRYPT_DOMAINS: 'lets_encrypt.domains',
  LETSENCRYPT_NAMESPACE: 'lets_encrypt.namespace',
  LETSENCRYPT_SECRET: 'lets_encrypt.secret',
  LETSENCRYPT_HOSTNAME: 'lets_encrypt.hostname',
  // DNS
  DNS_ID: 'dns.id',
  DNS_ADD: 'dns.add',
  DNS_DELETE: 'dns.delete',
  DNS_SERVICE_KEY: 'dns.service.key',
  DNS_SERVICE_RECORDS: 'dns.service.records',
  DNS_SERVICE_DELETE: 'dns.service.delete',
  DNS_NODE_RECORDS: 'dns.node.records',
  // Postgre
  POSTGRES_BACKUPWAL_ISBEHIND: 'postgres.backup_wal.is_behind',
  POSTGRES_BACKUPWAL_VALUE: 'postgres.backup_wal.value',
  POSTGRES_BACKUPWAL_LSNOFFSET: 'postgres.backup_wal.lsn_offset',
  POSTGRES_BACKUPWAL_REDOWAL: 'postgres.backup_wal.redo_wal',
  POSTGRES_BACKUPWAL_REDOWALLSN: 'postgres.backup_wal.redo_wal_lsn',
  POSTGRES_DATAEXIST: 'postgres.data_exist',
  POSTGRES_BACKUPEXIST: 'postgres.backup_exist',
  POSTGRES_ONSAMETIMELINE: 'postgres.on_same_timeline',
  POSTGRES_EXIT_CODE: 'postgres.exit.code',
  POSTGRES_EXIT_SIGNAL: 'postgres.exit.signal',
  POSTGRES_LOG_FILE: 'postgres.log.file',
  POSTGRES_REMOTEWALFILE: 'postgres.remote_walfile',
  // Process
  EXEC_COMMAND: 'exec.command',
  EXEC_ARGS: 'exec.args',
  // Consul
  CONSUL_PATH: 'consul.path',
  CONSUL_KEY: 'consul.key',
  CONSUL_LOCK_REASON: 'consul.lock.reason',
  // Scrape
  ACTION_BLOCK_INDEX: 'action.block.index',
  ACTION_TRANSACTION_INDEX: 'action.transaction.index',
  ACTION_INDEX: 'action.index',
  CONTRACT_HASH: 'contract.hash',
  SCRAPE_REPAIR_NEP5_COINS: 'scrape.repair_nep5.coins',
  SCRAPE_REPAIR_NEP5_ASSET: 'scrape.repair_nep5.asset.hash',
  // General
  QUEUE_SIZE: 'queue.size',
  OPTIONS: 'options',
  // NEO
  NEO_ADDRESS: 'neo.address',
  // Database
  DB_TABLE: 'db.table',
};
