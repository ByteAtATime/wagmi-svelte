import {
  resolveVal,
  type ConfigParameter,
  type EnabledParameter,
  type FuncOrVal,
} from "$lib/types";
import {
  watchBlocks,
  type Config,
  type ResolvedRegister,
  type WatchBlocksParameters,
} from "@wagmi/core";
import { type UnionEvaluate, type UnionPartial } from "@wagmi/core/internal";
import type { BlockTag } from "viem";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";

export type CreateWatchBlocksParameters<
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = "latest",
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
> = FuncOrVal<
  UnionEvaluate<
    UnionPartial<WatchBlocksParameters<includeTransactions, blockTag, config, chainId>> &
    ConfigParameter<config> &
    EnabledParameter
  >
>;

export type CreateWatchBlocksReturnType = void;

export function createWatchBlocks<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = "latest",
>(
  parameters: CreateWatchBlocksParameters<
    includeTransactions,
    blockTag,
    config,
    chainId
  > = {} as any,
): CreateWatchBlocksReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { enabled = true, onBlock, ...rest } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    if (!enabled) return;
    if (!onBlock) return;

    unsubscribe?.();
    unsubscribe = watchBlocks(config, {
      ...(rest as any),
      chainId,
      onBlock,
    });
  });
}
