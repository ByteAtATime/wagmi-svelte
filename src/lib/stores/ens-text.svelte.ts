import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetEnsTextErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type GetEnsTextData,
  type GetEnsTextOptions,
  type GetEnsTextQueryFnData,
  type GetEnsTextQueryKey,
  getEnsTextQueryOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";

export type CreateEnsTextParameters<
  config extends Config = Config,
  selectData = GetEnsTextData,
> = Evaluate<
  GetEnsTextOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsTextQueryFnData,
      GetEnsTextErrorType,
      selectData,
      GetEnsTextQueryKey<config>
    >
>;

export type CreateEnsTextReturnType<selectData = GetEnsTextData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsTextErrorType>
>;

export function createEnsText<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsTextData,
>(
  parameters: CreateEnsTextParameters<config, selectData> = {},
): CreateEnsTextReturnType<selectData> {
  const { key, name, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getEnsTextQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(key && name && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
