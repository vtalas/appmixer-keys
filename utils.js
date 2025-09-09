const axios = require('axios');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs/promises');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

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


const executeCommand = async function(command, cwd) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        // console.log(command[0], command.slice(1));
        const child = spawn(command[0], command.slice(1), {
            cwd,
            stdio: 'pipe',
            shell: process.platform === 'win32',
        });

        let stdout = '';
        let stderr = '';

        console.log(`Executing command: ${command.join(' ')} in directory: ${cwd}`);
        child.stdout?.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (exitCode) => {
            const duration = Date.now() - startTime;
            resolve({
                exitCode,
                stdout,
                stderr,
                duration,
            });
        });

        child.on('error', (error) => {
            const duration = Date.now() - startTime;
            reject({
                exitCode: -1,
                stdout,
                stderr: stderr + '\n' + error.message,
                duration,
            });
        });
    });
};



module.exports = {
    executeCommand,
    rq, getFilesFiltered,
    getAuthServicesForConnector
};