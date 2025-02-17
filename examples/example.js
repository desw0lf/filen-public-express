import { FilenPublicExpress, Logger } from "../dist/index.js";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new FilenPublicExpress({
  user: { sdkConfig: credentials },
  logger: { instance: Logger }
});

await server.start();
