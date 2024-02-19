const { rq, getFilesFiltered } = require('./utils');
const { URL } = require('url');

const setConfig = ({ authHubUrl, apiKey }) => {
    return (service) => rq({ url });
};

const getConfig = ({ authHubUrl, token }) => {

    return (service) => {
        let url = new URL(`/service-config/${service}`, authHubUrl).toString();
        return rq({ url, token });
    };
};

module.exports = ({ authHubUrl, token }) => {
    return {
        // getConfig: setConfig({ authHubUrl, apiKey })w,
        getConfig: getConfig({ authHubUrl, token })
    }
};


