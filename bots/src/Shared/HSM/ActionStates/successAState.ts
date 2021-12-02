import { ActionState } from "./actionState";

/**
 * SuccessAction is an endcap for FSMs denoting it has completed in success.
 * It's singleton SuccessAction.instance can be used to save memory if no modifications required
 */
export class SuccessAction extends ActionState {
    //#region Singleton Pattern
    private static _instance: SuccessAction;
    public static get instance(): SuccessAction {
        if (!SuccessAction._instance) {
            SuccessAction._instance = new SuccessAction();
        }
        return SuccessAction._instance;
    }

    private constructor() {
        super();
        this._success = true;
    }
    //#endregion

    public async act() {
        return;
    }

    public nextState(): ActionState {
        return this;
    }
}
