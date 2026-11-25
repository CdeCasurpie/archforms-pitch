/* Dos relojes: navegación pausada del componente y entradas interactivas finitas. */
const scenes=Array.from(document.querySelectorAll('.slide')).map(el=>({id:el.dataset.compositionId,start:Number(el.dataset.start),duration:Number(el.dataset.duration)}));
const live=window.parent!==window&&!!window.parent.document.querySelector('hyperframes-player');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeId=null,entrance=null,fragmentTweens=[],serial=0,pendingFragments=0;
window.__pitchMotion={activeScene:null,entrySerial:0,running:false,fragmentRunning:false,reducedMotion,step:0};
function trackFragment(tween){
  const entry=serial;let finished=false;
  pendingFragments++;window.__pitchMotion.fragmentRunning=true;
  const finish=()=>{if(finished)return;finished=true;if(entry===serial){pendingFragments=Math.max(0,pendingFragments-1);window.__pitchMotion.fragmentRunning=pendingFragments>0;}};
  tween.eventCallback('onComplete',finish);tween.eventCallback('onInterrupt',finish);fragmentTweens.push(tween);
}
const resetSelector='.word,[data-reveal],[data-panel],[data-slam],.phone,.loose-photo,.document-cursor,.late-joke,.app-icon,.scattered-tags>span,.travel,[data-grow],.context-labels>div,.old-word,.new-word,.screen-next,.tap-ring,.demo-choice,.app-toast,.camera-demo,.camera-flash,.mini-photo,.waveform i,.paper-piece,.person-mark,.route-card,.inspector-helmet,.inspector-arm-left,.inspector-arm-right,.task-strike,.no-task strong';
function animateEntry(el,direction,withinDemo=false){
  entrance?.kill();fragmentTweens.forEach(t=>t.kill());fragmentTweens=[];gsap.killTweensOf('.transition-shutter');
  pendingFragments=0;window.__pitchMotion.fragmentRunning=false;
  const q=selector=>el.querySelectorAll(selector);
  const reportWindow=el.querySelector('.report-preview-window');
  if(reportWindow)reportWindow.scrollTop=0;
  gsap.set(q(resetSelector),{clearProps:'transform,opacity,clipPath'});
  gsap.set(q('.demo-stage'),{clearProps:'transform,opacity'});
  gsap.set(q('.competitor-cross,.competitor-content'),{clearProps:'transform,opacity'});
  window.__pitchMotion.running=false;
  if(reducedMotion||!live)return;
  const tl=gsap.timeline({onComplete:()=>{window.__pitchMotion.running=false;}});entrance=tl;window.__pitchMotion.running=true;window.__pitchMotion.timeline=tl;
  if(withinDemo){
    gsap.set('.transition-shutter',{scaleX:0});
    tl.fromTo(q('.demo-stage'),{opacity:.25,x:direction*32},{opacity:1,x:0,duration:.55,ease:'power2.out'}).to({},{duration:.3});
    return;
  }
  gsap.set('.transition-shutter',{scaleX:1,opacity:.16});
  gsap.to('.transition-shutter',{opacity:0,duration:.3,ease:'sine.out'});
  if(q('.word').length)tl.fromTo(q('.word'),{y:28,opacity:0},{y:0,opacity:1,duration:.56,stagger:.075,ease:'power3.out'},.06);
  if(q('[data-reveal]').length)tl.fromTo(q('[data-reveal]'),{y:16,opacity:0},{y:0,opacity:1,duration:.48,stagger:.055,ease:'power3.out'},.16);
  if(q('[data-panel]').length)tl.fromTo(q('[data-panel]'),{y:24,opacity:0},{y:0,opacity:1,duration:.62,stagger:.09,ease:'power3.out'},.22);
  if(q('[data-slam]').length)tl.fromTo(q('[data-slam]'),{scale:1.22,y:50,opacity:0},{scale:1,y:0,opacity:1,duration:.85,ease:'power4.out'},.15);
  if(q('.phone').length)tl.fromTo(q('.phone'),{x:direction*65,y:60,rotationY:-9,transformPerspective:1600,opacity:0},{x:0,y:0,rotationY:0,opacity:1,duration:1.1,stagger:.14,ease:'power3.out'},.15);
  if(q('[data-grow]').length)tl.fromTo(q('[data-grow]'),{scaleX:0},{scaleX:1,duration:1.15,stagger:.2,ease:'power3.inOut'},.35);
   switch(el.id){
     case 'category':
       tl.fromTo(q('.competitor-cross'),{opacity:0,scale:.65},{opacity:1,scale:1,duration:.4,ease:'back.out(1.3)',immediateRender:true},1.5)
         .fromTo(q('.competitor-content'),{opacity:1},{opacity:.5,duration:.45},1.5);break;
    case 'word':
      tl.fromTo(q('.loose-photo'),{y:180,x:80,rotation:20,opacity:0},{y:0,x:0,rotation:i=>[-7,9][i],opacity:1,duration:1,stagger:.15,ease:'back.out(1.1)'},.3)
        .fromTo(q('.document-cursor'),{x:80,y:50,opacity:0},{x:0,y:0,opacity:1,duration:1,ease:'power3.out'},.7);break;
    case 'for-everyone':
      tl.fromTo(q('.app-icon'),{y:100,opacity:0},{y:0,opacity:1,duration:.85,stagger:.14,ease:'power3.out'},.2)
        .fromTo(q('.scattered-tags>span'),{y:30,rotation:8,opacity:0},{y:0,rotation:i=>[-4,3,-2,4][i],opacity:1,duration:.8,stagger:.1,ease:'power3.out'},.7);break;
    case 'visit-time':tl.fromTo(q('.travel'),{scaleX:0},{scaleX:1,duration:.75,ease:'power3.out'},.3);break;
    case 'context':tl.fromTo(q('.context-labels>div'),{x:80,opacity:0},{x:0,opacity:1,duration:.7,stagger:.18,ease:'power3.out'},.35);break;
    case 'during':
      tl.fromTo(q('.old-word'),{y:0,opacity:1},{y:-160,opacity:0,duration:.65,ease:'power3.inOut',immediateRender:true},2.5)
        .fromTo(q('.new-word'),{y:170,opacity:0},{y:0,opacity:1,duration:.85,ease:'power4.out',immediateRender:true},2.65);break;
    case 'start-visit':
      tl.fromTo(q('.tap-ring'),{scale:.85,opacity:0},{scale:1,opacity:1,duration:.35},.7)
        .to(q('.tap-ring'),{opacity:0,scale:1.15,duration:.3},1.1);break;
    case 'take-photos':
      tl.fromTo(q('.camera-demo'),{opacity:0},{opacity:1,duration:.4},.6)
        .fromTo(q('.camera-flash'),{opacity:0},{opacity:.9,duration:.08,repeat:1,yoyo:true},1);break;
    case 'record':tl.fromTo(q('.waveform i'),{scaleY:.2},{scaleY:1,duration:.3,stagger:{each:.035,repeat:3,yoyo:true},ease:'sine.inOut'},.4);break;
    case 'export':
      tl.fromTo(q('.report-paper'),{y:100,rotation:-5,opacity:0},{y:0,rotation:0,opacity:1,duration:1,ease:'power3.out'},.2)
        .fromTo(q('.paper-piece'),{y:25,opacity:0},{y:0,opacity:1,duration:.55,stagger:.18},.6);break;
    case 'document-ready':
      if(reportWindow)tl.to(reportWindow,{scrollTop:()=>reportWindow.scrollHeight-reportWindow.clientHeight,duration:9,ease:'sine.inOut'},.9);
      break;
    case 'interviews':tl.fromTo(q('.person-mark'),{y:40,scale:.6,opacity:0},{y:0,scale:1,opacity:1,duration:.55,stagger:.035,ease:'power3.out'},.35);break;
  }
  // Toda entrada, incluso la más breve, tiene un estado observable y finito.
  tl.to({},{duration:.05},Math.max(.8,tl.duration()));
}
function updateFragments(el,time,entering){
  const scene=scenes.find(s=>s.id===el.id);let max=0;
  const step=Math.max(0,Math.floor((time-scene.start-.1+.0001)/.5));
  el.querySelectorAll('[data-step]').forEach(node=>{
    const n=Number(node.dataset.step);max=Math.max(max,n);const visible=step>=n,was=node.dataset.shown==='true';
    node.dataset.shown=String(visible);node.style.visibility=visible?'visible':'hidden';node.setAttribute('aria-hidden',String(!visible));
    if(visible&&!was&&!entering&&!reducedMotion&&live){
      if(node.classList.contains('photo-task-reveal')){
        trackFragment(gsap.fromTo(node,{opacity:0,y:45,scale:1.18,rotation:3},{opacity:1,y:0,scale:1,rotation:-2,duration:.65,ease:'power4.out',overwrite:true}));
      }else if(node.classList.contains('tasks-reveal')){
        const reveal=gsap.timeline();
        reveal.fromTo(node,{opacity:0,y:20},{opacity:1,y:0,duration:.4,ease:'power3.out'})
          .fromTo(node.querySelectorAll('.task-strike'),{scaleX:0},{scaleX:1,duration:.45,stagger:.15,ease:'power3.inOut'},.25)
          .fromTo(node.querySelectorAll('.no-task strong'),{opacity:1},{opacity:.4,duration:.45,stagger:.15},.45);
        trackFragment(reveal);
      }else{
        trackFragment(gsap.fromTo(node,{opacity:0,y:18},{opacity:1,y:0,duration:.5,ease:'power3.out',overwrite:true}));
      }
    }else if(!visible||entering||reducedMotion||!live){gsap.set(node,{opacity:visible?1:0,y:0,scale:1,rotation:node.classList.contains('photo-task-reveal')&&visible?-2:0});}
  });
  window.__pitchMotion.step=Math.min(step,max);
  const hint=el.querySelector('.fragment-hint');if(hint)hint.textContent=step>=max?'→ Siguiente diapositiva':'→ Revela la siguiente idea';
  const sum=el.querySelector('[data-sum]');if(sum)sum.textContent=`${40+Math.min(step,2)*30} min`;
}
function showAt(time){
  const next=scenes.find(s=>time>=s.start&&time<s.start+s.duration);if(!next)return;
  const entering=next.id!==activeId;
  if(entering){
    const prevIndex=scenes.findIndex(s=>s.id===activeId),index=scenes.indexOf(next);
    scenes.forEach(s=>{const node=document.getElementById(s.id),active=s.id===next.id;node.style.opacity=active?'1':'0';node.style.visibility=active?'visible':'hidden';node.style.pointerEvents=active?'auto':'none';node.setAttribute('aria-hidden',String(!active));});
    activeId=next.id;window.__pitchMotion.activeScene=activeId;window.__pitchMotion.entrySerial=++serial;
    if(live)parent.document.querySelector('hyperframes-slideshow')?.__pitchSyncTimer?.();
    animateEntry(document.getElementById(activeId),index>=prevIndex?1:-1,scenes[prevIndex]?.id.startsWith('app-demo')&&activeId.startsWith('app-demo'));
  }
  updateFragments(document.getElementById(next.id),time,entering);
}
const duration=Math.max(...scenes.map(s=>s.start+s.duration));const clock=gsap.timeline({paused:true});clock.to({},{duration});
if(live)clock.eventCallback('onUpdate',()=>showAt(clock.time()));
window.__timelines={years:clock};window.__hfSetTime=showAt;showAt(0);
window.addEventListener('load',()=>parent.postMessage({source:'hf-preview',type:'timeline',durationInFrames:duration*30,scenes},'*'));

