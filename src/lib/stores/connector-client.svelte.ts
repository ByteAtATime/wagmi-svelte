import { createQuery, type CreateQueryParameters } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { useQueryClient, type QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetConnectorClientErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate, type Omit } from "@wagmi/core/internal";
import {
  getConnectorClientQueryOptions,
  type GetConnectorClientData,
  type GetConnectorClientOptions,
  type GetConnectorClientQueryFnData,
  type GetConnectorClientQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createAccount } from "./account.svelte";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateConnectorClientParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetConnectorClientData<config, chainId>,
> = Evaluate<
  GetConnectorClientOptions<config, chainId> &
    ConfigParameter<config> & {
      query?:
        | Evaluate<
            Omit<
              CreateQueryParameters<
                GetConnectorClientQueryFnData<config, chainId>,
                GetConnectorClientErrorType,
                selectData,
                GetConnectorClientQueryKey<config, chainId>
              >,
              "gcTime" | "staleTime"
            >
          >
        | undefined;
    }
>;

export type CreateConnectorClientReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetConnectorClientData<config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, GetConnectorClientErrorType>>;

export function createConnectorClient<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetConnectorClientData<config, chainId>,
>(
  parameters: CreateConnectorClientParameters<config, chainId, selectData> = {},
): CreateConnectorClientReturnType<config, chainId, selectData> {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const queryClient = useQueryClient();
  const account = createAccount();
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const { queryKey, ...options } = getConnectorClientQueryOptions<config, chainId>(
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
