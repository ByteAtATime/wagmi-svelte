import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
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
import { storeToRune } from "$lib/runes.svelte";

export type CreateReconnectParameters<context = unknown> = Evaluate<
  ConfigParameter & {
    mutation?:
      | CreateMutationParameters<ReconnectData, ReconnectErrorType, ReconnectVariables, context>
      | undefined;
  }
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
  const { mutation } = parameters;

  const config = createConfig(parameters);

  const mutationOptions = reconnectMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  const result = $derived({
    ...mutateResult.result,
    reconnect: mutateResult.result.mutate,
    reconnectAsync: mutateResult.result.mutateAsync,
    connectors: config.result.connectors,
  });

  return {
    get result() {
      return result;
    },
  };
}
