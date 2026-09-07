import{t as r}from"./chunk-DxqKAYlM.js";import{$ as Lo,Bt as X,Er as um,I,Lt as Wl,Nn as jl,Qn as oe,Rt as Ws,U as JC,Vn as lb,Wn as mb,Wr as zf,Yt as aI,Zn as od,b as Eb,ct as Pv,dt as RI,fn as eb,i as $f,it as Ns,jt as Vg,kt as Ug,mn as em,mr as rt,nt as Mr,p as B,pn as ee,r as $b,rt as N$1,sn as de,st as Po,v as Db,w as Er,xr as st,yn as g,yr as sm}from"./chunk-YPLbCzbP.js";import{E as gn,I as zi,_ as Pt,j as u,l as K,o as Ft,s as Go}from"./chunk-BO0pym3Y.js";import{a as Pt$1,c as Y,g as wt$1,i as J,m as pi,p as oe$1,s as X$1}from"./chunk-3YFRFSU1.js";var O=class{_document;_textarea;constructor(o,t){this._document=t;let e=this._textarea=this._document.createElement(`textarea`),n=e.style;n.position=`fixed`,n.top=n.opacity=`0`,n.left=`-999em`,e.setAttribute(`aria-hidden`,`true`),e.value=o,e.readOnly=!0,(this._document.fullscreenElement||this._document.body).appendChild(e)}copy(){let o=this._textarea,t=!1;try{if(o){let e=this._document.activeElement;o.select(),o.setSelectionRange(0,o.value.length),t=this._document.execCommand(`copy`),e&&e.focus()}}catch{}return t}destroy(){let o=this._textarea;o&&(o.remove(),this._textarea=void 0)}};var ut=(()=>{class a{_document=g(B);copy(t){let e=this.beginCopy(t),n=e.copy();return e.destroy(),n}beginCopy(t){return new O(t,this._document)}static ɵfac=function(e){return new(e||a)};static ɵprov=de({token:a,factory:a.ɵfac})}return a})();function yt(a,o){if(a&1){let t=lb();Ns(0,`div`,1)(1,`button`,2),sm(`click`,function(){$f(t);return zf(mb().action())}),$b(2),jl()()}if(a&2){let t=mb();RI(2),Wl(` `,t.data.action,` `)}}var gt=[`label`];function xt(a,o){}var Ct=Math.pow(2,31)-1;var b=class{_overlayRef;instance;containerInstance;_afterDismissed=new X;_afterOpened=new X;_onAction=new X;_durationTimeoutId;_dismissedByAction=!1;constructor(o,t){this._overlayRef=t,this.containerInstance=o,o._onExit.subscribe(()=>this._finishDismiss())}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId)}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=!0,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId)}closeWithAction(){this.dismissWithAction()}_dismissAfter(o){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(o,Ct))}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete())}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=!1}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}};var pt=new I(`MatSnackBarData`);var m=class{politeness=`polite`;announcementMessage=``;viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition=`center`;verticalPosition=`bottom`};var At=(()=>{class a{static ɵfac=function(e){return new(e||a)};static ɵdir=Mr({type:a,selectors:[[``,`matSnackBarLabel`,``]],hostAttrs:[1,`mat-mdc-snack-bar-label`,`mdc-snackbar__label`]})}return a})();var St=(()=>{class a{static ɵfac=function(e){return new(e||a)};static ɵdir=Mr({type:a,selectors:[[``,`matSnackBarActions`,``]],hostAttrs:[1,`mat-mdc-snack-bar-actions`,`mdc-snackbar__actions`]})}return a})();var Bt=(()=>{class a{static ɵfac=function(e){return new(e||a)};static ɵdir=Mr({type:a,selectors:[[``,`matSnackBarAction`,``]],hostAttrs:[1,`mat-mdc-snack-bar-action`,`mdc-snackbar__action`]})}return a})();var Mt=(()=>{class a{snackBarRef=g(b);data=g(pt);action(){this.snackBarRef.dismissWithAction()}get hasAction(){return!!this.data.action}static ɵfac=function(e){return new(e||a)};static ɵcmp=Lo({type:a,selectors:[[`simple-snack-bar`]],hostAttrs:[1,`mat-mdc-simple-snack-bar`],exportAs:[`matSnackBar`],decls:3,vars:2,consts:[[`matSnackBarLabel`,``],[`matSnackBarActions`,``],[`matButton`,``,`matSnackBarAction`,``,3,`click`]],template:function(e,n){e&1&&(Ns(0,`div`,0),$b(1),jl(),JC(2,yt,3,1,`div`,1)),e&2&&(RI(),Wl(` `,n.data.message,`
`),RI(),eb(n.hasAction?2:-1))},dependencies:[zi,At,St,Bt],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return a})();var N=`_mat-snack-bar-enter`;var F=`_mat-snack-bar-exit`;var wt=(()=>{class a extends J{_ngZone=g(oe);_elementRef=g(rt);_changeDetectorRef=g(od);_platform=g(u);_animationsDisabled=K();snackBarConfig=g(m);_document=g(B);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=g(ee);_announceDelay=150;_announceTimeoutId;_destroyed=!1;_portalOutlet;_onAnnounce=new X;_onExit=new X;_onEnter=new X;_animationState=`void`;_live;_label;_role;_liveElementId=g(Pt).getId(`mat-snack-bar-container-live-`);constructor(){super();let t=this.snackBarConfig;t.politeness===`assertive`&&!t.announcementMessage?this._live=`assertive`:t.politeness===`off`?this._live=`off`:this._live=`polite`,this._platform.FIREFOX&&(this._live===`polite`&&(this._role=`status`),this._live===`assertive`&&(this._role=`alert`))}attachComponentPortal(t){this._assertNotAttached();let e=this._portalOutlet.attachComponentPortal(t);return this._afterPortalAttached(),e}attachTemplatePortal(t){this._assertNotAttached();let e=this._portalOutlet.attachTemplatePortal(t);return this._afterPortalAttached(),e}attachDomPortal=t=>{this._assertNotAttached();let e=this._portalOutlet.attachDomPortal(t);return this._afterPortalAttached(),e};onAnimationEnd(t){t===F?this._completeExit():t===N&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete()}))}enter(){this._destroyed||(this._animationState=`visible`,this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?aI(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(N)))},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add(`mat-snack-bar-fallback-visible`),this.onAnimationEnd(N)},200)))}exit(){return this._destroyed?st(void 0):(this._ngZone.run(()=>{this._animationState=`hidden`,this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute(`mat-exit`,``),clearTimeout(this._announceTimeoutId),this._animationsDisabled?aI(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(F)))},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(F),200))}),this._onExit)}ngOnDestroy(){this._destroyed=!0,this._clearFromModals(),this._completeExit()}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete()})}_afterPortalAttached(){let t=this._elementRef.nativeElement,e=this.snackBarConfig.panelClass;e&&(Array.isArray(e)?e.forEach(r=>t.classList.add(r)):t.classList.add(e)),this._exposeToModals();let n=this._label.nativeElement,i=`mdc-snackbar__label`;n.classList.toggle(i,!n.querySelector(`.${i}`))}_exposeToModals(){let t=this._liveElementId,e=this._document.querySelectorAll(`body > .cdk-overlay-container [aria-modal="true"]`);for(let n=0;n<e.length;n++){let i=e[n],r=i.getAttribute(`aria-owns`);this._trackedModals.add(i),r?r.indexOf(t)===-1&&i.setAttribute(`aria-owns`,r+` `+t):i.setAttribute(`aria-owns`,t)}}_clearFromModals(){this._trackedModals.forEach(t=>{let e=t.getAttribute(`aria-owns`);if(e){let n=e.replace(this._liveElementId,``).trim();n.length>0?t.setAttribute(`aria-owns`,n):t.removeAttribute(`aria-owns`)}}),this._trackedModals.clear()}_assertNotAttached(){this._portalOutlet.hasAttached()}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let t=this._elementRef.nativeElement,e=t.querySelector(`[aria-hidden]`),n=t.querySelector(`[aria-live]`);if(e&&n){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&e.contains(document.activeElement)&&(i=document.activeElement),e.removeAttribute(`aria-hidden`),n.appendChild(e),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete()}},this._announceDelay)})}static ɵfac=function(e){return new(e||a)};static ɵcmp=Lo({type:a,selectors:[[`mat-snack-bar-container`]],viewQuery:function(e,n){if(e&1&&um(pi,7)(gt,7),e&2){let i;Db(i=Eb())&&(n._portalOutlet=i.first),Db(i=Eb())&&(n._label=i.first)}},hostAttrs:[1,`mdc-snackbar`,`mat-mdc-snack-bar-container`],hostVars:6,hostBindings:function(e,n){e&1&&sm(`animationend`,function(r){return n.onAnimationEnd(r.animationName)})(`animationcancel`,function(r){return n.onAnimationEnd(r.animationName)}),e&2&&Ws(`mat-snack-bar-container-enter`,n._animationState===`visible`)(`mat-snack-bar-container-exit`,n._animationState===`hidden`)(`mat-snack-bar-container-animations-enabled`,!n._animationsDisabled)},features:[Vg],decls:6,vars:3,consts:[[`label`,``],[1,`mdc-snackbar__surface`,`mat-mdc-snackbar-surface`],[1,`mat-mdc-snack-bar-label`],[`aria-hidden`,`true`],[`cdkPortalOutlet`,``]],template:function(e,n){e&1&&(Ns(0,`div`,1)(1,`div`,2,0)(3,`div`,3),Ug(4,xt,0,0,`ng-template`,4),jl(),em(5,`div`),jl()()),e&2&&(RI(5),Po(`aria-live`,n._live)(`role`,n._role)(`id`,n._liveElementId))},dependencies:[pi],styles:[`@keyframes _mat-snack-bar-enter {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes _mat-snack-bar-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-snack-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  margin: 8px;
}
.mat-mdc-snack-bar-handset .mat-mdc-snack-bar-container {
  width: 100vw;
}

.mat-snack-bar-container-animations-enabled {
  opacity: 0;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-fallback-visible {
  opacity: 1;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-enter {
  animation: _mat-snack-bar-enter 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-exit {
  animation: _mat-snack-bar-exit 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}

.mat-mdc-snackbar-surface {
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 8px;
}
[dir=rtl] .mat-mdc-snackbar-surface {
  padding-right: 0;
  padding-left: 8px;
}
.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
  min-width: 344px;
  max-width: 672px;
}
.mat-mdc-snack-bar-handset .mat-mdc-snackbar-surface {
  width: 100%;
  min-width: 0;
}
@media (forced-colors: active) {
  .mat-mdc-snackbar-surface {
    outline: solid 1px;
  }
}
.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
  color: var(--%NS%mat-snack-bar-supporting-text-color, var(--%NS%mat-sys-inverse-on-surface));
  border-radius: var(--%NS%mat-snack-bar-container-shape, var(--%NS%mat-sys-corner-extra-small));
  background-color: var(--%NS%mat-snack-bar-container-color, var(--%NS%mat-sys-inverse-surface));
}

.mdc-snackbar__label {
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  padding: 14px 8px 14px 16px;
}
[dir=rtl] .mdc-snackbar__label {
  padding-left: 8px;
  padding-right: 16px;
}
.mat-mdc-snack-bar-container .mdc-snackbar__label {
  font-family: var(--%NS%mat-snack-bar-supporting-text-font, var(--%NS%mat-sys-body-medium-font));
  font-size: var(--%NS%mat-snack-bar-supporting-text-size, var(--%NS%mat-sys-body-medium-size));
  font-weight: var(--%NS%mat-snack-bar-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight));
  line-height: var(--%NS%mat-snack-bar-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
}

.mat-mdc-snack-bar-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
}

.mat-mdc-snack-bar-handset,
.mat-mdc-snack-bar-container,
.mat-mdc-snack-bar-label {
  flex: 1 1 auto;
}

.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled).mat-unthemed {
  color: var(--%NS%mat-snack-bar-button-color, var(--%NS%mat-sys-inverse-primary));
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) {
  --%NS%mat-button-text-state-layer-color: currentColor;
  --%NS%mat-button-text-ripple-color: currentColor;
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element {
  opacity: 0.1;
}
`],encapsulation:2,changeDetection:1})}return a})();var Dt=new I(`mat-snack-bar-default-options`,{providedIn:`root`,factory:()=>new m});var ht=(()=>{class a{_live=g(gn);_injector=g(ee);_breakpointObserver=g(Ft);_parentSnackBar=g(a,{optional:!0,skipSelf:!0});_defaultConfig=g(Dt);_animationsDisabled=K();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=Mt;snackBarContainerComponent=wt;handsetCssClass=`mat-mdc-snack-bar-handset`;get _openedSnackBarRef(){let t=this._parentSnackBar;return t?t._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(t){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=t:this._snackBarRefAtThisLevel=t}openFromComponent(t,e){return this._attach(t,e)}openFromTemplate(t,e){return this._attach(t,e)}open(t,e=``,n){let i=r(r({},this._defaultConfig),n);return i.data={message:t,action:e},i.announcementMessage===t&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss()}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss()}_attachSnackBarContainer(t,e){let n=e&&e.viewContainerRef&&e.viewContainerRef.injector,i=ee.create({parent:n||this._injector,providers:[{provide:m,useValue:e}]}),r=new wt$1(this.snackBarContainerComponent,e.viewContainerRef,i),c=t.attach(r);return c.instance.snackBarConfig=e,c.instance}_attach(t,e){let n=r(r(r({},new m),this._defaultConfig),e),i=this._createOverlay(n),r$1=this._attachSnackBarContainer(i,n),c=new b(r$1,i);if(t instanceof Er){let u=new Y(t,null,{$implicit:n.data,snackBarRef:c});c.instance=r$1.attachTemplatePortal(u)}else{let _t=new wt$1(t,void 0,this._createInjector(n,c));c.instance=r$1.attachComponentPortal(_t).instance}return this._breakpointObserver.observe(Go.HandsetPortrait).pipe(Pv(i.detachments())).subscribe(u=>{i.overlayElement.classList.toggle(this.handsetCssClass,u.matches)}),n.announcementMessage&&r$1._onAnnounce.subscribe(()=>{this._live.announce(n.announcementMessage,n.politeness)}),this._animateSnackBar(c,n),this._openedSnackBarRef=c,this._openedSnackBarRef}_animateSnackBar(t,e){t.afterDismissed().subscribe(()=>{this._openedSnackBarRef==t&&(this._openedSnackBarRef=null),e.announcementMessage&&this._live.clear()}),e.duration&&e.duration>0&&t.afterOpened().subscribe(()=>t._dismissAfter(e.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{t.containerInstance.enter()}),this._openedSnackBarRef.dismiss()):t.containerInstance.enter()}_createOverlay(t){let e=new X$1;e.direction=t.direction;let n=oe$1(this._injector),i=t.direction===`rtl`,r=t.horizontalPosition===`left`||t.horizontalPosition===`start`&&!i||t.horizontalPosition===`end`&&i,c=!r&&t.horizontalPosition!==`center`;return r?n.left(`0`):c?n.right(`0`):n.centerHorizontally(),t.verticalPosition===`top`?n.top(`0`):n.bottom(`0`),e.positionStrategy=n,e.disableAnimations=this._animationsDisabled,Pt$1(this._injector,e)}_createInjector(t,e){let n=t&&t.viewContainerRef&&t.viewContainerRef.injector;return ee.create({parent:n||this._injector,providers:[{provide:b,useValue:e},{provide:pt,useValue:t.data}]})}static ɵfac=function(e){return new(e||a)};static ɵprov=de({token:a,factory:a.ɵfac})}return a})();var Tt=`Clipboard write failed. Retry the copy.`;var Et=3e3;var Rt=6e3;var ft=class a{clipboard=g(ut);snackBar=g(ht);confirm(o){this.snackBar.open(o,void 0,{duration:Et})}warn(o){this.snackBar.open(o,void 0,{duration:Rt,politeness:`assertive`})}copyAndConfirm(o,t){this.clipboard.copy(o)?this.confirm(t):this.warn(Tt)}static ɵfac=function(t){return new(t||a)};static ɵprov=N$1({token:a,factory:a.ɵfac,providedIn:`root`})};export{ft as t};
//# debugId=b42ba523-29ce-5060-89e6-622cf71e57bc
//# sourceMappingURL=chunk-DL0JZr-l.js.map