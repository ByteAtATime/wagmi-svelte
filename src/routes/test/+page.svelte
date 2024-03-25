<script>
  import { createConnect } from "$lib";
  import { injected } from "$lib/connectors";
  import { onConnect } from "$lib/listeners";

  onConnect(() => {
    alert("Connected!");
  });

  const connect = createConnect();
</script>

<button on:click={() => connect.result.connect({ connector: injected() })}>Connect</button>
