import { Room } from "@panoptyk/core";
import { BehaviorState, FailureBehavior, SuccessBehavior } from "../../Shared/HSM";

export class GetQuestBState extends BehaviorState {


    constructor(dest: Room, nextState?: () => BehaviorState) {
        super(nextState);

        
    }

    public nextState(): BehaviorState {
        if (this._success) {
            return SuccessBehavior.instance;
        }
        else if (this._fail) {
            return FailureBehavior.instance;
        }
        else {
            return this;
        }
    }

    async act() {

    }
}