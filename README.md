# Interface — Event Registration Platform

An Express-based event-registration project using MongoDB for registration records, Cloudinary for receipt uploads, and Nodemailer for confirmation and contact emails.

**Node.js · Express · MongoDB · Cloudinary · Nodemailer**

## Current status

This repository includes the registration server, `models/`, and `public/`. Service credentials and a configured MongoDB database are required. The source still contains 2025 event copy; review dates and email templates before reusing it.

## Implemented server workflows

| Route | Purpose |
| --- | --- |
| `GET /` | Festival home page |
| `GET /register` | Registration form |
| `POST /register` | Validate registration, upload receipt, save record, send email |
| `GET /admin` | Admin page behind HTTP Basic authentication |
| `GET /all` | Registration records behind HTTP Basic authentication |
| `GET /preRegister` | Pre-registration page |
| `GET /contact`, `POST /contact` | Contact page and email submission |

## Getting started

Install Node.js/npm and configure MongoDB, Cloudinary, and a mail account.

```bash
git clone https://github.com/tejas764/interface-3.git
cd interface-3
npm install
```

Create a local `.env` with your own values:

```dotenv
MONGO_URI=your-mongodb-connection-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-mail-account
EMAIL_PASS=your-mail-app-password
ADMIN_USER=choose-an-admin-name
ADMIN_PASS=choose-a-strong-admin-password
PORT=3000
```

Start the server:

```bash
npm start
```

Open http://localhost:3000. For development, `npm run dev` runs Nodemon.

## Project structure

| Path | Purpose |
| --- | --- |
| [server.js](server.js) | Registration, admin, contact, and mail routes |
| [cloudinary.js](cloudinary.js) | Cloudinary settings read from environment variables |
| [package.json](package.json) | Dependencies and available scripts |
| [models/](models/) | Registration data model |\n| [public/](public/) | Frontend pages and assets |\n
## Operational notes

- Configure strong admin credentials: the code includes weak fallback values. Use HTTPS for HTTP Basic authentication.
- Registration saves to MongoDB before sending email; an email failure can leave a saved record even when the request reports failure.
- Receipt upload is not automatic payment verification.
- Keep credentials local and review any tracked environment files before deployment.
- `npm test` is currently a placeholder, not an automated test suite.

## Related work and credits

The package metadata references [ChandraShekarA03/Interface2025-2](https://github.com/ChandraShekarA03/Interface2025-2). Preserve existing contributor attribution when extending this project. The manifest declares ISC; a standalone license file is not included.

[Static landing-page prototype](https://github.com/tejas764/Interface-Cucs)
