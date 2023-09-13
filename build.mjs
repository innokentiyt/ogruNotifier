import * as fs from "node:fs";
import path from "node:path";

const distDir = "dist";
const srcDir = "src";

const commonFilesAndDirectories = [
    "icons/ogru-32.png",
    "icons/ogru-48.png",
    "options.html",
    "options.js",
    "_locales/"
];

const copyCommonPatterns = commonFilesAndDirectories.flatMap((commonFile) => [
    {
        from: `./${srcDir}/${commonFile}`,
        to: `./${distDir}/chrome/${commonFile}`,
    },
    {
        from: `./${srcDir}/${commonFile}`,
        to: `./${distDir}/firefox/${commonFile}`,
    },
]);

const copyManifestsPatterns = [
    {
        from: `./${srcDir}/manifest_V3.json`,
        to: `./${distDir}/chrome/manifest.json`,
    },
    {
        from: `./${srcDir}/manifest_V2.json`,
        to: `./${distDir}/firefox/manifest.json`,
    },
];

const copyScriptPatterns = [
    {
        from: `./${srcDir}/script.js`,
        to: `./${distDir}/chrome/service-worker.js`,
    },
    {
        from: `./${srcDir}/script.js`,
        to: `./${distDir}/firefox/background-script.js`,
    },
];

const allPatterns = [].concat(copyCommonPatterns, copyManifestsPatterns, copyScriptPatterns);


console.log(`Clearing folder: ${distDir}`);

for (const fileOrDir of fs.readdirSync(distDir)) {
    fs.rmSync(path.join(distDir, fileOrDir), { recursive: true });
}

console.log(`Making distributions in folder: ${distDir}`);

allPatterns.forEach((pattern) => {
    fs.cpSync(pattern.from, pattern.to, { recursive: true });
});
