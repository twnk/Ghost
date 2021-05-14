const _ = require('lodash');
const i18n = require('../../../shared/i18n');
const errors = require('@tryghost/errors');

/**
 * Redirects are file based at the moment, but they will live in the database in the future.
 * See V2 of https://github.com/TryGhost/Ghost/issues/7707.
 */
const validate = (headerConf) => {
    if (!_.isArray(headerConf)) {
        throw new errors.ValidationError({
            message: 'isArray', // i18n.t('errors.utils.redirectsWrongFormat'), // @TODO: Error Type
            help: 'https://github.com/TryGhost/Ghost/issues/11084' // @TODO: Ghost Docs
        });
    }

    _.each(headerConf, function (headerConf) {
        if (!headerConf.path || !headerConf.headers) {
            throw new errors.ValidationError({
                message: 'has path and headers', // i18n.t('errors.utils.redirectsWrongFormat'), // @TODO: Error Type
                context: redirect,
                help: 'https://github.com/TryGhost/Ghost/issues/11084' // @TODO: Ghost Docs
            });
        }

        _.each(headerConf.headers, function (header) {
            if (!header.name || !header.value) {
                throw new errors.ValidationError({
                    message: 'each headers has name and value', // i18n.t('errors.utils.redirectsWrongFormat'), // @TODO: Error Type
                    context: redirect,
                    help: 'https://github.com/TryGhost/Ghost/issues/11084' // @TODO: Ghost Docs
                });
            }
        })
    });
};

module.exports.validate = validate;
