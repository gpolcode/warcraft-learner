import {F as Fn$1}from'./chunk-7eQWLi7x.js';import {BurstWindowsComponent as De}from'./chunk-BgNrCFMn.js';import {$ as $e}from'./chunk-w7myJAeZ.js';import {T,aa as gc,ab as nr,ac as dt,ad as Co,p as Ho,ae as Ye,R as Iw,b as Vu,s as a,d as cE,af as Qs,ag as $s,ah as Mo,ai as dr,aj as lr,ak as mi,al as nc,am as tc,an as ic,ao as Pt$1,ap as lt,aq as mt,ar as St$1,Z as Ze,as as er,at as jt$1,au as Et$1,av as Ut$1,aw as Lt$1,ax as Kt$1,y as yi,f as rD,g as Uc,O as Op,j as xv,o as oD,ay as cw,az as ar,aA as N,$,r as re$1,l as jF,F as FF,D as Dr,_,e as zi,U as Ui,X as Xu,Y as Yu,k as kp,J as JD,h as hD,H as Hp,C as aD,aB as EI,w as wD,aC as wI,I as cD,n as nh,aD as lt$1,aE as dr$1,aF as _r,aG as uE,aH as zl,aI as er$1,aJ as Mr,aK as $F,aL as De$1,aM as K,aN as N$2,aO as We,aP as bi,aQ as qe,aR as hh,aS as Pt$2,aT as bi$1,aU as ir,aV as xm,aW as WF,aX as CD,aY as Su,aZ as Nu,a_ as bD,x as xD,W as Zp,a5 as Rp,a$ as kn$1,b0 as Mt$1,b1 as vo,b2 as qF,a8 as jp,a6 as BD,b3 as Up,b4 as MD,b5 as SD,E as fw,K as hw,m as mu,i as yu,P as gw,b6 as rh,Q as Qc}from'./main-BS3F3ATR.js';import'./chunk-C2KeUYGw.js';import {GearComponent as Qe}from'./chunk-CuillnYm.js';import {F}from'./chunk-BHkE0qo2.js';import {B as B$1}from'./chunk-X3EQB6W5.js';import {FlyoverPanelComponent as N$1}from'./chunk-C0gVr-Qx.js';import {BenchEmptyBannerComponent as B}from'./chunk-ONtDyqhr.js';import'./chunk-DQ_0IWFy.js';import {e as e$1}from'./chunk-Cf1GmhC8.js';import'./chunk-BLklbKHo.js';function Pt(t){return t.filter(o=>o.sample_count>0)}var kt=(()=>{class t{files=T(N);getSpecs(){return this.files.getSpecs()}async getEncounters(e){let n=await this.files.getEncounters(e);return n.ok?$(Pt(n.value)):n}static \u0275fac=function(n){return new(n||t)};static \u0275prov=re$1({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Nt=(t,o)=>o.name,At=(t,o)=>o.castIndex;function Vt(t,o){if(t&1&&Op(0,"wl-load-state",0),t&2){let e=wD();kp("heading",e.title())("subtitle",e.subtitle())("error",e.error());}}function Bt(t,o){if(t&1&&Op(0,"wl-game-icon",10),t&2){let e=wD().$implicit;kp("id",o)("icon",e.icon)("name",e.name);}}function Rt(t,o){if(t&1&&(yi(0,"span",11),JD(1),Uc()),t&2){let e=wD().$implicit;xv(),nh(e.name);}}function Lt(t,o){t&1&&(yi(0,"span",12),JD(1,"Bloodlust"),Uc());}function Ot(t,o){if(t&1&&(yi(0,"span",23),JD(1),fw(2,"number"),Uc(),yi(3,"span",24),JD(4),Uc()),t&2){let e=wD().$implicit;xv(),nh(e.typicalUses!=null?gw(2,3,e.typicalUses,"1.0-1"):"None"),xv(3),rh("",e.usedSampleCount,"/",e.sampleCount," parses");}}function zt(t,o){t&1&&(yi(0,"span",19),JD(1,"-"),Uc());}function $t(t,o){if(t&1&&(yi(0,"span",25),JD(1),fw(2,"formatDuration"),Uc()),t&2){let e=o.$implicit;xv(),nh(hw(2,1,e.targetS));}}function jt(t,o){if(t&1&&aD(0,$t,3,3,"span",25,At),t&2){let e=wD().$implicit;cD(e.holds);}}function qt(t,o){t&1&&(yi(0,"span",19),JD(1,"None"),Uc());}function Ut(t,o){if(t&1&&(yi(0,"div",8)(1,"div",9),rD(2,Bt,1,3,"wl-game-icon",10)(3,Rt,2,1,"span",11),rD(4,Lt,2,0,"span",12),Uc(),yi(5,"div",13)(6,"div",14)(7,"span",15)(8,"span",16),JD(9,"First use"),Uc(),yi(10,"span",17),JD(11),fw(12,"formatDuration"),Uc()(),yi(13,"span",18)(14,"span",16),JD(15,"Typical uses"),Uc(),rD(16,Ot,5,6)(17,zt,2,0,"span",19),Uc()(),yi(18,"div",20)(19,"span",16),JD(20,"Holds"),Uc(),rD(21,jt,2,0)(22,qt,2,0,"span",19),Uc()(),yi(23,"div",21)(24,"span",22),JD(25,"How to use"),Uc(),yi(26,"wl-collapsible-text"),JD(27),Uc()()()),t&2){let e,n=o.$implicit;xv(2),oD((e=n.spellId)?2:3,e),xv(2),oD(n.bloodlust?4:-1),xv(7),nh(hw(12,6,n.firstCastS)),xv(5),oD(n.sampleCount?16:17),xv(5),oD(n.holds.length?21:22),xv(6),nh(n.rule);}}function Gt(t,o){if(t&1&&(yi(0,"div",1)(1,"div",2)(2,"div",3),JD(3),Uc(),yi(4,"div",4),JD(5),Uc()(),yi(6,"div",5),Op(7,"div"),yi(8,"div",6),JD(9,"Plan"),Uc(),yi(10,"div",7),JD(11,"How to use"),Uc()(),aD(12,Ut,28,8,"div",8,Nt),Uc()),t&2){let e=wD();xv(3),nh(e.title()),xv(2),nh(e.subtitle()),xv(7),cD(e.items());}}var ft=(()=>{class t{rotation=T(Fn$1);spec=jF.required();encounterId=jF.required();title=jF("Cooldown plan");subtitle=jF("Offensive cooldown usage across top parses.");busyChange=FF();availableChange=FF();available=Ho(true);error=Ho(null);items=Ho([]);loader=new e$1;constructor(){Vu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.rotation.loadPlanView(e,n),{context:"rotation.loadPlanView",apply:i=>{i.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this.items.set(i.value.rows)):(i.error.kind==="permanent"&&a(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.available.set(false),this.availableChange.emit(false),this.items.set([]));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=cE({type:t,selectors:[["wl-rotation-cd-plan"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],title:[1,"title"],subtitle:[1,"subtitle"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[[3,"heading","subtitle","error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:grid","grid-cols-[1fr_190px_200px]","gap-[14px]","px-4","pb-1"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-1","md:grid-cols-[1fr_190px_200px]","gap-3","md:gap-[14px]","items-start","md:items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-[11px]","min-w-0","flex-wrap"],[3,"id","icon","name"],[1,"text-sm","text-[var(--text)]","whitespace-nowrap"],[1,"inline-flex","items-center","gap-1.5","bg-[var(--gold)]/10","border","border-[var(--gold)]/35","rounded-[4px]","px-2","py-0.5","font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--gold)]","whitespace-nowrap"],[1,"flex","flex-col","items-start","md:items-end","gap-1.5"],[1,"flex","flex-wrap","items-baseline","gap-x-4","gap-y-1","md:flex-col","md:items-end","md:gap-1.5"],[1,"flex","items-baseline","gap-1.5"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--muted)]"],[1,"font-mono","text-[13px]","text-[var(--accent)]","tabular-nums"],[1,"flex","flex-wrap","items-baseline","gap-1.5"],[1,"font-mono","text-[12.5px]","text-[var(--muted)]"],[1,"flex","flex-wrap","items-baseline","gap-1.5","md:justify-end"],[1,"text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2.5","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"font-mono","text-[12.5px]","text-[var(--text)]","tabular-nums"],[1,"font-mono","text-[10px]","text-[var(--muted)]","tabular-nums"],[1,"font-mono","text-[13px]","text-[var(--accent)]","bg-[var(--surface-alt)]","border","border-[var(--border)]","rounded-[4px]","px-1.5","py-px","whitespace-nowrap","tabular-nums"]],template:function(n,i){n&1&&rD(0,Vt,1,3,"wl-load-state",0)(1,Gt,14,2,"div",1),n&2&&oD(i.error()||!i.available()?0:i.items().length?1:-1);},dependencies:[B$1,F,Ze,Dr,_],encapsulation:2})}return t})();var Ht=(t,o)=>o.name,Xt=(t,o)=>o.castIndex;function Zt(t,o){if(t&1&&Op(0,"wl-load-state",0),t&2){let e=wD();kp("heading",e.title())("subtitle",e.subtitle())("error",e.error());}}function Kt(t,o){if(t&1&&Op(0,"wl-game-icon",10),t&2){let e=wD().$implicit;kp("id",o)("icon",e.icon)("name",e.name);}}function Yt(t,o){if(t&1&&(yi(0,"span",11),JD(1),Uc()),t&2){let e=wD().$implicit;xv(),nh(e.name);}}function Qt(t,o){if(t&1&&(yi(0,"span",22),JD(1),fw(2,"number"),Uc(),yi(3,"span",23),JD(4),Uc()),t&2){let e=wD().$implicit;xv(),nh(e.typicalUses!=null?gw(2,3,e.typicalUses,"1.0-1"):"None"),xv(3),rh("",e.usedSampleCount,"/",e.sampleCount," parses");}}function Wt(t,o){t&1&&(yi(0,"span",18),JD(1,"-"),Uc());}function Jt(t,o){if(t&1&&(yi(0,"span",24),JD(1),fw(2,"formatDuration"),Uc()),t&2){let e=o.$implicit;xv(),nh(hw(2,1,e.targetS));}}function en(t,o){if(t&1&&aD(0,Jt,3,3,"span",24,Xt),t&2){let e=wD().$implicit;cD(e.holds);}}function tn(t,o){t&1&&(yi(0,"span",18),JD(1,"None"),Uc());}function nn(t,o){if(t&1&&(yi(0,"div",8)(1,"div",9),rD(2,Kt,1,3,"wl-game-icon",10)(3,Yt,2,1,"span",11),Uc(),yi(4,"div",12)(5,"div",13)(6,"span",14)(7,"span",15),JD(8,"First use"),Uc(),yi(9,"span",16),JD(10),fw(11,"formatDuration"),Uc()(),yi(12,"span",17)(13,"span",15),JD(14,"Typical uses"),Uc(),rD(15,Qt,5,6)(16,Wt,2,0,"span",18),Uc()(),yi(17,"div",19)(18,"span",15),JD(19,"Holds"),Uc(),rD(20,en,2,0)(21,tn,2,0,"span",18),Uc()(),yi(22,"div",20)(23,"span",21),JD(24,"How to use"),Uc(),yi(25,"wl-collapsible-text"),JD(26),Uc()()()),t&2){let e,n=o.$implicit;xv(2),oD((e=n.spellId)?2:3,e),xv(8),nh(hw(11,5,n.firstCastS)),xv(5),oD(n.sampleCount?15:16),xv(5),oD(n.holds.length?20:21),xv(6),nh(n.rule);}}function on(t,o){if(t&1&&(yi(0,"div",1)(1,"div",2)(2,"div",3),JD(3),Uc(),yi(4,"div",4),JD(5),Uc()(),yi(6,"div",5),Op(7,"div"),yi(8,"div",6),JD(9,"Plan"),Uc(),yi(10,"div",7),JD(11,"How to use"),Uc()(),aD(12,nn,27,7,"div",8,Ht),Uc()),t&2){let e=wD();xv(3),nh(e.title()),xv(2),nh(e.subtitle()),xv(7),cD(e.items());}}var vt=(()=>{class t{defensive=T($e);spec=jF.required();encounterId=jF.required();title=jF("Defensive plan");subtitle=jF("Defensive usage across top parses.");busyChange=FF();availableChange=FF();available=Ho(true);error=Ho(null);_items=Ho([]);items=this._items.asReadonly();loader=new e$1;constructor(){Vu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.defensive.loadPlan(e,n),{context:"defensive.loadPlan",apply:i=>{i.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this._items.set(i.value.rows)):(i.error.kind==="permanent"&&a(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.available.set(false),this.availableChange.emit(false),this._items.set([]));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=cE({type:t,selectors:[["wl-defensive-plan"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],title:[1,"title"],subtitle:[1,"subtitle"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[[3,"heading","subtitle","error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:grid","grid-cols-[1fr_190px_200px]","gap-[14px]","px-4","pb-1"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-1","md:grid-cols-[1fr_190px_200px]","gap-3","md:gap-[14px]","items-start","md:items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-[11px]","min-w-0"],[3,"id","icon","name"],[1,"text-sm","text-[var(--text)]","whitespace-nowrap"],[1,"flex","flex-col","items-start","md:items-end","gap-1.5"],[1,"flex","flex-wrap","items-baseline","gap-x-4","gap-y-1","md:flex-col","md:items-end","md:gap-1.5"],[1,"flex","items-baseline","gap-1.5"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--muted)]"],[1,"font-mono","text-[13px]","text-[var(--accent)]","tabular-nums"],[1,"flex","flex-wrap","items-baseline","gap-1.5"],[1,"font-mono","text-[12.5px]","text-[var(--muted)]"],[1,"flex","flex-wrap","items-baseline","gap-1.5","md:justify-end"],[1,"text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2.5","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"font-mono","text-[12.5px]","text-[var(--text)]","tabular-nums"],[1,"font-mono","text-[10px]","text-[var(--muted)]","tabular-nums"],[1,"font-mono","text-[13px]","text-[var(--accent)]","bg-[var(--surface-alt)]","border","border-[var(--border)]","rounded-[4px]","px-1.5","py-px","whitespace-nowrap","tabular-nums"]],template:function(n,i){n&1&&rD(0,Zt,1,3,"wl-load-state",0)(1,on,14,2,"div",1),n&2&&oD(i.error()||!i.available()?0:i.items().length?1:-1);},dependencies:[B$1,F,Ze,Dr,_],encapsulation:2})}return t})();var re=class{_document;_textarea;constructor(o,e){this._document=e;let n=this._textarea=this._document.createElement("textarea"),i=n.style;i.position="fixed",i.top=i.opacity="0",i.left="-999em",n.setAttribute("aria-hidden","true"),n.value=o,n.readOnly=true,(this._document.fullscreenElement||this._document.body).appendChild(n);}copy(){let o=this._textarea,e=false;try{if(o){let n=this._document.activeElement;o.select(),o.setSelectionRange(0,o.value.length),e=this._document.execCommand("copy"),n&&n.focus();}}catch{}return e}destroy(){let o=this._textarea;o&&(o.remove(),this._textarea=void 0);}},gt=(()=>{class t{_document=T(dr$1);copy(e){let n=this.beginCopy(e),i=n.copy();return n.destroy(),i}beginCopy(e){return new re(e,this._document)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=_r({token:t,factory:t.\u0275fac})}return t})();var an=["input"],cn=["label"],rn=["*"],le={color:"accent",clickAction:"check-indeterminate",disabledInteractive:false},ln=new N$2("mat-checkbox-default-options",{providedIn:"root",factory:()=>le}),y=(function(t){return t[t.Init=0]="Init",t[t.Checked=1]="Checked",t[t.Unchecked=2]="Unchecked",t[t.Indeterminate=3]="Indeterminate",t})(y||{}),de=class{source;checked},se=(()=>{class t{_elementRef=T(Mr);_changeDetectorRef=T($F);_ngZone=T(De$1);_animationsDisabled=K();_options=T(ln,{optional:true});focus(){this._inputElement.nativeElement.focus();}_createChangeEvent(e){let n=new de;return n.source=this,n.checked=e,n}_getAnimationTargetElement(){return this._inputElement?.nativeElement}_animationClasses={uncheckedToChecked:"mdc-checkbox--anim-unchecked-checked",uncheckedToIndeterminate:"mdc-checkbox--anim-unchecked-indeterminate",checkedToUnchecked:"mdc-checkbox--anim-checked-unchecked",checkedToIndeterminate:"mdc-checkbox--anim-checked-indeterminate",indeterminateToChecked:"mdc-checkbox--anim-indeterminate-checked",indeterminateToUnchecked:"mdc-checkbox--anim-indeterminate-unchecked"};ariaLabel="";ariaLabelledby=null;ariaDescribedby;ariaExpanded;ariaControls;ariaOwns;_uniqueId;id;get inputId(){return `${this.id||this._uniqueId}-input`}required=false;labelPosition="after";name=null;change=new We;indeterminateChange=new We;value;disableRipple=false;_inputElement;_labelElement;tabIndex;color;disabledInteractive;_onTouched=()=>{};_currentAnimationClass="";_currentCheckState=y.Init;_controlValueAccessorChangeFn=()=>{};_validatorChangeFn=()=>{};constructor(){T(bi).load(qe);let e=T(new hh("tabindex"),{optional:true});this._options=this._options||le,this.color=this._options.color||le.color,this.tabIndex=e==null?0:parseInt(e)||0,this.id=this._uniqueId=T(Pt$2).getId("mat-mdc-checkbox-"),this.disabledInteractive=this._options?.disabledInteractive??false;}ngOnChanges(e){e.required&&this._validatorChangeFn();}ngAfterViewInit(){this._syncIndeterminate(this.indeterminate);}get checked(){return this._checked}set checked(e){e!=this.checked&&(this._checked=e,this._changeDetectorRef.markForCheck());}_checked=false;get disabled(){return this._disabled}set disabled(e){e!==this.disabled&&(this._disabled=e,this._changeDetectorRef.markForCheck());}_disabled=false;get indeterminate(){return this._indeterminate()}set indeterminate(e){let n=e!=this._indeterminate();this._indeterminate.set(e),n&&(e?this._transitionCheckState(y.Indeterminate):this._transitionCheckState(this.checked?y.Checked:y.Unchecked),this.indeterminateChange.emit(e)),this._syncIndeterminate(e);}_indeterminate=Ho(false);_isRippleDisabled(){return this.disableRipple||this.disabled}_onLabelTextChange(){this._changeDetectorRef.detectChanges();}writeValue(e){this.checked=!!e;}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorChangeFn=e;}_transitionCheckState(e){let n=this._currentCheckState,i=this._getAnimationTargetElement();if(!(n===e||!i)&&(this._currentAnimationClass&&i.classList.remove(this._currentAnimationClass),this._currentAnimationClass=this._getAnimationClassForCheckStateTransition(n,e),this._currentCheckState=e,this._currentAnimationClass.length>0)){i.classList.add(this._currentAnimationClass);let d=this._currentAnimationClass;this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{i.classList.remove(d);},1e3);});}}_emitChangeEvent(){this._controlValueAccessorChangeFn(this.checked),this.change.emit(this._createChangeEvent(this.checked)),this._inputElement&&(this._inputElement.nativeElement.checked=this.checked);}toggle(){this.checked=!this.checked,this._controlValueAccessorChangeFn(this.checked);}_handleInputClick(){let e=this._options?.clickAction;!this.disabled&&e!=="noop"?(this.indeterminate&&e!=="check"&&Promise.resolve().then(()=>{this._indeterminate.set(false),this.indeterminateChange.emit(false);}),this._checked=!this._checked,this._transitionCheckState(this._checked?y.Checked:y.Unchecked),this._emitChangeEvent()):(this.disabled&&this.disabledInteractive||!this.disabled&&e==="noop")&&(this._inputElement.nativeElement.checked=this.checked,this._inputElement.nativeElement.indeterminate=this.indeterminate);}_onInteractionEvent(e){e.stopPropagation();}_onBlur(){Promise.resolve().then(()=>{this._onTouched(),this._changeDetectorRef.markForCheck();});}_getAnimationClassForCheckStateTransition(e,n){if(this._animationsDisabled)return "";switch(e){case y.Init:if(n===y.Checked)return this._animationClasses.uncheckedToChecked;if(n==y.Indeterminate)return this._checked?this._animationClasses.checkedToIndeterminate:this._animationClasses.uncheckedToIndeterminate;break;case y.Unchecked:return n===y.Checked?this._animationClasses.uncheckedToChecked:this._animationClasses.uncheckedToIndeterminate;case y.Checked:return n===y.Unchecked?this._animationClasses.checkedToUnchecked:this._animationClasses.checkedToIndeterminate;case y.Indeterminate:return n===y.Checked?this._animationClasses.indeterminateToChecked:this._animationClasses.indeterminateToUnchecked}return ""}_syncIndeterminate(e){let n=this._inputElement;n&&(n.nativeElement.indeterminate=e);}_onInputClick(){this._handleInputClick();}_onTouchTargetClick(){this._handleInputClick(),this.disabled||this._inputElement.nativeElement.focus();}_preventBubblingFromLabel(e){e.target&&this._labelElement.nativeElement.contains(e.target)&&e.stopPropagation();}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=cE({type:t,selectors:[["mat-checkbox"]],viewQuery:function(n,i){if(n&1&&Up(an,5)(cn,5),n&2){let d;MD(d=SD())&&(i._inputElement=d.first),MD(d=SD())&&(i._labelElement=d.first);}},hostAttrs:[1,"mat-mdc-checkbox"],hostVars:16,hostBindings:function(n,i){n&2&&(jp("id",i.id),Rp("tabindex",null)("aria-label",null)("aria-labelledby",null),BD(i.color?"mat-"+i.color:"mat-accent"),Zp("_mat-animation-noopable",i._animationsDisabled)("mdc-checkbox--disabled",i.disabled)("mat-mdc-checkbox-disabled",i.disabled)("mat-mdc-checkbox-checked",i.checked)("mat-mdc-checkbox-disabled-interactive",i.disabledInteractive));},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],ariaExpanded:[2,"aria-expanded","ariaExpanded",WF],ariaControls:[0,"aria-controls","ariaControls"],ariaOwns:[0,"aria-owns","ariaOwns"],id:"id",required:[2,"required","required",WF],labelPosition:"labelPosition",name:"name",value:"value",disableRipple:[2,"disableRipple","disableRipple",WF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?void 0:qF(e)],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",WF],checked:[2,"checked","checked",WF],disabled:[2,"disabled","disabled",WF],indeterminate:[2,"indeterminate","indeterminate",WF]},outputs:{change:"change",indeterminateChange:"indeterminateChange"},exportAs:["matCheckbox"],features:[cw([{provide:kn$1,useExisting:vo(()=>t),multi:true},{provide:Mt$1,useExisting:t,multi:true}]),xm],ngContentSelectors:rn,decls:15,vars:23,consts:[["checkbox",""],["input",""],["label",""],["mat-internal-form-field","",3,"click","labelPosition"],[1,"mdc-checkbox"],["aria-hidden","true",1,"mat-mdc-checkbox-touch-target",3,"click"],["type","checkbox",1,"mdc-checkbox__native-control",3,"blur","click","change","checked","indeterminate","disabled","id","required","tabIndex"],["aria-hidden","true",1,"mdc-checkbox__ripple"],["aria-hidden","true",1,"mdc-checkbox__background"],["focusable","false","viewBox","0 0 24 24",1,"mdc-checkbox__checkmark"],["fill","none","d","M1.73,12.91 8.1,19.28 22.79,4.59",1,"mdc-checkbox__checkmark-path"],[1,"mdc-checkbox__mixedmark"],["mat-ripple","","aria-hidden","true",1,"mat-mdc-checkbox-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-label",3,"for"]],template:function(n,i){if(n&1&&(CD(),yi(0,"div",3),Hp("click",function(B){return i._preventBubblingFromLabel(B)}),yi(1,"div",4,0)(3,"div",5),Hp("click",function(){return i._onTouchTargetClick()}),Uc(),yi(4,"input",6,1),Hp("blur",function(){return i._onBlur()})("click",function(){return i._onInputClick()})("change",function(B){return i._onInteractionEvent(B)}),Uc(),Op(6,"div",7),yi(7,"div",8),Su(),yi(8,"svg",9),Op(9,"path",10),Uc(),Nu(),Op(10,"div",11),Uc(),Op(11,"div",12),Uc(),yi(12,"label",13,2),bD(14),Uc()()),n&2){let d=xD(2);kp("labelPosition",i.labelPosition),xv(4),Zp("mdc-checkbox--selected",i.checked),kp("checked",i.checked)("indeterminate",i.indeterminate)("disabled",i.disabled&&!i.disabledInteractive)("id",i.inputId)("required",i.required)("tabIndex",i.disabled&&!i.disabledInteractive?-1:i.tabIndex),Rp("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-checked",i.indeterminate?"mixed":null)("aria-controls",i.ariaControls)("aria-disabled",i.disabled&&i.disabledInteractive?true:null)("aria-expanded",i.ariaExpanded)("aria-owns",i.ariaOwns)("name",i.name)("value",i.value),xv(7),kp("matRippleTrigger",d)("matRippleDisabled",i.disableRipple||i.disabled)("matRippleCentered",true),xv(),kp("for",i.inputId);}},dependencies:[bi$1,ir],styles:[`.mdc-checkbox {
  display: inline-block;
  position: relative;
  flex: 0 0 18px;
  box-sizing: content-box;
  width: 18px;
  height: 18px;
  line-height: 0;
  white-space: nowrap;
  cursor: pointer;
  vertical-align: bottom;
  padding: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  margin: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}
.mdc-checkbox:hover > .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:hover > .mat-mdc-checkbox-ripple > .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--mat-checkbox-state-layer-size, 40px);
  height: var(--mat-checkbox-state-layer-size, 40px);
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  right: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}

.mdc-checkbox--disabled {
  cursor: default;
  pointer-events: none;
}

.mdc-checkbox__background {
  display: inline-flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 2px;
  background-color: transparent;
  pointer-events: none;
  will-change: background-color, border-color;
  transition: background-color 90ms cubic-bezier(0.4, 0, 0.6, 1), border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  border-color: var(--mat-checkbox-unselected-icon-color, var(--mat-sys-on-surface-variant));
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
}

.mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}
@media (forced-colors: active) {
  .mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
  .mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-hover-icon-color, var(--mat-sys-on-surface));
  background-color: transparent;
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox__native-control:focus:focus:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-focus-icon-color, var(--mat-sys-on-surface));
}

.mdc-checkbox__native-control:focus:focus:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
    border-color: GrayText;
  }
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}

