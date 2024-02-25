import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import {
  type Config,
  type GetBlockTransactionCountErrorType,
  type ResolvedRegister,
} from "@wagmi/core";
import { type UnionEvaluate } from "@wagmi/core/internal";
import {
  type GetBlockTransactionCountData,
  type GetBlockTransactionCountOptions,
  type GetBlockTransactionCountQueryFnData,
  type GetBlockTransactionCountQueryKey,
  getBlockTransactionCountQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";

export type CreateBlockTransactionCountParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockTransactionCountData,
> = UnionEvaluate<
  GetBlockTransactionCountOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetBlockTransactionCountQueryFnData,
      GetBlockTransactionCountErrorType,
      selectData,
      GetBlockTransactionCountQueryKey<config, chainId>
    >
>;

export type CreateBlockTransactionCountReturnType<selectData = GetBlockTransactionCountData> =
  RuneReturnType<QueryObserverResult<selectData, GetBlockTransactionCountErrorType>>;

export function createBlockTransactionCount<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockTransactionCountData,
>(
  parameters: CreateBlockTransactionCountParameters<config, chainId, selectData> = {},
): CreateBlockTransactionCountReturnType<selectData> {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getBlockTransactionCountQueryOptions(config.result, {
    ...parameters,
    chainId,
  });

  const store = createQuery({ ...query, ...options });

  return storeToRune(store);
}
