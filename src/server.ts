import { app } from "./app";
import { env } from "./config/env";
import { initializeDatabases } from "./db/init";

initializeDatabases();

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
