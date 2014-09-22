'use strict';

var defaults = require('lodash.defaults');

module.exports = function role(schema, options) {

  // Set the default options
  options = options || {};
  defaults(options, {
    roles: [],
    accessLevels: {},
    rolePath: 'role',
    rolesStaticPath: 'roles',
    accessLevelsStaticPath: 'accessLevels',
    hasAccessMethod: 'hasAccess'
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
    // if nothing is passed, then return true
    if (typeof accessLevel === 'undefined') { return true; }
    var validRoles = options.accessLevels[accessLevel];
    // if there is nothing in the access levels for the given accessLevel, then
    // the return false.
    if (!validRoles) { return false; }
    var userRole   = this.get(options.rolePath);
    return validRoles.indexOf(userRole) !== -1;
  });

};
