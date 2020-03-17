const {
  displayNotification,
  getCurrentSpotifyTrackID,
  getCurrentSpotifyTrackName,
 } = require('../lib/jxa')

const spotifyApi = require('../lib/spotify-api').withCredentials()

async function main() {
  const trackID = await getCurrentSpotifyTrackID()

  const saved = await spotifyApi.performWithRetry(
    () => spotifyApi.toggleSaveTrack(trackID)
  )

  const trackName = await getCurrentSpotifyTrackName()
  const message = saved
    ? 'Saved to Your Library!'
    : 'Removed from Your Library'

  await displayNotification(message, trackName)

  return `${message}\n${trackName}`
}

main()
  .catch(error => 'An error occurred: ' + error.message)
  .then(console.log)
