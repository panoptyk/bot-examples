import { EnumLiteralsOf } from "./enum";

export type LOGTYPE = EnumLiteralsOf<typeof LOGTYPE>;
export const LOGTYPE = Object.freeze({
    DEFAULT: "[ LOG ]" as "[ LOG ]",
    KB: "[ K B ]" as "[ K B ]",
    ACT: "[ ACT ]" as "[ ACT ]",
    STATE: "[STATE]" as "[STATE]",
    GAME: "[ GAME]" as "[ GAME]"
});

class Logger {
    //#region fields
    _ignoreTypes: LOGTYPE[];
    //#endregion

    //#region Singleton Pattern
    private static _instance: Logger;
    public static get instance(): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    private constructor() {        
        this._ignoreTypes = [];
    }
    //#endregion

    info (message: string, type: LOGTYPE) {
        console.log(`[${new Date()}]═${type} ${message}`);
    }
}
  
const log = Logger.instance;
 export { log };