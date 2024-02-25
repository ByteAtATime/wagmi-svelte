import { createQuery, type CreateQueryParameters } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { useQueryClient, type QueryObserverResult } from "@tanstack/svelte-query";
import { derived } from "svelte/store";
import { createAccount } from "./account.svelte";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import type { Config, GetWalletClientErrorType, ResolvedRegister } from "@wagmi/core";
import {
  getWalletClientQueryOptions,
  type GetWalletClientData,
  type GetWalletClientOptions,
  type GetWalletClientQueryFnData,
  type GetWalletClientQueryKey,
} from "@wagmi/core/query";
import type { Evaluate } from "@wagmi/core/internal";

export type CreateWalletClientParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetWalletClientData<config, chainId>,
> = Evaluate<
  GetWalletClientOptions<config, chainId> &
    ConfigParameter<config> & {
      query?:
        | Evaluate<
            Omit<
              CreateQueryParameters<
                GetWalletClientQueryFnData<config, chainId>,
                GetWalletClientErrorType,
                selectData,
                GetWalletClientQueryKey<config, chainId>
              >,
              "gcTime" | "staleTime"
            >
          >
        | undefined;
    }
>;

export type CreateWalletClientReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetWalletClientData<config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, GetWalletClientErrorType>>;

export function createWalletClient<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetWalletClientData<config, chainId>,
>(
  parameters: CreateWalletClientParameters<config, chainId, selectData> = {},
): CreateWalletClientReturnType<config, chainId, selectData> {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const queryClient = useQueryClient();
  const account = createAccount();
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const { queryKey, ...options } = getWalletClientQueryOptions<config, chainId>(
    config.result as config,
    {
      ...parameters,
      chainId,
      connector: parameters.connector ?? account.result.connector,
    },
  );
  const enabled = $derived(
    Boolean(account.result.status !== "disconnected" && (query.enabled ?? true)),
  );

  $effect(() => {
    if (account.result.address) queryClient.invalidateQueries({ queryKey });
    else queryClient.removeQueries({ queryKey }); // remove when account is disconnected
  });

  const store = createQuery(
    derived(
      runeToStore({
        get result() {
          return enabled;
        },
      }),
      ($enabled) => ({
        ...query,
        ...options,
        queryKey,
        enabled: $enabled,
        staleTime: Infinity,
      }),
    ),
  );

  return storeToRune(store);
}
