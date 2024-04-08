import { createQuery, structuralSharing } from "$lib/query";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type ReadContractErrorType, type ResolvedRegister } from "@wagmi/core";
import { type UnionEvaluate } from "@wagmi/core/internal";
import {
  type ReadContractData,
  type ReadContractOptions,
  type ReadContractQueryFnData,
  type ReadContractQueryKey,
  readContractQueryOptions,
} from "@wagmi/core/query";
import { type Abi, type ContractFunctionArgs, type ContractFunctionName } from "viem";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";
import { storeToRune } from "$lib/runes.svelte";

export type CreateReadContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "pure" | "view"> = ContractFunctionName<
    abi,
    "pure" | "view"
  >,
  args extends ContractFunctionArgs<abi, "pure" | "view", functionName> = ContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName
  >,
  config extends Config = Config,
  selectData = ReadContractData<abi, functionName, args>,
> = UnionEvaluate<
  ReadContractOptions<abi, functionName, args, config> &
    ConfigParameter<config> &
    QueryParameter<
      ReadContractQueryFnData<abi, functionName, args>,
      ReadContractErrorType,
      selectData,
      ReadContractQueryKey<abi, functionName, args, config>
    >
>;

export type CreateReadContractReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "pure" | "view"> = ContractFunctionName<
    abi,
    "pure" | "view"
  >,
  args extends ContractFunctionArgs<abi, "pure" | "view", functionName> = ContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName
  >,
  selectData = ReadContractData<abi, functionName, args>,
> = RuneReturnType<QueryObserverResult<selectData, ReadContractErrorType>>;

export function createReadContract<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "pure" | "view">,
  args extends ContractFunctionArgs<abi, "pure" | "view", functionName>,
  config extends Config = ResolvedRegister["config"],
  selectData = ReadContractData<abi, functionName, args>,
>(
  parameters: CreateReadContractParameters<abi, functionName, args, config, selectData> = {} as any,
): CreateReadContractReturnType<abi, functionName, args, selectData> {
  const { abi, address, functionName, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = createChainId();

  const options = readContractQueryOptions<config, abi, functionName, args>(
    config.result as config,
    { ...(parameters as any), chainId: parameters.chainId ?? chainId.result },
  );
  const enabled = $derived(Boolean(address && abi && functionName && (query.enabled ?? true)));

  const store = createQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });

  return storeToRune(store);
}
