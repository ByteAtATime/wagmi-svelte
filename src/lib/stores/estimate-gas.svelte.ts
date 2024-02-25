import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
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
> = EstimateGasOptions<config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    EstimateGasQueryFnData,
    EstimateGasErrorType,
    selectData,
    EstimateGasQueryKey<config, chainId>
  >;

export type CreateEstimateGasReturnType<selectData = EstimateGasData> = RuneReturnType<
  QueryObserverResult<selectData, EstimateGasErrorType>
>;

export function createEstimateGas(
  parameters: CreateEstimateGasParameters = {},
): CreateEstimateGasReturnType {
  const { connector, query = {} } = parameters;

  const config = createConfig(parameters);
  const connectorClient = createConnectorClient({
    connector,
    query: { enabled: parameters.account === undefined },
  });
  const account = $derived(parameters.account ?? connectorClient.result.data?.account);
  const configChainId = createChainId();
  const chainId = parameters.chainId ?? configChainId.result;

  const options = estimateGasQueryOptions(config.result, {
    ...parameters,
    account,
    chainId,
    connector,
  });
  const enabled = $derived(Boolean((account || connector) && (query.enabled ?? true)));

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
