import { FilenPublicExpress } from "filen-public-express";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new FilenPublicExpress({
  user: { sdkConfig: credentials },
  config: {
    masterBucket: "public_myimages"
  },
  corsOptions: {
    methods: "GET",
    origin: "https://myimages.eu.net",
  }
});

await server.start();
