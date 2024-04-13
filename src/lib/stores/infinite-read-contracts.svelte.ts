import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type InfiniteQueryParameter,
  type RuneReturnType,
  type ParamType,
} from "$lib/types";
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
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateInfiniteContractReadsParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  config extends Config = Config,
  pageParam = unknown,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
> = FuncOrVal<
  InfiniteReadContractsOptions<contracts, allowFailure, pageParam, config> &
  ConfigParameter<config> &
  InfiniteQueryParameter<
    InfiniteReadContractsQueryFnData<contracts, allowFailure>,
    ReadContractsErrorType,
    selectData,
    InfiniteReadContractsData<contracts, allowFailure>,
    InfiniteReadContractsQueryKey<contracts, allowFailure, pageParam, config>,
    pageParam
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { contracts = [], query } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const chainId = $derived.by(createChainId());

  const options = $derived(
    infiniteReadContractsQueryOptions(config, {
      ...resolvedParameters,
      chainId: chainId,
      contracts: contracts as ParamType<CreateInfiniteContractReadsParameters>["contracts"],
      query: query as CreateInfiniteQueryParameters,
    }),
  );

  const store = createInfiniteQuery<
    InfiniteReadContractsQueryFnData<contracts, allowFailure>,
    ReadContractsErrorType,
    selectData,
    InfiniteReadContractsQueryKey<contracts, allowFailure, pageParam, config>
  >(
    runeToStore(() => ({
      ...(query as any),
      ...options,
      initialPageParam: options.initialPageParam,
      structuralSharing: query.structuralSharing ?? structuralSharing,
    })),
  );

  return storeToRune(store);
}
