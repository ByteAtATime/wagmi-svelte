<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { hydrate, type ResolvedRegister, type State } from "@wagmi/core";
  import { setContext, type Snippet } from "svelte";

  const {
    children,
    config,
    initialState,
    reconnectOnMount = true,
  } = $props<{
    children: Snippet;
    config: ResolvedRegister["config"];
    initialState?: State | undefined;
    reconnectOnMount?: boolean | undefined;
  }>();
  const configState = $state({ config });

  const { onMount } = hydrate(config, { initialState, reconnectOnMount });

  let active = true;

  $effect(() => {
    if (!active) return;
    if (!config._internal.ssr) return;
    onMount();
    active = false;
  });

  setContext("wagmi", configState);

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
