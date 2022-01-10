import { ClientAPI } from "@panoptyk/client";
import { Info, Room, Agent, Quest } from "@panoptyk/core";

// TODO: needs a new name
class KnowledgeBase {
    // Singleton Pattern
    private static _instance: KnowledgeBase;

    public static get instance(): KnowledgeBase {
        if (!KnowledgeBase._instance) {
            KnowledgeBase._instance = new KnowledgeBase();
        }
        return KnowledgeBase._instance;
    }

    public isConversationRequested(): boolean {
        return ClientAPI.playerAgent.conversationRequesters.length > 0;
    }

    public isAgentInConversation(agent: Agent): boolean {
        return ClientAPI.playerAgent.conversation?.containsAgent(agent);
    }

    public isAgentInRoom(agent: Agent): boolean {
        return ClientAPI.playerAgent.room.hasAgent(agent);
    }

    public isQuestCompleted(quest: Quest): boolean {
        return ClientAPI.playerAgent.activeAssignedQuests.length === 0 || ClientAPI.playerAgent.activeAssignedQuests[0].id !== quest.id;
    }

    public isQuestAvailable(): boolean {
        return ClientAPI.playerAgent.activeAssignedQuests.length > 0;
    }

    public isFactionLeaderInRoom(): boolean {
        const occupants = ClientAPI.playerAgent.room.occupants;
        for (let occupant of occupants) {
            if (occupant.id <= 2 && occupant.factions[0]?.id === ClientAPI.playerAgent.factions[0].id) {
                return true;
            }
        }
        return false;
    }

    _factionLeader: Agent;
    public getFactionLeader(): Agent {
        const occupants = ClientAPI.playerAgent.room.occupants;
        for (let occupant of occupants) {
            if (occupant.id <= 2 && occupant.factions[0]?.id === ClientAPI.playerAgent.factions[0].id) {
                this._factionLeader = occupant;
                return occupant;
            }
        }
        return undefined;
    }

    _turnInInfos = [];
    _turnInInfoIdx = 0;

    public collectInfo(info: Info) {
        this._turnInInfos.push(info);
    }

    public getTurnInInfo(): Info {
        const info = this._turnInInfos[this._turnInInfoIdx];
        this._turnInInfoIdx += 1;
        return info;
    }

    public isTurnInInfo() {
        return this._turnInInfoIdx  < this._turnInInfos.length;
    }

    _agentRoomMap: Map<number, Room> = new Map();
    public updateAgentMap(agent: Agent) {
        this.getFactionLeader();
        if (agent.room) {
            this._agentRoomMap.set(agent.id, agent.room);
        }
    }

    public lastSeen(agent: Agent): Room {
        return agent ? this._agentRoomMap.get(agent.id) : undefined;
    }
}

export { KnowledgeBase };
export default KnowledgeBase.instance;
