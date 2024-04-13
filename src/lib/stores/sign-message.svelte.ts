import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
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
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateSignMessageParameters<context = unknown> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));

  const mutationOptions = $derived(signMessageMutationOptions(config));
  const store = createMutation<
    SignMessageData,
    SignMessageErrorType,
    SignMessageVariables,
    context
  >(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateSignMessageReturnType<context>>;
  return () => ({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    signMessage: mutateResult.mutate as Return["signMessage"],
    signMessageAsync: mutateResult.mutateAsync as Return["signMessageAsync"],
  });
}
