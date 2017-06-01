'use strict'

module.exports = function role (schema, options) {
  // Set the default options
  options = Object.assign(
    {
      roles: [],
      accessLevels: {},
      rolePath: 'role',
      rolesStaticPath: 'roles',
      accessLevelsStaticPath: 'accessLevels',
      hasAccessMethod: 'hasAccess',
      roleHasAccessMethod: 'roleHasAccess'
    },
    options
  )

  // Set the role path
  schema
    .path(options.rolePath, String)
    .path(options.rolePath)
    .enum({ values: options.roles })
    .required(true)

  // Expose the roles
  schema.static(options.rolesStaticPath, options.roles)
  schema.static(options.accessLevelsStaticPath, options.accessLevels)

  // Set the hasAccess method
  schema.method(options.hasAccessMethod, function (accessLevels) {
    var userRole = this.get(options.rolePath)
    return roleHasAccess(userRole, accessLevels)
  })

  // Set the roleHasAccess method
  schema.static(options.roleHasAccessMethod, roleHasAccess)

  function roleHasAccess (role, accessLevels) {
    if (typeof accessLevels === 'undefined') {
      return false
    }
    accessLevels = [].concat(accessLevels)

    // Goes through all access levels, and if any one of the access levels
    // doesn't exist in the roles, return false
    return !accessLevels.some(level => {
      var roles = options.accessLevels[level] || []
      return roles.indexOf(role) === -1
    })
  }
}
