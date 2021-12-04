import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util } from "@panoptyk/core";

// Usage: npx ts-node botTemplate.ts <username> <password> <server_ip>

// #region Boilerplate_setup
// Boilerplate agent code ================================================== START
const username = process.argv[2] ? process.argv[2] : "idle";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in
const ACT_INTERVAL = 250; // ms before act() is called again(possibly)
const logger = Util.logger; // Alias logger

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    logger.silence();
    address ? ClientAPI.init(address) : ClientAPI.init();
    attemptLogin();

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

function randomRoom(): Room {
    let rooms = ClientAPI.playerAgent.room.adjacentRooms;
    return rooms[Math.floor(rooms.length * Math.random())];
}

const WAIT_TIME = 3000;
let waitTime = 0;
let lastMove = 0;

async function act() {
    if (ClientAPI.canAct() && Date.now() - lastMove > waitTime) {
        const room = randomRoom();
        let res = await ClientAPI.moveToRoom(room);
        if (res.success) {
            console.log(`Agent moved to Room: ${room}`);
            lastMove = Date.now();
            waitTime = 500 + Math.random() * WAIT_TIME;
        }
    }
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
