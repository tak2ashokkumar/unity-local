export interface UnityAssistantHistory {
    conversation_id: string;
    title: string;
    application: string;
    last_message_at: string;
    displayLabel?: string | null;
}

export interface UnityAssistantChatHistory {
    role: string;
    content: string;
    chat_message_id: string;
}