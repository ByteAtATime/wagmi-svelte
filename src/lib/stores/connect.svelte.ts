import type { CreateMutationParameters } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
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

export type CreateConnectParameters<config extends Config = Config, context = unknown> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const connectors = $derived.by(createConnectors(() => ({ config })));

  const mutationOptions = $derived(connectMutationOptions(config));
  const store = createMutation<
    ConnectData<config>,
    ConnectErrorType,
    ConnectVariables<config>,
    context
  >(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  $effect(() => {
    config.subscribe(
      ({ status }) => status,
      (status, previousStatus) => {
        if (previousStatus === "connected" && status === "disconnected") mutateResult.reset();
      },
    );
  });

  type Return = ReturnType<CreateConnectReturnType<config, context>>;
  const result = $derived({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    connect: mutateResult.mutate,
    connectAsync: mutateResult.mutateAsync,
    connectors: connectors,
  });

  return () => result;
}
