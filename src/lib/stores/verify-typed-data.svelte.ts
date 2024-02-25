import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
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
> = VerifyTypedDataOptions<typedData, primaryType, config> &
  ConfigParameter<config> &
  QueryParameter<
    VerifyTypedDataQueryFnData,
    VerifyTypedDataErrorType,
    selectData,
    VerifyTypedDataQueryKey<typedData, primaryType, config>
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
  const { address, message, primaryType, signature, types, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = parameters.chainId ?? createChainId().result;

  const options = verifyTypedDataQueryOptions<config, typedData, primaryType>(
    config.result as config,
    {
      ...parameters,
      chainId,
    },
  );
  const enabled = $derived(
    Boolean(address && message && primaryType && signature && types && (query.enabled ?? true)),
  );

  const store = createQuery(
    derived(
      [
        runeToStore({
          get result() {
            return enabled;
          },
        }),
      ],
      ([$enabled]) => ({ ...query, ...options, enabled: $enabled }),
    ),
  );

  return storeToRune(store);
}
