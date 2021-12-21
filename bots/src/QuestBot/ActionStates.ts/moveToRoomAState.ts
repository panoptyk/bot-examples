import { ClientAPI } from "@panoptyk/client";
import { Room } from "@panoptyk/core";
import { ActionState, SuccessAction, FailureAction } from "../../Shared/HSM";
import { RetryActionState } from "../../Shared/HSM/ActionStates/retryActionState";
import { log, LOGTYPE } from "../../Shared/Utility";

export class MoveToRoomAction extends RetryActionState {
    _dest: Room;

    constructor(dest: Room, timeout: number, nextState?: () => ActionState) {
        super(timeout, nextState);

        this._dest = dest;
    }

    async act() {
        await ClientAPI.moveToRoom(this._dest)
            .then(res => {
                log.info(`Agent ${ClientAPI.playerAgent} moved to room ${this._dest}`, LOGTYPE.ACT);
                this._success = true;
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            });
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
