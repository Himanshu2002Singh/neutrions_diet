# Neutrion Health Backend API

A comprehensive Node.js backend API for the Neutrion Health application that handles health form submissions, BMI calculations, and diet recommendations using MySQL and Sequelize.

## Features

- **Health Profile Management**: Complete CRUD operations for user health profiles
- **BMI Calculations**: Real-time BMI, BMR, and TDEE calculations
- **Diet Recommendations**: Personalized meal plans based on health metrics
- **Medical Condition Support**: Special dietary recommendations for medical conditions
- **Data Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Handling**: Robust error handling with proper HTTP status codes
- **Security**: CORS, Helmet, and other security middleware

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Compression** - Response compression
- **Rate Limiting** - API rate limiting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neutrion-diet/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database and application settings.

4. **Create the database**
   ```sql
   CREATE DATABASE neutrion_health;
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=neutrion_health
DB_USER=root
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Health Profile Management

#### Submit Health Form
```http
POST /api/health/submit/:userId
Content-Type: application/json

{
  "weight": 70,
  "height": 175,
  "age": 30,
  "gender": "male",
  "activityLevel": "moderate",
  "medicalConditions": "diabetes, hypertension",
  "goals": "weight loss, muscle gain"
}
```

#### Get Current Health Profile
```http
GET /api/health/profile/:userId
```

#### Get Health Profile History
```http
GET /api/health/history/:userId?limit=10
```

### BMI Calculations

#### Calculate BMI
```http
POST /api/bmi/calculate
Content-Type: application/json

{
  "weight": 70,
  "height": 175,
  "age": 30,
  "gender": "male",
  "activityLevel": "moderate"
}
```

#### Get BMI Categories
```http
GET /api/bmi/categories
```

### Diet Recommendations

#### Generate Diet Recommendation
```http
POST /api/diet/generate/:bmiCalculationId
```

#### Get Diet Recommendations
```http
GET /api/diet/recommendations/:userId
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password` - Hashed password
- `firstName`, `lastName` - User names
- `phone` - Phone number
- `dateOfBirth` - Date of birth
- `role` - User role (user/dietitian/admin)
- `isActive` - Account status
- `lastLogin` - Last login timestamp

### Health Profiles Table
- `id` - Primary key
- `userId` - Foreign key to users
- `weight`, `height` - Physical measurements
- `age`, `gender` - Demographics
- `activityLevel` - Activity level
- `medicalConditions` - JSON array of conditions
- `goals` - JSON array of goals
- `isCurrent` - Whether this is the current profile
- `notes` - Additional notes

### BMI Calculations Table
- `id` - Primary key
- `userId` - Foreign key to users
- `healthProfileId` - Foreign key to health profiles
- `bmi`, `bmr` - Calculated metrics
- `dailyCalories` - TDEE calculation
- `category` - BMI category
- `idealWeightMin/Max` - Ideal weight range
- `color` - UI color code

### Diet Recommendations Table
- `id` - Primary key
- `userId` - Foreign key to users
- `healthProfileId` - Foreign key to health profiles
- `bmiCalculationId` - Foreign key to BMI calculations
- `dailyCalories`, `protein`, `carbs`, `fats` - Macronutrients
- `meals` - JSON meal plan
- `foods` - JSON array of recommended foods
- `restrictions` - JSON dietary restrictions
- `medicalRecommendations` - JSON medical recommendations

## BMI Calculation Formula

### BMI (Body Mass Index)
```
BMI = weight(kg) / height(m)²
```

### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
**For Men:**
```
BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
```

**For Women:**
```
BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier

Activity Levels:
- Sedentary: 1.2 (little or no exercise)
- Light: 1.375 (light exercise 1-3 days/week)
- Moderate: 1.55 (moderate exercise 3-5 days/week)
- Active: 1.725 (hard exercise 6-7 days/week)
- Very Active: 1.9 (very hard exercise, physical job)
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Testing

```bash
# Run tests (when test files are added)
npm test
```

### Code Structure

```
Backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── HealthController.js  # Health-related controllers
├── middleware/
│   └── index.js            # Express middleware
├── models/
│   ├── User.js             # User model
│   ├── HealthProfile.js    # Health profile model
│   ├── BMICalculation.js   # BMI calculation model
│   ├── DietRecommendation.js # Diet recommendation model
│   └── index.js            # Model associations
├── routes/
│   └── health.js           # Health API routes
├── services/
│   ├── HealthService.js    # Health business logic
│   ├── healthCalculations.js # BMI calculation algorithms
│   └── validationService.js # Input validation
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Security Features

- **Input Validation**: All inputs are validated using express-validator
- **SQL Injection Prevention**: Sequelize ORM prevents SQL injection
- **Rate Limiting**: API endpoints are rate-limited
- **CORS Configuration**: Configurable CORS for security
- **Helmet Security**: Security headers for HTTP requests
- **Password Hashing**: bcryptjs for secure password hashing

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.

