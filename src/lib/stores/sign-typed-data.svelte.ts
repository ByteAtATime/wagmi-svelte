import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
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
import { storeToRune } from "$lib/runes.svelte";

export type CreateSignTypedDataParameters<context = unknown> = Evaluate<
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
  const { mutation } = parameters;

  const config = createConfig(parameters);

  const mutationOptions = signTypedDataMutationOptions(config.result);
  const store = createMutation<
    SignTypedDataData,
    SignTypedDataErrorType,
    SignTypedDataVariables,
    context
  >({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  type Return = CreateSignTypedDataReturnType<context>["result"];
  return {
    get result() {
      return {
        ...mutateResult.result,
        signTypedData: mutateResult.result.mutate as Return["signTypedData"],
        signTypedDataAsync: mutateResult.result.mutateAsync as Return["signTypedDataAsync"],
      };
    },
  };
}
