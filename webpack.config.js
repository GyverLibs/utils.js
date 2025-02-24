module.exports = {
    entry: './utils.js',
    output: {
        path: __dirname,
        filename: 'utils.min.js',
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true
    },
    mode: "production",
};