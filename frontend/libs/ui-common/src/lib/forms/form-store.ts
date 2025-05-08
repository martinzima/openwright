import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { FormControlStatus, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { loadCompleteReduce, LoadedState, loadFailReduce, loadReduce, mutate, newLoadedState } from '@openwright/shared-utils';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface InitFormData<TModel> {
  defaultModel?: Partial<TModel>;
}

export interface FormState<TModel, TLoadedModel = void> {
  initData: InitFormData<TModel>;
  loading: LoadedState<TLoadedModel>;
  submitting: LoadedState<boolean>;
  model: TModel;
  isModelChanged: boolean;
  formStatus: FormControlStatus;
}

export interface FormStore<TModel> {
  isLoading: Signal<boolean>;
  isSubmitting: Signal<boolean>;
  error: Signal<unknown>;
  model: Signal<TModel>;
  isModelChanged: Signal<boolean>;
  formStatus: Signal<FormControlStatus>;
  submit: () => Promise<void>;
  updateModel: (model: TModel) => void;
}

@Injectable()
export abstract class FormStoreBase<TModel, TLoadedModel = void>
  implements FormStore<TModel> {
  private readonly _state = signal<FormState<TModel, TLoadedModel>>(this.getInitialState());
  private readonly _stateReadonly = this._state.asReadonly();
  private readonly destroyRef = inject(DestroyRef);

  protected _form?: FormGroup;

  readonly isLoading = computed(() => this._state().loading.isLoading);
  readonly isSubmitting = computed(() => this._state().submitting.isLoading);
  readonly error = computed(() => this._state().loading.error
    || this._state().submitting.error
    || null);
  readonly model = computed(() => this._state().model);
  readonly isModelChanged = computed(() => this._state().isModelChanged);
  readonly formStatus = computed(() => this._state().formStatus);

  abstract readonly fields: FormlyFieldConfig[];

  get form(): FormGroup | undefined {
    return this._form;
  }

  get state(): Signal<FormState<TModel, TLoadedModel>> {
    return this._stateReadonly;
  }

  constructor() {
    this.reset();
  }

  reset(): void {
    this._state.set(this.getInitialState());
    this.setupForm();
    this.load();
  }

  updateModel(model: TModel): void {
    const newModel = this.onModelChange(this._state(), model);
    this._state.update(prev => ({ ...prev, model: newModel }));
  }

  async submit(): Promise<void> {
    if (!this.form
      || this.isSubmitting()
      || !this.beforeValidate()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this._state.update(prev => ({ ...prev, submitting: loadReduce(prev.submitting) }));

    try {
      await this.doSubmit(this.model());
      this._state.update(prev => ({ ...prev, submitting: loadCompleteReduce(prev.submitting, true) }));
      this.afterSubmitSuccess(this.model());
    } catch (error) {
      this._state.update(prev => ({ ...prev, submitting: loadFailReduce(prev.submitting, error) }));
      this.afterSubmitFail(error);
    }
  }

  protected async doSubmit(model: TModel): Promise<void> {
    throw new Error('You should implement submitModel method');
  }

  protected getInitialState(): FormState<TModel, TLoadedModel> {
    return {
      initData: {
        defaultModel: undefined
      },
      loading: newLoadedState(),
      submitting: newLoadedState(),
      model: this.createEmptyModel() as TModel,
      isModelChanged: false,
      formStatus: 'VALID'
    };
  }

  protected onModelChange(state: FormState<TModel, TLoadedModel>, newModel: TModel): TModel {
    return newModel;
  }

  protected createEmptyModel(): TModel {
    return {} as TModel;
  }

  protected async loadModel(): Promise<TLoadedModel> {
    return null as TLoadedModel;
  }

  protected mapLoadedModel(loadedModel: TLoadedModel): Partial<TModel> {
    return {};
  }

  protected beforeValidate(): boolean {
    return true;
  }

  protected afterSubmitSuccess(model: TModel) {
    // override in subclasses
  }

  protected afterSubmitFail(error: unknown) {
    // override in subclasses
  }

  private setupForm(): void {
    this._form = new FormGroup({});
    this._form.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.updateFormStatus);
  }

  protected updateFormStatus = (status: FormControlStatus) => {
    this._state.update(prev => ({ ...prev, formStatus: status }));
  }

  private load = rxMethod<void>(
    pipe(
      tap(() => {
        mutate(this._state, prev => {
          prev.loading = loadReduce(prev.loading);
        });
      }),
      switchMap(() => this.loadModel()),
      tapResponse(
        (model) =>
          mutate(this._state, prev => {
            prev.loading = loadCompleteReduce(prev.loading, model);
            prev.model = {
              ...prev.model,
              ...this.mapLoadedModel(model)
            };
          }),
        (error) =>
          mutate(this._state, prev => {
            prev.loading = loadFailReduce(prev.loading, error);
          })
      )
    )
  );
}

