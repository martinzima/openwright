import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'ow-form-field-wrapper',
  template: `
    <div class="pb-4">
      <label
        *ngIf="props.label && props['hideLabel'] !== true"
        [attr.for]="id"
        class="block text-color text-sm font-medium mb-2"
      >
        {{ props.label }}
        @if (props.required && props['hideRequiredMarker'] !== true) {
          <span class="text-red-500">*</span>
        }
      </label>
      <ng-template #fieldComponent></ng-template>
      @if (showError) {
        <div class="mt-1 text-sm text-red-600">
          <formly-validation-message [field]="field"></formly-validation-message>
        </div>
      }
      @if (props.description) {
        <small class="text-muted-color mt-1 block">{{ props.description }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormlyModule],
})
export class FormFieldWrapperComponent extends FieldWrapper {}