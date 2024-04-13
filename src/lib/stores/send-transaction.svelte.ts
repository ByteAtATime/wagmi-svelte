import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type RuneReturnType, type FuncOrVal } from "$lib/types";
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
> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));

  const mutationOptions = $derived(sendTransactionMutationOptions(config));
  const store = createMutation<
    SendTransactionData,
    SendTransactionErrorType,
    SendTransactionVariables<config, config["chains"][number]["id"]>,
    context
  >({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateSendTransactionReturnType<config, context>>;
  return () => ({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    sendTransaction: mutateResult.mutate as Return["sendTransaction"],
    sendTransactionAsync: mutateResult.mutateAsync as Return["sendTransactionAsync"],
  });
}
