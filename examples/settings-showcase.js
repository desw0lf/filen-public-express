import { FilenPublicExpress, Logger } from "filen-public-express";

const { FILEN_EMAIL, FILEN_PASSWORD } = process.env;

const credentials = {
  email: FILEN_EMAIL,
  password: FILEN_PASSWORD,
};

const server = new FilenPublicExpress({
  user: { sdkConfig: credentials },
  config: {
    // masterBucket: "public_myimages",
    // expressTrustProxy: 2,
    corsBucketFileName: ".cors.json",
    corsBucketCacheTTLMinutes: 40,
    corsBucketCachePurgeUrl: "/cors-cache-purge",
    downloadFileParam: "download",
    ignoreList: ["README.md", { endsWith: ".key" }, { startsWith: "." }, { contains: "__test__" }]
  },
  logger: {
    instance: Logger,
    level: "debug",
    logsPath: "./log/myserver",
    size: "5M",
    interval: "14d",
    compress: "gzip",
    enableConsole: false,
    enableFileLogging: true
  },
  corsOptions: {
    methods: "GET",
    origin: "https://google.com,https://example.com",
  },
  rateLimit: {
    windowMs: 1200,
    limit: 1400
  }
});

await server.start();

