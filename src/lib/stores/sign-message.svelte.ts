import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import { type SignMessageErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type SignMessageData,
  type SignMessageMutate,
  type SignMessageMutateAsync,
  type SignMessageVariables,
  signMessageMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { storeToRune } from "$lib/runes.svelte";

export type CreateSignMessageParameters<context = unknown> = Evaluate<
  ConfigParameter & {
    mutation?:
      | CreateMutationParameters<
          SignMessageData,
          SignMessageErrorType,
          SignMessageVariables,
          context
        >
      | undefined;
  }
>;

export type CreateSignMessageReturnType<context = unknown> = RuneReturnType<
  Evaluate<
    MutationObserverResult<SignMessageData, SignMessageErrorType, SignMessageVariables, context> & {
      signMessage: SignMessageMutate<context>;
      signMessageAsync: SignMessageMutateAsync<context>;
    }
  >
>;

export function createSignMessage<context = unknown>(
  parameters: CreateSignMessageParameters<context> = {},
): CreateSignMessageReturnType<context> {
  const { mutation } = parameters;

  const config = createConfig(parameters);

  const mutationOptions = signMessageMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  return {
    get result() {
      return {
        ...mutateResult.result,
        signMessage: mutateResult.result.mutate,
        signMessageAsync: mutateResult.result.mutateAsync,
      };
    },
  };
}
