import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetEnsResolverErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type GetEnsResolverData,
  type GetEnsResolverOptions,
  type GetEnsResolverQueryFnData,
  type GetEnsResolverQueryKey,
  getEnsResolverQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";

export type CreateEnsResolverParameters<
  config extends Config = Config,
  selectData = GetEnsResolverData,
> = Evaluate<
  GetEnsResolverOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsResolverQueryFnData,
      GetEnsResolverErrorType,
      selectData,
      GetEnsResolverQueryKey<config>
    >
>;

export type CreateEnsResolverReturnType<selectData = GetEnsResolverData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsResolverErrorType>
>;

export function createEnsResolver<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsResolverData,
>(
  parameters: CreateEnsResolverParameters<config, selectData> = {},
): CreateEnsResolverReturnType<selectData> {
  const { name, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getEnsResolverQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(name && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
