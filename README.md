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

Header ebook promotion: seven covers at a time on a white background, cycling every seven seconds through every book in the page library. Hover or keyboard focus reveals Download. Arrow and pause controls are available; automatic rotation pauses while hovered/focused and respects reduced motion. Covers and PDFs remain hosted by Amazing Facts. As with the library buttons, the browser may open its PDF viewer instead of saving immediately because these are external files.



Header tooltips contain five-sentence editorial summaries explaining each ebook's subject, main arguments, and purpose. These summaries are based on the Amazing Facts book pages and chapter topics; they are not opening passages or official publisher quotations. Source pages are recorded in ebooks.json. Hover or keyboard focus shows the tooltip, and Escape dismisses it.

All 153 library items now show matching white tooltips with red accents: 102 ebooks, 27 Bible Study Guides, and 24 Storacles lessons. Tooltips contain the title and five-sentence editorial description, appear on hover or keyboard focus, remain readable when the pointer enters the popup, and dismiss with Escape. Existing download and lesson links are retained.

All tooltips, including rotating header covers, follow the mouse pointer with a small gap below it. They shift inside the screen edges and appear above the pointer when there is insufficient space below. Keyboard focus keeps a card-based position; Escape still dismisses the popup.

Playlist tooltips now show the channel name, description, broadcast base or listed country/region, operator, programming focus, and languages. They use the same pointer-following popup as the library. Network-wide programming profiles are identified as such; unverified local operators and studio addresses are labeled. These are channel profiles, not a live electronic program guide. Profile sources are recorded per channel in channels.json.

Playlist hover behavior: a new channel displays its tooltip immediately. Mouse movement within that channel hides the popup; it returns after the pointer remains still for 500 milliseconds. Moving to another channel shows its information immediately. Keyboard tooltips and library pointer-following behavior remain available.


Channel tooltips appear to the left of the playlist, aligned with the hovered row/pointer and kept inside the screen. On narrow screens without room beside the playlist, they use the existing screen-safe popup position. The 500ms stationary delay remains.

Channel tooltips are vertically centered on the mouse pointer to the left of the playlist. With keyboard focus they center on the channel row. The position is clamped at the screen edges so the information remains visible.

Ebook ad tooltips sit below the complete ad container and center horizontally on the mouse pointer. Ebooks, Bible Study Guides, and Storacles tooltips also center their width on the pointer. Screen-edge adjustments keep content visible. Channel tooltips remain to the left of the playlist and vertically centered on the pointer.

Tooltips are suppressed over action buttons in every section, including ebook Download buttons, ad Download overlays, Read the Lesson buttons, favourites, and other native buttons. Entering a button cancels pending tooltip timers. Moving back to the item content restores normal hover behavior; button keyboard focus also keeps the popup hidden.

Tooltips in every section hide during downward mouse movement and during page or nested-playlist scrolling. They can return after 500ms of stillness. Scrolling rechecks the item actually under the pointer and continues to suppress button areas.

Library and ad tooltip side placement follows the actual visible row: columns 1–3 appear right of the pointer, columns 4–7 left, with a 24px gap. Responsive rows follow the same rule. Narrow edge space can reduce the popup width or use the opposite side to keep it on screen. Ad popups remain below the ad container. Playlist tooltips retain their left-side placement and 500ms stillness behavior.

All tooltips now align the mouse pointer with their vertical midpoint, including the header ebook ad and all three study-library sections. Existing row-based left/right placement, button suppression, scrolling behavior, and playlist stillness delay are retained. Screen-edge clamping can shift a popup to keep it readable.

All section tooltips hide during mouse movement in any direction, including left and right, and return after 500ms of stillness. Side placement now clears the full hovered card, keeping the cover or photo unobscured. On narrow screens, the popup uses available space above or below the item; if there is no readable space it stays hidden.

Bible Study Guides and Storacles now use a two-column split for tooltip direction: visible row positions 1–2 show right, positions 3–4 show left. Ebook rows retain the 1–3 right / 4–7 left split. Image clearance and existing movement behavior remain.

Header ad tooltips always appear 20px below the ad background container, horizontally centered on the mouse pointer. Screen-edge clamping keeps the popup readable, and vertical overflow scrolls within the available space below the ad. Library and playlist placement rules remain unchanged.

Exception: hovering or focusing the Download overlay inside the header free ebooks ad can show its ebook tooltip. Button suppression remains in effect elsewhere; movement and stillness rules are retained.
