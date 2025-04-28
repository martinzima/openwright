import { Organization } from "../../organizations/model/organization";
import { UserRole } from "./user-role";

export interface UserRoleGrant {
  id: string;
  role: UserRole;
  organization: Organization;
}
