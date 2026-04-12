# Environment Variables Setup

## Overview
This project uses environment variables stored in a `.env` file for sensitive configuration like database credentials and JWT secrets.

## Setup Instructions

### 1. Create .env File
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Configure Credentials
Edit `.env` and replace placeholder values with your actual credentials:
```properties
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
JWT_SECRET=your_long_random_secret_key
```

### 3. Running the Application

#### Local Development (with .env file)
```bash
# The application will automatically load .env file on startup
mvn spring-boot:run
```

Or:
```bash
java -jar target/aptitude-system-0.0.1-SNAPSHOT.jar
```

#### Production (using environment variables)
Set environment variables before running:
```bash
# On Linux/Mac
export MONGODB_URI="your_connection_string"
export JWT_SECRET="your_secret"
java -jar target/aptitude-system-0.0.1-SNAPSHOT.jar

# On Windows
$env:MONGODB_URI = "your_connection_string"
$env:JWT_SECRET = "your_secret"
java -jar target/aptitude-system-0.0.1-SNAPSHOT.jar
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret key | `your_long_random_secret_here` |
| `JWT_EXPIRATION` | JWT token expiration in ms | `86400000` (24 hours) |
| `SERVER_PORT` | Server port | `8080` |
| `LOG_LEVEL` | Logging level | `DEBUG` |

## Security Notes

⚠️ **Important**: 
- **Never commit `.env` file to version control** - it contains sensitive credentials
- The `.env` file is listed in `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for documentation
- For production, use your cloud platform's secret management (AWS Secrets Manager, Azure Key Vault, etc.)

## Troubleshooting

### Error: "Database name must not be empty"
Ensure `MONGODB_URI` includes the database name and is properly formatted:
```
mongodb+srv://user:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### Error: ".env file not found"
This is normal if running in production with environment variables. The application will use system environment variables instead.

### Verify Configuration
Check if environment variables are loaded correctly by looking for this in logs:
```
Application startup successful
```
