import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetFeeHistoryErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type GetFeeHistoryData,
  type GetFeeHistoryOptions,
  type GetFeeHistoryQueryFnData,
  type GetFeeHistoryQueryKey,
  getFeeHistoryQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateFeeHistoryParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetFeeHistoryData,
> = FuncOrVal<
  Evaluate<
    GetFeeHistoryOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetFeeHistoryQueryFnData,
      GetFeeHistoryErrorType,
      selectData,
      GetFeeHistoryQueryKey<config, chainId>
    >
  >
>;

export type CreateFeeHistoryReturnType<selectData = GetFeeHistoryData> = RuneReturnType<
  QueryObserverResult<selectData, GetFeeHistoryErrorType>
>;

export function createFeeHistory<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetFeeHistoryData,
>(
  parameters: CreateFeeHistoryParameters<config, chainId, selectData> = {},
): CreateFeeHistoryReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { blockCount, rewardPercentiles, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getFeeHistoryQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(blockCount && rewardPercentiles && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
