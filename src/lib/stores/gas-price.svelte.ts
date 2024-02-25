import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import { type QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetGasPriceErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  getGasPriceQueryOptions,
  type GetGasPriceData,
  type GetGasPriceOptions,
  type GetGasPriceQueryFnData,
  type GetGasPriceQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateGasPriceParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetGasPriceData,
> = Evaluate<
  GetGasPriceOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetGasPriceQueryFnData,
      GetGasPriceErrorType,
      selectData,
      GetGasPriceQueryKey<config, chainId>
    >
>;

export type CreateGasPriceReturnType<selectData = GetGasPriceData> = RuneReturnType<
  QueryObserverResult<selectData, GetGasPriceErrorType>
>;

export const createGasPrice = <
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetGasPriceData,
>(
  parameters: CreateGasPriceParameters<config, chainId, selectData> = {},
): CreateGasPriceReturnType<selectData> => {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getGasPriceQueryOptions(config.result, {
    ...parameters,
    chainId,
  });

  const store = createQuery({ ...query, ...options });

  return storeToRune(store);
};
