'use strict';
const $=id=>document.getElementById(id);
let channels=(window.ADVENTIST_DIRECTORY?.channels||[]).map(c=>({...c,streams:[...c.streams],health:c.streams.length?'Stream listed':'Official directory'}));
let selected=null,player=null,playTimer=null,session=0,checkingReady=true,checkedCount=0;
let stored=[];try{stored=JSON.parse(localStorage.getItem('adventist-tv-favorites')||'[]');if(!Array.isArray(stored))stored=[];}catch{}
const favorites=new Set(stored);
const GLOBAL_DIRECTORY='https://hopechannelinternational.org/our-global-network';
const normal=text=>text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function safeStream(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)&&/\.m3u8(?:[?#]|$)/i.test(u.pathname+u.search)&&!/(?:youtube|youtu\.be|ythls|strm2hls)/i.test(url);}catch{return false;}}
function filterChannels(list,filters){return list.filter(c=>(!filters.query||normal([c.name,c.country,c.network,...c.languages].join(' ')).includes(normal(filters.query)))&&(!filters.language||(filters.language==='__unknown'?c.languages.length===0:c.languages.includes(filters.language)))&&(!filters.network||c.network===filters.network)&&(!filters.country||c.country===filters.country)&&(!filters.streamOnly||c.streams.length>0)&&(!filters.favoritesOnly||favorites.has(c.id)));}
function options(id,values){for(const value of [...new Set(values)].sort((a,b)=>a.localeCompare(b)))$(id).add(new Option(value,value));}
function create(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function render(){
 const filters={query:$('search').value.trim(),language:$('language').value,network:$('network').value,country:$('country').value,streamOnly:$('stream-only').checked,favoritesOnly:$('favorites').checked};
 const result=filterChannels(channels.filter(c=>c.ready),filters);$('results').textContent=`${result.length} ready channels${checkingReady?' · Checking streams…':''}`;
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===filters.language)));
 const nodes=result.map(c=>{
  const card=create('article','channel-card'+(selected?.id===c.id?' active':''));card.tabIndex=0;card.setAttribute('data-network',c.network);card.setAttribute('role','button');card.setAttribute('aria-label','Play '+c.name);card.onclick=()=>play(c);card.onkeydown=event=>{if(event.target===card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();play(c);}};
  const top=create('div','card-top');const monogram=create('span','monogram',c.network==='Hope Channel'?'HOPE':c.network==='3ABN'?'3ABN':c.network==='LLBN'?'LLBN':c.name.split(' ').map(w=>w[0]).slice(0,3).join(''));
  const star=create('button','star',favorites.has(c.id)?'★':'☆');star.setAttribute('aria-label','Favourite '+c.name);star.setAttribute('aria-pressed',String(favorites.has(c.id)));star.onclick=event=>{event.stopPropagation();favorites.has(c.id)?favorites.delete(c.id):favorites.add(c.id);try{localStorage.setItem('adventist-tv-favorites',JSON.stringify([...favorites]));}catch{}render();};top.append(monogram,star);
  const network=create('p','card-network',c.network),name=create('h3',''),country=create('p','card-country',c.country),tags=create('div','language-tags');
  const channelName=create('span','channel-name',c.name);name.append(channelName);
  for(const language of c.languages.length?c.languages:['Language not specified'])tags.append(create('span','',language));
  const actions=create('div','card-action');actions.append(create('span','availability'+(c.streams.length?' direct':''),c.health));card.append(top,network,name,country,tags,actions);return card;
 });
 if(!nodes.length)nodes.push(create('p','empty',checkingReady?'Checking direct streams. Channels appear as they pass the checks…':'No reachable channels match these filters. Clear filters or refresh the stream checks.'));
 $('channels').replaceChildren(...nodes);
}
function stop(){clearTimeout(playTimer);if(player){player.destroy();player=null;}const video=$('video');video.onplaying=null;video.onloadeddata=null;video.onerror=null;video.onwaiting=null;video.pause();video.removeAttribute('src');video.load();video.style.display='none';$('welcome').classList.remove('preview');$('preview-play').hidden=true;}
function showMessage(title,message,link){$('welcome-title').textContent=title;$('welcome-message').textContent=message;$('welcome').style.display='flex';$('screen-link').hidden=!link;if(link)$('screen-link').href=link;}
function play(c,{preview=false}={}){
 selected=c;const token=++session;stop();$('welcome').style.display='none';$('selected-title').textContent=c.name;$('selected-meta').textContent=[c.country,c.languages.join(', ')||'Language not specified'].join(' · ');$('retry').disabled=!c.streams.length;
 $('official-link').hidden=true;render();
 if(!c.streams.length){showMessage('Stream unavailable','Choose another channel from the guide.');return;}
 let index=0;
 function attempt(){if(token!==session)return;stop();if(index>=c.streams.length){c.ready=false;c.health='Unavailable';showMessage('Stream unavailable','This channel has been removed from the guide. Choose another channel or refresh the checks.');$('status').textContent='The stream could not play in this browser.';render();return;}
  const url=c.streams[index++];if(!safeStream(url)||(location.protocol==='https:'&&url.startsWith('http:'))){attempt();return;}
  const video=$('video');video.dataset.live='true';video.style.display='block';$('welcome').style.display='none';$('status').textContent='Connecting to '+c.name+'…';let failed=false;
  function fail(){if(failed||token!==session)return;failed=true;clearTimeout(playTimer);attempt();}
  function start(){if(token!==session||failed||preview)return;video.play().catch(error=>{if(token!==session||failed)return;if(error.name==='NotAllowedError'){clearTimeout(playTimer);$('status').textContent='Press Play in the video player to begin with sound.';}else fail();});}
  playTimer=setTimeout(fail,25000);
  video.onloadeddata=()=>{if(token!==session||failed||!preview)return;clearTimeout(playTimer);video.pause();showMessage(c.name,'Live preview · Click a channel or press Play to watch.');$('welcome').classList.add('preview');$('preview-play').hidden=false;$('status').textContent='Live thumbnail loaded. Playback starts only when you choose Play or click a channel.';};
  video.onplaying=()=>{if(token!==session||failed)return;clearTimeout(playTimer);c.health='Playing';$('status').textContent='Playing · '+c.name+(video.muted?' · Muted — use the player volume control for sound.':'');render();};video.onerror=fail;
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;start();}
  else if(window.Hls&&Hls.isSupported()){
   player=new Hls();player.attachMedia(video);player.loadSource(url);player.on(Hls.Events.MANIFEST_PARSED,start);player.on(Hls.Events.LEVEL_LOADED,(_event,data)=>{video.dataset.live=String(data.details.live);window.updateTVControls?.();});player.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal)fail();});
  }else{clearTimeout(playTimer);video.style.display='none';showMessage('Playback is not supported','Try a current browser and make sure the vendor folder is uploaded.');$('status').textContent='This browser cannot play HLS video.';}
 }
 attempt();
 if(!preview&&window.matchMedia?.('(max-width: 700px)').matches)document.querySelector('.watch').scrollIntoView({behavior:'smooth',block:'start'});
}
async function refreshStreams(){const button=$('refresh');button.disabled=true;$('refresh-status').textContent='Refreshing public stream links…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch('https://iptv-org.github.io/api/streams.json',{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Directory unavailable');const fresh=await response.json();if(!Array.isArray(fresh))throw Error('Invalid stream directory');const map=new Map();for(const stream of fresh){if(!stream.channel||stream.user_agent||stream.referrer||!safeStream(stream.url))continue;if(!map.has(stream.channel))map.set(stream.channel,[]);map.get(stream.channel).push(stream.url);}
  for(const c of channels){const current=map.get(c.id)||[];c.streams=[...new Set(current)];c.health=c.streams.length?'Stream listed':'Official directory';}render();$('refresh-status').textContent='Stream links refreshed at '+new Date().toLocaleTimeString()+'. Listed links still depend on broadcaster availability.';
 }catch{$('refresh-status').textContent='Using the included stream links.';}finally{clearTimeout(timer);await checkReadyChannels();button.disabled=false;}}
