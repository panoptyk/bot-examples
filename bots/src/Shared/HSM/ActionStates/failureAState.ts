import { ActionState } from "./actionState";

/**
 * FailureAction is an endcap for Action FSMs denoting it has completed in failure.
 * It's singleton FailureAction.instance can be used to save memory if no modifications required
 */
export class FailureAction extends ActionState {
    //#region Singleton Pattern
    private static _instance: FailureAction;
    public static get instance(): FailureAction {
        if (!FailureAction._instance) {
            FailureAction._instance = new FailureAction();
        }
        return FailureAction._instance;
    }

    private constructor() {        
        super();
        this._fail = true;
    }
    //#endregion

    public async act() {
        return;
    }

    public nextState(): ActionState {
        return this;
    }
}
