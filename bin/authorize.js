const express = require('express')
const open = require('open')
const spotifyApi = require('../lib/spotify-api')

const scopes = [
  'user-library-read',
  'user-library-modify',
  'user-follow-read',
  'user-follow-modify',
]

const port = 7777

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

app.listen(port)

spotifyApi.setRedirectURI(`http://localhost:${port}/callback`)

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state')

open(authorizeURL)
