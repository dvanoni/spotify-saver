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

SpotifyWebApi.prototype.requestCredentials = async function (code) {
  const data = await this.authorizationCodeGrant(code)
  return this.saveCredentials({
    accessToken: data.body['access_token'],
    refreshToken: data.body['refresh_token'],
  })
}

SpotifyWebApi.prototype.refreshCredentials = async function () {
  const data = await this.refreshAccessToken()
  return this.saveCredentials({
    accessToken: data.body['access_token'],
  })
}

SpotifyWebApi.prototype.saveCredentials = function (credentials) {
  this.setCredentials(credentials)

  credentialsWrapper
    .assign(credentials)
    .write()

  return true
}

SpotifyWebApi.prototype.performWithRetry = async function (action) {
  try {
    return await action()
  } catch (error) {
    if (error.statusCode === 401) {
      // Refresh credentials and retry
      await this.refreshCredentials()
      return await action()
    }
  }
}

/**
 * @returns true if track is saved, false if not
 */
SpotifyWebApi.prototype.isTrackSaved = async function (trackID) {
  const currentTrack = currentTrackWrapper.value()

  if (currentTrack.id === trackID) {
    // Current track status is available in DB
    return currentTrack.isSaved
  }

  const data = await this.containsMySavedTracks([trackID])
  const isSaved = data.body[0]
  currentTrackWrapper
    .assign({ id: trackID, isSaved })
    .write()
  return isSaved
}

/**
 * @returns true if track has been saved, false if it has been removed
 */
SpotifyWebApi.prototype.toggleSaveTrack = async function (trackID) {
  let isSaved = await this.isTrackSaved(trackID)

  await (
    isSaved
      ? this.removeFromMySavedTracks([trackID])
      : this.addToMySavedTracks([trackID])
  )

  isSaved = !isSaved

  currentTrackWrapper
    .assign({ id: trackID, isSaved })
    .write()

  return isSaved
}
