import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { getConnectors, watchConnectors, type GetConnectorsReturnType } from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateConnectorsParameters = ConfigParameter;

export type CreateConnectorsReturnType = RuneReturnType<GetConnectorsReturnType>;

export function createConnectors(
  parameters: CreateConnectorsParameters = {},
): CreateConnectorsReturnType {
  const config = createConfig(parameters);

  let connectors = $state(getConnectors(config.result));
  let unsubscribe: () => void | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchConnectors(config.result, {
      onChange: (newConnectors) => {
        connectors = newConnectors;
      },
    });
  });

  return {
    get result() {
      return connectors;
    },
  };
}
