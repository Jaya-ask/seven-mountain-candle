import { DATABASE_NAME } from "../config/environment.js";
import { createHealthModel } from "../models/healthModel.js";
import { checkDatabaseHealth } from "../services/healthService.js";

export async function getHealth(_request, response) {
  await checkDatabaseHealth();
  response.json(createHealthModel({ databaseName: DATABASE_NAME }));
}
