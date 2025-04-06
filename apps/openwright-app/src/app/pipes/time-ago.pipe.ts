import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to display a date as "X time ago".
 * Basic implementation, consider a library like date-fns for i18n and edge cases.
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) return '';

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
    }

    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000));
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.416); // Average month length
    const years = Math.round(days / 365);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }
} 