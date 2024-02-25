import type { ConfigParameter, RuneReturnType } from "$lib/types";
import { type GetConnectionsReturnType, getConnections, watchConnections } from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateConnectionsParameters = ConfigParameter;

export type CreateConnectionsReturnType = RuneReturnType<GetConnectionsReturnType>;

export function createConnections(
  parameters: CreateConnectionsParameters = {},
): CreateConnectionsReturnType {
  const config = createConfig(parameters);

  let connections = $state(getConnections(config.result));
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchConnections(config.result, {
      onChange: (newConnections) => {
        connections = newConnections;
      },
    });
  });

  return {
    get result() {
      return connections;
    },
  };
}
