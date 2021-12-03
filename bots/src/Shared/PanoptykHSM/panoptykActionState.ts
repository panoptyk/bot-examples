import { ValidationResult } from "@panoptyk/core";
import {
    ActionState,
    RetryActionState,
    SuccessAction,
    FailureAction,
} from "../HSM";
import { log, LOGTYPE } from "../Utility";

export class PanoptykActionState extends RetryActionState {
    _action: () => ValidationResult;
    /**
     * This extension of ActionState automatically fails after a certain amount of time has passed
     * @param timeOut time till action fails in milliseconds
     * @param
     * @param nextState optional next state function override
     */
    constructor(
        timeOut = 0,
        action: () => ValidationResult,
        nextState?: () => ActionState
    ) {
        super(timeOut, nextState);
        this._action = action;
    }

    nextState() {
        if (this._success) {
            return SuccessAction.instance;
        }
        if (this._fail) {
            return FailureAction.instance;
        }
    }

    async act() {
        if (this.complete) {
            return;
        }

        if (this._action) {
            let res = await this._action();
            this._success = res.success;
        } else {
            log.warn(
                "Failure, no Panoptyk action function provided",
                LOGTYPE.STATE
            );
            this._fail = true;
        }
    }
}
