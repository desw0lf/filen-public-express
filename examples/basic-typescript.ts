import { FilenPublicExpress, Logger } from "../src/index.ts"; // use from "filen-public-express" instead

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env as Record<string, string>;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new FilenPublicExpress({
  user: { sdkConfig: credentials },
  logger: { instance: Logger }
});

await server.start();
