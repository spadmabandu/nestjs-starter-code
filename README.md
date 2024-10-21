# NestJS Project Starter Code

## Description

This repository can be used as TypeScript starter code for a [NestJS](https://github.com/nestjs/nest) project. The following basic features, which are common requirements for many web-based project, have already been implemented:

- User and Auth modules with basic functionality (signup, login, validate)
- REST endpoints for authentication (signup and login) and associated authorization (endpoint protection)
- JWT management
- Input validation using class-transformer and class-validator
- TypeORM integration using a PostgreSQL database (can be substituted for a different TypeORM-supported SQL database)
- Unit testing

## Table of Contents

1. [Description](#description)
2. [Project Setup](#project-setup)
3. [Compile and Run](#compile-and-run)
4. [Testing](#testing)
5. [Usage](#usage)
6. [Technologies Used](#technologies-used)
7. [License](#license)

## Project Setup and Configuration

1. **Clone the repository**:

   ```bash
   git clone https://github.com/spadmabandu/nestjs-starter-code.git
   ```

   ```bash
   cd your-project-name
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a database**:
   Create a database and obtain the connection details (host, port, name, username, and password). These will later be populated as environment variables.

4. **Set up environment variables**:
   Create a .env file (or .env.local if separating local and development environments) in the project root. All required starter environment variables can be found in the .env.example file, but the values will need to be populated.

   The project will throw an error on startup if any environment variables are missing. Any new environment variables can be added to this validation process by adding them to the `EnvironmentVariables` class in `config/config.validation.ts`.

   Database-specific configuration is consolidated and exported in `config/database.config.ts` to provide a single object with all database configuration values. These can be accessed anywhere in the application via the [NestJS ConfigModule](https://docs.nestjs.com/techniques/configuration).

## Compile and Run

1. Development

   ```bash
   npm run start:dev
   ```

2. Production

   ```bash
   npm run build
   ```

   ```bash
   npm run start
   ```

## Testing

Unit tests for all Services and Controllers in the User and Auth modules are provided using NestJS's default testing module and Jest. This structure can be replicated and expanded to other modules as they are developed.

1. Run unit tests

   ```bash
   npm run test
   ```

2. Run End-to-End (E2E) tests

   ```bash
   npm run test:e2e
   ```

## Usage

1. Create a new user
   To create a new user, send a POST request to the following endpoint:
   POST /users/signup

   **Request Body:**

   ```json
   {
     "email": "user@example.com",
     "password": "your_password",
     "firstName": "first_name",
     "lastName": "last_name"
   }
   ```

   You will receive an `access_token`, which is a JWT encoded with the user's id and email. This token can be used as a Authorization Bearer token in any subsequent request to authorize the user for specific actions.

   **Example Response:**

   ```json
   {
     "access_token": "user_specific_jwt_encoded_string"
   }
   ```

2. Login
   To login to the application, send a POST request to the following endpoint (using credentials of an existing user):

   ```
   POST /auth/login
   ```

   **Request Body:**

   ```json
   {
     "email": "user@example.com",
     "password": "your_password"
   }
   ```

   You will receive an `access_token`, which is a JWT encoded with the user's id and email. This token can be used as a Authorization Bearer token in any subsequent request to authorize the user for specific actions.

   **Example Response:**

   ```json
   {
     "access_token": "user_specific_jwt_encoded_string"
   }
   ```

   Login is protected via a LocalAuthGuard, which intercepts the incoming request, validates the user based on the email and password in the incoming request, and attach basic user information (such as the user id) to the request before passing it to the Controller.

3. Fetch a user's profile information
   Send a request to the following endpoint:

   ```
   GET /users/profile
   ```

   The Authorization type for this request should be `Bearer Token`. The token value should be the `access_token` obtained from either the `login` or `signup` process.

   The response will be all data fields on the User entity except the hashed password, which is stripped from the User object before being returned.

   **Example Response:**

   ```json
   {
     "isActive": true,
     "id": "user_uuid",
     "email": "user@example.com",
     "firstName": "first_name",
     "lastName": "last_name"
   }
   ```

   This endpoint is protected via a JwtAuthGuard, which intercepts the incoming request, decodes the Bearer token, and attaches the decoded object (which includes user data such as the user id) to the request.

## Technologies & Frameworks Used

Backend:

- NestJS
- TypeORM
- PostgreSQL
- REST
- Passport (authentication)

Testing:

- Jest (unit and E2E testing)
- Supertest (HTTP requests)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
