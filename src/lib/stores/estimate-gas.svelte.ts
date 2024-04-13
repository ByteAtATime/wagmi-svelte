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
import type { Config, EstimateGasErrorType } from "@wagmi/core";
import {
  estimateGasQueryOptions,
  type EstimateGasData,
  type EstimateGasOptions,
  type EstimateGasQueryFnData,
  type EstimateGasQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import { createConnectorClient } from "./connector-client.svelte";

export type CreateEstimateGasParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = EstimateGasData,
> = FuncOrVal<
  EstimateGasOptions<config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    EstimateGasQueryFnData,
    EstimateGasErrorType,
    selectData,
    EstimateGasQueryKey<config, chainId>
  >
>;

export type CreateEstimateGasReturnType<selectData = EstimateGasData> = RuneReturnType<
  QueryObserverResult<selectData, EstimateGasErrorType>
>;

export function createEstimateGas(
  parameters: CreateEstimateGasParameters = {},
): CreateEstimateGasReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { connector, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const connectorClient = $derived.by(
    createConnectorClient(() => ({
      connector,
      query: { enabled: resolvedParameters.account === undefined },
    })),
  );
  const account = $derived(resolvedParameters.account ?? connectorClient.data?.account);
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    estimateGasQueryOptions(config, {
      ...resolvedParameters,
      account,
      chainId,
      connector,
    }),
  );
  const enabled = $derived(Boolean((account || connector) && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
