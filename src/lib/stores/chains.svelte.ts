import type { ConfigParameter, RuneReturnType } from "$lib/types";
import {
  getChains,
  type Config,
  type GetChainsReturnType,
  type ResolvedRegister,
} from "@wagmi/core";
import { watchChains } from "@wagmi/core/internal";
import { createConfig } from "./config.svelte";

export type CreateChainsParameters<config extends Config = Config> = ConfigParameter<config>;

export type CreateChainsReturnType<config extends Config = Config> = RuneReturnType<
  GetChainsReturnType<config>
>;

export function createChains<config extends Config = ResolvedRegister["config"]>(
  parameters: CreateChainsParameters<config> = {},
): CreateChainsReturnType<config> {
  const { result: config } = createConfig(parameters);

  let chains = $state<GetChainsReturnType<config>>(getChains(config));
  let unsubscribe: () => void | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchChains(config, {
      onChange: (newChains) => {
        chains = newChains;
      },
    });
  });

  return {
    get result() {
      return chains;
    },
  };
}
