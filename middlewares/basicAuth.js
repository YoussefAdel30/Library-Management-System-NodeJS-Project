const basicAuth = (req, res, next) => {
  // Check if Authorization header is present
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Library API"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Decode Base64 credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Validate username and password - They are Located in the .env file
  const validUsername = process.env.API_USER; 
  const validPassword = process.env.API_PASS;

  if (username === validUsername && password === validPassword) {
    return next();  // proceed
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Library API"');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};

module.exports = basicAuth;
