import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { watchChainId, type Config, type GetChainIdReturnType, getChainId } from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateChainIdParameters<config extends Config = Config> = ConfigParameter<config>;

export type CreateChainIdReturnType<config extends Config = Config> = RuneReturnType<
  GetChainIdReturnType<config>
>;

export const createChainId = <config extends Config = Config>(
  parameters: CreateChainIdParameters<config> = {},
): CreateChainIdReturnType => {
  const { result: config } = createConfig(parameters);

  let chainId = $state<GetChainIdReturnType<config>>(getChainId(config));
  let unsubscribe: () => void | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchChainId(config, {
      onChange: (newChainId) => {
        chainId = newChainId;
      },
    });
  });

  return {
    get result() {
      return chainId;
    },
  };
};
