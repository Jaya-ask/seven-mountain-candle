export function createHealthModel({ databaseName }) {
  return {
    ok: true,
    database: databaseName
  };
}
