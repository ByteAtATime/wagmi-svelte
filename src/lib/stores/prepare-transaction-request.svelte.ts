import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
  type RuneReturnTypeToStore,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import {
  type Config,
  type PrepareTransactionRequestErrorType,
  type ResolvedRegister,
} from "@wagmi/core";
import type { PrepareTransactionRequestQueryFnData } from "@wagmi/core/query";
import {
  prepareTransactionRequestQueryOptions,
  type PrepareTransactionRequestData,
  type PrepareTransactionRequestOptions,
  type PrepareTransactionRequestQueryKey,
} from "@wagmi/core/query";
import { type PrepareTransactionRequestParameterType as viem_PrepareTransactionRequestParameterType } from "viem";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreatePrepareTransactionRequestParameters<
  parameterType extends
  viem_PrepareTransactionRequestParameterType = viem_PrepareTransactionRequestParameterType,
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = PrepareTransactionRequestData<parameterType, config, chainId>,
> = FuncOrVal<
  PrepareTransactionRequestOptions<parameterType, config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    PrepareTransactionRequestQueryFnData<parameterType, config, chainId>,
    PrepareTransactionRequestErrorType,
    selectData,
    PrepareTransactionRequestQueryKey<parameterType, config, chainId>
  >
>;

export type CreatePrepareTransactionRequestReturnType<
  parameterType extends
  viem_PrepareTransactionRequestParameterType = viem_PrepareTransactionRequestParameterType,
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = PrepareTransactionRequestData<parameterType, config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, PrepareTransactionRequestErrorType>>;

export function createPrepareTransactionRequest<
  parameterType extends viem_PrepareTransactionRequestParameterType,
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = PrepareTransactionRequestData<parameterType, config, chainId>,
>(
  parameters: CreatePrepareTransactionRequestParameters<
    parameterType,
    config,
    chainId,
    selectData
  > = {} as any,
): CreatePrepareTransactionRequestReturnType<parameterType, config, chainId, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { to, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    prepareTransactionRequestQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = Boolean(to && (query.enabled ?? true));

  const store = createQuery(
    runeToStore(() => ({
      ...(query as any),
      ...options,
      enabled,
    })),
  ) as RuneReturnTypeToStore<
    CreatePrepareTransactionRequestReturnType<parameterType, config, chainId, selectData>
  >;

  return storeToRune(store);
}
