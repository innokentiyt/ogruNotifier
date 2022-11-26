const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const commonFiles = ["icons/ogru-32.png", "icons/ogru-48.png"];

const copyPluginCommonFilesPatterns = commonFiles.map((commonFile) => [
    {
        from: `./src/${commonFile}`,
        to: `./chrome/${commonFile}`,
    },
    {
        from: `./src/${commonFile}`,
        to: `./firefox/${commonFile}`,
    },
]).flat();

const copyPluginManifestsPatterns = [
    {
        from: "./src/manifest_V3.json",
        to: "./chrome/manifest.json",
    },
    {
        from: "./src/manifest_V2.json",
        to: "./firefox/manifest.json",
    },
];

const copyScriptPatterns = [
    {
        from: "./src/script.js",
        to: "./chrome/service-worker.js",
    },
    {
        from: "./src/script.js",
        to: "./firefox/background-script.js",
    },
];

module.exports = {
    entry: {},
    output: {},
    mode: 'none',

    plugins: [
        new CopyPlugin({
            patterns: [].concat(copyPluginCommonFilesPatterns, copyPluginManifestsPatterns, copyScriptPatterns)
        }),
    ],
};
