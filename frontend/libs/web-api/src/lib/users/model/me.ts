import { User } from "./user";
import { UserRoleGrant } from "./user-role-grant";

export interface Me {
  emailAddress: string;
  authScheme: string;

  user: User | null;
  roleGrants: UserRoleGrant[] | null;
}
