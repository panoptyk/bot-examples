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
        return ClientAPI.playerAgent.conversation.containsAgent(agent);
    }

    public isAgentInRoom(agent: Agent): boolean {
        return ClientAPI.playerAgent.room.hasAgent(agent);
    }

    public isQuestCompleted(quest: Quest): boolean {
        return ClientAPI.playerAgent.activeAssignedQuests.length === 0 || ClientAPI.playerAgent.activeAssignedQuests[0].id !== quest.id;
    }
}

export { KnowledgeBase };
export default KnowledgeBase.instance;
