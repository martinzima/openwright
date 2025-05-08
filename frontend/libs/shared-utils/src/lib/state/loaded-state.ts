import { generateUuidV4 } from "../utils/uuid";

/**
 * Generic utility class for states that are loaded - i.e. have a 'isLoading' flag
 * and handle concurrency correctly by always using response only from the latest
 * request.
 */
export interface LoadedStateBase {
  isLoading: boolean;
  loadedRequestId: string | null;
  dataInvalid: number;
}

export interface LoadedState<T, TSearch = string> extends LoadedStateBase {
  value?: T | null;
  error?: unknown | null;
  timestamp?: number;
  search?: TSearch;
}

export function newLoadedState<T>(value?: T, error?: unknown, timestamp?: number): LoadedState<T> {
  return {
    value,
    error,
    timestamp,
    loadedRequestId: value || error || timestamp ? generateUuidV4() : null,
    dataInvalid: value || error || timestamp ? 0 : 1,
    isLoading: false
  };
}
