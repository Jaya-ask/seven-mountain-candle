import app from "./app.js";
import { PORT } from "./config/environment.js";

app.listen(PORT, () => {
  console.log(`Seven Mountains API listening on port ${PORT}`);
});
