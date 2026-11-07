# WhichBin Orlando

WhichBin Orlando is a recycling information application that helps Orlando residents determine how to properly dispose of common household items.

## Features

- Search for items and view disposal guidance.
- Browse educational resources, trivia challenges, and announcements.
- Manage items, resources, announcements, and users through the admin area.

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- Node.js

### Backend

- Java 21
- Spring Boot
- Maven

### Database

- MySQL

### Development tools

- Visual Studio Code
- IntelliJ IDEA
- MySQL Workbench
- Git and GitHub

## Running the project locally

### Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/)
- Visual Studio Code
- Java 21 SDK
- IntelliJ IDEA
- MySQL Server
- MySQL Workbench

### Set up the database

1. Open MySQL Workbench and connect to your local MySQL server.
2. Create a database named `whichbin_db`.

### Run the backend

1. Open the `whichbin-api` folder in IntelliJ IDEA.
2. In `src/main/resources/`, create a file named `application-dev.properties`.
3. Add your local MySQL credentials:

   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```

   Replace `YOUR_PASSWORD` with your local MySQL password.

4. Select `WhichbinApiApplication` in IntelliJ IDEA.
5. Open **Run → Edit Configurations** and set **Active Profiles** to `dev`.
6. Save the configuration and start the application using the **Run** button.

The backend will run at <http://localhost:5000/>.
Dummy data is populated only when the `dev` profile is active. Tests use empty application-data tables and create any records they need.

### Run the frontend

1. Open the `whichbin-client` folder in Visual Studio Code.
2. Open a terminal and install the project dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The frontend will run at <http://localhost:7000/>.

To check the frontend for lint issues or create a production build, run these commands from `whichbin-client`:

```bash
npm run lint
npm run build
```

## API and configuration

Configure the following environment variables when running the application. Defaults are suitable for local development; set the deployment-specific values in the environment where the backend or frontend runs.

| Variable | Default value | Description |
| --- | --- | --- |
| `CLIENT_URL` | `http://localhost:7000` | Backend: allowed frontend origin for CORS. For production, set this to `https://which-bin-orlando.vercel.app` (origin only, with no path or trailing slash). |
| `PORT` | `443` | Backend: server port. The `dev` profile defaults to `5000`. |
| `DB_URL` | `jdbc:mysql://localhost:3306/whichbin_db?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC` | Backend: JDBC URL for the application database. |
| `DB_USERNAME` | `root` | Backend: MySQL username. |
| `DB_PASSWORD` | `password` | Backend: MySQL password. Override with a secure value in the backend environment or local development properties file; do not use the repository's configured value in deployments. |
| `AUTH_TOKEN_TTL` | `PT24H` | Backend: authorization token lifetime, expressed as a Java duration. |
| `AUTH_TOKEN_CLEANUP_CRON` | `0 0 3 * * *` | Backend: schedule for cleaning up expired tokens (daily at 3:00 a.m. server time). |
| `VITE_API_URL` | `http://localhost:5000/api/` | Frontend: base URL of the backend API. |

The API documentation is available at `/api/swagger-ui/index.html` while the backend is running. The API includes endpoints for items, resources and trivia, announcements, and authentication and user management. The root API endpoint at `/api/` returns the running API version.

### Deploy the API and MySQL

The root `compose.yaml` builds and runs the API with MySQL 8.4. The API listens on HTTPS port `443` and connects to the private MySQL service; database data persists in a Docker volume. Only the API port is published. The frontend remains hosted at <https://which-bin-orlando.vercel.app/>.

On the server, from the repository root:

1. Keep the full-chain PFX at `secrets/whichbin-orlando.org-fullchain.pfx`. It is mounted read-only into the API container and excluded from Git and the Docker build context.
2. Create `.env` from `.env.example` only if it does not already exist. Set `TLS_KEYSTORE_PASSWORD` to the PFX password. Keep `.env` private; it is excluded from Git. The database passwords are stored there as well.
3. Start or update the services:

   ```bash
   docker compose up -d --build
   ```

4. Check the API logs if needed:

   ```bash
   docker compose logs -f whichbin-api
   ```

Allow inbound TCP port `443` in the server firewall and point `whichbin-orlando.org` DNS to the server. In Vercel, set `VITE_API_URL` to `https://whichbin-orlando.org/api/`. Compose allows the Vercel frontend origin for API requests. Do not remove the `mysql_data` volume unless you intend to delete the database.

## Project structure

```text
WhichBin-Orlando/
├── whichbin-client/    # React frontend
└── whichbin-api/       # Spring Boot backend
```

## Development workflow

Use Git and GitHub for version control. Work on assigned features in branches, then merge completed work into the appropriate development branch after review and testing.

## Running backend unit tests locally

Pull requests automatically run the backend Maven tests in GitHub Actions against a temporary MySQL database.

1. In MySQL Workbench, create a separate database for tests:

   ```sql
   CREATE DATABASE whichbin_test;
   ```

2. In `whichbin-api/src/main/resources/`, create a file named `application-test-local.properties` with your local MySQL credentials:

   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```

   Replace `YOUR_PASSWORD` with your local MySQL password.

3. From the `whichbin-api` directory, run the tests:

   ```powershell
   .\mvnw.cmd test
   ```

The tests use the `whichbin_test` database. Its tables are created and dropped automatically, so do not configure the test profile to use a database containing data you need to keep.
Each unit test is Transactional and rolls back any data created/modified after the test case is done running.