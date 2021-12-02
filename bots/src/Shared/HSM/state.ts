export abstract class State {
    //#region Properties
    readonly startTime: number = 0;
    /**
     * Time in ms since tick last called
     */
    public get deltaTime() {
        return this._deltaTime;
    }
    get complete(): boolean {
        return this._success || this._fail;
    }
    //#endregion

    //#region Fields
    private _lastTickTime = 0;
    private _thisTickTime = 0;
    private _deltaTime = 0;
    _success = false;
    _fail = false;    
    //#endregion

    constructor(nextState: () => State = undefined) {
        this.startTime = Date.now();
        this._thisTickTime = this.startTime;
        if (nextState) {
            this.nextState = nextState;
        }
    }

    /**
     * tick is called to both have a state perform its logic and return the state to transition to
     */
    public async tick(): Promise<State> {
        this.calcDeltaTime();
        await this.act();
        return this.nextState();
    }

    public abstract act(): Promise<void>;

    public abstract nextState(): State;

    private calcDeltaTime() {
        this._lastTickTime = this._thisTickTime;
        this._thisTickTime = Date.now();
        this._deltaTime = Math.max(this._thisTickTime - this._lastTickTime, 0);
    }
}
