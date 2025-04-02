# Admin Controller

The `AdminController` provides various functionalities for admin users to manage users, transactions, and accounts. Below are the details of the functionalities provided by the `AdminController`.

## Functions

### 1. Get Users
**Endpoint:** `GET /admin/users`

**Description:** Retrieves a paginated list of users.

**Parameters:**
- `page` (optional): The page number for pagination (default is 1).
- `limit` (optional): The number of users per page (default is 10).

**Response:**
- `200 OK`: Successfully retrieved users.
- `500 Internal Server Error`: Failed to fetch users.

### 2. Get User
**Endpoint:** `GET /admin/users/:userId`

**Description:** Retrieves details of a specific user by user ID.

**Parameters:**
- `userId`: The ID of the user to retrieve.

**Response:**
- `200 OK`: Successfully retrieved user.
- `400 Bad Request`: Failed to retrieve user.
- `500 Internal Server Error`: Error occurred while retrieving user.

### 3. Get Transactions
**Endpoint:** `GET /admin/transactions`

**Description:** Retrieves a paginated list of transactions.

**Parameters:**
- `page` (optional): The page number for pagination (default is 1).
- `limit` (optional): The number of transactions per page (default is 10).

**Response:**
- `200 OK`: Successfully fetched transactions.
- `400 Bad Request`: Failed to fetch transactions.
- `500 Internal Server Error`: Error occurred while fetching transactions.

### 4. Get Transaction
**Endpoint:** `GET /admin/transactions/:transactionId`

**Description:** Retrieves details of a specific transaction by transaction ID.

**Parameters:**
- `transactionId`: The ID of the transaction to retrieve.

**Response:**
- `200 OK`: Successfully retrieved transaction.
- `400 Bad Request`: Failed to retrieve transaction.
- `500 Internal Server Error`: Error occurred while retrieving transaction.

### 5. Get Accounts
**Endpoint:** `GET /admin/accounts`

**Description:** Retrieves a paginated list of accounts.

**Parameters:**
- `page` (optional): The page number for pagination (default is 1).
- `limit` (optional): The number of accounts per page (default is 10).

**Response:**
- `200 OK`: Successfully fetched accounts.
- `400 Bad Request`: Failed to fetch accounts.
- `500 Internal Server Error`: Error occurred while fetching accounts.


# User Controller

The `UserController` provides various functionalities for users to manage their accounts and transactions. Below are the details of the functionalities provided by the `UserController`.

## Functions

### 1. Deposit Fund
**Endpoint:** `POST /user/deposit`

**Description:** Allows a user to deposit funds into their account.

**Parameters:**
- `accountId`: The ID of the account to deposit funds into.
- `amount`: The amount of money to deposit.
- `currency`: The currency of the deposit.

**Response:**
- `200 OK`: Successfully deposited funds.
- `400 Bad Request`: Validation failed or bad request.
- `500 Internal Server Error`: Error occurred while depositing funds.

### 2. Transfer Funds
**Endpoint:** `POST /user/transfer`

**Description:** Allows a user to transfer funds from one account to another.

**Parameters:**
- `fromAccountId`: The ID of the account to transfer funds from.
- `toAccountId`: The ID of the account to transfer funds to.
- `amount`: The amount of money to transfer.

**Response:**
- `200 OK`: Successfully transferred funds.
- `500 Internal Server Error`: Error occurred while transferring funds.

### 3. Get Profile
**Endpoint:** `GET /user/profile`

**Description:** Retrieves the profile information of the logged-in user.

**Parameters:**
- None (the user ID is extracted from the authenticated request).

**Response:**
- `200 OK`: Successfully retrieved user profile.
- `400 Bad Request`: Failed to retrieve user profile.
- `500 Internal Server Error`: Error occurred while retrieving user profile.

## Usage

To use these endpoints, make sure your server is running and you have the necessary permissions to access the admin routes. You can use tools like Postman or cURL to test these endpoints.

# Auth Controller

The `AuthController` provides functionalities for user authentication and registration. Below are the details of the functionalities provided by the `AuthController`.

## Functions

### Register User
**Endpoint:** `POST /auth/register`

**Description:** Registers a new user in the system.

**Steps:**
1. **Validation:**
   - The request body is validated against a predefined schema (`registerSchema`).
   - If validation fails, a `400 Bad Request` response is returned with the validation errors.

2. **Start Transaction:**
   - A new session is started with MongoDB, and a transaction is initiated.

3. **Check Existing User:**
   - The system checks if a user with the provided email already exists.
   - If an existing user is found, a `400 Bad Request` response is returned with a message indicating that the user already exists.

4. **Create New User:**
   - If no existing user is found, a new user is created with the provided details (`name`, `email`, `password`, `role`, `currency`).
   - The password will be hashed in a pre-save hook (not shown in the excerpt).
   - The default role is set to "user" if not provided.
   - The default currency is set to "USD" if not provided.
   - The initial balance is set to 0.

**Parameters:**
- `name`: The name of the user.
- `email`: The email address of the user.
- `password`: The password for the user account.
- `role` (optional): The role of the user (default is "user").
- `currency` (optional): The currency for the user's account (default is "USD").

**Response:**
- `200 OK`: Successfully registered the user.
- `400 Bad Request`: Validation error or user already exists.
- `500 Internal Server Error`: Error occurred during the registration process.

## Note
All routes are authenticated except the login and the register routes. You would need a token which is provided on login to access the authenticated routes. 

## Test

Run Test by running this command in the root directory of the project

```
npm run test 
```
All 21 tests should pass

## Containerizatio

The application work well in a container.

Have your database et up as specified in the url and run 

```
docker-compose up
```
The image will be built and lauched in the container

## Example Requests

### Get Users
```sh
curl -X GET 'http://localhost:5000/admin/users?page=1&limit=10'
