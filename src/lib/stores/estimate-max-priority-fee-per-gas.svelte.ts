import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import {
  type Config,
  type EstimateMaxPriorityFeePerGasErrorType,
  type ResolvedRegister,
} from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type EstimateMaxPriorityFeePerGasData,
  type EstimateMaxPriorityFeePerGasOptions,
  type EstimateMaxPriorityFeePerGasQueryFnData,
  type EstimateMaxPriorityFeePerGasQueryKey,
  estimateMaxPriorityFeePerGasQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";

export type CreateEstimateMaxPriorityFeePerGasParameters<
  config extends Config = Config,
  selectData = EstimateMaxPriorityFeePerGasData,
> = Evaluate<
  EstimateMaxPriorityFeePerGasOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      EstimateMaxPriorityFeePerGasQueryFnData,
      EstimateMaxPriorityFeePerGasErrorType,
      selectData,
      EstimateMaxPriorityFeePerGasQueryKey<config>
    >
>;

export type CreateEstimateMaxPriorityFeePerGasReturnType<
  selectData = EstimateMaxPriorityFeePerGasData,
> = RuneReturnType<QueryObserverResult<selectData, EstimateMaxPriorityFeePerGasErrorType>>;

export function createEstimateMaxPriorityFeePerGas<
  config extends Config = ResolvedRegister["config"],
  selectData = EstimateMaxPriorityFeePerGasData,
>(
  parameters: CreateEstimateMaxPriorityFeePerGasParameters<config, selectData> = {},
): CreateEstimateMaxPriorityFeePerGasReturnType<selectData> {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = estimateMaxPriorityFeePerGasQueryOptions(config.result, {
    ...parameters,
    chainId,
  });

  const store = createQuery({ ...query, ...options });

  return storeToRune(store);
}