.mdc-checkbox__checkmark {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.6, 1);
  color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__checkmark {
    color: CanvasText;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
  color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
    color: GrayText;
  }
}

.mdc-checkbox__checkmark-path {
  transition: stroke-dashoffset 180ms cubic-bezier(0.4, 0, 0.6, 1);
  stroke: currentColor;
  stroke-width: 3.12px;
  stroke-dashoffset: 29.7833385;
  stroke-dasharray: 29.7833385;
}

.mdc-checkbox__mixedmark {
  width: 100%;
  height: 0;
  transform: scaleX(0) rotate(0deg);
  border-width: 1px;
  border-style: solid;
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  border-color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__mixedmark {
    margin: 0 1px;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
  border-color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
    border-color: GrayText;
  }
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,
.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,
.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,
.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background {
  animation-duration: 180ms;
  animation-timing-function: linear;
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-unchecked-checked-checkmark-path 180ms linear;
  transition: none;
}

.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-checked-unchecked-checkmark-path 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark {
  animation: mdc-checkbox-checked-indeterminate-checkmark 90ms linear;
  transition: none;
}
.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-checked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark {
  animation: mdc-checkbox-indeterminate-checked-checkmark 500ms linear;
  transition: none;
}
.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-checked-mixedmark 500ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear;
  transition: none;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path {
  stroke-dashoffset: 0;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transition: opacity 180ms cubic-bezier(0, 0, 0.2, 1), transform 180ms cubic-bezier(0, 0, 0.2, 1);
  opacity: 1;
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(-45deg);
}

.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(0deg);
  opacity: 1;
}

