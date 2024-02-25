import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
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

export type CreateCallParameters<config extends Config = Config, selectData = CallData> = Evaluate<
  CallOptions<config> &
    ConfigParameter<config> &
    QueryParameter<CallQueryFnData, CallErrorType, selectData, CallQueryKey<config>>
>;

export type CreateCallReturnType<selectData = CallData> = RuneReturnType<
  QueryObserverResult<selectData, CallErrorType>
>;

export function createCall<
  config extends Config = ResolvedRegister["config"],
  selectData = CallData,
>(parameters: CreateCallParameters<config, selectData> = {}): CreateCallReturnType<selectData> {
  const { query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = callQueryOptions(config.result, {
    ...parameters,
    chainId,
  });

  const store = createQuery({ ...query, ...options });

  return storeToRune(store);
}
