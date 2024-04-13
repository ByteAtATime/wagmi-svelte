import { createQuery, structuralSharing } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
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
> = FuncOrVal<
  Evaluate<
    ReadContractsOptions<contracts, allowFailure, config> &
    ConfigParameter<config> &
    QueryParameter<
      ReadContractsQueryFnData<contracts, allowFailure>,
      ReadContractsErrorType,
      selectData,
      ReadContractsQueryKey<contracts, allowFailure, config>
    >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { contracts = [], query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const chainId = $derived.by(createChainId());

  const options = $derived(
    readContractsQueryOptions<config, contracts, allowFailure>(config as config, {
      ...resolvedParameters,
      chainId,
    }),
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

  const store = createQuery(
    runeToStore(() => ({
      ...options,
      ...query,
      enabled,
      structuralSharing: query.structuralSharing ?? structuralSharing,
    })),
  );

  return storeToRune(store);
}
