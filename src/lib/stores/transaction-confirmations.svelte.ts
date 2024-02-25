import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import {
  type Config,
  type GetTransactionConfirmationsErrorType,
  type ResolvedRegister,
} from "@wagmi/core";
import {
  getTransactionConfirmationsQueryOptions,
  type GetTransactionConfirmationsData,
  type GetTransactionConfirmationsOptions,
  type GetTransactionConfirmationsQueryFnData,
  type GetTransactionConfirmationsQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateTransactionConfirmationsParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = GetTransactionConfirmationsData,
> = GetTransactionConfirmationsOptions<config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    GetTransactionConfirmationsQueryFnData,
    GetTransactionConfirmationsErrorType,
    selectData,
    GetTransactionConfirmationsQueryKey<config, chainId>
  >;

export type CreateTransactionConfirmationsReturnType<selectData = GetTransactionConfirmationsData> =
  RuneReturnType<QueryObserverResult<selectData, GetTransactionConfirmationsErrorType>>;

export function createTransactionConfirmations<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = GetTransactionConfirmationsData,
>(
  parameters: CreateTransactionConfirmationsParameters<config, chainId, selectData> = {} as any,
): CreateTransactionConfirmationsReturnType<selectData> {
  const { hash, transactionReceipt, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getTransactionConfirmationsQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(
    Boolean(
      !(hash && transactionReceipt) && (hash || transactionReceipt) && (query.enabled ?? true),
    ),
  );

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
