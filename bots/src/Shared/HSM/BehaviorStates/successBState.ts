import { BehaviorState } from "./behaviorState";

/**
 * SuccessBehavior is an endcap for Behavior FSMs denoting it has completed in success.
 * It's singleton SuccessBehavior.instance can be used to save memory if no modifications required
 */
export class SuccessBehavior extends BehaviorState {
    //#region Singleton Pattern
    private static _instance: SuccessBehavior;
    public static get instance(): SuccessBehavior {
        if (!SuccessBehavior._instance) {
            SuccessBehavior._instance = new SuccessBehavior();
        }
        return SuccessBehavior._instance;
    }

    private constructor() {
        super();
    }
    //#endregion

    public async act() {
        return;
    }

    public nextState(): BehaviorState {
        return this;
    }
}
