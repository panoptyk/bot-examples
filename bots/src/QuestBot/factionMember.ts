import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, Quest } from "@panoptyk/core";
import { defaultKB as KB, roomMap } from "../Shared/KnowledgeBase";
import { QuestStrategy } from "./Strategy/questStrategy";
// Usage: npx ts-node botTemplate.ts <username> <password> <server_ip>

// #region Boilerplate_setup
// Boilerplate agent code ================================================== START
const username = process.argv[2] ? process.argv[2] : "idle";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in
const ACT_INTERVAL = 2000; // ms before act() is called again(possibly)
const logger = Util.logger; // Alias logger

const roomsAdded = new Set();

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    logger.silence();
    address ? ClientAPI.init(address) : ClientAPI.init();

    ClientAPI.addOnUpdateListener((updates) => {
        updates.Information.forEach(info => {
            KB.collectInfo(info);
        });

        const curRoom = ClientAPI.playerAgent.room;
        if (curRoom && !roomsAdded.has(curRoom)) {
            roomsAdded.add(curRoom);
            roomMap.addRoom(curRoom);
            curRoom.adjacentRooms.forEach(neighbor => {
                roomMap.addRoom(neighbor);
                roomMap.addConnection(curRoom, neighbor);
            });
        }

        updates.Agent.forEach(agent => {
            KB.updateAgentMap(agent);
        });
    });

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

let questBot: QuestStrategy = new QuestStrategy();

async function act() {
    if (ClientAPI.canAct()) {
        await questBot.act();
    }
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
