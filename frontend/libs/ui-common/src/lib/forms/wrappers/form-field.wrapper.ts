import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'ow-form-field-wrapper',
  template: `
    <div class="flex flex-col gap-1 pb-4">
      <label
        *ngIf="props.label && props['hideLabel'] !== true"
        [attr.for]="id"
        class="text-color font-medium leading-6 block">
        {{ props.label }}
        @if (props.required && props['hideRequiredMarker'] !== true) {
          <span class="text-red-500">*</span>
        }
      </label>
      <div class="control">
        <ng-template #fieldComponent></ng-template>
      </div>
      @if (showError) {
        <p-message severity="error" variant="simple" size="small" class="mt-1">
          <formly-validation-message [field]="field"></formly-validation-message>
        </p-message>
      }
      @if (props.description) {
        <small class="text-muted-color block mt-1">{{ props.description }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormlyModule, MessageModule],
  styles: `
    :host {
      ::ng-deep .control > *:first-child > *:first-child {
        width: 100%;
      }
    }
  `
})
export class FormFieldWrapperComponent extends FieldWrapper {}