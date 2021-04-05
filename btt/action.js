(async () => {
  const npmPath = '$HOME/.asdf/shims/npm'
  const projectPath = '$HOME/Developer/projects/spotify-saver'

  const isSpotifyPlaying = await callBTT(
    'get_string_variable',
    { variable_name: 'BTTCurrentlyPlayingApp' }
  ) === 'com.spotify.client'

  if (!isSpotifyPlaying) return

  const result = await runShellScript({
    script: `${npmPath} --prefix ${projectPath} run toggle-save-track`
  })

  returnToBTT(result)
})()
