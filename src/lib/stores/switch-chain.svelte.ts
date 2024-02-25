import type { CreateMutationParameters } from "$lib/query";
import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { createMutation, type MutationObserverResult } from "@tanstack/svelte-query";
import {
  type Config,
  type GetChainsReturnType,
  type ResolvedRegister,
  type SwitchChainErrorType,
} from "@wagmi/core";
import { type Evaluate } from "@wagmi/core/internal";
import {
  type SwitchChainData,
  type SwitchChainMutate,
  type SwitchChainMutateAsync,
  type SwitchChainVariables,
  switchChainMutationOptions,
} from "@wagmi/core/query";
import { createConfig } from "./config.svelte";
import { storeToRune } from "$lib/runes.svelte";
import { createChains } from "./chains.svelte";

export type CreateSwitchChainParameters<
  config extends Config = Config,
  context = unknown,
> = Evaluate<
  ConfigParameter<config> & {
    mutation?:
      | CreateMutationParameters<
          SwitchChainData<config, config["chains"][number]["id"]>,
          SwitchChainErrorType,
          SwitchChainVariables<config, config["chains"][number]["id"]>,
          context
        >
      | undefined;
  }
>;

export type CreateSwitchChainReturnType<
  config extends Config = Config,
  context = unknown,
> = RuneReturnType<
  Evaluate<
    MutationObserverResult<
      SwitchChainData<config, config["chains"][number]["id"]>,
      SwitchChainErrorType,
      SwitchChainVariables<config, config["chains"][number]["id"]>,
      context
    > & {
      chains: Evaluate<GetChainsReturnType<config>>;
      switchChain: SwitchChainMutate<config, context>;
      switchChainAsync: SwitchChainMutateAsync<config, context>;
    }
  >
>;

export function createSwitchChain<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>(
  parameters: CreateSwitchChainParameters<config, context> = {},
): CreateSwitchChainReturnType<config, context> {
  const { mutation } = parameters;

  const config = createConfig(parameters);
  const chains = createChains({ config: config.result });

  const mutationOptions = switchChainMutationOptions(config.result);
  const store = createMutation({
    ...mutation,
    ...mutationOptions,
  });

  const mutateResult = storeToRune(store);

  type Return = CreateSwitchChainReturnType<config, context>["result"];
  return {
    get result() {
      return {
        ...mutateResult.result,
        chains: chains.result,
        switchChain: mutateResult.result.mutate,
        switchChainAsync: mutateResult.result.mutateAsync as Return["switchChainAsync"],
      };
    },
  };
}
