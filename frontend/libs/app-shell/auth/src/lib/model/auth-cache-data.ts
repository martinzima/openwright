import { Me } from "@openwright/web-api";

export interface AuthCacheData {
  schemaVersion: number;
  me: Me;
}
