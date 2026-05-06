import { UnityChartDetails } from "../shared/unity-chart-config.service";
import { ChatbotTableViewData } from "./uc-table/uc-table.service";

export interface UnityChatBot {
    // query_id: number;
    // reset_thread: boolean;
    // messages: any;
    // response: UnityChatBotResponse[];
    // order: number;
    conversation_id: string;
    response: UnityChatBotResponse;
    cached: boolean;
}

export interface UnityChatBotResponse {
    // order: number;
    // type: string;
    // data: string | UnityChatBotResponseTableData | UnityChatBotResponseChartData;
    answer: string;
    suggested_questions: string[];
    chat_message_id: string;
}

export interface UnityChatBotResponseTableData {
    columns: string[];
    values: any[];
}

export interface UnityChatBotResponseChartData {
    title: string;
    legend: string[];
    values: any;
    x_axis?: string;
    y_axis?: string;
}

export interface UntiyChatBotExploreMenu {
    module_name: string;
    queries: string[];

    isActive?: boolean;
    icon?: string;
    inUrl?: boolean;

    //for ui purpose
    module_display_name?: string;
}

export interface ChatHistoryData {
    user: 'user' | 'bot';
    message: string | ChatbotTableViewData | UnityChartDetails;
    type: string;
    botResponseId?: string;
    liked?: boolean;
    disliked?: boolean;
    comment?: boolean;
    feedbackSubmitted?: boolean;
    feedbackIconTooltip?: string;
    suggestedPrompt?: string;
    actions?: { name: string, isDisabled: boolean };
    showAction?: boolean;
}

export interface AssistedInsights {
    insights: Insight[];
}

export interface Insight {
    category: string;
    insight: string;
    suggested_function: string;
    chatbot_query: string;
}


//for UI
export interface UrlData {
    apiUrls: InsightUrl[];
}

export interface InsightUrl {
    name: string;
    url: string;
    params?: any;
    toBeskipped?: boolean;
}

export interface ChatDocuments {
    documents: ChatDocument[];
}

export interface ChatDocument {
    file_name: string;
    conversation_id: string;
}