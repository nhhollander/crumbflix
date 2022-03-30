/**
 * Crumbflix Media Library and Client Control Server.
 *
 * This application is responsible for providing media library and connected
 * client information.
 */

import {init as init_comms} from './comms';

function main() {
    console.log("Initializing Crumbflix server");

    console.log("Starting communication service");
    init_comms();
}


if(require.main === module) {
    main();
}