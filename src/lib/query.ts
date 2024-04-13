import {
  replaceEqualDeep,
  createInfiniteQuery as tanstack_createInfiniteQuery,
  createQuery as tanstack_createQuery,
  type CreateInfiniteQueryOptions,
  type CreateInfiniteQueryResult,
  type CreateMutationOptions,
  type CreateQueryOptions,
  type DefaultError,
  type MutationObserverResult,
  type QueryKey,
  type QueryObserverResult,
  type StoreOrVal,
} from "@tanstack/svelte-query";
import { deepEqual, type Evaluate, type ExactPartial, type Omit } from "@wagmi/core/internal";
import { hashFn } from "@wagmi/core/query";
import { derived, get, type Readable } from "svelte/store";

// TODO: figure out how to have TypeScript know these are keys of the object
export type CreateMutationParameters<
  data = unknown,
  error = Error,
  variables = void,
  context = unknown,
> =
  CreateMutationOptions<data, error, Evaluate<variables>, context> extends Readable<infer T>
  ? Readable<Omit<T, "mutationFn" | "mutationKey" | "throwOnError">>
  : Omit<
    CreateMutationOptions<data, error, Evaluate<variables>, context>,
    "mutationFn" | "mutationKey" | "throwOnError"
  >;

export type CreateMutationReturnType<
  data = unknown,
  error = Error,
  variables = void,
  context = unknown,
> = Evaluate<Omit<MutationObserverResult<data, error, variables, context>, "mutate">>;

////////////////////////////////////////////////////////////////////////////////

export type CreateQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Evaluate<
  ExactPartial<Omit<CreateQueryOptions<queryFnData, error, data, queryKey>, "initialData">> & {
    // Fix `initialData` type
    initialData?: CreateQueryOptions<queryFnData, error, data, queryKey>["initialData"] | undefined;
  }
>;

export type CreateQueryReturnType<data = unknown, error = DefaultError> = Evaluate<
  Readable<
    QueryObserverResult<data, error> & {
      queryKey: QueryKey;
    }
  >
>;

// Adding some basic customization.
// Ideally we don't have this function, but `import('@tanstack/svelte-query').createQuery` currently has some quirks where it is super hard to
// pass down the inferred `initialData` type because of it's discriminated overload in the on `createQuery`.
export function createQuery<queryFnData, error, data, queryKey extends QueryKey>(
  parameters: StoreOrVal<
    CreateQueryParameters<queryFnData, error, data, queryKey> & {
      queryKey: QueryKey;
    }
  >,
): CreateQueryReturnType<data, error> {
  // check if `parameters` is a store
  if ("subscribe" in parameters) {
    const result = tanstack_createQuery(
      derived(parameters, ($parameters) => {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...$parameters,
          queryKeyHashFn: hashFn, // for bigint support
        } as any;
      }),
    ) as CreateQueryReturnType<data, error>;

    return derived(result, (data) => ({ ...data, queryKey: get(parameters).queryKey }));
  }

  const result = tanstack_createQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(parameters as any),
    queryKeyHashFn: hashFn, // for bigint support
  }) as CreateQueryReturnType<data, error>;
  return derived(result, (data) => ({ ...data, queryKey: parameters.queryKey }));
}

////////////////////////////////////////////////////////////////////////////////

export type CreateInfiniteQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryData = queryFnData,
  queryKey extends QueryKey = QueryKey,
  pageParam = unknown,
> = Evaluate<
  Omit<
    CreateInfiniteQueryOptions<queryFnData, error, data, queryData, queryKey, pageParam>,
    "initialData"
  > & {
    // Fix `initialData` type
    initialData?:
    | CreateInfiniteQueryOptions<queryFnData, error, data, queryKey>["initialData"]
    | undefined;
  }
>;

export type CreateInfiniteQueryReturnType<
  data = unknown,
  error = DefaultError,
> = CreateInfiniteQueryResult<data, error> & {
  queryKey: QueryKey;
};

// Adding some basic customization.
export function createInfiniteQuery<queryFnData, error, data, queryKey extends QueryKey>(
  parameters: StoreOrVal<
    CreateInfiniteQueryParameters<queryFnData, error, data, queryKey> & {
      queryKey: QueryKey;
    }
  >,
): CreateInfiniteQueryReturnType<data, error> {
  const result = tanstack_createInfiniteQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(parameters as any),
    queryKeyHashFn: hashFn, // for bigint support
  }) as CreateInfiniteQueryReturnType<data, error>;
  result.queryKey = parameters.queryKey;
  return result;
}

////////////////////////////////////////////////////////////////////////////////

export function structuralSharing<data>(oldData: data | undefined, newData: data): data {
  if (deepEqual(oldData, newData)) return oldData as data;
  return replaceEqualDeep(oldData, newData);
}
