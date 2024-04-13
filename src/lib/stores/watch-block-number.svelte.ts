import {
  resolveVal,
  type ConfigParameter,
  type EnabledParameter,
  type FuncOrVal,
} from "$lib/types";
import {
  type Config,
  type ResolvedRegister,
  type WatchBlockNumberParameters,
  watchBlockNumber,
} from "@wagmi/core";
import { type UnionEvaluate, type UnionPartial } from "@wagmi/core/internal";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";

export type CreateWatchBlockNumberParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
> = FuncOrVal<
  UnionEvaluate<
    UnionPartial<WatchBlockNumberParameters<config, chainId>> &
      ConfigParameter<config> &
      EnabledParameter
  >
>;

export type CreateWatchBlockNumberReturnType = void;

export function createWatchBlockNumber<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
>(
  parameters: CreateWatchBlockNumberParameters<config, chainId> = {} as any,
): CreateWatchBlockNumberReturnType {
  const { enabled, onBlockNumber, ...rest } = $derived(resolveVal(parameters));

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolveVal(parameters).chainId ?? configChainId);
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    if (!enabled) return;
    if (!onBlockNumber) return;

    unsubscribe?.();
    unsubscribe = watchBlockNumber(config, {
      ...(rest as any),
      chainId,
      onBlockNumber,
    });
  });
}
