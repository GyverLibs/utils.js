var path = require('path');

module.exports = {
    entry: './utils.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'utils.js',
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true
    },
    mode: "production",
};