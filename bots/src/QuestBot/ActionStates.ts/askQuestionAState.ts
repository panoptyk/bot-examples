import { RetryActionState } from "../../Shared/HSM/ActionStates/retryActionState";
import { ActionState, SuccessAction, FailureAction } from "../../Shared/HSM";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../../Shared/Utility";
import { ClientAPI } from "@panoptyk/client";
import { Query } from "@panoptyk/core";

export class AskQuestionAction extends RetryActionState {
    _terms: any;
    _action: string;

    constructor(question: any, action: string, timeout: number, nextState?:() => ActionState) {
        super(timeout, nextState);
        this._terms = question;
        this._fail = !question;
    }

    async act() {
        await ClientAPI.askQuestion(this._terms, this._action)
            .then(res => {
                log.info(`Agent ${ClientAPI.playerAgent} asked a question ${this._terms}`, LOGTYPE.ACT);
            })
            .catch(error => {
                console.log(JSON.stringify(error));
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