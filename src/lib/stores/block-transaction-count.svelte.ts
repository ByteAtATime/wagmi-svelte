import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
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

export type CreateBlockTransactionCountParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockTransactionCountData,
> = FuncOrVal<
  UnionEvaluate<
    GetBlockTransactionCountOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetBlockTransactionCountQueryFnData,
      GetBlockTransactionCountErrorType,
      selectData,
      GetBlockTransactionCountQueryKey<config, chainId>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getBlockTransactionCountQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
}
