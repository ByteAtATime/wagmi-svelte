<script lang="ts">
  import "../prism.css";
  import "../app.css";
  import { WagmiProvider, createWagmiConfig, http } from "$lib";
  import { mainnet, sepolia } from "$lib/chains";

  const config = createWagmiConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
</script>

<WagmiProvider {config}>
  <div class="bg-[#000814] py-8">
    <div class="max-w-screen-md mx-auto prose prose-lg prose-invert">
      <slot />
    </div>
  </div>
</WagmiProvider>
