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
import type { Config, ResolvedRegister, VerifyTypedDataErrorType } from "@wagmi/core";
import {
  verifyTypedDataQueryOptions,
  type VerifyTypedDataData,
  type VerifyTypedDataOptions,
  type VerifyTypedDataQueryFnData,
  type VerifyTypedDataQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import type { TypedData } from "viem";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateVerifyTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
  config extends Config = Config,
  selectData = VerifyTypedDataData,
> = FuncOrVal<
  VerifyTypedDataOptions<typedData, primaryType, config> &
  ConfigParameter<config> &
  QueryParameter<
    VerifyTypedDataQueryFnData,
    VerifyTypedDataErrorType,
    selectData,
    VerifyTypedDataQueryKey<typedData, primaryType, config>
  >
>;

export type CreateVerifyTypedDataReturnType<selectData = VerifyTypedDataData> = RuneReturnType<
  QueryObserverResult<selectData, VerifyTypedDataErrorType>
>;

export function createVerifyTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | "EIP712Domain",
  config extends Config = ResolvedRegister["config"],
  selectData = VerifyTypedDataData,
>(
  parameters: CreateVerifyTypedDataParameters<
    typedData,
    primaryType,
    config,
    selectData
  > = {} as any,
): CreateVerifyTypedDataReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const {
    address,
    message,
    primaryType,
    signature,
    types,
    query = {},
  } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    verifyTypedDataQueryOptions<config, typedData, primaryType>(config as config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(
    Boolean(address && message && primaryType && signature && types && (query.enabled ?? true)),
  );

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
