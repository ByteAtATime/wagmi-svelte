import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type {
  ConfigParameter,
  QueryParameter,
  RuneReturnType,
  RuneReturnTypeToStore,
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
> = Evaluate<
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
  const { query = {}, watch } = parameters;

  const config = createConfig(parameters);
  const queryClient = useQueryClient();
  const configChainId = createChainId();

  const options = getBlockQueryOptions(config.result, {
    ...parameters,
    chainId: parameters.chainId ?? configChainId.result,
  });
  const enabled = Boolean(query.enabled ?? true);

  createWatchBlocks({
    ...({
      config: parameters.config,
      chainId: parameters.chainId!,
      ...(typeof watch === "object" ? watch : {}),
    } as CreateWatchBlocksParameters),
    enabled: Boolean(enabled && (typeof watch === "object" ? watch.enabled : watch)),
    onBlock(block) {
      queryClient.setQueryData(options.queryKey, block);
    },
  });

  const store = createQuery({
    ...query,
    ...options,
    enabled,
  }) as RuneReturnTypeToStore<
    CreateBlockReturnType<includeTransactions, blockTag, config, chainId, selectData>
  >;

  return storeToRune(store);
}
