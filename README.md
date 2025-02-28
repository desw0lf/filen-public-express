[![preview](https://github.com/user-attachments/assets/44822c21-73a5-47c4-a80b-72e924cdf213)](#)

<blockquote>
<div>
  <div>
    <h3>Filen Public Express</h3>
    <p>
      <em>Serve static files publicly via filen.io buckets</em>
    </p>
    <p>

[![NPM](https://img.shields.io/npm/v/filen-public-express.svg?style=flat-square)](https://www.npmjs.com/package/filen-public-express) [![lang](https://img.shields.io/github/languages/top/desw0lf/filen-public-express?style=flat-square&color=b141e1&logo=typescript)](#) [![license](https://img.shields.io/github/license/desw0lf/filen-public-express?style=flat-square&logo=opensourceinitiative&logoColor=white&color=b141e1)](./LICENSE)
    </p>
    <p style="background-color: #FF474C;">
      <span><a href="#">
        <img src="https://github.com/user-attachments/assets/e0609bbb-82c3-4118-8d84-fe9a7d4d7272" alt="filen" width="120"></a></span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span><a href="#">
        <img src="https://github.com/user-attachments/assets/4c7bfea5-261a-4629-af20-ffef39d4e190" alt="express" width="140"></a></span>
    </p>
  </div>
</div>
</blockquote>
<br />

## 🔗 Table of Contents

- [📍 Overview](#-overview)
- [👾 Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [☑️ Prerequisites](#️-prerequisites)
  - [⚙️ Installation](#️-installation)
  - [🤖 Usage](#-usage)
- [🔧 Configuration](#-configuration)
  - [`config` Options](#config-options)
  - [`corsOptions`](#corsoptions)
  - [`.filen-public.json` Configuration](#filen-publicjson-configuration)
- [⌨️ Examples](#️-examples)
- [❕ Disclaimer](#-disclaimer)
- [🎗 License](#-license)
- [🙌 Acknowledgments](#-acknowledgments)

## 📍 Overview

A lightweight, unofficial static file server powered by the Filen.io SDK. Designed for public, read-only access to files such as images, PDFs, and videos.

## 👾 Features

- Serve files from either **all** public buckets — or via one specific master bucket<sup>[1](#config-options)</sup>
- Supports server-wide CORS configuration, and JSON CORS configurations<sup>[2](#config-options)</sup><sup>[3](#filen-publicjson-configuration)</sup> inside each bucket - mimics [AWS S3 CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html) structure ([example](./examples/.filen-public.json))
- Supports file downloads<sup>[4](#config-options)</sup> via search parameters in **GET** requests (e.g. `.../file.jpg?dl=1`)
- Supports file ignores<sup>[5](#config-options)</sup> (e.g. `["secret.json", { endsWith: ".key" }]`)

## 🚀 Getting Started

### ☑️ Prerequisites

**Node.js version:**
- Minimum: v22.6.0
- Preferred: [v23.7.0](./.nvmrc)

### ⚙️ Installation
<a href="https://www.npmjs.com/package/filen-public-express"><img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white" alt="npm" align="right"></a>

In your project, install using NPM:

```sh
npm install filen-public-express
```

### 🤖 Usage

1. Create a bucket on Filen.io starting with `public_` (e.g. `public_myimages`)
2. Initialize the server:

```typescript
import { FilenPublicExpress } from "filen-public-express";

const server = new FilenPublicExpress({
  user: {
    sdkConfig: {
      email: "yourfilen@email.com",
      password: "yourfilenpassword"
    }
  }
});

await server.start();
```

3. Start the server:

```sh
node server.js
```

You should now be able to access the files in your public buckets in your browser.
(e.g. `http://localhost:1700/myimages/mydog.jpg`)

> [!NOTE]
> Only files in public buckets (with `public_` prefix) can be accessed. (e.g. `public_myimages`) The prefix is omitted in the URL pathname.

## 🔧 Configuration

### `config` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `downloadFileParam` | `string \| null \| undefined \| false` | `"dl"` | <a name="f4"></a><sup>4</sup>Used as query param (e.g. `.../file.pdf?dl=1`) that allows downloading files instead of displaying them inline |
| `masterBucket` | `string \| undefined` | - | <a name="f1"></a><sup>1</sup>Name of the singular bucket that the server will expose publicly _(setting this value will remove the ability for the server to expose other buckets)_ |
| `ignoreList` | `IgnoreRule[]` | - | <a name="f5"></a><sup>5</sup>List of ignore rules for files/keys (e.g. `["secret.json", { endsWith: ".key" }]`) |
| `corsBucketFileName` | `string \| undefined` | `.filen-public.json` | <a name="f2"></a><sup>2</sup>Name for individual JSON CORS configurations inside the bucket |
| `corsBucketCacheTTLMinutes` | `number \| undefined` | `10` | Cache duration for CORS configurations |
| `corsBucketCachePurgeUrl` | `string \| undefined` | - | URL to purge CORS cache (e.g. `"/purge-cors-cache"`) |
| `expressTrustProxy` | `boolean \| number \| string \| string[]` | `false` | Express.js trust proxy setting |
<br/>

### `corsOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `methods` | `"GET"` | `"GET"` | Only GET method is supported |
| `origin` | `string \| string[]` | `"*"` | Allowed Origins/Referers |
<br/>

### `.filen-public.json` Configuration
<a name="f3"></a>
<sup>3</sup>Place this [file](./examples/.filen-public.json) inside your bucket to configure CORS settings:

```json
[
  {
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://example.com"]
  }
]
```

![Bucket File Configuration](https://github.com/user-attachments/assets/df93ff0a-be46-443b-b46c-d032ec0e4c28)

> [!IMPORTANT]
> Must be an array, only `"GET"` method supported, origin `"*"` is used to allow all.
> Mimics [AWS S3 CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html) structure.

## ⌨️ Examples

Examples can be found in the [examples](./examples) folder.

## ❕ Disclaimer

This project is not affiliated with or endorsed by Filen.io. It is provided as is, without any warranties or guarantees. The author assumes no responsibility for any issues, including but not limited to data privacy, security risks, or legal compliance arising from the use of this software. Use at your own risk.

## 🎗 License

Distributed under the AGPL-3.0 License. See [LICENSE](./LICENSE) for more information.

## 🙌 Acknowledgments

This project:
- Uses [filen-sdk-ts](https://github.com/FilenCloudDienste/filen-sdk-ts) - The official Filen.io TypeScript SDK
- Incorporates code from [filen-s3](https://github.com/FilenCloudDienste/filen-s3)
