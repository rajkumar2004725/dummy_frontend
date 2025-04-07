# Evrlink2 Backend

## Overview
Evrlink2 is a backend application designed to manage an NFT gift marketplace. It allows users to mint backgrounds as NFTs, create gift cards, and facilitate transactions between users. The application is built using Node.js, Express, and MySQL.

## Project Structure
```
evrlink2-backend
├── db
│   ├── migrations
│   │   └── 001_create_tables.sql
│   ├── seeds
│   │   └── seed_data.sql
│   └── db_config.js
├── src
│   ├── app.js
│   ├── controllers
│   │   └── dbController.js
│   └── models
│       ├── Background.js
│       ├── GiftCard.js
│       ├── Transaction.js
│       └── User.js
├── package.json
├── .env
└── README.md
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd evrlink2-backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js and npm installed. Then run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your database connection details:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   ```

4. **Run Database Migrations**
   Execute the SQL commands to create the necessary tables:
   ```bash
   mysql -u your_database_user -p your_database_name < db/migrations/001_create_tables.sql
   ```

5. **Seed the Database**
   Optionally, you can populate the database with initial data:
   ```bash
   mysql -u your_database_user -p your_database_name < db/seeds/seed_data.sql
   ```

6. **Start the Application**
   Run the application using:
   ```bash
   node src/app.js
   ```

## Usage
- The API endpoints are available for interacting with the NFT gift marketplace. You can use tools like Postman or curl to test the endpoints.
- Refer to the API documentation for details on available routes and their functionalities.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.