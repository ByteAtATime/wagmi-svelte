import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import type { ConfigParameter, QueryParameter, RuneReturnType } from "$lib/types";
import type { QueryObserverResult } from "@tanstack/svelte-query";
import type { Config, ResolvedRegister, VerifyMessageErrorType } from "@wagmi/core";
import {
  verifyMessageQueryOptions,
  type VerifyMessageData,
  type VerifyMessageOptions,
  type VerifyMessageQueryFnData,
  type VerifyMessageQueryKey,
} from "@wagmi/core/query";
import { derived } from "svelte/store";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";

export type CreateVerifyMessageParameters<
  config extends Config = Config,
  selectData = VerifyMessageData,
> = VerifyMessageOptions<config> &
  ConfigParameter<config> &
  QueryParameter<
    VerifyMessageQueryFnData,
    VerifyMessageErrorType,
    selectData,
    VerifyMessageQueryKey<config>
  >;

export type CreateVerifyMessageReturnType<selectData = VerifyMessageData> = RuneReturnType<
  QueryObserverResult<selectData, VerifyMessageErrorType>
>;

export function createVerifyMessage<
  config extends Config = ResolvedRegister["config"],
  selectData = VerifyMessageData,
>(
  parameters: CreateVerifyMessageParameters<config, selectData> = {},
): CreateVerifyMessageReturnType<selectData> {
  const { address, message, signature, query = {} } = parameters;

  const config = createConfig(parameters);
  const chainId = parameters.chainId ?? createChainId().result;

  const options = verifyMessageQueryOptions(config.result, {
    ...parameters,
    chainId,
  });
  const enabled = $derived(Boolean(address && message && signature && (query.enabled ?? true)));

  const store = createQuery(
    derived(
      [
        runeToStore({
          get result() {
            return enabled;
          },
        }),
      ],
      ([$enabled]) => ({ ...query, ...options, enabled: $enabled }),
    ),
  );

  return storeToRune(store);
}
