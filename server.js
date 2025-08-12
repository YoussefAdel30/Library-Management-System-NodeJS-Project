console.log('Starting server...');
require('dotenv').config();
console.log('Environment variables loaded.');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const basicAuth = require('./middlewares/basicAuth');
const setupSwagger = require('./config/swagger/swaggerConfig');



const app = express();
app.use(cors());
app.use(express.json());

console.log('Express app created.');

// Apply basicAuth middleware globally to all API routes
app.use('/api', basicAuth);

// core routes
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/borrowers', require('./routes/borrowerRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));

console.log('Basic routes set up.');

// health
app.get('/', (req, res) => res.send('Library API is running'));

// error handler (last)
app.use(errorHandler);

// Swagger setup
setupSwagger(app);

// Listening Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

