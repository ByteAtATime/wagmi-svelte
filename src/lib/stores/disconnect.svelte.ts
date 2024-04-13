import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type RuneReturnType, type FuncOrVal } from "$lib/types";
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
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import { createConnections } from "./connections.svelte";

export type CreateDisconnectParameters<context = unknown> = FuncOrVal<
  Evaluate<
    ConfigParameter & {
      mutation?:
      | CreateMutationParameters<
        DisconnectData,
        DisconnectErrorType,
        DisconnectVariables,
        context
      >
      | undefined;
    }
  >
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
  parameters: CreateDisconnectParameters<context> = {} as any,
): CreateDisconnectReturnType<context> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const connections = $derived.by(createConnections({ config }));

  const mutationOptions = disconnectMutationOptions(config);
  const store = createMutation<DisconnectData, DisconnectErrorType, DisconnectVariables, context>(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateDisconnectReturnType<context>>;
  const result = $derived({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    disconnect: mutateResult.mutate,
    disconnectAsync: mutateResult.mutateAsync,
    connectors: connections.map((connection) => connection.connector),
  });

  return () => result;
}
