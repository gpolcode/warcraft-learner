import {t as te,q as qe$1,R as Rr,y as yt,v as vt,J as Je,a as vo,W as Wi$1,N as Ni$1,h as hc,$ as $e,S as Sc,C as Cc,U as Ui,T as Tr,Y as Yi$1,m as mr,w as wr,z as ze,b as Cr,c as Sr,M as Mr,I as Ir,k as ki$1,d as Mt,e as bt,P as Pi$1,f as Ct,_ as _t,L as Lr,V as Ve,g as Vr,i as Tt,Q as Qi$1,H as Hi$1,j as Se$1,F as Ft}from'./chunk-h-MKdeuR.js';import {T,p as pl,A as Au,x as xo,I as ID,a as am,E as Eh,c as sm,d as cl,r as re,e as sl,f as Th,F as Fe$1,D as Dh,R as Ri$1,g as al,o as om,V as V_,h as FE,M as Mm,B as Bo,S as Sm,v as vl,N as N_,i as si,t as tD,j as bc,m as mp,Q as Qv,u as up,k as sI,l as rv,n as lp,Y as Yv,q as aI,w as lD,s as se,U,$,y as VE,L as Ll,J,z as yr,C as V,G as ct,H as Me,O as $v,P as Ut,W as x,X as ee,Z as Wg,_ as Li$1,a0 as kg,a1 as ml,a2 as Dl,a3 as Ys,a4 as $E,a5 as im,a6 as kF,a7 as hp,a8 as cp,a9 as bp,aa as MF,ab as _F,ac as ed,ad as ub,ae as db,af as yI,ag as uI,ah as bI,ai as dI,aj as Ap,ak as au,al as cu,am as tr,an as Fh,ao as Xt$1,ap as Oi$1,aq as fr,ar as fe,as as ie,at as mr$1,au as Ji$1,av as AF,aw as Ce,ax as Be,ay as Ts,az as Bp,aA as r_,aB as MI,aC as NI,aD as kI,aE as Vo,aF as Pn$1,aG as co,aH as OF,aI as WI,aJ as Ep,aK as xI,aL as AI,aM as xc,aN as NF,aO as P_,aP as Dp,aQ as RI,aR as pD,aS as gD,aT as kp,aU as Iu,aV as cI,aW as we}from'./main-AUB43LOS.js';var Wi=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275cmp=FE({type:n,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(i,o){},styles:[`textarea.cdk-textarea-autosize {
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
`],encapsulation:2})}return n})(),$i={passive:true},yi=(()=>{class n{_platform=T(V);_ngZone=T(Me);_renderer=T(fr).createRenderer(null,null);_styleLoader=T(fe);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return Fe$1;this._styleLoader.load(Wi);let i=ie(e),o=this._monitoredElements.get(i);if(o)return o.subject;let a=new ee,d="cdk-text-field-autofilled",w=F=>{F.animationName==="cdk-text-field-autofill-start"&&!i.classList.contains(d)?(i.classList.add(d),this._ngZone.run(()=>a.next({target:F.target,isAutofilled:true}))):F.animationName==="cdk-text-field-autofill-end"&&i.classList.contains(d)&&(i.classList.remove(d),this._ngZone.run(()=>a.next({target:F.target,isAutofilled:false})));},I=this._ngZone.runOutsideAngular(()=>(i.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(i,"animationstart",w,$i)));return this._monitoredElements.set(i,{subject:a,unlisten:I}),a}stopMonitoring(e){let i=ie(e),o=this._monitoredElements.get(i);o&&(o.unlisten(),o.subject.complete(),i.classList.remove("cdk-text-field-autofill-monitored"),i.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(i));}ngOnDestroy(){this._monitoredElements.forEach((e,i)=>this.stopMonitoring(i));}static \u0275fac=function(i){return new(i||n)};static \u0275prov=mr$1({token:n,factory:n.\u0275fac})}return n})();var vi=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=VE({type:n});static \u0275inj=Ll({})}return n})();var wi=new x("MAT_INPUT_VALUE_ACCESSOR");var ji=["button","checkbox","file","hidden","image","radio","range","reset","submit"],qi=new x("MAT_INPUT_CONFIG"),Ci=(()=>{class n{_elementRef=T(yr);_platform=T(V);ngControl=T(ct,{optional:true,self:true});_autofillMonitor=T(yi);_ngZone=T(Me);_formField=T(bt,{optional:true});_renderer=T($v);_uid=T(Ut).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=T(qi,{optional:true});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=false;_isNativeSelect=false;_isTextarea=false;_isInFormField=false;focused=false;stateChanges=new ee;controlType="mat-input";autofilled=false;get disabled(){return this._disabled}set disabled(e){this._disabled=Wg(e),this.focused&&(this.focused=false,this.stateChanges.next());}_disabled=false;get id(){return this._id}set id(e){this._id=e||this._uid;}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(Li$1.required)??false}set required(e){this._required=Wg(e);}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&kg().has(this._type)&&(this._elementRef.nativeElement.type=this._type);}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next());}get readonly(){return this._readonly}set readonly(e){this._readonly=Wg(e);}_readonly=false;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>kg().has(e));constructor(){let e=T(ml,{optional:true}),i=T(Dl,{optional:true}),o=T(Pi$1),a=T(wi,{optional:true,self:true}),d=this._elementRef.nativeElement,w=d.nodeName.toLowerCase();a?Ys(a.value)?this._signalBasedValueAccessor=a:this._inputValueAccessor=a:this._inputValueAccessor=d,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(d,"keyup",this._iOSKeyupListener);}),this._errorStateTracker=new Ct(o,this.ngControl,i,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=w==="select",this._isTextarea=w==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||false,this._isNativeSelect&&(this.controlType=d.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&Au(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next();});}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next();});}ngOnChanges(){this.stateChanges.next();}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.();}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder();}focus(e){this._elementRef.nativeElement.focus(e);}updateErrorState(){this._errorStateTracker.updateErrorState();}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let i=this._elementRef.nativeElement;i.type==="number"?(i.type="text",i.setSelectionRange(0,0),i.type="number"):i.setSelectionRange(0,0);}this.focused=e,this.stateChanges.next();}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next());}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let i=this._elementRef.nativeElement;this._previousPlaceholder=e,e?i.setAttribute("placeholder",e):i.removeAttribute("placeholder");}}_getPlaceholder(){return this.placeholder||null}_validateType(){ji.indexOf(this._type)>-1;}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return !this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,i=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&i&&i.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let i=this._elementRef.nativeElement;e.length?i.setAttribute("aria-describedby",e.join(" ")):i.removeAttribute("aria-describedby");}onContainerClick(){this.focused||this.focus();}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let i=e.target;!i.value&&i.selectionStart===0&&i.selectionEnd===0&&(i.setSelectionRange(1,1),i.setSelectionRange(0,0));};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(i){return new(i||n)};static \u0275dir=$E({type:n,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(i,o){i&1&&mp("focus",function(){return o._focusChanged(true)})("blur",function(){return o._focusChanged(false)})("input",function(){return o._onInput()}),i&2&&(hp("id",o.id)("disabled",o.disabled&&!o.disabledInteractive)("required",o.required),cp("name",o.name||null)("readonly",o._getReadonlyAttribute())("aria-disabled",o.disabled&&o.disabledInteractive?"true":null)("aria-invalid",o.empty&&o.required?null:o.errorState)("aria-required",o.required)("id",o.id),bp("mat-input-server",o._isServer)("mat-mdc-form-field-textarea-control",o._isInFormField&&o._isTextarea)("mat-mdc-form-field-input-control",o._isInFormField)("mat-mdc-input-disabled-interactive",o.disabledInteractive)("mdc-text-field__input",o._isInFormField)("mat-mdc-native-select-inline",o._isInlineSelect()));},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},exportAs:["matInput"],features:[lD([{provide:_t,useExisting:n}]),im]})}return n})(),xi=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=VE({type:n});static \u0275inj=Ll({imports:[yt,yt,vi,J]})}return n})();var Se=12e3,Ie=class n{document=T(tr);pollTriggers(){let t=()=>this.document.visibilityState==="visible",e=0,i=Fh(Se).pipe(Xt$1(t)),o=Oi$1(this.document,"visibilitychange").pipe(Xt$1(()=>t()&&Date.now()-e>=Se));return Dh(i,o).pipe(re(()=>{e=Date.now();}))}static \u0275fac=function(e){return new(e||n)};static \u0275prov=se({token:n,factory:n.\u0275fac,providedIn:"root"})};var ke={lost_cooldown:"lost cast",cooldown_delay:"held",cooldown_alignment:"BL miss",cast_efficiency:"downtime",hold_suggestion:"hold"};function qe(n,t){let e=[];for(let i of n)if(i.hasIssue)for(let o of i.findings)e.push({severity:o.severity==="critical"?"critical":"warning",name:i.name,spellId:i.spellId,icon:i.icon,timestampMs:o.timestamp_ms??null,chip:t[o.category],measured:o.measured??{value:"-"},fix:o.details?.remedy});return e}function Ue(n){return n.filter(t=>!t.hasIssue).map(t=>({name:t.name,spellId:t.spellId,icon:t.icon}))}function Ge(n,t){let e={},i=[];for(let a of n)if(a.severity!=="success")if(a.category==="hold_suggestion"&&a.details?.cd_name){let d=a.details.cd_name;(e[d]??={issues:[],holds:[]}).holds.push(a);}else if(t.collectRules&&(a.category==="rule_violation"||!a.cd_name))i.push(a);else {let d=a.cd_name;if(!d)continue;(e[d]??={issues:[],holds:[]}).issues.push(a);}for(let a of n){if(a.severity!=="success")continue;let d=a.cd_name;d&&((e[d]??={issues:[],holds:[]}).success=a);}return {entries:Object.entries(e).map(([a,d])=>{let w=d.issues.some(V=>V.severity==="critical"),I=d.issues.length>0||d.holds.length>0,F=[];for(let V of d.issues){let Le=ke[V.category];Le&&!F.includes(Le)&&F.push(Le);}return d.holds.length&&F.push(`${d.holds.length} hold${d.holds.length>1?"s":""}`),{name:a,spellId:t.spellId(a),icon:t.icon(a),hasCritical:w,hasIssue:I,metaItems:F,findings:[...d.issues,...d.holds]}}),ruleFindings:i}}var Gi=(n,t)=>t.name;function Zi(n,t){if(n&1&&(si(0,"div",4),tD(1),bc()),n&2){let e=bI();rv(),Ap(e.subtitle());}}function Ki(n,t){if(n&1&&up(0,"wl-game-icon",22),n&2){let e=bI(),i=bI().$implicit;lp("id",t)("icon",i.icon)("name",e);}}function Xi(n,t){if(n&1&&(up(0,"span",23),si(1,"span",24),tD(2),bc()),n&2){let e=bI();rv(2),Ap(e);}}function Qi(n,t){if(n&1){let e=yI();si(0,"button",28),mp("click",function(){au(e);let o=bI(3).$implicit,a=bI();return cu(a.onOpenMap(o))}),si(1,"mat-icon",29),tD(2,"my_location"),bc()();}}function Yi(n,t){if(n&1){let e=yI();si(0,"button",30),mp("click",function(){au(e);let o=bI(3).$implicit,a=bI();return cu(a.onOpenClip(o))}),si(1,"mat-icon",29),tD(2,"videocam"),bc()();}}function Ji(n,t){if(n&1&&(si(0,"span",25),tD(1),pD(2,"formatDuration"),bc(),sI(3,Qi,3,0,"button",26),sI(4,Yi,3,0,"button",27)),n&2){let e=bI(2).$implicit,i=bI();rv(),Ap(gD(2,3,e.timestampMs/1e3)),rv(2),aI(i.showMap()?3:-1),rv(),aI(i.showClip()?4:-1);}}function en(n,t){if(n&1&&(si(0,"span",31),tD(1),bc()),n&2){let e=bI(3).$implicit;rv(),Ap(e.chip);}}function tn(n,t){if(n&1&&(si(0,"span",32),tD(1),bc()),n&2){let e=bI(3).$implicit;rv(),Ap(e.chip);}}function nn(n,t){if(n&1&&sI(0,en,2,1,"span",31)(1,tn,2,1,"span",32),n&2){let e=bI(2).$implicit;aI(e.severity==="critical"?0:1);}}function on(n,t){if(n&1&&(si(0,"div",14),sI(1,Ki,1,3,"wl-game-icon",22)(2,Xi,3,1),sI(3,Ji,5,5),sI(4,nn,2,1),bc()),n&2){let e,i=bI().$implicit;rv(),aI((e=i.spellId)?1:2,e),rv(2),aI(i.timestampMs!=null?3:-1),rv(),aI(i.chip?4:-1);}}function an(n,t){if(n&1&&(si(0,"span",15),tD(1),bc()),n&2){let e=bI().$implicit;rv(),Ap(e.what);}}function rn(n,t){if(n&1&&(si(0,"div",19),tD(1),bc()),n&2){let e=bI().$implicit;rv(),Ap(e.measured.unit);}}function sn(n,t){if(n&1&&(si(0,"div",10)(1,"div",11)(2,"mat-icon",12),tD(3),bc()(),si(4,"div",13),sI(5,on,5,3,"div",14)(6,an,2,1,"span",15),bc(),si(7,"div",16)(8,"span",17),tD(9,"Measured"),bc(),si(10,"div",18),tD(11),bc(),sI(12,rn,2,1,"div",19),bc(),si(13,"div",20)(14,"span",21),tD(15,"Fix"),bc(),si(16,"wl-collapsible-text"),tD(17),bc()()()),n&2){let e,i=t.$implicit;bp("row-critical",i.severity==="critical"),rv(2),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(),xc(" ",i.severity==="critical"?"error":"warning_amber"," "),rv(2),aI((e=i.name)?5:6,e),rv(2),bp("badge-critical",i.severity==="critical")("badge-warning",i.severity==="warning"),rv(4),Ap(i.measured.value),rv(),aI(i.measured.unit?12:-1),rv(5),Ap(i.fix);}}function ln(n,t){n&1&&(si(0,"div",8),tD(1,"Nothing flagged."),bc());}function dn(n,t){if(n&1&&up(0,"wl-game-icon",22),n&2){let e=bI().$implicit;lp("id",t)("icon",e.icon)("name",e.name);}}function cn(n,t){if(n&1&&(si(0,"span",35),tD(1),bc()),n&2){let e=bI().$implicit;rv(),Ap(e.name);}}function mn(n,t){if(n&1&&(si(0,"span",34),sI(1,dn,1,3,"wl-game-icon",22)(2,cn,2,1,"span",35),bc()),n&2){let e,i=t.$implicit;rv(),aI((e=i.spellId)?1:2,e);}}function pn(n,t){if(n&1&&(si(0,"div",9)(1,"span",33),tD(2,"On plan"),bc(),uI(3,mn,3,1,"span",34,Gi),bc()),n&2){let e=bI();rv(3),dI(e.onPlan());}}var Q=class n{heading=MF.required();subtitle=MF("");rows=MF.required();onPlan=MF([]);showMap=MF(false);showClip=MF(false);openMap=_F();openClip=_F();onOpenMap(t){t.timestampMs==null||!t.name||this.openMap.emit(t);}onOpenClip(t){t.timestampMs==null||!t.name||this.openClip.emit(t);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-finding-table"]],hostAttrs:[1,"block"],inputs:{heading:[1,"heading"],subtitle:[1,"subtitle"],rows:[1,"rows"],onPlan:[1,"onPlan"],showMap:[1,"showMap"],showClip:[1,"showClip"]},outputs:{openMap:"openMap",openClip:"openClip"},decls:15,vars:4,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2","md:grid","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","md:gap-[14px]","md:items-baseline"],[1,"hidden","md:block"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","tabular-nums","text-right"],[1,"hidden","md:block","text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]",3,"row-critical"],[1,"border-t","border-[var(--border)]","px-4","py-3","text-[13px]","text-[var(--muted)]"],[1,"flex","items-center","gap-2","flex-wrap","border-t","border-[var(--border)]","px-4","py-[10px]"],[1,"grid","grid-cols-[20px_minmax(0,1fr)]","md:grid-cols-[20px_minmax(0,1fr)_96px_200px]","gap-x-[14px]","gap-y-2","md:gap-y-0","px-4","py-[10px]","items-start","md:items-center","border-t","border-[var(--border)]"],[1,"flex","items-center","justify-center","self-start","md:self-center"],[1,"icon-18"],[1,"min-w-0"],[1,"flex","items-center","gap-[7px]","flex-wrap"],[1,"text-sm","text-[var(--text)]","leading-[1.35]"],[1,"col-start-2","md:col-auto","flex","items-baseline","gap-2","md:block","text-left","md:text-right","leading-[1.1]"],[1,"md:hidden","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]"],[1,"text-[15px]","font-bold","tabular-nums"],[1,"text-[12px]","text-[var(--muted)]","md:text-inherit","md:text-[10px]","md:opacity-60","md:mt-px","tabular-nums"],[1,"col-start-2","md:col-auto","text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[3,"id","icon","name"],[1,"inline-block","bg-[var(--surface-alt)]","border","border-dashed","border-[var(--border)]","rounded","w-[19px]","h-[19px]","shrink-0"],[1,"text-sm","text-[var(--text)]"],[1,"text-[11px]","text-[var(--accent)]","tabular-nums"],["mat-icon-button","","aria-label","Open positioning map",1,"icon-button-compact"],["mat-icon-button","","aria-label","Watch clip",1,"icon-button-compact"],["mat-icon-button","","aria-label","Open positioning map",1,"icon-button-compact",3,"click"],[1,"icon-16"],["mat-icon-button","","aria-label","Watch clip",1,"icon-button-compact",3,"click"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--critical)]","bg-[var(--critical)]/10","border","border-[var(--critical)]/25"],[1,"text-[10px]","rounded-sm","px-[5px]","tabular-nums","text-[var(--warning)]","bg-[var(--warning)]/10","border","border-[var(--warning)]/25"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","mr-0.5"],[1,"chip-onplan"],[1,"text-[13px]","text-[var(--muted)]"]],template:function(e,i){e&1&&(si(0,"div",0)(1,"div",1),up(2,"div",2),si(3,"div")(4,"div",3),tD(5),bc(),sI(6,Zi,2,1,"div",4),bc(),si(7,"div",5),tD(8,"Measured"),bc(),si(9,"div",6),tD(10,"Fix"),bc()(),uI(11,sn,18,15,"div",7,cI),sI(13,ln,2,0,"div",8),sI(14,pn,5,0,"div",9),bc()),e&2&&(rv(5),Ap(i.heading()),rv(),aI(i.subtitle()?6:-1),rv(5),dI(i.rows()),rv(2),aI(!i.rows().length&&!i.onPlan().length?13:-1),rv(),aI(i.onPlan().length?14:-1));},dependencies:[ub,db,N_,ed,Se$1,Ft,ze],encapsulation:2})};function un(n,t){if(n&1&&up(0,"wl-finding-table",1),n&2){let e=bI();lp("rows",e.ruleRows())("onPlan",e.ruleOnPlanChips());}}var Fe=class n{rotation=T(Lr);spec=MF.required();encounterId=MF.required();reportCode=MF.required();fightId=MF.required();playerId=MF.required();busyChange=_F();ruleRows=xo([]);ruleOnPlan=xo([]);offensiveRows=xo([]);onPlan=xo([]);ruleOnPlanChips=ID(()=>this.ruleOnPlan().map(t=>({name:t,spellId:null,icon:""})));loader=new Ve;constructor(){Au(()=>{let t=this.spec(),e=this.encounterId(),i=this.reportCode(),o=this.fightId(),a=this.playerId();this.loader.run(this.rotation.loadPlayerView(t,e,i,o,a),{context:"rotation.loadPlayerView",apply:d=>{this.ruleRows.set(d.ruleRows),this.ruleOnPlan.set(d.ruleOnPlan),this.offensiveRows.set(d.offensiveRows),this.onPlan.set(d.onPlan);},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-rotation"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],reportCode:[1,"reportCode"],fightId:[1,"fightId"],playerId:[1,"playerId"]},outputs:{busyChange:"busyChange"},decls:3,vars:3,consts:[[1,"flex","flex-col","gap-6"],["heading","Rotation Rules","subtitle","Rotation rules vs top parses.",3,"rows","onPlan"],["heading","Offensives","subtitle","Offensive cooldowns vs top parses.",3,"rows","onPlan"]],template:function(e,i){e&1&&(si(0,"div",0),sI(1,un,1,2,"wl-finding-table",1),up(2,"wl-finding-table",2),bc()),e&2&&(rv(),aI(i.ruleRows().length||i.ruleOnPlanChips().length?1:-1),rv(),lp("rows",i.offensiveRows())("onPlan",i.onPlan()));},dependencies:[Q],encapsulation:2})};function hn(n,t){if(n&1){let e=yI();si(0,"wl-finding-table",2),mp("openMap",function(o){au(e);let a=bI();return cu(a.onFindingMap(o))})("openClip",function(o){au(e);let a=bI();return cu(a.onFindingClip(o))}),bc();}if(n&2){let e=bI();lp("rows",e.findingRows())("onPlan",e.onPlan())("showMap",e.showMap())("showClip",e.showClip());}}function gn(n,t){if(n&1){let e=yI();si(0,"wl-window-comparison",3),mp("openMap",function(o){au(e);let a=bI();return cu(a.onOpenMap(o))})("openClip",function(o){au(e);let a=bI();return cu(a.onOpenClip(o))}),bc();}if(n&2){let e=bI();bp("mt-6",e.findingRows().length>0||e.onPlan().length>0),lp("windows",e.windows())("higherIsBetter",false)("fightDuration",e.fightDuration())("showCasts",false)("showMap",e.showMap())("showClip",e.showClip());}}var Pe=class n{defensive=T(Vr);spec=MF.required();encounterId=MF.required();report=MF.required();fight=MF.required();player=MF.required();showMap=MF(false);showClip=MF(false);fightDuration=MF(0);openMap=_F();openClip=_F();busyChange=_F();_findings=xo([]);_spellIdsByName=xo({});_iconByName=xo({});_windows=xo([]);_anchors=xo([]);windows=this._windows.asReadonly();loader=new Ve;constructor(){Au(()=>{let t=this.spec(),e=this.encounterId(),i=this.report(),o=this.fight(),a=this.player();this.loader.run(this.defensive.loadAnalysisView(t,e,i,o,a),{context:"defensive.loadAnalysisView",apply:d=>{this._findings.set(d.findings),this._spellIdsByName.set(d.spellIdsByName),this._iconByName.set(d.iconByName),this._windows.set(d.windows),this._anchors.set(d.anchors);},settled:()=>this.busyChange.emit(false)});});}entries=ID(()=>{let t=this._spellIdsByName(),e=this._iconByName();return Ge(this._findings(),{spellId:i=>t[i]??null,icon:i=>e[i]}).entries});findingRows=ID(()=>qe(this.entries(),ke));onPlan=ID(()=>Ue(this.entries()));onOpenMap(t){let e=this._anchors()[t];e&&this.openMap.emit(e);}onOpenClip(t){let e=this._windows()[t];e&&this.openClip.emit({timeS:e.timeStartS,windowLengthS:e.timeEndS-e.timeStartS,key:`defensive-${t}`});}onFindingMap(t){t.timestampMs!=null&&this.openMap.emit({timeS:t.timestampMs/1e3,refGameId:null});}onFindingClip(t){t.timestampMs!=null&&this.openClip.emit({timeS:t.timestampMs/1e3,windowLengthS:0,key:`defensive-find-${Math.round(t.timestampMs/1e3)}`});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-defensive"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],report:[1,"report"],fight:[1,"fight"],player:[1,"player"],showMap:[1,"showMap"],showClip:[1,"showClip"],fightDuration:[1,"fightDuration"]},outputs:{openMap:"openMap",openClip:"openClip",busyChange:"busyChange"},decls:2,vars:2,consts:[["heading","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"rows","onPlan","showMap","showClip"],["heading","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"mt-6","windows","higherIsBetter","fightDuration","showCasts","showMap","showClip"],["heading","Defensives","subtitle","Defensive cooldowns vs top parses.",3,"openMap","openClip","rows","onPlan","showMap","showClip"],["heading","Defensive Windows","subtitle","Damage taken in top-parse defensive windows vs top parses.",3,"openMap","openClip","windows","higherIsBetter","fightDuration","showCasts","showMap","showClip"]],template:function(e,i){e&1&&(sI(0,hn,1,4,"wl-finding-table",0),sI(1,gn,1,8,"wl-window-comparison",1)),e&2&&(aI(i.findingRows().length||i.onPlan().length?0:-1),rv(),aI(i.windows().length>0?1:-1));},dependencies:[Q,Tt],encapsulation:2})};var Ze={codec:"vp9",maxHeight:1080,fps:30,bitrateBps:4e6},Ii=3e3,ki=720*1e3,Fi={preMs:5e3,postMs:5e3},Pi={preMs:0,postMs:0},Ti=2*1024*1024*1024;var fn="clips",Ei="manifest.json";function _n(n,t,e){let o=n.reduce((w,I)=>w+I.bytes,0)+t-e;if(o<=0)return [];let a=[...n].sort((w,I)=>w.fightId-I.fightId||w.storedAt-I.storedAt),d=[];for(let w of a){if(o<=0)break;d.push(w.key),o-=w.bytes;}return d}function Ke(n){return n.replace(/[^A-Za-z0-9_-]/g,"_")}var Te=class n{capBytes=Ti;remainingBytes=xo(this.capBytes);async root(){return (await navigator.storage.getDirectory()).getDirectoryHandle(fn,{create:true})}async put(t){try{let e=await this.list();for(let d of _n(e,t.bytes,this.capBytes))await this.evict(d);let o=await(await this.root()).getDirectoryHandle(Ke(t.key),{create:!0});for(let d=0;d<t.blobs.length;d++)await this.writeFile(o,`${d}.webm`,t.blobs[d]);let a={key:t.key,fightId:t.fightId,window:t.window,bytes:t.bytes,storedAt:t.storedAt,segments:t.segments};await this.writeFile(o,Ei,new Blob([JSON.stringify(a)],{type:"application/json"})),await this.refreshBudget();}catch(e){V_(`ClipStore.put ${t.key}`,e);}}async get(t){try{let e=await this.root(),i;try{i=await e.getDirectoryHandle(Ke(t));}catch{return null}let o=await this.readManifest(i);if(!o)return null;let a=[];for(let d=0;d<o.segments.length;d++){let w=await i.getFileHandle(`${d}.webm`);a.push(await w.getFile());}return U($({},o),{blobs:a})}catch(e){return V_(`ClipStore.get ${t}`,e),null}}async list(){let t=[];try{let e=await this.root();for await(let[,i]of bn(e)){if(i.kind!=="directory")continue;let o=await this.readManifest(i);o&&t.push(o);}}catch(e){V_("ClipStore.list",e);}return t}async evict(t){try{await(await this.root()).removeEntry(Ke(t),{recursive:!0}),await this.refreshBudget();}catch(e){V_(`ClipStore.evict ${t}`,e);}}async refreshBudget(){let t=(await this.list()).reduce((e,i)=>e+i.bytes,0);this.remainingBytes.set(Math.max(0,this.capBytes-t));}async readManifest(t){try{let i=await(await(await t.getFileHandle(Ei)).getFile()).text();return JSON.parse(i)}catch{return null}}async writeFile(t,e,i){let a=await(await t.getFileHandle(e,{create:true})).createWritable();await a.write(i),await a.close();}static \u0275fac=function(e){return new(e||n)};static \u0275prov=se({token:n,factory:n.\u0275fac,providedIn:"root"})};function bn(n){return n.entries()}function yn(n,t,e){return n+t+e*1e3}function vn(n,t,e,i){return e.map(o=>{let a=yn(n,t,o.timeS);return {fromMs:a-i.preMs,toMs:a+o.windowLengthS*1e3+i.postMs,key:o.key}})}function Ri(n,t){return n.filter(e=>e.end>t.fromMs&&e.start<t.toMs).sort((e,i)=>e.start-i.start)}function wn(n,t){return t?Math.max(0,(n.fromMs-t.start)/1e3):0}function Cn(n,t,e){return n.some(i=>i.end>t&&i.start<e)}function xn(n){let t=`video/webm;codecs=${n.codec}`;return MediaRecorder.isTypeSupported(t)?t:"video/webm"}var N=class n{liveMode=T(Mt);liveSync=T(Ie);clipStore=T(Te);isCapturing=xo(false);isStarting=xo(false);sourceLabel=xo("");bufferSpanMs=xo(0);captureProfile=xo(Ze);recordToggleOn=ID(()=>this.isCapturing()||this.isStarting());stream=null;recording=false;segments=[];segIdx=0;mimeType="video/webm";liveEnabled=this.liveMode.active.asReadonly();status=xo("");open=xo(false);extracting=xo(false);handle=xo(null);ctx=null;currentAnchor=null;setLive(t){this.liveMode.active.set(t);}setStatus(t){this.status.set(t);}pollTriggers(){return this.liveSync.pollTriggers()}async startRecording(t=Ze){if(!(this.recording||this.isStarting())){this.isStarting.set(true);try{let e=await navigator.mediaDevices.getDisplayMedia({video:!0,audio:!1}),[i]=e.getVideoTracks();await i.applyConstraints({width:{max:1920},height:{max:t.maxHeight},frameRate:{max:t.fps}}),this.stream=e,this.captureProfile.set(t),this.mimeType=xn(t),this.sourceLabel.set(i.label||"your screen"),i.addEventListener("ended",()=>this.stopRecording()),this.recording=!0,this.isCapturing.set(!0),console.debug("[clip] startRecording: capturing",i.label,"mime",this.mimeType,"bitrate",t.bitrateBps),this.cycleSegment();}catch(e){console.debug("[clip] startRecording: aborted (picker dismissed or error)",e),V_("LiveCaptureFeatureService.startRecording",e);}finally{this.isStarting.set(false);}}}stopRecording(){this.recording=false,this.stream?.getTracks().forEach(t=>t.stop()),this.stream=null,this.isCapturing.set(false),this.sourceLabel.set("");}bufferCovers(t,e){return Cn(this.segments,t,e)}cycleSegment(){if(!this.recording||!this.stream)return;let t=[],e=new MediaRecorder(this.stream,{mimeType:this.mimeType,videoBitsPerSecond:this.captureProfile().bitrateBps}),i=Date.now();e.ondataavailable=o=>{o.data.size&&t.push(o.data);},e.onstop=()=>{let o=new Blob(t,{type:this.mimeType});this.segments.push({idx:this.segIdx++,start:i,end:Date.now(),blob:o}),this.evictOlderThan(Date.now()-ki),this.refreshBufferSpan(),console.debug("[clip] segment",this.segIdx-1,"finalized",Math.round(o.size/1024),"KB;",this.segments.length,"in buffer, span",Math.round(this.bufferSpanMs()/1e3),"s"),this.recording&&this.cycleSegment();},e.start(),setTimeout(()=>{e.state==="recording"&&e.stop();},Ii);}evictOlderThan(t){this.segments=this.segments.filter(e=>e.end>=t);}refreshBufferSpan(){if(!this.segments.length){this.bufferSpanMs.set(0);return}let t=this.segments[0].start,e=this.segments[this.segments.length-1].end;this.bufferSpanMs.set(e-t);}prepare(t,e,i){this.ctx={reportCode:t,reportStartTime:e,fight:i};}clipReady(){if(this.bufferSpanMs(),!this.isCapturing()||!this.ctx)return  false;let{reportStartTime:t,fight:e}=this.ctx,i=t+e.startTime,o=t+e.endTime;return this.bufferCovers(i,o)}async openClip(t){if(console.debug("[clip] openClip",t,"ctx?",!!this.ctx,"capturing?",this.isCapturing(),"segments",this.segments.length),this.currentAnchor=t,this.handle.set(null),this.open.set(true),!this.ctx){console.warn("[clip] openClip: no correlation context (report not resolved)");return}this.extracting.set(true);try{let e=this.clipWindowFor(t);console.debug("[clip] openClip: window span",e,"buffer covers?",this.bufferCovers(e.fromMs,e.toMs));let i=await this.resolveHandle(this.ctx.reportCode,this.ctx.fight.id,e);console.debug("[clip] openClip: resolved handle",i?`${i.blobs.length} blobs, seek ${i.startOffsetS}s`:"null (no footage)"),this.handle.set(i);}catch(e){console.error("[clip] openClip failed",e),V_(`LiveCaptureFeatureService.openClip ${t.key}`,e);}finally{this.extracting.set(false);}}async download(){let t=this.currentAnchor;if(!(!this.ctx||!t))try{let e=await this.exportClip(this.clipWindowFor(t));e&&this.triggerDownload(e,`${t.key}.webm`);}catch(e){V_(`LiveCaptureFeatureService.download ${t.key}`,e);}}close(){this.open.set(false);}clear(){this.open.set(false),this.handle.set(null),this.ctx=null,this.currentAnchor=null;}clipWindowFor(t){let{reportStartTime:e,fight:i}=this.ctx,o=t.windowLengthS>0?Pi:Fi,[a]=vn(e,i.startTime,[t],o);return a}async resolveHandle(t,e,i){let o=await this.clipStore.get(this.storeKey(t,e,i.key));if(o?.blobs.length)return console.debug("[clip] resolveHandle: served from ClipStore,",o.blobs.length,"blobs"),this.handleFor(i,o.blobs,o.segments[0]);let a=Ri(this.segments,i);return console.debug("[clip] resolveHandle: store miss;",a.length,"of",this.segments.length,"buffer segments overlap the window"),a.length?(await this.persist(t,e,i,a),this.handleFor(i,a.map(d=>d.blob),a[0])):null}extractClip(t){let e=Ri(this.segments,t);return e.length?this.handleFor(t,e.map(i=>i.blob),e[0]):null}handleFor(t,e,i){let o=wn(t,i);return {blobs:e,startOffsetS:o,endOffsetS:o+(t.toMs-t.fromMs)/1e3,mimeType:this.mimeType}}async exportClip(t){let e=this.extractClip(t);return e?this.reRecord(e):null}async persist(t,e,i,o){if(!o.length)return;let a=o.map(w=>w.blob),d={key:this.storeKey(t,e,i.key),fightId:e,window:i,blobs:a,segments:o.map(({idx:w,start:I,end:F})=>({idx:w,start:I,end:F})),bytes:a.reduce((w,I)=>w+I.size,0),storedAt:Date.now()};await this.clipStore.put(d);}storeKey(t,e,i){return `${t}:${e}:${i}`}async reRecord(t){let e=document.createElement("video");return e.muted=true,await Xe(e,t.blobs,t.mimeType),e.readyState<1&&await Mn(e,"loadedmetadata"),new Promise((i,o)=>{try{let a=e.captureStream(),d=new MediaRecorder(a,{mimeType:t.mimeType,videoBitsPerSecond:this.captureProfile().bitrateBps}),w=[],I=!1,F=()=>{!I&&d.state!=="inactive"&&(I=!0,d.stop());};d.ondataavailable=V=>{V.data.size&&w.push(V.data);},d.onstop=()=>i(new Blob(w,{type:t.mimeType})),e.addEventListener("timeupdate",()=>{e.currentTime>=t.endOffsetS&&F();}),e.addEventListener("ended",F,{once:!0}),e.currentTime=t.startOffsetS,d.start(),e.play();}catch(a){o(a instanceof Error?a:new Error(String(a)));}})}triggerDownload(t,e){let i=URL.createObjectURL(t),o=document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i);}static \u0275fac=function(e){return new(e||n)};static \u0275prov=se({token:n,factory:n.\u0275fac,providedIn:"root"})};async function Xe(n,t,e){console.debug("[clip] pipeIntoElement: stitching",t.length,"segments, mime",e);try{let i=new MediaSource;n.src=URL.createObjectURL(i),await Sn(i);let o=i.addSourceBuffer(e);o.mode="sequence";for(let a=0;a<t.length;a++)await In(o,await t[a].arrayBuffer()),console.debug("[clip] pipeIntoElement: appended segment",a+1,"/",t.length);i.endOfStream(),console.debug("[clip] pipeIntoElement: endOfStream, duration",n.duration);}catch(i){console.warn("[clip] pipeIntoElement: MSE failed, falling back to single-blob src",i),n.src=URL.createObjectURL(new Blob(t,{type:e}));}}function Mn(n,t){return new Promise(e=>n.addEventListener(t,()=>e(),{once:true}))}function Sn(n){return new Promise(t=>n.addEventListener("sourceopen",()=>t(),{once:true}))}function In(n,t){return new Promise((e,i)=>{n.addEventListener("updateend",()=>e(),{once:true}),n.addEventListener("error",()=>i(new Error("append failed")),{once:true}),n.appendBuffer(t);})}var kn=["*"],Di=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=FE({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,o){i&2&&bp("mdc-form-field--align-end",o.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:kn,decls:1,vars:0,template:function(i,o){i&1&&(MI(),NI(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var Fn=["switch"],Pn=["*"];function Tn(n,t){n&1&&(si(0,"span",11),Iu(),si(1,"svg",13),up(2,"path",14),bc(),si(3,"svg",15),up(4,"path",16),bc()());}var En=new x("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Ee=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Qe=(()=>{class n{_elementRef=T(yr);_focusMonitor=T(Ji$1);_changeDetectorRef=T(AF);defaults=T(En);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Ee(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ce();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Be;toggleChange=new Be;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){T(fe).load(Ts);let e=T(new Bp("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=T(Ut).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Ee(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=FE({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,o){if(i&1&&Ep(Fn,5),i&2){let a;xI(a=AI())&&(o._switchElement=a.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,o){i&2&&(hp("id",o.id),cp("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),WI(o.color?"mat-"+o.color:""),bp("mat-mdc-slide-toggle-focused",o._focused)("mat-mdc-slide-toggle-checked",o.checked)("_mat-animation-noopable",o._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",kF],color:"color",disabled:[2,"disabled","disabled",kF],disableRipple:[2,"disableRipple","disableRipple",kF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:OF(e)],checked:[2,"checked","checked",kF],hideIcon:[2,"hideIcon","hideIcon",kF],disabledInteractive:[2,"disabledInteractive","disabledInteractive",kF]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[lD([{provide:Vo,useExisting:co(()=>n),multi:true},{provide:Pn$1,useExisting:n,multi:true}]),im],ngContentSelectors:Pn,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,o){if(i&1&&(MI(),si(0,"div",1)(1,"button",2,0),mp("click",function(){return o._handleClick()}),up(3,"div",3)(4,"span",4),si(5,"span",5)(6,"span",6)(7,"span",7),up(8,"span",8),bc(),si(9,"span",9),up(10,"span",10),bc(),sI(11,Tn,5,0,"span",11),bc()()(),si(12,"label",12),mp("click",function(d){return d.stopPropagation()}),NI(13),bc()()),i&2){let a=kI(2);lp("labelPosition",o.labelPosition),rv(),bp("mdc-switch--selected",o.checked)("mdc-switch--unselected",!o.checked)("mdc-switch--checked",o.checked)("mdc-switch--disabled",o.disabled)("mat-mdc-slide-toggle-disabled-interactive",o.disabledInteractive),lp("tabIndex",o.disabled&&!o.disabledInteractive?-1:o.tabIndex)("disabled",o.disabled&&!o.disabledInteractive),cp("id",o.buttonId)("name",o.name)("aria-label",o.ariaLabel)("aria-labelledby",o._getAriaLabelledBy())("aria-describedby",o.ariaDescribedby)("aria-required",o.required||null)("aria-checked",o.checked)("aria-disabled",o.disabled&&o.disabledInteractive?"true":null),rv(9),lp("matRippleTrigger",a)("matRippleDisabled",o.disableRipple||o.disabled)("matRippleCentered",true),rv(),aI(o.hideIcon?-1:11),rv(),lp("for",o.buttonId),cp("id",o._labelId);}},dependencies:[r_,Di],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Ai=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=VE({type:n});static \u0275inj=Ll({imports:[Qe,J]})}return n})();function Dn(n,t){if(n&1&&(si(0,"span",3),up(1,"span",5),tD(2),bc()),n&2){let e=bI();rv(2),xc("",e.capture.status()," ");}}function An(n,t){n&1&&(up(0,"mat-progress-spinner",6),si(1,"span"),tD(2,"pick a window..."),bc());}function Ln(n,t){if(n&1&&(up(0,"span",7),si(1,"span"),tD(2),bc()),n&2){let e=bI();rv(2),xc('Recording "',e.capture.sourceLabel(),'" in the background');}}function Nn(n,t){n&1&&(si(0,"span"),tD(1,"stays in this browser session, nothing is uploaded"),bc());}var Re=class n{capture=T(N);onLiveToggle(t){this.capture.setLive(t);}onRecordToggle(t){t?this.capture.startRecording():this.capture.stopRecording();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-live-controls"]],decls:12,vars:5,consts:[[1,"mt-2","flex","flex-col","gap-3"],[1,"flex","items-center","gap-3"],[3,"change","checked"],[1,"ml-auto","flex","items-center","gap-2","text-[12.5px]","text-[var(--muted)]"],[3,"change","checked","disabled"],[1,"h-[9px]","w-[9px]","rounded-full","bg-[var(--accent)]"],["mode","indeterminate","diameter","15"],[1,"h-[9px]","w-[9px]","rounded-full","bg-[var(--critical)]"]],template:function(e,i){e&1&&(si(0,"div",0)(1,"div",1)(2,"mat-slide-toggle",2),mp("change",function(a){return i.onLiveToggle(a.checked)}),tD(3," Follow latest pull "),bc(),sI(4,Dn,3,1,"span",3),bc(),si(5,"div",1)(6,"mat-slide-toggle",4),mp("change",function(a){return i.onRecordToggle(a.checked)}),tD(7," Record game client "),bc(),si(8,"span",3),sI(9,An,3,0)(10,Ln,3,1)(11,Nn,2,0,"span"),bc()()()),e&2&&(rv(2),lp("checked",i.capture.liveEnabled()),rv(2),aI(i.capture.liveEnabled()&&i.capture.status()?4:-1),rv(2),lp("checked",i.capture.recordToggleOn())("disabled",i.capture.isStarting()),rv(3),aI(i.capture.isStarting()?9:i.capture.isCapturing()?10:11));},dependencies:[Ai,Qe,Qi$1,Hi$1],encapsulation:2})};var Bn=["player"];function On(n,t){if(n&1){let e=yI();si(0,"video",2,0),mp("loadedmetadata",function(){au(e);let o=kI(1),a=bI();return cu(a.onLoaded(o))})("timeupdate",function(){au(e);let o=kI(1),a=bI();return cu(a.onTick(o))})("ended",function(){au(e);let o=kI(1),a=bI();return cu(a.onEnded(o))}),bc(),si(2,"div",3)(3,"button",4),mp("click",function(){au(e);let o=bI();return cu(o.clip.download())}),si(4,"mat-icon"),tD(5,"download"),bc(),tD(6," Download "),bc()();}}function Vn(n,t){n&1&&(si(0,"div",1),tD(1,"No footage for this window."),bc());}var De=class n{clip=T(N);player=NF("player");piped=null;constructor(){Au(()=>{let t=this.clip.handle(),e=this.player()?.nativeElement;!t||!e||this.piped===t||(this.piped=t,Xe(e,t.blobs,t.mimeType));});}onLoaded(t){let e=this.clip.handle();e&&(console.debug("[clip] player loadedmetadata: duration",t.duration,"window",e.startOffsetS,"-",e.endOffsetS),t.currentTime=e.startOffsetS,t.play());}onTick(t){let e=this.clip.handle();if(!e)return;let i=Math.min(e.endOffsetS,t.duration||e.endOffsetS);t.currentTime>=i&&(t.currentTime=e.startOffsetS);}onEnded(t){let e=this.clip.handle();e&&(t.currentTime=e.startOffsetS,t.play());}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-clip-player"]],viewQuery:function(e,i){e&1&&Dp(i.player,Bn,5),e&2&&RI();},decls:2,vars:1,consts:[["player",""],[1,"text-[13px]","text-[var(--muted)]"],["controls","",1,"w-full","rounded-[10px]","border","border-[var(--border)]","bg-[var(--bg)]",3,"loadedmetadata","timeupdate","ended"],[1,"mt-3","flex","items-center","justify-end"],["mat-stroked-button","",3,"click"]],template:function(e,i){e&1&&sI(0,On,7,0)(1,Vn,2,0,"div",1),e&2&&aI(i.clip.handle()?0:i.clip.extracting()?-1:1);},dependencies:[N_,P_,ub,db],encapsulation:2})};function Hn(n,t){n&1&&(si(0,"span",4),tD(1,"Cutting the clip..."),bc());}function zn(n,t){if(n&1){let e=yI();si(0,"div",0)(1,"div",1)(2,"div",2)(3,"span",3),tD(4,"Replay"),bc(),sI(5,Hn,2,0,"span",4),bc(),si(6,"button",5),mp("click",function(){au(e);let o=bI();return cu(o.clip.close())}),si(7,"mat-icon"),tD(8,"close"),bc()()(),si(9,"div",6),up(10,"wl-clip-player"),bc()();}if(n&2){let e=bI();rv(5),aI(e.clip.extracting()?5:-1);}}var Ae=class n{clip=T(N);static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-clip-panel"]],decls:1,vars:1,consts:[[1,"fixed","inset-0","z-50","flex","flex-col","bg-[var(--bg)]","md:inset-y-0","md:left-auto","md:right-0","md:w-[460px]","md:border-l","md:border-[var(--border)]","md:shadow-2xl"],[1,"flex","items-center","justify-between","border-b","border-[var(--border)]","px-4","py-2"],[1,"flex","items-center","gap-2"],[1,"font-semibold"],[1,"text-[13px]","text-[var(--muted)]"],["mat-icon-button","","aria-label","Close replay",3,"click"],[1,"flex-1","overflow-y-auto","p-4"]],template:function(e,i){e&1&&sI(0,zn,11,1,"div",0),e&2&&aI(i.clip.open()?0:-1);},dependencies:[N_,ed,ub,db,De],encapsulation:2})};var Li=(n,t)=>t.id;function Wn(n,t){if(n&1&&(si(0,"span",11),up(1,"wl-art-icon",13),pD(2,"bossIcon"),si(3,"span",14),tD(4),pD(5,"formatDuration"),bc()()),n&2){let e=t;rv(),lp("src",gD(2,5,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",gD(5,7,e.duration_s));}}function $n(n,t){if(n&1&&(si(0,"mat-option",12)(1,"span",11),up(2,"wl-art-icon",13),pD(3,"bossIcon"),si(4,"span",14),tD(5),pD(6,"formatDuration"),bc()()()),n&2){let e=t.$implicit;lp("value",e.id),rv(2),lp("src",gD(3,6,e.encounterID))("alt",e.name),rv(3),kp("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",gD(6,8,e.duration_s));}}function jn(n,t){if(n&1&&(up(0,"wl-art-icon",13),pD(1,"specIcon"),pD(2,"formatSpec")),n&2){let e=t;lp("src",gD(1,2,e))("alt",gD(2,4,e));}}function qn(n,t){if(n&1&&(up(0,"wl-art-icon",13),pD(1,"classIcon")),n&2){let e=bI();lp("src",gD(1,2,e.spec))("alt",e.spec);}}function Un(n,t){if(n&1&&(si(0,"span",11),sI(1,jn,3,6,"wl-art-icon",13)(2,qn,2,4,"wl-art-icon",13),si(3,"span",14),tD(4),bc()()),n&2){let e,i=t,o=bI(2);rv(),aI((e=o.playerSpecs()[i.id])?1:2,e),rv(3),Ap(i.name);}}function Gn(n,t){if(n&1&&(up(0,"wl-art-icon",13),pD(1,"specIcon"),pD(2,"formatSpec")),n&2){let e=t;lp("src",gD(1,2,e))("alt",gD(2,4,e));}}function Zn(n,t){if(n&1&&(up(0,"wl-art-icon",13),pD(1,"classIcon")),n&2){let e=bI().$implicit;lp("src",gD(1,2,e.spec))("alt",e.spec);}}function Kn(n,t){if(n&1&&(si(0,"mat-option",12)(1,"span",11),sI(2,Gn,3,6,"wl-art-icon",13)(3,Zn,2,4,"wl-art-icon",13),si(4,"span",14),tD(5),bc()()()),n&2){let e,i=t.$implicit,o=bI(2);lp("value",i.id),rv(2),aI((e=o.playerSpecs()[i.id])?2:3,e),rv(3),Ap(i.name);}}function Xn(n,t){if(n&1){let e=yI();si(0,"div",4)(1,"div",8)(2,"mat-form-field",9)(3,"mat-label"),tD(4,"Fight"),bc(),si(5,"mat-select",10),mp("selectionChange",function(){au(e);let o=bI();return cu(o.onFightChange())}),si(6,"mat-select-trigger"),sI(7,Wn,6,9,"span",11),bc(),uI(8,$n,7,10,"mat-option",12,Li),bc(),Qv(),bc(),si(10,"mat-form-field",9)(11,"mat-label"),tD(12,"Player"),bc(),si(13,"mat-select",10),mp("selectionChange",function(){au(e);let o=bI();return cu(o.onPlayerChange())}),si(14,"mat-select-trigger"),sI(15,Un,5,2,"span",11),bc(),uI(16,Kn,6,3,"mat-option",12,Li),bc(),Qv(),bc()()();}if(n&2){let e,i,o=bI();rv(5),lp("formControl",o.fightControl),Yv(),rv(2),aI((e=o.selectedFight())?7:-1,e),rv(),dI(o.fights()),rv(5),lp("formControl",o.playerControl),Yv(),rv(2),aI((i=o.selectedPlayer())?15:-1,i),rv(),dI(o.visiblePlayers());}}function Qn(n,t){if(n&1&&(si(0,"div",5),tD(1),bc()),n&2){let e=bI();rv(),Ap(e.error());}}function Yn(n,t){if(n&1&&up(0,"wl-loading-spinner",6),n&2){let e=bI();lp("message",e.loadingMsg());}}function Jn(n,t){if(n&1){let e=yI();si(0,"div",15)(1,"wl-rotation",16),mp("busyChange",function(o){au(e);let a=bI();return cu(a.rotationBusy.set(o))}),bc(),si(2,"wl-burst-windows",17),mp("openMap",function(o){au(e);let a=bI();return cu(a.onOpenMap(o))})("openClip",function(o){au(e);let a=bI();return cu(a.onOpenClip(o))})("busyChange",function(o){au(e);let a=bI();return cu(a.burstBusy.set(o))}),bc(),si(3,"wl-defensive",18),mp("openMap",function(o){au(e);let a=bI();return cu(a.onDefensiveOpenMap(o))})("openClip",function(o){au(e);let a=bI();return cu(a.onOpenClip(o))})("busyChange",function(o){au(e);let a=bI();return cu(a.defensiveBusy.set(o))}),bc(),si(4,"wl-gear",19),mp("busyChange",function(o){au(e);let a=bI();return cu(a.gearBusy.set(o))}),bc()();}if(n&2){let e=bI();bp("hidden",e.cardsBusy()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("reportCode",e.reportCode())("fightId",e.selectedFightId())("playerId",e.selectedPlayerId()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("showMap",e.mapReady())("showClip",e.clipReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("fightDuration",e.selectedFightDuration())("showMap",e.mapReady())("showClip",e.clipReady()),rv(),lp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId());}}function Hi(n){let t=n.match(/\/reports\/([a-zA-Z0-9]+)/);return t?t[1]:n.trim()}function zi(n){return /^[a-zA-Z0-9]{16}$/.test(n)}function eo(n=[]){let t={};return (n||[]).filter(e=>(e.encounterID||0)>0).sort((e,i)=>e.startTime-i.startTime).map(e=>{let i=e.encounterID||0;return t[i]=(t[i]||0)+1,U($({},e),{duration_s:Math.round((e.endTime-e.startTime)/100)/10,attempt:t[i]})})}function to(n=[]){return (n||[]).map(t=>({id:t.id,name:t.name,spec:t.subType||"Unknown",server:t.server||""})).sort((t,e)=>t.name.localeCompare(e.name))}function Ni(n,t,e){let o=n.find(a=>a.id===e)?.friendlyPlayers;return o?.length?t.filter(a=>o.includes(a.id)):t}function io(n,t){return t||(n[0]?.id??null)}function Bi(n,t){if(t){let e=n.find(i=>i.name.toLowerCase()===t.toLowerCase());if(e)return e.id}return io(n,null)}function no(n){let t=(n.value??"").trim();return t?zi(Hi(t))?null:{invalidReportCode:true}:null}function Oi(n,t){for(let e of ["dps","healers","tanks","unknown"])for(let i of n[e]??[]){if(i.id!==t)continue;let o=(i.type??"").replace(/ /g,""),a=((i.specs??[])[0]?.spec??"").replace(/ /g,"");return a&&o?a+o:""}return ""}var Vi=class n{wclApi=T(te);mapFeature=T(qe$1);liveCapture=T(N);selectionStore=T(Rr);reportControl=new pl("",{nonNullable:true,validators:[no]});fightControl=new pl(null);playerControl=new pl(null);constructor(){Au(()=>{this.liveCapture.liveEnabled()?this.fightControl.disable():this.fightControl.enable();});}loadingReport=xo(false);loadingAnalysis=xo(false);loadingMsg=xo("Loading\u2026");rotationBusy=xo(true);burstBusy=xo(true);defensiveBusy=xo(true);gearBusy=xo(true);cardsBusy=ID(()=>this.rotationBusy()||this.burstBusy()||this.defensiveBusy()||this.gearBusy());error=xo("");fights=xo([]);players=xo([]);selectedFightId=am(this.fightControl.valueChanges,{initialValue:this.fightControl.value});selectedPlayerId=am(this.playerControl.valueChanges,{initialValue:this.playerControl.value});liveSyncEnabled=this.liveCapture.liveEnabled;spec=xo("");playerDetailGroups=xo({});reportCode=xo("");reportStartTime=xo(0);_enemies=[];visiblePlayers=ID(()=>Ni(this.fights(),this.players(),this.selectedFightId()));playerSpecs=ID(()=>{let t=this.playerDetailGroups(),e={};for(let i of this.visiblePlayers())e[i.id]=Oi(t,i.id);return e});selectedFight=ID(()=>this.fights().find(t=>t.id===this.selectedFightId()));selectedPlayer=ID(()=>this.visiblePlayers().find(t=>t.id===this.selectedPlayerId()));selectedEncounterId=ID(()=>this.fights().find(t=>t.id===this.selectedFightId())?.encounterID??0);selectedFightDuration=ID(()=>this.fights().find(t=>t.id===this.selectedFightId())?.duration_s??0);ready=ID(()=>!!this.spec()&&!!this.reportCode()&&!!this.selectedFightId()&&!!this.selectedPlayerId()&&!!this.selectedEncounterId());mapReady(){return this.mapFeature.ready()}onOpenMap(t){this.mapFeature.openAt(t);}onDefensiveOpenMap(t){this.mapFeature.openAt({timeS:t.timeS,windowLengthS:t.windowLengthS,reference:t.refGameId!=null?{kind:"enemy",gameId:t.refGameId}:{kind:"boss"}});}clipReady(){return this.liveCapture.clipReady()}onOpenClip(t){this.liveCapture.openClip(t);}_pollingSub=Eh([sm(this.liveSyncEnabled),sm(this.reportCode)]).pipe(cl(([t,e])=>{t&&!e?this.liveCapture.setStatus("Load a report to start live sync."):t||this.liveCapture.setStatus("");}),re(([t,e])=>t&&!!e),sl(),Th(t=>t?Dh(Ri$1(void 0),this.liveCapture.pollTriggers()):Fe$1),al(()=>we(this._pollOnce())),om()).subscribe();onPaste(){setTimeout(()=>{this.loadReport();});}async loadReport(){this.error.set("");let t=Hi(this.reportControl.value.trim());if(!zi(t)){t&&this.error.set("Enter a valid Warcraft Logs report URL or 16-character report code.");return}this.reportCode.set(""),this.loadingReport.set(true),this.fights.set([]),this.players.set([]),this.spec.set(""),this.playerDetailGroups.set({}),this.mapFeature.clear(),this.liveCapture.clear();try{this.loadingMsg.set("Fetching report from WCL\u2026");let e=await this.wclApi.getReport(t);this._applyReport(e);let i=this.fights()[this.fights().length-1];this.fightControl.setValue(i?.id??null),this._applyAutoPlayer(),this.reportCode.set(t),this._persistPlayerName(),await this.resolveSelection();}catch(e){V_("PostRaidComponent.loadReport",e),this.error.set(e instanceof Error?e.message:"Failed to load report.");}finally{this.loadingReport.set(false);}}_applyReport(t){this.fights.set(eo(t.fights)),this.players.set(to(t.masterData?.actors)),this.reportStartTime.set(t.startTime),this._enemies=t.masterData?.enemies??[];}async _pollOnce(){this.error.set(""),this.liveCapture.setStatus("Checking for new pulls\u2026");try{let t=await this.wclApi.getReport(this.reportCode());this._applyReport(t);let e=this.fights()[this.fights().length-1];if(!e){this.liveCapture.setStatus("No boss pulls found.");return}if(this.selectedFightId()===e.id&&this.ready()){this.liveCapture.setStatus(`Last updated ${new Date().toLocaleTimeString()} \xB7 Polling every ${Se/1e3}s`);return}let i=this.players().find(a=>a.id===this.selectedPlayerId())?.name??null,o=Ni(this.fights(),this.players(),e.id);this.fightControl.setValue(e.id),this.playerControl.setValue(Bi(o,i)),this._persistPlayerName(),await this.resolveSelection(),this.liveCapture.setStatus(`Updated ${new Date().toLocaleTimeString()} \xB7 ${e.name}`);}catch(t){V_("PostRaidComponent._pollOnce",t),this.error.set(t instanceof Error?t.message:"Poll failed.");}}async onFightChange(){this.liveSyncEnabled()||(this._applyAutoPlayer(),this._persistPlayerName(),await this.resolveSelection());}async onPlayerChange(){this.liveSyncEnabled()||(this._persistPlayerName(),await this.resolveSelection());}async resolveSelection(){this.error.set("");let t=this.selectedFightId(),e=this.selectedPlayerId();if(this.spec.set(""),this.mapFeature.clear(),this.liveCapture.clear(),!(!t||!e)){this.loadingAnalysis.set(true),this.loadingMsg.set("Resolving spec\u2026");try{let i=await this.wclApi.getPlayerDetails(this.reportCode(),t);this.playerDetailGroups.set(i);let o=Oi(i,e);if(!o){this.error.set("Could not resolve the selected player's spec.");return}this.spec.set(o),this.rotationBusy.set(!0),this.burstBusy.set(!0),this.defensiveBusy.set(!0),this.gearBusy.set(!0),this.loadingMsg.set("Analyzing your log\u2026");let a=this.fights().find(d=>d.id===t);a&&(this.mapFeature.prepare(this.reportCode(),a,e,o,this._enemies),this.liveCapture.prepare(this.reportCode(),this.reportStartTime(),a));}catch(i){V_("PostRaidComponent.resolveSelection",i),this.error.set(i instanceof Error?i.message:"Failed to resolve selection.");}finally{this.loadingAnalysis.set(false);}}}_applyAutoPlayer(){let t=this.selectionStore.loadPostRaid()?.playerName??null;this.playerControl.setValue(Bi(this.visiblePlayers(),t));}_persistPlayerName(){let t=this.players().find(e=>e.id===this.selectedPlayerId())?.name??null;t&&this.selectionStore.savePostRaid({playerName:t});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=FE({type:n,selectors:[["wl-post-raid"]],features:[lD([{provide:ki$1,useValue:{subscriptSizing:"dynamic"}}])],decls:15,vars:5,consts:[[1,"mx-auto","max-w-[860px]","px-3","md:px-4","pt-6","pb-12"],["appearance","outlined",1,"mb-5","p-4"],["appearance","outline",1,"w-full"],["matInput","","placeholder","https://www.warcraftlogs.com/reports/AbCdEfGh\u2026",3,"keydown.enter","paste","formControl"],[1,"mt-4","border-t","border-[var(--border)]","pt-4"],[1,"mb-4","rounded-lg","border","border-[var(--critical)]/30","bg-[var(--critical)]/10","px-4","py-3.5","text-[13px]","text-[var(--critical)]"],[3,"message"],[1,"flex","flex-col","gap-6",3,"hidden"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],[3,"src","alt"],[1,"truncate"],[1,"flex","flex-col","gap-6"],[3,"busyChange","spec","encounterId","reportCode","fightId","playerId"],[3,"openMap","openClip","busyChange","spec","encounterId","report","fight","player","showMap","showClip"],[3,"openMap","openClip","busyChange","spec","encounterId","report","fight","player","fightDuration","showMap","showClip"],[3,"busyChange","spec","encounterId","report","fight","player"]],template:function(e,i){e&1&&(si(0,"div",0)(1,"mat-card",1)(2,"mat-form-field",2)(3,"mat-label"),tD(4,"Warcraft Logs Report URL or Code"),bc(),si(5,"input",3),mp("keydown.enter",function(){return i.loadReport()})("paste",function(){return i.onPaste()}),bc(),Qv(),si(6,"mat-error"),tD(7,"Paste a Warcraft Logs report URL or a 16-character report code."),bc()(),up(8,"wl-live-controls"),sI(9,Xn,18,4,"div",4),bc(),sI(10,Qn,2,1,"div",5),sI(11,Yn,1,1,"wl-loading-spinner",6),sI(12,Jn,5,27,"div",7),up(13,"wl-map-panel")(14,"wl-clip-panel"),bc()),e&2&&(rv(5),lp("formControl",i.reportControl),Yv(),rv(4),aI(i.fights().length?9:-1),rv(),aI(i.error()?10:-1),rv(),aI(i.loadingReport()||i.loadingAnalysis()||i.ready()&&i.cardsBusy()?11:-1),rv(),aI(i.ready()&&!i.loadingAnalysis()?12:-1));},dependencies:[Mm,Bo,Sm,vl,yt,vt,Je,vo,xi,Ci,Wi$1,Ni$1,hc,$e,N_,Sc,Cc,Ui,Tr,Fe,Yi$1,Pe,mr,wr,Re,Ae,ze,Cr,Sr,Mr,Ir],encapsulation:2})};
export{Vi as PostRaidComponent,eo as buildFights,to as buildPlayers,Hi as extractCode,zi as isValidReportCode,Bi as pickLivePlayerId,io as pickPlayerId,Oi as specOf,Ni as visiblePlayersOf};