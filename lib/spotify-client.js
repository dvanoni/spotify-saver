require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node')
const db = require('./db')

class SpotifyClient {
  constructor({ skipCredentialsCheck = false } = {}) {
    this.dbCredentials = db.get('credentials')
    this.dbCurrentTrack = db.get('currentTrack')

    const credentialsMissing = this.dbCredentials.isEmpty().value()

    if (!skipCredentialsCheck && credentialsMissing) {
      throw new Error(
        'You need to authorize the application first using `npm run authorize`'
      )
    }

    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      ...this.dbCredentials.value(),
    })
  }

  async requestCredentials(code) {
    const data = await this.api.authorizationCodeGrant(code)
    return this.saveCredentials({
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
    })
  }

  async refreshCredentials() {
    const data = await this.api.refreshAccessToken()
    return this.saveCredentials({
      accessToken: data.body['access_token'],
    })
  }

  saveCredentials(credentials) {
    this.api.setCredentials(credentials)
    this.dbCredentials.assign(credentials).write()
    return true
  }

  async performWithRetry(action) {
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
  async isTrackSaved(trackID) {
    const currentTrack = this.dbCurrentTrack.value()

    if (currentTrack.id === trackID) {
      // Current track status is available in DB
      return currentTrack.isSaved
    }

    const data = await this.api.containsMySavedTracks([trackID])
    const isSaved = data.body[0]

    this.dbCurrentTrack.assign({ id: trackID, isSaved }).write()

    return isSaved
  }

  /**
   * @returns true if track has been saved, false if it has been removed
   */
  async toggleSaveTrack(trackID) {
    let isSaved = await this.isTrackSaved(trackID)

    await (
      isSaved
        ? this.api.removeFromMySavedTracks([trackID])
        : this.api.addToMySavedTracks([trackID])
    )

    isSaved = !isSaved

    this.dbCurrentTrack.assign({ id: trackID, isSaved }).write()

    return isSaved
  }
}

module.exports = SpotifyClient
