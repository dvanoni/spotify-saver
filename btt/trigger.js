(async () => {
  const npmPath = '$HOME/.nodenv/shims/npm'
  const projectPath = '$HOME/Developer/projects/spotify-saver'
  const iconPath = '/Applications/BetterTouchTool.app/Contents/Resources/icons/ioniconpng'

  const isSpotifyPlaying = await callBTT(
    'get_string_variable',
    { variable_name: 'BTTCurrentlyPlayingApp' }
  ) === 'com.spotify.client'

  if (!isSpotifyPlaying) {
    return returnToBTT(JSON.stringify({
      text: 'Unknown',
      icon_path: `${iconPath}/md-help-circle-outline.png`,
    }))
  }

  const isTrackSaved = JSON.parse(await runShellScript({
    script: `${npmPath} --prefix ${projectPath} run is-track-saved`
  }))

  const result = {
    text: isTrackSaved ? 'Saved' : 'Not Saved',
    font_color: isTrackSaved ? '88,182,96,255' : '255,255,255,255',
    icon_path: isTrackSaved
      ? `${iconPath}/md-heart.png`
      : `${iconPath}/md-heart-empty.png`,
  }

  returnToBTT(JSON.stringify(result))
})()
