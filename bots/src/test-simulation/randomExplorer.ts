import { ClientAPI, UpdatedModels } from "@panoptyk/client";
import { Room, Faction, Agent, Util } from "@panoptyk/core";
import {
    BehaviorState,
    FailureAction,
    FailureBehavior,
    SuccessBehavior,
} from "../Shared/HSM";
import { defaultKB as KB, roomMap } from "../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../Shared/Utility";
import { MoveToBState } from "./BehaviorStates/moveToBState";
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

let visitedRooms: Set<Room> = new Set();
let state: BehaviorState = SuccessBehavior.instance;

// Visit room and build room map connections
function visitRoom(room: Room) {
    // If haven't visited, add to visited
    if (!visitedRooms.has(room)) {
        log.info(`Visited Room: ${room}`, LOGTYPE.ACT);
        visitedRooms.add(room);
        roomMap.addRoom(room);
        room.adjacentRooms.forEach((adjRoom) => {
            roomMap.addRoom(adjRoom);
            roomMap.addConnection(room, adjRoom);
        });
    }
}

async function act() {
    // Explore till there are no rooms left to explore
    visitRoom(ClientAPI.playerAgent.room);
    if (
        state == SuccessBehavior.instance ||
        state == FailureBehavior.instance
    ) {
        // Find new room to explor
        let unexploredRooms = roomMap.checkForUnexploredRooms();
        if (unexploredRooms.length > 0) {
            let pick = unexploredRooms[0];
            // instantiate new moveTo behavior
            state = new MoveToBState(pick);
        }
    }
    else {
        // tick state
        state = await state.tick();
    }
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
