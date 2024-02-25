import { createQuery, structuralSharing } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type ReadContractsErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  readContractsQueryOptions,
  type ReadContractsData,
  type ReadContractsOptions,
  type ReadContractsQueryFnData,
  type ReadContractsQueryKey,
} from "@wagmi/core/query";
import { type ContractFunctionParameters } from "viem";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateReadContractsParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  config extends Config = Config,
  selectData = ReadContractsData<contracts, allowFailure>,
> = Evaluate<
  ReadContractsOptions<contracts, allowFailure, config> &
    ConfigParameter<config> &
    QueryParameter<
      ReadContractsQueryFnData<contracts, allowFailure>,
      ReadContractsErrorType,
      selectData,
      ReadContractsQueryKey<contracts, allowFailure, config>
    >
>;

export type CreateReadContractsReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  selectData = ReadContractsData<contracts, allowFailure>,
> = RuneReturnType<QueryObserverResult<selectData, ReadContractsErrorType>>;

export function createReadContracts<
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  config extends Config = ResolvedRegister["config"],
  selectData = ReadContractsData<contracts, allowFailure>,
>(
  parameters: CreateReadContractsParameters<contracts, allowFailure, config, selectData> = {},
): CreateReadContractsReturnType<contracts, allowFailure, selectData> {
  const { contracts = [], query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = createChainId();

  const options = readContractsQueryOptions<config, contracts, allowFailure>(
    config.result as config,
    { ...parameters, chainId: chainId.result },
  );

  const enabled = $derived.by(() => {
    let isContractsValid = false;
    for (const contract of contracts) {
      const { abi, address, functionName } = contract as ContractFunctionParameters;
      if (!abi || !address || !functionName) {
        isContractsValid = false;
        break;
      }
      isContractsValid = true;
    }
    return Boolean(isContractsValid && (query.enabled ?? true));
  });

  const store = createQuery({
    ...options,
    ...query,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });

  return storeToRune(store);
}
