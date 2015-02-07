'use strict';

var defaults = require('defaults');

module.exports = function role(schema, options) {

  // Set the default options
  options = options || {};
  defaults(options, {
    roles: [],
    accessLevels: {},
    rolePath: 'role',
    rolesStaticPath: 'roles',
    accessLevelsStaticPath: 'accessLevels',
    hasAccessMethod: 'hasAccess',
    roleHasAccessMethod: 'roleHasAccess'
  });

  // Set the role path
  schema
    .path(options.rolePath, String)
    .path(options.rolePath)
      .enum({values: options.roles})
      .required(true);

  // Expose the roles
  schema.static(options.rolesStaticPath, options.roles);
  schema.static(options.accessLevelsStaticPath, options.accessLevels);

  // Set the hasAccess method
  schema.method(options.hasAccessMethod, function (accessLevel) {
    var userRole = this.get(options.rolePath);
    return roleHasAccess(userRole, accessLevel);
  });

  // Set the roleHasAccess method
  schema.static(options.roleHasAccessMethod, roleHasAccess);

  function roleHasAccess(role, accessLevel) {
    if (typeof accessLevel === 'undefined') { return true; }
    var validRoles = options.accessLevels[accessLevel];
    // if there is nothing in the access levels for the given accessLevel, then
    // the return false.
    if (!validRoles) { return false; }
    return validRoles.indexOf(role) !== -1;
  }

};
