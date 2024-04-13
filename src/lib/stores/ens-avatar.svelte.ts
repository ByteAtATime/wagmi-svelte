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
> = FuncOrVal<
  Evaluate<
    GetEnsAvatarOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAvatarQueryFnData,
      GetEnsAvatarErrorType,
      selectData,
      GetEnsAvatarQueryKey<config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { name, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getEnsAvatarQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(name && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
