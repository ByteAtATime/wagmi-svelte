import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetEnsNameErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  getEnsNameQueryOptions,
  type GetEnsNameData,
  type GetEnsNameOptions,
  type GetEnsNameQueryFnData,
  type GetEnsNameQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateEnsNameParameters<
  config extends Config = Config,
  selectData = GetEnsNameData,
> = Evaluate<
  GetEnsNameOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsNameQueryFnData,
      GetEnsNameErrorType,
      selectData,
      GetEnsNameQueryKey<config>
    >
>;

export type CreateEnsNameReturnType<selectData = GetEnsNameData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsNameErrorType>
>;

export function createEnsName<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsNameData,
>(
  parameters: CreateEnsNameParameters<config, selectData> = {},
): CreateEnsNameReturnType<selectData> {
  const { address, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getEnsNameQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(address && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
