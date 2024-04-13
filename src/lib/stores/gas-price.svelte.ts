import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
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
> = FuncOrVal<
  Evaluate<
    GetGasPriceOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetGasPriceQueryFnData,
      GetGasPriceErrorType,
      selectData,
      GetGasPriceQueryKey<config, chainId>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getGasPriceQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
};
