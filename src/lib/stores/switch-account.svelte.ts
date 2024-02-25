import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
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
> = Evaluate<
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
  const { mutation } = parameters;

  const config = createConfig(parameters);
  const connections = createConnections({ config: config.result });

  const mutationOptions = switchAccountMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  return {
    get result() {
      return {
        ...mutateResult.result,
        connectors: connections.result.map((connection) => connection.connector),
        switchAccount: mutateResult.result.mutate,
        switchAccountAsync: mutateResult.result.mutateAsync,
      };
    },
  };
}
