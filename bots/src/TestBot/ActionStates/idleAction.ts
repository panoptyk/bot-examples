import { ActionState } from "..";


export class IdleAction extends ActionState {
    public async act () {
        return;
    }

    public nextState(): ActionState {
        return undefined;
    }
}