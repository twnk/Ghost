const _ = require('lodash');
const yup = require('yup');
const i18n = require('../../../shared/i18n');
const errors = require('@tryghost/errors');

const schema = yup.object({
    path: yup.string().required(),
    headers: yup.array().of(yup.object({
        name: yup.string().required(),
        value: yup.string().required()
    }).required().noUnknown()).required()
}).noUnknown();

/**
 * Validates the processed YAML 
 */
const validate = (headerConf) => {
    schema.validate(headerConf).catch(err => {
        throw new errors.ValidationError({
            message: i18n.t('errors.api.headers.invalidFile'),
            context: headerConf,
            help: 'https://github.com/TryGhost/Ghost/issues/11084' // @TODO: Ghost Docs
        });
    });
};

module.exports.validate = validate;
