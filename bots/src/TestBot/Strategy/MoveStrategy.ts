import { BehaviorState } from "../BehaviorStates/behaviorState";
import { MoveBehavior } from "../BehaviorStates/moveBehavior";
import { IdleBehavior } from "../BehaviorStates/idleBehavior";

export abstract class MoveStrategy {
    public currentBehavior: BehaviorState;

    public async act() {
        this.currentBehavior = await this.currentBehavior.tick();
    }

    public static moveBehaviorTransition(this: MoveBehavior): BehaviorState {
        if (MoveBehavior.destination === undefined) {
            return new IdleBehavior(MoveStrategy.idleBehaviorTransition);
        }
    }

    public static idleBehaviorTransition(this: IdleBehavior): BehaviorState {
        return this;
      }
}
