-- OpenWright view SQL baseline schema
-- dependencies: ow-create

CREATE OR REPLACE VIEW ow_user_view
AS
SELECT * FROM ow_user;

CREATE OR REPLACE VIEW ow_user_role_grant_view
AS
SELECT * FROM ow_user_role_grant;

CREATE OR REPLACE VIEW ow_organization_view
AS
SELECT * FROM ow_organization;