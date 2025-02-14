import { F3PublicExpress } from "./dist/index.js";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new F3PublicExpress({
  user: { sdkConfig: credentials },
  config: {}
});

await server.start();
