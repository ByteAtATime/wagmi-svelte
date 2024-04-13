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
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateEstimateMaxPriorityFeePerGasParameters<
  config extends Config = Config,
  selectData = EstimateMaxPriorityFeePerGasData,
> = FuncOrVal<
  Evaluate<
    EstimateMaxPriorityFeePerGasOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      EstimateMaxPriorityFeePerGasQueryFnData,
      EstimateMaxPriorityFeePerGasErrorType,
      selectData,
      EstimateMaxPriorityFeePerGasQueryKey<config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    estimateMaxPriorityFeePerGasQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
}
