import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, RoomManipulator } from "@panoptyk/core";
import { FactionManipulator } from "@panoptyk/core";
import { info } from "console";

// Usage: npx ts-node botTemplate.ts <username> <password> <server_ip>

// #region Boilerplate_setup
// Boilerplate agent code ================================================== START
const username = process.argv[2] ? process.argv[2] : "stationaryBot";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in
const ACT_INTERVAL = 2000; // ms before act() is called again(possibly)
const logger = Util.logger; // Alias logger

let curKnowledgeIdx = 0;

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    logger.silence();
    address ? ClientAPI.init(address, 1) : ClientAPI.init();
    attemptLogin();
}

function moveToRoom1() {
    const rooms: Room[] = ClientAPI.playerAgent.room.adjacentRooms;
    const roomSelected = rooms[0];

    setTimeout(async () => {
        await ClientAPI.moveToRoom(roomSelected)
            .then(res => console.log(
                `move to room: ${roomSelected}`
            ))
            .catch(error => console.log(`failed to move to room: ${roomSelected} with error msg: ${JSON.stringify(error)}`));  
    }, 1000);
}

function tellObservation() {
    setTimeout(() => {
        // tell knowledge

        let infos = ClientAPI.playerAgent.knowledge;
        
        const infoSelected = infos.slice(curKnowledgeIdx);
        
        infoSelected.forEach((info) => console.log(info.getTerms(false)));
        
        curKnowledgeIdx = infos.length; 

        console.log(`seen agents: ${ClientAPI.seenAgents}`);
    }, 2000);
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
                console.log(`-------------info update--------------${updates.Information}`);
            });
            
            moveToRoom1();

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
    tellObservation();
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
