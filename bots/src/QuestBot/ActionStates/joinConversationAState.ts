import { RetryActionState } from "../../Shared/HSM/ActionStates/retryActionState";
import { ActionState, SuccessAction, FailureAction } from "../../Shared/HSM";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../../Shared/Utility";
import { Agent } from "@panoptyk/core";
import { ClientAPI } from "@panoptyk/client";

export class JoinConversationAction extends RetryActionState {
    _target: Agent;
    _requested = false;

    constructor(target: Agent, timeout: number, nextState?: () => ActionState) {
        super(timeout, nextState);
        this._target = target;
        this._fail = !(this._target || this._target.conversation);
        this._success = KB.isAgentInConversation(this._target);
    }

    async act() {
        this._success = KB.isAgentInConversation(this._target);
        this._fail = 
            this._fail ||
            !KB.isAgentInRoom(this._target) ||
            !this._target.conversation;

        if (!this._requested && !this._success) {
            await ClientAPI.requestConversation(this._target)
                .then(res => {
                    log.info(`Agent ${ClientAPI.playerAgent} requested conversation with agent ${this._target}`, LOGTYPE.ACT);
                    this._requested = true;
                    this._success = true;
                })
                .catch(error => {
                    console.log(`error joining conversation:\n ${JSON.stringify(error)}`);
                });
        }
        
        
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
