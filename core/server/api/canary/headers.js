const path = require('path');

const web = require('../../web');
const headers = require('../../../frontend/services/headers');

module.exports = {
    docName: 'headers',

    download: {
        headers: {
            disposition: {
                type: 'file',
                value() {
                    return headers.settings.getHeadersFilePath()
                        .then((filePath) => {
                            return filePath === null || 'headers.yaml';
                        });
                }
            }
        },
        permissions: false, // @TODO permissions
        response: {
            async format() {
                const filePath = await headers.settings.getHeadersFilePath();

                return filePath === null || 'plain';
            }
        },
        query() {
            return headers.settings.get();
        }
    },

    upload: {
        permissions: false, // @TODO permissions
        headers: {
            cacheInvalidate: true
        },
        query(frame) {
            return headers.settings.setFromFilePath(frame.file.path);
            /*
                .then(() => {
                    // CASE: trigger that headers are getting re-registered
                    web.shared.middlewares.customHeaders.reload();
                });*/
        }
    }
};
