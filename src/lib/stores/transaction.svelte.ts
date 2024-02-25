import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetTransactionErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  getTransactionQueryOptions,
  type GetTransactionData,
  type GetTransactionOptions,
  type GetTransactionQueryFnData,
  type GetTransactionQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import { createQuery } from "$lib/query";
import { derived } from "svelte/store";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateTransactionParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionData<config, chainId>,
> = Evaluate<
  GetTransactionOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetTransactionQueryFnData<config, chainId>,
      GetTransactionErrorType,
      selectData,
      GetTransactionQueryKey<config, chainId>
    >
>;

export type CreateTransactionReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionData<config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, GetTransactionErrorType>>;

export function createTransaction<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetTransactionData<config, chainId>,
>(
  parameters: CreateTransactionParameters<config, chainId, selectData> = {},
): CreateTransactionReturnType<config, chainId, selectData> {
  const { blockHash, blockNumber, blockTag, hash, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getTransactionQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(
    Boolean(!(blockHash && blockNumber && blockTag && hash) && (query.enabled ?? true)),
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
      ([$enabled]) => ({
        ...(query as any),
        ...options,
        enabled: $enabled,
      }),
    ),
  );

  return storeToRune(store) as CreateTransactionReturnType<config, chainId, selectData>;
}
