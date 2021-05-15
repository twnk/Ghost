const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const yaml = require('js-yaml');
const Promise = require('bluebird');
const validation = require('./validation');

const config = require('../../../shared/config');
const i18n = require('../../../shared/i18n');
const errors = require('@tryghost/errors');


/**
 * Headers object
 * @typedef {Object} HeaderConfig
 * @property {String} path - Express-compatible path String
 * @property {Header[]} headers - List of Header Objects
 */

/**
 * Header object
 * @typedef {Object} Header
 * @property {String} name - Defines the header name, e.g. 'Content-Security-Policy'
 * @property {String} value - Defines the header value
 */

const readHeadersFile = (headersPath) => {
    return fs.readFile(headersPath, 'utf-8')
        .catch((err) => {
            if (err.code === 'ENOENT') {
                return Promise.resolve([]);
            }

            if (errors.utils.isIgnitionError(err)) {
                throw err;
            }

            throw new errors.NotFoundError({
                err: err
            });
        });
};

/**
 *
 * @param {String} content serialized YAML configuration
 *
 * @returns {HeaderConfig[]} of parsed header config objects
 */
const parseHeadersFile = (content) => {
    let headerConf = [];
    let configYaml = yaml.load(content);

    // yaml.load passes almost every yaml code.
    // Because of that, it's hard to detect if there's an error in the file.
    // But one of the obvious errors is the plain string output.
    // Here we check if the user made this mistake.
    if (typeof configYaml === 'string') {
        throw new errors.BadRequestError({
            message: i18n.t('errors.api.headers.yamlParse'),
            help: 'https://github.com/TryGhost/Ghost/issues/11084' // @TODO: Ghost Docs
        });
    }

    /**
     * Iterate Paths
     */
    for (const path in configYaml) {
        let headerSet = {
            path: path,
            headers: []
        };
        /**
         * Iterate header pairs
         */
        for (const [name, value] of Object.entries(configYaml[path])) {
            headerSet.headers.push({
                name: name,
                value: value
            }) 
        }
        
        headerConf.push(headerSet);
    }

    return headerConf;

};

const createHeadersFilePath = () => {
    return path.join(config.getContentPath('data'), 'headers.yaml');
};

const getHeadersFilePath = async () => {
    const yamlPath = createHeadersFilePath();

    const yamlExists = await fs.pathExists(yamlPath);

    if (yamlExists) {
        return yamlPath;
    }

    return null;
};

const getCurrentHeadersFilePathSync = () => {
    const yamlPath = createHeadersFilePath();

    if (fs.existsSync(yamlPath)) {
        return yamlPath;
    }

    return null;
};

const getBackupHeadersFilePath = (filePath) => {
    const {dir, name, ext} = path.parse(filePath);

    return path.join(dir, `${name}-${moment().format('YYYY-MM-DD-HH-mm-ss')}${ext}`);
};

const setFromFilePath = (filePath) => {
    return getHeadersFilePath()
        .then((headersFilePath) => {
            if (!headersFilePath) {
                return null;
            }

            const backupHeadersPath = getBackupHeadersFilePath(headersFilePath);

            return fs.pathExists(backupHeadersPath)
                .then((backupExists) => {
                    if (!backupExists) {
                        return null;
                    }

                    return fs.unlink(backupHeadersPath);
                })
                .then(() => {
                    return fs.move(headersFilePath, backupHeadersPath);
                });
        })
        .then(() => {
            return readHeadersFile(filePath)
                .then((content) => {
                    return parseHeadersFile(content);
                })
                .then((content) => {
                    validation.validate(content);
                    return fs.copy(filePath, createHeadersFilePath('.yaml'));
                });
        });
};

const defaultHeadersContent = '';

const get = () => {
    return getHeadersFilePath().then((filePath) => {
        if (filePath === null) {
            return defaultHeadersContent;
        }

        return readHeadersFile(filePath);
    });
};

/**
 * Syncrounously loads current oncifg file and parses it's content
 *
 * @returns {{HeaderConfig[]}} of parsed header configurations
 */
const loadHeadersFile = () => {
    const filePath = getCurrentHeadersFilePathSync();

    if (filePath === null) {
        return defaultHeadersContent;
    }

    const content = fs.readFileSync(filePath);

    return parseHeadersFile(content);
};

module.exports.get = get;
module.exports.setFromFilePath = setFromFilePath;
module.exports.getHeadersFilePath = getHeadersFilePath;
module.exports.loadHeadersFile = loadHeadersFile;
