import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import {
  type Config,
  type GetPublicClientParameters,
  type GetPublicClientReturnType,
  type ResolvedRegister,
  getPublicClient,
  watchPublicClient,
} from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import { createConfig } from "./config.svelte";

export type CreatePublicClientParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | number = config["chains"][number]["id"],
> = FuncOrVal<Evaluate<GetPublicClientParameters<config, chainId> & ConfigParameter<config>>>;

export type CreatePublicClientReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | number = config["chains"][number]["id"],
> = RuneReturnType<GetPublicClientReturnType<config, chainId> | undefined>;

export function createPublicClient<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] | number = config["chains"][number]["id"],
>(
  parameters: CreatePublicClientParameters<config, chainId> = {},
): CreatePublicClientReturnType<config, chainId> {
  const resolvedParameters = $derived(resolveVal(parameters));

  const config = $derived.by(createConfig(parameters));

  let publicClient = $state(getPublicClient<config, chainId>(config as config, resolvedParameters));
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchPublicClient<config, chainId>(config as config, {
      onChange(newPublicClient) {
        publicClient = newPublicClient;
      },
    });
  });

  return () => publicClient;
}
