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
> = FuncOrVal<
  Evaluate<
    GetBytecodeOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetBytecodeQueryFnData,
      GetBytecodeErrorType,
      selectData,
      GetBytecodeQueryKey<config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    getBytecodeQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
