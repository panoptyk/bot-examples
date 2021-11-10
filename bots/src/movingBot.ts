import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, RoomManipulator } from "@panoptyk/core";
import { FactionManipulator } from "@panoptyk/core";

// Usage: npx ts-node botTemplate.ts <username> <password> <server_ip>

// #region Boilerplate_setup
// Boilerplate agent code ================================================== START
const username = process.argv[2] ? process.argv[2] : "movingBot";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in
const ACT_INTERVAL = 2000; // ms before act() is called again(possibly)
const logger = Util.logger; // Alias logger

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    logger.silence();
    address ? ClientAPI.init(address, 1) : ClientAPI.init();
    attemptLogin();
}

function moveToRandomRoom() {
    const rooms: Room[] = ClientAPI.playerAgent.room.adjacentRooms;
    const roomSelected = rooms[getRandomInt(rooms.length)];

    console.log(`seen rooms: ${ClientAPI.seenRooms}`);
    

    setTimeout(async () => {
        await ClientAPI.moveToRoom(roomSelected)
            .then(res => console.log(
                `move to room: ${roomSelected} successfully`
            ))
            .catch(error => console.log(`failed to move to room: ${roomSelected} with error msg: ${JSON.stringify(error)}`));  
    }, 2000);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let _retries = 1;
function attemptLogin() {
    ClientAPI.login(username, password)
        .catch((res) => {
            console.log("Failed(%d)....retrying...", _retries);
            if (_retries <= MAX_RETRY) {
                _retries++;
                // tslint:disable-next-line: ban
                setTimeout(attemptLogin, RETRY_INTERVAL);
            }
        })
        .then((res) => {
            console.log("Logged in!");

            // tslint:disable-next-line: ban
            setTimeout(actWrapper, 100);

            ClientAPI.addOnUpdateListener((updates) => {
                console.log(`---------updates--------------\n${JSON.stringify(updates)}`);
            //    updates.Information.forEach(info => console.log(info));
            });
        });
}

let _acting = false;
let _endBot = false;
function actWrapper() {
    if (!_acting) {
        _acting = true;
        act()
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                _acting = false;
            });
    }
    if (!_endBot) {
        // tslint:disable-next-line: ban
        setTimeout(actWrapper, ACT_INTERVAL);
    }
}
// Boilerplate agent code ================================================== END
// #endregion
// set "_endBot" to true to exit the script cleanly

async function act() {
    moveToRandomRoom();
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
