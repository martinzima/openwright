import { FormlyExtension, FormlyFieldConfig, ConfigOption } from '@ngx-formly/core';
import { FormFieldWrapperComponent } from './wrappers/form-field.wrapper';

export const formlyWrappers = {
  wrappers: [
    {
      name: 'form-field-custom',
      component: FormFieldWrapperComponent,
    },
  ],
};

class ReplaceFormFieldWrapperExtension implements FormlyExtension {
  postPopulate(field: FormlyFieldConfig): void {
    if (field.wrappers?.includes('form-field')) {
      field.wrappers = field.wrappers.map((x) => (x === 'form-field' ? 'form-field-custom' : x));
    }
    // Add default wrapper if none is specified and it's not a field group or other non-input type
    else if (!field.wrappers && !field.fieldGroup && field.type && !field.props?.['appearance']) {
      // Avoid adding wrapper to things like dividers or custom templates without an appearance
      field.wrappers = ['form-field-custom'];
    }
  }
}

export function registerReplaceFormFieldWrapperExtension(): ConfigOption[] {
  return [
    {
      extensions: [
        {
          name: 'replace-form-field-wrapper',
          extension: new ReplaceFormFieldWrapperExtension(),
        },
      ],
    },
  ];
}