@keyframes mdc-checkbox-unchecked-checked-checkmark-path {
  0%, 50% {
    stroke-dashoffset: 29.7833385;
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark {
  0%, 68.2% {
    transform: scaleX(0);
  }
  68.2% {
    animation-timing-function: cubic-bezier(0, 0, 0, 1);
  }
  100% {
    transform: scaleX(1);
  }
}
@keyframes mdc-checkbox-checked-unchecked-checkmark-path {
  from {
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    opacity: 1;
    stroke-dashoffset: 0;
  }
  to {
    opacity: 0;
    stroke-dashoffset: -29.7833385;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-checkmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(45deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-checkmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(45deg);
    opacity: 0;
  }
  to {
    transform: rotate(360deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(-45deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(315deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark {
  0% {
    animation-timing-function: linear;
    transform: scaleX(1);
    opacity: 1;
  }
  32.8%, 100% {
    transform: scaleX(0);
    opacity: 0;
  }
}
.mat-mdc-checkbox {
  display: inline-block;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-touch-target,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__native-control,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__ripple,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-ripple::before,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-checkbox label {
  cursor: pointer;
}
.mat-mdc-checkbox .mat-internal-form-field {
  color: var(--mat-checkbox-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-checkbox-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-checkbox-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-checkbox-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-checkbox-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-checkbox-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive input {
  cursor: default;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
  cursor: default;
  color: var(--mat-checkbox-disabled-label-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
    color: GrayText;
  }
}
.mat-mdc-checkbox label:empty {
  display: none;
}
.mat-mdc-checkbox .mdc-checkbox__ripple {
  opacity: 0;
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple,
.mdc-checkbox__ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-checkbox .mat-mdc-checkbox-ripple:not(:empty),
.mdc-checkbox__ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-mdc-checkbox-ripple .mat-ripple-element {
  opacity: 0.1;
}

.mat-mdc-checkbox-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-checkbox-touch-target-size, 48px);
  width: var(--mat-checkbox-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--mat-checkbox-touch-target-display, block);
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple::before {
  border-radius: 50%;
}

.mdc-checkbox__native-control:focus-visible ~ .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})}return t})(),Ct=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=uE({type:t});static \u0275inj=zl({imports:[se,er$1]})}return t})();var sn="Mythic",mn="everyone";function yt(t,o){let e=`EncounterID:${t.encounter_id};Name:${t.encounter_name};Difficulty:${sn}`,n=[];for(let i of t.abilities)if(o.has(i.spell_id))for(let d of i.cast_times_s)n.push({time_s:d,text:`time:${d};tag:${mn};spellid:${i.spell_id};text:${i.name}`});return n.sort((i,d)=>i.time_s-d.time_s),[e,...n.map(i=>i.text)].join(`
`)}function St(t){return {cooldowns:t.filter(o=>o.kind==="cooldown"),defensives:t.filter(o=>o.kind==="defensive")}}function wt(t,o){return new Set(t.map(e=>e.spell_id).filter(e=>!o.has(e)))}function me(t,o){return t.length>0&&t.every(e=>!o.has(e.spell_id))}function Et(t,o,e){let n=new Set(t);return e?n.delete(o):n.add(o),n}function It(t,o){return t.length===0?new Set(o):me(t,o)?new Set(t.map(e=>e.spell_id)):new Set}function Tt(t,o){return t&&o}var Dt=(()=>{class t{source=T(lt$1);getExport(e,n){return this.source.getBench(e,n)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=re$1({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Ft=(t,o)=>o.spell_id;function pn(t,o){if(t&1&&Op(0,"wl-load-state",0),t&2){let e=wD();kp("error",e.error());}}function hn(t,o){if(t&1){let e=hD();yi(0,"div",1)(1,"div",3)(2,"div")(3,"div",4),JD(4,"Northern Sky export"),Uc(),yi(5,"div",5),JD(6,"Top-parse cooldown timings as a Northern Sky note."),Uc()(),yi(7,"button",6),Hp("click",function(){mu(e);let i=wD();return yu(i.openPanel())}),yi(8,"mat-icon"),JD(9,"download"),Uc(),JD(10," Export "),Uc()()();}}function un(t,o){t&1&&(yi(0,"div",12),JD(1,"Copied to clipboard."),Uc());}function bn(t,o){t&1&&(yi(0,"div",13),JD(1,"Clipboard write failed. Retry the copy."),Uc());}function _n(t,o){if(t&1){let e=hD();yi(0,"mat-checkbox",17),Hp("change",function(i){let d=mu(e).$implicit,B=wD(3);return yu(B.toggle(d.spell_id,i.checked))}),yi(1,"span",18),Op(2,"wl-game-icon",19),yi(3,"span",20),JD(4),Uc()()();}if(t&2){let e=o.$implicit,n=wD(3);kp("checked",n.isSelected(e.spell_id)),xv(2),kp("id",e.spell_id)("icon",e.icon)("name",e.name),xv(2),Qc("\xD7",e.cast_times_s.length);}}function xn(t,o){if(t&1&&(yi(0,"div",14),JD(1,"Cooldowns"),Uc(),yi(2,"div",15),aD(3,_n,5,5,"mat-checkbox",16,Ft),Uc()),t&2){let e=wD(2);xv(3),cD(e.cooldowns());}}function kn(t,o){if(t&1){let e=hD();yi(0,"mat-checkbox",17),Hp("change",function(i){let d=mu(e).$implicit,B=wD(3);return yu(B.toggle(d.spell_id,i.checked))}),yi(1,"span",18),Op(2,"wl-game-icon",19),yi(3,"span",20),JD(4),Uc()()();}if(t&2){let e=o.$implicit,n=wD(3);kp("checked",n.isSelected(e.spell_id)),xv(2),kp("id",e.spell_id)("icon",e.icon)("name",e.name),xv(2),Qc("\xD7",e.cast_times_s.length);}}function fn(t,o){if(t&1&&(yi(0,"div",14),JD(1,"Defensives"),Uc(),yi(2,"div",15),aD(3,kn,5,5,"mat-checkbox",16,Ft),Uc()),t&2){let e=wD(2);xv(3),cD(e.defensives());}}function vn(t,o){if(t&1){let e=hD();yi(0,"wl-flyover-panel",7),Hp("closed",function(){mu(e);let i=wD();return yu(i.open.set(false))}),yi(1,"div",8)(2,"div",9)(3,"button",10),Hp("click",function(){mu(e);let i=wD();return yu(i.toggleAll())}),JD(4),Uc(),yi(5,"button",11),Hp("click",function(){mu(e);let i=wD();return yu(i.copyNote())}),yi(6,"mat-icon"),JD(7,"download"),Uc(),JD(8," Copy note "),Uc()(),rD(9,un,2,0,"div",12),rD(10,bn,2,0,"div",13),rD(11,xn,5,0),rD(12,fn,5,0),Uc()();}if(t&2){let e=wD();xv(4),nh(e.allSelected()?"Deselect all":"Select all"),xv(5),oD(e.copied()?9:-1),xv(),oD(e.copyFailed()?10:-1),xv(),oD(e.cooldowns().length>0?11:-1),xv(),oD(e.defensives().length>0?12:-1);}}var Mt=(()=>{class t{feature=T(Dt);selection=T(nr);clipboard=T(gt);spec=jF.required();encounterId=jF.required();busyChange=FF();availableChange=FF();bench=Ho(null);excluded=Ho(new Set(this.selection.loadNorthernSky()?.excludedSpellIds??[]));open=Ho(false);copied=Ho(false);copyFailed=Ho(false);error=Ho(null);abilities=Iw(()=>this.bench()?.abilities??[]);grouped=Iw(()=>St(this.abilities()));cooldowns=Iw(()=>this.grouped().cooldowns);defensives=Iw(()=>this.grouped().defensives);available=Iw(()=>this.abilities().length>0);allSelected=Iw(()=>me(this.abilities(),this.excluded()));panelOpen=Iw(()=>Tt(this.open(),this.available()));loader=new e$1;constructor(){Vu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.feature.getExport(e,n),{context:"northernSky.getExport",apply:i=>{i.ok?(this.error.set(null),this.bench.set(i.value)):(i.error.kind==="permanent"&&a(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.bench.set(null)),this.availableChange.emit(this.available());},settled:()=>this.busyChange.emit(false)});});}isSelected(e){return !this.excluded().has(e)}toggle(e,n){this.persist(Et(this.excluded(),e,n));}toggleAll(){this.persist(It(this.abilities(),this.excluded()));}copyNote(){let e=this.bench();if(!e)return;let n=this.clipboard.copy(yt(e,wt(this.abilities(),this.excluded())));this.copied.set(n),this.copyFailed.set(!n);}openPanel(){this.copied.set(false),this.copyFailed.set(false),this.open.set(true);}persist(e){this.excluded.set(e),this.selection.saveNorthernSky({excludedSpellIds:[...e]});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=cE({type:t,selectors:[["wl-northern-sky-export"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:3,vars:2,consts:[["heading","Northern Sky export","subtitle","Top-parse cooldown timings as a Northern Sky note.",3,"error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],["heading","Northern Sky export","closeLabel","Close export"],[1,"px-4","pt-3","pb-3","flex","items-start","justify-between","gap-3"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],["mat-stroked-button","","type","button",3,"click"],["heading","Northern Sky export","closeLabel","Close export",3,"closed"],[1,"flex","flex-col","gap-3"],[1,"flex","items-center","justify-between","gap-2"],["mat-button","","type","button",3,"click"],["mat-flat-button","","type","button",3,"click"],[1,"text-[13px]","text-[var(--success)]"],[1,"text-[13px]","text-[var(--critical)]"],[1,"text-[11px]","font-semibold","uppercase","tracking-wide","text-[var(--muted)]"],[1,"flex","flex-col","gap-1.5"],[3,"checked"],[3,"change","checked"],[1,"inline-flex","items-center","gap-2"],[3,"id","icon","name"],[1,"text-[12px]","text-[var(--muted)]"]],template:function(n,i){n&1&&(rD(0,pn,1,1,"wl-load-state",0)(1,hn,11,0,"div",1),rD(2,vn,13,5,"wl-flyover-panel",2)),n&2&&(oD(i.error()||!i.available()?0:1),xv(2),oD(i.panelOpen()?2:-1));},dependencies:[zi,Ui,Xu,Yu,Ct,se,N$1,B$1,Ze],encapsulation:2})}return t})();var gn=(t,o)=>o.className,Cn=(t,o)=>o.spec,yn=(t,o)=>o.id;function Sn(t,o){t&1&&Op(0,"wl-load-state",1),t&2&&kp("error",o);}function wn(t,o){t&1&&Op(0,"wl-loading-spinner",3);}function En(t,o){t&1&&(yi(0,"p",4),JD(1,"No spec data available."),Uc());}function In(t,o){if(t&1&&(yi(0,"span",8),Op(1,"wl-art-icon",12),fw(2,"classIcon"),fw(3,"formatSpec"),yi(4,"span"),JD(5),fw(6,"formatSpec"),Uc()()),t&2){let e=o;xv(),kp("src",hw(2,3,e))("alt",hw(3,5,e)),xv(4),nh(hw(6,7,e));}}function Tn(t,o){if(t&1&&(yi(0,"mat-option",9)(1,"span",8),Op(2,"wl-art-icon",12),fw(3,"classIcon"),yi(4,"span"),JD(5),Uc()()()),t&2){let e=o.$implicit;kp("value",e.className),xv(2),kp("src",hw(3,4,e.className))("alt",e.classLabel),xv(3),nh(e.classLabel);}}function Dn(t,o){if(t&1&&(yi(0,"span",8),Op(1,"wl-art-icon",12),fw(2,"specIcon"),fw(3,"formatSpec"),yi(4,"span"),JD(5),fw(6,"formatSpec"),Uc()()),t&2){let e=o;xv(),kp("src",hw(2,3,e))("alt",hw(3,5,e)),xv(4),nh(hw(6,7,e));}}function Fn(t,o){if(t&1&&(yi(0,"mat-option",9)(1,"span",8),Op(2,"wl-art-icon",12),fw(3,"specIcon"),yi(4,"span"),JD(5),Uc()()()),t&2){let e=o.$implicit;kp("value",e.spec),xv(2),kp("src",hw(3,4,e.spec))("alt",e.specLabel),xv(3),nh(e.specLabel);}}function Mn(t,o){if(t&1){let e=hD();yi(0,"mat-form-field",6)(1,"mat-label"),JD(2,"Spec"),Uc(),yi(3,"mat-select",7),Hp("selectionChange",function(){mu(e);let i=wD(2);return yu(i.onSpecChange())}),yi(4,"mat-select-trigger"),rD(5,Dn,7,9,"span",8),Uc(),aD(6,Fn,6,6,"mat-option",9,Cn),Uc(),EI(),Uc();}if(t&2){let e,n=wD(2);xv(3),kp("formControl",n.specControl),wI(),xv(2),oD((e=n.selectedSpec())?5:-1,e),xv(),cD(n.specsForSelectedClass());}}function Pn(t,o){t&1&&Op(0,"wl-loading-spinner",10);}function Nn(t,o){if(t&1&&(yi(0,"span",8),Op(1,"wl-art-icon",12),fw(2,"bossIcon"),yi(3,"span",13),JD(4),Uc()()),t&2){let e=o;xv(),kp("src",hw(2,3,e.id))("alt",e.name),xv(3),nh(e.name);}}function An(t,o){if(t&1&&(yi(0,"mat-option",9)(1,"span",8),Op(2,"wl-art-icon",12),fw(3,"bossIcon"),yi(4,"span",13),JD(5),Uc()()()),t&2){let e=o.$implicit;kp("value",e.id),xv(2),kp("src",hw(3,4,e.id))("alt",e.name),xv(3),nh(e.name);}}function Vn(t,o){if(t&1){let e=hD();yi(0,"mat-form-field",11)(1,"mat-label"),JD(2,"Encounter"),Uc(),yi(3,"mat-select",7),Hp("selectionChange",function(){mu(e);let i=wD(2);return yu(i.onEncChange())}),yi(4,"mat-select-trigger"),rD(5,Nn,5,5,"span",8),Uc(),aD(6,An,6,6,"mat-option",9,yn),Uc(),EI(),Uc();}if(t&2){let e,n=wD(2);xv(3),kp("formControl",n.encControl),wI(),xv(2),oD((e=n.selectedEncounter())?5:-1,e),xv(),cD(n.encounters());}}function Bn(t,o){if(t&1){let e=hD();yi(0,"div",5)(1,"mat-form-field",6)(2,"mat-label"),JD(3,"Class"),Uc(),yi(4,"mat-select",7),Hp("selectionChange",function(){mu(e);let i=wD();return yu(i.onClassChange())}),yi(5,"mat-select-trigger"),rD(6,In,7,9,"span",8),Uc(),aD(7,Tn,6,6,"mat-option",9,gn),Uc(),EI(),Uc(),rD(9,Mn,8,2,"mat-form-field",6),Uc(),rD(10,Pn,1,0,"wl-loading-spinner",10)(11,Vn,8,2,"mat-form-field",11);}if(t&2){let e,n=wD();xv(4),kp("formControl",n.classControl),wI(),xv(2),oD((e=n.selectedClass())?6:-1,e),xv(),cD(n.classes()),xv(2),oD(n.selectedClass()?9:-1),xv(),oD(n.loadingEncounters()?10:n.encounters().length>0||n.selectedSpec()?11:-1);}}function Rn(t,o){t&1&&Op(0,"wl-loading-spinner",14);}function Ln(t,o){if(t&1&&Op(0,"wl-bench-empty-banner",16),t&2){let e=wD(2);kp("encounter",e.selectedEncounter()?.name??"");}}function On(t,o){if(t&1){let e=hD();rD(0,Rn,1,0,"wl-loading-spinner",14),yi(1,"div",15),rD(2,Ln,1,1,"wl-bench-empty-banner",16),yi(3,"wl-northern-sky-export",17),Hp("busyChange",function(i){mu(e);let d=wD();return yu(d.northernSkyBusy.set(i))})("availableChange",function(i){mu(e);let d=wD();return yu(d.northernSkyAvailable.set(i))}),Uc(),yi(4,"wl-gear",17),Hp("busyChange",function(i){mu(e);let d=wD();return yu(d.gearBusy.set(i))})("availableChange",function(i){mu(e);let d=wD();return yu(d.gearAvailable.set(i))}),Uc(),yi(5,"wl-rotation-cd-plan",17),Hp("busyChange",function(i){mu(e);let d=wD();return yu(d.cdPlanBusy.set(i))})("availableChange",function(i){mu(e);let d=wD();return yu(d.cdPlanAvailable.set(i))}),Uc(),yi(6,"wl-defensive-plan",17),Hp("busyChange",function(i){mu(e);let d=wD();return yu(d.defensivePlanBusy.set(i))})("availableChange",function(i){mu(e);let d=wD();return yu(d.defensivePlanAvailable.set(i))}),Uc(),yi(7,"wl-burst-windows",18),Hp("openMap",function(i){mu(e);let d=wD();return yu(d.onOpenMap(i))})("busyChange",function(i){mu(e);let d=wD();return yu(d.burstBusy.set(i))})("availableChange",function(i){mu(e);let d=wD();return yu(d.burstAvailable.set(i))}),Uc()();}if(t&2){let e=wD();oD(e.cardsBusy()?0:-1),xv(),Zp("hidden",e.cardsBusy()),xv(),oD(e.benchAvailable()?-1:2),xv(),kp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),xv(),kp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),xv(),kp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),xv(),kp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),xv(),kp("spec",e.selectedSpec())("encounterId",e.selectedEncId())("showMap",e.mapReady());}}var Lo=(()=>{class t{encounterSelection=T(kt);mapFeature=T(gc);selectionStore=T(nr);specMeta=T(dt);classControl=new Co("",{nonNullable:true});specControl=new Co({value:"",disabled:true},{nonNullable:true});encControl=new Co({value:0,disabled:true},{nonNullable:true});specs=Ho([]);encounters=Ho([]);selectedClass=Ye(this.classControl.valueChanges,{initialValue:this.classControl.value});selectedSpec=Ye(this.specControl.valueChanges,{initialValue:this.specControl.value});selectedEncId=Ye(this.encControl.valueChanges,{initialValue:this.encControl.value});classes=Iw(()=>{let e=this.specs().map(n=>n.spec);return this.specMeta.classList().filter(n=>this.specMeta.specsForClass(n.className,e).length>0)});specsForSelectedClass=Iw(()=>this.specMeta.specsForClass(this.selectedClass(),this.specs().map(e=>e.spec)));selectedEncounter=Iw(()=>this.encounters().find(e=>e.id===this.selectedEncId()));loading=Ho(false);loadingEncounters=Ho(false);error=Ho(null);encounterLoader=new e$1;gearAvailable=Ho(true);cdPlanAvailable=Ho(true);defensivePlanAvailable=Ho(true);burstAvailable=Ho(true);northernSkyAvailable=Ho(true);benchAvailable=Iw(()=>this.gearAvailable()||this.cdPlanAvailable()||this.defensivePlanAvailable()||this.burstAvailable()||this.northernSkyAvailable());gearBusy=Ho(true);cdPlanBusy=Ho(true);defensivePlanBusy=Ho(true);burstBusy=Ho(true);northernSkyBusy=Ho(true);cardsBusy=Iw(()=>this.gearBusy()||this.cdPlanBusy()||this.defensivePlanBusy()||this.burstBusy()||this.northernSkyBusy());mapReady=this.mapFeature.ready;onOpenMap(e){this.mapFeature.openAt(e);}constructor(){Vu(()=>{this.classes().length&&this.classControl.enable({emitEvent:false});});}async ngOnInit(){this.loading.set(true);try{let i=await this.encounterSelection.getSpecs();i.ok?this.specs.set(i.value):this.surfaceLoadError(i.error);}finally{this.loading.set(false);}let e=this.selectionStore.loadPreFight()?.spec??"",n=await this.specMeta.resolve(e);e&&n&&this.specs().some(i=>i.spec===e)&&(this.classControl.setValue(n.className),this.specControl.enable({emitEvent:false}),this.specControl.setValue(e),this._onSpecSelected(e));}onClassChange(){this.specControl.setValue("",{emitEvent:true}),this.selectionStore.savePreFight({spec:null}),this.mapFeature.clear(),this.encControl.setValue(0,{emitEvent:true}),this.encControl.disable({emitEvent:false}),this.encounters.set([]);let e=this.specs().map(n=>n.spec);this.specMeta.specsForClass(this.classControl.value,e).length?this.specControl.enable({emitEvent:false}):this.specControl.disable({emitEvent:false});}onSpecChange(){let e=this.specControl.value;this.selectionStore.savePreFight({spec:e||null}),this.mapFeature.clear(),this.encControl.setValue(0,{emitEvent:true}),this.encControl.disable({emitEvent:false}),this.encounters.set([]),e&&this._onSpecSelected(e);}_onSpecSelected(e){this.error.set(null),this.loadingEncounters.set(true),this.encounterLoader.run(this.encounterSelection.getEncounters(e),{context:"encounterSelection.getEncounters",apply:n=>{if(!n.ok){this.surfaceLoadError(n.error),this.encControl.disable({emitEvent:false});return}this.encounters.set(n.value),n.value.length?this.encControl.enable({emitEvent:false}):this.encControl.disable({emitEvent:false});},settled:()=>this.loadingEncounters.set(false)});}surfaceLoadError(e){e.kind==="permanent"&&a(e.id,e.context),this.error.set(e.kind==="missing"?null:e);}async onEncChange(){let e=this.encControl.value,n=this.specControl.value;this.mapFeature.clear(),this.gearBusy.set(true),this.cdPlanBusy.set(true),this.defensivePlanBusy.set(true),this.burstBusy.set(true),this.northernSkyBusy.set(true),!(!e||!n)&&this.mapFeature.loadBench(n,e);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=cE({type:t,selectors:[["wl-pre-fight"]],features:[cw([{provide:ar,useValue:{subscriptSizing:"dynamic"}}])],decls:8,vars:3,consts:[[1,"mx-auto","flex","max-w-[860px]","flex-col","gap-4","px-3","md:px-4","pt-6","pb-12"],[3,"error"],["appearance","outlined",1,"p-4"],["message","Loading specs\u2026"],[1,"text-[13px]","text-[var(--muted)]"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],["message","Loading encounters\u2026"],["appearance","outline",1,"mt-3","w-full"],[3,"src","alt"],[1,"truncate"],["message","Loading the plan\u2026"],[1,"flex","flex-col","gap-4"],["variant","pre",3,"encounter"],[3,"busyChange","availableChange","spec","encounterId"],[3,"openMap","busyChange","availableChange","spec","encounterId","showMap"]],template:function(n,i){if(n&1&&(yi(0,"div",0),rD(1,Sn,1,1,"wl-load-state",1),yi(2,"mat-card",2),rD(3,wn,1,0,"wl-loading-spinner",3)(4,En,2,0,"p",4)(5,Bn,12,4),Uc(),rD(6,On,8,15),Op(7,"wl-map-panel"),Uc()),n&2){let d;xv(),oD((d=i.error())?1:-1,d),xv(2),oD(i.loading()?3:i.specs().length===0||i.classes().length===0?4:5),xv(3),oD(i.selectedEncId()?6:-1);}},dependencies:[Qs,$s,Mo,dr,lr,mi,nc,tc,ic,Pt$1,lt,mt,St$1,B,Ze,er,ft,vt,De,Qe,jt$1,Mt,Et$1,Ut$1,Lt$1,Kt$1],encapsulation:2})}return t})();export{Lo as PreFightComponent};//# sourceMappingURL=chunk-BxC3gKzy.js.map
