import type { CreateMutationParameters } from "$lib/query";
import { storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import type { Config, ConnectErrorType, Connector, ResolvedRegister } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  connectMutationOptions,
  type ConnectData,
  type ConnectMutate,
  type ConnectMutateAsync,
  type ConnectVariables,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { createConnectors } from "./connectors.svelte";

export type CreateConnectParameters<config extends Config = Config, context = unknown> = Evaluate<
  ConfigParameter<config> & {
    mutation?:
      | CreateMutationParameters<
          ConnectData<config>,
          ConnectErrorType,
          ConnectVariables<config>,
          context
        >
      | undefined;
  }
>;

export type CreateConnectReturnType<
  config extends Config = Config,
  context = unknown,
> = RuneReturnType<
  Evaluate<
    MutationObserverResult<
      ConnectData<config>,
      ConnectErrorType,
      ConnectVariables<config>,
      context
    > & {
      connect: ConnectMutate<config, context>;
      connectAsync: ConnectMutateAsync<config, context>;
      connectors: readonly Connector[];
    }
  >
>;

export function createConnect<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: CreateConnectParameters<config, context> = {},
): CreateConnectReturnType<config, context> {
  const { mutation } = parameters;

  const config = createConfig(parameters);
  const connectors = createConnectors({ config: config.result });

  const mutationOptions = connectMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  $effect(() => {
    config.result.subscribe(
      ({ status }) => status,
      (status, previousStatus) => {
        if (previousStatus === "connected" && status === "disconnected")
          mutateResult.result.reset();
      },
    );
  });

  const result = $derived({
    ...mutateResult.result,
    connect: mutateResult.result.mutate,
    connectAsync: mutateResult.result.mutateAsync,
    connectors: connectors.result,
  });

  return {
    get result() {
      return result;
    },
  };
}
