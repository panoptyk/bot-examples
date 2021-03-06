import { ActionState } from "..";
import { Room } from "@panoptyk/core";
import { ClientAPI } from "@panoptyk/client";
import { ValidationResult } from "@panoptyk/core";

export class MoveAction extends ActionState {
    private destination: Room;
    private moveCompleted = false;
  
    public get isMoveCompleted(): boolean {
      return this.moveCompleted;
    }
  
    public get moveDestination(): Room {
      return this.destination;
    }
  
    constructor(nextState: () => ActionState, destination: Room) {
      super(nextState);
      this.destination = destination;
    }
  
    public async act() {
      await ClientAPI.moveToRoom(this.destination)
        .catch((res: ValidationResult) => {
          console.log(res.message);
        })
        .then(() => {
          console.log("Moved to " + this.destination);
          this.moveCompleted = true;
        });
    }
  
    public nextState(): ActionState {
      return undefined;
    }
  }