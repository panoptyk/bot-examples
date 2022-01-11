import { ClientAPI } from "@panoptyk/client";
import { Room, Faction, Agent, Util, Query, Info } from "@panoptyk/core";
import { defaultKB as KB, roomMap } from "../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../Shared/Utility";
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
            if ((info.getTerms(true).agent) && (info.getTerms(true).agent as any)._agentName === "questTarget") {
                KB.collectInfo(info);
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

function verifyQuestReceiver(receiver: Agent) {
    return receiver && receiver.factions[0]?.id === ClientAPI.playerAgent.factions[0].id;
}

async function giveQuest() {
    let receiver;
    let giver = ClientAPI.playerAgent;

    for (let other of ClientAPI.playerAgent.room.occupants) {
        if (other !== giver && verifyQuestReceiver(other)) {
            receiver = other;
            break;
        }
    }

    if (ClientAPI.canAct()) {
        if (ClientAPI.playerAgent.questionsAsked.length > 0) {
            const questionAsked = ClientAPI.playerAgent.getLatestQuestionAsked();

            if (receiver) {
                await ClientAPI.giveQuest(giver, receiver, questionAsked.id)
                .then(_ => {
                    log.info(`Agent ${giver} assigned agent ${receiver} with query quest ${questionAsked}`, LOGTYPE.ACT);
                })
                .catch(error => {
                    console.log(error);
                    console.log(`error assigning quest:\n ${JSON.stringify(error)}`);
                });
            }
        }
        else {
            const info = KB.getTurnInInfo();
            let terms = info.getTerms(true);
            terms.roomB = undefined;

            await ClientAPI.askQuestion(terms, terms.action)
            .then(_ => {
                log.info(`query is created`, LOGTYPE.ACT);
            })
            .catch(error => {
                console.log(`error creating query:\n ${JSON.stringify(error)}`);
            });
        }
    }
}

async function act() {
    // assign quest 
    if (ClientAPI.playerAgent.conversation && ClientAPI.playerAgent.conversation.participants.length >= 2) {
        giveQuest();
    }
    else if (ClientAPI.playerAgent.conversationRequesters.length > 0) {
        await ClientAPI.acceptConversation(
            ClientAPI.playerAgent.conversationRequesters[0]
        );
    }
}

// =======Start Bot========== //
/*       */ init(); /*        */
// ========================== //
