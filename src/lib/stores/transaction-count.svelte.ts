import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetTransactionCountErrorType } from "@wagmi/core";
import {
  getTransactionCountQueryOptions,
  type GetTransactionCountData,
  type GetTransactionCountOptions,
  type GetTransactionCountQueryFnData,
  type GetTransactionCountQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateTransactionCountParameters<
  config extends Config = Config,
  selectData = GetTransactionCountData,
> = GetTransactionCountOptions<config> &
  ConfigParameter<config> &
  QueryParameter<
    GetTransactionCountQueryFnData,
    GetTransactionCountErrorType,
    selectData,
    GetTransactionCountQueryKey<config>
  >;

export type CreateTransactionCountReturnType<selectData = GetTransactionCountData> = RuneReturnType<
  QueryObserverResult<selectData, GetTransactionCountErrorType>
>;

export function createTransactionCount(
  parameters: CreateTransactionCountParameters = {},
): CreateTransactionCountReturnType {
  const { address, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = parameters.chainId ?? createChainId().result;

  const options = getTransactionCountQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(Boolean(address && (query.enabled ?? true)));

  const store = createQuery(
    derived(
      [
        runeToStore({
          get result() {
            return enabled;
          },
        }),
      ],
      ([$enabled]) => ({ ...query, ...options, enabled: $enabled }),
    ),
  );

  return storeToRune(store);
}
