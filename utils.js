const axios = require('axios');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs/promises');
const chalk = require('chalk');

async function getFilesFiltered(dir, filter) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.reduce((result, dirent) => {

        const res = resolve(dir, dirent.name);
        let newVar = dirent.isDirectory() ? getFilesFiltered(res, filter) : filter(dirent, res, dir);

        if (newVar) {
            result.push(newVar);
        }
        return result;
    }, []));
    return Array.prototype.concat(...files);
}

async function getAuthServicesForConnector(connectorPath) {

    const components = await getFilesFiltered(connectorPath, function(dirent, res, directory) {

        if (dirent.isFile && dirent.name === 'component.json') {
            return { file: res, folder: directory };
        }
    });

    const authServicesMap = {};
    for (let item of components) {

        const { file, folder } = item;

        const json = JSON.parse(await fs.readFile(file, { encoding: 'utf8' }));

        if (json?.auth?.service) {
            authServicesMap[json?.auth?.service] = file;
        }
    }

    return Object.keys(authServicesMap);
}

const rq = async function({
                              url,
                              method = 'get',
                              data = {},
                              headers = {},
                              token
                          }) {

    console.log(chalk.gray(method.toUpperCase(), url));
    return axios({
        url,
        method,
        data,
        headers: {
            'Authorization': 'Bearer ' + token,
            ...headers
        }
    }).then(response => {
        return response;
    }).catch(err => {
        console.log(err.response.status);
        console.log('ERR RESPONSE DATA', err?.response?.data);
        process.exit(1);
    });
};

module.exports = {
    rq, getFilesFiltered,
    getAuthServicesForConnector
};