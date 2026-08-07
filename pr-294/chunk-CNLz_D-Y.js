import {a2 as x,T,be as Nb,bf as oi,bg as VD,bh as BD,bi as UD,bj as Pb,bk as jD,bl as WD,bm as zD,bn as $D,bo as GD,bp as YD,ba as Wb,bq as HD,o as oe,br as qa$1,bs as ye,S as So$1,c as TD,u as ua$1,g as fa$1,m as ma$1,N as HI,P as xl$1,bt as Bs$1,R as J,V as gr$1,aB as lF,W as P,a1 as Wt$1,Y as Se,aT as sF,bu as aF,a4 as V_,a3 as ee,aC as Ae,bv as _t$1,C as Cu,bw as Yh,n as ne,bx as Gh,M as Sn$1,by as Kh,D as Dh,bz as pF,j as jI,bA as mc$1,aH as SE,bB as Yf,p as oi$1,x as cp,A as aE,aI as NE,t as bc$1,B as ov,af as yp,F as cE,G as fD,aW as pp,aP as dp,aX as kE,aQ as AE,aR as RE,bC as fp,bD as up,aa as UI,ad as sp,bE as bu,bF as Ar$1,bG as bt$1,a0 as Uv,X as ht$1,bH as Id$1,a5 as Zi,bI as Nh,e as Ch,aD as He,a7 as rd$1,a8 as ud$1,aF as Lp,bJ as Lr,bK as Sr$1,bL as Jt$1,bM as qn$1,bN as Or$1,bO as fr$1,bP as G,bQ as _u,ab as sm$1,ac as dF,aN as fF,b1 as pu,z as np,aJ as OE,ae as ep,E as tp,au as re,aE as sa$1,bR as Yn$1,a9 as Ys$1,bS as Uy,aG as q_,ag as iF,ai as fv,aj as hv,s as nD,aS as xc$1,bT as Sp,bU as sD,aO as qE,bV as cD,bW as lf,ah as oF,bX as WI,bY as Yb,bZ as Gb,b_ as at$1,b$ as Qa$1,c0 as Sh,c1 as ge,c2 as W,b3 as rp,a_ as _c$1,b0 as Mc$1,ao as _E,aw as hr$1,c3 as la$1,c4 as $y,c5 as kr$1,aq as Cp,c6 as Pd$1,bd as hu,c7 as ip,b7 as mp,c8 as Xa$1,ax as ri,c9 as Ya$1,ca as _D,k as Ib,ak as Wd$1,an as dE,ap as fE,am as vE,ar as tu,as as nu,cb as Za$1,cc as Ka$1,cd as Oy,aU as Le,U,$,ay as mD,az as vD,H as Jn$1,ce as S,cf as Qh,cg as bp,ch as ED,ci as Qd$1,cj as aD,ck as uE}from'./main-XJ4OU7P4.js';var bn=class{_box;_destroyed=new ee;_resizeSubject=new ee;_resizeObserver;_elementObservables=new Map;constructor(o){this._box=o,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(o){return this._elementObservables.has(o)||this._elementObservables.set(o,new S(e=>{let n=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(o,{box:this._box}),()=>{this._resizeObserver?.unobserve(o),n.unsubscribe(),this._elementObservables.delete(o);}}).pipe(Sn$1(e=>e.some(n=>n.target===o)),Qh({bufferSize:1,refCount:true}),Kh(this._destroyed))),this._elementObservables.get(o)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},po=(()=>{class t{_cleanupErrorListener;_observers=new Map;_ngZone=T(Se);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,n){let i=n?.box||"content-box";return this._observers.has(i)||this._observers.set(i,new bn(i)),this._observers.get(i).observe(e)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=hr$1({token:t,factory:t.\u0275fac})}return t})();var nr=["notch"],ir=["*"],fo=["iconPrefixContainer"],uo=["textPrefixContainer"],ho=["iconSuffixContainer"],_o=["textSuffixContainer"],or=["textField"],ar=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],rr=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function lr(t,o){t&1&&np(0,"span",21);}function sr(t,o){if(t&1&&(oi$1(0,"label",20),NE(1,1),aE(2,lr,1,0,"span",21),bc$1()),t&2){let e=_E(2);tp("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),ep("for",e._control.disableAutomaticLabeling?null:e._control.id),ov(2),cE(!e.hideRequiredMarker&&e._control.required?2:-1);}}function dr(t,o){if(t&1&&aE(0,sr,3,5,"label",20),t&2){let e=_E();cE(e._hasFloatingLabel()?0:-1);}}function cr(t,o){t&1&&np(0,"div",7);}function mr(t,o){}function pr(t,o){if(t&1&&Yf(0,mr,0,0,"ng-template",13),t&2){_E(2);let e=OE(1);tp("ngTemplateOutlet",e);}}function fr(t,o){if(t&1&&(oi$1(0,"div",9),aE(1,pr,1,1,null,13),bc$1()),t&2){let e=_E();tp("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),ov(),cE(e._forceDisplayInfixLabel()?-1:1);}}function ur(t,o){t&1&&(oi$1(0,"div",10,2),NE(2,2),bc$1());}function hr(t,o){t&1&&(oi$1(0,"div",11,3),NE(2,3),bc$1());}function _r(t,o){}function gr(t,o){if(t&1&&Yf(0,_r,0,0,"ng-template",13),t&2){_E();let e=OE(1);tp("ngTemplateOutlet",e);}}function vr(t,o){t&1&&(oi$1(0,"div",14,4),NE(2,4),bc$1());}function xr(t,o){t&1&&(oi$1(0,"div",15,5),NE(2,5),bc$1());}function br(t,o){t&1&&np(0,"div",16);}function yr(t,o){t&1&&(oi$1(0,"div",18),NE(1,6),bc$1());}function Cr(t,o){if(t&1&&(oi$1(0,"mat-hint",22),nD(1),bc$1()),t&2){let e=_E(2);tp("id",e._hintLabelId),ov(),Cp(e.hintLabel);}}function wr(t,o){if(t&1&&(oi$1(0,"div",19),aE(1,Cr,2,2,"mat-hint",22),NE(2,7),np(3,"div",23),NE(4,8),bc$1()),t&2){let e=_E();ov(),cE(e.hintLabel?1:-1);}}var ht=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-label"]]})}return t})(),Cn=new x("MatError"),Sr=(()=>{class t{id=T(Wt$1).getId("mat-mdc-error-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-error"],["","matError",""]],hostAttrs:[1,"mat-mdc-form-field-error","mat-mdc-form-field-bottom-align"],hostVars:1,hostBindings:function(n,i){n&2&&sp("id",i.id);},inputs:{id:"id"},features:[fD([{provide:Cn,useExisting:t}])]})}return t})(),yn=(()=>{class t{align="start";id=T(Wt$1).getId("mat-mdc-hint-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(n,i){n&2&&(sp("id",i.id),ep("align",null),yp("mat-mdc-form-field-hint-end",i.align==="end"));},inputs:{align:"align",id:"id"}})}return t})(),wo=new x("MatPrefix");var So=new x("MatSuffix");var Mo=new x("FloatingLabelParent"),go=(()=>{class t{_elementRef=T(gr$1);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=T(po);_ngZone=T(Se);_parent=T(Mo);_resizeSubscription=new W;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return Mr(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-floating-label--float-above",i.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return t})();function Mr(t){let o=t;if(o.offsetParent!==null)return o.scrollWidth;let e=o.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let n=e.scrollWidth;return e.remove(),n}var vo="mdc-line-ripple--active",Wt="mdc-line-ripple--deactivating",xo=(()=>{class t{_elementRef=T(gr$1);_cleanupTransitionEnd;constructor(){let e=T(Se),n=T(Uv);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=n.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(Wt),e.add(vo);}deactivate(){this._elementRef.nativeElement.classList.add(Wt);}_handleTransitionEnd=e=>{let n=this._elementRef.nativeElement.classList,i=n.contains(Wt);e.propertyName==="opacity"&&i&&n.remove(vo,Wt);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return t})(),bo=(()=>{class t{_elementRef=T(gr$1);_ngZone=T(Se);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,n=e.querySelector(".mdc-floating-label");n?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(n.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>n.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let n=this._notch.nativeElement;!this.open||!e?n.style.width="":n.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(n,i){if(n&1&&dp(nr,5),n&2){let a;AE(a=RE())&&(i._notch=a.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-notched-outline--notched",i.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:ir,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(n,i){n&1&&(SE(),rp(0,"div",1),_c$1(1,"div",2,0),NE(3),Mc$1(),rp(4,"div",3));},encapsulation:2})}return t})(),zt=(()=>{class t{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t})}return t})();var Gt=new x("MatFormField"),ko=new x("MAT_FORM_FIELD_DEFAULT_OPTIONS"),yo="fill",kr="auto",Co="fixed",Tr="translateY(-50%)",Vt=(()=>{class t{_elementRef=T(gr$1);_changeDetectorRef=T(lF);_platform=T(P);_idGenerator=T(Wt$1);_ngZone=T(Se);_defaults=T(ko,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=sF("iconPrefixContainer");_textPrefixContainerSignal=sF("textPrefixContainer");_iconSuffixContainerSignal=sF("iconSuffixContainer");_textSuffixContainerSignal=sF("textSuffixContainer");_prefixSuffixContainers=TD(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=aF(ht);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=V_(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||kr}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let n=e||this._defaults?.appearance||yo;this._appearanceSignal.set(n);}_appearanceSignal=So$1(yo);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||Co}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||Co;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ee;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=Ae();constructor(){let e=this._defaults,n=T(_t$1);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),Cu(()=>this._currentDirection=n.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=TD(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let n=this._control,i="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(i+e.controlType),n.controlType&&this._elementRef.nativeElement.classList.add(i+n.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=n.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=n.stateChanges.pipe(Yh([void 0,void 0]),ne(()=>[n.errorState,n.userAriaDescribedBy]),Gh(),Sn$1(([[a,r],[l,s]])=>a!==l||r!==s)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),n.ngControl&&n.ngControl.valueChanges&&(this._valueChanges=n.ngControl.valueChanges.pipe(Kh(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),Dh(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){pF({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=TD(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let n=this._control?this._control.ngControl:null;return n&&n[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let a=this._hintChildren?this._hintChildren.find(l=>l.align==="start"):null,r=this._hintChildren?this._hintChildren.find(l=>l.align==="end"):null;a?e.push(a.id):this._hintLabel&&e.push(this._hintLabelId),r&&e.push(r.id);}else this._errorChildren&&e.push(...this._errorChildren.map(a=>a.id));let n=this._control.describedByIds,i;if(n){let a=this._describedByIds||e;i=e.concat(n.filter(r=>r&&!a.includes(r)));}else i=e;this._control.setDescribedByIds(i),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,n=this._textPrefixContainer?.nativeElement,i=this._iconSuffixContainer?.nativeElement,a=this._textSuffixContainer?.nativeElement,r=e?.getBoundingClientRect().width??0,l=n?.getBoundingClientRect().width??0,s=i?.getBoundingClientRect().width??0,m=a?.getBoundingClientRect().width??0,f=this._currentDirection==="rtl"?"-1":"1",h=`${r+l}px`,y=`calc(${f} * (${h} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,C=`var(--mat-mdc-form-field-label-transform, ${Tr} translateX(${y}))`,E=r+l+s+m;return [C,E]}_writeOutlinedLabelStyles(e){if(e!==null){let[n,i]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=n),i!==null&&this._notchedOutline?._setMaxWidth(i);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let n=e.getRootNode();return n&&n!==e}return document.documentElement.contains(e)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-form-field"]],contentQueries:function(n,i,a){if(n&1&&(fp(a,i._labelChild,ht,5),up(a,zt,5)(a,wo,5)(a,So,5)(a,Cn,5)(a,yn,5)),n&2){kE();let r;AE(r=RE())&&(i._formFieldControl=r.first),AE(r=RE())&&(i._prefixChildren=r),AE(r=RE())&&(i._suffixChildren=r),AE(r=RE())&&(i._errorChildren=r),AE(r=RE())&&(i._hintChildren=r);}},viewQuery:function(n,i){if(n&1&&(pp(i._iconPrefixContainerSignal,fo,5)(i._textPrefixContainerSignal,uo,5)(i._iconSuffixContainerSignal,ho,5)(i._textSuffixContainerSignal,_o,5),dp(or,5)(fo,5)(uo,5)(ho,5)(_o,5)(go,5)(bo,5)(xo,5)),n&2){kE(4);let a;AE(a=RE())&&(i._textField=a.first),AE(a=RE())&&(i._iconPrefixContainer=a.first),AE(a=RE())&&(i._textPrefixContainer=a.first),AE(a=RE())&&(i._iconSuffixContainer=a.first),AE(a=RE())&&(i._textSuffixContainer=a.first),AE(a=RE())&&(i._floatingLabel=a.first),AE(a=RE())&&(i._notchedOutline=a.first),AE(a=RE())&&(i._lineRipple=a.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(n,i){n&2&&yp("mat-mdc-form-field-label-always-float",i._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",i._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",i._hasIconSuffix)("mat-form-field-invalid",i._control.errorState)("mat-form-field-disabled",i._control.disabled)("mat-form-field-autofilled",i._control.autofilled)("mat-form-field-appearance-fill",i.appearance=="fill")("mat-form-field-appearance-outline",i.appearance=="outline")("mat-form-field-hide-placeholder",i._hasFloatingLabel()&&!i._shouldLabelFloat())("mat-primary",i.color!=="accent"&&i.color!=="warn")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("ng-untouched",i._shouldForward("untouched"))("ng-touched",i._shouldForward("touched"))("ng-pristine",i._shouldForward("pristine"))("ng-dirty",i._shouldForward("dirty"))("ng-valid",i._shouldForward("valid"))("ng-invalid",i._shouldForward("invalid"))("ng-pending",i._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[fD([{provide:Gt,useExisting:t},{provide:Mo,useExisting:t}])],ngContentSelectors:rr,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(n,i){if(n&1&&(SE(ar),Yf(0,dr,1,1,"ng-template",null,0,ED),oi$1(2,"div",6,1),cp("click",function(r){return i._control.onContainerClick(r)}),aE(4,cr,1,0,"div",7),oi$1(5,"div",8),aE(6,fr,2,2,"div",9),aE(7,ur,3,0,"div",10),aE(8,hr,3,0,"div",11),oi$1(9,"div",12),aE(10,gr,1,1,null,13),NE(11),bc$1(),aE(12,vr,3,0,"div",14),aE(13,xr,3,0,"div",15),bc$1(),aE(14,br,1,0,"div",16),bc$1(),oi$1(15,"div",17),aE(16,yr,2,0,"div",18)(17,wr,5,1,"div",19),bc$1()),n&2){let a;ov(2),yp("mdc-text-field--filled",!i._hasOutline())("mdc-text-field--outlined",i._hasOutline())("mdc-text-field--no-label",!i._hasFloatingLabel())("mdc-text-field--disabled",i._control.disabled)("mdc-text-field--invalid",i._control.errorState),ov(2),cE(!i._hasOutline()&&!i._control.disabled?4:-1),ov(2),cE(i._hasOutline()?6:-1),ov(),cE(i._hasIconPrefix?7:-1),ov(),cE(i._hasTextPrefix?8:-1),ov(2),cE(!i._hasOutline()||i._forceDisplayInfixLabel()?10:-1),ov(2),cE(i._hasTextSuffix?12:-1),ov(),cE(i._hasIconSuffix?13:-1),ov(),cE(i._hasOutline()?-1:14),ov(),yp("mat-mdc-form-field-subscript-dynamic-size",i.subscriptSizing==="dynamic");let r=i._getSubscriptMessageType();ov(),cE((a=r)==="error"?16:a==="hint"?17:-1);}},dependencies:[go,bo,mc$1,xo,yn],styles:[`.mdc-text-field {
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
`],encapsulation:2})}return t})();var jt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[Bs$1,Vt,J]})}return t})();var Dr=["text"],Ir=[[["mat-icon"]],"*"],Fr=["mat-icon","*"];function Ar(t,o){if(t&1&&np(0,"mat-pseudo-checkbox",1),t&2){let e=_E();tp("disabled",e.disabled)("state",e.selected?"checked":"unchecked");}}function Or(t,o){if(t&1&&np(0,"mat-pseudo-checkbox",3),t&2){let e=_E();tp("disabled",e.disabled);}}function Rr(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),xc$1("(",e.group.label,")");}}var Sn=new x("MAT_OPTION_PARENT_COMPONENT"),Mn=new x("MatOptgroup");var wn=class{source;isUserInput;constructor(o,e=false){this.source=o,this.isUserInput=e;}},Je=(()=>{class t{_element=T(gr$1);_changeDetectorRef=T(lF);_parent=T(Sn,{optional:true});group=T(Mn,{optional:true});_signalDisableRipple=false;_selected=false;_active=false;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=T(Wt$1).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=So$1(false);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return !!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new He;_text;_stateChanges=new ee;constructor(){let e=T(re);e.load(sa$1),e.load(Yn$1),this._signalDisableRipple=!!this._parent&&Ys$1(this._parent.disableRipple);}get active(){return this._active}get viewValue(){return (this._text?.nativeElement.textContent||"").trim()}select(e=true){this._selected||(this._selected=true,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}deselect(e=true){this._selected&&(this._selected=false,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}focus(e,n){let i=this._getHostElement();typeof i.focus=="function"&&i.focus(n);}setActiveStyles(){this._active||(this._active=true,this._changeDetectorRef.markForCheck());}setInactiveStyles(){this._active&&(this._active=false,this._changeDetectorRef.markForCheck());}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!qn$1(e)&&(this._selectViaInteraction(),e.preventDefault());}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:true,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(true));}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e);}}ngOnDestroy(){this._stateChanges.complete();}_emitSelectionChangeEvent(e=false){this.onSelectionChange.emit(new wn(this,e));}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-option"]],viewQuery:function(n,i){if(n&1&&dp(Dr,7),n&2){let a;AE(a=RE())&&(i._text=a.first);}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(n,i){n&1&&cp("click",function(){return i._selectViaInteraction()})("keydown",function(r){return i._handleKeydown(r)}),n&2&&(sp("id",i.id),ep("aria-selected",i.selected)("aria-disabled",i.disabled.toString()),yp("mdc-list-item--selected",i.selected)("mat-mdc-option-multiple",i.multiple)("mat-mdc-option-active",i.active)("mdc-list-item--disabled",i.disabled));},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",dF]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:Fr,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(n,i){n&1&&(SE(Ir),aE(0,Ar,1,2,"mat-pseudo-checkbox",1),NE(1),oi$1(2,"span",2,0),NE(4,1),bc$1(),aE(5,Or,1,1,"mat-pseudo-checkbox",3),aE(6,Rr,2,1,"span",4),np(7,"div",5)),n&2&&(cE(i.multiple?0:-1),ov(5),cE(!i.multiple&&i.selected&&!i.hideSingleSelectionIndicator?5:-1),ov(),cE(i.group&&i.group._inert?6:-1),ov(),tp("matRippleTrigger",i._getHostElement())("matRippleDisabled",i.disabled||i.disableRipple));},dependencies:[Uy,q_],styles:[`.mat-mdc-option {
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
`],encapsulation:2})}return t})();function To(t,o,e){if(e.length){let n=o.toArray(),i=e.toArray(),a=0;for(let r=0;r<t+1;r++)n[r].group&&n[r].group===i[a]&&a++;return a}return 0}function Eo(t,o,e,n){return t<e?t:t+o>e+n?Math.max(0,t-n+o):e}var Do=(()=>{class t{isErrorState(e,n){return !!(e&&e.invalid&&(e.touched||n&&n.submitted))}static \u0275fac=function(n){return new(n||t)};static \u0275prov=hr$1({token:t,factory:t.\u0275fac})}return t})();var Ut=class{_defaultMatcher;ngControl;_parentFormGroup;_parentForm;_stateChanges;errorState=false;matcher;constructor(o,e,n,i,a){this._defaultMatcher=o,this.ngControl=e,this._parentFormGroup=n,this._parentForm=i,this._stateChanges=a;}updateErrorState(){let o=this.errorState,e=this._parentFormGroup||this._parentForm,n=this.matcher||this._defaultMatcher,i=this.ngControl?this.ngControl.control:null,a=n?.isErrorState(i,e)??false;a!==o&&(this.errorState=a,this._stateChanges.next());}};var kn=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[la$1,$y,Je,J]})}return t})();var Br=["trigger"],Wr=["panel"],zr=[[["mat-select-trigger"]],"*"],Gr=["mat-select-trigger","*"];function Vr(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.placeholder);}}function jr(t,o){t&1&&NE(0);}function qr(t,o){if(t&1&&(oi$1(0,"span",11),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.triggerValue);}}function Hr(t,o){if(t&1&&(oi$1(0,"span",5),aE(1,jr,1,0)(2,qr,2,1,"span",11),bc$1()),t&2){let e=_E();ov(),cE(e.customTrigger?1:2);}}function Ur(t,o){if(t&1){let e=vE();oi$1(0,"div",12,1),cp("keydown",function(i){tu(e);let a=_E();return nu(a._handleKeydown(i))}),NE(2,1),bc$1();}if(t&2){let e=_E();qE(e.panelClass),yp("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),ep("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Qr=new x("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let t=T(ye);return ()=>kr$1(t)}}),Kr=new x("MAT_SELECT_CONFIG"),Ao=new x("MatSelectTrigger"),Tn=class{source;value;constructor(o,e){this.source=o,this.value=e;}},Oo=(()=>{class t{_viewportRuler=T(bt$1);_changeDetectorRef=T(lF);_elementRef=T(gr$1);_dir=T(_t$1,{optional:true});_idGenerator=T(Wt$1);_renderer=T(Uv);_parentFormField=T(Gt,{optional:true});ngControl=T(ht$1,{self:true,optional:true});_liveAnnouncer=T(Id$1);_defaultOptions=T(Kr,{optional:true});_animationsDisabled=Ae();_popoverLocation;_initialized=new ee;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let n=this.options.toArray()[e];if(n){let i=this.panel.nativeElement,a=To(e,this.options,this.optionGroups),r=n._getHostElement();e===0&&a===1?i.scrollTop=0:i.scrollTop=Eo(r.offsetTop,r.offsetHeight,i.scrollTop,i.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new Tn(this,e)}_scrollStrategyFactory=T(Qr);_panelOpen=false;_compareWith=(e,n)=>e===n;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ee;_errorStateTracker;stateChanges=new ee;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=So$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(Zi.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=Nh(()=>{let e=this.options;return e?e.changes.pipe(Yh(e),Ch(()=>Dh(...e.map(n=>n.onSelectionChange)))):this._initialized.pipe(Ch(()=>this.optionSelectionChanges))});openedChange=new He;_openedStream=this.openedChange.pipe(Sn$1(e=>e),ne(()=>{}));_closedStream=this.openedChange.pipe(Sn$1(e=>!e),ne(()=>{}));selectionChange=new He;valueChange=new He;constructor(){let e=T(Do),n=T(rd$1,{optional:true}),i=T(ud$1,{optional:true}),a=T(new Lp("tabindex"),{optional:true}),r=T(Lr,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new Ut(e,this.ngControl,i,n,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=a==null?0:parseInt(a)||0,this._popoverLocation=r?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new Sr$1(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(Kh(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(Kh(this._destroy)).subscribe(e=>{e.added.forEach(n=>n.select()),e.removed.forEach(n=>n.deselect());}),this.options.changes.pipe(Yh(null),Kh(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),n=this.ngControl;if(e!==this._triggerAriaLabelledBy){let i=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?i.setAttribute("aria-labelledby",e):i.removeAttribute("aria-labelledby");}n&&(this._previousControl!==n.control&&(this._previousControl!==void 0&&n.disabled!==null&&n.disabled!==this.disabled&&(this.disabled=n.disabled),this._previousControl=n.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(Jt$1(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{n(),clearTimeout(i),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,n=this._renderer.listen(e,"animationend",a=>{a.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),i=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(n=>n.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let n=e.keyCode,i=n===40||n===38||n===37||n===39,a=n===13||n===32,r=this._keyManager;if(!r.isTyping()&&a&&!qn$1(e)||(this.multiple||e.altKey)&&i)e.preventDefault(),this.open();else if(!this.multiple){let l=this.selected;r.onKeydown(e);let s=this.selected;s&&l!==s&&this._liveAnnouncer.announce(s.viewValue,1e4);}}_handleOpenKeydown(e){let n=this._keyManager,i=e.keyCode,a=i===40||i===38,r=n.isTyping();if(a&&e.altKey)e.preventDefault(),this.close();else if(!r&&(i===13||i===32)&&n.activeItem&&!qn$1(e))e.preventDefault(),n.activeItem._selectViaInteraction();else if(!r&&this._multiple&&i===65&&e.ctrlKey){e.preventDefault();let l=this.options.some(s=>!s.disabled&&!s.selected);this.options.forEach(s=>{s.disabled||(l?s.select():s.deselect());});}else {let l=n.activeItemIndex;n.onKeydown(e),this._multiple&&a&&e.shiftKey&&n.activeItem&&n.activeItemIndex!==l&&n.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!qn$1(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(n=>n.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(n=>this._selectOptionByValue(n)),this._sortValues();else {let n=this._selectOptionByValue(e);n?this._keyManager.updateActiveItem(n):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let n=this.options.find(i=>{if(this._selectionModel.isSelected(i))return  false;try{return (i.value!=null||this.canSelectNullableOptions)&&this._compareWith(i.value,e)}catch{return  false}});return n&&this._selectionModel.select(n),n}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof Or$1?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new fr$1(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=Dh(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Kh(e)).subscribe(n=>{this._onSelect(n.source,n.isUserInput),n.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),Dh(...this.options.map(n=>n._stateChanges)).pipe(Kh(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,n){let i=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(i!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),n&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),n&&this.focus())),i!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((n,i)=>this.sortComparator?this.sortComparator(n,i,e):e.indexOf(n)-e.indexOf(i)),this.stateChanges.next();}}_propagateChanges(e){let n;this.multiple?n=this.selected.map(i=>i.value):n=this.selected?this.selected.value:e,this._value=n,this.valueChange.emit(n),this._onChange(n),this.selectionChange.emit(this._getChangeEvent(n)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let n=0;n<this.options.length;n++)if(!this.options.get(n).disabled){e=n;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,n=e?e+" ":"";return this.ariaLabelledby?n+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let n=this._elementRef.nativeElement;e.length?n.setAttribute("aria-describedby",e.join(" ")):n.removeAttribute("aria-describedby");}onContainerClick(e){let n=G(e);n&&(n.tagName==="MAT-OPTION"||n.classList.contains("cdk-overlay-backdrop")||n.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-select"]],contentQueries:function(n,i,a){if(n&1&&up(a,Ao,5)(a,Je,5)(a,Mn,5),n&2){let r;AE(r=RE())&&(i.customTrigger=r.first),AE(r=RE())&&(i.options=r),AE(r=RE())&&(i.optionGroups=r);}},viewQuery:function(n,i){if(n&1&&dp(Br,5)(Wr,5)(_u,5),n&2){let a;AE(a=RE())&&(i.trigger=a.first),AE(a=RE())&&(i.panel=a.first),AE(a=RE())&&(i._overlayDir=a.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(n,i){n&1&&cp("keydown",function(r){return i._handleKeydown(r)})("focus",function(){return i._onFocus()})("blur",function(){return i._onBlur()}),n&2&&(ep("id",i.id)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i.panelOpen?i.id+"-panel":null)("aria-expanded",i.panelOpen)("aria-label",i.ariaLabel||null)("aria-required",i.required.toString())("aria-disabled",i.disabled.toString())("aria-invalid",i.errorState)("aria-activedescendant",i._getAriaActiveDescendant()),yp("mat-mdc-select-disabled",i.disabled)("mat-mdc-select-invalid",i.errorState)("mat-mdc-select-required",i.required)("mat-mdc-select-empty",i.empty)("mat-mdc-select-multiple",i.multiple)("mat-select-open",i.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",dF],disableRipple:[2,"disableRipple","disableRipple",dF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:fF(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",dF],placeholder:"placeholder",required:[2,"required","required",dF],multiple:[2,"multiple","multiple",dF],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",dF],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",fF],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",dF]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[fD([{provide:zt,useExisting:t},{provide:Sn,useExisting:t}]),sm$1],ngContentSelectors:Gr,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(n,i){if(n&1&&(SE(zr),oi$1(0,"div",2,0),cp("click",function(){return i.open()}),oi$1(3,"div",3),aE(4,Vr,2,1,"span",4)(5,Hr,3,1,"span",5),bc$1(),oi$1(6,"div",6)(7,"div",7),pu(),oi$1(8,"svg",8),np(9,"path",9),bc$1()()()(),Yf(10,Ur,3,16,"ng-template",10),cp("detach",function(){return i.close()})("backdropClick",function(){return i.close()})("overlayKeydown",function(r){return i._handleOverlayKeydown(r)})),n&2){let a=OE(1);ov(3),ep("id",i._valueId),ov(),cE(i.empty?4:5),ov(6),tp("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",i._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",i._scrollStrategy)("cdkConnectedOverlayOrigin",i._preferredOverlayOrigin||a)("cdkConnectedOverlayPositions",i._positions)("cdkConnectedOverlayWidth",i._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",i._popoverLocation);}},dependencies:[Or$1,_u],styles:[`@keyframes _mat-select-enter {
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
`],encapsulation:2})}return t})(),Gp=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-select-trigger"]],features:[fD([{provide:Ao,useExisting:t}])]})}return t})(),Ro=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[bu,kn,J,Ar$1,jt,kn]})}return t})();var Xr=["*"];var Zr=new x("MAT_CARD_CONFIG"),Yp=(()=>{class t{appearance;constructor(){let e=T(Zr,{optional:true});this.appearance=e?.appearance||"raised";}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-card"]],hostAttrs:[1,"mat-mdc-card","mdc-card"],hostVars:8,hostBindings:function(n,i){n&2&&yp("mat-mdc-card-outlined",i.appearance==="outlined")("mdc-card--outlined",i.appearance==="outlined")("mat-mdc-card-filled",i.appearance==="filled")("mdc-card--filled",i.appearance==="filled");},inputs:{appearance:"appearance"},exportAs:["matCard"],ngContentSelectors:Xr,decls:1,vars:0,template:function(n,i){n&1&&(SE(),NE(0));},styles:[`.mat-mdc-card {
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
`],encapsulation:2})}return t})();var Xp=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[J]})}return t})();var Jr="https://www.warcraftlogs.com/oauth/token",Po=(()=>{class t{http=T(at$1);_token=null;_expiry=0;_inFlight=null;async getToken(){return this._token&&Date.now()<this._expiry-6e4?this._token:this._inFlight?this._inFlight:(this._inFlight=this._fetchToken().finally(()=>{this._inFlight=null;}),this._inFlight)}async _fetchToken(){let e=new URLSearchParams({grant_type:"client_credentials",client_id:Qa$1.wclClientId,client_secret:Qa$1.wclClientSecret}),n;try{n=await Sh(this.http.post(Jr,e.toString(),{headers:{"Content-Type":"application/x-www-form-urlencoded"}}));}catch(a){let r=a instanceof ge?a.status:0,l=a instanceof ge?typeof a.error=="string"?a.error:JSON.stringify(a.error):"";throw new oi(`WCL token request failed (${r}): ${l}`,r)}let i=n?.access_token;if(typeof i!="string"||i.length===0)throw new oi("WCL token response carried no access_token.",0);return this._token=i,this._expiry=Date.now()+(n.expires_in||3600)*1e3,this._token}invalidate(){this._token=null,this._expiry=0;}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var xe=(()=>{class t{auth=T(Po);transport=T(Nb);async query(e,n={}){let i=await this.auth.getToken();try{return await this.transport.query(e,n,i)}catch(a){if(a instanceof oi&&a.status===401){this.auth.invalidate();let r=await this.auth.getToken();return await this.transport.query(e,n,r)}throw a}}async getReport(e){let n={code:e},a=(await this.query(VD,n))?.reportData?.report;if(!a)throw this.reportUnavailable(e);return a}async getReportFights(e){let n={code:e},a=(await this.query(BD,n))?.reportData?.report;if(!a)throw this.reportUnavailable(e);return a.fights??[]}async getPlayerDetails(e,n){let i={code:e,fightIDs:[n]},r=(await this.query(UD,i))?.reportData?.report?.playerDetails?.data?.playerDetails;if(!r)throw this.reportUnavailable(e);return r}reportUnavailable(e){return new oi(`WCL report ${e} is unavailable (not found, private, or expired).`,Pb)}async getAllEvents(e,n,i,a,r,l,s=false,m){let f=[],h=a;for(;;){let x={code:e,fightIDs:[n],dataType:i,startTime:h,endTime:r};l!=null&&(x.sourceID=l),s&&(x.includeResources=true),m&&(x.hostilityType=m);let C=(await this.query(jD,x)).reportData.report.events;for(let E of C.data??[])f.push(E);if(!C.nextPageTimestamp)break;h=C.nextPageTimestamp;}return f}async getCombatantInfo(e,n,i){let a={code:e,fightIDs:[n],sourceID:i},l=(await this.query(WD,a))?.reportData?.report;if(!l)throw this.reportUnavailable(e);return l.events?.data??[]}async getDamageDoneTable(e,n){let i={code:e,fightIDs:[n],dataType:"DamageDone"};return (await this.query(zD,i))?.reportData?.report?.table??null}async getResurrects(e,n,i,a){let r=[],l=i;for(;;){let s={code:e,fightIDs:[n],filter:'type = "resurrect"',startTime:l,endTime:a},f=(await this.query($D,s)).reportData.report.events;for(let h of f.data??[])r.push(h);if(!f.nextPageTimestamp)break;l=f.nextPageTimestamp;}return r}async getGameNames(e,n){return !e.length&&!n.length?{}:(await this.query(GD(e,n)))?.gameData??{}}async getAbilities(e){let n=[...new Set(e)].filter(a=>a>0);return n.length?(await this.query(YD(n)))?.gameData??{}:{}}async getRankings(e,n){let i=Wb(e);if(!i)return null;let a={encounterID:n,className:i.className,specName:i.specName};return (await this.query(HD,a))?.worldData?.encounter?.characterRankings??null}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var el=["determinateSpinner"];function tl(t,o){if(t&1&&(pu(),oi$1(0,"svg",11),np(1,"circle",12),bc$1()),t&2){let e=_E();ep("viewBox",e._viewBox()),ov(),mp("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),ep("r",e._circleRadius());}}var nl=new x("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:No})}),No=100,il=10,Lo=(()=>{class t{_elementRef=T(gr$1);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=T(nl),n=Pd$1(),i=this._elementRef.nativeElement;this._noopAnimations=n==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=i.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&n==="reduced-motion"&&i.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=No;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-il)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(n,i){if(n&1&&dp(el,5),n&2){let a;AE(a=RE())&&(i._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(n,i){n&2&&(ep("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",i.mode==="determinate"?i.value:null)("mode",i.mode),qE("mat-"+i.color),mp("width",i.diameter,"px")("height",i.diameter,"px")("--mat-progress-spinner-size",i.diameter+"px")("--mat-progress-spinner-active-indicator-width",i.diameter+"px"),yp("_mat-animation-noopable",i._noopAnimations)("mdc-circular-progress--indeterminate",i.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",fF],diameter:[2,"diameter","diameter",fF],strokeWidth:[2,"strokeWidth","strokeWidth",fF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(n,i){if(n&1&&(Yf(0,tl,2,8,"ng-template",null,0,ED),oi$1(2,"div",2,1),pu(),oi$1(4,"svg",3),np(5,"circle",4),bc$1()(),hu(),oi$1(6,"div",5)(7,"div",6)(8,"div",7),ip(9,8),bc$1(),oi$1(10,"div",9),ip(11,8),bc$1(),oi$1(12,"div",10),ip(13,8),bc$1()()()),n&2){let a=OE(1);ov(4),ep("viewBox",i._viewBox()),ov(),mp("stroke-dasharray",i._strokeCircumference(),"px")("stroke-dashoffset",i._strokeDashOffset(),"px")("stroke-width",i._circleStrokeWidth(),"%"),ep("r",i._circleRadius()),ov(4),tp("ngTemplateOutlet",a),ov(2),tp("ngTemplateOutlet",a),ov(2),tp("ngTemplateOutlet",a);}},dependencies:[mc$1],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return t})();var $o=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[J]})}return t})();function al(t,o){if(t&1&&(oi$1(0,"span",2),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.message());}}var Tf=(()=>{class t{message=iF("");static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-loading-spinner"]],inputs:{message:[1,"message"]},decls:3,vars:2,consts:[[1,"flex","flex-col","items-center","gap-3","p-12","text-[var(--muted)]"],[3,"diameter"],[1,"text-sm"]],template:function(n,i){n&1&&(oi$1(0,"div",0),np(1,"mat-spinner",1),aE(2,al,2,1,"span",2),bc$1()),n&2&&(ov(),tp("diameter",36),ov(),cE(i.message()?2:-1));},dependencies:[$o,Lo],encapsulation:2})}return t})();function rl(t,o){t&1&&nD(0," The pre-fight plan is built entirely from top-parse logs. Gear, cooldown, defensive and burst plans all need parses - none are in yet. Here's what has to happen first: ");}function ll(t,o){t&1&&nD(0," Your pull graded against the spec rulebook below. Cooldown, burst, defensive and gear comparisons need top-parse logs - none are in yet. Here's what has to happen first: ");}function sl(t,o){t&1&&(oi$1(0,"div",8),nD(1,"Plan unlocks"),bc$1(),oi$1(2,"div",9),nD(3,"The cards below fill in."),bc$1());}function dl(t,o){t&1&&(oi$1(0,"div",8),nD(1,"Comparisons unlock"),bc$1(),oi$1(2,"div",9),nD(3,"The sections below fill in."),bc$1());}var Of=(()=>{class t{encounter=iF("");variant=iF("post");static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-bench-empty-banner"]],hostAttrs:[1,"block"],inputs:{encounter:[1,"encounter"],variant:[1,"variant"]},decls:42,vars:3,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","p-4"],[1,"flex","items-start","gap-2.5"],[1,"icon-18","text-[var(--info)]","mt-px","shrink-0"],[1,"text-sm","font-semibold","text-[var(--text)]"],[1,"text-[12.5px]","text-[var(--muted)]","leading-relaxed","mt-0.5"],[1,"flex","items-stretch","gap-1","bg-[var(--bg)]","border","border-[var(--border)]","rounded-lg","px-4","py-3.5","mt-3.5"],[1,"flex-1","flex","flex-col","gap-1.5"],[1,"icon-seg","text-[var(--muted)]"],[1,"text-xs","font-semibold","text-[var(--text)]"],[1,"text-[11px]","text-[var(--muted)]","leading-snug"],[1,"font-mono","text-[10px]","text-[var(--critical)]","mt-px"],[1,"w-[26px]","shrink-0","flex","items-center","justify-center"],[1,"icon-16","text-[var(--border)]"],[1,"font-mono","text-[10px]","text-[var(--warning)]","mt-px"],[1,"icon-seg","text-[var(--success)]"],[1,"font-mono","text-[10px]","text-[var(--success)]","mt-px"]],template:function(n,i){n&1&&(oi$1(0,"div",0)(1,"div",1)(2,"mat-icon",2),nD(3,"info"),bc$1(),oi$1(4,"div")(5,"div",3),nD(6),bc$1(),oi$1(7,"div",4),aE(8,rl,1,0)(9,ll,1,0),bc$1()()(),oi$1(10,"div",5)(11,"div",6)(12,"mat-icon",7),nD(13,"military_tech"),bc$1(),oi$1(14,"div",8),nD(15,"Mythic kills logged"),bc$1(),oi$1(16,"div",9),nD(17,"Players upload to WCL."),bc$1(),oi$1(18,"div",10),nD(19,"waiting"),bc$1()(),oi$1(20,"div",11)(21,"mat-icon",12),nD(22,"arrow_forward"),bc$1()(),oi$1(23,"div",6)(24,"mat-icon",7),nD(25,"cloud_sync"),bc$1(),oi$1(26,"div",8),nD(27,"Ingest samples them"),bc$1(),oi$1(28,"div",9),nD(29,"We pull new top rankings."),bc$1(),oi$1(30,"div",13),nD(31,"hourly"),bc$1()(),oi$1(32,"div",11)(33,"mat-icon",12),nD(34,"arrow_forward"),bc$1()(),oi$1(35,"div",6)(36,"mat-icon",14),nD(37,"check_circle"),bc$1(),aE(38,sl,4,0)(39,dl,4,0),oi$1(40,"div",15),nD(41,"automatic"),bc$1()()()()),n&2&&(ov(6),xc$1("No benchmark for ",i.encounter()," yet"),ov(2),cE(i.variant()==="pre"?8:9),ov(30),cE(i.variant()==="pre"?38:39));},dependencies:[fv,hv],encapsulation:2})}return t})();function Bo(t){let o=t<0?"-":"",e=Math.abs(t),n=Math.floor(e/60),i=Math.floor(e%60);return `${o}${n}:${String(i).padStart(2,"0")}`}var Wo=(()=>{class t{transform(e){return e==null?"-":Number.isFinite(e)?Bo(e):"0:00"}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatDuration",type:t,pure:true})}return t})(),zo=(()=>{class t{transform(e){return e==null?"-":Number.isFinite(e)?Bo(e/1e3):"0:00"}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatMsDuration",type:t,pure:true})}return t})();function cl(t,o){if(t&1&&(oi$1(0,"div",3),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.subtitle());}}function ml(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",2),nD(2),bc$1(),aE(3,cl,2,1,"div",3),bc$1()),t&2){let e=_E();ov(2),Cp(e.heading()),ov(),cE(e.subtitle()?3:-1);}}function pl(t,o){if(t&1&&(oi$1(0,"mat-icon",4),nD(1),bc$1(),oi$1(2,"div",5),nD(3),bc$1(),oi$1(4,"div",6),nD(5),bc$1()),t&2){_E();let e=aD(0);ov(),Cp(e.kind==="permanent"?"error":"cloud_off"),ov(2),Cp(e.message),ov(2),xc$1(" ",e.kind==="permanent"?"This analysis is bugged. Retrying will not fix it.":"Retries on the next sync, or reselect the fight."," ");}}function fl(t,o){if(t&1&&(oi$1(0,"div",6),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.caption());}}function ul(t,o){if(t&1&&(oi$1(0,"mat-icon",7),nD(1,"schedule"),bc$1(),oi$1(2,"div",5),nD(3,"Waiting for top parses"),bc$1(),aE(4,fl,2,1,"div",6)),t&2){let e=_E();ov(4),cE(e.caption()?4:-1);}}var tt=(()=>{class t{heading=iF("");subtitle=iF("");caption=iF("Built from the top-parse bench.");error=iF(null);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-load-state"]],hostAttrs:[1,"block"],inputs:{heading:[1,"heading"],subtitle:[1,"subtitle"],caption:[1,"caption"],error:[1,"error"]},decls:6,vars:6,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"icon-seg","text-[var(--info)]"],[1,"text-[13px]","text-[var(--muted)]"],[1,"text-[11.5px]","text-[var(--muted)]/70"],[1,"icon-seg","text-[var(--muted)]"]],template:function(n,i){if(n&1&&(Sp(0),oi$1(1,"div",0),aE(2,ml,4,2,"div",1),oi$1(3,"div"),aE(4,pl,6,3)(5,ul,5,1),bc$1()()),n&2){let a=sD(i.error());ov(2),cE(i.heading()?2:-1),ov(),qE(cD("px-4 py-6 flex flex-col items-center gap-2 text-center ",i.heading()?"border-t border-dashed border-[var(--border)]":"")),ov(),cE(a?4:5);}},dependencies:[fv,hv],encapsulation:2})}return t})();var hl="wh-tooltips-config.js",_l="https://wow.zamimg.com/js/tooltips.js",Go=(()=>{class t{document=T(Jn$1);loaded=false;ready=false;refreshScheduled=false;ensureLoaded(){if(this.loaded)return;this.loaded=true;let e=this.document.createElement("script");e.src=hl,e.addEventListener("error",n=>ua$1("wowhead tooltips config load",n)),e.addEventListener("load",()=>{let n=this.document.createElement("script");n.src=_l,n.addEventListener("error",i=>ua$1("wowhead tooltips script load",i)),n.addEventListener("load",()=>{this.ready=true,this.refreshLinks();}),this.document.head.appendChild(n);}),this.document.head.appendChild(e);}refreshLinks(){this.refreshScheduled||(this.refreshScheduled=true,queueMicrotask(()=>{this.refreshScheduled=false,this.ready&&this.document.defaultView?.$WowheadPower?.refreshLinks?.();}));}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function gl(t,o){if(t&1){let e=vE();oi$1(0,"img",3),cp("error",function(){tu(e);let i=_E(),a=_E();return nu(a.failedSrc.set(i))}),bc$1();}if(t&2){let e=_E();tp("ngSrc",e)("width",18)("height",18);}}function vl(t,o){if(t&1&&aE(0,gl,1,3,"img",2),t&2){let e=_E();cE(e.failedSrc()!==o?0:-1);}}var nt=(()=>{class t{constructor(){let e=T(Go);Oy(()=>{e.ensureLoaded(),e.refreshLinks();});}id=iF.required();kind=iF("spell");name=iF.required();icon=iF.required();failedSrc=So$1(null);iconUrl=TD(()=>{let e=this.icon().replace(/\.(jpg|jpeg|png|gif|webp)$/i,"");return e?`https://wow.zamimg.com/images/wow/icons/small/${e}.jpg`:null});wowheadUrl=TD(()=>`https://www.wowhead.com/${this.kind()}=${this.id()}`);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-game-icon"]],hostAttrs:[1,"inline-flex","items-center"],inputs:{id:[1,"id"],kind:[1,"kind"],name:[1,"name"],icon:[1,"icon"]},decls:4,vars:3,consts:[["target","_blank","rel","noopener",1,"inline-flex","items-center","gap-1.5","no-underline","hover:brightness-125",3,"href"],[1,"text-sm"],["alt","",1,"rounded-sm",3,"ngSrc","width","height"],["alt","",1,"rounded-sm",3,"error","ngSrc","width","height"]],template:function(n,i){if(n&1&&(oi$1(0,"a",0),aE(1,vl,1,1),oi$1(2,"span",1),nD(3),bc$1()()),n&2){let a;tp("href",i.wowheadUrl(),Qd$1),ov(),cE((a=i.iconUrl())?1:-1,a),ov(2),Cp(i.name());}},dependencies:[lf],encapsulation:2})}return t})();var Qt=(()=>{class t{transform(e){return e==null?"":e>=1e6||Math.round(e/1e3)>=1e3?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${Math.round(e/1e3)}K`:String(Math.round(e))}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatDamage",type:t,pure:true})}return t})();function xl(t,o){if(t&1&&np(0,"wl-game-icon",3),t&2){let e=_E();tp("id",o)("icon",e.row().icon)("name",e.row().label);}}function bl(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.row().label);}}function yl(t,o){t&1&&nD(0," missed ");}function Cl(t,o){if(t&1&&(nD(0),mD(1,"formatDamage")),t&2){let e=_E(2);bp(" ",e.gapSign(),"",vD(1,2,e.gapMagnitude())," ");}}function wl(t,o){if(t&1&&(oi$1(0,"span",9),aE(1,yl,1,0)(2,Cl,2,4),bc$1()),t&2){let e=_E();yp("badge-success",e.gapStatus()==="success")("badge-warning",e.gapStatus()==="warning")("badge-critical",e.gapStatus()==="critical")("badge-muted",e.gapStatus()==="muted"),ov(),cE(e.row().playerPct==null?1:2);}}function Sl(t,o){t&1&&(oi$1(0,"span",10),nD(1,"passive"),bc$1());}function Ml(t,o){if(t&1&&(oi$1(0,"span",11),nD(1,"Casts"),bc$1(),oi$1(2,"span",12),nD(3),oi$1(4,"span",13),nD(5),bc$1()()),t&2){let e=_E(2);ov(2),yp("badge-success",e.castsStatus()==="success")("badge-warning",e.castsStatus()==="warning")("badge-critical",e.castsStatus()==="critical")("badge-muted",e.castsStatus()==="muted"),ov(),xc$1(" ",e.row().playerCasts??0),ov(2),xc$1(" / ",e.row().topCasts??"-");}}function kl(t,o){if(t&1&&aE(0,Sl,2,0,"span",10)(1,Ml,6,10),t&2){let e=_E();cE(e.isPassive()?0:1);}}var Vo=(()=>{class t{row=iF.required();higherIsBetter=iF(true);showCasts=iF(true);hidePlayer=iF(false);gap=TD(()=>{let{playerPct:e,topAvg:n}=this.row();return e==null||n==null?null:e-n});gapSign=TD(()=>(this.gap()??0)>=0?"+":"-");gapMagnitude=TD(()=>Math.abs(this.gap()??0));gapStatus=TD(()=>{let{playerPct:e,topAvg:n}=this.row();if(e==null)return "critical";let i=this.gap();return i==null||n==null||n===0?"muted":(this.higherIsBetter()?i:-i)>=0?"success":Math.abs(i)<=n*.1?"warning":"critical"});isPassive=TD(()=>this.row().passive===true);castsStatus=TD(()=>{let{playerCasts:e,topCasts:n}=this.row();if(n==null)return "muted";let i=e??0;return i>=n?"success":n-i<=1?"warning":"critical"});static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-compact-ability-row"]],inputs:{row:[1,"row"],higherIsBetter:[1,"higherIsBetter"],showCasts:[1,"showCasts"],hidePlayer:[1,"hidePlayer"]},decls:13,vars:6,consts:[[1,"md:grid","md:grid-cols-[minmax(0,1fr)_96px_96px_90px]","md:gap-x-[14px]","md:items-center","px-4","py-1.5","min-w-0","border-t","md:border-t-0","border-[var(--border)]"],[1,"flex","items-baseline","gap-2","min-w-0","md:contents"],[1,"flex-1","min-w-0","overflow-hidden","md:col-start-1","md:row-start-1"],[3,"id","icon","name"],[1,"truncate","text-sm"],[1,"shrink-0","md:col-start-4","md:row-start-1","text-right","tabular-nums","text-xs","font-semibold",3,"badge-success","badge-warning","badge-critical","badge-muted"],[1,"flex","items-baseline","flex-wrap","gap-x-1.5","gap-y-1","mt-1.5","md:mt-0","md:contents"],[1,"shrink-0","mr-2","md:mr-0","md:col-start-3","md:row-start-1","md:text-left","tabular-nums","text-xs","text-[var(--muted)]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider"],[1,"shrink-0","md:col-start-4","md:row-start-1","text-right","tabular-nums","text-xs","font-semibold"],[1,"shrink-0","md:col-start-2","md:row-start-1","w-auto","text-center","text-xs","rounded","px-2","py-0.5","border","border-current","badge-muted"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"shrink-0","md:col-start-2","md:row-start-1","w-auto","text-center","tabular-nums","text-xs","rounded","px-2","py-0.5","border","border-current"],[1,"text-[var(--muted)]"]],template:function(n,i){if(n&1&&(oi$1(0,"div",0)(1,"div",1)(2,"div",2),aE(3,xl,1,3,"wl-game-icon",3)(4,bl,2,1,"span",4),bc$1(),aE(5,wl,3,9,"span",5),bc$1(),oi$1(6,"div",6)(7,"span",7)(8,"span",8),nD(9,"Top avg "),bc$1(),nD(10),mD(11,"formatDamage"),bc$1(),aE(12,kl,2,1),bc$1()()),n&2){let a;ov(3),cE((a=i.row().spellId)?3:4,a),ov(2),cE(i.hidePlayer()?-1:5),ov(5),xc$1("",vD(11,4,i.row().topAvg)," "),ov(2),cE(i.showCasts()&&!i.hidePlayer()?12:-1);}},dependencies:[nt,Qt],encapsulation:2})}return t})();var jo=(()=>{class t{transform(e){if(e==null||!Number.isFinite(e))return "";let n=Math.round(e);return `${n>0?"+":""}${n}%`}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"signedPercent",type:t,pure:true})}return t})();var Tl=(t,o)=>o.kind==="window"?"w"+o.index:"g"+o.id,El=(t,o)=>o.id,Dl=(t,o)=>o.spellId;function Il(t,o){if(t&1&&(oi$1(0,"div",6),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.subtitle());}}function Fl(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",5),nD(2),bc$1(),aE(3,Il,2,1,"div",6),bc$1()),t&2){let e=_E();ov(2),Cp(e.heading()),ov(),cE(e.subtitle()?3:-1);}}function Al(t,o){t&1&&(oi$1(0,"div",7),np(1,"div",9),oi$1(2,"span",10),nD(3,"0"),bc$1()());}function Ol(t,o){if(t&1){let e=vE();oi$1(0,"div",8)(1,"button",11),mD(2,"formatMsDuration"),cp("click",function(){tu(e);let i=_E().$implicit,a=_E();return nu(a.select(i.index))}),oi$1(3,"mat-icon",12),nD(4),bc$1(),np(5,"span",13),bc$1(),oi$1(6,"span"),nD(7),mD(8,"formatMsDuration"),bc$1()();}if(t&2){let e=_E().$implicit,n=_E(),i=n.windows()[e.index],a=n.activeIndex()===e.index,r=i.status==="good"?"text-[var(--success)]":i.status==="warn"?"text-[var(--warning)]":i.status==="bad"?"text-[var(--critical)]":i.status==="info"?"text-[var(--info)]":"text-[var(--muted)]",l=i.status==="good"?"bg-[var(--success)]":i.status==="warn"?"bg-[var(--warning)]":i.status==="bad"?"bg-[var(--critical)]":i.status==="info"?"bg-[var(--info)]":"bg-[var(--muted)]";ov(),qE("relative flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg)] border border-[var(--border)] "+r+(a?" outline outline-2 outline-offset-0 outline-[var(--gold)]":" focus:outline-none")),tp("id",n.optionId(e.index)),ep("aria-selected",a)("aria-label",vD(2,11,i.timeStartMs)),ov(3),Cp(i.statusIcon),ov(),qE("absolute bottom-0 left-0 right-0 h-1 "+l),ov(),qE("tabular-nums text-[10px] "+(a?"text-[var(--gold)]":"text-[var(--muted)]")),ov(),xc$1(" ",vD(8,13,i.timeStartMs)," ");}}function Rl(t,o){if(t&1&&aE(0,Al,4,0,"div",7)(1,Ol,9,15,"div",8),t&2){let e=o.$implicit;cE(e.kind==="gap"?0:1);}}function Pl(t,o){if(t&1&&(oi$1(0,"span",19),nD(1),mD(2,"formatDamage"),bc$1()),t&2){let e=_E();ov(),Cp(vD(2,1,e.overview.playerPct));}}function Nl(t,o){if(t&1&&(oi$1(0,"span",19),nD(1),mD(2,"formatDamage"),bc$1()),t&2){let e=_E();ov(),Cp(vD(2,1,e.overview.topAvg));}}function Ll(t,o){t&1&&(oi$1(0,"span",20),nD(1,"not reached"),bc$1());}function $l(t,o){if(t&1&&(oi$1(0,"div",16)(1,"span",17),nD(2,"vs top average"),bc$1(),oi$1(3,"span",27),nD(4),mD(5,"signedPercent"),bc$1()()),t&2){let e=_E(2);ov(3),yp("badge-muted",e.overviewDeltaStatus()==="muted")("badge-success",e.overviewDeltaStatus()==="better")("badge-critical",e.overviewDeltaStatus()==="worse"),ov(),Cp(vD(5,7,e.overviewDelta()));}}function Bl(t,o){if(t&1){let e=vE();oi$1(0,"button",28),cp("click",function(){tu(e);let i=_E(2);return nu(i.openMap.emit(i.activeIndex()))}),oi$1(1,"mat-icon"),nD(2,"my_location"),bc$1()();}}function Wl(t,o){if(t&1){let e=vE();oi$1(0,"button",29),cp("click",function(){tu(e);let i=_E(2);return nu(i.openClip.emit(i.activeIndex()))}),oi$1(1,"mat-icon"),nD(2,"videocam"),bc$1()();}}function zl(t,o){if(t&1&&(oi$1(0,"span",32),np(1,"wl-game-icon",33),bc$1()),t&2){let e=o.$implicit;ov(),tp("id",e.id)("icon",e.icon)("name",e.name);}}function Gl(t,o){if(t&1&&(oi$1(0,"span",32)(1,"span",34),nD(2),bc$1()()),t&2){let e=o.$implicit;ov(2),Cp(e);}}function Vl(t,o){if(t&1&&(oi$1(0,"div",24)(1,"span",30),nD(2,"Recommended cooldowns"),bc$1(),oi$1(3,"div",31),dE(4,zl,2,3,"span",32,El),dE(6,Gl,3,1,"span",32,uE),bc$1()()),t&2){let e=_E();ov(4),fE(e.spells),ov(2),fE(e.labels);}}function jl(t,o){if(t&1&&np(0,"div"),t&2){_E(2);let e=aD(0),n=_E();qE("absolute inset-y-0 left-0 rounded opacity-[0.65] "+e),mp("width",n.overviewPlayerWidthPct(),"%");}}function ql(t,o){if(t&1&&np(0,"div",39),t&2){let e=_E(3);mp("left",e.overviewRangeLeftPct(),"%")("width",e.overviewRangeWidthPct(),"%");}}function Hl(t,o){if(t&1&&np(0,"div",40),t&2){let e=_E(3);mp("left",e.overviewAvgLeftPct(),"%");}}function Ul(t,o){if(t&1&&(oi$1(0,"div",25)(1,"span",30),nD(2,"Damage vs top range"),bc$1(),oi$1(3,"div",35),aE(4,jl,1,4,"div",36),aE(5,ql,1,4,"div",37),aE(6,Hl,1,2,"div",38),bc$1()()),t&2){let e=_E(2);ov(4),cE(e.overviewPlayerWidthPct()!==null?4:-1),ov(),cE(e.overviewRangeLeftPct()!==null?5:-1),ov(),cE(e.overviewAvgLeftPct()!==null?6:-1);}}function Ql(t,o){t&1&&(oi$1(0,"span",43),nD(1,"casts"),bc$1());}function Kl(t,o){t&1&&(oi$1(0,"span",45),nD(1,"gap"),bc$1());}function Yl(t,o){if(t&1&&np(0,"wl-compact-ability-row",46),t&2){let e=o.$implicit,n=_E(3);tp("row",e)("higherIsBetter",n.higherIsBetter())("showCasts",n.showCasts())("hidePlayer",n.activeIsMuted());}}function Xl(t,o){if(t&1&&(oi$1(0,"div",26)(1,"div",41)(2,"span",42),nD(3,"ability"),bc$1(),aE(4,Ql,2,0,"span",43),oi$1(5,"span",44),nD(6,"top avg"),bc$1(),aE(7,Kl,2,0,"span",45),bc$1(),dE(8,Yl,1,4,"wl-compact-ability-row",46,Dl),bc$1()),t&2){let e=_E(2);ov(4),cE(e.showCasts()&&!e.activeIsMuted()?4:-1),ov(3),cE(e.activeIsMuted()?-1:7),ov(),fE(e.activeDetailRows());}}function Zl(t,o){if(t&1&&(Sp(0),oi$1(1,"div",14)(2,"div",15)(3,"div",16)(4,"span",17),nD(5,"window"),bc$1(),oi$1(6,"span",18),nD(7),mD(8,"formatMsDuration"),mD(9,"formatMsDuration"),bc$1()(),oi$1(10,"div",16)(11,"span",17),nD(12,"burst"),bc$1(),aE(13,Pl,3,3,"span",19)(14,Nl,3,3,"span",19)(15,Ll,2,0,"span",20),bc$1(),aE(16,$l,6,9,"div",16),oi$1(17,"div",21),aE(18,Bl,3,0,"button",22),aE(19,Wl,3,0,"button",23),bc$1()(),aE(20,Vl,8,0,"div",24),bc$1(),aE(21,Ul,7,3,"div",25),aE(22,Xl,10,2,"div",26)),t&2){let e=o,n=_E();sD(e.status==="good"?"bg-[var(--success)]":e.status==="warn"?"bg-[var(--warning)]":e.status==="bad"?"bg-[var(--critical)]":e.status==="muted"?"bg-[var(--muted)]":"bg-[var(--info)]"),ov(7),bp(" ",vD(8,10,e.timeStartMs)," - ",vD(9,12,e.timeEndMs)," "),ov(6),cE(n.activeIsMuted()?n.activeIsBenchOnly()?14:15:13),ov(3),cE(!n.activeIsMuted()&&n.overviewDelta()!==null?16:-1),ov(2),cE(n.showMap()?18:-1),ov(),cE(n.showClip()?19:-1),ov(),cE(e.spells.length||e.labels.length?20:-1),ov(),cE(n.activeIsBenchOnly()?-1:21),ov(),cE(e.detailRows.length?22:-1);}}var Jl=0,Ho=(()=>{class t{windows=iF.required();higherIsBetter=iF(true);showMap=iF(false);showClip=iF(false);showCasts=iF(true);heading=iF("");subtitle=iF("");openMap=oF();openClip=oF();static GAP_SLOT_MS=2e4;selectedIndex=TD(()=>{let e=this.windows(),n=this.higherIsBetter(),i=0,a=n?1/0:-1/0;return e.forEach((r,l)=>{if(r.status==="muted")return;let s=r.overview.playerPct,m=r.overview.topAvg;if(s==null||!m||m<=0)return;let f=s/m;(n?f<a:f>a)&&(a=f,i=l);}),i});_manualIndex=_D({source:this.windows,computation:()=>null});activeIndex=TD(()=>this._manualIndex()??this.selectedIndex());activeWindow=TD(()=>this.windows()[this.activeIndex()]??null);instanceId=`wl-window-comparison-${Jl++}`;optionId(e){return `${this.instanceId}-opt-${e}`}activeOptionId=TD(()=>this.optionId(this.activeIndex()));timelineCells=TD(()=>{let e=this.windows(),n=[];return e.forEach((i,a)=>{n.push({kind:"window",index:a});let r=e[a+1];if(!r)return;let l=this.gapSlots(r.timeStartMs-i.timeEndMs);for(let s=0;s<l;s++)n.push({kind:"gap",id:`${a}-${s}`});}),n});gapSlots(e){return Math.max(0,Math.floor(e/t.GAP_SLOT_MS))}select(e){this._manualIndex.set(e);}onKeydown(e){let n=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!n)return;e.preventDefault();let i=this.activeIndex()+n;i>=0&&i<this.windows().length&&this.select(i);}activeIsMuted=TD(()=>{let e=this.activeWindow()?.status;return e==="muted"||e==="info"});activeIsBenchOnly=TD(()=>this.activeWindow()?.status==="info");activeDetailRows=TD(()=>{let e=this.activeWindow()?.detailRows??[],n=this.higherIsBetter(),i=a=>{if(a.playerPct==null)return -(a.topAvg??0);let r=a.playerPct-(a.topAvg??0);return n?r:-r};return [...e].sort((a,r)=>i(a)-i(r))});overviewMax=TD(()=>{let e=this.windows().flatMap(n=>[n.overview.topAvg,n.overview.topMax,n.overview.playerPct].filter(i=>i!=null&&Number.isFinite(i)));return Math.max(...e,.01)});barPct(e,n){let i=e/n*100;return Number.isFinite(i)?Math.min(100,Math.max(0,i)):0}overviewDelta=TD(()=>{let e=this.activeWindow();if(!e)return null;let{playerPct:n,topAvg:i}=e.overview;if(n==null||i==null||i===0)return null;let a=(n-i)/i*100;return Number.isFinite(a)?a:null});overviewDeltaStatus=TD(()=>{let e=this.overviewDelta();return e==null?"muted":(this.higherIsBetter()?e>=0:e<=0)?"better":"worse"});overviewPlayerWidthPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.playerPct==null?null:this.barPct(e.overview.playerPct,this.overviewMax())});overviewRangeLeftPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.topMin==null||e.overview.topMax==null?null:this.barPct(e.overview.topMin,this.overviewMax())});overviewRangeWidthPct=TD(()=>{let e=this.activeWindow();if(!e||e.overview.topMin==null||e.overview.topMax==null)return null;let n=this.overviewMax();return Math.max(0,this.barPct(e.overview.topMax,n)-this.barPct(e.overview.topMin,n))});overviewAvgLeftPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.topAvg==null?null:this.barPct(e.overview.topAvg,this.overviewMax())});static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-window-comparison"]],hostAttrs:[1,"block"],inputs:{windows:[1,"windows"],higherIsBetter:[1,"higherIsBetter"],showMap:[1,"showMap"],showClip:[1,"showClip"],showCasts:[1,"showCasts"],heading:[1,"heading"],subtitle:[1,"subtitle"]},outputs:{openMap:"openMap",openClip:"openClip"},decls:8,vars:8,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"px-4"],["role","listbox","tabindex","0",1,"pt-2","pb-1",3,"keydown"],[1,"flex","flex-wrap","items-start","gap-1.5","px-0.5"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],["aria-hidden","true",1,"flex","flex-col","items-center","gap-1.5","shrink-0"],[1,"flex","flex-col","items-center","gap-1.5","shrink-0"],[1,"w-5","h-10","rounded-md","border","border-dashed","border-[var(--border)]","opacity-40"],[1,"text-[10px]","invisible"],["type","button","role","option","tabindex","-1",3,"click","id"],[1,"icon-seg"],["aria-hidden","true"],[1,"px-4","py-2.5","bg-[var(--surface)]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-4","md:gap-[22px]"],[1,"flex","flex-col","shrink-0"],[1,"text-[9px]","uppercase","tracking-[1px]","text-[var(--muted)]"],[1,"text-[13px]","font-semibold","tabular-nums","text-[var(--text)]","whitespace-nowrap"],[1,"text-[13px]","font-semibold","tabular-nums","text-[var(--text)]"],[1,"text-[13px]","font-semibold","italic","text-[var(--muted)]"],[1,"ml-auto","flex","items-center","gap-[7px]","shrink-0"],["mat-icon-button","","title","Open positioning map"],["mat-icon-button","","title","Watch clip"],[1,"mt-2.5"],[1,"px-4","pb-2"],[1,"md:border-t","border-[var(--border)]","pt-2","pb-2"],[1,"text-[13px]","font-semibold","tabular-nums"],["mat-icon-button","","title","Open positioning map",3,"click"],["mat-icon-button","","title","Watch clip",3,"click"],[1,"block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mb-1.5"],[1,"flex","flex-wrap","items-center","gap-2"],[1,"chip-onplan"],[3,"id","icon","name"],[1,"text-[13px]","text-[var(--muted)]"],["aria-hidden","true",1,"relative","h-5","rounded","bg-[var(--bg)]"],[3,"class","width"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]",3,"left","width"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]",3,"left"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]"],[1,"hidden","md:grid","grid-cols-[minmax(0,1fr)_96px_96px_90px]","gap-x-[14px]","items-center","px-4","pb-1"],[1,"col-start-1","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-2","text-right","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-3","text-left","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-4","text-right","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[3,"row","higherIsBetter","showCasts","hidePlayer"]],template:function(n,i){if(n&1&&(oi$1(0,"div",0),aE(1,Fl,4,2,"div",1),oi$1(2,"div",2)(3,"div",3),cp("keydown",function(r){return i.onKeydown(r)}),oi$1(4,"div",4),dE(5,Rl,2,1,null,null,Tl),bc$1()()(),aE(7,Zl,23,14),bc$1()),n&2){let a;ov(),cE(i.heading()?1:-1),ov(),yp("pt-3",!i.heading())("pb-3",!i.activeWindow()),ov(),ep("aria-label",i.heading())("aria-activedescendant",i.activeOptionId()),ov(2),fE(i.timelineCells()),ov(2),cE((a=i.activeWindow())?7:-1,a);}},dependencies:[fv,hv,Ib,Wd$1,nt,Vo,zo,Qt,jo],encapsulation:2})}return t})();var it=class{token=0;run(o,e){let n=++this.token;o.then(i=>{n===this.token&&e.apply(i);}).catch(i=>ua$1(e.context,i)).finally(()=>{n===this.token&&e.settled?.();});}};function ot(t){return `${t.targetID??0}:${t.targetInstance??0}`}var es=1,ts=6603,ns=291807;function Kt(t){return t===es?ts:t<0?ns:t}function Yt(t,o){return t.map(e=>{let n=o[e];return n?{id:e,icon:n.icon,name:n.name}:(ua$1("windowSpells: ability id missing from ability map",e),{id:e,icon:"",name:`Ability #${e}`})})}function is(t,o,e,n,i,a=false){return a?{status:"info",icon:"insights"}:i?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:t<e-n?{status:"bad",icon:"error"}:o>0&&t<o-n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}}function os(t,o){let e=[],n=[];for(let i of t){let a=o[i];a?e.push(a):n.push(i);}return {spellIds:e,labels:n}}function as(t,o,e){let n={};for(let i of o?.ability_breakdown??[])n[i.spell_id]=i;return t.map(i=>{let a=e[i.spell_id];return a||ua$1("burstDetailRows: ability id missing from ability map",i.spell_id),{spellId:i.spell_id,label:a?.name??`Ability #${i.spell_id}`,icon:a?.icon??"",playerPct:n[i.spell_id]?.damage??null,topAvg:i.avg_damage,topMin:i.min_damage,topMax:i.max_damage,playerCasts:n[i.spell_id]?.casts??null,topCasts:i.avg_casts??null,passive:i.is_passive??false}})}function rs(t){return {timeS:t.time_ms/1e3,windowLengthS:t.window_length_ms/1e3}}function ls(t,o){return {timeS:t.time_ms/1e3,windowLengthS:t.window_length_ms/1e3,key:`burst-${o}`}}function En(t,o,e,n,i,a=false){let r=[],l=[],s=[];return t.forEach((m,f)=>{let h=m.time_ms>e,x=h?null:o[f]??null,y=x?.window_damage??null,{status:C,icon:E}=is(y,m.dmg_avg,m.dmg_min,m.dmg_stddev,h,a),{spellIds:G,labels:Z}=os(m.common_cds,n);r.push({timeStartMs:m.time_ms,timeEndMs:m.time_ms+m.window_length_ms,spells:Yt(G,i),labels:Z,status:C,statusIcon:E,overview:{label:"",icon:"",playerPct:y,topAvg:m.dmg_avg,topMin:m.dmg_min,topMax:m.dmg_max},detailRows:as(m.ability_breakdown,x,i)}),l.push(rs(m)),s.push(ls(m,f));}),{windows:r,anchors:l,clipAnchors:s}}function Dn(t){return (t.amount||0)+(t.absorbed||0)}function ss(t,o,e,n,i){let a=h=>h>=t.time_ms&&h<t.time_ms+t.window_length_ms,r=o.filter(h=>a(h.timestamp-n)),l=r.reduce((h,x)=>h+Dn(x),0),s={};for(let h of r){if(!h.abilityGameID)continue;let x=Kt(h.abilityGameID);s[x]=(s[x]||0)+Dn(h);}let m=new Map;for(let h of e)if(a(h.timestamp-n)){let x=i(h.abilityGameID);m.set(x,(m.get(x)??0)+1);}let f=Object.entries(s).sort((h,x)=>x[1]-h[1]).map(([h,x])=>{let y=parseInt(h,10);return {spell_id:y,damage:Math.round(x),casts:m.get(i(y))??0}});return {time_ms:t.time_ms,window_damage:Math.round(l),ability_breakdown:f}}function ds(t,o,e,n,i){let a=s=>i.get(s)??`Spell ${s}`,r=o.filter(s=>s.timestamp>=n&&Dn(s)>0).sort((s,m)=>s.timestamp-m.timestamp),l=e.filter(s=>s.type==="cast"&&s.abilityGameID);return t.map(s=>ss(s,r,l,n,a))}var Uo=(()=>{class t{source=T(Ya$1);wclApi=T(xe);async loadPlayerView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let s=await this.wclApi.getReport(i),m=s.fights.find(E=>E.id===a);if(!m)return ri(En(l.value.windows,[],Number.POSITIVE_INFINITY,l.value.cd_spell_ids,l.value.ability_icons,!0));let f=new Map;for(let E of s.masterData?.abilities??[])f.set(E.gameID,E.name);let[h,x]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",m.startTime,m.endTime,r),this.wclApi.getAllEvents(i,a,"DamageDone",m.startTime,m.endTime,r)]),y=ds(l.value.windows,x,h,m.startTime,f),C=m.endTime-m.startTime;return ri(En(l.value.windows,y,C,l.value.cd_spell_ids,l.value.ability_icons))}catch(s){return ua$1(`BurstFeatureService.loadPlayerView ${i}:${a}`,s),ma$1(s,"burst.player-view")}}async loadBenchView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri(En(i.value.windows,[],Number.POSITIVE_INFINITY,i.value.cd_spell_ids,i.value.ability_icons,true)):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function cs(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("error",e.error());}}function ms(t,o){if(t&1){let e=vE();oi$1(0,"wl-window-comparison",2),cp("openMap",function(i){tu(e);let a=_E();return nu(a.onOpenMap(i))})("openClip",function(i){tu(e);let a=_E();return nu(a.onOpenClip(i))}),bc$1();}if(t&2){let e=_E();tp("windows",e.windows())("higherIsBetter",true)("showMap",e.showMap())("showClip",e.showClip());}}var $u=(()=>{class t{burst=T(Uo);spec=iF.required();encounterId=iF.required();report=iF("");fight=iF(0);player=iF(0);showMap=iF(false);showClip=iF(false);openMap=oF();openClip=oF();busyChange=oF();availableChange=oF();available=So$1(true);error=So$1(null);_windows=So$1([]);_anchors=So$1([]);_clipAnchors=So$1([]);windows=this._windows.asReadonly();loader=new it;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId(),i=this.report(),a=this.fight(),r=this.player(),l=i&&a&&r?this.burst.loadPlayerView(e,n,i,a,r):this.burst.loadBenchView(e,n);this.loader.run(l,{context:"burst.loadPlayerView",apply:s=>{s.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this._windows.set(s.value.windows),this._anchors.set(s.value.anchors),this._clipAnchors.set(s.value.clipAnchors)):(s.error.kind==="permanent"&&ua$1(s.error.id,s.error.context),this.error.set(s.error.kind==="missing"?null:s.error),this.available.set(false),this.availableChange.emit(false),this._windows.set([]),this._anchors.set([]),this._clipAnchors.set([]));},settled:()=>this.busyChange.emit(false)});});}onOpenMap(e){let n=this._anchors()[e];n&&this.openMap.emit(n);}onOpenClip(e){let n=this._clipAnchors()[e];n&&this.openClip.emit(n);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-burst-windows"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],showClip:[1,"showClip"]},outputs:{openMap:"openMap",openClip:"openClip",busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"error"],["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"windows","higherIsBetter","showMap","showClip"],["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"openMap","openClip","windows","higherIsBetter","showMap","showClip"]],template:function(n,i){n&1&&aE(0,cs,1,1,"wl-load-state",0)(1,ms,1,4,"wl-window-comparison",1),n&2&&cE(i.error()||!i.available()?0:1);},dependencies:[Ho,tt],encapsulation:2})}return t})();var ps=["content"],fs=["*"];function us(t,o){if(t&1){let e=vE();oi$1(0,"button",3),cp("click",function(){tu(e);let i=_E();return nu(i.toggle())}),nD(1),oi$1(2,"mat-icon",4),nD(3),bc$1()();}if(t&2){let e=_E();ep("aria-expanded",e.expanded()),ov(),xc$1(" ",e.expanded()?"Show less":"Show more"," "),ov(2),Cp(e.expanded()?"expand_less":"expand_more");}}var Qo=(()=>{class t{destroyRef=T(Le);content=sF.required("content");expanded=So$1(false);overflowing=So$1(false);constructor(){Oy(()=>{let e=this.content().nativeElement,n=()=>{this.expanded()||this.overflowing.set(e.scrollHeight-e.clientHeight>1);};if(n(),typeof ResizeObserver<"u"){let i=new ResizeObserver(n);i.observe(e),this.destroyRef.onDestroy(()=>i.disconnect());}});}toggle(){this.expanded.update(e=>!e);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-collapsible-text"]],viewQuery:function(n,i){n&1&&pp(i.content,ps,5),n&2&&kE();},hostAttrs:[1,"block"],ngContentSelectors:fs,decls:4,vars:3,consts:[["content",""],[1,"md:line-clamp-none"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]",3,"click"],[1,"icon-16"]],template:function(n,i){n&1&&(SE(),oi$1(0,"div",1,0),NE(2),bc$1(),aE(3,us,4,3,"button",2)),n&2&&(yp("line-clamp-2",!i.expanded()),ov(3),cE(i.overflowing()?3:-1));},dependencies:[fv,hv],encapsulation:2})}return t})();function Ko(t){let o=(t??[]).filter(n=>n.id!=null).map(n=>({entryId:n.id,rank:n.rank??1})).sort((n,i)=>n.entryId-i.entryId);return o.length?`v3:${o.map(n=>[n.entryId,n.rank].join(".")).join(",")}`:""}var Yo=50,hs={0:"Head",1:"Neck",2:"Shoulder",3:"Shirt",4:"Chest",5:"Waist",6:"Legs",7:"Feet",8:"Wrists",9:"Hands",10:"Ring 1",11:"Ring 2",12:"Trinket 1",13:"Trinket 2",14:"Back",15:"Main Hand",16:"Off Hand"},_s={ok:"check_circle",warn:"warning",info:"info",unknown:"help_outline"};function _t(t){return hs[t]||`Slot ${t}`}function Xo(t){return _s[t]}function Zo(t,o){let e=o?.enchants??{},n=t.enchants??[];if(!Object.keys(e).length&&!n.length)return [];let i=new Set;for(let r of Object.keys(e))i.add(Number(r));for(let r of n)i.add(r.slot);let a=[];for(let r of [...i].sort((l,s)=>l-s)){let l=_t(r),s=e[r]?.[0],m=s?s.name||`Enchant #${s.id}`:"",f=n.find(y=>y.slot===r);if(!f){s&&s.pct>=Yo&&a.push({slotName:l,status:"warn",name:"Not enchanted",topPct:s.pct,note:`Apply ${m}`});continue}let h=f.name||`Enchant #${f.id}`,x=e[r]?.find(y=>y.id===f.id)?.pct??null;s&&f.id===s.id?a.push({slotName:l,status:"ok",name:h,topPct:s.pct,note:`${s.pct}% run this`}):s?a.push({slotName:l,status:"info",name:h,topPct:x,note:`${s.pct}% run ${m}`}):a.push({slotName:l,status:"ok",name:h,topPct:null,note:null});}return a}function Jo(t){return t.some(o=>o.status==="warn")?"warn":"ok"}function In(t,o){let e=t?.talent_builds??[];return e.length?e.map((n,i)=>({pct:n.pct,isPlayer:!!o&&n.key===o,link:`https://www.warcraftlogs.com/reports/${n.report_code}?fight=${n.fight_id}&type=summary&source=${n.source_id}`,playerName:n.player_name,label:i===0?"Most common build":`Alt build ${i}`,added:(n.diff??[]).filter(a=>a.kind==="added").map(a=>a.talent),dropped:(n.diff??[]).filter(a=>a.kind==="dropped").map(a=>a.talent),ranks:(n.diff??[]).filter(a=>a.kind==="rank")})):[]}function Fn(t,o){let e=t?.talent_builds??[];if(!e.length)return {status:"unknown",note:"No talent data."};let n=e[0]?.pct??0;return !o||o.split(":")[0]!==(e[0]?.key??"").split(":")[0]?{status:"ok",note:`${n}% run this build`}:e.some(i=>i.key===o)?{status:"ok",note:"Standard build."}:{status:"warn",note:`Off-meta build. ${n}% run the standard one.`}}function gs(t,o){let e=t?.trinkets??{},n=0,i=false;for(let a of [12,13]){let r=(e[a]??[]).find(l=>l.id===o);r&&(n+=r.pct,i=true);}return i?n:null}function ea(t,o){let e=t.trinkets??[],n=na(o),i=[],a=new Set(e.map(m=>m.id)),r=n.filter(m=>!a.has(m.id)),l=0,s=new Set;for(let m of [12,13]){let f=_t(m),h=e.find(C=>C.slot===m);if(!h){let C=r[l];if(!C)continue;l++,i.push({slotLabel:f,id:C.id,name:C.name,icon:C.icon,status:"info",topPct:C.pct,note:`${C.pct}% run this trinket`});continue}let x=n.find(C=>C.id===h.id&&!s.has(C.id));if(x){s.add(x.id),i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"ok",topPct:x.pct,note:null});continue}let y=r[l];y?(l++,i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"info",topPct:gs(o,h.id),note:`Switch to ${y.name} (${y.pct}%)`})):i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"ok",topPct:null,note:null});}return i}function ta(t){return t.some(o=>o.status==="warn")?"warn":t.some(o=>o.status==="info")?"info":"ok"}function na(t){let o=t?.trinkets??{},e=new Map;for(let n of [12,13])for(let i of o[n]??[]){let a=e.get(i.id);a?a.pct+=i.pct:e.set(i.id,{id:i.id,name:i.name,icon:i.icon,pct:i.pct});}return [...e.values()].sort((n,i)=>i.pct-n.pct).slice(0,2)}function ia(t){let o=t?.enchants??{};return Object.keys(o).map(Number).sort((e,n)=>e-n).reduce((e,n)=>{let i=o[n]?.[0];return i&&i.pct>=Yo&&e.push({slotName:_t(n),name:i.name||`Enchant #${i.id}`,pct:i.pct}),e},[])}function oa(t){return na(t).map((o,e)=>({slotLabel:e===0?"Trinket 1":"Trinket 2",id:o.id,name:o.name,icon:o.icon,pct:o.pct}))}function aa(t,o){return t.find(e=>e.sourceID===o)??t[0]??null}var vs=[12,13];function xs(t){return (t??"").replace(/\.jpg$/i,"")}function An(t){return t.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")}function On(t){let o=[],e=[];return (t??[]).forEach((n,i)=>{if(!n?.id)return;let a=typeof n.id=="string"?parseInt(n.id,10):n.id;vs.includes(i)&&o.push({slot:i,id:a,name:n.name??"",icon:xs(n.icon)});let r=n.permanentEnchant;if(r){let l=typeof r=="string"?parseInt(r,10):r;e.push({slot:i,id:l,name:n.permanentEnchantName??""});}}),{trinkets:o,enchants:e}}function Rn(){return {comparison:false,talentBuilds:[],talentStatus:{status:"unknown",note:"No talent data."},trinketRows:[],trinketStatus:"ok",benchTrinketRows:[],enchantRows:[],enchantStatus:"ok",benchEnchantRows:[]}}function bs(t,o,e,n){if(!t?.gear?.length)return fa$1("No combatant info in this log.","gear.combatant-info");let{trinkets:i,enchants:a}=On(t.gear),r=Ko(t.talentTree);for(let l of i)!l.name&&l.id&&(l.name=An(o[`i${l.id}`]?.name??""));for(let l of a)!l.name&&l.id&&(l.name=An(o[`e${l.id}`]?.name??""));return ri({found:true,spec:n,source_report:e,talent_key:r,trinkets:i,enchants:a})}function ra(t){return {talent_builds:t.talent_builds,trinkets:t.trinkets,enchants:t.enchants}}function ys(t,o){let e=t.talent_key??"",n=Zo(t,o),i=ea(t,o);return {comparison:true,talentBuilds:In(o,e),talentStatus:Fn(o,e),trinketRows:i,trinketStatus:ta(i),benchTrinketRows:[],enchantRows:n,enchantStatus:Jo(n),benchEnchantRows:[]}}function Cs(t){return {comparison:false,talentBuilds:In(t,""),talentStatus:Fn(t,""),trinketRows:[],trinketStatus:"ok",benchTrinketRows:oa(t),enchantRows:[],enchantStatus:"ok",benchEnchantRows:ia(t)}}var la=(()=>{class t{source=T(Ka$1);wclApi=T(xe);async loadComparisonView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;let s=await this.fetchPlayerGear(i,a,r,e);return s.ok?ri(ys(s.value,ra(l.value))):s}async loadBenchView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri(Cs(ra(i.value))):i}async fetchPlayerGear(e,n,i,a){try{let r=aa(await this.wclApi.getCombatantInfo(e,n,i),i),l={};if(r?.gear?.length){let{trinkets:s,enchants:m}=On(r.gear),f=[...new Set(s.filter(x=>x.id).map(x=>x.id))],h=[...new Set(m.filter(x=>x.id).map(x=>x.id))];try{l=await this.wclApi.getGameNames(f,h);}catch(x){ua$1(`GearFeatureService name resolution ${e}:${n}:${i}`,x);}}return bs(r,l,e,a)}catch(r){return ua$1(`GearFeatureService player gear ${e}:${n}:${i}`,r),ma$1(r,"gear.player-view")}}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var ws=(t,o)=>o.label,sa=(t,o)=>o.name,Ss=(t,o)=>o.talent.name,Pn=(t,o)=>o.slotLabel,da=(t,o)=>o.slotName;function Ms(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("error",e.error());}}function ks(t,o){t&1&&(oi$1(0,"div",5),nD(1,"Gear vs top parses."),bc$1());}function Ts(t,o){t&1&&(oi$1(0,"div",5),nD(1,"Top-parse gear consensus."),bc$1());}function Es(t,o){t&1&&(oi$1(0,"mat-icon",14),nD(1,"warning_amber"),bc$1());}function Ds(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"Your build"),bc$1(),aE(3,Es,2,0,"mat-icon",14),oi$1(4,"span",15),nD(5),bc$1()()),t&2){let e=_E(3);ov(3),cE(e.view().talentStatus.status==="warn"?3:-1),ov(2),Cp(e.view().talentStatus.note);}}function Is(t,o){t&1&&(oi$1(0,"span",19),nD(1,"your build"),bc$1());}function Fs(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function As(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function Os(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Fs,1,3,"wl-game-icon",30)(2,As,2,1,"span",15),bc$1()),t&2){let e,n=o.$implicit;ov(),cE((e=n.spellId)?1:2,e);}}function Rs(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Added"),bc$1(),oi$1(3,"div",28),dE(4,Os,3,1,"span",29,sa),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.added);}}function Ps(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function Ns(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function Ls(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Ps,1,3,"wl-game-icon",30)(2,Ns,2,1,"span",15),bc$1()),t&2){let e,n=o.$implicit;ov(),cE((e=n.spellId)?1:2,e);}}function $s(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Dropped"),bc$1(),oi$1(3,"div",28),dE(4,Ls,3,1,"span",29,sa),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.dropped);}}function Bs(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.talent.icon)("name",e.talent.name);}}function Ws(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.talent.name);}}function zs(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Bs,1,3,"wl-game-icon",30)(2,Ws,2,1,"span",15),oi$1(3,"span",31),nD(4),bc$1()()),t&2){let e,n=o.$implicit;ov(),cE((e=n.talent.spellId)?1:2,e),ov(3),bp("",n.standardRank,"\u2192",n.rank);}}function Gs(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Points"),bc$1(),oi$1(3,"div",28),dE(4,zs,5,3,"span",29,Ss),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.ranks);}}function Vs(t,o){if(t&1&&(oi$1(0,"div",25),np(1,"div",17),oi$1(2,"div",26),aE(3,Rs,6,0,"div"),aE(4,$s,6,0,"div"),aE(5,Gs,6,0,"div"),bc$1()()),t&2){let e=_E().$implicit;ov(3),cE(e.added.length?3:-1),ov(),cE(e.dropped.length?4:-1),ov(),cE(e.ranks.length?5:-1);}}function js(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",18),nD(3),aE(4,Is,2,0,"span",19),bc$1(),oi$1(5,"div",20)(6,"div",21),nD(7),bc$1(),oi$1(8,"div",22),nD(9,"of top parsers"),bc$1()(),oi$1(10,"div",23)(11,"a",24),nD(12,"View parse \u2197"),bc$1()()(),aE(13,Vs,6,3,"div",25)),t&2){let e=o.$implicit;ov(3),xc$1(" ",e.label," "),ov(),cE(e.isPlayer?4:-1),ov(3),xc$1("",e.pct,"%"),ov(4),tp("href",e.link,Qd$1),ov(2),cE(e.added.length||e.dropped.length||e.ranks.length?13:-1);}}function qs(t,o){if(t&1&&(aE(0,Ds,6,2,"div",12),dE(1,js,14,5,null,null,ws)),t&2){let e=_E(2);cE(e.view().comparison&&e.view().talentStatus.status!=="unknown"?0:-1),ov(),fE(e.view().talentBuilds);}}function Hs(t,o){t&1&&(oi$1(0,"div",11),nD(1," No talent data. "),bc$1());}function Us(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",21),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E(2).$implicit;ov(3),xc$1("",e.topPct,"%");}}function Qs(t,o){if(t&1&&(oi$1(0,"div",32)(1,"div",34)(2,"mat-icon",35),nD(3),bc$1()(),oi$1(4,"div",36),np(5,"wl-game-icon",37),oi$1(6,"div",38),nD(7),bc$1()(),oi$1(8,"div",39),aE(9,Us,6,1),bc$1(),oi$1(10,"div",40)(11,"span",41),nD(12,"Fix"),bc$1(),oi$1(13,"wl-collapsible-text"),nD(14),bc$1()()()),t&2){let e=_E().$implicit;ov(2),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),xc$1(" ",e.status==="info"?"info":"warning_amber"," "),ov(2),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),cE(e.topPct!==null?9:-1),ov(5),Cp(e.note);}}function Ks(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",46),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E(2).$implicit;ov(3),xc$1("",e.topPct,"%");}}function Ys(t,o){if(t&1&&(oi$1(0,"div",33)(1,"div",34),np(2,"span",44),bc$1(),oi$1(3,"div",36),np(4,"wl-game-icon",37),oi$1(5,"div",38),nD(6),bc$1()(),oi$1(7,"div",45),aE(8,Ks,6,1),bc$1(),np(9,"div",17),bc$1()),t&2){let e=_E().$implicit;ov(4),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(2),cE(e.topPct!==null?8:-1);}}function Xs(t,o){if(t&1&&aE(0,Qs,15,15,"div",32)(1,Ys,10,5,"div",33),t&2){let e=o.$implicit;cE(e.status!=="ok"?0:1);}}function Zs(t,o){if(t&1&&dE(0,Xs,2,1,null,null,Pn),t&2){let e=_E(3);fE(e.view().trinketRows);}}function Js(t,o){if(t&1&&(oi$1(0,"span",29),np(1,"wl-game-icon",37),bc$1()),t&2){let e=o.$implicit;ov(),tp("id",e.id)("name",e.name)("icon",e.icon);}}function ed(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),dE(3,Js,2,3,"span",29,Pn),bc$1()),t&2){let e=_E(3);ov(3),fE(e.view().trinketRows);}}function td(t,o){t&1&&(oi$1(0,"div",11),nD(1," No trinket data. "),bc$1());}function nd(t,o){if(t&1&&aE(0,Zs,2,0)(1,ed,5,0,"div",12)(2,td,2,0,"div",11),t&2){let e=_E(2);cE(e.view().trinketStatus!=="ok"?0:e.view().trinketRows.length?1:2);}}function id(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",36),np(3,"wl-game-icon",37),oi$1(4,"div",38),nD(5),bc$1()(),oi$1(6,"div",20)(7,"div",21),nD(8),bc$1(),oi$1(9,"div",22),nD(10,"of top parsers"),bc$1()(),np(11,"div",17),bc$1()),t&2){let e=o.$implicit;ov(3),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(3),xc$1("",e.pct,"%");}}function od(t,o){if(t&1&&dE(0,id,12,5,"div",16,Pn),t&2){let e=_E(3);fE(e.view().benchTrinketRows);}}function ad(t,o){t&1&&(oi$1(0,"div",11),nD(1," No trinket data. "),bc$1());}function rd(t,o){if(t&1&&aE(0,od,2,0)(1,ad,2,0,"div",11),t&2){let e=_E(2);cE(e.view().benchTrinketRows.length?0:1);}}function ld(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",21),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E().$implicit;ov(3),xc$1("",e.topPct,"%");}}function sd(t,o){if(t&1&&(oi$1(0,"div",32)(1,"div",34)(2,"mat-icon",35),nD(3),bc$1()(),oi$1(4,"div",47)(5,"span",48),nD(6),bc$1(),oi$1(7,"span",49),nD(8),bc$1()(),oi$1(9,"div",39),aE(10,ld,6,1),bc$1(),oi$1(11,"div",40)(12,"span",41),nD(13,"Fix"),bc$1(),oi$1(14,"wl-collapsible-text"),nD(15),bc$1()()()),t&2){let e=o.$implicit;ov(2),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),xc$1(" ",e.status==="info"?"info":"warning_amber"," "),ov(3),Cp(e.slotName),ov(2),Cp(e.name),ov(),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),cE(e.topPct!==null?10:-1),ov(5),Cp(e.note);}}function dd(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),oi$1(3,"span",29)(4,"span",15),nD(5),bc$1()()()),t&2){let e=_E(4);ov(5),xc$1("",e.enchantOnPlan().length," enchants");}}function cd(t,o){if(t&1&&(dE(0,sd,16,13,"div",32,da),aE(2,dd,6,1,"div",12)),t&2){let e=_E(3);fE(e.enchantIssues()),ov(2),cE(e.enchantOnPlan().length?2:-1);}}function md(t,o){t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),oi$1(3,"span",29)(4,"span",15),nD(5,"All enchants"),bc$1()()());}function pd(t,o){t&1&&(oi$1(0,"div",11),nD(1," No enchant data. "),bc$1());}function fd(t,o){if(t&1&&aE(0,cd,3,1)(1,md,6,0,"div",12)(2,pd,2,0,"div",11),t&2){let e=_E(2);cE(e.enchantIssues().length?0:e.view().enchantRows.length?1:2);}}function ud(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",47)(3,"span",48),nD(4),bc$1(),oi$1(5,"span",50),nD(6),bc$1()(),oi$1(7,"div",20)(8,"div",21),nD(9),bc$1(),oi$1(10,"div",22),nD(11,"of top parsers"),bc$1()(),np(12,"div",17),bc$1()),t&2){let e=o.$implicit;ov(4),Cp(e.slotName),ov(2),Cp(e.name),ov(3),xc$1("",e.pct,"%");}}function hd(t,o){if(t&1&&dE(0,ud,13,3,"div",16,da),t&2){let e=_E(3);fE(e.view().benchEnchantRows);}}function _d(t,o){t&1&&(oi$1(0,"div",11),nD(1," No enchant data. "),bc$1());}function gd(t,o){if(t&1&&aE(0,hd,2,0)(1,_d,2,0,"div",11),t&2){let e=_E(2);cE(e.view().benchEnchantRows.length?0:1);}}function vd(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",2)(2,"div",3)(3,"div",4),nD(4,"Gear"),bc$1(),aE(5,ks,2,0,"div",5)(6,Ts,2,0,"div",5),bc$1(),oi$1(7,"div",6),nD(8,"Measured"),bc$1(),oi$1(9,"div",7),nD(10,"Fix"),bc$1()(),oi$1(11,"div",8)(12,"div",9),np(13,"div"),oi$1(14,"div",10),nD(15,"Talents"),bc$1(),np(16,"div")(17,"div"),bc$1(),aE(18,qs,3,1)(19,Hs,2,0,"div",11),bc$1(),oi$1(20,"div",8)(21,"div",9),np(22,"div"),oi$1(23,"div",10),nD(24,"Trinkets"),bc$1(),np(25,"div")(26,"div"),bc$1(),aE(27,nd,3,1)(28,rd,2,1),bc$1(),oi$1(29,"div",8)(30,"div",9),np(31,"div"),oi$1(32,"div",10),nD(33,"Enchants"),bc$1(),np(34,"div")(35,"div"),bc$1(),aE(36,fd,3,1)(37,gd,2,1),bc$1()()),t&2){let e=_E();ov(5),cE(e.view().comparison?5:6),ov(13),cE(e.view().talentBuilds.length?18:19),ov(9),cE(e.view().comparison?27:28),ov(9),cE(e.view().comparison?36:37);}}var vh=(()=>{class t{gear=T(la);spec=iF.required();encounterId=iF.required();report=iF("");fight=iF(0);player=iF(0);busyChange=oF();availableChange=oF();_view=So$1(Rn());view=this._view.asReadonly();_available=So$1(false);available=this._available.asReadonly();_error=So$1(null);error=this._error.asReadonly();enchantIssues=TD(()=>this.view().enchantRows.filter(e=>e.status!=="ok"));enchantOnPlan=TD(()=>this.view().enchantRows.filter(e=>e.status==="ok"));slotName=_t;statusIcon=Xo;loader=new it;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId(),i=this.report(),a=this.fight(),r=this.player(),l=i&&a&&r?this.gear.loadComparisonView(e,n,i,a,r):this.gear.loadBenchView(e,n);this.loader.run(l,{context:"gear.load",apply:s=>{s.ok?(this._error.set(null),this._view.set(s.value),this._available.set(true),this.availableChange.emit(true)):(s.error.kind==="permanent"&&ua$1(s.error.id,s.error.context),this._error.set(s.error.kind==="missing"?null:s.error),this._view.set(Rn()),this._available.set(false),this.availableChange.emit(false));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-gear"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[["heading","Gear","subtitle","Top-parse gear consensus.",3,"error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"md:col-span-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"border-t","border-[var(--border)]"],[1,"px-4","pt-3","pb-1","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"flex","items-center","gap-2","border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"icon-18","badge-warning"],[1,"text-[13px]","text-[var(--muted)]"],[1,"grid","grid-cols-[minmax(0,1fr)_auto]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-1","md:gap-y-0","items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"hidden","md:block"],[1,"min-w-0","text-sm","text-[var(--text)]"],[1,"ml-1.5","text-[10px]","uppercase","tracking-wider","text-[var(--accent)]"],[1,"text-right","leading-[1.1]","text-[var(--muted)]"],[1,"text-[15px]","font-semibold","tabular-nums"],[1,"text-[10px]","opacity-60","mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-right","md:text-left","text-[13px]","text-[var(--muted)]","leading-[1.45]","md:border-l","md:border-[var(--border)]","md:pl-[14px]"],["target","_blank","rel","noopener",1,"rounded-[3px]","border","border-[var(--accent)]/20","bg-[var(--accent)]/[0.08]","px-[7px]","py-[1px]","font-mono","text-[10px]","text-[var(--accent)]","no-underline","whitespace-nowrap","hover:brightness-125",3,"href"],[1,"px-4","pb-[10px]","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]"],[1,"md:col-span-3","flex","flex-col","gap-2.5"],[1,"block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mb-1.5"],[1,"flex","flex-wrap","items-center","gap-2"],[1,"chip-onplan"],[3,"id","icon","name"],[1,"text-[13px]","text-[var(--muted)]","ml-1","tabular-nums"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[7px]","items-start","md:items-center","border-t","border-[var(--border)]/30","opacity-55"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"icon-18"],[1,"min-w-0"],["kind","item",3,"id","name","icon"],[1,"text-[11px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"block","h-[7px]","w-[7px]","shrink-0","rounded-full","bg-[var(--success)]/60"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]","text-[var(--success)]"],[1,"text-[14px]","font-semibold","tabular-nums"],[1,"min-w-0","flex","items-baseline","gap-2"],[1,"shrink-0","w-20","whitespace-nowrap","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"text-sm","text-[var(--text)]","truncate"],[1,"text-sm","text-[var(--text)]"]],template:function(n,i){n&1&&aE(0,Ms,1,1,"wl-load-state",0)(1,vd,38,4,"div",1),n&2&&cE(i.error()||!i.available()?0:1);},dependencies:[fv,hv,nt,Qo,tt],encapsulation:2})}return t})();function ca(t){return typeof t.x!="number"||typeof t.y!="number"?null:t.resourceActor===2?t.targetID??null:t.sourceID??null}var pa=-Math.PI/2,ma=1/100,xd=1/1e3,Xt=5;function bd(t,o){let e=new Map;for(let i of t){let a=ca(i);if(a==null)continue;let r=e.get(a);r||(r=[],e.set(a,r)),r.push({t:(i.timestamp-o)/1e3,x:i.x*ma,y:i.y*ma,facing:typeof i.facing=="number"?i.facing*xd:void 0,mapID:typeof i.mapID=="number"?i.mapID:void 0});}let n=new Map;for(let[i,a]of e)a.sort((r,l)=>r.t-l.t),n.set(i,{id:i,samples:a});return n}function Nn(t){let o=new Map;for(let e of t.parses)for(let n of e.enemies){if(n.game_id==null)continue;let i=o.get(n.game_id);i?n.is_boss&&(i.isBoss=true):o.set(n.game_id,{gameId:n.game_id,name:n.name,isBoss:n.is_boss});}return [...o.values()].sort((e,n)=>(n.isBoss?1:0)-(e.isBoss?1:0))}function yd(t,o){let e=new Map;for(let a of o)a.gameID!=null&&e.set(a.gameID,a.id);let n=Nn(t).find(a=>a.isBoss)?.gameId;return {bossActorId:n!=null?e.get(n)??null:null,refActorByGameId:e}}function Cd(t){let{positions:o,events:e,fightStartMs:n,playerId:i,enemies:a}=t,{bossActorId:r,refActorByGameId:l}=yd(o,a),s=bd(e,n);return s.get(i)?.samples.length?{timelines:s,playerId:i,bossActorId:r,refActorByGameId:l}:null}var Zt=(()=>{class t{source=T(qa$1);injector=T(ye);positions=So$1(null);live=So$1(null);error=So$1(null);overlayLoading=So$1(false);pendingOverlay=null;overlayLoaded=false;prepareSeq=0;open=So$1(false);anchorTime=So$1(0);reference=So$1({kind:"boss"});preS=So$1(Xt);postS=So$1(Xt);ready=TD(()=>!!this.positions());async loadBench(e,n){let i=await this.source.getBench(e,n);return this._applyBench(i),i}_applyBench(e){this.live.set(null),e.ok?(this.positions.set(e.value),this.error.set(null)):(e.error.kind==="permanent"&&ua$1(e.error.id,e.error.context),this.positions.set(null),this.error.set(e.error.kind==="missing"?null:e.error));}async prepare(e,n,i,a,r){let l=++this.prepareSeq;if(this.live.set(null),this._resetOverlay(),!n?.encounterID){this.positions.set(null),this.error.set(null);return}let s=await this.source.getBench(a,n.encounterID);l===this.prepareSeq&&(this._applyBench(s),s.ok&&(this.pendingOverlay={reportCode:e,fight:n,playerId:i,positions:s.value,enemies:r,seq:l},this.open()&&await this.ensureLiveOverlay()));}openAt(e){this.anchorTime.set(e.timeS),this.reference.set(e.reference??{kind:"boss"});let n=(e.windowLengthS??0)>0;this.preS.set(n?0:Xt),this.postS.set(n?e.windowLengthS:Xt),this.open.set(true),this.ensureLiveOverlay();}close(){this.open.set(false);}clear(){this.open.set(false),this.positions.set(null),this.live.set(null),this.error.set(null),this._resetOverlay();}_resetOverlay(){this.pendingOverlay=null,this.overlayLoaded=false,this.overlayLoading.set(false);}async ensureLiveOverlay(){let e=this.pendingOverlay;if(!(!e||this.overlayLoaded||this.overlayLoading())){this.overlayLoading.set(true);try{let{reportCode:n,fight:i,playerId:a,positions:r,enemies:l}=e,s=await this.fetchLiveEvents(n,i,a);if(e.seq!==this.prepareSeq)return;let m=Cd({positions:r,events:s,fightStartMs:i.startTime,playerId:a,enemies:l});if(this.live.set(m),m)this.error.set(null);else {let f=fa$1("No position data for you in this pull.","map.no-player-positions");!f.ok&&f.error.kind==="permanent"&&(ua$1(f.error.id,f.error.context),this.error.set(f.error));}this.overlayLoaded=!0;}catch(n){let i=ma$1(n,"map.overlay");ua$1(`MapFeatureService.ensureLiveOverlay ${e.reportCode}:${e.fight.id}`,n),this.live.set(null),this.error.set(!i.ok&&i.error.kind!=="missing"?i.error:null);}finally{this.overlayLoading.set(false);}}}async fetchLiveEvents(e,n,i){let{id:a,startTime:r,endTime:l}=n,s=this.injector.get(xe),[m,f]=await Promise.all([s.getAllEvents(e,a,"Casts",r,l,i,true),s.getAllEvents(e,a,"Casts",r,l,void 0,true,"Enemies")]);return [...m,...f]}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var wd=["*"];function Sd(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.loadingText());}}var fa=(()=>{class t{heading=iF.required();loadingText=iF("");closeLabel=iF.required();closed=oF();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-flyover-panel"]],inputs:{heading:[1,"heading"],loadingText:[1,"loadingText"],closeLabel:[1,"closeLabel"]},outputs:{closed:"closed"},ngContentSelectors:wd,decls:11,vars:3,consts:[[1,"fixed","inset-0","z-50","flex","flex-col","bg-[var(--bg)]","md:inset-y-0","md:left-auto","md:right-0","md:w-[460px]","md:border-l","md:border-[var(--border)]","md:shadow-2xl"],[1,"flex","items-center","justify-between","border-b","border-[var(--border)]","px-4","py-2"],[1,"flex","items-center","gap-2"],[1,"font-semibold"],[1,"text-[13px]","text-[var(--muted)]"],["mat-icon-button","",3,"click"],[1,"flex-1","overflow-y-auto","p-4"]],template:function(n,i){n&1&&(SE(),oi$1(0,"div",0)(1,"div",1)(2,"div",2)(3,"span",3),nD(4),bc$1(),aE(5,Sd,2,1,"span",4),bc$1(),oi$1(6,"button",5),cp("click",function(){return i.closed.emit()}),oi$1(7,"mat-icon"),nD(8,"close"),bc$1()()(),oi$1(9,"div",6),NE(10),bc$1()()),n&2&&(ov(4),Cp(i.heading()),ov(),cE(i.loadingText()?5:-1),ov(),ep("aria-label",i.closeLabel()));},dependencies:[Ib,Wd$1,fv,hv],encapsulation:2})}return t})();var Jt=1/100,Md=1/1e3;function kd(t,o){let e=(o-t)%(2*Math.PI);return e>Math.PI&&(e-=2*Math.PI),e<=-Math.PI&&(e+=2*Math.PI),e}function Ln(t,o){return t.mapID==null||o.mapID==null||t.mapID===o.mapID}function Ee(t,o,e=3){let n=t?.samples;if(!n||!n.length)return null;if(o<=n[0].t)return o<n[0].t-e?null:U($({},n[0]),{t:o});let i=n[n.length-1];if(o>=i.t)return o>i.t+e?null:U($({},i),{t:o});let a=0,r=n.length-1;for(;a<r;){let x=a+r>>1;n[x].t<o?a=x+1:r=x;}let l=n[a],s=n[a-1],m=l.t-s.t,f=m>0?(o-s.t)/m:0;if(s.mapID!==l.mapID)return U($({},f<.5?s:l),{t:o});let h;return s.facing!=null&&l.facing!=null?h=s.facing+kd(s.facing,l.facing)*f:h=s.facing??l.facing,{t:o,x:s.x+(l.x-s.x)*f,y:s.y+(l.y-s.y)*f,facing:h,mapID:s.mapID}}function gt(t,o,e=0){let n=t.x-o.x,i=t.y-o.y,a=(o.facing??Math.PI/2)+pa,r=Math.cos(a),l=Math.sin(a),s=n*r+i*l,m=n*l-i*r,f=Math.hypot(n,i),h=Math.atan2(m,s)*180/Math.PI;return {t:e,fwd:s,right:m,dist:f,angleDeg:h,mapID:t.mapID}}function Td(t,o){let e=o.map(([n,i,a,r,l])=>({t:n,x:i*Jt,y:a*Jt,facing:r==null?void 0:r*Md,mapID:l??void 0}));return {id:t,samples:e}}function Ed(t,o){let e=o.map(([n,i,a,r])=>({t:n,x:i*Jt,y:a*Jt,mapID:r??void 0}));return {id:t,samples:e}}function Dd(t,o){return o.kind==="boss"?(t.enemies.find(n=>n.is_boss)??t.enemies[0])?.samples??null:t.enemies.find(e=>e.game_id===o.gameId)?.samples??null}function ua(t,o){let e=[];for(let n of t.parses){let i=Dd(n,o);i&&e.push({player:Ed(-1,n.player),ref:Td(-2,i)});}return e}function $n(t,o){let e=[];for(let{player:n,ref:i}of t){let a=Ee(i,o),r=Ee(n,o);a&&r&&Ln(r,a)&&e.push(gt(r,a,o));}return e}function ha(t,o,e,n,i){let a=[];for(let{player:r,ref:l}of t){let s=[];for(let m=o-e;m<=o+n+1e-6;m+=i){let f=Ee(l,m),h=Ee(r,m);f&&h&&Ln(h,f)&&s.push(gt(h,f,m));}s.length&&a.push(s);}return a}function _a(t,o,e,n,i,a,r){let l=[],s=e.get(o),m=e.get(t);for(let f=n-i;f<=n+a+1e-6;f+=r){let h=Ee(s,f),x=Ee(m,f);h&&x&&Ln(x,h)&&l.push(gt(x,h,f));}return l}var Id=["canvas"],Fd=(t,o)=>o.gameId;function Ad(t,o){t&1&&np(0,"wl-load-state",1),t&2&&tp("error",o);}function Od(t,o){t&1&&(oi$1(0,"p",2),nD(1," No position data for this encounter. "),bc$1());}function Rd(t,o){if(t&1&&(oi$1(0,"mat-option",19),nD(1),bc$1()),t&2){let e=_E().$implicit;tp("value",e.gameId),ov(),Cp(e.name);}}function Pd(t,o){if(t&1&&aE(0,Rd,2,2,"mat-option",19),t&2){let e=o.$implicit;cE(e.isBoss?-1:0);}}function Nd(t,o){t&1&&(oi$1(0,"span",10),nD(1,"\u25C6 you"),bc$1());}function Ld(t,o){if(t&1){let e=vE();oi$1(0,"div",3)(1,"mat-form-field",4)(2,"mat-label"),nD(3,"Reference"),bc$1(),oi$1(4,"mat-select",5),cp("selectionChange",function(i){tu(e);let a=_E();return nu(a.onRefChange(i.value))}),oi$1(5,"mat-option",6),nD(6,"Boss"),bc$1(),dE(7,Pd,1,1,null,null,Fd),bc$1()()(),oi$1(9,"div",7),np(10,"canvas",8,0),oi$1(12,"div",9),aE(13,Nd,2,0,"span",10),oi$1(14,"span",11),nD(15,"\u25CF top parses"),bc$1(),oi$1(16,"span",12),nD(17,"\u25EF top-parse centre"),bc$1(),oi$1(18,"span",13),nD(19,"\u25B2 reference (facing up)"),bc$1()()(),oi$1(20,"div",14)(21,"button",15),cp("click",function(){tu(e);let i=_E();return nu(i.togglePlay())}),oi$1(22,"mat-icon"),nD(23),bc$1()(),oi$1(24,"div",16)(25,"input",17),cp("input",function(i){tu(e);let a=_E();return nu(a.onScrub(i.target.valueAsNumber))}),bc$1(),oi$1(26,"div",18)(27,"span"),nD(28),mD(29,"formatDuration"),bc$1(),oi$1(30,"span"),nD(31),mD(32,"formatDuration"),bc$1(),oi$1(33,"span"),nD(34),mD(35,"formatDuration"),bc$1()()()();}if(t&2){let e=_E();ov(4),tp("value",e.refValue()),ov(3),fE(e.refEnemies()),ov(6),cE(e.live()?13:-1),ov(8),ep("aria-label",e.playing()?"Pause":"Play"),ov(2),Cp(e.playing()?"pause":"play_arrow"),ov(2),tp("min",e.windowStart())("max",e.windowEnd())("value",e.scrubT()),ov(3),Cp(vD(29,10,e.windowStart())),ov(3),xc$1("anchor ",vD(32,12,e.anchorTime())),ov(3),Cp(vD(35,14,e.windowEnd()));}}var ga=.5,$d=.1,va=(()=>{class t{map=T(Zt);positions=this.map.positions;live=this.map.live;anchorTime=this.map.anchorTime;loadError=TD(()=>{let e=this.map.error();return e&&e.kind!=="missing"?e:null});selector=So$1({kind:"boss"});scrubT=So$1(0);playing=So$1(false);rafId=null;lastFrameMs=0;canvas=sF("canvas");refEnemies=TD(()=>{let e=this.positions();return e?Nn(e):[]});refValue=TD(()=>{let e=this.selector();return e.kind==="boss"?"boss":e.gameId});preS=this.map.preS;postS=this.map.postS;windowStart=TD(()=>this.anchorTime()-this.preS());windowEnd=TD(()=>this.anchorTime()+this.postS());parseTimelines=TD(()=>{let e=this.positions();return e?ua(e,this.selector()):[]});benchTrails=TD(()=>ha(this.parseTimelines(),this.anchorTime(),this.preS(),this.postS(),ga));liveRefId=TD(()=>{let e=this.live();if(!e)return null;let n=this.selector();return n.kind==="boss"?e.bossActorId:e.refActorByGameId.get(n.gameId)??null});liveTrail=TD(()=>{let e=this.live(),n=this.liveRefId();return !e||n==null?[]:_a(e.playerId,n,e.timelines,this.anchorTime(),this.preS(),this.postS(),ga)});readout=TD(()=>{if(!this.positions())return null;let e=this.scrubT(),n=$n(this.parseTimelines(),e),i=null;n.length&&(i={fwd:n.reduce((r,l)=>r+l.fwd,0)/n.length,right:n.reduce((r,l)=>r+l.right,0)/n.length});let a=this.livePlayerAt(e);return {centroid:i,player:a}});constructor(){T(Le).onDestroy(()=>this.stopTimer()),Cu(()=>{this.anchorTime(),this.selector.set(this.map.reference()),this.pause(),this.scrubT.set(this.anchorTime());}),Cu(()=>{let e=this.canvas()?.nativeElement;this.benchTrails(),this.liveTrail(),this.scrubT(),this.readout(),e&&this.draw(e);});}onRefChange(e){this.selector.set(e==="boss"?{kind:"boss"}:{kind:"enemy",gameId:e});}onScrub(e){this.pause(),this.scrubT.set(e);}togglePlay(){this.playing()?this.pause():this.play();}play(){this.scrubT()>=this.windowEnd()-1e-6&&this.scrubT.set(this.windowStart()),this.playing.set(true),this.stopTimer(),this.lastFrameMs=0;let e=n=>{let i=this.lastFrameMs?Math.min((n-this.lastFrameMs)/1e3,$d):0;this.lastFrameMs=n;let a=this.scrubT()+i;this.scrubT.set(a>=this.windowEnd()?this.windowStart():a),this.rafId=requestAnimationFrame(e);};this.rafId=requestAnimationFrame(e);}pause(){this.playing.set(false),this.stopTimer();}stopTimer(){this.rafId!=null&&(cancelAnimationFrame(this.rafId),this.rafId=null);}livePlayerAt(e){let n=this.live(),i=this.liveRefId();if(!n||i==null)return null;let a=Ee(n.timelines.get(i),e),r=Ee(n.timelines.get(n.playerId),e);return !a||!r||a.mapID!=null&&r.mapID!=null&&a.mapID!==r.mapID?null:gt(r,a,e)}draw(e){let n=e.getContext("2d");if(!n)return;let i=globalThis.devicePixelRatio||1,a=e.clientWidth||600,r=e.clientHeight||420,l=Math.round(a*i),s=Math.round(r*i);(e.width!==l||e.height!==s)&&(e.width=l,e.height=s),n.setTransform(i,0,0,i,0,0),n.clearRect(0,0,a,r);let m=a/2,f=r/2,h=Math.min(a,r)/2-28,x=this.benchTrails(),y=this.liveTrail(),C=this.readout(),E=10;for(let P of x)for(let Y of P)E=Math.max(E,Y.dist);for(let P of y)E=Math.max(E,P.dist);E=Math.ceil(E/5)*5+5;let G=h/E,Z=P=>[m+P.right*G,f-P.fwd*G],De=getComputedStyle(e),oe=P=>De.getPropertyValue(P).trim(),ye=oe("--gold"),st=oe("--border"),Ie=oe("--muted"),Re=oe("--critical"),dt=oe("--accent"),pn=oe("--map-dot-outline");n.strokeStyle=st,n.fillStyle=Ie,n.font="11px system-ui, sans-serif",n.lineWidth=1;for(let P=5;P<=E;P+=5)n.beginPath(),n.arc(m,f,P*G,0,2*Math.PI),n.stroke(),n.fillText(`${P}y`,m+3,f-P*G+12);n.fillStyle=Re,n.beginPath(),n.moveTo(m,f-9),n.lineTo(m-7,f+6),n.lineTo(m+7,f+6),n.closePath(),n.fill();let fn=this.scrubT();n.strokeStyle=Ie,n.globalAlpha=.25,n.lineWidth=1.5;for(let P of x)n.beginPath(),P.forEach((Y,se)=>{let[ct,ti]=Z(Y);se&&Y.mapID===P[se-1].mapID?n.lineTo(ct,ti):n.moveTo(ct,ti);}),n.stroke();n.globalAlpha=1;let Ce=$n(this.parseTimelines(),fn);n.fillStyle=Ie;for(let P of Ce){let[Y,se]=Z(P);n.beginPath(),n.arc(Y,se,3,0,2*Math.PI),n.fill();}if(C?.centroid){let[P,Y]=Z(C.centroid);n.strokeStyle=dt,n.lineWidth=2,n.beginPath(),n.arc(P,Y,7,0,2*Math.PI),n.stroke();}if(y.length&&(n.strokeStyle=ye,n.globalAlpha=.5,n.lineWidth=2,n.beginPath(),y.forEach((P,Y)=>{let[se,ct]=Z(P);Y&&P.mapID===y[Y-1].mapID?n.lineTo(se,ct):n.moveTo(se,ct);}),n.stroke(),n.globalAlpha=1),C?.player){let[P,Y]=Z(C.player),se=5;n.fillStyle=ye,n.beginPath(),n.moveTo(P,Y-se),n.lineTo(P+se,Y),n.lineTo(P,Y+se),n.lineTo(P-se,Y),n.closePath(),n.fill(),n.strokeStyle=pn,n.lineWidth=1,n.stroke();}}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-map-canvas"]],viewQuery:function(n,i){n&1&&pp(i.canvas,Id,5),n&2&&kE();},decls:3,vars:1,consts:[["canvas",""],[3,"error"],[1,"text-[13px]","text-[var(--muted)]"],[1,"mb-2","flex","flex-wrap","items-center","justify-end","gap-2"],["appearance","outline",1,"w-[200px]"],[3,"selectionChange","value"],["value","boss"],[1,"relative","rounded-lg","border","border-[var(--border)]","bg-[var(--surface-alt)]"],[1,"block","h-[420px]","w-full"],[1,"pointer-events-none","absolute","bottom-2","left-2","flex","flex-col","gap-0.5","text-[10px]"],[1,"text-[var(--gold)]"],[1,"text-[var(--muted)]"],[1,"text-[var(--accent)]"],[1,"text-[var(--critical)]"],[1,"mt-2","flex","items-center","gap-2"],["mat-icon-button","",3,"click"],[1,"min-w-0","flex-1"],["type","range","step","0.25",1,"block","w-full","accent-[var(--gold)]",3,"input","min","max","value"],[1,"mt-1","flex","justify-between","text-[10px]","text-[var(--muted)]"],[3,"value"]],template:function(n,i){if(n&1&&aE(0,Ad,1,1,"wl-load-state",1)(1,Od,2,0,"p",2)(2,Ld,36,16),n&2){let a;cE((a=i.loadError())?0:i.positions()?2:1,a);}},dependencies:[Ib,Wd$1,fv,hv,jt,Vt,ht,Ro,Oo,Je,tt,Wo],encapsulation:2})}return t})();function Bd(t,o){if(t&1){let e=vE();oi$1(0,"wl-flyover-panel",1),cp("closed",function(){tu(e);let i=_E();return nu(i.map.close())}),np(1,"wl-map-canvas"),bc$1();}if(t&2){let e=_E();tp("loadingText",e.map.overlayLoading()?"Loading your trail...":"");}}var i_=(()=>{class t{map=T(Zt);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-map-panel"]],decls:1,vars:1,consts:[["heading","Positioning","closeLabel","Close map",3,"loadingText"],["heading","Positioning","closeLabel","Close map",3,"closed","loadingText"]],template:function(n,i){n&1&&aE(0,Bd,2,1,"wl-flyover-panel",0),n&2&&cE(i.map.open()?0:-1);},dependencies:[fa,va],encapsulation:2})}return t})();var a_=(()=>{class t{transform(e){return e?e.replace(/([A-Z])/g," $1").trim():""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatSpec",type:t,pure:true})}return t})();var s_=(()=>{class t{transform(e){return e?Yb(e):""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"specIcon",type:t,pure:true})}return t})();var m_=(()=>{class t{transform(e){return Gb(e??"")}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"classIcon",type:t,pure:true})}return t})();function xa(t){return !Number.isInteger(t)||t<=0?"":`https://assets.rpglogs.com/img/warcraft/bosses/${t}-icon.jpg`}var h_=(()=>{class t{transform(e){return e?xa(e):""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"bossIcon",type:t,pure:true})}return t})();function Wd(t,o){if(t&1&&np(0,"img",0),t&2){let e=_E();tp("ngSrc",o)("width",e.size())("height",e.size())("alt",e.alt());}}var y_=(()=>{class t{src=iF.required();alt=iF.required();size=iF(20);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-art-icon"]],hostAttrs:[1,"inline-flex","items-center","shrink-0","align-middle"],inputs:{src:[1,"src"],alt:[1,"alt"],size:[1,"size"]},decls:1,vars:1,consts:[[1,"block","rounded-sm",3,"ngSrc","width","height","alt"]],template:function(n,i){if(n&1&&aE(0,Wd,1,4,"img",0),n&2){let a;cE((a=i.src())?0:-1,a);}},dependencies:[lf],encapsulation:2})}return t})();var ba="wl.sel.postRaid",ya="wl.sel.preFight",Ca="wl.sel.northernSky",S_=(()=>{class t{savePostRaid(e){this._save(ba,e,"SelectionStore.savePostRaid");}loadPostRaid(){return this._load(ba,"SelectionStore.loadPostRaid")}savePreFight(e){this._save(ya,e,"SelectionStore.savePreFight");}loadPreFight(){return this._load(ya,"SelectionStore.loadPreFight")}saveNorthernSky(e){this._save(Ca,e,"SelectionStore.saveNorthernSky");}loadNorthernSky(){return this._load(Ca,"SelectionStore.loadNorthernSky")}_save(e,n,i){try{localStorage.setItem(e,JSON.stringify(n));}catch(a){ua$1(i,a);}}_load(e,n){try{let i=localStorage.getItem(e);return i?JSON.parse(i):null}catch(i){return ua$1(n,i),null}}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function en(t,o){return t==null||o==null?NaN:t<o?-1:t>o?1:t>=o?0:NaN}function*wa(t,o){for(let e of t)e!=null&&(e=+e)>=e&&(yield e);}function Sa(t=en){if(t===en)return Bn;if(typeof t!="function")throw new TypeError("compare is not a function");return (o,e)=>{let n=t(o,e);return n||n===0?n:(t(e,e)===0)-(t(o,o)===0)}}function Bn(t,o){return (t==null||!(t>=t))-(o==null||!(o>=o))||(t<o?-1:t>o?1:0)}function tn(t,o){let e;for(let n of t)n!=null&&(e<n||e===void 0&&n>=n)&&(e=n);return e}function nn(t,o){let e;for(let n of t)n!=null&&(e>n||e===void 0&&n>=n)&&(e=n);return e}function on(t,o,e=0,n=1/0,i){if(o=Math.floor(o),e=Math.floor(Math.max(0,e)),n=Math.floor(Math.min(t.length-1,n)),!(e<=o&&o<=n))return t;for(i=i===void 0?Bn:Sa(i);n>e;){if(n-e>600){let s=n-e+1,m=o-e+1,f=Math.log(s),h=.5*Math.exp(2*f/3),x=.5*Math.sqrt(f*h*(s-h)/s)*(m-s/2<0?-1:1),y=Math.max(e,Math.floor(o-m*h/s+x)),C=Math.min(n,Math.floor(o+(s-m)*h/s+x));on(t,o,y,C,i);}let a=t[o],r=e,l=n;for(vt(t,e,o),i(t[n],a)>0&&vt(t,e,n);r<l;){for(vt(t,r,l),++r,--l;i(t[r],a)<0;)++r;for(;i(t[l],a)>0;)--l;}i(t[e],a)===0?vt(t,e,l):(++l,vt(t,l,n)),l<=o&&(e=l+1),o<=l&&(n=l-1);}return t}function vt(t,o,e){let n=t[o];t[o]=t[e],t[e]=n;}function Wn(t,o,e){if(t=Float64Array.from(wa(t)),!(!(n=t.length)||isNaN(o=+o))){if(o<=0||n<2)return nn(t);if(o>=1)return tn(t);var n,i=(n-1)*o,a=Math.floor(i),r=tn(on(t,a).subarray(0,a+1)),l=nn(t.subarray(a+1));return r+(l-r)*(i-a)}}function at(t,o){return Wn(t,.5)}function zd(t,o=1){return Math.round(t*10**o)/10**o}function rt(t,o,e){let n=t.get(o);return n===void 0&&(n=e(),t.set(o,n)),n}function lt(t,o,e,n=2){return t>o+n*e}function ka(t,o,e,n=2){return Math.abs(t-o)>n*e}function Ta(t,o,e,n=2){return t<o-n*e}function Ea(t,o){return Math.max(0,(1-t/o)*100)}function Da(t){return t.length===0?0:t.reduce((o,e)=>Math.abs(e)<Math.abs(o)?e:o)}var Gd=6e4;function an(t,o){let e=t/Gd,n=Math.round(o.avg*e),i=Math.max(0,Math.round(n-o.stddev*e));return {expected:n,floor:i}}function V(t){let o=Math.floor(t/1e3);return `${String(Math.floor(o/60)).padStart(2,"0")}:${String(o%60).padStart(2,"0")}`}function R(t,o=0){return String(zd(t/1e3,o))}var Ma={critical:0,warning:1,info:2,hold_suggestion:2,success:3};function xt(t){t.sort((o,e)=>(Ma[o.severity]??4)-(Ma[e.severity]??4));}function rn(t,o,e){let n=[];if(!o.length)return n;for(let[i,a]of Object.entries(e)){let r=parseInt(i,10)-1;if(r<1||r>=o.length)continue;if(o[r]-o[r-1]-a.effective_cd_ms<a.delay_ms-a.band_ms){let s=o[r],m=a.target_ms;n.push({severity:"info",category:"hold_suggestion",timestamp_ms:Math.round(o[r]),measured:{value:V(s),unit:`top ${V(m)}`},message:`${t} cast ${i} at ${V(s)}. ${a.count}/${a.total_samples} top parses hold to ${V(m)}.`,details:{remedy:`Hold ${t} to ${V(m)}.`,cd_name:t},occurrences:[]});}}return n}function zn(t,o){let e=new Map;for(let n of t){let i=n.abilityGameID;if(i==null)continue;let a=n.timestamp-o;if(n.type==="applybuff"||n.type==="applydebuff")rt(e,i,()=>[]).push([a,null]);else if(n.type==="removebuff"||n.type==="removedebuff"){let r=e.get(i)??[];for(let l=r.length-1;l>=0;l--)if(r[l][1]==null){r[l][1]=a;break}}}return e}function ln(t,o,e){return (t.get(o)??[]).some(([n,i])=>e>=n&&(i==null||e<=i))}function Ia(t,o,e){return (t.get(o)??[]).some(([n,i])=>e>n&&(i==null||e<=i))}function Fa(t,o,e){let n=[];for(let i of t){if(i.abilityGameID!==e)continue;let a=i.timestamp-o;i.type==="applybuff"||i.type==="applydebuff"?n.push([a,i.stack??1]):i.type.endsWith("buffstack")||i.type.endsWith("debuffstack")?n.push([a,i.stack??0]):(i.type==="removebuff"||i.type==="removedebuff")&&n.push([a,0]);}return n}function Aa(t,o){let e=0;for(let[n,i]of t){if(n>=o)break;e=i;}return e}function Gn(t,o,e){let n=new Map;for(let i of t){if(i.abilityGameID!==e)continue;let a=i.timestamp-o,r=rt(n,ot(i),()=>[]),l=r.length&&r[r.length-1].endMs==null?r[r.length-1]:null;i.type==="applybuff"||i.type==="applydebuff"?l||r.push({startMs:a,endMs:null,endedByRefresh:false}):i.type==="refreshbuff"||i.type==="refreshdebuff"?(l&&(l.endMs=a,l.endedByRefresh=true),r.push({startMs:a,endMs:null,endedByRefresh:false})):(i.type==="removebuff"||i.type==="removedebuff")&&l&&(l.endMs=a);}return n}function Oa(t,o,e){if(e<=0)return 0;let n=(t.get(o)??[]).map(([r,l])=>[Math.max(0,r),Math.min(e,l??e)]).filter(([r,l])=>l>r).sort((r,l)=>r[0]-l[0]),i=0,a=-1;for(let[r,l]of n){let s=Math.max(r,a);l>s&&(i+=l-s,a=l);}return i/e*100}var Vd=3e3,jd=1,qd=2,Hd=2e3,Ud=250,sn=24;function Ra(t,o){let e=t.length/o;return Array.from({length:o},(n,i)=>t[Math.floor(i*e)])}function ze(t){if(t.length<=sn)return t;let o=t.filter(i=>!i.ok);if(o.length>=sn)return Ra(o,sn);let e=t.filter(i=>i.ok),n=new Set([...o,...Ra(e,sn-o.length)]);return t.filter(i=>n.has(i))}function Qd(t,o){let e={};for(let n of t)n.type==="cast"&&n.abilityGameID&&(e[n.abilityGameID]??=[]).push(n.timestamp-o);return e}function Pa(t){let o;return ()=>o??=t()}function Vn(t){let o=new Map;return e=>rt(o,e,()=>t(e))}function Kd(t){return t.map(o=>[o.timestamp,ot(o)]).sort((o,e)=>o[0]-e[0])}function Yd(t){let o=new Map;for(let e of t)e.resourceActor!==qd||e.hitPoints==null||!e.maxHitPoints||rt(o,ot(e),()=>[]).push([e.timestamp,e.hitPoints/e.maxHitPoints]);for(let e of o.values())e.sort((n,i)=>n[0]-i[0]);return o}function Na(t,o){let e=0,n=t;for(;e<n;){let i=e+n>>1;o(i)?n=i:e=i+1;}return e}function La(t){let o=t.fEnd-t.fStart,e=t.deaths.map(i=>i.timestamp-t.fStart),n=Pa(()=>Yd(t.damage));return {castTimes:Qd(t.casts,t.fStart),castEvents:t.casts,fStart:t.fStart,fightDurationMs:o,aliveDurationMs:e.length?Math.min(...e):o,selfAuras:zn(t.buffs,t.fStart),targetAuras:zn(t.debuffs,t.fStart),stacks:Vn(i=>Fa(t.buffs,t.fStart,i)),selfSpans:Vn(i=>Gn(t.buffs,t.fStart,i)),targetSpans:Vn(i=>Gn(t.debuffs,t.fStart,i)),damageIndex:Pa(()=>Kd(t.damage)),targetHealth:i=>n().get(i)??[]}}function Ge(t,o){return o==="up"?t.value+t.band:Math.max(0,t.value-t.band)}function dn(t,o){return t.castTimes[o]?.length??0}function Xd(t,o,e){return e==="either"?Math.abs(t)<=o:e==="before"?t>=0&&t<=o:t<=0&&-t<=o}function $a(t,o){let e=t.position??"before",n=o[t.required_spell_id]??[];return [...o[t.spell_id]??[]].sort((i,a)=>i-a).map(i=>{let a=n.map(r=>i-r).filter(r=>e==="either"||(e==="before"?r>=0:r<=0)).map(Math.abs);return a.length?Math.min(...a):null})}function Zd(t,o,e){let n=[...o[t.spell_id]??[]].sort((a,r)=>a-r),i=$a(t,o);return ze(n.map((a,r)=>{let l=i[r],s=l!=null&&l<=e;return {atMs:Math.round(a),ok:s,label:l==null?"none":`${R(l)}s`,detail:l==null?`No ${t.required_spell_name} paired with this cast.`:`${t.required_spell_name} landed ${R(l)}s from this cast.`}}))}function Jd(t,o,e,n,i){let a=Ge(e,"up"),r=t.position??"before",l=o.castTimes,s=[...l[t.spell_id]??[]].sort((h,x)=>h-x),m=l[t.required_spell_id]??[],f=s.filter(h=>!m.some(x=>Xd(h-x,a,r)));return f.length?{severity:n,category:"rule_violation",timestamp_ms:Math.round(f[0]),label:`${t.spell_name} without ${t.required_spell_name}`,message:`${t.spell_name} without ${t.required_spell_name} inside ${R(a)}s: ${f.length} of ${s.length} cast(s).`,measured:{value:`${f.length} / ${s.length}`,unit:"cast(s)"},details:i?{remedy:i}:void 0,occurrences:Zd(t,l,a),occurrenceTarget:`field pairs inside ${R(a)}s`}:null}function jn(t,o){return [...o[t.anchor_spell_id]??[]].sort((e,n)=>e-n).slice(1)}function ec(t,o,e,n){let i=e.map(a=>({atMs:Math.round(a),ok:true,label:t.anchor_spell_name,marker:true,detail:`${t.anchor_spell_name} cast here.`}));return t.spell_ids.forEach((a,r)=>{let l=t.spell_names?.[r]??String(a);for(let s of o.castTimes[a]??[]){let m=e.filter(x=>x>s).sort((x,y)=>x-y)[0],f=m!=null?m-s:null,h=f==null||f>n;i.push({atMs:Math.round(s),ok:h,label:f==null?"clear":`${R(f)}s`,detail:f==null?`${l} cast with no ${t.anchor_spell_name} ahead to hold for.`:`${l} cast ${R(f)}s before ${t.anchor_spell_name}.`});}}),i.sort((a,r)=>(a.atMs??0)-(r.atMs??0)),ze(i)}function tc(t,o,e,n,i){let a=Ge(e,"down"),r=jn(t,o.castTimes),l=t.spell_ids.flatMap((f,h)=>{let x=t.spell_names?.[h]??String(f);return r.flatMap(y=>(o.castTimes[f]??[]).filter(C=>C>=y-a&&C<y).map(C=>({spellName:x,castTime:C})))});if(!l.length)return null;let s=l.reduce((f,h)=>Math.min(f,h.castTime),1/0),m=[...new Set(l.map(f=>f.spellName))].join("/");return {severity:n,category:"rule_violation",timestamp_ms:Math.round(s),label:`${m} held before ${t.anchor_spell_name}`,message:`${m} used in the ${R(a)}s the field keeps clear before ${t.anchor_spell_name}: ${l.length} charge(s).`,measured:{value:`${l.length}`,unit:"charge(s)"},details:i?{remedy:i}:void 0,occurrences:ec(t,o,r,a),occurrenceTarget:`gap to ${t.anchor_spell_name} at cast`}}function nc(t,o,e){return ze(e.map(n=>{let i=ln(o.selfAuras,t.buff_spell_id,n);return {atMs:Math.round(n),ok:i===(t.require==="inside"),label:i?"up":"down",detail:`${t.buff_spell_name} was ${i?"up":"down"} at this cast.`}}))}function ic(t,o,e,n){let i=[...o.castTimes[t.spell_id]??[]].sort((l,s)=>l-s),a=i.filter(l=>ln(o.selfAuras,t.buff_spell_id,l)!==(t.require==="inside"));if(!a.length)return null;let r=t.require==="inside"?"without":"during";return {severity:e,category:"rule_violation",timestamp_ms:Math.round(a[0]),label:`${t.spell_name} ${r} ${t.buff_spell_name}`,message:`${t.spell_name} ${r} ${t.buff_spell_name}: ${a.length} of ${i.length} cast(s).`,measured:{value:`${a.length} / ${i.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0,occurrences:nc(t,o,i),occurrenceTarget:"buff state at cast"}}function qn(t,o){let e=t.on==="target"?o.targetAuras:o.selfAuras;return Oa(e,t.aura_spell_id,o.aliveDurationMs)}function oc(t,o,e){let n=(t.get(o)??[]).map(([a,r])=>[Math.max(0,a),Math.min(e,r??e)]).filter(([a,r])=>r>a).sort((a,r)=>a[0]-r[0]),i=[];for(let[a,r]of n){let l=i[i.length-1];l&&a<=l[1]?l[1]=Math.max(l[1],r):i.push([a,r]);}return i}var ac=3,rc=1e3;function lc(t,o){let e=[],n=0;for(let[i,a]of t)i>n&&e.push([n,i]),n=Math.max(n,a);return n<o&&e.push([n,o]),e.filter(([i,a])=>a-i>=rc).sort((i,a)=>a[1]-a[0]-(i[1]-i[0])).slice(0,ac).sort((i,a)=>i[0]-a[0])}function sc(t,o,e,n,i){let a=Ge(e,"down"),r=qn(t,o);if(r<=0||r>=a)return null;let l=t.on==="target"?o.targetAuras:o.selfAuras,s=o.aliveDurationMs,m=oc(l,t.aura_spell_id,s),f=lc(m,s);return {severity:n,category:"rule_violation",label:`${t.aura_spell_name} uptime`,message:`${t.aura_spell_name} up ${Math.round(r)}% of the fight; the top parses hold ${Math.round(e.value)}%.`,measured:{value:`${Math.round(r)} / ${Math.round(e.value)}`,unit:"% uptime"},details:i?{remedy:i}:void 0,occurrences:f.map(([h,x])=>({atMs:Math.round(h),ok:false,label:`${R(x-h)}s`,detail:`${t.aura_spell_name} was down here for ${R(x-h)}s.`})),timeline:{segmentsMs:m,fightDurationMs:s}}}function Ba(t,o,e){let n=Object.values(o.castTimes).flat();if(!n.length)return null;let i=Math.min(...n),a=i+e,r=i,l=0;for(let s of t.spell_ids){let m=(o.castTimes[s]??[]).filter(f=>f>=r&&f<=a).sort((f,h)=>f-h)[0];if(m==null)break;r=m,l++;}return {pullMs:i,matched:l,completedMs:l===t.spell_ids.length?r-i:null}}function dc(t,o,e,n){let i=e;return t.spell_ids.map(a=>{let r=(o.castTimes[a]??[]).filter(l=>l>=i&&l<=n).sort((l,s)=>l-s)[0];return r==null?{ok:false}:(i=r,{ok:true,atMs:Math.round(r)})})}function cc(t,o,e,n){let i=dc(t,o,e,n);return t.spell_ids.map((a,r)=>{let l=t.spell_names[r]??String(a),s=i[r];return s.ok?{atMs:s.atMs,ok:true,label:l,detail:`${l} landed on time in its slot.`}:{ok:false,label:l,note:"not reached",detail:`${l} was never reached in the opener window.`}})}function mc(t,o,e,n,i){let a=Ge(e,"up"),r=Ba(t,o,a);return !r||r.completedMs!=null?null:{severity:n,category:"rule_violation",timestamp_ms:Math.round(r.pullMs),label:`Opener: ${t.spell_names.join(" > ")}`,message:`Opener reached ${r.matched} of ${t.spell_ids.length} steps in the ${R(a)}s the top parses take.`,measured:{value:`${r.matched} / ${t.spell_ids.length}`,unit:"step(s)"},details:i?{remedy:i}:void 0,occurrences:cc(t,o,r.pullMs,r.pullMs+a),occurrenceTarget:`expected order: ${t.spell_names.join(" > ")}`}}function pc(t,o,e){let n=o+e,i=n+Vd,a=new Set;for(let r=Na(t.length,l=>t[l][0]>=n);r<t.length&&t[r][0]<=i;r++)a.add(t[r][1]);return a.size}function Hn(t,o){return [...o.castTimes[t.spell_id]??[]].sort((e,n)=>e-n).map(e=>({timeMs:e,targets:pc(o.damageIndex(),o.fStart,e)})).filter(({targets:e})=>e>0)}var Wa={quantize:Math.round,format:t=>String(Math.round(t))},fc={quantize:t=>Math.round(t*100)/100,format:t=>`${Math.round(t*100)}%`};function Jn(t,o,e,n){if(!t.values.length)return null;let i=t.scale.quantize(Ge(o,t.bound==="min"?"down":"up")),a=t.values.filter(({value:s})=>t.bound==="min"?s<i:s>i);if(!a.length)return null;let r=t.phrase(t.scale.format(i)),l=t.scale.format(i);return {severity:e,category:"rule_violation",timestamp_ms:Math.round(a[0].timeMs),label:`${t.subject} ${r}`,message:`${t.subject} cast ${r}${t.tail??""}, ${a.length} of ${t.values.length} cast(s). Top: ${t.scale.format(o.value)}.`,measured:{value:`${a.length} / ${t.values.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0,occurrences:ze(t.values.map(({timeMs:s,value:m})=>{let f=t.bound==="min"?m>=i:m<=i,h=t.scale.format(m);return {atMs:Math.round(s),ok:f,label:h,detail:`${t.subject} cast at ${h}.`}})),occurrenceTarget:t.bound==="min"?`field waits for ${l}+`:`field stays under ${l}`}}function uc(t,o,e,n,i){return Jn({values:Hn(t,o).map(({timeMs:a,targets:r})=>({timeMs:a,value:r})),bound:t.bound,scale:Wa,subject:t.spell_name,phrase:a=>`at ${t.bound==="min"?"under":"over"} ${a} targets`},e,n,i)}function Un(t,o){let e=[];for(let n of o.castEvents){if(n.type!=="cast"||n.abilityGameID!==t.spell_id||n.resourceActor!=null&&n.resourceActor!==jd)continue;let i=n.classResources?.find(a=>a.type===t.resource_type);i?.max&&e.push({timeMs:n.timestamp-o.fStart,frac:i.amount/i.max,amount:i.amount,max:i.max});}return e}var hc=200;function _c(t){return {quantize:o=>Math.round(o*t),format:o=>`${Math.round(o)}/${t}`}}function gc(t,o,e,n,i){let a=Un(t,o);if(!a.length)return null;let r=a[0].max,l=r<=hc;return Jn({values:a.map(({timeMs:s,frac:m,amount:f})=>({timeMs:s,value:l?f:m})),bound:t.bound,scale:l?_c(r):fc,subject:t.spell_name,phrase:s=>`${t.bound==="min"?"below":"above"} ${s} ${t.resource_name}`},e,n,i)}function za(t,o){return (o.selfAuras.get(t.buff_spell_id)??[]).filter(([,e])=>e!=null&&e<o.fightDurationMs)}function vc(t,o,e,n){let i=za(t,o);if(!i.length)return null;let a=t.spend_spell_ids.flatMap(s=>o.castTimes[s]??[]),r=(s,m)=>a.some(f=>f>=s&&f<=m),l=i.filter(([s,m])=>!r(s,m));return l.length?{severity:e,category:"rule_violation",timestamp_ms:Math.round(l[0][0]),label:`${t.buff_spell_name} wasted`,message:`${t.buff_spell_name} expired unspent ${l.length} of ${i.length} time(s).`,measured:{value:`${l.length} / ${i.length}`,unit:"proc(s)"},details:n?{remedy:n}:void 0,occurrences:ze(i.map(([s,m])=>{let f=r(s,m);return {atMs:Math.round(s),ok:f,label:f?"used":"wasted",detail:f?`${t.buff_spell_name} was spent before it expired.`:`${t.buff_spell_name} expired unspent here.`}})),occurrenceTarget:"window it expired in"}:null}function Ga(t,o,e){let n=e(t).length,i=o.flatMap(e);return {coached:n,total:n+i.length,firstAlternativeMs:i.length?Math.min(...i):null}}function Qn(t){return t.total?t.coached/t.total:null}function Va(t,o,e,n,i,a){let r=Qn(t);return r==null||r>=Ge(o,"down")?null:{severity:e,category:"rule_violation",timestamp_ms:t.firstAlternativeMs==null?void 0:Math.round(t.firstAlternativeMs),label:`${n} ${i}`,message:`${n} was ${Math.round(r*100)}% of your fillers ${i}. Top: ${Math.round(o.value*100)}%.`,measured:{value:`${Math.round(r*100)} / ${Math.round(o.value*100)}`,unit:"% of fillers"},details:a?{remedy:a}:void 0,occurrences:[]}}function ja(t,o,e,n,i){let a=[...i(t).map(r=>({atMs:Math.round(r),ok:true,label:o})),...e.flatMap((r,l)=>{let s=n[l]??String(r);return i(r).map(m=>({atMs:Math.round(m),ok:false,label:s}))})];return a.sort((r,l)=>r.atMs-l.atMs),ze(a.map(r=>U($({},r),{detail:r.ok?`${r.label} was the coached filler here.`:`${r.label} was pressed instead of ${o} here.`})))}function qa(t,o){return e=>(o.castTimes[e]??[]).filter(n=>Ia(o.selfAuras,t.buff_spell_id,n)&&!cn(t.except_buff_spell_ids,o,n))}function Kn(t,o){return Ga(t.spell_id,t.alternative_spell_ids,qa(t,o))}function xc(t,o,e,n,i){let a=Va(Kn(t,o),e,n,t.spell_name,`in ${t.buff_spell_name}`,i);return a?U($({},a),{occurrences:ja(t.spell_id,t.spell_name,t.alternative_spell_ids,t.alternative_spell_names,qa(t,o)),occurrenceTarget:`filler choice inside ${t.buff_spell_name}`}):null}function cn(t,o,e){return (t??[]).some(n=>ln(o.selfAuras,n,e))}function Yn(t,o){let e=o.stacks(t.buff_spell_id);return e.length?[...o.castTimes[t.spell_id]??[]].sort((n,i)=>n-i).filter(n=>!cn(t.except_buff_spell_ids,o,n)).map(n=>({timeMs:n,stacks:Aa(e,n)})):[]}function bc(t,o,e,n,i){let a=t.bound==="min"?"under":"over";return Jn({values:Yn(t,o).map(({timeMs:r,stacks:l})=>({timeMs:r,value:l})),bound:t.bound,scale:Wa,subject:t.spell_name,phrase:r=>`at ${a} ${r} ${t.buff_spell_name}`,tail:t.bound==="max"?", overcapping":void 0},e,n,i)}function yc(t){return [...t.values()].flat().filter(o=>o.endMs!=null)}function Cc(t,o){return t.on==="target"?o.targetSpans(t.aura_spell_id):o.selfSpans(t.aura_spell_id)}function wc(t,o){let e=o.castTimes[t.cast_spell_id]??[],n=i=>e.some(a=>i-a>=0&&i-a<=Ud);return yc(Cc(t,o)).filter(i=>i.endedByRefresh&&n(i.endMs)&&!cn(t.except_buff_spell_ids,o,i.endMs))}function Xn(t,o){return wc(t,o).map(e=>({timeMs:e.endMs,elapsedMs:e.endMs-e.startMs})).sort((e,n)=>e.timeMs-n.timeMs)}function Sc(t,o,e,n,i){let a=Xn(t,o);if(!a.length)return null;let r=Ge(e,"down"),l=a.filter(({elapsedMs:m})=>m<r);if(!l.length)return null;let s=R(r,1);return {severity:n,category:"rule_violation",timestamp_ms:Math.round(l[0].timeMs),label:`${t.aura_spell_name} clipped`,message:`${t.aura_spell_name} re-applied a median ${R(at(l.map(m=>m.elapsedMs))??0,1)}s in, ${l.length} of ${a.length} refresh(es). Top: ${R(e.value,1)}s.`,measured:{value:`${l.length} / ${a.length}`,unit:"refresh(es)"},details:i?{remedy:i}:void 0,occurrences:ze(a.map(({timeMs:m,elapsedMs:f})=>({atMs:Math.round(m),ok:f>=r,label:`${R(f,1)}s`,detail:`Refreshed with ${R(f,1)}s still remaining.`}))),occurrenceTarget:`field waits for ${s}s remaining`}}function Mc(t,o){let e=t.targetHealth(ot(o)),n=Na(e.length,i=>e[i][0]>o.timestamp)-1;return n<0||e[n][0]<o.timestamp-Hd?null:e[n][1]}function Ha(t,o){let e=t.health_pct/100;return n=>o.castEvents.filter(i=>{if(i.type!=="cast"||i.abilityGameID!==n||cn(t.except_buff_spell_ids,o,i.timestamp-o.fStart))return  false;let a=Mc(o,i);return a!=null&&a<=e}).map(i=>i.timestamp-o.fStart)}function Zn(t,o){return Ga(t.spell_id,t.alternative_spell_ids,Ha(t,o))}function kc(t,o,e,n,i){let a=Va(Zn(t,o),e,n,t.spell_name,`under ${t.health_pct}% health`,i);return a?U($({},a),{occurrences:ja(t.spell_id,t.spell_name,t.alternative_spell_ids,t.alternative_spell_names,Ha(t,o)),occurrenceTarget:`filler choice under ${t.health_pct}% health`}):null}var Ua={cooldown_pairing:"pairing",cd_hold:"cd hold",opener:"opener",rotation:"rotation",aoe_switch:"aoe"};function be(t){return (o,e,n,i,a)=>n&&t(o,e,n,i,a)}var Tc={cast_without_prior:{streams:()=>[],measure:(t,o)=>{let e=$a(t,o.castTimes).filter(n=>n!=null);return e.length?Math.max(...e):null},evaluate:be(Jd),applicable:(t,o)=>dn(o,t.spell_id)>0,label:t=>`${t.spell_name} with ${t.required_spell_name}`},hold_cooldown_for_anchor:{streams:()=>[],measure:(t,o)=>{let e=jn(t,o.castTimes).flatMap(n=>t.spell_ids.flatMap(i=>o.castTimes[i]??[]).filter(i=>i<n).map(i=>n-i));return e.length?Math.min(...e):null},evaluate:be(tc),applicable:(t,o)=>jn(t,o.castTimes).length>0&&t.spell_ids.some(e=>dn(o,e)>0),label:t=>`${t.spell_names.join("/")} held for ${t.anchor_spell_name}`},cast_outside_buff:{streams:()=>[],measure:null,evaluate:(t,o,e,n,i)=>ic(t,o,n,i),applicable:(t,o)=>dn(o,t.spell_id)>0,label:t=>`${t.spell_name} ${t.require} ${t.buff_spell_name}`},aura_uptime_below:{streams:t=>t.on==="target"?["enemyAuras","deaths"]:["deaths"],measure:(t,o)=>qn(t,o)||null,evaluate:be(sc),applicable:(t,o)=>qn(t,o)>0,label:t=>`${t.aura_spell_name} uptime`},opening_sequence:{streams:()=>[],measure:(t,o)=>Ba(t,o,o.fightDurationMs)?.completedMs??null,evaluate:be(mc),applicable:(t,o)=>t.spell_ids.some(e=>dn(o,e)>0),label:t=>`Opener: ${t.spell_names.join(" > ")}`},cast_at_target_count:{streams:()=>["damage"],measure:(t,o)=>{let e=Hn(t,o).map(n=>n.targets);return e.length?at(e)??null:null},evaluate:be(uc),applicable:(t,o)=>Hn(t,o).length>0,label:t=>`${t.spell_name} target count`},resource_at_cast:{streams:()=>[],measure:(t,o)=>{let e=Un(t,o).map(n=>n.frac);return e.length?at(e)??null:null},evaluate:be(gc),applicable:(t,o)=>Un(t,o).length>0,label:t=>`${t.spell_name} at ${t.resource_name}`},proc_wasted:{streams:()=>[],measure:null,evaluate:(t,o,e,n,i)=>vc(t,o,n,i),applicable:(t,o)=>za(t,o).length>0,label:t=>`${t.buff_spell_name} spent`},filler_in_buff:{streams:()=>[],measure:(t,o)=>Qn(Kn(t,o)),evaluate:be(xc),applicable:(t,o)=>Kn(t,o).total>0,label:t=>`${t.spell_name} in ${t.buff_spell_name}`},spend_at_stacks:{streams:()=>[],measure:(t,o)=>{let e=Yn(t,o).map(n=>n.stacks);return e.length?t.bound==="min"?Math.min(...e):Math.max(...e):null},evaluate:be(bc),applicable:(t,o)=>Yn(t,o).length>0,label:t=>`${t.spell_name} at ${t.buff_spell_name}`},aura_clipped:{streams:t=>t.on==="target"?["enemyAuras"]:[],measure:(t,o)=>{let e=Xn(t,o).map(n=>n.elapsedMs);return e.length?Math.min(...e):null},evaluate:be(Sc),applicable:(t,o)=>Xn(t,o).length>0,label:t=>`${t.aura_spell_name} clipped`},filler_below_health:{streams:()=>["damage","targetHealth"],measure:(t,o)=>Qn(Zn(t,o)),evaluate:be(kc),applicable:(t,o)=>Zn(t,o).total>0,label:t=>`${t.spell_name} under ${t.health_pct}% health`}};function bt(t){return Tc[t.kind]}function yt(t,o){return t.some(e=>bt(e.condition).streams(e.condition).includes(o))}function Qa(t){return t.filter(o=>o.rule.condition!=null&&(bt(o.rule.condition).measure==null||o.threshold!=null))}function Ka(t,o,e,n,i){return bt(t).evaluate(t,o,e,n,i)}function Ya(t,o){return bt(t).applicable(t,o)}function Xa(t,o){let e=[];for(let{rule:n,threshold:i}of t){if(!Ya(n.condition,o))continue;let a=Ka(n.condition,o,i,n.severity,n.action);a&&e.push(U($({},a),{rule_type:n.type,label:n.description??a.label}));}return e}function Ec(t,o){return o??bt(t).label(t)}function Za(t,o){let e=[];for(let{rule:n,threshold:i}of t){let a=n.condition;Ya(a,o)&&(Ka(a,o,i,n.severity)||e.push(Ec(a,n.description)));}return e}var Dc=new Set([2825,32182,80353,90355,264667,390386]),Ic=4e4,Fc=3e4,Ac=15e3,ei=50,Ja=.5;function er(t){return t.used_sample_count/t.sample_count}function Oc(t,o,e,n,i){return o===0&&e>=1?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`0 / ${e}`,unit:"cast(s)"},message:`${t} unused. Expected ${e} on a ${V(i)} fight.`,details:{remedy:`Use ${t} ${e}x this fight.`},occurrences:[]}:o>0&&o<n?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`${o} / ${e}`,unit:"cast(s)"},message:`${t}: ${o} casts, expected ${e}. ${n-o} lost.`,details:{remedy:`Press ${t} ${n-o}x more - sooner off cooldown.`},occurrences:[]}:null}function Rc(t,o,e){if(!o.length)return null;let n=o[0];if(!lt(n,e.avg_first_cast_ms,e.stddev_first_cast_ms))return null;let i=R(n-e.avg_first_cast_ms);return {severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:o[0],measured:{value:`+${i}s`,unit:`top ${V(e.avg_first_cast_ms)}`},message:`${t} opened at ${V(n)}, ${i}s late. Top: ${V(e.avg_first_cast_ms)}.`,details:{remedy:`Open with ${t} earlier.`},occurrences:[]}}function Pc(t,o,e,n,i){if(n===null||!o.length)return {blAligned:false,findings:[]};let a=o.filter(s=>s>=n-Fc&&s<=n+Ic+Ac),r=a.length>0,l=[];if(!r&&i)l.push({severity:"critical",category:"cooldown_alignment",cd_name:t,timestamp_ms:o[0],measured:{value:"missed",unit:"BL"},message:`${t} missed Bloodlust (BL at ${V(n)}, first cast at ${V(o[0])}).`,details:{remedy:`Align ${t} with Bloodlust.`},occurrences:[]});else if(r&&e.avg_bl_offset_ms!=null&&e.stddev_bl_offset_ms!=null){let s=a.map(f=>f-n),m=Da(s);if(ka(m,e.avg_bl_offset_ms,e.stddev_bl_offset_ms)){let f=m>e.avg_bl_offset_ms?"late":"early",h=a[s.indexOf(m)];l.push({severity:"warning",category:"cooldown_alignment",cd_name:t,timestamp_ms:h,measured:{value:f,unit:"in BL"},message:`${t} ${f} in the Bloodlust window.`,details:{remedy:`Tighten ${t} to the Bloodlust window.`},occurrences:[]});}}return {blAligned:r,findings:l}}function Nc(t,o,e){let n=[];if(e.avg_gap_ms==null||e.stddev_gap_ms==null)return n;for(let i=1;i<o.length;i++){let a=o[i]-o[i-1];lt(a,e.avg_gap_ms,e.stddev_gap_ms)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:o[i],measured:{value:`${R(a)}s`,unit:`avg ${R(e.avg_gap_ms)}s`},message:`${t} at ${V(o[i])}: ${R(a)}s gap, top ${R(e.avg_gap_ms)}s.`,details:{remedy:`Press ${t} sooner - top gap ${R(e.avg_gap_ms)}s.`},occurrences:[]});}return n}function Lc(t,o,e){if(t.length<2||e.downtime_threshold_ms==null)return null;let n=0;for(let m=1;m<t.length;m++){let f=t[m]-t[m-1];f>e.downtime_threshold_ms&&(n+=f);}let i=e.top_avg_efficiency,a=e.top_efficiency_stddev,r=Ea(n,o);if(!Ta(r,i,a,1))return null;let s=R(n,1);return {severity:"warning",category:"cast_efficiency",label:"Low cast efficiency",measured:{value:`${r.toFixed(1)}%`,unit:`top ${i.toFixed(0)}%`},message:`${r.toFixed(1)}% cast efficiency, ${s}s idle. Top: ${i.toFixed(0)}%.`,details:{remedy:`Fill ${s}s of gaps. Top: ${i.toFixed(0)}%.`},occurrences:[]}}function $c(t,o,e,n,i){let a=t.name,r=o.length;if(t.talent_gated&&r===0)return null;if(!e)return {success:r>0?{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a}: ${r} casts (no bench data).`,occurrences:[]}:null,scan:{issues:[],holds:[],blAligned:false}};let l=e.bl_pct>=ei,{expected:s,floor:m}=an(n,e.uses_per_min),f=[];if(er(e)>=Ja){let C=Oc(a,r,s,m,n);C&&f.push(C);let E=Rc(a,o,e);E&&f.push(E);}let h=Pc(a,o,e,i,l);f.push(...h.findings),f.push(...Nc(a,o,e));let x=rn(a,o,e.hold_targets);return {success:f.length||r===0?null:{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a} - ${r}/${s} casts${h.blAligned&&l?", BL-aligned":""}.`,occurrences:[]},scan:{issues:f,holds:x,blAligned:h.blAligned}}}function Bc(t){let{fStart:o,fEnd:e,castEvents:n,buffEvents:i,cooldowns:a,bench:r}=t,l=e-o,s=n.filter(y=>y.type==="cast"&&y.timestamp>=o&&y.timestamp<=e).sort((y,C)=>y.timestamp-C.timestamp),m=[],f=null;for(let y of i)if(y.type==="applybuff"&&Dc.has(y.abilityGameID)&&y.timestamp>=o&&y.timestamp<=e){f=y.timestamp-o;break}let h=r.per_cd_benchmarks??{};for(let y of a){let C=s.filter(G=>G.abilityGameID===y.spell_id).map(G=>G.timestamp-o),E=$c(y,C,h[y.name],l,f);E&&(E.scan.issues.length?m.push(...E.scan.issues):E.success&&m.push(E.success),C.length&&m.push(...E.scan.holds));}let x=Lc(s.map(y=>y.timestamp-o),l,r);return x&&m.push(x),xt(m),m}var Wc={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function tr(t,o,e){let n=o[t]??null;return n!=null?{spellId:n,icon:e[n].icon,rowName:e[n].name}:{spellId:null,icon:"",rowName:t}}function zc(t){let o=[],e={},n=new Set;for(let i of t){if(i.severity==="success"){i.cd_name&&n.add(i.cd_name);continue}i.category==="hold_suggestion"&&i.details?.cd_name?(e[i.details.cd_name]??={issues:[],holds:[]}).holds.push(i):i.category==="rule_violation"||!i.cd_name?o.push(i):(e[i.cd_name]??={issues:[],holds:[]}).issues.push(i);}return {ruleFindings:o,byName:e,successNames:n}}function Gc(t){return t.map(o=>({severity:o.severity==="critical"?"critical":o.severity==="info"?"info":"warning",name:"",icon:"",what:o.label,chip:o.rule_type?Ua[o.rule_type]:void 0,measured:o.measured??{value:"-"},timestampMs:o.timestamp_ms??null,fix:o.details?.remedy,occurrences:o.occurrences,occurrenceTarget:o.occurrenceTarget,timeline:o.timeline}))}function Vc(t,o,e){let n=[];for(let[i,a]of Object.entries(t)){if(!a.issues.length&&!a.holds.length)continue;let{spellId:r,icon:l,rowName:s}=tr(i,o,e);for(let m of [...a.issues,...a.holds])n.push({severity:m.severity==="critical"?"critical":"warning",name:s,spellId:r,icon:l,timestampMs:m.timestamp_ms??null,chip:Wc[m.category],measured:m.measured??{value:"-"},fix:m.details?.remedy,occurrences:m.occurrences});}return n}function jc(t,o,e){let{byName:n,successNames:i}=t,a=[];for(let r of i)if(!n[r]||!n[r].issues.length&&!n[r].holds.length){let{spellId:l,icon:s,rowName:m}=tr(r,o,e);a.push({name:m,spellId:l,icon:s});}return a}function qc(t,o,e){let n=zc(t);return {ruleRows:Gc(n.ruleFindings),offensiveRows:Vc(n.byName,o,e),onPlan:jc(n,o,e)}}function Hc(t,o,e){return [...t].sort((i,a)=>{let r=i.opener_priority??99,l=a.opener_priority??99;return r!==l?r-l:i.name.localeCompare(a.name)}).map(i=>{let a=o[i.name],r=a?.majority_hold&&a.hold_targets?Object.entries(a.hold_targets).sort((f,h)=>Number(f[0])-Number(h[0])).map(([f,h])=>({castIndex:Number(f),targetMs:h.target_ms})):[],l=i.spell_id??null,s=l!=null?e[l]:void 0;l!=null&&!s&&ua$1("buildCdPlan: ability id missing from ability map",l);let m=a!=null&&er(a)>=Ja;return {name:i.name,spellId:l,icon:s?.icon??"",firstCastMs:m?a.avg_first_cast_ms:null,uses:a?.avg_uses??null,usesPerMin:m?a.uses_per_min.avg:null,bloodlust:(a?.bl_pct??0)>=ei,bloodlustPct:(a?.bl_pct??0)>=ei?a.bl_pct:null,holds:r,rule:i.usage_rule??null}})}var h0=(()=>{class t{source=T(Xa$1);wclApi=T(xe);async loadPlayerView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let m=(await this.wclApi.getReport(i)).fights.find(Ce=>Ce.id===a);if(!m)return fa$1("Fight not found in this report.","rotation.player-view");let f=Qa(l.value.rules),h=f.map(Ce=>Ce.rule),[x,y,C,E,G]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",m.startTime,m.endTime,r,!0),this.wclApi.getAllEvents(i,a,"Buffs",m.startTime,m.endTime,r),yt(h,"enemyAuras")?this.wclApi.getAllEvents(i,a,"Debuffs",m.startTime,m.endTime,void 0,!1,"Enemies"):Promise.resolve([]),yt(h,"damage")?this.wclApi.getAllEvents(i,a,"DamageDone",m.startTime,m.endTime,r,yt(h,"targetHealth")):Promise.resolve([]),yt(h,"deaths")?this.wclApi.getAllEvents(i,a,"Deaths",m.startTime,m.endTime):Promise.resolve([])]),Z=C.filter(Ce=>Ce.sourceID===r),De=G.filter(Ce=>Ce.targetID===r),oe=Bc({fStart:m.startTime,fEnd:m.endTime,castEvents:x,buffEvents:y,cooldowns:l.value.major_cooldowns,bench:l.value}),ye=La({casts:x,buffs:y,debuffs:Z,damage:E,deaths:De,fStart:m.startTime,fEnd:m.endTime}),st=Xa(f,ye),Ie=[...oe,...st];xt(Ie);let{ruleRows:Re,offensiveRows:dt,onPlan:pn}=qc(Ie,l.value.cd_spell_ids,l.value.ability_icons),fn=Za(f,ye);return ri({ruleRows:Re,ruleOnPlan:fn,offensiveRows:dt,onPlan:pn})}catch(s){return ua$1(`RotationFeatureService.loadPlayerView ${i}:${a}`,s),ma$1(s,"rotation.player-view")}}async loadPlanView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri({rows:Hc(i.value.major_cooldowns,i.value.per_cd_benchmarks,i.value.ability_icons)}):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var mn=t=>(t.amount||0)+(t.absorbed||0),Uc=.5;function Qc(t){return t.used_sample_count/t.sample_count}function Kc(t,o,e,n,i,a,r,l){let s=o.map(([m,f])=>{let h=f??l;return {start_ms:Math.round(m),end_ms:Math.round(h),dmg_during:Math.round(n(m,h))}});return s.length?s:e.filter(m=>m.type==="cast"&&m.abilityGameID===t&&m.timestamp>=a&&m.timestamp<=r).map(m=>{let f=i(m.timestamp);return {start_ms:Math.round(f),end_ms:Math.round(f),dmg_during:0}})}function Yc(t,o,e,n,i,a){if(!t.length)return [];let r=h=>h-i,l=n.filter(h=>h.type==="damage"),s={};for(let h of e){let x=h.abilityGameID,y=r(h.timestamp);if(h.type==="applybuff")(s[x]??=[]).push([y,null]);else if(h.type==="removebuff"){for(let C=(s[x]?.length??0)-1;C>=0;C--)if(s[x][C][1]===null){s[x][C][1]=y;break}}}let m=(h,x)=>l.reduce((y,C)=>{let E=r(C.timestamp);return E>=h&&E<=x?y+mn(C):y},0),f=a-i;return t.map(h=>{let x=h.spell_id,y=Kc(x,s[x]||[],o,m,r,i,a,f),C=y.map(G=>G.start_ms).sort((G,Z)=>G-Z),E={name:h.name,spell_id:x,cooldown:h.cooldown,uses:y.length,cast_times_ms:C,windows:y};return h.talent_gated&&(E.talent_gated=true),E})}function Xc(t,o,e){let n=[];if(e.avg_gap_ms==null||e.stddev_gap_ms==null)return n;let i=e.avg_gap_ms;for(let a=1;a<o.length;a++){let r=o[a]-o[a-1];lt(r,i,e.stddev_gap_ms)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:Math.round(o[a]),measured:{value:`${R(r)}s`,unit:`avg ${R(i)}s`},message:`${t} at ${V(o[a])}: ${R(r)}s gap, top ${R(i)}s.`,details:{remedy:`Use ${t} sooner after it resets.`},occurrences:[]});}return n}function Zc(t,o,e){let{name:n,uses:i,cast_times_ms:a}=t;if(t.talent_gated&&i===0)return [];if(!o)return i>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n}: ${i} uses (no bench data).`,occurrences:[]}]:[];let{expected:r,floor:l}=an(e,o.uses_per_min),s=[],m=Qc(o)>=Uc;m&&i===0&&r>=1?s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`0 / ${r}`,unit:"use(s)"},message:`${n} unused. Expected ${r} on a ${V(e)} fight.`,details:{remedy:`Use ${n} ${r}x this fight.`},occurrences:[]}):m&&i>0&&i<l&&s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`${i} / ${r}`,unit:"use(s)"},message:`${n}: ${i} uses, expected ${r}. ${l-i} lost.`,details:{remedy:`Use ${n} ${l-i}x more.`},occurrences:[]});let f=[];if(a?.length){let x=a[0];if(m&&lt(x,o.avg_first_cast_ms,o.stddev_first_cast_ms)){let y=R(x-o.avg_first_cast_ms);s.push({severity:"warning",category:"cooldown_delay",cd_name:n,timestamp_ms:Math.round(x),measured:{value:`+${y}s`,unit:`top ${V(o.avg_first_cast_ms)}`},message:`${n} first used at ${V(x)}, ${y}s late. Top: ${V(o.avg_first_cast_ms)}.`,details:{remedy:`Use ${n} earlier.`},occurrences:[]});}s.push(...Xc(n,a,o)),f.push(...rn(n,a,o.hold_targets));}let h=s.length?s:i>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n} - ${i}/${r} uses.`,occurrences:[]}]:[];return i>0&&h.push(...f),h}function Jc(t,o,e){let n=[];for(let i of t)n.push(...Zc(i,o[i.name],e));return xt(n),n}function em(t,o,e){let n=o.filter(i=>i.timestamp>=e&&mn(i)>0).sort((i,a)=>i.timestamp-a.timestamp);return t.map(i=>{let a=f=>f>=i.time_ms&&f<i.time_ms+i.window_length_ms,r=n.filter(f=>a(f.timestamp-e)),l=r.reduce((f,h)=>f+mn(h),0),s={};for(let f of r){if(!f.abilityGameID)continue;let h=Kt(f.abilityGameID);s[h]=(s[h]||0)+mn(f);}let m=Object.entries(s).sort((f,h)=>h[1]-f[1]).slice(0,6).map(([f,h])=>({spell_id:parseInt(f,10),damage:Math.round(h)}));return {time_ms:i.time_ms,window_damage:Math.round(l),ability_breakdown:m}})}var tm=3e3;function nm(t,o,e=tm){if(!o)return  false;let n=t.time_ms-e,i=t.time_ms+t.window_length_ms+e;return o.windows.some(a=>a.start_ms<=i&&a.end_ms>=n)}var im="covered",om="no defensive used",am="defensive used wrongly",rm="defensive needed, unused";function lm(t,o,e,n,i){return n?{status:"muted",icon:"schedule",note:""}:t===null?{status:"muted",icon:"help_outline",note:""}:t>o+e?{status:"bad",icon:"error",note:i?am:rm}:{status:"good",icon:"check_circle",note:i?im:om}}function sm(t,o,e){let n={};for(let i of o?.ability_breakdown??[])n[i.spell_id]=i;return t.map(i=>({spellId:i.spell_id,label:e[i.spell_id].name,icon:e[i.spell_id].icon,playerPct:n[i.spell_id]?.damage??null,topAvg:i.avg_damage,topMin:i.min_damage,topMax:i.max_damage}))}function dm(t){return {timeS:t.time_ms/1e3,refGameId:t.ref_game_id??null,windowLengthS:t.window_length_ms/1e3}}function cm(t,o){return {timeS:t.time_ms/1e3,windowLengthS:t.window_length_ms/1e3,key:`defensive-${o}`}}function T0(t){return {timeS:t/1e3,windowLengthS:0,key:`defensive-find-${t}`}}function mm({topWindows:t,playerWindows:o,playerDefensives:e,fightDurationMs:n,abilities:i}){let a=[],r=[],l=[];return t.forEach((s,m)=>{let f=s.time_ms>n,h=f?null:o[m]??null,x=h?.window_damage??null,y=s.defensive_name??s.common_defensives?.[0]??"",C=e.find(ye=>ye.name===y),E=nm(s,C),{status:G,icon:Z,note:De}=lm(x,s.dmg_max,s.dmg_stddev,f,E),oe=s.spell_id==null&&y?[y]:[];De&&oe.push(De),a.push({timeStartMs:s.time_ms,timeEndMs:s.time_ms+s.window_length_ms,spells:Yt(s.spell_id!=null?[s.spell_id]:[],i),labels:oe,status:G,statusIcon:Z,overview:{label:"",icon:"",playerPct:x,topAvg:s.dmg_avg,topMin:s.dmg_min,topMax:s.dmg_max},detailRows:sm(s.ability_breakdown,h,i)}),r.push(dm(s)),l.push(cm(s,m));}),{windows:a,anchors:r,clipAnchors:l}}function pm(t){if(!t?.defensives?.length)return [];let o=t.per_defensive_benchmarks??{},e=t.defensive_windows??[];return t.defensives.map(n=>{let i=o[n.name],a=e.filter(m=>(m.defensive_name??m.common_defensives?.[0])===n.name).map(m=>m.time_ms).sort((m,f)=>m-f),r=i?.majority_hold&&i.hold_targets?Object.entries(i.hold_targets).sort((m,f)=>Number(m[0])-Number(f[0])).map(([m,f])=>({castIndex:Number(m),targetMs:f.target_ms})):[],l=n.spell_id??null,s=l!=null?t.ability_icons[l]:void 0;return l!=null&&!s&&ua$1("buildDefensivePlanRows: ability id missing from ability map",l),{name:n.name,spellId:l,icon:s?.icon??"",uses:i?.avg_uses??null,firstCastMs:i?.avg_first_cast_ms??null,windowsMs:a,holds:r,rule:n.usage_rule??null}}).filter(n=>n.uses!=null||n.firstCastMs!=null||n.windowsMs.length||n.holds.length||n.rule)}var E0=(()=>{class t{source=T(Za$1);wclApi=T(xe);async loadAnalysisView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let m=(await this.wclApi.getReport(i)).fights.find(Re=>Re.id===a);if(!m)return ri({findings:[],spellIdsByName:l.value.cd_spell_ids,iconByName:{},windows:[],anchors:[],clipAnchors:[]});let f=m.startTime,h=m.endTime,x=h-f,[y,C,E]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",f,h,r),this.wclApi.getAllEvents(i,a,"Buffs",f,h,r),this.wclApi.getAllEvents(i,a,"DamageTaken",f,h,r)]),G=Yc(l.value.defensives,y,C,E,f,h),Z=l.value.defensives.length&&G.length?Jc(G,l.value.per_defensive_benchmarks,x):[],De=em(l.value.defensive_windows,E,f),oe={};for(let[Re,dt]of Object.entries(l.value.cd_spell_ids))oe[Re]=l.value.ability_icons[dt].icon;let{windows:ye,anchors:st,clipAnchors:Ie}=mm({topWindows:l.value.defensive_windows,playerWindows:De,playerDefensives:G,fightDurationMs:x,abilities:l.value.ability_icons});return ri({findings:Z,spellIdsByName:l.value.cd_spell_ids,iconByName:oe,windows:ye,anchors:st,clipAnchors:Ie})}catch(s){return ua$1(`DefensiveFeatureService.loadAnalysisView ${i}:${a}`,s),ma$1(s,"defensive.player-view")}}async loadPlan(e,n){let i=await this.source.getBench(e,n);return i.ok?ri({rows:pm(i.value)}):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var fm=["*"],I0=(()=>{class t{labelPosition="after";static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-form-field--align-end",i.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:fm,decls:1,vars:0,template:function(n,i){n&1&&(SE(),NE(0));},styles:[`.mat-internal-form-field {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.mat-internal-form-field > label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
  order: 0;
}
[dir=rtl] .mat-internal-form-field > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
}

.mdc-form-field--align-end > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
  order: -1;
}
[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
}
`],encapsulation:2})}return t})();export{$u as $,Do as D,E0 as E,Gp as G,Ho as H,I0 as I,Je as J,Lo as L,Oo as O,Qt as Q,Ro as R,S_ as S,Tf as T,Ut as U,Vt as V,Wo as W,Xp as X,Yp as Y,Zt as Z,Sr as a,Of as b,a_ as c,h_ as d,Gt as e,it as f,h0 as g,ht as h,i_ as i,jt as j,ko as k,T0 as l,m_ as m,$o as n,fa as o,nt as p,Qo as q,zo as r,s_ as s,tt as t,vh as v,xe as x,y_ as y,zt as z};//# sourceMappingURL=chunk-CNLz_D-Y.js.map
