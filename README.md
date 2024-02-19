## Configuration

### Environment variables
Each environment has its own `.env` file. Check the .env.sample file for the required environment variables and its description.

### Connector Packages
Required for the `set-authub` command.  
Auth Hub requires the connector package to be uploaded with the configuration. This app tries to find the connector package in the src folder, in the `dist` subfolder. If the connector package is not found, the app will throw an error.


## Concept

The app can read and write the backoffice configurations as well as the Auth Hub configurations. The `list` action is one of the batch operations for which the local sources (determined by the `SRC_PATH` environment variable) identify the services available for execution.   

## Running the app

set the `NODE_ENV` env variable to select which environment to run the app for.   
for instance `NODE_ENV=qa node index.js` will run the app for the qa environment.

example
`NODE_ENV=qa node index.js list -b` will list the available services for the qa environment and store the configurations to the local keys (`/connetors` folder by default).



