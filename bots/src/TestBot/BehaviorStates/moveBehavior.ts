import { State } from "../state";
import { ActionState } from "../ActionStates/actionState";
import { BehaviorState } from "..";
import { MoveAction } from "../ActionStates/moveAction";
import { Room } from "@panoptyk/core";
import { SuccessAction } from "../ActionStates/successAState";
import { FailureAction } from "../ActionStates/failureAState";

export abstract class MoveBehavior extends State {
    public currentActionState: ActionState;
    public static destination: Room;
    public static path: Room[];
    public static pathPos = 0;

    constructor(nextState: () => BehaviorState = undefined) {
        super(nextState);
        this.currentActionState = new MoveAction(MoveBehavior.moveActionTransition, MoveBehavior.path[MoveBehavior.pathPos]);
    }

    public static moveActionTransition(this: MoveAction): ActionState {
        if (
          this.isMoveCompleted &&
          this.moveDestination === MoveBehavior.destination
        ) {
          return SuccessAction.instance;
        } else if (this.isMoveCompleted) {
          MoveBehavior.pathPos++;
          if (MoveBehavior.pathPos > MoveBehavior.path.length) {
            return FailureAction.instance;
          }
          return new MoveAction(
            MoveBehavior.moveActionTransition,
            MoveBehavior.path[MoveBehavior.pathPos]
          );
        }
        return this;
      }

    public async act() {
        this.currentActionState = await this.currentActionState.tick();
    }

    public abstract nextState(): BehaviorState;

    public async tick(): Promise<BehaviorState> {
        return (await super.tick()) as any;
    }
}