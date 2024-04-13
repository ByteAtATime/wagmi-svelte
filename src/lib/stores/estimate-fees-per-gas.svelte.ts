import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type EstimateFeesPerGasErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type EstimateFeesPerGasData,
  type EstimateFeesPerGasOptions,
  type EstimateFeesPerGasQueryFnData,
  type EstimateFeesPerGasQueryKey,
  estimateFeesPerGasQueryOptions,
} from "@wagmi/core/query";
import type { FeeValuesType } from "viem";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateEstimateFeesPerGasParameters<
  type extends FeeValuesType = FeeValuesType,
  config extends Config = Config,
  selectData = EstimateFeesPerGasData<type>,
> = FuncOrVal<
  Evaluate<
    EstimateFeesPerGasOptions<type, config> &
    ConfigParameter<config> &
    QueryParameter<
      EstimateFeesPerGasQueryFnData<type>,
      EstimateFeesPerGasErrorType,
      selectData,
      EstimateFeesPerGasQueryKey<config, type>
    >
  >
>;

export type CreateEstimateFeesPerGasReturnType<
  type extends FeeValuesType = FeeValuesType,
  selectData = EstimateFeesPerGasData<type>,
> = RuneReturnType<QueryObserverResult<selectData, EstimateFeesPerGasErrorType>>;

export function createEstimateFeesPerGas<
  config extends Config = ResolvedRegister["config"],
  type extends FeeValuesType = "eip1559",
  selectData = EstimateFeesPerGasData<type>,
>(
  parameters: CreateEstimateFeesPerGasParameters<type, config, selectData> = {},
): CreateEstimateFeesPerGasReturnType<type, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    estimateFeesPerGasQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
}
