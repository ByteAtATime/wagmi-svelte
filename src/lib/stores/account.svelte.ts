import type { ConfigParameter, FuncOrVal, RuneReturnType } from "$lib/types";
import {
  getAccount,
  watchAccount,
  type Config,
  type GetAccountReturnType,
  type ResolvedRegister,
} from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateAccountParameters<config extends Config = Config> = FuncOrVal<
  ConfigParameter<config>
>;

export type CreateAccountReturnType<config extends Config = Config> = RuneReturnType<
  GetAccountReturnType<config>
>;

export function createAccount<config extends Config = ResolvedRegister["config"]>(
  parameters: CreateAccountParameters<config> = {},
): CreateAccountReturnType<config> {
  const config = $derived.by(createConfig(parameters));

  let value = $state(getAccount(config));
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchAccount(config, {
      onChange: (newValue) => {
        value = newValue;
      },
    });
  });

  return () => value;
}
