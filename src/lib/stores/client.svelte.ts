import type { ConfigParameter, RuneReturnType } from "$lib/types";
import {
  type Config,
  type GetClientParameters,
  type GetClientReturnType,
  type ResolvedRegister,
  getClient,
  watchClient,
} from "@wagmi/core";
import type { Evaluate } from "@wagmi/core/internal";
import { createConfig } from "./config.svelte";

export type CreateClientParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | number | undefined =
    | config["chains"][number]["id"]
    | undefined,
> = Evaluate<GetClientParameters<config, chainId> & ConfigParameter<config>>;

export type CreateClientReturnType<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] | number | undefined =
    | config["chains"][number]["id"]
    | undefined,
> = RuneReturnType<GetClientReturnType<config, chainId>>;

export function createClient<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] | number | undefined =
    | config["chains"][number]["id"]
    | undefined,
>(
  parameters: CreateClientParameters<config, chainId> = {},
): CreateClientReturnType<config, chainId> {
  const config = createConfig(parameters);

  let client = $state(getClient(config.result));
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchClient(config.result, {
      onChange: (newClient) => {
        client = newClient;
      },
    });
  });

  return {
    get result() {
      return client as GetClientReturnType<config, chainId>;
    },
  };
}
