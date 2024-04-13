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
import type { Config, GetProofErrorType } from "@wagmi/core";
import {
  getProofQueryOptions,
  type GetProofData,
  type GetProofOptions,
  type GetProofQueryFnData,
  type GetProofQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateProofParameters<
  config extends Config = Config,
  selectData = GetProofData,
> = FuncOrVal<
  GetProofOptions<config> &
  ConfigParameter<config> &
  QueryParameter<GetProofQueryFnData, GetProofErrorType, selectData, GetProofQueryKey<config>>
>;

export type CreateProofReturnType<selectData = GetProofData> = RuneReturnType<
  QueryObserverResult<selectData, GetProofErrorType>
>;

export function createProof(parameters: CreateProofParameters = {}): CreateProofReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, storageKeys, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const chainId = $derived.by(createChainId());

  const options = $derived(
    getProofQueryOptions(config, {
      ...resolvedParameters,
      chainId: resolvedParameters.chainId ?? chainId,
    }),
  );
  const enabled = $derived(Boolean(address && storageKeys && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
