type OpenRouterResponse = {
  id: string;
  // Depending on whether you set "stream" to "true" and
  // whether you passed in "messages" or a "prompt", you
  // will get a different output shape
  choices: (OpenRouterNonStreamingChoice | OpenRouterStreamingChoice | OpenRouterNonChatChoice)[];
  created: number; // Unix timestamp
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';

  system_fingerprint?: string; // Only present if the provider supports it

  // Usage data is always returned for non-streaming.
  // When streaming, you will get one usage object at
  // the end accompanied by an empty choices array.
  usage?: OpenRouterResponseUsage;
};

// Subtypes:
type OpenRouterNonChatChoice = {
  finish_reason: string | null;
  text: string;
  error?: OpenRouterError;
};

type OpenRouterNonStreamingChoice = {
  finish_reason: string | null; // Depends on the model. Ex: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call'
  message: {
    content: string | null;
    role: string;
    tool_calls?: OpenRouterToolCall[];
    // Deprecated, replaced by tool_calls
    function_call?: OpenRouterFunctionCall;
  };
  error?: OpenRouterError;
};

type OpenRouterStreamingChoice = {
  finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: OpenRouterToolCall[];
    // Deprecated, replaced by tool_calls
    function_call?: OpenRouterFunctionCall;
  };
  error?: OpenRouterError;
};

type OpenRouterError = {
  code: number; // See "Error Handling" section
  message: string;
};

type OpenRouterFunctionCall = {
  name: string;
  arguments: string; // JSON format arguments
};

type OpenRouterToolCall = {
  id: string;
  type: 'function';
  function: OpenRouterFunctionCall;
};

type OpenRouterResponseUsage = {
  /** Including images and tools if any */
  prompt_tokens: number;
  /** The tokens generated */
  completion_tokens: number;
  /** Sum of the above two fields */
  total_tokens: number;
};

export { OpenRouterResponse, OpenRouterNonStreamingChoice };
