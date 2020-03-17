const {
  displayNotification,
  getCurrentSpotifyTrackID,
  getCurrentSpotifyTrackName,
 } = require('../lib/jxa')

const SpotifyClient = require('../lib/spotify-client')

const spotify = new SpotifyClient()

async function main() {
  const trackID = await getCurrentSpotifyTrackID()

  const saved = await spotify.performWithRetry(
    () => spotify.toggleSaveTrack(trackID)
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
