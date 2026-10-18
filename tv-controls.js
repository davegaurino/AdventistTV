/* Custom controls: a static live indicator at the edge; a seek bar when behind. */
(() => {
 'use strict';
 const byId=id=>document.getElementById(id),video=byId('video');
 const controls=byId('tv-controls'),seek=byId('tv-seek'),seekRow=byId('tv-seek-row');
 const live=byId('tv-live'),goLive=byId('tv-go-live'),rewind=byId('tv-rewind');
 let dragging=false;
 function bounds(){
  if(!video.seekable.length)return null;
  const index=video.seekable.length-1,start=video.seekable.start(index),end=video.seekable.end(index);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return null;
  const sync=window.getTVLivePosition?.();
  const target=Number.isFinite(sync)&&sync>=start&&sync<=end?sync:Math.max(start,end-3);
  return {start,end,target};
 }
 function mode(range){
  const isLive=video.dataset.live!=='false';
  const atLive=isLive&&!!range&&video.currentTime>=range.target-4;
  return {isLive,atLive};
 }
 function update(){
  const active=video.style.display!=='none'&&video.readyState>=1;
  controls.hidden=!active;
  if(!active)return;
  const range=bounds(),state=mode(range);
  const watching=!video.paused&&!video.ended;
  live.hidden=!state.atLive;
  seekRow.hidden=state.atLive||!range;
  goLive.hidden=!state.isLive||state.atLive||!range;
  rewind.disabled=!range||video.currentTime<=range.start+.5;
  byId('tv-play').textContent=watching?'❚❚':'▶';
  byId('tv-play').setAttribute('aria-label',watching?'Pause':'Play');
  byId('tv-mute').textContent=video.muted||video.volume===0?'Unmute':'Mute';
  byId('tv-mute').setAttribute('aria-pressed',String(video.muted));
  byId('tv-volume').value=video.muted?0:video.volume;
  if(range){
   seek.min=range.start;seek.max=range.end;
   if(!dragging)seek.value=Math.min(range.end,Math.max(range.start,video.currentTime));
   const behind=Math.max(0,Math.round(range.target-video.currentTime));
   const stamp=Math.floor(behind/60)+':'+String(behind%60).padStart(2,'0');
   byId('tv-behind').textContent=state.isLive?stamp+' behind live':'Playback position';
   seek.setAttribute('aria-valuetext',state.isLive?stamp+' behind live':Math.round(video.currentTime)+' seconds');
  }
 }
 async function resume(){try{await video.play();}catch{byId('status').textContent='Press Play to resume this stream.';}}
 byId('tv-play').onclick=()=>{
  if(!video.paused){video.pause();return;}
  if(!byId('preview-play').hidden){byId('preview-play').click();return;}
  resume();
 };
 rewind.onclick=()=>{const range=bounds();if(!range)return;video.currentTime=Math.max(range.start,video.currentTime-30);update();};
 goLive.onclick=()=>{const range=bounds();if(!range)return;video.currentTime=range.target;resume();update();};
 seek.oninput=()=>{
  dragging=true;const range=bounds();if(!range)return;
  const value=Number(seek.value);
  // The final four seconds of the slider snap to the broadcaster's live edge.
  video.currentTime=value>=range.end-4&&video.dataset.live!=='false'?range.target:Math.max(range.start,Math.min(range.end,value));
  update();
 };
 seek.onchange=()=>{dragging=false;update();};
 seek.addEventListener('blur',()=>{dragging=false;update();});
 byId('tv-mute').onclick=()=>{video.muted=!video.muted;if(!video.muted&&video.volume===0)video.volume=1;update();};
 byId('tv-volume').oninput=()=>{video.volume=Number(byId('tv-volume').value);video.muted=video.volume===0;update();};
 byId('tv-fullscreen').onclick=async()=>{
  try{const screen=document.querySelector('.screen');
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(screen.requestFullscreen)await screen.requestFullscreen();
   else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
  }catch{byId('status').textContent='Fullscreen is unavailable in this browser.';}
 };
 for(const event of ['timeupdate','progress','durationchange','loadedmetadata','loadeddata','play','pause','seeking','seeked','emptied','volumechange','ended'])video.addEventListener(event,update);
 video.addEventListener('playing',()=>{byId('welcome').style.display='none';byId('welcome').classList.remove('preview');byId('preview-play').hidden=true;update();});
 // Paused live streams also drift behind as the broadcaster's window advances.
 setInterval(update,1000);
 window.updateTVControls=update;
 window.TVControlState={bounds,mode};
 update();
})();
