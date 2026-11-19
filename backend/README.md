# Khutwa Backend

Backend foundation for the Khutwa Job Platform.

## Run locally

```bash
cd backend
npm install
npm run dev
```

The server runs on port `5000` by default. The API test endpoint is:

```text
GET /api/test
```

MongoDB connection preparation is available through `src/config/database.js`. Set `MONGO_URI` in `.env` when MongoDB is ready. The expected local database is `khutwa`.
