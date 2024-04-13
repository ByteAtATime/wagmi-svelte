import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
  type RuneReturnTypeToStore,
} from "$lib/types";
import { useQueryClient, type QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetBlockErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate, type UnionEvaluate, type UnionOmit } from "@wagmi/core/internal";
import {
  getBlockQueryOptions,
  type GetBlockData,
  type GetBlockOptions,
  type GetBlockQueryFnData,
  type GetBlockQueryKey,
} from "@wagmi/core/query";
import type { BlockTag } from "viem";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import { createWatchBlocks, type CreateWatchBlocksParameters } from "./watch-blocks.svelte";

export type CreateBlockParameters<
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = "latest",
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockData<includeTransactions, blockTag, config, chainId>,
> = FuncOrVal<
  Evaluate<
    GetBlockOptions<includeTransactions, blockTag, config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetBlockQueryFnData<includeTransactions, blockTag, config, chainId>,
      GetBlockErrorType,
      selectData,
      GetBlockQueryKey<includeTransactions, blockTag, config, chainId>
    > & {
      watch?:
      | boolean
      | UnionEvaluate<
        UnionOmit<
          CreateWatchBlocksParameters<includeTransactions, blockTag, config, chainId>,
          "chainId" | "config" | "onBlock" | "onError"
        >
      >
      | undefined;
    }
  >
>;

export type CreateBlockReturnType<
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = "latest",
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockData<includeTransactions, blockTag, config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, GetBlockErrorType>>;

export function createBlock<
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = "latest",
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockData<includeTransactions, blockTag, config, chainId>,
>(
  parameters: CreateBlockParameters<
    includeTransactions,
    blockTag,
    config,
    chainId,
    selectData
  > = {},
): CreateBlockReturnType<includeTransactions, blockTag, config, chainId, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {}, watch } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const queryClient = useQueryClient();
  const configChainId = $derived.by(createChainId());

  const options = $derived(
    getBlockQueryOptions(config, {
      ...resolvedParameters,
      chainId: resolvedParameters.chainId ?? configChainId,
    }),
  );
  const enabled = $derived(Boolean(query.enabled ?? true));

  createWatchBlocks(() => ({
    ...({
      config: resolvedParameters.config,
      chainId: resolvedParameters.chainId!,
      ...(typeof watch === "object" ? watch : {}),
    } as CreateWatchBlocksParameters),
    enabled: Boolean(enabled && (typeof watch === "object" ? watch.enabled : watch)),
    onBlock(block) {
      queryClient.setQueryData(options, block);
    },
  }));

  const store = createQuery(
    runeToStore(() => ({
      ...query,
      ...options,
      enabled,
    })),
  ) as RuneReturnTypeToStore<
    CreateBlockReturnType<includeTransactions, blockTag, config, chainId, selectData>
  >;

  return storeToRune(store);
}
