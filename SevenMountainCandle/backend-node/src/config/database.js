import pg from "pg";

import { DB_CONFIG } from "./environment.js";

const { Pool } = pg;

export const dbPool = new Pool(DB_CONFIG);
