import { State } from "../state";
import { ActionState } from "../ActionStates/actionState";
import { BehaviorState } from "..";
import { IdleAction } from "../ActionStates/idleAction";

export class IdleBehavior extends BehaviorState {
    public currentActionState: ActionState;

    constructor(nextState: () => BehaviorState = undefined) {
        super(nextState);
        this.currentActionState = new IdleAction(IdleBehavior.idleActionTransition);
    }

    public async act() {
        this.currentActionState = await this.currentActionState.tick();
    }

    public static idleActionTransition(this: IdleAction): ActionState {
        return  this;
    }

    nextState(): BehaviorState {
        return this;
    };

}
