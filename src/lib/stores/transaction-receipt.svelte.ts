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
import type { Config, GetTransactionReceiptErrorType, ResolvedRegister } from "@wagmi/core";
import {
  getTransactionReceiptQueryOptions,
  type GetTransactionReceiptData,
  type GetTransactionReceiptOptions,
  type GetTransactionReceiptQueryFnData,
  type GetTransactionReceiptQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateTransactionReceiptParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionReceiptData<config, chainId>,
> = FuncOrVal<
  GetTransactionReceiptOptions<config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    GetTransactionReceiptQueryFnData<config, chainId>,
    GetTransactionReceiptErrorType,
    selectData,
    GetTransactionReceiptQueryKey<config, chainId>
  >
>;

export type CreateTransactionReceiptReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionReceiptData<config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, GetTransactionReceiptErrorType>>;

export function createTransactionReceipt<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionReceiptData<config, chainId>,
>(
  parameters: CreateTransactionReceiptParameters<config, chainId, selectData> = {},
): CreateTransactionReceiptReturnType<config, chainId, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { hash, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getTransactionReceiptQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(hash && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...(query as any), ...options, enabled })));

  return storeToRune(store) as CreateTransactionReceiptReturnType<config, chainId, selectData>;
}
