/*
  # Populate models table

  1. New Data
    - Insert default AI models with their specifications
    - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o, GPT-4o Mini
  
  2. Data Structure
    - Each model has id, name, context window, and cost per 1k tokens
*/

INSERT INTO models (id, name, context_window, cost_per_1k) VALUES
  ('gpt-4', 'GPT-4', 8192, 0.03),
  ('gpt-4-turbo', 'GPT-4 Turbo', 128000, 0.01),
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 4096, 0.002),
  ('gpt-4o', 'GPT-4o', 128000, 0.005),
  ('gpt-4o-mini', 'GPT-4o Mini', 128000, 0.0002)
ON CONFLICT (id) DO NOTHING;