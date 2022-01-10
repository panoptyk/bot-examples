import { BehaviorState, SuccessAction } from "../../Shared/HSM";

export class IdleBState extends BehaviorState {
    constructor(nextState?: () => BehaviorState) {
        super(nextState);
        this.currentActionState = SuccessAction.instance;
    }

    static _instance: IdleBState;
    static get instance(): IdleBState {
        if (!IdleBState._instance) {
            IdleBState._instance = new IdleBState();
        }
        return IdleBState._instance;
    }

    public nextState(): BehaviorState {
        return this;
    }

    async act() {
        // idle
    }
}