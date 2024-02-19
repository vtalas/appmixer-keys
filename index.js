const { program } = require('commander');
const path = require('path');

const AUTH_HUB_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImFkbWluIiwiaWF0IjoxNzA0NzkzNzE3fQ.TQgZxkxrSK5uCTeBdHcX6WeQ8UpP-7J20Vu8Fzh5RN0';
const AUTH_HUB_URL = 'https://auth-hub.qa.appmixer.com';

const { getConfig, x } = require('./config')({ token: AUTH_HUB_API_TOKEN, authHubUrl: AUTH_HUB_URL });
const { getConnectorFolders, getServices } = require('./utils');

program
    .command('list-services <path>')
    .description('TBD')
    .action(async (xxx, options) => {

        const connectors = await getConnectorFolders(xxx);

        const res = {};
        for (let connector of connectors) {

            const services = await getServices(connector);

            const serviceName = path.basename(connector);
            const vendor = path.basename(path.dirname(connector));

            res[vendor] = res[vendor] || {};
            res[vendor][serviceName] = services;

        }
        console.log(res);
    });

// program
//     .option('-d, --debug', 'output extra debugsging')
//     .option('-s, --service <service>', 'appmixer:hubspot')
//     .command('xxx <path>')
//     .on('--help', () => {
//         console.log('');
//         console.log('Example call:');
//         console.log('  $ custom-help --small --pizza-type "spicy"');
//     })
//         .action(async function({
//                                    listServices,
//                                small,
//                                pizzaType
//                            }) {
//
//         const options = program.opts();
//
//         console.log(arguments);
//         // const { data } = await getConfig(service);
//
//         const data = await x('./connectors', function(dirent, res) {
//
//             if (dirent.isFile && dirent.name === 'config.js') {
//                 return res;
//             }
//         });
//
//         console.log(options);
//
//         switch (options) {
//             case 'l':
//                 console.log('appmixer:hubspot');
//                 break;
//             default:
//                 console.log('Unknown service');
//         }
//
//         console.log(data);
//     });

program.parse(process.argv);
