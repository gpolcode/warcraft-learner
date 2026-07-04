import {W as x,T,b1 as Uv,b2 as jv,b3 as ua$1,aZ as H_,s as se,b4 as $v,b5 as me,x as xo$1,V as V_,y as VE,L as Ll$1,b6 as Rp,J,z as yr$1,av as AF,C as V,P as Ut,H as Me,aN as NF,I as ID,b7 as SF,Z as Wg,X as ee,aw as Ce,b8 as mt,A as Au,b9 as Qh,r as re,ba as Gh,ao as Xt$1,bb as Zh,D as Dh,bc as PF,h as FE,bd as Aa$1,aB as MI,be as rp,i as si,m as mp,k as sI,aC as NI,j as bc,l as rv,a9 as bp,q as aI,w as lD,aP as Dp,aJ as Ep,aQ as RI,aK as xI,aL as AI,bf as Ip,bg as vp,a4 as $E,a7 as hp,bh as wd,bi as $s$1,bj as $t,O as $v$1,G as ct,bk as jl$1,_ as Li$1,bl as Sh,f as Th,ax as Be,a1 as ml$1,a2 as Dl$1,az as Bp,bm as vr$1,bn as cr$1,bo as en$1,bp as Wn,bq as pr$1,br as Qi$1,bs as G,bt as Dd,a5 as im,a6 as kF,aH as OF,aU as Iu,u as up,aD as kI,a8 as cp,n as lp,ar as fe,ay as Ts$1,bu as hs$1,a3 as Ys,bv as Ov,aA as r_,aa as MF,bw as hh,ab as _F,ad as ub,ae as db,t as tD,N as N_,ac as ed,bx as UE,by as W_,bz as $_,bA as En,bB as Nh,bC as Ne,bD as W$1,bE as dp,bF as _c,bG as Mc,ah as bI,at as mr$1,bH as ks$1,bI as Nv,bJ as gr$1,aj as Ap,aM as xc,bK as $l$1,bL as Du,bM as pp,bN as Cp,aI as WI,bO as Yv,bP as Kv,ag as uI,ai as dI,bQ as Qv,bR as ny,bS as Pe,bT as ky,af as yI,aR as pD,aS as gD,U,$,bU as M,bV as El$1,bW as Rp$1,aV as cI,bX as yD,ak as au,al as cu,bY as tf,bZ as lI,aT as kp}from'./main-AUB43LOS.js';var Xt=class{_box;_destroyed=new ee;_resizeSubject=new ee;_resizeObserver;_elementObservables=new Map;constructor(i){this._box=i,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(i){return this._elementObservables.has(i)||this._elementObservables.set(i,new M(e=>{let n=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(i,{box:this._box}),()=>{this._resizeObserver?.unobserve(i),n.unsubscribe(),this._elementObservables.delete(i);}}).pipe(Xt$1(e=>e.some(n=>n.target===i)),El$1({bufferSize:1,refCount:true}),Zh(this._destroyed))),this._elementObservables.get(i)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},hi=(()=>{class t{_cleanupErrorListener;_observers=new Map;_ngZone=T(Me);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,n){let r=n?.box||"content-box";return this._observers.has(r)||this._observers.set(r,new Xt(r)),this._observers.get(r).observe(e)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=mr$1({token:t,factory:t.\u0275fac})}return t})();var Yr=["notch"],Xr=["*"],gi=["iconPrefixContainer"],_i=["textPrefixContainer"],bi=["iconSuffixContainer"],vi=["textSuffixContainer"],Zr=["textField"],Jr=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],eo=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function to(t,i){t&1&&up(0,"span",21);}function no(t,i){if(t&1&&(si(0,"label",20),NI(1,1),sI(2,to,1,0,"span",21),bc()),t&2){let e=bI(2);lp("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),cp("for",e._control.disableAutomaticLabeling?null:e._control.id),rv(2),aI(!e.hideRequiredMarker&&e._control.required?2:-1);}}function io(t,i){if(t&1&&sI(0,no,3,5,"label",20),t&2){let e=bI();aI(e._hasFloatingLabel()?0:-1);}}function ro(t,i){t&1&&up(0,"div",7);}function oo(t,i){}function ao(t,i){if(t&1&&rp(0,oo,0,0,"ng-template",13),t&2){bI(2);let e=kI(1);lp("ngTemplateOutlet",e);}}function lo(t,i){if(t&1&&(si(0,"div",9),sI(1,ao,1,1,null,13),bc()),t&2){let e=bI();lp("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),rv(),aI(e._forceDisplayInfixLabel()?-1:1);}}function so(t,i){t&1&&(si(0,"div",10,2),NI(2,2),bc());}function co(t,i){t&1&&(si(0,"div",11,3),NI(2,3),bc());}function mo(t,i){}function po(t,i){if(t&1&&rp(0,mo,0,0,"ng-template",13),t&2){bI();let e=kI(1);lp("ngTemplateOutlet",e);}}function uo(t,i){t&1&&(si(0,"div",14,4),NI(2,4),bc());}function fo(t,i){t&1&&(si(0,"div",15,5),NI(2,5),bc());}function ho(t,i){t&1&&up(0,"div",16);}function go(t,i){t&1&&(si(0,"div",18),NI(1,6),bc());}function _o(t,i){if(t&1&&(si(0,"mat-hint",22),tD(1),bc()),t&2){let e=bI(2);lp("id",e._hintLabelId),rv(),Ap(e.hintLabel);}}function bo(t,i){if(t&1&&(si(0,"div",19),sI(1,_o,2,2,"mat-hint",22),NI(2,7),up(3,"div",23),NI(4,8),bc()),t&2){let e=bI();rv(),aI(e.hintLabel?1:-1);}}var Je=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-label"]]})}return t})(),Jt=new x("MatError"),vo=(()=>{class t{id=T(Ut).getId("mat-mdc-error-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-error"],["","matError",""]],hostAttrs:[1,"mat-mdc-form-field-error","mat-mdc-form-field-bottom-align"],hostVars:1,hostBindings:function(n,r){n&2&&hp("id",r.id);},inputs:{id:"id"},features:[lD([{provide:Jt,useExisting:t}])]})}return t})(),Zt=(()=>{class t{align="start";id=T(Ut).getId("mat-mdc-hint-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(n,r){n&2&&(hp("id",r.id),cp("align",null),bp("mat-mdc-form-field-hint-end",r.align==="end"));},inputs:{align:"align",id:"id"}})}return t})(),Di=new x("MatPrefix");var Ii=new x("MatSuffix");var Ti=new x("FloatingLabelParent"),yi=(()=>{class t{_elementRef=T(yr$1);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=T(hi);_ngZone=T(Me);_parent=T(Ti);_resizeSubscription=new W$1;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return yo(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(n,r){n&2&&bp("mdc-floating-label--float-above",r.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return t})();function yo(t){let i=t;if(i.offsetParent!==null)return i.scrollWidth;let e=i.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let n=e.scrollWidth;return e.remove(),n}var xi="mdc-line-ripple--active",gt="mdc-line-ripple--deactivating",wi=(()=>{class t{_elementRef=T(yr$1);_cleanupTransitionEnd;constructor(){let e=T(Me),n=T($v$1);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=n.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(gt),e.add(xi);}deactivate(){this._elementRef.nativeElement.classList.add(gt);}_handleTransitionEnd=e=>{let n=this._elementRef.nativeElement.classList,r=n.contains(gt);e.propertyName==="opacity"&&r&&n.remove(xi,gt);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return t})(),Ci=(()=>{class t{_elementRef=T(yr$1);_ngZone=T(Me);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,n=e.querySelector(".mdc-floating-label");n?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(n.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>n.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let n=this._notch.nativeElement;!this.open||!e?n.style.width="":n.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(n,r){if(n&1&&Ep(Yr,5),n&2){let o;xI(o=AI())&&(r._notch=o.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(n,r){n&2&&bp("mdc-notched-outline--notched",r.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:Xr,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(n,r){n&1&&(MI(),dp(0,"div",1),_c(1,"div",2,0),NI(3),Mc(),dp(4,"div",3));},encapsulation:2})}return t})(),_t=(()=>{class t{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t})}return t})();var bt=new x("MatFormField"),ki=new x("MAT_FORM_FIELD_DEFAULT_OPTIONS"),Si="fill",xo="auto",Mi="fixed",wo="translateY(-50%)",vt=(()=>{class t{_elementRef=T(yr$1);_changeDetectorRef=T(AF);_platform=T(V);_idGenerator=T(Ut);_ngZone=T(Me);_defaults=T(ki,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=NF("iconPrefixContainer");_textPrefixContainerSignal=NF("textPrefixContainer");_iconSuffixContainerSignal=NF("iconSuffixContainer");_textSuffixContainerSignal=NF("textSuffixContainer");_prefixSuffixContainers=ID(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=SF(Je);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=Wg(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||xo}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let n=e||this._defaults?.appearance||Si;this._appearanceSignal.set(n);}_appearanceSignal=xo$1(Si);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||Mi}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||Mi;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ee;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=Ce();constructor(){let e=this._defaults,n=T(mt);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),Au(()=>this._currentDirection=n.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=ID(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let n=this._control,r="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(r+e.controlType),n.controlType&&this._elementRef.nativeElement.classList.add(r+n.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=n.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=n.stateChanges.pipe(Qh([void 0,void 0]),re(()=>[n.errorState,n.userAriaDescribedBy]),Gh(),Xt$1(([[o,a],[l,s]])=>o!==l||a!==s)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),n.ngControl&&n.ngControl.valueChanges&&(this._valueChanges=n.ngControl.valueChanges.pipe(Zh(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),Dh(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){PF({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=ID(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let n=this._control?this._control.ngControl:null;return n&&n[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let o=this._hintChildren?this._hintChildren.find(l=>l.align==="start"):null,a=this._hintChildren?this._hintChildren.find(l=>l.align==="end"):null;o?e.push(o.id):this._hintLabel&&e.push(this._hintLabelId),a&&e.push(a.id);}else this._errorChildren&&e.push(...this._errorChildren.map(o=>o.id));let n=this._control.describedByIds,r;if(n){let o=this._describedByIds||e;r=e.concat(n.filter(a=>a&&!o.includes(a)));}else r=e;this._control.setDescribedByIds(r),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,n=this._textPrefixContainer?.nativeElement,r=this._iconSuffixContainer?.nativeElement,o=this._textSuffixContainer?.nativeElement,a=e?.getBoundingClientRect().width??0,l=n?.getBoundingClientRect().width??0,s=r?.getBoundingClientRect().width??0,p=o?.getBoundingClientRect().width??0,u=this._currentDirection==="rtl"?"-1":"1",h=`${a+l}px`,x=`calc(${u} * (${h} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,w=`var(--mat-mdc-form-field-label-transform, ${wo} translateX(${x}))`,E=a+l+s+p;return [w,E]}_writeOutlinedLabelStyles(e){if(e!==null){let[n,r]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=n),r!==null&&this._notchedOutline?._setMaxWidth(r);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let n=e.getRootNode();return n&&n!==e}return document.documentElement.contains(e)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-form-field"]],contentQueries:function(n,r,o){if(n&1&&(Ip(o,r._labelChild,Je,5),vp(o,_t,5)(o,Di,5)(o,Ii,5)(o,Jt,5)(o,Zt,5)),n&2){RI();let a;xI(a=AI())&&(r._formFieldControl=a.first),xI(a=AI())&&(r._prefixChildren=a),xI(a=AI())&&(r._suffixChildren=a),xI(a=AI())&&(r._errorChildren=a),xI(a=AI())&&(r._hintChildren=a);}},viewQuery:function(n,r){if(n&1&&(Dp(r._iconPrefixContainerSignal,gi,5)(r._textPrefixContainerSignal,_i,5)(r._iconSuffixContainerSignal,bi,5)(r._textSuffixContainerSignal,vi,5),Ep(Zr,5)(gi,5)(_i,5)(bi,5)(vi,5)(yi,5)(Ci,5)(wi,5)),n&2){RI(4);let o;xI(o=AI())&&(r._textField=o.first),xI(o=AI())&&(r._iconPrefixContainer=o.first),xI(o=AI())&&(r._textPrefixContainer=o.first),xI(o=AI())&&(r._iconSuffixContainer=o.first),xI(o=AI())&&(r._textSuffixContainer=o.first),xI(o=AI())&&(r._floatingLabel=o.first),xI(o=AI())&&(r._notchedOutline=o.first),xI(o=AI())&&(r._lineRipple=o.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(n,r){n&2&&bp("mat-mdc-form-field-label-always-float",r._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",r._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",r._hasIconSuffix)("mat-form-field-invalid",r._control.errorState)("mat-form-field-disabled",r._control.disabled)("mat-form-field-autofilled",r._control.autofilled)("mat-form-field-appearance-fill",r.appearance=="fill")("mat-form-field-appearance-outline",r.appearance=="outline")("mat-form-field-hide-placeholder",r._hasFloatingLabel()&&!r._shouldLabelFloat())("mat-primary",r.color!=="accent"&&r.color!=="warn")("mat-accent",r.color==="accent")("mat-warn",r.color==="warn")("ng-untouched",r._shouldForward("untouched"))("ng-touched",r._shouldForward("touched"))("ng-pristine",r._shouldForward("pristine"))("ng-dirty",r._shouldForward("dirty"))("ng-valid",r._shouldForward("valid"))("ng-invalid",r._shouldForward("invalid"))("ng-pending",r._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[lD([{provide:bt,useExisting:t},{provide:Ti,useExisting:t}])],ngContentSelectors:eo,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(n,r){if(n&1&&(MI(Jr),rp(0,io,1,1,"ng-template",null,0,yD),si(2,"div",6,1),mp("click",function(a){return r._control.onContainerClick(a)}),sI(4,ro,1,0,"div",7),si(5,"div",8),sI(6,lo,2,2,"div",9),sI(7,so,3,0,"div",10),sI(8,co,3,0,"div",11),si(9,"div",12),sI(10,po,1,1,null,13),NI(11),bc(),sI(12,uo,3,0,"div",14),sI(13,fo,3,0,"div",15),bc(),sI(14,ho,1,0,"div",16),bc(),si(15,"div",17),sI(16,go,2,0,"div",18)(17,bo,5,1,"div",19),bc()),n&2){let o;rv(2),bp("mdc-text-field--filled",!r._hasOutline())("mdc-text-field--outlined",r._hasOutline())("mdc-text-field--no-label",!r._hasFloatingLabel())("mdc-text-field--disabled",r._control.disabled)("mdc-text-field--invalid",r._control.errorState),rv(2),aI(!r._hasOutline()&&!r._control.disabled?4:-1),rv(2),aI(r._hasOutline()?6:-1),rv(),aI(r._hasIconPrefix?7:-1),rv(),aI(r._hasTextPrefix?8:-1),rv(2),aI(!r._hasOutline()||r._forceDisplayInfixLabel()?10:-1),rv(2),aI(r._hasTextSuffix?12:-1),rv(),aI(r._hasIconSuffix?13:-1),rv(),aI(r._hasOutline()?-1:14),rv(),bp("mat-mdc-form-field-subscript-dynamic-size",r.subscriptSizing==="dynamic");let a=r._getSubscriptMessageType();rv(),aI((o=a)==="error"?16:o==="hint"?17:-1);}},dependencies:[yi,Ci,Aa$1,wi,Zt],styles:[`.mdc-text-field {
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
`],encapsulation:2})}return t})();var yt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Ll$1({imports:[Rp,vt,J]})}return t})();var So=["text"],Mo=[[["mat-icon"]],"*"],Do=["mat-icon","*"];function Io(t,i){if(t&1&&up(0,"mat-pseudo-checkbox",1),t&2){let e=bI();lp("disabled",e.disabled)("state",e.selected?"checked":"unchecked");}}function To(t,i){if(t&1&&up(0,"mat-pseudo-checkbox",3),t&2){let e=bI();lp("disabled",e.disabled);}}function ko(t,i){if(t&1&&(si(0,"span",4),tD(1),bc()),t&2){let e=bI();rv(),xc("(",e.group.label,")");}}var tn=new x("MAT_OPTION_PARENT_COMPONENT"),nn=new x("MatOptgroup");var en=class{source;isUserInput;constructor(i,e=false){this.source=i,this.isUserInput=e;}},$e=(()=>{class t{_element=T(yr$1);_changeDetectorRef=T(AF);_parent=T(tn,{optional:true});group=T(nn,{optional:true});_signalDisableRipple=false;_selected=false;_active=false;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=T(Ut).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=xo$1(false);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return !!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new Be;_text;_stateChanges=new ee;constructor(){let e=T(fe);e.load(Ts$1),e.load(hs$1),this._signalDisableRipple=!!this._parent&&Ys(this._parent.disableRipple);}get active(){return this._active}get viewValue(){return (this._text?.nativeElement.textContent||"").trim()}select(e=true){this._selected||(this._selected=true,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}deselect(e=true){this._selected&&(this._selected=false,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}focus(e,n){let r=this._getHostElement();typeof r.focus=="function"&&r.focus(n);}setActiveStyles(){this._active||(this._active=true,this._changeDetectorRef.markForCheck());}setInactiveStyles(){this._active&&(this._active=false,this._changeDetectorRef.markForCheck());}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!Wn(e)&&(this._selectViaInteraction(),e.preventDefault());}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:true,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(true));}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e);}}ngOnDestroy(){this._stateChanges.complete();}_emitSelectionChangeEvent(e=false){this.onSelectionChange.emit(new en(this,e));}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-option"]],viewQuery:function(n,r){if(n&1&&Ep(So,7),n&2){let o;xI(o=AI())&&(r._text=o.first);}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(n,r){n&1&&mp("click",function(){return r._selectViaInteraction()})("keydown",function(a){return r._handleKeydown(a)}),n&2&&(hp("id",r.id),cp("aria-selected",r.selected)("aria-disabled",r.disabled.toString()),bp("mdc-list-item--selected",r.selected)("mat-mdc-option-multiple",r.multiple)("mat-mdc-option-active",r.active)("mdc-list-item--disabled",r.disabled));},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",kF]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:Do,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(n,r){n&1&&(MI(Mo),sI(0,Io,1,2,"mat-pseudo-checkbox",1),NI(1),si(2,"span",2,0),NI(4,1),bc(),sI(5,To,1,1,"mat-pseudo-checkbox",3),sI(6,ko,2,1,"span",4),up(7,"div",5)),n&2&&(aI(r.multiple?0:-1),rv(5),aI(!r.multiple&&r.selected&&!r.hideSingleSelectionIndicator?5:-1),rv(),aI(r.group&&r.group._inert?6:-1),rv(),lp("matRippleTrigger",r._getHostElement())("matRippleDisabled",r.disabled||r.disableRipple));},dependencies:[Ov,r_],styles:[`.mat-mdc-option {
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
`],encapsulation:2})}return t})();function Ei(t,i,e){if(e.length){let n=i.toArray(),r=e.toArray(),o=0;for(let a=0;a<t+1;a++)n[a].group&&n[a].group===r[o]&&o++;return o}return 0}function Ri(t,i,e,n){return t<e?t:t+i>e+n?Math.max(0,t-n+i):e}var Pi=(()=>{class t{isErrorState(e,n){return !!(e&&e.invalid&&(e.touched||n&&n.submitted))}static \u0275fac=function(n){return new(n||t)};static \u0275prov=mr$1({token:t,factory:t.\u0275fac})}return t})();var Ct=class{_defaultMatcher;ngControl;_parentFormGroup;_parentForm;_stateChanges;errorState=false;matcher;constructor(i,e,n,r,o){this._defaultMatcher=i,this.ngControl=e,this._parentFormGroup=n,this._parentForm=r,this._stateChanges=o;}updateErrorState(){let i=this.errorState,e=this._parentFormGroup||this._parentForm,n=this.matcher||this._defaultMatcher,r=this.ngControl?this.ngControl.control:null,o=n?.isErrorState(r,e)??false;o!==i&&(this.errorState=o,this._stateChanges.next());}};var rn=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Ll$1({imports:[ks$1,Nv,$e,J]})}return t})();var Ao=["trigger"],Oo=["panel"],No=[[["mat-select-trigger"]],"*"],Wo=["mat-select-trigger","*"];function Lo(t,i){if(t&1&&(si(0,"span",4),tD(1),bc()),t&2){let e=bI();rv(),Ap(e.placeholder);}}function Bo(t,i){t&1&&NI(0);}function $o(t,i){if(t&1&&(si(0,"span",11),tD(1),bc()),t&2){let e=bI(2);rv(),Ap(e.triggerValue);}}function zo(t,i){if(t&1&&(si(0,"span",5),sI(1,Bo,1,0)(2,$o,2,1,"span",11),bc()),t&2){let e=bI();rv(),aI(e.customTrigger?1:2);}}function Go(t,i){if(t&1){let e=yI();si(0,"div",12,1),mp("keydown",function(r){au(e);let o=bI();return cu(o._handleKeydown(r))}),NI(2,1),bc();}if(t&2){let e=bI();WI(e.panelClass),bp("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),cp("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Vo=new x("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let t=T(me);return ()=>gr$1(t)}}),jo=new x("MAT_SELECT_CONFIG"),Oi=new x("MatSelectTrigger"),on=class{source;value;constructor(i,e){this.source=i,this.value=e;}},Ni=(()=>{class t{_viewportRuler=T($t);_changeDetectorRef=T(AF);_elementRef=T(yr$1);_dir=T(mt,{optional:true});_idGenerator=T(Ut);_renderer=T($v$1);_parentFormField=T(bt,{optional:true});ngControl=T(ct,{self:true,optional:true});_liveAnnouncer=T(jl$1);_defaultOptions=T(jo,{optional:true});_animationsDisabled=Ce();_popoverLocation;_initialized=new ee;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let n=this.options.toArray()[e];if(n){let r=this.panel.nativeElement,o=Ei(e,this.options,this.optionGroups),a=n._getHostElement();e===0&&o===1?r.scrollTop=0:r.scrollTop=Ri(a.offsetTop,a.offsetHeight,r.scrollTop,r.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new on(this,e)}_scrollStrategyFactory=T(Vo);_panelOpen=false;_compareWith=(e,n)=>e===n;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ee;_errorStateTracker;stateChanges=new ee;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=xo$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(Li$1.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=Sh(()=>{let e=this.options;return e?e.changes.pipe(Qh(e),Th(()=>Dh(...e.map(n=>n.onSelectionChange)))):this._initialized.pipe(Th(()=>this.optionSelectionChanges))});openedChange=new Be;_openedStream=this.openedChange.pipe(Xt$1(e=>e),re(()=>{}));_closedStream=this.openedChange.pipe(Xt$1(e=>!e),re(()=>{}));selectionChange=new Be;valueChange=new Be;constructor(){let e=T(Pi),n=T(ml$1,{optional:true}),r=T(Dl$1,{optional:true}),o=T(new Bp("tabindex"),{optional:true}),a=T(vr$1,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new Ct(e,this.ngControl,r,n,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=o==null?0:parseInt(o)||0,this._popoverLocation=a?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new cr$1(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(Zh(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(Zh(this._destroy)).subscribe(e=>{e.added.forEach(n=>n.select()),e.removed.forEach(n=>n.deselect());}),this.options.changes.pipe(Qh(null),Zh(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),n=this.ngControl;if(e!==this._triggerAriaLabelledBy){let r=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?r.setAttribute("aria-labelledby",e):r.removeAttribute("aria-labelledby");}n&&(this._previousControl!==n.control&&(this._previousControl!==void 0&&n.disabled!==null&&n.disabled!==this.disabled&&(this.disabled=n.disabled),this._previousControl=n.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(en$1(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{n(),clearTimeout(r),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,n=this._renderer.listen(e,"animationend",o=>{o.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),r=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(n=>n.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let n=e.keyCode,r=n===40||n===38||n===37||n===39,o=n===13||n===32,a=this._keyManager;if(!a.isTyping()&&o&&!Wn(e)||(this.multiple||e.altKey)&&r)e.preventDefault(),this.open();else if(!this.multiple){let l=this.selected;a.onKeydown(e);let s=this.selected;s&&l!==s&&this._liveAnnouncer.announce(s.viewValue,1e4);}}_handleOpenKeydown(e){let n=this._keyManager,r=e.keyCode,o=r===40||r===38,a=n.isTyping();if(o&&e.altKey)e.preventDefault(),this.close();else if(!a&&(r===13||r===32)&&n.activeItem&&!Wn(e))e.preventDefault(),n.activeItem._selectViaInteraction();else if(!a&&this._multiple&&r===65&&e.ctrlKey){e.preventDefault();let l=this.options.some(s=>!s.disabled&&!s.selected);this.options.forEach(s=>{s.disabled||(l?s.select():s.deselect());});}else {let l=n.activeItemIndex;n.onKeydown(e),this._multiple&&o&&e.shiftKey&&n.activeItem&&n.activeItemIndex!==l&&n.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!Wn(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(n=>n.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(n=>this._selectOptionByValue(n)),this._sortValues();else {let n=this._selectOptionByValue(e);n?this._keyManager.updateActiveItem(n):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let n=this.options.find(r=>{if(this._selectionModel.isSelected(r))return  false;try{return (r.value!=null||this.canSelectNullableOptions)&&this._compareWith(r.value,e)}catch{return  false}});return n&&this._selectionModel.select(n),n}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof pr$1?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new Qi$1(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=Dh(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Zh(e)).subscribe(n=>{this._onSelect(n.source,n.isUserInput),n.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),Dh(...this.options.map(n=>n._stateChanges)).pipe(Zh(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,n){let r=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(r!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),n&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),n&&this.focus())),r!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((n,r)=>this.sortComparator?this.sortComparator(n,r,e):e.indexOf(n)-e.indexOf(r)),this.stateChanges.next();}}_propagateChanges(e){let n;this.multiple?n=this.selected.map(r=>r.value):n=this.selected?this.selected.value:e,this._value=n,this.valueChange.emit(n),this._onChange(n),this.selectionChange.emit(this._getChangeEvent(n)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let n=0;n<this.options.length;n++)if(!this.options.get(n).disabled){e=n;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,n=e?e+" ":"";return this.ariaLabelledby?n+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let n=this._elementRef.nativeElement;e.length?n.setAttribute("aria-describedby",e.join(" ")):n.removeAttribute("aria-describedby");}onContainerClick(e){let n=G(e);n&&(n.tagName==="MAT-OPTION"||n.classList.contains("cdk-overlay-backdrop")||n.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-select"]],contentQueries:function(n,r,o){if(n&1&&vp(o,Oi,5)(o,$e,5)(o,nn,5),n&2){let a;xI(a=AI())&&(r.customTrigger=a.first),xI(a=AI())&&(r.options=a),xI(a=AI())&&(r.optionGroups=a);}},viewQuery:function(n,r){if(n&1&&Ep(Ao,5)(Oo,5)(Dd,5),n&2){let o;xI(o=AI())&&(r.trigger=o.first),xI(o=AI())&&(r.panel=o.first),xI(o=AI())&&(r._overlayDir=o.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(n,r){n&1&&mp("keydown",function(a){return r._handleKeydown(a)})("focus",function(){return r._onFocus()})("blur",function(){return r._onBlur()}),n&2&&(cp("id",r.id)("tabindex",r.disabled?-1:r.tabIndex)("aria-controls",r.panelOpen?r.id+"-panel":null)("aria-expanded",r.panelOpen)("aria-label",r.ariaLabel||null)("aria-required",r.required.toString())("aria-disabled",r.disabled.toString())("aria-invalid",r.errorState)("aria-activedescendant",r._getAriaActiveDescendant()),bp("mat-mdc-select-disabled",r.disabled)("mat-mdc-select-invalid",r.errorState)("mat-mdc-select-required",r.required)("mat-mdc-select-empty",r.empty)("mat-mdc-select-multiple",r.multiple)("mat-select-open",r.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",kF],disableRipple:[2,"disableRipple","disableRipple",kF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:OF(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",kF],placeholder:"placeholder",required:[2,"required","required",kF],multiple:[2,"multiple","multiple",kF],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",kF],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",OF],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",kF]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[lD([{provide:_t,useExisting:t},{provide:tn,useExisting:t}]),im],ngContentSelectors:Wo,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(n,r){if(n&1&&(MI(No),si(0,"div",2,0),mp("click",function(){return r.open()}),si(3,"div",3),sI(4,Lo,2,1,"span",4)(5,zo,3,1,"span",5),bc(),si(6,"div",6)(7,"div",7),Iu(),si(8,"svg",8),up(9,"path",9),bc()()()(),rp(10,Go,3,16,"ng-template",10),mp("detach",function(){return r.close()})("backdropClick",function(){return r.close()})("overlayKeydown",function(a){return r._handleOverlayKeydown(a)})),n&2){let o=kI(1);rv(3),cp("id",r._valueId),rv(),aI(r.empty?4:5),rv(6),lp("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",r._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",r._scrollStrategy)("cdkConnectedOverlayOrigin",r._preferredOverlayOrigin||o)("cdkConnectedOverlayPositions",r._positions)("cdkConnectedOverlayWidth",r._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",r._popoverLocation);}},dependencies:[pr$1,Dd],styles:[`@keyframes _mat-select-enter {
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
`],encapsulation:2})}return t})(),hc=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=$E({type:t,selectors:[["mat-select-trigger"]],features:[lD([{provide:Oi,useExisting:t}])]})}return t})(),Wi=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Ll$1({imports:[wd,rn,J,$s$1,yt,rn]})}return t})();var Ho=["*"];var Qo=new x("MAT_CARD_CONFIG"),Cc=(()=>{class t{appearance;constructor(){let e=T(Qo,{optional:true});this.appearance=e?.appearance||"raised";}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-card"]],hostAttrs:[1,"mat-mdc-card","mdc-card"],hostVars:8,hostBindings:function(n,r){n&2&&bp("mat-mdc-card-outlined",r.appearance==="outlined")("mdc-card--outlined",r.appearance==="outlined")("mat-mdc-card-filled",r.appearance==="filled")("mdc-card--filled",r.appearance==="filled");},inputs:{appearance:"appearance"},exportAs:["matCard"],ngContentSelectors:Ho,decls:1,vars:0,template:function(n,r){n&1&&(MI(),NI(0));},styles:[`.mat-mdc-card {
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
`],encapsulation:2})}return t})();var Sc=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Ll$1({imports:[J]})}return t})();var Uo="https://www.warcraftlogs.com/oauth/token",an="wcl.token";function ln(){try{return globalThis.sessionStorage??null}catch{return null}}var Ko="a21cf850-4cf8-4591-b3e5-906aba0da145",Yo="ZYBFec16gC0CfwaunQjSAwUCQwEXTKOFo5JkwSze";function Xo(){let t=globalThis.process?.env;return {id:t?.WCL_CLIENT_ID||Ko,secret:t?.WCL_CLIENT_SECRET||Yo}}var St=class t{http=T(En);_token=null;_expiry=0;_inFlight=null;async getToken(){return this._token||this._hydrateFromStorage(),this._token&&Date.now()<this._expiry-6e4?this._token:this._inFlight?this._inFlight:(this._inFlight=this._fetchToken().finally(()=>{this._inFlight=null;}),this._inFlight)}_hydrateFromStorage(){let i=ln();if(i)try{let e=i.getItem(an);if(!e)return;let n=JSON.parse(e);typeof n?.token=="string"&&typeof n?.expiry=="number"&&(this._token=n.token,this._expiry=n.expiry);}catch(e){V_("WclAuthService._hydrateFromStorage",e);}}async _fetchToken(){let{id:i,secret:e}=Xo(),n=new URLSearchParams({grant_type:"client_credentials",client_id:i,client_secret:e}),r;try{r=await Nh(this.http.post(Uo,n.toString(),{headers:{"Content-Type":"application/x-www-form-urlencoded"}}));}catch(o){let a=o instanceof Ne?o.status:0,l=o instanceof Ne?typeof o.error=="string"?o.error:JSON.stringify(o.error):"";throw new Error(`WCL token request failed (${a}): ${l}`,{cause:o})}return this._token=r.access_token,this._expiry=Date.now()+(r.expires_in||3600)*1e3,this._persist(),this._token}_persist(){let i=ln();if(!(!i||!this._token))try{i.setItem(an,JSON.stringify({token:this._token,expiry:this._expiry}));}catch(e){V_("WclAuthService._persist",e);}}invalidate(){this._token=null,this._expiry=0;let i=ln();if(i)try{i.removeItem(an);}catch(e){V_("WclAuthService.invalidate",e);}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Mt=class t{active=xo$1(false);static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Li=`
query($code:String!){reportData{report(code:$code){
  title
  startTime
  fights(killType:All){id name startTime endTime kill encounterID difficulty friendlyPlayers}
  masterData{
    actors(type:"Player"){id name subType server}
    enemies:actors(type:"NPC"){id name gameID}
    abilities{gameID name icon}
  }
}}}`,Bi=`
query($code:String!,$fightIDs:[Int]!){
  reportData{report(code:$code){playerDetails(fightIDs:$fightIDs)}}
}`,$i=`
query($code:String!,$fightIDs:[Int]!,$dataType:EventDataType,$sourceID:Int,$startTime:Float,$endTime:Float,$includeResources:Boolean,$hostilityType:HostilityType){
  reportData{report(code:$code){
    events(fightIDs:$fightIDs,dataType:$dataType,sourceID:$sourceID,
           startTime:$startTime,endTime:$endTime,includeResources:$includeResources,hostilityType:$hostilityType,limit:10000){data nextPageTimestamp}
  }}
}`,zi=`
query($encounterID:Int!,$className:String!,$specName:String!){
  worldData{encounter(id:$encounterID){
    characterRankings(className:$className,specName:$specName,metric:dps)
  }}
}`,Gi=`
query($code:String!,$fightIDs:[Int]!,$sourceID:Int){
  reportData{report(code:$code){
    events(fightIDs:$fightIDs,dataType:CombatantInfo,sourceID:$sourceID){data}
  }}
}`;function Vi(t,i){return `query{gameData{${[...t.map(n=>`i${n}: item(id:${n}){id name}`),...i.map(n=>`e${n}: enchant(id:${n}){id name}`)].join(" ")}}}`}function ji(t){return `query{gameData{${t.map(e=>`a${e}: ability(id:${e}){id name icon}`).join(" ")}}}`}var te=class t{auth=T(St);transport=T(Uv);ingestMode=T(jv);liveMode=T(Mt);livePolicy(){return this.ingestMode||!this.liveMode.active()?"cache-first":"network-only"}async query(i,e={},n="cache-first"){let r=await this.auth.getToken();try{return await this.transport.query(i,e,r,n==="cache-first")}catch(o){throw o instanceof ua$1&&o.status===401?(this.auth.invalidate(),new Error("WCL API error (401) - token rejected.",{cause:o})):o instanceof ua$1?new Error(o.message,{cause:o}):o}}async getReport(i){let e={code:i};return (await this.query(Li,e,this.livePolicy())).reportData.report}async getPlayerDetails(i,e){let n={code:i,fightIDs:[e]};return (await this.query(Bi,n)).reportData.report.playerDetails.data.playerDetails}async getAllEvents(i,e,n,r,o,a,l=false,s){let p=[],u=r;for(;;){let h={code:i,fightIDs:[e],dataType:n,startTime:u,endTime:o};a!=null&&(h.sourceID=a),l&&(h.includeResources=true),s&&(h.hostilityType=s);let x=(await this.query($i,h,this.livePolicy())).reportData.report.events;if(p.push(...x.data??[]),!x.nextPageTimestamp)break;u=x.nextPageTimestamp;}return p}async getCombatantInfo(i,e,n){let r={code:i,fightIDs:[e],sourceID:n};return (await this.query(Gi,r))?.reportData?.report?.events?.data??[]}async getGameNames(i,e){return !i.length&&!e.length?{}:(await this.query(Vi(i,e)))?.gameData??{}}async getAbilities(i){let e=[...new Set(i)].filter(r=>r>0);return e.length?(await this.query(ji(e)))?.gameData??{}:{}}async getRankings(i,e){let n=H_(i);if(!n)return null;let r={encounterID:e,className:n.className,specName:n.specName};return (await this.query(zi,r))?.worldData?.encounter?.characterRankings??null}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Zo=["determinateSpinner"];function Jo(t,i){if(t&1&&(Iu(),si(0,"svg",11),up(1,"circle",12),bc()),t&2){let e=bI();cp("viewBox",e._viewBox()),rv(),Cp("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),cp("r",e._circleRadius());}}var ea=new x("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:qi})}),qi=100,ta=10,Hi=(()=>{class t{_elementRef=T(yr$1);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=T(ea),n=$l$1(),r=this._elementRef.nativeElement;this._noopAnimations=n==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=r.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&n==="reduced-motion"&&r.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=qi;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-ta)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=FE({type:t,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(n,r){if(n&1&&Ep(Zo,5),n&2){let o;xI(o=AI())&&(r._determinateCircle=o.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(n,r){n&2&&(cp("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",r.mode==="determinate"?r.value:null)("mode",r.mode),WI("mat-"+r.color),Cp("width",r.diameter,"px")("height",r.diameter,"px")("--mat-progress-spinner-size",r.diameter+"px")("--mat-progress-spinner-active-indicator-width",r.diameter+"px"),bp("_mat-animation-noopable",r._noopAnimations)("mdc-circular-progress--indeterminate",r.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",OF],diameter:[2,"diameter","diameter",OF],strokeWidth:[2,"strokeWidth","strokeWidth",OF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(n,r){if(n&1&&(rp(0,Jo,2,8,"ng-template",null,0,yD),si(2,"div",2,1),Iu(),si(4,"svg",3),up(5,"circle",4),bc()(),Du(),si(6,"div",5)(7,"div",6)(8,"div",7),pp(9,8),bc(),si(10,"div",9),pp(11,8),bc(),si(12,"div",10),pp(13,8),bc()()()),n&2){let o=kI(1);rv(4),cp("viewBox",r._viewBox()),rv(),Cp("stroke-dasharray",r._strokeCircumference(),"px")("stroke-dashoffset",r._strokeDashOffset(),"px")("stroke-width",r._circleStrokeWidth(),"%"),cp("r",r._circleRadius()),rv(4),lp("ngTemplateOutlet",o),rv(2),lp("ngTemplateOutlet",o),rv(2),lp("ngTemplateOutlet",o);}},dependencies:[Aa$1],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return t})();var Qi=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=VE({type:t});static \u0275inj=Ll$1({imports:[J]})}return t})();function ia(t,i){if(t&1&&(si(0,"span",2),tD(1),bc()),t&2){let e=bI();rv(),Ap(e.message());}}var Ui=class t{message=MF("");static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-loading-spinner"]],inputs:{message:[1,"message"]},decls:3,vars:2,consts:[[1,"flex","flex-col","items-center","gap-3","p-12","text-[var(--muted)]"],[3,"diameter"],[1,"text-sm"]],template:function(e,n){e&1&&(si(0,"div",0),up(1,"mat-spinner",1),sI(2,ia,2,1,"span",2),bc()),e&2&&(rv(),lp("diameter",36),rv(),aI(n.message()?2:-1));},dependencies:[Qi,Hi],encapsulation:2})};var ze=class t{transform(i){if(i==null)return "-";let e=Math.floor(i/60),n=Math.floor(i%60);return `${e}:${String(n).padStart(2,"0")}`}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatDuration",type:t,pure:true})};function ra(t,i){t&1&&up(0,"img",1),t&2&&lp("ngSrc",i)("width",18)("height",18);}var Se=class t{id=MF.required();kind=MF("spell");name=MF.required();icon=MF.required();iconUrl=ID(()=>{let i=this.icon().replace(/\.(jpg|jpeg|png|gif|webp)$/i,"");return i?`https://wow.zamimg.com/images/wow/icons/small/${i}.jpg`:null});wowheadUrl=ID(()=>`https://www.wowhead.com/${this.kind()}=${this.id()}`);static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-game-icon"]],hostAttrs:[1,"inline-flex","items-center"],inputs:{id:[1,"id"],kind:[1,"kind"],name:[1,"name"],icon:[1,"icon"]},decls:4,vars:3,consts:[["target","_blank","rel","noopener",1,"inline-flex","items-center","gap-1.5","no-underline","hover:brightness-125",3,"href"],["alt","",1,"rounded-sm",3,"ngSrc","width","height"],[1,"text-sm"]],template:function(e,n){if(e&1&&(si(0,"a",0),sI(1,ra,1,3,"img",1),si(2,"span",2),tD(3),bc()()),e&2){let r;lp("href",n.wowheadUrl(),tf),rv(),aI((r=n.iconUrl())?1:-1,r),rv(2),Ap(n.name());}},dependencies:[hh],encapsulation:2})};var Ge=class t{transform(i){return i?i>=1e6||Math.round(i/1e3)>=1e3?`${(i/1e6).toFixed(1)}M`:i>=1e3?`${Math.round(i/1e3)}K`:String(Math.round(i)):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatDamage",type:t,pure:true})};function oa(t,i){if(t&1&&up(0,"wl-game-icon",3),t&2){let e=bI();lp("id",i)("icon",e.row().icon)("name",e.row().label);}}function aa(t,i){if(t&1&&(si(0,"span",4),tD(1),bc()),t&2){let e=bI();rv(),Ap(e.row().label);}}function la(t,i){t&1&&tD(0," missed ");}function sa(t,i){if(t&1&&(tD(0),pD(1,"formatDamage")),t&2){let e=bI(2);Rp$1(" ",e.gapSign(),"",gD(1,2,e.gapMagnitude())," ");}}function da(t,i){if(t&1&&(si(0,"span",9),sI(1,la,1,0)(2,sa,2,4),bc()),t&2){let e=bI();bp("badge-success",e.gapStatus()==="success")("badge-warning",e.gapStatus()==="warning")("badge-critical",e.gapStatus()==="critical")("badge-muted",e.gapStatus()==="muted"),rv(),aI(e.row().playerPct==null?1:2);}}function ca(t,i){t&1&&(si(0,"span",10),tD(1,"passive"),bc());}function ma(t,i){if(t&1&&(si(0,"span",11),tD(1,"Casts"),bc(),si(2,"span",12),tD(3),si(4,"span",13),tD(5),bc()()),t&2){let e=bI(2);rv(2),bp("badge-success",e.castsStatus()==="success")("badge-warning",e.castsStatus()==="warning")("badge-critical",e.castsStatus()==="critical")("badge-muted",e.castsStatus()==="muted"),rv(),xc(" ",e.row().playerCasts??0),rv(2),xc(" / ",e.row().topCasts??"-");}}function pa(t,i){if(t&1&&sI(0,ca,2,0,"span",10)(1,ma,6,10),t&2){let e=bI();aI(e.isPassive()?0:1);}}var Dt=class t{row=MF.required();higherIsBetter=MF(true);showCasts=MF(true);hidePlayer=MF(false);gap=ID(()=>{let{playerPct:i,topAvg:e}=this.row();return i==null||e==null?null:i-e});gapSign=ID(()=>(this.gap()??0)>=0?"+":"-");gapMagnitude=ID(()=>Math.abs(this.gap()??0));gapStatus=ID(()=>{let{playerPct:i,topAvg:e}=this.row();if(i==null)return "critical";let n=this.gap();return n==null||e==null||e===0?"muted":(this.higherIsBetter()?n:-n)>=0?"success":Math.abs(n)<=e*.1?"warning":"critical"});isPassive=ID(()=>this.row().passive===true);castsStatus=ID(()=>{let{playerCasts:i,topCasts:e}=this.row();if(e==null)return "muted";let n=i??0;return n>=e?"success":e-n<=1?"warning":"critical"});static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-compact-ability-row"]],inputs:{row:[1,"row"],higherIsBetter:[1,"higherIsBetter"],showCasts:[1,"showCasts"],hidePlayer:[1,"hidePlayer"]},decls:13,vars:6,consts:[[1,"md:flex","md:items-center","md:gap-3","px-4","py-1.5","min-w-0","border-t","md:border-t-0","border-[var(--border)]"],[1,"flex","items-baseline","gap-2","min-w-0","md:contents"],[1,"flex-1","min-w-0","overflow-hidden","md:order-1"],[3,"id","icon","name"],[1,"truncate","text-sm"],[1,"shrink-0","md:order-4","md:w-[9rem]","text-right","tabular-nums","text-xs","font-semibold",3,"badge-success","badge-warning","badge-critical","badge-muted"],[1,"flex","items-baseline","flex-wrap","gap-x-1.5","gap-y-1","mt-1.5","md:mt-0","md:contents"],[1,"shrink-0","mr-2","md:mr-0","md:order-3","md:w-[9rem]","md:text-right","tabular-nums","text-xs","text-[var(--muted)]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider"],[1,"shrink-0","md:order-4","md:w-[9rem]","text-right","tabular-nums","text-xs","font-semibold"],[1,"shrink-0","md:order-2","w-auto","md:w-[7.5rem]","text-center","text-xs","rounded","px-2","py-0.5","border","border-current","badge-muted"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"shrink-0","md:order-2","w-auto","md:w-[7.5rem]","text-center","tabular-nums","text-xs","rounded","px-2","py-0.5","border","border-current"],[1,"text-[var(--muted)]"]],template:function(e,n){if(e&1&&(si(0,"div",0)(1,"div",1)(2,"div",2),sI(3,oa,1,3,"wl-game-icon",3)(4,aa,2,1,"span",4),bc(),sI(5,da,3,9,"span",5),bc(),si(6,"div",6)(7,"span",7)(8,"span",8),tD(9,"Top avg "),bc(),tD(10),pD(11,"formatDamage"),bc(),sI(12,pa,2,1),bc()()),e&2){let r;rv(3),aI((r=n.row().spellId)?3:4,r),rv(2),aI(n.hidePlayer()?-1:5),rv(5),xc("",gD(11,4,n.row().topAvg)," "),rv(2),aI(n.showCasts()&&!n.hidePlayer()?12:-1);}},dependencies:[Se,Ge],encapsulation:2})};var It=class t{transform(i){return i==null?"":`${i>0?"+":""}${i.toFixed(0)}%`}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"signedPercent",type:t,pure:true})};var ua=(t,i)=>i.id,fa=(t,i)=>i.spellId;function ha(t,i){if(t&1&&(si(0,"div",10),tD(1),bc()),t&2){let e=bI(2);rv(),Ap(e.subtitle());}}function ga(t,i){if(t&1&&(si(0,"div",1)(1,"div",9),tD(2),bc(),sI(3,ha,2,1,"div",10),bc()),t&2){let e=bI();rv(2),Ap(e.heading()),rv(),aI(e.subtitle()?3:-1);}}function _a(t,i){if(t&1){let e=yI();si(0,"div",11)(1,"button",12),pD(2,"formatDuration"),mp("click",function(){let r=au(e).$index,o=bI();return cu(o.select(r))}),si(3,"mat-icon",13),tD(4),bc()()();}if(t&2){let e=i.$implicit,n=i.$index,r=bI();Cp("left",r.segmentLeftPcts()[n],"%")("z-index",r.activeIndex()===n?2:1),rv(),bp("seg-good",e.status==="good")("seg-warn",e.status==="warn")("seg-bad",e.status==="bad")("seg-scheduled",e.status==="muted"&&e.statusIcon==="schedule")("seg-missing",e.status==="muted"&&e.statusIcon!=="schedule")("seg-info",e.status==="info")("seg-active",r.activeIndex()===n),cp("aria-selected",r.activeIndex()===n)("aria-label",gD(2,21,e.timeStartS)),rv(3),Ap(e.statusIcon);}}function ba(t,i){if(t&1&&(si(0,"span"),tD(1),pD(2,"formatDuration"),bc()),t&2){let e=i.$implicit;rv(),Ap(gD(2,1,e));}}function va(t,i){if(t&1&&(si(0,"div",8),uI(1,ba,3,3,"span",null,cI),bc()),t&2){let e=bI();rv(),dI(e.timeTicks());}}function ya(t,i){if(t&1&&up(0,"wl-game-icon",17),t&2){let e=i.$implicit;lp("id",e.id)("icon",e.icon)("name",e.name);}}function xa(t,i){if(t&1&&(si(0,"span",18),tD(1),bc()),t&2){let e=i.$implicit;rv(),Ap(e);}}function wa(t,i){if(t&1){let e=yI();si(0,"button",27),mp("click",function(){au(e);let r=bI(2);return cu(r.openMap.emit(r.activeIndex()))}),si(1,"mat-icon"),tD(2,"my_location"),bc()();}}function Ca(t,i){if(t&1){let e=yI();si(0,"button",28),mp("click",function(){au(e);let r=bI(2);return cu(r.openClip.emit(r.activeIndex()))}),si(1,"mat-icon"),tD(2,"videocam"),bc()();}}function Sa(t,i){if(t&1&&(si(0,"span"),tD(1),pD(2,"signedPercent"),bc()),t&2){let e=bI(3);bp("badge-muted",e.overviewDeltaStatus()==="muted")("badge-success",e.overviewDeltaStatus()==="better")("badge-critical",e.overviewDeltaStatus()==="worse"),rv(),Ap(gD(2,7,e.overviewDelta()));}}function Ma(t,i){if(t&1&&(si(0,"span",22)(1,"span",29),tD(2),pD(3,"formatDamage"),bc(),sI(4,Sa,3,9,"span",30),bc()),t&2){let e=bI(),n=bI();rv(2),Ap(gD(3,2,e.overview.playerPct)),rv(2),aI(n.overviewDelta()!==null?4:-1);}}function Da(t,i){if(t&1&&(si(0,"span",23),tD(1),pD(2,"formatDamage"),bc()),t&2){let e=bI();rv(),Ap(gD(2,1,e.overview.topAvg));}}function Ia(t,i){t&1&&(si(0,"span",24),tD(1,"not reached"),bc());}function Ta(t,i){if(t&1&&up(0,"div",35),t&2){let e=bI(2),n=bI();Cp("width",n.overviewPlayerWidthPct(),"%"),bp("fill-success",e.status==="good")("fill-warning",e.status==="warn")("fill-critical",e.status==="bad")("fill-muted",e.status==="muted")("fill-info",e.status==="info");}}function ka(t,i){if(t&1&&up(0,"div",36),t&2){let e=bI(3);Cp("left",e.overviewRangeLeftPct(),"%")("width",e.overviewRangeWidthPct(),"%");}}function Ea(t,i){if(t&1&&up(0,"div",37),t&2){let e=bI(3);Cp("left",e.overviewAvgLeftPct(),"%");}}function Ra(t,i){if(t&1&&(si(0,"div",25)(1,"div",31),sI(2,Ta,1,12,"div",32),sI(3,ka,1,4,"div",33),sI(4,Ea,1,2,"div",34),bc()()),t&2){let e=bI(2);rv(2),aI(e.overviewPlayerWidthPct()!==null?2:-1),rv(),aI(e.overviewRangeLeftPct()!==null?3:-1),rv(),aI(e.overviewAvgLeftPct()!==null?4:-1);}}function Pa(t,i){t&1&&(si(0,"span",40),tD(1,"casts"),bc());}function Fa(t,i){t&1&&(si(0,"span",41),tD(1,"gap"),bc());}function Aa(t,i){if(t&1&&up(0,"wl-compact-ability-row",42),t&2){let e=i.$implicit,n=bI(3);lp("row",e)("higherIsBetter",n.higherIsBetter())("showCasts",n.showCasts())("hidePlayer",n.activeIsMuted());}}function Oa(t,i){if(t&1&&(si(0,"div",26)(1,"div",38)(2,"span",39),tD(3,"ability"),bc(),sI(4,Pa,2,0,"span",40),si(5,"span",41),tD(6,"top avg"),bc(),sI(7,Fa,2,0,"span",41),bc(),uI(8,Aa,1,4,"wl-compact-ability-row",42,fa),bc()),t&2){let e=bI(2);rv(4),aI(e.showCasts()&&!e.activeIsMuted()?4:-1),rv(3),aI(e.activeIsMuted()?-1:7),rv(),dI(e.activeDetailRows());}}function Na(t,i){if(t&1&&(si(0,"div",14),up(1,"span",15),si(2,"span",16),tD(3),pD(4,"formatDuration"),pD(5,"formatDuration"),bc(),uI(6,ya,1,3,"wl-game-icon",17,ua),uI(8,xa,2,1,"span",18,lI),si(10,"div",19),sI(11,wa,3,0,"button",20),sI(12,Ca,3,0,"button",21),sI(13,Ma,5,4,"span",22)(14,Da,3,3,"span",23)(15,Ia,2,0,"span",24),bc()(),sI(16,Ra,5,3,"div",25),sI(17,Oa,10,2,"div",26)),t&2){let e=i,n=bI();rv(),bp("fill-success",e.status==="good")("fill-warning",e.status==="warn")("fill-critical",e.status==="bad")("fill-muted",e.status==="muted")("fill-info",e.status==="info"),rv(2),kp(" Window ",n.activeIndex()+1," - ",gD(4,18,e.timeStartS)," to ",gD(5,20,e.timeEndS)," "),rv(3),dI(e.spells),rv(2),dI(e.labels),rv(3),aI(n.showMap()?11:-1),rv(),aI(n.showClip()?12:-1),rv(),aI(n.activeIsMuted()?n.activeIsBenchOnly()?14:n.activeIsNotReached()?15:-1:13),rv(3),aI(n.activeIsBenchOnly()?-1:16),rv(),aI(e.detailRows.length?17:-1);}}var Tt=class t{windows=MF.required();higherIsBetter=MF(true);fightDuration=MF(0);showMap=MF(false);showClip=MF(false);showCasts=MF(true);heading=MF("");subtitle=MF("");openMap=_F();openClip=_F();static MIN_GAP_PCT=5;static EDGE_INSET_PCT=4;selectedIndex=ID(()=>{let i=this.windows(),e=this.higherIsBetter(),n=0,r=e?1/0:-1/0;return i.forEach((o,a)=>{if(o.status==="muted")return;let l=o.overview.playerPct,s=o.overview.topAvg;if(l==null||!s||s<=0)return;let p=l/s;(e?p<r:p>r)&&(r=p,n=a);}),n});_manualIndex=xo$1(null);activeIndex=ID(()=>this._manualIndex()??this.selectedIndex());activeWindow=ID(()=>this.windows()[this.activeIndex()]??null);timelineEnd=ID(()=>{let i=this.windows();return i.length?Math.max(...i.map(e=>e.timeEndS),1):Math.max(this.fightDuration(),1)});timeTicks=ID(()=>{let i=this.timelineEnd(),e=5;return Array.from({length:e+1},(n,r)=>i/e*r)});select(i){this._manualIndex.set(i);}onKeydown(i){let e=i.key==="ArrowRight"?1:i.key==="ArrowLeft"?-1:0;if(!e)return;i.preventDefault();let n=this.activeIndex()+e;n>=0&&n<this.windows().length&&this.select(n);}activeIsMuted=ID(()=>{let i=this.activeWindow()?.status;return i==="muted"||i==="info"});activeIsNotReached=ID(()=>this.activeWindow()?.status==="muted");activeIsBenchOnly=ID(()=>this.activeWindow()?.status==="info");activeDetailRows=ID(()=>{let i=this.activeWindow()?.detailRows??[],e=this.higherIsBetter(),n=r=>{let o=(r.playerPct??0)-(r.topAvg??0);return e?o:-o};return [...i].sort((r,o)=>n(r)-n(o))});leftPct(i){let e=this.timelineEnd();return Math.min(100,Math.max(0,i/e*100))}segmentLeftPcts=ID(()=>{let i=this.windows(),e=t.EDGE_INSET_PCT,n=e,r=100-e,o=i.map(l=>Math.min(r,Math.max(n,this.leftPct(l.timeStartS))));if(o.length<2)return o;let a=Math.min(t.MIN_GAP_PCT,(r-n)/(o.length-1));for(let l=1;l<o.length;l++)o[l]=Math.max(o[l],o[l-1]+a);o[o.length-1]=Math.min(o[o.length-1],r);for(let l=o.length-2;l>=0;l--)o[l]=Math.min(o[l],o[l+1]-a);return o});overviewMax=ID(()=>{let i=this.windows().flatMap(e=>[e.overview.topAvg,e.overview.topMax,e.overview.playerPct].filter(n=>n!=null));return Math.max(...i,.01)});barPct(i,e){return Math.min(100,Math.max(0,i/e*100))}overviewDelta=ID(()=>{let i=this.activeWindow();if(!i)return null;let{playerPct:e,topAvg:n}=i.overview;return e==null||n==null||n===0?null:(e-n)/n*100});overviewDeltaStatus=ID(()=>{let i=this.overviewDelta();return i==null?"muted":(this.higherIsBetter()?i>=0:i<=0)?"better":"worse"});overviewPlayerWidthPct=ID(()=>{let i=this.activeWindow();return !i||i.overview.playerPct==null?null:this.barPct(i.overview.playerPct,this.overviewMax())});overviewRangeLeftPct=ID(()=>{let i=this.activeWindow();return !i||i.overview.topMin==null||i.overview.topMax==null?null:this.barPct(i.overview.topMin,this.overviewMax())});overviewRangeWidthPct=ID(()=>{let i=this.activeWindow();if(!i||i.overview.topMin==null||i.overview.topMax==null)return null;let e=this.overviewMax();return Math.max(0,this.barPct(i.overview.topMax,e)-this.barPct(i.overview.topMin,e))});overviewAvgLeftPct=ID(()=>{let i=this.activeWindow();return !i||i.overview.topAvg==null?null:this.barPct(i.overview.topAvg,this.overviewMax())});static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-window-comparison"]],hostAttrs:[1,"block"],inputs:{windows:[1,"windows"],higherIsBetter:[1,"higherIsBetter"],fightDuration:[1,"fightDuration"],showMap:[1,"showMap"],showClip:[1,"showClip"],showCasts:[1,"showCasts"],heading:[1,"heading"],subtitle:[1,"subtitle"]},outputs:{openMap:"openMap",openClip:"openClip"},decls:11,vars:7,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"px-4"],[1,"overflow-x-auto","md:overflow-visible","pt-2","md:pt-0"],[1,"min-w-[540px]","md:min-w-0"],["role","listbox","tabindex","0","aria-label","Burst windows",1,"relative","mx-2","h-[42px]","md:h-9",3,"keydown"],["aria-hidden","true",1,"absolute","left-0","right-0","top-0","h-[42px]","md:h-9","rounded-lg","bg-[var(--bg)]","border","border-[var(--border)]"],[1,"absolute","top-0","flex","flex-col","items-center","-translate-x-1/2",3,"left","z-index"],[1,"flex","justify-between","tabular-nums","text-[10px]","text-[var(--muted)]","mt-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"absolute","top-0","flex","flex-col","items-center","-translate-x-1/2"],["type","button","role","option",1,"flex","items-center","justify-center","w-[42px]","h-[42px]","md:w-9","md:h-9","rounded",3,"click"],[1,"icon-seg"],[1,"flex","flex-wrap","items-center","gap-2","px-4","py-2.5","bg-[var(--surface)]","border-t","border-[var(--border)]"],[1,"w-2.5","h-2.5","rounded-full","shrink-0"],[1,"text-sm","font-medium","whitespace-nowrap"],[3,"id","icon","name"],[1,"text-sm","text-[var(--muted)]"],[1,"basis-full","md:basis-auto","md:ml-auto","flex","items-center","gap-2"],["mat-icon-button","","aria-label","Open positioning map"],["mat-icon-button","","aria-label","Watch clip"],[1,"tabular-nums","text-xs","flex","items-baseline","gap-2"],[1,"tabular-nums","text-xs","text-[var(--muted)]"],[1,"text-xs","text-[var(--muted)]","italic"],[1,"px-4","py-2","border-t","border-[var(--border)]"],[1,"md:border-t","border-[var(--border)]","pt-2","pb-2"],["mat-icon-button","","aria-label","Open positioning map",3,"click"],["mat-icon-button","","aria-label","Watch clip",3,"click"],[1,"text-[var(--muted)]"],[3,"badge-muted","badge-success","badge-critical"],["aria-hidden","true",1,"relative","h-5","rounded","bg-[var(--bg)]"],[1,"absolute","inset-y-0","left-0","rounded","opacity-[0.65]",3,"fill-success","fill-warning","fill-critical","fill-muted","fill-info","width"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]",3,"left","width"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]",3,"left"],[1,"absolute","inset-y-0","left-0","rounded","opacity-[0.65]"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]"],[1,"hidden","md:flex","items-center","gap-3","px-4","pb-1"],[1,"flex-1","text-[10px]","text-[var(--muted)]"],[1,"w-[7.5rem]","text-center","text-[10px]","text-[var(--muted)]"],[1,"w-[9rem]","text-right","text-[10px]","text-[var(--muted)]"],[3,"row","higherIsBetter","showCasts","hidePlayer"]],template:function(e,n){if(e&1&&(si(0,"div",0),sI(1,ga,4,2,"div",1),si(2,"div",2)(3,"div",3)(4,"div",4)(5,"div",5),mp("keydown",function(o){return n.onKeydown(o)}),up(6,"div",6),uI(7,_a,5,23,"div",7,cI),bc(),sI(9,va,3,0,"div",8),bc()()(),sI(10,Na,18,22),bc()),e&2){let r;rv(),aI(n.heading()?1:-1),rv(),bp("pt-3",!n.heading())("pb-3",!n.activeWindow()),rv(5),dI(n.windows()),rv(2),aI(n.timeTicks().length?9:-1),rv(),aI((r=n.activeWindow())?10:-1,r);}},dependencies:[ub,db,N_,ed,Se,Dt,ze,Ge,It],encapsulation:2})};var Ve=class{token=0;run(i,e){let n=++this.token;i.then(r=>{n===this.token&&e.apply(r);}).catch(r=>V_(e.context,r)).finally(()=>{n===this.token&&e.settled?.();});}};function Et(t,i){return t.map(e=>({id:e,icon:i[e].icon,name:i[e].name}))}function Wa(t,i,e,n,r,o=false){return o?{status:"info",icon:"insights"}:r?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:t<e-n?{status:"bad",icon:"error"}:i>0&&t<i-n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}}function La(t,i){let e=[],n=[];for(let r of t){let o=i[r];o?e.push(o):n.push(r);}return {spellIds:e,labels:n}}function Ba(t,i,e){let n={};for(let r of i?.ability_breakdown??[])n[r.spell_id]=r;return t.map(r=>({spellId:r.spell_id,label:e[r.spell_id].name,icon:e[r.spell_id].icon,playerPct:n[r.spell_id]?.damage??null,topAvg:r.avg_damage,topMin:r.min_damage,topMax:r.max_damage,playerCasts:n[r.spell_id]?.casts??null,topCasts:r.avg_casts??null,passive:r.is_passive??false}))}function $a(t){return {timeS:t.time_s,windowLengthS:t.window_length_s}}function Rt(t,i,e,n,r,o=false){let a=[],l=[];return t.forEach((s,p)=>{let u=s.time_s>e,h=u?null:i[p]??null,g=h?.window_damage??null,{status:x,icon:w}=Wa(g,s.dmg_avg,s.dmg_min,s.dmg_stddev,u,o),{spellIds:E,labels:A}=La(s.common_cds,n);a.push({timeStartS:s.time_s,timeEndS:s.time_s+s.window_length_s,spells:Et(E,r),labels:A,status:x,statusIcon:w,overview:{label:"",icon:"",playerPct:g,topAvg:s.dmg_avg,topMin:s.dmg_min,topMax:s.dmg_max},detailRows:Ba(s.ability_breakdown,h,r)}),l.push($a(s));}),{windows:a,anchors:l}}function sn(t){return (t.amount||0)+(t.absorbed||0)}function za(t,i,e,n,r){let o=h=>h>=t.time_s&&h<t.time_s+t.window_length_s,a=i.filter(h=>o((h.timestamp-n)/1e3)),l=a.reduce((h,g)=>h+sn(g),0),s={};for(let h of a)h.abilityGameID&&(s[h.abilityGameID]=(s[h.abilityGameID]||0)+sn(h));let p=new Map;for(let h of e)if(o((h.timestamp-n)/1e3)){let g=r(h.abilityGameID);p.set(g,(p.get(g)??0)+1);}let u=Object.entries(s).sort((h,g)=>g[1]-h[1]).slice(0,10).map(([h,g])=>{let x=parseInt(h,10);return {spell_id:x,damage:Math.round(g),casts:p.get(r(x))??0}});return {time_s:t.time_s,window_damage:Math.round(l),ability_breakdown:u}}function Ga(t,i,e,n,r){let o=s=>r.get(s)??`Spell ${s}`,a=i.filter(s=>s.timestamp>=n&&sn(s)>0).sort((s,p)=>s.timestamp-p.timestamp),l=e.filter(s=>s.type==="cast"&&s.abilityGameID);return t.map(s=>za(s,a,l,n,o))}var Pt=class t{source=T(Kv);wclApi=T(te);async loadPlayerView(i,e,n,r,o){let a=await this.source.getBench(i,e);if(!a)return {windows:[],anchors:[]};try{let l=await this.wclApi.getReport(n),s=l.fights.find(w=>w.id===r);if(!s)return Rt(a.windows,[],Number.POSITIVE_INFINITY,a.cd_spell_ids,a.ability_icons,!0);let p=new Map;for(let w of l.masterData?.abilities??[])p.set(w.gameID,w.name);let[u,h]=await Promise.all([this.wclApi.getAllEvents(n,r,"Casts",s.startTime,s.endTime,o),this.wclApi.getAllEvents(n,r,"DamageDone",s.startTime,s.endTime,o)]),g=Ga(a.windows,h,u,s.startTime,p),x=(s.endTime-s.startTime)/1e3;return Rt(a.windows,g,x,a.cd_spell_ids,a.ability_icons)}catch(l){return V_(`BurstFeatureService.loadPlayerView ${n}:${r}`,l),Rt(a.windows,[],Number.POSITIVE_INFINITY,a.cd_spell_ids,a.ability_icons,true)}}async loadBenchView(i,e){let n=await this.source.getBench(i,e);return n?Rt(n.windows,[],Number.POSITIVE_INFINITY,n.cd_spell_ids,n.ability_icons,true):{windows:[],anchors:[]}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Yi=class t{burst=T(Pt);spec=MF.required();encounterId=MF.required();report=MF("");fight=MF(0);player=MF(0);showMap=MF(false);showClip=MF(false);openMap=_F();openClip=_F();busyChange=_F();_windows=xo$1([]);_anchors=xo$1([]);windows=this._windows.asReadonly();loader=new Ve;constructor(){Au(()=>{let i=this.spec(),e=this.encounterId(),n=this.report(),r=this.fight(),o=this.player(),a=n&&r&&o?this.burst.loadPlayerView(i,e,n,r,o):this.burst.loadBenchView(i,e);this.loader.run(a,{context:"burst.loadPlayerView",apply:l=>{this._windows.set(l.windows),this._anchors.set(l.anchors);},settled:()=>this.busyChange.emit(false)});});}onOpenMap(i){let e=this._anchors()[i];e&&this.openMap.emit(e);}onOpenClip(i){let e=this._windows()[i];e&&this.openClip.emit({timeS:e.timeStartS,windowLengthS:e.timeEndS-e.timeStartS,key:`burst-${i}`});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-burst-windows"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],showClip:[1,"showClip"]},outputs:{openMap:"openMap",openClip:"openClip",busyChange:"busyChange"},decls:1,vars:4,consts:[["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"openMap","openClip","windows","higherIsBetter","showMap","showClip"]],template:function(e,n){e&1&&(si(0,"wl-window-comparison",0),mp("openMap",function(o){return n.onOpenMap(o)})("openClip",function(o){return n.onOpenClip(o)}),bc()),e&2&&lp("windows",n.windows())("higherIsBetter",true)("showMap",n.showMap())("showClip",n.showClip());},dependencies:[Tt],encapsulation:2})};var Va=["content"],ja=["*"];function qa(t,i){if(t&1){let e=yI();si(0,"button",3),mp("click",function(){au(e);let r=bI();return cu(r.toggle())}),tD(1),si(2,"mat-icon",4),tD(3),bc()();}if(t&2){let e=bI();cp("aria-expanded",e.expanded()),rv(),xc(" ",e.expanded()?"Show less":"Show more"," "),rv(2),Ap(e.expanded()?"expand_less":"expand_more");}}var Ft=class t{destroyRef=T(Pe);content=NF.required("content");expanded=xo$1(false);overflowing=xo$1(false);constructor(){ky(()=>{let i=this.content().nativeElement,e=()=>{this.expanded()||this.overflowing.set(i.scrollHeight-i.clientHeight>1);};if(e(),typeof ResizeObserver<"u"){let n=new ResizeObserver(e);n.observe(i),this.destroyRef.onDestroy(()=>n.disconnect());}});}toggle(){this.expanded.update(i=>!i);}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-collapsible-text"]],viewQuery:function(e,n){e&1&&Dp(n.content,Va,5),e&2&&RI();},hostAttrs:[1,"block"],ngContentSelectors:ja,decls:4,vars:3,consts:[["content",""],[1,"md:line-clamp-none"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]",3,"click"],[1,"icon-16"]],template:function(e,n){e&1&&(MI(),si(0,"div",1,0),NI(2),bc(),sI(3,qa,4,3,"button",2)),e&2&&(bp("line-clamp-2",!n.expanded()),rv(3),aI(n.overflowing()?3:-1));},dependencies:[ub,db],encapsulation:2})};var Ha={0:"Head",1:"Neck",2:"Shoulder",3:"Back",4:"Chest",5:"Waist",6:"Legs",7:"Feet",8:"Wrists",9:"Hands",10:"Ring 1",11:"Ring 2",12:"Trinket 1",13:"Trinket 2",14:"Back",15:"Main Hand",16:"Off Hand"},Qa={ok:"check_circle",warn:"warning",info:"info",unknown:"help_outline"};function je(t){return Ha[t]||`Slot ${t}`}function Xi(t){return Qa[t]}function Zi(t,i){let e=i?.enchants??{},n=t?.enchants??[];if(!Object.keys(e).length&&!n.length)return [];let r=new Set;for(let a of Object.keys(e))r.add(Number(a));for(let a of n)r.add(a.slot);let o=[];for(let a of [...r].sort((l,s)=>l-s)){let l=je(a),s=e[a]?.[0],p=s?s.name||`Enchant #${s.id}`:"",u=n.find(x=>x.slot===a);if(!u){s&&s.pct>=70?o.push({slotName:l,status:"warn",name:"Not enchanted",topPct:s.pct,note:`Apply ${p}`}):s&&s.pct>=40&&o.push({slotName:l,status:"info",name:"Not enchanted",topPct:s.pct,note:`${s.pct}% run ${p}`});continue}let h=u.name||`Enchant #${u.id}`,g=e[a]?.find(x=>x.id===u.id)?.pct??null;s&&u.id===s.id?o.push({slotName:l,status:"ok",name:h,topPct:s.pct,note:`${s.pct}% run this`}):s?o.push({slotName:l,status:"info",name:h,topPct:g,note:`${s.pct}% run ${p}`}):o.push({slotName:l,status:"ok",name:h,topPct:null,note:null});}return o}function Ji(t){return t.some(i=>i.status==="warn")?"warn":"ok"}function er(t,i){let e=t?.talent_builds??[];return e.length?e.map((n,r)=>({pct:n.pct,isPlayer:!!i&&n.key===i,link:`https://www.warcraftlogs.com/reports/${n.report_code}?fight=${n.fight_id}&type=summary&source=${n.source_id}`,playerName:n.player_name,label:r===0?"Most common build":`Alt build ${r}`})):[]}function tr(t,i){let e=t?.talent_builds??[];if(!e.length)return {status:"unknown",note:"No talent data."};let n=e[0]?.pct??0;return !i||i.split(":")[0]!==(e[0]?.key??"").split(":")[0]?{status:"ok",note:`${n}% run this build`}:e.some(r=>r.key===i)?{status:"ok",note:"Standard build."}:{status:"warn",note:`Off-meta build. ${n}% run the standard one.`}}function Ua(t,i,e){let n=new Set([12,13].map(o=>t.find(a=>a.slot===o)?.id).filter(o=>o!==void 0)),r=new Set([i,e].filter(o=>o!==void 0));if(n.size!==2||r.size!==2)return  false;for(let o of n)if(!r.has(o))return  false;return  true}function Ka(t,i){let e=t?.trinkets??{},n=0,r=false;for(let o of [12,13]){let a=(e[o]??[]).find(l=>l.id===i);a&&(n+=a.pct,r=true);}return r?n:null}function nr(t,i){let e=t?.trinkets??[],n=rr(i),r=[];if(Ua(e,n[0]?.id,n[1]?.id)){for(let s of [12,13]){let p=je(s),u=e.find(g=>g.slot===s),h=n.find(g=>g.id===u.id)?.pct??null;r.push({slotLabel:p,id:u.id,name:u.name,icon:u.icon??"",status:"ok",topPct:h,note:null});}return r}let o=new Set(e.map(s=>s.id)),a=n.filter(s=>!o.has(s.id)),l=0;for(let s of [12,13]){let p=je(s),u=e.find(g=>g.slot===s);if(!u){let g=a[l];if(!g)continue;l++,r.push({slotLabel:p,id:g.id,name:g.name,icon:"",status:"info",topPct:g.pct,note:`${g.pct}% run this trinket`});continue}if(o.has(u.id)&&n.some(g=>g.id===u.id)){r.push({slotLabel:p,id:u.id,name:u.name,icon:u.icon??"",status:"ok",topPct:n.find(g=>g.id===u.id).pct,note:null});continue}let h=a[l];h?(l++,r.push({slotLabel:p,id:u.id,name:u.name,icon:u.icon??"",status:"info",topPct:Ka(i,u.id),note:`Switch to ${h.name} (${h.pct}%)`})):r.push({slotLabel:p,id:u.id,name:u.name,icon:u.icon??"",status:"ok",topPct:null,note:null});}return r}function ir(t){return t.some(i=>i.status==="warn")?"warn":t.some(i=>i.status==="info")?"info":"ok"}function rr(t){let i=t?.trinkets??{},e=new Map;for(let n of [12,13])for(let r of i[n]??[]){let o=e.get(r.id);o?o.pct+=r.pct:e.set(r.id,{id:r.id,name:r.name,icon:r.icon,pct:r.pct});}return [...e.values()].sort((n,r)=>r.pct-n.pct).slice(0,2)}function or(t){let i=t?.enchants??{};return Object.keys(i).map(Number).sort((e,n)=>e-n).reduce((e,n)=>{let r=i[n]?.[0];return r&&r.pct>=40&&e.push({slotName:je(n),name:r.name||`Enchant #${r.id}`,pct:r.pct}),e},[])}function ar(t){return rr(t).map((i,e)=>({slotLabel:e===0?"Trinket 1":"Trinket 2",id:i.id,name:i.name,icon:i.icon,pct:i.pct}))}function lr(t,i){return t.find(e=>e.sourceID===i)??t[0]??null}var Ya=[12,13];function Xa(t){return (t??"").replace(/\.jpg$/i,"")}function dn(t){return t.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")}function sr(t){if(!t?.length)return "";let i=t.filter(e=>e.nodeID!=null).map(e=>String(e.nodeID));return i.length?"v2:"+i.sort().join(","):""}function cn(t){let i=[],e=[];return (t??[]).forEach((n,r)=>{if(n?.id==null)return;let o=typeof n.id=="string"?parseInt(n.id,10):n.id;Ya.includes(r)&&i.push({slot:r,id:o,name:n.name??"",icon:Xa(n.icon)});let a=n.permanentEnchant;if(a){let l=typeof a=="string"?parseInt(a,10):a;e.push({slot:r,id:l,name:n.permanentEnchantName??""});}}),{trinkets:i,enchants:e}}function At(){return {comparison:false,talentBuilds:[],talentStatus:{status:"unknown",note:"No talent data."},trinketRows:[],trinketStatus:"ok",benchTrinketRows:[],enchantRows:[],enchantStatus:"ok",benchEnchantRows:[]}}function Za(t,i,e,n){if(!t?.gear?.length)return {found:false,message:"No combatant info in this log."};let{trinkets:r,enchants:o}=cn(t.gear),a=sr(t.talentTree);for(let l of r)!l.name&&l.id&&(l.name=dn(i[`i${l.id}`]?.name??""));for(let l of o)!l.name&&l.id&&(l.name=dn(i[`e${l.id}`]?.name??""));return {found:true,spec:n,source_report:e,talent_key:a,trinkets:r,enchants:o}}function dr(t){return t?{talent_builds:t.talent_builds,trinkets:t.trinkets,enchants:t.enchants}:null}function cr(t,i){let e=!!t,n=t?.talent_key??"",r=Zi(t,i),o=nr(t,i);return {comparison:e,talentBuilds:er(i,n),talentStatus:tr(i,n),trinketRows:o,trinketStatus:ir(o),benchTrinketRows:ar(i),enchantRows:r,enchantStatus:Ji(r),benchEnchantRows:or(i)}}var Ot=class t{source=T(ny);wclApi=T(te);async loadComparisonView(i,e,n,r,o){let a=await this.source.getBench(i,e),l=dr(a),s=await this.fetchPlayerGear(n,r,o,i);return !l&&!s?At():cr(s,l)}async loadBenchView(i,e){let n=await this.source.getBench(i,e),r=dr(n);return r?cr(null,r):At()}async fetchPlayerGear(i,e,n,r){if(!i||!e||!n)return null;try{let o=lr(await this.wclApi.getCombatantInfo(i,e,n),n);if(!o?.gear?.length)return null;let{trinkets:a,enchants:l}=cn(o.gear),s=[...new Set(a.filter(g=>g.id).map(g=>g.id))],p=[...new Set(l.filter(g=>g.id).map(g=>g.id))],u={};try{u=await this.wclApi.getGameNames(s,p);}catch(g){V_(`GearFeatureService name resolution ${i}:${e}:${n}`,g);}let h=Za(o,u,i,r);return h.found?h:null}catch(o){return V_(`GearFeatureService player gear ${i}:${e}:${n}`,o),null}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Ja=(t,i)=>i.label,mn=(t,i)=>i.slotLabel,pr=(t,i)=>i.slotName;function el(t,i){t&1&&(si(0,"div",4),tD(1,"Gear vs top parses."),bc());}function tl(t,i){t&1&&(si(0,"div",4),tD(1,"Top-parse gear consensus."),bc());}function nl(t,i){t&1&&(si(0,"div",17),tD(1),bc()),t&2&&(rv(),xc("",i.pct,"% run the standard build"));}function il(t,i){t&1&&(si(0,"a",21),tD(1,"View parse \u2197"),bc()),t&2&&lp("href",i,tf);}function rl(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",14),tD(3,"warning_amber"),bc()(),si(4,"div",15)(5,"span",16),tD(6,"Off-meta build"),bc(),sI(7,nl,2,1,"div",17),bc(),up(8,"div",2),si(9,"div",18)(10,"span",19),tD(11,"Fix"),bc(),si(12,"div",20)(13,"span"),tD(14,"Switch to the standard build."),bc(),sI(15,il,2,1,"a",21),bc()()()),t&2){let e,n,r=bI(2);rv(7),aI((e=r.view().talentBuilds[0])?7:-1,e),rv(8),aI((n=r.view().talentBuilds[0]?.link)?15:-1,n);}}function ol(t,i){t&1&&(si(0,"div",11)(1,"span",22),tD(2,"On plan"),bc(),si(3,"span",23)(4,"span",24),tD(5,"Most common build"),bc()()());}function al(t,i){t&1&&(si(0,"div",12),tD(1," No talent data. "),bc());}function ll(t,i){if(t&1&&sI(0,rl,16,2,"div",10)(1,ol,6,0,"div",11)(2,al,2,0,"div",12),t&2){let e=bI();aI(e.view().talentStatus.status==="warn"?0:e.view().talentStatus.status==="ok"?1:2);}}function sl(t,i){if(t&1&&(si(0,"div",25),up(1,"div",2),si(2,"div",26),tD(3),bc(),si(4,"div",27)(5,"div",28),tD(6),bc(),si(7,"div",29),tD(8,"of top parsers"),bc()(),si(9,"div",30)(10,"a",21),tD(11,"View parse \u2197"),bc()()()),t&2){let e=i.$implicit;rv(3),Ap(e.label),rv(3),xc("",e.pct,"%"),rv(4),lp("href",e.link,tf);}}function dl(t,i){if(t&1&&uI(0,sl,12,3,"div",25,Ja),t&2){let e=bI(2);dI(e.view().talentBuilds);}}function cl(t,i){t&1&&(si(0,"div",12),tD(1," No talent data. "),bc());}function ml(t,i){if(t&1&&sI(0,dl,2,0)(1,cl,2,0,"div",12),t&2){let e=bI();aI(e.view().talentBuilds.length?0:1);}}function pl(t,i){if(t&1&&(si(0,"span",36),tD(1,"Measured"),bc(),si(2,"div",28),tD(3),bc(),si(4,"div",37),tD(5,"of top parsers"),bc()),t&2){let e=bI(2).$implicit;rv(3),xc("",e.topPct,"%");}}function ul(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",32),tD(3),bc()(),si(4,"div",15),up(5,"wl-game-icon",33),si(6,"div",34),tD(7),bc()(),si(8,"div",35),sI(9,pl,6,1),bc(),si(10,"div",18)(11,"span",19),tD(12,"Fix"),bc(),si(13,"wl-collapsible-text"),tD(14),bc()()()),t&2){let e=bI().$implicit;rv(2),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),xc(" ",e.status==="info"?"info":"warning_amber"," "),rv(2),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),aI(e.topPct!==null?9:-1),rv(5),Ap(e.note);}}function fl(t,i){if(t&1&&(si(0,"span",36),tD(1,"Measured"),bc(),si(2,"div",40),tD(3),bc(),si(4,"div",37),tD(5,"of top parsers"),bc()),t&2){let e=bI(2).$implicit;rv(3),xc("",e.topPct,"%");}}function hl(t,i){if(t&1&&(si(0,"div",31)(1,"div",13),up(2,"span",38),bc(),si(3,"div",15),up(4,"wl-game-icon",33),si(5,"div",34),tD(6),bc()(),si(7,"div",39),sI(8,fl,6,1),bc(),up(9,"div",2),bc()),t&2){let e=bI().$implicit;rv(4),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(2),aI(e.topPct!==null?8:-1);}}function gl(t,i){if(t&1&&sI(0,ul,15,15,"div",10)(1,hl,10,5,"div",31),t&2){let e=i.$implicit;aI(e.status!=="ok"?0:1);}}function _l(t,i){if(t&1&&uI(0,gl,2,1,null,null,mn),t&2){let e=bI(2);dI(e.view().trinketRows);}}function bl(t,i){if(t&1&&(si(0,"span",23),up(1,"wl-game-icon",33),bc()),t&2){let e=i.$implicit;rv(),lp("id",e.id)("name",e.name)("icon",e.icon);}}function vl(t,i){if(t&1&&(si(0,"div",11)(1,"span",22),tD(2,"On plan"),bc(),uI(3,bl,2,3,"span",23,mn),bc()),t&2){let e=bI(2);rv(3),dI(e.view().trinketRows);}}function yl(t,i){t&1&&(si(0,"div",12),tD(1," No trinket data. "),bc());}function xl(t,i){if(t&1&&sI(0,_l,2,0)(1,vl,5,0,"div",11)(2,yl,2,0,"div",12),t&2){let e=bI();aI(e.view().trinketStatus!=="ok"?0:e.view().trinketRows.length?1:2);}}function wl(t,i){if(t&1&&(si(0,"div",25),up(1,"div",2),si(2,"div",15),up(3,"wl-game-icon",33),si(4,"div",34),tD(5),bc()(),si(6,"div",27)(7,"div",28),tD(8),bc(),si(9,"div",29),tD(10,"of top parsers"),bc()(),up(11,"div",2),bc()),t&2){let e=i.$implicit;rv(3),lp("id",e.id)("name",e.name)("icon",e.icon),rv(2),Ap(e.slotLabel),rv(3),xc("",e.pct,"%");}}function Cl(t,i){if(t&1&&uI(0,wl,12,5,"div",25,mn),t&2){let e=bI(2);dI(e.view().benchTrinketRows);}}function Sl(t,i){t&1&&(si(0,"div",12),tD(1," No trinket data. "),bc());}function Ml(t,i){if(t&1&&sI(0,Cl,2,0)(1,Sl,2,0,"div",12),t&2){let e=bI();aI(e.view().benchTrinketRows.length?0:1);}}function Dl(t,i){if(t&1&&(si(0,"span",36),tD(1,"Measured"),bc(),si(2,"div",28),tD(3),bc(),si(4,"div",37),tD(5,"of top parsers"),bc()),t&2){let e=bI().$implicit;rv(3),xc("",e.topPct,"%");}}function Il(t,i){if(t&1&&(si(0,"div",10)(1,"div",13)(2,"mat-icon",32),tD(3),bc()(),si(4,"div",41)(5,"span",42),tD(6),bc(),si(7,"span",43),tD(8),bc()(),si(9,"div",35),sI(10,Dl,6,1),bc(),si(11,"div",18)(12,"span",19),tD(13,"Fix"),bc(),si(14,"wl-collapsible-text"),tD(15),bc()()()),t&2){let e=i.$implicit;rv(2),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),xc(" ",e.status==="info"?"info":"warning_amber"," "),rv(3),Ap(e.slotName),rv(2),Ap(e.name),rv(),bp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),rv(),aI(e.topPct!==null?10:-1),rv(5),Ap(e.note);}}function Tl(t,i){if(t&1&&(si(0,"div",11)(1,"span",22),tD(2,"On plan"),bc(),si(3,"span",23)(4,"span",24),tD(5),bc()()()),t&2){let e=bI(3);rv(5),xc("",e.enchantOnPlan().length," enchants");}}function kl(t,i){if(t&1&&(uI(0,Il,16,13,"div",10,pr),sI(2,Tl,6,1,"div",11)),t&2){let e=bI(2);dI(e.enchantIssues()),rv(2),aI(e.enchantOnPlan().length?2:-1);}}function El(t,i){t&1&&(si(0,"div",11)(1,"span",22),tD(2,"On plan"),bc(),si(3,"span",23)(4,"span",24),tD(5,"All enchants"),bc()()());}function Rl(t,i){t&1&&(si(0,"div",12),tD(1," No enchant data. "),bc());}function Pl(t,i){if(t&1&&sI(0,kl,3,1)(1,El,6,0,"div",11)(2,Rl,2,0,"div",12),t&2){let e=bI();aI(e.enchantIssues().length?0:e.view().enchantRows.length?1:2);}}function Fl(t,i){if(t&1&&(si(0,"div",25),up(1,"div",2),si(2,"div",41)(3,"span",42),tD(4),bc(),si(5,"span",16),tD(6),bc()(),si(7,"div",27)(8,"div",28),tD(9),bc(),si(10,"div",29),tD(11,"of top parsers"),bc()(),up(12,"div",2),bc()),t&2){let e=i.$implicit;rv(4),Ap(e.slotName),rv(2),Ap(e.name),rv(3),xc("",e.pct,"%");}}function Al(t,i){if(t&1&&uI(0,Fl,13,3,"div",25,pr),t&2){let e=bI(2);dI(e.view().benchEnchantRows);}}function Ol(t,i){t&1&&(si(0,"div",12),tD(1," No enchant data. "),bc());}function Nl(t,i){if(t&1&&sI(0,Al,2,0)(1,Ol,2,0,"div",12),t&2){let e=bI();aI(e.view().benchEnchantRows.length?0:1);}}var mr=class t{gear=T(Ot);spec=MF.required();encounterId=MF.required();report=MF("");fight=MF(0);player=MF(0);busyChange=_F();_view=xo$1(At());view=this._view.asReadonly();enchantIssues=ID(()=>this.view().enchantRows.filter(i=>i.status!=="ok"));enchantOnPlan=ID(()=>this.view().enchantRows.filter(i=>i.status==="ok"));slotName=je;statusIcon=Xi;loader=new Ve;constructor(){Au(()=>{let i=this.spec(),e=this.encounterId(),n=this.report(),r=this.fight(),o=this.player(),a=n&&r&&o?this.gear.loadComparisonView(i,e,n,r,o):this.gear.loadBenchView(i,e);this.loader.run(a,{context:"gear.loadComparisonView",apply:l=>this._view.set(l),settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-gear"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"]},outputs:{busyChange:"busyChange"},decls:39,vars:4,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"border-t","border-[var(--border)]"],[1,"px-4","pt-3","pb-1","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"flex","items-center","gap-2","border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"icon-18","badge-warning"],[1,"min-w-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[10px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"flex","flex-wrap","items-center","gap-2"],["target","_blank","rel","noopener",1,"rounded-[3px]","border","border-[var(--accent)]/20","bg-[var(--accent)]/[0.08]","px-[7px]","py-[1px]","font-mono","text-[10px]","text-[var(--accent)]","no-underline","whitespace-nowrap","hover:brightness-125",3,"href"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"text-[13px]","text-[var(--muted)]"],[1,"grid","grid-cols-[minmax(0,1fr)_auto]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-1","md:gap-y-0","items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"min-w-0","text-sm","text-[var(--text)]"],[1,"text-right","leading-[1.1]","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[10px]","opacity-60","mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-right","md:text-left","text-[13px]","text-[var(--muted)]","leading-[1.45]","md:border-l","md:border-[var(--border)]","md:pl-[14px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[7px]","items-start","md:items-center","border-t","border-[var(--border)]/30","opacity-55"],[1,"icon-18"],["kind","item",3,"id","name","icon"],[1,"text-[11px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"block","h-[7px]","w-[7px]","shrink-0","rounded-full","bg-[var(--success)]/60"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]","text-[var(--success)]"],[1,"text-[14px]","font-bold","tabular-nums"],[1,"min-w-0","flex","items-baseline","gap-2"],[1,"shrink-0","w-14","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"text-sm","text-[var(--text)]","truncate"]],template:function(e,n){e&1&&(si(0,"div",0)(1,"div",1),up(2,"div",2),si(3,"div")(4,"div",3),tD(5,"Gear"),bc(),sI(6,el,2,0,"div",4)(7,tl,2,0,"div",4),bc(),si(8,"div",5),tD(9,"Measured"),bc(),si(10,"div",6),tD(11,"Fix"),bc()(),si(12,"div",7)(13,"div",8),up(14,"div"),si(15,"div",9),tD(16,"Talents"),bc(),up(17,"div")(18,"div"),bc(),sI(19,ll,3,1)(20,ml,2,1),bc(),si(21,"div",7)(22,"div",8),up(23,"div"),si(24,"div",9),tD(25,"Trinkets"),bc(),up(26,"div")(27,"div"),bc(),sI(28,xl,3,1)(29,Ml,2,1),bc(),si(30,"div",7)(31,"div",8),up(32,"div"),si(33,"div",9),tD(34,"Enchants"),bc(),up(35,"div")(36,"div"),bc(),sI(37,Pl,3,1)(38,Nl,2,1),bc()()),e&2&&(rv(6),aI(n.view().comparison?6:7),rv(13),aI(n.view().comparison?19:20),rv(9),aI(n.view().comparison?28:29),rv(9),aI(n.view().comparison?37:38));},dependencies:[ub,db,Se,Ft],encapsulation:2})};function ur(t){return typeof t.x!="number"||typeof t.y!="number"?null:t.resourceActor===2?t.sourceID===void 0?null:t.targetID??null:t.sourceID??null}var hr=-Math.PI/2,fr=1/100,Wl=1/1e3,Nt=5;function Ll(t,i){let e=new Map;for(let r of t){let o=ur(r);if(o==null)continue;let a=e.get(o);a||(a=[],e.set(o,a)),a.push({t:(r.timestamp-i)/1e3,x:r.x*fr,y:r.y*fr,facing:typeof r.facing=="number"?r.facing*Wl:void 0,mapID:typeof r.mapID=="number"?r.mapID:void 0});}let n=new Map;for(let[r,o]of e)o.sort((a,l)=>a.t-l.t),n.set(r,{id:r,samples:o});return n}function Bl(t){let i=new Map;for(let e of t.parses)for(let n of e.enemies){if(n.game_id==null)continue;let r=i.get(n.game_id);r?n.is_boss&&(r.isBoss=true):i.set(n.game_id,{gameId:n.game_id,name:n.name,isBoss:n.is_boss});}return [...i.values()].sort((e,n)=>(n.isBoss?1:0)-(e.isBoss?1:0))}function $l(t,i){let e=new Map;for(let o of i)o.gameID!=null&&e.set(o.gameID,o.id);let n=Bl(t).find(o=>o.isBoss)?.gameId;return {bossActorId:n!=null?e.get(n)??null:null,refActorByGameId:e}}function zl(t){let{positions:i,events:e,fightStartMs:n,playerId:r,enemies:o}=t,{bossActorId:a,refActorByGameId:l}=$l(i,o),s=Ll(e,n);return s.get(r)?.samples.length?{timelines:s,playerId:r,bossActorId:a,refActorByGameId:l}:null}var qe=class t{source=T($v);injector=T(me);positions=xo$1(null);live=xo$1(null);overlayLoading=xo$1(false);pendingOverlay=null;overlayLoaded=false;open=xo$1(false);anchorTime=xo$1(0);reference=xo$1({kind:"boss"});preS=xo$1(Nt);postS=xo$1(Nt);ready(){return !!this.positions()}async loadBench(i,e){let n=await this.source.getBench(i,e);return this.positions.set(n),this.live.set(null),n}async prepare(i,e,n,r,o){if(this.live.set(null),this._resetOverlay(),!e?.encounterID){this.positions.set(null);return}try{let a=await this.loadBench(r,e.encounterID);if(!a)return;this.pendingOverlay={reportCode:i,fight:e,playerId:n,positions:a,enemies:o},this.open()&&await this.ensureLiveOverlay();}catch(a){V_(`MapFeatureService.prepare ${i}:${e?.id}`,a),this.live.set(null);}}openAt(i){this.anchorTime.set(i.timeS),this.reference.set(i.reference??{kind:"boss"});let e=(i.windowLengthS??0)>0;this.preS.set(e?0:Nt),this.postS.set(e?i.windowLengthS:Nt),this.open.set(true),this.ensureLiveOverlay();}close(){this.open.set(false);}clear(){this.open.set(false),this.positions.set(null),this.live.set(null),this._resetOverlay();}_resetOverlay(){this.pendingOverlay=null,this.overlayLoaded=false,this.overlayLoading.set(false);}async ensureLiveOverlay(){let i=this.pendingOverlay;if(!(!i||this.overlayLoaded||this.overlayLoading())){this.overlayLoading.set(true);try{let{reportCode:e,fight:n,playerId:r,positions:o,enemies:a}=i,l=await this.fetchLiveEvents(e,n,r);this.live.set(zl({positions:o,events:l,fightStartMs:n.startTime,playerId:r,enemies:a})),this.overlayLoaded=!0;}catch(e){V_(`MapFeatureService.ensureLiveOverlay ${i.reportCode}:${i.fight.id}`,e),this.live.set(null);}finally{this.overlayLoading.set(false);}}}async fetchLiveEvents(i,e,n){let{id:r,startTime:o,endTime:a}=e,l=this.injector.get(te),[s,p]=await Promise.all([l.getAllEvents(i,r,"Casts",o,a,n,true),l.getAllEvents(i,r,"Casts",o,a,void 0,true,"Enemies")]);return [...s,...p]}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var gr=1/100,Gl=1/1e3;function Vl(t,i){let e=(i-t)%(2*Math.PI);return e>Math.PI&&(e-=2*Math.PI),e<=-Math.PI&&(e+=2*Math.PI),e}function pn(t,i){return t.mapID==null||i.mapID==null||t.mapID===i.mapID}function xe(t,i,e=3){let n=t?.samples;if(!n||!n.length)return null;if(i<=n[0].t)return i<n[0].t-e?null:U($({},n[0]),{t:i});let r=n[n.length-1];if(i>=r.t)return i>r.t+e?null:U($({},r),{t:i});let o=0,a=n.length-1;for(;o<a;){let x=o+a>>1;n[x].t<i?o=x+1:a=x;}let l=n[o],s=n[o-1],p=l.t-s.t,u=p>0?(i-s.t)/p:0,h;s.facing!=null&&l.facing!=null?h=s.facing+Vl(s.facing,l.facing)*u:h=s.facing??l.facing;let g=u<.5?s.mapID:l.mapID;return {t:i,x:s.x+(l.x-s.x)*u,y:s.y+(l.y-s.y)*u,facing:h,mapID:g}}function et(t,i,e=0){let n=t.x-i.x,r=t.y-i.y,o=(i.facing??Math.PI/2)+hr,a=Math.cos(o),l=Math.sin(o),s=n*a+r*l,p=n*l-r*a,u=Math.hypot(n,r),h=Math.atan2(p,s)*180/Math.PI;return {t:e,fwd:s,right:p,dist:u,angleDeg:h}}function _r(t,i){let e=i.map(([n,r,o,a,l])=>({t:n,x:r*gr,y:o*gr,facing:a==null?void 0:a*Gl,mapID:l??void 0}));return {id:t,samples:e}}function jl(t,i){return i.kind==="boss"?(t.enemies.find(n=>n.is_boss)??t.enemies[0])?.samples??null:t.enemies.find(e=>e.game_id===i.gameId)?.samples??null}function br(t,i){let e=[];for(let n of t.parses){let r=jl(n,i);r&&e.push({player:_r(-1,n.player),ref:_r(-2,r)});}return e}function un(t,i){let e=[];for(let{player:n,ref:r}of t){let o=xe(r,i),a=xe(n,i);o&&a&&pn(a,o)&&e.push(et(a,o,i));}return e}function vr(t,i,e,n,r){let o=[];for(let{player:a,ref:l}of t){let s=[];for(let p=i-e;p<=i+n+1e-6;p+=r){let u=xe(l,p),h=xe(a,p);u&&h&&pn(h,u)&&s.push(et(h,u,p));}s.length&&o.push(s);}return o}function yr(t,i,e,n,r,o,a){let l=[],s=e.get(i),p=e.get(t);for(let u=n-r;u<=n+o+1e-6;u+=a){let h=xe(s,u),g=xe(p,u);h&&g&&pn(g,h)&&l.push(et(g,h,u));}return l}var ql=["canvas"],Hl=(t,i)=>i.gameId;function Ql(t,i){t&1&&(si(0,"p",1),tD(1," No position data for this encounter. "),bc());}function Ul(t,i){if(t&1&&(si(0,"mat-option",18),tD(1),bc()),t&2){let e=bI().$implicit;lp("value",e.gameId),rv(),Ap(e.name);}}function Kl(t,i){if(t&1&&sI(0,Ul,2,2,"mat-option",18),t&2){let e=i.$implicit;aI(e.isBoss?-1:0);}}function Yl(t,i){t&1&&(si(0,"span",9),tD(1,"\u25C6 you"),bc());}function Xl(t,i){if(t&1){let e=yI();si(0,"div",2)(1,"mat-form-field",3)(2,"mat-label"),tD(3,"Reference"),bc(),si(4,"mat-select",4),mp("selectionChange",function(r){au(e);let o=bI();return cu(o.onRefChange(r.value))}),si(5,"mat-option",5),tD(6,"Boss"),bc(),uI(7,Kl,1,1,null,null,Hl),bc()()(),si(9,"div",6),up(10,"canvas",7,0),si(12,"div",8),sI(13,Yl,2,0,"span",9),si(14,"span",10),tD(15,"\u25CF top parses"),bc(),si(16,"span",11),tD(17,"\u25EF top-parse centre"),bc(),si(18,"span",12),tD(19,"\u25B2 reference (facing up)"),bc()()(),si(20,"div",13)(21,"button",14),mp("click",function(){au(e);let r=bI();return cu(r.togglePlay())}),si(22,"mat-icon"),tD(23),bc()(),si(24,"div",15)(25,"input",16),mp("input",function(r){au(e);let o=bI();return cu(o.onScrub(r.target.valueAsNumber))}),bc(),si(26,"div",17)(27,"span"),tD(28),pD(29,"formatDuration"),bc(),si(30,"span"),tD(31),pD(32,"formatDuration"),bc(),si(33,"span"),tD(34),pD(35,"formatDuration"),bc()()()();}if(t&2){let e=bI();rv(4),lp("value",e.refValue()),rv(3),dI(e.refEnemies()),rv(6),aI(e.live()?13:-1),rv(8),cp("aria-label",e.playing()?"Pause":"Play"),rv(2),Ap(e.playing()?"pause":"play_arrow"),rv(2),lp("min",e.windowStart())("max",e.windowEnd())("value",e.scrubT()),rv(3),Ap(gD(29,10,e.windowStart())),rv(3),xc("anchor ",gD(32,12,e.anchorTime())),rv(3),Ap(gD(35,14,e.windowEnd()));}}var xr=.5,Zl=.1,Wt=class t{map=T(qe);positions=this.map.positions;live=this.map.live;anchorTime=this.map.anchorTime;selector=xo$1({kind:"boss"});scrubT=xo$1(0);playing=xo$1(false);rafId=null;lastFrameMs=0;canvas=NF("canvas");refEnemies=ID(()=>{let i=this.positions();if(!i)return [];let e=new Map;for(let n of i.parses)for(let r of n.enemies){if(r.game_id==null)continue;let o=e.get(r.game_id);o?r.is_boss&&(o.isBoss=true):e.set(r.game_id,{gameId:r.game_id,name:r.name,isBoss:r.is_boss});}return [...e.values()].sort((n,r)=>(r.isBoss?1:0)-(n.isBoss?1:0))});refValue=ID(()=>{let i=this.selector();return i.kind==="boss"?"boss":i.gameId});preS=this.map.preS;postS=this.map.postS;windowStart=ID(()=>this.anchorTime()-this.preS());windowEnd=ID(()=>this.anchorTime()+this.postS());parseTimelines=ID(()=>{let i=this.positions();return i?br(i,this.selector()):[]});benchTrails=ID(()=>vr(this.parseTimelines(),this.anchorTime(),this.preS(),this.postS(),xr));liveRefId=ID(()=>{let i=this.live();if(!i)return null;let e=this.selector();return e.kind==="boss"?i.bossActorId:i.refActorByGameId.get(e.gameId)??null});liveTrail=ID(()=>{let i=this.live(),e=this.liveRefId();return !i||e==null?[]:yr(i.playerId,e,i.timelines,this.anchorTime(),this.preS(),this.postS(),xr)});readout=ID(()=>{if(!this.positions())return null;let i=this.scrubT(),e=un(this.parseTimelines(),i),n=null;e.length&&(n={fwd:e.reduce((o,a)=>o+a.fwd,0)/e.length,right:e.reduce((o,a)=>o+a.right,0)/e.length});let r=this.livePlayerAt(i);return {centroid:n,player:r}});constructor(){T(Pe).onDestroy(()=>this.stopTimer()),Au(()=>{this.anchorTime(),this.selector.set(this.map.reference()),this.pause(),this.scrubT.set(this.anchorTime());}),Au(()=>{let i=this.canvas()?.nativeElement;this.benchTrails(),this.liveTrail(),this.scrubT(),this.readout(),i&&this.draw(i);});}onRefChange(i){this.selector.set(i==="boss"?{kind:"boss"}:{kind:"enemy",gameId:i});}onScrub(i){this.pause(),this.scrubT.set(i);}togglePlay(){this.playing()?this.pause():this.play();}play(){this.scrubT()>=this.windowEnd()-1e-6&&this.scrubT.set(this.windowStart()),this.playing.set(true),this.stopTimer(),this.lastFrameMs=0;let i=e=>{let n=this.lastFrameMs?Math.min((e-this.lastFrameMs)/1e3,Zl):0;this.lastFrameMs=e;let r=this.scrubT()+n;this.scrubT.set(r>=this.windowEnd()?this.windowStart():r),this.rafId=requestAnimationFrame(i);};this.rafId=requestAnimationFrame(i);}pause(){this.playing.set(false),this.stopTimer();}stopTimer(){this.rafId!=null&&(cancelAnimationFrame(this.rafId),this.rafId=null);}livePlayerAt(i){let e=this.live(),n=this.liveRefId();if(!e||n==null)return null;let r=xe(e.timelines.get(n),i),o=xe(e.timelines.get(e.playerId),i);return !r||!o||r.mapID!=null&&o.mapID!=null&&r.mapID!==o.mapID?null:et(o,r,i)}draw(i){let e=i.getContext("2d");if(!e)return;let n=globalThis.devicePixelRatio||1,r=i.clientWidth||600,o=i.clientHeight||420,a=Math.round(r*n),l=Math.round(o*n);(i.width!==a||i.height!==l)&&(i.width=a,i.height=l),e.setTransform(n,0,0,n,0,0),e.clearRect(0,0,r,o);let s=r/2,p=o/2,u=Math.min(r,o)/2-28,h=this.benchTrails(),g=this.liveTrail(),x=this.readout(),w=10;for(let F of h)for(let K of F)w=Math.max(w,K.dist);for(let F of g)w=Math.max(w,F.dist);w=Math.ceil(w/5)*5+5;let E=u/w,A=F=>[s+F.right*E,p-F.fwd*E],J=getComputedStyle(i),ne=F=>J.getPropertyValue(F).trim(),Pe=ne("--gold"),$t=ne("--border"),Me=ne("--muted"),zt=ne("--critical"),Hr=ne("--accent"),Qr=ne("--map-dot-outline");e.strokeStyle=$t,e.fillStyle=Me,e.font="11px system-ui, sans-serif",e.lineWidth=1;for(let F=5;F<=w;F+=5)e.beginPath(),e.arc(s,p,F*E,0,2*Math.PI),e.stroke(),e.fillText(`${F}y`,s+3,p-F*E+12);e.fillStyle=zt,e.beginPath(),e.moveTo(s,p-9),e.lineTo(s-7,p+6),e.lineTo(s+7,p+6),e.closePath(),e.fill();let Ur=this.scrubT();e.strokeStyle=Me,e.globalAlpha=.25,e.lineWidth=1.5;for(let F of h)e.beginPath(),F.forEach((K,ie)=>{let[Qe,hn]=A(K);ie?e.lineTo(Qe,hn):e.moveTo(Qe,hn);}),e.stroke();e.globalAlpha=1;let Kr=un(this.parseTimelines(),Ur);e.fillStyle=Me;for(let F of Kr){let[K,ie]=A(F);e.beginPath(),e.arc(K,ie,3,0,2*Math.PI),e.fill();}if(x?.centroid){let[F,K]=A(x.centroid);e.strokeStyle=Hr,e.lineWidth=2,e.beginPath(),e.arc(F,K,7,0,2*Math.PI),e.stroke();}if(g.length&&(e.strokeStyle=Pe,e.globalAlpha=.5,e.lineWidth=2,e.beginPath(),g.forEach((F,K)=>{let[ie,Qe]=A(F);K?e.lineTo(ie,Qe):e.moveTo(ie,Qe);}),e.stroke(),e.globalAlpha=1),x?.player){let[F,K]=A(x.player),ie=5;e.fillStyle=Pe,e.beginPath(),e.moveTo(F,K-ie),e.lineTo(F+ie,K),e.lineTo(F,K+ie),e.lineTo(F-ie,K),e.closePath(),e.fill(),e.strokeStyle=Qr,e.lineWidth=1,e.stroke();}}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-map-canvas"]],viewQuery:function(e,n){e&1&&Dp(n.canvas,ql,5),e&2&&RI();},decls:2,vars:1,consts:[["canvas",""],[1,"text-[13px]","text-[var(--muted)]"],[1,"mb-2","flex","flex-wrap","items-center","justify-end","gap-2"],["appearance","outline",1,"w-[200px]"],[3,"selectionChange","value"],["value","boss"],[1,"relative","rounded-lg","border","border-[var(--border)]","bg-[var(--surface-alt)]"],[1,"block","h-[420px]","w-full"],[1,"pointer-events-none","absolute","bottom-2","left-2","flex","flex-col","gap-0.5","text-[10px]"],[1,"text-[var(--gold)]"],[1,"text-[var(--muted)]"],[1,"text-[var(--accent)]"],[1,"text-[var(--critical)]"],[1,"mt-2","flex","items-center","gap-2"],["mat-icon-button","",3,"click"],[1,"min-w-0","flex-1"],["type","range","step","0.25",1,"block","w-full","accent-[var(--gold)]",3,"input","min","max","value"],[1,"mt-1","flex","justify-between","text-[10px]","text-[var(--muted)]"],[3,"value"]],template:function(e,n){e&1&&sI(0,Ql,2,0,"p",1)(1,Xl,36,16),e&2&&aI(n.positions()?1:0);},dependencies:[N_,ed,ub,db,yt,vt,Je,Wi,Ni,$e,ze],encapsulation:2})};function Jl(t,i){t&1&&(si(0,"span",4),tD(1,"Loading your trail..."),bc());}function es(t,i){if(t&1){let e=yI();si(0,"div",0)(1,"div",1)(2,"div",2)(3,"span",3),tD(4,"Positioning"),bc(),sI(5,Jl,2,0,"span",4),bc(),si(6,"button",5),mp("click",function(){au(e);let r=bI();return cu(r.map.close())}),si(7,"mat-icon"),tD(8,"close"),bc()()(),si(9,"div",6),up(10,"wl-map-canvas"),bc()();}if(t&2){let e=bI();rv(5),aI(e.map.overlayLoading()?5:-1);}}var wr=class t{map=T(qe);static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-map-panel"]],decls:1,vars:1,consts:[[1,"fixed","inset-0","z-50","flex","flex-col","bg-[var(--bg)]","md:inset-y-0","md:left-auto","md:right-0","md:w-[460px]","md:border-l","md:border-[var(--border)]","md:shadow-2xl"],[1,"flex","items-center","justify-between","border-b","border-[var(--border)]","px-4","py-2"],[1,"flex","items-center","gap-2"],[1,"font-semibold"],[1,"text-[13px]","text-[var(--muted)]"],["mat-icon-button","","aria-label","Close map",3,"click"],[1,"flex-1","overflow-y-auto","p-4"]],template:function(e,n){e&1&&sI(0,es,11,1,"div",0),e&2&&aI(n.map.open()?0:-1);},dependencies:[N_,ed,ub,db,Wt],encapsulation:2})};var Cr=class t{transform(i){return i?i.replace(/([A-Z])/g," $1").trim():""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"formatSpec",type:t,pure:true})};var Sr=class t{transform(i){return i?W_(i):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"specIcon",type:t,pure:true})};var Mr=class t{transform(i){return $_(i??"")}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"classIcon",type:t,pure:true})};function Dr(t){return `https://assets.rpglogs.com/img/warcraft/bosses/${t}-icon.jpg`}var Ir=class t{transform(i){return i?Dr(i):""}static \u0275fac=function(e){return new(e||t)};static \u0275pipe=UE({name:"bossIcon",type:t,pure:true})};function ts(t,i){if(t&1&&up(0,"img",0),t&2){let e=bI();lp("ngSrc",i)("width",e.size())("height",e.size())("alt",e.alt());}}var Tr=class t{src=MF.required();alt=MF.required();size=MF(20);static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-art-icon"]],hostAttrs:[1,"inline-flex","items-center","shrink-0","align-middle"],inputs:{src:[1,"src"],alt:[1,"alt"],size:[1,"size"]},decls:1,vars:1,consts:[[1,"block","rounded-sm",3,"ngSrc","width","height","alt"]],template:function(e,n){if(e&1&&sI(0,ts,1,4,"img",0),e&2){let r;aI((r=n.src())?0:-1,r);}},dependencies:[hh],encapsulation:2})};var kr="wl.sel.postRaid",Er="wl.sel.preFight",Rr=class t{savePostRaid(i){this._save(kr,i,"SelectionStore.savePostRaid");}loadPostRaid(){return this._load(kr,"SelectionStore.loadPostRaid")}savePreFight(i){this._save(Er,i,"SelectionStore.savePreFight");}loadPreFight(){return this._load(Er,"SelectionStore.loadPreFight")}_save(i,e,n){try{localStorage.setItem(i,JSON.stringify(e));}catch(r){V_(n,r);}}_load(i,e){try{let n=localStorage.getItem(i);return n?JSON.parse(n):null}catch(n){return V_(e,n),null}}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};function He(t,i,e,n=2){return t>i+n*e}function Fr(t,i,e,n=2){return Math.abs(t-i)>n*e}function Ar(t,i,e,n=2){return t<i-n*e}function Or(t,i){return Math.max(0,(1-t/i)*100)}function Nr(t){return t.reduce((i,e)=>Math.abs(e)<Math.abs(i)?e:i)}function Lt(t,i){let e=t/60,n=Math.round(i.avg*e),r=Math.max(0,Math.round(n-i.stddev*e));return {expected:n,floor:r}}function W(t){return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(Math.floor(t%60)).padStart(2,"0")}`}var Pr={critical:0,warning:1,info:2,hold_suggestion:2,success:3};function tt(t){t.sort((i,e)=>(Pr[i.severity]??4)-(Pr[e.severity]??4));}var ns=new Set([2825,32182,80353,90355,264667,390386]),is=40,rs=30,os=15,fn=50;function Br(t,i){let e={};for(let n of t)n.type==="cast"&&n.abilityGameID&&(e[n.abilityGameID]??=[]).push((n.timestamp-i)/1e3);return e}function $r(t,i,e,n){let r=t.window_s??5,o=t.exception,a=[...i[t.spell_id]??[]].sort((p,u)=>p-u),l=i[t.required_spell_id]??[],s=[];for(let p of a)if(!l.some(u=>Math.abs(p-u)<=r)){if(o){let u=i[o.context_spell_id]??[],h=o.context_window_s??20;if(o.position==="before"?u.some(x=>p-x>=0&&p-x<=h):u.some(x=>x-p>=0&&x-p<=h))continue}s.push(p);}return s.length?{severity:e,category:"rule_violation",timestamp_ms:Math.round(s[0]*1e3),label:`${t.spell_name} without ${t.required_spell_name}`,message:`${t.spell_name} without ${t.required_spell_name}: ${s.length} of ${a.length} cast(s).`,measured:{value:`${s.length} / ${a.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0}:null}function zr(t,i,e,n){let r=t.hold_window_s??15,o=[...i[t.anchor_spell_id]??[]].sort((p,u)=>p-u).slice(1),a=t.spell_ids.flatMap((p,u)=>{let h=t.spell_names?.[u]??String(p);return o.flatMap(g=>(i[p]??[]).filter(x=>x>=g-r&&x<g).map(x=>({spellName:h,castTime:x})))});if(!a.length)return null;let l=a.reduce((p,u)=>Math.min(p,u.castTime),1/0),s=[...new Set(a.map(p=>p.spellName))].join("/");return {severity:e,category:"rule_violation",timestamp_ms:Math.round(l*1e3),label:`${s} held before ${t.anchor_spell_name}`,message:`${s} used in the ${r}s hold window before ${t.anchor_spell_name}: ${a.length} charge(s).`,measured:{value:`${a.length}`,unit:"charge(s)"},details:n?{remedy:n}:void 0}}function as(t,i,e){let n=[],r=Br(i,e);for(let o of t){let a=o.condition;if(!a)continue;let l=o.priority==="critical"?"critical":"warning",s=a.kind==="cast_without_prior"?$r(a,r,l,o.action):a.kind==="hold_cooldown_for_anchor"?zr(a,r,l,o.action):null;s&&n.push(s);}return n}function Wr(t,i){return i||(t.kind==="cast_without_prior"?`${t.spell_name} with ${t.required_spell_name}`:`${t.spell_names.join("/")} held for ${t.anchor_spell_name}`)}function ls(t,i,e){let n=Br(i,e),r=[];for(let o of t){let a=o.condition;if(!a)continue;let l=o.priority==="critical"?"critical":"warning";a.kind==="cast_without_prior"?(n[a.spell_id]?.length??0)>0&&!$r(a,n,l)&&r.push(Wr(a,o.description)):a.kind==="hold_cooldown_for_anchor"&&(n[a.anchor_spell_id]?.length??0)>1&&a.spell_ids.some(p=>(n[p]?.length??0)>0)&&!zr(a,n,l)&&r.push(Wr(a,o.description));}return r}var ss=.5;function ds(t){return t.used_sample_count/t.sample_count}function cs(t,i,e,n,r){return i===0&&e>=1?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`0 / ${e}`,unit:"cast(s)"},message:`${t} unused. Expected ${e} on a ${W(r)} fight.`,details:{remedy:`Use ${t} ${e}x this fight.`}}:i>0&&i<n?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`${i} / ${e}`,unit:"cast(s)"},message:`${t}: ${i} casts, expected ${e}. ${n-i} lost.`,details:{remedy:`Press ${t} ${n-i}x more - sooner off cooldown.`}}:null}function ms(t,i,e){if(!i.length)return null;let n=i[0]/1e3;if(!He(n,e.avg_first_cast_s,e.stddev_first_cast_s))return null;let r=(n-e.avg_first_cast_s).toFixed(0);return {severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:i[0],measured:{value:`+${r}s`,unit:`top ${W(e.avg_first_cast_s)}`},message:`${t} opened at ${W(n)}, ${r}s late. Top: ${W(e.avg_first_cast_s)}.`,details:{remedy:`Open with ${t} earlier.`}}}function ps(t,i,e,n,r){if(n===null||!i.length)return {blAligned:false,findings:[]};let o=i.filter(s=>{let p=s/1e3;return p>=n-rs&&p<=n+is+os}),a=o.length>0,l=[];if(!a&&r)l.push({severity:"critical",category:"cooldown_alignment",cd_name:t,timestamp_ms:i[0],measured:{value:"missed",unit:"BL"},message:`${t} missed Bloodlust (BL at ${W(n)}, first cast at ${W(i[0]/1e3)}).`,details:{remedy:`Align ${t} with Bloodlust.`}});else if(a&&e.avg_bl_offset_s!=null&&e.stddev_bl_offset_s!=null){let s=o.map(u=>u/1e3-n),p=Nr(s);if(Fr(p,e.avg_bl_offset_s,e.stddev_bl_offset_s)){let u=p>e.avg_bl_offset_s?"late":"early";l.push({severity:"warning",category:"cooldown_alignment",cd_name:t,timestamp_ms:o[0],measured:{value:u,unit:"in BL"},message:`${t} ${u} in the Bloodlust window.`,details:{remedy:`Tighten ${t} to the Bloodlust window.`}});}}return {blAligned:a,findings:l}}function us(t,i,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;for(let r=1;r<i.length;r++){let o=(i[r]-i[r-1])/1e3;He(o,e.avg_gap_s,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:i[r],measured:{value:`${o.toFixed(0)}s`,unit:`avg ${e.avg_gap_s.toFixed(0)}s`},message:`${t} at ${W(i[r]/1e3)}: ${o.toFixed(0)}s gap, top ${e.avg_gap_s.toFixed(0)}s.`,details:{remedy:`Press ${t} sooner - top gap ${e.avg_gap_s.toFixed(0)}s.`}});}return n}function fs(t,i,e){let n=[];if(!i.length)return n;let r=i.map(o=>o/1e3);for(let[o,a]of Object.entries(e.hold_targets)){let l=parseInt(o,10)-1;if(l<1||l>=r.length)continue;r[l]-r[l-1]-a.effective_cd_s<a.delay_s-a.band_s&&n.push({severity:"info",category:"hold_suggestion",timestamp_ms:i[l],measured:{value:W(r[l]),unit:`top ${W(a.target_s)}`},message:`${t} cast ${o} at ${W(r[l])}. ${a.count}/${a.total_samples} top parses hold to ${W(a.target_s)}.`,details:{remedy:`Hold ${t} to ${W(a.target_s)}.`,cd_name:t}});}return n}function hs(t,i,e){if(t.length<2||e.downtime_threshold_ms==null)return null;let n=0;for(let p=1;p<t.length;p++){let u=t[p]-t[p-1];u>e.downtime_threshold_ms&&(n+=u);}let r=n/1e3,o=e.top_avg_efficiency,a=e.top_efficiency_stddev,l=Or(r,i);return Ar(l,o,a,1)?{severity:"warning",category:"cast_efficiency",label:"Low cast efficiency",measured:{value:`${l.toFixed(1)}%`,unit:`top ${o.toFixed(0)}%`},message:`${l.toFixed(1)}% cast efficiency, ${r.toFixed(1)}s idle. Top: ${o.toFixed(0)}%.`,details:{remedy:`Fill ${r.toFixed(1)}s of gaps. Top: ${o.toFixed(0)}%.`}}:null}function gs(t,i,e,n,r){let o=t.name,a=i.length;if(t.talent_gated&&a===0)return null;if(!e)return {success:a>0?{severity:"success",category:"cooldown_usage",cd_name:o,message:`${o}: ${a} casts (no bench data).`}:null,scan:{issues:[],holds:[],blAligned:false}};let l=e.bl_pct>=fn,{expected:s,floor:p}=Lt(n,e.uses_per_min),u=[];if(ds(e)>=ss){let w=cs(o,a,s,p,n);w&&u.push(w);let E=ms(o,i,e);E&&u.push(E);}let h=ps(o,i,e,r,l);u.push(...h.findings),u.push(...us(o,i,e));let g=fs(o,i,e);return {success:u.length||a===0?null:{severity:"success",category:"cooldown_usage",cd_name:o,message:`${o} - ${a}/${s} casts${h.blAligned&&l?", BL-aligned":""}.`},scan:{issues:u,holds:g,blAligned:h.blAligned}}}function _s(t){let{fStart:i,fEnd:e,castEvents:n,buffEvents:r,cooldowns:o,rules:a,bench:l}=t,s=(e-i)/1e3,p=n.filter(w=>w.type==="cast"&&w.timestamp>=i&&w.timestamp<=e).sort((w,E)=>w.timestamp-E.timestamp),u=[],h=null;for(let w of r)if(w.type==="applybuff"&&ns.has(w.abilityGameID)&&w.timestamp>=i&&w.timestamp<=e){h=(w.timestamp-i)/1e3;break}let g=l.per_cd_benchmarks??{};for(let w of o){let E=p.filter(J=>J.abilityGameID===w.spell_id).map(J=>J.timestamp-i),A=gs(w,E,g[w.name],s,h);A&&(A.scan.issues.length?u.push(...A.scan.issues):A.success&&u.push(A.success),E.length&&u.push(...A.scan.holds));}a.length&&u.push(...as(a,p,i));let x=hs(p.map(w=>w.timestamp-i),s,l);return x&&u.push(x),tt(u),u}var bs={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function Gr(t,i,e){let n=i[t]??null;return n!=null?{spellId:n,icon:e[n].icon,rowName:e[n].name}:{spellId:null,icon:"",rowName:t}}function vs(t){let i=[],e={},n=new Set;for(let r of t){if(r.severity==="success"){r.cd_name&&n.add(r.cd_name);continue}r.category==="hold_suggestion"&&r.details?.cd_name?(e[r.details.cd_name]??={issues:[],holds:[]}).holds.push(r):r.category==="rule_violation"||!r.cd_name?i.push(r):(e[r.cd_name]??={issues:[],holds:[]}).issues.push(r);}return {ruleFindings:i,byName:e,successNames:n}}function ys(t){return t.map(i=>({severity:i.severity==="critical"?"critical":"warning",name:"",icon:"",what:i.label,measured:i.measured??{value:"-"},fix:i.details?.remedy}))}function xs(t,i,e){let n=[];for(let[r,o]of Object.entries(t)){if(!o.issues.length&&!o.holds.length)continue;let{spellId:a,icon:l,rowName:s}=Gr(r,i,e);for(let p of [...o.issues,...o.holds])n.push({severity:p.severity==="critical"?"critical":"warning",name:s,spellId:a,icon:l,timestampMs:p.timestamp_ms??null,chip:bs[p.category],measured:p.measured??{value:"-"},fix:p.details?.remedy});}return n}function ws(t,i,e){let{byName:n,successNames:r}=t,o=[];for(let a of r)if(!n[a]||!n[a].issues.length&&!n[a].holds.length){let{spellId:l,icon:s,rowName:p}=Gr(a,i,e);o.push({name:p,spellId:l,icon:s});}return o}function Cs(t,i,e){let n=vs(t);return {ruleRows:ys(n.ruleFindings),offensiveRows:xs(n.byName,i,e),onPlan:ws(n,i,e)}}function Ss(t,i,e){return [...t].sort((r,o)=>{let a=r.opener_priority??99,l=o.opener_priority??99;return a!==l?a-l:r.name.localeCompare(o.name)}).map(r=>{let o=i[r.name],a=o?.majority_hold&&o.hold_targets?Object.entries(o.hold_targets).sort((l,s)=>Number(l[0])-Number(s[0])).map(([l,s])=>({castIndex:Number(l),targetS:s.target_s})):[];return {name:r.name,spellId:r.spell_id??null,icon:e[r.spell_id].icon,firstCastS:o?.avg_first_cast_s??null,uses:o?.avg_uses??null,usesPerMin:o?.uses_per_min.avg??null,bloodlust:(o?.bl_pct??0)>=fn,bloodlustPct:(o?.bl_pct??0)>=fn?o.bl_pct:null,holds:a,rule:r.usage_rule??null}})}var Lr=class t{source=T(Yv);wclApi=T(te);async loadPlayerView(i,e,n,r,o){let a={ruleRows:[],ruleOnPlan:[],offensiveRows:[],onPlan:[]},l=await this.source.getBench(i,e);if(!l)return a;try{let p=(await this.wclApi.getReport(n)).fights.find(J=>J.id===r);if(!p)return a;let[u,h]=await Promise.all([this.wclApi.getAllEvents(n,r,"Casts",p.startTime,p.endTime,o),this.wclApi.getAllEvents(n,r,"Buffs",p.startTime,p.endTime,o)]),g=_s({fStart:p.startTime,fEnd:p.endTime,castEvents:u,buffEvents:h,cooldowns:l.major_cooldowns,rules:l.rules,bench:l}),{ruleRows:x,offensiveRows:w,onPlan:E}=Cs(g,l.cd_spell_ids,l.ability_icons),A=ls(l.rules,u,p.startTime);return {ruleRows:x,ruleOnPlan:A,offensiveRows:w,onPlan:E}}catch(s){return V_(`RotationFeatureService.loadPlayerView ${n}:${r}`,s),a}}async loadPlanView(i,e){let n=await this.source.getBench(i,e);return n?Ss(n.major_cooldowns,n.per_cd_benchmarks,n.ability_icons):[]}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Bt=t=>(t.amount||0)+(t.absorbed||0),Ms=.5;function Ds(t){return t.used_sample_count/t.sample_count}function Is(t,i,e,n,r,o,a,l){let s=i.map(([p,u])=>{let h=u??l;return {start_s:Math.round(p*10)/10,end_s:Math.round(h*10)/10,dmg_during:Math.round(n(p,h))}});return s.length?s:e.filter(p=>p.type==="cast"&&p.abilityGameID===t&&p.timestamp>=o&&p.timestamp<=a).map(p=>{let u=r(p.timestamp)/1e3;return {start_s:Math.round(u*10)/10,end_s:Math.round(u*10)/10,dmg_during:0}})}function Ts(t,i,e,n,r,o){if(!t.length)return [];let a=h=>h-r,l=n.filter(h=>h.type==="damage"),s={};for(let h of e){let g=h.abilityGameID,x=a(h.timestamp)/1e3;if(h.type==="applybuff")(s[g]??=[]).push([x,null]);else if(h.type==="removebuff"){for(let w=(s[g]?.length??0)-1;w>=0;w--)if(s[g][w][1]===null){s[g][w][1]=x;break}}}let p=(h,g)=>l.reduce((x,w)=>{let E=a(w.timestamp)/1e3;return E>=h&&E<=g?x+Bt(w):x},0),u=(o-r)/1e3;return t.map(h=>{let g=h.spell_id,x=Is(g,s[g]||[],i,p,a,r,o,u),w=x.map(A=>A.start_s).sort((A,J)=>A-J),E={name:h.name,spell_id:g,cooldown:h.cooldown,uses:x.length,cast_times_s:w,windows:x};return h.talent_gated&&(E.talent_gated=true),E})}function ks(t,i,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;let r=e.avg_gap_s;for(let o=1;o<i.length;o++){let a=i[o]-i[o-1];He(a,r,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:Math.round(i[o]*1e3),measured:{value:`${a.toFixed(0)}s`,unit:`avg ${r.toFixed(0)}s`},message:`${t} at ${W(i[o])}: ${a.toFixed(0)}s gap, top ${r.toFixed(0)}s.`,details:{remedy:`Use ${t} sooner after it resets.`}});}return n}function Es(t,i,e){let n=[];if(!i.length)return n;for(let[r,o]of Object.entries(e)){let a=parseInt(r,10)-1;if(a<1||a>=i.length)continue;i[a]-i[a-1]-o.effective_cd_s<o.delay_s-o.band_s&&n.push({severity:"info",category:"hold_suggestion",timestamp_ms:Math.round(i[a]*1e3),measured:{value:W(i[a]),unit:`top ~${W(o.target_s)}`},message:`${t} use ${r} at ${W(i[a])}. ${o.count}/${o.total_samples} top parses hold to ${W(o.target_s)}.`,details:{remedy:`Hold ${t} to ${W(o.target_s)}.`,cd_name:t}});}return n}function Rs(t,i,e){let{name:n,uses:r,cast_times_s:o}=t;if(t.talent_gated&&r===0)return [];if(!i)return r>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n}: ${r} uses (no bench data).`}]:[];let{expected:a,floor:l}=Lt(e,i.uses_per_min),s=[],p=Ds(i)>=Ms;p&&r===0&&a>=1?s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`0 / ${a}`,unit:"use(s)"},message:`${n} unused. Expected ${a} on a ${W(e)} fight.`,details:{remedy:`Use ${n} ${a}x this fight.`}}):p&&r>0&&r<l&&s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`${r} / ${a}`,unit:"use(s)"},message:`${n}: ${r} uses, expected ${a}. ${l-r} lost.`,details:{remedy:`Use ${n} ${l-r}x more.`}});let u=[];if(o?.length){let g=o[0];p&&He(g,i.avg_first_cast_s,i.stddev_first_cast_s)&&s.push({severity:"warning",category:"cooldown_delay",cd_name:n,timestamp_ms:Math.round(g*1e3),measured:{value:`+${(g-i.avg_first_cast_s).toFixed(0)}s`,unit:`top ${W(i.avg_first_cast_s)}`},message:`${n} first used at ${W(g)}, ${(g-i.avg_first_cast_s).toFixed(0)}s late. Top: ${W(i.avg_first_cast_s)}.`,details:{remedy:`Use ${n} earlier.`}}),s.push(...ks(n,o,i)),u.push(...Es(n,o,i.hold_targets));}let h=s.length?s:r>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n} - ${r}/${a} uses.`}]:[];return r>0&&h.push(...u),h}function Ps(t,i,e){let n=[];for(let r of t)n.push(...Rs(r,i[r.name],e));return tt(n),n}function Fs(t,i,e){let n=i.filter(r=>r.timestamp>=e&&Bt(r)>0).sort((r,o)=>r.timestamp-o.timestamp);return t.map(r=>{let o=u=>u>=r.time_s&&u<r.time_s+r.window_length_s,a=n.filter(u=>o((u.timestamp-e)/1e3)),l=a.reduce((u,h)=>u+Bt(h),0),s={};for(let u of a)u.abilityGameID&&(s[u.abilityGameID]=(s[u.abilityGameID]||0)+Bt(u));let p=Object.entries(s).sort((u,h)=>h[1]-u[1]).slice(0,6).map(([u,h])=>({spell_id:parseInt(u,10),damage:Math.round(h)}));return {time_s:r.time_s,window_damage:Math.round(l),ability_breakdown:p}})}var jr=3;function qr(t,i,e=jr){if(!i)return  false;let n=t.time_s-e,r=t.time_s+t.window_length_s+e;return i.windows.some(o=>o.start_s<=r&&o.end_s>=n)}function As(t,i,e=jr){if(!i)return  false;let n=t.time_s-e,r=t.time_s+t.window_length_s+e,o=i.windows.filter(a=>a.start_s<=r&&a.end_s>=n);return o.length?Math.max(...o.map(a=>a.dmg_during))>=t.dmg_min:false}function Os(t,i,e,n,r,o,a){return r?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:o?a?{status:"good",icon:"check_circle"}:t>e+n?{status:"warn",icon:"warning_amber"}:i>0&&t>i+n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}:{status:"bad",icon:"error"}}function Ns(t,i,e){let n={};for(let r of i?.ability_breakdown??[])n[r.spell_id]=r;return t.map(r=>({spellId:r.spell_id,label:e[r.spell_id].name,icon:e[r.spell_id].icon,playerPct:n[r.spell_id]?.damage??null,topAvg:r.avg_damage,topMin:r.min_damage,topMax:r.max_damage}))}function Ws(t){return {timeS:t.time_s,refGameId:t.ref_game_id??null,windowLengthS:t.window_length_s}}function Ls({topWindows:t,playerWindows:i,playerDefensives:e,fightDurationS:n,abilities:r}){let o=[],a=[];return t.forEach((l,s)=>{let p=l.time_s>n,u=p?null:i[s]??null,h=u?.window_damage??null,g=l.defensive_name??l.common_defensives?.[0]??"",x=e.find(Pe=>Pe.name===g),w=qr(l,x),E=As(l,x),{status:A,icon:J}=Os(h,l.dmg_avg,l.dmg_max,l.dmg_stddev,p,w,E),ne=l.spell_id==null&&g?[g]:[];o.push({timeStartS:l.time_s,timeEndS:l.time_s+l.window_length_s,spells:Et(l.spell_id!=null?[l.spell_id]:[],r),labels:ne,status:A,statusIcon:J,overview:{label:"",icon:"",playerPct:h,topAvg:l.dmg_avg,topMin:l.dmg_min,topMax:l.dmg_max},detailRows:Ns(l.ability_breakdown,u,r)}),a.push(Ws(l));}),{windows:o,anchors:a}}function Bs(t,i,e){let n=[];for(let r of t){if(r.time_s>e)continue;let o=r.defensive_name??r.common_defensives?.[0]??"";if(!o)continue;let a=i.find(l=>l.name===o);a?.talent_gated&&a.uses===0||qr(r,a)||n.push({severity:"warning",category:"defensive_window",cd_name:o,timestamp_ms:Math.round(r.time_s*1e3),measured:{value:"none",unit:"mitigated"},message:`${o} window at ${W(r.time_s)} uncovered. Top parses mitigate here.`,details:{remedy:`Use ${o} at ${W(r.time_s)}.`}});}return n}function $s(t){if(!t?.defensives?.length)return [];let i=t.per_defensive_benchmarks??{},e=t.defensive_windows??[];return t.defensives.map(n=>{let r=i[n.name],o=e.filter(l=>(l.defensive_name??l.common_defensives?.[0])===n.name).map(l=>l.time_s).sort((l,s)=>l-s),a=r?.majority_hold&&r.hold_targets?Object.entries(r.hold_targets).sort((l,s)=>Number(l[0])-Number(s[0])).map(([l,s])=>({castIndex:Number(l),targetS:s.target_s})):[];return {name:n.name,spellId:n.spell_id??null,icon:t.ability_icons[n.spell_id].icon,uses:r?.avg_uses??null,firstCastS:r?.avg_first_cast_s??null,windowsS:o,holds:a,rule:n.usage_rule??null}}).filter(n=>n.uses!=null||n.firstCastS!=null||n.windowsS.length||n.holds.length||n.rule)}var Vr=class t{source=T(Qv);wclApi=T(te);async loadAnalysisView(i,e,n,r,o){let a=await this.source.getBench(i,e);if(!a)return {findings:[],spellIdsByName:{},iconByName:{},windows:[],anchors:[]};try{let s=(await this.wclApi.getReport(n)).fights.find(Me=>Me.id===r);if(!s)return {findings:[],spellIdsByName:a.cd_spell_ids,iconByName:{},windows:[],anchors:[]};let p=s.startTime,u=s.endTime,h=(u-p)/1e3,[g,x,w]=await Promise.all([this.wclApi.getAllEvents(n,r,"Casts",p,u,o),this.wclApi.getAllEvents(n,r,"Buffs",p,u,o),this.wclApi.getAllEvents(n,r,"DamageTaken",p,u,o)]),E=Ts(a.defensives,g,x,w,p,u),A=a.defensives.length&&E.length?Ps(E,a.per_defensive_benchmarks,h):[];A.push(...Bs(a.defensive_windows,E,h)),tt(A);let J=Fs(a.defensive_windows,w,p),ne={};for(let[Me,zt]of Object.entries(a.cd_spell_ids))ne[Me]=a.ability_icons[zt].icon;let{windows:Pe,anchors:$t}=Ls({topWindows:a.defensive_windows,playerWindows:J,playerDefensives:E,fightDurationS:h,abilities:a.ability_icons});return {findings:A,spellIdsByName:a.cd_spell_ids,iconByName:ne,windows:Pe,anchors:$t}}catch(l){return V_(`DefensiveFeatureService.loadAnalysisView ${n}:${r}`,l),{findings:[],spellIdsByName:a.cd_spell_ids,iconByName:{},windows:[],anchors:[]}}}async loadPlan(i,e){let n=await this.source.getBench(i,e);return $s(n)}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};
export{$e as $,Cc as C,Ft as F,Hi as H,Ir as I,Je as J,Lr as L,Mr as M,Ni as N,Pi as P,Qi as Q,Rr as R,Sc as S,Tr as T,Ui as U,Ve as V,Wi as W,Yi as Y,_t as _,vo as a,Cr as b,Sr as c,Mt as d,bt as e,Ct as f,Vr as g,hc as h,Tt as i,Se as j,ki as k,mr as m,qe as q,te as t,vt as v,wr as w,yt as y,ze as z};