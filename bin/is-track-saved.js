
const { getCurrentSpotifyTrackID } = require('../lib/jxa')
const SpotifyClient = require('../lib/spotify-client')

const spotify = new SpotifyClient()

getCurrentSpotifyTrackID()
  .then(trackID =>
    spotify.performWithRetry(
      () => spotify.isTrackSaved(trackID)
    )
  )
  .catch(() => false)
  .then(console.log)
