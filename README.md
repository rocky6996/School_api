# School Management API

This Node.js API provides endpoints to manage school data with location-based sorting capabilities.

## Features

- Add new schools with location data
- List schools sorted by proximity to a given location
- Input validation
- MySQL database integration
- Comprehensive API documentation
- Postman collection for testing

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Local Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd school-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=school_management
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Deployment Guide

### Deploying to Heroku

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add MySQL addon:
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

5. Push to Heroku:
   ```bash
   git push heroku main
   ```

### Environment Variables

Set the following environment variables in your hosting platform:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`

## API Documentation

### 1. Add School
- **Endpoint:** POST `/addSchool`
- **Headers:** 
  - Content-Type: application/json
- **Payload:**
  ```json
  {
    "name": "School Name",
    "address": "School Address",
    "latitude": 12.345678,
    "longitude": 98.765432
  }
  ```
- **Response:**
  ```json
  {
    "message": "School added successfully",
    "schoolId": 1
  }
  ```

### 2. List Schools
- **Endpoint:** GET `/listSchools`
- **Query Parameters:**
  - latitude: User's latitude (float, -90 to 90)
  - longitude: User's longitude (float, -180 to 180)
- **Example:** `/listSchools?latitude=12.345678&longitude=98.765432`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "name": "School Name",
      "address": "School Address",
      "latitude": 12.345678,
      "longitude": 98.765432,
      "distance": 0
    }
  ]
  ```

## Testing

1. Import the Postman collection:
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json` from this repository

2. Set up environment:
   - Create a new environment in Postman
   - Add variable `base_url` with your API URL
     - Local: `http://localhost:3000`
     - Production: `https://your-app-name.herokuapp.com`

3. Run the requests:
   - All requests use the environment variable for the base URL
   - Examples are included for both successful and error cases

## Sharing the API

1. **For Stakeholders:**
   - Share the Postman collection file (`postman_collection.json`)
   - Provide the base URL for the deployed API
   - Share this README for reference

2. **For Developers:**
   - Grant repository access
   - Share database credentials securely
   - Provide deployment access if needed

## Support

For any questions or issues:
1. Check the existing documentation
2. Contact the development team
3. Create an issue in the repository
