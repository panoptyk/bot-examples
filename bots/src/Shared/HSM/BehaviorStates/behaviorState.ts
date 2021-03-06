import { State } from "../state";
import { ActionState } from "../ActionStates/actionState";

export abstract class BehaviorState extends State {
    public currentActionState: ActionState;

    constructor(nextState: () => BehaviorState = undefined) {
        super(nextState);
    }

    public async act() {
        this.currentActionState = await this.currentActionState.tick();
    }

    public abstract nextState(): BehaviorState;

    public async tick(): Promise<BehaviorState> {
        return (await super.tick()) as any;
    }
}
