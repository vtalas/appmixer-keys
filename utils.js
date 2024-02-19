const axios = require('axios');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs/promises');
const path = require('path');

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

async function getConnectorFolders(path) {

    return getFilesFiltered(path, function(dirent, res, directory) {

        if (dirent.isFile && dirent.name === 'service.json') {
            return directory;
        }
    });
}

async function getServices(connectorPath) {

    const components = await getFilesFiltered(connectorPath, function(dirent, res, directory) {

        if (dirent.isFile && dirent.name === 'component.json') {
            return { file: res, folder: directory };
        }
    });

    const services = {};
    for (let item of components) {

        const { file, folder } = item;

         // (path.basename(connectorPath) === path.basename(folder)) ? services.root = file : services[path.basename(folder)] = file;


        const json = JSON.parse(await fs.readFile(file, { encoding: 'utf8' }));

        if (json?.auth?.service) {
            services[json?.auth?.service] = file;
        }
    }

    return Object.keys(services);
    // return services;
}

const rq = async function({
                              url,
                              method = 'get',
                              data = {},
                              token
                          }) {

    return axios({
        url,
        method,
        data: { ...data },
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(response => {
        return response;
    }).catch(err => {
        console.log('err');
        console.log('ERR RESPONSE DATA', err?.response?.data);
        process.exit(1);
    });
};

module.exports = {
    rq, getFilesFiltered,
    getConnectorFolders, getServices
};