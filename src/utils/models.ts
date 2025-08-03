import { getModels } from '../services/database';

// Load models from database
export async function loadModels() {
  return await getModels();
}