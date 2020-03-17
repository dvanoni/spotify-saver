const { run } = require('@jxa/run')

module.exports.displayNotification = (title, body) =>
  run((title, body) => {
    const app = Application.currentApplication()
    app.includeStandardAdditions = true
    app.displayNotification(body, { withTitle: title })
  }, title, body)

module.exports.getCurrentSpotifyTrackID = () =>
  run(() => {
    const spotify = Application('Spotify')
    if (!spotify.running()) return null
    return spotify.currentTrack().id().split(':')[2]
  })

module.exports.getCurrentSpotifyTrackName = () =>
  run(() => {
    const spotify = Application('Spotify')
    if (!spotify.running()) return null
    const currentTrack = spotify.currentTrack()
    return `${currentTrack.artist()} • ${currentTrack.name()}`
  })
