import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type QueryParameter,
  type RuneReturnType,
  type FuncOrVal,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetEnsNameErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  getEnsNameQueryOptions,
  type GetEnsNameData,
  type GetEnsNameOptions,
  type GetEnsNameQueryFnData,
  type GetEnsNameQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateEnsNameParameters<
  config extends Config = Config,
  selectData = GetEnsNameData,
> = FuncOrVal<
  Evaluate<
    GetEnsNameOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsNameQueryFnData,
      GetEnsNameErrorType,
      selectData,
      GetEnsNameQueryKey<config>
    >
  >
>;

export type CreateEnsNameReturnType<selectData = GetEnsNameData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsNameErrorType>
>;

export function createEnsName<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsNameData,
>(
  parameters: CreateEnsNameParameters<config, selectData> = {},
): CreateEnsNameReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getEnsNameQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
