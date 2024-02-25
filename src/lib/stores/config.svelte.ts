import type { Config, ResolvedRegister } from "@wagmi/core";
import { getContext } from "svelte";
import { WagmiProviderNotFoundError } from "../errors";
import type { ConfigParameter, RuneReturnType } from "../types";

export type CreateConfigParameters<config extends Config = Config> = ConfigParameter<config>;
export type CreateConfigReturnType<config extends Config = Config> = RuneReturnType<config>;

export const createConfig = <config extends Config = ResolvedRegister["config"]>(
  parameters: CreateConfigParameters<config> = {},
): CreateConfigReturnType => {
  const { config: providerConfig } = getContext<{ config: Config }>("wagmi");

  if (!providerConfig) {
    throw new WagmiProviderNotFoundError();
  }

  const config = $derived(parameters.config ?? providerConfig);

  return {
    get result() {
      return config;
    },
  };
};
