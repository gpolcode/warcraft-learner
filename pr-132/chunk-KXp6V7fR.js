import {Y as Ye,S as So,y as yt,x as xt,n as nt,o as oa,B as Bi$1,N as Ni$1,a as oc,q as qe,u as uc,p as pc,z as zi$1,b as yo,j as ji$1,i as io,c as ao,h as ho,U as Ue,g as go,_ as _o,d as bo,e as xo$1,X as Xt$1,P as Pi$1,f as St,k as Yt,l as ko,m as be$1,I as It,R as Ro,r as kt}from'./chunk-pJH5VOja.js';import {T,p as pa,a as Kn,q as ql,x as xo,E as ED,Y as Ym,c as Eh,G as Gm,d as al,r as re,i as il,e as Th,F as Fe,D as Dh,R as Ri$1,f as sl,W as Wm,J as J_,g as FE,h as fp,j as es,u as up,t as td,v as v_,k as si$1,l as eD,C as Cc,m as mp,Q as Qv,n as iI,o as up$1,w as rv,y as lp,z as Yv,A as sI,B as er,H as Fh,X as Xt,O as Oi$1,s as se,U,$,V as VE,P as Pl,I as q,L as mr,M as L,N as ct,S as Me,Z as $v,_ as jt,a0 as x,a1 as ee,a2 as Ib,a3 as Xi$1,a4 as _b,a5 as Kl,a6 as id,a7 as Ys,a8 as xu,a9 as $E,aa as im,ab as kF,ac as cD,ad as hp,ae as cp,af as bp,ag as lr,ah as AF,ai as Se,aj as Be$1,ak as fe,al as qs,am as Bp,an as zb,ao as _I,ap as MI,aq as RI,ar as Jo,as as Nn,at as ao$1,au as OF,av as UI,aw as Ep,ax as SI,ay as xI,az as MF,aA as _F,aB as vv,aC as _v,aD as lI,aE as uI,aF as mI,aG as CI,aH as Sc,aI as Ap,aJ as su,aK as au,aL as dr,aM as ie,aN as gr,aO as Eu,aP as Pd,aQ as fD,aR as hD,aS as kp,aT as aI,aU as we$1}from'./main-54VYVGM3.js';var vi=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275cmp=FE({type:t,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(i,a){},styles:[`textarea.cdk-textarea-autosize {
  resize: none;
}

textarea.cdk-textarea-autosize-measuring {
  padding: 2px 0 !important;
  box-sizing: content-box !important;
  height: auto !important;
  overflow: hidden !important;
}

textarea.cdk-textarea-autosize-measuring-firefox {
  padding: 2px 0 !important;
  box-sizing: content-box !important;
  height: 0 !important;
}

@keyframes cdk-text-field-autofill-start { /*!*/ }
@keyframes cdk-text-field-autofill-end { /*!*/ }
.cdk-text-field-autofill-monitored:-webkit-autofill {
  animation: cdk-text-field-autofill-start 0s 1ms;
}

.cdk-text-field-autofill-monitored:not(:-webkit-autofill) {
  animation: cdk-text-field-autofill-end 0s 1ms;
}
`],encapsulation:2})}return t})(),bi={passive:true},ai=(()=>{class t{_platform=T(L);_ngZone=T(Me);_renderer=T(dr).createRenderer(null,null);_styleLoader=T(fe);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return Fe;this._styleLoader.load(vi);let i=ie(e),a=this._monitoredElements.get(i);if(a)return a.subject;let l=new ee,h="cdk-text-field-autofilled",y=P=>{P.animationName==="cdk-text-field-autofill-start"&&!i.classList.contains(h)?(i.classList.add(h),this._ngZone.run(()=>l.next({target:P.target,isAutofilled:true}))):P.animationName==="cdk-text-field-autofill-end"&&i.classList.contains(h)&&(i.classList.remove(h),this._ngZone.run(()=>l.next({target:P.target,isAutofilled:false})));},Me=this._ngZone.runOutsideAngular(()=>(i.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(i,"animationstart",y,bi)));return this._monitoredElements.set(i,{subject:l,unlisten:Me}),l}stopMonitoring(e){let i=ie(e),a=this._monitoredElements.get(i);a&&(a.unlisten(),a.subject.complete(),i.classList.remove("cdk-text-field-autofill-monitored"),i.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(i));}ngOnDestroy(){this._monitoredElements.forEach((e,i)=>this.stopMonitoring(i));}static \u0275fac=function(i){return new(i||t)};static \u0275prov=gr({token:t,factory:t.\u0275fac})}return t})();var oi=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl({})}return t})();var ri=new x("MAT_INPUT_VALUE_ACCESSOR");var yi=["button","checkbox","file","hidden","image","radio","range","reset","submit"],xi=new x("MAT_INPUT_CONFIG"),si=(()=>{class t{_elementRef=T(mr);_platform=T(L);ngControl=T(ct,{optional:true,self:true});_autofillMonitor=T(ai);_ngZone=T(Me);_formField=T(Xt$1,{optional:true});_renderer=T($v);_uid=T(jt).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=T(xi,{optional:true});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=false;_isNativeSelect=false;_isTextarea=false;_isInFormField=false;focused=false;stateChanges=new ee;controlType="mat-input";autofilled=false;get disabled(){return this._disabled}set disabled(e){this._disabled=Ib(e),this.focused&&(this.focused=false,this.stateChanges.next());}_disabled=false;get id(){return this._id}set id(e){this._id=e||this._uid;}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(Xi$1.required)??false}set required(e){this._required=Ib(e);}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&_b().has(this._type)&&(this._elementRef.nativeElement.type=this._type);}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next());}get readonly(){return this._readonly}set readonly(e){this._readonly=Ib(e);}_readonly=false;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>_b().has(e));constructor(){let e=T(Kl,{optional:true}),i=T(id,{optional:true}),a=T(Pi$1),l=T(ri,{optional:true,self:true}),h=this._elementRef.nativeElement,y=h.nodeName.toLowerCase();l?Ys(l.value)?this._signalBasedValueAccessor=l:this._inputValueAccessor=l:this._inputValueAccessor=h,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(h,"keyup",this._iOSKeyupListener);}),this._errorStateTracker=new St(a,this.ngControl,i,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=y==="select",this._isTextarea=y==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||false,this._isNativeSelect&&(this.controlType=h.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&xu(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next();});}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next();});}ngOnChanges(){this.stateChanges.next();}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.();}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder();}focus(e){this._elementRef.nativeElement.focus(e);}updateErrorState(){this._errorStateTracker.updateErrorState();}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let i=this._elementRef.nativeElement;i.type==="number"?(i.type="text",i.setSelectionRange(0,0),i.type="number"):i.setSelectionRange(0,0);}this.focused=e,this.stateChanges.next();}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next());}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let i=this._elementRef.nativeElement;this._previousPlaceholder=e,e?i.setAttribute("placeholder",e):i.removeAttribute("placeholder");}}_getPlaceholder(){return this.placeholder||null}_validateType(){yi.indexOf(this._type)>-1;}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return !this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,i=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&i&&i.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let i=this._elementRef.nativeElement;e.length?i.setAttribute("aria-describedby",e.join(" ")):i.removeAttribute("aria-describedby");}onContainerClick(){this.focused||this.focus();}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let i=e.target;!i.value&&i.selectionStart===0&&i.selectionEnd===0&&(i.setSelectionRange(1,1),i.setSelectionRange(0,0));};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(i){return new(i||t)};static \u0275dir=$E({type:t,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(i,a){i&1&&mp("focus",function(){return a._focusChanged(true)})("blur",function(){return a._focusChanged(false)})("input",function(){return a._onInput()}),i&2&&(hp("id",a.id)("disabled",a.disabled&&!a.disabledInteractive)("required",a.required),cp("name",a.name||null)("readonly",a._getReadonlyAttribute())("aria-disabled",a.disabled&&a.disabledInteractive?"true":null)("aria-invalid",a.empty&&a.required?null:a.errorState)("aria-required",a.required)("id",a.id),bp("mat-input-server",a._isServer)("mat-mdc-form-field-textarea-control",a._isInFormField&&a._isTextarea)("mat-mdc-form-field-input-control",a._isInFormField)("mat-mdc-input-disabled-interactive",a.disabledInteractive)("mdc-text-field__input",a._isInFormField)("mat-mdc-native-select-inline",a._isInlineSelect()));},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},exportAs:["matInput"],features:[cD([{provide:Yt,useExisting:t}]),im]})}return t})(),li=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl({imports:[yt,yt,oi,q]})}return t})();var Ci=["*"],di=(()=>{class t{labelPosition="after";static \u0275fac=function(i){return new(i||t)};static \u0275cmp=FE({type:t,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,a){i&2&&bp("mdc-form-field--align-end",a.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Ci,decls:1,vars:0,template:function(i,a){i&1&&(_I(),MI(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return t})();var Ii=["switch"],Mi=["*"];function ki(t,n){t&1&&(si$1(0,"span",11),Eu(),si$1(1,"svg",13),up$1(2,"path",14),Cc(),si$1(3,"svg",15),up$1(4,"path",16),Cc()());}var Ei=new x("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),ve=class{source;checked;constructor(n,e){this.source=n,this.checked=e;}},Be=(()=>{class t{_elementRef=T(mr);_focusMonitor=T(lr);_changeDetectorRef=T(AF);defaults=T(Ei);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new ve(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Se();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Be$1;toggleChange=new Be$1;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){T(fe).load(qs);let e=T(new Bp("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=T(jt).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new ve(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||t)};static \u0275cmp=FE({type:t,selectors:[["mat-slide-toggle"]],viewQuery:function(i,a){if(i&1&&Ep(Ii,5),i&2){let l;SI(l=xI())&&(a._switchElement=l.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,a){i&2&&(hp("id",a.id),cp("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),UI(a.color?"mat-"+a.color:""),bp("mat-mdc-slide-toggle-focused",a._focused)("mat-mdc-slide-toggle-checked",a.checked)("_mat-animation-noopable",a._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",kF],color:"color",disabled:[2,"disabled","disabled",kF],disableRipple:[2,"disableRipple","disableRipple",kF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:OF(e)],checked:[2,"checked","checked",kF],hideIcon:[2,"hideIcon","hideIcon",kF],disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[cD([{provide:Jo,useExisting:ao$1(()=>t),multi:true},{provide:Nn,useExisting:t,multi:true}]),im],ngContentSelectors:Mi,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,a){if(i&1&&(_I(),si$1(0,"div",1)(1,"button",2,0),mp("click",function(){return a._handleClick()}),up$1(3,"div",3)(4,"span",4),si$1(5,"span",5)(6,"span",6)(7,"span",7),up$1(8,"span",8),Cc(),si$1(9,"span",9),up$1(10,"span",10),Cc(),iI(11,ki,5,0,"span",11),Cc()()(),si$1(12,"label",12),mp("click",function(h){return h.stopPropagation()}),MI(13),Cc()()),i&2){let l=RI(2);lp("labelPosition",a.labelPosition),rv(),bp("mdc-switch--selected",a.checked)("mdc-switch--unselected",!a.checked)("mdc-switch--checked",a.checked)("mdc-switch--disabled",a.disabled)("mat-mdc-slide-toggle-disabled-interactive",a.disabledInteractive),lp("tabIndex",a.disabled&&!a.disabledInteractive?-1:a.tabIndex)("disabled",a.disabled&&!a.disabledInteractive),cp("id",a.buttonId)("name",a.name)("aria-label",a.ariaLabel)("aria-labelledby",a._getAriaLabelledBy())("aria-describedby",a.ariaDescribedby)("aria-required",a.required||null)("aria-checked",a.checked)("aria-disabled",a.disabled&&a.disabledInteractive?"true":null),rv(9),lp("matRippleTrigger",l)("matRippleDisabled",a.disableRipple||a.disabled)("matRippleCentered",true),rv(),sI(a.hideIcon?-1:11),rv(),lp("for",a.buttonId),cp("id",a._labelId);}},dependencies:[zb,di],styles:[`.mdc-switch {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 0;
  position: relative;
  width: var(--mat-slide-toggle-track-width, 52px);
}
.mdc-switch.mdc-switch--disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-switch.mat-mdc-slide-toggle-disabled-interactive {
  pointer-events: auto;
}

.mdc-switch__track {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: var(--mat-slide-toggle-track-height, 32px);
  border-radius: var(--mat-slide-toggle-track-shape, var(--mat-sys-corner-full));
}
.mdc-switch--disabled.mdc-switch .mdc-switch__track {
  opacity: var(--mat-slide-toggle-disabled-track-opacity, 0.12);
}
.mdc-switch__track::before, .mdc-switch__track::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  border-width: var(--mat-slide-toggle-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-track-outline-color, var(--mat-sys-outline));
}
.mdc-switch--selected .mdc-switch__track::before, .mdc-switch--selected .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-selected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-selected-track-outline-color, transparent);
}
.mdc-switch--disabled .mdc-switch__track::before, .mdc-switch--disabled .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-disabled-unselected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-disabled-unselected-track-outline-color, var(--mat-sys-on-surface));
}
@media (forced-colors: active) {
  .mdc-switch__track {
    border-color: currentColor;
  }
}
.mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: translateX(0);
  background: var(--mat-slide-toggle-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch--selected .mdc-switch__track::before {
  transform: translateX(-100%);
}
.mdc-switch--selected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-hover-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-focus-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:active .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-pressed-track-color, var(--mat-sys-surface-variant));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::before, .mdc-switch.mdc-switch--disabled .mdc-switch__track::before {
  background: var(--mat-slide-toggle-disabled-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch__track::after {
  transform: translateX(-100%);
  background: var(--mat-slide-toggle-selected-track-color, var(--mat-sys-primary));
}
[dir=rtl] .mdc-switch__track::after {
  transform: translateX(100%);
}
.mdc-switch--selected .mdc-switch__track::after {
  transform: translateX(0);
}
.mdc-switch--selected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-hover-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-focus-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:active .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-pressed-track-color, var(--mat-sys-primary));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::after, .mdc-switch.mdc-switch--disabled .mdc-switch__track::after {
  background: var(--mat-slide-toggle-disabled-selected-track-color, var(--mat-sys-on-surface));
}

.mdc-switch__handle-track {
  height: 100%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  right: auto;
  transform: translateX(0);
  width: calc(100% - var(--mat-slide-toggle-handle-width));
}
[dir=rtl] .mdc-switch__handle-track {
  left: auto;
  right: 0;
}
.mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(-100%);
}

.mdc-switch__handle {
  display: flex;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: auto;
  transition: width 75ms cubic-bezier(0.4, 0, 0.2, 1), height 75ms cubic-bezier(0.4, 0, 0.2, 1), margin 75ms cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--mat-slide-toggle-handle-width);
  height: var(--mat-slide-toggle-handle-height);
  border-radius: var(--mat-slide-toggle-handle-shape, var(--mat-sys-corner-full));
}
[dir=rtl] .mdc-switch__handle {
  left: auto;
  right: 0;
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle {
  width: var(--mat-slide-toggle-unselected-handle-size, 16px);
  height: var(--mat-slide-toggle-unselected-handle-size, 16px);
  margin: var(--mat-slide-toggle-unselected-handle-horizontal-margin, 0 8px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin, 0 4px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle {
  width: var(--mat-slide-toggle-selected-handle-size, 24px);
  height: var(--mat-slide-toggle-selected-handle-size, 24px);
  margin: var(--mat-slide-toggle-selected-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-selected-with-icon-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch__handle:has(.mdc-switch__icons) {
  width: var(--mat-slide-toggle-with-icon-handle-size, 24px);
  height: var(--mat-slide-toggle-with-icon-handle-size, 24px);
}
.mat-mdc-slide-toggle .mdc-switch:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  width: var(--mat-slide-toggle-pressed-handle-size, 28px);
  height: var(--mat-slide-toggle-pressed-handle-size, 28px);
}
.mat-mdc-slide-toggle .mdc-switch--selected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-selected-pressed-handle-horizontal-margin, 0 22px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-unselected-pressed-handle-horizontal-margin, 0 2px);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-selected-handle-opacity, 1);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-unselected-handle-opacity, 0.38);
}
.mdc-switch__handle::before, .mdc-switch__handle::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  width: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: background-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1), border-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
@media (forced-colors: active) {
  .mdc-switch__handle::before, .mdc-switch__handle::after {
    border-color: currentColor;
  }
}
.mdc-switch--selected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-handle-color, var(--mat-sys-on-primary));
}
.mdc-switch--selected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-hover-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-focus-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-pressed-handle-color, var(--mat-sys-primary-container));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:hover:not(:focus):not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:focus:not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:active .mdc-switch__handle::after, .mdc-switch--selected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-selected-handle-color, var(--mat-sys-surface));
}
.mdc-switch--unselected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-handle-color, var(--mat-sys-outline));
}
.mdc-switch--unselected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-hover-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-focus-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-pressed-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-unselected-handle-color, var(--mat-sys-on-surface));
}
.mdc-switch__handle::before {
  background: var(--mat-slide-toggle-handle-surface-color);
}

.mdc-switch__shadow {
  border-radius: inherit;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.mdc-switch:enabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-handle-elevation-shadow);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__shadow, .mdc-switch.mdc-switch--disabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-disabled-handle-elevation-shadow);
}

.mdc-switch__ripple {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: var(--mat-slide-toggle-state-layer-size, 40px);
  height: var(--mat-slide-toggle-state-layer-size, 40px);
}
.mdc-switch__ripple::after {
  content: "";
  opacity: 0;
}
.mdc-switch--disabled .mdc-switch__ripple::after {
  display: none;
}
.mat-mdc-slide-toggle-disabled-interactive .mdc-switch__ripple::after {
  display: block;
}
.mdc-switch:hover .mdc-switch__ripple::after {
  transition: 75ms opacity cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:focus .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:active .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:hover:not(:focus) .mdc-switch__ripple::after, .mdc-switch--unselected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--unselected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--unselected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-pressed-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}
.mdc-switch--selected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-hover-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--selected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-focus-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--selected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-pressed-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}

.mdc-switch__icons {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-unselected-icon-opacity, 0.38);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-selected-icon-opacity, 0.38);
}

.mdc-switch__icon {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  transition: opacity 30ms 0ms cubic-bezier(0.4, 0, 1, 1);
}
.mdc-switch--unselected .mdc-switch__icon {
  width: var(--mat-slide-toggle-unselected-icon-size, 16px);
  height: var(--mat-slide-toggle-unselected-icon-size, 16px);
  fill: var(--mat-slide-toggle-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__icon {
  width: var(--mat-slide-toggle-selected-icon-size, 16px);
  height: var(--mat-slide-toggle-selected-icon-size, 16px);
  fill: var(--mat-slide-toggle-selected-icon-color, var(--mat-sys-on-primary-container));
}
.mdc-switch--selected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-selected-icon-color, var(--mat-sys-on-surface));
}

.mdc-switch--selected .mdc-switch__icon--on,
.mdc-switch--unselected .mdc-switch__icon--off {
  opacity: 1;
  transition: opacity 45ms 30ms cubic-bezier(0, 0, 0.2, 1);
}

.mat-mdc-slide-toggle {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple,
.mat-mdc-slide-toggle .mdc-switch__ripple::after {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple:not(:empty),
.mat-mdc-slide-toggle .mdc-switch__ripple::after:not(:empty) {
  transform: translateZ(0);
}
.mat-mdc-slide-toggle.mat-mdc-slide-toggle-focused .mat-focus-indicator::before {
  content: "";
}
.mat-mdc-slide-toggle .mat-internal-form-field {
  color: var(--mat-slide-toggle-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-slide-toggle-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-slide-toggle-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-slide-toggle-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-slide-toggle-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-slide-toggle-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-slide-toggle .mat-ripple-element {
  opacity: 0.12;
}
.mat-mdc-slide-toggle .mat-focus-indicator::before {
  border-radius: 50%;
}
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle-track,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__icon,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::after,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::after {
  transition: none;
}
.mat-mdc-slide-toggle .mdc-switch:enabled + .mdc-label {
  cursor: pointer;
}
.mat-mdc-slide-toggle .mdc-switch--disabled + label {
  color: var(--mat-slide-toggle-disabled-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-slide-toggle label:empty {
  display: none;
}

.mat-mdc-slide-toggle-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-slide-toggle-touch-target-size, 48px);
  width: 100%;
  transform: translate(-50%, -50%);
  display: var(--mat-slide-toggle-touch-target-display, block);
}
[dir=rtl] .mat-mdc-slide-toggle-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})}return t})(),ci=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=VE({type:t});static \u0275inj=Pl({imports:[Be,q]})}return t})();var be=12e3,ye=class t{document=T(er);pollTriggers(){let n=()=>this.document.visibilityState==="visible",e=0,i=Fh(be).pipe(Xt(n)),a=Oi$1(this.document,"visibilitychange").pipe(Xt(()=>n()&&Date.now()-e>=be));return Dh(i,a).pipe(re(()=>{e=Date.now();}))}static \u0275fac=function(e){return new(e||t)};static \u0275prov=se({token:t,factory:t.\u0275fac,providedIn:"root"})};var Ri=(t,n)=>n.name;function Ti(t,n){if(t&1&&(si$1(0,"div",17),eD(1),Cc()),t&2){let e=CI().$implicit;rv(),Ap(e.measured.unit);}}function Pi(t,n){if(t&1&&(si$1(0,"div",7)(1,"div",10)(2,"mat-icon",11),eD(3),Cc()(),si$1(4,"div",12)(5,"span",13),eD(6),Cc()(),si$1(7,"div",14)(8,"span",15),eD(9,"Measured"),Cc(),si$1(10,"div",16),eD(11),Cc(),iI(12,Ti,2,1,"div",17),Cc(),si$1(13,"div",18)(14,"span",19),eD(15,"Fix"),Cc(),si$1(16,"wl-collapsible-text"),eD(17),Cc()()()),t&2){let e=n.$implicit;rv(2),bp("badge-critical",e.severity==="critical")("badge-warning",e.severity==="warning"),rv(),Sc(" ",e.severity==="critical"?"error":"warning_amber"," "),rv(3),Ap(e.what),rv(),bp("badge-critical",e.severity==="critical")("badge-warning",e.severity==="warning"),rv(4),Ap(e.measured.value),rv(),sI(e.measured.unit?12:-1),rv(5),Ap(e.fix);}}function Di(t,n){if(t&1&&(si$1(0,"span",21)(1,"span",22),eD(2),Cc()()),t&2){let e=n.$implicit;rv(2),Ap(e);}}function Ai(t,n){if(t&1&&(si$1(0,"div",9)(1,"span",20),eD(2,"On plan"),Cc(),lI(3,Di,3,1,"span",21,aI),Cc()),t&2){let e=CI(2);rv(3),uI(e.ruleOnPlan());}}function Ni(t,n){if(t&1&&(si$1(0,"div",0)(1,"div",1),up$1(2,"div",2),si$1(3,"div")(4,"div",3),eD(5,"Rotation Rules"),Cc(),si$1(6,"div",4),eD(7,"Rotation rules vs top parses."),Cc()(),si$1(8,"div",5),eD(9,"Measured"),Cc(),si$1(10,"div",6),eD(11,"Fix"),Cc()(),lI(12,Pi,18,13,"div",7,aI),iI(14,Ai,5,0,"div",9),Cc()),t&2){let e=CI();rv(12),uI(e.ruleRows()),rv(2),sI(e.ruleOnPlan().length?14:-1);}}function Bi(t,n){if(t&1&&up$1(0,"wl-game-icon",24),t&2){let e=CI().$implicit;lp("id",n)("icon",e.icon)("name",e.name);}}function Li(t,n){if(t&1&&(up$1(0,"span",26),si$1(1,"span",27),eD(2),Cc()),t&2){let e=CI().$implicit;rv(2),Ap(e.name);}}function Vi(t,n){if(t&1&&(si$1(0,"span",25),eD(1),fD(2,"formatDuration"),Cc()),t&2){let e=CI().$implicit;rv(),Ap(hD(2,1,e.timestampMs/1e3));}}function Oi(t,n){if(t&1&&(si$1(0,"span",28),eD(1),Cc()),t&2){let e=CI(2).$implicit;rv(),Ap(e.chip);}}function zi(t,n){if(t&1&&(si$1(0,"span",29),eD(1),Cc()),t&2){let e=CI(2).$implicit;rv(),Ap(e.chip);}}function Hi(t,n){if(t&1&&iI(0,Oi,2,1,"span",28)(1,zi,2,1,"span",29),t&2){let e=CI().$implicit;sI(e.severity==="critical"?0:1);}}function $i(t,n){if(t&1&&(si$1(0,"div",17),eD(1),Cc()),t&2){let e=CI().$implicit;rv(),Ap(e.measured.unit);}}function qi(t,n){if(t&1&&(si$1(0,"div",7)(1,"div",10)(2,"mat-icon",11),eD(3),Cc()(),si$1(4,"div",12)(5,"div",23),iI(6,Bi,1,3,"wl-game-icon",24)(7,Li,3,1),iI(8,Vi,3,3,"span",25),iI(9,Hi,2,1),Cc()(),si$1(10,"div",14)(11,"span",15),eD(12,"Measured"),Cc(),si$1(13,"div",16),eD(14),Cc(),iI(15,$i,2,1,"div",17),Cc(),si$1(16,"div",18)(17,"span",19),eD(18,"Fix"),Cc(),si$1(19,"wl-collapsible-text"),eD(20),Cc()()()),t&2){let e,i=n.$implicit;rv(2),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(),Sc(" ",i.severity==="critical"?"error":"warning_amber"," "),rv(3),sI((e=i.spellId)?6:7,e),rv(2),sI(i.timestampMs!=null?8:-1),rv(),sI(i.chip?9:-1),rv(),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(4),Ap(i.measured.value),rv(),sI(i.measured.unit?15:-1),rv(5),Ap(i.fix);}}function Wi(t,n){t&1&&(si$1(0,"div",8),eD(1,"Nothing flagged."),Cc());}function ji(t,n){if(t&1&&up$1(0,"wl-game-icon",24),t&2){let e=CI().$implicit;lp("id",n)("icon",e.icon)("name",e.name);}}function Gi(t,n){if(t&1&&(up$1(0,"span",30),si$1(1,"span",22),eD(2),Cc()),t&2){let e=CI().$implicit;rv(2),Ap(e.name);}}function Ui(t,n){if(t&1&&(si$1(0,"span",21),iI(1,ji,1,3,"wl-game-icon",24)(2,Gi,3,1),Cc()),t&2){let e,i=n.$implicit;rv(),sI((e=i.spellId)?1:2,e);}}function Zi(t,n){if(t&1&&(si$1(0,"div",9)(1,"span",20),eD(2,"On plan"),Cc(),lI(3,Ui,3,1,"span",21,Ri),Cc()),t&2){let e=CI();rv(3),uI(e.onPlan());}}var xe=class t{rotation=T(ko);spec=MF.required();encounterId=MF.required();reportCode=MF.required();fightId=MF.required();playerId=MF.required();busyChange=_F();ruleRows=xo([]);ruleOnPlan=xo([]);offensiveRows=xo([]);onPlan=xo([]);loadToken=0;constructor(){xu(()=>{let n=this.spec(),e=this.encounterId(),i=this.reportCode(),a=this.fightId(),l=this.playerId(),h=++this.loadToken;this.rotation.loadPlayerView(n,e,i,a,l).then(y=>{h===this.loadToken&&(this.ruleRows.set(y.ruleRows),this.ruleOnPlan.set(y.ruleOnPlan),this.offensiveRows.set(y.offensiveRows),this.onPlan.set(y.onPlan));}).catch(y=>J_("rotation.loadPlayerView",y)).finally(()=>{h===this.loadToken&&this.busyChange.emit(false);});});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-rotation"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],reportCode:[1,"reportCode"],fightId:[1,"fightId"],playerId:[1,"playerId"]},outputs:{busyChange:"busyChange"},decls:17,vars:5,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","tabular-nums","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","pl-[14px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"!text-[18px]","!w-[18px]","!h-[18px]","!leading-[18px]"],[1,"min-w-0"],[1,"text-sm","text-[var(--text)]","leading-[1.35]"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-[7px]","flex-wrap"],[3,"id","icon","name"],[1,"text-[11px]","text-[var(--accent)]","tabular-nums"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[19px]","h-[19px]","shrink-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--critical)]","bg-[var(--critical)]/10","border","border-[var(--critical)]/25"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--warning)]","bg-[var(--warning)]/10","border","border-[var(--warning)]/25"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[16px]","h-[16px]","shrink-0"]],template:function(e,i){e&1&&(iI(0,Ni,15,1,"div",0),si$1(1,"div",0)(2,"div",1),up$1(3,"div",2),si$1(4,"div")(5,"div",3),eD(6,"Offensives"),Cc(),si$1(7,"div",4),eD(8,"Offensive cooldowns vs top parses."),Cc()(),si$1(9,"div",5),eD(10,"Measured"),Cc(),si$1(11,"div",6),eD(12,"Fix"),Cc()(),lI(13,qi,21,15,"div",7,aI),iI(15,Wi,2,0,"div",8),iI(16,Zi,5,0,"div",9),Cc()),e&2&&(sI(i.ruleRows().length||i.ruleOnPlan().length?0:-1),rv(),bp("mt-6",i.ruleRows().length>0),rv(12),uI(i.offensiveRows()),rv(2),sI(!i.offensiveRows().length&&!i.onPlan().length?15:-1),rv(),sI(i.onPlan().length?16:-1));},dependencies:[vv,_v,be$1,It,Ue],encapsulation:2})};var we={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function Ve(t,n){let e=[];for(let i of t)if(i.hasIssue)for(let a of i.findings)e.push({severity:a.severity==="critical"?"critical":"warning",name:i.name,spellId:i.spellId,icon:i.icon,timestampMs:a.timestamp_ms??null,chip:n[a.category],measured:a.measured??{value:"-"},fix:a.details?.remedy});return e}function Oe(t){return t.filter(n=>!n.hasIssue).map(n=>({name:n.name,spellId:n.spellId,icon:n.icon}))}function ze(t,n){let e={},i=[];for(let l of t)if(l.severity!=="success")if(l.category==="hold_suggestion"&&l.details?.cd_name){let h=l.details.cd_name;(e[h]??={issues:[],holds:[]}).holds.push(l);}else if(n.collectRules&&(l.category==="rule_violation"||!l.cd_name))i.push(l);else {let h=l.cd_name;if(!h)continue;(e[h]??={issues:[],holds:[]}).issues.push(l);}for(let l of t){if(l.severity!=="success")continue;let h=l.cd_name;h&&((e[h]??={issues:[],holds:[]}).success=l);}return {entries:Object.entries(e).map(([l,h])=>{let y=h.issues.some(ke=>ke.severity==="critical"),Me=h.issues.length>0||h.holds.length>0,P=[];for(let ke of h.issues){let Ee=we[ke.category];Ee&&!P.includes(Ee)&&P.push(Ee);}return h.holds.length&&P.push(`${h.holds.length} hold${h.holds.length>1?"s":""}`),{name:l,spellId:n.spellId(l),icon:n.icon(l),hasCritical:y,hasIssue:Me,metaItems:P,findings:[...h.issues,...h.holds]}}),ruleFindings:i}}var Xi=(t,n)=>n.name;function Ki(t,n){if(t&1&&(si$1(0,"div",4),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.subtitle());}}function Qi(t,n){if(t&1&&up$1(0,"wl-game-icon",22),t&2){let e=CI(),i=CI().$implicit;lp("id",n)("icon",i.icon)("name",e);}}function Yi(t,n){if(t&1&&(up$1(0,"span",23),si$1(1,"span",24),eD(2),Cc()),t&2){let e=CI();rv(2),Ap(e);}}function Ji(t,n){if(t&1){let e=mI();si$1(0,"button",27),mp("click",function(){su(e);let a=CI(3).$implicit,l=CI();return au(l.onOpenMap(a))}),si$1(1,"mat-icon",28),eD(2,"my_location"),Cc()();}}function en(t,n){if(t&1&&(si$1(0,"span",25),eD(1),fD(2,"formatDuration"),Cc(),iI(3,Ji,3,0,"button",26)),t&2){let e=CI(2).$implicit,i=CI();rv(),Ap(hD(2,2,e.timestampMs/1e3)),rv(2),sI(i.showMap()?3:-1);}}function tn(t,n){if(t&1&&(si$1(0,"span",29),eD(1),Cc()),t&2){let e=CI(3).$implicit;rv(),Ap(e.chip);}}function nn(t,n){if(t&1&&(si$1(0,"span",30),eD(1),Cc()),t&2){let e=CI(3).$implicit;rv(),Ap(e.chip);}}function an(t,n){if(t&1&&iI(0,tn,2,1,"span",29)(1,nn,2,1,"span",30),t&2){let e=CI(2).$implicit;sI(e.severity==="critical"?0:1);}}function on(t,n){if(t&1&&(si$1(0,"div",14),iI(1,Qi,1,3,"wl-game-icon",22)(2,Yi,3,1),iI(3,en,4,4),iI(4,an,2,1),Cc()),t&2){let e,i=CI().$implicit;rv(),sI((e=i.spellId)?1:2,e),rv(2),sI(i.timestampMs!=null?3:-1),rv(),sI(i.chip?4:-1);}}function rn(t,n){if(t&1&&(si$1(0,"span",15),eD(1),Cc()),t&2){let e=CI().$implicit;rv(),Ap(e.what);}}function sn(t,n){if(t&1&&(si$1(0,"div",19),eD(1),Cc()),t&2){let e=CI().$implicit;rv(),Ap(e.measured.unit);}}function ln(t,n){if(t&1&&(si$1(0,"div",10)(1,"div",11)(2,"mat-icon",12),eD(3),Cc()(),si$1(4,"div",13),iI(5,on,5,3,"div",14)(6,rn,2,1,"span",15),Cc(),si$1(7,"div",16)(8,"span",17),eD(9,"Measured"),Cc(),si$1(10,"div",18),eD(11),Cc(),iI(12,sn,2,1,"div",19),Cc(),si$1(13,"div",20)(14,"span",21),eD(15,"Fix"),Cc(),si$1(16,"wl-collapsible-text"),eD(17),Cc()()()),t&2){let e,i=n.$implicit;bp("row-critical",i.severity==="critical"),rv(2),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(),Sc(" ",i.severity==="critical"?"error":"warning_amber"," "),rv(2),sI((e=i.name)?5:6,e),rv(2),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(4),Ap(i.measured.value),rv(),sI(i.measured.unit?12:-1),rv(5),Ap(i.fix);}}function dn(t,n){t&1&&(si$1(0,"div",8),eD(1,"Nothing flagged."),Cc());}function cn(t,n){if(t&1&&up$1(0,"wl-game-icon",22),t&2){let e=CI().$implicit;lp("id",n)("icon",e.icon)("name",e.name);}}function mn(t,n){if(t&1&&(up$1(0,"span",33),si$1(1,"span",34),eD(2),Cc()),t&2){let e=CI().$implicit;rv(2),Ap(e.name);}}function pn(t,n){if(t&1&&(si$1(0,"span",32),iI(1,cn,1,3,"wl-game-icon",22)(2,mn,3,1),Cc()),t&2){let e,i=n.$implicit;rv(),sI((e=i.spellId)?1:2,e);}}function un(t,n){if(t&1&&(si$1(0,"div",9)(1,"span",31),eD(2,"On plan"),Cc(),lI(3,pn,3,1,"span",32,Xi),Cc()),t&2){let e=CI();rv(3),uI(e.onPlan());}}var Ce=class t{title=MF.required();subtitle=MF("");rows=MF.required();onPlan=MF([]);showMap=MF(false);openMap=_F();onOpenMap(n){n.timestampMs==null||!n.name||this.openMap.emit(n);}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-finding-table"]],hostAttrs:[1,"block"],inputs:{title:[1,"title"],subtitle:[1,"subtitle"],rows:[1,"rows"],onPlan:[1,"onPlan"],showMap:[1,"showMap"]},outputs:{openMap:"openMap"},decls:15,vars:4,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","tabular-nums","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--border)]","pl-[14px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]",3,"row-critical"],[1,"border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"!text-[18px]","!w-[18px]","!h-[18px]","!leading-[18px]"],[1,"min-w-0"],[1,"flex","items-center","gap-[7px]","flex-wrap"],[1,"text-sm","text-[var(--text)]","leading-[1.35]"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[3,"id","icon","name"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[19px]","h-[19px]","shrink-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[11px]","text-[var(--accent)]","tabular-nums"],["mat-icon-button","","aria-label","Open positioning map",1,"!w-5","!h-5","!p-0","!leading-5"],["mat-icon-button","","aria-label","Open positioning map",1,"!w-5","!h-5","!p-0","!leading-5",3,"click"],[1,"!text-[16px]","!w-[16px]","!h-[16px]"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--critical)]","bg-[var(--critical)]/10","border","border-[var(--critical)]/25"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--warning)]","bg-[var(--warning)]/10","border","border-[var(--warning)]/25"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[16px]","h-[16px]","shrink-0"],[1,"text-[13px]","text-[var(--muted)]"]],template:function(e,i){e&1&&(si$1(0,"div",0)(1,"div",1),up$1(2,"div",2),si$1(3,"div")(4,"div",3),eD(5),Cc(),iI(6,Ki,2,1,"div",4),Cc(),si$1(7,"div",5),eD(8,"Measured"),Cc(),si$1(9,"div",6),eD(10,"Fix"),Cc()(),lI(11,ln,18,15,"div",7,aI),iI(13,dn,2,0,"div",8),iI(14,un,5,0,"div",9),Cc()),e&2&&(rv(5),Ap(i.title()),rv(),sI(i.subtitle()?6:-1),rv(5),uI(i.rows()),rv(2),sI(!i.rows().length&&!i.onPlan().length?13:-1),rv(),sI(i.onPlan().length?14:-1));},dependencies:[vv,_v,v_,Pd,be$1,It,Ue],encapsulation:2})};function hn(t,n){if(t&1){let e=mI();si$1(0,"wl-finding-table",2),mp("openMap",function(a){su(e);let l=CI();return au(l.onFindingMap(a))}),Cc();}if(t&2){let e=CI();lp("rows",e.findingRows())("onPlan",e.onPlan())("showMap",e.showMap());}}function gn(t,n){if(t&1){let e=mI();si$1(0,"wl-window-comparison",3),mp("openMap",function(a){su(e);let l=CI();return au(l.onOpenMap(a))}),Cc();}if(t&2){let e=CI();bp("mt-6",e.findingRows().length>0||e.onPlan().length>0),lp("windows",e.windows())("higherIsBetter",false)("fightDuration",e.fightDuration())("showCasts",false)("showMap",e.showMap());}}var Ie=class t{defensive=T(Ro);spec=MF.required();encounterId=MF.required();report=MF.required();fight=MF.required();player=MF.required();showMap=MF(false);fightDuration=MF(0);openMap=_F();busyChange=_F();_findings=xo([]);_spellIdsByName=xo({});_iconByName=xo({});_windows=xo([]);_anchors=xo([]);windows=this._windows.asReadonly();loadToken=0;constructor(){xu(()=>{let n=this.spec(),e=this.encounterId(),i=this.report(),a=this.fight(),l=this.player(),h=++this.loadToken;this.defensive.loadAnalysisView(n,e,i,a,l).then(y=>{h===this.loadToken&&(this._findings.set(y.findings),this._spellIdsByName.set(y.spellIdsByName),this._iconByName.set(y.iconByName),this._windows.set(y.windows),this._anchors.set(y.anchors));}).catch(y=>J_("defensive.loadAnalysisView",y)).finally(()=>{h===this.loadToken&&this.busyChange.emit(false);});});}entries=ED(()=>{let n=this._spellIdsByName(),e=this._iconByName();return ze(this._findings(),{spellId:i=>n[i]??null,icon:i=>e[i]}).entries});findingRows=ED(()=>Ve(this.entries(),we));onPlan=ED(()=>Oe(this.entries()));onOpenMap(n){let e=this._anchors()[n];e&&this.openMap.emit(e);}onFindingMap(n){if(n.timestampMs==null)return;let e=n.spellId!=null&&n.name!=null?[{id:n.spellId,icon:n.icon,name:n.name}]:[];this.openMap.emit({timeS:n.timestampMs/1e3,label:n.name??"Defensive",spells:e,refGameId:null});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-defensive"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],fightDuration:[1,"fightDuration"]},outputs:{openMap:"openMap",busyChange:"busyChange"},decls:2,vars:2,consts:[["title","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"rows","onPlan","showMap"],["title","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"mt-6","windows","higherIsBetter","fightDuration","showCasts","showMap"],["title","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"openMap","rows","onPlan","showMap"],["title","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"openMap","windows","higherIsBetter","fightDuration","showCasts","showMap"]],template:function(e,i){e&1&&(iI(0,hn,1,3,"wl-finding-table",0),iI(1,gn,1,7,"wl-window-comparison",1)),e&2&&(sI(i.findingRows().length||i.onPlan().length?0:-1),rv(),sI(i.windows().length>0?1:-1));},dependencies:[Ce,kt],encapsulation:2})};var mi=(t,n)=>n.id;function fn(t,n){if(t&1&&(si$1(0,"span",13),up$1(1,"wl-art-icon",15),fD(2,"bossIcon"),si$1(3,"span",16),eD(4),fD(5,"formatDuration"),Cc()()),t&2){let e=n;rv(),lp("src",hD(2,5,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",hD(5,7,e.duration_s));}}function _n(t,n){if(t&1&&(si$1(0,"mat-option",14)(1,"span",13),up$1(2,"wl-art-icon",15),fD(3,"bossIcon"),si$1(4,"span",16),eD(5),fD(6,"formatDuration"),Cc()()()),t&2){let e=n.$implicit;lp("value",e.id),rv(2),lp("src",hD(3,6,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",hD(6,8,e.duration_s));}}function vn(t,n){if(t&1&&(up$1(0,"wl-art-icon",15),fD(1,"specIcon"),fD(2,"formatSpec")),t&2){let e=n;lp("src",hD(1,2,e))("alt",hD(2,4,e));}}function bn(t,n){if(t&1&&(up$1(0,"wl-art-icon",15),fD(1,"classIcon")),t&2){let e=CI();lp("src",hD(1,2,e.spec))("alt",e.spec);}}function yn(t,n){if(t&1&&(si$1(0,"span",13),iI(1,vn,3,6,"wl-art-icon",15)(2,bn,2,4,"wl-art-icon",15),si$1(3,"span",16),eD(4),Cc()()),t&2){let e,i=n,a=CI(2);rv(),sI((e=a.playerSpecs()[i.id])?1:2,e),rv(3),Ap(i.name);}}function xn(t,n){if(t&1&&(up$1(0,"wl-art-icon",15),fD(1,"specIcon"),fD(2,"formatSpec")),t&2){let e=n;lp("src",hD(1,2,e))("alt",hD(2,4,e));}}function wn(t,n){if(t&1&&(up$1(0,"wl-art-icon",15),fD(1,"classIcon")),t&2){let e=CI().$implicit;lp("src",hD(1,2,e.spec))("alt",e.spec);}}function Cn(t,n){if(t&1&&(si$1(0,"mat-option",14)(1,"span",13),iI(2,xn,3,6,"wl-art-icon",15)(3,wn,2,4,"wl-art-icon",15),si$1(4,"span",16),eD(5),Cc()()()),t&2){let e,i=n.$implicit,a=CI(2);lp("value",i.id),rv(2),sI((e=a.playerSpecs()[i.id])?2:3,e),rv(3),Ap(i.name);}}function In(t,n){if(t&1){let e=mI();si$1(0,"div",5)(1,"div",10)(2,"mat-form-field",11)(3,"mat-label"),eD(4,"Fight"),Cc(),si$1(5,"mat-select",12),mp("selectionChange",function(){su(e);let a=CI();return au(a.onFightChange())}),si$1(6,"mat-select-trigger"),iI(7,fn,6,9,"span",13),Cc(),lI(8,_n,7,10,"mat-option",14,mi),Cc(),Qv(),Cc(),si$1(10,"mat-form-field",11)(11,"mat-label"),eD(12,"Player"),Cc(),si$1(13,"mat-select",12),mp("selectionChange",function(){su(e);let a=CI();return au(a.onPlayerChange())}),si$1(14,"mat-select-trigger"),iI(15,yn,5,2,"span",13),Cc(),lI(16,Cn,6,3,"mat-option",14,mi),Cc(),Qv(),Cc()()();}if(t&2){let e,i,a=CI();rv(2),bp("opacity-50",a.liveSyncEnabled())("pointer-events-none",a.liveSyncEnabled()),rv(3),lp("formControl",a.fightControl),Yv(),rv(2),sI((e=a.selectedFight())?7:-1,e),rv(),uI(a.fights()),rv(5),lp("formControl",a.playerControl),Yv(),rv(2),sI((i=a.selectedPlayer())?15:-1,i),rv(),uI(a.visiblePlayers());}}function Mn(t,n){if(t&1&&(si$1(0,"div",6),eD(1),Cc()),t&2){let e=CI();rv(),Sc(" ",e.status()," ");}}function kn(t,n){if(t&1&&(si$1(0,"div",7),eD(1),Cc()),t&2){let e=CI();rv(),Ap(e.error());}}function En(t,n){if(t&1&&up$1(0,"wl-loading-spinner",8),t&2){let e=CI();lp("message",e.loadingMsg());}}function Fn(t,n){if(t&1){let e=mI();si$1(0,"div",17)(1,"wl-rotation",18),mp("busyChange",function(a){su(e);let l=CI();return au(l.rotationBusy.set(a))}),Cc(),si$1(2,"wl-burst-windows",19),mp("openMap",function(a){su(e);let l=CI();return au(l.onOpenMap(a))})("busyChange",function(a){su(e);let l=CI();return au(l.burstBusy.set(a))}),Cc(),si$1(3,"wl-defensive",20),mp("openMap",function(a){su(e);let l=CI();return au(l.onDefensiveOpenMap(a))})("busyChange",function(a){su(e);let l=CI();return au(l.defensiveBusy.set(a))}),Cc(),si$1(4,"wl-gear",21),mp("busyChange",function(a){su(e);let l=CI();return au(l.gearBusy.set(a))}),Cc(),up$1(5,"wl-credits",22),Cc();}if(t&2){let e=CI();bp("hidden",e.cardsBusy()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("reportCode",e.reportCode())("fightId",e.selectedFightId())("playerId",e.selectedPlayerId()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("showMap",e.mapReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("fightDuration",e.selectedFightDuration())("showMap",e.mapReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId());}}function fi(t){let n=t.match(/\/reports\/([a-zA-Z0-9]+)/);return n?n[1]:t.trim()}function _i(t){return /^[a-zA-Z0-9]{16}$/.test(t)}function Sn(t=[]){let n={};return (t||[]).filter(e=>(e.encounterID||0)>0).sort((e,i)=>e.startTime-i.startTime).map(e=>{let i=e.encounterID||0;return n[i]=(n[i]||0)+1,U($({},e),{duration_s:Math.round((e.endTime-e.startTime)/100)/10,attempt:n[i]})})}function Rn(t=[]){return (t||[]).map(n=>({id:n.id,name:n.name,spec:n.subType||"Unknown",server:n.server||""})).sort((n,e)=>n.name.localeCompare(e.name))}function pi(t,n,e){let a=t.find(l=>l.id===e)?.friendlyPlayers;return a?.length?n.filter(l=>a.includes(l.id)):n}function Tn(t,n){return n||(t[0]?.id??null)}function ui(t,n){if(n){let e=t.find(i=>i.name.toLowerCase()===n.toLowerCase());if(e)return e.id}return Tn(t,null)}function Pn(t){let n=(t.value??"").trim();return n?_i(fi(n))?null:{invalidReportCode:true}:null}function hi(t,n){for(let e of ["dps","healers","tanks","unknown"])for(let i of t[e]??[]){if(i.id!==n)continue;let a=(i.type??"").replace(/ /g,""),l=((i.specs??[])[0]?.spec??"").replace(/ /g,"");return l&&a?l+a:""}return ""}var gi=class t{wclApi=T(pa);mapFeature=T(Ye);liveMode=T(Kn);liveSync=T(ye);selectionStore=T(So);reportControl=new ql("",{nonNullable:true,validators:[Pn]});fightControl=new ql(null);playerControl=new ql(null);liveControl=new ql(false,{nonNullable:true});loadingReport=xo(false);loadingAnalysis=xo(false);loadingMsg=xo("Loading\u2026");rotationBusy=xo(true);burstBusy=xo(true);defensiveBusy=xo(true);gearBusy=xo(true);cardsBusy=ED(()=>this.rotationBusy()||this.burstBusy()||this.defensiveBusy()||this.gearBusy());error=xo("");status=xo("");fights=xo([]);players=xo([]);selectedFightId=Ym(this.fightControl.valueChanges,{initialValue:this.fightControl.value});selectedPlayerId=Ym(this.playerControl.valueChanges,{initialValue:this.playerControl.value});liveSyncEnabled=Ym(this.liveControl.valueChanges,{initialValue:this.liveControl.value});spec=xo("");playerDetailGroups=xo({});reportCode=xo("");_enemies=[];visiblePlayers=ED(()=>pi(this.fights(),this.players(),this.selectedFightId()));playerSpecs=ED(()=>{let n=this.playerDetailGroups(),e={};for(let i of this.visiblePlayers())e[i.id]=hi(n,i.id);return e});selectedFight=ED(()=>this.fights().find(n=>n.id===this.selectedFightId()));selectedPlayer=ED(()=>this.visiblePlayers().find(n=>n.id===this.selectedPlayerId()));selectedEncounterId=ED(()=>this.fights().find(n=>n.id===this.selectedFightId())?.encounterID??0);selectedFightDuration=ED(()=>this.fights().find(n=>n.id===this.selectedFightId())?.duration_s??0);ready=ED(()=>!!this.spec()&&!!this.reportCode()&&!!this.selectedFightId()&&!!this.selectedPlayerId()&&!!this.selectedEncounterId());mapReady(){return this.mapFeature.ready()}onOpenMap(n){this.mapFeature.openAt(n);}onDefensiveOpenMap(n){this.mapFeature.openAt({timeS:n.timeS,label:n.label,spells:n.spells,reference:n.refGameId!=null?{kind:"enemy",gameId:n.refGameId}:{kind:"boss"}});}_pollingSub=Eh([Gm(this.liveSyncEnabled),Gm(this.reportCode)]).pipe(al(([n,e])=>{n&&!e?this.status.set("Load a report to start live sync."):n||this.status.set("");}),re(([n,e])=>n&&!!e),il(),Th(n=>n?Dh(Ri$1(void 0),this.liveSync.pollTriggers()):Fe),sl(()=>we$1(this._pollOnce())),Wm()).subscribe();onPaste(){setTimeout(()=>{this.loadReport();});}async loadReport(){this.error.set("");let n=fi(this.reportControl.value.trim());if(!_i(n)){n&&this.error.set("Enter a valid Warcraft Logs report URL or 16-character report code.");return}this.reportCode.set(""),this.loadingReport.set(true),this.fights.set([]),this.players.set([]),this.spec.set(""),this.playerDetailGroups.set({}),this.mapFeature.clear();try{this.loadingMsg.set("Fetching report from WCL\u2026");let e=await this.wclApi.getReport(n);this._applyReport(e);let i=this.fights()[this.fights().length-1];this.fightControl.setValue(i?.id??null),this._applyAutoPlayer(),this.reportCode.set(n),this._persistPlayerName(),await this.resolveSelection();}catch(e){J_("PostRaidComponent.loadReport",e),this.error.set(e instanceof Error?e.message:"Failed to load report.");}finally{this.loadingReport.set(false);}}_applyReport(n){this.fights.set(Sn(n.fights)),this.players.set(Rn(n.masterData?.actors)),this._enemies=n.masterData?.enemies??[];}onLiveToggle(){this.liveMode.active.set(this.liveControl.value);}async _pollOnce(){this.error.set(""),this.status.set("Checking for new pulls\u2026");try{let n=await this.wclApi.getReport(this.reportCode());this._applyReport(n);let e=this.fights()[this.fights().length-1];if(!e){this.status.set("No boss pulls found.");return}if(this.selectedFightId()===e.id&&this.ready()){this.status.set(`Last updated ${new Date().toLocaleTimeString()} \xB7 Polling every ${be/1e3}s`);return}let i=this.players().find(l=>l.id===this.selectedPlayerId())?.name??null,a=pi(this.fights(),this.players(),e.id);this.fightControl.setValue(e.id),this.playerControl.setValue(ui(a,i)),this._persistPlayerName(),await this.resolveSelection(),this.status.set(`Updated ${new Date().toLocaleTimeString()} \xB7 ${e.name}`);}catch(n){J_("PostRaidComponent._pollOnce",n),this.error.set(n instanceof Error?n.message:"Poll failed.");}}async onFightChange(){this.liveSyncEnabled()||(this._applyAutoPlayer(),this._persistPlayerName(),await this.resolveSelection());}async onPlayerChange(){this.liveSyncEnabled()||(this._persistPlayerName(),await this.resolveSelection());}async resolveSelection(){this.error.set("");let n=this.selectedFightId(),e=this.selectedPlayerId();if(this.spec.set(""),this.mapFeature.clear(),!(!n||!e)){this.loadingAnalysis.set(true),this.loadingMsg.set("Resolving spec\u2026");try{let i=await this.wclApi.getPlayerDetails(this.reportCode(),n);this.playerDetailGroups.set(i);let a=hi(i,e);if(!a){this.error.set("Could not resolve the selected player's spec.");return}this.spec.set(a),this.rotationBusy.set(!0),this.burstBusy.set(!0),this.defensiveBusy.set(!0),this.gearBusy.set(!0),this.loadingMsg.set("Analyzing your log\u2026");let l=this.fights().find(h=>h.id===n);l&&this.mapFeature.prepare(this.reportCode(),l,e,a,this._enemies);}catch(i){J_("PostRaidComponent.resolveSelection",i),this.error.set(i instanceof Error?i.message:"Failed to resolve selection.");}finally{this.loadingAnalysis.set(false);}}}_applyAutoPlayer(){let n=this.selectionStore.loadPostRaid()?.playerName??null;this.playerControl.setValue(ui(this.visiblePlayers(),n));}_persistPlayerName(){let n=this.players().find(e=>e.id===this.selectedPlayerId())?.name??null;n&&this.selectionStore.savePostRaid({playerName:n});}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=FE({type:t,selectors:[["wl-post-raid"]],decls:16,vars:7,consts:[[1,"mx-auto","max-w-[860px]","px-3","md:px-4","pt-6","pb-12"],[1,"mb-5","p-4"],["appearance","outline",1,"w-full"],["matInput","","placeholder","https://www.warcraftlogs.com/reports/AbCdEfGh\u2026",3,"keydown.enter","paste","formControl"],[1,"mt-2",3,"change","formControl"],[1,"mt-4","border-t","border-[var(--border)]","pt-4"],[1,"mb-4","rounded-lg","border-l-[3px]","border-[var(--accent)]","px-3","py-2","text-[13px]","text-[var(--muted)]"],[1,"mb-4","rounded-lg","border","border-[var(--critical)]/30","bg-[var(--critical)]/10","px-4","py-3.5","text-[13px]","text-[var(--critical)]"],[3,"message"],[1,"flex","flex-col","gap-6",3,"hidden"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],[3,"src","alt"],[1,"truncate"],[1,"flex","flex-col","gap-6"],[3,"busyChange","spec","encounterId","reportCode","fightId","playerId"],[3,"openMap","busyChange","spec","encounterId","report","fight","player","showMap"],[3,"openMap","busyChange","spec","encounterId","report","fight","player","fightDuration","showMap"],[3,"busyChange","spec","encounterId","report","fight","player"],[3,"spec","encounterId"]],template:function(e,i){e&1&&(si$1(0,"div",0)(1,"mat-card",1)(2,"mat-form-field",2)(3,"mat-label"),eD(4,"Warcraft Logs Report URL or Code"),Cc(),si$1(5,"input",3),mp("keydown.enter",function(){return i.loadReport()})("paste",function(){return i.onPaste()}),Cc(),Qv(),si$1(6,"mat-error"),eD(7,"Paste a Warcraft Logs report URL or a 16-character report code."),Cc()(),si$1(8,"mat-slide-toggle",4),mp("change",function(){return i.onLiveToggle()}),eD(9," Live sync (follow latest pull) "),Cc(),Qv(),iI(10,In,18,8,"div",5),Cc(),iI(11,Mn,2,1,"div",6),iI(12,kn,2,1,"div",7),iI(13,En,1,1,"wl-loading-spinner",8),iI(14,Fn,6,27,"div",9),up$1(15,"wl-map-panel"),Cc()),e&2&&(rv(5),lp("formControl",i.reportControl),Yv(),rv(3),lp("formControl",i.liveControl),Yv(),rv(2),sI(i.fights().length?10:-1),rv(),sI(i.liveSyncEnabled()&&i.status()?11:-1),rv(),sI(i.error()?12:-1),rv(),sI(i.loadingReport()||i.loadingAnalysis()||i.ready()&&i.cardsBusy()?13:-1),rv(),sI(i.ready()&&!i.loadingAnalysis()?14:-1));},dependencies:[fp,es,up,td,yt,xt,nt,oa,li,si,Bi$1,Ni$1,oc,qe,v_,uc,pc,ci,Be,zi$1,yo,xe,ji$1,Ie,io,ao,ho,Ue,go,_o,bo,xo$1],encapsulation:2})};
export{gi as PostRaidComponent,Sn as buildFights,Rn as buildPlayers,fi as extractCode,_i as isValidReportCode,ui as pickLivePlayerId,Tn as pickPlayerId,hi as specOf,pi as visiblePlayersOf};