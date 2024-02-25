import { get, writable, type Readable } from "svelte/store";
import type { RuneReturnType } from "./types";

export const storeToRune = <T>(store: Readable<T>): RuneReturnType<T> => {
  let result = $state(get(store));

  store.subscribe(($store) => {
    result = $store;
  });

  return {
    get result() {
      return result;
    },
  };
};

export const runeToStore = <T>(rune: RuneReturnType<T>): Readable<T> => {
  const store = writable(rune.result);

  $effect(() => {
    store.set(rune.result);
  });

  return store;
};
