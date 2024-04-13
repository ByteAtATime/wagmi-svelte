import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import type { Config, ResolvedRegister, WriteContractErrorType } from "@wagmi/core";
import {
  type WriteContractData,
  type WriteContractMutate,
  type WriteContractMutateAsync,
  type WriteContractVariables,
  writeContractMutationOptions,
} from "@wagmi/core/query";
import type { Abi } from "viem";
import { createConfig } from "./config.svelte";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateWriteContractParameters<
  config extends Config = Config,
  context = unknown,
> = FuncOrVal<
  ConfigParameter<config> & {
    mutation?:
    | CreateMutationParameters<
      WriteContractData,
      WriteContractErrorType,
      WriteContractVariables<
        Abi,
        string,
        readonly unknown[],
        config,
        config["chains"][number]["id"]
      >,
      context
    >
    | undefined;
  }
>;

export type CreateWriteContractReturnType<
  config extends Config = Config,
  context = unknown,
> = RuneReturnType<
  MutationObserverResult<
    WriteContractData,
    WriteContractErrorType,
    WriteContractVariables<Abi, string, readonly unknown[], config, config["chains"][number]["id"]>,
    context
  > & {
    writeContract: WriteContractMutate<config, context>;
    writeContractAsync: WriteContractMutateAsync<config, context>;
  }
>;

export function createWriteContract<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: CreateWriteContractParameters<config, context> = {},
): CreateWriteContractReturnType<config, context> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));

  const mutationOptions = $derived(writeContractMutationOptions(config));
  const store = createMutation<
    WriteContractData,
    WriteContractErrorType,
    WriteContractVariables<Abi, string, readonly unknown[], config, config["chains"][number]["id"]>,
    context
  >(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateWriteContractReturnType<config, context>>;
  return () => ({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    writeContract: mutateResult.mutate as Return["writeContract"],
    writeContractAsync: mutateResult.mutateAsync as Return["writeContractAsync"],
  });
}
