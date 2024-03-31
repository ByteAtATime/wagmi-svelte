import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import { type Connector, type DisconnectErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type DisconnectData,
  type DisconnectMutate,
  type DisconnectMutateAsync,
  type DisconnectVariables,
  disconnectMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { storeToRune } from "$lib/runes.svelte";
import { createConnections } from "./connections.svelte";

export type CreateDisconnectParameters<context = unknown> = Evaluate<
  ConfigParameter & {
    mutation?:
      | CreateMutationParameters<DisconnectData, DisconnectErrorType, DisconnectVariables, context>
      | undefined;
  }
>;

export type CreateDisconnectReturnType<context = unknown> = RuneReturnType<
  Evaluate<
    MutationObserverResult<DisconnectData, DisconnectErrorType, DisconnectVariables, context> & {
      connectors: readonly Connector[];
      disconnect: DisconnectMutate<context>;
      disconnectAsync: DisconnectMutateAsync<context>;
    }
  >
>;

export function createDisconnect<context = unknown>(
  parameters: CreateDisconnectParameters<context> = {},
): CreateDisconnectReturnType<context> {
  const { mutation } = parameters;

  const config = createConfig(parameters);
  const connections = createConnections({ config: config.result });

  const mutationOptions = disconnectMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  const result = $derived({
    ...mutateResult.result,
    disconnect: mutateResult.result.mutate,
    disconnectAsync: mutateResult.result.mutateAsync,
    connectors: connections.result.map((connection) => connection.connector),
  });

  return {
    get result() {
      return result;
    },
  };
}
