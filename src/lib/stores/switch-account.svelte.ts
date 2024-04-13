import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import type { Config, Connector, ResolvedRegister, SwitchAccountErrorType } from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import {
  type SwitchAccountData,
  type SwitchAccountMutate,
  type SwitchAccountMutateAsync,
  type SwitchAccountVariables,
  switchAccountMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { storeToRune } from "$lib/runes.svelte";
import { createConnections } from "./connections.svelte";

export type CreateSwitchAccountParameters<
  config extends Config = Config,
  context = unknown,
> = FuncOrVal<
  Evaluate<
    ConfigParameter<config> & {
      mutation?:
      | CreateMutationParameters<
        SwitchAccountData<config>,
        SwitchAccountErrorType,
        SwitchAccountVariables,
        context
      >
      | undefined;
    }
  >
>;

export type CreateSwitchAccountReturnType<
  config extends Config = Config,
  context = unknown,
> = RuneReturnType<
  Evaluate<
    MutationObserverResult<
      SwitchAccountData<config>,
      SwitchAccountErrorType,
      SwitchAccountVariables,
      context
    > & {
      connectors: readonly Connector[];
      switchAccount: SwitchAccountMutate<config, context>;
      switchAccountAsync: SwitchAccountMutateAsync<config, context>;
    }
  >
>;

export function createSwitchAccount<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: CreateSwitchAccountParameters<config, context> = {},
): CreateSwitchAccountReturnType<config, context> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const connections = $derived.by(createConnections(() => ({ config })));

  const mutationOptions = $derived(switchAccountMutationOptions(config));
  const store = createMutation<
    SwitchAccountData<config>,
    SwitchAccountErrorType,
    SwitchAccountVariables,
    context
  >({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateSwitchAccountReturnType<config, context>>;
  return () => ({
    ...mutateResult,
    connectors: connections.map((connection) => connection.connector),
    mutate: mutateResult.mutate as Return["mutate"],
    switchAccount: mutateResult.mutate as Return["switchAccount"],
    switchAccountAsync: mutateResult.mutateAsync as Return["switchAccountAsync"],
  });
}
