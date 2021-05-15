const headers = require('../../../frontend/services/headers');

module.exports = {
    docName: 'headers',

    download: {
        headers: {
            disposition: {
                type: 'yaml',
                value: 'headers.yaml'
            }
        },
        permissions: true, 
        response: {
            format: 'plain'
        },
        query() {
            return headers.settings.get();
        }
    },

    upload: {
        permissions: true, 
        headers: {
            cacheInvalidate: true
        },
        query(frame) {
            return headers.settings.setFromFilePath(frame.file.path);
        }
    }
};
