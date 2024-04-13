import { createQuery, type CreateQueryParameters } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
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
import { createAccount } from "./account.svelte";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateConnectorClientParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetConnectorClientData<config, chainId>,
> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const queryClient = useQueryClient();
  const account = $derived.by(createAccount());
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const { queryKey, ...options } = $derived(
    getConnectorClientQueryOptions<config, chainId>(config as config, {
      ...resolvedParameters,
      chainId,
      connector: resolvedParameters.connector ?? account.connector,
    }),
  );
  const enabled = $derived(Boolean(account.status !== "disconnected" && (query.enabled ?? true)));

  $effect(() => {
    if (account.address) queryClient.invalidateQueries({ queryKey });
    else queryClient.removeQueries({ queryKey }); // remove when account is disconnected
  });

  const store = createQuery(
    runeToStore(() => ({
      ...query,
      ...options,
      queryKey,
      enabled,
      staleTime: Infinity,
    })),
  );

  return storeToRune(store);
}
