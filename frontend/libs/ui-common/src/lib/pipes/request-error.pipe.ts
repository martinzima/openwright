import { HttpErrorResponse } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

export function getRequestErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error?.error === 'string') {
      if (error.error.error.includes('EntityNotFoundException')) {
        return 'Record not found. It was probably removed in the meantime.';
      }
    }

    if (error.status === 0
      || (error.status === 504 && error.headers.keys().length === 0) /* network error produced by service worker */) {
      return 'Failed to contact server. Please check your connection.';
    }
  }

  return 'An unknown error occurred while processing the request.';
}

@Pipe({
  name: 'requestError'
})
export class RequestErrorPipe implements PipeTransform {
  transform(value: any): string {
    return getRequestErrorMessage(value);
  }
}
