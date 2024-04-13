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
import type { Config, GetEnsTextErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type GetEnsTextData,
  type GetEnsTextOptions,
  type GetEnsTextQueryFnData,
  type GetEnsTextQueryKey,
  getEnsTextQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";

export type CreateEnsTextParameters<
  config extends Config = Config,
  selectData = GetEnsTextData,
> = FuncOrVal<
  Evaluate<
    GetEnsTextOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsTextQueryFnData,
      GetEnsTextErrorType,
      selectData,
      GetEnsTextQueryKey<config>
    >
  >
>;

export type CreateEnsTextReturnType<selectData = GetEnsTextData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsTextErrorType>
>;

export function createEnsText<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsTextData,
>(
  parameters: CreateEnsTextParameters<config, selectData> = {},
): CreateEnsTextReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { key, name, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getEnsTextQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(key && name && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
