import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import type { Config, ResolvedRegister, SendTransactionErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  sendTransactionMutationOptions,
  type SendTransactionData,
  type SendTransactionMutate,
  type SendTransactionMutateAsync,
  type SendTransactionVariables,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { storeToRune } from "$lib/runes.svelte";

export type UseSendTransactionParameters<
  config extends Config = Config,
  context = unknown,
> = Evaluate<
  ConfigParameter<config> & {
    mutation?:
      | CreateMutationParameters<
          SendTransactionData,
          SendTransactionErrorType,
          SendTransactionVariables<config, config["chains"][number]["id"]>,
          context
        >
      | undefined;
  }
>;

export type CreateSendTransactionReturnType<
  config extends Config = Config,
  context = unknown,
> = RuneReturnType<
  Evaluate<
    MutationObserverResult<
      SendTransactionData,
      SendTransactionErrorType,
      SendTransactionVariables<config, config["chains"][number]["id"]>,
      context
    > & {
      sendTransaction: SendTransactionMutate<config, context>;
      sendTransactionAsync: SendTransactionMutateAsync<config, context>;
    }
  >
>;

export function createSendTransaction<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: UseSendTransactionParameters<config, context> = {},
): CreateSendTransactionReturnType<config, context> {
  const { mutation } = parameters;

  const config = createConfig(parameters);

  const mutationOptions = sendTransactionMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  type Return = CreateSendTransactionReturnType<config, context>["result"];
  return {
    get result() {
      return {
        ...mutateResult.result,
        sendTransaction: mutateResult.result.mutate as Return["sendTransaction"],
        sendTransactionAsync: mutateResult.result.mutateAsync as Return["sendTransactionAsync"],
      };
    },
  };
}