async function probeStream(url){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
 try{
  async function playlist(address){if(!safeStream(address)||(location.protocol==='https:'&&address.startsWith('http:')))throw Error('Unsupported stream');const response=await fetch(address,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Unreachable playlist');const text=await response.text();if(!text.trimStart().startsWith('#EXTM3U'))throw Error('Invalid playlist');return {text,base:response.url||address};}
  let manifest=await playlist(url);
  for(let depth=0;depth<3&&!manifest.text.includes('#EXTINF:');depth++){
   const lines=manifest.text.split(/\r?\n/).map(l=>l.trim());const marker=lines.findIndex(l=>l.startsWith('#EXT-X-STREAM-INF:'));const variant=marker>=0?lines.slice(marker+1).find(l=>l&&!l.startsWith('#')):null;if(!variant)throw Error('No video variant');manifest=await playlist(new URL(variant,manifest.base).href);
  }
  const lines=manifest.text.split(/\r?\n/).map(l=>l.trim());const marker=lines.findIndex(l=>l.startsWith('#EXTINF:'));const segment=marker>=0?lines.slice(marker+1).find(l=>l&&!l.startsWith('#')):null;if(!segment||/#EXT-X-KEY:(?![^\n]*METHOD=NONE)/.test(manifest.text))throw Error('No unprotected media');
  const mediaURL=new URL(segment,manifest.base);if(!['https:','http:'].includes(mediaURL.protocol)||(location.protocol==='https:'&&mediaURL.protocol==='http:'))throw Error('Unsupported media');
  const media=await fetch(mediaURL.href,{signal:controller.signal});if(!media.ok)throw Error('Media unavailable');const reader=media.body?.getReader();if(!reader)throw Error('No media data');try{const chunk=await reader.read();if(chunk.done||!chunk.value?.length)throw Error('Empty media');}finally{await reader.cancel();}return true;
 }catch{return false;}finally{clearTimeout(timer);}
}
async function checkReadyChannels(){
 $('refresh').disabled=true;checkingReady=true;checkedCount=0;channels.forEach(c=>{c.ready=false;});render();const candidates=channels.filter(c=>c.streams.some(safeStream));let cursor=0;
 async function worker(){while(cursor<candidates.length){const c=candidates[cursor++];let working=null;for(const url of c.streams){if(await probeStream(url)){working=url;break;}}checkedCount++;if(working){c.streams=[working,...c.streams.filter(u=>u!==working)];c.ready=true;c.health='Stream checked';}render();$('refresh-status').textContent=`Checked ${checkedCount}/${candidates.length} channels. Reachability checks do not guarantee uninterrupted playback.`;if(working&&!selected)play(c,{preview:true});}}
 await Promise.all([worker(),worker(),worker(),worker()]);checkingReady=false;$('refresh').disabled=false;render();if(!channels.some(c=>c.ready)&&!selected){showMessage('No streams are reachable right now','Try refreshing the checks, or use another connection.');$('status').textContent='Only streams that pass browser checks are listed.';}
}
function resetFilters(){$('search').value='';for(const id of ['language','network','country'])$(id).value='';$('stream-only').checked=false;$('favorites').checked=false;render();}
options('language',channels.flatMap(c=>c.languages));$('language').add(new Option('Language not specified','__unknown'));options('network',channels.map(c=>c.network));options('country',channels.map(c=>c.country));
for(const id of ['language','network','country','stream-only','favorites'])$(id).onchange=render;$('search').oninput=render;
document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>{$('language').value=button.dataset.language;render();});$('clear').onclick=resetFilters;$('refresh').onclick=refreshStreams;$('retry').onclick=()=>selected&&play(selected);
$('preview-play').onclick=()=>selected&&play(selected);
$('updated').textContent='Directory edition · '+(window.ADVENTIST_DIRECTORY?.updatedAt||'2026');render();
checkReadyChannels();

window.getTVLivePosition=()=>player?.liveSyncPosition;
