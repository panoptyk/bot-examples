import { ClientAPI } from "@panoptyk/client";
import { ActionState, SuccessAction, FailureAction } from "../../Shared/HSM";
import { RetryActionState } from "../../Shared/HSM/ActionStates/retryActionState";
import { log, LOGTYPE } from "../../Shared/Utility";

export class LeaveConversationAction extends RetryActionState {

    constructor(timeout: number, nextState?: () => ActionState) {
        super(timeout, nextState);

        this._fail = !!ClientAPI.playerAgent.conversation;
        this._success = !ClientAPI.playerAgent.conversation;
    }

    async act() {
        this._success = this._success || !ClientAPI.playerAgent.conversation;

        if (this._fail) {
            await ClientAPI.leaveConversation(ClientAPI.playerAgent.conversation)
            .then(res => log.info(`Agent ${ClientAPI.playerAgent} left conversation`, LOGTYPE.ACT))
            .catch(error => {
                console.log(`error leaving conversation:\n ${JSON.stringify(error)}`);
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
