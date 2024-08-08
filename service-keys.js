const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

async function updateJsonFile(filePath, newContent) {

    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(await fs.readFileSync(filePath, 'utf8'));
    }

    const updatedData = { ...data, ...newContent };
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, '  '), { encoding: 'utf8' });
}

function ensureFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

function getZip(serviceId) {

    const zip = `${serviceId.replaceAll(':', '.')}.zip`;

    let distFolder = `../appmixer-connectors/dist`;

    if (fs.existsSync(`${distFolder}/${zip}`)) {
        return `${distFolder}/${zip}`;
    }

    distFolder = `../appmixer-components/dist`;

    if (fs.existsSync(`${distFolder}/${zip}`)) {
        return `${distFolder}/${zip}`;
    }

    throw new Error(`Zip file not found: ${distFolder}/${zip}`);
}

const get = async function(service, { environment = 'QA', keysBasePath } = {}) {

    const configFilePath = src(service, { environment, keysBasePath });
    if (!fs.existsSync(configFilePath)) {
        throw new Error(`local key config file not found: ${configFilePath} for service ${service}`);
    }
    data = JSON.parse(await fs.readFileSync(configFilePath, 'utf8'));

    return data;
};

const getMetaData = async function(service, data, { keysBasePath } = {}) {
    const servicePath = path.join(keysBasePath, service.replaceAll(':', '/'));
    const metadataPath = path.join(servicePath, `metadata.json`);

    let metadata = {}
    if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(await fs.readFileSync(metadataPath, 'utf8'));
    }

    return metadata;
};

const update = async function(service, data, { environment = 'QA', keysBasePath } = {}) {

    const servicePath = path.join(keysBasePath, service.replaceAll(':', '/'));
    ensureFolder(servicePath);
    const configFilePath = src(service, { environment, keysBasePath });
    await updateJsonFile(configFilePath, data);
    console.log(chalk.yellow(`Stored ${service} configuration in ${configFilePath}`));
};

const src = function(service, { environment = 'QA', keysBasePath } = {}) {
    const servicePath = path.join(keysBasePath, service.replaceAll(':', '/'));
    return path.join(servicePath, `config.${environment}.json`);
};

module.exports = { get, update, src, getZip, getMetaData };