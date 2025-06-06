
/**
 * Main library exports for clean imports
 */

// Persona state management
export {
  getPersonaState,
  updatePersonaState,
  mergePersonaState,
  type PersonaState
} from './persona-state';

// Conversation management
export {
  saveConversation,
  getConversationHistory,
  getConversationById,
  deleteConversation,
  type ConversationData,
  type SavedConversation
} from './conversations';

// AI engine (placeholder)
export {
  processConversation,
  initializeAIEngine,
  generateSystemPrompt,
  analyzeConversationForInsights,
  preprocessText,
  postprocessResponse,
  type AIEngineConfig,
  type ConversationContext,
  type AIResponse
} from './ai-engine';
