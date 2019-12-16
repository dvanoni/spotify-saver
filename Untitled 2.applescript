var app = Application.currentApplication()
app.includeStandardAdditions = true

var spotify = Application('Spotify')

function getCurrentTrackID() {
  return spotify.currentTrack().id().split(':')[2]
}

if (spotify.running()) {
  const trackID = getCurrentTrackID()
  app.displayNotification(trackID, { withTitle: 'Success'})
}
