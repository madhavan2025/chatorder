export type AgentType = {
  userId?: string;
  agentName: string;
  agentIcon: string;
  agentFont: string;
  enableShopping: boolean;
  theme: {
    headerBg: string;
    headerTextColor: string;
    borderColor: string;
    borderRadius: string;
    shadow: string;
    windowBg: string;
  };
};