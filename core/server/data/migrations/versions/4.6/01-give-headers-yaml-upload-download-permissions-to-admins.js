const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Download headers',
        action: 'download',
        object: 'header'
    }, [
        'Administrator',
        'Admin Integration'
    ]),
    addPermissionWithRoles({
        name: 'Upload headers',
        action: 'upload',
        object: 'header'
    }, [
        'Administrator',
        'Admin Integration'
    ])
);