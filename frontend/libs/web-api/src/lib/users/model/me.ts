import { TempAuthentication } from "./temp-authentication";
import { User } from "./user";
import { UserRoleGrant } from "./user-role-grant";

export interface Me {
  authScheme: string;

  user?: User;
  tempAuthentication?: TempAuthentication;
  roleGrants?: UserRoleGrant[];
}
