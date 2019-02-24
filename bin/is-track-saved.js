if (process.argv.length !== 3) {
  console.error('You must provide a track ID as the first argument')
  process.exit(1)
}

const trackID = process.argv[2]

const spotifyApi = require('../lib/spotify-api').withCredentials()

spotifyApi.isTrackSaved(trackID)
  .catch((error) => {
    if (error.statusCode === 401) {
      // Refresh credentials and retry
      return spotifyApi.refreshCredentials()
        .then(() => spotifyApi.isTrackSaved(trackID))
    }
    return Promise.reject(error)
  })
  .catch(() => false)
  .then(console.log)
