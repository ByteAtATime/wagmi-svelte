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
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateTransactionConfirmationsParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = GetTransactionConfirmationsData,
> = FuncOrVal<
  GetTransactionConfirmationsOptions<config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    GetTransactionConfirmationsQueryFnData,
    GetTransactionConfirmationsErrorType,
    selectData,
    GetTransactionConfirmationsQueryKey<config, chainId>
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { hash, transactionReceipt, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getTransactionConfirmationsQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(
    Boolean(
      !(hash && transactionReceipt) && (hash || transactionReceipt) && (query.enabled ?? true),
    ),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
