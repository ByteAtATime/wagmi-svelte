import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, GetEnsAvatarErrorType, ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  getEnsAvatarQueryOptions,
  type GetEnsAvatarData,
  type GetEnsAvatarOptions,
  type GetEnsAvatarQueryFnData,
  type GetEnsAvatarQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateEnsAvatarParameters<
  config extends Config = Config,
  selectData = GetEnsAvatarData,
> = Evaluate<
  GetEnsAvatarOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAvatarQueryFnData,
      GetEnsAvatarErrorType,
      selectData,
      GetEnsAvatarQueryKey<config>
    >
>;

export type CreateEnsAvatarReturnType<selectData = GetEnsAvatarData> = RuneReturnType<
  QueryObserverResult<selectData, GetEnsAvatarErrorType>
>;

export function createEnsAvatar<
  config extends Config = ResolvedRegister["config"],
  selectData = GetEnsAvatarData,
>(
  parameters: CreateEnsAvatarParameters<config, selectData> = {},
): CreateEnsAvatarReturnType<selectData> {
  const { name, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getEnsAvatarQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(name && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
