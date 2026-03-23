import { UnityChartDetails } from "src/app/shared/unity-chart-config.service";
import { ChatbotTableViewData } from "src/app/unity-chatbot/uc-table/uc-table.service";
import { UnityChatBotResponseChartData, UnityChatBotResponseTableData } from "src/app/unity-chatbot/unity-chatbot.type";

export interface DashboardQueryLog {
  id: number;
  user: string;
  query: string;
  module: string;
  tokens: number;
  status: string;
  response_time_ms: number;
  user_reaction: string;
  is_successful: boolean;
}

export interface QueryDetails {
  id: number;
  user: string;
  query: string;
  module: string;
  tokens: number;
  response_time_ms: number;
  user_reaction: string;
  is_default: boolean;
  source_page: string;
  is_successful: boolean;
  failure_reason: string;
  prev_query: string | null;
  user_feedback: string | null;
  type: string;
  response: UnityChatBotResponse[];
  query_length: number;
  response_completed: string;
}

export interface UnityChatBotResponse {
  order: number;
  type: string;
  data: string | UnityChatBotResponseTableData | UnityChatBotResponseChartData;
}

export interface TopQueries {
  count: number;
  query: string;
  response_time_ms: string;
}

export interface QueryStatisticsSummarySnake {
  failed: number;
  avg_response: number;
  f_ratio: number;
  successful: number;
  m_count: number;
  total: number;
  s_ratio: number;
  module: string;
}

export interface TokenDetails {
  tokens: string;
  id: string;
}

export interface FeedbackStats {
  average: number;
  like: number;
  dislike: number;
}

export interface FeedbackTrend {
  [month: string]: FeedbackStats;
}
