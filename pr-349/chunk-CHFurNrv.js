import {t as tn$1,B as B_,k as dt,H as Ht$1,q as qt$1,x as xt,a as Ho,b as qo,c as tf,l as lt,m as mf,d as cf,e as Wf,f as Hf,g as ct,$ as $_,Z as Zu,A as Ah,v as v_,h as b_,i as T_,C as C_,I as I_,L as Lo,O as Og,u as mt,y as ia,Y as Yt$1,U as Ug,w as wa,D as Kg}from'./chunk-BfJ9F3KJ.js';import {T,a as od,S as So,Q as Qm,c as TD,b9 as $b,ba as Hb,bb as Wb,u as ua,j as jI,v as vp,_ as _p,l as ld,p as oi,A as aE,t as bc,z as np,B as ov,F as cE,G as fD,bc as Ga,ax as ri,o as oe,ag as iF,ah as oF,C as Cu,al as gc,k as Ib,aW as xb,ai as fv,aj as hv,E as tp,s as nD,am as vE,x as cp,an as dE,y as Zv,ao as _E,K as Kv,ap as fE,aq as Cp,bd as Ja,H as Jn,aw as hr,N as HI,P as xl,R as J,V as gr,aC as lF,Y as Se,aD as Ae,a2 as x,aE as He,au as re,aF as sa,aG as Lp,a1 as Wt$1,aH as q_,ab as sm,ac as dF,aI as SE,b2 as pu,be as hu,aJ as NE,aK as OE,af as yp,ae as ep,aL as ss,aM as Un,aN as ao,aO as fF,ad as sp,aP as qE,aQ as dp,aR as AE,aS as RE,ay as mD,az as vD,ar as tu,as as nu,a_ as ID,bf as bp,aT as xc}from'./main-C3JCXF3J.js';function At(t){return t.filter(o=>o.sample_count>0)}var vt=(()=>{class t{files=T(Ga);getSpecs(){return this.files.getSpecs()}async getEncounters(e){let n=await this.files.getEncounters(e);return n.ok?ri(At(n.value)):n}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Vt=(t,o)=>o.name,Bt=(t,o)=>o.castIndex;function Rt(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("heading",e.title())("subtitle",e.subtitle())("error",e.error());}}function Lt(t,o){if(t&1&&np(0,"wl-game-icon",10),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function Ot(t,o){if(t&1&&(oi(0,"span",11),nD(1),bc()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function zt(t,o){t&1&&(oi(0,"span",12),nD(1,"Bloodlust"),bc());}function $t(t,o){if(t&1&&(oi(0,"span",23),nD(1),mD(2,"number"),bc(),oi(3,"span",24),nD(4),bc()),t&2){let e=_E().$implicit;ov(),Cp(e.typicalUses!=null?ID(2,3,e.typicalUses,"1.0-1"):"None"),ov(3),bp("",e.usedSampleCount,"/",e.sampleCount," parses");}}function jt(t,o){t&1&&(oi(0,"span",19),nD(1,"-"),bc());}function qt(t,o){if(t&1&&(oi(0,"span",25),nD(1),mD(2,"formatDuration"),bc()),t&2){let e=o.$implicit;ov(),Cp(vD(2,1,e.targetS));}}function Ut(t,o){if(t&1&&dE(0,qt,3,3,"span",25,Bt),t&2){let e=_E().$implicit;fE(e.holds);}}function Gt(t,o){t&1&&(oi(0,"span",19),nD(1,"None"),bc());}function Ht(t,o){if(t&1&&(oi(0,"div",8)(1,"div",9),aE(2,Lt,1,3,"wl-game-icon",10)(3,Ot,2,1,"span",11),aE(4,zt,2,0,"span",12),bc(),oi(5,"div",13)(6,"div",14)(7,"span",15)(8,"span",16),nD(9,"First use"),bc(),oi(10,"span",17),nD(11),mD(12,"formatDuration"),bc()(),oi(13,"span",18)(14,"span",16),nD(15,"Typical uses"),bc(),aE(16,$t,5,6)(17,jt,2,0,"span",19),bc()(),oi(18,"div",20)(19,"span",16),nD(20,"Holds"),bc(),aE(21,Ut,2,0)(22,Gt,2,0,"span",19),bc()(),oi(23,"div",21)(24,"span",22),nD(25,"How to use"),bc(),oi(26,"wl-collapsible-text"),nD(27),bc()()()),t&2){let e,n=o.$implicit;ov(2),cE((e=n.spellId)?2:3,e),ov(2),cE(n.bloodlust?4:-1),ov(7),Cp(vD(12,6,n.firstCastS)),ov(5),cE(n.sampleCount?16:17),ov(5),cE(n.holds.length?21:22),ov(6),Cp(n.rule);}}function Xt(t,o){if(t&1&&(oi(0,"div",1)(1,"div",2)(2,"div",3),nD(3),bc(),oi(4,"div",4),nD(5),bc()(),oi(6,"div",5),np(7,"div"),oi(8,"div",6),nD(9,"Plan"),bc(),oi(10,"div",7),nD(11,"How to use"),bc()(),dE(12,Ht,28,8,"div",8,Vt),bc()),t&2){let e=_E();ov(3),Cp(e.title()),ov(2),Cp(e.subtitle()),ov(7),fE(e.items());}}var gt=(()=>{class t{rotation=T(Og);spec=iF.required();encounterId=iF.required();title=iF("Cooldown plan");subtitle=iF("Offensive cooldown usage across top parses.");busyChange=oF();availableChange=oF();available=So(true);error=So(null);items=So([]);loader=new dt;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.rotation.loadPlanView(e,n),{context:"rotation.loadPlanView",apply:i=>{i.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this.items.set(i.value.rows)):(i.error.kind==="permanent"&&ua(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.available.set(false),this.availableChange.emit(false),this.items.set([]));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-rotation-cd-plan"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],title:[1,"title"],subtitle:[1,"subtitle"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[[3,"heading","subtitle","error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:grid","grid-cols-[1fr_190px_200px]","gap-[14px]","px-4","pb-1"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-1","md:grid-cols-[1fr_190px_200px]","gap-3","md:gap-[14px]","items-start","md:items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-[11px]","min-w-0","flex-wrap"],[3,"id","icon","name"],[1,"text-sm","text-[var(--text)]","whitespace-nowrap"],[1,"inline-flex","items-center","gap-1.5","bg-[var(--gold)]/10","border","border-[var(--gold)]/35","rounded-[4px]","px-2","py-0.5","font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--gold)]","whitespace-nowrap"],[1,"flex","flex-col","items-start","md:items-end","gap-1.5"],[1,"flex","flex-wrap","items-baseline","gap-x-4","gap-y-1","md:flex-col","md:items-end","md:gap-1.5"],[1,"flex","items-baseline","gap-1.5"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--muted)]"],[1,"font-mono","text-[13px]","text-[var(--accent)]","tabular-nums"],[1,"flex","flex-wrap","items-baseline","gap-1.5"],[1,"font-mono","text-[12.5px]","text-[var(--muted)]"],[1,"flex","flex-wrap","items-baseline","gap-1.5","md:justify-end"],[1,"text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2.5","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"font-mono","text-[12.5px]","text-[var(--text)]","tabular-nums"],[1,"font-mono","text-[10px]","text-[var(--muted)]","tabular-nums"],[1,"font-mono","text-[13px]","text-[var(--accent)]","bg-[var(--surface-alt)]","border","border-[var(--border)]","rounded-[4px]","px-1.5","py-px","whitespace-nowrap","tabular-nums"]],template:function(n,i){n&1&&aE(0,Rt,1,3,"wl-load-state",0)(1,Xt,14,2,"div",1),n&2&&cE(i.error()||!i.available()?0:i.items().length?1:-1);},dependencies:[mt,ia,ct,gc,Yt$1],encapsulation:2})}return t})();var Zt=(t,o)=>o.name,Kt=(t,o)=>o.castIndex;function Yt(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("heading",e.title())("subtitle",e.subtitle())("error",e.error());}}function Qt(t,o){if(t&1&&np(0,"wl-game-icon",10),t&2){let e=_E().$implicit;tp("id",o)("icon",e.icon)("name",e.name);}}function Wt(t,o){if(t&1&&(oi(0,"span",11),nD(1),bc()),t&2){let e=_E().$implicit;ov(),Cp(e.name);}}function Jt(t,o){if(t&1&&(oi(0,"span",22),nD(1),mD(2,"number"),bc(),oi(3,"span",23),nD(4),bc()),t&2){let e=_E().$implicit;ov(),Cp(e.typicalUses!=null?ID(2,3,e.typicalUses,"1.0-1"):"None"),ov(3),bp("",e.usedSampleCount,"/",e.sampleCount," parses");}}function en(t,o){t&1&&(oi(0,"span",18),nD(1,"-"),bc());}function tn(t,o){if(t&1&&(oi(0,"span",24),nD(1),mD(2,"formatDuration"),bc()),t&2){let e=o.$implicit;ov(),Cp(vD(2,1,e.targetS));}}function nn(t,o){if(t&1&&dE(0,tn,3,3,"span",24,Kt),t&2){let e=_E().$implicit;fE(e.holds);}}function on(t,o){t&1&&(oi(0,"span",18),nD(1,"None"),bc());}function an(t,o){if(t&1&&(oi(0,"div",8)(1,"div",9),aE(2,Qt,1,3,"wl-game-icon",10)(3,Wt,2,1,"span",11),bc(),oi(4,"div",12)(5,"div",13)(6,"span",14)(7,"span",15),nD(8,"First use"),bc(),oi(9,"span",16),nD(10),mD(11,"formatDuration"),bc()(),oi(12,"span",17)(13,"span",15),nD(14,"Typical uses"),bc(),aE(15,Jt,5,6)(16,en,2,0,"span",18),bc()(),oi(17,"div",19)(18,"span",15),nD(19,"Holds"),bc(),aE(20,nn,2,0)(21,on,2,0,"span",18),bc()(),oi(22,"div",20)(23,"span",21),nD(24,"How to use"),bc(),oi(25,"wl-collapsible-text"),nD(26),bc()()()),t&2){let e,n=o.$implicit;ov(2),cE((e=n.spellId)?2:3,e),ov(8),Cp(vD(11,5,n.firstCastS)),ov(5),cE(n.sampleCount?15:16),ov(5),cE(n.holds.length?20:21),ov(6),Cp(n.rule);}}function cn(t,o){if(t&1&&(oi(0,"div",1)(1,"div",2)(2,"div",3),nD(3),bc(),oi(4,"div",4),nD(5),bc()(),oi(6,"div",5),np(7,"div"),oi(8,"div",6),nD(9,"Plan"),bc(),oi(10,"div",7),nD(11,"How to use"),bc()(),dE(12,an,27,7,"div",8,Zt),bc()),t&2){let e=_E();ov(3),Cp(e.title()),ov(2),Cp(e.subtitle()),ov(7),fE(e.items());}}var Ct=(()=>{class t{defensive=T(Ug);spec=iF.required();encounterId=iF.required();title=iF("Defensive plan");subtitle=iF("Defensive usage across top parses.");busyChange=oF();availableChange=oF();available=So(true);error=So(null);_items=So([]);items=this._items.asReadonly();loader=new dt;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.defensive.loadPlan(e,n),{context:"defensive.loadPlan",apply:i=>{i.ok?(this.error.set(null),this.available.set(true),this.availableChange.emit(true),this._items.set(i.value.rows)):(i.error.kind==="permanent"&&ua(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.available.set(false),this.availableChange.emit(false),this._items.set([]));},settled:()=>this.busyChange.emit(false)});});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-defensive-plan"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"],title:[1,"title"],subtitle:[1,"subtitle"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:2,vars:1,consts:[[3,"heading","subtitle","error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"hidden","md:grid","grid-cols-[1fr_190px_200px]","gap-[14px]","px-4","pb-1"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","text-right"],[1,"text-[10px]","uppercase","tracking-widest","text-[var(--muted)]","pl-[14px]"],[1,"grid","grid-cols-1","md:grid-cols-[1fr_190px_200px]","gap-3","md:gap-[14px]","items-start","md:items-center","px-4","py-[10px]","border-t","border-[var(--border)]"],[1,"flex","items-center","gap-[11px]","min-w-0"],[3,"id","icon","name"],[1,"text-sm","text-[var(--text)]","whitespace-nowrap"],[1,"flex","flex-col","items-start","md:items-end","gap-1.5"],[1,"flex","flex-wrap","items-baseline","gap-x-4","gap-y-1","md:flex-col","md:items-end","md:gap-1.5"],[1,"flex","items-baseline","gap-1.5"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.5px]","text-[var(--muted)]"],[1,"font-mono","text-[13px]","text-[var(--accent)]","tabular-nums"],[1,"flex","flex-wrap","items-baseline","gap-1.5"],[1,"font-mono","text-[12.5px]","text-[var(--muted)]"],[1,"flex","flex-wrap","items-baseline","gap-1.5","md:justify-end"],[1,"text-[13px]","text-[var(--muted)]","leading-[1.45]","border-t","md:border-t-0","md:border-l","border-[var(--border)]","pt-2.5","md:pt-0","pl-0","md:pl-[14px]"],[1,"md:hidden","block","font-mono","text-[10px]","uppercase","tracking-wider","text-[var(--muted)]","mb-1"],[1,"font-mono","text-[12.5px]","text-[var(--text)]","tabular-nums"],[1,"font-mono","text-[10px]","text-[var(--muted)]","tabular-nums"],[1,"font-mono","text-[13px]","text-[var(--accent)]","bg-[var(--surface-alt)]","border","border-[var(--border)]","rounded-[4px]","px-1.5","py-px","whitespace-nowrap","tabular-nums"]],template:function(n,i){n&1&&aE(0,Yt,1,3,"wl-load-state",0)(1,cn,14,2,"div",1),n&2&&cE(i.error()||!i.available()?0:i.items().length?1:-1);},dependencies:[mt,ia,ct,gc,Yt$1],encapsulation:2})}return t})();var le=class{_document;_textarea;constructor(o,e){this._document=e;let n=this._textarea=this._document.createElement("textarea"),i=n.style;i.position="fixed",i.top=i.opacity="0",i.left="-999em",n.setAttribute("aria-hidden","true"),n.value=o,n.readOnly=true,(this._document.fullscreenElement||this._document.body).appendChild(n);}copy(){let o=this._textarea,e=false;try{if(o){let n=this._document.activeElement;o.select(),o.setSelectionRange(0,o.value.length),e=this._document.execCommand("copy"),n&&n.focus();}}catch{}return e}destroy(){let o=this._textarea;o&&(o.remove(),this._textarea=void 0);}},yt=(()=>{class t{_document=T(Jn);copy(e){let n=this.beginCopy(e),i=n.copy();return n.destroy(),i}beginCopy(e){return new le(e,this._document)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=hr({token:t,factory:t.\u0275fac})}return t})();var rn=["input"],ln=["label"],dn=["*"],de={color:"accent",clickAction:"check-indeterminate",disabledInteractive:false},sn=new x("mat-checkbox-default-options",{providedIn:"root",factory:()=>de}),y=(function(t){return t[t.Init=0]="Init",t[t.Checked=1]="Checked",t[t.Unchecked=2]="Unchecked",t[t.Indeterminate=3]="Indeterminate",t})(y||{}),se=class{source;checked},me=(()=>{class t{_elementRef=T(gr);_changeDetectorRef=T(lF);_ngZone=T(Se);_animationsDisabled=Ae();_options=T(sn,{optional:true});focus(){this._inputElement.nativeElement.focus();}_createChangeEvent(e){let n=new se;return n.source=this,n.checked=e,n}_getAnimationTargetElement(){return this._inputElement?.nativeElement}_animationClasses={uncheckedToChecked:"mdc-checkbox--anim-unchecked-checked",uncheckedToIndeterminate:"mdc-checkbox--anim-unchecked-indeterminate",checkedToUnchecked:"mdc-checkbox--anim-checked-unchecked",checkedToIndeterminate:"mdc-checkbox--anim-checked-indeterminate",indeterminateToChecked:"mdc-checkbox--anim-indeterminate-checked",indeterminateToUnchecked:"mdc-checkbox--anim-indeterminate-unchecked"};ariaLabel="";ariaLabelledby=null;ariaDescribedby;ariaExpanded;ariaControls;ariaOwns;_uniqueId;id;get inputId(){return `${this.id||this._uniqueId}-input`}required=false;labelPosition="after";name=null;change=new He;indeterminateChange=new He;value;disableRipple=false;_inputElement;_labelElement;tabIndex;color;disabledInteractive;_onTouched=()=>{};_currentAnimationClass="";_currentCheckState=y.Init;_controlValueAccessorChangeFn=()=>{};_validatorChangeFn=()=>{};constructor(){T(re).load(sa);let e=T(new Lp("tabindex"),{optional:true});this._options=this._options||de,this.color=this._options.color||de.color,this.tabIndex=e==null?0:parseInt(e)||0,this.id=this._uniqueId=T(Wt$1).getId("mat-mdc-checkbox-"),this.disabledInteractive=this._options?.disabledInteractive??false;}ngOnChanges(e){e.required&&this._validatorChangeFn();}ngAfterViewInit(){this._syncIndeterminate(this.indeterminate);}get checked(){return this._checked}set checked(e){e!=this.checked&&(this._checked=e,this._changeDetectorRef.markForCheck());}_checked=false;get disabled(){return this._disabled}set disabled(e){e!==this.disabled&&(this._disabled=e,this._changeDetectorRef.markForCheck());}_disabled=false;get indeterminate(){return this._indeterminate()}set indeterminate(e){let n=e!=this._indeterminate();this._indeterminate.set(e),n&&(e?this._transitionCheckState(y.Indeterminate):this._transitionCheckState(this.checked?y.Checked:y.Unchecked),this.indeterminateChange.emit(e)),this._syncIndeterminate(e);}_indeterminate=So(false);_isRippleDisabled(){return this.disableRipple||this.disabled}_onLabelTextChange(){this._changeDetectorRef.detectChanges();}writeValue(e){this.checked=!!e;}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorChangeFn=e;}_transitionCheckState(e){let n=this._currentCheckState,i=this._getAnimationTargetElement();if(!(n===e||!i)&&(this._currentAnimationClass&&i.classList.remove(this._currentAnimationClass),this._currentAnimationClass=this._getAnimationClassForCheckStateTransition(n,e),this._currentCheckState=e,this._currentAnimationClass.length>0)){i.classList.add(this._currentAnimationClass);let d=this._currentAnimationClass;this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{i.classList.remove(d);},1e3);});}}_emitChangeEvent(){this._controlValueAccessorChangeFn(this.checked),this.change.emit(this._createChangeEvent(this.checked)),this._inputElement&&(this._inputElement.nativeElement.checked=this.checked);}toggle(){this.checked=!this.checked,this._controlValueAccessorChangeFn(this.checked);}_handleInputClick(){let e=this._options?.clickAction;!this.disabled&&e!=="noop"?(this.indeterminate&&e!=="check"&&Promise.resolve().then(()=>{this._indeterminate.set(false),this.indeterminateChange.emit(false);}),this._checked=!this._checked,this._transitionCheckState(this._checked?y.Checked:y.Unchecked),this._emitChangeEvent()):(this.disabled&&this.disabledInteractive||!this.disabled&&e==="noop")&&(this._inputElement.nativeElement.checked=this.checked,this._inputElement.nativeElement.indeterminate=this.indeterminate);}_onInteractionEvent(e){e.stopPropagation();}_onBlur(){Promise.resolve().then(()=>{this._onTouched(),this._changeDetectorRef.markForCheck();});}_getAnimationClassForCheckStateTransition(e,n){if(this._animationsDisabled)return "";switch(e){case y.Init:if(n===y.Checked)return this._animationClasses.uncheckedToChecked;if(n==y.Indeterminate)return this._checked?this._animationClasses.checkedToIndeterminate:this._animationClasses.uncheckedToIndeterminate;break;case y.Unchecked:return n===y.Checked?this._animationClasses.uncheckedToChecked:this._animationClasses.uncheckedToIndeterminate;case y.Checked:return n===y.Unchecked?this._animationClasses.checkedToUnchecked:this._animationClasses.checkedToIndeterminate;case y.Indeterminate:return n===y.Checked?this._animationClasses.indeterminateToChecked:this._animationClasses.indeterminateToUnchecked}return ""}_syncIndeterminate(e){let n=this._inputElement;n&&(n.nativeElement.indeterminate=e);}_onInputClick(){this._handleInputClick();}_onTouchTargetClick(){this._handleInputClick(),this.disabled||this._inputElement.nativeElement.focus();}_preventBubblingFromLabel(e){e.target&&this._labelElement.nativeElement.contains(e.target)&&e.stopPropagation();}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["mat-checkbox"]],viewQuery:function(n,i){if(n&1&&dp(rn,5)(ln,5),n&2){let d;AE(d=RE())&&(i._inputElement=d.first),AE(d=RE())&&(i._labelElement=d.first);}},hostAttrs:[1,"mat-mdc-checkbox"],hostVars:16,hostBindings:function(n,i){n&2&&(sp("id",i.id),ep("tabindex",null)("aria-label",null)("aria-labelledby",null),qE(i.color?"mat-"+i.color:"mat-accent"),yp("_mat-animation-noopable",i._animationsDisabled)("mdc-checkbox--disabled",i.disabled)("mat-mdc-checkbox-disabled",i.disabled)("mat-mdc-checkbox-checked",i.checked)("mat-mdc-checkbox-disabled-interactive",i.disabledInteractive));},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],ariaExpanded:[2,"aria-expanded","ariaExpanded",dF],ariaControls:[0,"aria-controls","ariaControls"],ariaOwns:[0,"aria-owns","ariaOwns"],id:"id",required:[2,"required","required",dF],labelPosition:"labelPosition",name:"name",value:"value",disableRipple:[2,"disableRipple","disableRipple",dF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?void 0:fF(e)],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",dF],checked:[2,"checked","checked",dF],disabled:[2,"disabled","disabled",dF],indeterminate:[2,"indeterminate","indeterminate",dF]},outputs:{change:"change",indeterminateChange:"indeterminateChange"},exportAs:["matCheckbox"],features:[fD([{provide:ss,useExisting:ao(()=>t),multi:true},{provide:Un,useExisting:t,multi:true}]),sm],ngContentSelectors:dn,decls:15,vars:23,consts:[["checkbox",""],["input",""],["label",""],["mat-internal-form-field","",3,"click","labelPosition"],[1,"mdc-checkbox"],["aria-hidden","true",1,"mat-mdc-checkbox-touch-target",3,"click"],["type","checkbox",1,"mdc-checkbox__native-control",3,"blur","click","change","checked","indeterminate","disabled","id","required","tabIndex"],["aria-hidden","true",1,"mdc-checkbox__ripple"],["aria-hidden","true",1,"mdc-checkbox__background"],["focusable","false","viewBox","0 0 24 24",1,"mdc-checkbox__checkmark"],["fill","none","d","M1.73,12.91 8.1,19.28 22.79,4.59",1,"mdc-checkbox__checkmark-path"],[1,"mdc-checkbox__mixedmark"],["mat-ripple","","aria-hidden","true",1,"mat-mdc-checkbox-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-label",3,"for"]],template:function(n,i){if(n&1&&(SE(),oi(0,"div",3),cp("click",function(V){return i._preventBubblingFromLabel(V)}),oi(1,"div",4,0)(3,"div",5),cp("click",function(){return i._onTouchTargetClick()}),bc(),oi(4,"input",6,1),cp("blur",function(){return i._onBlur()})("click",function(){return i._onInputClick()})("change",function(V){return i._onInteractionEvent(V)}),bc(),np(6,"div",7),oi(7,"div",8),pu(),oi(8,"svg",9),np(9,"path",10),bc(),hu(),np(10,"div",11),bc(),np(11,"div",12),bc(),oi(12,"label",13,2),NE(14),bc()()),n&2){let d=OE(2);tp("labelPosition",i.labelPosition),ov(4),yp("mdc-checkbox--selected",i.checked),tp("checked",i.checked)("indeterminate",i.indeterminate)("disabled",i.disabled&&!i.disabledInteractive)("id",i.inputId)("required",i.required)("tabIndex",i.disabled&&!i.disabledInteractive?-1:i.tabIndex),ep("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-checked",i.indeterminate?"mixed":null)("aria-controls",i.ariaControls)("aria-disabled",i.disabled&&i.disabledInteractive?true:null)("aria-expanded",i.ariaExpanded)("aria-owns",i.ariaOwns)("name",i.name)("value",i.value),ov(7),tp("matRippleTrigger",d)("matRippleDisabled",i.disableRipple||i.disabled)("matRippleCentered",true),ov(),tp("for",i.inputId);}},dependencies:[q_,Kg],styles:[`.mdc-checkbox {
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
`],encapsulation:2})}return t})(),St=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=HI({type:t});static \u0275inj=xl({imports:[me,J]})}return t})();var pn="Mythic",hn="everyone";function wt(t,o){let e=`EncounterID:${t.encounter_id};Name:${t.encounter_name};Difficulty:${pn}`,n=[];for(let i of t.abilities)if(o.has(i.spell_id))for(let d of i.cast_times_s)n.push({time_s:d,text:`time:${d};tag:${hn};spellid:${i.spell_id};text:${i.name}`});return n.sort((i,d)=>i.time_s-d.time_s),[e,...n.map(i=>i.text)].join(`
`)}function Et(t){return {cooldowns:t.filter(o=>o.kind==="cooldown"),defensives:t.filter(o=>o.kind==="defensive")}}function It(t,o){return new Set(t.map(e=>e.spell_id).filter(e=>!o.has(e)))}function pe(t,o){return t.length>0&&t.every(e=>!o.has(e.spell_id))}function Tt(t,o,e){let n=new Set(t);return e?n.delete(o):n.add(o),n}function Dt(t,o){return t.length===0?new Set(o):pe(t,o)?new Set(t.map(e=>e.spell_id)):new Set}function Ft(t,o){return t&&o}var Mt=(()=>{class t{source=T(Ja);getExport(e,n){return this.source.getBench(e,n)}static \u0275fac=function(n){return new(n||t)};static \u0275prov=oe({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();var Pt=(t,o)=>o.spell_id;function un(t,o){if(t&1&&np(0,"wl-load-state",0),t&2){let e=_E();tp("error",e.error());}}function bn(t,o){if(t&1){let e=vE();oi(0,"div",1)(1,"div",3)(2,"div")(3,"div",4),nD(4,"Northern Sky export"),bc(),oi(5,"div",5),nD(6,"Top-parse cooldown timings as a Northern Sky note."),bc()(),oi(7,"button",6),cp("click",function(){tu(e);let i=_E();return nu(i.openPanel())}),oi(8,"mat-icon"),nD(9,"download"),bc(),nD(10," Export "),bc()()();}}function _n(t,o){t&1&&(oi(0,"div",12),nD(1,"Copied to clipboard."),bc());}function xn(t,o){t&1&&(oi(0,"div",13),nD(1,"Clipboard write failed. Retry the copy."),bc());}function kn(t,o){if(t&1){let e=vE();oi(0,"mat-checkbox",17),cp("change",function(i){let d=tu(e).$implicit,V=_E(3);return nu(V.toggle(d.spell_id,i.checked))}),oi(1,"span",18),np(2,"wl-game-icon",19),oi(3,"span",20),nD(4),bc()()();}if(t&2){let e=o.$implicit,n=_E(3);tp("checked",n.isSelected(e.spell_id)),ov(2),tp("id",e.spell_id)("icon",e.icon)("name",e.name),ov(2),xc("\xD7",e.cast_times_s.length);}}function fn(t,o){if(t&1&&(oi(0,"div",14),nD(1,"Cooldowns"),bc(),oi(2,"div",15),dE(3,kn,5,5,"mat-checkbox",16,Pt),bc()),t&2){let e=_E(2);ov(3),fE(e.cooldowns());}}function vn(t,o){if(t&1){let e=vE();oi(0,"mat-checkbox",17),cp("change",function(i){let d=tu(e).$implicit,V=_E(3);return nu(V.toggle(d.spell_id,i.checked))}),oi(1,"span",18),np(2,"wl-game-icon",19),oi(3,"span",20),nD(4),bc()()();}if(t&2){let e=o.$implicit,n=_E(3);tp("checked",n.isSelected(e.spell_id)),ov(2),tp("id",e.spell_id)("icon",e.icon)("name",e.name),ov(2),xc("\xD7",e.cast_times_s.length);}}function gn(t,o){if(t&1&&(oi(0,"div",14),nD(1,"Defensives"),bc(),oi(2,"div",15),dE(3,vn,5,5,"mat-checkbox",16,Pt),bc()),t&2){let e=_E(2);ov(3),fE(e.defensives());}}function Cn(t,o){if(t&1){let e=vE();oi(0,"wl-flyover-panel",7),cp("closed",function(){tu(e);let i=_E();return nu(i.open.set(false))}),oi(1,"div",8)(2,"div",9)(3,"button",10),cp("click",function(){tu(e);let i=_E();return nu(i.toggleAll())}),nD(4),bc(),oi(5,"button",11),cp("click",function(){tu(e);let i=_E();return nu(i.copyNote())}),oi(6,"mat-icon"),nD(7,"download"),bc(),nD(8," Copy note "),bc()(),aE(9,_n,2,0,"div",12),aE(10,xn,2,0,"div",13),aE(11,fn,5,0),aE(12,gn,5,0),bc()();}if(t&2){let e=_E();ov(4),Cp(e.allSelected()?"Deselect all":"Select all"),ov(5),cE(e.copied()?9:-1),ov(),cE(e.copyFailed()?10:-1),ov(),cE(e.cooldowns().length>0?11:-1),ov(),cE(e.defensives().length>0?12:-1);}}var Nt=(()=>{class t{feature=T(Mt);selection=T(B_);clipboard=T(yt);spec=iF.required();encounterId=iF.required();busyChange=oF();availableChange=oF();bench=So(null);excluded=So(new Set(this.selection.loadNorthernSky()?.excludedSpellIds??[]));open=So(false);copied=So(false);copyFailed=So(false);error=So(null);abilities=TD(()=>this.bench()?.abilities??[]);grouped=TD(()=>Et(this.abilities()));cooldowns=TD(()=>this.grouped().cooldowns);defensives=TD(()=>this.grouped().defensives);available=TD(()=>this.abilities().length>0);allSelected=TD(()=>pe(this.abilities(),this.excluded()));panelOpen=TD(()=>Ft(this.open(),this.available()));loader=new dt;constructor(){Cu(()=>{let e=this.spec(),n=this.encounterId();this.loader.run(this.feature.getExport(e,n),{context:"northernSky.getExport",apply:i=>{i.ok?(this.error.set(null),this.bench.set(i.value)):(i.error.kind==="permanent"&&ua(i.error.id,i.error.context),this.error.set(i.error.kind==="missing"?null:i.error),this.bench.set(null)),this.availableChange.emit(this.available());},settled:()=>this.busyChange.emit(false)});});}isSelected(e){return !this.excluded().has(e)}toggle(e,n){this.persist(Tt(this.excluded(),e,n));}toggleAll(){this.persist(Dt(this.abilities(),this.excluded()));}copyNote(){let e=this.bench();if(!e)return;let n=this.clipboard.copy(wt(e,It(this.abilities(),this.excluded())));this.copied.set(n),this.copyFailed.set(!n);}openPanel(){this.copied.set(false),this.copyFailed.set(false),this.open.set(true);}persist(e){this.excluded.set(e),this.selection.saveNorthernSky({excludedSpellIds:[...e]});}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-northern-sky-export"]],inputs:{spec:[1,"spec"],encounterId:[1,"encounterId"]},outputs:{busyChange:"busyChange",availableChange:"availableChange"},decls:3,vars:2,consts:[["heading","Northern Sky export","subtitle","Top-parse cooldown timings as a Northern Sky note.",3,"error"],[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],["heading","Northern Sky export","closeLabel","Close export"],[1,"px-4","pt-3","pb-3","flex","items-start","justify-between","gap-3"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],["mat-stroked-button","","type","button",3,"click"],["heading","Northern Sky export","closeLabel","Close export",3,"closed"],[1,"flex","flex-col","gap-3"],[1,"flex","items-center","justify-between","gap-2"],["mat-button","","type","button",3,"click"],["mat-flat-button","","type","button",3,"click"],[1,"text-[13px]","text-[var(--success)]"],[1,"text-[13px]","text-[var(--critical)]"],[1,"text-[11px]","font-semibold","uppercase","tracking-wide","text-[var(--muted)]"],[1,"flex","flex-col","gap-1.5"],[3,"checked"],[3,"change","checked"],[1,"inline-flex","items-center","gap-2"],[3,"id","icon","name"],[1,"text-[12px]","text-[var(--muted)]"]],template:function(n,i){n&1&&(aE(0,un,1,1,"wl-load-state",0)(1,bn,11,0,"div",1),aE(2,Cn,13,5,"wl-flyover-panel",2)),n&2&&(cE(i.error()||!i.available()?0:1),ov(2),cE(i.panelOpen()?2:-1));},dependencies:[Ib,xb,fv,hv,St,me,wa,mt,ct],encapsulation:2})}return t})();var yn=(t,o)=>o.className,Sn=(t,o)=>o.spec,wn=(t,o)=>o.id;function En(t,o){t&1&&np(0,"wl-load-state",1),t&2&&tp("error",o);}function In(t,o){t&1&&np(0,"wl-loading-spinner",3);}function Tn(t,o){t&1&&(oi(0,"p",4),nD(1,"No spec data available."),bc());}function Dn(t,o){if(t&1&&(oi(0,"span",8),np(1,"wl-art-icon",12),mD(2,"classIcon"),mD(3,"formatSpec"),oi(4,"span"),nD(5),mD(6,"formatSpec"),bc()()),t&2){let e=o;ov(),tp("src",vD(2,3,e))("alt",vD(3,5,e)),ov(4),Cp(vD(6,7,e));}}function Fn(t,o){if(t&1&&(oi(0,"mat-option",9)(1,"span",8),np(2,"wl-art-icon",12),mD(3,"classIcon"),oi(4,"span"),nD(5),bc()()()),t&2){let e=o.$implicit;tp("value",e.className),ov(2),tp("src",vD(3,4,e.className))("alt",e.classLabel),ov(3),Cp(e.classLabel);}}function Mn(t,o){if(t&1&&(oi(0,"span",8),np(1,"wl-art-icon",12),mD(2,"specIcon"),mD(3,"formatSpec"),oi(4,"span"),nD(5),mD(6,"formatSpec"),bc()()),t&2){let e=o;ov(),tp("src",vD(2,3,e))("alt",vD(3,5,e)),ov(4),Cp(vD(6,7,e));}}function Pn(t,o){if(t&1&&(oi(0,"mat-option",9)(1,"span",8),np(2,"wl-art-icon",12),mD(3,"specIcon"),oi(4,"span"),nD(5),bc()()()),t&2){let e=o.$implicit;tp("value",e.spec),ov(2),tp("src",vD(3,4,e.spec))("alt",e.specLabel),ov(3),Cp(e.specLabel);}}function Nn(t,o){if(t&1){let e=vE();oi(0,"mat-form-field",6)(1,"mat-label"),nD(2,"Spec"),bc(),oi(3,"mat-select",7),cp("selectionChange",function(){tu(e);let i=_E(2);return nu(i.onSpecChange())}),oi(4,"mat-select-trigger"),aE(5,Mn,7,9,"span",8),bc(),dE(6,Pn,6,6,"mat-option",9,Sn),bc(),Zv(),bc();}if(t&2){let e,n=_E(2);ov(3),tp("formControl",n.specControl),Kv(),ov(2),cE((e=n.selectedSpec())?5:-1,e),ov(),fE(n.specsForSelectedClass());}}function An(t,o){t&1&&np(0,"wl-loading-spinner",10);}function Vn(t,o){if(t&1&&(oi(0,"span",8),np(1,"wl-art-icon",12),mD(2,"bossIcon"),oi(3,"span",13),nD(4),bc()()),t&2){let e=o;ov(),tp("src",vD(2,3,e.id))("alt",e.name),ov(3),Cp(e.name);}}function Bn(t,o){if(t&1&&(oi(0,"mat-option",9)(1,"span",8),np(2,"wl-art-icon",12),mD(3,"bossIcon"),oi(4,"span",13),nD(5),bc()()()),t&2){let e=o.$implicit;tp("value",e.id),ov(2),tp("src",vD(3,4,e.id))("alt",e.name),ov(3),Cp(e.name);}}function Rn(t,o){if(t&1){let e=vE();oi(0,"mat-form-field",11)(1,"mat-label"),nD(2,"Encounter"),bc(),oi(3,"mat-select",7),cp("selectionChange",function(){tu(e);let i=_E(2);return nu(i.onEncChange())}),oi(4,"mat-select-trigger"),aE(5,Vn,5,5,"span",8),bc(),dE(6,Bn,6,6,"mat-option",9,wn),bc(),Zv(),bc();}if(t&2){let e,n=_E(2);ov(3),tp("formControl",n.encControl),Kv(),ov(2),cE((e=n.selectedEncounter())?5:-1,e),ov(),fE(n.encounters());}}function Ln(t,o){if(t&1){let e=vE();oi(0,"div",5)(1,"mat-form-field",6)(2,"mat-label"),nD(3,"Class"),bc(),oi(4,"mat-select",7),cp("selectionChange",function(){tu(e);let i=_E();return nu(i.onClassChange())}),oi(5,"mat-select-trigger"),aE(6,Dn,7,9,"span",8),bc(),dE(7,Fn,6,6,"mat-option",9,yn),bc(),Zv(),bc(),aE(9,Nn,8,2,"mat-form-field",6),bc(),aE(10,An,1,0,"wl-loading-spinner",10)(11,Rn,8,2,"mat-form-field",11);}if(t&2){let e,n=_E();ov(4),tp("formControl",n.classControl),Kv(),ov(2),cE((e=n.selectedClass())?6:-1,e),ov(),fE(n.classes()),ov(2),cE(n.selectedClass()?9:-1),ov(),cE(n.loadingEncounters()?10:n.encounters().length>0||n.selectedSpec()?11:-1);}}function On(t,o){t&1&&np(0,"wl-loading-spinner",14);}function zn(t,o){if(t&1&&np(0,"wl-bench-empty-banner",16),t&2){let e=_E(2);tp("encounter",e.selectedEncounter()?.name??"");}}function $n(t,o){if(t&1){let e=vE();aE(0,On,1,0,"wl-loading-spinner",14),oi(1,"div",15),aE(2,zn,1,1,"wl-bench-empty-banner",16),oi(3,"wl-northern-sky-export",17),cp("busyChange",function(i){tu(e);let d=_E();return nu(d.northernSkyBusy.set(i))})("availableChange",function(i){tu(e);let d=_E();return nu(d.northernSkyAvailable.set(i))}),bc(),oi(4,"wl-gear",17),cp("busyChange",function(i){tu(e);let d=_E();return nu(d.gearBusy.set(i))})("availableChange",function(i){tu(e);let d=_E();return nu(d.gearAvailable.set(i))}),bc(),oi(5,"wl-rotation-cd-plan",17),cp("busyChange",function(i){tu(e);let d=_E();return nu(d.cdPlanBusy.set(i))})("availableChange",function(i){tu(e);let d=_E();return nu(d.cdPlanAvailable.set(i))}),bc(),oi(6,"wl-defensive-plan",17),cp("busyChange",function(i){tu(e);let d=_E();return nu(d.defensivePlanBusy.set(i))})("availableChange",function(i){tu(e);let d=_E();return nu(d.defensivePlanAvailable.set(i))}),bc(),oi(7,"wl-burst-windows",18),cp("openMap",function(i){tu(e);let d=_E();return nu(d.onOpenMap(i))})("busyChange",function(i){tu(e);let d=_E();return nu(d.burstBusy.set(i))})("availableChange",function(i){tu(e);let d=_E();return nu(d.burstAvailable.set(i))}),bc()();}if(t&2){let e=_E();cE(e.cardsBusy()?0:-1),ov(),yp("hidden",e.cardsBusy()),ov(),cE(e.benchAvailable()?-1:2),ov(),tp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),ov(),tp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),ov(),tp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),ov(),tp("spec",e.selectedSpec())("encounterId",e.selectedEncId()),ov(),tp("spec",e.selectedSpec())("encounterId",e.selectedEncId())("showMap",e.mapReady());}}var zo=(()=>{class t{encounterSelection=T(vt);mapFeature=T(tn$1);selectionStore=T(B_);classControl=new od("",{nonNullable:true});specControl=new od({value:"",disabled:true},{nonNullable:true});encControl=new od({value:0,disabled:true},{nonNullable:true});specs=So([]);encounters=So([]);selectedClass=Qm(this.classControl.valueChanges,{initialValue:this.classControl.value});selectedSpec=Qm(this.specControl.valueChanges,{initialValue:this.specControl.value});selectedEncId=Qm(this.encControl.valueChanges,{initialValue:this.encControl.value});classes=TD(()=>{let e=this.specs().map(n=>n.spec);return $b().filter(n=>Hb(n.className,e).length>0)});specsForSelectedClass=TD(()=>Hb(this.selectedClass(),this.specs().map(e=>e.spec)));selectedEncounter=TD(()=>this.encounters().find(e=>e.id===this.selectedEncId()));loading=So(false);loadingEncounters=So(false);error=So(null);encounterLoader=new dt;gearAvailable=So(true);cdPlanAvailable=So(true);defensivePlanAvailable=So(true);burstAvailable=So(true);northernSkyAvailable=So(true);benchAvailable=TD(()=>this.gearAvailable()||this.cdPlanAvailable()||this.defensivePlanAvailable()||this.burstAvailable()||this.northernSkyAvailable());gearBusy=So(true);cdPlanBusy=So(true);defensivePlanBusy=So(true);burstBusy=So(true);northernSkyBusy=So(true);cardsBusy=TD(()=>this.gearBusy()||this.cdPlanBusy()||this.defensivePlanBusy()||this.burstBusy()||this.northernSkyBusy());mapReady=this.mapFeature.ready;onOpenMap(e){this.mapFeature.openAt(e);}async ngOnInit(){this.loading.set(true);try{let i=await this.encounterSelection.getSpecs();i.ok?(this.specs.set(i.value),this.classes().length&&this.classControl.enable({emitEvent:!1})):this.surfaceLoadError(i.error);}finally{this.loading.set(false);}let e=this.selectionStore.loadPreFight()?.spec??"",n=Wb(e);e&&n&&this.specs().some(i=>i.spec===e)&&(this.classControl.setValue(n.className),this.specControl.enable({emitEvent:false}),this.specControl.setValue(e),this._onSpecSelected(e));}onClassChange(){this.specControl.setValue("",{emitEvent:true}),this.selectionStore.savePreFight({spec:null}),this.mapFeature.clear(),this.encControl.setValue(0,{emitEvent:true}),this.encControl.disable({emitEvent:false}),this.encounters.set([]);let e=this.specs().map(n=>n.spec);Hb(this.classControl.value,e).length?this.specControl.enable({emitEvent:false}):this.specControl.disable({emitEvent:false});}onSpecChange(){let e=this.specControl.value;this.selectionStore.savePreFight({spec:e||null}),this.mapFeature.clear(),this.encControl.setValue(0,{emitEvent:true}),this.encControl.disable({emitEvent:false}),this.encounters.set([]),e&&this._onSpecSelected(e);}_onSpecSelected(e){this.error.set(null),this.loadingEncounters.set(true),this.encounterLoader.run(this.encounterSelection.getEncounters(e),{context:"encounterSelection.getEncounters",apply:n=>{if(!n.ok){this.surfaceLoadError(n.error),this.encControl.disable({emitEvent:false});return}this.encounters.set(n.value),n.value.length?this.encControl.enable({emitEvent:false}):this.encControl.disable({emitEvent:false});},settled:()=>this.loadingEncounters.set(false)});}surfaceLoadError(e){e.kind==="permanent"&&ua(e.id,e.context),this.error.set(e.kind==="missing"?null:e);}async onEncChange(){let e=this.encControl.value,n=this.specControl.value;this.mapFeature.clear(),this.gearBusy.set(true),this.cdPlanBusy.set(true),this.defensivePlanBusy.set(true),this.burstBusy.set(true),this.northernSkyBusy.set(true),!(!e||!n)&&this.mapFeature.loadBench(n,e);}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=jI({type:t,selectors:[["wl-pre-fight"]],features:[fD([{provide:Lo,useValue:{subscriptSizing:"dynamic"}}])],decls:8,vars:3,consts:[[1,"mx-auto","flex","max-w-[860px]","flex-col","gap-4","px-3","md:px-4","pt-6","pb-12"],[3,"error"],["appearance","outlined",1,"p-4"],["message","Loading specs\u2026"],[1,"text-[13px]","text-[var(--muted)]"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],["message","Loading encounters\u2026"],["appearance","outline",1,"mt-3","w-full"],[3,"src","alt"],[1,"truncate"],["message","Loading the plan\u2026"],[1,"flex","flex-col","gap-4"],["variant","pre",3,"encounter"],[3,"busyChange","availableChange","spec","encounterId"],[3,"openMap","busyChange","availableChange","spec","encounterId","showMap"]],template:function(n,i){if(n&1&&(oi(0,"div",0),aE(1,En,1,1,"wl-load-state",1),oi(2,"mat-card",2),aE(3,In,1,0,"wl-loading-spinner",3)(4,Tn,2,0,"p",4)(5,Ln,12,4),bc(),aE(6,$n,8,15),np(7,"wl-map-panel"),bc()),n&2){let d;ov(),cE((d=i.error())?1:-1,d),ov(2),cE(i.loading()?3:i.specs().length===0||i.classes().length===0?4:5),ov(3),cE(i.selectedEncId()?6:-1);}},dependencies:[vp,_p,ld,Ht$1,qt$1,xt,Ho,qo,tf,lt,mf,cf,Wf,Hf,ct,$_,gt,Ct,Zu,Ah,v_,Nt,b_,T_,C_,I_],encapsulation:2})}return t})();export{zo as PreFightComponent};//# sourceMappingURL=chunk-CHFurNrv.js.map
