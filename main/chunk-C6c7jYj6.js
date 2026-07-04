import {t as te,Q as Qe,M as Mt,A as Ar,x as xt,y as yt,e as et,w as wo,$ as $i$1,B as Bi$1,S as Sc,z as ze,F as Fc,P as Pc,X as Xi$1,R as Rr,J as Ji$1,f as fr,a as Mr,G as Ge,D as Dr,I as Ir,T as Tr,E as Er,b as Pi$1,v as vt,O as Oi$2,c as St,d as bt,g as zr,j as je,H as Hr,k as kt,h as he$1,i as Ft}from'./chunk-DBQjBDaj.js';import {T,m as ml,x as xo,I as ID,n as nm,E as Eh,t as tm,c as cl,r as re,a as sl,d as Th,F as Fe,D as Dh,R as Ri,e as al,f as em,g as F_,h as FE,w as wm,V as Vo,y as ym,i as bl,j as I_,k as si$1,l as tD,o as bc,p as mp,Q as Qv,q as sI,u as up,v as rv,z as lp,Y as Yv,A as aI,B as lD,C as tr,G as Fh,X as Xt,O as Oi$1,s as se,U,$,H as VE,L as Ll,J as q$1,M as yr,N as V,P as ot,S as Me,W as $v,Z as Lt,_ as x,a0 as ee,a1 as Ug,a2 as Li$1,a3 as Rg,a4 as fl,a5 as yl,a6 as Ys,a7 as Au,a8 as $E,a9 as im,aa as kF,ab as hp,ac as cp,ad as bp,ae as Ji$2,af as AF,ag as Ee,ah as Be,ai as he,aj as Is,ak as Bp,al as Qg,am as MI,an as NI,ao as kI,ap as Lo,aq as On,ar as co,as as OF,at as WI,au as Ep,av as xI,aw as AI,ax as MF,ay as _F,az as yI,aA as uI,aB as bI,aC as dI,aD as xc,aE as Ap,aF as au,aG as cu,aH as fr$1,aI as ie,aJ as mr,aK as Iu,aL as ob,aM as rb,aN as Ql,aO as pD,aP as gD,aQ as kp,aR as cI,aS as we}from'./main-YB3BQTHP.js';var bi=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=FE({type:i,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(t,a){},styles:[`textarea.cdk-textarea-autosize {
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
`],encapsulation:2})}return i})(),yi={passive:true},oi=(()=>{class i{_platform=T(V);_ngZone=T(Me);_renderer=T(fr$1).createRenderer(null,null);_styleLoader=T(he);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return Fe;this._styleLoader.load(bi);let t=ie(e),a=this._monitoredElements.get(t);if(a)return a.subject;let o=new ee,c="cdk-text-field-autofilled",T=R=>{R.animationName==="cdk-text-field-autofill-start"&&!t.classList.contains(c)?(t.classList.add(c),this._ngZone.run(()=>o.next({target:R.target,isAutofilled:true}))):R.animationName==="cdk-text-field-autofill-end"&&t.classList.contains(c)&&(t.classList.remove(c),this._ngZone.run(()=>o.next({target:R.target,isAutofilled:false})));},we=this._ngZone.runOutsideAngular(()=>(t.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(t,"animationstart",T,yi)));return this._monitoredElements.set(t,{subject:o,unlisten:we}),o}stopMonitoring(e){let t=ie(e),a=this._monitoredElements.get(t);a&&(a.unlisten(),a.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t));}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t));}static \u0275fac=function(t){return new(t||i)};static \u0275prov=mr({token:i,factory:i.\u0275fac})}return i})();var ri=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=VE({type:i});static \u0275inj=Ll({})}return i})();var si=new x("MAT_INPUT_VALUE_ACCESSOR");var wi=["button","checkbox","file","hidden","image","radio","range","reset","submit"],Ci=new x("MAT_INPUT_CONFIG"),li=(()=>{class i{_elementRef=T(yr);_platform=T(V);ngControl=T(ot,{optional:true,self:true});_autofillMonitor=T(oi);_ngZone=T(Me);_formField=T(vt,{optional:true});_renderer=T($v);_uid=T(Lt).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=T(Ci,{optional:true});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=false;_isNativeSelect=false;_isTextarea=false;_isInFormField=false;focused=false;stateChanges=new ee;controlType="mat-input";autofilled=false;get disabled(){return this._disabled}set disabled(e){this._disabled=Ug(e),this.focused&&(this.focused=false,this.stateChanges.next());}_disabled=false;get id(){return this._id}set id(e){this._id=e||this._uid;}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(Li$1.required)??false}set required(e){this._required=Ug(e);}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&Rg().has(this._type)&&(this._elementRef.nativeElement.type=this._type);}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next());}get readonly(){return this._readonly}set readonly(e){this._readonly=Ug(e);}_readonly=false;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>Rg().has(e));constructor(){let e=T(fl,{optional:true}),t=T(yl,{optional:true}),a=T(Oi$2),o=T(si,{optional:true,self:true}),c=this._elementRef.nativeElement,T$1=c.nodeName.toLowerCase();o?Ys(o.value)?this._signalBasedValueAccessor=o:this._inputValueAccessor=o:this._inputValueAccessor=c,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(c,"keyup",this._iOSKeyupListener);}),this._errorStateTracker=new St(a,this.ngControl,t,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=T$1==="select",this._isTextarea=T$1==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||false,this._isNativeSelect&&(this.controlType=c.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&Au(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next();});}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next();});}ngOnChanges(){this.stateChanges.next();}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.();}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder();}focus(e){this._elementRef.nativeElement.focus(e);}updateErrorState(){this._errorStateTracker.updateErrorState();}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let t=this._elementRef.nativeElement;t.type==="number"?(t.type="text",t.setSelectionRange(0,0),t.type="number"):t.setSelectionRange(0,0);}this.focused=e,this.stateChanges.next();}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next());}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder");}}_getPlaceholder(){return this.placeholder||null}_validateType(){wi.indexOf(this._type)>-1;}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return !this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby");}onContainerClick(){this.focused||this.focus();}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let t=e.target;!t.value&&t.selectionStart===0&&t.selectionEnd===0&&(t.setSelectionRange(1,1),t.setSelectionRange(0,0));};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(t){return new(t||i)};static \u0275dir=$E({type:i,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(t,a){t&1&&mp("focus",function(){return a._focusChanged(true)})("blur",function(){return a._focusChanged(false)})("input",function(){return a._onInput()}),t&2&&(hp("id",a.id)("disabled",a.disabled&&!a.disabledInteractive)("required",a.required),cp("name",a.name||null)("readonly",a._getReadonlyAttribute())("aria-disabled",a.disabled&&a.disabledInteractive?"true":null)("aria-invalid",a.empty&&a.required?null:a.errorState)("aria-required",a.required)("id",a.id),bp("mat-input-server",a._isServer)("mat-mdc-form-field-textarea-control",a._isInFormField&&a._isTextarea)("mat-mdc-form-field-input-control",a._isInFormField)("mat-mdc-input-disabled-interactive",a.disabledInteractive)("mdc-text-field__input",a._isInFormField)("mat-mdc-native-select-inline",a._isInlineSelect()));},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},exportAs:["matInput"],features:[lD([{provide:bt,useExisting:i}]),im]})}return i})(),di=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=VE({type:i});static \u0275inj=Ll({imports:[xt,xt,ri,q$1]})}return i})();var Mi=["*"],ci=(()=>{class i{labelPosition="after";static \u0275fac=function(t){return new(t||i)};static \u0275cmp=FE({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(t,a){t&2&&bp("mdc-form-field--align-end",a.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Mi,decls:1,vars:0,template:function(t,a){t&1&&(MI(),NI(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Ii=["switch"],ki=["*"];function Fi(i,n){i&1&&(si$1(0,"span",11),Iu(),si$1(1,"svg",13),up(2,"path",14),bc(),si$1(3,"svg",15),up(4,"path",16),bc()());}var Pi=new x("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),ge=class{source;checked;constructor(n,e){this.source=n,this.checked=e;}},Se=(()=>{class i{_elementRef=T(yr);_focusMonitor=T(Ji$2);_changeDetectorRef=T(AF);defaults=T(Pi);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new ge(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ee();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Be;toggleChange=new Be;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){T(he).load(Is);let e=T(new Bp("tabindex"),{optional:true}),t=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=t.color||"accent",this.id=this._uniqueId=T(Lt).getId("mat-mdc-slide-toggle-"),this.hideIcon=t.hideIcon??false,this.disabledInteractive=t.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new ge(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=FE({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(t,a){if(t&1&&Ep(Ii,5),t&2){let o;xI(o=AI())&&(a._switchElement=o.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(t,a){t&2&&(hp("id",a.id),cp("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),WI(a.color?"mat-"+a.color:""),bp("mat-mdc-slide-toggle-focused",a._focused)("mat-mdc-slide-toggle-checked",a.checked)("_mat-animation-noopable",a._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",kF],color:"color",disabled:[2,"disabled","disabled",kF],disableRipple:[2,"disableRipple","disableRipple",kF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:OF(e)],checked:[2,"checked","checked",kF],hideIcon:[2,"hideIcon","hideIcon",kF],disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[lD([{provide:Lo,useExisting:co(()=>i),multi:true},{provide:On,useExisting:i,multi:true}]),im],ngContentSelectors:ki,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(t,a){if(t&1&&(MI(),si$1(0,"div",1)(1,"button",2,0),mp("click",function(){return a._handleClick()}),up(3,"div",3)(4,"span",4),si$1(5,"span",5)(6,"span",6)(7,"span",7),up(8,"span",8),bc(),si$1(9,"span",9),up(10,"span",10),bc(),sI(11,Fi,5,0,"span",11),bc()()(),si$1(12,"label",12),mp("click",function(c){return c.stopPropagation()}),NI(13),bc()()),t&2){let o=kI(2);lp("labelPosition",a.labelPosition),rv(),bp("mdc-switch--selected",a.checked)("mdc-switch--unselected",!a.checked)("mdc-switch--checked",a.checked)("mdc-switch--disabled",a.disabled)("mat-mdc-slide-toggle-disabled-interactive",a.disabledInteractive),lp("tabIndex",a.disabled&&!a.disabledInteractive?-1:a.tabIndex)("disabled",a.disabled&&!a.disabledInteractive),cp("id",a.buttonId)("name",a.name)("aria-label",a.ariaLabel)("aria-labelledby",a._getAriaLabelledBy())("aria-describedby",a.ariaDescribedby)("aria-required",a.required||null)("aria-checked",a.checked)("aria-disabled",a.disabled&&a.disabledInteractive?"true":null),rv(9),lp("matRippleTrigger",o)("matRippleDisabled",a.disableRipple||a.disabled)("matRippleCentered",true),rv(),aI(a.hideIcon?-1:11),rv(),lp("for",a.buttonId),cp("id",a._labelId);}},dependencies:[Qg,ci],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),mi=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=VE({type:i});static \u0275inj=Ll({imports:[Se,q$1]})}return i})();var fe=12e3,_e=class i{document=T(tr);pollTriggers(){let n=()=>this.document.visibilityState==="visible",e=0,t=Fh(fe).pipe(Xt(n)),a=Oi$1(this.document,"visibilitychange").pipe(Xt(()=>n()&&Date.now()-e>=fe));return Dh(t,a).pipe(re(()=>{e=Date.now();}))}static \u0275fac=function(e){return new(e||i)};static \u0275prov=se({token:i,factory:i.\u0275fac,providedIn:"root"})};var ve={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function Te(i,n){let e=[];for(let t of i)if(t.hasIssue)for(let a of t.findings)e.push({severity:a.severity==="critical"?"critical":"warning",name:t.name,spellId:t.spellId,icon:t.icon,timestampMs:a.timestamp_ms??null,chip:n[a.category],measured:a.measured??{value:"-"},fix:a.details?.remedy});return e}function Ae(i){return i.filter(n=>!n.hasIssue).map(n=>({name:n.name,spellId:n.spellId,icon:n.icon}))}function Ne(i,n){let e={},t=[];for(let o of i)if(o.severity!=="success")if(o.category==="hold_suggestion"&&o.details?.cd_name){let c=o.details.cd_name;(e[c]??={issues:[],holds:[]}).holds.push(o);}else if(n.collectRules&&(o.category==="rule_violation"||!o.cd_name))t.push(o);else {let c=o.cd_name;if(!c)continue;(e[c]??={issues:[],holds:[]}).issues.push(o);}for(let o of i){if(o.severity!=="success")continue;let c=o.cd_name;c&&((e[c]??={issues:[],holds:[]}).success=o);}return {entries:Object.entries(e).map(([o,c])=>{let T=c.issues.some(Ce=>Ce.severity==="critical"),we=c.issues.length>0||c.holds.length>0,R=[];for(let Ce of c.issues){let xe=ve[Ce.category];xe&&!R.includes(xe)&&R.push(xe);}return c.holds.length&&R.push(`${c.holds.length} hold${c.holds.length>1?"s":""}`),{name:o,spellId:n.spellId(o),icon:n.icon(o),hasCritical:T,hasIssue:we,metaItems:R,findings:[...c.issues,...c.holds]}}),ruleFindings:t}}var Ei=(i,n)=>n.name;function Di(i,n){if(i&1&&(si$1(0,"div",4),tD(1),bc()),i&2){let e=bI();rv(),Ap(e.subtitle());}}function Si(i,n){if(i&1&&up(0,"wl-game-icon",22),i&2){let e=bI(),t=bI().$implicit;lp("id",n)("icon",t.icon)("name",e);}}function Ti(i,n){if(i&1&&(up(0,"span",23),si$1(1,"span",24),tD(2),bc()),i&2){let e=bI();rv(2),Ap(e);}}function Ai(i,n){if(i&1){let e=yI();si$1(0,"button",27),mp("click",function(){au(e);let a=bI(3).$implicit,o=bI();return cu(o.onOpenMap(a))}),si$1(1,"mat-icon",28),tD(2,"my_location"),bc()();}}function Ni(i,n){if(i&1&&(si$1(0,"span",25),tD(1),pD(2,"formatDuration"),bc(),sI(3,Ai,3,0,"button",26)),i&2){let e=bI(2).$implicit,t=bI();rv(),Ap(gD(2,2,e.timestampMs/1e3)),rv(2),aI(t.showMap()?3:-1);}}function Bi(i,n){if(i&1&&(si$1(0,"span",29),tD(1),bc()),i&2){let e=bI(3).$implicit;rv(),Ap(e.chip);}}function Li(i,n){if(i&1&&(si$1(0,"span",30),tD(1),bc()),i&2){let e=bI(3).$implicit;rv(),Ap(e.chip);}}function Vi(i,n){if(i&1&&sI(0,Bi,2,1,"span",29)(1,Li,2,1,"span",30),i&2){let e=bI(2).$implicit;aI(e.severity==="critical"?0:1);}}function Oi(i,n){if(i&1&&(si$1(0,"div",14),sI(1,Si,1,3,"wl-game-icon",22)(2,Ti,3,1),sI(3,Ni,4,4),sI(4,Vi,2,1),bc()),i&2){let e,t=bI().$implicit;rv(),aI((e=t.spellId)?1:2,e),rv(2),aI(t.timestampMs!=null?3:-1),rv(),aI(t.chip?4:-1);}}function zi(i,n){if(i&1&&(si$1(0,"span",15),tD(1),bc()),i&2){let e=bI().$implicit;rv(),Ap(e.what);}}function Hi(i,n){if(i&1&&(si$1(0,"div",19),tD(1),bc()),i&2){let e=bI().$implicit;rv(),Ap(e.measured.unit);}}function qi(i,n){if(i&1&&(si$1(0,"div",10)(1,"div",11)(2,"mat-icon",12),tD(3),bc()(),si$1(4,"div",13),sI(5,Oi,5,3,"div",14)(6,zi,2,1,"span",15),bc(),si$1(7,"div",16)(8,"span",17),tD(9,"Measured"),bc(),si$1(10,"div",18),tD(11),bc(),sI(12,Hi,2,1,"div",19),bc(),si$1(13,"div",20)(14,"span",21),tD(15,"Fix"),bc(),si$1(16,"wl-collapsible-text"),tD(17),bc()()()),i&2){let e,t=n.$implicit;bp("row-critical",t.severity==="critical"),rv(2),bp("badge-critical",t.severity==="critical")("badge-warning",t.severity==="warning"),rv(),xc(" ",t.severity==="critical"?"error":"warning_amber"," "),rv(2),aI((e=t.name)?5:6,e),rv(2),bp("badge-critical",t.severity==="critical")("badge-warning",t.severity==="warning"),rv(4),Ap(t.measured.value),rv(),aI(t.measured.unit?12:-1),rv(5),Ap(t.fix);}}function Wi(i,n){i&1&&(si$1(0,"div",8),tD(1,"Nothing flagged."),bc());}function $i(i,n){if(i&1&&up(0,"wl-game-icon",22),i&2){let e=bI().$implicit;lp("id",n)("icon",e.icon)("name",e.name);}}function ji(i,n){if(i&1&&(si$1(0,"span",33),tD(1),bc()),i&2){let e=bI().$implicit;rv(),Ap(e.name);}}function Gi(i,n){if(i&1&&(si$1(0,"span",32),sI(1,$i,1,3,"wl-game-icon",22)(2,ji,2,1,"span",33),bc()),i&2){let e,t=n.$implicit;rv(),aI((e=t.spellId)?1:2,e);}}function Ui(i,n){if(i&1&&(si$1(0,"div",9)(1,"span",31),tD(2,"On plan"),bc(),uI(3,Gi,3,1,"span",32,Ei),bc()),i&2){let e=bI();rv(3),dI(e.onPlan());}}var q=class i{heading=MF.required();subtitle=MF("");rows=MF.required();onPlan=MF([]);showMap=MF(false);openMap=_F();onOpenMap(n){n.timestampMs==null||!n.name||this.openMap.emit(n);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=FE({type:i,selectors:[["wl-finding-table"]],hostAttrs:[1,"block"],inputs:{heading:[1,"heading"],subtitle:[1,"subtitle"],rows:[1,"rows"],onPlan:[1,"onPlan"],showMap:[1,"showMap"]},outputs:{openMap:"openMap"},decls:15,vars:4,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","tabular-nums","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]",3,"row-critical"],[1,"border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"icon-18"],[1,"min-w-0"],[1,"flex","items-center","gap-[7px]","flex-wrap"],[1,"text-sm","text-[var(--text)]","leading-[1.35]"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[3,"id","icon","name"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[19px]","h-[19px]","shrink-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[11px]","text-[var(--accent)]","tabular-nums"],["mat-icon-button","","aria-label","Open positioning map",1,"icon-button-compact"],["mat-icon-button","","aria-label","Open positioning map",1,"icon-button-compact",3,"click"],[1,"icon-16"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--critical)]","bg-[var(--critical)]/10","border","border-[var(--critical)]/25"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--warning)]","bg-[var(--warning)]/10","border","border-[var(--warning)]/25"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"text-[13px]","text-[var(--muted)]"]],template:function(e,t){e&1&&(si$1(0,"div",0)(1,"div",1),up(2,"div",2),si$1(3,"div")(4,"div",3),tD(5),bc(),sI(6,Di,2,1,"div",4),bc(),si$1(7,"div",5),tD(8,"Measured"),bc(),si$1(9,"div",6),tD(10,"Fix"),bc()(),uI(11,qi,18,15,"div",7,cI),sI(13,Wi,2,0,"div",8),sI(14,Ui,5,0,"div",9),bc()),e&2&&(rv(5),Ap(t.heading()),rv(),aI(t.subtitle()?6:-1),rv(5),dI(t.rows()),rv(2),aI(!t.rows().length&&!t.onPlan().length?13:-1),rv(),aI(t.onPlan().length?14:-1));},dependencies:[ob,rb,I_,Ql,he$1,Ft,Ge],encapsulation:2})};function Zi(i,n){if(i&1&&up(0,"wl-finding-table",1),i&2){let e=bI();lp("rows",e.ruleRows())("onPlan",e.ruleOnPlanChips());}}var be=class i{rotation=T(zr);spec=MF.required();encounterId=MF.required();reportCode=MF.required();fightId=MF.required();playerId=MF.required();busyChange=_F();ruleRows=xo([]);ruleOnPlan=xo([]);offensiveRows=xo([]);onPlan=xo([]);ruleOnPlanChips=ID(()=>this.ruleOnPlan().map(n=>({name:n,spellId:null,icon:""})));loader=new je;constructor(){Au(()=>{let n=this.spec(),e=this.encounterId(),t=this.reportCode(),a=this.fightId(),o=this.playerId();this.loader.run(this.rotation.loadPlayerView(n,e,t,a,o),{context:"rotation.loadPlayerView",apply:c=>{this.ruleRows.set(c.ruleRows),this.ruleOnPlan.set(c.ruleOnPlan),this.offensiveRows.set(c.offensiveRows),this.onPlan.set(c.onPlan);},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=FE({type:i,selectors:[["wl-rotation"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],reportCode:[1,"reportCode"],fightId:[1,"fightId"],playerId:[1,"playerId"]},outputs:{busyChange:"busyChange"},decls:3,vars:3,consts:[[1,"flex","flex-col","gap-6"],["heading","Rotation Rules","subtitle","Rotation rules vs top parses.",3,"rows","onPlan"],["heading","Offensives","subtitle","Offensive cooldowns vs top parses.",3,"rows","onPlan"]],template:function(e,t){e&1&&(si$1(0,"div",0),sI(1,Zi,1,2,"wl-finding-table",1),up(2,"wl-finding-table",2),bc()),e&2&&(rv(),aI(t.ruleRows().length||t.ruleOnPlanChips().length?1:-1),rv(),lp("rows",t.offensiveRows())("onPlan",t.onPlan()));},dependencies:[q],encapsulation:2})};function Xi(i,n){if(i&1){let e=yI();si$1(0,"wl-finding-table",2),mp("openMap",function(a){au(e);let o=bI();return cu(o.onFindingMap(a))}),bc();}if(i&2){let e=bI();lp("rows",e.findingRows())("onPlan",e.onPlan())("showMap",e.showMap());}}function Ki(i,n){if(i&1){let e=yI();si$1(0,"wl-window-comparison",3),mp("openMap",function(a){au(e);let o=bI();return cu(o.onOpenMap(a))}),bc();}if(i&2){let e=bI();bp("mt-6",e.findingRows().length>0||e.onPlan().length>0),lp("windows",e.windows())("higherIsBetter",false)("fightDuration",e.fightDuration())("showCasts",false)("showMap",e.showMap());}}var ye=class i{defensive=T(Hr);spec=MF.required();encounterId=MF.required();report=MF.required();fight=MF.required();player=MF.required();showMap=MF(false);fightDuration=MF(0);openMap=_F();busyChange=_F();_findings=xo([]);_spellIdsByName=xo({});_iconByName=xo({});_windows=xo([]);_anchors=xo([]);windows=this._windows.asReadonly();loader=new je;constructor(){Au(()=>{let n=this.spec(),e=this.encounterId(),t=this.report(),a=this.fight(),o=this.player();this.loader.run(this.defensive.loadAnalysisView(n,e,t,a,o),{context:"defensive.loadAnalysisView",apply:c=>{this._findings.set(c.findings),this._spellIdsByName.set(c.spellIdsByName),this._iconByName.set(c.iconByName),this._windows.set(c.windows),this._anchors.set(c.anchors);},settled:()=>this.busyChange.emit(false)});});}entries=ID(()=>{let n=this._spellIdsByName(),e=this._iconByName();return Ne(this._findings(),{spellId:t=>n[t]??null,icon:t=>e[t]}).entries});findingRows=ID(()=>Te(this.entries(),ve));onPlan=ID(()=>Ae(this.entries()));onOpenMap(n){let e=this._anchors()[n];e&&this.openMap.emit(e);}onFindingMap(n){if(n.timestampMs==null)return;let e=n.spellId!=null&&n.name!=null?[{id:n.spellId,icon:n.icon,name:n.name}]:[];this.openMap.emit({timeS:n.timestampMs/1e3,label:n.name??"Defensive",spells:e,refGameId:null});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=FE({type:i,selectors:[["wl-defensive"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],fightDuration:[1,"fightDuration"]},outputs:{openMap:"openMap",busyChange:"busyChange"},decls:2,vars:2,consts:[["heading","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"rows","onPlan","showMap"],["heading","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"mt-6","windows","higherIsBetter","fightDuration","showCasts","showMap"],["heading","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"openMap","rows","onPlan","showMap"],["heading","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"openMap","windows","higherIsBetter","fightDuration","showCasts","showMap"]],template:function(e,t){e&1&&(sI(0,Xi,1,3,"wl-finding-table",0),sI(1,Ki,1,7,"wl-window-comparison",1)),e&2&&(aI(t.findingRows().length||t.onPlan().length?0:-1),rv(),aI(t.windows().length>0?1:-1));},dependencies:[q,kt],encapsulation:2})};var pi=(i,n)=>n.id;function Qi(i,n){if(i&1&&(si$1(0,"span",13),up(1,"wl-art-icon",15),pD(2,"bossIcon"),si$1(3,"span",16),tD(4),pD(5,"formatDuration"),bc()()),i&2){let e=n;rv(),lp("src",gD(2,5,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",gD(5,7,e.duration_s));}}function Yi(i,n){if(i&1&&(si$1(0,"mat-option",14)(1,"span",13),up(2,"wl-art-icon",15),pD(3,"bossIcon"),si$1(4,"span",16),tD(5),pD(6,"formatDuration"),bc()()()),i&2){let e=n.$implicit;lp("value",e.id),rv(2),lp("src",gD(3,6,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",gD(6,8,e.duration_s));}}function Ji(i,n){if(i&1&&(up(0,"wl-art-icon",15),pD(1,"specIcon"),pD(2,"formatSpec")),i&2){let e=n;lp("src",gD(1,2,e))("alt",gD(2,4,e));}}function en(i,n){if(i&1&&(up(0,"wl-art-icon",15),pD(1,"classIcon")),i&2){let e=bI();lp("src",gD(1,2,e.spec))("alt",e.spec);}}function tn(i,n){if(i&1&&(si$1(0,"span",13),sI(1,Ji,3,6,"wl-art-icon",15)(2,en,2,4,"wl-art-icon",15),si$1(3,"span",16),tD(4),bc()()),i&2){let e,t=n,a=bI(2);rv(),aI((e=a.playerSpecs()[t.id])?1:2,e),rv(3),Ap(t.name);}}function nn(i,n){if(i&1&&(up(0,"wl-art-icon",15),pD(1,"specIcon"),pD(2,"formatSpec")),i&2){let e=n;lp("src",gD(1,2,e))("alt",gD(2,4,e));}}function an(i,n){if(i&1&&(up(0,"wl-art-icon",15),pD(1,"classIcon")),i&2){let e=bI().$implicit;lp("src",gD(1,2,e.spec))("alt",e.spec);}}function on(i,n){if(i&1&&(si$1(0,"mat-option",14)(1,"span",13),sI(2,nn,3,6,"wl-art-icon",15)(3,an,2,4,"wl-art-icon",15),si$1(4,"span",16),tD(5),bc()()()),i&2){let e,t=n.$implicit,a=bI(2);lp("value",t.id),rv(2),aI((e=a.playerSpecs()[t.id])?2:3,e),rv(3),Ap(t.name);}}function rn(i,n){if(i&1){let e=yI();si$1(0,"div",5)(1,"div",10)(2,"mat-form-field",11)(3,"mat-label"),tD(4,"Fight"),bc(),si$1(5,"mat-select",12),mp("selectionChange",function(){au(e);let a=bI();return cu(a.onFightChange())}),si$1(6,"mat-select-trigger"),sI(7,Qi,6,9,"span",13),bc(),uI(8,Yi,7,10,"mat-option",14,pi),bc(),Qv(),bc(),si$1(10,"mat-form-field",11)(11,"mat-label"),tD(12,"Player"),bc(),si$1(13,"mat-select",12),mp("selectionChange",function(){au(e);let a=bI();return cu(a.onPlayerChange())}),si$1(14,"mat-select-trigger"),sI(15,tn,5,2,"span",13),bc(),uI(16,on,6,3,"mat-option",14,pi),bc(),Qv(),bc()()();}if(i&2){let e,t,a=bI();rv(5),lp("formControl",a.fightControl),Yv(),rv(2),aI((e=a.selectedFight())?7:-1,e),rv(),dI(a.fights()),rv(5),lp("formControl",a.playerControl),Yv(),rv(2),aI((t=a.selectedPlayer())?15:-1,t),rv(),dI(a.visiblePlayers());}}function sn(i,n){if(i&1&&(si$1(0,"div",6),tD(1),bc()),i&2){let e=bI();rv(),xc(" ",e.status()," ");}}function ln(i,n){if(i&1&&(si$1(0,"div",7),tD(1),bc()),i&2){let e=bI();rv(),Ap(e.error());}}function dn(i,n){if(i&1&&up(0,"wl-loading-spinner",8),i&2){let e=bI();lp("message",e.loadingMsg());}}function cn(i,n){if(i&1){let e=yI();si$1(0,"div",17)(1,"wl-rotation",18),mp("busyChange",function(a){au(e);let o=bI();return cu(o.rotationBusy.set(a))}),bc(),si$1(2,"wl-burst-windows",19),mp("openMap",function(a){au(e);let o=bI();return cu(o.onOpenMap(a))})("busyChange",function(a){au(e);let o=bI();return cu(o.burstBusy.set(a))}),bc(),si$1(3,"wl-defensive",20),mp("openMap",function(a){au(e);let o=bI();return cu(o.onDefensiveOpenMap(a))})("busyChange",function(a){au(e);let o=bI();return cu(o.defensiveBusy.set(a))}),bc(),si$1(4,"wl-gear",21),mp("busyChange",function(a){au(e);let o=bI();return cu(o.gearBusy.set(a))}),bc()();}if(i&2){let e=bI();bp("hidden",e.cardsBusy()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("reportCode",e.reportCode())("fightId",e.selectedFightId())("playerId",e.selectedPlayerId()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("showMap",e.mapReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("fightDuration",e.selectedFightDuration())("showMap",e.mapReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId());}}function _i(i){let n=i.match(/\/reports\/([a-zA-Z0-9]+)/);return n?n[1]:i.trim()}function vi(i){return /^[a-zA-Z0-9]{16}$/.test(i)}function mn(i=[]){let n={};return (i||[]).filter(e=>(e.encounterID||0)>0).sort((e,t)=>e.startTime-t.startTime).map(e=>{let t=e.encounterID||0;return n[t]=(n[t]||0)+1,U($({},e),{duration_s:Math.round((e.endTime-e.startTime)/100)/10,attempt:n[t]})})}function pn(i=[]){return (i||[]).map(n=>({id:n.id,name:n.name,spec:n.subType||"Unknown",server:n.server||""})).sort((n,e)=>n.name.localeCompare(e.name))}function hi(i,n,e){let a=i.find(o=>o.id===e)?.friendlyPlayers;return a?.length?n.filter(o=>a.includes(o.id)):n}function hn(i,n){return n||(i[0]?.id??null)}function ui(i,n){if(n){let e=i.find(t=>t.name.toLowerCase()===n.toLowerCase());if(e)return e.id}return hn(i,null)}function un(i){let n=(i.value??"").trim();return n?vi(_i(n))?null:{invalidReportCode:true}:null}function gi(i,n){for(let e of ["dps","healers","tanks","unknown"])for(let t of i[e]??[]){if(t.id!==n)continue;let a=(t.type??"").replace(/ /g,""),o=((t.specs??[])[0]?.spec??"").replace(/ /g,"");return o&&a?o+a:""}return ""}var fi=class i{wclApi=T(te);mapFeature=T(Qe);liveMode=T(Mt);liveSync=T(_e);selectionStore=T(Ar);reportControl=new ml("",{nonNullable:true,validators:[un]});fightControl=new ml(null);playerControl=new ml(null);liveControl=new ml(false,{nonNullable:true});loadingReport=xo(false);loadingAnalysis=xo(false);loadingMsg=xo("Loading\u2026");rotationBusy=xo(true);burstBusy=xo(true);defensiveBusy=xo(true);gearBusy=xo(true);cardsBusy=ID(()=>this.rotationBusy()||this.burstBusy()||this.defensiveBusy()||this.gearBusy());error=xo("");status=xo("");fights=xo([]);players=xo([]);selectedFightId=nm(this.fightControl.valueChanges,{initialValue:this.fightControl.value});selectedPlayerId=nm(this.playerControl.valueChanges,{initialValue:this.playerControl.value});liveSyncEnabled=nm(this.liveControl.valueChanges,{initialValue:this.liveControl.value});spec=xo("");playerDetailGroups=xo({});reportCode=xo("");_enemies=[];visiblePlayers=ID(()=>hi(this.fights(),this.players(),this.selectedFightId()));playerSpecs=ID(()=>{let n=this.playerDetailGroups(),e={};for(let t of this.visiblePlayers())e[t.id]=gi(n,t.id);return e});selectedFight=ID(()=>this.fights().find(n=>n.id===this.selectedFightId()));selectedPlayer=ID(()=>this.visiblePlayers().find(n=>n.id===this.selectedPlayerId()));selectedEncounterId=ID(()=>this.fights().find(n=>n.id===this.selectedFightId())?.encounterID??0);selectedFightDuration=ID(()=>this.fights().find(n=>n.id===this.selectedFightId())?.duration_s??0);ready=ID(()=>!!this.spec()&&!!this.reportCode()&&!!this.selectedFightId()&&!!this.selectedPlayerId()&&!!this.selectedEncounterId());mapReady(){return this.mapFeature.ready()}onOpenMap(n){this.mapFeature.openAt(n);}onDefensiveOpenMap(n){this.mapFeature.openAt({timeS:n.timeS,label:n.label,spells:n.spells,reference:n.refGameId!=null?{kind:"enemy",gameId:n.refGameId}:{kind:"boss"}});}_pollingSub=Eh([tm(this.liveSyncEnabled),tm(this.reportCode)]).pipe(cl(([n,e])=>{n&&!e?this.status.set("Load a report to start live sync."):n||this.status.set("");}),re(([n,e])=>n&&!!e),sl(),Th(n=>n?Dh(Ri(void 0),this.liveSync.pollTriggers()):Fe),al(()=>we(this._pollOnce())),em()).subscribe();onPaste(){setTimeout(()=>{this.loadReport();});}async loadReport(){this.error.set("");let n=_i(this.reportControl.value.trim());if(!vi(n)){n&&this.error.set("Enter a valid Warcraft Logs report URL or 16-character report code.");return}this.reportCode.set(""),this.loadingReport.set(true),this.fights.set([]),this.players.set([]),this.spec.set(""),this.playerDetailGroups.set({}),this.mapFeature.clear();try{this.loadingMsg.set("Fetching report from WCL\u2026");let e=await this.wclApi.getReport(n);this._applyReport(e);let t=this.fights()[this.fights().length-1];this.fightControl.setValue(t?.id??null),this._applyAutoPlayer(),this.reportCode.set(n),this._persistPlayerName(),await this.resolveSelection();}catch(e){F_("PostRaidComponent.loadReport",e),this.error.set(e instanceof Error?e.message:"Failed to load report.");}finally{this.loadingReport.set(false);}}_applyReport(n){this.fights.set(mn(n.fights)),this.players.set(pn(n.masterData?.actors)),this._enemies=n.masterData?.enemies??[];}onLiveToggle(){this.liveMode.active.set(this.liveControl.value),this.liveControl.value?this.fightControl.disable():this.fightControl.enable();}async _pollOnce(){this.error.set(""),this.status.set("Checking for new pulls\u2026");try{let n=await this.wclApi.getReport(this.reportCode());this._applyReport(n);let e=this.fights()[this.fights().length-1];if(!e){this.status.set("No boss pulls found.");return}if(this.selectedFightId()===e.id&&this.ready()){this.status.set(`Last updated ${new Date().toLocaleTimeString()} \xB7 Polling every ${fe/1e3}s`);return}let t=this.players().find(o=>o.id===this.selectedPlayerId())?.name??null,a=hi(this.fights(),this.players(),e.id);this.fightControl.setValue(e.id),this.playerControl.setValue(ui(a,t)),this._persistPlayerName(),await this.resolveSelection(),this.status.set(`Updated ${new Date().toLocaleTimeString()} \xB7 ${e.name}`);}catch(n){F_("PostRaidComponent._pollOnce",n),this.error.set(n instanceof Error?n.message:"Poll failed.");}}async onFightChange(){this.liveSyncEnabled()||(this._applyAutoPlayer(),this._persistPlayerName(),await this.resolveSelection());}async onPlayerChange(){this.liveSyncEnabled()||(this._persistPlayerName(),await this.resolveSelection());}async resolveSelection(){this.error.set("");let n=this.selectedFightId(),e=this.selectedPlayerId();if(this.spec.set(""),this.mapFeature.clear(),!(!n||!e)){this.loadingAnalysis.set(true),this.loadingMsg.set("Resolving spec\u2026");try{let t=await this.wclApi.getPlayerDetails(this.reportCode(),n);this.playerDetailGroups.set(t);let a=gi(t,e);if(!a){this.error.set("Could not resolve the selected player's spec.");return}this.spec.set(a),this.rotationBusy.set(!0),this.burstBusy.set(!0),this.defensiveBusy.set(!0),this.gearBusy.set(!0),this.loadingMsg.set("Analyzing your log\u2026");let o=this.fights().find(c=>c.id===n);o&&this.mapFeature.prepare(this.reportCode(),o,e,a,this._enemies);}catch(t){F_("PostRaidComponent.resolveSelection",t),this.error.set(t instanceof Error?t.message:"Failed to resolve selection.");}finally{this.loadingAnalysis.set(false);}}}_applyAutoPlayer(){let n=this.selectionStore.loadPostRaid()?.playerName??null;this.playerControl.setValue(ui(this.visiblePlayers(),n));}_persistPlayerName(){let n=this.players().find(e=>e.id===this.selectedPlayerId())?.name??null;n&&this.selectionStore.savePostRaid({playerName:n});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=FE({type:i,selectors:[["wl-post-raid"]],features:[lD([{provide:Pi$1,useValue:{subscriptSizing:"dynamic"}}])],decls:16,vars:7,consts:[[1,"mx-auto","max-w-[860px]","px-3","md:px-4","pt-6","pb-12"],["appearance","outlined",1,"mb-5","p-4"],["appearance","outline",1,"w-full"],["matInput","","placeholder","https://www.warcraftlogs.com/reports/AbCdEfGh\u2026",3,"keydown.enter","paste","formControl"],[1,"mt-2",3,"change","formControl"],[1,"mt-4","border-t","border-[var(--border)]","pt-4"],[1,"mb-4","rounded-lg","border-l-[3px]","border-[var(--accent)]","px-3","py-2","text-[13px]","text-[var(--muted)]"],[1,"mb-4","rounded-lg","border","border-[var(--critical)]/30","bg-[var(--critical)]/10","px-4","py-3.5","text-[13px]","text-[var(--critical)]"],[3,"message"],[1,"flex","flex-col","gap-6",3,"hidden"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],[3,"src","alt"],[1,"truncate"],[1,"flex","flex-col","gap-6"],[3,"busyChange","spec","encounterId","reportCode","fightId","playerId"],[3,"openMap","busyChange","spec","encounterId","report","fight","player","showMap"],[3,"openMap","busyChange","spec","encounterId","report","fight","player","fightDuration","showMap"],[3,"busyChange","spec","encounterId","report","fight","player"]],template:function(e,t){e&1&&(si$1(0,"div",0)(1,"mat-card",1)(2,"mat-form-field",2)(3,"mat-label"),tD(4,"Warcraft Logs Report URL or Code"),bc(),si$1(5,"input",3),mp("keydown.enter",function(){return t.loadReport()})("paste",function(){return t.onPaste()}),bc(),Qv(),si$1(6,"mat-error"),tD(7,"Paste a Warcraft Logs report URL or a 16-character report code."),bc()(),si$1(8,"mat-slide-toggle",4),mp("change",function(){return t.onLiveToggle()}),tD(9," Live sync (follow latest pull) "),bc(),Qv(),sI(10,rn,18,4,"div",5),bc(),sI(11,sn,2,1,"div",6),sI(12,ln,2,1,"div",7),sI(13,dn,1,1,"wl-loading-spinner",8),sI(14,cn,5,25,"div",9),up(15,"wl-map-panel"),bc()),e&2&&(rv(5),lp("formControl",t.reportControl),Yv(),rv(3),lp("formControl",t.liveControl),Yv(),rv(2),aI(t.fights().length?10:-1),rv(),aI(t.liveSyncEnabled()&&t.status()?11:-1),rv(),aI(t.error()?12:-1),rv(),aI(t.loadingReport()||t.loadingAnalysis()||t.ready()&&t.cardsBusy()?13:-1),rv(),aI(t.ready()&&!t.loadingAnalysis()?14:-1));},dependencies:[wm,Vo,ym,bl,xt,yt,et,wo,di,li,$i$1,Bi$1,Sc,ze,I_,Fc,Pc,mi,Se,Xi$1,Rr,be,Ji$1,ye,fr,Mr,Ge,Dr,Ir,Tr,Er],encapsulation:2})};
export{fi as PostRaidComponent,mn as buildFights,pn as buildPlayers,_i as extractCode,vi as isValidReportCode,ui as pickLivePlayerId,hn as pickPlayerId,gi as specOf,hi as visiblePlayersOf};