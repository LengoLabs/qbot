const utils = require('util');
const fetch = require('node-fetch');
const fs = require('fs/promises');

const exclusions = require('./config.js').updateSettings.exclusions;

const API_URL = "https://api.github.com/repos/yogurtsyum/qbot/contents";

let fileInfo = "";

async function getFiles(folder) {
    logData(`\nGetting files for ${folder}`);
    let files;
    try {
        let res = await fetch(`${API_URL}/${folder}`);
        files = await res.json();
    } catch(e) {
        throw e;
    }
    for(let i = 0; i < files.length; i++) {
        if(isFolder(files[i])) {
            try {
                await fs.mkdir(files[i].path, {recursive: true});
                await getFiles(files[i].path);
            } catch(e) {
                throw e;
            }
        } else {
            let name = files[i].path;
            if(!exclusions.find(v => v === name)) {
                try {
                    logData(`Writing file ${files[i].path}`);
                    let res = await fetch(files[i].download_url);
                    let fileContent = res.body;
                    await fs.writeFile(files[i].path, fileContent);
                } catch(e) {
                    throw e;
                }
            } else {
                logData(`Skipped file ${files[i].path}`);
            }
        }
    }
}

function logData(data) {
    console.log(data);
    fileInfo += `${data}\n`;
}

function isFolder(data) {
    if(data.download_url) {
        return false;
    } else {
        return true;
    }
}

getFiles("/").then(() => {
    logData("Successfully updated bot files");
    fs.writeFile('updateLog.txt', fileInfo).catch();
}).catch(e => {
    logData(`Oops! There was an error while attempting to update the bot files: ${e}`);
    fs.writeFile('updateLog.txt', fileInfo).catch();
});