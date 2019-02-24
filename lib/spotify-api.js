require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node')
const db = require('./db')

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
})

module.exports = spotifyApi

const credentialsWrapper = db.get('credentials')
const currentTrackWrapper = db.get('currentTrack')

SpotifyWebApi.prototype.withCredentials = function () {
  const credentialsMissing = credentialsWrapper
    .isEmpty()
    .value()

  if (credentialsMissing) {
    console.error('You need to authorize the application first using `npm run authorize`')
    process.exit(1)
  }

  this.setCredentials(credentialsWrapper.value())

  return this
}

SpotifyWebApi.prototype.requestCredentials = function (code) {
  return this.authorizationCodeGrant(code)
    .then((data) => this.saveCredentials({
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
    }))
}

SpotifyWebApi.prototype.refreshCredentials = function () {
  return this.refreshAccessToken()
    .then((data) => this.saveCredentials({
      accessToken: data.body['access_token'],
    }))
}

SpotifyWebApi.prototype.saveCredentials = function (credentials) {
  this.setCredentials(credentials)

  credentialsWrapper
    .assign(credentials)
    .write()

  return true
}

SpotifyWebApi.prototype.isTrackSaved = function (trackID) {
  const currentTrack = currentTrackWrapper.value()

  if (currentTrack.id === trackID) {
    return Promise.resolve(currentTrack.isSaved)
  }

  return this.containsMySavedTracks([trackID])
    .then((data) => {
      const isSaved = data.body[0]

      currentTrackWrapper
        .assign({ id: trackID, isSaved })
        .write()

      return isSaved
    })
}

SpotifyWebApi.prototype.toggleSaveTrack = function (trackID) {
  return this.isTrackSaved(trackID)
    .then((isSaved) => (
      (isSaved
          ? this.removeFromMySavedTracks([trackID])
          : this.addToMySavedTracks([trackID])
      ).then(() => {
        currentTrackWrapper
          .assign({ id: trackID, isSaved: !isSaved })
          .write()
        return isSaved ? 'Removed from Your Library' : 'Saved to Your Library!'
      })
    ))
}
