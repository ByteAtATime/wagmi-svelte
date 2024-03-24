import { watchAccount } from "@wagmi/core";
import { createConfig } from "./stores/config.svelte";
import type { NotFunction } from "svelte";

export const onConnect = <T>(fn: () => NotFunction<T> | Promise<NotFunction<T>> | (() => any)) => {
  const config = createConfig();
  watchAccount(config.result, {
    onChange(account, prevAccount) {
      if (account.isConnected && !prevAccount.isConnected) {
        fn();
      }
    },
  });
};
