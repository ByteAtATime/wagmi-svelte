import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
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
import { storeToRune } from "$lib/runes.svelte";

export type CreateWriteContractParameters<
  config extends Config = Config,
  context = unknown,
> = ConfigParameter<config> & {
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
};

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
  const { mutation } = parameters;

  const config = createConfig(parameters);

  const mutationOptions = writeContractMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  return {
    get result() {
      return {
        ...mutateResult.result,
        writeContract: mutateResult.result.mutate,
        writeContractAsync: mutateResult.result.mutateAsync,
      };
    },
  };
}
