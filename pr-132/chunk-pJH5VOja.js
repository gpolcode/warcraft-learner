import {T,a$ as dD,b0 as me,x as xo$1,J as J_,p as pa$1,s as se,V as VE,P as Pl$1,b1 as Os,I as q,L as mr$1,ah as AF,M as L,_ as jt,S as Me,a0 as x,b2 as NF,E as ED,b3 as SF,a2 as Ib,a1 as ee,ai as Se,b4 as mt,a8 as xu,b5 as Qh,r as re,b6 as Gh,X as Xt$1,b7 as Zh,D as Dh,b8 as PF,g as FE,b9 as cc,ao as _I,ba as rp,k as si,m as mp,n as iI,ap as MI,C as Cc,w as rv,af as bp,A as sI,ac as cD,bb as Dp,aw as Ep,bc as AI,ax as SI,ay as xI,bd as Ip,be as vp,a9 as $E,ad as hp,bf as ru,bg as wa$1,bh as $t,Z as $v,N as ct,bi as Dd,a3 as Xi$1,bj as Sh,e as Th,aj as Be,a5 as Kl$1,a6 as id,am as Bp,bk as Tr$1,bl as yr$1,bm as en$1,bn as Gn,bo as xr$1,bp as hr$1,bq as W,br as iu,aa as im,ab as kF,au as OF,aO as Eu,o as up,aq as RI,ae as cp,y as lp,ak as fe,al as qs,bs as xs$1,a7 as Ys,bt as Uy,an as zb,az as MF,bu as Qh$1,aA as _F,aB as vv,aC as _v,l as eD,bv as dr$1,Y as Ym,v as v_,aP as Pd,bw as UE,bx as M_,by as x_,bz as W$1,bA as dp,bB as bc,bC as _c,aG as CI,aN as gr$1,bD as ta$1,bE as $y,bF as Mr$1,aI as Ap,aH as Sc,bG as Sd,bH as Iu,bI as pp,bJ as Cp,av as UI,bK as Yy,bL as Pe,bM as ky,bN as Ky,aD as lI,aE as uI,bO as Jy,bP as ZD,bQ as nD,bR as n0,bS as oD,aZ as dc,bT as aD,aF as mI,bU as wd,bV as QD,aT as aI,aQ as fD,aR as hD,bW as XD,bX as t0,bY as e0,U,$,bZ as M,b_ as vl$1,b$ as YD,c0 as $D,c1 as zD,c2 as GD,c3 as HD,c4 as WD,c5 as Rp,c6 as mD,aJ as su,aK as au,c7 as ef,c8 as cI,aS as kp,a_ as gD}from'./main-54VYVGM3.js';var Qt=class{_box;_destroyed=new ee;_resizeSubject=new ee;_resizeObserver;_elementObservables=new Map;constructor(i){this._box=i,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(i){return this._elementObservables.has(i)||this._elementObservables.set(i,new M(e=>{let n=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(i,{box:this._box}),()=>{this._resizeObserver?.unobserve(i),n.unsubscribe(),this._elementObservables.delete(i);}}).pipe(Xt$1(e=>e.some(n=>n.target===i)),vl$1({bufferSize:1,refCount:true}),Zh(this._destroyed))),this._elementObservables.get(i)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},_i=(()=>{class t{_cleanupErrorListener;_observers=new Map;_ngZone=T(Me);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,n){let o=n?.box||"content-box";return this._observers.has(o)||this._observers.set(o,new Qt(o)),this._observers.get(o).observe(e)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=gr$1({token:t,factory:t.\u0275fac})}return t})();var No=["notch"],Bo=["*"],bi=["iconPrefixContainer"],vi=["textPrefixContainer"],xi=["iconSuffixContainer"],yi=["textSuffixContainer"],Lo=["textField"],Wo=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],$o=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function zo(t,i){t&1&&up(0,"span",21);}function Go(t,i){if(t&1&&(si(0,"label",20),MI(1,1),iI(2,zo,1,0,"span",21),Cc()),t&2){let e=CI(2);lp("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),cp("for",e._control.disableAutomaticLabeling?null:e._control.id),rv(2),sI(!e.hideRequiredMarker&&e._control.required?2:-1);}}function Vo(t,i){if(t&1&&iI(0,Go,3,5,"label",20),t&2){let e=CI();sI(e._hasFloatingLabel()?0:-1);}}function jo(t,i){t&1&&up(0,"div",7);}function Ho(t,i){}function qo(t,i){if(t&1&&rp(0,Ho,0,0,"ng-template",13),t&2){CI(2);let e=RI(1);lp("ngTemplateOutlet",e);}}function Uo(t,i){if(t&1&&(si(0,"div",9),iI(1,qo,1,1,null,13),Cc()),t&2){let e=CI();lp("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),rv(),sI(e._forceDisplayInfixLabel()?-1:1);}}function Qo(t,i){t&1&&(si(0,"div",10,2),MI(2,2),Cc());}function Ko(t,i){t&1&&(si(0,"div",11,3),MI(2,3),Cc());}function Yo(t,i){}function Xo(t,i){if(t&1&&rp(0,Yo,0,0,"ng-template",13),t&2){CI();let e=RI(1);lp("ngTemplateOutlet",e);}}function Zo(t,i){t&1&&(si(0,"div",14,4),MI(2,4),Cc());}function Jo(t,i){t&1&&(si(0,"div",15,5),MI(2,5),Cc());}function ea(t,i){t&1&&up(0,"div",16);}function ta(t,i){t&1&&(si(0,"div",18),MI(1,6),Cc());}function na(t,i){if(t&1&&(si(0,"mat-hint",22),eD(1),Cc()),t&2){let e=CI(2);lp("id",e._hintLabelId),rv(),Ap(e.hintLabel);}}function ia(t,i){if(t&1&&(si(0,"div",19),iI(1,na,2,2,"mat-hint",22),MI(2,7),up(3,"div",23),MI(4,8),Cc()),t&2){let e=CI();rv(),sI(e.hintLabel?1:-1);}}var nt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-label"]]})}return t})(),Ei=new x("MatError"),oa=(()=>{class t{id=T(jt).getId("mat-mdc-error-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-error"],["","matError",""]],hostAttrs:[1,"mat-mdc-form-field-error","mat-mdc-form-field-bottom-align"],hostVars:1,hostBindings:function(n,o){n&2&&hp("id",o.id);},inputs:{id:"id"},features:[cD([{provide:Ei,useExisting:t}])]})}return t})(),Kt=(()=>{class t{align="start";id=T(jt).getId("mat-mdc-hint-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(n,o){n&2&&(hp("id",o.id),cp("align",null),bp("mat-mdc-form-field-hint-end",o.align==="end"));},inputs:{align:"align",id:"id"}})}return t})(),aa=new x("MatPrefix");var ra=new x("MatSuffix");var Di=new x("FloatingLabelParent"),wi=(()=>{class t{_elementRef=T(mr$1);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=T(_i);_ngZone=T(Me);_parent=T(Di);_resizeSubscription=new W$1;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return la(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(n,o){n&2&&bp("mdc-floating-label--float-above",o.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return t})();function la(t){let i=t;if(i.offsetParent!==null)return i.scrollWidth;let e=i.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let n=e.scrollWidth;return e.remove(),n}var Ci="mdc-line-ripple--active",vt="mdc-line-ripple--deactivating",Si=(()=>{class t{_elementRef=T(mr$1);_cleanupTransitionEnd;constructor(){let e=T(Me),n=T($v);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=n.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(vt),e.add(Ci);}deactivate(){this._elementRef.nativeElement.classList.add(vt);}_handleTransitionEnd=e=>{let n=this._elementRef.nativeElement.classList,o=n.contains(vt);e.propertyName==="opacity"&&o&&n.remove(Ci,vt);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return t})(),Mi=(()=>{class t{_elementRef=T(mr$1);_ngZone=T(Me);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,n=e.querySelector(".mdc-floating-label");n?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(n.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>n.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let n=this._notch.nativeElement;!this.open||!e?n.style.width="":n.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(n,o){if(n&1&&Ep(No,5),n&2){let a;SI(a=xI())&&(o._notch=a.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(n,o){n&2&&bp("mdc-notched-outline--notched",o.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:Bo,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(n,o){n&1&&(_I(),dp(0,"div",1),bc(1,"div",2,0),MI(3),_c(),dp(4,"div",3));},encapsulation:2})}return t})(),Yt=(()=>{class t{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t})}return t})();var Xt=new x("MatFormField"),sa=new x("MAT_FORM_FIELD_DEFAULT_OPTIONS"),ki="fill",da="auto",Ti="fixed",ca="translateY(-50%)",xt=(()=>{class t{_elementRef=T(mr$1);_changeDetectorRef=T(AF);_platform=T(L);_idGenerator=T(jt);_ngZone=T(Me);_defaults=T(sa,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=NF("iconPrefixContainer");_textPrefixContainerSignal=NF("textPrefixContainer");_iconSuffixContainerSignal=NF("iconSuffixContainer");_textSuffixContainerSignal=NF("textSuffixContainer");_prefixSuffixContainers=ED(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=SF(nt);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=Ib(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||da}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let n=e||this._defaults?.appearance||ki;this._appearanceSignal.set(n);}_appearanceSignal=xo$1(ki);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||Ti}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||Ti;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ee;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=Se();constructor(){let e=this._defaults,n=T(mt);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),xu(()=>this._currentDirection=n.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=ED(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let n=this._control,o="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(o+e.controlType),n.controlType&&this._elementRef.nativeElement.classList.add(o+n.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=n.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=n.stateChanges.pipe(Qh([void 0,void 0]),re(()=>[n.errorState,n.userAriaDescribedBy]),Gh(),Xt$1(([[a,r],[l,s]])=>a!==l||r!==s)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),n.ngControl&&n.ngControl.valueChanges&&(this._valueChanges=n.ngControl.valueChanges.pipe(Zh(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),Dh(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){PF({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=ED(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let n=this._control?this._control.ngControl:null;return n&&n[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let a=this._hintChildren?this._hintChildren.find(l=>l.align==="start"):null,r=this._hintChildren?this._hintChildren.find(l=>l.align==="end"):null;a?e.push(a.id):this._hintLabel&&e.push(this._hintLabelId),r&&e.push(r.id);}else this._errorChildren&&e.push(...this._errorChildren.map(a=>a.id));let n=this._control.describedByIds,o;if(n){let a=this._describedByIds||e;o=e.concat(n.filter(r=>r&&!a.includes(r)));}else o=e;this._control.setDescribedByIds(o),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,n=this._textPrefixContainer?.nativeElement,o=this._iconSuffixContainer?.nativeElement,a=this._textSuffixContainer?.nativeElement,r=e?.getBoundingClientRect().width??0,l=n?.getBoundingClientRect().width??0,s=o?.getBoundingClientRect().width??0,f=a?.getBoundingClientRect().width??0,p=this._currentDirection==="rtl"?"-1":"1",h=`${r+l}px`,y=`calc(${p} * (${h} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,C=`var(--mat-mdc-form-field-label-transform, ${ca} translateX(${y}))`,A=r+l+s+f;return [C,A]}_writeOutlinedLabelStyles(e){if(e!==null){let[n,o]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=n),o!==null&&this._notchedOutline?._setMaxWidth(o);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let n=e.getRootNode();return n&&n!==e}return document.documentElement.contains(e)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-form-field"]],contentQueries:function(n,o,a){if(n&1&&(Ip(a,o._labelChild,nt,5),vp(a,Yt,5)(a,aa,5)(a,ra,5)(a,Ei,5)(a,Kt,5)),n&2){AI();let r;SI(r=xI())&&(o._formFieldControl=r.first),SI(r=xI())&&(o._prefixChildren=r),SI(r=xI())&&(o._suffixChildren=r),SI(r=xI())&&(o._errorChildren=r),SI(r=xI())&&(o._hintChildren=r);}},viewQuery:function(n,o){if(n&1&&(Dp(o._iconPrefixContainerSignal,bi,5)(o._textPrefixContainerSignal,vi,5)(o._iconSuffixContainerSignal,xi,5)(o._textSuffixContainerSignal,yi,5),Ep(Lo,5)(bi,5)(vi,5)(xi,5)(yi,5)(wi,5)(Mi,5)(Si,5)),n&2){AI(4);let a;SI(a=xI())&&(o._textField=a.first),SI(a=xI())&&(o._iconPrefixContainer=a.first),SI(a=xI())&&(o._textPrefixContainer=a.first),SI(a=xI())&&(o._iconSuffixContainer=a.first),SI(a=xI())&&(o._textSuffixContainer=a.first),SI(a=xI())&&(o._floatingLabel=a.first),SI(a=xI())&&(o._notchedOutline=a.first),SI(a=xI())&&(o._lineRipple=a.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(n,o){n&2&&bp("mat-mdc-form-field-label-always-float",o._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",o._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",o._hasIconSuffix)("mat-form-field-invalid",o._control.errorState)("mat-form-field-disabled",o._control.disabled)("mat-form-field-autofilled",o._control.autofilled)("mat-form-field-appearance-fill",o.appearance=="fill")("mat-form-field-appearance-outline",o.appearance=="outline")("mat-form-field-hide-placeholder",o._hasFloatingLabel()&&!o._shouldLabelFloat())("mat-primary",o.color!=="accent"&&o.color!=="warn")("mat-accent",o.color==="accent")("mat-warn",o.color==="warn")("ng-untouched",o._shouldForward("untouched"))("ng-touched",o._shouldForward("touched"))("ng-pristine",o._shouldForward("pristine"))("ng-dirty",o._shouldForward("dirty"))("ng-valid",o._shouldForward("valid"))("ng-invalid",o._shouldForward("invalid"))("ng-pending",o._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[cD([{provide:Xt,useExisting:t},{provide:Di,useExisting:t}])],ngContentSelectors:$o,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(n,o){if(n&1&&(_I(Wo),rp(0,Vo,1,1,"ng-template",null,0,mD),si(2,"div",6,1),mp("click",function(r){return o._control.onContainerClick(r)}),iI(4,jo,1,0,"div",7),si(5,"div",8),iI(6,Uo,2,2,"div",9),iI(7,Qo,3,0,"div",10),iI(8,Ko,3,0,"div",11),si(9,"div",12),iI(10,Xo,1,1,null,13),MI(11),Cc(),iI(12,Zo,3,0,"div",14),iI(13,Jo,3,0,"div",15),Cc(),iI(14,ea,1,0,"div",16),Cc(),si(15,"div",17),iI(16,ta,2,0,"div",18)(17,ia,5,1,"div",19),Cc()),n&2){let a;rv(2),bp("mdc-text-field--filled",!o._hasOutline())("mdc-text-field--outlined",o._hasOutline())("mdc-text-field--no-label",!o._hasFloatingLabel())("mdc-text-field--disabled",o._control.disabled)("mdc-text-field--invalid",o._control.errorState),rv(2),sI(!o._hasOutline()&&!o._control.disabled?4:-1),rv(2),sI(o._hasOutline()?6:-1),rv(),sI(o._hasIconPrefix?7:-1),rv(),sI(o._hasTextPrefix?8:-1),rv(2),sI(!o._hasOutline()||o._forceDisplayInfixLabel()?10:-1),rv(2),sI(o._hasTextSuffix?12:-1),rv(),sI(o._hasIconSuffix?13:-1),rv(),sI(o._hasOutline()?-1:14),rv(),bp("mat-mdc-form-field-subscript-dynamic-size",o.subscriptSizing==="dynamic");let r=o._getSubscriptMessageType();rv(),sI((a=r)==="error"?16:a==="hint"?17:-1);}},dependencies:[wi,Mi,cc,Si,Kt],styles:[`.mdc-text-field {
  display: inline-flex;
  align-items: baseline;
  padding: 0 16px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  will-change: opacity, transform, color;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.mdc-text-field__input {
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 0;
  background: none;
  padding: 0;
  -moz-appearance: none;
  -webkit-appearance: none;
  height: 28px;
}
.mdc-text-field__input::-webkit-calendar-picker-indicator, .mdc-text-field__input::-webkit-search-cancel-button {
  display: none;
}
.mdc-text-field__input::-ms-clear {
  display: none;
}
.mdc-text-field__input:focus {
  outline: none;
}
.mdc-text-field__input:invalid {
  box-shadow: none;
}
.mdc-text-field__input::placeholder {
  opacity: 0;
}
.mdc-text-field__input::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field__input::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field__input:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mdc-text-field--focused .mdc-text-field__input::placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  opacity: 1;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--outlined .mdc-text-field__input, .mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input {
  height: 100%;
}
.mdc-text-field--outlined .mdc-text-field__input {
  display: flex;
  border: none !important;
  background-color: transparent;
}
.mdc-text-field--disabled .mdc-text-field__input {
  pointer-events: auto;
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--mat-form-field-filled-input-text-color, var(--mat-sys-on-surface));
  caret-color: var(--mat-form-field-filled-caret-color, var(--mat-sys-primary));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--mat-form-field-outlined-input-text-color, var(--mat-sys-on-surface));
  caret-color: var(--mat-form-field-outlined-caret-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--mat-form-field-filled-error-caret-color, var(--mat-sys-error));
}
.mdc-text-field--outlined.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--mat-form-field-outlined-error-caret-color, var(--mat-sys-error));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--mat-form-field-filled-disabled-input-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--mat-form-field-outlined-disabled-input-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-text-field__input {
    background-color: Window;
  }
}

.mdc-text-field--filled {
  height: 56px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: var(--mat-form-field-filled-container-shape, var(--mat-sys-corner-extra-small));
  border-top-right-radius: var(--mat-form-field-filled-container-shape, var(--mat-sys-corner-extra-small));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) {
  background-color: var(--mat-form-field-filled-container-color, var(--mat-sys-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled {
  background-color: var(--mat-form-field-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent));
}

.mdc-text-field--outlined {
  height: 56px;
  overflow: visible;
  padding-right: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
  padding-left: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)) + 4px);
}
[dir=rtl] .mdc-text-field--outlined {
  padding-right: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)) + 4px);
  padding-left: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
}

.mdc-floating-label {
  position: absolute;
  left: 0;
  transform-origin: left top;
  line-height: 1.15rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
  overflow: hidden;
  will-change: transform;
}
[dir=rtl] .mdc-floating-label {
  right: 0;
  left: auto;
  transform-origin: right top;
  text-align: right;
}
.mdc-text-field .mdc-floating-label {
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.mdc-notched-outline .mdc-floating-label {
  display: inline-block;
  position: relative;
  max-width: 100%;
}
.mdc-text-field--outlined .mdc-floating-label {
  left: 4px;
  right: auto;
}
[dir=rtl] .mdc-text-field--outlined .mdc-floating-label {
  left: auto;
  right: 4px;
}
.mdc-text-field--filled .mdc-floating-label {
  left: 16px;
  right: auto;
}
[dir=rtl] .mdc-text-field--filled .mdc-floating-label {
  left: auto;
  right: 16px;
}
.mdc-text-field--disabled .mdc-floating-label {
  cursor: default;
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-floating-label {
    z-index: 1;
  }
}
.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label {
  display: none;
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--mat-form-field-filled-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-filled-focus-label-text-color, var(--mat-sys-primary));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--mat-form-field-filled-hover-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-floating-label {
  color: var(--mat-form-field-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--mat-form-field-filled-error-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-filled-error-focus-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--mat-form-field-filled-error-hover-label-text-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--filled .mdc-floating-label {
  font-family: var(--mat-form-field-filled-label-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-form-field-filled-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-form-field-filled-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-form-field-filled-label-text-tracking, var(--mat-sys-body-large-tracking));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--mat-form-field-outlined-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-outlined-focus-label-text-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--mat-form-field-outlined-hover-label-text-color, var(--mat-sys-on-surface));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-floating-label {
  color: var(--mat-form-field-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-focus-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-hover-label-text-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--outlined .mdc-floating-label {
  font-family: var(--mat-form-field-outlined-label-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-form-field-outlined-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-form-field-outlined-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-form-field-outlined-label-text-tracking, var(--mat-sys-body-large-tracking));
}

.mdc-floating-label--float-above {
  cursor: auto;
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--filled .mdc-floating-label--float-above {
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--outlined .mdc-floating-label--float-above {
  transform: translateY(-37.25px) scale(1);
  font-size: 0.75rem;
}
.mdc-notched-outline .mdc-floating-label--float-above {
  text-overflow: clip;
}
.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: 133.3333333333%;
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  transform: translateY(-34.75px) scale(0.75);
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: 1rem;
}

.mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 1px;
  margin-right: 0;
  content: "*";
}
[dir=rtl] .mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 0;
  margin-right: 1px;
}

.mdc-notched-outline {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 100%;
  text-align: left;
  pointer-events: none;
}
[dir=rtl] .mdc-notched-outline {
  text-align: right;
}
.mdc-text-field--outlined .mdc-notched-outline {
  z-index: 1;
}

.mat-mdc-notch-piece {
  box-sizing: border-box;
  height: 100%;
  pointer-events: none;
  border: none;
  border-top: 1px solid;
  border-bottom: 1px solid;
}
.mdc-text-field--focused .mat-mdc-notch-piece {
  border-width: 2px;
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-outline-color, var(--mat-sys-outline));
  border-width: var(--mat-form-field-outlined-outline-width, 1px);
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-hover-outline-color, var(--mat-sys-on-surface));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-focus-outline-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-outline-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-notched-outline .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-hover-outline-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-focus-outline-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline .mat-mdc-notch-piece {
  border-width: var(--mat-form-field-outlined-focus-outline-width, 2px);
}

.mdc-notched-outline__leading {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading {
  width: max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
}
[dir=rtl] .mdc-notched-outline__leading {
  border-left: none;
  border-right: 1px solid;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}

.mdc-notched-outline__trailing {
  flex-grow: 1;
  border-left: none;
  border-right: 1px solid;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}
[dir=rtl] .mdc-notched-outline__trailing {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}

.mdc-notched-outline__notch {
  flex: 0 0 auto;
  width: auto;
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch {
  max-width: min(var(--mat-form-field-notch-max-width, 100%), calc(100% - max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  max-width: min(100%, calc(100% - max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 1px;
}
.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 2px;
}
.mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 0;
  padding-right: 8px;
  border-top: none;
}
[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 8px;
  padding-right: 0;
}
.mdc-notched-outline--no-label .mdc-notched-outline__notch {
  display: none;
}

.mdc-line-ripple::before, .mdc-line-ripple::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-bottom-style: solid;
  content: "";
}
.mdc-line-ripple::before {
  z-index: 1;
  border-bottom-width: var(--mat-form-field-filled-active-indicator-height, 1px);
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-active-indicator-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-hover-active-indicator-color, var(--mat-sys-on-surface));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-disabled-active-indicator-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-error-active-indicator-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-error-hover-active-indicator-color, var(--mat-sys-on-error-container));
}
.mdc-line-ripple::after {
  transform: scaleX(0);
  opacity: 0;
  z-index: 2;
}
.mdc-text-field--filled .mdc-line-ripple::after {
  border-bottom-width: var(--mat-form-field-filled-focus-active-indicator-height, 2px);
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--mat-form-field-filled-focus-active-indicator-color, var(--mat-sys-primary));
}
.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--mat-form-field-filled-error-focus-active-indicator-color, var(--mat-sys-error));
}

.mdc-line-ripple--active::after {
  transform: scaleX(1);
  opacity: 1;
}

.mdc-line-ripple--deactivating::after {
  opacity: 0;
}

.mdc-text-field--disabled {
  pointer-events: none;
}

.mat-mdc-form-field-textarea-control {
  vertical-align: middle;
  resize: vertical;
  box-sizing: border-box;
  height: auto;
  margin: 0;
  padding: 0;
  border: none;
  overflow: auto;
}

.mat-mdc-form-field-input-control.mat-mdc-form-field-input-control {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font: inherit;
  letter-spacing: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  border: none;
}

.mat-mdc-form-field .mat-mdc-floating-label.mdc-floating-label {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  line-height: normal;
  pointer-events: all;
  will-change: auto;
}

.mat-mdc-form-field:not(.mat-form-field-disabled) .mat-mdc-floating-label.mdc-floating-label {
  cursor: inherit;
}

.mdc-text-field--no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input,
.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control {
  height: auto;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control.mdc-text-field__input[type=color] {
  height: 23px;
}

.mat-mdc-text-field-wrapper {
  height: auto;
  flex: auto;
  will-change: auto;
}

.mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-left: 0;
  --mat-mdc-form-field-label-offset-x: -16px;
}

.mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

[dir=rtl] .mat-mdc-text-field-wrapper {
  padding-left: 16px;
  padding-right: 16px;
}
[dir=rtl] .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-left: 0;
}
[dir=rtl] .mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

.mat-form-field-disabled .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-label-always-float .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
  opacity: 1;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-infix .mat-mdc-floating-label {
  left: auto;
  right: auto;
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-text-field__input {
  display: inline-block;
}

.mat-mdc-form-field .mat-mdc-text-field-wrapper.mdc-text-field .mdc-notched-outline__notch {
  padding-top: 0;
}

.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: 1px solid transparent;
}

[dir=rtl] .mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: none;
  border-right: 1px solid transparent;
}

.mat-mdc-form-field-infix {
  min-height: var(--mat-form-field-container-height, 56px);
  padding-top: var(--mat-form-field-filled-with-label-container-padding-top, 24px);
  padding-bottom: var(--mat-form-field-filled-with-label-container-padding-bottom, 8px);
}
.mdc-text-field--outlined .mat-mdc-form-field-infix, .mdc-text-field--no-label .mat-mdc-form-field-infix {
  padding-top: var(--mat-form-field-container-vertical-padding, 16px);
  padding-bottom: var(--mat-form-field-container-vertical-padding, 16px);
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-flex .mat-mdc-floating-label {
  top: calc(var(--mat-form-field-container-height, 56px) / 2);
}

.mdc-text-field--filled .mat-mdc-floating-label {
  display: var(--mat-form-field-filled-label-display, block);
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  --mat-mdc-form-field-label-transform: translateY(calc(calc(6.75px + var(--mat-form-field-container-height, 56px) / 2) * -1))
    scale(var(--mat-mdc-form-field-floating-label-scale, 0.75));
  transform: var(--mat-mdc-form-field-label-transform);
}

@keyframes _mat-form-field-subscript-animation {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mat-mdc-form-field-subscript-wrapper {
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

.mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-error-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
  opacity: 1;
  transform: translateY(0);
  animation: _mat-form-field-subscript-animation 0ms cubic-bezier(0.55, 0, 0.55, 0.2);
}

.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-error-wrapper {
  position: static;
}

.mat-mdc-form-field-bottom-align::before {
  content: "";
  display: inline-block;
  height: 16px;
}

.mat-mdc-form-field-bottom-align.mat-mdc-form-field-subscript-dynamic-size::before {
  content: unset;
}

.mat-mdc-form-field-hint-end {
  order: 1;
}

.mat-mdc-form-field-hint-wrapper {
  display: flex;
}

.mat-mdc-form-field-hint-spacer {
  flex: 1 0 1em;
}

.mat-mdc-form-field-error {
  display: block;
  color: var(--mat-form-field-error-text-color, var(--mat-sys-error));
}

.mat-mdc-form-field-subscript-wrapper,
.mat-mdc-form-field-bottom-align::before {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-form-field-subscript-text-font, var(--mat-sys-body-small-font));
  line-height: var(--mat-form-field-subscript-text-line-height, var(--mat-sys-body-small-line-height));
  font-size: var(--mat-form-field-subscript-text-size, var(--mat-sys-body-small-size));
  letter-spacing: var(--mat-form-field-subscript-text-tracking, var(--mat-sys-body-small-tracking));
  font-weight: var(--mat-form-field-subscript-text-weight, var(--mat-sys-body-small-weight));
}

.mat-mdc-form-field-focus-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  opacity: 0;
  pointer-events: none;
  background-color: var(--mat-form-field-state-layer-color, var(--mat-sys-on-surface));
}
.mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-focus-overlay {
  opacity: var(--mat-form-field-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
  opacity: var(--mat-form-field-focus-state-layer-opacity, 0);
}

select.mat-mdc-form-field-input-control {
  -moz-appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  display: inline-flex;
  box-sizing: border-box;
}
select.mat-mdc-form-field-input-control:not(:disabled) {
  cursor: pointer;
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option {
  color: var(--mat-form-field-select-option-text-color, var(--mat-sys-neutral10));
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled {
  color: var(--mat-form-field-select-disabled-option-text-color, color-mix(in srgb, var(--mat-sys-neutral10) 38%, transparent));
}

.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  content: "";
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid;
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -2.5px;
  pointer-events: none;
  color: var(--mat-form-field-enabled-select-arrow-color, var(--mat-sys-on-surface-variant));
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  right: auto;
  left: 0;
}
.mat-mdc-form-field-type-mat-native-select.mat-focused .mat-mdc-form-field-infix::after {
  color: var(--mat-form-field-focus-select-arrow-color, var(--mat-sys-primary));
}
.mat-mdc-form-field-type-mat-native-select.mat-form-field-disabled .mat-mdc-form-field-infix::after {
  color: var(--mat-form-field-disabled-select-arrow-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 15px;
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 0;
  padding-left: 15px;
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill .mat-mdc-text-field-wrapper {
    outline: solid 1px;
  }
}
@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-form-field-disabled .mat-mdc-text-field-wrapper {
    outline-color: GrayText;
  }
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-focused .mat-mdc-text-field-wrapper {
    outline: dashed 3px;
  }
}

@media (forced-colors: active) {
  .mat-mdc-form-field.mat-focused .mdc-notched-outline {
    border: dashed 3px;
  }
}

.mat-mdc-form-field-input-control[type=date], .mat-mdc-form-field-input-control[type=datetime], .mat-mdc-form-field-input-control[type=datetime-local], .mat-mdc-form-field-input-control[type=month], .mat-mdc-form-field-input-control[type=week], .mat-mdc-form-field-input-control[type=time] {
  line-height: 1;
}
.mat-mdc-form-field-input-control::-webkit-datetime-edit {
  line-height: 1;
  padding: 0;
  margin-bottom: -2px;
}

.mat-mdc-form-field {
  --mat-mdc-form-field-floating-label-scale: 0.75;
  display: inline-flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-form-field-container-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-form-field-container-text-size, var(--mat-sys-body-large-size));
  letter-spacing: var(--mat-form-field-container-text-tracking, var(--mat-sys-body-large-tracking));
  font-weight: var(--mat-form-field-container-text-weight, var(--mat-sys-body-large-weight));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-floating-label--float-above {
  font-size: calc(var(--mat-form-field-outlined-label-text-populated-size) * var(--mat-mdc-form-field-floating-label-scale));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: var(--mat-form-field-outlined-label-text-populated-size);
}
[dir=rtl] .mat-mdc-form-field {
  text-align: right;
}

.mat-mdc-form-field-flex {
  display: inline-flex;
  align-items: baseline;
  box-sizing: border-box;
  width: 100%;
}

.mat-mdc-text-field-wrapper {
  width: 100%;
  z-index: 0;
}

.mat-mdc-form-field-icon-prefix,
.mat-mdc-form-field-icon-suffix {
  align-self: center;
  line-height: 0;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}
.mat-mdc-form-field-icon-prefix > .mat-icon,
.mat-mdc-form-field-icon-suffix > .mat-icon {
  padding: 0 12px;
  box-sizing: content-box;
}

.mat-mdc-form-field-icon-prefix {
  color: var(--mat-form-field-leading-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-prefix {
  color: var(--mat-form-field-disabled-leading-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-trailing-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-disabled-trailing-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-invalid .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-trailing-icon-color, var(--mat-sys-error));
}
.mat-form-field-invalid:not(.mat-focused):not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-hover-trailing-icon-color, var(--mat-sys-on-error-container));
}
.mat-form-field-invalid.mat-focused .mat-mdc-text-field-wrapper .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-focus-trailing-icon-color, var(--mat-sys-error));
}

.mat-mdc-form-field-icon-prefix,
[dir=rtl] .mat-mdc-form-field-icon-suffix {
  padding: 0 4px 0 0;
}

.mat-mdc-form-field-icon-suffix,
[dir=rtl] .mat-mdc-form-field-icon-prefix {
  padding: 0 0 0 4px;
}

.mat-mdc-form-field-subscript-wrapper .mat-icon,
.mat-mdc-form-field label .mat-icon {
  width: 1em;
  height: 1em;
  font-size: inherit;
}

.mat-mdc-form-field-infix {
  flex: auto;
  min-width: 0;
  width: 180px;
  position: relative;
  box-sizing: border-box;
}
.mat-mdc-form-field-infix:has(textarea[cols]) {
  width: auto;
}

.mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: -1px;
  -webkit-clip-path: inset(-9em -999em -9em 1px);
  clip-path: inset(-9em -999em -9em 1px);
}
[dir=rtl] .mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: 0;
  margin-right: -1px;
  -webkit-clip-path: inset(-9em 1px -9em -999em);
  clip-path: inset(-9em 1px -9em -999em);
}

.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-floating-label {
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-moz-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-webkit-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input:-ms-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field--filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before {
  transition-duration: 75ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-line-ripple::after {
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-error-wrapper {
  animation-duration: 300ms;
}

.mdc-notched-outline .mdc-floating-label {
  max-width: calc(100% + 1px);
}

.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: calc(133.3333333333% + 1px);
}
`],encapsulation:2})}return t})();var yt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[Os,xt,q]})}return t})();var pa=["text"],ua=[[["mat-icon"]],"*"],fa=["mat-icon","*"];function ha(t,i){if(t&1&&up(0,"mat-pseudo-checkbox",1),t&2){let e=CI();lp("disabled",e.disabled)("state",e.selected?"checked":"unchecked");}}function ga(t,i){if(t&1&&up(0,"mat-pseudo-checkbox",3),t&2){let e=CI();lp("disabled",e.disabled);}}function _a(t,i){if(t&1&&(si(0,"span",4),eD(1),Cc()),t&2){let e=CI();rv(),Sc("(",e.group.label,")");}}var Jt=new x("MAT_OPTION_PARENT_COMPONENT"),en=new x("MatOptgroup");var Zt=class{source;isUserInput;constructor(i,e=false){this.source=i,this.isUserInput=e;}},qe=(()=>{class t{_element=T(mr$1);_changeDetectorRef=T(AF);_parent=T(Jt,{optional:true});group=T(en,{optional:true});_signalDisableRipple=false;_selected=false;_active=false;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=T(jt).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=xo$1(false);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return !!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new Be;_text;_stateChanges=new ee;constructor(){let e=T(fe);e.load(qs),e.load(xs$1),this._signalDisableRipple=!!this._parent&&Ys(this._parent.disableRipple);}get active(){return this._active}get viewValue(){return (this._text?.nativeElement.textContent||"").trim()}select(e=true){this._selected||(this._selected=true,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}deselect(e=true){this._selected&&(this._selected=false,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}focus(e,n){let o=this._getHostElement();typeof o.focus=="function"&&o.focus(n);}setActiveStyles(){this._active||(this._active=true,this._changeDetectorRef.markForCheck());}setInactiveStyles(){this._active&&(this._active=false,this._changeDetectorRef.markForCheck());}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!Gn(e)&&(this._selectViaInteraction(),e.preventDefault());}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:true,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(true));}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e);}}ngOnDestroy(){this._stateChanges.complete();}_emitSelectionChangeEvent(e=false){this.onSelectionChange.emit(new Zt(this,e));}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-option"]],viewQuery:function(n,o){if(n&1&&Ep(pa,7),n&2){let a;SI(a=xI())&&(o._text=a.first);}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(n,o){n&1&&mp("click",function(){return o._selectViaInteraction()})("keydown",function(r){return o._handleKeydown(r)}),n&2&&(hp("id",o.id),cp("aria-selected",o.selected)("aria-disabled",o.disabled.toString()),bp("mdc-list-item--selected",o.selected)("mat-mdc-option-multiple",o.multiple)("mat-mdc-option-active",o.active)("mdc-list-item--disabled",o.disabled));},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",kF]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:fa,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(n,o){n&1&&(_I(ua),iI(0,ha,1,2,"mat-pseudo-checkbox",1),MI(1),si(2,"span",2,0),MI(4,1),Cc(),iI(5,ga,1,1,"mat-pseudo-checkbox",3),iI(6,_a,2,1,"span",4),up(7,"div",5)),n&2&&(sI(o.multiple?0:-1),rv(5),sI(!o.multiple&&o.selected&&!o.hideSingleSelectionIndicator?5:-1),rv(),sI(o.group&&o.group._inert?6:-1),rv(),lp("matRippleTrigger",o._getHostElement())("matRippleDisabled",o.disabled||o.disableRipple));},dependencies:[Uy,zb],styles:[`.mat-mdc-option {
  -webkit-user-select: none;
  user-select: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  min-height: 48px;
  padding: 0 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  color: var(--mat-option-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-option-label-text-font, var(--mat-sys-label-large-font));
  line-height: var(--mat-option-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-size: var(--mat-option-label-text-size, var(--mat-sys-body-large-size));
  letter-spacing: var(--mat-option-label-text-tracking, var(--mat-sys-label-large-tracking));
  font-weight: var(--mat-option-label-text-weight, var(--mat-sys-body-large-weight));
}
.mat-mdc-option:hover:not(.mdc-list-item--disabled) {
  background-color: var(--mat-option-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-option:focus.mdc-list-item, .mat-mdc-option.mat-mdc-option-active.mdc-list-item {
  background-color: var(--mat-option-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
  outline: 0;
}
.mat-mdc-option.mdc-list-item--selected:not(.mdc-list-item--disabled):not(.mat-mdc-option-active, .mat-mdc-option-multiple, :focus, :hover) {
  background-color: var(--mat-option-selected-state-layer-color, var(--mat-sys-secondary-container));
}
.mat-mdc-option.mdc-list-item--selected:not(.mdc-list-item--disabled):not(.mat-mdc-option-active, .mat-mdc-option-multiple, :focus, :hover) .mdc-list-item__primary-text {
  color: var(--mat-option-selected-state-label-text-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-option .mat-pseudo-checkbox {
  --mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-option-selected-state-label-text-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-option.mdc-list-item {
  align-items: center;
  background: transparent;
}
.mat-mdc-option.mdc-list-item--disabled {
  cursor: default;
  pointer-events: none;
}
.mat-mdc-option.mdc-list-item--disabled .mat-mdc-option-pseudo-checkbox, .mat-mdc-option.mdc-list-item--disabled .mdc-list-item__primary-text, .mat-mdc-option.mdc-list-item--disabled > mat-icon {
  opacity: 0.38;
}
.mat-mdc-optgroup .mat-mdc-option:not(.mat-mdc-option-multiple) {
  padding-left: 32px;
}
[dir=rtl] .mat-mdc-optgroup .mat-mdc-option:not(.mat-mdc-option-multiple) {
  padding-left: 16px;
  padding-right: 32px;
}
.mat-mdc-option .mat-icon,
.mat-mdc-option .mat-pseudo-checkbox-full {
  margin-right: 16px;
  flex-shrink: 0;
}
[dir=rtl] .mat-mdc-option .mat-icon,
[dir=rtl] .mat-mdc-option .mat-pseudo-checkbox-full {
  margin-right: 0;
  margin-left: 16px;
}
.mat-mdc-option .mat-pseudo-checkbox-minimal {
  margin-left: 16px;
  flex-shrink: 0;
}
[dir=rtl] .mat-mdc-option .mat-pseudo-checkbox-minimal {
  margin-right: 16px;
  margin-left: 0;
}
.mat-mdc-option .mat-mdc-option-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-option .mdc-list-item__primary-text {
  white-space: normal;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  font-family: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  margin-right: auto;
}
[dir=rtl] .mat-mdc-option .mdc-list-item__primary-text {
  margin-right: 0;
  margin-left: auto;
}
@media (forced-colors: active) {
  .mat-mdc-option.mdc-list-item--selected:not(:has(.mat-mdc-option-pseudo-checkbox))::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 10px;
    height: 0;
    border-bottom: solid 10px;
    border-radius: 10px;
  }
  [dir=rtl] .mat-mdc-option.mdc-list-item--selected:not(:has(.mat-mdc-option-pseudo-checkbox))::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-option-multiple {
  --mat-list-list-item-selected-container-color: var(--mat-list-list-item-container-color, transparent);
}

.mat-mdc-option-active .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})}return t})();function Ii(t,i,e){if(e.length){let n=i.toArray(),o=e.toArray(),a=0;for(let r=0;r<t+1;r++)n[r].group&&n[r].group===o[a]&&a++;return a}return 0}function Ri(t,i,e,n){return t<e?t:t+i>e+n?Math.max(0,t-n+i):e}var Pi=(()=>{class t{isErrorState(e,n){return !!(e&&e.invalid&&(e.touched||n&&n.submitted))}static \u0275fac=function(n){return new(n||t)};static \u0275prov=gr$1({token:t,factory:t.\u0275fac})}return t})();var St=class{_defaultMatcher;ngControl;_parentFormGroup;_parentForm;_stateChanges;errorState=false;matcher;constructor(i,e,n,o,a){this._defaultMatcher=i,this.ngControl=e,this._parentFormGroup=n,this._parentForm=o,this._stateChanges=a;}updateErrorState(){let i=this.errorState,e=this._parentFormGroup||this._parentForm,n=this.matcher||this._defaultMatcher,o=this.ngControl?this.ngControl.control:null,a=n?.isErrorState(o,e)??false;a!==i&&(this.errorState=a,this._stateChanges.next());}};var tn=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[ta$1,$y,qe,q]})}return t})();var wa=["trigger"],Ca=["panel"],Sa=[[["mat-select-trigger"]],"*"],Ma=["mat-select-trigger","*"];function ka(t,i){if(t&1&&(si(0,"span",4),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.placeholder);}}function Ta(t,i){t&1&&MI(0);}function Ea(t,i){if(t&1&&(si(0,"span",11),eD(1),Cc()),t&2){let e=CI(2);rv(),Ap(e.triggerValue);}}function Da(t,i){if(t&1&&(si(0,"span",5),iI(1,Ta,1,0)(2,Ea,2,1,"span",11),Cc()),t&2){let e=CI();rv(),sI(e.customTrigger?1:2);}}function Ia(t,i){if(t&1){let e=mI();si(0,"div",12,1),mp("keydown",function(o){su(e);let a=CI();return au(a._handleKeydown(o))}),MI(2,1),Cc();}if(t&2){let e=CI();UI(e.panelClass),bp("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),cp("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Ra=new x("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let t=T(me);return ()=>Mr$1(t)}}),Pa=new x("MAT_SELECT_CONFIG"),Oi=new x("MatSelectTrigger"),nn=class{source;value;constructor(i,e){this.source=i,this.value=e;}},Ni=(()=>{class t{_viewportRuler=T($t);_changeDetectorRef=T(AF);_elementRef=T(mr$1);_dir=T(mt,{optional:true});_idGenerator=T(jt);_renderer=T($v);_parentFormField=T(Xt,{optional:true});ngControl=T(ct,{self:true,optional:true});_liveAnnouncer=T(Dd);_defaultOptions=T(Pa,{optional:true});_animationsDisabled=Se();_popoverLocation;_initialized=new ee;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let n=this.options.toArray()[e];if(n){let o=this.panel.nativeElement,a=Ii(e,this.options,this.optionGroups),r=n._getHostElement();e===0&&a===1?o.scrollTop=0:o.scrollTop=Ri(r.offsetTop,r.offsetHeight,o.scrollTop,o.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new nn(this,e)}_scrollStrategyFactory=T(Ra);_panelOpen=false;_compareWith=(e,n)=>e===n;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ee;_errorStateTracker;stateChanges=new ee;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=xo$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(Xi$1.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=Sh(()=>{let e=this.options;return e?e.changes.pipe(Qh(e),Th(()=>Dh(...e.map(n=>n.onSelectionChange)))):this._initialized.pipe(Th(()=>this.optionSelectionChanges))});openedChange=new Be;_openedStream=this.openedChange.pipe(Xt$1(e=>e),re(()=>{}));_closedStream=this.openedChange.pipe(Xt$1(e=>!e),re(()=>{}));selectionChange=new Be;valueChange=new Be;constructor(){let e=T(Pi),n=T(Kl$1,{optional:true}),o=T(id,{optional:true}),a=T(new Bp("tabindex"),{optional:true}),r=T(Tr$1,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new St(e,this.ngControl,o,n,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=a==null?0:parseInt(a)||0,this._popoverLocation=r?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new yr$1(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(Zh(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(Zh(this._destroy)).subscribe(e=>{e.added.forEach(n=>n.select()),e.removed.forEach(n=>n.deselect());}),this.options.changes.pipe(Qh(null),Zh(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),n=this.ngControl;if(e!==this._triggerAriaLabelledBy){let o=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?o.setAttribute("aria-labelledby",e):o.removeAttribute("aria-labelledby");}n&&(this._previousControl!==n.control&&(this._previousControl!==void 0&&n.disabled!==null&&n.disabled!==this.disabled&&(this.disabled=n.disabled),this._previousControl=n.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(en$1(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{n(),clearTimeout(o),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,n=this._renderer.listen(e,"animationend",a=>{a.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),o=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(n=>n.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let n=e.keyCode,o=n===40||n===38||n===37||n===39,a=n===13||n===32,r=this._keyManager;if(!r.isTyping()&&a&&!Gn(e)||(this.multiple||e.altKey)&&o)e.preventDefault(),this.open();else if(!this.multiple){let l=this.selected;r.onKeydown(e);let s=this.selected;s&&l!==s&&this._liveAnnouncer.announce(s.viewValue,1e4);}}_handleOpenKeydown(e){let n=this._keyManager,o=e.keyCode,a=o===40||o===38,r=n.isTyping();if(a&&e.altKey)e.preventDefault(),this.close();else if(!r&&(o===13||o===32)&&n.activeItem&&!Gn(e))e.preventDefault(),n.activeItem._selectViaInteraction();else if(!r&&this._multiple&&o===65&&e.ctrlKey){e.preventDefault();let l=this.options.some(s=>!s.disabled&&!s.selected);this.options.forEach(s=>{s.disabled||(l?s.select():s.deselect());});}else {let l=n.activeItemIndex;n.onKeydown(e),this._multiple&&a&&e.shiftKey&&n.activeItem&&n.activeItemIndex!==l&&n.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!Gn(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(n=>n.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(n=>this._selectOptionByValue(n)),this._sortValues();else {let n=this._selectOptionByValue(e);n?this._keyManager.updateActiveItem(n):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let n=this.options.find(o=>{if(this._selectionModel.isSelected(o))return  false;try{return (o.value!=null||this.canSelectNullableOptions)&&this._compareWith(o.value,e)}catch{return  false}});return n&&this._selectionModel.select(n),n}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof xr$1?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new hr$1(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=Dh(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Zh(e)).subscribe(n=>{this._onSelect(n.source,n.isUserInput),n.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),Dh(...this.options.map(n=>n._stateChanges)).pipe(Zh(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,n){let o=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(o!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),n&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),n&&this.focus())),o!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((n,o)=>this.sortComparator?this.sortComparator(n,o,e):e.indexOf(n)-e.indexOf(o)),this.stateChanges.next();}}_propagateChanges(e){let n;this.multiple?n=this.selected.map(o=>o.value):n=this.selected?this.selected.value:e,this._value=n,this.valueChange.emit(n),this._onChange(n),this.selectionChange.emit(this._getChangeEvent(n)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let n=0;n<this.options.length;n++)if(!this.options.get(n).disabled){e=n;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,n=e?e+" ":"";return this.ariaLabelledby?n+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let n=this._elementRef.nativeElement;e.length?n.setAttribute("aria-describedby",e.join(" ")):n.removeAttribute("aria-describedby");}onContainerClick(e){let n=W(e);n&&(n.tagName==="MAT-OPTION"||n.classList.contains("cdk-overlay-backdrop")||n.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-select"]],contentQueries:function(n,o,a){if(n&1&&vp(a,Oi,5)(a,qe,5)(a,en,5),n&2){let r;SI(r=xI())&&(o.customTrigger=r.first),SI(r=xI())&&(o.options=r),SI(r=xI())&&(o.optionGroups=r);}},viewQuery:function(n,o){if(n&1&&Ep(wa,5)(Ca,5)(iu,5),n&2){let a;SI(a=xI())&&(o.trigger=a.first),SI(a=xI())&&(o.panel=a.first),SI(a=xI())&&(o._overlayDir=a.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(n,o){n&1&&mp("keydown",function(r){return o._handleKeydown(r)})("focus",function(){return o._onFocus()})("blur",function(){return o._onBlur()}),n&2&&(cp("id",o.id)("tabindex",o.disabled?-1:o.tabIndex)("aria-controls",o.panelOpen?o.id+"-panel":null)("aria-expanded",o.panelOpen)("aria-label",o.ariaLabel||null)("aria-required",o.required.toString())("aria-disabled",o.disabled.toString())("aria-invalid",o.errorState)("aria-activedescendant",o._getAriaActiveDescendant()),bp("mat-mdc-select-disabled",o.disabled)("mat-mdc-select-invalid",o.errorState)("mat-mdc-select-required",o.required)("mat-mdc-select-empty",o.empty)("mat-mdc-select-multiple",o.multiple)("mat-select-open",o.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",kF],disableRipple:[2,"disableRipple","disableRipple",kF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:OF(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",kF],placeholder:"placeholder",required:[2,"required","required",kF],multiple:[2,"multiple","multiple",kF],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",kF],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",OF],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",kF]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[cD([{provide:Yt,useExisting:t},{provide:Jt,useExisting:t}]),im],ngContentSelectors:Ma,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(n,o){if(n&1&&(_I(Sa),si(0,"div",2,0),mp("click",function(){return o.open()}),si(3,"div",3),iI(4,ka,2,1,"span",4)(5,Da,3,1,"span",5),Cc(),si(6,"div",6)(7,"div",7),Eu(),si(8,"svg",8),up(9,"path",9),Cc()()()(),rp(10,Ia,3,16,"ng-template",10),mp("detach",function(){return o.close()})("backdropClick",function(){return o.close()})("overlayKeydown",function(r){return o._handleOverlayKeydown(r)})),n&2){let a=RI(1);rv(3),cp("id",o._valueId),rv(),sI(o.empty?4:5),rv(6),lp("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",o._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",o._scrollStrategy)("cdkConnectedOverlayOrigin",o._preferredOverlayOrigin||a)("cdkConnectedOverlayPositions",o._positions)("cdkConnectedOverlayWidth",o._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",o._popoverLocation);}},dependencies:[xr$1,iu],styles:[`@keyframes _mat-select-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-select-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-select {
  display: inline-block;
  width: 100%;
  outline: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: var(--mat-select-enabled-trigger-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-select-trigger-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-select-trigger-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-select-trigger-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-select-trigger-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-select-trigger-text-tracking, var(--mat-sys-body-large-tracking));
}

div.mat-mdc-select-panel {
  box-shadow: var(--mat-select-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
}

.mat-mdc-select-disabled {
  color: var(--mat-select-disabled-trigger-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-select-disabled .mat-mdc-select-placeholder {
  color: var(--mat-select-disabled-trigger-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-select-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  width: 100%;
}
.mat-mdc-select-disabled .mat-mdc-select-trigger {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}

.mat-mdc-select-value {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mat-mdc-select-value-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mat-mdc-select-arrow-wrapper {
  height: 24px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}
.mat-form-field-appearance-fill .mdc-text-field--no-label .mat-mdc-select-arrow-wrapper {
  transform: none;
}

.mat-mdc-form-field .mat-mdc-select.mat-mdc-select-invalid .mat-mdc-select-arrow,
.mat-form-field-invalid:not(.mat-form-field-disabled) .mat-mdc-form-field-infix::after {
  color: var(--mat-select-invalid-arrow-color, var(--mat-sys-error));
}

.mat-mdc-select-arrow {
  width: 10px;
  height: 5px;
  position: relative;
  color: var(--mat-select-enabled-arrow-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-form-field.mat-focused .mat-mdc-select-arrow {
  color: var(--mat-select-focused-arrow-color, var(--mat-sys-primary));
}
.mat-mdc-form-field .mat-mdc-select.mat-mdc-select-disabled .mat-mdc-select-arrow {
  color: var(--mat-select-disabled-arrow-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-select-open .mat-mdc-select-arrow {
  transform: rotate(180deg);
}
.mat-form-field-animations-enabled .mat-mdc-select-arrow {
  transition: transform 80ms linear;
}
.mat-mdc-select-arrow svg {
  fill: currentColor;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@media (forced-colors: active) {
  .mat-mdc-select-arrow svg {
    fill: CanvasText;
  }
  .mat-mdc-select-disabled .mat-mdc-select-arrow svg {
    fill: GrayText;
  }
}

div.mat-mdc-select-panel {
  width: 100%;
  max-height: 275px;
  outline: 0;
  overflow: auto;
  padding: 8px 0;
  box-sizing: border-box;
  transform-origin: top center;
  border-radius: 0 0 4px 4px;
  position: relative;
  background-color: var(--mat-select-panel-background-color, var(--mat-sys-surface-container));
}
.mat-mdc-select-panel-above div.mat-mdc-select-panel {
  border-radius: 4px 4px 0 0;
  transform-origin: bottom center;
}
@media (forced-colors: active) {
  div.mat-mdc-select-panel {
    outline: solid 1px;
  }
}

.mat-select-panel-animations-enabled {
  animation: _mat-select-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-select-panel-animations-enabled.mat-select-panel-exit {
  animation: _mat-select-exit 100ms linear;
}

.mat-mdc-select-placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--mat-select-placeholder-text-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-form-field:not(.mat-form-field-animations-enabled) .mat-mdc-select-placeholder, ._mat-animation-noopable .mat-mdc-select-placeholder {
  transition: none;
}
.mat-form-field-hide-placeholder .mat-mdc-select-placeholder {
  color: transparent;
  -webkit-text-fill-color: transparent;
  transition: none;
  display: block;
}

.mat-mdc-form-field-type-mat-select:not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper {
  cursor: pointer;
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-fill .mat-mdc-floating-label {
  max-width: calc(100% - 18px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-fill .mdc-floating-label--float-above {
  max-width: calc(100% / 0.75 - 24px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-outline .mdc-notched-outline__notch {
  max-width: calc(100% - 60px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-outline .mdc-text-field--label-floating .mdc-notched-outline__notch {
  max-width: calc(100% - 24px);
}

.mat-mdc-select-min-line:empty::before {
  content: " ";
  white-space: pre;
  width: 1px;
  display: inline-block;
  visibility: hidden;
}

.mat-form-field-appearance-fill .mat-mdc-select-arrow-wrapper {
  transform: var(--mat-select-arrow-transform, translateY(-8px));
}
`],encapsulation:2})}return t})(),oc=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-select-trigger"]],features:[cD([{provide:Oi,useExisting:t}])]})}return t})(),Bi=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[ru,tn,q,wa$1,yt,tn]})}return t})();var Aa=["*"];var Oa=new x("MAT_CARD_CONFIG"),pc=(()=>{class t{appearance;constructor(){let e=T(Oa,{optional:true});this.appearance=e?.appearance||"raised";}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-card"]],hostAttrs:[1,"mat-mdc-card","mdc-card"],hostVars:8,hostBindings:function(n,o){n&2&&bp("mat-mdc-card-outlined",o.appearance==="outlined")("mdc-card--outlined",o.appearance==="outlined")("mat-mdc-card-filled",o.appearance==="filled")("mdc-card--filled",o.appearance==="filled");},inputs:{appearance:"appearance"},exportAs:["matCard"],ngContentSelectors:Aa,decls:1,vars:0,template:function(n,o){n&1&&(_I(),MI(0));},styles:[`.mat-mdc-card {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  border-style: solid;
  border-width: 0;
  background-color: var(--mat-card-elevated-container-color, var(--mat-sys-surface-container-low));
  border-color: var(--mat-card-elevated-container-color, var(--mat-sys-surface-container-low));
  border-radius: var(--mat-card-elevated-container-shape, var(--mat-sys-corner-medium));
  box-shadow: var(--mat-card-elevated-container-elevation, var(--mat-sys-level1));
}
.mat-mdc-card::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: solid 1px transparent;
  content: "";
  display: block;
  pointer-events: none;
  box-sizing: border-box;
  border-radius: var(--mat-card-elevated-container-shape, var(--mat-sys-corner-medium));
}

.mat-mdc-card-outlined {
  background-color: var(--mat-card-outlined-container-color, var(--mat-sys-surface));
  border-radius: var(--mat-card-outlined-container-shape, var(--mat-sys-corner-medium));
  border-width: var(--mat-card-outlined-outline-width, 1px);
  border-color: var(--mat-card-outlined-outline-color, var(--mat-sys-outline-variant));
  box-shadow: var(--mat-card-outlined-container-elevation, var(--mat-sys-level0));
}
.mat-mdc-card-outlined::after {
  border: none;
}

.mat-mdc-card-filled {
  background-color: var(--mat-card-filled-container-color, var(--mat-sys-surface-container-highest));
  border-radius: var(--mat-card-filled-container-shape, var(--mat-sys-corner-medium));
  box-shadow: var(--mat-card-filled-container-elevation, var(--mat-sys-level0));
}

.mdc-card__media {
  position: relative;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.mdc-card__media::before {
  display: block;
  content: "";
}
.mdc-card__media:first-child {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.mdc-card__media:last-child {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

.mat-mdc-card-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  min-height: 52px;
  padding: 8px;
}

.mat-mdc-card-title {
  font-family: var(--mat-card-title-text-font, var(--mat-sys-title-large-font));
  line-height: var(--mat-card-title-text-line-height, var(--mat-sys-title-large-line-height));
  font-size: var(--mat-card-title-text-size, var(--mat-sys-title-large-size));
  letter-spacing: var(--mat-card-title-text-tracking, var(--mat-sys-title-large-tracking));
  font-weight: var(--mat-card-title-text-weight, var(--mat-sys-title-large-weight));
}

.mat-mdc-card-subtitle {
  color: var(--mat-card-subtitle-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-card-subtitle-text-font, var(--mat-sys-title-medium-font));
  line-height: var(--mat-card-subtitle-text-line-height, var(--mat-sys-title-medium-line-height));
  font-size: var(--mat-card-subtitle-text-size, var(--mat-sys-title-medium-size));
  letter-spacing: var(--mat-card-subtitle-text-tracking, var(--mat-sys-title-medium-tracking));
  font-weight: var(--mat-card-subtitle-text-weight, var(--mat-sys-title-medium-weight));
}

.mat-mdc-card-title,
.mat-mdc-card-subtitle {
  display: block;
  margin: 0;
}
.mat-mdc-card-avatar ~ .mat-mdc-card-header-text .mat-mdc-card-title,
.mat-mdc-card-avatar ~ .mat-mdc-card-header-text .mat-mdc-card-subtitle {
  padding: 16px 16px 0;
}

.mat-mdc-card-header {
  display: flex;
  padding: 16px 16px 0;
}

.mat-mdc-card-content {
  display: block;
  padding: 0 16px;
}
.mat-mdc-card-content:first-child {
  padding-top: 16px;
}
.mat-mdc-card-content:last-child {
  padding-bottom: 16px;
}

.mat-mdc-card-title-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.mat-mdc-card-avatar {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: 16px;
  object-fit: cover;
}
.mat-mdc-card-avatar ~ .mat-mdc-card-header-text .mat-mdc-card-subtitle,
.mat-mdc-card-avatar ~ .mat-mdc-card-header-text .mat-mdc-card-title {
  line-height: normal;
}

.mat-mdc-card-sm-image {
  width: 80px;
  height: 80px;
}

.mat-mdc-card-md-image {
  width: 112px;
  height: 112px;
}

.mat-mdc-card-lg-image {
  width: 152px;
  height: 152px;
}

.mat-mdc-card-xl-image {
  width: 240px;
  height: 240px;
}

.mat-mdc-card-subtitle ~ .mat-mdc-card-title,
.mat-mdc-card-title ~ .mat-mdc-card-subtitle,
.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-title,
.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-subtitle,
.mat-mdc-card-title-group .mat-mdc-card-title,
.mat-mdc-card-title-group .mat-mdc-card-subtitle {
  padding-top: 0;
}

.mat-mdc-card-content > :last-child:not(.mat-mdc-card-footer) {
  margin-bottom: 0;
}

.mat-mdc-card-actions-align-end {
  justify-content: flex-end;
}
`],encapsulation:2})}return t})();var uc=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[q]})}return t})();var Na=["determinateSpinner"];function Ba(t,i){if(t&1&&(Eu(),si(0,"svg",11),up(1,"circle",12),Cc()),t&2){let e=CI();cp("viewBox",e._viewBox()),rv(),Cp("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),cp("r",e._circleRadius());}}var La=new x("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:Li})}),Li=100,Wa=10,Wi=(()=>{class t{_elementRef=T(mr$1);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=T(La),n=Sd(),o=this._elementRef.nativeElement;this._noopAnimations=n==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=o.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&n==="reduced-motion"&&o.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=Li;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-Wa)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(n,o){if(n&1&&Ep(Na,5),n&2){let a;SI(a=xI())&&(o._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(n,o){n&2&&(cp("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",o.mode==="determinate"?o.value:null)("mode",o.mode),UI("mat-"+o.color),Cp("width",o.diameter,"px")("height",o.diameter,"px")("--mat-progress-spinner-size",o.diameter+"px")("--mat-progress-spinner-active-indicator-width",o.diameter+"px"),bp("_mat-animation-noopable",o._noopAnimations)("mdc-circular-progress--indeterminate",o.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",OF],diameter:[2,"diameter","diameter",OF],strokeWidth:[2,"strokeWidth","strokeWidth",OF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(n,o){if(n&1&&(rp(0,Ba,2,8,"ng-template",null,0,mD),si(2,"div",2,1),Eu(),si(4,"svg",3),up(5,"circle",4),Cc()(),Iu(),si(6,"div",5)(7,"div",6)(8,"div",7),pp(9,8),Cc(),si(10,"div",9),pp(11,8),Cc(),si(12,"div",10),pp(13,8),Cc()()()),n&2){let a=RI(1);rv(4),cp("viewBox",o._viewBox()),rv(),Cp("stroke-dasharray",o._strokeCircumference(),"px")("stroke-dashoffset",o._strokeDashOffset(),"px")("stroke-width",o._circleStrokeWidth(),"%"),cp("r",o._circleRadius()),rv(4),lp("ngTemplateOutlet",a),rv(2),lp("ngTemplateOutlet",a),rv(2),lp("ngTemplateOutlet",a);}},dependencies:[cc],styles:[`.mat-mdc-progress-spinner {
  --mat-progress-spinner-animation-multiplier: 1;
  display: block;
  overflow: hidden;
  line-height: 0;
  position: relative;
  direction: ltr;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-progress-spinner circle {
  stroke-width: var(--mat-progress-spinner-active-indicator-width, 4px);
}
.mat-mdc-progress-spinner._mat-animation-noopable, .mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle {
  transition: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container {
  animation: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle {
  stroke-dasharray: 0 !important;
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle {
    stroke: currentColor;
    stroke: CanvasText;
  }
}

.mat-progress-spinner-reduced-motion {
  --mat-progress-spinner-animation-multiplier: 1.25;
}

.mdc-circular-progress__determinate-container,
.mdc-circular-progress__indeterminate-circle-graphic,
.mdc-circular-progress__indeterminate-container,
.mdc-circular-progress__spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.mdc-circular-progress__determinate-container {
  transform: rotate(-90deg);
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container {
  opacity: 0;
}

.mdc-circular-progress__indeterminate-container {
  font-size: 0;
  letter-spacing: 0;
  white-space: nowrap;
  opacity: 0;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container {
  opacity: 1;
  animation: mdc-circular-progress-container-rotate calc(1568.2352941176ms * var(--mat-progress-spinner-animation-multiplier)) linear infinite;
}

.mdc-circular-progress__determinate-circle-graphic,
.mdc-circular-progress__indeterminate-circle-graphic {
  fill: transparent;
}

.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
  stroke: var(--mat-progress-spinner-active-indicator-color, var(--mat-sys-primary));
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
    stroke: CanvasText;
  }
}

.mdc-circular-progress__determinate-circle {
  transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
}

.mdc-circular-progress__gap-patch {
  position: absolute;
  top: 0;
  left: 47.5%;
  box-sizing: border-box;
  width: 5%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic {
  left: -900%;
  width: 2000%;
  transform: rotate(180deg);
}
.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic {
  width: 200%;
}
.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  left: -100%;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-left-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-right-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

.mdc-circular-progress__circle-clipper {
  display: inline-flex;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer {
  animation: mdc-circular-progress-spinner-layer-rotate calc(5332ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes mdc-circular-progress-container-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes mdc-circular-progress-left-spin {
  from {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
  to {
    transform: rotate(265deg);
  }
}
@keyframes mdc-circular-progress-right-spin {
  from {
    transform: rotate(-265deg);
  }
  50% {
    transform: rotate(-130deg);
  }
  to {
    transform: rotate(-265deg);
  }
}
`],encapsulation:2})}return t})();var $i=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[q]})}return t})();function za(t,i){if(t&1&&(si(0,"span",2),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.message());}}var zi=class t{message=MF("");static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-loading-spinner"]],inputs:{message:[1,"message"]},decls:3,vars:2,consts:[[1,"flex","flex-col","items-center","gap-3","p-12","text-[var(--muted)]"],[3,"diameter"],[1,"text-sm"]],template:function(e,n){e&1&&(si(0,"div",0),up(1,"mat-spinner",1),iI(2,za,2,1,"span",2),Cc()),e&2&&(rv(),lp("diameter",36),rv(),sI(n.message()?2:-1));},dependencies:[$i,Wi],encapsulation:2})};var Ue=class t{transform(i){if(i==null)return "-";let e=Math.floor(i/60),n=Math.floor(i%60);return `${e}:${String(n).padStart(2,"0")}`}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatDuration",type:t,pure:true})};var Gi=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl$1({imports:[wd,ru,q,wa$1]})}return t})();function Ga(t,i){t&1&&up(0,"img",1),t&2&&lp("ngSrc",i)("width",18)("height",18);}var be=class t{id=MF.required();kind=MF("spell");name=MF.required();icon=MF.required();iconUrl=ED(()=>{let i=this.icon().replace(/\.(jpg|jpeg|png|gif|webp)$/i,"");return i?`https://wow.zamimg.com/images/wow/icons/small/${i}.jpg`:null});wowheadUrl=ED(()=>`https://www.wowhead.com/${this.kind()}=${this.id()}`);static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-game-icon"]],hostAttrs:[1,"inline-flex","items-center"],inputs:{id:[1,"id"],kind:[1,"kind"],name:[1,"name"],icon:[1,"icon"]},decls:4,vars:3,consts:[["target","_blank","rel","noopener",1,"inline-flex","items-center","gap-1.5","no-underline","hover:brightness-125",3,"href"],["alt","",1,"rounded-sm",3,"ngSrc","width","height"]],template:function(e,n){if(e&1&&(si(0,"a",0),iI(1,Ga,1,3,"img",1),si(2,"span"),eD(3),Cc()()),e&2){let o;lp("href",n.wowheadUrl(),ef),rv(),sI((o=n.iconUrl())?1:-1,o),rv(2),Ap(n.name());}},dependencies:[Qh$1,Gi],encapsulation:2})};var Qe=class t{transform(i){return i?i>=1e6||Math.round(i/1e3)>=1e3?`${(i/1e6).toFixed(1)}M`:i>=1e3?`${Math.round(i/1e3)}K`:String(Math.round(i)):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatDamage",type:t,pure:true})};function Va(t,i){if(t&1&&up(0,"wl-game-icon",3),t&2){let e=CI();lp("id",i)("icon",e.row().icon)("name",e.row().label);}}function ja(t,i){if(t&1&&(si(0,"span",4),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.row().label);}}function Ha(t,i){t&1&&eD(0," missed ");}function qa(t,i){if(t&1&&(eD(0),fD(1,"formatDamage")),t&2){let e=CI(2);Rp(" ",e.gapSign(),"",hD(1,2,e.gapMagnitude())," ");}}function Ua(t,i){if(t&1&&(si(0,"span",9),iI(1,Ha,1,0)(2,qa,2,4),Cc()),t&2){let e=CI();bp("badge-success",e.gapStatus()==="success")("badge-warning",e.gapStatus()==="warning")("badge-critical",e.gapStatus()==="critical")("badge-muted",e.gapStatus()==="muted"),rv(),sI(e.row().playerPct==null?1:2);}}function Qa(t,i){t&1&&(si(0,"span",10),eD(1,"passive"),Cc());}function Ka(t,i){if(t&1&&(si(0,"span",11),eD(1,"Casts"),Cc(),si(2,"span",12),eD(3),si(4,"span",13),eD(5),Cc()()),t&2){let e=CI(2);rv(2),bp("badge-success",e.castsStatus()==="success")("badge-warning",e.castsStatus()==="warning")("badge-critical",e.castsStatus()==="critical")("badge-muted",e.castsStatus()==="muted"),rv(),Sc(" ",e.row().playerCasts??0),rv(2),Sc(" / ",e.row().topCasts??"-");}}function Ya(t,i){if(t&1&&iI(0,Qa,2,0,"span",10)(1,Ka,6,10),t&2){let e=CI();sI(e.isPassive()?0:1);}}var Mt=class t{row=MF.required();higherIsBetter=MF(true);showCasts=MF(true);hidePlayer=MF(false);gap=ED(()=>{let{playerPct:i,topAvg:e}=this.row();return i==null||e==null?null:i-e});gapSign=ED(()=>(this.gap()??0)>=0?"+":"-");gapMagnitude=ED(()=>Math.abs(this.gap()??0));gapStatus=ED(()=>{let{playerPct:i,topAvg:e}=this.row();if(i==null)return "critical";let n=this.gap();return n==null||e==null||e===0?"muted":(this.higherIsBetter()?n:-n)>=0?"success":Math.abs(n)<=e*.1?"warning":"critical"});isPassive=ED(()=>this.row().passive===true);castsStatus=ED(()=>{let{playerCasts:i,topCasts:e}=this.row();if(e==null)return "muted";let n=i??0;return n>=e?"success":e-n<=1?"warning":"critical"});static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-compact-ability-row"]],inputs:{row:[1,"row"],higherIsBetter:[1,"higherIsBetter"],showCasts:[1,"showCasts"],hidePlayer:[1,"hidePlayer"]},decls:13,vars:6,consts:[[1,"md:flex","md:items-center","md:gap-3","px-4","py-1.5","min-w-0","border-t","md:border-t-0","border-[var(--border)]"],[1,"flex","items-baseline","gap-2","min-w-0","md:contents"],[1,"flex-1","min-w-0","overflow-hidden","md:order-1"],[3,"id","icon","name"],[1,"truncate","text-sm"],[1,"shrink-0","md:order-4","md:w-[9rem]","text-right","tabular-nums","text-xs","font-semibold",3,"badge-success","badge-warning","badge-critical","badge-muted"],[1,"flex","items-baseline","flex-wrap","gap-x-1.5","gap-y-1","mt-1.5","md:mt-0","md:contents"],[1,"shrink-0","mr-2","md:mr-0","md:order-3","md:w-[9rem]","md:text-right","tabular-nums","text-xs","text-[var(--muted)]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider"],[1,"shrink-0","md:order-4","md:w-[9rem]","text-right","tabular-nums","text-xs","font-semibold"],[1,"shrink-0","md:order-2","w-auto","md:w-[7.5rem]","text-center","text-xs","rounded","px-2","py-0.5","border","border-current","badge-muted"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"shrink-0","md:order-2","w-auto","md:w-[7.5rem]","text-center","tabular-nums","text-xs","rounded","px-2","py-0.5","border","border-current"],[1,"text-[var(--muted)]"]],template:function(e,n){if(e&1&&(si(0,"div",0)(1,"div",1)(2,"div",2),iI(3,Va,1,3,"wl-game-icon",3)(4,ja,2,1,"span",4),Cc(),iI(5,Ua,3,9,"span",5),Cc(),si(6,"div",6)(7,"span",7)(8,"span",8),eD(9,"Top avg "),Cc(),eD(10),fD(11,"formatDamage"),Cc(),iI(12,Ya,2,1),Cc()()),e&2){let o;rv(3),sI((o=n.row().spellId)?3:4,o),rv(2),sI(n.hidePlayer()?-1:5),rv(5),Sc("",hD(11,4,n.row().topAvg)," "),rv(2),sI(n.showCasts()&&!n.hidePlayer()?12:-1);}},dependencies:[be,Qe],encapsulation:2})};var Xa=(t,i)=>i.id,Za=(t,i)=>i.spellId;function Ja(t,i){if(t&1&&(si(0,"div",10),eD(1),Cc()),t&2){let e=CI(2);rv(),Ap(e.subtitle());}}function er(t,i){if(t&1&&(si(0,"div",1)(1,"div",9),eD(2),Cc(),iI(3,Ja,2,1,"div",10),Cc()),t&2){let e=CI();rv(2),Ap(e.title()),rv(),sI(e.subtitle()?3:-1);}}function tr(t,i){if(t&1){let e=mI();si(0,"div",11)(1,"button",12),fD(2,"formatDuration"),mp("click",function(){let o=su(e).$index,a=CI();return au(a.select(o))}),si(3,"mat-icon",13),eD(4),Cc()()();}if(t&2){let e=i.$implicit,n=i.$index,o=CI();Cp("left",o.segmentLeftPcts()[n],"%")("z-index",o.activeIndex()===n?2:1),rv(),bp("seg-good",e.status==="good")("seg-warn",e.status==="warn")("seg-bad",e.status==="bad")("seg-scheduled",e.status==="muted"&&e.statusIcon==="schedule")("seg-missing",e.status==="muted"&&e.statusIcon!=="schedule")("seg-info",e.status==="info")("seg-active",o.activeIndex()===n),cp("aria-selected",o.activeIndex()===n)("aria-label",hD(2,21,e.timeStartS)),rv(3),Ap(e.statusIcon);}}function nr(t,i){if(t&1&&(si(0,"span"),eD(1),fD(2,"formatDuration"),Cc()),t&2){let e=i.$implicit;rv(),Ap(hD(2,1,e));}}function ir(t,i){if(t&1&&(si(0,"div",8),lI(1,nr,3,3,"span",null,aI),Cc()),t&2){let e=CI();rv(),uI(e.timeTicks());}}function or(t,i){if(t&1&&up(0,"wl-game-icon",17),t&2){let e=i.$implicit;lp("id",e.id)("icon",e.icon)("name",e.name);}}function ar(t,i){if(t&1&&(si(0,"span",18),eD(1),Cc()),t&2){let e=i.$implicit;rv(),Ap(e);}}function rr(t,i){if(t&1){let e=mI();si(0,"button",26),mp("click",function(){su(e);let o=CI(2);return au(o.openMap.emit(o.activeIndex()))}),si(1,"mat-icon"),eD(2,"my_location"),Cc()();}}function lr(t,i){if(t&1&&(si(0,"span"),eD(1),Cc()),t&2){let e=CI(3);bp("badge-muted",e.overviewDeltaStatus()==="muted")("badge-success",e.overviewDeltaStatus()==="better")("badge-critical",e.overviewDeltaStatus()==="worse"),rv(),Ap(e.overviewDeltaText());}}function sr(t,i){if(t&1&&(si(0,"span",21)(1,"span",27),eD(2),fD(3,"formatDamage"),Cc(),iI(4,lr,2,7,"span",28),Cc()),t&2){let e=CI(),n=CI();rv(2),Ap(hD(3,2,e.overview.playerPct)),rv(2),sI(n.overviewDeltaText()?4:-1);}}function dr(t,i){if(t&1&&(si(0,"span",22),eD(1),fD(2,"formatDamage"),Cc()),t&2){let e=CI();rv(),Ap(hD(2,1,e.overview.topAvg));}}function cr(t,i){t&1&&(si(0,"span",23),eD(1,"not reached"),Cc());}function mr(t,i){if(t&1&&up(0,"div",33),t&2){let e=CI(2),n=CI();Cp("width",n.overviewPlayerWidthPct(),"%"),bp("fill-success",e.status==="good")("fill-warning",e.status==="warn")("fill-critical",e.status==="bad")("fill-muted",e.status==="muted")("fill-info",e.status==="info");}}function pr(t,i){if(t&1&&up(0,"div",34),t&2){let e=CI(3);Cp("left",e.overviewRangeLeftPct(),"%")("width",e.overviewRangeWidthPct(),"%");}}function ur(t,i){if(t&1&&up(0,"div",35),t&2){let e=CI(3);Cp("left",e.overviewAvgLeftPct(),"%");}}function fr(t,i){if(t&1&&(si(0,"div",24)(1,"div",29),iI(2,mr,1,12,"div",30),iI(3,pr,1,4,"div",31),iI(4,ur,1,2,"div",32),Cc()()),t&2){let e=CI(2);rv(2),sI(e.overviewPlayerWidthPct()!==null?2:-1),rv(),sI(e.overviewRangeLeftPct()!==null?3:-1),rv(),sI(e.overviewAvgLeftPct()!==null?4:-1);}}function hr(t,i){t&1&&(si(0,"span",38),eD(1,"casts"),Cc());}function gr(t,i){t&1&&(si(0,"span",39),eD(1,"gap"),Cc());}function _r(t,i){if(t&1&&up(0,"wl-compact-ability-row",40),t&2){let e=i.$implicit,n=CI(3);lp("row",e)("higherIsBetter",n.higherIsBetter())("showCasts",n.showCasts())("hidePlayer",n.activeIsMuted());}}function br(t,i){if(t&1&&(si(0,"div",25)(1,"div",36)(2,"span",37),eD(3,"ability"),Cc(),iI(4,hr,2,0,"span",38),si(5,"span",39),eD(6,"top avg"),Cc(),iI(7,gr,2,0,"span",39),Cc(),lI(8,_r,1,4,"wl-compact-ability-row",40,Za),Cc()),t&2){let e=CI(2);rv(4),sI(e.showCasts()&&!e.activeIsMuted()?4:-1),rv(3),sI(e.activeIsMuted()?-1:7),rv(),uI(e.activeDetailRows());}}function vr(t,i){if(t&1&&(si(0,"div",14),up(1,"span",15),si(2,"span",16),eD(3),fD(4,"formatDuration"),fD(5,"formatDuration"),Cc(),lI(6,or,1,3,"wl-game-icon",17,Xa),lI(8,ar,2,1,"span",18,cI),si(10,"div",19),iI(11,rr,3,0,"button",20),iI(12,sr,5,4,"span",21)(13,dr,3,3,"span",22)(14,cr,2,0,"span",23),Cc()(),iI(15,fr,5,3,"div",24),iI(16,br,10,2,"div",25)),t&2){let e=i,n=CI();rv(),bp("fill-success",e.status==="good")("fill-warning",e.status==="warn")("fill-critical",e.status==="bad")("fill-muted",e.status==="muted")("fill-info",e.status==="info"),rv(2),kp(" Window ",n.activeIndex()+1," - ",hD(4,17,e.timeStartS)," to ",hD(5,19,e.timeEndS)," "),rv(3),uI(e.spells),rv(2),uI(e.labels),rv(3),sI(n.showMap()?11:-1),rv(),sI(n.activeIsMuted()?n.activeIsBenchOnly()?13:n.activeIsNotReached()?14:-1:12),rv(3),sI(n.activeIsBenchOnly()?-1:15),rv(),sI(e.detailRows.length?16:-1);}}var kt=class t{windows=MF.required();higherIsBetter=MF(true);fightDuration=MF(0);showMap=MF(false);showCasts=MF(true);title=MF("");subtitle=MF("");openMap=_F();static MIN_GAP_PCT=5;static EDGE_INSET_PCT=4;selectedIndex=ED(()=>{let i=this.windows(),e=this.higherIsBetter(),n=0,o=e?1/0:-1/0;return i.forEach((a,r)=>{if(a.status==="muted")return;let l=a.overview.playerPct,s=a.overview.topAvg;if(l==null||!s||s<=0)return;let f=l/s;(e?f<o:f>o)&&(o=f,n=r);}),n});_manualIndex=xo$1(null);activeIndex=ED(()=>this._manualIndex()??this.selectedIndex());activeWindow=ED(()=>this.windows()[this.activeIndex()]??null);timelineEnd=ED(()=>{let i=this.windows();return i.length?Math.max(...i.map(e=>e.timeEndS),1):Math.max(this.fightDuration(),1)});timeTicks=ED(()=>{let i=this.timelineEnd(),e=5;return Array.from({length:e+1},(n,o)=>i/e*o)});select(i){this._manualIndex.set(i);}onKeydown(i){let e=i.key==="ArrowRight"?1:i.key==="ArrowLeft"?-1:0;if(!e)return;i.preventDefault();let n=this.activeIndex()+e;n>=0&&n<this.windows().length&&this.select(n);}activeIsMuted=ED(()=>{let i=this.activeWindow()?.status;return i==="muted"||i==="info"});activeIsNotReached=ED(()=>this.activeWindow()?.status==="muted");activeIsBenchOnly=ED(()=>this.activeWindow()?.status==="info");activeDetailRows=ED(()=>{let i=this.activeWindow()?.detailRows??[],e=this.higherIsBetter(),n=o=>{let a=(o.playerPct??0)-(o.topAvg??0);return e?a:-a};return [...i].sort((o,a)=>n(o)-n(a))});leftPct(i){let e=this.timelineEnd();return Math.min(100,Math.max(0,i/e*100))}segmentLeftPcts=ED(()=>{let i=this.windows(),e=t.EDGE_INSET_PCT,n=e,o=100-e,a=i.map(l=>Math.min(o,Math.max(n,this.leftPct(l.timeStartS))));if(a.length<2)return a;let r=Math.min(t.MIN_GAP_PCT,(o-n)/(a.length-1));for(let l=1;l<a.length;l++)a[l]=Math.max(a[l],a[l-1]+r);a[a.length-1]=Math.min(a[a.length-1],o);for(let l=a.length-2;l>=0;l--)a[l]=Math.min(a[l],a[l+1]-r);return a});overviewMax=ED(()=>{let i=this.windows().flatMap(e=>[e.overview.topAvg,e.overview.topMax,e.overview.playerPct].filter(n=>n!=null));return Math.max(...i,.01)});barPct(i,e){return Math.min(100,Math.max(0,i/e*100))}overviewDelta=ED(()=>{let i=this.activeWindow();if(!i)return null;let{playerPct:e,topAvg:n}=i.overview;return e==null||n==null||n===0?null:(e-n)/n*100});overviewDeltaText=ED(()=>{let i=this.overviewDelta();return i==null?"":`${i>0?"+":""}${i.toFixed(0)}%`});overviewDeltaStatus=ED(()=>{let i=this.overviewDelta();return i==null?"muted":(this.higherIsBetter()?i>=0:i<=0)?"better":"worse"});overviewPlayerWidthPct=ED(()=>{let i=this.activeWindow();return !i||i.overview.playerPct==null?null:this.barPct(i.overview.playerPct,this.overviewMax())});overviewRangeLeftPct=ED(()=>{let i=this.activeWindow();return !i||i.overview.topMin==null||i.overview.topMax==null?null:this.barPct(i.overview.topMin,this.overviewMax())});overviewRangeWidthPct=ED(()=>{let i=this.activeWindow();if(!i||i.overview.topMin==null||i.overview.topMax==null)return null;let e=this.overviewMax();return Math.max(0,this.barPct(i.overview.topMax,e)-this.barPct(i.overview.topMin,e))});overviewAvgLeftPct=ED(()=>{let i=this.activeWindow();return !i||i.overview.topAvg==null?null:this.barPct(i.overview.topAvg,this.overviewMax())});static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-window-comparison"]],hostAttrs:[1,"block"],inputs:{windows:[1,"windows"],higherIsBetter:[1,"higherIsBetter"],fightDuration:[1,"fightDuration"],showMap:[1,"showMap"],showCasts:[1,"showCasts"],title:[1,"title"],subtitle:[1,"subtitle"]},outputs:{openMap:"openMap"},decls:11,vars:7,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"px-4"],[1,"overflow-x-auto","md:overflow-visible","pt-2","md:pt-0"],[1,"min-w-[540px]","md:min-w-0"],["role","listbox","tabindex","0","aria-label","Burst windows",1,"relative","mx-2","h-[42px]","md:h-9",3,"keydown"],["aria-hidden","true",1,"absolute","left-0","right-0","top-0","h-[42px]","md:h-9","rounded-lg","bg-[var(--bg)]","border","border-[var(--border)]"],[1,"absolute","top-0","flex","flex-col","items-center","-translate-x-1/2",3,"left","z-index"],[1,"flex","justify-between","tabular-nums","text-[10px]","text-[var(--muted)]","mt-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"absolute","top-0","flex","flex-col","items-center","-translate-x-1/2"],["type","button","role","option",1,"flex","items-center","justify-center","w-[42px]","h-[42px]","md:w-9","md:h-9","rounded",3,"click"],[1,"text-[22px]","md:text-[18px]","h-[22px]","w-[22px]","md:h-[18px]","md:w-[18px]","leading-none"],[1,"flex","flex-wrap","items-center","gap-2","px-4","py-2.5","bg-[var(--surface)]","border-t","border-[var(--border)]"],[1,"w-2.5","h-2.5","rounded-full","shrink-0"],[1,"text-sm","font-medium","whitespace-nowrap"],[3,"id","icon","name"],[1,"text-sm","text-[var(--muted)]"],[1,"basis-full","md:basis-auto","md:ml-auto","flex","items-center","gap-2"],["mat-icon-button","","aria-label","Open positioning map"],[1,"tabular-nums","text-xs","flex","items-baseline","gap-2"],[1,"tabular-nums","text-xs","text-[var(--muted)]"],[1,"text-xs","text-[var(--muted)]","italic"],[1,"px-4","py-2","border-t","border-[var(--border)]"],[1,"md:border-t","border-[var(--border)]","pt-2","pb-2"],["mat-icon-button","","aria-label","Open positioning map",3,"click"],[1,"text-[var(--muted)]"],[3,"badge-muted","badge-success","badge-critical"],["aria-hidden","true",1,"relative","h-5","rounded","bg-[var(--bg)]"],[1,"absolute","inset-y-0","left-0","rounded","opacity-[0.65]",3,"fill-success","fill-warning","fill-critical","fill-muted","fill-info","width"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]",3,"left","width"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]",3,"left"],[1,"absolute","inset-y-0","left-0","rounded","opacity-[0.65]"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]"],[1,"hidden","md:flex","items-center","gap-3","px-4","pb-1"],[1,"flex-1","text-[10px]","text-[var(--muted)]"],[1,"w-[7.5rem]","text-center","text-[10px]","text-[var(--muted)]"],[1,"w-[9rem]","text-right","text-[10px]","text-[var(--muted)]"],[3,"row","higherIsBetter","showCasts","hidePlayer"]],template:function(e,n){if(e&1&&(si(0,"div",0),iI(1,er,4,2,"div",1),si(2,"div",2)(3,"div",3)(4,"div",4)(5,"div",5),mp("keydown",function(a){return n.onKeydown(a)}),up(6,"div",6),lI(7,tr,5,23,"div",7,aI),Cc(),iI(9,ir,3,0,"div",8),Cc()()(),iI(10,vr,17,21),Cc()),e&2){let o;rv(),sI(n.title()?1:-1),rv(),bp("pt-3",!n.title())("pb-3",!n.activeWindow()),rv(5),uI(n.windows()),rv(2),sI(n.timeTicks().length?9:-1),rv(),sI((o=n.activeWindow())?10:-1,o);}},dependencies:[vv,_v,v_,Pd,be,Mt,Ue,Qe],encapsulation:2})};function xr(t,i,e,n,o,a=false){return a?{status:"info",icon:"insights"}:o?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:t<e-n?{status:"bad",icon:"error"}:i>0&&t<i-n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}}function yr(t,i){let e=[],n=[];for(let o of t){let a=i[o];a?e.push(a):n.push(o);}return {spellIds:e,labels:n}}function wr(t,i,e){let n={};for(let o of i?.ability_breakdown??[])n[o.spell_id]=o;return t.map(o=>({spellId:o.spell_id,label:e[o.spell_id].name,icon:e[o.spell_id].icon,playerPct:n[o.spell_id]?.damage??null,topAvg:o.avg_damage,topMin:o.min_damage,topMax:o.max_damage,playerCasts:n[o.spell_id]?.casts??null,topCasts:o.avg_casts??null,passive:o.is_passive??false}))}function Cr(t,i,e){let n=t.common_cds,o=n.map(a=>i[a]).filter(a=>!!a);return {timeS:t.time_s,label:n.join(", ")||"Burst window",spells:QD(o,e)}}function Et(t,i,e,n,o,a=false){let r=[],l=[];return t.forEach((s,f)=>{let p=s.time_s>e,h=p?null:i[f]??null,g=h?.window_damage??null,{status:y,icon:C}=xr(g,s.dmg_avg,s.dmg_min,s.dmg_stddev,p,a),{spellIds:A,labels:P}=yr(s.common_cds,n);r.push({timeStartS:s.time_s,timeEndS:s.time_s+s.window_length_s,spells:QD(A,o),labels:P,status:y,statusIcon:C,overview:{label:"",icon:"",playerPct:g,topAvg:s.dmg_avg,topMin:s.dmg_min,topMax:s.dmg_max},detailRows:wr(s.ability_breakdown,h,o)}),l.push(Cr(s,n,o));}),{windows:r,anchors:l}}function on(t){return (t.amount||0)+(t.absorbed||0)}function Sr(t,i,e,n,o){let a=h=>h>=t.time_s&&h<t.time_s+t.window_length_s,r=i.filter(h=>a((h.timestamp-n)/1e3)),l=r.reduce((h,g)=>h+on(g),0),s={};for(let h of r)h.abilityGameID&&(s[h.abilityGameID]=(s[h.abilityGameID]||0)+on(h));let f=new Map;for(let h of e)if(a((h.timestamp-n)/1e3)){let g=o(h.abilityGameID);f.set(g,(f.get(g)??0)+1);}let p=Object.entries(s).sort((h,g)=>g[1]-h[1]).slice(0,10).map(([h,g])=>{let y=parseInt(h,10);return {spell_id:y,damage:Math.round(g),casts:f.get(o(y))??0}});return {time_s:t.time_s,window_damage:Math.round(l),ability_breakdown:p}}function Mr(t,i,e,n,o){let a=s=>o.get(s)??`Spell ${s}`,r=i.filter(s=>s.timestamp>=n&&on(s)>0).sort((s,f)=>s.timestamp-f.timestamp),l=e.filter(s=>s.type==="cast"&&s.abilityGameID);return t.map(s=>Sr(s,r,l,n,a))}var Dt=class t{source=T(Ky);wclApi=T(pa$1);async loadPlayerView(i,e,n,o,a){let r=await this.source.getBench(i,e);if(!r)return {windows:[],anchors:[]};try{let l=await this.wclApi.getReport(n),s=l.fights.find(C=>C.id===o);if(!s)return Et(r.windows,[],Number.POSITIVE_INFINITY,r.cd_spell_ids,r.ability_icons,!0);let f=new Map;for(let C of l.masterData?.abilities??[])f.set(C.gameID,C.name);let[p,h]=await Promise.all([this.wclApi.getAllEvents(n,o,"Casts",s.startTime,s.endTime,a),this.wclApi.getAllEvents(n,o,"DamageDone",s.startTime,s.endTime,a)]),g=Mr(r.windows,h,p,s.startTime,f),y=(s.endTime-s.startTime)/1e3;return Et(r.windows,g,y,r.cd_spell_ids,r.ability_icons)}catch(l){return J_(`BurstFeatureService.loadPlayerView ${n}:${o}`,l),Et(r.windows,[],Number.POSITIVE_INFINITY,r.cd_spell_ids,r.ability_icons,true)}}async loadBenchView(i,e){let n=await this.source.getBench(i,e);return n?Et(n.windows,[],Number.POSITIVE_INFINITY,n.cd_spell_ids,n.ability_icons,true):{windows:[],anchors:[]}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var ji=class t{burst=T(Dt);spec=MF.required();encounterId=MF.required();report=MF("");fight=MF(0);player=MF(0);showMap=MF(false);openMap=_F();busyChange=_F();_windows=xo$1([]);_anchors=xo$1([]);windows=this._windows.asReadonly();loadToken=0;constructor(){xu(()=>{let i=this.spec(),e=this.encounterId(),n=this.report(),o=this.fight(),a=this.player(),r=++this.loadToken;(n&&o&&a?this.burst.loadPlayerView(i,e,n,o,a):this.burst.loadBenchView(i,e)).then(s=>{r===this.loadToken&&(this._windows.set(s.windows),this._anchors.set(s.anchors));}).catch(s=>J_("burst.loadPlayerView",s)).finally(()=>{r===this.loadToken&&this.busyChange.emit(false);});});}onOpenMap(i){let e=this._anchors()[i];e&&this.openMap.emit(e);}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-burst-windows"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"]},outputs:{openMap:"openMap",busyChange:"busyChange"},decls:1,vars:3,consts:[["title","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"openMap","windows","higherIsBetter","showMap"]],template:function(e,n){e&1&&(si(0,"wl-window-comparison",0),mp("openMap",function(a){return n.onOpenMap(a)}),Cc()),e&2&&lp("windows",n.windows())("higherIsBetter",true)("showMap",n.showMap());},dependencies:[kt],encapsulation:2})};var kr=["content"],Tr=["*"];function Er(t,i){if(t&1){let e=mI();si(0,"button",3),mp("click",function(){su(e);let o=CI();return au(o.toggle())}),eD(1),si(2,"mat-icon",4),eD(3),Cc()();}if(t&2){let e=CI();cp("aria-expanded",e.expanded()),rv(),Sc(" ",e.expanded()?"Show less":"Show more"," "),rv(2),Ap(e.expanded()?"expand_less":"expand_more");}}var It=class t{destroyRef=T(Pe);content=NF.required("content");expanded=xo$1(false);overflowing=xo$1(false);constructor(){ky(()=>{let i=this.content().nativeElement,e=()=>{this.expanded()||this.overflowing.set(i.scrollHeight-i.clientHeight>1);};if(e(),typeof ResizeObserver<"u"){let n=new ResizeObserver(e);n.observe(i),this.destroyRef.onDestroy(()=>n.disconnect());}});}toggle(){this.expanded.update(i=>!i);}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-collapsible-text"]],viewQuery:function(e,n){e&1&&Dp(n.content,kr,5),e&2&&AI();},hostAttrs:[1,"block"],ngContentSelectors:Tr,decls:4,vars:3,consts:[["content",""],[1,"md:line-clamp-none"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]",3,"click"],[1,"!text-[16px]","!w-[16px]","!h-[16px]","!leading-[16px]"]],template:function(e,n){e&1&&(_I(),si(0,"div",1,0),MI(2),Cc(),iI(3,Er,4,3,"button",2)),e&2&&(bp("line-clamp-2",!n.expanded()),rv(3),sI(n.overflowing()?3:-1));},dependencies:[vv,_v],encapsulation:2})};var Dr={0:"Head",1:"Neck",2:"Shoulder",3:"Back",4:"Chest",5:"Waist",6:"Legs",7:"Feet",8:"Wrists",9:"Hands",10:"Ring 1",11:"Ring 2",12:"Trinket 1",13:"Trinket 2",14:"Back",15:"Main Hand",16:"Off Hand"},Ir={ok:"check_circle",warn:"warning",info:"info",unknown:"help_outline"};function Ke(t){return Dr[t]||`Slot ${t}`}function Hi(t){return Ir[t]}function qi(t,i){let e=i?.enchants??{},n=t?.enchants??[];if(!Object.keys(e).length&&!n.length)return [];let o=new Set;for(let r of Object.keys(e))o.add(Number(r));for(let r of n)o.add(r.slot);let a=[];for(let r of [...o].sort((l,s)=>l-s)){let l=Ke(r),s=e[r]?.[0],f=s?s.name||`Enchant #${s.id}`:"",p=n.find(y=>y.slot===r);if(!p){s&&s.pct>=70?a.push({slotName:l,status:"warn",name:"Not enchanted",topPct:s.pct,note:`Apply ${f}`}):s&&s.pct>=40&&a.push({slotName:l,status:"info",name:"Not enchanted",topPct:s.pct,note:`${s.pct}% run ${f}`});continue}let h=p.name||`Enchant #${p.id}`,g=e[r]?.find(y=>y.id===p.id)?.pct??null;s&&p.id===s.id?a.push({slotName:l,status:"ok",name:h,topPct:s.pct,note:`${s.pct}% run this`}):s?a.push({slotName:l,status:"info",name:h,topPct:g,note:`${s.pct}% run ${f}`}):a.push({slotName:l,status:"ok",name:h,topPct:null,note:null});}return a}function Ui(t){return t.some(i=>i.status==="warn")?"warn":"ok"}function Qi(t,i){let e=t?.talent_builds??[];return e.length?e.map((n,o)=>({pct:n.pct,isPlayer:!!i&&n.key===i,link:`https://www.warcraftlogs.com/reports/${n.report_code}?fight=${n.fight_id}&type=summary&source=${n.source_id}`,playerName:n.player_name,label:o===0?"Most common build":`Alt build ${o}`})):[]}function Ki(t,i){let e=t?.talent_builds??[];if(!e.length)return {status:"unknown",note:"No talent data."};let n=e[0]?.pct??0;return !i||i.split(":")[0]!==(e[0]?.key??"").split(":")[0]?{status:"ok",note:`${n}% run this build`}:e.some(o=>o.key===i)?{status:"ok",note:"Standard build."}:{status:"warn",note:`Off-meta build. ${n}% run the standard one.`}}function Rr(t,i,e){let n=new Set([12,13].map(a=>t.find(r=>r.slot===a)?.id).filter(a=>a!==void 0)),o=new Set([i,e].filter(a=>a!==void 0));if(n.size!==2||o.size!==2)return  false;for(let a of n)if(!o.has(a))return  false;return  true}function Pr(t,i){let e=t?.trinkets??{},n=0,o=false;for(let a of [12,13]){let r=(e[a]??[]).find(l=>l.id===i);r&&(n+=r.pct,o=true);}return o?n:null}function Yi(t,i){let e=t?.trinkets??[],n=Zi(i),o=[];if(Rr(e,n[0]?.id,n[1]?.id)){for(let s of [12,13]){let f=Ke(s),p=e.find(g=>g.slot===s),h=n.find(g=>g.id===p.id)?.pct??null;o.push({slotLabel:f,id:p.id,name:p.name,icon:p.icon??"",status:"ok",topPct:h,note:null});}return o}let a=new Set(e.map(s=>s.id)),r=n.filter(s=>!a.has(s.id)),l=0;for(let s of [12,13]){let f=Ke(s),p=e.find(g=>g.slot===s);if(!p){let g=r[l];if(!g)continue;l++,o.push({slotLabel:f,id:g.id,name:g.name,icon:"",status:"info",topPct:g.pct,note:`${g.pct}% run this trinket`});continue}if(a.has(p.id)&&n.some(g=>g.id===p.id)){o.push({slotLabel:f,id:p.id,name:p.name,icon:p.icon??"",status:"ok",topPct:n.find(g=>g.id===p.id).pct,note:null});continue}let h=r[l];h?(l++,o.push({slotLabel:f,id:p.id,name:p.name,icon:p.icon??"",status:"info",topPct:Pr(i,p.id),note:`Switch to ${h.name} (${h.pct}%)`})):o.push({slotLabel:f,id:p.id,name:p.name,icon:p.icon??"",status:"ok",topPct:null,note:null});}return o}function Xi(t){return t.some(i=>i.status==="warn")?"warn":t.some(i=>i.status==="info")?"info":"ok"}function Zi(t){let i=t?.trinkets??{},e=new Map;for(let n of [12,13])for(let o of i[n]??[]){let a=e.get(o.id);a?a.pct+=o.pct:e.set(o.id,{id:o.id,name:o.name,icon:o.icon,pct:o.pct});}return [...e.values()].sort((n,o)=>o.pct-n.pct).slice(0,2)}function Ji(t){let i=t?.enchants??{};return Object.keys(i).map(Number).sort((e,n)=>e-n).reduce((e,n)=>{let o=i[n]?.[0];return o&&o.pct>=40&&e.push({slotName:Ke(n),name:o.name||`Enchant #${o.id}`,pct:o.pct}),e},[])}function eo(t){return Zi(t).map((i,e)=>({slotLabel:e===0?"Trinket 1":"Trinket 2",id:i.id,name:i.name,icon:i.icon,pct:i.pct}))}function Rt(){return {comparison:false,talentBuilds:[],talentStatus:{status:"unknown",note:"No talent data."},trinketRows:[],trinketStatus:"ok",benchTrinketRows:[],enchantRows:[],enchantStatus:"ok",benchEnchantRows:[]}}function Fr(t,i,e,n){if(!t?.gear?.length)return {found:false,message:"No combatant info in this log."};let{trinkets:o,enchants:a}=n0(t.gear),r=t0(t.talentTree);for(let l of o)!l.name&&l.id&&(l.name=e0(i[`i${l.id}`]?.name??""));for(let l of a)!l.name&&l.id&&(l.name=e0(i[`e${l.id}`]?.name??""));return {found:true,spec:n,source_report:e,talent_key:r,trinkets:o,enchants:a}}function to(t){return t?{talent_builds:t.talent_builds,trinkets:t.trinkets,enchants:t.enchants}:null}function no(t,i){let e=!!t,n=t?.talent_key??"",o=qi(t,i),a=Yi(t,i);return {comparison:e,talentBuilds:Qi(i,n),talentStatus:Ki(i,n),trinketRows:a,trinketStatus:Xi(a),benchTrinketRows:eo(i),enchantRows:o,enchantStatus:Ui(o),benchEnchantRows:Ji(i)}}var Pt=class t{source=T(nD);wclApi=T(pa$1);async loadComparisonView(i,e,n,o,a){let r=await this.source.getBench(i,e),l=to(r),s=await this.fetchPlayerGear(n,o,a,i);return !l&&!s?Rt():no(s,l)}async loadBenchView(i,e){let n=await this.source.getBench(i,e),o=to(n);return o?no(null,o):Rt()}async fetchPlayerGear(i,e,n,o){if(!i||!e||!n)return null;try{let a=await this.wclApi.getCombatantInfo(i,e,n);if(!a?.gear?.length)return null;let{trinkets:r,enchants:l}=n0(a.gear),s=[...new Set(r.filter(g=>g.id).map(g=>g.id))],f=[...new Set(l.filter(g=>g.id).map(g=>g.id))],p={};try{p=await this.wclApi.getGameNames(s,f);}catch(g){J_(`GearFeatureService name resolution ${i}:${e}:${n}`,g);}let h=Fr(a,p,i,o);return h.found?h:null}catch(a){return J_(`GearFeatureService player gear ${i}:${e}:${n}`,a),null}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Ar=(t,i)=>i.label,an=(t,i)=>i.slotLabel,oo=(t,i)=>i.slotName;function Or(t,i){t&1&&(si(0,"div",4),eD(1,"Gear vs top parses."),Cc());}function Nr(t,i){t&1&&(si(0,"div",4),eD(1,"Top-parse gear consensus."),Cc());}function Br(t,i){t&1&&(si(0,"div",17),eD(1),Cc()),t&2&&(rv(),Sc("",i.pct,"% run the standard build"));}function Lr(t,i){if(t&1&&(si(0,"span",22),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.playerName);}}function Wr(t,i){if(t&1&&(si(0,"a",21),eD(1,"View parse \u2197"),Cc(),iI(2,Lr,2,1,"span",22)),t&2){let e=i;lp("href",e.link,ef),rv(2),sI(e.playerName?2:-1);}}function $r(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",14),eD(3,"warning_amber"),Cc()(),si(4,"div",15)(5,"span",16),eD(6,"Off-meta build"),Cc(),iI(7,Br,2,1,"div",17),Cc(),up(8,"div",2),si(9,"div",18)(10,"span",19),eD(11,"Fix"),Cc(),si(12,"div",20)(13,"span"),eD(14,"Switch to the standard build."),Cc(),iI(15,Wr,3,2),Cc()()()),t&2){let e,n,o=CI(2);rv(7),sI((e=o.view().talentBuilds[0])?7:-1,e),rv(8),sI((n=o.view().talentBuilds[0])?15:-1,n);}}function zr(t,i){t&1&&(si(0,"div",11)(1,"span",23),eD(2,"On plan"),Cc(),si(3,"span",24)(4,"span",25),eD(5,"Most common build"),Cc()()());}function Gr(t,i){t&1&&(si(0,"div",12),eD(1," No talent data. "),Cc());}function Vr(t,i){if(t&1&&iI(0,$r,16,2,"div",10)(1,zr,6,0,"div",11)(2,Gr,2,0,"div",12),t&2){let e=CI();sI(e.view().talentStatus.status==="warn"?0:e.view().talentStatus.status==="ok"?1:2);}}function jr(t,i){if(t&1&&(si(0,"span",28),eD(1),Cc()),t&2){let e=CI().$implicit;rv(),Ap(e.playerName);}}function Hr(t,i){if(t&1&&(si(0,"div",26),up(1,"div",2),si(2,"div",27),eD(3),iI(4,jr,2,1,"span",28),Cc(),si(5,"div",29)(6,"div",30),eD(7),Cc(),si(8,"div",31),eD(9,"of top parsers"),Cc()(),si(10,"div",32)(11,"a",33),eD(12,"View parse \u2197"),Cc()()()),t&2){let e=i.$implicit;rv(3),Sc(" ",e.label," "),rv(),sI(e.playerName?4:-1),rv(3),Sc("",e.pct,"%"),rv(4),lp("href",e.link,ef);}}function qr(t,i){if(t&1&&lI(0,Hr,13,4,"div",26,Ar),t&2){let e=CI(2);uI(e.view().talentBuilds);}}function Ur(t,i){t&1&&(si(0,"div",12),eD(1," No talent data. "),Cc());}function Qr(t,i){if(t&1&&iI(0,qr,2,0)(1,Ur,2,0,"div",12),t&2){let e=CI();sI(e.view().talentBuilds.length?0:1);}}function Kr(t,i){if(t&1&&(si(0,"span",39),eD(1,"Measured"),Cc(),si(2,"div",30),eD(3),Cc(),si(4,"div",40),eD(5,"of top parsers"),Cc()),t&2){let e=CI(2).$implicit;rv(3),Sc("",e.topPct,"%");}}function Yr(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",35),eD(3),Cc()(),si(4,"div",15),up(5,"wl-game-icon",36),si(6,"div",37),eD(7),Cc()(),si(8,"div",38),iI(9,Kr,6,1),Cc(),si(10,"div",18)(11,"span",19),eD(12,"Fix"),Cc(),si(13,"wl-collapsible-text"),eD(14),Cc()()()),t&2){let e=CI().$implicit;rv(2),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),Sc(" ",e.status==="info"?"info":"warning_amber"," "),rv(2),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),sI(e.topPct!==null?9:-1),rv(5),Ap(e.note);}}function Xr(t,i){if(t&1&&(si(0,"span",39),eD(1,"Measured"),Cc(),si(2,"div",43),eD(3),Cc(),si(4,"div",40),eD(5,"of top parsers"),Cc()),t&2){let e=CI(2).$implicit;rv(3),Sc("",e.topPct,"%");}}function Zr(t,i){if(t&1&&(si(0,"div",34)(1,"div",13),up(2,"span",41),Cc(),si(3,"div",15),up(4,"wl-game-icon",36),si(5,"div",37),eD(6),Cc()(),si(7,"div",42),iI(8,Xr,6,1),Cc(),up(9,"div",2),Cc()),t&2){let e=CI().$implicit;rv(4),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(2),sI(e.topPct!==null?8:-1);}}function Jr(t,i){if(t&1&&iI(0,Yr,15,15,"div",10)(1,Zr,10,5,"div",34),t&2){let e=i.$implicit;sI(e.status!=="ok"?0:1);}}function el(t,i){if(t&1&&lI(0,Jr,2,1,null,null,an),t&2){let e=CI(2);uI(e.view().trinketRows);}}function tl(t,i){if(t&1&&(si(0,"span",24),up(1,"wl-game-icon",36),Cc()),t&2){let e=i.$implicit;rv(),lp("id",e.id)("name",e.name)("icon",e.icon);}}function nl(t,i){if(t&1&&(si(0,"div",11)(1,"span",23),eD(2,"On plan"),Cc(),lI(3,tl,2,3,"span",24,an),Cc()),t&2){let e=CI(2);rv(3),uI(e.view().trinketRows);}}function il(t,i){t&1&&(si(0,"div",12),eD(1," No trinket data. "),Cc());}function ol(t,i){if(t&1&&iI(0,el,2,0)(1,nl,5,0,"div",11)(2,il,2,0,"div",12),t&2){let e=CI();sI(e.view().trinketStatus!=="ok"?0:e.view().trinketRows.length?1:2);}}function al(t,i){if(t&1&&(si(0,"div",26),up(1,"div",2),si(2,"div",15),up(3,"wl-game-icon",36),si(4,"div",37),eD(5),Cc()(),si(6,"div",29)(7,"div",30),eD(8),Cc(),si(9,"div",31),eD(10,"of top parsers"),Cc()(),up(11,"div",2),Cc()),t&2){let e=i.$implicit;rv(3),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(3),Sc("",e.pct,"%");}}function rl(t,i){if(t&1&&lI(0,al,12,5,"div",26,an),t&2){let e=CI(2);uI(e.view().benchTrinketRows);}}function ll(t,i){t&1&&(si(0,"div",12),eD(1," No trinket data. "),Cc());}function sl(t,i){if(t&1&&iI(0,rl,2,0)(1,ll,2,0,"div",12),t&2){let e=CI();sI(e.view().benchTrinketRows.length?0:1);}}function dl(t,i){if(t&1&&(si(0,"span",39),eD(1,"Measured"),Cc(),si(2,"div",30),eD(3),Cc(),si(4,"div",40),eD(5,"of top parsers"),Cc()),t&2){let e=CI().$implicit;rv(3),Sc("",e.topPct,"%");}}function cl(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",35),eD(3),Cc()(),si(4,"div",44)(5,"span",45),eD(6),Cc(),si(7,"span",46),eD(8),Cc()(),si(9,"div",38),iI(10,dl,6,1),Cc(),si(11,"div",18)(12,"span",19),eD(13,"Fix"),Cc(),si(14,"wl-collapsible-text"),eD(15),Cc()()()),t&2){let e=i.$implicit;rv(2),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),Sc(" ",e.status==="info"?"info":"warning_amber"," "),rv(3),Ap(e.slotName),rv(2),Ap(e.name),rv(),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),sI(e.topPct!==null?10:-1),rv(5),Ap(e.note);}}function ml(t,i){if(t&1&&(si(0,"div",11)(1,"span",23),eD(2,"On plan"),Cc(),si(3,"span",24)(4,"span",25),eD(5),Cc()()()),t&2){let e=CI(3);rv(5),Sc("",e.enchantOnPlan().length," enchants");}}function pl(t,i){if(t&1&&(lI(0,cl,16,13,"div",10,oo),iI(2,ml,6,1,"div",11)),t&2){let e=CI(2);uI(e.enchantIssues()),rv(2),sI(e.enchantOnPlan().length?2:-1);}}function ul(t,i){t&1&&(si(0,"div",11)(1,"span",23),eD(2,"On plan"),Cc(),si(3,"span",24)(4,"span",25),eD(5,"All enchants"),Cc()()());}function fl(t,i){t&1&&(si(0,"div",12),eD(1," No enchant data. "),Cc());}function hl(t,i){if(t&1&&iI(0,pl,3,1)(1,ul,6,0,"div",11)(2,fl,2,0,"div",12),t&2){let e=CI();sI(e.enchantIssues().length?0:e.view().enchantRows.length?1:2);}}function gl(t,i){if(t&1&&(si(0,"div",26),up(1,"div",2),si(2,"div",44)(3,"span",45),eD(4),Cc(),si(5,"span",16),eD(6),Cc()(),si(7,"div",29)(8,"div",30),eD(9),Cc(),si(10,"div",31),eD(11,"of top parsers"),Cc()(),up(12,"div",2),Cc()),t&2){let e=i.$implicit;rv(4),Ap(e.slotName),rv(2),Ap(e.name),rv(3),Sc("",e.pct,"%");}}function _l(t,i){if(t&1&&lI(0,gl,13,3,"div",26,oo),t&2){let e=CI(2);uI(e.view().benchEnchantRows);}}function bl(t,i){t&1&&(si(0,"div",12),eD(1," No enchant data. "),Cc());}function vl(t,i){if(t&1&&iI(0,_l,2,0)(1,bl,2,0,"div",12),t&2){let e=CI();sI(e.view().benchEnchantRows.length?0:1);}}var io=class t{gear=T(Pt);spec=MF.required();encounterId=MF.required();report=MF("");fight=MF(0);player=MF(0);busyChange=_F();_view=xo$1(Rt());view=this._view.asReadonly();enchantIssues=ED(()=>this.view().enchantRows.filter(i=>i.status!=="ok"));enchantOnPlan=ED(()=>this.view().enchantRows.filter(i=>i.status==="ok"));slotName=Ke;statusIcon=Hi;loadToken=0;constructor(){xu(()=>{let i=this.spec(),e=this.encounterId(),n=this.report(),o=this.fight(),a=this.player(),r=++this.loadToken;(n&&o&&a?this.gear.loadComparisonView(i,e,n,o,a):this.gear.loadBenchView(i,e)).then(s=>{r===this.loadToken&&this._view.set(s);}).catch(s=>J_("gear.loadComparisonView",s)).finally(()=>{r===this.loadToken&&this.busyChange.emit(false);});});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-gear"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"]},outputs:{busyChange:"busyChange"},decls:39,vars:4,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","pl-[14px]"],[1,"border-t","border-[var(--border)]"],[1,"px-4","pt-3","pb-1","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"flex","items-center","gap-2","border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"!text-[18px]","!w-[18px]","!h-[18px]","!leading-[18px]","badge-warning"],[1,"min-w-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[10px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"flex","flex-wrap","items-center","gap-2"],["target","_blank","rel","noopener",1,"rounded-[3px]","border","border-[var(--accent)]/20","bg-[var(--accent)]/[0.08]","px-[7px]","py-[1px]","font-mono","text-[10px]","text-[var(--accent)]","no-underline","whitespace-nowrap","hover:brightness-125",3,"href"],[1,"text-[11px]","text-[var(--muted)]"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"text-[13px]","text-[var(--muted)]"],[1,"grid","grid-cols-[minmax(0,1fr)_auto]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-1","md:gap-y-0","items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"min-w-0","text-sm","text-[var(--text)]"],[1,"block","text-[11px]","text-[var(--muted)]","mt-0.5"],[1,"text-right","leading-[1.1]","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[10px]","opacity-60","mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-right","md:text-left","text-[13px]","text-[var(--muted)]","leading-[1.45]","md:border-l","md:border-[var(--border)]","md:pl-[14px]"],["target","_blank","rel","noopener",1,"text-[var(--gold)]","no-underline","hover:brightness-125",3,"href"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[7px]","items-start","md:items-center","border-t","border-[var(--border)]/30","opacity-55"],[1,"!text-[18px]","!w-[18px]","!h-[18px]","!leading-[18px]"],["kind","item",3,"id","name","icon"],[1,"text-[11px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"block","h-[7px]","w-[7px]","shrink-0","rounded-full","bg-[var(--success)]/60"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]","text-[var(--success)]"],[1,"text-[14px]","font-bold","tabular-nums"],[1,"min-w-0","flex","items-baseline","gap-2"],[1,"shrink-0","w-14","text-[10px]","uppercase","tracking-widest","text-[var(--border)]"],[1,"text-sm","text-[var(--text)]","truncate"]],template:function(e,n){e&1&&(si(0,"div",0)(1,"div",1),up(2,"div",2),si(3,"div")(4,"div",3),eD(5,"Gear"),Cc(),iI(6,Or,2,0,"div",4)(7,Nr,2,0,"div",4),Cc(),si(8,"div",5),eD(9,"Measured"),Cc(),si(10,"div",6),eD(11,"Fix"),Cc()(),si(12,"div",7)(13,"div",8),up(14,"div"),si(15,"div",9),eD(16,"Talents"),Cc(),up(17,"div")(18,"div"),Cc(),iI(19,Vr,3,1)(20,Qr,2,1),Cc(),si(21,"div",7)(22,"div",8),up(23,"div"),si(24,"div",9),eD(25,"Trinkets"),Cc(),up(26,"div")(27,"div"),Cc(),iI(28,ol,3,1)(29,sl,2,1),Cc(),si(30,"div",7)(31,"div",8),up(32,"div"),si(33,"div",9),eD(34,"Enchants"),Cc(),up(35,"div")(36,"div"),Cc(),iI(37,hl,3,1)(38,vl,2,1),Cc()()),e&2&&(rv(6),sI(n.view().comparison?6:7),rv(13),sI(n.view().comparison?19:20),rv(9),sI(n.view().comparison?28:29),rv(9),sI(n.view().comparison?37:38));},dependencies:[vv,_v,be,It],encapsulation:2})};var Ft=class t{source=T(oD);async loadCredits(i,e){if(!i||!e)return {parses:[],sources:[]};let n=await this.source.getBench(i,e);return n?{parses:n.parses,sources:n.sources}:{parses:[],sources:[]}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var xl=(t,i)=>i.link,yl=(t,i)=>i.url;function wl(t,i){if(t&1&&(bc(0,"li",6)(1,"span",7),eD(2),_c(),bc(3,"a",8),eD(4),_c()()),t&2){let e=i.$implicit;rv(2),Ap(e.rank),rv(),hp("href",e.link,ef),rv(),Sc("",e.player," \u2197");}}function Cl(t,i){if(t&1&&(bc(0,"div")(1,"div",3),eD(2,"Top parses"),_c(),bc(3,"p",4),eD(4,"Benchmarks drawn from these logs."),_c(),bc(5,"ul",5),lI(6,wl,5,3,"li",6,xl),_c()()),t&2){let e=CI(2);rv(6),uI(e.parses());}}function Sl(t,i){if(t&1&&(bc(0,"li",9)(1,"a",10),eD(2),_c()()),t&2){let e=i.$implicit;rv(),hp("href",e.url,ef),rv(),Sc("",e.label," \u2197");}}function Ml(t,i){if(t&1&&(bc(0,"div")(1,"div",3),eD(2,"Rulebook guides"),_c(),bc(3,"p",4),eD(4,"Coaching rules built from these guides."),_c(),bc(5,"ul",5),lI(6,Sl,3,2,"li",9,yl),_c()()),t&2){let e=CI(2);rv(6),uI(e.sources());}}function kl(t,i){if(t&1&&(bc(0,"details",0)(1,"summary",1),eD(2," Sources "),_c(),bc(3,"div",2),iI(4,Cl,8,0,"div"),iI(5,Ml,8,0,"div"),_c()()),t&2){let e=CI();rv(4),sI(e.parses().length?4:-1),rv(),sI(e.sources().length?5:-1);}}var ao=class t{credits=T(Ft);spec=MF.required();encounterId=MF.required();_parses=xo$1([]);_sources=xo$1([]);parses=this._parses.asReadonly();sources=this._sources.asReadonly();loadToken=0;constructor(){xu(()=>{let i=this.spec(),e=this.encounterId(),n=++this.loadToken;this.credits.loadCredits(i,e).then(o=>{n===this.loadToken&&(this._parses.set(o.parses),this._sources.set(o.sources));}).catch(o=>J_("credits.loadCredits",o));});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-credits"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"]},decls:1,vars:1,consts:[[1,"rounded-[10px]","border","border-[var(--border)]","bg-[var(--surface)]","px-4","py-3"],[1,"cursor-pointer","select-none","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"mt-3","flex","flex-col","gap-4"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mb-1.5"],[1,"text-[11px]","text-[var(--muted)]","mb-2"],[1,"flex","flex-col","gap-1"],[1,"flex","items-baseline","gap-2","text-[13px]"],[1,"w-5","shrink-0","text-right","tabular-nums","text-[var(--border)]"],["target","_blank","rel","noopener",1,"text-[var(--gold)]","no-underline","hover:brightness-125",3,"href"],[1,"text-[13px]"],["target","_blank","rel","noopener",1,"text-[var(--accent)]","no-underline","hover:brightness-125",3,"href"]],template:function(e,n){e&1&&iI(0,kl,6,2,"details",0),e&2&&sI(n.parses().length||n.sources().length?0:-1);},encapsulation:2})};var lo=-Math.PI/2,ro=1/100,Tl=1/1e3;function El(t,i){let e=new Map;for(let o of t){let a=aD(o);if(a==null)continue;let r=e.get(a);r||(r=[],e.set(a,r)),r.push({t:(o.timestamp-i)/1e3,x:o.x*ro,y:o.y*ro,facing:typeof o.facing=="number"?o.facing*Tl:void 0,mapID:typeof o.mapID=="number"?o.mapID:void 0});}let n=new Map;for(let[o,a]of e)a.sort((r,l)=>r.t-l.t),n.set(o,{id:o,samples:a});return n}function Dl(t){let i=new Map;for(let e of t.parses)for(let n of e.enemies){if(n.game_id==null)continue;let o=i.get(n.game_id);o?n.is_boss&&(o.isBoss=true):i.set(n.game_id,{gameId:n.game_id,name:n.name,isBoss:n.is_boss});}return [...i.values()].sort((e,n)=>(n.isBoss?1:0)-(e.isBoss?1:0))}function so(t,i){let e=new Map;for(let a of i)a.gameID!=null&&e.set(a.gameID,a.id);let n=Dl(t).find(a=>a.isBoss)?.gameId;return {bossActorId:n!=null?e.get(n)??null:null,refActorByGameId:e}}function Il(t){let{positions:i,events:e,fightStartMs:n,playerId:o,enemies:a}=t,{bossActorId:r,refActorByGameId:l}=so(i,a),s=El(e,n);return s.get(o)?.samples.length?{timelines:s,playerId:o,bossActorId:r,refActorByGameId:l}:null}var Ye=class t{source=T(dD);injector=T(me);positions=xo$1(null);live=xo$1(null);open=xo$1(false);anchorTime=xo$1(0);reference=xo$1({kind:"boss"});contextLabel=xo$1("");contextSpells=xo$1([]);ready(){return !!this.positions()}async loadBench(i,e){let n=await this.source.getBench(i,e);return this.positions.set(n),this.live.set(null),n}async prepare(i,e,n,o,a){if(this.live.set(null),!e?.encounterID){this.positions.set(null);return}try{let r=await this.loadBench(o,e.encounterID);if(!r)return;let l=await this.fetchLiveEvents(i,e,n,r,a);this.live.set(Il({positions:r,events:l,fightStartMs:e.startTime,playerId:n,enemies:a}));}catch(r){J_(`MapFeatureService.prepare ${i}:${e?.id}`,r),this.live.set(null);}}openAt(i){this.anchorTime.set(i.timeS),this.reference.set(i.reference??{kind:"boss"}),this.contextLabel.set(i.label),this.contextSpells.set(i.spells),this.open.set(true);}close(){this.open.set(false);}clear(){this.open.set(false),this.positions.set(null),this.live.set(null);}async fetchLiveEvents(i,e,n,o,a){let{id:r,startTime:l,endTime:s}=e,{bossActorId:f}=so(o,a),p=this.injector.get(pa$1),[h,g,y]=await Promise.all([p.getAllEvents(i,r,"Casts",l,s,n,true),p.getAllEvents(i,r,"Casts",l,s,void 0,true,"Enemies"),f!=null?p.getAllEvents(i,r,"DamageDone",l,s,f,true):Promise.resolve([])]);return [...h,...g,...y]}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var co=1/100,Rl=1/1e3;function Pl(t,i){let e=(i-t)%(2*Math.PI);return e>Math.PI&&(e-=2*Math.PI),e<=-Math.PI&&(e+=2*Math.PI),e}function rn(t,i){return t.mapID==null||i.mapID==null||t.mapID===i.mapID}function we(t,i,e=3){let n=t?.samples;if(!n||!n.length)return null;if(i<=n[0].t)return i<n[0].t-e?null:U($({},n[0]),{t:i});let o=n[n.length-1];if(i>=o.t)return i>o.t+e?null:U($({},o),{t:i});let a=0,r=n.length-1;for(;a<r;){let y=a+r>>1;n[y].t<i?a=y+1:r=y;}let l=n[a],s=n[a-1],f=l.t-s.t,p=f>0?(i-s.t)/f:0,h;s.facing!=null&&l.facing!=null?h=s.facing+Pl(s.facing,l.facing)*p:h=s.facing??l.facing;let g=p<.5?s.mapID:l.mapID;return {t:i,x:s.x+(l.x-s.x)*p,y:s.y+(l.y-s.y)*p,facing:h,mapID:g}}function it(t,i,e=0){let n=t.x-i.x,o=t.y-i.y,a=(i.facing??Math.PI/2)+lo,r=Math.cos(a),l=Math.sin(a),s=n*r+o*l,f=n*l-o*r,p=Math.hypot(n,o),h=Math.atan2(f,s)*180/Math.PI;return {t:e,fwd:s,right:f,dist:p,angleDeg:h}}function At(t,i){let e=i.map(([n,o,a,r,l])=>({t:n,x:o*co,y:a*co,facing:r==null?void 0:r*Rl,mapID:l??void 0}));return {id:t,samples:e}}function mo(t,i){return i.kind==="boss"?(t.enemies.find(n=>n.is_boss)??t.enemies[0])?.samples??null:t.enemies.find(e=>e.game_id===i.gameId)?.samples??null}function ln(t,i,e){let n=[];for(let o of t.parses){let a=mo(o,i);if(!a)continue;let r=we(At(-2,a),e),l=we(At(-1,o.player),e);r&&l&&rn(l,r)&&n.push(it(l,r,e));}return n}function po(t,i,e,n,o,a){let r=[];for(let l of t.parses){let s=mo(l,i);if(!s)continue;let f=At(-2,s),p=At(-1,l.player),h=[];for(let g=e-n;g<=e+o+1e-6;g+=a){let y=we(f,g),C=we(p,g);y&&C&&rn(C,y)&&h.push(it(C,y,g));}h.length&&r.push(h);}return r}function uo(t,i,e,n,o,a,r){let l=[],s=e.get(i),f=e.get(t);for(let p=n-o;p<=n+a+1e-6;p+=r){let h=we(s,p),g=we(f,p);h&&g&&rn(g,h)&&l.push(it(g,h,p));}return l}var Fl=["canvas"],Al=(t,i)=>i.gameId,Ol=(t,i)=>i.id;function Nl(t,i){t&1&&(si(0,"p",1),eD(1," No position data for this encounter. "),Cc());}function Bl(t,i){if(t&1&&up(0,"wl-game-icon",20),t&2){let e=i.$implicit;lp("id",e.id)("icon",e.icon)("name",e.name);}}function Ll(t,i){if(t&1&&(si(0,"div",3),lI(1,Bl,1,3,"wl-game-icon",20,Ol),Cc()),t&2){let e=CI(2);rv(),uI(e.contextSpells());}}function Wl(t,i){if(t&1&&(si(0,"span",4),eD(1),Cc()),t&2){let e=CI(2);rv(),Ap(e.contextLabel());}}function $l(t,i){if(t&1&&(si(0,"mat-option",21),eD(1),Cc()),t&2){let e=CI().$implicit;lp("value",e.gameId),rv(),Ap(e.name);}}function zl(t,i){if(t&1&&iI(0,$l,2,2,"mat-option",21),t&2){let e=i.$implicit;sI(e.isBoss?-1:0);}}function Gl(t,i){t&1&&(si(0,"span",11),eD(1,"\u25C6 you"),Cc());}function Vl(t,i){if(t&1&&(si(0,"p",22),eD(1),fD(2,"number"),Cc()),t&2){let e=CI();rv(),Sc(" You are ",gD(2,1,e.deviation,"1.0-1"),"y from the top-parse centre. ");}}function jl(t,i){t&1&&iI(0,Vl,3,4,"p",22),t&2&&sI(i.deviation!==null?0:-1);}function Hl(t,i){if(t&1){let e=mI();si(0,"div",2),iI(1,Ll,3,0,"div",3)(2,Wl,2,1,"span",4),si(3,"mat-form-field",5)(4,"mat-label"),eD(5,"Reference"),Cc(),si(6,"mat-select",6),mp("selectionChange",function(o){su(e);let a=CI();return au(a.onRefChange(o.value))}),si(7,"mat-option",7),eD(8,"Boss"),Cc(),lI(9,zl,1,1,null,null,Al),Cc()()(),si(11,"div",8),up(12,"canvas",9,0),si(14,"div",10),iI(15,Gl,2,0,"span",11),si(16,"span",12),eD(17,"\u25CF top parses"),Cc(),si(18,"span",13),eD(19,"\u25EF top-parse centre"),Cc(),si(20,"span",14),eD(21,"\u25B2 reference (facing up)"),Cc()()(),iI(22,jl,1,1),si(23,"div",15)(24,"button",16),mp("click",function(){su(e);let o=CI();return au(o.togglePlay())}),si(25,"mat-icon"),eD(26),Cc()(),si(27,"div",17)(28,"input",18),mp("input",function(o){su(e);let a=CI();return au(a.onScrub(o.target.valueAsNumber))}),Cc(),si(29,"div",19)(30,"span"),eD(31),fD(32,"formatDuration"),Cc(),si(33,"span"),eD(34),fD(35,"formatDuration"),Cc(),si(36,"span"),eD(37),fD(38,"formatDuration"),Cc()()()();}if(t&2){let e,n=CI();rv(),sI(n.contextSpells().length?1:n.contextLabel()?2:-1),rv(5),lp("value",n.refValue()),rv(3),uI(n.refEnemies()),rv(6),sI(n.live()?15:-1),rv(7),sI((e=n.readout())?22:-1,e),rv(2),cp("aria-label",n.playing()?"Pause":"Play"),rv(2),Ap(n.playing()?"pause":"play_arrow"),rv(2),lp("min",n.windowStart())("max",n.windowEnd())("value",n.scrubT()),rv(3),Ap(hD(32,12,n.windowStart())),rv(3),Sc("anchor ",hD(35,14,n.anchorTime())),rv(3),Ap(hD(38,16,n.windowEnd()));}}var fo=.5,sn=6,dn=3,ql=60,Ul=.06,Ot=class t{map=T(Ye);positions=this.map.positions;live=this.map.live;anchorTime=this.map.anchorTime;contextLabel=this.map.contextLabel;contextSpells=this.map.contextSpells;selector=xo$1({kind:"boss"});scrubT=xo$1(0);playing=xo$1(false);timer=null;canvas=NF("canvas");refEnemies=ED(()=>{let i=this.positions();if(!i)return [];let e=new Map;for(let n of i.parses)for(let o of n.enemies){if(o.game_id==null)continue;let a=e.get(o.game_id);a?o.is_boss&&(a.isBoss=true):e.set(o.game_id,{gameId:o.game_id,name:o.name,isBoss:o.is_boss});}return [...e.values()].sort((n,o)=>(o.isBoss?1:0)-(n.isBoss?1:0))});refValue=ED(()=>{let i=this.selector();return i.kind==="boss"?"boss":i.gameId});windowStart=ED(()=>this.anchorTime()-sn);windowEnd=ED(()=>this.anchorTime()+dn);benchTrails=ED(()=>{let i=this.positions();return i?po(i,this.selector(),this.anchorTime(),sn,dn,fo):[]});liveRefId=ED(()=>{let i=this.live();if(!i)return null;let e=this.selector();return e.kind==="boss"?i.bossActorId:i.refActorByGameId.get(e.gameId)??null});liveTrail=ED(()=>{let i=this.live(),e=this.liveRefId();return !i||e==null?[]:uo(i.playerId,e,i.timelines,this.anchorTime(),sn,dn,fo)});readout=ED(()=>{let i=this.positions();if(!i)return null;let e=this.scrubT(),n=ln(i,this.selector(),e),o=null;n.length&&(o={fwd:n.reduce((l,s)=>l+s.fwd,0)/n.length,right:n.reduce((l,s)=>l+s.right,0)/n.length});let a=this.livePlayerAt(e),r=o&&a?Math.hypot(a.fwd-o.fwd,a.right-o.right):null;return {topCount:n.length,centroid:o,player:a,deviation:r}});constructor(){T(Pe).onDestroy(()=>this.stopTimer()),xu(()=>{this.anchorTime(),this.selector.set(this.map.reference()),this.pause(),this.scrubT.set(this.anchorTime());}),xu(()=>{let i=this.canvas()?.nativeElement;this.benchTrails(),this.liveTrail(),this.scrubT(),this.readout(),i&&this.draw(i);});}onRefChange(i){this.selector.set(i==="boss"?{kind:"boss"}:{kind:"enemy",gameId:i});}onScrub(i){this.pause(),this.scrubT.set(i);}togglePlay(){this.playing()?this.pause():this.play();}play(){this.scrubT()>=this.windowEnd()-1e-6&&this.scrubT.set(this.windowStart()),this.playing.set(true),this.stopTimer(),this.timer=setInterval(()=>{let i=this.scrubT()+Ul;this.scrubT.set(i>=this.windowEnd()?this.windowStart():i);},ql);}pause(){this.playing.set(false),this.stopTimer();}stopTimer(){this.timer!=null&&(clearInterval(this.timer),this.timer=null);}livePlayerAt(i){let e=this.live(),n=this.liveRefId();if(!e||n==null)return null;let o=we(e.timelines.get(n),i),a=we(e.timelines.get(e.playerId),i);return !o||!a||o.mapID!=null&&a.mapID!=null&&o.mapID!==a.mapID?null:it(a,o,i)}draw(i){let e=i.getContext("2d");if(!e)return;let n=globalThis.devicePixelRatio||1,o=i.clientWidth||600,a=i.clientHeight||420;i.width=Math.round(o*n),i.height=Math.round(a*n),e.setTransform(n,0,0,n,0,0),e.clearRect(0,0,o,a);let r=o/2,l=a/2,s=Math.min(o,a)/2-28,f=this.benchTrails(),p=this.liveTrail(),h=this.readout(),g=10;for(let F of f)for(let Y of F)g=Math.max(g,Y.dist);for(let F of p)g=Math.max(g,F.dist);g=Math.ceil(g/5)*5+5;let y=s/g,C=F=>[r+F.right*y,l-F.fwd*y],A=getComputedStyle(i),P=F=>A.getPropertyValue(F).trim(),K=P("--gold"),Ne=P("--border"),Te=P("--muted"),Bt=P("--critical"),Xe=P("--accent"),Lt=P("--chart-dot-outline");e.strokeStyle=Ne,e.fillStyle=Te,e.font="11px system-ui, sans-serif",e.lineWidth=1;for(let F=5;F<=g;F+=5)e.beginPath(),e.arc(r,l,F*y,0,2*Math.PI),e.stroke(),e.fillText(`${F}y`,r+3,l-F*y+12);e.fillStyle=Bt,e.beginPath(),e.moveTo(r,l-9),e.lineTo(r-7,l+6),e.lineTo(r+7,l+6),e.closePath(),e.fill();let Ao=this.scrubT();e.strokeStyle=Te,e.globalAlpha=.25,e.lineWidth=1.5;for(let F of f)e.beginPath(),F.forEach((Y,re)=>{let[Ze,pn]=C(Y);re?e.lineTo(Ze,pn):e.moveTo(Ze,pn);}),e.stroke();e.globalAlpha=1;let mn=this.positions(),Oo=mn?ln(mn,this.selector(),Ao):[];e.fillStyle=Te;for(let F of Oo){let[Y,re]=C(F);e.beginPath(),e.arc(Y,re,3,0,2*Math.PI),e.fill();}if(h?.centroid){let[F,Y]=C(h.centroid);e.strokeStyle=Xe,e.lineWidth=2,e.beginPath(),e.arc(F,Y,7,0,2*Math.PI),e.stroke();}if(p.length&&(e.strokeStyle=K,e.globalAlpha=.5,e.lineWidth=2,e.beginPath(),p.forEach((F,Y)=>{let[re,Ze]=C(F);Y?e.lineTo(re,Ze):e.moveTo(re,Ze);}),e.stroke(),e.globalAlpha=1),h?.player){let[F,Y]=C(h.player),re=5;e.fillStyle=K,e.beginPath(),e.moveTo(F,Y-re),e.lineTo(F+re,Y),e.lineTo(F,Y+re),e.lineTo(F-re,Y),e.closePath(),e.fill(),e.strokeStyle=Lt,e.lineWidth=1,e.stroke();}}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-map-canvas"]],viewQuery:function(e,n){e&1&&Dp(n.canvas,Fl,5),e&2&&AI();},decls:2,vars:1,consts:[["canvas",""],[1,"text-[13px]","text-[var(--muted)]"],[1,"mb-2","flex","flex-wrap","items-center","justify-between","gap-2"],[1,"flex","flex-wrap","items-center","gap-2"],[1,"text-[12px]","text-[var(--muted)]"],["appearance","outline",1,"w-[200px]"],[3,"selectionChange","value"],["value","boss"],[1,"relative","rounded-lg","border","border-[var(--border)]","bg-[var(--surface-alt)]"],[1,"block","h-[420px]","w-full"],[1,"pointer-events-none","absolute","bottom-2","left-2","flex","flex-col","gap-0.5","text-[10px]"],[1,"text-[var(--gold)]"],[1,"text-[var(--muted)]"],[1,"text-[var(--accent)]"],[1,"text-[var(--critical)]"],[1,"mt-2","flex","items-center","gap-2"],["mat-icon-button","",3,"click"],[1,"min-w-0","flex-1"],["type","range","step","0.25",1,"block","w-full","accent-[var(--gold)]",3,"input","min","max","value"],[1,"mt-1","flex","justify-between","text-[10px]","text-[var(--muted)]"],[3,"id","icon","name"],[3,"value"],[1,"mt-2","text-[12px]","text-[var(--muted)]"]],template:function(e,n){e&1&&iI(0,Nl,2,0,"p",1)(1,Hl,39,18),e&2&&sI(n.positions()?1:0);},dependencies:[v_,Pd,vv,_v,yt,xt,nt,Bi,Ni,qe,be,dc,Ue],encapsulation:2})};function Ql(t,i){if(t&1){let e=mI();si(0,"div",0)(1,"div",2)(2,"span",3),eD(3,"Positioning"),Cc(),si(4,"button",4),mp("click",function(){su(e);let o=CI(2);return au(o.map.close())}),si(5,"mat-icon"),eD(6,"close"),Cc()()(),si(7,"div",5),up(8,"wl-map-canvas"),Cc()();}}function Kl(t,i){if(t&1){let e=mI();si(0,"div",1)(1,"div",2)(2,"span",3),eD(3,"Positioning"),Cc(),si(4,"button",4),mp("click",function(){su(e);let o=CI(2);return au(o.map.close())}),si(5,"mat-icon"),eD(6,"close"),Cc()()(),si(7,"div",5),up(8,"wl-map-canvas"),Cc()();}}function Yl(t,i){if(t&1&&iI(0,Ql,9,0,"div",0)(1,Kl,9,0,"div",1),t&2){let e=CI();sI(e.isMobile()?0:1);}}var ho=class t{map=T(Ye);breakpoints=T(dr$1);isMobile=Ym(this.breakpoints.observe("(max-width: 768px)").pipe(re(i=>i.matches)),{initialValue:false});static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-map-panel"]],decls:1,vars:1,consts:[[1,"fixed","inset-0","z-50","flex","flex-col","bg-[var(--bg)]"],[1,"fixed","right-0","top-0","z-50","flex","h-full","w-[460px]","flex-col","border-l","border-[var(--border)]","bg-[var(--bg)]","shadow-2xl"],[1,"flex","items-center","justify-between","border-b","border-[var(--border)]","px-4","py-2"],[1,"font-semibold"],["mat-icon-button","","aria-label","Close map",3,"click"],[1,"flex-1","overflow-y-auto","p-4"]],template:function(e,n){e&1&&iI(0,Yl,2,1),e&2&&sI(n.map.open()?0:-1);},dependencies:[v_,Pd,vv,_v,Ot],encapsulation:2})};var go=class t{transform(i){return i?i.replace(/([A-Z])/g," $1").trim():""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatSpec",type:t,pure:true})};var _o=class t{transform(i){return i?M_(i):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"specIcon",type:t,pure:true})};var bo=class t{transform(i){return x_(i??"")}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"classIcon",type:t,pure:true})};function vo(t){return `https://assets.rpglogs.com/img/warcraft/bosses/${t}-icon.jpg`}var xo=class t{transform(i){return i?vo(i):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"bossIcon",type:t,pure:true})};function Xl(t,i){if(t&1&&up(0,"img",0),t&2){let e=CI();lp("ngSrc",i)("width",e.size())("height",e.size())("alt",e.alt());}}var yo=class t{src=MF.required();alt=MF.required();size=MF(20);static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-art-icon"]],hostAttrs:[1,"inline-flex","items-center","shrink-0","align-middle"],inputs:{src:[1,"src"],alt:[1,"alt"],size:[1,"size"]},decls:1,vars:1,consts:[[1,"block","rounded-sm",3,"ngSrc","width","height","alt"]],template:function(e,n){if(e&1&&iI(0,Xl,1,4,"img",0),e&2){let o;sI((o=n.src())?0:-1,o);}},dependencies:[Qh$1],encapsulation:2})};var wo="wl.sel.postRaid",Co="wl.sel.preFight",So=class t{savePostRaid(i){this._save(wo,i,"SelectionStore.savePostRaid");}loadPostRaid(){return this._load(wo,"SelectionStore.loadPostRaid")}savePreFight(i){this._save(Co,i,"SelectionStore.savePreFight");}loadPreFight(){return this._load(Co,"SelectionStore.loadPreFight")}_save(i,e,n){try{localStorage.setItem(i,JSON.stringify(e));}catch(o){J_(n,o);}}_load(i,e){try{let n=localStorage.getItem(i);return n?JSON.parse(n):null}catch(n){return J_(e,n),null}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Zl=new Set([2825,32182,80353,90355,264667,390386]),Jl=40,es=30,ts=15,cn=50;function To(t,i){let e={};for(let n of t)n.type==="cast"&&n.abilityGameID&&(e[n.abilityGameID]??=[]).push((n.timestamp-i)/1e3);return e}function Eo(t,i,e,n){let o=t.window_s??5,a=t.exception,r=[...i[t.spell_id]??[]].sort((f,p)=>f-p),l=i[t.required_spell_id]??[],s=[];for(let f of r)if(!l.some(p=>Math.abs(f-p)<=o)){if(a){let p=i[a.context_spell_id]??[],h=a.context_window_s??20;if(a.position==="before"?p.some(y=>f-y>=0&&f-y<=h):p.some(y=>y-f>=0&&y-f<=h))continue}s.push(f);}return s.length?{severity:e,category:"rule_violation",timestamp_ms:Math.round(s[0]*1e3),label:`${t.spell_name} without ${t.required_spell_name}`,message:`${t.spell_name} without ${t.required_spell_name}: ${s.length} of ${r.length} cast(s).`,measured:{value:`${s.length} / ${r.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0}:null}function Do(t,i,e,n){let o=t.hold_window_s??15,a=[...i[t.anchor_spell_id]??[]].sort((f,p)=>f-p).slice(1),r=t.spell_ids.flatMap((f,p)=>{let h=t.spell_names?.[p]??String(f);return a.flatMap(g=>(i[f]??[]).filter(y=>y>=g-o&&y<g).map(y=>({spellName:h,castTime:y})))});if(!r.length)return null;let l=r.reduce((f,p)=>Math.min(f,p.castTime),1/0),s=[...new Set(r.map(f=>f.spellName))].join("/");return {severity:e,category:"rule_violation",timestamp_ms:Math.round(l*1e3),label:`${s} held before ${t.anchor_spell_name}`,message:`${s} used in the ${o}s hold window before ${t.anchor_spell_name}: ${r.length} charge(s).`,measured:{value:`${r.length}`,unit:"charge(s)"},details:n?{remedy:n}:void 0}}function ns(t,i,e){let n=[],o=To(i,e);for(let a of t){let r=a.condition;if(!r)continue;let l=a.priority==="critical"?"critical":"warning",s=r.kind==="cast_without_prior"?Eo(r,o,l,a.action):r.kind==="hold_cooldown_for_anchor"?Do(r,o,l,a.action):null;s&&n.push(s);}return n}function Mo(t,i){return i||(t.kind==="cast_without_prior"?`${t.spell_name} with ${t.required_spell_name}`:`${t.spell_names.join("/")} held for ${t.anchor_spell_name}`)}function is(t,i,e){let n=To(i,e),o=[];for(let a of t){let r=a.condition;if(!r)continue;let l=a.priority==="critical"?"critical":"warning";r.kind==="cast_without_prior"?(n[r.spell_id]?.length??0)>0&&!Eo(r,n,l)&&o.push(Mo(r,a.description)):r.kind==="hold_cooldown_for_anchor"&&(n[r.anchor_spell_id]?.length??0)>1&&r.spell_ids.some(f=>(n[f]?.length??0)>0)&&!Do(r,n,l)&&o.push(Mo(r,a.description));}return o}var os=5;function as(t,i,e,n,o){return i===0&&e>=1?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`0 / ${e}`,unit:"cast(s)"},message:`${t} unused. Expected ${e} on a ${XD(o)} fight.`,details:{remedy:`Use ${t} ${e}x this fight.`}}:i>0&&i<n?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`${i} / ${e}`,unit:"cast(s)"},message:`${t}: ${i} casts, expected ${e}. ${n-i} lost.`,details:{remedy:`Press ${t} ${n-i}x more - sooner off cooldown.`}}:null}function rs(t,i,e){if(!i.length)return null;let n=i[0]/1e3;if(!zD(n,e.avg_first_cast_s,e.stddev_first_cast_s))return null;let o=(n-e.avg_first_cast_s).toFixed(0);return {severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:i[0],measured:{value:`+${o}s`,unit:`top ${XD(e.avg_first_cast_s)}`},message:`${t} opened at ${XD(n)}, ${o}s late. Top: ${XD(e.avg_first_cast_s)}.`,details:{remedy:`Open with ${t} earlier.`}}}function ls(t,i,e,n,o){if(n===null||!i.length)return {blAligned:false,findings:[]};let a=i.filter(s=>{let f=s/1e3;return f>=n-es&&f<=n+Jl+ts}),r=a.length>0,l=[];if(!r&&o)l.push({severity:"critical",category:"cooldown_alignment",cd_name:t,timestamp_ms:i[0],measured:{value:"missed",unit:"BL"},message:`${t} missed Bloodlust (BL at ${XD(n)}, first cast at ${XD(i[0]/1e3)}).`,details:{remedy:`Align ${t} with Bloodlust.`}});else if(r&&e.avg_bl_offset_s!=null&&e.stddev_bl_offset_s!=null){let s=a.map(p=>p/1e3-n),f=GD(s);if(HD(f,e.avg_bl_offset_s,e.stddev_bl_offset_s)){let p=f>e.avg_bl_offset_s?"late":"early";l.push({severity:"warning",category:"cooldown_alignment",cd_name:t,timestamp_ms:a[0],measured:{value:p,unit:"in BL"},message:`${t} ${p} in the Bloodlust window.`,details:{remedy:`Tighten ${t} to the Bloodlust window.`}});}}return {blAligned:r,findings:l}}function ss(t,i,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;for(let o=1;o<i.length;o++){let a=(i[o]-i[o-1])/1e3;zD(a,e.avg_gap_s,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:i[o],measured:{value:`${a.toFixed(0)}s`,unit:`avg ${e.avg_gap_s.toFixed(0)}s`},message:`${t} at ${XD(i[o]/1e3)}: ${a.toFixed(0)}s gap, top ${e.avg_gap_s.toFixed(0)}s.`,details:{remedy:`Press ${t} sooner - top gap ${e.avg_gap_s.toFixed(0)}s.`}});}return n}function ds(t,i,e){let n=[];if(!i.length)return n;let o=i.map(a=>a/1e3);for(let[a,r]of Object.entries(e.hold_targets)){let l=parseInt(a,10)-1;if(l<1||l>=o.length)continue;o[l]-o[l-1]-r.effective_cd_s<r.delay_s-r.band_s&&n.push({severity:"info",category:"hold_suggestion",timestamp_ms:i[l],measured:{value:XD(o[l]),unit:`top ${XD(r.target_s)}`},message:`${t} cast ${a} at ${XD(o[l])}. ${r.count}/${r.total_samples} top parses hold to ${XD(r.target_s)}.`,details:{remedy:`Hold ${t} to ${XD(r.target_s)}.`,cd_name:t}});}return n}function cs(t,i,e){if(t.length<2||e.downtime_threshold_ms==null)return null;let n=0;for(let f=1;f<t.length;f++){let p=t[f]-t[f-1];p>e.downtime_threshold_ms&&(n+=p);}let o=n/1e3;if(o<=os)return null;let a=e.top_avg_efficiency,r=e.top_efficiency_stddev,l=WD(o,i);return {severity:$D(l,a,r)?"critical":"warning",category:"cast_efficiency",label:"Low cast efficiency",measured:{value:`${l.toFixed(1)}%`,unit:`top ${a.toFixed(0)}%`},message:`${l.toFixed(1)}% cast efficiency, ${o.toFixed(1)}s idle. Top: ${a.toFixed(0)}%.`,details:{remedy:`Fill ${o.toFixed(1)}s of gaps. Top: ${a.toFixed(0)}%.`}}}function ms(t,i,e,n,o){let a=t.name,r=i.length;if(t.talent_gated&&r===0)return null;if(!e)return {success:r>0?{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a}: ${r} casts (no bench data).`}:null,scan:{issues:[],holds:[],blAligned:false}};let l=e.bl_pct>=cn,{expected:s,floor:f}=YD(n,e.uses_per_min),p=[],h=as(a,r,s,f,n);h&&p.push(h);let g=rs(a,i,e);g&&p.push(g);let y=ls(a,i,e,o,l);p.push(...y.findings),p.push(...ss(a,i,e));let C=ds(a,i,e);return {success:p.length||r===0?null:{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a} - ${r}/${s} casts${y.blAligned&&l?", BL-aligned":""}.`},scan:{issues:p,holds:C,blAligned:y.blAligned}}}function ps(t){let{fStart:i,fEnd:e,castEvents:n,buffEvents:o,cooldowns:a,rules:r,bench:l}=t,s=(e-i)/1e3,f=n.filter(C=>C.type==="cast"&&C.timestamp>=i&&C.timestamp<=e).sort((C,A)=>C.timestamp-A.timestamp),p=[],h=null;for(let C of o)if(C.type==="applybuff"&&Zl.has(C.abilityGameID)&&C.timestamp>=i&&C.timestamp<=e){h=(C.timestamp-i)/1e3;break}let g=l.per_cd_benchmarks??{};for(let C of a){let A=f.filter(K=>K.abilityGameID===C.spell_id).map(K=>K.timestamp-i),P=ms(C,A,g[C.name],s,h);P&&(P.scan.issues.length?p.push(...P.scan.issues):P.success&&p.push(P.success),A.length&&p.push(...P.scan.holds));}r.length&&p.push(...ns(r,f,i));let y=cs(f.map(C=>C.timestamp-i),s,l);return y&&p.push(y),ZD(p),p}var us={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function Io(t,i,e){let n=i[t]??null;return n!=null?{spellId:n,icon:e[n].icon,rowName:e[n].name}:{spellId:null,icon:"",rowName:t}}function fs(t){let i=[],e={},n=new Set;for(let o of t){if(o.severity==="success"){o.cd_name&&n.add(o.cd_name);continue}o.category==="hold_suggestion"&&o.details?.cd_name?(e[o.details.cd_name]??={issues:[],holds:[]}).holds.push(o):o.category==="rule_violation"||!o.cd_name?i.push(o):(e[o.cd_name]??={issues:[],holds:[]}).issues.push(o);}return {ruleFindings:i,byName:e,successNames:n}}function hs(t){return t.map(i=>({severity:i.severity==="critical"?"critical":"warning",name:"",icon:"",what:i.label,measured:i.measured??{value:"-"},fix:i.details?.remedy}))}function gs(t,i,e){let n=[];for(let[o,a]of Object.entries(t)){if(!a.issues.length&&!a.holds.length)continue;let{spellId:r,icon:l,rowName:s}=Io(o,i,e);for(let f of [...a.issues,...a.holds])n.push({severity:f.severity==="critical"?"critical":"warning",name:s,spellId:r,icon:l,timestampMs:f.timestamp_ms??null,chip:us[f.category],measured:f.measured??{value:"-"},fix:f.details?.remedy});}return n}function _s(t,i,e){let{byName:n,successNames:o}=t,a=[];for(let r of o)if(!n[r]||!n[r].issues.length&&!n[r].holds.length){let{spellId:l,icon:s,rowName:f}=Io(r,i,e);a.push({name:f,spellId:l,icon:s});}return a}function bs(t,i,e){let n=fs(t);return {ruleRows:hs(n.ruleFindings),offensiveRows:gs(n.byName,i,e),onPlan:_s(n,i,e)}}function vs(t,i,e){return [...t].sort((o,a)=>{let r=o.opener_priority??99,l=a.opener_priority??99;return r!==l?r-l:o.name.localeCompare(a.name)}).map(o=>{let a=i[o.name],r=a?.majority_hold&&a.hold_targets?Object.entries(a.hold_targets).sort((l,s)=>Number(l[0])-Number(s[0])).map(([l,s])=>({castIndex:Number(l),targetS:s.target_s})):[];return {name:o.name,spellId:o.spell_id??null,icon:e[o.spell_id].icon,firstCastS:a?.avg_first_cast_s??null,uses:a?.avg_uses??null,usesPerMin:a?.uses_per_min.avg??null,bloodlust:(a?.bl_pct??0)>=cn,bloodlustPct:(a?.bl_pct??0)>=cn?a.bl_pct:null,holds:r,rule:o.usage_rule??null}})}var ko=class t{source=T(Yy);wclApi=T(pa$1);async loadPlayerView(i,e,n,o,a){let r={ruleRows:[],ruleOnPlan:[],offensiveRows:[],onPlan:[]},l=await this.source.getBench(i,e);if(!l)return r;try{let f=(await this.wclApi.getReport(n)).fights.find(K=>K.id===o);if(!f)return r;let[p,h]=await Promise.all([this.wclApi.getAllEvents(n,o,"Casts",f.startTime,f.endTime,a),this.wclApi.getAllEvents(n,o,"Buffs",f.startTime,f.endTime,a)]),g=ps({fStart:f.startTime,fEnd:f.endTime,castEvents:p,buffEvents:h,cooldowns:l.major_cooldowns,rules:l.rules,bench:l}),{ruleRows:y,offensiveRows:C,onPlan:A}=bs(g,l.cd_spell_ids,l.ability_icons),P=is(l.rules,p,f.startTime);return {ruleRows:y,ruleOnPlan:P,offensiveRows:C,onPlan:A}}catch(s){return J_(`RotationFeatureService.loadPlayerView ${n}:${o}`,s),r}}async loadPlanView(i,e){let n=await this.source.getBench(i,e);return n?vs(n.major_cooldowns,n.per_cd_benchmarks,n.ability_icons):[]}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Nt=t=>(t.amount||0)+(t.absorbed||0);function xs(t,i,e,n,o,a,r,l){let s=i.map(([f,p])=>{let h=p??l;return {start_s:Math.round(f*10)/10,end_s:Math.round(h*10)/10,dmg_during:Math.round(n(f,h))}});return s.length?s:e.filter(f=>f.type==="cast"&&f.abilityGameID===t&&f.timestamp>=a&&f.timestamp<=r).map(f=>{let p=o(f.timestamp)/1e3;return {start_s:Math.round(p*10)/10,end_s:Math.round(p*10)/10,dmg_during:0}})}function ys(t,i,e,n,o,a){if(!t.length)return [];let r=h=>h-o,l=n.filter(h=>h.type==="damage"),s={};for(let h of e){let g=h.abilityGameID,y=r(h.timestamp)/1e3;if(h.type==="applybuff")(s[g]??=[]).push([y,null]);else if(h.type==="removebuff"){for(let C=(s[g]?.length??0)-1;C>=0;C--)if(s[g][C][1]===null){s[g][C][1]=y;break}}}let f=(h,g)=>l.reduce((y,C)=>{let A=r(C.timestamp)/1e3;return A>=h&&A<=g?y+Nt(C):y},0),p=(a-o)/1e3;return t.map(h=>{let g=h.spell_id,y=xs(g,s[g]||[],i,f,r,o,a,p),C=y.map(P=>P.start_s).sort((P,K)=>P-K),A={name:h.name,spell_id:g,cooldown:h.cooldown,uses:y.length,cast_times_s:C,windows:y};return h.talent_gated&&(A.talent_gated=true),A})}function ws(t,i,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;let o=e.avg_gap_s;for(let a=1;a<i.length;a++){let r=i[a]-i[a-1];zD(r,o,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:Math.round(i[a]*1e3),measured:{value:`${r.toFixed(0)}s`,unit:`avg ${o.toFixed(0)}s`},message:`${t} at ${XD(i[a])}: ${r.toFixed(0)}s gap, top ${o.toFixed(0)}s.`,details:{remedy:`Use ${t} sooner after it resets.`}});}return n}function Cs(t,i,e){let n=[];for(let[o,a]of Object.entries(e)){let r=parseInt(o,10)-1;if(r>=i.length)continue;let l=i[r];l<a.target_s-a.stddev_s&&n.push({severity:"info",category:"hold_suggestion",timestamp_ms:Math.round(l*1e3),measured:{value:XD(l),unit:`top ~${XD(a.target_s)}`},message:`${t} use ${o} at ${XD(l)}. ${a.count}/${a.total_samples} top parses hold to ${XD(a.target_s)}.`,details:{remedy:`Hold ${t} to ${XD(a.target_s)}.`,cd_name:t}});}return n}function Ss(t,i,e){let{name:n,uses:o,cast_times_s:a}=t;if(t.talent_gated&&o===0)return [];if(!i)return o>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n}: ${o} uses (no bench data).`}]:[];let{expected:r,floor:l}=YD(e,i.uses_per_min),s=[];o===0&&r>=1?s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`0 / ${r}`,unit:"use(s)"},message:`${n} unused. Expected ${r} on a ${XD(e)} fight.`,details:{remedy:`Use ${n} ${r}x this fight.`}}):o>0&&o<l&&s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`${o} / ${r}`,unit:"use(s)"},message:`${n}: ${o} uses, expected ${r}. ${l-o} lost.`,details:{remedy:`Use ${n} ${l-o}x more.`}});let f=[];if(a?.length){let h=a[0];zD(h,i.avg_first_cast_s,i.stddev_first_cast_s)&&s.push({severity:"warning",category:"cooldown_delay",cd_name:n,timestamp_ms:Math.round(h*1e3),measured:{value:`+${(h-i.avg_first_cast_s).toFixed(0)}s`,unit:`top ${XD(i.avg_first_cast_s)}`},message:`${n} first used at ${XD(h)}, ${(h-i.avg_first_cast_s).toFixed(0)}s late. Top: ${XD(i.avg_first_cast_s)}.`,details:{remedy:`Use ${n} earlier.`}}),s.push(...ws(n,a,i)),f.push(...Cs(n,a,i.hold_targets));}let p=s.length?s:o>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n} - ${o}/${r} uses.`}]:[];return o>0&&p.push(...f),p}function Ms(t,i,e){let n=[];for(let o of t)n.push(...Ss(o,i[o.name],e));return ZD(n),n}function ks(t,i,e){let n=i.filter(o=>o.timestamp>=e&&Nt(o)>0).sort((o,a)=>o.timestamp-a.timestamp);return t.map(o=>{let a=p=>p>=o.time_s&&p<o.time_s+o.window_length_s,r=n.filter(p=>a((p.timestamp-e)/1e3)),l=r.reduce((p,h)=>p+Nt(h),0),s={};for(let p of r)p.abilityGameID&&(s[p.abilityGameID]=(s[p.abilityGameID]||0)+Nt(p));let f=Object.entries(s).sort((p,h)=>h[1]-p[1]).slice(0,6).map(([p,h])=>({spell_id:parseInt(p,10),damage:Math.round(h)}));return {time_s:o.time_s,window_damage:Math.round(l),ability_breakdown:f}})}var Po=3;function Fo(t,i,e=Po){if(!i)return  false;let n=t.time_s-e,o=t.time_s+t.window_length_s+e;return i.windows.some(a=>a.start_s<=o&&a.end_s>=n)}function Ts(t,i,e=Po){if(!i)return  false;let n=t.time_s-e,o=t.time_s+t.window_length_s+e,a=i.windows.filter(r=>r.start_s<=o&&r.end_s>=n);return a.length?Math.max(...a.map(r=>r.dmg_during))>=t.dmg_min:false}function Es(t,i,e,n,o,a,r){return o?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:a?r?{status:"good",icon:"check_circle"}:t>e+n?{status:"warn",icon:"warning_amber"}:i>0&&t>i+n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}:{status:"bad",icon:"error"}}function Ds(t,i,e){let n={};for(let o of i?.ability_breakdown??[])n[o.spell_id]=o;return t.map(o=>({spellId:o.spell_id,label:e[o.spell_id].name,icon:e[o.spell_id].icon,playerPct:n[o.spell_id]?.damage??null,topAvg:o.avg_damage,topMin:o.min_damage,topMax:o.max_damage}))}function Is(t,i){let e=t.defensive_name??t.common_defensives?.[0]??"Defensive";return {timeS:t.time_s,label:e,spells:QD(t.spell_id!=null?[t.spell_id]:[],i),refGameId:t.ref_game_id??null}}function Rs({topWindows:t,playerWindows:i,playerDefensives:e,fightDurationS:n,abilities:o}){let a=[],r=[];return t.forEach((l,s)=>{let f=l.time_s>n,p=f?null:i[s]??null,h=p?.window_damage??null,g=l.defensive_name??l.common_defensives?.[0]??"",y=e.find(Te=>Te.name===g),C=Fo(l,y),A=Ts(l,y),{status:P,icon:K}=Es(h,l.dmg_avg,l.dmg_max,l.dmg_stddev,f,C,A),Ne=l.spell_id==null&&g?[g]:[];a.push({timeStartS:l.time_s,timeEndS:l.time_s+l.window_length_s,spells:QD(l.spell_id!=null?[l.spell_id]:[],o),labels:Ne,status:P,statusIcon:K,overview:{label:"",icon:"",playerPct:h,topAvg:l.dmg_avg,topMin:l.dmg_min,topMax:l.dmg_max},detailRows:Ds(l.ability_breakdown,p,o)}),r.push(Is(l,o));}),{windows:a,anchors:r}}function Ps(t,i,e){let n=[];for(let o of t){if(o.time_s>e)continue;let a=o.defensive_name??o.common_defensives?.[0]??"";if(!a)continue;let r=i.find(l=>l.name===a);r?.talent_gated&&r.uses===0||Fo(o,r)||n.push({severity:"warning",category:"defensive_window",cd_name:a,timestamp_ms:Math.round(o.time_s*1e3),measured:{value:"none",unit:"mitigated"},message:`${a} window at ${XD(o.time_s)} uncovered. Top parses mitigate here.`,details:{remedy:`Use ${a} at ${XD(o.time_s)}.`}});}return n}function Fs(t){if(!t?.defensives?.length)return [];let i=t.per_defensive_benchmarks??{},e=t.defensive_windows??[];return t.defensives.map(n=>{let o=i[n.name],a=e.filter(l=>(l.defensive_name??l.common_defensives?.[0])===n.name).map(l=>l.time_s).sort((l,s)=>l-s),r=o?.majority_hold&&o.hold_targets?Object.entries(o.hold_targets).sort((l,s)=>Number(l[0])-Number(s[0])).map(([l,s])=>({castIndex:Number(l),targetS:s.target_s})):[];return {name:n.name,spellId:n.spell_id??null,icon:t.ability_icons[n.spell_id].icon,uses:o?.avg_uses??null,firstCastS:o?.avg_first_cast_s??null,windowsS:a,holds:r,rule:n.usage_rule??null}}).filter(n=>n.uses!=null||n.firstCastS!=null||n.windowsS.length||n.holds.length||n.rule)}var Ro=class t{source=T(Jy);wclApi=T(pa$1);async loadAnalysisView(i,e,n,o,a){let r=await this.source.getBench(i,e);if(!r)return {findings:[],spellIdsByName:{},iconByName:{},windows:[],anchors:[]};try{let s=(await this.wclApi.getReport(n)).fights.find(Xe=>Xe.id===o);if(!s)return {findings:[],spellIdsByName:r.cd_spell_ids,iconByName:{},windows:[],anchors:[]};let f=s.startTime,p=s.endTime,h=(p-f)/1e3,[g,y,C]=await Promise.all([this.wclApi.getAllEvents(n,o,"Casts",f,p,a),this.wclApi.getAllEvents(n,o,"Buffs",f,p,a),this.wclApi.getAllEvents(n,o,"DamageTaken",f,p,a)]),A=ys(r.defensives,g,y,C,f,p),P=r.defensives.length&&A.length?Ms(A,r.per_defensive_benchmarks,h):[];P.push(...Ps(r.defensive_windows,A,h)),ZD(P);let K=ks(r.defensive_windows,C,f),Ne={};for(let[Xe,Lt]of Object.entries(r.cd_spell_ids))Ne[Xe]=r.ability_icons[Lt].icon;let{windows:Te,anchors:Bt}=Rs({topWindows:r.defensive_windows,playerWindows:K,playerDefensives:A,fightDurationS:h,abilities:r.ability_icons});return {findings:P,spellIdsByName:r.cd_spell_ids,iconByName:Ne,windows:Te,anchors:Bt}}catch(l){return J_(`DefensiveFeatureService.loadAnalysisView ${n}:${o}`,l),{findings:[],spellIdsByName:r.cd_spell_ids,iconByName:{},windows:[],anchors:[]}}}async loadPlan(i,e){let n=await this.source.getBench(i,e);return Fs(n)}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};
export{Bi as B,It as I,Ni as N,Pi as P,Ro as R,So as S,Ue as U,Xt as X,Ye as Y,_o as _,oc as a,yo as b,ao as c,bo as d,xo as e,St as f,go as g,ho as h,io as i,ji as j,Yt as k,ko as l,be as m,nt as n,oa as o,pc as p,qe as q,kt as r,uc as u,xt as x,yt as y,zi as z};