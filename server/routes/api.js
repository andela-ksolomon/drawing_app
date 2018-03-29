const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const models = require('../models');

/* GET api listing. */
/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

router.post('/login', (req, res) => {
  var username = (req.body.username || '').trim();
  var password = (req.body.password || '').trim();
  if (!username || !password) {
    res.status(400).end('Empty username or password');
    return;
  }

  // Query the database by username and password
  models.User.findOne({ username, password })
    .then(user => {
      if (user) {
        // save the token
        const token = jwt.sign(
          {
            user,
          },
          'mysecretKey123',
          {
            expiresIn: 7200,
          },
        );
        res.json({
          token,
          message: 'Logged In Successfully',
        });
      } else {
        // The username/password  is not correct
        res.status(403).end('Invalid credentials.');
      }
    })
    .catch(err => {
      // This is an error which we cannot control (e.g. connection error)
      // => Internal Server Error
      res.status(500).end('There was an error.');
    });
});

module.exports = router;
