import { ClientAPI } from "@panoptyk/client";
import { Room } from "@panoptyk/core";
import {
    ActionState,
    BehaviorState,
    FailureAction,
    FailureBehavior,
    SuccessAction,
    SuccessBehavior,
} from "../../Shared/HSM";
import { defaultKB as KB, roomMap } from "../../Shared/KnowledgeBase";
import { log, LOGTYPE } from "../../Shared/Utility";
import { PanoptykActionState } from "../../Shared/PanoptykHSM";
import { DEFAULT_RETRY_TIME } from "../defaults";

/**
 * This Behavior attempts to move the Agent to a specifed Room
 */
export class MoveToBState extends BehaviorState {
    //#region ActionStateTransitions
    static DynamicMoveRoomTransition(behavior: MoveToBState) {
        return function (this: PanoptykActionState): ActionState {
            if (this._success) {
                if (ClientAPI.playerAgent.room.equals(behavior._dest)) {
                    return SuccessAction.instance;
                }
                behavior._sequencePos++;
                return new PanoptykActionState(
                    DEFAULT_RETRY_TIME,
                    async () => {
                        return await ClientAPI.moveToRoom(
                            behavior._roomSequence[behavior._sequencePos]
                        );
                    },
                    MoveToBState.DynamicMoveRoomTransition(behavior)
                );
            }
            if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        };
    }
    //#endregion

    //#region fields
    _roomSequence: Room[] = [];
    _sequencePos = 0;
    _dest: Room;
    //#endregion

    constructor(dest: Room, nextState?: () => BehaviorState) {
        super(nextState);
        this._dest = dest;
        this._roomSequence = roomMap.findPath(ClientAPI.playerAgent.room, dest);
        this._fail = this._roomSequence == undefined;

        if (!this.complete) {
            this.currentActionState = new PanoptykActionState(
                DEFAULT_RETRY_TIME,
                async () => {
                    return await ClientAPI.moveToRoom(
                        this._roomSequence[this._sequencePos]
                    );
                },
                MoveToBState.DynamicMoveRoomTransition(this)
            );
        }
    }

    nextState() {
        if (this._success) {
            return SuccessBehavior.instance;
        }
        if (this._fail) {
            return FailureBehavior.instance;
        }
        return this;
    }

    async act() {
        log.info(
            `[${this.constructor.name}] CurrentActionState: ${this.currentActionState.constructor.name}`,
            LOGTYPE.STATE
        );
        this._success = ClientAPI.playerAgent.room.equals(this._dest);
        this._fail = this.currentActionState == FailureAction.instance;
        if (this.complete) {
            return;
        }
        await super.act();
    }
}
