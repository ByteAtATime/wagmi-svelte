import type { ConfigParameter, InfiniteQueryParameter, RuneReturnType } from "$lib/types";
import type { InfiniteQueryObserverResult } from "@tanstack/svelte-query";
import type { Config, ReadContractsErrorType, ResolvedRegister } from "@wagmi/core";
import {
  infiniteReadContractsQueryOptions,
  type InfiniteReadContractsData,
  type InfiniteReadContractsOptions,
  type InfiniteReadContractsQueryFnData,
  type InfiniteReadContractsQueryKey,
} from "@wagmi/core/query";
import type { ContractFunctionParameters } from "viem";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import {
  createInfiniteQuery,
  structuralSharing,
  type CreateInfiniteQueryParameters,
} from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";

export type CreateInfiniteContractReadsParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  config extends Config = Config,
  pageParam = unknown,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
> = InfiniteReadContractsOptions<contracts, allowFailure, pageParam, config> &
  ConfigParameter<config> &
  InfiniteQueryParameter<
    InfiniteReadContractsQueryFnData<contracts, allowFailure>,
    ReadContractsErrorType,
    selectData,
    InfiniteReadContractsData<contracts, allowFailure>,
    InfiniteReadContractsQueryKey<contracts, allowFailure, pageParam, config>,
    pageParam
  >;

export type CreateInfiniteContractReadsReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
> = RuneReturnType<InfiniteQueryObserverResult<selectData, ReadContractsErrorType>>;

export function createInfiniteReadContracts<
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  config extends Config = ResolvedRegister["config"],
  pageParam = unknown,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
>(
  parameters: CreateInfiniteContractReadsParameters<
    contracts,
    allowFailure,
    config,
    pageParam,
    selectData
  >,
): CreateInfiniteContractReadsReturnType<contracts, allowFailure, selectData> {
  const { contracts = [], query } = parameters;

  const config = createConfig(parameters);
  const chainId = createChainId();

  const options = infiniteReadContractsQueryOptions(config.result, {
    ...parameters,
    chainId: chainId.result,
    contracts: contracts as CreateInfiniteContractReadsParameters["contracts"],
    query: query as CreateInfiniteQueryParameters,
  });

  const store = createInfiniteQuery<
    InfiniteReadContractsQueryFnData<contracts, allowFailure>,
    ReadContractsErrorType,
    selectData,
    InfiniteReadContractsQueryKey<contracts, allowFailure, pageParam, config>
  >({
    ...(query as any),
    ...options,
    initialPageParam: options.initialPageParam,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });

  return storeToRune(store);
}
