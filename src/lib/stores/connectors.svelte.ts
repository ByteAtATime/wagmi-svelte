import type { ConfigParameter, FuncOrVal, RuneReturnType } from "$lib/types";
import { getConnectors, watchConnectors, type GetConnectorsReturnType } from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateConnectorsParameters = FuncOrVal<ConfigParameter>;

export type CreateConnectorsReturnType = RuneReturnType<GetConnectorsReturnType>;

export function createConnectors(
  parameters: CreateConnectorsParameters = {},
): CreateConnectorsReturnType {
  const config = $derived.by(createConfig(parameters));

  let connectors = $state(getConnectors(config));
  let unsubscribe: () => void | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchConnectors(config, {
      onChange: (newConnectors) => {
        connectors = newConnectors;
      },
    });
  });

  return () => connectors;
}
