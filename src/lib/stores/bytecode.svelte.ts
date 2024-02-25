import { createQuery } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetBytecodeErrorType, type ResolvedRegister } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  getBytecodeQueryOptions,
  type GetBytecodeData,
  type GetBytecodeOptions,
  type GetBytecodeQueryFnData,
  type GetBytecodeQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateBytecodeParameters<
  config extends Config = Config,
  selectData = GetBytecodeData,
> = Evaluate<
  GetBytecodeOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetBytecodeQueryFnData,
      GetBytecodeErrorType,
      selectData,
      GetBytecodeQueryKey<config>
    >
>;

export type CreateBytecodeReturnType<selectData = GetBytecodeData> = RuneReturnType<
  QueryObserverResult<selectData, GetBytecodeErrorType>
>;

export function createBytecode<
  config extends Config = ResolvedRegister["config"],
  selectData = GetBytecodeData,
>(
  parameters: CreateBytecodeParameters<config, selectData> = {},
): CreateBytecodeReturnType<selectData> {
  const { address, query = {} } = parameters;

  const config = createConfig(parameters);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = getBytecodeQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = Boolean(address && (query.enabled ?? true));

  const store = createQuery({ ...query, ...options, enabled });

  return storeToRune(store);
}
