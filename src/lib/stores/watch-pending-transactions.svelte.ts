import {
  resolveVal,
  type ConfigParameter,
  type EnabledParameter,
  type FuncOrVal,
} from "$lib/types";
import {
  type Config,
  type ResolvedRegister,
  type WatchPendingTransactionsParameters,
  watchPendingTransactions,
} from "@wagmi/core";
import { type UnionEvaluate, type UnionPartial } from "@wagmi/core/internal";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";

export type CreateWatchPendingTransactionsParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
> = FuncOrVal<
  UnionEvaluate<
    UnionPartial<WatchPendingTransactionsParameters<config, chainId>> &
    ConfigParameter<config> &
    EnabledParameter
  >
>;

export type CreateWatchPendingTransactionsReturnType = void;

export function createWatchPendingTransactions<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
>(
  parameters: CreateWatchPendingTransactionsParameters<config, chainId> = {} as any,
): CreateWatchPendingTransactionsReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { enabled = true, onTransactions, ...rest } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    if (!enabled) return;
    if (!onTransactions) return;

    unsubscribe?.();
    unsubscribe = watchPendingTransactions(config, {
      ...(rest as any),
      chainId,
      onTransactions,
    });
  });
}
