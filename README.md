# Adventist TV — direct playback edition

Upload this folder's contents to GitHub and enable Settings → Pages → Deploy from a branch → your branch → root. Include channels.js and hls.min.js. All files belong in this same folder. No API key or build step is needed.

The video stays on the left and the scrollable guide on the right. Click anywhere in a channel row to play it, or focus the row and press Enter or Space. The favourite star changes favourites without starting playback. Language, network and country filters remain available.

Only channels passing browser-side checks appear in the guide. At startup the site checks the bundled direct HLS candidates, follows a video variant playlist and confirms that its first media segment returns nonempty data. Four checks run at a time, with a nine-second timeout per candidate URL. Channels appear progressively and the first passing channel loads a paused frame from the live stream as its thumbnail. Playback starts only after you click a channel row or the preview Play button. The site never mutes the video automatically; your volume setting is preserved.

Entries with no direct stream, HTTP-only streams on HTTPS pages, failed requests, invalid playlists and encrypted playlists are excluded. No provider-site-only channels appear. Channels that fail actual playback are removed from the guide. There are no provider redirects or YouTube players. Some connections may yield few or no channels. Successful reachability checks do not guarantee compatible codecs, uninterrupted playback, or that the programme is live rather than a replay.

Refresh stream links updates the direct URLs from the public iptv-org directory and reruns the browser checks. It does not add new ministry identities. The included source catalogue contains 104 regional and ministry entries, of which 41 have direct HLS listings in the snapshot; these are candidates, not a guarantee of 41 working channels. Sources date from 18 October 2026. Some entries have multiple published languages, while missing language data is left unspecified. Worldwide completeness is not guaranteed.

Edit channels.json to maintain the catalogue, then regenerate channels.js with:

```
node -e "const fs=require('fs');fs.writeFileSync('channels.js','window.ADVENTIST_DIRECTORY = '+fs.readFileSync('channels.json','utf8')+';');"
```

Sources: https://hopechannelinternational.org/our-global-network, https://github.com/iptv-org/api (Unlicense), https://3abn.org/, https://www.llbn.tv/. Bundled hls.js 1.6.13 is Apache-2.0; see HLS-LICENSE.txt. Channel names and broadcasts remain their owners' property. This independent directory hosts no videos and bypasses no subscription, DRM or geographic restrictions.



The Amazing Facts ebook gallery appears before the footer, with seven covers per row on desktop. All 102 covers and PDFs use Amazing Facts hosted URLs extracted from each individual ebook page. Clicking a cover opens its PDF directly. Download PDF links request saving the file; cross-site download behaviour is controlled by the publisher and browser, so some browsers open a PDF viewer with its own download button. No cover images or PDF files are stored in this folder. ebooks.json records the source page, remote cover URL and PDF URL for each title. Book covers and PDFs remain the publisher’s property.

## Live player controls

Orange download buttons and accents are applied across the page. Custom video controls replace the browser's normal controls: Play/Pause, Rewind 30 seconds, Mute, volume, and fullscreen. At the live edge, a static red line and LIVE label replace the moving timeline. Rewind reveals the timeline and removes LIVE. Dragging to the latest part of the timeline or selecting Go live returns to the live edge and restores LIVE. The live edge uses the player's recommended live position, allowing four seconds of playback tolerance. Playback and volume preferences remain under your control.

Rewinding is limited to the broadcaster's available seekable window. Some streams offer little or no rewind history. In browsers that only support native video fullscreen, the browser may use its own fullscreen controls.

The current theme uses red accents and red ebook download buttons. The playlist is white with dark text and red highlights; the rest of the page retains its dark background.

The current visual design uses a premium charcoal-and-red streaming layout, a cinema-style player, a light gray teal channel guide, and seven-column ebook covers on desktop. Existing ready-stream filtering, paused previews, click-to-play rows, language filters and live/DVR controls are retained.

Eleven square publisher cover images with substantial white side margins have measured CSS display crops. The full cover artwork remains visible; image URLs and PDF links are unchanged. No edited or downloaded cover files are included.

All ebook covers now sit centred in uniform 2:3 portrait frames. Complete cover artwork is preserved, including the existing corrections for white side margins.

All 27 Amazing Facts Bible Study Guides are shown after the ebook section. Each image and guide card links to its official Amazing Facts lesson page in a new tab. Images use the publisher's hosted photo URLs; no study-guide images or lesson files are downloaded into this folder. study-guides.json records all guide titles, page URLs and image URLs.

Both study sections have Read the Lesson buttons. The 24-lesson Storacles of Prophecy section follows the 27 Bible Study Guides, with official Amazing Facts image URLs and page links opening in new tabs. Both series are included in the responsive menu. The playlist now uses the same dark charcoal-and-red palette as the rest of the page.
