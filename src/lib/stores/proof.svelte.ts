import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetProofErrorType } from "@wagmi/core";
import {
  getProofQueryOptions,
  type GetProofData,
  type GetProofOptions,
  type GetProofQueryFnData,
  type GetProofQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateProofParameters<
  config extends Config = Config,
  selectData = GetProofData,
> = GetProofOptions<config> &
  ConfigParameter<config> &
  QueryParameter<GetProofQueryFnData, GetProofErrorType, selectData, GetProofQueryKey<config>>;

export type CreateProofReturnType<selectData = GetProofData> = RuneReturnType<
  QueryObserverResult<selectData, GetProofErrorType>
>;

export function createProof(parameters: CreateProofParameters = {}): CreateProofReturnType {
  const { address, storageKeys, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = createChainId();

  const options = getProofQueryOptions(config.result, {
    ...parameters,
    chainId: parameters.chainId ?? chainId.result,
  });
  const enabled = $derived(Boolean(address && storageKeys && (query.enabled ?? true)));

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
