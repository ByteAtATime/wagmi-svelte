import { createQuery, type CreateQueryParameters } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type RuneReturnType,
  type RuneReturnTypeToStore,
} from "$lib/types";
import { useQueryClient, type QueryObserverResult } from "@tanstack/svelte-query";
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
> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const queryClient = useQueryClient();
  const account = $derived.by(createAccount());
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const { queryKey, ...options } = $derived(
    getWalletClientQueryOptions<config, chainId>(config as config, {
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
