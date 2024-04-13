import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import type { SignTypedDataErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type SignTypedDataData,
  type SignTypedDataMutate,
  type SignTypedDataMutateAsync,
  type SignTypedDataVariables,
  signTypedDataMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateSignTypedDataParameters<context = unknown> = FuncOrVal<
  Evaluate<
    ConfigParameter & {
      mutation?:
      | CreateMutationParameters<
        SignTypedDataData,
        SignTypedDataErrorType,
        SignTypedDataVariables,
        context
      >
      | undefined;
    }
  >
>;

export type CreateSignTypedDataReturnType<context = unknown> = RuneReturnType<
  Evaluate<
    MutationObserverResult<
      SignTypedDataData,
      SignTypedDataErrorType,
      SignTypedDataVariables,
      context
    > & {
      signTypedData: SignTypedDataMutate<context>;
      signTypedDataAsync: SignTypedDataMutateAsync<context>;
    }
  >
>;

export function createSignTypedData<context = unknown>(
  parameters: CreateSignTypedDataParameters<context> = {},
): CreateSignTypedDataReturnType<context> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));

  const mutationOptions = $derived(signTypedDataMutationOptions(config));
  const store = createMutation<
    SignTypedDataData,
    SignTypedDataErrorType,
    SignTypedDataVariables,
    context
  >(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateSignTypedDataReturnType<context>>;
  return () => ({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    signTypedData: mutateResult.mutate as Return["signTypedData"],
    signTypedDataAsync: mutateResult.mutateAsync as Return["signTypedDataAsync"],
  });
}
