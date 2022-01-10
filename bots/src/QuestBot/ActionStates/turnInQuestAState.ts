import { ActionState, SuccessAction, FailureAction } from "../../Shared/HSM";
import { RetryActionState } from "../../Shared/HSM/ActionStates/retryActionState";
import { Quest, Info } from "@panoptyk/core";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../../Shared/Utility";
import { ClientAPI } from "@panoptyk/client";

export class TurnInQuestAction extends RetryActionState {
    _quest: Quest;
    _info: Info;

    constructor(quest: Quest, info: Info, timeout: number, nextState?: () => ActionState) {
        super(timeout, nextState);

        this._quest = quest;
        this._info = info;
        this._success = KB.isQuestCompleted(quest);
        this._fail = !!quest || !this._success;
    }

    async act() {
        this._success = KB.isQuestCompleted(this._quest);

        await ClientAPI.turnInQuestInfo(this._quest, this._info)
            .then(res => {
                log.info(`Agent ${ClientAPI.playerAgent} turn in info ${this._info} for quest ${this._quest}`, LOGTYPE.ACT);
            })
            .catch(error => {
                console.log(`error turning in quest:\n ${JSON.stringify(error)}`);
            });;
    }

    public nextState(): ActionState {
        if (this._success) {
            return SuccessAction.instance;
        }
        else if (this._fail) {
            return FailureAction.instance;
        }
        else {
            return this;
        }
    }
}
