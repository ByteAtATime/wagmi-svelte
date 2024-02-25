import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
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
import { derived } from "svelte/store";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreatesStorageAtParameters<
  config extends Config = Config,
  selectData = GetStorageAtData,
> = Evaluate<
  GetStorageAtOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetStorageAtQueryFnData,
      GetStorageAtErrorType,
      selectData,
      GetStorageAtQueryKey<config>
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
  const { address, slot, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getStorageAtQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(Boolean(address && slot && (query.enabled ?? true)));

  const store = createQuery(
    derived(
      [
        runeToStore({
          get result() {
            return enabled;
          },
        }),
      ],
      ([$enabled]) => ({
        ...query,
        ...options,
        enabled: $enabled,
      }),
    ),
  );

  return storeToRune(store);
}