// Un clic sobre la diapositiva usa el avance oficial (fragmentos y sincronización incluidos).
if(live){
  const deck=parent.document.querySelector('hyperframes-slideshow');
  // El reloj oficial arranca al abrir Present; la pantalla de espera no cuenta.
  if(deck&&!deck.__pitchTimerInstalled){
    deck.__pitchTimerInstalled=true;
    deck.__pitchStartedAt=null;
    const syncTimer=()=>{
      const scene=deck.querySelector('hyperframes-player')?.iframeElement?.contentWindow.__pitchMotion?.activeScene;
      if(scene&&scene!=='slide-0'&&deck.__pitchStartedAt===null)deck.__pitchStartedAt=Date.now();
      deck.presenterStartMs=deck.__pitchStartedAt;
    };
    deck.__pitchSyncTimer=syncTimer;
    const renderPresenter=deck.renderPresenter;
    deck.renderPresenter=function(...args){syncTimer();return renderPresenter.apply(this,args);};
    const updateElapsed=deck.updateElapsed;
    deck.updateElapsed=function(...args){syncTimer();return updateElapsed.apply(this,args);};
    syncTimer();
  }
  const isControl=event=>event.composedPath().some(node=>node?.matches?.('a,button,input,textarea,select,[contenteditable="true"],[role="button"],[data-hf-slideshow-chrome]'));
  const advance=event=>{
    if(event.button!==0||event.defaultPrevented||isControl(event))return;
    if(!deck?.controller)return;
    event.preventDefault();
    deck.controller.next();
  };
  document.addEventListener('click',advance);
  // También cubre los márgenes del reproductor, fuera del iframe.
  if(deck){
    deck.__pitchClickAbort?.abort();
    const abort=new parent.AbortController();deck.__pitchClickAbort=abort;
    deck.addEventListener('click',event=>{
      const onPlayer=event.composedPath().some(node=>node?.matches?.('hyperframes-player'));
      if(onPlayer||event.target===deck)advance(event);
    },{signal:abort.signal});
  }
}
