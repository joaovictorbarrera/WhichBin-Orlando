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

### Frontend

The frontend uses only this API configuration variable:

| Variable | Local default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api/` | Base URL of the backend API. Set it in `whichbin-client/.env.local` for local development and in the frontend hosting provider's environment settings for deployment, for example `https://<api-domain>/api/`. |

### Backend

These variables configure the Spring Boot API. Local defaults are shown; Docker Compose overrides some values for the container deployment.

| Variable | Local default or Compose value | Description |
| --- | --- | --- |
| `CLIENT_URL` | Local: `http://localhost:7000`; Compose fallback: `https://www.whichbin-orlando.org` | Allowed frontend origin for CORS. Set to the frontend's exact origin, including scheme but without a path or trailing slash. |
| `PORT` | `443` (`dev` profile: `5000`); Compose: `443` | HTTPS port used by the API. |
| `DB_URL` | `jdbc:mysql://localhost:3306/whichbin_db`; Compose: `jdbc:mysql://mysql:3306/whichbin_db` | JDBC URL for the application database. Compose uses the MySQL service name `mysql`. |
| `DB_USERNAME` | Local: `root`; Compose: required in root `.env` | MySQL application-user name. |
| `DB_PASSWORD` | Local: `password`; Compose: required in root `.env` | MySQL application-user password. Use a strong, unique value in deployments. |
| `TLS_KEYSTORE` | `file:/run/secrets/whichbin-orlando.org-fullchain.pfx` | Path to the PKCS#12 TLS keystore. Compose mounts the PFX at this path. |
| `TLS_KEYSTORE_PASSWORD` | Empty locally; required in root `.env` for Compose | Password used to protect the PFX keystore. |
| `AUTH_TOKEN_TTL` | `PT24H` | Authorization token lifetime, expressed as a Java duration. |
| `AUTH_TOKEN_CLEANUP_CRON` | `0 0 3 * * *` | Schedule for cleaning up expired tokens (daily at 3:00 a.m. server time). |

The MySQL container also requires `DB_ROOT_PASSWORD` in the root `.env`. This is used by the MySQL image to initialize the database root account; it is not a Spring Boot API variable. Changing it in `.env` does not change the root password in an already-initialized `mysql_data` volume. The root `.env` should define `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`, and `TLS_KEYSTORE_PASSWORD`; `CLIENT_URL` can also be set there to override the Compose fallback. See `.env.example` for placeholder entries. Never commit real secrets.

The Docker image starts the API with a 512 MB maximum Java heap and a 64 MB initial heap by default. Set `JAVA_OPTS` in the deployment environment to override these JVM options. The heap limit is not a hard limit on total process memory: leave room for the JVM, threads, and native memory in the hosting service's memory limit. Tomcat concurrency and the MySQL connection pool are also kept small by default and can be adjusted with the variables above if traffic requires it.

The API documentation is available at `/api/swagger-ui/index.html` while the backend is running. The API includes endpoints for items, resources and trivia, announcements, and authentication and user management. The root API endpoint at `/api/` returns the running API version.

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

### Deploy the API and MySQL

The root `compose.yaml` builds and runs the API with MySQL 8.4. The API listens on HTTPS port `443` and connects to the private MySQL service; database data persists in a Docker volume. The API publishes port `443`. MySQL is available to host tools at `127.0.0.1:3307` and is not exposed to the network. The frontend remains hosted separately.

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

Allow inbound TCP port `443` in the server firewall and point the API domain's DNS to the server. In the frontend hosting provider, set `VITE_API_URL` to `https://<api-domain>/api/`. Set `CLIENT_URL` to the frontend's exact origin so the API accepts its cross-origin requests. Do not remove the `mysql_data` volume unless you intend to delete the database.
