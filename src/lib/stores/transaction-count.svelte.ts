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
import type { Config, GetTransactionCountErrorType } from "@wagmi/core";
import {
  getTransactionCountQueryOptions,
  type GetTransactionCountData,
  type GetTransactionCountOptions,
  type GetTransactionCountQueryFnData,
  type GetTransactionCountQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateTransactionCountParameters<
  config extends Config = Config,
  selectData = GetTransactionCountData,
> = FuncOrVal<
  GetTransactionCountOptions<config> &
  ConfigParameter<config> &
  QueryParameter<
    GetTransactionCountQueryFnData,
    GetTransactionCountErrorType,
    selectData,
    GetTransactionCountQueryKey<config>
  >
>;

export type CreateTransactionCountReturnType<selectData = GetTransactionCountData> = RuneReturnType<
  QueryObserverResult<selectData, GetTransactionCountErrorType>
>;

export function createTransactionCount(
  parameters: CreateTransactionCountParameters = {},
): CreateTransactionCountReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getTransactionCountQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
