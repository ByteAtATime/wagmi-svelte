import { resolveVal, type ConfigParameter, type FuncOrVal, type RuneReturnType } from "$lib/types";
import { type GetConnectionsReturnType, getConnections, watchConnections } from "@wagmi/core";
import { createConfig } from "./config.svelte";

export type CreateConnectionsParameters = FuncOrVal<ConfigParameter>;

export type CreateConnectionsReturnType = RuneReturnType<GetConnectionsReturnType>;

export function createConnections(
  parameters: CreateConnectionsParameters = {},
): CreateConnectionsReturnType {
  const config = $derived.by(createConfig(parameters));

  let connections = $state(getConnections(config));
  let unsubscribe: (() => void) | undefined;

  $effect(() => {
    unsubscribe?.();
    unsubscribe = watchConnections(config, {
      onChange: (newConnections) => {
        connections = newConnections;
      },
    });
  });

  return () => connections;
}
