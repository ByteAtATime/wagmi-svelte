import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetStorageAtErrorType, type ResolvedRegister } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type GetStorageAtData,
  type GetStorageAtOptions,
  type GetStorageAtQueryKey,
  getStorageAtQueryOptions,
} from "@wagmi/core/query";
import { type GetStorageAtQueryFnData } from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreatesStorageAtParameters<
  config extends Config = Config,
  selectData = GetStorageAtData,
> = FuncOrVal<
  Evaluate<
    GetStorageAtOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetStorageAtQueryFnData,
      GetStorageAtErrorType,
      selectData,
      GetStorageAtQueryKey<config>
    >
  >
>;

export type CreateStorageAtReturnType<selectData = GetStorageAtData> = RuneReturnType<
  QueryObserverResult<selectData, GetStorageAtErrorType>
>;

export function createStorageAt<
  config extends Config = ResolvedRegister["config"],
  selectData = GetStorageAtData,
>(
  parameters: CreatesStorageAtParameters<config, selectData> = {},
): CreateStorageAtReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, slot, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getStorageAtQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && slot && (query.enabled ?? true)));

  const store = createQuery(
    runeToStore(() => ({
      ...query,
      ...options,
      enabled,
    })),
  );

  return storeToRune(store);
}
