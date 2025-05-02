import { FORMLY_CONFIG } from '@ngx-formly/core';

function registerTranslateExtension() {
  return {
    validationMessages: [
      {
        name: 'required',
        message() {
          return 'This field is required';
        },
      },
      {
        name: 'minlength',
        message(err: any, field: any) {
          return `Minimum length is ${field.templateOptions.minLength} characters`;
        },
      },
      {
        name: 'maxlength',
        message(err: any, field: any) {
          return `Maximum length is ${field.templateOptions.maxLength} characters`;
        },
      },
      {
        name: 'min',
        message(err: any, field: any) {
          return `Minimum value is ${field.templateOptions.min}`;
        },
      },
      {
        name: 'max',
        message(err: any, field: any) {
          return `Maximum value is ${field.templateOptions.max}`;
        }
      },
      {
        name: 'codeInvalid',
        message(err: any, field: any) {
          return 'Invalid code format';
        }
      },
      {
        name: 'notUniqueNames',
        message(err: any, field: any) {
          return 'Names must be unique';
        }
      }
    ]
  };
}

export const formlyTranslateExtensionProvider = {
  provide: FORMLY_CONFIG,
  multi: true,
  useFactory: registerTranslateExtension,
  deps: []
};
