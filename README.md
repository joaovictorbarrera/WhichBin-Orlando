# WhichBin Orlando

WhichBin Orlando is a recycling information application designed to help Orlando residents quickly determine how to properly dispose of common household items.

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* Node.js

**Backend**

* Java 21
* Spring Boot
* Maven

**Database**

* MySQL

**Development Tools**

* Visual Studio Code
* IntelliJ IDEA
* MySQL Workbench
* Git and GitHub

## Running the Project Locally

### Prerequisites

Install the following before running the application:

* [Node.js](https://nodejs.org/)
* Visual Studio Code
* Java 21 SDK
* IntelliJ IDEA
* MySQL Server
* MySQL Workbench

### 1. Set Up the Database

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Create a new schema named:

```text
whichbin_db
```

### 2. Run the Backend

1. Open the `whichbin-api` folder in IntelliJ IDEA.
2. Navigate to:

```text
src/main/resources/
```

3. Create a file named:

```text
application-dev.properties
```

4. Add your local MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with your local MySQL password.

5. In IntelliJ, select `WhichbinApiApplication`.
6. Open **Run → Edit Configurations**.
7. Set the **Active Profiles** field to:

```text
dev
```

8. Save the configuration.
9. Start the application using the green **Run** button.

The backend will run at:

```text
http://localhost:5000/
```

### 3. Run the Frontend

1. Open the `whichbin-client` folder in Visual Studio Code.
2. Open the terminal.
3. Install the project dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:7000/
```

## Project Structure

```text
WhichBin-Orlando/
├── whichbin-client/    # React frontend
└── whichbin-api/       # Spring Boot backend
```

## Development Workflow

The project uses Git and GitHub for version control. Developers should work on their assigned features using branches and merge completed work into the appropriate development branch after review and testing.
