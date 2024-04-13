import type { Config, ResolvedRegister } from "@wagmi/core";
import { getContext } from "svelte";
import { WagmiProviderNotFoundError } from "../errors";
import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "../types";

export type CreateConfigParameters<config extends Config = Config> = FuncOrVal<
  ConfigParameter<config>
>;
export type CreateConfigReturnType<config extends Config = Config> = RuneReturnType<config>;

export const createConfig = <config extends Config = ResolvedRegister["config"]>(
  parameters: CreateConfigParameters<config> = {},
): CreateConfigReturnType => {
  const { config: providerConfig } = getContext<{ config: Config }>("wagmi");

  if (!providerConfig) {
    throw new WagmiProviderNotFoundError();
  }

  const config = $derived(resolveVal(parameters).config ?? providerConfig);

  return () => config;
};
