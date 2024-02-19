const { getConnectorFolders, getAuthServicesForConnector, getFilesFiltered } = require('./utils');
const path = require('path');
const fs = require('fs/promises');
const fsx = require('fs');

const getConnectorPaths = async function(location) {
    return getFilesFiltered(location, (dirent, res, directory) => {
        if (dirent.isFile && dirent.name === 'service.json') {
            return directory;
        }
    });
};

module.exports = {

    // listServices: async function(connectorsFolderPath) {
    //
    //     const connectors = await getConnectorFolders(connectorsFolderPath);
    //
    //     const res = {};
    //     for (let connector of connectors) {
    //
    //         const services = await getAuthServicesForConnector(connector);
    //
    //         const serviceName = path.basename(connector);
    //         const vendor = path.basename(path.dirname(connector));
    //
    //         res[vendor] = res[vendor] || {};
    //         res[vendor][serviceName] = services;
    //     }
    //
    //     return res;
    // },

    listServices: async function(connectorsFolderPath) {

        const connectorPaths = await getConnectorPaths(connectorsFolderPath);

        let res = [];
        for (let connectorPath of connectorPaths) {
            const services = await getAuthServicesForConnector(connectorPath);
            res = res.concat(...services);
        }

        return res;
    },

    list: async function(connectorsBaseLocations) {

        let connectorPaths = [];
        for (let src of connectorsBaseLocations) {
            connectorPaths = connectorPaths.concat(await getConnectorPaths(src));
        }

        let res = [];
        for (let connectorPath of connectorPaths) {
            const serviceIds = await getAuthServicesForConnector(connectorPath);
            res.push({
                connectorPath,
                serviceIds
            });
        }

        return res;
    },

    getAuth: async function(serviceId, connectorsBaseLocations) {

        const authJs = path.join(serviceId.replaceAll(':', '/'), 'auth.js');
        const location = connectorsBaseLocations.find(baseLocation => {
            return fsx.existsSync(path.join(baseLocation, authJs));
        });

        if (!location) {
            throw new Error(`auth.js not found for service ${serviceId}`);
        }

        const authJsValidPath = path.join(location, authJs);
        const content = await fs.readFile(authJsValidPath, { encoding: 'utf8' });
        const oauthType = content.match(/type:.*oauth/g);

        return  {
            isOauth: Boolean(oauthType && oauthType.length > 0)
        };
    },

    listServiceKeys: async function(connectorKeysFolderPath, environemnt) {

        const configs = await getFilesFiltered(connectorKeysFolderPath, (dirent, res, directory) => {
            if (dirent.isFile && dirent.name === `config.${environemnt}.json`) {
                return res;
            }
        });

        // let res = [];
        // for (let connector of connectors) {
        //     const services = await getAuthServicesForConnector(connector);
        //     res = res.concat(...services);
        // }

        return configs;
    }
};