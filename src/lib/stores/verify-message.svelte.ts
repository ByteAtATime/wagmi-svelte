import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
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
> = FuncOrVal<
  VerifyMessageOptions<config> &
  ConfigParameter<config> &
  QueryParameter<
    VerifyMessageQueryFnData,
    VerifyMessageErrorType,
    selectData,
    VerifyMessageQueryKey<config>
  >
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
  const resolvedParameters = $derived(resolveVal(parameters));
  const { address, message, signature, query = {} } = $derived(resolvedParameters);

  const config = $derived.by(createConfig(parameters));
  const configChainId = $derived.by(createChainId());
  const chainId = $derived(resolvedParameters.chainId ?? configChainId);

  const options = $derived(
    verifyMessageQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );
  const enabled = $derived(Boolean(address && message && signature && (query.enabled ?? true)));

  const store = createQuery(runeToStore(() => ({ ...query, ...options, enabled })));

  return storeToRune(store);
}
