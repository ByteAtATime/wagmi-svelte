import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import { type QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetEnsAddressErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  getEnsAddressQueryOptions,
  type GetEnsAddressData,
  type GetEnsAddressOptions,
  type GetEnsAddressQueryFnData,
  type GetEnsAddressQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateEnsAddressParameters<
  config extends Config = Config,
  selectData = GetEnsAddressData,
> = Evaluate<
  GetEnsAddressOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAddressQueryFnData,
      GetEnsAddressErrorType,
      selectData,
      GetEnsAddressQueryKey<config>
    >
>;

export type CreateEnsAddressReturnType<selectData = GetEnsAddressData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsAddressErrorType>
>;

export function createEnsAddress<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsAddressData,
>(
  parameters: CreateEnsAddressParameters<config, selectData> = {},
): CreateEnsAddressReturnType<selectData> {
  const { name, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getEnsAddressQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(name && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
