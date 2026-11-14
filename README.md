# WhichBin Orlando

WhichBin Orlando helps Orlando residents find recycling and disposal guidance for household items. The React frontend is hosted on Vercel; the Spring Boot API and MySQL database run in Docker on the Jenkins deployment host.

## Features

- **Items:** Search household items for recycling and disposal guidance.
- **Announcements:** Browse community updates and announcements.
- **Resources:** Read articles and guides, and explore recycling trivia.

## Technologies

- **Frontend:** React, TypeScript, Vite
- **Backend:** Java 21, Spring Boot, Maven
- **Database:** MySQL 8.4
- **Deployment:** Vercel, Jenkins, Docker Compose

## Local development

### Requirements

- Java 21
- Node.js 20 or later
- MySQL 8.4 (local installation or Docker)

### Start MySQL

Create local databases for the application and tests:

```sql
CREATE DATABASE whichbin_db;
CREATE DATABASE whichbin_test;
```

Use a local MySQL account with access to both databases. Do not use production database credentials for development or tests.

### Run the API

Open the repository root (the folder containing the root `pom.xml`) in IntelliJ IDEA and allow it to import the Maven projects. Set the project SDK to Java 21.

Create a Spring Boot run configuration through **Run → Edit Configurations → + → Spring Boot**:

1. Set **Name** to `WhichBin API (local)`.
2. Set **Main class** to `com.whichbin.whichbin_api.WhichBinApiApplication` and select the `whichbin-api` module for the classpath.
3. Set **Active profiles** to `local`. This profile disables HTTPS and uses port `5000`.
4. Under **Modify options**, enable **Environment variables** and add your local database connection:

   | Name | Value |
   | --- | --- |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/whichbin_db?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC` |
   | `SPRING_DATASOURCE_USERNAME` | Your local MySQL username |
   | `SPRING_DATASOURCE_PASSWORD` | Your local MySQL password |

5. Click **Apply**, then **Run**.

The API is available at <http://localhost:5000/api/> and its documentation at <http://localhost:5000/api/swagger-ui/index.html>.

### Run the frontend

Open the `whichbin-client` folder in Visual Studio Code. In **Terminal → New Terminal**, run:

```powershell
npm ci
npm run dev
```

The frontend is available at <http://localhost:7000>. It uses `http://localhost:5000/api/` as its default API URL. For a different local API URL, set `VITE_API_URL` in `whichbin-client/.env.local`.

Both frontend and backend development versions come from the root `pom.xml` `<revision>` property (`0.0.0` by default). You can change that value for local development.

### Run tests and checks

Run backend tests from IntelliJ using the gutter run icon beside a test or test class. For a full-suite run, create a **JUnit** run configuration that runs all tests in the `whichbin-api` module. Set the following environment variables in the configuration so tests use the separate `whichbin_test` database:

| Name | Value |
| --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/whichbin_test?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | Your local MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Your local MySQL password |

The test profile creates and drops its schema. Never point it at a database containing data you need. Keep local credentials in your IntelliJ run configuration; do not commit them.

Run frontend tests, lint, or a production build from the VS Code terminal in `whichbin-client`:

```powershell
npm test
npm run lint
npm run build
```

## Production deployment

### Deployment flow

The frontend and backend deploy independently:

1. **Vercel** builds and deploys `whichbin-client`.
2. **Jenkins** polls the configured Git branch every minute.
3. Jenkins runs backend tests using a temporary MySQL 8.4 container.
4. Jenkins generates the production version from the nearest reachable `vMAJOR.MINOR.PATCH` Git tag plus the repository's total commit count.
5. Jenkins builds and deploys the API and MySQL using the root `compose.yaml`.

The Jenkins pipeline is in the root `Jenkinsfile`. It requires an agent labeled `whichbin-deploy`, and each pipeline run has a 10-minute timeout.

### Set up the Jenkins host and job

The Jenkins agent must run on the Windows deployment host and use Docker Desktop in **Linux containers** mode. Install Git, Java 21, Node.js, Docker Compose v2, and the Jenkins Pipeline, Git, Credentials Binding, and PowerShell plugins. Run the agent as the same Windows account that runs Docker Desktop, and keep Docker Desktop running during builds.

Create a Pipeline job:

1. Select **Pipeline script from SCM** and choose **Git**.
2. Enter the GitHub repository URL and credentials if the repository is private.
3. Set **Branch Specifier** to `*/main`.
4. Set **Script Path** to `Jenkinsfile`.
5. Save. The Jenkinsfile defines the polling schedule; no separate trigger is needed.

Give the Jenkins agent the `whichbin-deploy` label. The first Docker image build may exceed the current 10-minute timeout; if it does, increase the `timeout` in the Jenkinsfile and rerun.

### Add Jenkins credentials

Create these credentials in Jenkins with the exact IDs below, in a scope available to the job:

| Credential ID | Jenkins type | Value |
| --- | --- | --- |
| `whichbin-tls-pfx` | Secret file | Full-chain `.pfx` certificate |
| `whichbin-db-username` | Secret text | Production MySQL application username |
| `whichbin-db-password` | Secret text | Production MySQL application password |
| `whichbin-db-root-password` | Secret text | Production MySQL root password |
| `whichbin-tls-keystore-password` | Secret text | Password for the PFX |
| `whichbin-client-url` | Secret text | Exact Vercel/custom-domain origin, e.g. `https://www.whichbin-orlando.org` |

The certificate is mounted read-only into the API container at runtime; it is not copied into the image or committed to Git. Update the Jenkins secret-file credential before the certificate expires.

### Configure Vercel and HTTPS

In Vercel, set the project **Root Directory** to `whichbin-client`, enable **Include files outside the root directory** so the shared root version script and Maven file are available during builds, and use `npm run build` as the build command. Set this environment variable for Production (and Preview if previews should call the production API):

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<api-domain>/api/` |

Production builds on Vercel use the shared version script; when Vercel's checkout is shallow or lacks tags, it uses Vercel's repository and branch metadata to fetch the reachable release tag and full commit history. The local Vite dev server uses the POM version instead.

The API serves HTTPS directly on port `443` using the Jenkins-managed PFX. Point the API domain's DNS to the Docker host and allow inbound TCP port `443` in the host firewall. Set `whichbin-client`'s `VITE_API_URL` to that API domain. Set the Jenkins `whichbin-client-url` credential to the frontend's exact origin (scheme and hostname only, no path or trailing slash) for API CORS.

### Release versions

Before merging a release branch into `main`, create a GitHub Release and a `vMAJOR.MINOR.PATCH` tag on that release branch. Then merge the release branch. Jenkins uses the nearest reachable version tag and appends the full commit count, for example `1.1.0.321`. Ensure the tag is pushed and reachable from `main` for the deployment build.

The Compose stack keeps MySQL data in the persistent `mysql_data` volume across deployments. Do not remove that volume unless you intend to delete the production database.
