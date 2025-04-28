export function generateUuidV4(): string {
  // Basic RFC 4122 version 4 compliant UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // y values are 8, 9, A, or B
    return v.toString(16);
  });
}