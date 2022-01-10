import { Room } from "@panoptyk/core";
import { BehaviorState, Strategy } from "../../Shared/HSM";
import { IdleBState } from "../BehaviorStates/idleBState";
import { MoveToRoomBState } from "../BehaviorStates/moveToRoomBState";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { TurnInQuestBState } from "../BehaviorStates/turnInQuestBState";
import { GetQuestBState } from "../BehaviorStates/getQuestBState";
import { ClientAPI } from "@panoptyk/client";

export class QuestStrategy extends Strategy {
    constructor() {
        super();
        this.currentBehavior = IdleBState.instance;
    }

    async act() {
        if (this.currentBehavior === IdleBState.instance) {
            let room: Room;

            if (KB.isQuestAvailable() && KB.isTurnInInfo()) {
                room = KB.lastSeen(KB.getFactionLeader());
            }
            else {
                room = QuestStrategy.getRandomRoom();
            }
            
            this.currentBehavior = new MoveToRoomBState(
                room,
                QuestStrategy.moveToRoomTransition(this)
            );
        }
        
        await super.act();
    }

    static moveToRoomTransition(
        strategy: QuestStrategy
    ): (this: MoveToRoomBState) => BehaviorState {
        return function(this: MoveToRoomBState) {
            if (this._success && KB.isFactionLeaderInRoom()) {
                return new TurnInQuestBState(QuestStrategy.turnInQuestTransition(strategy));
            }
            else if (this._fail) {
                return IdleBState.instance;
            }
            return this;
        }
    }

    static turnInQuestTransition(
        strategy: QuestStrategy
    ): (this: TurnInQuestBState) => BehaviorState {
        return function(this: TurnInQuestBState) {
            if (this._success) {
                return new GetQuestBState(QuestStrategy.getQuestTransition(strategy));
            }
            else if (this._fail) {
                return IdleBState.instance;
            }
            return this;
        }
    }

    static getQuestTransition(
        strategy: QuestStrategy
    ): (this: GetQuestBState) => BehaviorState {
        return function(this: GetQuestBState) {
            if (this.complete) {
                return IdleBState.instance;
            }
            return this;
        }
    }

    static getRandomRoom() {
        const rooms: Room[] = ClientAPI.playerAgent.room.adjacentRooms;
        const roomSelected = rooms[QuestStrategy.getRandomInt(rooms.length)];

        return roomSelected;
    }

    static  getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
} 