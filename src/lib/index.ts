// Provider
export { default as WagmiProvider } from "./WagmiProvider.svelte";

// Errors
export {
  type BaseErrorType,
  BaseError,
  type WagmiProviderNotFoundErrorType,
  WagmiProviderNotFoundError,
} from "./errors";

// Stores
export * from "./stores/account.svelte";
export * from "./stores/balance.svelte";
export * from "./stores/block-number.svelte";
export * from "./stores/block-transaction-count.svelte";
export * from "./stores/block.svelte";
export * from "./stores/bytecode.svelte";
export * from "./stores/call.svelte";
export * from "./stores/chain-id.svelte";
export * from "./stores/chains.svelte";
export * from "./stores/client.svelte";
export * from "./stores/config.svelte";
export * from "./stores/connect.svelte";
export * from "./stores/connections.svelte";
export * from "./stores/connector-client.svelte";
export * from "./stores/connectors.svelte";
export * from "./stores/disconnect.svelte";
export * from "./stores/ens-address.svelte";
export * from "./stores/ens-avatar.svelte";
export * from "./stores/ens-name.svelte";
export * from "./stores/ens-resolver.svelte";
export * from "./stores/ens-text.svelte";
export * from "./stores/estimate-fees-per-gas.svelte";
export * from "./stores/estimate-gas.svelte";
export * from "./stores/estimate-max-priority-fee-per-gas.svelte";
export * from "./stores/fee-history.svelte";
export * from "./stores/gas-price.svelte";
export * from "./stores/infinite-read-contracts.svelte";
export * from "./stores/prepare-transaction-request.svelte";
export * from "./stores/proof.svelte";
export * from "./stores/public-client.svelte";
export * from "./stores/read-contract.svelte";
export * from "./stores/read-contracts.svelte";
export * from "./stores/reconnect.svelte";
export * from "./stores/send-transaction.svelte";
export * from "./stores/sign-message.svelte";
export * from "./stores/sign-typed-data.svelte";
export * from "./stores/simulate-contract.svelte";
export * from "./stores/storage-at.svelte";
export * from "./stores/switch-account.svelte";
export * from "./stores/switch-chain.svelte";
export * from "./stores/transaction-confirmations.svelte";
export * from "./stores/transaction-count.svelte";
export * from "./stores/transaction-receipt.svelte";
export * from "./stores/transaction.svelte";
export * from "./stores/verify-message.svelte";
export * from "./stores/verify-typed-data.svelte";
export * from "./stores/wait-for-transaction-receipt.svelte";
export * from "./stores/wallet-client.svelte";
export * from "./stores/watch-block-number.svelte";
export * from "./stores/watch-blocks.svelte";
export * from "./stores/watch-contract-event.svelte";
export * from "./stores/watch-pending-transactions.svelte";
export * from "./stores/write-contract.svelte";

// Rename create... to createWagmi... to avoid name conflicts
export {
  // Config
  type Connection,
  type Connector,
  type Config,
  type CreateConfigParameters,
  type State,
  createConfig as createWagmiConfig,
  // Connector
  type ConnectorEventMap,
  type CreateConnectorFn,
  createConnector as createWagmiConnector,
  // Errors
  type ChainNotConfiguredErrorType,
  ChainNotConfiguredError,
  type ConnectorAlreadyConnectedErrorType,
  ConnectorAlreadyConnectedError,
  type ConnectorNotFoundErrorType,
  ConnectorNotFoundError,
  type ConnectorAccountNotFoundErrorType,
  ConnectorAccountNotFoundError,
  type ProviderNotFoundErrorType,
  ProviderNotFoundError,
  type SwitchChainNotSupportedErrorType,
  SwitchChainNotSupportedError,
  // Storage
  type CreateStorageParameters,
  type Storage,
  createStorage as createWagmiStorage,
  noopStorage,
  // Transports
  custom,
  fallback,
  http,
  webSocket,
  unstable_connector,
  // Types
  type Register,
  type ResolvedRegister,
  // Utilities
  cookieStorage,
  cookieToInitialState,
  deepEqual,
  deserialize,
  normalizeChainId,
  parseCookie,
  serialize,
} from "@wagmi/core";
