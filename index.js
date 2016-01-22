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
  schema.method(options.hasAccessMethod, function (accessLevels) {
    var userRole = this.get(options.rolePath);
    return roleHasAccess(userRole, accessLevels);
  });

  // Set the roleHasAccess method
  schema.static(options.roleHasAccessMethod, roleHasAccess);

  function roleHasAccess(role, accessLevels) {
    if (typeof accessLevels === 'undefined') { return true; }
    accessLevels = [].concat(accessLevels);
    var validLevels = accessLevels.map(function(level) {
      var roles = options.accessLevels[level] || [];
      return roles.indexOf(role) !== -1;
    });
    // if at least one access level isn't defined or the role doesn't exists
    // for every access level passed, it returns false;
    return (validLevels.indexOf(false) !== -1) === false;
  }
};
