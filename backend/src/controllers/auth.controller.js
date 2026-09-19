const { firebaseConfig } = require('../config/firebase');

/*Sign up a new user using Firebase Authentication REST API*/
const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Failed to create user';
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(201).json({
      message: 'User created successfully',
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      userId: data.localId,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/* Sign in an existing user using Firebase Authentication REST API*/
const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Invalid credentials';
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(200).json({
      message: 'Signed in successfully',
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      userId: data.localId,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signup,
  signin,
};
