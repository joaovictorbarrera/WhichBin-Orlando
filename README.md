# WhichBin Orlando

WhichBin Orlando is a recycling information application that helps Orlando residents determine how to properly dispose of common household items.

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

## Project structure

```text
WhichBin-Orlando/
├── whichbin-client/    # React frontend
└── whichbin-api/       # Spring Boot backend
```

## Development workflow

Use Git and GitHub for version control. Work on assigned features in branches, then merge completed work into the appropriate development branch after review and testing.

## Running backend unit tests locally

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
