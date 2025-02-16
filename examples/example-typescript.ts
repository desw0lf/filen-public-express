import { FilenPublicExpress } from "../src/index.ts";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env as Record<string, string>;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new FilenPublicExpress({
  user: { sdkConfig: { ...credentials } },
  config: {}
});

await server.start();
