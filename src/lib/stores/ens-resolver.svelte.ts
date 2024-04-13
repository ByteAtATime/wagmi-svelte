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

export type CreateEnsResolverParameters<
  config extends Config = Config,
  selectData = GetEnsResolverData,
> = FuncOrVal<
  Evaluate<
    GetEnsResolverOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsResolverQueryFnData,
      GetEnsResolverErrorType,
      selectData,
      GetEnsResolverQueryKey<config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { name, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getEnsResolverQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(name && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
