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
import { type CallErrorType, type Config, type ResolvedRegister } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import type { CallQueryFnData } from "@wagmi/core/query";
import {
  callQueryOptions,
  type CallData,
  type CallOptions,
  type CallQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateCallParameters<config extends Config = Config, selectData = CallData> = FuncOrVal<
  Evaluate<
    CallOptions<config> &
    ConfigParameter<config> &
    QueryParameter<CallQueryFnData, CallErrorType, selectData, CallQueryKey<config>>
  >
>;

export type CreateCallReturnType<selectData = CallData> = RuneReturnType<
  QueryObserverResult<selectData, CallErrorType>
>;

export function createCall<
  config extends Config = ResolvedRegister["config"],
  selectData = CallData,
>(parameters: CreateCallParameters<config, selectData> = {}): CreateCallReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    callQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
}
