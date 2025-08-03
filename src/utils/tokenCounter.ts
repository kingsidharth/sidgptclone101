// Simple token estimation - in production you'd want to use tiktoken
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function calculateContextUsage(messages: Message[]): number {
  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content);
  }, 0);
}

export function canSendMessage(
  messages: Message[],
  newMessage: string,
  contextWindow: number
): boolean {
  const currentUsage = calculateContextUsage(messages);
  const newMessageTokens = estimateTokens(newMessage);
  const estimatedResponse = 500; // Reserve tokens for response
  
  return currentUsage + newMessageTokens + estimatedResponse <= contextWindow;
}