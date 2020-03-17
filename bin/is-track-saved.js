
const { getCurrentSpotifyTrackID } = require('../lib/jxa')

const spotifyApi = require('../lib/spotify-api').withCredentials()

getCurrentSpotifyTrackID()
  .then(trackID =>
    spotifyApi.performWithRetry(
      () => spotifyApi.isTrackSaved(trackID)
    )
  )
  .catch(() => false)
  .then(console.log)
