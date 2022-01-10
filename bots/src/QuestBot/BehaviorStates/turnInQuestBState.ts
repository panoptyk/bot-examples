import { 
    BehaviorState, 
    FailureBehavior, 
    ActionState,
    SuccessAction,
    FailureAction
} from "../../Shared/HSM";
import { GetQuestBState } from "./getQuestBState";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { JoinConversationAction } from "../ActionStates/joinConversationAState";
import { LeaveConversationAction } from "../ActionStates/leaveConversationAState";
import { ClientAPI } from "@panoptyk/client";
import { TurnInQuestAction } from "../ActionStates/turnInQuestAState";
import { log, LOGTYPE } from "../../Shared/Utility";

export class TurnInQuestBState extends BehaviorState {

    constructor(nextState?: () => BehaviorState) {
        super(nextState);

        this._fail = !KB.isFactionLeaderInRoom();

        if (!this.complete) {
            this.currentActionState = new LeaveConversationAction(
                5000,
                TurnInQuestBState.LeaveConversationTransition(this)
            );
        } else {
            this.currentActionState = SuccessAction.instance;
        }
    }

    public nextState(): BehaviorState {
        if (this._success) {
            return new GetQuestBState();
        }
        else if (this._fail) {
            return FailureBehavior.instance;
        }
        return this;
    }

    async act() {
        log.info(
            `[${this.constructor.name}] CurrentActionState: ${this.currentActionState.constructor.name}`,
            LOGTYPE.STATE
        );
        this._success = this.currentActionState === SuccessAction.instance;
        this._fail = this.currentActionState === FailureAction.instance;
        await super.act();
    }

    static TurnInQuestTransition(
        behavior: TurnInQuestBState
    ): (this: TurnInQuestAction) => ActionState {
        return function(this: TurnInQuestAction) {
            const quest = ClientAPI.playerAgent.activeGivenQuests[0];
            if (this.complete && quest) {
                return new TurnInQuestAction(
                    quest,
                    KB.getTurnInInfo(),
                    5000,
                    TurnInQuestBState.TurnInQuestTransition(behavior)
                );
            }
            else if (this._success) {
                return SuccessAction.instance;
            }
            else if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        }
    }

    static JoinConversationTransition(
        behavior: TurnInQuestBState
    ): (this: JoinConversationAction) => ActionState {
        return function(this: JoinConversationAction) {
            const quest = ClientAPI.playerAgent.activeAssignedQuests[0];

            if (this._success && quest) {
                return new TurnInQuestAction(
                    quest,
                    KB.getTurnInInfo(),
                    5000,
                    TurnInQuestBState.TurnInQuestTransition(behavior)
                );
            } else if (this._success) {
                return SuccessAction.instance;
            }
            else if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        }
    }

    static LeaveConversationTransition(
        behavior: TurnInQuestBState
    ): (this: LeaveConversationAction) => ActionState {
        return function(this: LeaveConversationAction) {
            if (this._success) {
                return new JoinConversationAction(
                    KB.getFactionLeader(),
                    5000,
                    GetQuestBState.JoinConversationTransition(behavior)
                );
            }
            else if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        }
    }
}