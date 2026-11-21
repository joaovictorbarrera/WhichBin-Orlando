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

### Deployment layout

The API is plain HTTP on container port `5000`; TLS terminates at the independent NGINX reverse proxy. NGINX routes by TLS SNI:

| Hostname | Destination |
| --- | --- |
| `api.whichbin-orlando.org` | Production API |
| `betaapi.whichbin-orlando.org` | Staging API |

The deployment files are split into three Compose projects:

- `deployment/production/compose.yaml`: production API and its private MySQL container/volume.
- `deployment/staging/compose.yaml`: staging API and a separate MySQL container/volume.
- `deployment/nginx/compose.yaml`: standalone NGINX, independent of both API deployments.

The API stacks use four pre-created Docker networks: each API and its database share their environment's `*-internal` network; NGINX and the corresponding API share their `*-proxy` network. Consequently, deploying one API Compose project does not restart the other API or NGINX. Production reuses the existing `whichbin-orlando_mysql_data` volume; staging gets its own `whichbin-staging-mysql-data` volume.

### One-time Docker host setup

#### Host requirements

Install Jenkins on the Windows deployment host and install the **Pipeline**, **Git**, **Credentials Binding**, and **PowerShell** plugins. Install Docker Desktop and configure it for **Linux containers**; make sure Docker Compose v2 is available. Also install Git, Java 21, and Node.js on the host so the Jenkins agent can check out the repository, run the version script, and build/test the API.

Run the Jenkins agent as the same Windows account that runs Docker Desktop, and keep Docker Desktop running during builds.

Git must support Windows long paths. The Jenkins SCM checkout happens before the Jenkinsfile runs, so this cannot be fixed in a pipeline step. In an elevated PowerShell terminal on the host, enable long paths in the Git installation Jenkins uses:

```powershell
git config --system core.longpaths true
git config --system --get core.longpaths
```

The second command should print `true`. If multiple Git installations are present, configure the one used by the Jenkins service (the path shown by `where.exe git`) and restart the Jenkins service before retrying the checkout.

#### Docker and network setup

From the repository root in an elevated PowerShell terminal, create the external networks once:

```powershell
docker network create --internal whichbin-production-internal
docker network create whichbin-production-proxy
docker network create --internal whichbin-staging-internal
docker network create whichbin-staging-proxy
New-Item -ItemType Directory -Force -Path 'C:\WhichBin\nginx\certs'
```

Allow inbound TCP ports `80` and `443` in the Windows firewall. Point both API DNS A records (`api.whichbin-orlando.org` and `betaapi.whichbin-orlando.org`) at the host's public IP. The website records are configured separately to point to Vercel.

The Jenkins pipeline copies `deployment\nginx\compose.yaml` and `nginx.conf` from its checkout into the persistent `C:\WhichBin\nginx` directory, so the host does not need a permanent clone of the repository. It converts the `whichbin-tls-pfx` credential into `fullchain.pem` and `privkey.pem` in `C:\WhichBin\nginx\certs`. NGINX mounts these persistent paths read-only. Restrict the certificate directory ACLs to the Jenkins/Docker host accounts; the private key is unencrypted PEM. Jenkins compares the config and PFX hashes and validates/reloads NGINX only when either changes. Update the PFX credential before expiry.

Run either API pipeline once to stage the persistent NGINX files and create the certificate files. Then, in PowerShell on the Docker host, start the standalone proxy using the copy staged by Jenkins:

```powershell
docker compose --project-name whichbin-nginx --file C:\WhichBin\nginx\compose.yaml up -d
```

### Jenkins jobs and credentials

The Jenkins pipeline is the root `Jenkinsfile`; it requires an agent labeled `whichbin-deploy` and has a 10-minute timeout. Create two **Pipeline script from SCM** jobs for this repository, both using `Jenkinsfile` and the Jenkinsfile's polling schedule:

| Job | Branch Specifier | Deployment |
| --- | --- | --- |
| Production API | `origin/main` | `whichbin-production` Compose project |
| Staging API | `origin/staging` | `whichbin-staging` Compose project |

Jenkins rejects deployment from other branches. Tags do not trigger deployment or select an environment: the staging and production jobs deploy only their configured branches. Each job tests using a temporary MySQL container, builds an environment-qualified image tag (`production-<version>` or `staging-<version>`), and updates its corresponding GitHub deployment environment.

Create these Jenkins credentials in a scope available to both jobs:

| Credential ID | Jenkins type | Value |
| --- | --- | --- |
| `whichbin-tls-pfx` | Secret file | Full-chain wildcard `.pfx` certificate |
| `whichbin-tls-keystore-password` | Secret text | Password for the PFX |
| `whichbin-db-username` | Secret text | Production MySQL application username |
| `whichbin-db-password` | Secret text | Production MySQL application password |
| `whichbin-db-root-password` | Secret text | Production MySQL root password |
| `whichbin-client-url` | Secret text | Production frontend origin, e.g. `https://www.whichbin-orlando.org` |
| `github-deployments-token` | Secret text | GitHub token with **Deployments: read and write** permission |

Add these separate staging credentials as well:

| Credential ID | Jenkins type | Value |
| --- | --- | --- |
| `whichbin-staging-db-username` | Secret text | Staging MySQL application username |
| `whichbin-staging-db-password` | Secret text | Staging MySQL application password |
| `whichbin-staging-db-root-password` | Secret text | Staging MySQL root password |
| `whichbin-staging-client-url` | Secret text | Staging frontend origin, `https://beta.whichbin-orlando.org` |

Set the `DISCORD_DEPLOYMENT_WEBHOOK` Actions secret for the `discord-deployments.yml` workflow in GitHub's Secrets and variables. The GitHub token registers and updates `Production (Backend)` and `Staging (Backend)` deployment statuses.

### Configure Vercel and API URLs

The production and staging frontend projects are deployed independently on Vercel. Set each project's **Root Directory** to `whichbin-client`, enable **Include files outside the root directory**, and use `npm run build` as the build command. Configure:

| Vercel project | `VITE_API_URL` |
| --- | --- |
| Production | `https://api.whichbin-orlando.org/api/` |
| Staging | `https://betaapi.whichbin-orlando.org/api/` |

Production builds on Vercel use the shared version script; when Vercel's checkout is shallow or lacks tags, it uses Vercel's repository and branch metadata to fetch the reachable release tag and full commit history. The local Vite dev server uses the POM version instead.

### Release versions

Use `vMAJOR.MINOR.PATCH` tags for every release, including versions being prepared for staging (for example, `v1.3.0`). Create a `release/MAJOR.MINOR.PATCH` branch and its `vMAJOR.MINOR.PATCH` tag, and mark the corresponding GitHub Release as a pre-release while it is under test. When closed, merge the release branch into `staging`. The version script uses the nearest reachable `vMAJOR.MINOR.PATCH` tag and appends the full commit count to produce the application/image version.

If a staging pipeline fails to build or deploy, fix the pipeline issue on the same release branch and merge the fix into `staging`; do not create a patch release just for a broken pipeline.

If the build succeeds but reveals a logic issue or bug, create a patch release (for example, `v1.3.1`) and follow the release flow for that version.

Once the selected release is merged into `main` and deployed to production, update its GitHub Release from pre-release to the latest production release, and add the full changelog since the last production release.
