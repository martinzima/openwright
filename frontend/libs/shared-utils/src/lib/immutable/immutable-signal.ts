import { WritableSignal } from "@angular/core";
import { produce } from "immer";

export function mutate<T>(signal: WritableSignal<T>, mutator: (value: T) => void): void {
  signal.update(prev =>
    produce(prev, mutator)
  );
}
