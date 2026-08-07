import {a2 as x,T,be as Nb,bf as oi,bg as VD,bh as BD,bi as UD,bj as Pb,bk as jD,bl as WD,bm as zD,bn as $D,bo as GD,bp as YD,ba as Wb,bq as HD,o as oe,br as qa$1,bs as ye,S as So$1,c as TD,u as ua$1,g as fa$1,m as ma$1,N as HI,P as xl$1,bt as Bs$1,R as J,V as gr$1,aB as lF,W as P,a1 as Wt$1,Y as Se,aT as sF,bu as aF,a4 as V_,a3 as ee,aC as Ae,bv as _t$1,C as Cu,bw as Yh,n as ne,bx as Gh,M as Sn$1,by as Kh,D as Dh,bz as pF,j as jI,bA as mc$1,aH as SE,bB as Yf,p as oi$1,x as cp,A as aE,aI as NE,t as bc$1,B as ov,af as yp,F as cE,G as fD,aW as pp,aP as dp,aX as kE,aQ as AE,aR as RE,bC as fp,bD as up,aa as UI,ad as sp,bE as bu,bF as Ar$1,bG as bt$1,a0 as Uv,X as ht$1,bH as Id$1,a5 as Zi,bI as Nh,e as Ch,aD as He,a7 as rd$1,a8 as ud$1,aF as Lp,bJ as Lr$1,bK as Sr$1,bL as Jt$1,bM as qn$1,bN as Or,bO as fr$1,bP as G$1,bQ as _u,ab as sm$1,ac as dF,aN as fF,b1 as pu,z as np,aJ as OE,ae as ep,E as tp,au as re$1,aE as sa$1,bR as Yn$1,a9 as Ys$1,bS as Uy,aG as q_,ag as iF,ai as fv,aj as hv,s as nD,aS as xc$1,bT as Sp,bU as sD,aO as qE,bV as cD,bW as lf,ah as oF,bX as WI,bY as Yb,bZ as Gb,b_ as at$1,b$ as Qa$1,c0 as Sh,c1 as ge,c2 as W,b3 as rp,a_ as _c$1,b0 as Mc$1,ao as _E,aw as hr$1,c3 as la$1,c4 as $y,c5 as kr,aq as Cp,c6 as Pd$1,bd as hu,c7 as ip,b7 as mp,c8 as Xa$1,ax as ri,c9 as Ya$1,ca as _D,k as Ib,ak as Wd$1,an as dE,ap as fE,am as vE,ar as tu,as as nu,cb as Za$1,cc as Ka$1,cd as Oy,aU as Le,U,$,ay as mD,az as vD,H as Jn$1,ce as S,cf as Qh,cg as bp,ch as ED,ci as Qd$1,cj as aD,ck as uE}from'./main-UA7DQTVN.js';var yn=class{_box;_destroyed=new ee;_resizeSubject=new ee;_resizeObserver;_elementObservables=new Map;constructor(o){this._box=o,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(o){return this._elementObservables.has(o)||this._elementObservables.set(o,new S(e=>{let n=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(o,{box:this._box}),()=>{this._resizeObserver?.unobserve(o),n.unsubscribe(),this._elementObservables.delete(o);}}).pipe(Sn$1(e=>e.some(n=>n.target===o)),Qh({bufferSize:1,refCount:true}),Kh(this._destroyed))),this._elementObservables.get(o)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},fo=(()=>{class t{_cleanupErrorListener;_observers=new Map;_ngZone=T(Se);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,n){let i=n?.box||"content-box";return this._observers.has(i)||this._observers.set(i,new yn(i)),this._observers.get(i).observe(e)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=hr$1({token:t,factory:t.\u0275fac})}return t})();var er=["notch"],tr=["*"],uo=["iconPrefixContainer"],ho=["textPrefixContainer"],_o=["iconSuffixContainer"],go=["textSuffixContainer"],nr=["textField"],ir=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],or=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function ar(t,o){t&1&&np(0,"span",21);}function rr(t,o){if(t&1&&(oi$1(0,"label",20),NE(1,1),aE(2,ar,1,0,"span",21),bc$1()),t&2){let e=_E(2);tp("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),ep("for",e._control.disableAutomaticLabeling?null:e._control.id),ov(2),cE(!e.hideRequiredMarker&&e._control.required?2:-1);}}function lr(t,o){if(t&1&&aE(0,rr,3,5,"label",20),t&2){let e=_E();cE(e._hasFloatingLabel()?0:-1);}}function sr(t,o){t&1&&np(0,"div",7);}function dr(t,o){}function cr(t,o){if(t&1&&Yf(0,dr,0,0,"ng-template",13),t&2){_E(2);let e=OE(1);tp("ngTemplateOutlet",e);}}function mr(t,o){if(t&1&&(oi$1(0,"div",9),aE(1,cr,1,1,null,13),bc$1()),t&2){let e=_E();tp("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),ov(),cE(e._forceDisplayInfixLabel()?-1:1);}}function pr(t,o){t&1&&(oi$1(0,"div",10,2),NE(2,2),bc$1());}function fr(t,o){t&1&&(oi$1(0,"div",11,3),NE(2,3),bc$1());}function ur(t,o){}function hr(t,o){if(t&1&&Yf(0,ur,0,0,"ng-template",13),t&2){_E();let e=OE(1);tp("ngTemplateOutlet",e);}}function _r(t,o){t&1&&(oi$1(0,"div",14,4),NE(2,4),bc$1());}function gr(t,o){t&1&&(oi$1(0,"div",15,5),NE(2,5),bc$1());}function vr(t,o){t&1&&np(0,"div",16);}function xr(t,o){t&1&&(oi$1(0,"div",18),NE(1,6),bc$1());}function br(t,o){if(t&1&&(oi$1(0,"mat-hint",22),nD(1),bc$1()),t&2){let e=_E(2);tp("id",e._hintLabelId),ov(),Cp(e.hintLabel);}}function yr(t,o){if(t&1&&(oi$1(0,"div",19),aE(1,br,2,2,"mat-hint",22),NE(2,7),np(3,"div",23),NE(4,8),bc$1()),t&2){let e=_E();ov(),cE(e.hintLabel?1:-1);}}var ht=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-label"]]})}return t})(),wn=new x("MatError"),Cr=(()=>{class t{id=T(Wt$1).getId("mat-mdc-error-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-error"],["","matError",""]],hostAttrs:[1,"mat-mdc-form-field-error","mat-mdc-form-field-bottom-align"],hostVars:1,hostBindings:function(n,i){n&2&&sp("id",i.id);},inputs:{id:"id"},features:[fD([{provide:wn,useExisting:t}])]})}return t})(),Cn=(()=>{class t{align="start";id=T(Wt$1).getId("mat-mdc-hint-");static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(n,i){n&2&&(sp("id",i.id),ep("align",null),yp("mat-mdc-form-field-hint-end",i.align==="end"));},inputs:{align:"align",id:"id"}})}return t})(),So=new x("MatPrefix");var Mo=new x("MatSuffix");var ko=new x("FloatingLabelParent"),vo=(()=>{class t{_elementRef=T(gr$1);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=T(fo);_ngZone=T(Se);_parent=T(ko);_resizeSubscription=new W;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return wr(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-floating-label--float-above",i.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return t})();function wr(t){let o=t;if(o.offsetParent!==null)return o.scrollWidth;let e=o.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let n=e.scrollWidth;return e.remove(),n}var xo="mdc-line-ripple--active",Wt="mdc-line-ripple--deactivating",bo=(()=>{class t{_elementRef=T(gr$1);_cleanupTransitionEnd;constructor(){let e=T(Se),n=T(Uv);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=n.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(Wt),e.add(xo);}deactivate(){this._elementRef.nativeElement.classList.add(Wt);}_handleTransitionEnd=e=>{let n=this._elementRef.nativeElement.classList,i=n.contains(Wt);e.propertyName==="opacity"&&i&&n.remove(xo,Wt);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return t})(),yo=(()=>{class t{_elementRef=T(gr$1);_ngZone=T(Se);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,n=e.querySelector(".mdc-floating-label");n?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(n.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>n.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let n=this._notch.nativeElement;!this.open||!e?n.style.width="":n.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(n,i){if(n&1&&dp(er,5),n&2){let a;AE(a=RE())&&(i._notch=a.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-notched-outline--notched",i.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:tr,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(n,i){n&1&&(SE(),rp(0,"div",1),_c$1(1,"div",2,0),NE(3),Mc$1(),rp(4,"div",3));},encapsulation:2})}return t})(),zt=(()=>{class t{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t})}return t})();var Gt=new x("MatFormField"),To=new x("MAT_FORM_FIELD_DEFAULT_OPTIONS"),Co="fill",Sr="auto",wo="fixed",Mr="translateY(-50%)",Vt=(()=>{class t{_elementRef=T(gr$1);_changeDetectorRef=T(lF);_platform=T(P);_idGenerator=T(Wt$1);_ngZone=T(Se);_defaults=T(To,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=sF("iconPrefixContainer");_textPrefixContainerSignal=sF("textPrefixContainer");_iconSuffixContainerSignal=sF("iconSuffixContainer");_textSuffixContainerSignal=sF("textSuffixContainer");_prefixSuffixContainers=TD(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=aF(ht);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=V_(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||Sr}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let n=e||this._defaults?.appearance||Co;this._appearanceSignal.set(n);}_appearanceSignal=So$1(Co);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||wo}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||wo;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ee;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=Ae();constructor(){let e=this._defaults,n=T(_t$1);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),Cu(()=>this._currentDirection=n.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=TD(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let n=this._control,i="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(i+e.controlType),n.controlType&&this._elementRef.nativeElement.classList.add(i+n.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=n.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=n.stateChanges.pipe(Yh([void 0,void 0]),ne(()=>[n.errorState,n.userAriaDescribedBy]),Gh(),Sn$1(([[a,r],[l,s]])=>a!==l||r!==s)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),n.ngControl&&n.ngControl.valueChanges&&(this._valueChanges=n.ngControl.valueChanges.pipe(Kh(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),Dh(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){pF({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=TD(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let n=this._control?this._control.ngControl:null;return n&&n[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let a=this._hintChildren?this._hintChildren.find(l=>l.align==="start"):null,r=this._hintChildren?this._hintChildren.find(l=>l.align==="end"):null;a?e.push(a.id):this._hintLabel&&e.push(this._hintLabelId),r&&e.push(r.id);}else this._errorChildren&&e.push(...this._errorChildren.map(a=>a.id));let n=this._control.describedByIds,i;if(n){let a=this._describedByIds||e;i=e.concat(n.filter(r=>r&&!a.includes(r)));}else i=e;this._control.setDescribedByIds(i),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,n=this._textPrefixContainer?.nativeElement,i=this._iconSuffixContainer?.nativeElement,a=this._textSuffixContainer?.nativeElement,r=e?.getBoundingClientRect().width??0,l=n?.getBoundingClientRect().width??0,s=i?.getBoundingClientRect().width??0,m=a?.getBoundingClientRect().width??0,f=this._currentDirection==="rtl"?"-1":"1",h=`${r+l}px`,y=`calc(${f} * (${h} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,C=`var(--mat-mdc-form-field-label-transform, ${Mr} translateX(${y}))`,E=r+l+s+m;return [C,E]}_writeOutlinedLabelStyles(e){if(e!==null){let[n,i]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=n),i!==null&&this._notchedOutline?._setMaxWidth(i);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let n=e.getRootNode();return n&&n!==e}return document.documentElement.contains(e)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-form-field"]],contentQueries:function(n,i,a){if(n&1&&(fp(a,i._labelChild,ht,5),up(a,zt,5)(a,So,5)(a,Mo,5)(a,wn,5)(a,Cn,5)),n&2){kE();let r;AE(r=RE())&&(i._formFieldControl=r.first),AE(r=RE())&&(i._prefixChildren=r),AE(r=RE())&&(i._suffixChildren=r),AE(r=RE())&&(i._errorChildren=r),AE(r=RE())&&(i._hintChildren=r);}},viewQuery:function(n,i){if(n&1&&(pp(i._iconPrefixContainerSignal,uo,5)(i._textPrefixContainerSignal,ho,5)(i._iconSuffixContainerSignal,_o,5)(i._textSuffixContainerSignal,go,5),dp(nr,5)(uo,5)(ho,5)(_o,5)(go,5)(vo,5)(yo,5)(bo,5)),n&2){kE(4);let a;AE(a=RE())&&(i._textField=a.first),AE(a=RE())&&(i._iconPrefixContainer=a.first),AE(a=RE())&&(i._textPrefixContainer=a.first),AE(a=RE())&&(i._iconSuffixContainer=a.first),AE(a=RE())&&(i._textSuffixContainer=a.first),AE(a=RE())&&(i._floatingLabel=a.first),AE(a=RE())&&(i._notchedOutline=a.first),AE(a=RE())&&(i._lineRipple=a.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(n,i){n&2&&yp("mat-mdc-form-field-label-always-float",i._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",i._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",i._hasIconSuffix)("mat-form-field-invalid",i._control.errorState)("mat-form-field-disabled",i._control.disabled)("mat-form-field-autofilled",i._control.autofilled)("mat-form-field-appearance-fill",i.appearance=="fill")("mat-form-field-appearance-outline",i.appearance=="outline")("mat-form-field-hide-placeholder",i._hasFloatingLabel()&&!i._shouldLabelFloat())("mat-primary",i.color!=="accent"&&i.color!=="warn")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("ng-untouched",i._shouldForward("untouched"))("ng-touched",i._shouldForward("touched"))("ng-pristine",i._shouldForward("pristine"))("ng-dirty",i._shouldForward("dirty"))("ng-valid",i._shouldForward("valid"))("ng-invalid",i._shouldForward("invalid"))("ng-pending",i._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[fD([{provide:Gt,useExisting:t},{provide:ko,useExisting:t}])],ngContentSelectors:or,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(n,i){if(n&1&&(SE(ir),Yf(0,lr,1,1,"ng-template",null,0,ED),oi$1(2,"div",6,1),cp("click",function(r){return i._control.onContainerClick(r)}),aE(4,sr,1,0,"div",7),oi$1(5,"div",8),aE(6,mr,2,2,"div",9),aE(7,pr,3,0,"div",10),aE(8,fr,3,0,"div",11),oi$1(9,"div",12),aE(10,hr,1,1,null,13),NE(11),bc$1(),aE(12,_r,3,0,"div",14),aE(13,gr,3,0,"div",15),bc$1(),aE(14,vr,1,0,"div",16),bc$1(),oi$1(15,"div",17),aE(16,xr,2,0,"div",18)(17,yr,5,1,"div",19),bc$1()),n&2){let a;ov(2),yp("mdc-text-field--filled",!i._hasOutline())("mdc-text-field--outlined",i._hasOutline())("mdc-text-field--no-label",!i._hasFloatingLabel())("mdc-text-field--disabled",i._control.disabled)("mdc-text-field--invalid",i._control.errorState),ov(2),cE(!i._hasOutline()&&!i._control.disabled?4:-1),ov(2),cE(i._hasOutline()?6:-1),ov(),cE(i._hasIconPrefix?7:-1),ov(),cE(i._hasTextPrefix?8:-1),ov(2),cE(!i._hasOutline()||i._forceDisplayInfixLabel()?10:-1),ov(2),cE(i._hasTextSuffix?12:-1),ov(),cE(i._hasIconSuffix?13:-1),ov(),cE(i._hasOutline()?-1:14),ov(),yp("mat-mdc-form-field-subscript-dynamic-size",i.subscriptSizing==="dynamic");let r=i._getSubscriptMessageType();ov(),cE((a=r)==="error"?16:a==="hint"?17:-1);}},dependencies:[vo,yo,mc$1,bo,Cn],styles:[`.mdc-text-field {
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
`],encapsulation:2})}return t})();var jt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[Bs$1,Vt,J]})}return t})();var Tr=["text"],Er=[[["mat-icon"]],"*"],Dr=["mat-icon","*"];function Ir(t,o){if(t&1&&np(0,"mat-pseudo-checkbox",1),t&2){let e=_E();tp("disabled",e.disabled)("state",e.selected?"checked":"unchecked");}}function Fr(t,o){if(t&1&&np(0,"mat-pseudo-checkbox",3),t&2){let e=_E();tp("disabled",e.disabled);}}function Ar(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),xc$1("(",e.group.label,")");}}var Mn=new x("MAT_OPTION_PARENT_COMPONENT"),kn=new x("MatOptgroup");var Sn=class{source;isUserInput;constructor(o,e=false){this.source=o,this.isUserInput=e;}},Je=(()=>{class t{_element=T(gr$1);_changeDetectorRef=T(lF);_parent=T(Mn,{optional:true});group=T(kn,{optional:true});_signalDisableRipple=false;_selected=false;_active=false;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=T(Wt$1).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=So$1(false);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return !!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new He;_text;_stateChanges=new ee;constructor(){let e=T(re$1);e.load(sa$1),e.load(Yn$1),this._signalDisableRipple=!!this._parent&&Ys$1(this._parent.disableRipple);}get active(){return this._active}get viewValue(){return (this._text?.nativeElement.textContent||"").trim()}select(e=true){this._selected||(this._selected=true,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}deselect(e=true){this._selected&&(this._selected=false,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}focus(e,n){let i=this._getHostElement();typeof i.focus=="function"&&i.focus(n);}setActiveStyles(){this._active||(this._active=true,this._changeDetectorRef.markForCheck());}setInactiveStyles(){this._active&&(this._active=false,this._changeDetectorRef.markForCheck());}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!qn$1(e)&&(this._selectViaInteraction(),e.preventDefault());}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:true,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(true));}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e);}}ngOnDestroy(){this._stateChanges.complete();}_emitSelectionChangeEvent(e=false){this.onSelectionChange.emit(new Sn(this,e));}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-option"]],viewQuery:function(n,i){if(n&1&&dp(Tr,7),n&2){let a;AE(a=RE())&&(i._text=a.first);}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(n,i){n&1&&cp("click",function(){return i._selectViaInteraction()})("keydown",function(r){return i._handleKeydown(r)}),n&2&&(sp("id",i.id),ep("aria-selected",i.selected)("aria-disabled",i.disabled.toString()),yp("mdc-list-item--selected",i.selected)("mat-mdc-option-multiple",i.multiple)("mat-mdc-option-active",i.active)("mdc-list-item--disabled",i.disabled));},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",dF]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:Dr,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(n,i){n&1&&(SE(Er),aE(0,Ir,1,2,"mat-pseudo-checkbox",1),NE(1),oi$1(2,"span",2,0),NE(4,1),bc$1(),aE(5,Fr,1,1,"mat-pseudo-checkbox",3),aE(6,Ar,2,1,"span",4),np(7,"div",5)),n&2&&(cE(i.multiple?0:-1),ov(5),cE(!i.multiple&&i.selected&&!i.hideSingleSelectionIndicator?5:-1),ov(),cE(i.group&&i.group._inert?6:-1),ov(),tp("matRippleTrigger",i._getHostElement())("matRippleDisabled",i.disabled||i.disableRipple));},dependencies:[Uy,q_],styles:[`.mat-mdc-option {
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
`],encapsulation:2})}return t})();function Eo(t,o,e){if(e.length){let n=o.toArray(),i=e.toArray(),a=0;for(let r=0;r<t+1;r++)n[r].group&&n[r].group===i[a]&&a++;return a}return 0}function Do(t,o,e,n){return t<e?t:t+o>e+n?Math.max(0,t-n+o):e}var Io=(()=>{class t{isErrorState(e,n){return !!(e&&e.invalid&&(e.touched||n&&n.submitted))}static \u0275fac=function(n){return new(n||t)};static \u0275prov=hr$1({token:t,factory:t.\u0275fac})}return t})();var Ut=class{_defaultMatcher;ngControl;_parentFormGroup;_parentForm;_stateChanges;errorState=false;matcher;constructor(o,e,n,i,a){this._defaultMatcher=o,this.ngControl=e,this._parentFormGroup=n,this._parentForm=i,this._stateChanges=a;}updateErrorState(){let o=this.errorState,e=this._parentFormGroup||this._parentForm,n=this.matcher||this._defaultMatcher,i=this.ngControl?this.ngControl.control:null,a=n?.isErrorState(i,e)??false;a!==o&&(this.errorState=a,this._stateChanges.next());}};var Tn=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[la$1,$y,Je,J]})}return t})();var Lr=["trigger"],$r=["panel"],Br=[[["mat-select-trigger"]],"*"],Wr=["mat-select-trigger","*"];function zr(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.placeholder);}}function Gr(t,o){t&1&&NE(0);}function Vr(t,o){if(t&1&&(oi$1(0,"span",11),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.triggerValue);}}function jr(t,o){if(t&1&&(oi$1(0,"span",5),aE(1,Gr,1,0)(2,Vr,2,1,"span",11),bc$1()),t&2){let e=_E();ov(),cE(e.customTrigger?1:2);}}function qr(t,o){if(t&1){let e=vE();oi$1(0,"div",12,1),cp("keydown",function(i){tu(e);let a=_E();return nu(a._handleKeydown(i))}),NE(2,1),bc$1();}if(t&2){let e=_E();qE(e.panelClass),yp("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),ep("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Hr=new x("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let t=T(ye);return ()=>kr(t)}}),Ur=new x("MAT_SELECT_CONFIG"),Oo=new x("MatSelectTrigger"),En=class{source;value;constructor(o,e){this.source=o,this.value=e;}},Ro=(()=>{class t{_viewportRuler=T(bt$1);_changeDetectorRef=T(lF);_elementRef=T(gr$1);_dir=T(_t$1,{optional:true});_idGenerator=T(Wt$1);_renderer=T(Uv);_parentFormField=T(Gt,{optional:true});ngControl=T(ht$1,{self:true,optional:true});_liveAnnouncer=T(Id$1);_defaultOptions=T(Ur,{optional:true});_animationsDisabled=Ae();_popoverLocation;_initialized=new ee;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let n=this.options.toArray()[e];if(n){let i=this.panel.nativeElement,a=Eo(e,this.options,this.optionGroups),r=n._getHostElement();e===0&&a===1?i.scrollTop=0:i.scrollTop=Do(r.offsetTop,r.offsetHeight,i.scrollTop,i.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new En(this,e)}_scrollStrategyFactory=T(Hr);_panelOpen=false;_compareWith=(e,n)=>e===n;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ee;_errorStateTracker;stateChanges=new ee;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=So$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(Zi.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=Nh(()=>{let e=this.options;return e?e.changes.pipe(Yh(e),Ch(()=>Dh(...e.map(n=>n.onSelectionChange)))):this._initialized.pipe(Ch(()=>this.optionSelectionChanges))});openedChange=new He;_openedStream=this.openedChange.pipe(Sn$1(e=>e),ne(()=>{}));_closedStream=this.openedChange.pipe(Sn$1(e=>!e),ne(()=>{}));selectionChange=new He;valueChange=new He;constructor(){let e=T(Io),n=T(rd$1,{optional:true}),i=T(ud$1,{optional:true}),a=T(new Lp("tabindex"),{optional:true}),r=T(Lr$1,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new Ut(e,this.ngControl,i,n,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=a==null?0:parseInt(a)||0,this._popoverLocation=r?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new Sr$1(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(Kh(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(Kh(this._destroy)).subscribe(e=>{e.added.forEach(n=>n.select()),e.removed.forEach(n=>n.deselect());}),this.options.changes.pipe(Yh(null),Kh(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),n=this.ngControl;if(e!==this._triggerAriaLabelledBy){let i=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?i.setAttribute("aria-labelledby",e):i.removeAttribute("aria-labelledby");}n&&(this._previousControl!==n.control&&(this._previousControl!==void 0&&n.disabled!==null&&n.disabled!==this.disabled&&(this.disabled=n.disabled),this._previousControl=n.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(Jt$1(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{n(),clearTimeout(i),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,n=this._renderer.listen(e,"animationend",a=>{a.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),i=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(n=>n.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let n=e.keyCode,i=n===40||n===38||n===37||n===39,a=n===13||n===32,r=this._keyManager;if(!r.isTyping()&&a&&!qn$1(e)||(this.multiple||e.altKey)&&i)e.preventDefault(),this.open();else if(!this.multiple){let l=this.selected;r.onKeydown(e);let s=this.selected;s&&l!==s&&this._liveAnnouncer.announce(s.viewValue,1e4);}}_handleOpenKeydown(e){let n=this._keyManager,i=e.keyCode,a=i===40||i===38,r=n.isTyping();if(a&&e.altKey)e.preventDefault(),this.close();else if(!r&&(i===13||i===32)&&n.activeItem&&!qn$1(e))e.preventDefault(),n.activeItem._selectViaInteraction();else if(!r&&this._multiple&&i===65&&e.ctrlKey){e.preventDefault();let l=this.options.some(s=>!s.disabled&&!s.selected);this.options.forEach(s=>{s.disabled||(l?s.select():s.deselect());});}else {let l=n.activeItemIndex;n.onKeydown(e),this._multiple&&a&&e.shiftKey&&n.activeItem&&n.activeItemIndex!==l&&n.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!qn$1(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(n=>n.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(n=>this._selectOptionByValue(n)),this._sortValues();else {let n=this._selectOptionByValue(e);n?this._keyManager.updateActiveItem(n):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let n=this.options.find(i=>{if(this._selectionModel.isSelected(i))return  false;try{return (i.value!=null||this.canSelectNullableOptions)&&this._compareWith(i.value,e)}catch{return  false}});return n&&this._selectionModel.select(n),n}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof Or?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new fr$1(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=Dh(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Kh(e)).subscribe(n=>{this._onSelect(n.source,n.isUserInput),n.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),Dh(...this.options.map(n=>n._stateChanges)).pipe(Kh(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,n){let i=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(i!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),n&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),n&&this.focus())),i!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((n,i)=>this.sortComparator?this.sortComparator(n,i,e):e.indexOf(n)-e.indexOf(i)),this.stateChanges.next();}}_propagateChanges(e){let n;this.multiple?n=this.selected.map(i=>i.value):n=this.selected?this.selected.value:e,this._value=n,this.valueChange.emit(n),this._onChange(n),this.selectionChange.emit(this._getChangeEvent(n)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let n=0;n<this.options.length;n++)if(!this.options.get(n).disabled){e=n;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,n=e?e+" ":"";return this.ariaLabelledby?n+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let n=this._elementRef.nativeElement;e.length?n.setAttribute("aria-describedby",e.join(" ")):n.removeAttribute("aria-describedby");}onContainerClick(e){let n=G$1(e);n&&(n.tagName==="MAT-OPTION"||n.classList.contains("cdk-overlay-backdrop")||n.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-select"]],contentQueries:function(n,i,a){if(n&1&&up(a,Oo,5)(a,Je,5)(a,kn,5),n&2){let r;AE(r=RE())&&(i.customTrigger=r.first),AE(r=RE())&&(i.options=r),AE(r=RE())&&(i.optionGroups=r);}},viewQuery:function(n,i){if(n&1&&dp(Lr,5)($r,5)(_u,5),n&2){let a;AE(a=RE())&&(i.trigger=a.first),AE(a=RE())&&(i.panel=a.first),AE(a=RE())&&(i._overlayDir=a.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(n,i){n&1&&cp("keydown",function(r){return i._handleKeydown(r)})("focus",function(){return i._onFocus()})("blur",function(){return i._onBlur()}),n&2&&(ep("id",i.id)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i.panelOpen?i.id+"-panel":null)("aria-expanded",i.panelOpen)("aria-label",i.ariaLabel||null)("aria-required",i.required.toString())("aria-disabled",i.disabled.toString())("aria-invalid",i.errorState)("aria-activedescendant",i._getAriaActiveDescendant()),yp("mat-mdc-select-disabled",i.disabled)("mat-mdc-select-invalid",i.errorState)("mat-mdc-select-required",i.required)("mat-mdc-select-empty",i.empty)("mat-mdc-select-multiple",i.multiple)("mat-select-open",i.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",dF],disableRipple:[2,"disableRipple","disableRipple",dF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:fF(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",dF],placeholder:"placeholder",required:[2,"required","required",dF],multiple:[2,"multiple","multiple",dF],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",dF],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",fF],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",dF]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[fD([{provide:zt,useExisting:t},{provide:Mn,useExisting:t}]),sm$1],ngContentSelectors:Wr,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(n,i){if(n&1&&(SE(Br),oi$1(0,"div",2,0),cp("click",function(){return i.open()}),oi$1(3,"div",3),aE(4,zr,2,1,"span",4)(5,jr,3,1,"span",5),bc$1(),oi$1(6,"div",6)(7,"div",7),pu(),oi$1(8,"svg",8),np(9,"path",9),bc$1()()()(),Yf(10,qr,3,16,"ng-template",10),cp("detach",function(){return i.close()})("backdropClick",function(){return i.close()})("overlayKeydown",function(r){return i._handleOverlayKeydown(r)})),n&2){let a=OE(1);ov(3),ep("id",i._valueId),ov(),cE(i.empty?4:5),ov(6),tp("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",i._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",i._scrollStrategy)("cdkConnectedOverlayOrigin",i._preferredOverlayOrigin||a)("cdkConnectedOverlayPositions",i._positions)("cdkConnectedOverlayWidth",i._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",i._popoverLocation);}},dependencies:[Or,_u],styles:[`@keyframes _mat-select-enter {
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
`],encapsulation:2})}return t})(),$p=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275dir=UI({type:t,selectors:[["mat-select-trigger"]],features:[fD([{provide:Oo,useExisting:t}])]})}return t})(),Po=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[bu,Tn,J,Ar$1,jt,Tn]})}return t})();var Kr=["*"];var Yr=new x("MAT_CARD_CONFIG"),Hp=(()=>{class t{appearance;constructor(){let e=T(Yr,{optional:true});this.appearance=e?.appearance||"raised";}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-card"]],hostAttrs:[1,"mat-mdc-card","mdc-card"],hostVars:8,hostBindings:function(n,i){n&2&&yp("mat-mdc-card-outlined",i.appearance==="outlined")("mdc-card--outlined",i.appearance==="outlined")("mat-mdc-card-filled",i.appearance==="filled")("mdc-card--filled",i.appearance==="filled");},inputs:{appearance:"appearance"},exportAs:["matCard"],ngContentSelectors:Kr,decls:1,vars:0,template:function(n,i){n&1&&(SE(),NE(0));},styles:[`.mat-mdc-card {
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
`],encapsulation:2})}return t})();var Up=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[J]})}return t})();var Xr="https://www.warcraftlogs.com/oauth/token",No=(()=>{class t{http=T(at$1);_token=null;_expiry=0;_inFlight=null;async getToken(){return this._token&&Date.now()<this._expiry-6e4?this._token:this._inFlight?this._inFlight:(this._inFlight=this._fetchToken().finally(()=>{this._inFlight=null;}),this._inFlight)}async _fetchToken(){let e=new URLSearchParams({grant_type:"client_credentials",client_id:Qa$1.wclClientId,client_secret:Qa$1.wclClientSecret}),n;try{n=await Sh(this.http.post(Xr,e.toString(),{headers:{"Content-Type":"application/x-www-form-urlencoded"}}));}catch(a){let r=a instanceof ge?a.status:0,l=a instanceof ge?typeof a.error=="string"?a.error:JSON.stringify(a.error):"";throw new oi(`WCL token request failed (${r}): ${l}`,r)}let i=n?.access_token;if(typeof i!="string"||i.length===0)throw new oi("WCL token response carried no access_token.",0);return this._token=i,this._expiry=Date.now()+(n.expires_in||3600)*1e3,this._token}invalidate(){this._token=null,this._expiry=0;}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var xe=(()=>{class t{auth=T(No);transport=T(Nb);async query(e,n={}){let i=await this.auth.getToken();try{return await this.transport.query(e,n,i)}catch(a){if(a instanceof oi&&a.status===401){this.auth.invalidate();let r=await this.auth.getToken();return await this.transport.query(e,n,r)}throw a}}async getReport(e){let n={code:e},a=(await this.query(VD,n))?.reportData?.report;if(!a)throw this.reportUnavailable(e);return a}async getReportFights(e){let n={code:e},a=(await this.query(BD,n))?.reportData?.report;if(!a)throw this.reportUnavailable(e);return a.fights??[]}async getPlayerDetails(e,n){let i={code:e,fightIDs:[n]},r=(await this.query(UD,i))?.reportData?.report?.playerDetails?.data?.playerDetails;if(!r)throw this.reportUnavailable(e);return r}reportUnavailable(e){return new oi(`WCL report ${e} is unavailable (not found, private, or expired).`,Pb)}async getAllEvents(e,n,i,a,r,l,s=false,m){let f=[],h=a;for(;;){let g={code:e,fightIDs:[n],dataType:i,startTime:h,endTime:r};l!=null&&(g.sourceID=l),s&&(g.includeResources=true),m&&(g.hostilityType=m);let C=(await this.query(jD,g)).reportData.report.events;for(let E of C.data??[])f.push(E);if(!C.nextPageTimestamp)break;h=C.nextPageTimestamp;}return f}async getCombatantInfo(e,n,i){let a={code:e,fightIDs:[n],sourceID:i},l=(await this.query(WD,a))?.reportData?.report;if(!l)throw this.reportUnavailable(e);return l.events?.data??[]}async getDamageDoneTable(e,n){let i={code:e,fightIDs:[n],dataType:"DamageDone"};return (await this.query(zD,i))?.reportData?.report?.table??null}async getResurrects(e,n,i,a){let r=[],l=i;for(;;){let s={code:e,fightIDs:[n],filter:'type = "resurrect"',startTime:l,endTime:a},f=(await this.query($D,s)).reportData.report.events;for(let h of f.data??[])r.push(h);if(!f.nextPageTimestamp)break;l=f.nextPageTimestamp;}return r}async getGameNames(e,n){return !e.length&&!n.length?{}:(await this.query(GD(e,n)))?.gameData??{}}async getAbilities(e){let n=[...new Set(e)].filter(a=>a>0);return n.length?(await this.query(YD(n)))?.gameData??{}:{}}async getRankings(e,n){let i=Wb(e);if(!i)return null;let a={encounterID:n,className:i.className,specName:i.specName};return (await this.query(HD,a))?.worldData?.encounter?.characterRankings??null}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Zr=["determinateSpinner"];function Jr(t,o){if(t&1&&(pu(),oi$1(0,"svg",11),np(1,"circle",12),bc$1()),t&2){let e=_E();ep("viewBox",e._viewBox()),ov(),mp("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),ep("r",e._circleRadius());}}var el=new x("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:Lo})}),Lo=100,tl=10,$o=(()=>{class t{_elementRef=T(gr$1);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=T(el),n=Pd$1(),i=this._elementRef.nativeElement;this._noopAnimations=n==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=i.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&n==="reduced-motion"&&i.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=Lo;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-tl)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(n,i){if(n&1&&dp(Zr,5),n&2){let a;AE(a=RE())&&(i._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(n,i){n&2&&(ep("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",i.mode==="determinate"?i.value:null)("mode",i.mode),qE("mat-"+i.color),mp("width",i.diameter,"px")("height",i.diameter,"px")("--mat-progress-spinner-size",i.diameter+"px")("--mat-progress-spinner-active-indicator-width",i.diameter+"px"),yp("_mat-animation-noopable",i._noopAnimations)("mdc-circular-progress--indeterminate",i.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",fF],diameter:[2,"diameter","diameter",fF],strokeWidth:[2,"strokeWidth","strokeWidth",fF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(n,i){if(n&1&&(Yf(0,Jr,2,8,"ng-template",null,0,ED),oi$1(2,"div",2,1),pu(),oi$1(4,"svg",3),np(5,"circle",4),bc$1()(),hu(),oi$1(6,"div",5)(7,"div",6)(8,"div",7),ip(9,8),bc$1(),oi$1(10,"div",9),ip(11,8),bc$1(),oi$1(12,"div",10),ip(13,8),bc$1()()()),n&2){let a=OE(1);ov(4),ep("viewBox",i._viewBox()),ov(),mp("stroke-dasharray",i._strokeCircumference(),"px")("stroke-dashoffset",i._strokeDashOffset(),"px")("stroke-width",i._circleStrokeWidth(),"%"),ep("r",i._circleRadius()),ov(4),tp("ngTemplateOutlet",a),ov(2),tp("ngTemplateOutlet",a),ov(2),tp("ngTemplateOutlet",a);}},dependencies:[mc$1],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return t})();var Bo=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl$1({imports:[J]})}return t})();function il(t,o){if(t&1&&(oi$1(0,"span",2),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.message());}}var wf=(()=>{class t{message=iF("");static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-loading-spinner"]],inputs:{message:[1,"message"]},decls:3,vars:2,consts:[[1,"flex","flex-col","items-center","gap-3","p-12","text-[var(--muted)]"],[3,"diameter"],[1,"text-sm"]],template:function(n,i){n&1&&(oi$1(0,"div",0),np(1,"mat-spinner",1),aE(2,il,2,1,"span",2),bc$1()),n&2&&(ov(),tp("diameter",36),ov(),cE(i.message()?2:-1));},dependencies:[Bo,$o],encapsulation:2})}return t})();function ol(t,o){t&1&&nD(0," The pre-fight plan is built entirely from top-parse logs. Gear, cooldown, defensive and burst plans all need parses - none are in yet. Here's what has to happen first: ");}function al(t,o){t&1&&nD(0," Your pull graded against the spec rulebook below. Cooldown, burst, defensive and gear comparisons need top-parse logs - none are in yet. Here's what has to happen first: ");}function rl(t,o){t&1&&(oi$1(0,"div",8),nD(1,"Plan unlocks"),bc$1(),oi$1(2,"div",9),nD(3,"The cards below fill in."),bc$1());}function ll(t,o){t&1&&(oi$1(0,"div",8),nD(1,"Comparisons unlock"),bc$1(),oi$1(2,"div",9),nD(3,"The sections below fill in."),bc$1());}var Df=(()=>{class t{encounter=iF("");variant=iF("post");static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-bench-empty-banner"]],hostAttrs:[1,"block"],inputs:{encounter:[1,"encounter"],variant:[1,"variant"]},decls:42,vars:3,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","p-4"],[1,"flex","items-start","gap-2.5"],[1,"icon-18","text-[var(--info)]","mt-px","shrink-0"],[1,"text-sm","font-semibold","text-[var(--text)]"],[1,"text-[12.5px]","text-[var(--muted)]","leading-relaxed","mt-0.5"],[1,"flex","items-stretch","gap-1","bg-[var(--bg)]","border","border-[var(--border)]","rounded-lg","px-4","py-3.5","mt-3.5"],[1,"flex-1","flex","flex-col","gap-1.5"],[1,"icon-seg","text-[var(--muted)]"],[1,"text-xs","font-semibold","text-[var(--text)]"],[1,"text-[11px]","text-[var(--muted)]","leading-snug"],[1,"font-mono","text-[10px]","text-[var(--critical)]","mt-px"],[1,"w-[26px]","shrink-0","flex","items-center","justify-center"],[1,"icon-16","text-[var(--border)]"],[1,"font-mono","text-[10px]","text-[var(--warning)]","mt-px"],[1,"icon-seg","text-[var(--success)]"],[1,"font-mono","text-[10px]","text-[var(--success)]","mt-px"]],template:function(n,i){n&1&&(oi$1(0,"div",0)(1,"div",1)(2,"mat-icon",2),nD(3,"info"),bc$1(),oi$1(4,"div")(5,"div",3),nD(6),bc$1(),oi$1(7,"div",4),aE(8,ol,1,0)(9,al,1,0),bc$1()()(),oi$1(10,"div",5)(11,"div",6)(12,"mat-icon",7),nD(13,"military_tech"),bc$1(),oi$1(14,"div",8),nD(15,"Mythic kills logged"),bc$1(),oi$1(16,"div",9),nD(17,"Players upload to WCL."),bc$1(),oi$1(18,"div",10),nD(19,"waiting"),bc$1()(),oi$1(20,"div",11)(21,"mat-icon",12),nD(22,"arrow_forward"),bc$1()(),oi$1(23,"div",6)(24,"mat-icon",7),nD(25,"cloud_sync"),bc$1(),oi$1(26,"div",8),nD(27,"Ingest samples them"),bc$1(),oi$1(28,"div",9),nD(29,"We pull new top rankings."),bc$1(),oi$1(30,"div",13),nD(31,"hourly"),bc$1()(),oi$1(32,"div",11)(33,"mat-icon",12),nD(34,"arrow_forward"),bc$1()(),oi$1(35,"div",6)(36,"mat-icon",14),nD(37,"check_circle"),bc$1(),aE(38,rl,4,0)(39,ll,4,0),oi$1(40,"div",15),nD(41,"automatic"),bc$1()()()()),n&2&&(ov(6),xc$1("No benchmark for ",i.encounter()," yet"),ov(2),cE(i.variant()==="pre"?8:9),ov(30),cE(i.variant()==="pre"?38:39));},dependencies:[fv,hv],encapsulation:2})}return t})();var Qt=(()=>{class t{transform(e){if(e==null)return "-";if(!Number.isFinite(e))return "0:00";let n=e<0?"-":"",i=Math.abs(e),a=Math.floor(i/60),r=Math.floor(i%60);return `${n}${a}:${String(r).padStart(2,"0")}`}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatDuration",type:t,pure:true})}return t})();function sl(t,o){if(t&1&&(oi$1(0,"div",3),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.subtitle());}}function dl(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",2),nD(2),bc$1(),aE(3,sl,2,1,"div",3),bc$1()),t&2){let e=_E();ov(2),Cp(e.heading()),ov(),cE(e.subtitle()?3:-1);}}function cl(t,o){if(t&1&&(oi$1(0,"mat-icon",4),nD(1),bc$1(),oi$1(2,"div",5),nD(3),bc$1(),oi$1(4,"div",6),nD(5),bc$1()),t&2){_E();let e=aD(0);ov(),Cp(e.kind==="permanent"?"error":"cloud_off"),ov(2),Cp(e.message),ov(2),xc$1(" ",e.kind==="permanent"?"This analysis is bugged. Retrying will not fix it.":"Retries on the next sync, or reselect the fight."," ");}}function ml(t,o){if(t&1&&(oi$1(0,"div",6),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.caption());}}function pl(t,o){if(t&1&&(oi$1(0,"mat-icon",7),nD(1,"schedule"),bc$1(),oi$1(2,"div",5),nD(3,"Waiting for top parses"),bc$1(),aE(4,ml,2,1,"div",6)),t&2){let e=_E();ov(4),cE(e.caption()?4:-1);}}var tt=(()=>{class t{heading=iF("");subtitle=iF("");caption=iF("Built from the top-parse bench.");error=iF(null);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-load-state"]],hostAttrs:[1,"block"],inputs:{heading:[1,"heading"],subtitle:[1,"subtitle"],caption:[1,"caption"],error:[1,"error"]},decls:6,vars:6,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"icon-seg","text-[var(--info)]"],[1,"text-[13px]","text-[var(--muted)]"],[1,"text-[11.5px]","text-[var(--muted)]/70"],[1,"icon-seg","text-[var(--muted)]"]],template:function(n,i){if(n&1&&(Sp(0),oi$1(1,"div",0),aE(2,dl,4,2,"div",1),oi$1(3,"div"),aE(4,cl,6,3)(5,pl,5,1),bc$1()()),n&2){let a=sD(i.error());ov(2),cE(i.heading()?2:-1),ov(),qE(cD("px-4 py-6 flex flex-col items-center gap-2 text-center ",i.heading()?"border-t border-dashed border-[var(--border)]":"")),ov(),cE(a?4:5);}},dependencies:[fv,hv],encapsulation:2})}return t})();var fl="wh-tooltips-config.js",ul="https://wow.zamimg.com/js/tooltips.js",Wo=(()=>{class t{document=T(Jn$1);loaded=false;ready=false;refreshScheduled=false;ensureLoaded(){if(this.loaded)return;this.loaded=true;let e=this.document.createElement("script");e.src=fl,e.addEventListener("error",n=>ua$1("wowhead tooltips config load",n)),e.addEventListener("load",()=>{let n=this.document.createElement("script");n.src=ul,n.addEventListener("error",i=>ua$1("wowhead tooltips script load",i)),n.addEventListener("load",()=>{this.ready=true,this.refreshLinks();}),this.document.head.appendChild(n);}),this.document.head.appendChild(e);}refreshLinks(){this.refreshScheduled||(this.refreshScheduled=true,queueMicrotask(()=>{this.refreshScheduled=false,this.ready&&this.document.defaultView?.$WowheadPower?.refreshLinks?.();}));}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function hl(t,o){if(t&1){let e=vE();oi$1(0,"img",3),cp("error",function(){tu(e);let i=_E(),a=_E();return nu(a.failedSrc.set(i))}),bc$1();}if(t&2){let e=_E();tp("ngSrc",e)("width",18)("height",18);}}function _l(t,o){if(t&1&&aE(0,hl,1,3,"img",2),t&2){let e=_E();cE(e.failedSrc()!==o?0:-1);}}var nt=(()=>{class t{constructor(){let e=T(Wo);Oy(()=>{e.ensureLoaded(),e.refreshLinks();});}id=iF.required();kind=iF("spell");name=iF.required();icon=iF.required();failedSrc=So$1(null);iconUrl=TD(()=>{let e=this.icon().replace(/\.(jpg|jpeg|png|gif|webp)$/i,"");return e?`https://wow.zamimg.com/images/wow/icons/small/${e}.jpg`:null});wowheadUrl=TD(()=>`https://www.wowhead.com/${this.kind()}=${this.id()}`);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-game-icon"]],hostAttrs:[1,"inline-flex","items-center"],inputs:{id:[1,"id"],kind:[1,"kind"],name:[1,"name"],icon:[1,"icon"]},decls:4,vars:3,consts:[["target","_blank","rel","noopener",1,"inline-flex","items-center","gap-1.5","no-underline","hover:brightness-125",3,"href"],[1,"text-sm"],["alt","",1,"rounded-sm",3,"ngSrc","width","height"],["alt","",1,"rounded-sm",3,"error","ngSrc","width","height"]],template:function(n,i){if(n&1&&(oi$1(0,"a",0),aE(1,_l,1,1),oi$1(2,"span",1),nD(3),bc$1()()),n&2){let a;tp("href",i.wowheadUrl(),Qd$1),ov(),cE((a=i.iconUrl())?1:-1,a),ov(2),Cp(i.name());}},dependencies:[lf],encapsulation:2})}return t})();var Kt=(()=>{class t{transform(e){return e==null?"":e>=1e6||Math.round(e/1e3)>=1e3?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${Math.round(e/1e3)}K`:String(Math.round(e))}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatDamage",type:t,pure:true})}return t})();function gl(t,o){if(t&1&&np(0,"wl-game-icon",3),t&2){let e=_E();tp("id",o)("icon",e.row().icon)("name",e.row().label);}}function vl(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.row().label);}}function xl(t,o){t&1&&nD(0," missed ");}function bl(t,o){if(t&1&&(nD(0),mD(1,"formatDamage")),t&2){let e=_E(2);bp(" ",e.gapSign(),"",vD(1,2,e.gapMagnitude())," ");}}function yl(t,o){if(t&1&&(oi$1(0,"span",9),aE(1,xl,1,0)(2,bl,2,4),bc$1()),t&2){let e=_E();yp("badge-success",e.gapStatus()==="success")("badge-warning",e.gapStatus()==="warning")("badge-critical",e.gapStatus()==="critical")("badge-muted",e.gapStatus()==="muted"),ov(),cE(e.row().playerPct==null?1:2);}}function Cl(t,o){t&1&&(oi$1(0,"span",10),nD(1,"passive"),bc$1());}function wl(t,o){if(t&1&&(oi$1(0,"span",11),nD(1,"Casts"),bc$1(),oi$1(2,"span",12),nD(3),oi$1(4,"span",13),nD(5),bc$1()()),t&2){let e=_E(2);ov(2),yp("badge-success",e.castsStatus()==="success")("badge-warning",e.castsStatus()==="warning")("badge-critical",e.castsStatus()==="critical")("badge-muted",e.castsStatus()==="muted"),ov(),xc$1(" ",e.row().playerCasts??0),ov(2),xc$1(" / ",e.row().topCasts??"-");}}function Sl(t,o){if(t&1&&aE(0,Cl,2,0,"span",10)(1,wl,6,10),t&2){let e=_E();cE(e.isPassive()?0:1);}}var zo=(()=>{class t{row=iF.required();higherIsBetter=iF(true);showCasts=iF(true);hidePlayer=iF(false);gap=TD(()=>{let{playerPct:e,topAvg:n}=this.row();return e==null||n==null?null:e-n});gapSign=TD(()=>(this.gap()??0)>=0?"+":"-");gapMagnitude=TD(()=>Math.abs(this.gap()??0));gapStatus=TD(()=>{let{playerPct:e,topAvg:n}=this.row();if(e==null)return "critical";let i=this.gap();return i==null||n==null||n===0?"muted":(this.higherIsBetter()?i:-i)>=0?"success":Math.abs(i)<=n*.1?"warning":"critical"});isPassive=TD(()=>this.row().passive===true);castsStatus=TD(()=>{let{playerCasts:e,topCasts:n}=this.row();if(n==null)return "muted";let i=e??0;return i>=n?"success":n-i<=1?"warning":"critical"});static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-compact-ability-row"]],inputs:{row:[1,"row"],higherIsBetter:[1,"higherIsBetter"],showCasts:[1,"showCasts"],hidePlayer:[1,"hidePlayer"]},decls:13,vars:6,consts:[[1,"md:grid","md:grid-cols-[minmax(0,1fr)_96px_96px_90px]","md:gap-x-[14px]","md:items-center","px-4","py-1.5","min-w-0","border-t","md:border-t-0","border-[var(--border)]"],[1,"flex","items-baseline","gap-2","min-w-0","md:contents"],[1,"flex-1","min-w-0","overflow-hidden","md:col-start-1","md:row-start-1"],[3,"id","icon","name"],[1,"truncate","text-sm"],[1,"shrink-0","md:col-start-4","md:row-start-1","text-right","tabular-nums","text-xs","font-semibold",3,"badge-success","badge-warning","badge-critical","badge-muted"],[1,"flex","items-baseline","flex-wrap","gap-x-1.5","gap-y-1","mt-1.5","md:mt-0","md:contents"],[1,"shrink-0","mr-2","md:mr-0","md:col-start-3","md:row-start-1","md:text-left","tabular-nums","text-xs","text-[var(--muted)]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider"],[1,"shrink-0","md:col-start-4","md:row-start-1","text-right","tabular-nums","text-xs","font-semibold"],[1,"shrink-0","md:col-start-2","md:row-start-1","w-auto","text-center","text-xs","rounded","px-2","py-0.5","border","border-current","badge-muted"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"shrink-0","md:col-start-2","md:row-start-1","w-auto","text-center","tabular-nums","text-xs","rounded","px-2","py-0.5","border","border-current"],[1,"text-[var(--muted)]"]],template:function(n,i){if(n&1&&(oi$1(0,"div",0)(1,"div",1)(2,"div",2),aE(3,gl,1,3,"wl-game-icon",3)(4,vl,2,1,"span",4),bc$1(),aE(5,yl,3,9,"span",5),bc$1(),oi$1(6,"div",6)(7,"span",7)(8,"span",8),nD(9,"Top avg "),bc$1(),nD(10),mD(11,"formatDamage"),bc$1(),aE(12,Sl,2,1),bc$1()()),n&2){let a;ov(3),cE((a=i.row().spellId)?3:4,a),ov(2),cE(i.hidePlayer()?-1:5),ov(5),xc$1("",vD(11,4,i.row().topAvg)," "),ov(2),cE(i.showCasts()&&!i.hidePlayer()?12:-1);}},dependencies:[nt,Kt],encapsulation:2})}return t})();var Go=(()=>{class t{transform(e){if(e==null||!Number.isFinite(e))return "";let n=Math.round(e);return `${n>0?"+":""}${n}%`}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"signedPercent",type:t,pure:true})}return t})();var Ml=(t,o)=>o.kind==="window"?"w"+o.index:"g"+o.id,kl=(t,o)=>o.id,Tl=(t,o)=>o.spellId;function El(t,o){if(t&1&&(oi$1(0,"div",6),nD(1),bc$1()),t&2){let e=_E(2);ov(),Cp(e.subtitle());}}function Dl(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",5),nD(2),bc$1(),aE(3,El,2,1,"div",6),bc$1()),t&2){let e=_E();ov(2),Cp(e.heading()),ov(),cE(e.subtitle()?3:-1);}}function Il(t,o){t&1&&(oi$1(0,"div",7),np(1,"div",9),oi$1(2,"span",10),nD(3,"0"),bc$1()());}function Fl(t,o){if(t&1){let e=vE();oi$1(0,"div",8)(1,"button",11),mD(2,"formatDuration"),cp("click",function(){tu(e);let i=_E().$implicit,a=_E();return nu(a.select(i.index))}),oi$1(3,"mat-icon",12),nD(4),bc$1(),np(5,"span",13),bc$1(),oi$1(6,"span"),nD(7),mD(8,"formatDuration"),bc$1()();}if(t&2){let e=_E().$implicit,n=_E(),i=n.windows()[e.index],a=n.activeIndex()===e.index,r=i.status==="good"?"text-[var(--success)]":i.status==="warn"?"text-[var(--warning)]":i.status==="bad"?"text-[var(--critical)]":i.status==="info"?"text-[var(--info)]":"text-[var(--muted)]",l=i.status==="good"?"bg-[var(--success)]":i.status==="warn"?"bg-[var(--warning)]":i.status==="bad"?"bg-[var(--critical)]":i.status==="info"?"bg-[var(--info)]":"bg-[var(--muted)]";ov(),qE("relative flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg)] border border-[var(--border)] "+r+(a?" outline outline-2 outline-offset-0 outline-[var(--gold)]":" focus:outline-none")),tp("id",n.optionId(e.index)),ep("aria-selected",a)("aria-label",vD(2,11,i.timeStartS)),ov(3),Cp(i.statusIcon),ov(),qE("absolute bottom-0 left-0 right-0 h-1 "+l),ov(),qE("tabular-nums text-[10px] "+(a?"text-[var(--gold)]":"text-[var(--muted)]")),ov(),xc$1(" ",vD(8,13,i.timeStartS)," ");}}function Al(t,o){if(t&1&&aE(0,Il,4,0,"div",7)(1,Fl,9,15,"div",8),t&2){let e=o.$implicit;cE(e.kind==="gap"?0:1);}}function Ol(t,o){if(t&1&&(oi$1(0,"span",19),nD(1),mD(2,"formatDamage"),bc$1()),t&2){let e=_E();ov(),Cp(vD(2,1,e.overview.playerPct));}}function Rl(t,o){if(t&1&&(oi$1(0,"span",19),nD(1),mD(2,"formatDamage"),bc$1()),t&2){let e=_E();ov(),Cp(vD(2,1,e.overview.topAvg));}}function Pl(t,o){t&1&&(oi$1(0,"span",20),nD(1,"not reached"),bc$1());}function Nl(t,o){if(t&1&&(oi$1(0,"div",16)(1,"span",17),nD(2,"vs top average"),bc$1(),oi$1(3,"span",27),nD(4),mD(5,"signedPercent"),bc$1()()),t&2){let e=_E(2);ov(3),yp("badge-muted",e.overviewDeltaStatus()==="muted")("badge-success",e.overviewDeltaStatus()==="better")("badge-critical",e.overviewDeltaStatus()==="worse"),ov(),Cp(vD(5,7,e.overviewDelta()));}}function Ll(t,o){if(t&1){let e=vE();oi$1(0,"button",28),cp("click",function(){tu(e);let i=_E(2);return nu(i.openMap.emit(i.activeIndex()))}),oi$1(1,"mat-icon"),nD(2,"my_location"),bc$1()();}}function $l(t,o){if(t&1){let e=vE();oi$1(0,"button",29),cp("click",function(){tu(e);let i=_E(2);return nu(i.openClip.emit(i.activeIndex()))}),oi$1(1,"mat-icon"),nD(2,"videocam"),bc$1()();}}function Bl(t,o){if(t&1&&(oi$1(0,"span",32),np(1,"wl-game-icon",33),bc$1()),t&2){let e=o.$implicit;ov(),tp("id",e.id)("icon",e.icon)("name",e.name);}}function Wl(t,o){if(t&1&&(oi$1(0,"span",32)(1,"span",34),nD(2),bc$1()()),t&2){let e=o.$implicit;ov(2),Cp(e);}}function zl(t,o){if(t&1&&(oi$1(0,"div",24)(1,"span",30),nD(2,"Recommended cooldowns"),bc$1(),oi$1(3,"div",31),dE(4,Bl,2,3,"span",32,kl),dE(6,Wl,3,1,"span",32,uE),bc$1()()),t&2){let e=_E();ov(4),fE(e.spells),ov(2),fE(e.labels);}}function Gl(t,o){if(t&1&&np(0,"div"),t&2){_E(2);let e=aD(0),n=_E();qE("absolute inset-y-0 left-0 rounded opacity-[0.65] "+e),mp("width",n.overviewPlayerWidthPct(),"%");}}function Vl(t,o){if(t&1&&np(0,"div",39),t&2){let e=_E(3);mp("left",e.overviewRangeLeftPct(),"%")("width",e.overviewRangeWidthPct(),"%");}}function jl(t,o){if(t&1&&np(0,"div",40),t&2){let e=_E(3);mp("left",e.overviewAvgLeftPct(),"%");}}function ql(t,o){if(t&1&&(oi$1(0,"div",25)(1,"span",30),nD(2,"Damage vs top range"),bc$1(),oi$1(3,"div",35),aE(4,Gl,1,4,"div",36),aE(5,Vl,1,4,"div",37),aE(6,jl,1,2,"div",38),bc$1()()),t&2){let e=_E(2);ov(4),cE(e.overviewPlayerWidthPct()!==null?4:-1),ov(),cE(e.overviewRangeLeftPct()!==null?5:-1),ov(),cE(e.overviewAvgLeftPct()!==null?6:-1);}}function Hl(t,o){t&1&&(oi$1(0,"span",43),nD(1,"casts"),bc$1());}function Ul(t,o){t&1&&(oi$1(0,"span",45),nD(1,"gap"),bc$1());}function Ql(t,o){if(t&1&&np(0,"wl-compact-ability-row",46),t&2){let e=o.$implicit,n=_E(3);tp("row",e)("higherIsBetter",n.higherIsBetter())("showCasts",n.showCasts())("hidePlayer",n.activeIsMuted());}}function Kl(t,o){if(t&1&&(oi$1(0,"div",26)(1,"div",41)(2,"span",42),nD(3,"ability"),bc$1(),aE(4,Hl,2,0,"span",43),oi$1(5,"span",44),nD(6,"top avg"),bc$1(),aE(7,Ul,2,0,"span",45),bc$1(),dE(8,Ql,1,4,"wl-compact-ability-row",46,Tl),bc$1()),t&2){let e=_E(2);ov(4),cE(e.showCasts()&&!e.activeIsMuted()?4:-1),ov(3),cE(e.activeIsMuted()?-1:7),ov(),fE(e.activeDetailRows());}}function Yl(t,o){if(t&1&&(Sp(0),oi$1(1,"div",14)(2,"div",15)(3,"div",16)(4,"span",17),nD(5,"window"),bc$1(),oi$1(6,"span",18),nD(7),mD(8,"formatDuration"),mD(9,"formatDuration"),bc$1()(),oi$1(10,"div",16)(11,"span",17),nD(12,"burst"),bc$1(),aE(13,Ol,3,3,"span",19)(14,Rl,3,3,"span",19)(15,Pl,2,0,"span",20),bc$1(),aE(16,Nl,6,9,"div",16),oi$1(17,"div",21),aE(18,Ll,3,0,"button",22),aE(19,$l,3,0,"button",23),bc$1()(),aE(20,zl,8,0,"div",24),bc$1(),aE(21,ql,7,3,"div",25),aE(22,Kl,10,2,"div",26)),t&2){let e=o,n=_E();sD(e.status==="good"?"bg-[var(--success)]":e.status==="warn"?"bg-[var(--warning)]":e.status==="bad"?"bg-[var(--critical)]":e.status==="muted"?"bg-[var(--muted)]":"bg-[var(--info)]"),ov(7),bp(" ",vD(8,10,e.timeStartS)," - ",vD(9,12,e.timeEndS)," "),ov(6),cE(n.activeIsMuted()?n.activeIsBenchOnly()?14:15:13),ov(3),cE(!n.activeIsMuted()&&n.overviewDelta()!==null?16:-1),ov(2),cE(n.showMap()?18:-1),ov(),cE(n.showClip()?19:-1),ov(),cE(e.spells.length||e.labels.length?20:-1),ov(),cE(n.activeIsBenchOnly()?-1:21),ov(),cE(e.detailRows.length?22:-1);}}var Xl=0,jo=(()=>{class t{windows=iF.required();higherIsBetter=iF(true);showMap=iF(false);showClip=iF(false);showCasts=iF(true);heading=iF("");subtitle=iF("");openMap=oF();openClip=oF();static GAP_SLOT_SECONDS=20;selectedIndex=TD(()=>{let e=this.windows(),n=this.higherIsBetter(),i=0,a=n?1/0:-1/0;return e.forEach((r,l)=>{if(r.status==="muted")return;let s=r.overview.playerPct,m=r.overview.topAvg;if(s==null||!m||m<=0)return;let f=s/m;(n?f<a:f>a)&&(a=f,i=l);}),i});_manualIndex=_D({source:this.windows,computation:()=>null});activeIndex=TD(()=>this._manualIndex()??this.selectedIndex());activeWindow=TD(()=>this.windows()[this.activeIndex()]??null);instanceId=`wl-window-comparison-${Xl++}`;optionId(e){return `${this.instanceId}-opt-${e}`}activeOptionId=TD(()=>this.optionId(this.activeIndex()));timelineCells=TD(()=>{let e=this.windows(),n=[];return e.forEach((i,a)=>{n.push({kind:"window",index:a});let r=e[a+1];if(!r)return;let l=this.gapSlots(r.timeStartS-i.timeEndS);for(let s=0;s<l;s++)n.push({kind:"gap",id:`${a}-${s}`});}),n});gapSlots(e){return Math.max(0,Math.floor(e/t.GAP_SLOT_SECONDS))}select(e){this._manualIndex.set(e);}onKeydown(e){let n=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!n)return;e.preventDefault();let i=this.activeIndex()+n;i>=0&&i<this.windows().length&&this.select(i);}activeIsMuted=TD(()=>{let e=this.activeWindow()?.status;return e==="muted"||e==="info"});activeIsBenchOnly=TD(()=>this.activeWindow()?.status==="info");activeDetailRows=TD(()=>{let e=this.activeWindow()?.detailRows??[],n=this.higherIsBetter(),i=a=>{if(a.playerPct==null)return -(a.topAvg??0);let r=a.playerPct-(a.topAvg??0);return n?r:-r};return [...e].sort((a,r)=>i(a)-i(r))});overviewMax=TD(()=>{let e=this.windows().flatMap(n=>[n.overview.topAvg,n.overview.topMax,n.overview.playerPct].filter(i=>i!=null&&Number.isFinite(i)));return Math.max(...e,.01)});barPct(e,n){let i=e/n*100;return Number.isFinite(i)?Math.min(100,Math.max(0,i)):0}overviewDelta=TD(()=>{let e=this.activeWindow();if(!e)return null;let{playerPct:n,topAvg:i}=e.overview;if(n==null||i==null||i===0)return null;let a=(n-i)/i*100;return Number.isFinite(a)?a:null});overviewDeltaStatus=TD(()=>{let e=this.overviewDelta();return e==null?"muted":(this.higherIsBetter()?e>=0:e<=0)?"better":"worse"});overviewPlayerWidthPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.playerPct==null?null:this.barPct(e.overview.playerPct,this.overviewMax())});overviewRangeLeftPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.topMin==null||e.overview.topMax==null?null:this.barPct(e.overview.topMin,this.overviewMax())});overviewRangeWidthPct=TD(()=>{let e=this.activeWindow();if(!e||e.overview.topMin==null||e.overview.topMax==null)return null;let n=this.overviewMax();return Math.max(0,this.barPct(e.overview.topMax,n)-this.barPct(e.overview.topMin,n))});overviewAvgLeftPct=TD(()=>{let e=this.activeWindow();return !e||e.overview.topAvg==null?null:this.barPct(e.overview.topAvg,this.overviewMax())});static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-window-comparison"]],hostAttrs:[1,"block"],inputs:{windows:[1,"windows"],higherIsBetter:[1,"higherIsBetter"],showMap:[1,"showMap"],showClip:[1,"showClip"],showCasts:[1,"showCasts"],heading:[1,"heading"],subtitle:[1,"subtitle"]},outputs:{openMap:"openMap",openClip:"openClip"},decls:8,vars:8,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"px-4"],["role","listbox","tabindex","0",1,"pt-2","pb-1",3,"keydown"],[1,"flex","flex-wrap","items-start","gap-1.5","px-0.5"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],["aria-hidden","true",1,"flex","flex-col","items-center","gap-1.5","shrink-0"],[1,"flex","flex-col","items-center","gap-1.5","shrink-0"],[1,"w-5","h-10","rounded-md","border","border-dashed","border-[var(--border)]","opacity-40"],[1,"text-[10px]","invisible"],["type","button","role","option","tabindex","-1",3,"click","id"],[1,"icon-seg"],["aria-hidden","true"],[1,"px-4","py-2.5","bg-[var(--surface)]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-4","md:gap-[22px]"],[1,"flex","flex-col","shrink-0"],[1,"text-[9px]","uppercase","tracking-[1px]","text-[var(--muted)]"],[1,"text-[13px]","font-semibold","tabular-nums","text-[var(--text)]","whitespace-nowrap"],[1,"text-[13px]","font-semibold","tabular-nums","text-[var(--text)]"],[1,"text-[13px]","font-semibold","italic","text-[var(--muted)]"],[1,"ml-auto","flex","items-center","gap-[7px]","shrink-0"],["mat-icon-button","","title","Open positioning map"],["mat-icon-button","","title","Watch clip"],[1,"mt-2.5"],[1,"px-4","pb-2"],[1,"md:border-t","border-[var(--border)]","pt-2","pb-2"],[1,"text-[13px]","font-semibold","tabular-nums"],["mat-icon-button","","title","Open positioning map",3,"click"],["mat-icon-button","","title","Watch clip",3,"click"],[1,"block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mb-1.5"],[1,"flex","flex-wrap","items-center","gap-2"],[1,"chip-onplan"],[3,"id","icon","name"],[1,"text-[13px]","text-[var(--muted)]"],["aria-hidden","true",1,"relative","h-5","rounded","bg-[var(--bg)]"],[3,"class","width"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]",3,"left","width"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]",3,"left"],[1,"absolute","inset-y-0","rounded","bg-[var(--info)]/30","border","border-[var(--info)]"],[1,"absolute","inset-y-0","w-[2px]","bg-[var(--info)]"],[1,"hidden","md:grid","grid-cols-[minmax(0,1fr)_96px_96px_90px]","gap-x-[14px]","items-center","px-4","pb-1"],[1,"col-start-1","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-2","text-right","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-3","text-left","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"col-start-4","text-right","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[3,"row","higherIsBetter","showCasts","hidePlayer"]],template:function(n,i){if(n&1&&(oi$1(0,"div",0),aE(1,Dl,4,2,"div",1),oi$1(2,"div",2)(3,"div",3),cp("keydown",function(r){return i.onKeydown(r)}),oi$1(4,"div",4),dE(5,Al,2,1,null,null,Ml),bc$1()()(),aE(7,Yl,23,14),bc$1()),n&2){let a;ov(),cE(i.heading()?1:-1),ov(),yp("pt-3",!i.heading())("pb-3",!i.activeWindow()),ov(),ep("aria-label",i.heading())("aria-activedescendant",i.activeOptionId()),ov(2),fE(i.timelineCells()),ov(2),cE((a=i.activeWindow())?7:-1,a);}},dependencies:[fv,hv,Ib,Wd$1,nt,zo,Qt,Kt,Go],encapsulation:2})}return t})();var it=class{token=0;run(o,e){let n=++this.token;o.then(i=>{n===this.token&&e.apply(i);}).catch(i=>ua$1(e.context,i)).finally(()=>{n===this.token&&e.settled?.();});}};function ot(t){return `${t.targetID??0}:${t.targetInstance??0}`}var Zl=1,Jl=6603,es=291807;function Yt(t){return t===Zl?Jl:t<0?es:t}function Xt(t,o){return t.map(e=>{let n=o[e];return n?{id:e,icon:n.icon,name:n.name}:(ua$1("windowSpells: ability id missing from ability map",e),{id:e,icon:"",name:`Ability #${e}`})})}function ts(t,o,e,n,i,a=false){return a?{status:"info",icon:"insights"}:i?{status:"muted",icon:"schedule"}:t===null?{status:"muted",icon:"help_outline"}:t<e-n?{status:"bad",icon:"error"}:o>0&&t<o-n?{status:"warn",icon:"warning_amber"}:{status:"good",icon:"check_circle"}}function ns(t,o){let e=[],n=[];for(let i of t){let a=o[i];a?e.push(a):n.push(i);}return {spellIds:e,labels:n}}function is(t,o,e){let n={};for(let i of o?.ability_breakdown??[])n[i.spell_id]=i;return t.map(i=>{let a=e[i.spell_id];return a||ua$1("burstDetailRows: ability id missing from ability map",i.spell_id),{spellId:i.spell_id,label:a?.name??`Ability #${i.spell_id}`,icon:a?.icon??"",playerPct:n[i.spell_id]?.damage??null,topAvg:i.avg_damage,topMin:i.min_damage,topMax:i.max_damage,playerCasts:n[i.spell_id]?.casts??null,topCasts:i.avg_casts??null,passive:i.is_passive??false}})}function os(t){return {timeS:t.time_s,windowLengthS:t.window_length_s}}function as(t,o){return {timeS:t.time_s,windowLengthS:t.window_length_s,key:`burst-${o}`}}function Dn(t,o,e,n,i,a=false){let r=[],l=[],s=[];return t.forEach((m,f)=>{let h=m.time_s>e,g=h?null:o[f]??null,y=g?.window_damage??null,{status:C,icon:E}=ts(y,m.dmg_avg,m.dmg_min,m.dmg_stddev,h,a),{spellIds:z,labels:X}=ns(m.common_cds,n);r.push({timeStartS:m.time_s,timeEndS:m.time_s+m.window_length_s,spells:Xt(z,i),labels:X,status:C,statusIcon:E,overview:{label:"",icon:"",playerPct:y,topAvg:m.dmg_avg,topMin:m.dmg_min,topMax:m.dmg_max},detailRows:is(m.ability_breakdown,g,i)}),l.push(os(m)),s.push(as(m,f));}),{windows:r,anchors:l,clipAnchors:s}}function In(t){return (t.amount||0)+(t.absorbed||0)}function rs(t,o,e,n,i){let a=h=>h>=t.time_s&&h<t.time_s+t.window_length_s,r=o.filter(h=>a((h.timestamp-n)/1e3)),l=r.reduce((h,g)=>h+In(g),0),s={};for(let h of r){if(!h.abilityGameID)continue;let g=Yt(h.abilityGameID);s[g]=(s[g]||0)+In(h);}let m=new Map;for(let h of e)if(a((h.timestamp-n)/1e3)){let g=i(h.abilityGameID);m.set(g,(m.get(g)??0)+1);}let f=Object.entries(s).sort((h,g)=>g[1]-h[1]).map(([h,g])=>{let y=parseInt(h,10);return {spell_id:y,damage:Math.round(g),casts:m.get(i(y))??0}});return {time_s:t.time_s,window_damage:Math.round(l),ability_breakdown:f}}function ls(t,o,e,n,i){let a=s=>i.get(s)??`Spell ${s}`,r=o.filter(s=>s.timestamp>=n&&In(s)>0).sort((s,m)=>s.timestamp-m.timestamp),l=e.filter(s=>s.type==="cast"&&s.abilityGameID);return t.map(s=>rs(s,r,l,n,a))}var qo=(()=>{class t{source=T(Ya$1);wclApi=T(xe);async loadPlayerView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let s=await this.wclApi.getReport(i),m=s.fights.find(E=>E.id===a);if(!m)return ri(Dn(l.value.windows,[],Number.POSITIVE_INFINITY,l.value.cd_spell_ids,l.value.ability_icons,!0));let f=new Map;for(let E of s.masterData?.abilities??[])f.set(E.gameID,E.name);let[h,g]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",m.startTime,m.endTime,r),this.wclApi.getAllEvents(i,a,"DamageDone",m.startTime,m.endTime,r)]),y=ls(l.value.windows,g,h,m.startTime,f),C=(m.endTime-m.startTime)/1e3;return ri(Dn(l.value.windows,y,C,l.value.cd_spell_ids,l.value.ability_icons))}catch(s){return ua$1(`BurstFeatureService.loadPlayerView ${i}:${a}`,s),ma$1(s,"burst.player-view")}}async loadBenchView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri(Dn(i.value.windows,[],Number.POSITIVE_INFINITY,i.value.cd_spell_ids,i.value.ability_icons,true)):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function ss(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("error",e.error());}}function ds(t,o){if(t&1){let e=vE();oi$1(0,"wl-window-comparison",2),cp("openMap",function(i){tu(e);let a=_E();return nu(a.onOpenMap(i))})("openClip",function(i){tu(e);let a=_E();return nu(a.onOpenClip(i))}),bc$1();}if(t&2){let e=_E();tp("windows",e.windows())("higherIsBetter",true)("showMap",e.showMap())("showClip",e.showClip());}}var Ru=(()=>{class t{burst=T(qo);spec=iF.required();encounterId=iF.required();report=iF("");fight=iF(0);player=iF(0);showMap=iF(false);showClip=iF(false);openMap=oF();openClip=oF();busyChange=oF();availableChange=oF();available=So$1(true);error=So$1(null);_windows=So$1([]);_anchors=So$1([]);_clipAnchors=So$1([]);windows=this._windows.asReadonly();loader=new it;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId(),i=this.report(),a=this.fight(),r=this.player(),l=i&&a&&r?this.burst.loadPlayerView(e,n,i,a,r):this.burst.loadBenchView(e,n);this.loader.run(l,{context:"burst.loadPlayerView",apply:s=>{s.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this._windows.set(s.value.windows),this._anchors.set(s.value.anchors),this._clipAnchors.set(s.value.clipAnchors)):(s.error.kind==="permanent"&&ua$1(s.error.id,s.error.context),this.error.set(s.error.kind==="missing"?null:s.error),this.available.set(false),this.availableChange.emit(false),this._windows.set([]),this._anchors.set([]),this._clipAnchors.set([]));},settled:()=>this.busyChange.emit(false)});});}onOpenMap(e){let n=this._anchors()[e];n&&this.openMap.emit(n);}onOpenClip(e){let n=this._clipAnchors()[e];n&&this.openClip.emit(n);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-burst-windows"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],showClip:[1,"showClip"]},outputs:{openMap:"openMap",openClip:"openClip",busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"error"],["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"windows","higherIsBetter","showMap","showClip"],["heading","Burst Windows","subtitle","Damage in each burst window vs top parses.",3,"openMap","openClip","windows","higherIsBetter","showMap","showClip"]],template:function(n,i){n&1&&aE(0,ss,1,1,"wl-load-state",0)(1,ds,1,4,"wl-window-comparison",1),n&2&&cE(i.error()||!i.available()?0:1);},dependencies:[jo,tt],encapsulation:2})}return t})();var cs=["content"],ms=["*"];function ps(t,o){if(t&1){let e=vE();oi$1(0,"button",3),cp("click",function(){tu(e);let i=_E();return nu(i.toggle())}),nD(1),oi$1(2,"mat-icon",4),nD(3),bc$1()();}if(t&2){let e=_E();ep("aria-expanded",e.expanded()),ov(),xc$1(" ",e.expanded()?"Show less":"Show more"," "),ov(2),Cp(e.expanded()?"expand_less":"expand_more");}}var Ho=(()=>{class t{destroyRef=T(Le);content=sF.required("content");expanded=So$1(false);overflowing=So$1(false);constructor(){Oy(()=>{let e=this.content().nativeElement,n=()=>{this.expanded()||this.overflowing.set(e.scrollHeight-e.clientHeight>1);};if(n(),typeof ResizeObserver<"u"){let i=new ResizeObserver(n);i.observe(e),this.destroyRef.onDestroy(()=>i.disconnect());}});}toggle(){this.expanded.update(e=>!e);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-collapsible-text"]],viewQuery:function(n,i){n&1&&pp(i.content,cs,5),n&2&&kE();},hostAttrs:[1,"block"],ngContentSelectors:ms,decls:4,vars:3,consts:[["content",""],[1,"md:line-clamp-none"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]"],["type","button",1,"md:hidden","mt-1.5","inline-flex","items-center","gap-0.5","text-[11.5px]","text-[var(--accent)]",3,"click"],[1,"icon-16"]],template:function(n,i){n&1&&(SE(),oi$1(0,"div",1,0),NE(2),bc$1(),aE(3,ps,4,3,"button",2)),n&2&&(yp("line-clamp-2",!i.expanded()),ov(3),cE(i.overflowing()?3:-1));},dependencies:[fv,hv],encapsulation:2})}return t})();function Uo(t){let o=(t??[]).filter(n=>n.id!=null).map(n=>({entryId:n.id,rank:n.rank??1})).sort((n,i)=>n.entryId-i.entryId);return o.length?`v3:${o.map(n=>[n.entryId,n.rank].join(".")).join(",")}`:""}var Qo=50,fs={0:"Head",1:"Neck",2:"Shoulder",3:"Shirt",4:"Chest",5:"Waist",6:"Legs",7:"Feet",8:"Wrists",9:"Hands",10:"Ring 1",11:"Ring 2",12:"Trinket 1",13:"Trinket 2",14:"Back",15:"Main Hand",16:"Off Hand"},us={ok:"check_circle",warn:"warning",info:"info",unknown:"help_outline"};function _t(t){return fs[t]||`Slot ${t}`}function Ko(t){return us[t]}function Yo(t,o){let e=o?.enchants??{},n=t.enchants??[];if(!Object.keys(e).length&&!n.length)return [];let i=new Set;for(let r of Object.keys(e))i.add(Number(r));for(let r of n)i.add(r.slot);let a=[];for(let r of [...i].sort((l,s)=>l-s)){let l=_t(r),s=e[r]?.[0],m=s?s.name||`Enchant #${s.id}`:"",f=n.find(y=>y.slot===r);if(!f){s&&s.pct>=Qo&&a.push({slotName:l,status:"warn",name:"Not enchanted",topPct:s.pct,note:`Apply ${m}`});continue}let h=f.name||`Enchant #${f.id}`,g=e[r]?.find(y=>y.id===f.id)?.pct??null;s&&f.id===s.id?a.push({slotName:l,status:"ok",name:h,topPct:s.pct,note:`${s.pct}% run this`}):s?a.push({slotName:l,status:"info",name:h,topPct:g,note:`${s.pct}% run ${m}`}):a.push({slotName:l,status:"ok",name:h,topPct:null,note:null});}return a}function Xo(t){return t.some(o=>o.status==="warn")?"warn":"ok"}function Fn(t,o){let e=t?.talent_builds??[];return e.length?e.map((n,i)=>({pct:n.pct,isPlayer:!!o&&n.key===o,link:`https://www.warcraftlogs.com/reports/${n.report_code}?fight=${n.fight_id}&type=summary&source=${n.source_id}`,playerName:n.player_name,label:i===0?"Most common build":`Alt build ${i}`,added:(n.diff??[]).filter(a=>a.kind==="added").map(a=>a.talent),dropped:(n.diff??[]).filter(a=>a.kind==="dropped").map(a=>a.talent),ranks:(n.diff??[]).filter(a=>a.kind==="rank")})):[]}function An(t,o){let e=t?.talent_builds??[];if(!e.length)return {status:"unknown",note:"No talent data."};let n=e[0]?.pct??0;return !o||o.split(":")[0]!==(e[0]?.key??"").split(":")[0]?{status:"ok",note:`${n}% run this build`}:e.some(i=>i.key===o)?{status:"ok",note:"Standard build."}:{status:"warn",note:`Off-meta build. ${n}% run the standard one.`}}function hs(t,o){let e=t?.trinkets??{},n=0,i=false;for(let a of [12,13]){let r=(e[a]??[]).find(l=>l.id===o);r&&(n+=r.pct,i=true);}return i?n:null}function Zo(t,o){let e=t.trinkets??[],n=ea(o),i=[],a=new Set(e.map(m=>m.id)),r=n.filter(m=>!a.has(m.id)),l=0,s=new Set;for(let m of [12,13]){let f=_t(m),h=e.find(C=>C.slot===m);if(!h){let C=r[l];if(!C)continue;l++,i.push({slotLabel:f,id:C.id,name:C.name,icon:C.icon,status:"info",topPct:C.pct,note:`${C.pct}% run this trinket`});continue}let g=n.find(C=>C.id===h.id&&!s.has(C.id));if(g){s.add(g.id),i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"ok",topPct:g.pct,note:null});continue}let y=r[l];y?(l++,i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"info",topPct:hs(o,h.id),note:`Switch to ${y.name} (${y.pct}%)`})):i.push({slotLabel:f,id:h.id,name:h.name,icon:h.icon??"",status:"ok",topPct:null,note:null});}return i}function Jo(t){return t.some(o=>o.status==="warn")?"warn":t.some(o=>o.status==="info")?"info":"ok"}function ea(t){let o=t?.trinkets??{},e=new Map;for(let n of [12,13])for(let i of o[n]??[]){let a=e.get(i.id);a?a.pct+=i.pct:e.set(i.id,{id:i.id,name:i.name,icon:i.icon,pct:i.pct});}return [...e.values()].sort((n,i)=>i.pct-n.pct).slice(0,2)}function ta(t){let o=t?.enchants??{};return Object.keys(o).map(Number).sort((e,n)=>e-n).reduce((e,n)=>{let i=o[n]?.[0];return i&&i.pct>=Qo&&e.push({slotName:_t(n),name:i.name||`Enchant #${i.id}`,pct:i.pct}),e},[])}function na(t){return ea(t).map((o,e)=>({slotLabel:e===0?"Trinket 1":"Trinket 2",id:o.id,name:o.name,icon:o.icon,pct:o.pct}))}function ia(t,o){return t.find(e=>e.sourceID===o)??t[0]??null}var _s=[12,13];function gs(t){return (t??"").replace(/\.jpg$/i,"")}function On(t){return t.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")}function Rn(t){let o=[],e=[];return (t??[]).forEach((n,i)=>{if(!n?.id)return;let a=typeof n.id=="string"?parseInt(n.id,10):n.id;_s.includes(i)&&o.push({slot:i,id:a,name:n.name??"",icon:gs(n.icon)});let r=n.permanentEnchant;if(r){let l=typeof r=="string"?parseInt(r,10):r;e.push({slot:i,id:l,name:n.permanentEnchantName??""});}}),{trinkets:o,enchants:e}}function Pn(){return {comparison:false,talentBuilds:[],talentStatus:{status:"unknown",note:"No talent data."},trinketRows:[],trinketStatus:"ok",benchTrinketRows:[],enchantRows:[],enchantStatus:"ok",benchEnchantRows:[]}}function vs(t,o,e,n){if(!t?.gear?.length)return fa$1("No combatant info in this log.","gear.combatant-info");let{trinkets:i,enchants:a}=Rn(t.gear),r=Uo(t.talentTree);for(let l of i)!l.name&&l.id&&(l.name=On(o[`i${l.id}`]?.name??""));for(let l of a)!l.name&&l.id&&(l.name=On(o[`e${l.id}`]?.name??""));return ri({found:true,spec:n,source_report:e,talent_key:r,trinkets:i,enchants:a})}function oa(t){return {talent_builds:t.talent_builds,trinkets:t.trinkets,enchants:t.enchants}}function xs(t,o){let e=t.talent_key??"",n=Yo(t,o),i=Zo(t,o);return {comparison:true,talentBuilds:Fn(o,e),talentStatus:An(o,e),trinketRows:i,trinketStatus:Jo(i),benchTrinketRows:[],enchantRows:n,enchantStatus:Xo(n),benchEnchantRows:[]}}function bs(t){return {comparison:false,talentBuilds:Fn(t,""),talentStatus:An(t,""),trinketRows:[],trinketStatus:"ok",benchTrinketRows:na(t),enchantRows:[],enchantStatus:"ok",benchEnchantRows:ta(t)}}var aa=(()=>{class t{source=T(Ka$1);wclApi=T(xe);async loadComparisonView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;let s=await this.fetchPlayerGear(i,a,r,e);return s.ok?ri(xs(s.value,oa(l.value))):s}async loadBenchView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri(bs(oa(i.value))):i}async fetchPlayerGear(e,n,i,a){try{let r=ia(await this.wclApi.getCombatantInfo(e,n,i),i),l={};if(r?.gear?.length){let{trinkets:s,enchants:m}=Rn(r.gear),f=[...new Set(s.filter(g=>g.id).map(g=>g.id))],h=[...new Set(m.filter(g=>g.id).map(g=>g.id))];try{l=await this.wclApi.getGameNames(f,h);}catch(g){ua$1(`GearFeatureService name resolution ${e}:${n}:${i}`,g);}}return vs(r,l,e,a)}catch(r){return ua$1(`GearFeatureService player gear ${e}:${n}:${i}`,r),ma$1(r,"gear.player-view")}}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var ys=(t,o)=>o.label,ra=(t,o)=>o.name,Cs=(t,o)=>o.talent.name,Nn=(t,o)=>o.slotLabel,la=(t,o)=>o.slotName;function ws(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("error",e.error());}}function Ss(t,o){t&1&&(oi$1(0,"div",5),nD(1,"Gear vs top parses."),bc$1());}function Ms(t,o){t&1&&(oi$1(0,"div",5),nD(1,"Top-parse gear consensus."),bc$1());}function ks(t,o){t&1&&(oi$1(0,"mat-icon",14),nD(1,"warning_amber"),bc$1());}function Ts(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"Your build"),bc$1(),aE(3,ks,2,0,"mat-icon",14),oi$1(4,"span",15),nD(5),bc$1()()),t&2){let e=_E(3);ov(3),cE(e.view().talentStatus.status==="warn"?3:-1),ov(2),Cp(e.view().talentStatus.note);}}function Es(t,o){t&1&&(oi$1(0,"span",19),nD(1,"your build"),bc$1());}function Ds(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function Is(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function Fs(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Ds,1,3,"wl-game-icon",30)(2,Is,2,1,"span",15),bc$1()),t&2){let e,n=o.$implicit;ov(),cE((e=n.spellId)?1:2,e);}}function As(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Added"),bc$1(),oi$1(3,"div",28),dE(4,Fs,3,1,"span",29,ra),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.added);}}function Os(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function Rs(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function Ps(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Os,1,3,"wl-game-icon",30)(2,Rs,2,1,"span",15),bc$1()),t&2){let e,n=o.$implicit;ov(),cE((e=n.spellId)?1:2,e);}}function Ns(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Dropped"),bc$1(),oi$1(3,"div",28),dE(4,Ps,3,1,"span",29,ra),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.dropped);}}function Ls(t,o){if(t&1&&np(0,"wl-game-icon",30),t&2){let e=_E().$implicit;tp("id",o)("icon",e.talent.icon)("name",e.talent.name);}}function $s(t,o){if(t&1&&(oi$1(0,"span",15),nD(1),bc$1()),t&2){let e=_E().$implicit;ov(),Cp(e.talent.name);}}function Bs(t,o){if(t&1&&(oi$1(0,"span",29),aE(1,Ls,1,3,"wl-game-icon",30)(2,$s,2,1,"span",15),oi$1(3,"span",31),nD(4),bc$1()()),t&2){let e,n=o.$implicit;ov(),cE((e=n.talent.spellId)?1:2,e),ov(3),bp("",n.standardRank,"\u2192",n.rank);}}function Ws(t,o){if(t&1&&(oi$1(0,"div")(1,"span",27),nD(2,"Points"),bc$1(),oi$1(3,"div",28),dE(4,Bs,5,3,"span",29,Cs),bc$1()()),t&2){let e=_E(2).$implicit;ov(4),fE(e.ranks);}}function zs(t,o){if(t&1&&(oi$1(0,"div",25),np(1,"div",17),oi$1(2,"div",26),aE(3,As,6,0,"div"),aE(4,Ns,6,0,"div"),aE(5,Ws,6,0,"div"),bc$1()()),t&2){let e=_E().$implicit;ov(3),cE(e.added.length?3:-1),ov(),cE(e.dropped.length?4:-1),ov(),cE(e.ranks.length?5:-1);}}function Gs(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",18),nD(3),aE(4,Es,2,0,"span",19),bc$1(),oi$1(5,"div",20)(6,"div",21),nD(7),bc$1(),oi$1(8,"div",22),nD(9,"of top parsers"),bc$1()(),oi$1(10,"div",23)(11,"a",24),nD(12,"View parse \u2197"),bc$1()()(),aE(13,zs,6,3,"div",25)),t&2){let e=o.$implicit;ov(3),xc$1(" ",e.label," "),ov(),cE(e.isPlayer?4:-1),ov(3),xc$1("",e.pct,"%"),ov(4),tp("href",e.link,Qd$1),ov(2),cE(e.added.length||e.dropped.length||e.ranks.length?13:-1);}}function Vs(t,o){if(t&1&&(aE(0,Ts,6,2,"div",12),dE(1,Gs,14,5,null,null,ys)),t&2){let e=_E(2);cE(e.view().comparison&&e.view().talentStatus.status!=="unknown"?0:-1),ov(),fE(e.view().talentBuilds);}}function js(t,o){t&1&&(oi$1(0,"div",11),nD(1," No talent data. "),bc$1());}function qs(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",21),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E(2).$implicit;ov(3),xc$1("",e.topPct,"%");}}function Hs(t,o){if(t&1&&(oi$1(0,"div",32)(1,"div",34)(2,"mat-icon",35),nD(3),bc$1()(),oi$1(4,"div",36),np(5,"wl-game-icon",37),oi$1(6,"div",38),nD(7),bc$1()(),oi$1(8,"div",39),aE(9,qs,6,1),bc$1(),oi$1(10,"div",40)(11,"span",41),nD(12,"Fix"),bc$1(),oi$1(13,"wl-collapsible-text"),nD(14),bc$1()()()),t&2){let e=_E().$implicit;ov(2),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),xc$1(" ",e.status==="info"?"info":"warning_amber"," "),ov(2),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),cE(e.topPct!==null?9:-1),ov(5),Cp(e.note);}}function Us(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",46),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E(2).$implicit;ov(3),xc$1("",e.topPct,"%");}}function Qs(t,o){if(t&1&&(oi$1(0,"div",33)(1,"div",34),np(2,"span",44),bc$1(),oi$1(3,"div",36),np(4,"wl-game-icon",37),oi$1(5,"div",38),nD(6),bc$1()(),oi$1(7,"div",45),aE(8,Us,6,1),bc$1(),np(9,"div",17),bc$1()),t&2){let e=_E().$implicit;ov(4),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(2),cE(e.topPct!==null?8:-1);}}function Ks(t,o){if(t&1&&aE(0,Hs,15,15,"div",32)(1,Qs,10,5,"div",33),t&2){let e=o.$implicit;cE(e.status!=="ok"?0:1);}}function Ys(t,o){if(t&1&&dE(0,Ks,2,1,null,null,Nn),t&2){let e=_E(3);fE(e.view().trinketRows);}}function Xs(t,o){if(t&1&&(oi$1(0,"span",29),np(1,"wl-game-icon",37),bc$1()),t&2){let e=o.$implicit;ov(),tp("id",e.id)("name",e.name)("icon",e.icon);}}function Zs(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),dE(3,Xs,2,3,"span",29,Nn),bc$1()),t&2){let e=_E(3);ov(3),fE(e.view().trinketRows);}}function Js(t,o){t&1&&(oi$1(0,"div",11),nD(1," No trinket data. "),bc$1());}function ed(t,o){if(t&1&&aE(0,Ys,2,0)(1,Zs,5,0,"div",12)(2,Js,2,0,"div",11),t&2){let e=_E(2);cE(e.view().trinketStatus!=="ok"?0:e.view().trinketRows.length?1:2);}}function td(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",36),np(3,"wl-game-icon",37),oi$1(4,"div",38),nD(5),bc$1()(),oi$1(6,"div",20)(7,"div",21),nD(8),bc$1(),oi$1(9,"div",22),nD(10,"of top parsers"),bc$1()(),np(11,"div",17),bc$1()),t&2){let e=o.$implicit;ov(3),tp("id",e.id)("name",e.name)("icon",e.icon),ov(2),Cp(e.slotLabel),ov(3),xc$1("",e.pct,"%");}}function nd(t,o){if(t&1&&dE(0,td,12,5,"div",16,Nn),t&2){let e=_E(3);fE(e.view().benchTrinketRows);}}function id(t,o){t&1&&(oi$1(0,"div",11),nD(1," No trinket data. "),bc$1());}function od(t,o){if(t&1&&aE(0,nd,2,0)(1,id,2,0,"div",11),t&2){let e=_E(2);cE(e.view().benchTrinketRows.length?0:1);}}function ad(t,o){if(t&1&&(oi$1(0,"span",42),nD(1,"Measured"),bc$1(),oi$1(2,"div",21),nD(3),bc$1(),oi$1(4,"div",43),nD(5,"of top parsers"),bc$1()),t&2){let e=_E().$implicit;ov(3),xc$1("",e.topPct,"%");}}function rd(t,o){if(t&1&&(oi$1(0,"div",32)(1,"div",34)(2,"mat-icon",35),nD(3),bc$1()(),oi$1(4,"div",47)(5,"span",48),nD(6),bc$1(),oi$1(7,"span",49),nD(8),bc$1()(),oi$1(9,"div",39),aE(10,ad,6,1),bc$1(),oi$1(11,"div",40)(12,"span",41),nD(13,"Fix"),bc$1(),oi$1(14,"wl-collapsible-text"),nD(15),bc$1()()()),t&2){let e=o.$implicit;ov(2),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),xc$1(" ",e.status==="info"?"info":"warning_amber"," "),ov(3),Cp(e.slotName),ov(2),Cp(e.name),ov(),yp("badge-warning",e.status==="warn")("badge-info",e.status==="info"),ov(),cE(e.topPct!==null?10:-1),ov(5),Cp(e.note);}}function ld(t,o){if(t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),oi$1(3,"span",29)(4,"span",15),nD(5),bc$1()()()),t&2){let e=_E(4);ov(5),xc$1("",e.enchantOnPlan().length," enchants");}}function sd(t,o){if(t&1&&(dE(0,rd,16,13,"div",32,la),aE(2,ld,6,1,"div",12)),t&2){let e=_E(3);fE(e.enchantIssues()),ov(2),cE(e.enchantOnPlan().length?2:-1);}}function dd(t,o){t&1&&(oi$1(0,"div",12)(1,"span",13),nD(2,"On plan"),bc$1(),oi$1(3,"span",29)(4,"span",15),nD(5,"All enchants"),bc$1()()());}function cd(t,o){t&1&&(oi$1(0,"div",11),nD(1," No enchant data. "),bc$1());}function md(t,o){if(t&1&&aE(0,sd,3,1)(1,dd,6,0,"div",12)(2,cd,2,0,"div",11),t&2){let e=_E(2);cE(e.enchantIssues().length?0:e.view().enchantRows.length?1:2);}}function pd(t,o){if(t&1&&(oi$1(0,"div",16),np(1,"div",17),oi$1(2,"div",47)(3,"span",48),nD(4),bc$1(),oi$1(5,"span",50),nD(6),bc$1()(),oi$1(7,"div",20)(8,"div",21),nD(9),bc$1(),oi$1(10,"div",22),nD(11,"of top parsers"),bc$1()(),np(12,"div",17),bc$1()),t&2){let e=o.$implicit;ov(4),Cp(e.slotName),ov(2),Cp(e.name),ov(3),xc$1("",e.pct,"%");}}function fd(t,o){if(t&1&&dE(0,pd,13,3,"div",16,la),t&2){let e=_E(3);fE(e.view().benchEnchantRows);}}function ud(t,o){t&1&&(oi$1(0,"div",11),nD(1," No enchant data. "),bc$1());}function hd(t,o){if(t&1&&aE(0,fd,2,0)(1,ud,2,0,"div",11),t&2){let e=_E(2);cE(e.view().benchEnchantRows.length?0:1);}}function _d(t,o){if(t&1&&(oi$1(0,"div",1)(1,"div",2)(2,"div",3)(3,"div",4),nD(4,"Gear"),bc$1(),aE(5,Ss,2,0,"div",5)(6,Ms,2,0,"div",5),bc$1(),oi$1(7,"div",6),nD(8,"Measured"),bc$1(),oi$1(9,"div",7),nD(10,"Fix"),bc$1()(),oi$1(11,"div",8)(12,"div",9),np(13,"div"),oi$1(14,"div",10),nD(15,"Talents"),bc$1(),np(16,"div")(17,"div"),bc$1(),aE(18,Vs,3,1)(19,js,2,0,"div",11),bc$1(),oi$1(20,"div",8)(21,"div",9),np(22,"div"),oi$1(23,"div",10),nD(24,"Trinkets"),bc$1(),np(25,"div")(26,"div"),bc$1(),aE(27,ed,3,1)(28,od,2,1),bc$1(),oi$1(29,"div",8)(30,"div",9),np(31,"div"),oi$1(32,"div",10),nD(33,"Enchants"),bc$1(),np(34,"div")(35,"div"),bc$1(),aE(36,md,3,1)(37,hd,2,1),bc$1()()),t&2){let e=_E();ov(5),cE(e.view().comparison?5:6),ov(13),cE(e.view().talentBuilds.length?18:19),ov(9),cE(e.view().comparison?27:28),ov(9),cE(e.view().comparison?36:37);}}var uh=(()=>{class t{gear=T(aa);spec=iF.required();encounterId=iF.required();report=iF("");fight=iF(0);player=iF(0);busyChange=oF();availableChange=oF();_view=So$1(Pn());view=this._view.asReadonly();_available=So$1(false);available=this._available.asReadonly();_error=So$1(null);error=this._error.asReadonly();enchantIssues=TD(()=>this.view().enchantRows.filter(e=>e.status!=="ok"));enchantOnPlan=TD(()=>this.view().enchantRows.filter(e=>e.status==="ok"));slotName=_t;statusIcon=Ko;loader=new it;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId(),i=this.report(),a=this.fight(),r=this.player(),l=i&&a&&r?this.gear.loadComparisonView(e,n,i,a,r):this.gear.loadBenchView(e,n);this.loader.run(l,{context:"gear.load",apply:s=>{s.ok?(this._error.set(null),this._view.set(s.value),this._available.set(true),this.availableChange.emit(true)):(s.error.kind==="permanent"&&ua$1(s.error.id,s.error.context),this._error.set(s.error.kind==="missing"?null:s.error),this._view.set(Pn()),this._available.set(false),this.availableChange.emit(false));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-gear"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[["heading","Gear","subtitle","Top-parse gear consensus.",3,"error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"md:col-span-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"border-t","border-[var(--border)]"],[1,"px-4","pt-3","pb-1","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"flex","items-center","gap-2","border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"icon-18","badge-warning"],[1,"text-[13px]","text-[var(--muted)]"],[1,"grid","grid-cols-[minmax(0,1fr)_auto]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-1","md:gap-y-0","items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"hidden","md:block"],[1,"min-w-0","text-sm","text-[var(--text)]"],[1,"ml-1.5","text-[10px]","uppercase","tracking-wider","text-[var(--accent)]"],[1,"text-right","leading-[1.1]","text-[var(--muted)]"],[1,"text-[15px]","font-semibold","tabular-nums"],[1,"text-[10px]","opacity-60","mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-right","md:text-left","text-[13px]","text-[var(--muted)]","leading-[1.45]","md:border-l","md:border-[var(--border)]","md:pl-[14px]"],["target","_blank","rel","noopener",1,"rounded-[3px]","border","border-[var(--accent)]/20","bg-[var(--accent)]/[0.08]","px-[7px]","py-[1px]","font-mono","text-[10px]","text-[var(--accent)]","no-underline","whitespace-nowrap","hover:brightness-125",3,"href"],[1,"px-4","pb-[10px]","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]"],[1,"md:col-span-3","flex","flex-col","gap-2.5"],[1,"block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mb-1.5"],[1,"flex","flex-wrap","items-center","gap-2"],[1,"chip-onplan"],[3,"id","icon","name"],[1,"text-[13px]","text-[var(--muted)]","ml-1","tabular-nums"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[7px]","items-start","md:items-center","border-t","border-[var(--border)]/30","opacity-55"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"icon-18"],[1,"min-w-0"],["kind","item",3,"id","name","icon"],[1,"text-[11px]","text-[var(--muted)]","mt-0.5"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"block","h-[7px]","w-[7px]","shrink-0","rounded-full","bg-[var(--success)]/60"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]","text-[var(--success)]"],[1,"text-[14px]","font-semibold","tabular-nums"],[1,"min-w-0","flex","items-baseline","gap-2"],[1,"shrink-0","w-20","whitespace-nowrap","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]"],[1,"text-sm","text-[var(--text)]","truncate"],[1,"text-sm","text-[var(--text)]"]],template:function(n,i){n&1&&aE(0,ws,1,1,"wl-load-state",0)(1,_d,38,4,"div",1),n&2&&cE(i.error()||!i.available()?0:1);},dependencies:[fv,hv,nt,Ho,tt],encapsulation:2})}return t})();function sa(t){return typeof t.x!="number"||typeof t.y!="number"?null:t.resourceActor===2?t.targetID??null:t.sourceID??null}var ca=-Math.PI/2,da=1/100,gd=1/1e3,Zt=5;function vd(t,o){let e=new Map;for(let i of t){let a=sa(i);if(a==null)continue;let r=e.get(a);r||(r=[],e.set(a,r)),r.push({t:(i.timestamp-o)/1e3,x:i.x*da,y:i.y*da,facing:typeof i.facing=="number"?i.facing*gd:void 0,mapID:typeof i.mapID=="number"?i.mapID:void 0});}let n=new Map;for(let[i,a]of e)a.sort((r,l)=>r.t-l.t),n.set(i,{id:i,samples:a});return n}function Ln(t){let o=new Map;for(let e of t.parses)for(let n of e.enemies){if(n.game_id==null)continue;let i=o.get(n.game_id);i?n.is_boss&&(i.isBoss=true):o.set(n.game_id,{gameId:n.game_id,name:n.name,isBoss:n.is_boss});}return [...o.values()].sort((e,n)=>(n.isBoss?1:0)-(e.isBoss?1:0))}function xd(t,o){let e=new Map;for(let a of o)a.gameID!=null&&e.set(a.gameID,a.id);let n=Ln(t).find(a=>a.isBoss)?.gameId;return {bossActorId:n!=null?e.get(n)??null:null,refActorByGameId:e}}function bd(t){let{positions:o,events:e,fightStartMs:n,playerId:i,enemies:a}=t,{bossActorId:r,refActorByGameId:l}=xd(o,a),s=vd(e,n);return s.get(i)?.samples.length?{timelines:s,playerId:i,bossActorId:r,refActorByGameId:l}:null}var Jt=(()=>{class t{source=T(qa$1);injector=T(ye);positions=So$1(null);live=So$1(null);error=So$1(null);overlayLoading=So$1(false);pendingOverlay=null;overlayLoaded=false;prepareSeq=0;open=So$1(false);anchorTime=So$1(0);reference=So$1({kind:"boss"});preS=So$1(Zt);postS=So$1(Zt);ready=TD(()=>!!this.positions());async loadBench(e,n){let i=await this.source.getBench(e,n);return this._applyBench(i),i}_applyBench(e){this.live.set(null),e.ok?(this.positions.set(e.value),this.error.set(null)):(e.error.kind==="permanent"&&ua$1(e.error.id,e.error.context),this.positions.set(null),this.error.set(e.error.kind==="missing"?null:e.error));}async prepare(e,n,i,a,r){let l=++this.prepareSeq;if(this.live.set(null),this._resetOverlay(),!n?.encounterID){this.positions.set(null),this.error.set(null);return}let s=await this.source.getBench(a,n.encounterID);l===this.prepareSeq&&(this._applyBench(s),s.ok&&(this.pendingOverlay={reportCode:e,fight:n,playerId:i,positions:s.value,enemies:r,seq:l},this.open()&&await this.ensureLiveOverlay()));}openAt(e){this.anchorTime.set(e.timeS),this.reference.set(e.reference??{kind:"boss"});let n=(e.windowLengthS??0)>0;this.preS.set(n?0:Zt),this.postS.set(n?e.windowLengthS:Zt),this.open.set(true),this.ensureLiveOverlay();}close(){this.open.set(false);}clear(){this.open.set(false),this.positions.set(null),this.live.set(null),this.error.set(null),this._resetOverlay();}_resetOverlay(){this.pendingOverlay=null,this.overlayLoaded=false,this.overlayLoading.set(false);}async ensureLiveOverlay(){let e=this.pendingOverlay;if(!(!e||this.overlayLoaded||this.overlayLoading())){this.overlayLoading.set(true);try{let{reportCode:n,fight:i,playerId:a,positions:r,enemies:l}=e,s=await this.fetchLiveEvents(n,i,a);if(e.seq!==this.prepareSeq)return;let m=bd({positions:r,events:s,fightStartMs:i.startTime,playerId:a,enemies:l});if(this.live.set(m),m)this.error.set(null);else {let f=fa$1("No position data for you in this pull.","map.no-player-positions");!f.ok&&f.error.kind==="permanent"&&(ua$1(f.error.id,f.error.context),this.error.set(f.error));}this.overlayLoaded=!0;}catch(n){let i=ma$1(n,"map.overlay");ua$1(`MapFeatureService.ensureLiveOverlay ${e.reportCode}:${e.fight.id}`,n),this.live.set(null),this.error.set(!i.ok&&i.error.kind!=="missing"?i.error:null);}finally{this.overlayLoading.set(false);}}}async fetchLiveEvents(e,n,i){let{id:a,startTime:r,endTime:l}=n,s=this.injector.get(xe),[m,f]=await Promise.all([s.getAllEvents(e,a,"Casts",r,l,i,true),s.getAllEvents(e,a,"Casts",r,l,void 0,true,"Enemies")]);return [...m,...f]}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var yd=["*"];function Cd(t,o){if(t&1&&(oi$1(0,"span",4),nD(1),bc$1()),t&2){let e=_E();ov(),Cp(e.loadingText());}}var ma=(()=>{class t{heading=iF.required();loadingText=iF("");closeLabel=iF.required();closed=oF();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-flyover-panel"]],inputs:{heading:[1,"heading"],loadingText:[1,"loadingText"],closeLabel:[1,"closeLabel"]},outputs:{closed:"closed"},ngContentSelectors:yd,decls:11,vars:3,consts:[[1,"fixed","inset-0","z-50","flex","flex-col","bg-[var(--bg)]","md:inset-y-0","md:left-auto","md:right-0","md:w-[460px]","md:border-l","md:border-[var(--border)]","md:shadow-2xl"],[1,"flex","items-center","justify-between","border-b","border-[var(--border)]","px-4","py-2"],[1,"flex","items-center","gap-2"],[1,"font-semibold"],[1,"text-[13px]","text-[var(--muted)]"],["mat-icon-button","",3,"click"],[1,"flex-1","overflow-y-auto","p-4"]],template:function(n,i){n&1&&(SE(),oi$1(0,"div",0)(1,"div",1)(2,"div",2)(3,"span",3),nD(4),bc$1(),aE(5,Cd,2,1,"span",4),bc$1(),oi$1(6,"button",5),cp("click",function(){return i.closed.emit()}),oi$1(7,"mat-icon"),nD(8,"close"),bc$1()()(),oi$1(9,"div",6),NE(10),bc$1()()),n&2&&(ov(4),Cp(i.heading()),ov(),cE(i.loadingText()?5:-1),ov(),ep("aria-label",i.closeLabel()));},dependencies:[Ib,Wd$1,fv,hv],encapsulation:2})}return t})();var en=1/100,wd=1/1e3;function Sd(t,o){let e=(o-t)%(2*Math.PI);return e>Math.PI&&(e-=2*Math.PI),e<=-Math.PI&&(e+=2*Math.PI),e}function $n(t,o){return t.mapID==null||o.mapID==null||t.mapID===o.mapID}function Ee(t,o,e=3){let n=t?.samples;if(!n||!n.length)return null;if(o<=n[0].t)return o<n[0].t-e?null:U($({},n[0]),{t:o});let i=n[n.length-1];if(o>=i.t)return o>i.t+e?null:U($({},i),{t:o});let a=0,r=n.length-1;for(;a<r;){let g=a+r>>1;n[g].t<o?a=g+1:r=g;}let l=n[a],s=n[a-1],m=l.t-s.t,f=m>0?(o-s.t)/m:0;if(s.mapID!==l.mapID)return U($({},f<.5?s:l),{t:o});let h;return s.facing!=null&&l.facing!=null?h=s.facing+Sd(s.facing,l.facing)*f:h=s.facing??l.facing,{t:o,x:s.x+(l.x-s.x)*f,y:s.y+(l.y-s.y)*f,facing:h,mapID:s.mapID}}function gt(t,o,e=0){let n=t.x-o.x,i=t.y-o.y,a=(o.facing??Math.PI/2)+ca,r=Math.cos(a),l=Math.sin(a),s=n*r+i*l,m=n*l-i*r,f=Math.hypot(n,i),h=Math.atan2(m,s)*180/Math.PI;return {t:e,fwd:s,right:m,dist:f,angleDeg:h,mapID:t.mapID}}function Md(t,o){let e=o.map(([n,i,a,r,l])=>({t:n,x:i*en,y:a*en,facing:r==null?void 0:r*wd,mapID:l??void 0}));return {id:t,samples:e}}function kd(t,o){let e=o.map(([n,i,a,r])=>({t:n,x:i*en,y:a*en,mapID:r??void 0}));return {id:t,samples:e}}function Td(t,o){return o.kind==="boss"?(t.enemies.find(n=>n.is_boss)??t.enemies[0])?.samples??null:t.enemies.find(e=>e.game_id===o.gameId)?.samples??null}function pa(t,o){let e=[];for(let n of t.parses){let i=Td(n,o);i&&e.push({player:kd(-1,n.player),ref:Md(-2,i)});}return e}function Bn(t,o){let e=[];for(let{player:n,ref:i}of t){let a=Ee(i,o),r=Ee(n,o);a&&r&&$n(r,a)&&e.push(gt(r,a,o));}return e}function fa(t,o,e,n,i){let a=[];for(let{player:r,ref:l}of t){let s=[];for(let m=o-e;m<=o+n+1e-6;m+=i){let f=Ee(l,m),h=Ee(r,m);f&&h&&$n(h,f)&&s.push(gt(h,f,m));}s.length&&a.push(s);}return a}function ua(t,o,e,n,i,a,r){let l=[],s=e.get(o),m=e.get(t);for(let f=n-i;f<=n+a+1e-6;f+=r){let h=Ee(s,f),g=Ee(m,f);h&&g&&$n(g,h)&&l.push(gt(g,h,f));}return l}var Ed=["canvas"],Dd=(t,o)=>o.gameId;function Id(t,o){t&1&&np(0,"wl-load-state",1),t&2&&tp("error",o);}function Fd(t,o){t&1&&(oi$1(0,"p",2),nD(1," No position data for this encounter. "),bc$1());}function Ad(t,o){if(t&1&&(oi$1(0,"mat-option",19),nD(1),bc$1()),t&2){let e=_E().$implicit;tp("value",e.gameId),ov(),Cp(e.name);}}function Od(t,o){if(t&1&&aE(0,Ad,2,2,"mat-option",19),t&2){let e=o.$implicit;cE(e.isBoss?-1:0);}}function Rd(t,o){t&1&&(oi$1(0,"span",10),nD(1,"\u25C6 you"),bc$1());}function Pd(t,o){if(t&1){let e=vE();oi$1(0,"div",3)(1,"mat-form-field",4)(2,"mat-label"),nD(3,"Reference"),bc$1(),oi$1(4,"mat-select",5),cp("selectionChange",function(i){tu(e);let a=_E();return nu(a.onRefChange(i.value))}),oi$1(5,"mat-option",6),nD(6,"Boss"),bc$1(),dE(7,Od,1,1,null,null,Dd),bc$1()()(),oi$1(9,"div",7),np(10,"canvas",8,0),oi$1(12,"div",9),aE(13,Rd,2,0,"span",10),oi$1(14,"span",11),nD(15,"\u25CF top parses"),bc$1(),oi$1(16,"span",12),nD(17,"\u25EF top-parse centre"),bc$1(),oi$1(18,"span",13),nD(19,"\u25B2 reference (facing up)"),bc$1()()(),oi$1(20,"div",14)(21,"button",15),cp("click",function(){tu(e);let i=_E();return nu(i.togglePlay())}),oi$1(22,"mat-icon"),nD(23),bc$1()(),oi$1(24,"div",16)(25,"input",17),cp("input",function(i){tu(e);let a=_E();return nu(a.onScrub(i.target.valueAsNumber))}),bc$1(),oi$1(26,"div",18)(27,"span"),nD(28),mD(29,"formatDuration"),bc$1(),oi$1(30,"span"),nD(31),mD(32,"formatDuration"),bc$1(),oi$1(33,"span"),nD(34),mD(35,"formatDuration"),bc$1()()()();}if(t&2){let e=_E();ov(4),tp("value",e.refValue()),ov(3),fE(e.refEnemies()),ov(6),cE(e.live()?13:-1),ov(8),ep("aria-label",e.playing()?"Pause":"Play"),ov(2),Cp(e.playing()?"pause":"play_arrow"),ov(2),tp("min",e.windowStart())("max",e.windowEnd())("value",e.scrubT()),ov(3),Cp(vD(29,10,e.windowStart())),ov(3),xc$1("anchor ",vD(32,12,e.anchorTime())),ov(3),Cp(vD(35,14,e.windowEnd()));}}var ha=.5,Nd=.1,_a=(()=>{class t{map=T(Jt);positions=this.map.positions;live=this.map.live;anchorTime=this.map.anchorTime;loadError=TD(()=>{let e=this.map.error();return e&&e.kind!=="missing"?e:null});selector=So$1({kind:"boss"});scrubT=So$1(0);playing=So$1(false);rafId=null;lastFrameMs=0;canvas=sF("canvas");refEnemies=TD(()=>{let e=this.positions();return e?Ln(e):[]});refValue=TD(()=>{let e=this.selector();return e.kind==="boss"?"boss":e.gameId});preS=this.map.preS;postS=this.map.postS;windowStart=TD(()=>this.anchorTime()-this.preS());windowEnd=TD(()=>this.anchorTime()+this.postS());parseTimelines=TD(()=>{let e=this.positions();return e?pa(e,this.selector()):[]});benchTrails=TD(()=>fa(this.parseTimelines(),this.anchorTime(),this.preS(),this.postS(),ha));liveRefId=TD(()=>{let e=this.live();if(!e)return null;let n=this.selector();return n.kind==="boss"?e.bossActorId:e.refActorByGameId.get(n.gameId)??null});liveTrail=TD(()=>{let e=this.live(),n=this.liveRefId();return !e||n==null?[]:ua(e.playerId,n,e.timelines,this.anchorTime(),this.preS(),this.postS(),ha)});readout=TD(()=>{if(!this.positions())return null;let e=this.scrubT(),n=Bn(this.parseTimelines(),e),i=null;n.length&&(i={fwd:n.reduce((r,l)=>r+l.fwd,0)/n.length,right:n.reduce((r,l)=>r+l.right,0)/n.length});let a=this.livePlayerAt(e);return {centroid:i,player:a}});constructor(){T(Le).onDestroy(()=>this.stopTimer()),Cu(()=>{this.anchorTime(),this.selector.set(this.map.reference()),this.pause(),this.scrubT.set(this.anchorTime());}),Cu(()=>{let e=this.canvas()?.nativeElement;this.benchTrails(),this.liveTrail(),this.scrubT(),this.readout(),e&&this.draw(e);});}onRefChange(e){this.selector.set(e==="boss"?{kind:"boss"}:{kind:"enemy",gameId:e});}onScrub(e){this.pause(),this.scrubT.set(e);}togglePlay(){this.playing()?this.pause():this.play();}play(){this.scrubT()>=this.windowEnd()-1e-6&&this.scrubT.set(this.windowStart()),this.playing.set(true),this.stopTimer(),this.lastFrameMs=0;let e=n=>{let i=this.lastFrameMs?Math.min((n-this.lastFrameMs)/1e3,Nd):0;this.lastFrameMs=n;let a=this.scrubT()+i;this.scrubT.set(a>=this.windowEnd()?this.windowStart():a),this.rafId=requestAnimationFrame(e);};this.rafId=requestAnimationFrame(e);}pause(){this.playing.set(false),this.stopTimer();}stopTimer(){this.rafId!=null&&(cancelAnimationFrame(this.rafId),this.rafId=null);}livePlayerAt(e){let n=this.live(),i=this.liveRefId();if(!n||i==null)return null;let a=Ee(n.timelines.get(i),e),r=Ee(n.timelines.get(n.playerId),e);return !a||!r||a.mapID!=null&&r.mapID!=null&&a.mapID!==r.mapID?null:gt(r,a,e)}draw(e){let n=e.getContext("2d");if(!n)return;let i=globalThis.devicePixelRatio||1,a=e.clientWidth||600,r=e.clientHeight||420,l=Math.round(a*i),s=Math.round(r*i);(e.width!==l||e.height!==s)&&(e.width=l,e.height=s),n.setTransform(i,0,0,i,0,0),n.clearRect(0,0,a,r);let m=a/2,f=r/2,h=Math.min(a,r)/2-28,g=this.benchTrails(),y=this.liveTrail(),C=this.readout(),E=10;for(let R of g)for(let K of R)E=Math.max(E,K.dist);for(let R of y)E=Math.max(E,R.dist);E=Math.ceil(E/5)*5+5;let z=h/E,X=R=>[m+R.right*z,f-R.fwd*z],De=getComputedStyle(e),ne=R=>De.getPropertyValue(R).trim(),ye=ne("--gold"),st=ne("--border"),Ie=ne("--muted"),Re=ne("--critical"),dt=ne("--accent"),fn=ne("--map-dot-outline");n.strokeStyle=st,n.fillStyle=Ie,n.font="11px system-ui, sans-serif",n.lineWidth=1;for(let R=5;R<=E;R+=5)n.beginPath(),n.arc(m,f,R*z,0,2*Math.PI),n.stroke(),n.fillText(`${R}y`,m+3,f-R*z+12);n.fillStyle=Re,n.beginPath(),n.moveTo(m,f-9),n.lineTo(m-7,f+6),n.lineTo(m+7,f+6),n.closePath(),n.fill();let un=this.scrubT();n.strokeStyle=Ie,n.globalAlpha=.25,n.lineWidth=1.5;for(let R of g)n.beginPath(),R.forEach((K,se)=>{let[ct,ni]=X(K);se&&K.mapID===R[se-1].mapID?n.lineTo(ct,ni):n.moveTo(ct,ni);}),n.stroke();n.globalAlpha=1;let Ce=Bn(this.parseTimelines(),un);n.fillStyle=Ie;for(let R of Ce){let[K,se]=X(R);n.beginPath(),n.arc(K,se,3,0,2*Math.PI),n.fill();}if(C?.centroid){let[R,K]=X(C.centroid);n.strokeStyle=dt,n.lineWidth=2,n.beginPath(),n.arc(R,K,7,0,2*Math.PI),n.stroke();}if(y.length&&(n.strokeStyle=ye,n.globalAlpha=.5,n.lineWidth=2,n.beginPath(),y.forEach((R,K)=>{let[se,ct]=X(R);K&&R.mapID===y[K-1].mapID?n.lineTo(se,ct):n.moveTo(se,ct);}),n.stroke(),n.globalAlpha=1),C?.player){let[R,K]=X(C.player),se=5;n.fillStyle=ye,n.beginPath(),n.moveTo(R,K-se),n.lineTo(R+se,K),n.lineTo(R,K+se),n.lineTo(R-se,K),n.closePath(),n.fill(),n.strokeStyle=fn,n.lineWidth=1,n.stroke();}}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-map-canvas"]],viewQuery:function(n,i){n&1&&pp(i.canvas,Ed,5),n&2&&kE();},decls:3,vars:1,consts:[["canvas",""],[3,"error"],[1,"text-[13px]","text-[var(--muted)]"],[1,"mb-2","flex","flex-wrap","items-center","justify-end","gap-2"],["appearance","outline",1,"w-[200px]"],[3,"selectionChange","value"],["value","boss"],[1,"relative","rounded-lg","border","border-[var(--border)]","bg-[var(--surface-alt)]"],[1,"block","h-[420px]","w-full"],[1,"pointer-events-none","absolute","bottom-2","left-2","flex","flex-col","gap-0.5","text-[10px]"],[1,"text-[var(--gold)]"],[1,"text-[var(--muted)]"],[1,"text-[var(--accent)]"],[1,"text-[var(--critical)]"],[1,"mt-2","flex","items-center","gap-2"],["mat-icon-button","",3,"click"],[1,"min-w-0","flex-1"],["type","range","step","0.25",1,"block","w-full","accent-[var(--gold)]",3,"input","min","max","value"],[1,"mt-1","flex","justify-between","text-[10px]","text-[var(--muted)]"],[3,"value"]],template:function(n,i){if(n&1&&aE(0,Id,1,1,"wl-load-state",1)(1,Fd,2,0,"p",2)(2,Pd,36,16),n&2){let a;cE((a=i.loadError())?0:i.positions()?2:1,a);}},dependencies:[Ib,Wd$1,fv,hv,jt,Vt,ht,Po,Ro,Je,tt,Qt],encapsulation:2})}return t})();function Ld(t,o){if(t&1){let e=vE();oi$1(0,"wl-flyover-panel",1),cp("closed",function(){tu(e);let i=_E();return nu(i.map.close())}),np(1,"wl-map-canvas"),bc$1();}if(t&2){let e=_E();tp("loadingText",e.map.overlayLoading()?"Loading your trail...":"");}}var Jh=(()=>{class t{map=T(Jt);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-map-panel"]],decls:1,vars:1,consts:[["heading","Positioning","closeLabel","Close map",3,"loadingText"],["heading","Positioning","closeLabel","Close map",3,"closed","loadingText"]],template:function(n,i){n&1&&aE(0,Ld,2,1,"wl-flyover-panel",0),n&2&&cE(i.map.open()?0:-1);},dependencies:[ma,_a],encapsulation:2})}return t})();var t_=(()=>{class t{transform(e){return e?e.replace(/([A-Z])/g," $1").trim():""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"formatSpec",type:t,pure:true})}return t})();var o_=(()=>{class t{transform(e){return e?Yb(e):""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"specIcon",type:t,pure:true})}return t})();var l_=(()=>{class t{transform(e){return Gb(e??"")}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"classIcon",type:t,pure:true})}return t})();function ga(t){return !Number.isInteger(t)||t<=0?"":`https://assets.rpglogs.com/img/warcraft/bosses/${t}-icon.jpg`}var m_=(()=>{class t{transform(e){return e?ga(e):""}static \u0275fac=function(n){return new(n||t)};static \u0275pipe=WI({name:"bossIcon",type:t,pure:true})}return t})();function $d(t,o){if(t&1&&np(0,"img",0),t&2){let e=_E();tp("ngSrc",o)("width",e.size())("height",e.size())("alt",e.alt());}}var g_=(()=>{class t{src=iF.required();alt=iF.required();size=iF(20);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-art-icon"]],hostAttrs:[1,"inline-flex","items-center","shrink-0","align-middle"],inputs:{src:[1,"src"],alt:[1,"alt"],size:[1,"size"]},decls:1,vars:1,consts:[[1,"block","rounded-sm",3,"ngSrc","width","height","alt"]],template:function(n,i){if(n&1&&aE(0,$d,1,4,"img",0),n&2){let a;cE((a=i.src())?0:-1,a);}},dependencies:[lf],encapsulation:2})}return t})();var va="wl.sel.postRaid",xa="wl.sel.preFight",ba="wl.sel.northernSky",b_=(()=>{class t{savePostRaid(e){this._save(va,e,"SelectionStore.savePostRaid");}loadPostRaid(){return this._load(va,"SelectionStore.loadPostRaid")}savePreFight(e){this._save(xa,e,"SelectionStore.savePreFight");}loadPreFight(){return this._load(xa,"SelectionStore.loadPreFight")}saveNorthernSky(e){this._save(ba,e,"SelectionStore.saveNorthernSky");}loadNorthernSky(){return this._load(ba,"SelectionStore.loadNorthernSky")}_save(e,n,i){try{localStorage.setItem(e,JSON.stringify(n));}catch(a){ua$1(i,a);}}_load(e,n){try{let i=localStorage.getItem(e);return i?JSON.parse(i):null}catch(i){return ua$1(n,i),null}}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function tn(t,o){return t==null||o==null?NaN:t<o?-1:t>o?1:t>=o?0:NaN}function*ya(t,o){for(let e of t)e!=null&&(e=+e)>=e&&(yield e);}function Ca(t=tn){if(t===tn)return Wn;if(typeof t!="function")throw new TypeError("compare is not a function");return (o,e)=>{let n=t(o,e);return n||n===0?n:(t(e,e)===0)-(t(o,o)===0)}}function Wn(t,o){return (t==null||!(t>=t))-(o==null||!(o>=o))||(t<o?-1:t>o?1:0)}function nn(t,o){let e;for(let n of t)n!=null&&(e<n||e===void 0&&n>=n)&&(e=n);return e}function on(t,o){let e;for(let n of t)n!=null&&(e>n||e===void 0&&n>=n)&&(e=n);return e}function an(t,o,e=0,n=1/0,i){if(o=Math.floor(o),e=Math.floor(Math.max(0,e)),n=Math.floor(Math.min(t.length-1,n)),!(e<=o&&o<=n))return t;for(i=i===void 0?Wn:Ca(i);n>e;){if(n-e>600){let s=n-e+1,m=o-e+1,f=Math.log(s),h=.5*Math.exp(2*f/3),g=.5*Math.sqrt(f*h*(s-h)/s)*(m-s/2<0?-1:1),y=Math.max(e,Math.floor(o-m*h/s+g)),C=Math.min(n,Math.floor(o+(s-m)*h/s+g));an(t,o,y,C,i);}let a=t[o],r=e,l=n;for(vt(t,e,o),i(t[n],a)>0&&vt(t,e,n);r<l;){for(vt(t,r,l),++r,--l;i(t[r],a)<0;)++r;for(;i(t[l],a)>0;)--l;}i(t[e],a)===0?vt(t,e,l):(++l,vt(t,l,n)),l<=o&&(e=l+1),o<=l&&(n=l-1);}return t}function vt(t,o,e){let n=t[o];t[o]=t[e],t[e]=n;}function zn(t,o,e){if(t=Float64Array.from(ya(t)),!(!(n=t.length)||isNaN(o=+o))){if(o<=0||n<2)return on(t);if(o>=1)return nn(t);var n,i=(n-1)*o,a=Math.floor(i),r=nn(an(t,a).subarray(0,a+1)),l=on(t.subarray(a+1));return r+(l-r)*(i-a)}}function at(t,o){return zn(t,.5)}function re(t,o=1){return Math.round(t*10**o)/10**o}function rt(t,o,e){let n=t.get(o);return n===void 0&&(n=e(),t.set(o,n)),n}function lt(t,o,e,n=2){return t>o+n*e}function Sa(t,o,e,n=2){return Math.abs(t-o)>n*e}function Ma(t,o,e,n=2){return t<o-n*e}function ka(t,o){return Math.max(0,(1-t/o)*100)}function Ta(t){return t.length===0?0:t.reduce((o,e)=>Math.abs(e)<Math.abs(o)?e:o)}function rn(t,o){let e=t/60,n=Math.round(o.avg*e),i=Math.max(0,Math.round(n-o.stddev*e));return {expected:n,floor:i}}function G(t){return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(Math.floor(t%60)).padStart(2,"0")}`}var wa={critical:0,warning:1,info:2,hold_suggestion:2,success:3};function xt(t){t.sort((o,e)=>(wa[o.severity]??4)-(wa[e.severity]??4));}function ln(t,o,e){let n=[];if(!o.length)return n;for(let[i,a]of Object.entries(e)){let r=parseInt(i,10)-1;if(r<1||r>=o.length)continue;o[r]-o[r-1]-a.effective_cd_s<a.delay_s-a.band_s&&n.push({severity:"info",category:"hold_suggestion",timestamp_ms:Math.round(o[r]*1e3),measured:{value:G(o[r]),unit:`top ${G(a.target_s)}`},message:`${t} cast ${i} at ${G(o[r])}. ${a.count}/${a.total_samples} top parses hold to ${G(a.target_s)}.`,details:{remedy:`Hold ${t} to ${G(a.target_s)}.`,cd_name:t},occurrences:[]});}return n}function Gn(t,o){let e=new Map;for(let n of t){let i=n.abilityGameID;if(i==null)continue;let a=n.timestamp-o;if(n.type==="applybuff"||n.type==="applydebuff")rt(e,i,()=>[]).push([a,null]);else if(n.type==="removebuff"||n.type==="removedebuff"){let r=e.get(i)??[];for(let l=r.length-1;l>=0;l--)if(r[l][1]==null){r[l][1]=a;break}}}return e}function sn(t,o,e){return (t.get(o)??[]).some(([n,i])=>e>=n&&(i==null||e<=i))}function Ea(t,o,e){return (t.get(o)??[]).some(([n,i])=>e>n&&(i==null||e<=i))}function Da(t,o,e){let n=[];for(let i of t){if(i.abilityGameID!==e)continue;let a=i.timestamp-o;i.type==="applybuff"||i.type==="applydebuff"?n.push([a,i.stack??1]):i.type.endsWith("buffstack")||i.type.endsWith("debuffstack")?n.push([a,i.stack??0]):(i.type==="removebuff"||i.type==="removedebuff")&&n.push([a,0]);}return n}function Ia(t,o){let e=0;for(let[n,i]of t){if(n>=o)break;e=i;}return e}function Vn(t,o,e){let n=new Map;for(let i of t){if(i.abilityGameID!==e)continue;let a=i.timestamp-o,r=rt(n,ot(i),()=>[]),l=r.length&&r[r.length-1].endMs==null?r[r.length-1]:null;i.type==="applybuff"||i.type==="applydebuff"?l||r.push({startMs:a,endMs:null,endedByRefresh:false}):i.type==="refreshbuff"||i.type==="refreshdebuff"?(l&&(l.endMs=a,l.endedByRefresh=true),r.push({startMs:a,endMs:null,endedByRefresh:false})):(i.type==="removebuff"||i.type==="removedebuff")&&l&&(l.endMs=a);}return n}function Fa(t,o,e){if(e<=0)return 0;let n=(t.get(o)??[]).map(([r,l])=>[Math.max(0,r),Math.min(e,l??e)]).filter(([r,l])=>l>r).sort((r,l)=>r[0]-l[0]),i=0,a=-1;for(let[r,l]of n){let s=Math.max(r,a);l>s&&(i+=l-s,a=l);}return i/e*100}var Bd=3,Wd=1,zd=2,Gd=2,Vd=.25,dn=24;function Aa(t,o){let e=t.length/o;return Array.from({length:o},(n,i)=>t[Math.floor(i*e)])}function ze(t){if(t.length<=dn)return t;let o=t.filter(i=>!i.ok);if(o.length>=dn)return Aa(o,dn);let e=t.filter(i=>i.ok),n=new Set([...o,...Aa(e,dn-o.length)]);return t.filter(i=>n.has(i))}function jd(t,o){let e={};for(let n of t)n.type==="cast"&&n.abilityGameID&&(e[n.abilityGameID]??=[]).push((n.timestamp-o)/1e3);return e}function Oa(t){let o;return ()=>o??=t()}function jn(t){let o=new Map;return e=>rt(o,e,()=>t(e))}function qd(t){return t.map(o=>[o.timestamp,ot(o)]).sort((o,e)=>o[0]-e[0])}function Hd(t){let o=new Map;for(let e of t)e.resourceActor!==zd||e.hitPoints==null||!e.maxHitPoints||rt(o,ot(e),()=>[]).push([e.timestamp,e.hitPoints/e.maxHitPoints]);for(let e of o.values())e.sort((n,i)=>n[0]-i[0]);return o}function Ra(t,o){let e=0,n=t;for(;e<n;){let i=e+n>>1;o(i)?n=i:e=i+1;}return e}function Pa(t){let o=(t.fEnd-t.fStart)/1e3,e=t.deaths.map(i=>(i.timestamp-t.fStart)/1e3),n=Oa(()=>Hd(t.damage));return {castTimes:jd(t.casts,t.fStart),castEvents:t.casts,fStart:t.fStart,fightDurationS:o,aliveDurationS:e.length?Math.min(...e):o,selfAuras:Gn(t.buffs,t.fStart),targetAuras:Gn(t.debuffs,t.fStart),stacks:jn(i=>Da(t.buffs,t.fStart,i)),selfSpans:jn(i=>Vn(t.buffs,t.fStart,i)),targetSpans:jn(i=>Vn(t.debuffs,t.fStart,i)),damageIndex:Oa(()=>qd(t.damage)),targetHealth:i=>n().get(i)??[]}}function Ge(t,o){return o==="up"?t.value+t.band:Math.max(0,t.value-t.band)}function cn(t,o){return t.castTimes[o]?.length??0}function Ud(t,o,e){return e==="either"?Math.abs(t)<=o:e==="before"?t>=0&&t<=o:t<=0&&-t<=o}function Na(t,o){let e=t.position??"before",n=o[t.required_spell_id]??[];return [...o[t.spell_id]??[]].sort((i,a)=>i-a).map(i=>{let a=n.map(r=>i-r).filter(r=>e==="either"||(e==="before"?r>=0:r<=0)).map(Math.abs);return a.length?Math.min(...a):null})}function Qd(t,o,e){let n=[...o[t.spell_id]??[]].sort((a,r)=>a-r),i=Na(t,o);return ze(n.map((a,r)=>{let l=i[r],s=l!=null&&l<=e;return {atMs:Math.round(a*1e3),ok:s,label:l==null?"none":`${re(l,0)}s`,detail:l==null?`No ${t.required_spell_name} paired with this cast.`:`${t.required_spell_name} landed ${re(l,0)}s from this cast.`}}))}function Kd(t,o,e,n,i){let a=Ge(e,"up"),r=t.position??"before",l=o.castTimes,s=[...l[t.spell_id]??[]].sort((h,g)=>h-g),m=l[t.required_spell_id]??[],f=s.filter(h=>!m.some(g=>Ud(h-g,a,r)));return f.length?{severity:n,category:"rule_violation",timestamp_ms:Math.round(f[0]*1e3),label:`${t.spell_name} without ${t.required_spell_name}`,message:`${t.spell_name} without ${t.required_spell_name} inside ${Math.round(a)}s: ${f.length} of ${s.length} cast(s).`,measured:{value:`${f.length} / ${s.length}`,unit:"cast(s)"},details:i?{remedy:i}:void 0,occurrences:Qd(t,l,a),occurrenceTarget:`field pairs inside ${re(a,0)}s`}:null}function qn(t,o){return [...o[t.anchor_spell_id]??[]].sort((e,n)=>e-n).slice(1)}function Yd(t,o,e,n){let i=e.map(a=>({atMs:Math.round(a*1e3),ok:true,label:t.anchor_spell_name,marker:true,detail:`${t.anchor_spell_name} cast here.`}));return t.spell_ids.forEach((a,r)=>{let l=t.spell_names?.[r]??String(a);for(let s of o.castTimes[a]??[]){let m=e.filter(g=>g>s).sort((g,y)=>g-y)[0],f=m!=null?m-s:null,h=f==null||f>n;i.push({atMs:Math.round(s*1e3),ok:h,label:f==null?"clear":`${re(f,0)}s`,detail:f==null?`${l} cast with no ${t.anchor_spell_name} ahead to hold for.`:`${l} cast ${re(f,0)}s before ${t.anchor_spell_name}.`});}}),i.sort((a,r)=>(a.atMs??0)-(r.atMs??0)),ze(i)}function Xd(t,o,e,n,i){let a=Ge(e,"down"),r=qn(t,o.castTimes),l=t.spell_ids.flatMap((f,h)=>{let g=t.spell_names?.[h]??String(f);return r.flatMap(y=>(o.castTimes[f]??[]).filter(C=>C>=y-a&&C<y).map(C=>({spellName:g,castTime:C})))});if(!l.length)return null;let s=l.reduce((f,h)=>Math.min(f,h.castTime),1/0),m=[...new Set(l.map(f=>f.spellName))].join("/");return {severity:n,category:"rule_violation",timestamp_ms:Math.round(s*1e3),label:`${m} held before ${t.anchor_spell_name}`,message:`${m} used in the ${Math.round(a)}s the field keeps clear before ${t.anchor_spell_name}: ${l.length} charge(s).`,measured:{value:`${l.length}`,unit:"charge(s)"},details:i?{remedy:i}:void 0,occurrences:Yd(t,o,r,a),occurrenceTarget:`gap to ${t.anchor_spell_name} at cast`}}function Zd(t,o,e){return ze(e.map(n=>{let i=sn(o.selfAuras,t.buff_spell_id,n*1e3);return {atMs:Math.round(n*1e3),ok:i===(t.require==="inside"),label:i?"up":"down",detail:`${t.buff_spell_name} was ${i?"up":"down"} at this cast.`}}))}function Jd(t,o,e,n){let i=[...o.castTimes[t.spell_id]??[]].sort((l,s)=>l-s),a=i.filter(l=>sn(o.selfAuras,t.buff_spell_id,l*1e3)!==(t.require==="inside"));if(!a.length)return null;let r=t.require==="inside"?"without":"during";return {severity:e,category:"rule_violation",timestamp_ms:Math.round(a[0]*1e3),label:`${t.spell_name} ${r} ${t.buff_spell_name}`,message:`${t.spell_name} ${r} ${t.buff_spell_name}: ${a.length} of ${i.length} cast(s).`,measured:{value:`${a.length} / ${i.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0,occurrences:Zd(t,o,i),occurrenceTarget:"buff state at cast"}}function Hn(t,o){let e=t.on==="target"?o.targetAuras:o.selfAuras;return Fa(e,t.aura_spell_id,o.aliveDurationS*1e3)}function ec(t,o,e){let n=(t.get(o)??[]).map(([a,r])=>[Math.max(0,a),Math.min(e,r??e)]).filter(([a,r])=>r>a).sort((a,r)=>a[0]-r[0]),i=[];for(let[a,r]of n){let l=i[i.length-1];l&&a<=l[1]?l[1]=Math.max(l[1],r):i.push([a,r]);}return i}var tc=3,nc=1e3;function ic(t,o){let e=[],n=0;for(let[i,a]of t)i>n&&e.push([n,i]),n=Math.max(n,a);return n<o&&e.push([n,o]),e.filter(([i,a])=>a-i>=nc).sort((i,a)=>a[1]-a[0]-(i[1]-i[0])).slice(0,tc).sort((i,a)=>i[0]-a[0])}function oc(t,o,e,n,i){let a=Ge(e,"down"),r=Hn(t,o);if(r<=0||r>=a)return null;let l=t.on==="target"?o.targetAuras:o.selfAuras,s=o.aliveDurationS*1e3,m=ec(l,t.aura_spell_id,s),f=ic(m,s);return {severity:n,category:"rule_violation",label:`${t.aura_spell_name} uptime`,message:`${t.aura_spell_name} up ${Math.round(r)}% of the fight; the top parses hold ${Math.round(e.value)}%.`,measured:{value:`${Math.round(r)} / ${Math.round(e.value)}`,unit:"% uptime"},details:i?{remedy:i}:void 0,occurrences:f.map(([h,g])=>({atMs:Math.round(h),ok:false,label:`${re((g-h)/1e3,0)}s`,detail:`${t.aura_spell_name} was down here for ${re((g-h)/1e3,0)}s.`})),timeline:{segmentsMs:m,fightDurationMs:s}}}function La(t,o,e){let n=Object.values(o.castTimes).flat();if(!n.length)return null;let i=Math.min(...n),a=i+e,r=i,l=0;for(let s of t.spell_ids){let m=(o.castTimes[s]??[]).filter(f=>f>=r&&f<=a).sort((f,h)=>f-h)[0];if(m==null)break;r=m,l++;}return {pullS:i,matched:l,completedS:l===t.spell_ids.length?r-i:null}}function ac(t,o,e,n){let i=e;return t.spell_ids.map(a=>{let r=(o.castTimes[a]??[]).filter(l=>l>=i&&l<=n).sort((l,s)=>l-s)[0];return r==null?{ok:false}:(i=r,{ok:true,atMs:Math.round(r*1e3)})})}function rc(t,o,e,n){let i=ac(t,o,e,n);return t.spell_ids.map((a,r)=>{let l=t.spell_names[r]??String(a),s=i[r];return s.ok?{atMs:s.atMs,ok:true,label:l,detail:`${l} landed on time in its slot.`}:{ok:false,label:l,note:"not reached",detail:`${l} was never reached in the opener window.`}})}function lc(t,o,e,n,i){let a=Ge(e,"up"),r=La(t,o,a);return !r||r.completedS!=null?null:{severity:n,category:"rule_violation",timestamp_ms:Math.round(r.pullS*1e3),label:`Opener: ${t.spell_names.join(" > ")}`,message:`Opener reached ${r.matched} of ${t.spell_ids.length} steps in the ${Math.round(a)}s the top parses take.`,measured:{value:`${r.matched} / ${t.spell_ids.length}`,unit:"step(s)"},details:i?{remedy:i}:void 0,occurrences:rc(t,o,r.pullS,r.pullS+a),occurrenceTarget:`expected order: ${t.spell_names.join(" > ")}`}}function sc(t,o,e){let n=o+e*1e3,i=n+Bd*1e3,a=new Set;for(let r=Ra(t.length,l=>t[l][0]>=n);r<t.length&&t[r][0]<=i;r++)a.add(t[r][1]);return a.size}function Un(t,o){return [...o.castTimes[t.spell_id]??[]].sort((e,n)=>e-n).map(e=>({timeS:e,targets:sc(o.damageIndex(),o.fStart,e)})).filter(({targets:e})=>e>0)}var $a={quantize:Math.round,format:t=>String(Math.round(t))},dc={quantize:t=>Math.round(t*100)/100,format:t=>`${Math.round(t*100)}%`};function ei(t,o,e,n){if(!t.values.length)return null;let i=t.scale.quantize(Ge(o,t.bound==="min"?"down":"up")),a=t.values.filter(({value:s})=>t.bound==="min"?s<i:s>i);if(!a.length)return null;let r=t.phrase(t.scale.format(i)),l=t.scale.format(i);return {severity:e,category:"rule_violation",timestamp_ms:Math.round(a[0].timeS*1e3),label:`${t.subject} ${r}`,message:`${t.subject} cast ${r}${t.tail??""}, ${a.length} of ${t.values.length} cast(s). Top: ${t.scale.format(o.value)}.`,measured:{value:`${a.length} / ${t.values.length}`,unit:"cast(s)"},details:n?{remedy:n}:void 0,occurrences:ze(t.values.map(({timeS:s,value:m})=>{let f=t.bound==="min"?m>=i:m<=i,h=t.scale.format(m);return {atMs:Math.round(s*1e3),ok:f,label:h,detail:`${t.subject} cast at ${h}.`}})),occurrenceTarget:t.bound==="min"?`field waits for ${l}+`:`field stays under ${l}`}}function cc(t,o,e,n,i){return ei({values:Un(t,o).map(({timeS:a,targets:r})=>({timeS:a,value:r})),bound:t.bound,scale:$a,subject:t.spell_name,phrase:a=>`at ${t.bound==="min"?"under":"over"} ${a} targets`},e,n,i)}function Qn(t,o){let e=[];for(let n of o.castEvents){if(n.type!=="cast"||n.abilityGameID!==t.spell_id||n.resourceActor!=null&&n.resourceActor!==Wd)continue;let i=n.classResources?.find(a=>a.type===t.resource_type);i?.max&&e.push({timeS:(n.timestamp-o.fStart)/1e3,frac:i.amount/i.max,amount:i.amount,max:i.max});}return e}var mc=200;function pc(t){return {quantize:o=>Math.round(o*t),format:o=>`${Math.round(o)}/${t}`}}function fc(t,o,e,n,i){let a=Qn(t,o);if(!a.length)return null;let r=a[0].max,l=r<=mc;return ei({values:a.map(({timeS:s,frac:m,amount:f})=>({timeS:s,value:l?f:m})),bound:t.bound,scale:l?pc(r):dc,subject:t.spell_name,phrase:s=>`${t.bound==="min"?"below":"above"} ${s} ${t.resource_name}`},e,n,i)}function Ba(t,o){return (o.selfAuras.get(t.buff_spell_id)??[]).filter(([,e])=>e!=null&&e<o.fightDurationS*1e3)}function uc(t,o,e,n){let i=Ba(t,o);if(!i.length)return null;let a=t.spend_spell_ids.flatMap(s=>o.castTimes[s]??[]),r=(s,m)=>a.some(f=>f*1e3>=s&&f*1e3<=m),l=i.filter(([s,m])=>!r(s,m));return l.length?{severity:e,category:"rule_violation",timestamp_ms:Math.round(l[0][0]),label:`${t.buff_spell_name} wasted`,message:`${t.buff_spell_name} expired unspent ${l.length} of ${i.length} time(s).`,measured:{value:`${l.length} / ${i.length}`,unit:"proc(s)"},details:n?{remedy:n}:void 0,occurrences:ze(i.map(([s,m])=>{let f=r(s,m);return {atMs:Math.round(s),ok:f,label:f?"used":"wasted",detail:f?`${t.buff_spell_name} was spent before it expired.`:`${t.buff_spell_name} expired unspent here.`}})),occurrenceTarget:"window it expired in"}:null}function Wa(t,o,e){let n=e(t).length,i=o.flatMap(e);return {coached:n,total:n+i.length,firstAlternativeS:i.length?Math.min(...i):null}}function Kn(t){return t.total?t.coached/t.total:null}function za(t,o,e,n,i,a){let r=Kn(t);return r==null||r>=Ge(o,"down")?null:{severity:e,category:"rule_violation",timestamp_ms:t.firstAlternativeS==null?void 0:Math.round(t.firstAlternativeS*1e3),label:`${n} ${i}`,message:`${n} was ${Math.round(r*100)}% of your fillers ${i}. Top: ${Math.round(o.value*100)}%.`,measured:{value:`${Math.round(r*100)} / ${Math.round(o.value*100)}`,unit:"% of fillers"},details:a?{remedy:a}:void 0,occurrences:[]}}function Ga(t,o,e,n,i){let a=[...i(t).map(r=>({atMs:Math.round(r*1e3),ok:true,label:o})),...e.flatMap((r,l)=>{let s=n[l]??String(r);return i(r).map(m=>({atMs:Math.round(m*1e3),ok:false,label:s}))})];return a.sort((r,l)=>r.atMs-l.atMs),ze(a.map(r=>U($({},r),{detail:r.ok?`${r.label} was the coached filler here.`:`${r.label} was pressed instead of ${o} here.`})))}function Va(t,o){return e=>(o.castTimes[e]??[]).filter(n=>Ea(o.selfAuras,t.buff_spell_id,n*1e3)&&!mn(t.except_buff_spell_ids,o,n*1e3))}function Yn(t,o){return Wa(t.spell_id,t.alternative_spell_ids,Va(t,o))}function hc(t,o,e,n,i){let a=za(Yn(t,o),e,n,t.spell_name,`in ${t.buff_spell_name}`,i);return a?U($({},a),{occurrences:Ga(t.spell_id,t.spell_name,t.alternative_spell_ids,t.alternative_spell_names,Va(t,o)),occurrenceTarget:`filler choice inside ${t.buff_spell_name}`}):null}function mn(t,o,e){return (t??[]).some(n=>sn(o.selfAuras,n,e))}function Xn(t,o){let e=o.stacks(t.buff_spell_id);return e.length?[...o.castTimes[t.spell_id]??[]].sort((n,i)=>n-i).filter(n=>!mn(t.except_buff_spell_ids,o,n*1e3)).map(n=>({timeS:n,stacks:Ia(e,n*1e3)})):[]}function _c(t,o,e,n,i){let a=t.bound==="min"?"under":"over";return ei({values:Xn(t,o).map(({timeS:r,stacks:l})=>({timeS:r,value:l})),bound:t.bound,scale:$a,subject:t.spell_name,phrase:r=>`at ${a} ${r} ${t.buff_spell_name}`,tail:t.bound==="max"?", overcapping":void 0},e,n,i)}function gc(t){return [...t.values()].flat().filter(o=>o.endMs!=null)}function vc(t,o){return t.on==="target"?o.targetSpans(t.aura_spell_id):o.selfSpans(t.aura_spell_id)}function xc(t,o){let e=o.castTimes[t.cast_spell_id]??[],n=i=>e.some(a=>i-a*1e3>=0&&i-a*1e3<=Vd*1e3);return gc(vc(t,o)).filter(i=>i.endedByRefresh&&n(i.endMs)&&!mn(t.except_buff_spell_ids,o,i.endMs))}function Zn(t,o){return xc(t,o).map(e=>({timeS:e.endMs/1e3,elapsedS:(e.endMs-e.startMs)/1e3})).sort((e,n)=>e.timeS-n.timeS)}function bc(t,o,e,n,i){let a=Zn(t,o);if(!a.length)return null;let r=Ge(e,"down"),l=a.filter(({elapsedS:m})=>m<r);if(!l.length)return null;let s=re(r,1);return {severity:n,category:"rule_violation",timestamp_ms:Math.round(l[0].timeS*1e3),label:`${t.aura_spell_name} clipped`,message:`${t.aura_spell_name} re-applied a median ${re(at(l.map(m=>m.elapsedS))??0,1)}s in, ${l.length} of ${a.length} refresh(es). Top: ${re(e.value,1)}s.`,measured:{value:`${l.length} / ${a.length}`,unit:"refresh(es)"},details:i?{remedy:i}:void 0,occurrences:ze(a.map(({timeS:m,elapsedS:f})=>({atMs:Math.round(m*1e3),ok:f>=r,label:`${re(f,1)}s`,detail:`Refreshed with ${re(f,1)}s still remaining.`}))),occurrenceTarget:`field waits for ${s}s remaining`}}function yc(t,o){let e=t.targetHealth(ot(o)),n=Ra(e.length,i=>e[i][0]>o.timestamp)-1;return n<0||e[n][0]<o.timestamp-Gd*1e3?null:e[n][1]}function ja(t,o){let e=t.health_pct/100;return n=>o.castEvents.filter(i=>{if(i.type!=="cast"||i.abilityGameID!==n||mn(t.except_buff_spell_ids,o,i.timestamp-o.fStart))return  false;let a=yc(o,i);return a!=null&&a<=e}).map(i=>(i.timestamp-o.fStart)/1e3)}function Jn(t,o){return Wa(t.spell_id,t.alternative_spell_ids,ja(t,o))}function Cc(t,o,e,n,i){let a=za(Jn(t,o),e,n,t.spell_name,`under ${t.health_pct}% health`,i);return a?U($({},a),{occurrences:Ga(t.spell_id,t.spell_name,t.alternative_spell_ids,t.alternative_spell_names,ja(t,o)),occurrenceTarget:`filler choice under ${t.health_pct}% health`}):null}var qa={cooldown_pairing:"pairing",cd_hold:"cd hold",opener:"opener",rotation:"rotation",aoe_switch:"aoe"};function be(t){return (o,e,n,i,a)=>n&&t(o,e,n,i,a)}var wc={cast_without_prior:{streams:()=>[],measure:(t,o)=>{let e=Na(t,o.castTimes).filter(n=>n!=null);return e.length?Math.max(...e):null},evaluate:be(Kd),applicable:(t,o)=>cn(o,t.spell_id)>0,label:t=>`${t.spell_name} with ${t.required_spell_name}`},hold_cooldown_for_anchor:{streams:()=>[],measure:(t,o)=>{let e=qn(t,o.castTimes).flatMap(n=>t.spell_ids.flatMap(i=>o.castTimes[i]??[]).filter(i=>i<n).map(i=>n-i));return e.length?Math.min(...e):null},evaluate:be(Xd),applicable:(t,o)=>qn(t,o.castTimes).length>0&&t.spell_ids.some(e=>cn(o,e)>0),label:t=>`${t.spell_names.join("/")} held for ${t.anchor_spell_name}`},cast_outside_buff:{streams:()=>[],measure:null,evaluate:(t,o,e,n,i)=>Jd(t,o,n,i),applicable:(t,o)=>cn(o,t.spell_id)>0,label:t=>`${t.spell_name} ${t.require} ${t.buff_spell_name}`},aura_uptime_below:{streams:t=>t.on==="target"?["enemyAuras","deaths"]:["deaths"],measure:(t,o)=>Hn(t,o)||null,evaluate:be(oc),applicable:(t,o)=>Hn(t,o)>0,label:t=>`${t.aura_spell_name} uptime`},opening_sequence:{streams:()=>[],measure:(t,o)=>La(t,o,o.fightDurationS)?.completedS??null,evaluate:be(lc),applicable:(t,o)=>t.spell_ids.some(e=>cn(o,e)>0),label:t=>`Opener: ${t.spell_names.join(" > ")}`},cast_at_target_count:{streams:()=>["damage"],measure:(t,o)=>{let e=Un(t,o).map(n=>n.targets);return e.length?at(e)??null:null},evaluate:be(cc),applicable:(t,o)=>Un(t,o).length>0,label:t=>`${t.spell_name} target count`},resource_at_cast:{streams:()=>[],measure:(t,o)=>{let e=Qn(t,o).map(n=>n.frac);return e.length?at(e)??null:null},evaluate:be(fc),applicable:(t,o)=>Qn(t,o).length>0,label:t=>`${t.spell_name} at ${t.resource_name}`},proc_wasted:{streams:()=>[],measure:null,evaluate:(t,o,e,n,i)=>uc(t,o,n,i),applicable:(t,o)=>Ba(t,o).length>0,label:t=>`${t.buff_spell_name} spent`},filler_in_buff:{streams:()=>[],measure:(t,o)=>Kn(Yn(t,o)),evaluate:be(hc),applicable:(t,o)=>Yn(t,o).total>0,label:t=>`${t.spell_name} in ${t.buff_spell_name}`},spend_at_stacks:{streams:()=>[],measure:(t,o)=>{let e=Xn(t,o).map(n=>n.stacks);return e.length?t.bound==="min"?Math.min(...e):Math.max(...e):null},evaluate:be(_c),applicable:(t,o)=>Xn(t,o).length>0,label:t=>`${t.spell_name} at ${t.buff_spell_name}`},aura_clipped:{streams:t=>t.on==="target"?["enemyAuras"]:[],measure:(t,o)=>{let e=Zn(t,o).map(n=>n.elapsedS);return e.length?Math.min(...e):null},evaluate:be(bc),applicable:(t,o)=>Zn(t,o).length>0,label:t=>`${t.aura_spell_name} clipped`},filler_below_health:{streams:()=>["damage","targetHealth"],measure:(t,o)=>Kn(Jn(t,o)),evaluate:be(Cc),applicable:(t,o)=>Jn(t,o).total>0,label:t=>`${t.spell_name} under ${t.health_pct}% health`}};function bt(t){return wc[t.kind]}function yt(t,o){return t.some(e=>bt(e.condition).streams(e.condition).includes(o))}function Ha(t){return t.filter(o=>o.rule.condition!=null&&(bt(o.rule.condition).measure==null||o.threshold!=null))}function Ua(t,o,e,n,i){return bt(t).evaluate(t,o,e,n,i)}function Qa(t,o){return bt(t).applicable(t,o)}function Ka(t,o){let e=[];for(let{rule:n,threshold:i}of t){if(!Qa(n.condition,o))continue;let a=Ua(n.condition,o,i,n.severity,n.action);a&&e.push(U($({},a),{rule_type:n.type,label:n.description??a.label}));}return e}function Sc(t,o){return o??bt(t).label(t)}function Ya(t,o){let e=[];for(let{rule:n,threshold:i}of t){let a=n.condition;Qa(a,o)&&(Ua(a,o,i,n.severity)||e.push(Sc(a,n.description)));}return e}var Mc=new Set([2825,32182,80353,90355,264667,390386]),kc=40,Tc=30,Ec=15,ti=50,Xa=.5;function Za(t){return t.used_sample_count/t.sample_count}function Dc(t,o,e,n,i){return o===0&&e>=1?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`0 / ${e}`,unit:"cast(s)"},message:`${t} unused. Expected ${e} on a ${G(i)} fight.`,details:{remedy:`Use ${t} ${e}x this fight.`},occurrences:[]}:o>0&&o<n?{severity:"critical",category:"lost_cooldown",cd_name:t,measured:{value:`${o} / ${e}`,unit:"cast(s)"},message:`${t}: ${o} casts, expected ${e}. ${n-o} lost.`,details:{remedy:`Press ${t} ${n-o}x more - sooner off cooldown.`},occurrences:[]}:null}function Ic(t,o,e){if(!o.length)return null;let n=o[0]/1e3;if(!lt(n,e.avg_first_cast_s,e.stddev_first_cast_s))return null;let i=(n-e.avg_first_cast_s).toFixed(0);return {severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:o[0],measured:{value:`+${i}s`,unit:`top ${G(e.avg_first_cast_s)}`},message:`${t} opened at ${G(n)}, ${i}s late. Top: ${G(e.avg_first_cast_s)}.`,details:{remedy:`Open with ${t} earlier.`},occurrences:[]}}function Fc(t,o,e,n,i){if(n===null||!o.length)return {blAligned:false,findings:[]};let a=o.filter(s=>{let m=s/1e3;return m>=n-Tc&&m<=n+kc+Ec}),r=a.length>0,l=[];if(!r&&i)l.push({severity:"critical",category:"cooldown_alignment",cd_name:t,timestamp_ms:o[0],measured:{value:"missed",unit:"BL"},message:`${t} missed Bloodlust (BL at ${G(n)}, first cast at ${G(o[0]/1e3)}).`,details:{remedy:`Align ${t} with Bloodlust.`},occurrences:[]});else if(r&&e.avg_bl_offset_s!=null&&e.stddev_bl_offset_s!=null){let s=a.map(f=>f/1e3-n),m=Ta(s);if(Sa(m,e.avg_bl_offset_s,e.stddev_bl_offset_s)){let f=m>e.avg_bl_offset_s?"late":"early",h=a[s.indexOf(m)];l.push({severity:"warning",category:"cooldown_alignment",cd_name:t,timestamp_ms:h,measured:{value:f,unit:"in BL"},message:`${t} ${f} in the Bloodlust window.`,details:{remedy:`Tighten ${t} to the Bloodlust window.`},occurrences:[]});}}return {blAligned:r,findings:l}}function Ac(t,o,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;for(let i=1;i<o.length;i++){let a=(o[i]-o[i-1])/1e3;lt(a,e.avg_gap_s,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:o[i],measured:{value:`${a.toFixed(0)}s`,unit:`avg ${e.avg_gap_s.toFixed(0)}s`},message:`${t} at ${G(o[i]/1e3)}: ${a.toFixed(0)}s gap, top ${e.avg_gap_s.toFixed(0)}s.`,details:{remedy:`Press ${t} sooner - top gap ${e.avg_gap_s.toFixed(0)}s.`},occurrences:[]});}return n}function Oc(t,o,e){if(t.length<2||e.downtime_threshold_ms==null)return null;let n=0;for(let m=1;m<t.length;m++){let f=t[m]-t[m-1];f>e.downtime_threshold_ms&&(n+=f);}let i=n/1e3,a=e.top_avg_efficiency,r=e.top_efficiency_stddev,l=ka(i,o);return Ma(l,a,r,1)?{severity:"warning",category:"cast_efficiency",label:"Low cast efficiency",measured:{value:`${l.toFixed(1)}%`,unit:`top ${a.toFixed(0)}%`},message:`${l.toFixed(1)}% cast efficiency, ${i.toFixed(1)}s idle. Top: ${a.toFixed(0)}%.`,details:{remedy:`Fill ${i.toFixed(1)}s of gaps. Top: ${a.toFixed(0)}%.`},occurrences:[]}:null}function Rc(t,o,e,n,i){let a=t.name,r=o.length;if(t.talent_gated&&r===0)return null;if(!e)return {success:r>0?{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a}: ${r} casts (no bench data).`,occurrences:[]}:null,scan:{issues:[],holds:[],blAligned:false}};let l=e.bl_pct>=ti,{expected:s,floor:m}=rn(n,e.uses_per_min),f=[];if(Za(e)>=Xa){let C=Dc(a,r,s,m,n);C&&f.push(C);let E=Ic(a,o,e);E&&f.push(E);}let h=Fc(a,o,e,i,l);f.push(...h.findings),f.push(...Ac(a,o,e));let g=ln(a,o.map(C=>C/1e3),e.hold_targets);return {success:f.length||r===0?null:{severity:"success",category:"cooldown_usage",cd_name:a,message:`${a} - ${r}/${s} casts${h.blAligned&&l?", BL-aligned":""}.`,occurrences:[]},scan:{issues:f,holds:g,blAligned:h.blAligned}}}function Pc(t){let{fStart:o,fEnd:e,castEvents:n,buffEvents:i,cooldowns:a,bench:r}=t,l=(e-o)/1e3,s=n.filter(y=>y.type==="cast"&&y.timestamp>=o&&y.timestamp<=e).sort((y,C)=>y.timestamp-C.timestamp),m=[],f=null;for(let y of i)if(y.type==="applybuff"&&Mc.has(y.abilityGameID)&&y.timestamp>=o&&y.timestamp<=e){f=(y.timestamp-o)/1e3;break}let h=r.per_cd_benchmarks??{};for(let y of a){let C=s.filter(z=>z.abilityGameID===y.spell_id).map(z=>z.timestamp-o),E=Rc(y,C,h[y.name],l,f);E&&(E.scan.issues.length?m.push(...E.scan.issues):E.success&&m.push(E.success),C.length&&m.push(...E.scan.holds));}let g=Oc(s.map(y=>y.timestamp-o),l,r);return g&&m.push(g),xt(m),m}var Nc={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function Ja(t,o,e){let n=o[t]??null;return n!=null?{spellId:n,icon:e[n].icon,rowName:e[n].name}:{spellId:null,icon:"",rowName:t}}function Lc(t){let o=[],e={},n=new Set;for(let i of t){if(i.severity==="success"){i.cd_name&&n.add(i.cd_name);continue}i.category==="hold_suggestion"&&i.details?.cd_name?(e[i.details.cd_name]??={issues:[],holds:[]}).holds.push(i):i.category==="rule_violation"||!i.cd_name?o.push(i):(e[i.cd_name]??={issues:[],holds:[]}).issues.push(i);}return {ruleFindings:o,byName:e,successNames:n}}function $c(t){return t.map(o=>({severity:o.severity==="critical"?"critical":o.severity==="info"?"info":"warning",name:"",icon:"",what:o.label,chip:o.rule_type?qa[o.rule_type]:void 0,measured:o.measured??{value:"-"},timestampMs:o.timestamp_ms??null,fix:o.details?.remedy,occurrences:o.occurrences,occurrenceTarget:o.occurrenceTarget,timeline:o.timeline}))}function Bc(t,o,e){let n=[];for(let[i,a]of Object.entries(t)){if(!a.issues.length&&!a.holds.length)continue;let{spellId:r,icon:l,rowName:s}=Ja(i,o,e);for(let m of [...a.issues,...a.holds])n.push({severity:m.severity==="critical"?"critical":"warning",name:s,spellId:r,icon:l,timestampMs:m.timestamp_ms??null,chip:Nc[m.category],measured:m.measured??{value:"-"},fix:m.details?.remedy,occurrences:m.occurrences});}return n}function Wc(t,o,e){let{byName:n,successNames:i}=t,a=[];for(let r of i)if(!n[r]||!n[r].issues.length&&!n[r].holds.length){let{spellId:l,icon:s,rowName:m}=Ja(r,o,e);a.push({name:m,spellId:l,icon:s});}return a}function zc(t,o,e){let n=Lc(t);return {ruleRows:$c(n.ruleFindings),offensiveRows:Bc(n.byName,o,e),onPlan:Wc(n,o,e)}}function Gc(t,o,e){return [...t].sort((i,a)=>{let r=i.opener_priority??99,l=a.opener_priority??99;return r!==l?r-l:i.name.localeCompare(a.name)}).map(i=>{let a=o[i.name],r=a?.majority_hold&&a.hold_targets?Object.entries(a.hold_targets).sort((f,h)=>Number(f[0])-Number(h[0])).map(([f,h])=>({castIndex:Number(f),targetS:h.target_s})):[],l=i.spell_id??null,s=l!=null?e[l]:void 0;l!=null&&!s&&ua$1("buildCdPlan: ability id missing from ability map",l);let m=a!=null&&Za(a)>=Xa;return {name:i.name,spellId:l,icon:s?.icon??"",firstCastS:m?a.avg_first_cast_s:null,uses:a?.avg_uses??null,usesPerMin:m?a.uses_per_min.avg:null,bloodlust:(a?.bl_pct??0)>=ti,bloodlustPct:(a?.bl_pct??0)>=ti?a.bl_pct:null,holds:r,rule:i.usage_rule??null}})}var m0=(()=>{class t{source=T(Xa$1);wclApi=T(xe);async loadPlayerView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let m=(await this.wclApi.getReport(i)).fights.find(Ce=>Ce.id===a);if(!m)return fa$1("Fight not found in this report.","rotation.player-view");let f=Ha(l.value.rules),h=f.map(Ce=>Ce.rule),[g,y,C,E,z]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",m.startTime,m.endTime,r,!0),this.wclApi.getAllEvents(i,a,"Buffs",m.startTime,m.endTime,r),yt(h,"enemyAuras")?this.wclApi.getAllEvents(i,a,"Debuffs",m.startTime,m.endTime,void 0,!1,"Enemies"):Promise.resolve([]),yt(h,"damage")?this.wclApi.getAllEvents(i,a,"DamageDone",m.startTime,m.endTime,r,yt(h,"targetHealth")):Promise.resolve([]),yt(h,"deaths")?this.wclApi.getAllEvents(i,a,"Deaths",m.startTime,m.endTime):Promise.resolve([])]),X=C.filter(Ce=>Ce.sourceID===r),De=z.filter(Ce=>Ce.targetID===r),ne=Pc({fStart:m.startTime,fEnd:m.endTime,castEvents:g,buffEvents:y,cooldowns:l.value.major_cooldowns,bench:l.value}),ye=Pa({casts:g,buffs:y,debuffs:X,damage:E,deaths:De,fStart:m.startTime,fEnd:m.endTime}),st=Ka(f,ye),Ie=[...ne,...st];xt(Ie);let{ruleRows:Re,offensiveRows:dt,onPlan:fn}=zc(Ie,l.value.cd_spell_ids,l.value.ability_icons),un=Ya(f,ye);return ri({ruleRows:Re,ruleOnPlan:un,offensiveRows:dt,onPlan:fn})}catch(s){return ua$1(`RotationFeatureService.loadPlayerView ${i}:${a}`,s),ma$1(s,"rotation.player-view")}}async loadPlanView(e,n){let i=await this.source.getBench(e,n);return i.ok?ri({rows:Gc(i.value.major_cooldowns,i.value.per_cd_benchmarks,i.value.ability_icons)}):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var pn=t=>(t.amount||0)+(t.absorbed||0),Vc=.5;function jc(t){return t.used_sample_count/t.sample_count}function qc(t,o,e,n,i,a,r,l){let s=o.map(([m,f])=>{let h=f??l;return {start_s:Math.round(m*10)/10,end_s:Math.round(h*10)/10,dmg_during:Math.round(n(m,h))}});return s.length?s:e.filter(m=>m.type==="cast"&&m.abilityGameID===t&&m.timestamp>=a&&m.timestamp<=r).map(m=>{let f=i(m.timestamp)/1e3;return {start_s:Math.round(f*10)/10,end_s:Math.round(f*10)/10,dmg_during:0}})}function Hc(t,o,e,n,i,a){if(!t.length)return [];let r=h=>h-i,l=n.filter(h=>h.type==="damage"),s={};for(let h of e){let g=h.abilityGameID,y=r(h.timestamp)/1e3;if(h.type==="applybuff")(s[g]??=[]).push([y,null]);else if(h.type==="removebuff"){for(let C=(s[g]?.length??0)-1;C>=0;C--)if(s[g][C][1]===null){s[g][C][1]=y;break}}}let m=(h,g)=>l.reduce((y,C)=>{let E=r(C.timestamp)/1e3;return E>=h&&E<=g?y+pn(C):y},0),f=(a-i)/1e3;return t.map(h=>{let g=h.spell_id,y=qc(g,s[g]||[],o,m,r,i,a,f),C=y.map(z=>z.start_s).sort((z,X)=>z-X),E={name:h.name,spell_id:g,cooldown:h.cooldown,uses:y.length,cast_times_s:C,windows:y};return h.talent_gated&&(E.talent_gated=true),E})}function Uc(t,o,e){let n=[];if(e.avg_gap_s==null||e.stddev_gap_s==null)return n;let i=e.avg_gap_s;for(let a=1;a<o.length;a++){let r=o[a]-o[a-1];lt(r,i,e.stddev_gap_s)&&n.push({severity:"warning",category:"cooldown_delay",cd_name:t,timestamp_ms:Math.round(o[a]*1e3),measured:{value:`${r.toFixed(0)}s`,unit:`avg ${i.toFixed(0)}s`},message:`${t} at ${G(o[a])}: ${r.toFixed(0)}s gap, top ${i.toFixed(0)}s.`,details:{remedy:`Use ${t} sooner after it resets.`},occurrences:[]});}return n}function Qc(t,o,e){let{name:n,uses:i,cast_times_s:a}=t;if(t.talent_gated&&i===0)return [];if(!o)return i>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n}: ${i} uses (no bench data).`,occurrences:[]}]:[];let{expected:r,floor:l}=rn(e,o.uses_per_min),s=[],m=jc(o)>=Vc;m&&i===0&&r>=1?s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`0 / ${r}`,unit:"use(s)"},message:`${n} unused. Expected ${r} on a ${G(e)} fight.`,details:{remedy:`Use ${n} ${r}x this fight.`},occurrences:[]}):m&&i>0&&i<l&&s.push({severity:"critical",category:"lost_cooldown",cd_name:n,timestamp_ms:void 0,measured:{value:`${i} / ${r}`,unit:"use(s)"},message:`${n}: ${i} uses, expected ${r}. ${l-i} lost.`,details:{remedy:`Use ${n} ${l-i}x more.`},occurrences:[]});let f=[];if(a?.length){let g=a[0];m&&lt(g,o.avg_first_cast_s,o.stddev_first_cast_s)&&s.push({severity:"warning",category:"cooldown_delay",cd_name:n,timestamp_ms:Math.round(g*1e3),measured:{value:`+${(g-o.avg_first_cast_s).toFixed(0)}s`,unit:`top ${G(o.avg_first_cast_s)}`},message:`${n} first used at ${G(g)}, ${(g-o.avg_first_cast_s).toFixed(0)}s late. Top: ${G(o.avg_first_cast_s)}.`,details:{remedy:`Use ${n} earlier.`},occurrences:[]}),s.push(...Uc(n,a,o)),f.push(...ln(n,a,o.hold_targets));}let h=s.length?s:i>0?[{severity:"success",category:"cooldown_usage",cd_name:n,message:`${n} - ${i}/${r} uses.`,occurrences:[]}]:[];return i>0&&h.push(...f),h}function Kc(t,o,e){let n=[];for(let i of t)n.push(...Qc(i,o[i.name],e));return xt(n),n}function Yc(t,o,e){let n=o.filter(i=>i.timestamp>=e&&pn(i)>0).sort((i,a)=>i.timestamp-a.timestamp);return t.map(i=>{let a=f=>f>=i.time_s&&f<i.time_s+i.window_length_s,r=n.filter(f=>a((f.timestamp-e)/1e3)),l=r.reduce((f,h)=>f+pn(h),0),s={};for(let f of r){if(!f.abilityGameID)continue;let h=Yt(f.abilityGameID);s[h]=(s[h]||0)+pn(f);}let m=Object.entries(s).sort((f,h)=>h[1]-f[1]).slice(0,6).map(([f,h])=>({spell_id:parseInt(f,10),damage:Math.round(h)}));return {time_s:i.time_s,window_damage:Math.round(l),ability_breakdown:m}})}var Xc=3;function Zc(t,o,e=Xc){if(!o)return  false;let n=t.time_s-e,i=t.time_s+t.window_length_s+e;return o.windows.some(a=>a.start_s<=i&&a.end_s>=n)}var Jc="covered",em="no defensive used",tm="defensive used wrongly",nm="defensive needed, unused";function im(t,o,e,n,i){return n?{status:"muted",icon:"schedule",note:""}:t===null?{status:"muted",icon:"help_outline",note:""}:t>o+e?{status:"bad",icon:"error",note:i?tm:nm}:{status:"good",icon:"check_circle",note:i?Jc:em}}function om(t,o,e){let n={};for(let i of o?.ability_breakdown??[])n[i.spell_id]=i;return t.map(i=>({spellId:i.spell_id,label:e[i.spell_id].name,icon:e[i.spell_id].icon,playerPct:n[i.spell_id]?.damage??null,topAvg:i.avg_damage,topMin:i.min_damage,topMax:i.max_damage}))}function am(t){return {timeS:t.time_s,refGameId:t.ref_game_id??null,windowLengthS:t.window_length_s}}function rm(t,o){return {timeS:t.time_s,windowLengthS:t.window_length_s,key:`defensive-${o}`}}function w0(t){return {timeS:t/1e3,windowLengthS:0,key:`defensive-find-${t}`}}function lm({topWindows:t,playerWindows:o,playerDefensives:e,fightDurationS:n,abilities:i}){let a=[],r=[],l=[];return t.forEach((s,m)=>{let f=s.time_s>n,h=f?null:o[m]??null,g=h?.window_damage??null,y=s.defensive_name??s.common_defensives?.[0]??"",C=e.find(ye=>ye.name===y),E=Zc(s,C),{status:z,icon:X,note:De}=im(g,s.dmg_max,s.dmg_stddev,f,E),ne=s.spell_id==null&&y?[y]:[];De&&ne.push(De),a.push({timeStartS:s.time_s,timeEndS:s.time_s+s.window_length_s,spells:Xt(s.spell_id!=null?[s.spell_id]:[],i),labels:ne,status:z,statusIcon:X,overview:{label:"",icon:"",playerPct:g,topAvg:s.dmg_avg,topMin:s.dmg_min,topMax:s.dmg_max},detailRows:om(s.ability_breakdown,h,i)}),r.push(am(s)),l.push(rm(s,m));}),{windows:a,anchors:r,clipAnchors:l}}function sm(t){if(!t?.defensives?.length)return [];let o=t.per_defensive_benchmarks??{},e=t.defensive_windows??[];return t.defensives.map(n=>{let i=o[n.name],a=e.filter(m=>(m.defensive_name??m.common_defensives?.[0])===n.name).map(m=>m.time_s).sort((m,f)=>m-f),r=i?.majority_hold&&i.hold_targets?Object.entries(i.hold_targets).sort((m,f)=>Number(m[0])-Number(f[0])).map(([m,f])=>({castIndex:Number(m),targetS:f.target_s})):[],l=n.spell_id??null,s=l!=null?t.ability_icons[l]:void 0;return l!=null&&!s&&ua$1("buildDefensivePlanRows: ability id missing from ability map",l),{name:n.name,spellId:l,icon:s?.icon??"",uses:i?.avg_uses??null,firstCastS:i?.avg_first_cast_s??null,windowsS:a,holds:r,rule:n.usage_rule??null}}).filter(n=>n.uses!=null||n.firstCastS!=null||n.windowsS.length||n.holds.length||n.rule)}var S0=(()=>{class t{source=T(Za$1);wclApi=T(xe);async loadAnalysisView(e,n,i,a,r){let l=await this.source.getBench(e,n);if(!l.ok)return l;try{let m=(await this.wclApi.getReport(i)).fights.find(Re=>Re.id===a);if(!m)return ri({findings:[],spellIdsByName:l.value.cd_spell_ids,iconByName:{},windows:[],anchors:[],clipAnchors:[]});let f=m.startTime,h=m.endTime,g=(h-f)/1e3,[y,C,E]=await Promise.all([this.wclApi.getAllEvents(i,a,"Casts",f,h,r),this.wclApi.getAllEvents(i,a,"Buffs",f,h,r),this.wclApi.getAllEvents(i,a,"DamageTaken",f,h,r)]),z=Hc(l.value.defensives,y,C,E,f,h),X=l.value.defensives.length&&z.length?Kc(z,l.value.per_defensive_benchmarks,g):[],De=Yc(l.value.defensive_windows,E,f),ne={};for(let[Re,dt]of Object.entries(l.value.cd_spell_ids))ne[Re]=l.value.ability_icons[dt].icon;let{windows:ye,anchors:st,clipAnchors:Ie}=lm({topWindows:l.value.defensive_windows,playerWindows:De,playerDefensives:z,fightDurationS:g,abilities:l.value.ability_icons});return ri({findings:X,spellIdsByName:l.value.cd_spell_ids,iconByName:ne,windows:ye,anchors:st,clipAnchors:Ie})}catch(s){return ua$1(`DefensiveFeatureService.loadAnalysisView ${i}:${a}`,s),ma$1(s,"defensive.player-view")}}async loadPlan(e,n){let i=await this.source.getBench(e,n);return i.ok?ri({rows:sm(i.value)}):i}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var dm=["*"],k0=(()=>{class t{labelPosition="after";static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,i){n&2&&yp("mdc-form-field--align-end",i.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:dm,decls:1,vars:0,template:function(n,i){n&1&&(SE(),NE(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return t})();export{$p as $,Bo as B,Cr as C,Df as D,Gt as G,Hp as H,Io as I,Jt as J,Kt as K,Po as P,Qt as Q,Ro as R,S0 as S,To as T,Up as U,Vt as V,Je as a,b_ as b,Ru as c,Jh as d,t_ as e,Ut as f,g_ as g,ht as h,it as i,jt as j,m0 as k,l_ as l,m_ as m,w0 as n,o_ as o,jo as p,$o as q,ma as r,nt as s,tt as t,uh as u,Ho as v,wf as w,xe as x,k0 as y,zt as z};//# sourceMappingURL=chunk-DPFVak-H.js.map
