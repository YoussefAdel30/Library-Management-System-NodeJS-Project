// server.js
require('dotenv').config();
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const basicAuth = require('./middlewares/basicAuth');



const app = express();
app.use(cors());
app.use(express.json());

// Apply basicAuth middleware globally to all API routes
app.use('/api', basicAuth);

// routes
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/borrowers', require('./routes/borrowerRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));

// health
app.get('/', (req, res) => res.send('Library API is running'));

// error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
