const { rq } = require('./utils');
const { URL } = require('url');
const fs = require('fs');
const { getZip } = require('./service-keys');

const getConfig = ({ url, token }) => {

    return (service) => {
        return rq({
            url: new URL(`/service-config/${service}`, url).toString(),
            token
        });
    };
};
const download = ({ url, token }) => {

    return (service) => {
        return rq({
            url: new URL(`/components/${service}`, url).toString(),
            token
        });
    };
};
const deleteConfig = ({ url, token }) => {

    return (service) => {
        return rq({
            method: 'DELETE',
            url: new URL(`/service-config/${service}`, url).toString(),
            token
        });
    };
};
const setServiceConfig = ({ url, token }) => {

    return (service, data) => {

        return rq({
            method: 'PUT',
            url: new URL(`/service-config/${service}`, url).toString(),
            data,
            token
        });
    };
};

const upload =  ({ url, token }) => {

    return async (serviceId) => {

        const zipPath = getZip(serviceId);

        console.log('Uploading zip bundle:', zipPath);
        return await rq({
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            url: new URL(`/components?replaceAll=true`, url).toString(),
            data: fs.createReadStream(zipPath),
            token
        });
    };
};

const uploadStatus =  ({ url, token }) => {

    return async (ticket) => {

        return await rq({
            url: new URL(`/components/uploader/${ticket}`, url).toString(),
            token
        });
    };
};

module.exports = ({ url, token }) => {

    console.assert(url, 'url is required');
    console.assert(token, 'api token is required');

    return {
        setServiceConfig: setServiceConfig({ url, token }),
        getServiceConfig: getConfig({ url, token }),
        deleteServiceConfig: deleteConfig({ url, token }),
        upload: upload({ url, token }),
        download: download({ url, token }),
        uploadStatus: uploadStatus({ url, token }),
        getZip,
    };
};


