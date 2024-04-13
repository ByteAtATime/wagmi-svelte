import type { DefaultError, QueryKey } from "@tanstack/svelte-query";
import type { Config } from "@wagmi/core";
import type { CreateInfiniteQueryParameters, CreateQueryParameters } from "./query";
import type { Readable } from "svelte/store";

export type ConfigParameter<config extends Config = Config> = {
  config?: Config | config | undefined;
};

export type EnabledParameter = {
  enabled?: boolean | undefined;
};

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
  | Omit<
    CreateQueryParameters<queryFnData, error, data, queryKey>,
    "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
  >
  | undefined;
};

export type InfiniteQueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryData = queryFnData,
  queryKey extends QueryKey = QueryKey,
  pageParam = unknown,
> = {
  query: Omit<
    CreateInfiniteQueryParameters<queryFnData, error, data, queryData, queryKey, pageParam>,
    "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
  >;
};

export type FuncOrVal<T> = T | (() => T);
export const resolveVal = <T>(val: FuncOrVal<T>): T => (val instanceof Function ? val() : val);
export type ParamType<T> = T extends FuncOrVal<infer U> ? U : never;

export type RuneReturnType<T> = () => T;

export type RuneReturnTypeToStore<T> = T extends RuneReturnType<infer U> ? Readable<U> : never;
