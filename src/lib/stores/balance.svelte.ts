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
import type { Config, GetBalanceErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  getBalanceQueryOptions,
  type GetBalanceData,
  type GetBalanceOptions,
  type GetBalanceQueryFnData,
  type GetBalanceQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateBalanceParameters<
  config extends Config = Config,
  selectData = GetBalanceData,
> = FuncOrVal<
  Evaluate<
    GetBalanceOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetBalanceQueryFnData,
      GetBalanceErrorType,
      selectData,
      GetBalanceQueryKey<config>
    >
  >
>;

export type CreateBalanceReturnType<selectData = GetBalanceData> = RuneReturnType<
  QueryObserverResult<selectData, GetBalanceErrorType>
>;

export const createBalance = <config extends Config = Config, selectData = GetBalanceData>(
  parameters: CreateBalanceParameters<config, selectData> = {},
): CreateBalanceReturnType<selectData> => {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, query = {} } = resolvedParameters;

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getBalanceQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
};
