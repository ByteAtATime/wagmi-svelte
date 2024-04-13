import type { CreateMutationParameters } from "$lib/query";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
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
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import { createChains } from "./chains.svelte";

export type CreateSwitchChainParameters<
  config extends Config = Config,
  context = unknown,
> = FuncOrVal<
  Evaluate<
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
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { mutation } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const chains = $derived.by(createChains({ config }));

  const mutationOptions = $derived(switchChainMutationOptions<config>(config as config));
  const store = createMutation<
    SwitchChainData<config, config["chains"][number]["id"]>,
    SwitchChainErrorType,
    SwitchChainVariables<config, config["chains"][number]["id"]>,
    context
  >(
    runeToStore(() => ({
      ...mutation,
      ...mutationOptions,
    })),
  );

  const mutateResult = $derived.by(storeToRune(store));

  type Return = ReturnType<CreateSwitchChainReturnType<config, context>>;
  return () => ({
    ...mutateResult,
    mutate: mutateResult.mutate as Return["mutate"],
    chains: chains,
    switchChain: mutateResult.mutate as Return["switchChain"],
    switchChainAsync: mutateResult.mutateAsync as Return["switchChainAsync"],
  });
}
