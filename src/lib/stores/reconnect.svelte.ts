import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import { type Connector, type ReconnectErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type ReconnectData,
  type ReconnectMutate,
  type ReconnectMutateAsync,
  type ReconnectVariables,
  reconnectMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { runeToStore, storeToRune } from "$lib/runes.svelte";

export type CreateReconnectParameters<context = unknown> = FuncOrVal<
  Evaluate<
    ConfigParameter & {
      mutation?:
      | CreateMutationParameters<ReconnectData, ReconnectErrorType, ReconnectVariables, context>
      | undefined;
    }
  >
>;

export type CreateReconnectReturnType<context = unknown> = RuneReturnType<
  Evaluate<
    MutationObserverResult<ReconnectData, ReconnectErrorType, ReconnectVariables, context> & {
      connectors: readonly Connector[];
      reconnect: ReconnectMutate<context>;
      reconnectAsync: ReconnectMutateAsync<context>;
    }
  >
>;

export function createReconnect<context = unknown>(
  parameters: CreateReconnectParameters<context> = {},
): CreateReconnectReturnType<context> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));

  const mutationOptions = $derived(reconnectMutationOptions(config));
  const store = createMutation<ReconnectData, ReconnectErrorType, ReconnectVariables, context>(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateReconnectReturnType<context>>;
  const result = $derived({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    reconnect: mutateResult.mutate,
    reconnectAsync: mutateResult.mutateAsync,
    connectors: config.connectors,
  });

  return () => result;
}
