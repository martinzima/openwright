import { TestLocation } from "./test-location";

export interface TestError {
  message?: string;
  stack?: string;
  location?: TestLocation;
  snippet?: string;
} 