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
> = FuncOrVal<
  Evaluate<
    WaitForTransactionReceiptOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      WaitForTransactionReceiptQueryFnData<config, chainId>,
      WaitForTransactionReceiptErrorType,
      selectData,
      WaitForTransactionReceiptQueryKey<config, chainId>
    >
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
): CreateWaitForTransactionReceiptReturnType<config, chainId, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { hash, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    waitForTransactionReceiptQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(hash && (query.enabled ?? true)));

  const store = createQuery<
    WaitForTransactionReceiptQueryFnData<config, chainId>,
    WaitForTransactionReceiptErrorType,
    selectData,
    WaitForTransactionReceiptQueryKey<config, chainId>
  >(runeToStore(() => ({ ...(query as any), ...options, enabled })));

  return storeToRune(store);
}
