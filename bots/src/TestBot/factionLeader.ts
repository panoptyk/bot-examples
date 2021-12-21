import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, FactionManipulator, Query, Information } from "@panoptyk/core";
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

    // register update listener for quest target
    ClientAPI.addOnUpdateListener((updates) => {
        updates.Information.forEach(info => {
            if ((info.getTerms(true).agent as any)._agentName === "questTarget") {
                infos.push(info.getTerms(true));
            }
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

let receivers = [];
let receiverIdx = 0;
let infos = [];
let infoIdx = 0;

function giveQuest(giver: Agent, receiver: Agent) {
    if (infoIdx === infos.length) {
        return;
    }

    const questToGive = Query.moved({
        ...infos[infoIdx],
        roomB: null
    });

    infoIdx += 1;

    return ClientAPI.giveQuest(giver, receiver, questToGive, "moved")
            .then(res => {
                console.log(`Faction leader ${username} assigned quest ${ClientAPI.playerAgent.activeGivenQuests[ClientAPI.playerAgent.activeGivenQuests.length - 1]} "${stringifyQuery(questToGive.getTerms(true))}" to faction member ${receiver.agentName}`);
                
            })
            .catch(error => console.log(`failed to give quest ${JSON.stringify(error)}`));
}

function stringifyQuery(query: any) {
    return `Agent ${query.agent} moved from ${query.room ? query.room : "what source room"} to ${query.roomB ? query.roomB : "what destination room"} at time ${query.time}`;
}

function verifyQuestReceiver(receiver: Agent) {
    return receiver && !(receiver.id in receivers) && receiver.factions[0]?.id === ClientAPI.playerAgent.factions[0].id;
}

async function act() {
    if (ClientAPI.canAct() && ClientAPI.playerAgent.room.occupants.length > 1) {
        let receiver;
        let giver = ClientAPI.playerAgent;

        for (let other of ClientAPI.playerAgent.room.occupants) {
            if (other !== giver && verifyQuestReceiver(other)) {
                receivers.push(other.id);
            }
        }

        receiver = Util.AppContext.db.retrieveModel(receivers[receiverIdx], Agent);

        if (receiver) {
            await giveQuest(giver, receiver);
            receiverIdx++;
        }
    }
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
