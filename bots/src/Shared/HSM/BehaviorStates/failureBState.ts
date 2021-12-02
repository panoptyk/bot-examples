import { BehaviorState } from "./behaviorState";

/**
 * FailureBehavior is an endcap for Behavior FSMs denoting it has completed in failure.
 * It's singleton FailureBehavior.instance can be used to save memory if no modifications required
 */
export class FailureBehavior extends BehaviorState {
    //#region Singleton Pattern
    private static _instance: FailureBehavior;
    public static get instance(): FailureBehavior {
        if (!FailureBehavior._instance) {
            FailureBehavior._instance = new FailureBehavior();
        }
        return FailureBehavior._instance;
    }

    private constructor() {
        super();
        this._fail = true;
    }
    //#endregion

    public async act() {
        return;
    }

    public nextState(): BehaviorState {
        return this;
    }
}
