const { program } = require('commander');
const localKeys = require('./service-keys');
const chalk = require('chalk');

require('dotenv-flow').config();

const AUTH_HUB_API_TOKEN = process.env.AUTH_HUB_API_TOKEN;
const AUTH_HUB_URL = process.env.AUTH_HUB_URL;
const APPMIXER_API_TOKEN = process.env.APPMIXER_API_TOKEN;
const APPMIXER_API_URL = process.env.APPMIXER_API_URL;
const CURRENT_ENV = process.env.ENV_NAME;

const authHubApi = require('./appmixer-api')({ token: AUTH_HUB_API_TOKEN, url: AUTH_HUB_URL });
const appmixerApi = require('./appmixer-api')({ token: APPMIXER_API_TOKEN, url: APPMIXER_API_URL });

const localSources = require('./local-sources');
const { getMetaData } = require('./service-keys');
const KEYS_BASE_PATH = './connectors';
const AVAILABLE_ENVS = ['QA', 'PROD', 'STG'];
const SRC_PATH = (process.env.SRC_PATH || '../appmixer-components/src;../appmixer-connectors/src').split(';');
const dump = async function(serviceId, options) {

    const opt = { environment: CURRENT_ENV, keysBasePath: KEYS_BASE_PATH };
    if (!AVAILABLE_ENVS.includes(CURRENT_ENV)) {
        throw new Error(`Invalid environment name (<env>). Available environments: ${AVAILABLE_ENVS.join(', ')}`);
    }

    const json = await localKeys.get(serviceId, opt);

    console.log(chalk.yellow(serviceId));
    console.log(chalk.yellow('ENV'), CURRENT_ENV);
    console.log(chalk.yellow('Local Keys'), localKeys.src(serviceId, opt));
    console.log(json);

    console.log(chalk.yellow('--------------------------------'));
    console.log(chalk.yellow('Auth Hub'), AUTH_HUB_URL);
    console.log((await authHubApi.getServiceConfig(serviceId, json)).data);

    const zipBundle = (await authHubApi.download(serviceId.replace(':', '.'), json));
    if (zipBundle.status !== 200) {
        console.log(chalk.redBright('Auth hub zip bundle is not uploaded!'));
        console.log(zipBundle.data);
    } else {
        console.log('Auth hub zip bundle:', chalk.green('OK'));
    }

    console.log(chalk.yellow('--------------------------------'));
    console.log(chalk.yellow('Backoffice config'), APPMIXER_API_URL);
    console.log((await appmixerApi.getServiceConfig(serviceId, json)).data);

    console.log(chalk.yellow('--------------------------------'));
    console.log(chalk.yellow('zip'), appmixerApi.getZip(serviceId));
};

program
    .command('list')
    .option('-b, --store-backoffice', 'store configurations to local keys.')
    .description('list all service configurations and renders the results in the table.')
    .action(async (options) => {

        const opt = { environment: CURRENT_ENV, keysBasePath: KEYS_BASE_PATH };

        const localServices = await localSources.list(SRC_PATH);
        const stats = [];

        for (let { connectorPath, serviceIds } of localServices) {

            for (let service of serviceIds) {

                const { isOauth } = await localSources.getAuth(service, SRC_PATH);

                const { data } = await authHubApi.getServiceConfig(service, opt);
                const { data: backoffice } = await appmixerApi.getServiceConfig(service, opt);
                const isEmpty = !data || Object.keys(data).length === 0;
                const isBackofficeEmpty = !backoffice || backoffice && Object.keys(backoffice).length === 0;

                if (options.storeBackoffice) {
                    await localKeys.update(service, data, opt);
                }

                const metadata = await getMetaData(service, data, opt);
                if (isOauth)
                    stats.push({
                        service,
                        requireVerification: metadata.requireVerification,
                        verificationStatus: metadata.verificationStatus,
                        OAuth: isOauth ? 'X' : ' ',
                        'Auth Hub': !isEmpty ? JSON.stringify(data).substring(0, 40) + '...' : 'n/a',
                        'Backoffice': !isBackofficeEmpty ? JSON.stringify(backoffice).substring(0, 40) + '...' : 'n/a',
                    });
            }
        }

        console.table(stats);

        // stats.forEach(item => {
        //     const line = Object.keys(item).reduce((res, key) => {
        //         res += `${item[key]} ;`;
        //
        //         return res;
        //     }, '');
        //     console.log(line);
        // });

        console.log(chalk.greenBright('ENV'), CURRENT_ENV);

    });

program
    .command('set-authub <service>')
    .option('-d, --delete', 'delete backoffice configuration')
    .description('Set the configuration of a service in Auth Hub.')
    .action(async (serviceId, options) => {

        if (!AVAILABLE_ENVS.includes(CURRENT_ENV)) {
            throw new Error(`Invalid environment name (<env>). Available environments: ${AVAILABLE_ENVS.join(', ')}`);
        }

        const json = await localKeys.get(serviceId, { environment: CURRENT_ENV, keysBasePath: KEYS_BASE_PATH });

        // set config
        await authHubApi.setServiceConfig(serviceId, json);

        // upload zip
        const rs = await authHubApi.upload(serviceId);
        const { ticket } = rs.data;

        await callUploadStatus(ticket);

        if (options.delete) {
            console.log(chalk.yellowBright(`Deleting ${serviceId} from backoffice`));
            await appmixerApi.deleteServiceConfig(serviceId);
        }

        console.log(chalk.bgGreenBright(`Service ${serviceId} updated in Auth Hub`));

        await dump(serviceId);
    });

const callUploadStatus = function(ticket) {
    const maxCount = 10;
    return new Promise((resolve) => {
        let count = 0;
        const intervalId = setInterval(async () => {
            if (count < maxCount) {
                const status = await authHubApi.uploadStatus(ticket);
                console.log(status.data);
                if (status.data.finished) {
                    clearInterval(intervalId);
                    resolve();

                }
                count++;
            } else {
                clearInterval(intervalId);
                resolve();
            }
        }, 1000);
    });
};

program
    .command('set-backoffice <service>')
    .action(async (serviceId, options) => {

        if (!AVAILABLE_ENVS.includes(CURRENT_ENV)) {
            throw new Error(`Invalid environment name (<env>). Available environments: ${AVAILABLE_ENVS.join(', ')}`);
        }

        const json = await localKeys.get(serviceId, { environment: CURRENT_ENV, keysBasePath: KEYS_BASE_PATH });

        // set config
        await appmixerApi.setServiceConfig(serviceId, json);

        console.log(chalk.bgGreen(`Service ${serviceId} updated in Backoffice`));
        console.log('\n');
        await dump(serviceId);
    });

program
    .command('dump <service>')
    .action(dump);

program.parse(process.argv);



