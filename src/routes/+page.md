<script>
    import Info from "./Info.svelte";
</script>

# Wagmi-Svelte

A port of [WAGMI](https://wagmi.sh/) to SvelteJS 5, to make Web3 development even easier.

## Design Considerations

This library has been made to emulate the [React](https://wagmi.sh/react/getting-started) experience as much as possible.

However, because Svelte is not React<sup>[citation needed]</sup>, there will inevitably be some differences. Here is a (hopefully comprehensive) list:

- Stores are prefixed with `create-` instead of `use-` (e.g. `createAccount` instead of `useAccount`, `createChainId` instead of `useChainId`, etc.)
  - While this may cause some confusion (`createConfig` sounds like it's, well, creating a config), this library uses this naming convention very consistently.
  - Any re-exported methods from `@wagmi/core` starting with `create-` have now been renamed to `createWagmi-` (e.g. `createWagmiConfig` instead of `createConfig`) to avoid naming conflicts
- To maintain reactivity, we now return a function that returns the value instead of the value itself. More on this in the next section.

### Reactivity

If you're coming from React, you are probably used to using hooks like this:

```ts
const { address, chainId, status } = useAccount();
```

However, in Svelte, [runes](https://svelte-5-preview.vercel.app/docs/runes) containing primitive values cannot be directly returned and also stay reactive. As a workaround, we return a function, which you can access through `$derived.by`. For example:

```ts
const { address, chainId, status } = $derived.by(createAccount()); // createAccount is the Svelte version of useAccount
```

<Info>While Svelte automatically generates a proxy for objects, we still return all values in this format for consistency.</Info>

## Getting Started

First, install the library:

```
$ pnpm add @byteatatime/wagmi-svelte
```

Then, you need to wrap everything that will use these hooks in the `WagmiProvider` component. If not all the pages will do so, I would recommend creating a [group](https://kit.svelte.dev/docs/advanced-routing#advanced-layouts-group) and putting it in the `+layout.svelte` file. Otherwise, just put it inside the layout at the root of the project.

Your `+layout.svelte` file should look something like this:

```svelte
<script>
  import { WagmiProvider } from "wagmi-svelte";
</script>

<WagmiProvider>
  <slot />
</WagmiProvider>
```

Much like Wagmi React, you pass your config into the provider component. As mentioned above, the config is now created with `createWagmiConfig`. Here is a basic example:

```svelte
<script>
  import { WagmiProvider, createWagmiConfig, http } from "wagmi-svelte";
  import { mainnet, sepolia } from "wagmi-svelte/chains";

  const config = createWagmiConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
</script>

<WagmiProvider>
  <slot />
</WagmiProvider>
```

You can then use the hooks in any child components.
