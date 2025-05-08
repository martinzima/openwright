import { Component, input } from "@angular/core";
import { FormStoreBase } from "./form-store";
import { ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { RequestErrorPipe } from "../pipes/request-error.pipe";
import { MessageModule } from "primeng/message";

@Component({
  selector: 'ow-common-form',
  template: `
  @if (store()?.form) {
    <form [formGroup]="store()!.form!" (ngSubmit)="onSubmit()">
      <ng-content select="[header]"></ng-content>

      @if (store()!.error()) {
        <p-message severity="error" [text]="(store()!.error() | requestError) ?? 'Unknown error'" styleClass="mb-4" />
      }

      <formly-form [form]="store()!.form!" [model]="store()!.model()" [fields]="store()!.fields"
        (modelChange)="store()!.updateModel($event)">
      </formly-form>

      <ng-content select="[footer]"></ng-content>
    </form>
  }
  `,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    MessageModule,
    RequestErrorPipe
  ]
})
export class CommonFormComponent<TModel, TLoadedModel> {
  store = input<FormStoreBase<TModel, TLoadedModel>>();

  onSubmit() {
    this.store()?.submit();
  }
}
