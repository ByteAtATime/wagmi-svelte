import {
  resolveVal,
  type ConfigParameter,
  type EnabledParameter,
  type FuncOrVal,
} from "$lib/types";
import {
  type Config,
  type ResolvedRegister,
  type WatchContractEventParameters,
  watchContractEvent,
} from "@wagmi/core";
import { type UnionEvaluate, type UnionPartial } from "@wagmi/core/internal";

import type { Abi, ContractEventName } from "viem";
import { createConfig } from "./config.svelte";
import { createChainId } from "./chain-id.svelte";

export type CreateWatchContractEventParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> = ContractEventName<abi>,
  strict extends boolean | undefined = undefined,
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
> = FuncOrVal<
  UnionEvaluate<
    UnionPartial<WatchContractEventParameters<abi, eventName, strict, config, chainId>> &
    ConfigParameter<config> &
    EnabledParameter
  >
>;

export type CreateWatchContractEventReturnType = void;

export function createWatchContractEvent<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi>,
  strict extends boolean | undefined = undefined,
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
>(
  parameters: CreateWatchContractEventParameters<
    abi,
    eventName,
    strict,
    config,
    chainId
  > = {} as any,
): CreateWatchContractEventReturnType {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { enabled = true, onLogs, ...rest } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    if (!enabled) return;
    if (!onLogs) return;

    unsubscribe?.();
    unsubscribe = watchContractEvent(config, {
      ...(rest as any),
      chainId,
      onLogs,
    });
  });
}
