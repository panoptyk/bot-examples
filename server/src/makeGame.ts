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
    AgentManipulator,
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

// initialize faction leaders
const faction_A_leader = new Agent("faction_A_leader", r2);
const faction_B_leader = new Agent("faction_B_leader", r3);

FactionManipulator.addAgentToFaction(factionA, faction_A_leader);
FactionManipulator.addAgentToFaction(factionB, faction_B_leader);

AgentManipulator.joinFaction(faction_A_leader, factionA);
AgentManipulator.joinFaction(faction_B_leader, factionB);

const rooms = [r1, r2, r3, r4, r5];

// initialize faction members and spawn at randomized locations
for (let cnt = 0; cnt < 5; cnt++) {
    const factionAMember = new Agent("faction_A_member_" + cnt, rooms[Math.floor(Math.random() * 5)]);
    const factionBMember = new Agent("faction_B_member_" + cnt, rooms[Math.floor(Math.random() * 5)]);

    FactionManipulator.addAgentToFaction(factionA, factionAMember);
    FactionManipulator.addAgentToFaction(factionB, factionBMember);

    AgentManipulator.joinFaction(factionAMember, factionA);
    AgentManipulator.joinFaction(factionBMember, factionB);
}

db.save().finally(() => {
    console.log("save complete");
    const otherDB = new MemorySaveLoadDatabase();
    Util.AppContext.db = otherDB;
    otherDB.load().finally(() => {});
});
