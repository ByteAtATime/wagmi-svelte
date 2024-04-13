import { createQuery } from "$lib/query";
import { runeToStore, storeToRune } from "$lib/runes.svelte";
import {
  resolveVal,
  type ConfigParameter,
  type FuncOrVal,
  type QueryParameter,
  type RuneReturnType,
} from "$lib/types";
import { useQueryClient, type QueryObserverResult } from "@tanstack/svelte-query";
import { type Config, type GetBlockNumberErrorType, type ResolvedRegister } from "@wagmi/core";
import { type Evaluate, type UnionEvaluate, type UnionOmit } from "@wagmi/core/internal";
import {
  getBlockNumberQueryOptions,
  type GetBlockNumberData,
  type GetBlockNumberOptions,
  type GetBlockNumberQueryFnData,
  type GetBlockNumberQueryKey,
} from "@wagmi/core/query";
import { createChainId } from "./chain-id.svelte";
import { createConfig } from "./config.svelte";
import {
  createWatchBlockNumber,
  type CreateWatchBlockNumberParameters,
} from "./watch-block-number.svelte";

export type CreateBlockNumberParameters<
  config extends Config = Config,
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockNumberData,
> = FuncOrVal<
  Evaluate<
    GetBlockNumberOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetBlockNumberQueryFnData,
      GetBlockNumberErrorType,
      selectData,
      GetBlockNumberQueryKey<config, chainId>
    > & {
      watch?:
      | boolean
      | UnionEvaluate<
        UnionOmit<
          CreateWatchBlockNumberParameters<config, chainId>,
          "chainId" | "config" | "onBlockNumber" | "onError"
        >
      >
      | undefined;
    }
  >
>;

export type CreateBlockNumberReturnType<selectData = GetBlockNumberData> = RuneReturnType<
  QueryObserverResult<selectData, GetBlockNumberErrorType>
>;

export function createBlockNumber<
  config extends Config = ResolvedRegister["config"],
  chainId extends config["chains"][number]["id"] = config["chains"][number]["id"],
  selectData = GetBlockNumberData,
>(
  parameters: CreateBlockNumberParameters<config, chainId, selectData> = {},
): CreateBlockNumberReturnType<selectData> {
  const resolvedParameters = $derived(resolveVal(parameters));
  const { query = {}, watch } = resolvedParameters;

  const config = $derived.by(createConfig(parameters));
  const queryClient = useQueryClient();
  const configChainId = $derived.by(createChainId());
  const chainId = resolvedParameters.chainId ?? configChainId;

  const options = $derived(
    getBlockNumberQueryOptions(config, {
      ...resolvedParameters,
      chainId,
    }),
  );

  createWatchBlockNumber({
    ...({
      config: resolvedParameters.config,
      chainId: resolvedParameters.chainId,
      ...(typeof watch === "object" ? watch : {}),
    } as CreateWatchBlockNumberParameters),
    enabled: Boolean(
      (query.enabled ?? true) && (typeof watch === "object" ? watch.enabled : watch),
    ),
    onBlockNumber(blockNumber) {
      queryClient.setQueryData(options.queryKey, blockNumber);
    },
  });

  const store = createQuery(runeToStore(() => ({ ...query, ...options })));

  return storeToRune(store);
}
