import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, ResolvedRegister, SimulateContractErrorType } from "@wagmi/core";
import {
  type SimulateContractData,
  type SimulateContractOptions,
  type SimulateContractQueryFnData,
  type SimulateContractQueryKey,
  simulateContractQueryOptions,
} from "@wagmi/core/query";
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import { createConfig } from "./config.svelte";
import { createConnectorClient } from "./connector-client.svelte";
import { createChainId } from "./chain-id.svelte";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import { createQuery } from "$lib/query";

export type CreateSimulateContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable"> = ContractFunctionName<
    abi,
    "nonpayable" | "payable"
  >,
  args extends ContractFunctionArgs<
    abi,
    "nonpayable" | "payable",
    functionName
  > = ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = SimulateContractData<abi, functionName, args, config, chainId>,
> = FuncOrVal<
  SimulateContractOptions<abi, functionName, args, config, chainId> &
  ConfigParameter<config> &
  QueryParameter<
    SimulateContractQueryFnData<abi, functionName, args, config, chainId>,
    SimulateContractErrorType,
    selectData,
    SimulateContractQueryKey<abi, functionName, args, config, chainId>
  >
>;

export type CreateSimulateContractReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable"> = ContractFunctionName<
    abi,
    "nonpayable" | "payable"
  >,
  args extends ContractFunctionArgs<
    abi,
    "nonpayable" | "payable",
    functionName
  > = ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = SimulateContractData<abi, functionName, args, config, chainId>,
> = RuneReturnType<QueryObserverResult<selectData, SimulateContractErrorType>>;

export function createSimulateContract<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  selectData = SimulateContractData<abi, functionName, args, config, chainId>,
>(
  parameters: CreateSimulateContractParameters<
    abi,
    functionName,
    args,
    config,
    chainId,
    selectData
  > = {} as any,
): CreateSimulateContractReturnType<abi, functionName, args, config, chainId, selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { abi, address, connector, functionName, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const connectorClient = $derived.by(
    createConnectorClient(() => ({
      connector,
      query: { enabled: resolvedParameters.account === undefined },
    })),
  );
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    simulateContractQueryOptions<config, abi, functionName, args, chainId>(config as config, {
      ...resolvedParameters,
      account: resolvedParameters.account ?? connectorClient.data?.account,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(abi && address && functionName && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
