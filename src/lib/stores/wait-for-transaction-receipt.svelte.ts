import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, ResolvedRegister, WaitForTransactionReceiptErrorType } from "@wagmi/core";
import {
  waitForTransactionReceiptQueryOptions,
  type WaitForTransactionReceiptData,
  type WaitForTransactionReceiptOptions,
  type WaitForTransactionReceiptQueryFnData,
  type WaitForTransactionReceiptQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import type { Evaluate } from "@wagmi/core/internal";

export type CreateWaitForTransactionReceiptParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = WaitForTransactionReceiptData<config, chainId>,
> = Evaluate<
  WaitForTransactionReceiptOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      WaitForTransactionReceiptQueryFnData<config, chainId>,
      WaitForTransactionReceiptErrorType,
      selectData,
      WaitForTransactionReceiptQueryKey<config, chainId>
    >
>;

export type CreateWaitForTransactionReceiptReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = WaitForTransactionReceiptData<config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, WaitForTransactionReceiptErrorType>>;

export function createWaitForTransactionReceipt<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = WaitForTransactionReceiptData<config, chainId>,
>(
  parameters: CreateWaitForTransactionReceiptParameters<config, chainId, selectData> = {},
): CreateWaitForTransactionReceiptReturnType {
  const { hash, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = parameters.chainId ?? createChainId().result;

  const options = waitForTransactionReceiptQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(Boolean(hash && (query.enabled ?? true)));

  const store = createQuery(
    derived(
      [
        runeToStore({
          get result() {
            return enabled;
          },
        }),
      ],
      ([$enabled]) => ({ ...(query as any), ...options, enabled: $enabled }),
    ),
  );

  return storeToRune(store);
}
