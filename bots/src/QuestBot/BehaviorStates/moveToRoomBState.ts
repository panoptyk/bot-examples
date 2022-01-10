import { ClientAPI } from "@panoptyk/client";
import { Room } from "@panoptyk/core";
import { 
    ActionState,
    BehaviorState, 
    FailureBehavior, 
    SuccessAction,
    FailureAction,
    SuccessBehavior
} from "../../Shared/HSM";
import { defaultKB as KB, roomMap } from "../../Shared/KnowledgeBase";
import { MoveToRoomAction } from "../ActionStates/moveToRoomAState";

export class MoveToRoomBState extends BehaviorState {

    _dest: Room;
    _roomSequence: Room[] = [];
    _sequencePos = 0;

    constructor(dest: Room, nextState?: () => BehaviorState) {
        super(nextState);

        this._dest = dest;
        this._roomSequence = roomMap.findPath(ClientAPI.playerAgent.room, dest);
        this._fail = this._roomSequence === undefined;

        if (!this.complete) {
            this.currentActionState = new MoveToRoomAction(
                this._roomSequence[this._sequencePos],
                5000,
                MoveToRoomBState.moveToRoomTransition(this)
            );
        }
    }

    public nextState(): BehaviorState {
        if (this._success) {
            return SuccessBehavior.instance;
        }
        else if (this._fail) {
            return FailureBehavior.instance;
        }
        return this;
    } 


    async act() {
        this._success = ClientAPI.playerAgent.room === this._dest;
        this._fail = this.currentActionState === FailureAction.instance;
        if (this.complete) {
            return;
        }
        await super.act();
    }

    static moveToRoomTransition(
        behavior: MoveToRoomBState
    ): (this: MoveToRoomAction) => ActionState {
        return function(this: MoveToRoomAction) {
            if (this._success) {
                if (ClientAPI.playerAgent.room.equals(behavior._dest)) {
                    return SuccessAction.instance;
                }
                behavior._sequencePos++;
                return new MoveToRoomAction(
                    behavior._roomSequence[behavior._sequencePos],
                    5000,
                    MoveToRoomBState.moveToRoomTransition(behavior)
                );
            } else if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        }
    }
}