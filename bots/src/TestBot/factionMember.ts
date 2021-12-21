import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, Information, Info } from "@panoptyk/core";
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

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    logger.silence();
    address ? ClientAPI.init(address) : ClientAPI.init();

    ClientAPI.addOnUpdateListener((updates) => {
        updates.Information.forEach(info => {
            infos.push(info);
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

let infos = [];
let waitTime = 5000;
let lastMove = 0;

function moveToRandomRoom() {
    const rooms: Room[] = ClientAPI.playerAgent.room.adjacentRooms;
    const roomSelected = rooms[getRandomInt(rooms.length)];

    return ClientAPI.moveToRoom(roomSelected)
        .then(res => console.log(
            `Agent ${username} moved to room ${roomSelected}`
        ))
        .catch(error => console.log(`failed to move to room: ${roomSelected} with error msg: ${JSON.stringify(error)}`));  

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function selectInfo(quest): any {
    let maxScore = 0;
    let res;

    for (let info of infos) {
        let score = evaluate(info.getTerms(true), quest._pred._terms);
        if (score > maxScore) {
            maxScore = score;
            res = info;
        }
    }

    infos = [];

    return res;
}

function evaluate(info, quest) {
    let score = 0;

    if (info.time === quest.time) {
        score += 1;
    }
    if (info.agent.id === quest.agent) {
        score += 1;
    }
    if (info.room.id === quest.room) {
        score += 1;
    }
    if (info.roomB.id === quest.roomB) {
        score += 1;
    }
    return score;
}

async function doQuest() {
    if (infos.length <= 0) {
        if (ClientAPI.canAct() && Date.now() - lastMove > waitTime) {
            await moveToRandomRoom()
                .then(_ => lastMove = Date.now());
        }
    }
    else {
        const quest = ClientAPI.playerAgent.activeAssignedQuests[0];
        const task: Info = quest.task;

        ClientAPI.turnInQuestInfo(quest, selectInfo(task))
            .then(res => {
                console.log(`quest ${quest} is completed`)
            })
            .catch(error => console.log(`quest ${quest} failed: info turned in is incorrect`));
    }
}

async function act() {
    if (ClientAPI.playerAgent.activeAssignedQuests.length > 0) {
        doQuest();
    } 
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
