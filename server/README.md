# Server

## Instructions (local)

Install packages (use npm or yarn)
```
yarn install
```

Make sure there's `.env` file in root folder with content:
```
NODE_ENV="local"
PORT=8080
DATABASE_URL=postgres://<DB_USERNAME_HERE>:<DB_PASSWORD_HERE>@localhost:5432/<DB_NAME_HERE>?sslmode=disable"

# example:
# username: inclusiveai
# password: inclusiveai123
# db name:  inclusive_ai
# DATABASE_URL="postgres://inclusiveai:inclusiveai123@localhost:5432/inclusive_ai?sslmode=disable"

PRIMARY_REGION="sea"
FLY_REGION="sea"

CONSIDER_USERS_AFTER_DATE="2023-10-04T12:00:00.000Z"

OPENAI_API_KEY=<KEY_HERE>
```

Make sure your Postgres database is also running locally (you should not see `ECONNREFUSED` in terminal). If you don't have Postgres installed, download the [Postgres.app](https://postgresapp.com/) and set up a local database via their tutorials.

Run server (this will respond to local website)
```
yarn dev
```

This will host the server at `localhost:8080`. You should see messages like these:
```
{"level":"info","message":"Listening on port 8080","timestamp":"2024-01-24T11:25:46.495Z"}
{"level":"info","message":"Database connected to postgres://inclusiveai:inclusiveai123@localhost:5432/inclusive_ai?sslmode=disable","timestamp":"2024-01-24T11:25:46.627Z"}
```

If you don't see these messages, make sure that `PORT` and Postgres credentials are set correctly in `.env` and Postgres is running locally. 

## Scripts

To execute certain actions, you must run a pre-defined set of scripts:

Create Pods. Make sure to modify the content of pods hardcoded in `src/scripts/create-pods.ts` before running the script.
```
yarn create-pods
```

Create a Proposal. Make sure to modify the content of proposal hardcoded in `src/scripts/create-proposal.ts` before running the script. Make sure to create pods before creating proposals.
```
yarn create-proposal
``` 

Create Value Questions. Make sure to modify the content of proposal hardcoded in `src/scripts/create-value-questions.ts` before running the script. Make sure to create pods and proposals before creating proposals.
```
yarn create-value-questions
```

Exporting data. You can export different types of data using these scripts. Make sure to modify the code content within each `src/scripts/export-*.ts` scripts to retrieve the correct data. Make sure that Postgres database is running to fetch the data.
```
yarn export-data
yarn export-votes
yarn export-new-users
yarn export-by-voters-phase
```
