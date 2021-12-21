import { ClientAPI } from "@panoptyk/client";
import { Info, Room, Agent } from "@panoptyk/core";

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
}

export { KnowledgeBase };
export default KnowledgeBase.instance;
