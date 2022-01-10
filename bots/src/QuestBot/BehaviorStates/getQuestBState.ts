import { 
    ActionState, 
    BehaviorState, 
    FailureAction, 
    FailureBehavior, 
    SuccessAction, 
    SuccessBehavior 
} from "../../Shared/HSM";
import { JoinConversationAction } from "../ActionStates/joinConversationAState";
import { defaultKB as KB } from "../../Shared/KnowledgeBase";
import { LeaveConversationAction } from "../ActionStates/leaveConversationAState";
import { log, LOGTYPE } from "../../Shared/Utility";

export class GetQuestBState extends BehaviorState {

    constructor(nextState?: () => BehaviorState) {
        super(nextState);

        this._success = KB.isQuestAvailable();
        this._fail = !KB.isFactionLeaderInRoom();

        if (!this.complete) {
            this.currentActionState = new JoinConversationAction(
                KB.getFactionLeader(),
                5000,
                GetQuestBState.LeaveConversationTransition(this)
            );
        }
        else {
            this.currentActionState = SuccessAction.instance;
        }
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
        log.info(
            `[${this.constructor.name}] CurrentActionState: ${this.currentActionState.constructor.name}`,
            LOGTYPE.STATE
        );
        
        this._success = KB.isQuestAvailable();
        this._fail = this.currentActionState === FailureAction.instance;
        
        await super.act();
    }

    static JoinConversationTransition(
        behavior: GetQuestBState
    ): (this: JoinConversationAction) => ActionState {
        return function(this: JoinConversationAction) {
            if (this._success) {
                return SuccessAction.instance;
            }
            if (this._fail) {
                return FailureAction.instance;
            }
            return this;
        }
    }

    static LeaveConversationTransition(
        behavior: GetQuestBState
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