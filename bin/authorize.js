const express = require('express')
const opn = require('opn')
const spotifyApi = require('../lib/spotify-api')

const scopes = [
  'user-library-read',
  'user-library-modify',
  'user-follow-read',
  'user-follow-modify',
]

const app = express()

app.get('/callback', function (req, res) {
  spotifyApi.requestCredentials(req.query.code)
    .then(() => {
      res.send('Successfully authorized!')
    }, (error) => {
      console.error('Something went wrong!', error)
      res.status(400).send(error.message)
    })
    .then(() => {
      console.log('Done')
      process.exit()
    })
})

app.listen(3000)

spotifyApi.setRedirectURI('http://localhost:3000/callback')

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state')

opn(authorizeURL)
