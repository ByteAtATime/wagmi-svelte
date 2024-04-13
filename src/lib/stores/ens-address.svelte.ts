import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type QueryParameter,
  type RuneReturnType,
  type FuncOrVal,
} from "$lib/types";
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
> = FuncOrVal<
  Evaluate<
    GetEnsAddressOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAddressQueryFnData,
      GetEnsAddressErrorType,
      selectData,
      GetEnsAddressQueryKey<config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { name, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getEnsAddressQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(name && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
