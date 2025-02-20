import { FilenPublicExpress } from "filen-public-express";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const minimalLogger = {
  log: async (level, msg) => console.log(`[${level}]`, msg),
};

const server = new FilenPublicExpress({
  user: { sdkConfig: credentials },
  logger: { instance: minimalLogger }
});

await server.start();
