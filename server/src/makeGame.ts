import {
    Util,
    Agent,
    Room,
    Item,
    Info,
    Faction,
    RoomManipulator,
    Actions,
    FactionManipulator,
} from "@panoptyk/core";
import { MemorySaveLoadDatabase } from "@panoptyk/server";

Util.AppContext.db = new MemorySaveLoadDatabase();
const db = Util.AppContext.db;

const r1 = new Room("town square", 10);
const r2 = new Room("north area", 10);
const r3 = new Room("south area", 10);
const r4 = new Room("east area", 10);
const r5 = new Room("west area", 10);

RoomManipulator.connectRooms(r1, r2);
RoomManipulator.connectRooms(r1, r3);
RoomManipulator.connectRooms(r1, r4);
RoomManipulator.connectRooms(r1, r5);

RoomManipulator.connectRooms(r2, r4);
RoomManipulator.connectRooms(r2, r5);
RoomManipulator.connectRooms(r3, r4);
RoomManipulator.connectRooms(r3, r5);

// initialize faction
const factionA = new Faction("A", "");
const factionB = new Faction("B", "");

const a1 = new Agent("A1", r1);
const b1 = new Agent("B1", r1);

FactionManipulator.addAgentToFaction(factionA, a1);
FactionManipulator.addAgentToFaction(factionB, b1);

db.save().finally(() => {
    console.log("save complete");
    const otherDB = new MemorySaveLoadDatabase();
    Util.AppContext.db = otherDB;
    otherDB.load().finally(() => {});
});
