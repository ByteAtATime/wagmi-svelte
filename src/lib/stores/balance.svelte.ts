import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
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
> = Evaluate<
  GetBalanceOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetBalanceQueryFnData,
      GetBalanceErrorType,
      selectData,
      GetBalanceQueryKey<config>
    >
>;

export type CreateBalanceReturnType<selectData = GetBalanceData> = RuneReturnType<
  QueryObserverResult<selectData, GetBalanceErrorType>
>;

export const createBalance = <config extends Config = Config, selectData = GetBalanceData>(
  parameters: CreateBalanceParameters<config, selectData> = {},
): CreateBalanceReturnType<selectData> => {
  const { address, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getBalanceQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(address && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
};
