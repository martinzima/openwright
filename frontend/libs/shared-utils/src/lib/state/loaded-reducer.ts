import { generateUuidV4 } from '../utils/uuid';
import { LoadedState, newLoadedState } from './loaded-state';

export function loadReduce<T extends LoadedState<TResult, TSearch>, TResult, TSearch>(state: T): T {
  return {
    ...(state ?? newLoadedState() as unknown as T),
    isLoading: true,
    dataInvalid: 0,
    error: null
  };
}

export function loadCompleteReduce<T extends LoadedState<TResult, TSearch>, TResult, TSearch>(state: T, value: TResult | null): T {
    return {
      ...state,
      isLoading: false,
      value,
      loadedRequestId: generateUuidV4(),
      error: null,
      timestamp: Date.now()
    };
}

export function loadFailReduce<T extends LoadedState<TResult, TSearch>, TResult, TSearch>(state: T,
  error: unknown | null, value: TResult | null = null): T {
  return {
    ...state,
    isLoading: false,
    value,
    error,
    loadedRequestId: generateUuidV4(),
    timestamp: Date.now()
  };
}
