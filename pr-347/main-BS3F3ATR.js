function a(r,n){console.warn(`[warcraft-learner] ${r}:`,n);}var k$2=Object.create;var g$1=Object.defineProperty,l$1=Object.defineProperties,m$2=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertyNames,f$2=Object.getOwnPropertySymbols,p=Object.getPrototypeOf,h$1=Object.prototype.hasOwnProperty,j$3=Object.prototype.propertyIsEnumerable;var i=(a,b,c)=>b in a?g$1(a,b,{enumerable:true,configurable:true,writable:true,value:c}):a[b]=c,r=(a,b)=>{for(var c in b||={})h$1.call(b,c)&&i(a,c,b[c]);if(f$2)for(var c of f$2(b))j$3.call(b,c)&&i(a,c,b[c]);return a},s=(a,b)=>l$1(a,n(b));var t=(a,b)=>{var c={};for(var d in a)h$1.call(a,d)&&b.indexOf(d)<0&&(c[d]=a[d]);if(a!=null&&f$2)for(var d of f$2(a))b.indexOf(d)<0&&j$3.call(a,d)&&(c[d]=a[d]);return c};var u$1=(a,b)=>()=>(b||a((b={exports:{}}).exports,b),b.exports),v$2=(a,b)=>{for(var c in b)g$1(a,c,{get:b[c],enumerable:true});},q=(a,b,c,d)=>{if(b&&typeof b=="object"||typeof b=="function")for(let e of o(b))!h$1.call(a,e)&&e!==c&&g$1(a,e,{get:()=>b[e],enumerable:!(d=m$2(b,e))||d.enumerable});return a};var w$1=(a,b,c)=>(c=a!=null?k$2(p(a)):{},q(!a||!a.__esModule?g$1(c,"default",{value:a,enumerable:true}):c,a));var Z$2=null,Pr$2=false,Li$1=1,V=Symbol("SIGNAL");function v$1(e){let t=Z$2;return Z$2=e,t}function Lr$2(){return Z$2}var Xe$4={version:0,lastCleanEpoch:0,dirty:false,producers:void 0,producersTail:void 0,consumers:void 0,consumersTail:void 0,recomputing:false,consumerAllowSignalWrites:false,consumerIsAlwaysLive:false,kind:"unknown",producerMustRecompute:()=>false,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function et$2(e){if(Pr$2)throw new Error("");if(Z$2===null)return;Z$2.consumerOnSignalRead(e);let t=Z$2.producersTail;if(t!==void 0&&t.producer===e)return;let n,r=Z$2.recomputing;if(r&&(n=t!==void 0?t.nextProducer:Z$2.producers,n!==void 0&&n.producer===e)){Z$2.producersTail=n,n.lastReadVersion=e.version;return}let o=e.consumersTail;if(o!==void 0&&o.consumer===Z$2&&(!r||Th(o,Z$2)))return;let i=en$2(Z$2),s={producer:e,consumer:Z$2,nextProducer:n,prevConsumer:void 0,lastReadVersion:e.version,nextConsumer:void 0};Z$2.producersTail=s,t!==void 0?t.nextProducer=s:Z$2.producers=s,i&&ol$1(e,s);}function tl$1(){Li$1++;}function vt$5(e){if(!(en$2(e)&&!e.dirty)&&!(!e.dirty&&e.lastCleanEpoch===Li$1)){if(!e.producerMustRecompute(e)&&!Xt$1(e)){Jt$1(e);return}e.producerRecomputeValue(e),Jt$1(e);}}function Fi$2(e){if(e.consumers===void 0)return;let t=Pr$2;Pr$2=true;try{for(let n=e.consumers;n!==void 0;n=n.nextConsumer){let r=n.consumer;r.dirty||wh(r);}}finally{Pr$2=t;}}function ji$1(){return Z$2?.consumerAllowSignalWrites!==false}function wh(e){e.dirty=true,Fi$2(e),e.consumerMarkedDirty?.(e);}function Jt$1(e){e.dirty=false,e.lastCleanEpoch=Li$1;}function $e$3(e){return e&&nl$1(e),v$1(e)}function nl$1(e){e.producersTail=void 0,e.recomputing=true;}function tt$2(e,t){v$1(t),e&&rl$1(e);}function rl$1(e){e.recomputing=false;let t=e.producersTail,n=t!==void 0?t.nextProducer:e.producers;if(n!==void 0){if(en$2(e))do n=Vi$1(n);while(n!==void 0);t!==void 0?t.nextProducer=void 0:e.producers=void 0;}}function Xt$1(e){for(let t=e.producers;t!==void 0;t=t.nextProducer){let n=t.producer,r=t.lastReadVersion;if(r!==n.version||(vt$5(n),r!==n.version))return  true}return  false}function nt$2(e){if(en$2(e)){let t=e.producers;for(;t!==void 0;)t=Vi$1(t);}e.producers=void 0,e.producersTail=void 0,e.consumers=void 0,e.consumersTail=void 0;}function ol$1(e,t){let n=e.consumersTail,r=en$2(e);if(n!==void 0?(t.nextConsumer=n.nextConsumer,n.nextConsumer=t):(t.nextConsumer=void 0,e.consumers=t),t.prevConsumer=n,e.consumersTail=t,!r)for(let o=e.producers;o!==void 0;o=o.nextProducer)ol$1(o.producer,o);}function Vi$1(e){let t=e.producer,n=e.nextProducer,r=e.nextConsumer,o=e.prevConsumer;if(e.nextConsumer=void 0,e.prevConsumer=void 0,r!==void 0?r.prevConsumer=o:t.consumersTail=o,o!==void 0)o.nextConsumer=r;else if(t.consumers=r,!en$2(t)){let i=t.producers;for(;i!==void 0;)i=Vi$1(i);}return n}function en$2(e){return e.consumerIsAlwaysLive||e.consumers!==void 0}function Th(e,t){let n=t.producersTail;if(n!==void 0){let r=t.producers;do{if(r===e)return  true;if(r===n)break;r=r.nextProducer;}while(r!==void 0)}return  false}function Fn$3(e,t){return Object.is(e,t)}function jn$3(e,t){let n=Object.create(Ch);n.computation=e,t!==void 0&&(n.equal=t);let r=()=>{if(vt$5(n),et$2(n),n.value===_e$3)throw n.error;return n.value};return r[V]=n,r}var mt$3=Symbol("UNSET"),yt$5=Symbol("COMPUTING"),_e$3=Symbol("ERRORED"),Ch=s(r({},Xe$4),{value:mt$3,dirty:true,error:null,equal:Fn$3,kind:"computed",producerMustRecompute(e){return e.value===mt$3||e.value===yt$5},producerRecomputeValue(e){if(e.value===yt$5)throw new Error("");let t=e.value;e.value=yt$5;let n=$e$3(e),r,o=false;try{r=e.computation(),v$1(null),o=t!==mt$3&&t!==_e$3&&r!==_e$3&&e.equal(t,r);}catch(i){r=_e$3,e.error=i;}finally{tt$2(e,n);}if(o){e.value=t;return}e.value=r,e.version++;}});function bh(){throw new Error}var il$1=bh;function sl$1(e){il$1(e);}function Hi$1(e){il$1=e;}function Bi$1(e,t){let n=Object.create(Vn$3);n.value=e,t!==void 0&&(n.equal=t);let r=()=>al$1(n);return r[V]=n,[r,s=>It$3(n,s),s=>Fr$2(n,s)]}function al$1(e){return et$2(e),e.value}function It$3(e,t){ji$1()||sl$1(e),e.equal(e.value,t)||(e.value=t,Mh(e));}function Fr$2(e,t){ji$1()||sl$1(e),It$3(e,t(e.value));}var Vn$3=s(r({},Xe$4),{equal:Fn$3,value:void 0,kind:"signal"});function Mh(e){e.version++,tl$1(),Fi$2(e);}var $i$1=s(r({},Xe$4),{consumerIsAlwaysLive:true,consumerAllowSignalWrites:true,dirty:true,kind:"effect"});function Ui$1(e){if(e.dirty=false,e.version>0&&!Xt$1(e))return;e.version++;let t=$e$3(e);try{e.cleanup(),e.fn();}finally{tt$2(e,t);}}var Wi$1;function jr$2(){return Wi$1}function Me$3(e){let t=Wi$1;return Wi$1=e,t}var cl$1=Symbol("NotFound");function tn$2(e){return e===cl$1||e?.name==="\u0275NotFound"}function qi$1(e,t,n){let r=Object.create(Sh);r.source=e,r.computation=t,n!=null&&(r.equal=n);let i=()=>{if(vt$5(r),et$2(r),r.value===_e$3)throw r.error;return r.value};return i[V]=r,i}function ll$1(e,t){vt$5(e),It$3(e,t),Jt$1(e);}function ul$1(e,t){if(vt$5(e),e.value===_e$3)throw e.error;Fr$2(e,t),Jt$1(e);}var Sh=s(r({},Xe$4),{value:mt$3,dirty:true,error:null,equal:Fn$3,kind:"linkedSignal",producerMustRecompute(e){return e.value===mt$3||e.value===yt$5},producerRecomputeValue(e){if(e.value===yt$5)throw new Error("");let t=e.value;e.value=yt$5;let n=$e$3(e),r,o=false;try{let i=e.source(),s=t!==mt$3&&t!==_e$3,a=s?{source:e.sourceValue,value:t}:void 0;r=e.computation(i,a),e.sourceValue=i,v$1(null),o=s&&r!==_e$3&&e.equal(t,r);}catch(i){r=_e$3,e.error=i;}finally{tt$2(e,n);}if(o){e.value=t;return}e.value=r,e.version++;}});function dl$1(e){let t=v$1(null);try{return e()}finally{v$1(t);}}function I$1(e){return typeof e=="function"}function nn$1(e){let n=e(r=>{Error.call(r),r.stack=new Error().stack;});return n.prototype=Object.create(Error.prototype),n.prototype.constructor=n,n}var Vr$2=nn$1(e=>function(n){e(this),this.message=n?`${n.length} errors occurred during unsubscription:
${n.map((r,o)=>`${o+1}) ${r.toString()}`).join(`
  `)}`:"",this.name="UnsubscriptionError",this.errors=n;});function Et$3(e,t){if(e){let n=e.indexOf(t);0<=n&&e.splice(n,1);}}var G$2=class e{constructor(t){this.initialTeardown=t,this.closed=false,this._parentage=null,this._finalizers=null;}unsubscribe(){let t;if(!this.closed){this.closed=true;let{_parentage:n}=this;if(n)if(this._parentage=null,Array.isArray(n))for(let i of n)i.remove(this);else n.remove(this);let{initialTeardown:r}=this;if(I$1(r))try{r();}catch(i){t=i instanceof Vr$2?i.errors:[i];}let{_finalizers:o}=this;if(o){this._finalizers=null;for(let i of o)try{fl$1(i);}catch(s){t=t??[],s instanceof Vr$2?t=[...t,...s.errors]:t.push(s);}}if(t)throw new Vr$2(t)}}add(t){var n;if(t&&t!==this)if(this.closed)fl$1(t);else {if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this);}(this._finalizers=(n=this._finalizers)!==null&&n!==void 0?n:[]).push(t);}}_hasParent(t){let{_parentage:n}=this;return n===t||Array.isArray(n)&&n.includes(t)}_addParent(t){let{_parentage:n}=this;this._parentage=Array.isArray(n)?(n.push(t),n):n?[n,t]:t;}_removeParent(t){let{_parentage:n}=this;n===t?this._parentage=null:Array.isArray(n)&&Et$3(n,t);}remove(t){let{_finalizers:n}=this;n&&Et$3(n,t),t instanceof e&&t._removeParent(this);}};G$2.EMPTY=(()=>{let e=new G$2;return e.closed=true,e})();var Gi$1=G$2.EMPTY;function Hr$2(e){return e instanceof G$2||e&&"closed"in e&&I$1(e.remove)&&I$1(e.add)&&I$1(e.unsubscribe)}function fl$1(e){I$1(e)?e():e.unsubscribe();}var ye$3={Promise:void 0};var rn$2={setTimeout(e,t,...n){return setTimeout(e,t,...n)},clearTimeout(e){return (clearTimeout)(e)},delegate:void 0};function Br$2(e){rn$2.setTimeout(()=>{throw e});}function Dt$4(){}function on$2(e){e();}var Tt$4=class Tt extends G$2{constructor(t){super(),this.isStopped=false,t?(this.destination=t,Hr$2(t)&&t.add(this)):this.destination=Ah;}static create(t,n,r){return new ve$2(t,n,r)}next(t){this.isStopped?Zi$1():this._next(t);}error(t){this.isStopped?Zi$1():(this.isStopped=true,this._error(t));}complete(){this.isStopped?Zi$1():(this.isStopped=true,this._complete());}unsubscribe(){this.closed||(this.isStopped=true,super.unsubscribe(),this.destination=null);}_next(t){this.destination.next(t);}_error(t){try{this.destination.error(t);}finally{this.unsubscribe();}}_complete(){try{this.destination.complete();}finally{this.unsubscribe();}}};var Yi$1=class Yi{constructor(t){this.partialObserver=t;}next(t){let{partialObserver:n}=this;if(n.next)try{n.next(t);}catch(r){$r$1(r);}}error(t){let{partialObserver:n}=this;if(n.error)try{n.error(t);}catch(r){$r$1(r);}else $r$1(t);}complete(){let{partialObserver:t}=this;if(t.complete)try{t.complete();}catch(n){$r$1(n);}}},ve$2=class ve extends Tt$4{constructor(t,n,r){super();let o;if(I$1(t)||!t)o={next:t??void 0,error:n??void 0,complete:r??void 0};else {o=t;}this.destination=new Yi$1(o);}};function $r$1(e){Br$2(e);}function xh(e){throw e}function Zi$1(e,t){}var Ah={closed:true,next:Dt$4,error:xh,complete:Dt$4};var sn$2=typeof Symbol=="function"&&Symbol.observable||"@@observable";function X$3(e){return e}function Rh(...e){return Ki$1(e)}function Ki$1(e){return e.length===0?X$3:e.length===1?e[0]:function(n){return e.reduce((r,o)=>o(r),n)}}var x=(()=>{class e{constructor(n){n&&(this._subscribe=n);}lift(n){let r=new e;return r.source=this,r.operator=n,r}subscribe(n,r,o){let i=Oh(n)?n:new ve$2(n,r,o);return on$2(()=>{let{operator:s,source:a}=this;i.add(s?s.call(i,a):a?this._subscribe(i):this._trySubscribe(i));}),i}_trySubscribe(n){try{return this._subscribe(n)}catch(r){n.error(r);}}forEach(n,r){return r=yl$1(r),new r((o,i)=>{let s=new ve$2({next:a=>{try{n(a);}catch(c){i(c),s.unsubscribe();}},error:i,complete:o});this.subscribe(s);})}_subscribe(n){var r;return (r=this.source)===null||r===void 0?void 0:r.subscribe(n)}[sn$2](){return this}pipe(...n){return Ki$1(n)(this)}toPromise(n){return n=yl$1(n),new n((r,o)=>{let i;this.subscribe(s=>i=s,s=>o(s),()=>r(i));})}}return e.create=t=>new e(t),e})();function yl$1(e){var t;return (t=e??ye$3.Promise)!==null&&t!==void 0?t:Promise}function kh(e){return e&&I$1(e.next)&&I$1(e.error)&&I$1(e.complete)}function Oh(e){return e&&e instanceof Tt$4||kh(e)&&Hr$2(e)}function Ph(e){return I$1(e?.lift)}function w(e){return t=>{if(Ph(t))return t.lift(function(n){try{return e(n,this)}catch(r){this.error(r);}});throw new TypeError("Unable to lift unknown Observable type")}}function E$2(e,t,n,r,o){return new Ji$1(e,t,n,r,o)}var Ji$1=class Ji extends Tt$4{constructor(t,n,r,o,i,s){super(t),this.onFinalize=i,this.shouldUnsubscribe=s,this._next=n?function(a){try{n(a);}catch(c){t.error(c);}}:super._next,this._error=o?function(a){try{o(a);}catch(c){t.error(c);}finally{this.unsubscribe();}}:super._error,this._complete=r?function(){try{r();}catch(a){t.error(a);}finally{this.unsubscribe();}}:super._complete;}unsubscribe(){var t;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){let{closed:n}=this;super.unsubscribe(),!n&&((t=this.onFinalize)===null||t===void 0||t.call(this));}}};var vl$1=nn$1(e=>function(){e(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed";});var ie$1=(()=>{class e extends x{constructor(){super(),this.closed=false,this.currentObservers=null,this.observers=[],this.isStopped=false,this.hasError=false,this.thrownError=null;}lift(n){let r=new Ur$2(this,this);return r.operator=n,r}_throwIfClosed(){if(this.closed)throw new vl$1}next(n){on$2(()=>{if(this._throwIfClosed(),!this.isStopped){this.currentObservers||(this.currentObservers=Array.from(this.observers));for(let r of this.currentObservers)r.next(n);}});}error(n){on$2(()=>{if(this._throwIfClosed(),!this.isStopped){this.hasError=this.isStopped=true,this.thrownError=n;let{observers:r}=this;for(;r.length;)r.shift().error(n);}});}complete(){on$2(()=>{if(this._throwIfClosed(),!this.isStopped){this.isStopped=true;let{observers:n}=this;for(;n.length;)n.shift().complete();}});}unsubscribe(){this.isStopped=this.closed=true,this.observers=this.currentObservers=null;}get observed(){var n;return ((n=this.observers)===null||n===void 0?void 0:n.length)>0}_trySubscribe(n){return this._throwIfClosed(),super._trySubscribe(n)}_subscribe(n){return this._throwIfClosed(),this._checkFinalizedStatuses(n),this._innerSubscribe(n)}_innerSubscribe(n){let{hasError:r,isStopped:o,observers:i}=this;return r||o?Gi$1:(this.currentObservers=null,i.push(n),new G$2(()=>{this.currentObservers=null,Et$3(i,n);}))}_checkFinalizedStatuses(n){let{hasError:r,thrownError:o,isStopped:i}=this;r?n.error(o):i&&n.complete();}asObservable(){let n=new x;return n.source=this,n}}return e.create=(t,n)=>new Ur$2(t,n),e})(),Ur$2=class Ur extends ie$1{constructor(t,n){super(),this.destination=t,this.source=n;}next(t){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.next)===null||r===void 0||r.call(n,t);}error(t){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.error)===null||r===void 0||r.call(n,t);}complete(){var t,n;(n=(t=this.destination)===null||t===void 0?void 0:t.complete)===null||n===void 0||n.call(t);}_subscribe(t){var n,r;return (r=(n=this.source)===null||n===void 0?void 0:n.subscribe(t))!==null&&r!==void 0?r:Gi$1}};var Hn$3=class Hn extends ie$1{constructor(t){super(),this._value=t;}get value(){return this.getValue()}_subscribe(t){let n=super._subscribe(t);return !n.closed&&t.next(this._value),n}getValue(){let{hasError:t,thrownError:n,_value:r}=this;if(t)throw n;return this._throwIfClosed(),r}next(t){super.next(this._value=t);}};var Bn$4={now(){return (Bn$4.delegate||Date).now()},delegate:void 0};var $n$3=class $n extends ie$1{constructor(t=1/0,n=1/0,r=Bn$4){super(),this._bufferSize=t,this._windowTime=n,this._timestampProvider=r,this._buffer=[],this._infiniteTimeWindow=true,this._infiniteTimeWindow=n===1/0,this._bufferSize=Math.max(1,t),this._windowTime=Math.max(1,n);}next(t){let{isStopped:n,_buffer:r,_infiniteTimeWindow:o,_timestampProvider:i,_windowTime:s}=this;n||(r.push(t),!o&&r.push(i.now()+s)),this._trimBuffer(),super.next(t);}_subscribe(t){this._throwIfClosed(),this._trimBuffer();let n=this._innerSubscribe(t),{_infiniteTimeWindow:r,_buffer:o}=this,i=o.slice();for(let s=0;s<i.length&&!t.closed;s+=r?1:2)t.next(i[s]);return this._checkFinalizedStatuses(t),n}_trimBuffer(){let{_bufferSize:t,_timestampProvider:n,_buffer:r,_infiniteTimeWindow:o}=this,i=(o?1:2)*t;if(t<1/0&&i<r.length&&r.splice(0,r.length-i),!o){let s=n.now(),a=0;for(let c=1;c<r.length&&r[c]<=s;c+=2)a=c;a&&r.splice(0,a+1);}}};var Wr$2=class Wr extends G$2{constructor(t,n){super();}schedule(t,n=0){return this}};var Un$3={setInterval(e,t,...n){let{delegate:r}=Un$3;return r?.setInterval?r.setInterval(e,t,...n):setInterval(e,t,...n)},clearInterval(e){return (clearInterval)(e)},delegate:void 0};var qr$2=class qr extends Wr$2{constructor(t,n){super(t,n),this.scheduler=t,this.work=n,this.pending=false;}schedule(t,n=0){var r;if(this.closed)return this;this.state=t;let o=this.id,i=this.scheduler;return o!=null&&(this.id=this.recycleAsyncId(i,o,n)),this.pending=true,this.delay=n,this.id=(r=this.id)!==null&&r!==void 0?r:this.requestAsyncId(i,this.id,n),this}requestAsyncId(t,n,r=0){return Un$3.setInterval(t.flush.bind(t,this),r)}recycleAsyncId(t,n,r=0){if(r!=null&&this.delay===r&&this.pending===false)return n;n!=null&&Un$3.clearInterval(n);}execute(t,n){if(this.closed)return new Error("executing a cancelled action");this.pending=false;let r=this._execute(t,n);if(r)return r;this.pending===false&&this.id!=null&&(this.id=this.recycleAsyncId(this.scheduler,this.id,null));}_execute(t,n){let r=false,o;try{this.work(t);}catch(i){r=true,o=i||new Error("Scheduled action threw falsy error");}if(r)return this.unsubscribe(),o}unsubscribe(){if(!this.closed){let{id:t,scheduler:n}=this,{actions:r}=n;this.work=this.state=this.scheduler=null,this.pending=false,Et$3(r,this),t!=null&&(this.id=this.recycleAsyncId(n,t,null)),this.delay=null,super.unsubscribe();}}};var an$2=class e{constructor(t,n=e.now){this.schedulerActionCtor=t,this.now=n;}schedule(t,n=0,r){return new this.schedulerActionCtor(this,t).schedule(r,n)}};an$2.now=Bn$4.now;var Gr$2=class Gr extends an$2{constructor(t,n=an$2.now){super(t,n),this.actions=[],this._active=false;}flush(t){let{actions:n}=this;if(this._active){n.push(t);return}let r;this._active=true;do if(r=t.execute(t.state,t.delay))break;while(t=n.shift());if(this._active=false,r){for(;t=n.shift();)t.unsubscribe();throw r}}};var Se$2=new Gr$2(qr$2),Xi$1=Se$2;var Ct$5=new x(e=>e.complete());function zr$2(e){return e&&I$1(e.schedule)}function es$2(e){return e[e.length-1]}function Qr$2(e){return I$1(es$2(e))?e.pop():void 0}function Ne$2(e){return zr$2(es$2(e))?e.pop():void 0}function Il$1(e,t){return typeof es$2(e)=="number"?e.pop():t}function Dl$1(e,t,n,r){function o(i){return i instanceof n?i:new n(function(s){s(i);})}return new(n||(n=Promise))(function(i,s){function a(u){try{l(r.next(u));}catch(d){s(d);}}function c(u){try{l(r.throw(u));}catch(d){s(d);}}function l(u){u.done?i(u.value):o(u.value).then(a,c);}l((r=r.apply(e,[])).next());})}function El$1(e){var t=typeof Symbol=="function"&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&typeof e.length=="number")return {next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function bt$5(e){return this instanceof bt$5?(this.v=e,this):new bt$5(e)}function wl$1(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var r=n.apply(e,t||[]),o,i=[];return o=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",s),o[Symbol.asyncIterator]=function(){return this},o;function s(f){return function(h){return Promise.resolve(h).then(f,d)}}function a(f,h){r[f]&&(o[f]=function(g){return new Promise(function(D,_){i.push([f,g,D,_])>1||c(f,g);})},h&&(o[f]=h(o[f])));}function c(f,h){try{l(r[f](h));}catch(g){p(i[0][3],g);}}function l(f){f.value instanceof bt$5?Promise.resolve(f.value.v).then(u,d):p(i[0][2],f);}function u(f){c("next",f);}function d(f){c("throw",f);}function p(f,h){f(h),i.shift(),i.length&&c(i[0][0],i[0][1]);}}function Tl$1(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator],n;return t?t.call(e):(e=typeof El$1=="function"?El$1(e):e[Symbol.iterator](),n={},r("next"),r("throw"),r("return"),n[Symbol.asyncIterator]=function(){return this},n);function r(i){n[i]=e[i]&&function(s){return new Promise(function(a,c){s=e[i](s),o(a,c,s.done,s.value);})};}function o(i,s,a,c){Promise.resolve(c).then(function(l){i({value:l,done:a});},s);}}var cn$2=e=>e&&typeof e.length=="number"&&typeof e!="function";function Zr$2(e){return I$1(e?.then)}function Yr$2(e){return I$1(e[sn$2])}function Kr$2(e){return Symbol.asyncIterator&&I$1(e?.[Symbol.asyncIterator])}function Jr$2(e){return new TypeError(`You provided ${e!==null&&typeof e=="object"?"an invalid object":`'${e}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`)}function Lh(){return typeof Symbol!="function"||!Symbol.iterator?"@@iterator":Symbol.iterator}var Xr$2=Lh();function eo$1(e){return I$1(e?.[Xr$2])}function to$1(e){return wl$1(this,arguments,function*(){let n=e.getReader();try{for(;;){let{value:r,done:o}=yield bt$5(n.read());if(o)return yield bt$5(void 0);yield yield bt$5(r);}}finally{n.releaseLock();}})}function no$1(e){return I$1(e?.getReader)}function S$3(e){if(e instanceof x)return e;if(e!=null){if(Yr$2(e))return Fh(e);if(cn$2(e))return jh(e);if(Zr$2(e))return Vh(e);if(Kr$2(e))return Cl$1(e);if(eo$1(e))return Hh(e);if(no$1(e))return Bh(e)}throw Jr$2(e)}function Fh(e){return new x(t=>{let n=e[sn$2]();if(I$1(n.subscribe))return n.subscribe(t);throw new TypeError("Provided object does not correctly implement Symbol.observable")})}function jh(e){return new x(t=>{for(let n=0;n<e.length&&!t.closed;n++)t.next(e[n]);t.complete();})}function Vh(e){return new x(t=>{e.then(n=>{t.closed||(t.next(n),t.complete());},n=>t.error(n)).then(null,Br$2);})}function Hh(e){return new x(t=>{for(let n of e)if(t.next(n),t.closed)return;t.complete();})}function Cl$1(e){return new x(t=>{$h(e,t).catch(n=>t.error(n));})}function Bh(e){return Cl$1(to$1(e))}function $h(e,t){var n,r,o,i;return Dl$1(this,void 0,void 0,function*(){try{for(n=Tl$1(e);r=yield n.next(),!r.done;){let s=r.value;if(t.next(s),t.closed)return}}catch(s){o={error:s};}finally{try{r&&!r.done&&(i=n.return)&&(yield i.call(n));}finally{if(o)throw o.error}}t.complete();})}function ne$1(e,t,n,r=0,o=false){let i=t.schedule(function(){n(),o?e.add(this.schedule(null,r)):this.unsubscribe();},r);if(e.add(i),!o)return i}function ro$1(e,t=0){return w((n,r)=>{n.subscribe(E$2(r,o=>ne$1(r,e,()=>r.next(o),t),()=>ne$1(r,e,()=>r.complete(),t),o=>ne$1(r,e,()=>r.error(o),t)));})}function oo$1(e,t=0){return w((n,r)=>{r.add(e.schedule(()=>n.subscribe(r),t));})}function bl$1(e,t){return S$3(e).pipe(oo$1(t),ro$1(t))}function _l$1(e,t){return S$3(e).pipe(oo$1(t),ro$1(t))}function Ml$1(e,t){return new x(n=>{let r=0;return t.schedule(function(){r===e.length?n.complete():(n.next(e[r++]),n.closed||this.schedule());})})}function Sl$1(e,t){return new x(n=>{let r;return ne$1(n,t,()=>{r=e[Xr$2](),ne$1(n,t,()=>{let o,i;try{({value:o,done:i}=r.next());}catch(s){n.error(s);return}i?n.complete():n.next(o);},0,true);}),()=>I$1(r?.return)&&r.return()})}function io$1(e,t){if(!e)throw new Error("Iterable cannot be null");return new x(n=>{ne$1(n,t,()=>{let r=e[Symbol.asyncIterator]();ne$1(n,t,()=>{r.next().then(o=>{o.done?n.complete():n.next(o.value);});},0,true);});})}function Nl$1(e,t){return io$1(to$1(e),t)}function ts$2(e,t){if(e!=null){if(Yr$2(e))return bl$1(e,t);if(cn$2(e))return Ml$1(e,t);if(Zr$2(e))return _l$1(e,t);if(Kr$2(e))return io$1(e,t);if(eo$1(e))return Sl$1(e,t);if(no$1(e))return Nl$1(e,t)}throw Jr$2(e)}function xe$3(e,t){return t?ts$2(e,t):S$3(e)}function Uh(...e){let t=Ne$2(e);return xe$3(e,t)}function Wh(e,t){let n=I$1(e)?e:()=>e,r=o=>o.error(n());return new x(r)}function qh(e){return !!e&&(e instanceof x||I$1(e.lift)&&I$1(e.subscribe))}var _t$5=nn$1(e=>function(){e(this),this.name="EmptyError",this.message="no elements in sequence";});function Gh(e,t){return new Promise((r,o)=>{let i=new ve$2({next:s=>{r(s),i.unsubscribe();},error:o,complete:()=>{o(new _t$5);}});e.subscribe(i);})}function xl$1(e){return e instanceof Date&&!isNaN(e)}function le$1(e,t){return w((n,r)=>{let o=0;n.subscribe(E$2(r,i=>{r.next(e.call(t,i,o++));}));})}var{isArray:zh}=Array;function Qh(e,t){return zh(t)?e(...t):e(t)}function ln$2(e){return le$1(t=>Qh(e,t))}var{isArray:Zh}=Array,{getPrototypeOf:Yh,prototype:Kh,keys:Jh}=Object;function so$1(e){if(e.length===1){let t=e[0];if(Zh(t))return {args:t,keys:null};if(Xh(t)){let n=Jh(t);return {args:n.map(r=>t[r]),keys:n}}}return {args:e,keys:null}}function Xh(e){return e&&typeof e=="object"&&Yh(e)===Kh}function ao$1(e,t){return e.reduce((n,r,o)=>(n[r]=t[o],n),{})}function eg(...e){let t=Ne$2(e),n=Qr$2(e),{args:r,keys:o}=so$1(e);if(r.length===0)return xe$3([],t);let i=new x(tg(r,t,o?s=>ao$1(o,s):X$3));return n?i.pipe(ln$2(n)):i}function tg(e,t,n=X$3){return r=>{Al$1(t,()=>{let{length:o}=e,i=new Array(o),s=o,a=o;for(let c=0;c<o;c++)Al$1(t,()=>{let l=xe$3(e[c],t),u=false;l.subscribe(E$2(r,d=>{i[c]=d,u||(u=true,a--),a||r.next(n(i.slice()));},()=>{--s||r.complete();}));},r);},r);}}function Al$1(e,t,n){e?ne$1(n,e,t):t();}function Rl$1(e,t,n,r,o,i,s,a){let c=[],l=0,u=0,d=false,p=()=>{d&&!c.length&&!l&&t.complete();},f=g=>l<r?h(g):c.push(g),h=g=>{l++;let D=false;S$3(n(g,u++)).subscribe(E$2(t,_=>{t.next(_);},()=>{D=true;},void 0,()=>{if(D)try{for(l--;c.length&&l<r;){let _=c.shift();s?ne$1(t,s,()=>h(_)):h(_);}p();}catch(_){t.error(_);}}));};return e.subscribe(E$2(t,f,()=>{d=true,p();})),()=>{}}function Ie$3(e,t,n=1/0){return I$1(t)?Ie$3((r,o)=>le$1((i,s)=>t(r,i,o,s))(S$3(e(r,o))),n):(typeof t=="number"&&(n=t),w((r,o)=>Rl$1(r,o,e,n)))}function Wn$3(e=1/0){return Ie$3(X$3,e)}function kl$1(){return Wn$3(1)}function un$2(...e){return kl$1()(xe$3(e,Ne$2(e)))}function ng(e){return new x(t=>{S$3(e()).subscribe(t);})}function rg(...e){let t=Qr$2(e),{args:n,keys:r}=so$1(e),o=new x(i=>{let{length:s}=n;if(!s){i.complete();return}let a=new Array(s),c=s,l=s;for(let u=0;u<s;u++){let d=false;S$3(n[u]).subscribe(E$2(i,p=>{d||(d=true,l--),a[u]=p;},()=>c--,void 0,()=>{(!c||!d)&&(l||i.next(r?ao$1(r,a):a),i.complete());}));}});return t?o.pipe(ln$2(t)):o}var og=["addListener","removeListener"],ig=["addEventListener","removeEventListener"],sg=["on","off"];function ns$2(e,t,n,r){if(I$1(n)&&(r=n,n=void 0),r)return ns$2(e,t,n).pipe(ln$2(r));let[o,i]=lg(e)?ig.map(s=>a=>e[s](t,a,n)):ag(e)?og.map(Ol$1(e,t)):cg(e)?sg.map(Ol$1(e,t)):[];if(!o&&cn$2(e))return Ie$3(s=>ns$2(s,t,n))(S$3(e));if(!o)throw new TypeError("Invalid event target");return new x(s=>{let a=(...c)=>s.next(1<c.length?c:c[0]);return o(a),()=>i(a)})}function Ol$1(e,t){return n=>r=>e[n](t,r)}function ag(e){return I$1(e.addListener)&&I$1(e.removeListener)}function cg(e){return I$1(e.on)&&I$1(e.off)}function lg(e){return I$1(e.addEventListener)&&I$1(e.removeEventListener)}function Ue$3(e=0,t,n=Xi$1){let r=-1;return t!=null&&(zr$2(t)?n=t:r=t),new x(o=>{let i=xl$1(e)?+e-n.now():e;i<0&&(i=0);let s=0;return n.schedule(function(){o.closed||(o.next(s++),0<=r?this.schedule(void 0,r):o.complete());},i)})}function ug(e=0,t=Se$2){return e<0&&(e=0),Ue$3(e,e,t)}function dg(...e){let t=Ne$2(e),n=Il$1(e,1/0),r=e;return r.length?r.length===1?S$3(r[0]):Wn$3(n)(xe$3(r,t)):Ct$5}function qn$3(e,t){return w((n,r)=>{let o=0;n.subscribe(E$2(r,i=>e.call(t,i,o++)&&r.next(i)));})}function Pl$1(e){return w((t,n)=>{let r=!1,o=null,i=null,s=!1,a=()=>{if(i?.unsubscribe(),i=null,r){r=!1;let l=o;o=null,n.next(l);}s&&n.complete();},c=()=>{i=null,s&&n.complete();};t.subscribe(E$2(n,l=>{r=!0,o=l,i||S$3(e(l)).subscribe(i=E$2(n,a,c));},()=>{s=!0,(!r||!i||i.closed)&&n.complete();}));})}function fg(e,t=Se$2){return Pl$1(()=>Ue$3(e,t))}function Ll$1(e){return w((t,n)=>{let r=null,o=!1,i;r=t.subscribe(E$2(n,void 0,void 0,s=>{i=S$3(e(s,Ll$1(e)(t))),r?(r.unsubscribe(),r=null,i.subscribe(n)):o=!0;})),o&&(r.unsubscribe(),r=null,i.subscribe(n));})}function pg(e,t){return I$1(t)?Ie$3(e,t,1):Ie$3(e,1)}function hg(e,t=Se$2){return w((n,r)=>{let o=null,i=null,s=null,a=()=>{if(o){o.unsubscribe(),o=null;let l=i;i=null,r.next(l);}};function c(){let l=s+e,u=t.now();if(u<l){o=this.schedule(void 0,l-u),r.add(o);return}a();}n.subscribe(E$2(r,l=>{i=l,s=t.now(),o||(o=t.schedule(c,e),r.add(o));},()=>{a(),r.complete();},void 0,()=>{i=o=null;}));})}function Fl$1(e){return w((t,n)=>{let r=!1;t.subscribe(E$2(n,o=>{r=!0,n.next(o);},()=>{r||n.next(e),n.complete();}));})}function dn$2(e){return e<=0?()=>Ct$5:w((t,n)=>{let r=0;t.subscribe(E$2(n,o=>{++r<=e&&(n.next(o),e<=r&&n.complete());}));})}function jl$1(){return w((e,t)=>{e.subscribe(E$2(t,Dt$4));})}function rs$2(e){return le$1(()=>e)}function os$2(e,t){return t?n=>un$2(t.pipe(dn$2(1),jl$1()),n.pipe(os$2(e))):Ie$3((n,r)=>S$3(e(n,r)).pipe(dn$2(1),rs$2(n)))}function gg(e,t=Se$2){let n=Ue$3(e,t);return os$2(()=>n)}function mg(e,t=X$3){return e=e??yg,w((n,r)=>{let o,i=!0;n.subscribe(E$2(r,s=>{let a=t(s);(i||!e(o,a))&&(i=!1,o=a,r.next(s));}));})}function yg(e,t){return e===t}function Vl$1(e=vg){return w((t,n)=>{let r=!1;t.subscribe(E$2(n,o=>{r=!0,n.next(o);},()=>r?n.complete():n.error(e())));})}function vg(){return new _t$5}function Hl$1(e,t){return t?n=>n.pipe(Hl$1((r,o)=>S$3(e(r,o)).pipe(le$1((i,s)=>t(r,i,o,s))))):w((n,r)=>{let o=0,i=null,s=!1;n.subscribe(E$2(r,a=>{i||(i=E$2(r,void 0,()=>{i=null,s&&r.complete();}),S$3(e(a,o++)).subscribe(i));},()=>{s=!0,!i&&r.complete();}));})}function Ig(e){return w((t,n)=>{try{t.subscribe(n);}finally{n.add(e);}})}function Eg(e,t){let n=arguments.length>=2;return r=>r.pipe(e?qn$3((o,i)=>e(o,i,r)):X$3,dn$2(1),n?Fl$1(t):Vl$1(()=>new _t$5))}function Dg(e){return e<=0?()=>Ct$5:w((t,n)=>{let r=[];t.subscribe(E$2(n,o=>{r.push(o),e<r.length&&r.shift();},()=>{for(let o of r)n.next(o);n.complete();},void 0,()=>{r=null;}));})}function wg(){return w((e,t)=>{let n,r=!1;e.subscribe(E$2(t,o=>{let i=n;n=o,r&&t.next([i,o]),r=!0;}));})}function Tg(e=1/0){let t;e&&typeof e=="object"?t=e:t={count:e};let{count:n=1/0,delay:r,resetOnSuccess:o=false}=t;return n<=0?X$3:w((i,s)=>{let a=0,c,l=()=>{let u=!1;c=i.subscribe(E$2(s,d=>{o&&(a=0),s.next(d);},void 0,d=>{if(a++<n){let p=()=>{c?(c.unsubscribe(),c=null,l()):u=!0;};if(r!=null){let f=typeof r=="number"?Ue$3(r):S$3(r(d,a)),h=E$2(s,()=>{h.unsubscribe(),p();},()=>{s.complete();});f.subscribe(h);}else p();}else s.error(d);})),u&&(c.unsubscribe(),c=null,l());};l();})}function ss$2(e={}){let{connector:t=()=>new ie$1,resetOnError:n=true,resetOnComplete:r=true,resetOnRefCountZero:o=true}=e;return i=>{let s,a,c,l=0,u=false,d=false,p=()=>{a?.unsubscribe(),a=void 0;},f=()=>{p(),s=c=void 0,u=d=false;},h=()=>{let g=s;f(),g?.unsubscribe();};return w((g,D)=>{l++,!d&&!u&&p();let _=c=c??t();D.add(()=>{l--,l===0&&!d&&!u&&(a=is$2(h,o));}),_.subscribe(D),!s&&l>0&&(s=new ve$2({next:j=>_.next(j),error:j=>{d=!0,p(),a=is$2(f,n,j),_.error(j);},complete:()=>{u=!0,p(),a=is$2(f,r),_.complete();}}),S$3(g).subscribe(s));})(i)}}function is$2(e,t,...n){if(t===true){e();return}if(t===false)return;let r=new ve$2({next:()=>{r.unsubscribe(),e();}});return S$3(t(...n)).subscribe(r)}function Cg(e,t,n){let r,o=false;return e&&typeof e=="object"?{bufferSize:r=1/0,windowTime:t=1/0,refCount:o=false,scheduler:n}=e:r=e??1/0,ss$2({connector:()=>new $n$3(r,t,n),resetOnError:true,resetOnComplete:false,resetOnRefCountZero:o})}function bg(e){return qn$3((t,n)=>e<=n)}function _g(...e){let t=Ne$2(e);return w((n,r)=>{(t?un$2(e,n,t):un$2(e,n)).subscribe(r);})}function Mg(e,t){return w((n,r)=>{let o=null,i=0,s=!1,a=()=>s&&!o&&r.complete();n.subscribe(E$2(r,c=>{o?.unsubscribe();let l=0,u=i++;S$3(e(c,u)).subscribe(o=E$2(r,d=>r.next(t?t(c,d,u,l++):d),()=>{o=null,a();}));},()=>{s=!0,a();}));})}function Sg(e){return w((t,n)=>{S$3(e).subscribe(E$2(n,()=>n.complete(),Dt$4)),!n.closed&&t.subscribe(n);})}function Ng(e,t=false){return w((n,r)=>{let o=0;n.subscribe(E$2(r,i=>{let s=e(i,o++);(s||t)&&r.next(i),!s&&r.complete();}));})}function xg(e,t,n){let r=I$1(e)||t||n?{next:e,error:t,complete:n}:e;return r?w((o,i)=>{var s;(s=r.subscribe)===null||s===void 0||s.call(r);let a=!0;o.subscribe(E$2(i,c=>{var l;(l=r.next)===null||l===void 0||l.call(r,c),i.next(c);},()=>{var c;a=!1,(c=r.complete)===null||c===void 0||c.call(r),i.complete();},c=>{var l;a=!1,(l=r.error)===null||l===void 0||l.call(r,c),i.error(c);},()=>{var c,l;a&&((c=r.unsubscribe)===null||c===void 0||c.call(r)),(l=r.finalize)===null||l===void 0||l.call(r);}));}):X$3}var lo$1=class lo{full;major;minor;patch;constructor(t){this.full=t;let n=t.split(".");this.major=n[0],this.minor=n[1],this.patch=n.slice(2).join(".");}},ql$1=new lo$1("22.0.1");var mo$1="https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss",M$2=class M extends Error{code;constructor(t,n){super(Kn$3(t,n)),this.code=t;}};function Ag(e){return `NG0${Math.abs(e)}`}function Kn$3(e,t){return `${Ag(e)}${t?": "+t:""}`}function k$1(e){for(let t in e)if(e[t]===k$1)return t;throw Error("")}function Gl$1(e,t){for(let n in t)t.hasOwnProperty(n)&&!e.hasOwnProperty(n)&&(e[n]=t[n]);}function Jn$3(e){if(typeof e=="string")return e;if(Array.isArray(e))return `[${e.map(Jn$3).join(", ")}]`;if(e==null)return ""+e;let t=e.overriddenName||e.name;if(t)return `${t}`;let n=e.toString();if(n==null)return ""+n;let r=n.indexOf(`
`);return r>=0?n.slice(0,r):n}function yo$1(e,t){return e?t?`${e} ${t}`:e:t||""}var Rg=k$1({__forward_ref__:k$1});function vo$1(e){return e.__forward_ref__=vo$1,e}function z$3(e){return Is$1(e)?e():e}function Is$1(e){return typeof e=="function"&&e.hasOwnProperty(Rg)&&e.__forward_ref__===vo$1}function re$2(e){return {token:e.token,providedIn:e.providedIn||null,factory:e.factory,value:void 0}}function zl$1(e){return {providers:e.providers||[],imports:e.imports||[]}}function Xn$3(e){return Og(e,Io$1)}function kg(e){return Xn$3(e)!==null}function Og(e,t){return e.hasOwnProperty(t)&&e[t]||null}function Pg(e){let t=e?.[Io$1]??null;return t||null}function cs$2(e){return e&&e.hasOwnProperty(uo$1)?e[uo$1]:null}var Io$1=k$1({\u0275prov:k$1}),uo$1=k$1({\u0275inj:k$1}),N$3=class N{_desc;ngMetadataName="InjectionToken";\u0275prov;constructor(t,n){this._desc=t,this.\u0275prov=void 0,typeof n=="number"?this.__NG_ELEMENT_ID__=n:n!==void 0&&(this.\u0275prov=re$2({token:this,providedIn:n.providedIn||"root",factory:n.factory}));}get multi(){return this}toString(){return `InjectionToken ${this._desc}`}};function Es$2(e){return e&&!!e.\u0275providers}var Ds$2=k$1({\u0275cmp:k$1}),ws$2=k$1({\u0275dir:k$1}),Ts$1=k$1({\u0275pipe:k$1}),Cs$2=k$1({\u0275mod:k$1}),zn$2=k$1({\u0275fac:k$1}),At$2=k$1({__NG_ELEMENT_ID__:k$1}),Bl$1=k$1({__NG_ENV_ID__:k$1});function Ql$1(e){return Do$1(e),e[Cs$2]||null}function ke$3(e){return Do$1(e),e[Ds$2]||null}function Eo$1(e){return Do$1(e),e[ws$2]||null}function bs$2(e){return Do$1(e),e[Ts$1]||null}function Do$1(e,t){if(e==null)throw new M$2(-919,false)}function Qe$3(e){return typeof e=="string"?e:e==null?"":String(e)}var Zl$1=k$1({ngErrorCode:k$1}),Lg=k$1({ngErrorMessage:k$1});k$1({ngTokenPath:k$1});function _s$2(e,t){return Yl$1("",-200)}function wo$1(e,t){throw new M$2(-201,false)}function Yl$1(e,t,n){let r=new M$2(t,e);return r[Zl$1]=t,r[Lg]=e,r}function jg(e){return e[Zl$1]}var ls$2;function Kl$1(){return ls$2}function ee$1(e){let t=ls$2;return ls$2=e,t}function Ms$2(e,t,n){let r=Xn$3(e);if(r&&r.providedIn=="root")return r.value===void 0?r.value=r.factory():r.value;if(n&8)return null;if(t!==void 0)return t;wo$1();}var Oe$2=globalThis;var Vg={},Mt$4=Vg,Hg="__NG_DI_FLAG__",us$2=class us{injector;constructor(t){this.injector=t;}retrieve(t,n){let r=St$6(n)||0;try{return this.injector.get(t,r&8?null:Mt$4,r)}catch(o){if(tn$2(o))return o;throw o}}};function Bg(e,t=0){let n=jr$2();if(n===void 0)throw new M$2(-203,false);if(n===null)return Ms$2(e,void 0,t);{let r=$g(t),o=n.retrieve(e,r);if(tn$2(o)){if(r.optional)return null;throw o}return o}}function Ae$4(e,t=0){return (Kl$1()||Bg)(z$3(e),t)}function T$2(e,t){return Ae$4(e,St$6(t))}function St$6(e){return typeof e>"u"||typeof e=="number"?e:0|(e.optional&&8)|(e.host&&1)|(e.self&&2)|(e.skipSelf&&4)}function $g(e){return {optional:!!(e&8),host:!!(e&1),self:!!(e&2),skipSelf:!!(e&4)}}function ds$2(e){let t=[];for(let n=0;n<e.length;n++){let r=z$3(e[n]);if(Array.isArray(r)){if(r.length===0)throw new M$2(900,false);let o,i=0;for(let s=0;s<r.length;s++){let a=r[s],c=Ug(a);typeof c=="number"?c===-1?o=a.token:i|=c:o=a;}t.push(Ae$4(o,i));}else t.push(Ae$4(r));}return t}function Ug(e){return e[Hg]}function rt$2(e,t){let n=e.hasOwnProperty(zn$2);return n?e[zn$2]:null}function Jl$1(e,t,n){if(e.length!==t.length)return  false;for(let r=0;r<e.length;r++){let o=e[r],i=t[r];if(n&&(o=n(o),i=n(i)),i!==o)return  false}return  true}function Xl$1(e){return e.flat(Number.POSITIVE_INFINITY)}function To$1(e,t){e.forEach(n=>Array.isArray(n)?To$1(n,t):t(n));}function Ss$2(e,t,n){t>=e.length?e.push(n):e.splice(t,0,n);}function er$4(e,t){return t>=e.length-1?e.pop():e.splice(t,1)[0]}function eu(e,t){let n=[];for(let r=0;r<e;r++)n.push(t);return n}function tu(e,t,n,r){let o=e.length;if(o==t)e.push(n,r);else if(o===1)e.push(r,e[0]),e[0]=n;else {for(o--,e.push(e[o-1],e[o]);o>t;){let i=o-2;e[o]=e[i],o--;}e[t]=n,e[t+1]=r;}}function Co$1(e,t,n){let r=hn$2(e,t);return r>=0?e[r|1]=n:(r=~r,tu(e,r,t,n)),r}function bo$1(e,t){let n=hn$2(e,t);if(n>=0)return e[n|1]}function hn$2(e,t){return Wg(e,t,1)}function Wg(e,t,n){let r=0,o=e.length>>n;for(;o!==r;){let i=r+(o-r>>1),s=e[i<<n];if(t===s)return i<<n;s>t?o=i:r=i+1;}return ~(o<<n)}var it$2={},Y$2=[],gn$2=new N$3(""),tr$3=new N$3("",-1),Ns$2=new N$3(""),pn$3=class pn{get(t,n=Mt$4){if(n===Mt$4){let o=Yl$1("",-201);throw o.name="\u0275NotFound",o}return n}};function _o$1(e){return {\u0275providers:e}}function nu(e){return _o$1([{provide:gn$2,multi:true,useValue:e}])}function ru(...e){return {\u0275providers:Mo$1(true,e),\u0275fromNgModule:true}}function Mo$1(e,...t){let n=[],r=new Set,o,i=s=>{n.push(s);};return To$1(t,s=>{let a=s;fo$1(a,i,[],r)&&(o||=[],o.push(a));}),o!==void 0&&ou(o,i),n}function ou(e,t){for(let n=0;n<e.length;n++){let{ngModule:r,providers:o}=e[n];xs$2(o,i=>{t(i,r);});}}function fo$1(e,t,n,r){if(e=z$3(e),!e)return  false;let o=null,i=cs$2(e),s=!i&&ke$3(e);if(!i&&!s){let c=e.ngModule;if(i=cs$2(c),i)o=c;else return  false}else {if(s&&!s.standalone)return  false;o=e;}let a=r.has(o);if(s){if(a)return  false;if(r.add(o),s.dependencies){let c=typeof s.dependencies=="function"?s.dependencies():s.dependencies;for(let l of c)fo$1(l,t,n,r);}}else if(i){if(i.imports!=null&&!a){r.add(o);let l;To$1(i.imports,u=>{fo$1(u,t,n,r)&&(l||=[],l.push(u));}),l!==void 0&&ou(l,t);}if(!a){let l=rt$2(o)||(()=>new o);t({provide:o,useFactory:l,deps:Y$2},o),t({provide:Ns$2,useValue:o,multi:true},o),t({provide:gn$2,useValue:()=>Ae$4(o),multi:true},o);}let c=i.providers;if(c!=null&&!a){let l=e;xs$2(c,u=>{t(u,l);});}}else return  false;return o!==e&&e.providers!==void 0}function xs$2(e,t){for(let n of e)Es$2(n)&&(n=n.\u0275providers),Array.isArray(n)?xs$2(n,t):t(n);}var qg=k$1({provide:String,useValue:k$1});function iu(e){return e!==null&&typeof e=="object"&&qg in e}function Gg(e){return !!(e&&e.useExisting)}function zg(e){return !!(e&&e.useFactory)}function Nt$3(e){return typeof e=="function"}function su(e){return !!e.useClass}var As$1=new N$3(""),co$1={},$l$1={},as$2;function mn$3(){return as$2===void 0&&(as$2=new pn$3),as$2}var se=class{},xt$3=class xt extends se{parent;source;scopes;records=new Map;_ngOnDestroyHooks=new Set;_onDestroyHooks=[];get destroyed(){return this._destroyed}_destroyed=false;injectorDefTypes;constructor(t,n,r,o){super(),this.parent=n,this.source=r,this.scopes=o,ps$1(t,s=>this.processProvider(s)),this.records.set(tr$3,fn$2(void 0,this)),o.has("environment")&&this.records.set(se,fn$2(void 0,this));let i=this.records.get(As$1);i!=null&&typeof i.value=="string"&&this.scopes.add(i.value),this.injectorDefTypes=new Set(this.get(Ns$2,Y$2,{self:true}));}retrieve(t,n){let r=St$6(n)||0;try{return this.get(t,Mt$4,r)}catch(o){if(tn$2(o))return o;throw o}}destroy(){Gn$3(this),this._destroyed=true;let t=v$1(null);try{for(let r of this._ngOnDestroyHooks)r.ngOnDestroy();let n=this._onDestroyHooks;this._onDestroyHooks=[];for(let r of n)r();}finally{this.records.clear(),this._ngOnDestroyHooks.clear(),this.injectorDefTypes.clear(),v$1(t);}}onDestroy(t){return Gn$3(this),this._onDestroyHooks.push(t),()=>this.removeOnDestroy(t)}runInContext(t){Gn$3(this);let n=Me$3(this),r=ee$1(void 0);try{return t()}finally{Me$3(n),ee$1(r);}}get(t,n=Mt$4,r){if(Gn$3(this),t.hasOwnProperty(Bl$1))return t[Bl$1](this);let o=St$6(r),s=Me$3(this),a=ee$1(void 0);try{if(!(o&4)){let l=this.records.get(t);if(l===void 0){let u=Jg(t)&&Xn$3(t);u&&this.injectableDefInScope(u)?l=fn$2(fs$2(t),co$1):l=null,this.records.set(t,l);}if(l!=null)return this.hydrate(t,l,o)}let c=o&2?mn$3():this.parent;return n=o&8&&n===Mt$4?null:n,c.get(t,n)}catch(c){let l=jg(c);throw l===-200||l===-201?new M$2(l,null):c}finally{ee$1(a),Me$3(s);}}resolveInjectorInitializers(){let t=v$1(null),n=Me$3(this),r=ee$1(void 0);try{let i=this.get(gn$2,Y$2,{self:!0});for(let s of i)s();}finally{Me$3(n),ee$1(r),v$1(t);}}toString(){return "R3Injector[...]"}processProvider(t){t=z$3(t);let n=Nt$3(t)?t:z$3(t&&t.provide),r=Zg(t);if(!Nt$3(t)&&t.multi===true){let o=this.records.get(n);o||(o=fn$2(void 0,co$1,true),o.factory=()=>ds$2(o.multi),this.records.set(n,o)),n=t,o.multi.push(t);}this.records.set(n,r);}hydrate(t,n,r){let o=v$1(null);try{if(n.value===$l$1)throw _s$2("");return n.value===co$1&&(n.value=$l$1,n.value=n.factory(void 0,r)),typeof n.value=="object"&&n.value&&Kg(n.value)&&this._ngOnDestroyHooks.add(n.value),n.value}finally{v$1(o);}}injectableDefInScope(t){if(!t.providedIn)return  false;let n=z$3(t.providedIn);return typeof n=="string"?n==="any"||this.scopes.has(n):this.injectorDefTypes.has(n)}removeOnDestroy(t){let n=this._onDestroyHooks.indexOf(t);n!==-1&&this._onDestroyHooks.splice(n,1);}};function fs$2(e){let t=Xn$3(e),n=t!==null?t.factory:rt$2(e);if(n!==null)return n;if(e instanceof N$3)throw new M$2(-204,false);if(e instanceof Function)return Qg(e);throw new M$2(-204,false)}function Qg(e){if(e.length>0)throw new M$2(-204,false);let n=Pg(e);return n!==null?()=>n.factory(e):()=>new e}function Zg(e){if(iu(e))return fn$2(void 0,e.useValue);{let t=Rs$2(e);return fn$2(t,co$1)}}function Rs$2(e,t,n){let r;if(Nt$3(e)){let o=z$3(e);return rt$2(o)||fs$2(o)}else if(iu(e))r=()=>z$3(e.useValue);else if(zg(e))r=()=>e.useFactory(...ds$2(e.deps||[]));else if(Gg(e))r=(o,i)=>Ae$4(z$3(e.useExisting),i!==void 0&&i&8?8:void 0);else {let o=z$3(e&&(e.useClass||e.provide));if(Yg(e))r=()=>new o(...ds$2(e.deps));else return rt$2(o)||fs$2(o)}return r}function Gn$3(e){if(e.destroyed)throw new M$2(-205,false)}function fn$2(e,t,n=false){return {factory:e,value:t,multi:n?[]:void 0}}function Yg(e){return !!e.deps}function Kg(e){return e!==null&&typeof e=="object"&&typeof e.ngOnDestroy=="function"}function Jg(e){return typeof e=="function"||typeof e=="object"&&e.ngMetadataName==="InjectionToken"}function ps$1(e,t){for(let n of e)Array.isArray(n)?ps$1(n,t):n&&Es$2(n)?ps$1(n.\u0275providers,t):t(n);}function So$1(e,t){let n;e instanceof xt$3?(Gn$3(e),n=e):n=new us$2(e);let o=Me$3(n),i=ee$1(void 0);try{return t()}finally{Me$3(o),ee$1(i);}}function au(){return Kl$1()!==void 0||jr$2()!=null}var we$3=0,m$1=1,C$1=2,$$2=3,ue=4,K$1=5,Rt$4=6,yn$2=7,H=8,J=9,Te$3=10,L$2=11,vn$2=12,ks$2=13,kt$4=14,te$1=15,st$2=16,Ot$3=17,Pe$3=18,Le$2=19,Os$2=20,qe$2=21,No$1=22,ot$2=23,ae=24,Pt$3=25,Fe$4=26,O$3=27,cu=1,at$3=6,ct$2=7,nr$4=8,Lt$4=9,F$2=10;function Ze$4(e){return Array.isArray(e)&&typeof e[cu]=="object"}function de(e){return Array.isArray(e)&&e[cu]===true}function Ps$1(e){return (e.flags&4)!==0}function Ye$5(e){return e.componentOffset>-1}function In$3(e){return (e.flags&1)===1}function je$4(e){return !!e.template}function En$3(e){return (e[C$1]&512)!==0}function lt$2(e){return (e[C$1]&256)===256}var Ls$2="svg",lu="math";function fe$2(e){for(;Array.isArray(e);)e=e[we$3];return e}function Fs$2(e,t){return fe$2(t[e])}function pe$2(e,t){return fe$2(t[e.index])}function Dn$3(e,t){return e.data[t]}function rr$3(e,t){return e[t]}function or$3(e,t,n,r){n>=e.data.length&&(e.data[n]=null,e.blueprint[n]=null),t[n]=r;}function he$2(e,t){let n=t[e];return Ze$4(n)?n:n[we$3]}function uu(e){return (e[C$1]&4)===4}function xo$1(e){return (e[C$1]&128)===128}function du(e){return de(e[$$2])}function ce(e,t){return t==null?null:e[t]}function js$1(e){e[Ot$3]=0;}function Ao$1(e){e[C$1]&1024||(e[C$1]|=1024,xo$1(e)&&Ft$4(e));}function fu$1(e,t){for(;e>0;)t=t[kt$4],e--;return t}function ir$4(e){return !!(e[C$1]&9216||e[ae]?.dirty)}function Ro$1(e){e[Te$3].changeDetectionScheduler?.notify(8),e[C$1]&64&&(e[C$1]|=1024),ir$4(e)&&Ft$4(e);}function Ft$4(e){e[Te$3].changeDetectionScheduler?.notify(0);let t=Ge$3(e);for(;t!==null&&!(t[C$1]&8192||(t[C$1]|=8192,!xo$1(t)));)t=Ge$3(t);}function sr$3(e,t){if(lt$2(e))throw new M$2(911,false);e[qe$2]===null&&(e[qe$2]=[]),e[qe$2].push(t);}function Vs$2(e,t){if(e[qe$2]===null)return;let n=e[qe$2].indexOf(t);n!==-1&&e[qe$2].splice(n,1);}function Ge$3(e){let t=e[$$2];return de(t)?t[$$2]:t}function Hs$1(e){return e[yn$2]??=[]}function Bs$1(e){return e.cleanup??=[]}function pu(e,t,n,r){let o=Hs$1(t);o.push(n),e.firstCreatePass&&Bs$1(e).push(r,o.length-1);}var b$1={lFrame:bu(null),bindingsEnabled:true,skipHydrationRootTNode:null};var hs$2=false;function hu(){return b$1.lFrame.elementDepthCount}function gu(){b$1.lFrame.elementDepthCount++;}function $s$2(){b$1.lFrame.elementDepthCount--;}function ko$2(){return b$1.bindingsEnabled}function Us$1(){return b$1.skipHydrationRootTNode!==null}function Ws$1(e){return b$1.skipHydrationRootTNode===e}function qs$1(){b$1.skipHydrationRootTNode=null;}function y$1(){return b$1.lFrame.lView}function P$3(){return b$1.lFrame.tView}function mu(e){return b$1.lFrame.contextLView=e,e[H]}function yu(e){return b$1.lFrame.contextLView=null,e}function B$1(){let e=Gs$1();for(;e!==null&&e.type===64;)e=e.parent;return e}function Gs$1(){return b$1.lFrame.currentTNode}function vu$1(){let e=b$1.lFrame,t=e.currentTNode;return e.isParent?t:t.parent}function jt$5(e,t){let n=b$1.lFrame;n.currentTNode=e,n.isParent=t;}function zs$1(){return b$1.lFrame.isParent}function Qs$2(){b$1.lFrame.isParent=false;}function Zs$1(){return b$1.lFrame.contextLView}function Ys$1(){return hs$2}function Qn$3(e){let t=hs$2;return hs$2=e,t}function Oo$1(){let e=b$1.lFrame,t=e.bindingRootIndex;return t===-1&&(t=e.bindingRootIndex=e.tView.bindingStartIndex),t}function Ks$1(){return b$1.lFrame.bindingIndex}function Iu(e){return b$1.lFrame.bindingIndex=e}function Vt$2(){return b$1.lFrame.bindingIndex++}function ar$3(e){let t=b$1.lFrame,n=t.bindingIndex;return t.bindingIndex=t.bindingIndex+e,n}function Eu(){return b$1.lFrame.inI18n}function Du(e,t){let n=b$1.lFrame;n.bindingIndex=n.bindingRootIndex=e,Po$2(t);}function wu$1(){return b$1.lFrame.currentDirectiveIndex}function Po$2(e){b$1.lFrame.currentDirectiveIndex=e;}function Tu(e){let t=b$1.lFrame.currentDirectiveIndex;return t===-1?null:e[t]}function Lo$2(){return b$1.lFrame.currentQueryIndex}function cr$4(e){b$1.lFrame.currentQueryIndex=e;}function Xg(e){let t=e[m$1];return t.type===2?t.declTNode:t.type===1?e[K$1]:null}function Js$1(e,t,n){if(n&4){let o=t,i=e;for(;o=o.parent,o===null&&!(n&1);)if(o=Xg(i),o===null||(i=i[kt$4],o.type&10))break;if(o===null)return  false;t=o,e=i;}let r=b$1.lFrame=Cu();return r.currentTNode=t,r.lView=e,true}function Fo$1(e){let t=Cu(),n=e[m$1];b$1.lFrame=t,t.currentTNode=n.firstChild,t.lView=e,t.tView=n,t.contextLView=e,t.bindingIndex=n.bindingStartIndex,t.inI18n=false;}function Cu(){let e=b$1.lFrame,t=e===null?null:e.child;return t===null?bu(e):t}function bu(e){let t={currentTNode:null,isParent:true,lView:null,tView:null,selectedIndex:-1,contextLView:null,elementDepthCount:0,currentNamespace:null,currentDirectiveIndex:-1,bindingRootIndex:-1,bindingIndex:-1,currentQueryIndex:0,parent:e,child:null,inI18n:false};return e!==null&&(e.child=t),t}function _u(){let e=b$1.lFrame;return b$1.lFrame=e.parent,e.currentTNode=null,e.lView=null,e}var Xs$1=_u;function jo$1(){let e=_u();e.isParent=true,e.tView=null,e.selectedIndex=-1,e.contextLView=null,e.elementDepthCount=0,e.currentDirectiveIndex=-1,e.currentNamespace=null,e.bindingRootIndex=-1,e.bindingIndex=-1,e.currentQueryIndex=0;}function Mu(e){return (b$1.lFrame.contextLView=fu$1(e,b$1.lFrame.contextLView))[H]}function ge$3(){return b$1.lFrame.selectedIndex}function ut$3(e){b$1.lFrame.selectedIndex=e;}function lr$4(){let e=b$1.lFrame;return Dn$3(e.tView,e.selectedIndex)}function Su(){b$1.lFrame.currentNamespace=Ls$2;}function Nu(){em$1();}function em$1(){b$1.lFrame.currentNamespace=null;}function ea(){return b$1.lFrame.currentNamespace}var xu=true;function Vo$1(){return xu}function ur$3(e){xu=e;}function gs$1(e,t=null,n=null,r){let o=ta(e,t,n);return o.resolveInjectorInitializers(),o}function ta(e,t=null,n=null,r,o=new Set){let i=[n||Y$2,ru(e)];return new xt$3(i,t||mn$3(),null,o)}var Ee$4=class e{static THROW_IF_NOT_FOUND=Mt$4;static NULL=new pn$3;static create(t,n){if(Array.isArray(t))return gs$1({name:""},n,t);{let r=t.name??"";return gs$1({name:r},t.parent,t.providers)}}static \u0275prov=re$2({token:e,providedIn:"any",factory:()=>Ae$4(tr$3)});static __NG_ELEMENT_ID__=-1},dr$3=new N$3(""),Ve$4=(()=>{class e{static __NG_ELEMENT_ID__=tm$1;static __NG_ENV_ID__=n=>n}return e})(),po$1=class po extends Ve$4{_lView;constructor(t){super(),this._lView=t;}get destroyed(){return lt$2(this._lView)}onDestroy(t){let n=this._lView;return sr$3(n,t),()=>Vs$2(n,t)}};function tm$1(){return new po$1(y$1())}var Au=false,Ru=new N$3(""),Ht$4=(()=>{class e{taskId=0;pendingTasks=new Set;destroyed=false;pendingTask=new Hn$3(false);debugTaskTracker=T$2(Ru,{optional:true});get hasPendingTasks(){return this.destroyed?false:this.pendingTask.value}get hasPendingTasksObservable(){return this.destroyed?new x(n=>{n.next(false),n.complete();}):this.pendingTask}add(){!this.hasPendingTasks&&!this.destroyed&&this.pendingTask.next(true);let n=this.taskId++;return this.pendingTasks.add(n),this.debugTaskTracker?.add(n),n}has(n){return this.pendingTasks.has(n)}remove(n){this.pendingTasks.delete(n),this.debugTaskTracker?.remove(n),this.pendingTasks.size===0&&this.hasPendingTasks&&this.pendingTask.next(false);}ngOnDestroy(){this.pendingTasks.clear(),this.hasPendingTasks&&this.pendingTask.next(false),this.destroyed=true,this.pendingTask.unsubscribe();}static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new e})}return e})(),ms$1=class ms extends ie$1{__isAsync;destroyRef=void 0;pendingTasks=void 0;constructor(t=false){super(),this.__isAsync=t,au()&&(this.destroyRef=T$2(Ve$4,{optional:true})??void 0,this.pendingTasks=T$2(Ht$4,{optional:true})??void 0);}emit(t){let n=v$1(null);try{super.next(t);}finally{v$1(n);}}subscribe(t,n,r){let o=t,i=n||(()=>null),s=r;if(t&&typeof t=="object"){let c=t;o=c.next?.bind(c),i=c.error?.bind(c),s=c.complete?.bind(c);}this.__isAsync&&(i=this.wrapInTimeout(i),o&&(o=this.wrapInTimeout(o)),s&&(s=this.wrapInTimeout(s)));let a=super.subscribe({next:o,error:i,complete:s});return t instanceof G$2&&t.add(a),a}wrapInTimeout(t){return n=>{let r=this.pendingTasks?.add();setTimeout(()=>{try{t(n);}finally{r!==void 0&&this.pendingTasks?.remove(r);}});}}},We$3=ms$1;function ho$1(...e){}function na(e){let t,n;function r(){e=ho$1;try{n!==void 0&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(n),t!==void 0&&clearTimeout(t);}catch{}}return t=setTimeout(()=>{e(),r();}),typeof requestAnimationFrame=="function"&&(n=requestAnimationFrame(()=>{e(),r();})),()=>r()}function ku(e){return queueMicrotask(()=>e()),()=>{e=ho$1;}}var ra="isAngularZone",Zn$3=ra+"_ID",nm$1=0,De$3=class e{hasPendingMacrotasks=false;hasPendingMicrotasks=false;isStable=true;onUnstable=new We$3(false);onMicrotaskEmpty=new We$3(false);onStable=new We$3(false);onError=new We$3(false);constructor(t){let{enableLongStackTrace:n=false,shouldCoalesceEventChangeDetection:r=false,shouldCoalesceRunChangeDetection:o=false,scheduleInRootZone:i=Au}=t;if(typeof Zone>"u")throw new M$2(908,false);Zone.assertZonePatched();let s=this;s._nesting=0,s._outer=s._inner=Zone.current,Zone.TaskTrackingZoneSpec&&(s._inner=s._inner.fork(new Zone.TaskTrackingZoneSpec)),n&&Zone.longStackTraceZoneSpec&&(s._inner=s._inner.fork(Zone.longStackTraceZoneSpec)),s.shouldCoalesceEventChangeDetection=!o&&r,s.shouldCoalesceRunChangeDetection=o,s.callbackScheduled=false,s.scheduleInRootZone=i,im$1(s);}static isInAngularZone(){return typeof Zone<"u"&&Zone.current.get(ra)===true}static assertInAngularZone(){if(!e.isInAngularZone())throw new M$2(909,false)}static assertNotInAngularZone(){if(e.isInAngularZone())throw new M$2(909,false)}run(t,n,r){return this._inner.run(t,n,r)}runTask(t,n,r,o){let i=this._inner,s=i.scheduleEventTask("NgZoneEvent: "+o,t,rm$1,ho$1,ho$1);try{return i.runTask(s,n,r)}finally{i.cancelTask(s);}}runGuarded(t,n,r){return this._inner.runGuarded(t,n,r)}runOutsideAngular(t){return this._outer.run(t)}},rm$1={};function oa(e){if(e._nesting==0&&!e.hasPendingMicrotasks&&!e.isStable)try{e._nesting++,e.onMicrotaskEmpty.emit(null);}finally{if(e._nesting--,!e.hasPendingMicrotasks)try{e.runOutsideAngular(()=>e.onStable.emit(null));}finally{e.isStable=true;}}}function om$1(e){if(e.isCheckStableRunning||e.callbackScheduled)return;e.callbackScheduled=true;function t(){na(()=>{e.callbackScheduled=false,ys$2(e),e.isCheckStableRunning=true,oa(e),e.isCheckStableRunning=false;});}e.scheduleInRootZone?Zone.root.run(()=>{t();}):e._outer.run(()=>{t();}),ys$2(e);}function im$1(e){let t=()=>{om$1(e);},n=nm$1++;e._inner=e._inner.fork({name:"angular",properties:{[ra]:true,[Zn$3]:n,[Zn$3+n]:true},onInvokeTask:(r,o,i,s,a,c)=>{if(sm$1(c))return r.invokeTask(i,s,a,c);try{return Ul$1(e),r.invokeTask(i,s,a,c)}finally{(e.shouldCoalesceEventChangeDetection&&s.type==="eventTask"||e.shouldCoalesceRunChangeDetection)&&t(),Wl$1(e);}},onInvoke:(r,o,i,s,a,c,l)=>{try{return Ul$1(e),r.invoke(i,s,a,c,l)}finally{e.shouldCoalesceRunChangeDetection&&!e.callbackScheduled&&!am$1(c)&&t(),Wl$1(e);}},onHasTask:(r,o,i,s)=>{r.hasTask(i,s),o===i&&(s.change=="microTask"?(e._hasPendingMicrotasks=s.microTask,ys$2(e),oa(e)):s.change=="macroTask"&&(e.hasPendingMacrotasks=s.macroTask));},onHandleError:(r,o,i,s)=>(r.handleError(i,s),e.runOutsideAngular(()=>e.onError.emit(s)),false)});}function ys$2(e){e._hasPendingMicrotasks||(e.shouldCoalesceEventChangeDetection||e.shouldCoalesceRunChangeDetection)&&e.callbackScheduled===true?e.hasPendingMicrotasks=true:e.hasPendingMicrotasks=false;}function Ul$1(e){e._nesting++,e.isStable&&(e.isStable=false,e.onUnstable.emit(null));}function Wl$1(e){e._nesting--,oa(e);}var Yn$3=class Yn{hasPendingMicrotasks=false;hasPendingMacrotasks=false;isStable=true;onUnstable=new We$3;onMicrotaskEmpty=new We$3;onStable=new We$3;onError=new We$3;run(t,n,r){return t.apply(n,r)}runGuarded(t,n,r){return t.apply(n,r)}runOutsideAngular(t){return t()}runTask(t,n,r,o){return t.apply(n,r)}};function sm$1(e){return Ou(e,"__ignore_ng_zone__")}function am$1(e){return Ou(e,"__scheduler_tick__")}function Ou(e,t){return !Array.isArray(e)||e.length!==1?false:e[0]?.data?.[t]===true}var ze$2=class ze{_console=console;handleError(t){this._console.error("ERROR",t);}},dt$2=new N$3("",{factory:()=>{let e=T$2(De$3),t=T$2(se),n;return r=>{e.runOutsideAngular(()=>{t.destroyed&&!n?setTimeout(()=>{throw r}):(n??=t.get(ze$2),n.handleError(r));});}}}),Pu={provide:gn$2,useValue:()=>{T$2(ze$2,{optional:true});},multi:true},cm$1=new N$3("",{factory:()=>{let e=T$2(dr$3).defaultView;if(!e)return;let t=T$2(dt$2),n=i=>{t(i.reason),i.preventDefault();},r=i=>{i.error?t(i.error):t(new Error(i.message,{cause:i})),i.preventDefault();},o=()=>{e.addEventListener("unhandledrejection",n),e.addEventListener("error",r);};typeof Zone<"u"?Zone.root.run(o):o(),T$2(Ve$4).onDestroy(()=>{e.removeEventListener("error",r),e.removeEventListener("unhandledrejection",n);});}});function lm$1(){return _o$1([nu(()=>{T$2(cm$1);})])}function Ho$1(e,t){let [n,r,o]=Bi$1(e,t?.equal),i=n;i[V];return i.set=r,i.update=o,i.asReadonly=Bo$1.bind(i),i}function Bo$1(){let e=this[V];if(e.readonlyFn===void 0){let t=()=>this();t[V]=e,e.readonlyFn=t;}return e.readonlyFn}var Lu=new N$3("",{factory:()=>um$1}),um$1="ng";var Fu=new N$3(""),dm$1=new N$3("",{providedIn:"platform",factory:()=>"unknown"}),fm$1=new N$3(""),pm$1=new N$3("",{factory:()=>T$2(dr$3).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce")||null}),ju={breakpoints:[16,32,48,64,96,128,256,384,640,750,828,1080,1200,1920,2048,3840],placeholderResolution:30,disableImageSizeWarning:false,disableImageLazyLoadWarning:false},hm$1=new N$3("",{factory:()=>ju});var wn$3=(()=>{class e{view;node;constructor(n,r){this.view=n,this.node=r;}static __NG_ELEMENT_ID__=gm$1}return e})();function gm$1(){return new wn$3(y$1(),B$1())}var Re$4=class Re{},fr$3=new N$3("",{factory:()=>true});var ia=new N$3(""),$o$1=(()=>{class e{static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new vs$2})}return e})(),vs$2=class vs{dirtyEffectCount=0;queues=new Map;add(t){this.enqueue(t),this.schedule(t);}schedule(t){t.dirty&&this.dirtyEffectCount++;}remove(t){let n=t.zone,r=this.queues.get(n);r.has(t)&&(r.delete(t),t.dirty&&this.dirtyEffectCount--);}enqueue(t){let n=t.zone;this.queues.has(n)||this.queues.set(n,new Set);let r=this.queues.get(n);r.has(t)||r.add(t);}flush(){for(;this.dirtyEffectCount>0;){let t=false;for(let[n,r]of this.queues)n===null?t||=this.flushQueue(r):t||=n.run(()=>this.flushQueue(r));t||(this.dirtyEffectCount=0);}}flushQueue(t){let n=false;for(let r of t)r.dirty&&(this.dirtyEffectCount--,n=true,r.run());return n}},go$1=class go{[V];constructor(t){this[V]=t;}destroy(){this[V].destroy();}};function Vu(e,t){let n=t?.injector??T$2(Ee$4),r=t?.manualCleanup!==true?n.get(Ve$4):null,o,i=n.get(wn$3,null,{optional:true}),s=n.get(Re$4);return i!==null?(o=vm$1(i.view,s,e),r instanceof po$1&&r._lView===i.view&&(r=null)):o=Im(e,n.get($o$1),s),o.injector=n,r!==null&&(o.onDestroyFns=[r.onDestroy(()=>o.destroy())]),new go$1(o)}var Hu=s(r({},$i$1),{cleanupFns:void 0,zone:null,onDestroyFns:null,run(){let e=Qn$3(false);try{Ui$1(this);}finally{Qn$3(e);}},cleanup(){if(!this.cleanupFns?.length)return;let e=v$1(null);try{for(;this.cleanupFns.length;)this.cleanupFns.pop()();}finally{this.cleanupFns=[],v$1(e);}}}),mm$1=s(r({},Hu),{consumerMarkedDirty(){this.scheduler.schedule(this),this.notifier.notify(12);},destroy(){if(nt$2(this),this.onDestroyFns!==null)for(let e of this.onDestroyFns)e();this.cleanup(),this.scheduler.remove(this);}}),ym$1=s(r({},Hu),{consumerMarkedDirty(){this.view[C$1]|=8192,Ft$4(this.view),this.notifier.notify(13);},destroy(){if(nt$2(this),this.onDestroyFns!==null)for(let e of this.onDestroyFns)e();this.cleanup(),this.view[ot$2]?.delete(this);}});function vm$1(e,t,n){let r=Object.create(ym$1);return r.view=e,r.zone=typeof Zone<"u"?Zone.current:null,r.notifier=t,r.fn=Bu(r,n),e[ot$2]??=new Set,e[ot$2].add(r),r.consumerMarkedDirty(r),r}function Im(e,t,n){let r=Object.create(mm$1);return r.fn=Bu(r,e),r.scheduler=t,r.notifier=n,r.zone=typeof Zone<"u"?Zone.current:null,r.scheduler.add(r),r.notifier.notify(12),r}function Bu(e,t){return ()=>{t(n=>(e.cleanupFns??=[]).push(n));}}function sa(e){return typeof e=="function"&&e[V]!==void 0}var Uo$2=(()=>{class e{internalPendingTasks=T$2(Ht$4);scheduler=T$2(Re$4);errorHandler=T$2(dt$2);add(){let n=this.internalPendingTasks.add();return ()=>{this.internalPendingTasks.has(n)&&(this.scheduler.notify(11),this.internalPendingTasks.remove(n));}}run(n){let r=this.add();try{n().catch(this.errorHandler).finally(r);}catch(o){this.errorHandler(o),r();}}static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new e})}return e})();function br$3(e){return {toString:e}.toString()}var Xo$1=class Xo{previousValue;currentValue;firstChange;constructor(t,n,r){this.previousValue=t,this.currentValue=n,this.firstChange=r;}isFirstChange(){return this.firstChange}};function Ad(e,t,n,r){t!==null?t.applyValueToInputSignal(t,r):e[n]=r;}var xm$1=(()=>{let e=()=>Rd$1;return e.ngInherit=true,e})();function Rd$1(e){return e.type.prototype.ngOnChanges&&(e.setInput=Rm$1),Am$1}function Am$1(){let e=kd$1(this),t=e?.current;if(t){let n=e.previous;if(n===it$2)e.previous=t;else for(let r in t)n[r]=t[r];e.current=null,this.ngOnChanges(t);}}function Rm$1(e,t,n,r,o){let i=this.declaredInputs[r],s=kd$1(e)||km$1(e,{previous:it$2,current:null}),a=s.current||(s.current={}),c=s.previous,l=c[i];a[i]=new Xo$1(l&&l.currentValue,n,c===it$2),Ad(e,t,o,n);}var Ea="__ngSimpleChanges__";function kd$1(e){return Object.hasOwn(e,Ea)&&e[Ea]||null}function km$1(e,t){return e[Ea]=t}var $u=[];var R$3=function(e,t=null,n){for(let r=0;r<$u.length;r++){let o=$u[r];o(e,t,n);}},A$2=(function(e){return e[e.TemplateCreateStart=0]="TemplateCreateStart",e[e.TemplateCreateEnd=1]="TemplateCreateEnd",e[e.TemplateUpdateStart=2]="TemplateUpdateStart",e[e.TemplateUpdateEnd=3]="TemplateUpdateEnd",e[e.LifecycleHookStart=4]="LifecycleHookStart",e[e.LifecycleHookEnd=5]="LifecycleHookEnd",e[e.OutputStart=6]="OutputStart",e[e.OutputEnd=7]="OutputEnd",e[e.BootstrapApplicationStart=8]="BootstrapApplicationStart",e[e.BootstrapApplicationEnd=9]="BootstrapApplicationEnd",e[e.BootstrapComponentStart=10]="BootstrapComponentStart",e[e.BootstrapComponentEnd=11]="BootstrapComponentEnd",e[e.ChangeDetectionStart=12]="ChangeDetectionStart",e[e.ChangeDetectionEnd=13]="ChangeDetectionEnd",e[e.ChangeDetectionSyncStart=14]="ChangeDetectionSyncStart",e[e.ChangeDetectionSyncEnd=15]="ChangeDetectionSyncEnd",e[e.AfterRenderHooksStart=16]="AfterRenderHooksStart",e[e.AfterRenderHooksEnd=17]="AfterRenderHooksEnd",e[e.ComponentStart=18]="ComponentStart",e[e.ComponentEnd=19]="ComponentEnd",e[e.DeferBlockStateStart=20]="DeferBlockStateStart",e[e.DeferBlockStateEnd=21]="DeferBlockStateEnd",e[e.DynamicComponentStart=22]="DynamicComponentStart",e[e.DynamicComponentEnd=23]="DynamicComponentEnd",e[e.HostBindingsUpdateStart=24]="HostBindingsUpdateStart",e[e.HostBindingsUpdateEnd=25]="HostBindingsUpdateEnd",e})(A$2||{});function Om$1(e,t,n){let{ngOnChanges:r,ngOnInit:o,ngDoCheck:i}=t.type.prototype;if(r){let s=Rd$1(t);(n.preOrderHooks??=[]).push(e,s),(n.preOrderCheckHooks??=[]).push(e,s);}o&&(n.preOrderHooks??=[]).push(0-e,o),i&&((n.preOrderHooks??=[]).push(e,i),(n.preOrderCheckHooks??=[]).push(e,i));}function Od$1(e,t){for(let n=t.directiveStart,r=t.directiveEnd;n<r;n++){let i=e.data[n].type.prototype,{ngAfterContentInit:s,ngAfterContentChecked:a,ngAfterViewInit:c,ngAfterViewChecked:l,ngOnDestroy:u}=i;s&&(e.contentHooks??=[]).push(-n,s),a&&((e.contentHooks??=[]).push(n,a),(e.contentCheckHooks??=[]).push(n,a)),c&&(e.viewHooks??=[]).push(-n,c),l&&((e.viewHooks??=[]).push(n,l),(e.viewCheckHooks??=[]).push(n,l)),u!=null&&(e.destroyHooks??=[]).push(n,u);}}function Qo$1(e,t,n){Pd$1(e,t,3,n);}function Zo$1(e,t,n,r){(e[C$1]&3)===n&&Pd$1(e,t,n,r);}function aa(e,t){let n=e[C$1];(n&3)===t&&(n&=16383,n+=1,e[C$1]=n);}function Pd$1(e,t,n,r){let o=r!==void 0?e[Ot$3]&65535:0,i=r??-1,s=t.length-1,a=0;for(let c=o;c<s;c++)if(typeof t[c+1]=="number"){if(a=t[c],r!=null&&a>=r)break}else t[c]<0&&(e[Ot$3]+=65536),(a<i||i==-1)&&(Pm$1(e,n,t,c),e[Ot$3]=(e[Ot$3]&4294901760)+c+2),c++;}function Uu(e,t){R$3(A$2.LifecycleHookStart,e,t);let n=v$1(null);try{t.call(e);}finally{v$1(n),R$3(A$2.LifecycleHookEnd,e,t);}}function Pm$1(e,t,n,r){let o=n[r]<0,i=n[r+1],s=o?-n[r]:n[r],a=e[s];o?e[C$1]>>14<e[Ot$3]>>16&&(e[C$1]&3)===t&&(e[C$1]+=16384,Uu(a,i)):Uu(a,i);}var Cn$3=-1,Ut$4=class Ut{factory;name;injectImpl;resolving=false;canSeeViewProviders;multi;componentProviders;index;providerFactory;constructor(t,n,r,o){this.factory=t,this.name=o,this.canSeeViewProviders=n,this.injectImpl=r;}};function Lm$1(e){return (e.flags&8)!==0}function Fm$1(e){return (e.flags&16)!==0}function jm$1(e,t,n){let r=0;for(;r<n.length;){let o=n[r];if(typeof o=="number"){if(o!==0)break;r++;let i=n[r++],s=n[r++],a=n[r++];e.setAttribute(t,s,a,i);}else {let i=o,s=n[++r];Vm$1(i)?e.setProperty(t,i,s):e.setAttribute(t,i,s),r++;}}return r}function Ld$1(e){return e===3||e===4||e===6}function Vm$1(e){return e.charCodeAt(0)===64}function bn$2(e,t){if(!(t===null||t.length===0))if(e===null||e.length===0)e=t.slice();else {let n=-1;for(let r=0;r<t.length;r++){let o=t[r];typeof o=="number"?n=o:n===0||(n===-1||n===2?Wu(e,n,o,null,t[++r]):Wu(e,n,o,null,null));}}return e}function Wu(e,t,n,r,o){let i=0,s=e.length;if(t===-1)s=-1;else for(;i<e.length;){let a=e[i++];if(typeof a=="number"){if(a===t){s=-1;break}else if(a>t){s=i-1;break}}}for(;i<e.length;){let a=e[i];if(typeof a=="number")break;if(a===n){o!==null&&(e[i+1]=o);return}i++,o!==null&&i++;}s!==-1&&(e.splice(s,0,t),i=s+1),e.splice(i++,0,n),o!==null&&e.splice(i++,0,o);}function Fd$1(e){return e!==Cn$3}function ei$2(e){return e&32767}function Hm$1(e){return e>>16}function ti$4(e,t){let n=Hm$1(e),r=t;for(;n>0;)r=r[kt$4],n--;return r}var Da=true;function ni$3(e){let t=Da;return Da=e,t}var Bm$1=256,jd$1=Bm$1-1,Vd$1=5,$m$1=0,He$4={};function Um$1(e,t,n){let r;typeof n=="string"?r=n.charCodeAt(0)||0:n.hasOwnProperty(At$2)&&(r=n[At$2]),r==null&&(r=n[At$2]=$m$1++);let o=r&jd$1,i=1<<o;t.data[e+(o>>Vd$1)]|=i;}function ri$3(e,t){let n=Hd$1(e,t);if(n!==-1)return n;let r=t[m$1];r.firstCreatePass&&(e.injectorIndex=t.length,ca(r.data,e),ca(t,null),ca(r.blueprint,null));let o=nc$2(e,t),i=e.injectorIndex;if(Fd$1(o)){let s=ei$2(o),a=ti$4(o,t),c=a[m$1].data;for(let l=0;l<8;l++)t[i+l]=a[s+l]|c[s+l];}return t[i+8]=o,i}function ca(e,t){e.push(0,0,0,0,0,0,0,0,t);}function Hd$1(e,t){return e.injectorIndex===-1||e.parent&&e.parent.injectorIndex===e.injectorIndex||t[e.injectorIndex+8]===null?-1:e.injectorIndex}function nc$2(e,t){if(e.parent&&e.parent.injectorIndex!==-1)return e.parent.injectorIndex;let n=0,r=null,o=t;for(;o!==null;){if(r=qd$1(o),r===null)return Cn$3;if(n++,o=o[kt$4],r.injectorIndex!==-1)return r.injectorIndex|n<<16}return Cn$3}function wa(e,t,n){Um$1(e,t,n);}function Wm$1(e,t){if(t==="class")return e.classes;if(t==="style")return e.styles;let n=e.attrs;if(n){let r=n.length,o=0;for(;o<r;){let i=n[o];if(Ld$1(i))break;if(i===0)o=o+2;else if(typeof i=="number")for(o++;o<r&&typeof n[o]=="string";)o++;else {if(i===t)return n[o+1];o=o+2;}}}return null}function Bd$1(e,t,n){if(n&8||e!==void 0)return e;wo$1();}function $d$1(e,t,n,r){if(n&8&&r===void 0&&(r=null),(n&3)===0){let o=e[J],i=ee$1(void 0);try{return o?o.get(t,r,n&8):Ms$2(t,r,n&8)}finally{ee$1(i);}}return Bd$1(r,t,n)}function Ud$1(e,t,n,r=0,o){if(e!==null){if(t[C$1]&2048&&!(r&2)){let s=Zm$1(e,t,n,r,He$4);if(s!==He$4)return s}let i=Wd$1(e,t,n,r,He$4);if(i!==He$4)return i}return $d$1(t,n,r,o)}function Wd$1(e,t,n,r,o){let i=Gm$1(n);if(typeof i=="function"){if(!Js$1(t,e,r))return r&1?Bd$1(o,n,r):$d$1(t,n,r,o);try{let s;if(s=i(r),s==null&&!(r&8))wo$1(n);else return s}finally{Xs$1();}}else if(typeof i=="number"){let s=null,a=Hd$1(e,t),c=Cn$3,l=r&1?t[te$1][K$1]:null;for((a===-1||r&4)&&(c=a===-1?nc$2(e,t):t[a+8],c===Cn$3||!Gu(r,false)?a=-1:(s=t[m$1],a=ei$2(c),t=ti$4(c,t)));a!==-1;){let u=t[m$1];if(qu(i,a,u.data)){let d=qm$1(a,t,n,s,r,l);if(d!==He$4)return d}c=t[a+8],c!==Cn$3&&Gu(r,t[m$1].data[a+8]===l)&&qu(i,a,t)?(s=u,a=ei$2(c),t=ti$4(c,t)):a=-1;}}return o}function qm$1(e,t,n,r,o,i){let s=t[m$1],a=s.data[e+8],c=r==null?Ye$5(a)&&Da:r!=s&&(a.type&3)!==0,l=o&1&&i===a,u=Yo$1(a,s,n,c,l);return u!==null?yr$3(t,s,u,a,o):He$4}function Yo$1(e,t,n,r,o){let i=e.providerIndexes,s=t.data,a=i&1048575,c=e.directiveStart,l=e.directiveEnd,u=i>>20,d=r?a:a+u,p=o?a+u:l;for(let f=d;f<p;f++){let h=s[f];if(f<c&&n===h||f>=c&&h.type===n)return f}if(o){let f=s[c];if(f&&je$4(f)&&f.type===n)return c}return null}function yr$3(e,t,n,r,o){let i=e[n],s=t.data;if(i instanceof Ut$4){let a=i;if(a.resolving)throw _s$2();let c=ni$3(a.canSeeViewProviders);a.resolving=true;s[n].type||s[n];let d=a.injectImpl?ee$1(a.injectImpl):null;Js$1(e,r,0);try{i=e[n]=a.factory(void 0,o,s,e,r),t.firstCreatePass&&n>=r.directiveStart&&Om$1(n,s[n],t);}finally{d!==null&&ee$1(d),ni$3(c),a.resolving=false,Xs$1();}}return i}function Gm$1(e){if(typeof e=="string")return e.charCodeAt(0)||0;let t=e.hasOwnProperty(At$2)?e[At$2]:void 0;return typeof t=="number"?t>=0?t&jd$1:zm$1:t}function qu(e,t,n){let r=1<<e;return !!(n[t+(e>>Vd$1)]&r)}function Gu(e,t){return !(e&2)&&!(e&1&&t)}var pt$4=class pt{_tNode;_lView;constructor(t,n){this._tNode=t,this._lView=n;}get(t,n,r){return Ud$1(this._tNode,this._lView,t,St$6(r),n)}};function zm$1(){return new pt$4(B$1(),y$1())}function Qm$1(e){return br$3(()=>{let t=e.prototype.constructor,n=t[zn$2]||Ta(t),r=Object.prototype,o=Object.getPrototypeOf(e.prototype).constructor;for(;o&&o!==r;){let i=o[zn$2]||Ta(o);if(i&&i!==n)return i;o=Object.getPrototypeOf(o);}return i=>new i})}function Ta(e){return Is$1(e)?()=>{let t=Ta(z$3(e));return t&&t()}:rt$2(e)}function Zm$1(e,t,n,r,o){let i=e,s=t;for(;i!==null&&s!==null&&s[C$1]&2048&&!En$3(s);){let a=Wd$1(i,s,n,r|2,He$4);if(a!==He$4)return a;let c=i.parent;if(!c){let l=s[Os$2];if(l){let u=l.get(n,He$4,r&-5);if(u!==He$4)return u}c=qd$1(s),s=s[kt$4];}i=c;}return o}function qd$1(e){let t=e[m$1],n=t.type;return n===2?t.declTNode:n===1?e[K$1]:null}function Gd$1(e){return Wm$1(B$1(),e)}var Ym$1=()=>(typeof requestIdleCallback<"u"?requestIdleCallback:e=>setTimeout(e)).bind(globalThis),Km=()=>(typeof requestIdleCallback<"u"?cancelIdleCallback:clearTimeout).bind(globalThis),zd$1=new N$3("",{factory:()=>new Ca$1});var Ca$1=class Ca{requestIdleCallback=Ym$1();cancelIdleCallback=Km();requestOnIdle(t,n){return this.requestIdleCallback(t,n)}cancelOnIdle(t){return this.cancelIdleCallback(t)}};function _r$3(e){return {token:e.token,providedIn:e.autoProvided===false?null:"root",factory:e.factory,value:void 0}}function Jm$1(){return xn$3(B$1(),y$1())}function xn$3(e,t){return new Mr$2(pe$2(e,t))}var Mr$2=(()=>{class e{nativeElement;constructor(n){this.nativeElement=n;}static __NG_ELEMENT_ID__=Jm$1}return e})();function Qd$1(e){return e instanceof Mr$2?e.nativeElement:e}function Xm$1(){return this._results[Symbol.iterator]()}var oi$3=class oi{_emitDistinctChangesOnly;dirty=true;_onDirty=void 0;_results=[];_changesDetected=false;_changes=void 0;length=0;first=void 0;last=void 0;get changes(){return this._changes??=new ie$1}constructor(t=false){this._emitDistinctChangesOnly=t;}get(t){return this._results[t]}map(t){return this._results.map(t)}filter(t){return this._results.filter(t)}find(t){return this._results.find(t)}reduce(t,n){return this._results.reduce(t,n)}forEach(t){this._results.forEach(t);}some(t){return this._results.some(t)}toArray(){return this._results.slice()}toString(){return this._results.toString()}reset(t,n){this.dirty=false;let r=Xl$1(t);(this._changesDetected=!Jl$1(this._results,r,n))&&(this._results=r,this.length=r.length,this.last=r[this.length-1],this.first=r[0]);}notifyOnChanges(){this._changes!==void 0&&(this._changesDetected||!this._emitDistinctChangesOnly)&&this._changes.next(this);}onDirty(t){this._onDirty=t;}setDirty(){this.dirty=true,this._onDirty?.();}destroy(){this._changes!==void 0&&(this._changes.complete(),this._changes.unsubscribe());}[Symbol.iterator]=Xm$1};function Zd$1(e){return (e.flags&128)===128}var rc$1=(function(e){return e[e.OnPush=0]="OnPush",e[e.Eager=1]="Eager",e[e.Default=1]="Default",e})(rc$1||{}),Yd$1=new Map,ey=0;function ty(){return ey++}function ny(e){Yd$1.set(e[Le$2],e);}function ba(e){Yd$1.delete(e[Le$2]);}var zu="__ngContext__";function _n$3(e,t){Ze$4(t)?(e[zu]=t[Le$2],ny(t)):e[zu]=t;}function Kd$1(e){return Xd$1(e[vn$2])}function Jd$1(e){return Xd$1(e[ue])}function Xd$1(e){for(;e!==null&&!de(e);)e=e[ue];return e}var _a;function ry(e){_a=e;}function ef(){if(_a!==void 0)return _a;if(typeof document<"u")return document;throw new M$2(210,false)}var tf="r";var oc$1="di",ic$2="s";var nf=false,rf=new N$3("",{factory:()=>nf});var of=new N$3("");var Qu=new WeakMap;function oy(e,t){if(e==null||typeof e!="object")return;let n=Qu.get(e);n||(n=new WeakSet,Qu.set(e,n)),n.add(t);}var sf=new N$3("");function Ii$1(e){return (e.flags&32)===32}var ay=()=>null;function af(e,t,n=false){return ay()}function sc$1(e){return e.get(of,false,{optional:true})}function cf(e,t){let n=e.contentQueries;if(n!==null){let r=v$1(null);try{for(let o=0;o<n.length;o+=2){let i=n[o],s=n[o+1];if(s!==-1){let a=e.data[s];cr$4(i),a.contentQueries(2,t[s],s);}}}finally{v$1(r);}}}function Ma(e,t,n){cr$4(0);let r=v$1(null);try{t(e,n);}finally{v$1(r);}}function ac$1(e,t,n){if(Ps$1(t)){let r=v$1(null);try{let o=t.directiveStart,i=t.directiveEnd;for(let s=o;s<i;s++){let a=e.data[s];if(a.contentQueries){let c=n[s];a.contentQueries(1,c,s);}}}finally{v$1(r);}}}var Wt$3=(function(e){return e[e.Emulated=0]="Emulated",e[e.None=2]="None",e[e.ShadowDom=3]="ShadowDom",e[e.ExperimentalIsolatedShadowDom=4]="ExperimentalIsolatedShadowDom",e})(Wt$3||{});var Wo$1;function cy(){if(Wo$1===void 0&&(Wo$1=null,Oe$2.trustedTypes))try{Wo$1=Oe$2.trustedTypes.createPolicy("angular",{createHTML:e=>e,createScript:e=>e,createScriptURL:e=>e});}catch{}return Wo$1}function Ei$2(e){return cy()?.createHTML(e)||e}var qo$2;function ly(){if(qo$2===void 0&&(qo$2=null,Oe$2.trustedTypes))try{qo$2=Oe$2.trustedTypes.createPolicy("angular#unsafe-bypass",{createHTML:e=>e,createScript:e=>e,createScriptURL:e=>e});}catch{}return qo$2}function Zu(e){return ly()?.createScriptURL(e)||e}var Ke$2=class Ke{changingThisBreaksApplicationSecurity;constructor(t){this.changingThisBreaksApplicationSecurity=t;}toString(){return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${mo$1})`}},Sa=class extends Ke$2{getTypeName(){return "HTML"}},Na=class extends Ke$2{getTypeName(){return "Style"}},xa=class extends Ke$2{getTypeName(){return "Script"}},Aa=class extends Ke$2{getTypeName(){return "URL"}},Ra=class extends Ke$2{getTypeName(){return "ResourceURL"}};function Sr$2(e){return e instanceof Ke$2?e.changingThisBreaksApplicationSecurity:e}function cc$1(e,t){let n=lf(e);if(n!=null&&n!==t){if(n==="ResourceURL"&&t==="URL")return  true;throw new Error(`Required a safe ${t}, got a ${n} (see ${mo$1})`)}return n===t}function lf(e){return e instanceof Ke$2&&e.getTypeName()||null}function uy(e){return new Sa(e)}function dy(e){return new Na(e)}function fy(e){return new xa(e)}function py(e){return new Aa(e)}function hy(e){return new Ra(e)}function gy(e){let t=new Oa(e);return my()?new ka(t):t}var ka=class{inertDocumentHelper;constructor(t){this.inertDocumentHelper=t;}getInertBodyElement(t){t="<body><remove></remove>"+t;try{let n=new window.DOMParser().parseFromString(Ei$2(t),"text/html").body;return n===null?this.inertDocumentHelper.getInertBodyElement(t):(n.firstChild?.remove(),n)}catch{return null}}},Oa=class{defaultDoc;inertDocument;constructor(t){this.defaultDoc=t,this.inertDocument=this.defaultDoc.implementation.createHTMLDocument("sanitization-inert");}getInertBodyElement(t){let n=this.inertDocument.createElement("template");return n.innerHTML=Ei$2(t),n}};function my(){try{return !!new window.DOMParser().parseFromString(Ei$2(""),"text/html")}catch{return  false}}var yy=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;function lc$1(e){return e=String(e),e.match(yy)?e:"unsafe:"+e}function Je$3(e){let t={};for(let n of e.split(","))t[n]=true;return t}function Nr$1(...e){let t={};for(let n of e)for(let r in n)n.hasOwnProperty(r)&&(t[r]=true);return t}var uf=Je$3("area,br,col,hr,img,wbr"),df=Je$3("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),ff=Je$3("rp,rt"),vy=Nr$1(ff,df),Iy=Nr$1(df,Je$3("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul")),Ey=Nr$1(ff,Je$3("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video")),Yu$1=Nr$1(uf,Iy,Ey,vy),pf=Je$3("background,cite,href,itemtype,longdesc,poster,src,xlink:href"),Dy=Je$3("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width"),wy=Je$3("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext"),Ty=Nr$1(pf,Dy,wy),Cy=Je$3("script,style,template"),Pa=class{sanitizedSomething=false;buf=[];sanitizeChildren(t){let n=t.firstChild,r=true,o=[];for(;n;){if(n.nodeType===Node.ELEMENT_NODE?r=this.startElement(n):n.nodeType===Node.TEXT_NODE?this.chars(n.nodeValue):this.sanitizedSomething=true,r&&n.firstChild){o.push(n),n=My(n);continue}for(;n;){n.nodeType===Node.ELEMENT_NODE&&this.endElement(n);let i=_y(n);if(i){n=i;break}n=o.pop();}}return this.buf.join("")}startElement(t){let n=Ku(t).toLowerCase();if(!Yu$1.hasOwnProperty(n))return this.sanitizedSomething=true,!Cy.hasOwnProperty(n);this.buf.push("<"),this.buf.push(n);let r=t.attributes;for(let o=0;o<r.length;o++){let i=r.item(o),s=i.name,a=s.toLowerCase();if(!Ty.hasOwnProperty(a)){this.sanitizedSomething=true;continue}let c=i.value;pf[a]&&(c=lc$1(c)),this.buf.push(" ",s,'="',Ju(c),'"');}return this.buf.push(">"),true}endElement(t){let n=Ku(t).toLowerCase();Yu$1.hasOwnProperty(n)&&!uf.hasOwnProperty(n)&&(this.buf.push("</"),this.buf.push(n),this.buf.push(">"));}chars(t){this.buf.push(Ju(t));}};function by(e,t){return (e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY)!==Node.DOCUMENT_POSITION_CONTAINED_BY}function _y(e){let t=e.nextSibling;if(t&&e!==t.previousSibling)throw hf(t);return t}function My(e){let t=e.firstChild;if(t&&by(e,t))throw hf(t);return t}function Ku(e){let t=e.nodeName;return typeof t=="string"?t:"FORM"}function hf(e){return new Error(`Failed to sanitize html because the element is clobbered: ${e.outerHTML}`)}var Sy=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,Ny=/([^\#-~ |!])/g;function Ju(e){return e.replace(/&/g,"&amp;").replace(Sy,function(t){let n=t.charCodeAt(0),r=t.charCodeAt(1);return "&#"+((n-55296)*1024+(r-56320)+65536)+";"}).replace(Ny,function(t){return "&#"+t.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}var Go$1;function xy(e,t){let n=null;try{Go$1=Go$1||gy(e);let r=t?String(t):"";n=Go$1.getInertBodyElement(r);let o=5,i=r;do{if(o===0)throw new Error("Failed to sanitize html because the input is unstable");o--,r=i,i=n.innerHTML,n=Go$1.getInertBodyElement(r);}while(r!==i);let a=new Pa().sanitizeChildren(Xu$1(n)||n);return Ei$2(a)}finally{if(n){let r=Xu$1(n)||n;for(;r.firstChild;)r.firstChild.remove();}}}function Xu$1(e){return "content"in e&&Ay(e)?e.content:null}function Ay(e){return e.nodeType===Node.ELEMENT_NODE&&e.nodeName==="TEMPLATE"}var Ry=/^>|^->|<!--|-->|--!>|<!-$/g,ky=/(<|>)/g,Oy="\u200B$1\u200B";function Py(e){return e.replace(Ry,t=>t.replace(ky,Oy))}function Ly(e,t){return e.createText(t)}function Fy(e,t,n){e.setValue(t,n);}function jy(e,t){return e.createComment(Py(t))}function gf(e,t,n){return e.createElement(t,n)}function ii$3(e,t,n,r,o){e.insertBefore(t,n,r,o);}function mf(e,t,n){e.appendChild(t,n);}function ed$1(e,t,n,r,o){r!==null?ii$3(e,t,n,r,o):mf(e,t,n);}function yf(e,t,n,r){e.removeChild(null,t,n,r);}function Vy(e,t,n){e.setAttribute(t,"style",n);}function Hy(e,t,n){n===""?e.removeAttribute(t,"class"):e.setAttribute(t,"class",n);}function vf(e,t,n){let{mergedAttrs:r,classes:o,styles:i}=n;r!==null&&jm$1(e,t,r),o!==null&&Hy(e,t,o),i!==null&&Vy(e,t,i);}var Di$2=(function(e){return e[e.NONE=0]="NONE",e[e.HTML=1]="HTML",e[e.STYLE=2]="STYLE",e[e.SCRIPT=3]="SCRIPT",e[e.URL=4]="URL",e[e.RESOURCE_URL=5]="RESOURCE_URL",e[e.ATTRIBUTE_NO_BINDING=6]="ATTRIBUTE_NO_BINDING",e})(Di$2||{});function If(e){let t=Df();return t?t.sanitize(Di$2.URL,e)||"":cc$1(e,"URL")?Sr$2(e):lc$1(Qe$3(e))}function Ef(e){let t=Df();if(t)return Zu(t.sanitize(Di$2.RESOURCE_URL,e)||"");if(cc$1(e,"ResourceURL"))return Zu(Sr$2(e));throw new M$2(904,false)}var By={embed:{src:true},frame:{src:true},iframe:{src:true},media:{src:true},base:{href:true},link:{href:true},object:{data:true,codebase:true}};function $y(e,t){return By[e.toLowerCase()]?.[t.toLowerCase()]===true?Ef:If}function Uy(e,t,n){return $y(t,n)(e)}function Df(){let e=y$1();return e&&e[Te$3].sanitizer}function Wy(e){return e instanceof Function?e():e}function qy(e,t,n){let r=e.length;for(;;){let o=e.indexOf(t,n);if(o===-1)return o;if(o===0||e.charCodeAt(o-1)<=32){let i=t.length;if(o+i===r||e.charCodeAt(o+i)<=32)return o}n=o+1;}}var wf="ng-template";function Gy(e,t,n,r){let o=0;if(r){for(;o<t.length&&typeof t[o]=="string";o+=2)if(t[o]==="class"&&qy(t[o+1].toLowerCase(),n,0)!==-1)return  true}else if(uc$1(e))return  false;if(o=t.indexOf(1,o),o>-1){let i;for(;++o<t.length&&typeof(i=t[o])=="string";)if(i.toLowerCase()===n)return  true}return  false}function uc$1(e){return e.type===4&&e.value!==wf}function zy(e,t,n){let r=e.type===4&&!n?wf:e.value;return t===r}function Qy(e,t,n){let r=4,o=e.attrs,i=o!==null?Ky(o):0,s=false;for(let a=0;a<t.length;a++){let c=t[a];if(typeof c=="number"){if(!s&&!Ce$3(r)&&!Ce$3(c))return  false;if(s&&Ce$3(c))continue;s=false,r=c|r&1;continue}if(!s)if(r&4){if(r=2|r&1,c!==""&&!zy(e,c,n)||c===""&&t.length===1){if(Ce$3(r))return  false;s=true;}}else if(r&8){if(o===null||!Gy(e,o,c,n)){if(Ce$3(r))return  false;s=true;}}else {let l=t[++a],u=Zy(c,o,uc$1(e),n);if(u===-1){if(Ce$3(r))return  false;s=true;continue}if(l!==""){let d;if(u>i?d="":d=o[u+1].toLowerCase(),r&2&&l!==d){if(Ce$3(r))return  false;s=true;}}}}return Ce$3(r)||s}function Ce$3(e){return (e&1)===0}function Zy(e,t,n,r){if(t===null)return  -1;let o=0;if(r||!n){let i=false;for(;o<t.length;){let s=t[o];if(s===e)return o;if(s===3||s===6)i=true;else if(s===1||s===2){let a=t[++o];for(;typeof a=="string";)a=t[++o];continue}else {if(s===4)break;if(s===0){o+=4;continue}}o+=i?1:2;}return  -1}else return Jy(t,e)}function Tf(e,t,n=false){for(let r=0;r<t.length;r++)if(Qy(e,t[r],n))return  true;return  false}function Yy(e){let t=e.attrs;if(t!=null){let n=t.indexOf(5);if((n&1)===0)return t[n+1]}return null}function Ky(e){for(let t=0;t<e.length;t++){let n=e[t];if(Ld$1(n))return t}return e.length}function Jy(e,t){let n=e.indexOf(4);if(n>-1)for(n++;n<e.length;){let r=e[n];if(typeof r=="number")return  -1;if(r===t)return n;n++;}return  -1}function Xy(e,t){e:for(let n=0;n<t.length;n++){let r=t[n];if(e.length===r.length){for(let o=0;o<e.length;o++)if(e[o]!==r[o])continue e;return  true}}return  false}function td$1(e,t){return e?":not("+t.trim()+")":t}function ev(e){let t=e[0],n=1,r=2,o="",i=false;for(;n<e.length;){let s=e[n];if(typeof s=="string")if(r&2){let a=e[++n];o+="["+s+(a.length>0?'="'+a+'"':"")+"]";}else r&8?o+="."+s:r&4&&(o+=" "+s);else o!==""&&!Ce$3(s)&&(t+=td$1(i,o),o=""),r=s,i=i||!Ce$3(r);n++;}return o!==""&&(t+=td$1(i,o)),t}function tv(e){return e.map(ev).join(",")}function nv(e){let t=[],n=[],r=1,o=2;for(;r<e.length;){let i=e[r];if(typeof i=="string")o===2?i!==""&&t.push(i,e[++r]):o===8&&n.push(i);else {if(!Ce$3(o))break;o=i;}r++;}return n.length&&t.push(1,...n),t}var Q$2={},si$3=(function(e){return e[e.Important=1]="Important",e[e.DashCase=2]="DashCase",e})(si$3||{}),rv;function dc$1(e,t){return rv(e,t)}typeof document<"u"&&typeof document?.documentElement?.getAnimations=="function";var La=new WeakMap,hr$3=new WeakSet;function ov(e,t){let n=La.get(e);if(!n||n.length===0)return;let r=t.parentNode,o=t.previousSibling;for(let i=n.length-1;i>=0;i--){let s=n[i],a=s.parentNode;s===t?(n.splice(i,1),hr$3.add(s),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:true}}))):(o&&s===o||a&&r&&a!==r)&&(n.splice(i,1),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:true}})),s.parentNode?.removeChild(s));}}function iv(e,t){let n=La.get(e);n?n.includes(t)||n.push(t):La.set(e,[t]);}var Mn$3=new Set,wi$2=(function(e){return e[e.CHANGE_DETECTION=0]="CHANGE_DETECTION",e[e.AFTER_NEXT_RENDER=1]="AFTER_NEXT_RENDER",e})(wi$2||{}),Yt$1=new N$3(""),nd$1=new Set;function Be$3(e){nd$1.has(e)||(nd$1.add(e),performance?.mark?.("mark_feature_usage",{detail:{feature:e}}));}var Ti$1=(()=>{class e{impl=null;execute(){this.impl?.execute();}static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new e})}return e})(),fc$1=[0,1,2,3],pc$2=(()=>{class e{ngZone=T$2(De$3);scheduler=T$2(Re$4);errorHandler=T$2(ze$2,{optional:true});sequences=new Set;deferredRegistrations=new Set;executing=false;constructor(){T$2(Yt$1,{optional:true});}execute(){let n=this.sequences.size>0;n&&R$3(A$2.AfterRenderHooksStart),this.executing=true;for(let r of fc$1)for(let o of this.sequences)if(!(o.erroredOrDestroyed||!o.hooks[r]))try{o.pipelinedValue=this.ngZone.runOutsideAngular(()=>this.maybeTrace(()=>{let i=o.hooks[r];return i(o.pipelinedValue)},o.snapshot));}catch(i){o.erroredOrDestroyed=true,this.errorHandler?.handleError(i);}this.executing=false;for(let r of this.sequences)r.afterRun(),r.once&&(this.sequences.delete(r),r.destroy());for(let r of this.deferredRegistrations)this.sequences.add(r);this.deferredRegistrations.size>0&&this.scheduler.notify(7),this.deferredRegistrations.clear(),n&&R$3(A$2.AfterRenderHooksEnd);}register(n){let{view:r}=n;r!==void 0?((r[Pt$3]??=[]).push(n),Ft$4(r),r[C$1]|=8192):this.executing?this.deferredRegistrations.add(n):this.addSequence(n);}addSequence(n){this.sequences.add(n),this.scheduler.notify(7);}unregister(n){this.executing&&this.sequences.has(n)?(n.erroredOrDestroyed=true,n.pipelinedValue=void 0,n.once=true):(this.sequences.delete(n),this.deferredRegistrations.delete(n));}maybeTrace(n,r){return r?r.run(wi$2.AFTER_NEXT_RENDER,n):n()}static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new e})}return e})(),vr$2=class vr{impl;hooks;view;once;snapshot;erroredOrDestroyed=false;pipelinedValue=void 0;unregisterOnDestroy;constructor(t,n,r,o,i,s=null){this.impl=t,this.hooks=n,this.view=r,this.once=o,this.snapshot=s,this.unregisterOnDestroy=i?.onDestroy(()=>this.destroy());}afterRun(){this.erroredOrDestroyed=false,this.pipelinedValue=void 0,this.snapshot?.dispose(),this.snapshot=null;}destroy(){this.impl.unregister(this),this.unregisterOnDestroy?.();let t=this.view?.[Pt$3];t&&(this.view[Pt$3]=t.filter(n=>n!==this));}};function sv(e,t){let n=t?.injector??T$2(Ee$4);return Be$3("NgAfterNextRender"),cv(e,n,t,true)}function av(e){return e instanceof Function?[void 0,void 0,e,void 0]:[e.earlyRead,e.write,e.mixedReadWrite,e.read]}function cv(e,t,n,r){let o=t.get(Ti$1);o.impl??=t.get(pc$2);let i=t.get(Yt$1,null,{optional:true}),s=n?.manualCleanup!==true?t.get(Ve$4):null,a=t.get(wn$3,null,{optional:true}),c=new vr$2(o.impl,av(e),a?.view,r,s,i?.snapshot(null));return o.impl.register(c),c}var hc$1=new N$3("",{factory:()=>{let e=T$2(se),t=new Set;return e.onDestroy(()=>t.clear()),{queue:t,isScheduled:false,scheduler:null,injector:e}}});function Cf(e,t,n){let r=e.get(hc$1);if(Array.isArray(t))for(let o of t)r.queue.add(o),n?.detachedLeaveAnimationFns?.push(o);else r.queue.add(t),n?.detachedLeaveAnimationFns?.push(t);r.scheduler&&r.scheduler(e);}function lv(e,t){let n=e.get(hc$1);if(Array.isArray(t))for(let r of t)n.queue.delete(r);else n.queue.delete(t);}function uv(e,t){let n=e.get(hc$1);if(t.detachedLeaveAnimationFns){for(let r of t.detachedLeaveAnimationFns)n.queue.delete(r);t.detachedLeaveAnimationFns=void 0;}}function dv(e,t){for(let[n,r]of t)Cf(e,r.animateFns);}function rd$1(e,t,n,r){let o=e?.[Fe$4]?.enter;t!==null&&o&&o.has(n.index)&&dv(r,o);}function od$1(e,t,n,r){try{n.get(tr$3);}catch{return r(false)}let o=e?.[Fe$4];o?.enter?.has(t.index)&&lv(n,o.enter.get(t.index).animateFns);let i=fv(e,t,o);if(i.size===0){let s=false;if(e){let a=[];Ci$1(e,t,a),s=a.length>0;}if(!s)return r(false)}e&&Mn$3.add(e[Le$2]),Cf(n,()=>pv(e,t,o||void 0,i,r),o||void 0);}function fv(e,t,n){let r=new Map,o=n?.leave;if(o&&o.has(t.index)&&r.set(t.index,o.get(t.index)),e&&o)for(let[i,s]of o){if(r.has(i))continue;let c=e[m$1].data[i].parent;for(;c;){if(c===t){r.set(i,s);break}c=c.parent;}}return r}function pv(e,t,n,r,o){let i=[];if(n&&n.leave)for(let[s]of r){if(!n.leave.has(s))continue;let a=n.leave.get(s);for(let c of a.animateFns){let{promise:l}=c();i.push(l);}n.detachedLeaveAnimationFns=void 0;}if(e&&Ci$1(e,t,i),i.length>0){let s=n||e?.[Fe$4];if(s){let a=s.running;a&&i.push(a),s.running=Promise.allSettled(i),gv(e,s.running,o);}else Promise.allSettled(i).then(()=>{e&&Mn$3.delete(e[Le$2]),o(true);});}else e&&Mn$3.delete(e[Le$2]),o(false);}function Ci$1(e,t,n){if(t.type&12){let o=e[t.index];if(de(o))for(let i=F$2;i<o.length;i++){let s=o[i];s[m$1].type===2&&hv(s,n);}}let r=t.child;for(;r;)Ci$1(e,r,n),r=r.next;}function hv(e,t){let n=e[Fe$4];if(n&&n.leave)for(let o of n.leave.values())for(let i of o.animateFns){let{promise:s}=i();t.push(s);}let r=e[m$1].firstChild;for(;r;)Ci$1(e,r,t),r=r.next;}function gv(e,t,n){t.then(()=>{e[Fe$4]?.running===t&&(e[Fe$4].running=void 0,Mn$3.delete(e[Le$2])),n(true);});}function Tn$3(e,t,n,r,o,i,s,a){if(o!=null){let c,l=false;de(o)?c=o:Ze$4(o)&&(l=true,o=o[we$3]);let u=fe$2(o);e===0&&r!==null?(rd$1(a,r,i,n),s==null?mf(t,r,u):ii$3(t,r,u,s||null,true)):e===1&&r!==null?(rd$1(a,r,i,n),ii$3(t,r,u,s||null,true),ov(i,u)):e===2?(a?.[Fe$4]?.leave?.has(i.index)&&iv(i,u),hr$3.delete(u),od$1(a,i,n,d=>{if(hr$3.has(u)){hr$3.delete(u);return}yf(t,u,l,d);})):e===3&&(hr$3.delete(u),od$1(a,i,n,()=>{t.destroyNode(u);})),c!=null&&bv(t,e,n,c,i,r,s);}}function mv(e,t){bf(e,t),t[we$3]=null,t[K$1]=null;}function yv(e,t,n,r,o,i){r[we$3]=o,r[K$1]=t,_i$1(e,r,n,1,o,i);}function bf(e,t){t[Te$3].changeDetectionScheduler?.notify(9),_i$1(e,t,t[L$2],2,null,null);}function vv(e){let t=e[vn$2];if(!t)return la(e[m$1],e);for(;t;){let n=null;if(Ze$4(t))n=t[vn$2];else {let r=t[F$2];r&&(n=r);}if(!n){for(;t&&!t[ue]&&t!==e;)Ze$4(t)&&la(t[m$1],t),t=t[$$2];t===null&&(t=e),Ze$4(t)&&la(t[m$1],t),n=t&&t[ue];}t=n;}}function gc$2(e,t){let n=e[Lt$4],r=n.indexOf(t);n.splice(r,1);}function bi$3(e,t){if(lt$2(t))return;let n=t[L$2];n.destroyNode&&_i$1(e,t,n,3,null,null),vv(t);}function la(e,t){if(lt$2(t))return;let n=v$1(null);try{t[C$1]&=-129,t[C$1]|=256,t[ae]&&nt$2(t[ae]),Ev(e,t),Iv(e,t),t[m$1].type===1&&t[L$2].destroy();let r=t[st$2];if(r!==null&&de(t[$$2])){r!==t[$$2]&&gc$2(r,t);let o=t[Pe$3];o!==null&&o.detachView(e);}ba(t);}finally{v$1(n);}}function Iv(e,t){let n=e.cleanup,r=t[yn$2];if(n!==null)for(let s=0;s<n.length-1;s+=2)if(typeof n[s]=="string"){let a=n[s+3];a>=0?r[a]():r[-a].unsubscribe(),s+=2;}else {let a=r[n[s+1]];n[s].call(a);}r!==null&&(t[yn$2]=null);let o=t[qe$2];if(o!==null){t[qe$2]=null;for(let s=0;s<o.length;s++){let a=o[s];a();}}let i=t[ot$2];if(i!==null){t[ot$2]=null;for(let s of i)s.destroy();}}function Ev(e,t){let n;if(e!=null&&(n=e.destroyHooks)!=null)for(let r=0;r<n.length;r+=2){let o=t[n[r]];if(!(o instanceof Ut$4)){let i=n[r+1];if(Array.isArray(i))for(let s=0;s<i.length;s+=2){let a=o[i[s]],c=i[s+1];R$3(A$2.LifecycleHookStart,a,c);try{c.call(a);}finally{R$3(A$2.LifecycleHookEnd,a,c);}}else {R$3(A$2.LifecycleHookStart,o,i);try{i.call(o);}finally{R$3(A$2.LifecycleHookEnd,o,i);}}}}}function _f(e,t,n){return Dv(e,t.parent,n)}function Dv(e,t,n){let r=t;for(;r!==null&&r.type&168;)t=r,r=t.parent;if(r===null)return n[we$3];if(Ye$5(r)){let{encapsulation:o}=e.data[r.directiveStart+r.componentOffset];if(o===Wt$3.None||o===Wt$3.Emulated)return null}return pe$2(r,n)}function Mf(e,t,n){return Tv(e,t,n)}function wv(e,t,n){return e.type&40?pe$2(e,n):null}var Tv=wv;function mc$1(e,t,n,r){let o=_f(e,r,t),i=t[L$2],s=r.parent||t[K$1],a=Mf(s,r,t);if(o!=null)if(Array.isArray(n))for(let c=0;c<n.length;c++)ed$1(i,o,n[c],a,false);else ed$1(i,o,n,a,false);}function gr$3(e,t){if(t!==null){let n=t.type;if(n&3)return pe$2(t,e);if(n&4)return Fa(-1,e[t.index]);if(n&8){let r=t.child;if(r!==null)return gr$3(e,r);{let o=e[t.index];return de(o)?Fa(-1,o):fe$2(o)}}else {if(n&128)return gr$3(e,t.next);if(n&32)return dc$1(t,e)()||fe$2(e[t.index]);{let r=Sf(e,t);if(r!==null){if(Array.isArray(r))return r[0];let o=Ge$3(e[te$1]);return gr$3(o,r)}else return gr$3(e,t.next)}}}return null}function Sf(e,t){if(t!==null){let r=e[te$1][K$1],o=t.projection;return r.projection[o]}return null}function Fa(e,t){let n=F$2+e+1;if(n<t.length){let r=t[n],o=r[m$1].firstChild;if(o!==null)return gr$3(r,o)}return t[ct$2]}function yc$1(e,t,n,r,o,i,s){for(;n!=null;){let a=r[J];if(n.type===128){n=n.next;continue}let c=r[n.index],l=n.type;if(s&&t===0&&(c&&_n$3(fe$2(c),r),n.flags|=2),!Ii$1(n))if(l&8)yc$1(e,t,n.child,r,o,i,false),Tn$3(t,e,a,o,c,n,i,r);else if(l&32){let u=dc$1(n,r),d;for(;d=u();)Tn$3(t,e,a,o,d,n,i,r);Tn$3(t,e,a,o,c,n,i,r);}else l&16?Nf(e,t,r,n,o,i):Tn$3(t,e,a,o,c,n,i,r);n=s?n.projectionNext:n.next;}}function _i$1(e,t,n,r,o,i){yc$1(n,r,e.firstChild,t,o,i,false);}function Cv(e,t,n){let r=t[L$2],o=_f(e,n,t),i=n.parent||t[K$1],s=Mf(i,n,t);Nf(r,0,t,n,o,s);}function Nf(e,t,n,r,o,i){let s=n[te$1],c=s[K$1].projection[r.projection];if(Array.isArray(c))for(let l=0;l<c.length;l++){let u=c[l];Tn$3(t,e,n[J],o,u,r,i,n);}else {let l=c,u=s[$$2];Zd$1(r)&&(l.flags|=128),yc$1(e,t,l,u,o,i,true);}}function bv(e,t,n,r,o,i,s){let a=r[ct$2],c=fe$2(r);a!==c&&Tn$3(t,e,n,i,a,o,s);for(let l=F$2;l<r.length;l++){let u=r[l];_i$1(u[m$1],u,e,t,i,a);}}function _v(e,t,n,r,o){if(t)o?e.addClass(n,r):e.removeClass(n,r);else {let i=r.indexOf("-")===-1?void 0:si$3.DashCase;o==null?e.removeStyle(n,r,i):(typeof o=="string"&&o.endsWith("!important")&&(o=o.slice(0,-10),i|=si$3.Important),e.setStyle(n,r,o,i));}}function vc$1(e,t,n,r,o,i,s,a,c,l,u){let d=O$3+r,p=d+o,f=Mv(d,p),h=typeof l=="function"?l():l;return f[m$1]={type:e,blueprint:f,template:n,queries:null,viewQuery:a,declTNode:t,data:f.slice().fill(null,d),bindingStartIndex:d,expandoStartIndex:p,hostBindingOpCodes:null,firstCreatePass:true,firstUpdatePass:true,staticViewQueries:false,staticContentQueries:false,preOrderHooks:null,preOrderCheckHooks:null,contentHooks:null,contentCheckHooks:null,viewHooks:null,viewCheckHooks:null,destroyHooks:null,cleanup:null,contentQueries:null,components:null,directiveRegistry:typeof i=="function"?i():i,pipeRegistry:typeof s=="function"?s():s,firstChild:null,schemas:c,consts:h,incompleteFirstPass:false,ssrId:u}}function Mv(e,t){let n=[];for(let r=0;r<t;r++)n.push(r<e?null:Q$2);return n}function Sv(e){let t=e.tView;return t===null||t.incompleteFirstPass?e.tView=vc$1(1,null,e.template,e.decls,e.vars,e.directiveDefs,e.pipeDefs,e.viewQuery,e.schemas,e.consts,e.id):t}function Ic$1(e,t,n,r,o,i,s,a,c,l,u){let d=t.blueprint.slice();return d[we$3]=o,d[C$1]=r|4|128|8|64|1024,(l!==null||e&&e[C$1]&2048)&&(d[C$1]|=2048),js$1(d),d[$$2]=d[kt$4]=e,d[H]=n,d[Te$3]=s||e&&e[Te$3],d[L$2]=a||e&&e[L$2],d[J]=c||e&&e[J]||null,d[K$1]=i,d[Le$2]=ty(),d[Rt$4]=u,d[Os$2]=l,d[te$1]=t.type==2?e[te$1]:d,d}function Nv(e,t,n){let r=pe$2(t,e),o=Sv(n),i=e[Te$3].rendererFactory,s=Ec$1(e,Ic$1(e,o,null,xf(n),r,t,null,i.createRenderer(r,n),null,null,null));return e[t.index]=s}function xf(e){let t=16;return e.signals?t=4096:e.onPush&&(t=64),t}function Af(e,t,n,r){if(n===0)return  -1;let o=t.length;for(let i=0;i<n;i++)t.push(r),e.blueprint.push(r),e.data.push(null);return o}function Ec$1(e,t){return e[vn$2]?e[ks$2][ue]=t:e[vn$2]=t,e[ks$2]=t,t}function xv(e=1){Rf(P$3(),y$1(),ge$3()+e);}function Rf(e,t,n,r){if((t[C$1]&3)===3){let i=e.preOrderCheckHooks;i!==null&&Qo$1(t,i,n);}else {let i=e.preOrderHooks;i!==null&&Zo$1(t,i,0,n);}ut$3(n);}var Mi$2=(function(e){return e[e.None=0]="None",e[e.SignalBased=1]="SignalBased",e[e.HasDecoratorInputTransform=2]="HasDecoratorInputTransform",e})(Mi$2||{});function qt$2(e,t,n,r){let o=v$1(null);try{let[i,s,a]=e.inputs[n],c=null;(s&Mi$2.SignalBased)!==0&&(c=t[i][V]),c!==null&&c.transformFn!==void 0?r=c.transformFn(r):a!==null&&(r=a.call(t,r)),e.setInput!==null?e.setInput(t,c,r,n,i):Ad(t,c,i,r);}finally{v$1(o);}}function kf(e,t,n,r,o){let i=ge$3(),s=r&2;try{ut$3(-1),s&&t.length>O$3&&Rf(e,t,O$3,!1);let a=s?A$2.TemplateUpdateStart:A$2.TemplateCreateStart;R$3(a,o,n),n(r,o);}finally{ut$3(i);let a=s?A$2.TemplateUpdateEnd:A$2.TemplateCreateEnd;R$3(a,o,n);}}function Si$2(e,t,n){Fv(e,t,n),(n.flags&64)===64&&jv(e,t,n);}function xr$2(e,t,n=pe$2){let r=t.localNames;if(r!==null){let o=t.index+1;for(let i=0;i<r.length;i+=2){let s=r[i+1],a=s===-1?n(t,e):e[s];e[o++]=a;}}}function Av(e,t,n,r){let i=r.get(rf,nf)||n===Wt$3.ShadowDom||n===Wt$3.ExperimentalIsolatedShadowDom,s=e.selectRootElement(t,i);if(s.tagName.toLowerCase()==="script")throw new M$2(905,false);return s}function Ov(e){return e==="class"?"className":e==="for"?"htmlFor":e==="formaction"?"formAction":e==="innerHtml"?"innerHTML":e==="readonly"?"readOnly":e==="tabindex"?"tabIndex":e}function Pv(e,t,n,r,o,i){let s=t[m$1];if(bc$1(e,s,t,n,r)){Ye$5(e)&&Lv(t,e.index);return}e.type&3&&(n=Ov(n)),Of(e,t,n,r,o,i);}function Of(e,t,n,r,o,i){if(e.type&3){let s=pe$2(e,t);r=i!=null?i(r,e.value||"",n):r,o.setProperty(s,n,r);}else e.type&12;}function Lv(e,t){let n=he$2(t,e);n[C$1]&16||(n[C$1]|=64);}function Fv(e,t,n){let r=n.directiveStart,o=n.directiveEnd;Ye$5(n)&&Nv(t,n,e.data[r+n.componentOffset]),e.firstCreatePass||ri$3(n,t);let i=n.initialInputs;for(let s=r;s<o;s++){let a=e.data[s],c=yr$3(t,e,s,n);if(_n$3(c,t),i!==null&&$v(t,s-r,c,a,n,i),je$4(a)){let l=he$2(n.index,t);l[H]=yr$3(t,e,s,n);}}}function jv(e,t,n){let r=n.directiveStart,o=n.directiveEnd,i=n.index,s=wu$1();try{ut$3(i);for(let a=r;a<o;a++){let c=e.data[a],l=t[a];Po$2(a),(c.hostBindings!==null||c.hostVars!==0||c.hostAttrs!==null)&&Vv(c,l);}}finally{ut$3(-1),Po$2(s);}}function Vv(e,t){e.hostBindings!==null&&e.hostBindings(1,t);}function Dc$1(e,t){let n=e.directiveRegistry,r=null;if(n)for(let o=0;o<n.length;o++){let i=n[o];Tf(t,i.selectors,false)&&(r??=[],je$4(i)?r.unshift(i):r.push(i));}return r}function Hv(e,t,n,r,o,i){let s=pe$2(e,t);Bv(t[L$2],s,i,e.value,n,r,o);}function Bv(e,t,n,r,o,i,s){if(i==null)s?.(i,r||"",o),e.removeAttribute(t,o,n);else {let a=s==null?Qe$3(i):s(i,r||"",o);e.setAttribute(t,o,a,n);}}function $v(e,t,n,r,o,i){let s=i[t];if(s!==null)for(let a=0;a<s.length;a+=2){let c=s[a],l=s[a+1];qt$2(r,n,c,l);}}function wc$1(e,t,n,r,o){let i=O$3+n,s=t[m$1],a=o(s,t,e,r,n);t[i]=a,jt$5(e,true);let c=e.type===2;return c?(vf(t[L$2],a,e),(hu()===0||In$3(e))&&_n$3(a,t),gu()):_n$3(a,t),Vo$1()&&(!c||!Ii$1(e))&&mc$1(s,t,a,e),e}function Tc$1(e){let t=e;return zs$1()?Qs$2():(t=t.parent,jt$5(t,false)),t}function Cc$1(e,t){let n=e[J];if(!n)return;let r;try{r=n.get(dt$2,null);}catch{r=null;}r?.(t);}function bc$1(e,t,n,r,o){let i=e.inputs?.[r],s=e.hostDirectiveInputs?.[r],a=false;if(s)for(let c=0;c<s.length;c+=2){let l=s[c],u=s[c+1],d=t.data[l];qt$2(d,n[l],u,o),a=true;}if(i)for(let c of i){let l=n[c],u=t.data[c];qt$2(u,l,r,o),a=true;}return a}function Uv(e,t,n,r,o,i){let s=null,a=null,c=null,l=false,u=e.directiveToIndex.get(r.type);if(typeof u=="number"?s=u:[s,a,c]=u,a!==null&&c!==null&&e.hostDirectiveInputs?.hasOwnProperty(o)){let d=e.hostDirectiveInputs[o];for(let p=0;p<d.length;p+=2){let f=d[p];if(f>=a&&f<=c){let h=t.data[f],g=d[p+1];qt$2(h,n[f],g,i),l=true;}else if(f>c)break}}return s!==null&&r.inputs.hasOwnProperty(o)&&(qt$2(r,n[s],o,i),l=true),l}function Wv(e,t){let n=he$2(t,e),r=n[m$1];qv(r,n);let o=n[we$3];o!==null&&n[Rt$4]===null&&(n[Rt$4]=af(o,n[J])),R$3(A$2.ComponentStart);try{_c$1(r,n,n[H]);}finally{R$3(A$2.ComponentEnd,n[H]);}}function qv(e,t){for(let n=t.length;n<e.blueprint.length;n++)t.push(e.blueprint[n]);}function _c$1(e,t,n){Fo$1(t);try{let r=e.viewQuery;r!==null&&Ma(1,r,n);let o=e.template;o!==null&&kf(e,t,o,1,n),e.firstCreatePass&&(e.firstCreatePass=!1),t[Pe$3]?.finishViewCreation(e),e.staticContentQueries&&cf(e,t),e.staticViewQueries&&Ma(2,e.viewQuery,n);let i=e.components;i!==null&&Gv(t,i);}catch(r){throw e.firstCreatePass&&(e.incompleteFirstPass=true,e.firstCreatePass=false),r}finally{t[C$1]&=-5,jo$1();}}function Gv(e,t){for(let n=0;n<t.length;n++)Wv(e,t[n]);}function An$3(e,t,n,r){let o=v$1(null);try{let i=t.tView,a=e[C$1]&4096?4096:16,c=Ic$1(e,i,n,a,null,t,null,null,r?.injector??null,r?.embeddedViewInjector??null,r?.dehydratedView??null),l=e[t.index];c[st$2]=l;let u=e[Pe$3];return u!==null&&(c[Pe$3]=u.createEmbeddedView(i)),_c$1(i,c,n),c}finally{v$1(o);}}function Gt$2(e,t){return !t||t.firstChild===null||Zd$1(e)}function Ir$2(e,t,n,r,o=false){for(;n!==null;){if(n.type===128){n=o?n.projectionNext:n.next;continue}let i=t[n.index];i!==null&&r.push(fe$2(i)),de(i)&&Pf(i,r);let s=n.type;if(s&8)Ir$2(e,t,n.child,r);else if(s&32){let a=dc$1(n,t),c;for(;c=a();)r.push(c);}else if(s&16){let a=Sf(t,n);if(Array.isArray(a))r.push(...a);else {let c=Ge$3(t[te$1]);Ir$2(c[m$1],c,a,r,true);}}n=o?n.projectionNext:n.next;}return r}function Pf(e,t){for(let n=F$2;n<e.length;n++){let r=e[n],o=r[m$1].firstChild;o!==null&&Ir$2(r[m$1],r,o,t);}e[ct$2]!==e[we$3]&&t.push(e[ct$2]);}function Lf(e){if(e[Pt$3]!==null){for(let t of e[Pt$3])t.impl.addSequence(t);e[Pt$3].length=0;}}var Ff=[];function zv(e){return e[ae]??Qv(e)}function Qv(e){let t=Ff.pop()??Object.create(Yv);return t.lView=e,t}function Zv(e){e.lView[ae]!==e&&(e.lView=null,Ff.push(e));}var Yv=s(r({},Xe$4),{consumerIsAlwaysLive:true,kind:"template",consumerMarkedDirty:e=>{Ft$4(e.lView);},consumerOnSignalRead(){this.lView[ae]=this;}});function Kv(e){let t=e[ae]??Object.create(Jv);return t.lView=e,t}var Jv=s(r({},Xe$4),{consumerIsAlwaysLive:true,kind:"template",consumerMarkedDirty:e=>{let t=Ge$3(e.lView);for(;t&&!jf(t[m$1]);)t=Ge$3(t);t&&Ao$1(t);},consumerOnSignalRead(){this.lView[ae]=this;}});function jf(e){return e.type!==2}function Vf(e){if(e[ot$2]===null)return;let t=true;for(;t;){let n=false;for(let r of e[ot$2])r.dirty&&(n=true,r.zone===null||Zone.current===r.zone?r.run():r.zone.run(()=>r.run()));t=n&&!!(e[C$1]&8192);}}var Xv=100;function Hf(e,t=0){let r=e[Te$3].rendererFactory;r.begin?.();try{eI(e,t);}finally{r.end?.();}}function eI(e,t){let n=Ys$1();try{Qn$3(!0),ja(e,t);let r=0;for(;ir$4(e);){if(r===Xv)throw new M$2(103,!1);r++,ja(e,1);}}finally{Qn$3(n);}}function tI(e,t,n,r){if(lt$2(t))return;let o=t[C$1],i=false,s=false;Fo$1(t);let a=true,c=null,l=null;(jf(e)?(l=zv(t),c=$e$3(l)):Lr$2()===null?(a=false,l=Kv(t),c=$e$3(l)):t[ae]&&(nt$2(t[ae]),t[ae]=null));try{js$1(t),Iu(e.bindingStartIndex),n!==null&&kf(e,t,n,2,r);let u=(o&3)===3;if(!i)if(u){let f=e.preOrderCheckHooks;f!==null&&Qo$1(t,f,null);}else {let f=e.preOrderHooks;f!==null&&Zo$1(t,f,0,null),aa(t,0);}if(s||nI(t),Vf(t),Bf(t,0),e.contentQueries!==null&&cf(e,t),!i)if(u){let f=e.contentCheckHooks;f!==null&&Qo$1(t,f);}else {let f=e.contentHooks;f!==null&&Zo$1(t,f,1),aa(t,1);}oI(e,t);let d=e.components;d!==null&&Uf(t,d,0);let p=e.viewQuery;if(p!==null&&Ma(2,p,r),!i)if(u){let f=e.viewCheckHooks;f!==null&&Qo$1(t,f);}else {let f=e.viewHooks;f!==null&&Zo$1(t,f,2),aa(t,2);}if(e.firstUpdatePass===!0&&(e.firstUpdatePass=!1),t[No$1]){for(let f of t[No$1])f();t[No$1]=null;}i||(Lf(t),t[C$1]&=-73);}catch(u){throw Ft$4(t),u}finally{l!==null&&(tt$2(l,c),a&&Zv(l)),jo$1();}}function Bf(e,t){for(let n=Kd$1(e);n!==null;n=Jd$1(n))for(let r=F$2;r<n.length;r++){let o=n[r];$f(o,t);}}function nI(e){for(let t=Kd$1(e);t!==null;t=Jd$1(t)){if(!(t[C$1]&2))continue;let n=t[Lt$4];for(let r=0;r<n.length;r++){let o=n[r];Ao$1(o);}}}function rI(e,t,n){R$3(A$2.ComponentStart);let r=he$2(t,e);try{$f(r,n);}finally{R$3(A$2.ComponentEnd,r[H]);}}function $f(e,t){xo$1(e)&&ja(e,t);}function ja(e,t){let r=e[m$1],o=e[C$1],i=e[ae],s=!!(t===0&&o&16);if(s||=!!(o&64&&t===0),s||=!!(o&1024),s||=!!(i?.dirty&&Xt$1(i)),s||=false,i&&(i.dirty=false),e[C$1]&=-9217,s)tI(r,e,r.template,e[H]);else if(o&8192){let a=v$1(null);try{Vf(e),Bf(e,1);let c=r.components;c!==null&&Uf(e,c,1),Lf(e);}finally{v$1(a);}}}function Uf(e,t,n){for(let r=0;r<t.length;r++)rI(e,t[r],n);}function oI(e,t){let n=e.hostBindingOpCodes;if(n!==null)try{for(let r=0;r<n.length;r++){let o=n[r];if(o<0)ut$3(~o);else {let i=o,s=n[++r],a=n[++r];Du(s,i);let c=t[i];R$3(A$2.HostBindingsUpdateStart,c);try{a(2,c);}finally{R$3(A$2.HostBindingsUpdateEnd,c);}}}}finally{ut$3(-1);}}function Mc$1(e,t){let n=Ys$1()?64:1088;for(e[Te$3].changeDetectionScheduler?.notify(t);e;){e[C$1]|=n;let r=Ge$3(e);if(En$3(e)&&!r)return e;e=r;}return null}function Wf(e,t,n,r){return [e,true,0,t,null,r,null,n,null,null]}function qf(e,t){let n=F$2+t;if(n<e.length)return e[n]}function Rn$3(e,t,n,r=true){let o=t[m$1];if(iI(o,t,e,n),r){let s=Fa(n,e),a=t[L$2],c=a.parentNode(e[ct$2]);c!==null&&yv(o,e[K$1],a,t,c,s);}let i=t[Rt$4];i!==null&&i.firstChild!==null&&(i.firstChild=null);}function Sc$1(e,t){let n=Er$2(e,t);return n!==void 0&&bi$3(n[m$1],n),n}function Er$2(e,t){if(e.length<=F$2)return;let n=F$2+t,r=e[n];if(r){let o=r[st$2];o!==null&&o!==e&&gc$2(o,r),t>0&&(e[n-1][ue]=r[ue]);let i=er$4(e,F$2+t);mv(r[m$1],r);let s=i[Pe$3];s!==null&&s.detachView(i[m$1]),r[$$2]=null,r[ue]=null,r[C$1]&=-129;}return r}function iI(e,t,n,r){let o=F$2+r,i=n.length;r>0&&(n[o-1][ue]=t),r<i-F$2?(t[ue]=n[o],Ss$2(n,F$2+r,t)):(n.push(t),t[ue]=null),t[$$2]=n;let s=t[st$2];s!==null&&n!==s&&Gf(s,t);let a=t[Pe$3];a!==null&&a.insertView(e),Ro$1(t),t[C$1]|=128;}function Gf(e,t){let n=e[Lt$4],r=t[$$2];if(Ze$4(r))e[C$1]|=2;else {let o=r[$$2][te$1];t[te$1]!==o&&(e[C$1]|=2);}n===null?e[Lt$4]=[t]:n.push(t);}var ht$3=class ht{_lView;_cdRefInjectingView;_appRef=null;_attachedToViewContainer=false;exhaustive;get rootNodes(){let t=this._lView,n=t[m$1];return Ir$2(n,t,n.firstChild,[])}constructor(t,n){this._lView=t,this._cdRefInjectingView=n;}get context(){return this._lView[H]}set context(t){this._lView[H]=t;}get destroyed(){return lt$2(this._lView)}destroy(){if(this._appRef)this._appRef.detachView(this);else if(this._attachedToViewContainer){let t=this._lView[$$2];if(de(t)){let n=t[nr$4],r=n?n.indexOf(this):-1;r>-1&&(Er$2(t,r),er$4(n,r));}this._attachedToViewContainer=false;}bi$3(this._lView[m$1],this._lView);}onDestroy(t){sr$3(this._lView,t);}markForCheck(){Mc$1(this._cdRefInjectingView||this._lView,4);}detach(){this._lView[C$1]&=-129;}reattach(){Ro$1(this._lView),this._lView[C$1]|=128;}detectChanges(){this._lView[C$1]|=1024,Hf(this._lView);}checkNoChanges(){}attachToViewContainerRef(){if(this._appRef)throw new M$2(902,false);this._attachedToViewContainer=true;}detachFromAppRef(){this._appRef=null;let t=En$3(this._lView),n=this._lView[st$2];n!==null&&!t&&gc$2(n,this._lView),bf(this._lView[m$1],this._lView);}attachToAppRef(t){if(this._attachedToViewContainer)throw new M$2(902,false);this._appRef=t;let n=En$3(this._lView),r=this._lView[st$2];r!==null&&!n&&Gf(r,this._lView),Ro$1(this._lView);}};var Dr$2=(()=>{class e{_declarationLView;_declarationTContainer;elementRef;static __NG_ELEMENT_ID__=sI;constructor(n,r,o){this._declarationLView=n,this._declarationTContainer=r,this.elementRef=o;}get ssrId(){return this._declarationTContainer.tView?.ssrId||null}createEmbeddedView(n,r){return this.createEmbeddedViewImpl(n,r)}createEmbeddedViewImpl(n,r,o){let i=An$3(this._declarationLView,this._declarationTContainer,n,{embeddedViewInjector:r,dehydratedView:o});return new ht$3(i)}}return e})();function sI(){return Ni$1(B$1(),y$1())}function Ni$1(e,t){return e.type&4?new Dr$2(t,e,xn$3(e,t)):null}function Kt$3(e,t,n,r,o){let i=e.data[t];if(i===null)i=aI(e,t,n,r,o),Eu()&&(i.flags|=32);else if(i.type&64){i.type=n,i.value=r,i.attrs=o;let s=vu$1();i.injectorIndex=s===null?-1:s.injectorIndex;}return jt$5(i,true),i}function aI(e,t,n,r,o){let i=Gs$1(),s=zs$1(),a=s?i:i&&i.parent,c=e.data[t]=lI(e,a,n,t,r,o);return cI(e,c,i,s),c}function cI(e,t,n,r){e.firstChild===null&&(e.firstChild=t),n!==null&&(r?n.child==null&&t.parent!==null&&(n.child=t):n.next===null&&(n.next=t,t.prev=n));}function lI(e,t,n,r,o,i){let s=t?t.injectorIndex:-1,a=0;return Us$1()&&(a|=128),{type:n,index:r,insertBeforeIndex:null,injectorIndex:s,directiveStart:-1,directiveEnd:-1,directiveStylingLast:-1,componentOffset:-1,controlDirectiveIndex:-1,customControlIndex:-1,propertyBindings:null,flags:a,providerIndexes:0,value:o,namespace:ea(),attrs:i,mergedAttrs:null,localNames:null,initialInputs:null,inputs:null,hostDirectiveInputs:null,outputs:null,hostDirectiveOutputs:null,directiveToIndex:null,tView:null,next:null,prev:null,projectionNext:null,child:null,parent:t,projection:null,styles:null,stylesWithoutHost:null,residualStyles:void 0,classes:null,classesWithoutHost:null,residualClasses:void 0,classBindings:0,styleBindings:0}}function uI(e){let t=e[at$3]??[],r=e[$$2][L$2],o=[];for(let i of t)i.data[oc$1]!==void 0?o.push(i):dI(i,r);e[at$3]=o;}function dI(e,t){let n=0,r=e.firstChild;if(r){let o=e.data[tf];for(;n<o;){let i=r.nextSibling;yf(t,r,false),r=i,n++;}}}var fI=()=>null,pI=()=>null;function ai$3(e,t){return fI()}function zf(e,t,n){return pI()}var Qf=class{},wr$1=class wr{},hI=(()=>{class e{destroyNode=null;static __NG_ELEMENT_ID__=()=>gI()}return e})();function gI(){let e=y$1(),t=B$1(),n=he$2(t.index,e);return (Ze$4(n)?n:e)[L$2]}var Zf=(()=>{class e{static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>null})}return e})();function Yf(e){return e.debugInfo?.className||e.type.name||null}var Ko$2={},Bt$3=class Bt{injector;parentInjector;constructor(t,n){this.injector=t,this.parentInjector=n;}get(t,n,r){let o=this.injector.get(t,Ko$2,r);return o!==Ko$2||n===Ko$2?o:this.parentInjector.get(t,n,r)}};function Nc$1(e,t,n){return e[t]=n}function mI(e,t){return e[t]}function me$2(e,t,n){if(n===Q$2)return  false;let r=e[t];return Object.is(r,n)?false:(e[t]=n,true)}function xc$1(e,t,n,r){let o=me$2(e,t,n);return me$2(e,t+1,r)||o}function yI(e,t,n,r,o){let i=xc$1(e,t,n,r);return me$2(e,t+2,o)||i}function $t$2(e,t,n){return function r(o){let i=r.__ngNativeEl__;i!==void 0&&oy(o,i);let s=Ye$5(e)?he$2(e.index,t):t;Mc$1(s,5);let a=t[H],c=sd$1(t,a,n,o),l=r.__ngNextListenerFn__;for(;l;)c=sd$1(t,a,l,o)&&c,l=l.__ngNextListenerFn__;return c}}function sd$1(e,t,n,r){let o=v$1(null);try{return R$3(A$2.OutputStart,t,n),n(r)!==!1}catch(i){return Cc$1(e,i),false}finally{R$3(A$2.OutputEnd,t,n),v$1(o);}}function Ac$1(e,t,n,r,o,i,s,a){let c=In$3(e),l=false,u=null;if(!r&&c&&(u=II(t,n,i,e.index)),u!==null){let d=u.__ngLastListenerFn__||u;d.__ngNextListenerFn__=s,u.__ngLastListenerFn__=s,l=true;}else {let d=pe$2(e,n),p=r?r(d):d;r||(a.__ngNativeEl__=d);let f=o.listen(p,i,a);if(!vI(i)){let h=r?g=>r(fe$2(g[e.index])):e.index;Kf(h,t,n,i,a,f,false);}}return l}function vI(e){return e.startsWith("animation")||e.startsWith("transition")}function II(e,t,n,r){let o=e.cleanup;if(o!=null)for(let i=0;i<o.length-1;i+=2){let s=o[i];if(s===n&&o[i+1]===r){let a=t[yn$2],c=o[i+2];return a&&a.length>c?a[c]:null}typeof s=="string"&&(i+=2);}return null}function Kf(e,t,n,r,o,i,s){let a=t.firstCreatePass?Bs$1(t):null,c=Hs$1(n),l=c.length;c.push(o,i),a&&a.push(r,e,l,(l+1)*(s?-1:1));}function ad$1(e,t,n,r,o){let i=null,s=null,a=null,c=false,l=e.directiveToIndex.get(n.type);if(typeof l=="number"?i=l:[i,s,a]=l,s!==null&&a!==null&&e.hostDirectiveOutputs?.hasOwnProperty(r)){let u=e.hostDirectiveOutputs[r];for(let d=0;d<u.length;d+=2){let p=u[d];if(p>=s&&p<=a)c=true,ci$2(e,t,p,u[d+1],r,o);else if(p>a)break}}return n.outputs.hasOwnProperty(r)&&(c=true,ci$2(e,t,i,r,r,o)),c}function ci$2(e,t,n,r,o,i){let s=t[n],a=t[m$1],l=a.data[n].outputs[r],d=s[l].subscribe(i);Kf(e.index,a,t,o,i,d,true);}function EI(){DI();}function DI(){let e=y$1(),t=P$3(),n=B$1();if(t.firstCreatePass&&CI(t,n),n.controlDirectiveIndex===-1)return;Be$3("NgSignalForms");let r=e[n.controlDirectiveIndex];t.data[n.controlDirectiveIndex].controlDef.create(r,new li$3(e,t,n));}function wI(){TI();}function TI(){let e=y$1(),t=P$3(),n=lr$4();if(n.controlDirectiveIndex===-1)return;let r=t.data[n.controlDirectiveIndex].controlDef,o=e[n.controlDirectiveIndex];r.update(o,new li$3(e,t,n));}var li$3=class li{lView;tView;tNode;hasPassThrough;constructor(t,n,r){this.lView=t,this.tView=n,this.tNode=r,this.hasPassThrough=!!(r.flags&4096);}get customControl(){return this.tNode.customControlIndex!==-1?this.lView[this.tNode.customControlIndex]:void 0}get nativeElement(){return pe$2(this.tNode,this.lView)}get descriptor(){return `<${this.tNode.value}>`}listenToCustomControlOutput(t,n){let r=this.tView.data[this.tNode.customControlIndex];ad$1(this.tNode,this.lView,r,t,$t$2(this.tNode,this.lView,n));}listenToCustomControlModel(t){let n=this.tNode.flags&1024?"valueChange":"checkedChange",r=this.tView.data[this.tNode.customControlIndex];ad$1(this.tNode,this.lView,r,n,$t$2(this.tNode,this.lView,t));}listenToDom(t,n){Ac$1(this.tNode,this.tView,this.lView,void 0,this.lView[L$2],t,n,$t$2(this.tNode,this.lView,n));}setInputOnDirectives(t,n){let r=this.tNode.inputs?.[t],o=this.tNode.hostDirectiveInputs?.[t];if(!r&&!o)return  false;let i=false;if(r)for(let s of r){if(s===this.tNode.controlDirectiveIndex)continue;let a=this.tView.data[s],c=this.lView[s];qt$2(a,c,t,n),i=true;}if(o)for(let s=0;s<o.length;s+=2){let a=o[s];if(a===this.tNode.controlDirectiveIndex)continue;let c=o[s+1],l=this.tView.data[a],u=this.lView[a];qt$2(l,u,c,n),i=true;}return i}setCustomControlModelInput(t){let n=this.tView.data[this.tNode.customControlIndex],r=this.tNode.flags&1024?"value":"checked";Uv(this.tNode,this.tView,this.lView,n,r,t);}customControlHasInput(t){if(this.tNode.customControlIndex===-1)return  false;let n=this.tView.data[this.tNode.customControlIndex];return (n.signalFormsInputPresence??=this._buildCustomControlInputCache(n))[t]===true}_buildCustomControlInputCache(t){let n={};for(let r in t.inputs)n[r]=true;if(t.hostDirectives!==null){let r=[...t.hostDirectives];for(;r.length>0;){let o=r.shift();if(typeof o!="function"){for(let s in o.inputs)n[o.inputs[s]]=true;let i=cd$1(o.directive);i!==null&&r.push(...i);continue}for(let i of o()){if(typeof i=="function")continue;if(i.inputs)for(let a=0;a<i.inputs.length;a+=2){let c=i.inputs[a+1]||i.inputs[a];n[c]=true;}let s=cd$1(i.directive);s!==null&&r.push(...s);}}}return n}};function cd$1(e){return typeof e=="function"&&"\u0275dir"in e?e.\u0275dir.hostDirectives??null:null}function CI(e,t,n){for(let o=t.directiveStart;o<t.directiveEnd;o++)if(e.data[o].controlDef){t.controlDirectiveIndex=o;break}if(t.controlDirectiveIndex===-1)return;let r=e.data[t.controlDirectiveIndex].controlDef;if(r.passThroughInput&&(t.inputs?.[r.passThroughInput]?.length??0)>1){t.flags|=4096;return}bI(e,t);}function bI(e,t){for(let n=t.directiveStart;n<t.directiveEnd;n++){let r=e.data[n];if(!(t.directiveToIndex&&!t.directiveToIndex.has(r.type))){if(ld$1(r,"value")){t.flags|=1024,t.customControlIndex=n;return}if(ld$1(r,"checked")){t.flags|=2048,t.customControlIndex=n;return}}}if(t.hostDirectiveInputs!==null&&t.hostDirectiveOutputs!==null&&t.directiveToIndex!==null){let n=(r,o)=>{let i=t.hostDirectiveInputs[r],s=t.hostDirectiveOutputs[r+"Change"];if(!i||!s)return  false;for(let a=0;a<i.length;a+=2){let c=i[a];for(let l=0;l<s.length;l+=2){let u=s[l];if(c===u)for(let d of t.directiveToIndex.values()){if(!Array.isArray(d))continue;let[p,f,h]=d;if(c>=f&&c<=h)return t.flags|=o,t.customControlIndex=p,true}}}return  false};if(n("value",1024)||n("checked",2048))return}}function ld$1(e,t){return _I(e,t)&&MI(e,t+"Change")}function _I(e,t){return t in e.inputs}function MI(e,t){return t in e.outputs}var Va=Symbol("BINDING");var Jf=new N$3("");function ui$2(e,t,n){let r=n?e.styles:null,o=n?e.classes:null,i=0;if(t!==null)for(let s=0;s<t.length;s++){let a=t[s];if(typeof a=="number")i=a;else if(i==1)o=yo$1(o,a);else if(i==2){let c=a,l=t[++s];r=yo$1(r,c+": "+l+";");}}n?e.styles=r:e.stylesWithoutHost=r,n?e.classes=o:e.classesWithoutHost=o;}function Ar$2(e,t=0){let n=y$1();if(n===null)return Ae$4(e,t);let r=B$1();return Ud$1(r,n,z$3(e),t)}function SI(){let e="invalid";throw new Error(e)}function Xf(e,t,n,r,o){let i=r===null?null:{"":-1},s=o(e,n);if(s!==null){let a=s,c=null,l=null;for(let u of s)if(u.resolveHostDirectives!==null){[a,c,l]=u.resolveHostDirectives(s);break}AI(e,t,n,a,i,c,l);}i!==null&&r!==null&&NI(n,r,i);}function NI(e,t,n){let r=e.localNames=[];for(let o=0;o<t.length;o+=2){let i=n[t[o+1]];if(i==null)throw new M$2(-301,false);r.push(t[o],i);}}function xI(e,t,n){t.componentOffset=n,(e.components??=[]).push(t.index);}function AI(e,t,n,r,o,i,s){let a=r.length,c=null;for(let p=0;p<a;p++){let f=r[p];c===null&&je$4(f)&&(c=f,xI(e,n,p)),wa(ri$3(n,t),e,f.type);}FI(n,e.data.length,a),c?.viewProvidersResolver&&c.viewProvidersResolver(c);for(let p=0;p<a;p++){let f=r[p];f.providersResolver&&f.providersResolver(f);}let l=false,u=false,d=Af(e,t,a,null);a>0&&(n.directiveToIndex=new Map);for(let p=0;p<a;p++){let f=r[p];if(n.mergedAttrs=bn$2(n.mergedAttrs,f.hostAttrs),kI(e,n,t,d,f),LI(d,f,o),s!==null&&s.has(f)){let[g,D]=s.get(f);n.directiveToIndex.set(f.type,[d,g+n.directiveStart,D+n.directiveStart]);}else (i===null||!i.has(f))&&n.directiveToIndex.set(f.type,d);f.contentQueries!==null&&(n.flags|=4),(f.hostBindings!==null||f.hostAttrs!==null||f.hostVars!==0)&&(n.flags|=64);let h=f.type.prototype;!l&&(h.ngOnChanges||h.ngOnInit||h.ngDoCheck)&&((e.preOrderHooks??=[]).push(n.index),l=true),!u&&(h.ngOnChanges||h.ngDoCheck)&&((e.preOrderCheckHooks??=[]).push(n.index),u=true),d++;}RI(e,n,i);}function RI(e,t,n){for(let r=t.directiveStart;r<t.directiveEnd;r++){let o=e.data[r];if(n===null||!n.has(o))ud$1(0,t,o,r),ud$1(1,t,o,r),fd$1(t,r,false);else {let i=n.get(o);dd$1(0,t,i,r),dd$1(1,t,i,r),fd$1(t,r,true);}}}function ud$1(e,t,n,r){let o=e===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s;e===0?s=t.inputs??={}:s=t.outputs??={},s[i]??=[],s[i].push(r),ep(t,i);}}function dd$1(e,t,n,r){let o=e===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s=o[i],a;e===0?a=t.hostDirectiveInputs??={}:a=t.hostDirectiveOutputs??={},a[s]??=[],a[s].push(r,i),ep(t,s);}}function ep(e,t){t==="class"?e.flags|=8:t==="style"&&(e.flags|=16);}function fd$1(e,t,n){let{attrs:r,inputs:o,hostDirectiveInputs:i}=e;if(r===null||!n&&o===null||n&&i===null||uc$1(e)){e.initialInputs??=[],e.initialInputs.push(null);return}let s=null,a=0;for(;a<r.length;){let c=r[a];if(c===0){a+=4;continue}else if(c===5){a+=2;continue}else if(typeof c=="number")break;if(!n&&o.hasOwnProperty(c)){let l=o[c];for(let u of l)if(u===t){s??=[],s.push(c,r[a+1]);break}}else if(n&&i.hasOwnProperty(c)){let l=i[c];for(let u=0;u<l.length;u+=2)if(l[u]===t){s??=[],s.push(l[u+1],r[a+1]);break}}a+=2;}e.initialInputs??=[],e.initialInputs.push(s);}function kI(e,t,n,r,o){e.data[r]=o;let i=o.factory||(o.factory=rt$2(o.type)),s=new Ut$4(i,je$4(o),Ar$2,null);e.blueprint[r]=s,n[r]=s,OI(e,t,r,Af(e,n,o.hostVars,Q$2),o);}function OI(e,t,n,r,o){let i=o.hostBindings;if(i){let s=e.hostBindingOpCodes;s===null&&(s=e.hostBindingOpCodes=[]);let a=~t.index;PI(s)!=a&&s.push(a),s.push(n,r,i);}}function PI(e){let t=e.length;for(;t>0;){let n=e[--t];if(typeof n=="number"&&n<0)return n}return 0}function LI(e,t,n){if(n){if(t.exportAs)for(let r=0;r<t.exportAs.length;r++)n[t.exportAs[r]]=e;je$4(t)&&(n[""]=e);}}function FI(e,t,n){e.flags|=1,e.directiveStart=t,e.directiveEnd=t+n,e.providerIndexes=t;}function Rc$1(e,t,n,r,o,i,s,a){let c=t[m$1],l=c.consts,u=ce(l,s),d=Kt$3(c,e,n,r,u);return Xf(c,t,d,ce(l,a),o),d.mergedAttrs=bn$2(d.mergedAttrs,d.attrs),d.attrs!==null&&ui$2(d,d.attrs,false),d.mergedAttrs!==null&&ui$2(d,d.mergedAttrs,true),c.queries!==null&&c.queries.elementStart(c,d),d}function kc$1(e,t){Od$1(e,t),Ps$1(t)&&e.queries.elementEnd(t);}function jI(e,t,n,r,o,i){let s=t.consts,a=ce(s,o),c=Kt$3(t,e,n,r,a);if(c.mergedAttrs=bn$2(c.mergedAttrs,c.attrs),i!=null){let l=ce(s,i);c.localNames=[];for(let u=0;u<l.length;u+=2)c.localNames.push(l[u],-1);}return c.attrs!==null&&ui$2(c,c.attrs,false),c.mergedAttrs!==null&&ui$2(c,c.mergedAttrs,true),t.queries!==null&&t.queries.elementStart(t,c),c}var tp=typeof ShadowRoot<"u",VI=typeof Document<"u";function HI(e){return Object.keys(e).map(t=>{let[n,r,o]=e[t],i={propName:n,templateName:t,isSignal:(r&Mi$2.SignalBased)!==0};return o&&(i.transform=o),i})}function BI(e){return Object.keys(e).map(t=>({propName:e[t],templateName:t}))}function $I(e,t,n){let r=t instanceof se?t:t?.injector;return r&&e.getStandaloneInjector!==null&&(r=e.getStandaloneInjector(r)||r),r?new Bt$3(n,r):n}function UI(e){let t=e.get(wr$1,null);if(t===null)throw new M$2(407,false);let n=e.get(Zf,null),r=e.get(Re$4,null),o=e.get(Yt$1,null,{optional:true});return {rendererFactory:t,sanitizer:n,changeDetectionScheduler:r,ngReflect:false,tracingService:o}}function WI(e,t){let n=np(e);return gf(t,n,n==="svg"?Ls$2:n==="math"?lu:null)}function np(e){return (e.selectors[0][0]||"div").toLowerCase()}var zt$3=class zt{componentDef;ngModule;selector;componentType;ngContentSelectors;isBoundToModule;cachedInputs=null;cachedOutputs=null;get inputs(){return this.cachedInputs??=HI(this.componentDef.inputs),this.cachedInputs}get outputs(){return this.cachedOutputs??=BI(this.componentDef.outputs),this.cachedOutputs}constructor(t,n){this.componentDef=t,this.ngModule=n,this.componentType=t.type,this.selector=tv(t.selectors),this.ngContentSelectors=t.ngContentSelectors??[],this.isBoundToModule=!!n;}create(t,n,r,o,i,s){R$3(A$2.DynamicComponentStart);let a=v$1(null);try{let c=this.componentDef,l=$I(c,o||this.ngModule,t),u=UI(l),d=u.tracingService;return d&&d.componentCreate?d.componentCreate(Yf(c),()=>this.createComponentRef(u,l,n,r,i,s)):this.createComponentRef(u,l,n,r,i,s)}finally{v$1(a);}}createComponentRef(t,n,r,o,i,s){let a=this.componentDef,c=qI(o,a,s,i),l=t.rendererFactory.createRenderer(null,a),u=o?Av(l,o,a.encapsulation,n):WI(a,l),d=n.get(Jf,null),p=GI(u,()=>n.get(dr$3,null)??ef());d&&d.addHost(p);let f=s?.some(pd)||i?.some(D=>typeof D!="function"&&D.bindings.some(pd)),h=Ic$1(null,c,null,512|xf(a),null,null,t,l,n,null,af(u,n,true));d&&tp&&p instanceof ShadowRoot&&sr$3(h,()=>{d.removeHost(p);}),h[O$3]=u,Fo$1(h);let g=null;try{let D=Rc$1(O$3,h,2,"#host",()=>c.directiveRegistry,!0,0);vf(l,u,D),_n$3(u,h),Si$2(c,h,D),ac$1(c,D,h),kc$1(c,D),r!==void 0&&QI(D,this.ngContentSelectors,r),g=he$2(D.index,h),h[H]=g[H],_c$1(c,h,null);}catch(D){throw g!==null&&ba(g),ba(h),D}finally{R$3(A$2.DynamicComponentEnd),jo$1();}return new di$2(this.componentType,h,!!f)}};function qI(e,t,n,r){let o=e?["ng-version","22.0.1"]:nv(t.selectors[0]),i=null,s=null,a=0;if(n)for(let u of n)a+=u[Va].requiredVars,u.create&&(u.targetIdx=0,(i??=[]).push(u)),u.update&&(u.targetIdx=0,(s??=[]).push(u));if(r)for(let u=0;u<r.length;u++){let d=r[u];if(typeof d!="function")for(let p of d.bindings){a+=p[Va].requiredVars;let f=u+1;p.create&&(p.targetIdx=f,(i??=[]).push(p)),p.update&&(p.targetIdx=f,(s??=[]).push(p));}}let c=[t];if(r)for(let u of r){let d=typeof u=="function"?u:u.type,p=Eo$1(d);c.push(p);}return vc$1(0,null,zI(i,s),1,a,c,null,null,null,[o],null)}function GI(e,t){let n=e.getRootNode?.();return VI&&n instanceof Document?n.head:n&&tp&&n instanceof ShadowRoot?n:t().head}function zI(e,t){return !e&&!t?null:n=>{if(n&1&&e)for(let r of e)r.create();if(n&2&&t)for(let r of t)r.update();}}function pd(e){let t=e[Va].kind;return t==="input"||t==="twoWay"}var di$2=class di extends Qf{_rootLView;_hasInputBindings;instance;hostView;changeDetectorRef;componentType;location;previousInputValues=null;_tNode;constructor(t,n,r){super(),this._rootLView=n,this._hasInputBindings=r,this._tNode=Dn$3(n[m$1],O$3),this.location=xn$3(this._tNode,n),this.instance=he$2(this._tNode.index,n)[H],this.hostView=this.changeDetectorRef=new ht$3(n,void 0),this.componentType=t;}setInput(t,n){this._hasInputBindings;let r=this._tNode;if(this.previousInputValues??=new Map,this.previousInputValues.has(t)&&Object.is(this.previousInputValues.get(t),n))return;let o=this._rootLView;bc$1(r,o[m$1],o,t,n);this.previousInputValues.set(t,n);let s=he$2(r.index,o);Mc$1(s,1);}get injector(){return new pt$4(this._tNode,this._rootLView)}destroy(){this.hostView.destroy();}onDestroy(t){this.hostView.onDestroy(t);}};function QI(e,t,n){let r=e.projection=[];for(let o=0;o<t.length;o++){let i=n[o];r.push(i!=null&&i.length?Array.from(i):null);}}var xi$2=(()=>{class e{static __NG_ELEMENT_ID__=ZI}return e})();function ZI(){let e=B$1();return rp(e,y$1())}var Ha=class e extends xi$2{_lContainer;_hostTNode;_hostLView;constructor(t,n,r){super(),this._lContainer=t,this._hostTNode=n,this._hostLView=r;}get element(){return xn$3(this._hostTNode,this._hostLView)}get injector(){return new pt$4(this._hostTNode,this._hostLView)}get parentInjector(){let t=nc$2(this._hostTNode,this._hostLView);if(Fd$1(t)){let n=ti$4(t,this._hostLView),r=ei$2(t),o=n[m$1].data[r+8];return new pt$4(o,n)}else return new pt$4(null,this._hostLView)}clear(){for(;this.length>0;)this.remove(this.length-1);}get(t){let n=hd$1(this._lContainer);return n!==null&&n[t]||null}get length(){return this._lContainer.length-F$2}createEmbeddedView(t,n,r){let o,i;typeof r=="number"?o=r:r!=null&&(o=r.index,i=r.injector);let s=ai$3(this._lContainer,t.ssrId),a=t.createEmbeddedViewImpl(n||{},i,s);return this.insertImpl(a,o,Gt$2(this._hostTNode,s)),a}createComponent(t,n,r,o,i,s,a){let c,l=n||{};c=l.index,r=l.injector,o=l.projectableNodes,i=l.environmentInjector||l.ngModuleRef,s=l.directives,a=l.bindings;let u=new zt$3(ke$3(t)),d=r||this.parentInjector;if(!i&&u.ngModule==null){let _=this.parentInjector.get(se,null);_&&(i=_);}let p=ke$3(u.componentType??{}),f=ai$3(this._lContainer,p?.id??null),h=null,g=u.create(d,o,h,i,s,a);return this.insertImpl(g.hostView,c,Gt$2(this._hostTNode,f)),g}insert(t,n){return this.insertImpl(t,n,true)}insertImpl(t,n,r){let o=t._lView;if(du(o)){let a=this.indexOf(t);if(a!==-1)this.detach(a);else {let c=o[$$2],l=new e(c,c[K$1],c[$$2]);l.detach(l.indexOf(t));}}let i=this._adjustIndex(n),s=this._lContainer;return Rn$3(s,o,i,r),t.attachToViewContainerRef(),Ss$2(ua(s),i,t),t}move(t,n){return this.insert(t,n)}indexOf(t){let n=hd$1(this._lContainer);return n!==null?n.indexOf(t):-1}remove(t){let n=this._adjustIndex(t,-1),r=Er$2(this._lContainer,n);r&&(er$4(ua(this._lContainer),n),bi$3(r[m$1],r));}detach(t){let n=this._adjustIndex(t,-1),r=Er$2(this._lContainer,n);return r&&er$4(ua(this._lContainer),n)!=null?new ht$3(r):null}_adjustIndex(t,n=0){return t??this.length+n}};function hd$1(e){return e[nr$4]}function ua(e){return e[nr$4]||(e[nr$4]=[])}function rp(e,t){let n,r=t[e.index];return de(r)?n=r:(n=Wf(r,t,null,e),t[e.index]=n,Ec$1(t,n)),KI(n,t,e,r),new Ha(n,e,t)}function YI(e,t){let n=e[L$2],r=n.createComment(""),o=pe$2(t,e),i=n.parentNode(o);return ii$3(n,i,r,n.nextSibling(o),false),r}var KI=XI;function XI(e,t,n,r){if(e[ct$2])return;let o;n.type&8?o=fe$2(r):o=YI(t,n),e[ct$2]=o;}var Ba=class e{queryList;matches=null;constructor(t){this.queryList=t;}clone(){return new e(this.queryList)}setDirty(){this.queryList.setDirty();}},$a=class e{queries;constructor(t=[]){this.queries=t;}createEmbeddedView(t){let n=t.queries;if(n!==null){let r=t.contentQueries!==null?t.contentQueries[0]:n.length,o=[];for(let i=0;i<r;i++){let s=n.getByIndex(i),a=this.queries[s.indexInDeclarationView];o.push(a.clone());}return new e(o)}return null}insertView(t){this.dirtyQueriesWithMatches(t);}detachView(t){this.dirtyQueriesWithMatches(t);}finishViewCreation(t){this.dirtyQueriesWithMatches(t);}dirtyQueriesWithMatches(t){for(let n=0;n<this.queries.length;n++)Pc$1(t,n).matches!==null&&this.queries[n].setDirty();}},fi$2=class fi{flags;read;predicate;constructor(t,n,r=null){this.flags=n,this.read=r,typeof t=="string"?this.predicate=oE(t):this.predicate=t;}},Ua=class e{queries;constructor(t=[]){this.queries=t;}elementStart(t,n){for(let r=0;r<this.queries.length;r++)this.queries[r].elementStart(t,n);}elementEnd(t){for(let n=0;n<this.queries.length;n++)this.queries[n].elementEnd(t);}embeddedTView(t){let n=null;for(let r=0;r<this.length;r++){let o=n!==null?n.length:0,i=this.getByIndex(r).embeddedTView(t,o);i&&(i.indexInDeclarationView=r,n!==null?n.push(i):n=[i]);}return n!==null?new e(n):null}template(t,n){for(let r=0;r<this.queries.length;r++)this.queries[r].template(t,n);}getByIndex(t){return this.queries[t]}get length(){return this.queries.length}track(t){this.queries.push(t);}},Wa=class e{metadata;matches=null;indexInDeclarationView=-1;crossesNgTemplate=false;_declarationNodeIndex;_appliesToNextNode=true;constructor(t,n=-1){this.metadata=t,this._declarationNodeIndex=n;}elementStart(t,n){this.isApplyingToNode(n)&&this.matchTNode(t,n);}elementEnd(t){this._declarationNodeIndex===t.index&&(this._appliesToNextNode=false);}template(t,n){this.elementStart(t,n);}embeddedTView(t,n){return this.isApplyingToNode(t)?(this.crossesNgTemplate=true,this.addMatch(-t.index,n),new e(this.metadata)):null}isApplyingToNode(t){if(this._appliesToNextNode&&(this.metadata.flags&1)!==1){let n=this._declarationNodeIndex,r=t.parent;for(;r!==null&&r.type&8&&r.index!==n;)r=r.parent;return n===(r!==null?r.index:-1)}return this._appliesToNextNode}matchTNode(t,n){let r=this.metadata.predicate;if(Array.isArray(r))for(let o=0;o<r.length;o++){let i=r[o];this.matchTNodeWithReadOption(t,n,eE(n,i)),this.matchTNodeWithReadOption(t,n,Yo$1(n,t,i,false,false));}else r===Dr$2?n.type&4&&this.matchTNodeWithReadOption(t,n,-1):this.matchTNodeWithReadOption(t,n,Yo$1(n,t,r,false,false));}matchTNodeWithReadOption(t,n,r){if(r!==null){let o=this.metadata.read;if(o!==null)if(o===Mr$2||o===xi$2||o===Dr$2&&n.type&4)this.addMatch(n.index,-2);else {let i=Yo$1(n,t,o,false,false);i!==null&&this.addMatch(n.index,i);}else this.addMatch(n.index,r);}}addMatch(t,n){this.matches===null?this.matches=[t,n]:this.matches.push(t,n);}};function eE(e,t){let n=e.localNames;if(n!==null){for(let r=0;r<n.length;r+=2)if(n[r]===t)return n[r+1]}return null}function tE(e,t){return e.type&11?xn$3(e,t):e.type&4?Ni$1(e,t):null}function nE(e,t,n,r){return n===-1?tE(t,e):n===-2?rE(e,t,r):yr$3(e,e[m$1],n,t)}function rE(e,t,n){if(n===Mr$2)return xn$3(t,e);if(n===Dr$2)return Ni$1(t,e);if(n===xi$2)return rp(t,e)}function ip(e,t,n,r){let o=t[Pe$3].queries[r];if(o.matches===null){let i=e.data,s=n.matches,a=[];for(let c=0;s!==null&&c<s.length;c+=2){let l=s[c];if(l<0)a.push(null);else {let u=i[l];a.push(nE(t,u,s[c+1],n.metadata.read));}}o.matches=a;}return o.matches}function qa(e,t,n,r){let o=e.queries.getByIndex(n),i=o.matches;if(i!==null){let s=ip(e,t,o,n);for(let a=0;a<i.length;a+=2){let c=i[a];if(c>0)r.push(s[a/2]);else {let l=i[a+1],u=t[-c];for(let d=F$2;d<u.length;d++){let p=u[d];p[st$2]===p[$$2]&&qa(p[m$1],p,l,r);}if(u[Lt$4]!==null){let d=u[Lt$4];for(let p=0;p<d.length;p++){let f=d[p];qa(f[m$1],f,l,r);}}}}}return r}function Oc$1(e,t){return e[Pe$3].queries[t].queryList}function sp(e,t,n){let r=new oi$3((n&4)===4);return pu(e,t,r,r.destroy),(t[Pe$3]??=new $a).queries.push(new Ba(r))-1}function ap(e,t,n){let r=P$3();return r.firstCreatePass&&(lp(r,new fi$2(e,t,n),-1),(t&2)===2&&(r.staticViewQueries=true)),sp(r,y$1(),t)}function cp(e,t,n,r){let o=P$3();if(o.firstCreatePass){let i=B$1();lp(o,new fi$2(t,n,r),i.index),iE(o,e),(n&2)===2&&(o.staticContentQueries=true);}return sp(o,y$1(),n)}function oE(e){return e.split(",").map(t=>t.trim())}function lp(e,t,n){e.queries===null&&(e.queries=new Ua),e.queries.track(new Wa(t,n));}function iE(e,t){let n=e.contentQueries||(e.contentQueries=[]),r=n.length?n[n.length-1]:-1;t!==r&&n.push(e.queries.length-1,t);}function Pc$1(e,t){return e.queries.getByIndex(t)}function up(e,t){let n=e[m$1],r=Pc$1(n,t);return r.crossesNgTemplate?qa(n,e,t,[]):ip(n,e,r,t)}function dp(e,t,n){let r,o=jn$3(()=>{r._dirtyCounter();let i=sE(r,e);if(t&&i===void 0)throw new M$2(-951,false);return i});return r=o[V],r._dirtyCounter=Ho$1(0),r._flatValue=void 0,o}function Lc$1(e){return dp(true,false)}function Fc$1(e){return dp(true,true)}function fp(e,t){let n=e[V];n._lView=y$1(),n._queryIndex=t,n._queryList=Oc$1(n._lView,t),n._queryList.onDirty(()=>n._dirtyCounter.update(r=>r+1));}function sE(e,t){let n=e._lView,r=e._queryIndex;if(n===void 0||r===void 0||n[C$1]&4)return t?void 0:Y$2;let o=Oc$1(n,r),i=up(n,r);return o.reset(i,Qd$1),t?o.first:o._changesDetected||e._flatValue===void 0?e._flatValue=o.toArray():e._flatValue}function jc$1(e){return !!e&&typeof e.then=="function"}function pp(e){return !!e&&typeof e.subscribe=="function"}var Sn$3=class Sn{},hp=class{};var pi$2=class pi extends Sn$3{ngModuleType;_parent;_bootstrapComponents=[];_r3Injector;instance;destroyCbs=[];constructor(t,n,r,o=true){super(),this.ngModuleType=t,this._parent=n;let i=Ql$1(t);this._bootstrapComponents=Wy(i.bootstrap),this._r3Injector=ta(t,n,[{provide:Sn$3,useValue:this},...r],Jn$3(t),new Set(["environment"])),o&&this.resolveInjectorInitializers();}resolveInjectorInitializers(){this._r3Injector.resolveInjectorInitializers(),this.instance=this._r3Injector.get(this.ngModuleType);}get injector(){return this._r3Injector}destroy(){let t=this._r3Injector;!t.destroyed&&t.destroy(),this.destroyCbs.forEach(n=>n()),this.destroyCbs=null;}onDestroy(t){this.destroyCbs.push(t);}},hi$2=class hi extends hp{moduleType;constructor(t){super(),this.moduleType=t;}create(t){return new pi$2(this.moduleType,t,[])}};var Tr$2=class Tr extends Sn$3{injector;instance=null;constructor(t){super();let n=new xt$3([...t.providers,{provide:Sn$3,useValue:this}],t.parent||mn$3(),t.debugName,new Set(["environment"]));this.injector=n,t.runEnvironmentInitializers&&n.resolveInjectorInitializers();}destroy(){this.injector.destroy();}onDestroy(t){this.injector.onDestroy(t);}};function Vc$1(e,t,n=null){return new Tr$2({providers:e,parent:t,debugName:n,runEnvironmentInitializers:true}).injector}var aE=(()=>{class e{_injector;cachedInjectors=new Map;constructor(n){this._injector=n;}getOrCreateStandaloneInjector(n){if(!n.standalone)return null;if(!this.cachedInjectors.has(n)){let r=Mo$1(false,n.type),o=r.length>0?Vc$1([r],this._injector,""):null;this.cachedInjectors.set(n,o);}return this.cachedInjectors.get(n)}ngOnDestroy(){try{for(let n of this.cachedInjectors.values())n!==null&&n.destroy();}finally{this.cachedInjectors.clear();}}static \u0275prov=re$2({token:e,providedIn:"environment",factory:()=>new e(Ae$4(se))})}return e})();function cE(e){return br$3(()=>{let t=gp(e),n=s(r({},t),{type:e.type,decls:e.decls,vars:e.vars,template:e.template,consts:e.consts||null,ngContentSelectors:e.ngContentSelectors,onPush:e.changeDetection!==rc$1.Eager,directiveDefs:null,pipeDefs:null,dependencies:t.standalone&&e.dependencies||null,getStandaloneInjector:t.standalone?o=>o.get(aE).getOrCreateStandaloneInjector(n):null,getExternalStyles:null,signals:e.signals??false,data:e.data||{},encapsulation:e.encapsulation||Wt$3.Emulated,styles:e.styles||Y$2,_:null,schemas:e.schemas||null,tView:null,id:""});t.standalone&&Be$3("NgStandalone"),mp(n);let r$1=e.dependencies;return n.directiveDefs=gd$1(r$1,lE),n.pipeDefs=gd$1(r$1,bs$2),n.id=gE(n),n})}function lE(e){return ke$3(e)||Eo$1(e)}function uE(e){return br$3(()=>({type:e.type,bootstrap:e.bootstrap||Y$2,declarations:e.declarations||Y$2,imports:e.imports||Y$2,exports:e.exports||Y$2,transitiveCompileScopes:null,schemas:e.schemas||null,id:e.id||null}))}function dE(e,t){if(e==null)return it$2;let n={};for(let r in e)if(e.hasOwnProperty(r)){let o=e[r],i,s,a,c;Array.isArray(o)?(a=o[0],i=o[1],s=o[2]??i,c=o[3]||null):(i=o,s=o,a=Mi$2.None,c=null),n[i]=[r,a,c],t[i]=s;}return n}function fE(e){if(e==null)return it$2;let t={};for(let n in e)e.hasOwnProperty(n)&&(t[e[n]]=n);return t}function pE(e){return br$3(()=>{let t=gp(e);return mp(t),t})}function hE(e){return {type:e.type,name:e.name,factory:null,pure:e.pure!==false,standalone:e.standalone??true,onDestroy:e.type.prototype.ngOnDestroy||null}}function gp(e){let t={};return {type:e.type,providersResolver:null,viewProvidersResolver:null,factory:null,hostBindings:e.hostBindings||null,hostVars:e.hostVars||0,hostAttrs:e.hostAttrs||null,contentQueries:e.contentQueries||null,declaredInputs:t,inputConfig:e.inputs||it$2,exportAs:e.exportAs||null,standalone:e.standalone??true,signals:e.signals===true,selectors:e.selectors||Y$2,viewQuery:e.viewQuery||null,features:e.features||null,setInput:null,resolveHostDirectives:null,hostDirectives:null,controlDef:null,signalFormsInputPresence:null,inputs:dE(e.inputs,t),outputs:fE(e.outputs),debugInfo:null}}function mp(e){e.features?.forEach(t=>t(e));}function gd$1(e,t){return e?()=>{let n=typeof e=="function"?e():e,r=[];for(let o of n){let i=t(o);i!==null&&r.push(i);}return r}:null}function gE(e){let t=0,n=typeof e.consts=="function"?"":e.consts,r=[e.selectors,e.ngContentSelectors,e.hostVars,e.hostAttrs,n,e.vars,e.decls,e.encapsulation,e.standalone,e.signals,e.exportAs,JSON.stringify(e.inputs),JSON.stringify(e.outputs),Object.getOwnPropertyNames(e.type.prototype),!!e.contentQueries,!!e.viewQuery];for(let i of r.join("|"))t=Math.imul(31,t)+i.charCodeAt(0)<<0;return t+=2147483648,"c"+t}var yp=new N$3("");var Hc$1=(()=>{class e{resolve;reject;initialized=false;done=false;donePromise=new Promise((n,r)=>{this.resolve=n,this.reject=r;});appInits=T$2(yp,{optional:true})??[];injector=T$2(Ee$4);constructor(){}runInitializers(){if(this.initialized)return;let n=[];for(let o of this.appInits){let i=So$1(this.injector,o);if(jc$1(i))n.push(i);else if(pp(i)){let s=new Promise((a,c)=>{i.subscribe({complete:a,error:c});});n.push(s);}}let r=()=>{this.done=true,this.resolve();};Promise.all(n).then(()=>{r();}).catch(o=>{this.reject(o);}),n.length===0&&r(),this.initialized=true;}static \u0275fac=function(r){return new(r||e)};static \u0275prov=_r$3({token:e,factory:e.\u0275fac})}return e})();function mE(e){return t=>{t.controlDef={create:(n,r)=>{n?.\u0275ngControlCreate(r);},update:(n,r)=>{n?.\u0275ngControlUpdate?.(r);},passThroughInput:e};}}function yE(e){return Object.getPrototypeOf(e.prototype).constructor}function vp(e){let t=yE(e.type),n=true,r=[e];for(;t;){let o;if(je$4(e))o=t.\u0275cmp||t.\u0275dir;else {if(t.\u0275cmp)throw new M$2(903,false);o=t.\u0275dir;}if(o){if(n){r.push(o);let s=e;s.inputs=da(e.inputs),s.declaredInputs=da(e.declaredInputs),s.outputs=da(e.outputs);let a=o.hostBindings;a&&wE(e,a);let c=o.viewQuery,l=o.contentQueries;if(c&&EE(e,c),l&&DE(e,l),vE(e,o),Gl$1(e.outputs,o.outputs),je$4(o)&&o.data.animation){let u=e.data;u.animation=(u.animation||[]).concat(o.data.animation);}}let i=o.features;if(i)for(let s=0;s<i.length;s++){let a=i[s];a&&a.ngInherit&&a(e),a===vp&&(n=false);}}t=Object.getPrototypeOf(t);}IE(r);}function vE(e,t){for(let n in t.inputs){if(!t.inputs.hasOwnProperty(n)||e.inputs.hasOwnProperty(n))continue;let r=t.inputs[n];r!==void 0&&(e.inputs[n]=r,e.declaredInputs[n]=t.declaredInputs[n]);}}function IE(e){let t=0,n=null;for(let r=e.length-1;r>=0;r--){let o=e[r];o.hostVars=t+=o.hostVars,o.hostAttrs=bn$2(o.hostAttrs,n=bn$2(n,o.hostAttrs));}}function da(e){return e===it$2?{}:e===Y$2?[]:e}function EE(e,t){let n=e.viewQuery;n?e.viewQuery=(r,o)=>{t(r,o),n(r,o);}:e.viewQuery=t;}function DE(e,t){let n=e.contentQueries;n?e.contentQueries=(r,o,i)=>{t(r,o,i),n(r,o,i);}:e.contentQueries=t;}function wE(e,t){let n=e.hostBindings;n?e.hostBindings=(r,o)=>{t(r,o),n(r,o);}:e.hostBindings=t;}function Ip(e,t,n,r,o,i,s,a){if(n.firstCreatePass){e.mergedAttrs=bn$2(e.mergedAttrs,e.attrs);let u=e.tView=vc$1(2,e,o,i,s,n.directiveRegistry,n.pipeRegistry,null,n.schemas,n.consts,null);n.queries!==null&&(n.queries.template(n,e),u.queries=n.queries.embeddedTView(e));}a&&(e.flags|=a),jt$5(e,false);let c=CE(n,t);Vo$1()&&mc$1(n,t,c,e),_n$3(c,t);let l=Wf(c,t,c,e);t[r+O$3]=l,Ec$1(t,l);}function TE(e,t,n,r,o,i,s,a,c,l,u){let d=n+O$3,p;return t.firstCreatePass?(p=Kt$3(t,d,4,s||null,a||null),Xf(t,e,p,ce(t.consts,l),Dc$1),Od$1(t,p)):p=t.data[d],Ip(p,e,t,n,r,o,i,c),In$3(p)&&Si$2(t,e,p),l!=null&&xr$2(e,p,u),p}function Qt$1(e,t,n,r,o,i,s,a,c,l,u){let d=n+O$3,p;if(t.firstCreatePass){if(p=Kt$3(t,d,4,s||null,a||null),l!=null){let f=ce(t.consts,l);p.localNames=[];for(let h=0;h<f.length;h+=2)p.localNames.push(f[h],-1);}}else p=t.data[d];return Ip(p,e,t,n,r,o,i,c),l!=null&&xr$2(e,p,u),p}function Ep(e,t,n,r,o,i,s,a){let c=y$1(),l=P$3(),u=ce(l.consts,i);return TE(c,l,e,t,n,r,o,u,void 0,s,a),Ep}function Dp(e,t,n,r,o,i,s,a){let c=y$1(),l=P$3(),u=ce(l.consts,i);return Qt$1(c,l,e,t,n,r,o,u,void 0,s,a),Dp}var CE=bE;function bE(e,t,n,r){return ur$3(true),t[L$2].createComment("")}var oe$1=(function(e){return e[e.NOT_STARTED=0]="NOT_STARTED",e[e.IN_PROGRESS=1]="IN_PROGRESS",e[e.COMPLETE=2]="COMPLETE",e[e.FAILED=3]="FAILED",e})(oe$1||{}),md$1=0,_E=1,U$2=(function(e){return e[e.Placeholder=0]="Placeholder",e[e.Loading=1]="Loading",e[e.Complete=2]="Complete",e[e.Error=3]="Error",e})(U$2||{}),wp=(function(e){return e[e.Initial=-1]="Initial",e})(wp||{}),ME=0,Ai$1=1;var SE=4,NE=5,xE=6,AE=7,fa=8,RE=9,Bc$1=(function(e){return e[e.Manual=0]="Manual",e[e.Playthrough=1]="Playthrough",e})(Bc$1||{});function Tp(e,t,n){let r=bp(e);t[r]===null&&(t[r]=[]),t[r].push(n);}function Jo$1(e,t){let n=bp(e),r=t[n];if(r!==null){for(let o of r)o();t[n]=null;}}function Cp(e){Jo$1(1,e),Jo$1(0,e),Jo$1(2,e);}function bp(e){let t=SE;return e===1?t=NE:e===2&&(t=RE),t}function Ri$2(e){return e+1}function kn$3(e,t){e[m$1];let r=Ri$2(t.index);return e[r]}function kE(e,t,n){e[m$1];let o=Ri$2(t);e[o]=n;}function On$3(e,t){let n=Ri$2(t.index);return e.data[n]}function OE(e,t,n){let r=Ri$2(t);e.data[r]=n;}function PE(e,t,n){let r=t[m$1],o=On$3(r,n);switch(e){case U$2.Complete:return o.primaryTmplIndex;case U$2.Loading:return o.loadingTmplIndex;case U$2.Error:return o.errorTmplIndex;case U$2.Placeholder:return o.placeholderTmplIndex;default:return null}}function yd$1(e,t){return t===U$2.Placeholder?e.placeholderBlockConfig?.[md$1]??null:t===U$2.Loading?e.loadingBlockConfig?.[md$1]??null:null}function LE(e){return e.loadingBlockConfig?.[_E]??null}function vd$1(e,t){if(!e||e.length===0)return t;let n=new Set(e);for(let r of t)n.add(r);return e.length===n.size?e:Array.from(n)}function FE(e,t){let n=t.primaryTmplIndex+O$3;return Dn$3(e,n)}var jE=(()=>{class e{cachedInjectors=new Map;getOrCreateInjector(n,r,o,i){if(!this.cachedInjectors.has(n)){let s=o.length>0?Vc$1(o,r,i):null;this.cachedInjectors.set(n,s);}return this.cachedInjectors.get(n)}ngOnDestroy(){try{for(let n of this.cachedInjectors.values())n!==null&&n.destroy();}finally{this.cachedInjectors.clear();}}static \u0275prov=re$2({token:e,providedIn:"environment",factory:()=>new e})}return e})();var _p=new N$3("");function pa(e,t,n){return e.get(jE).getOrCreateInjector(t,e,n,"")}function VE(e,t,n){if(e instanceof Bt$3){let o=e.injector,i=e.parentInjector,s=pa(i,t,n);return new Bt$3(o,s)}let r=e.get(se);if(r!==e){let o=pa(r,t,n);return new Bt$3(e,o)}return pa(e,t,n)}function ft$3(e,t,n,r=false){let o=n[$$2],i=o[m$1];if(lt$2(o))return;let s=kn$3(o,t),a=s[Ai$1],c=s[AE];if(!(c!==null&&e<c)&&Id$1(a,e)&&Id$1(s[ME]??-1,e)){let l=On$3(i,t),d=!r&&true&&(LE(l)!==null||yd$1(l,U$2.Loading)!==null||yd$1(l,U$2.Placeholder))?UE:BE;try{d(e,s,n,t,o);}catch(p){Cc$1(o,p);}}}function HE(e,t){let n=e[at$3]?.findIndex(o=>o.data[ic$2]===t[Ai$1])??-1;return {dehydratedView:n>-1?e[at$3][n]:null,dehydratedViewIx:n}}function BE(e,t,n,r,o){R$3(A$2.DeferBlockStateStart);let i=PE(e,o,r);if(i!==null){t[Ai$1]=e;let s=o[m$1],a=i+O$3,c=Dn$3(s,a),l=0;Sc$1(n,l);let u;if(e===U$2.Complete){let h=On$3(s,r),g=h.providers;g&&g.length>0&&(u=VE(o[J],h,g));}let{dehydratedView:d,dehydratedViewIx:p}=HE(n,t),f=An$3(o,c,null,{injector:u,dehydratedView:d});if(Rn$3(n,f,l,Gt$2(c,d)),Ao$1(f),p>-1&&n[at$3]?.splice(p,1),(e===U$2.Complete||e===U$2.Error)&&Array.isArray(t[fa])){for(let h of t[fa])h();t[fa]=null;}}R$3(A$2.DeferBlockStateEnd);}function Id$1(e,t){return e<t}function $E(e,t){let n=e[t.index];ft$3(U$2.Placeholder,t,n);}function Ed$1(e,t,n){e.loadingPromise.then(()=>{e.loadingState===oe$1.COMPLETE?ft$3(U$2.Complete,t,n):e.loadingState===oe$1.FAILED&&ft$3(U$2.Error,t,n);});}var UE=null;function Mp(e,t){return t[J].get(_p,null,{optional:true})?.behavior!==Bc$1.Manual}var WE=(()=>{class e{log(n){console.log(n);}warn(n){console.warn(n);}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"platform"})}return e})();var Sp=new N$3("");var Np=new N$3("");function xp(){Hi$1(()=>{let e="";throw new M$2(600,e)});}var qE=10;var Rr$3=(()=>{class e{_runningTick=false;_destroyed=false;_destroyListeners=[];_views=[];internalErrorHandler=T$2(dt$2);afterRenderManager=T$2(Ti$1);zonelessEnabled=T$2(fr$3);rootEffectScheduler=T$2($o$1);dirtyFlags=0;tracingSnapshot=null;allTestViews=new Set;autoDetectTestViews=new Set;includeAllTestViews=false;afterTick=new ie$1;get allViews(){return [...(this.includeAllTestViews?this.allTestViews:this.autoDetectTestViews).keys(),...this._views]}get destroyed(){return this._destroyed}componentTypes=[];components=[];internalPendingTask=T$2(Ht$4);get isStable(){return this.internalPendingTask.hasPendingTasksObservable.pipe(le$1(n=>!n))}constructor(){T$2(Yt$1,{optional:true});}whenStable(){let n;return new Promise(r=>{n=this.isStable.subscribe({next:o=>{o&&r();}});}).finally(()=>{n.unsubscribe();})}_injector=T$2(se);_rendererFactory=null;get injector(){return this._injector}bootstrap(n,r){return this.bootstrapImpl(n,r)}bootstrapImpl(n,r,o=Ee$4.NULL){return this._injector.get(De$3).run(()=>{if(R$3(A$2.BootstrapComponentStart),!this._injector.get(Hc$1).done){let _="";throw new M$2(405,_)}let a=ke$3(n),c=this._injector.get(Sn$3),l=new zt$3(a,c);this.componentTypes.push(n);let{hostElement:u,directives:d,bindings:p}=GE(r),f=u||l.selector,h=l.create(o,[],f,c.injector,d,p),g=h.location.nativeElement,D=h.injector.get(Sp,null);return D?.registerApplication(g),h.onDestroy(()=>{this.detachView(h.hostView),mr$3(this.components,h),D?.unregisterApplication(g);}),this._loadComponent(h),R$3(A$2.BootstrapComponentEnd,h),h})}tick(){this.zonelessEnabled||(this.dirtyFlags|=1),this._tick();}_tick(){R$3(A$2.ChangeDetectionStart),this.tracingSnapshot!==null?this.tracingSnapshot.run(wi$2.CHANGE_DETECTION,this.tickImpl):this.tickImpl();}tickImpl=()=>{if(this._runningTick)throw R$3(A$2.ChangeDetectionEnd),new M$2(101,false);let n=v$1(null);try{this._runningTick=!0,this.synchronize();}finally{this._runningTick=false,this.tracingSnapshot?.dispose(),this.tracingSnapshot=null,v$1(n),this.afterTick.next(),R$3(A$2.ChangeDetectionEnd);}};synchronize(){this._rendererFactory===null&&!this._injector.destroyed&&(this._rendererFactory=this._injector.get(wr$1,null,{optional:true}));let n=0;for(;this.dirtyFlags!==0&&n++<qE;){R$3(A$2.ChangeDetectionSyncStart);try{this.synchronizeOnce();}finally{R$3(A$2.ChangeDetectionSyncEnd);}}}synchronizeOnce(){this.dirtyFlags&16&&(this.dirtyFlags&=-17,this.rootEffectScheduler.flush());let n=false;if(this.dirtyFlags&7){let r=!!(this.dirtyFlags&1);this.dirtyFlags&=-8,this.dirtyFlags|=8;for(let{_lView:o}of this.allViews){if(!r&&!ir$4(o))continue;let i=r&&!this.zonelessEnabled?0:1;Hf(o,i),n=true;}if(this.dirtyFlags&=-5,this.syncDirtyFlagsWithViews(),this.dirtyFlags&23)return}n||(this._rendererFactory?.begin?.(),this._rendererFactory?.end?.()),this.dirtyFlags&8&&(this.dirtyFlags&=-9,this.afterRenderManager.execute()),this.syncDirtyFlagsWithViews();}syncDirtyFlagsWithViews(){if(this.allViews.some(({_lView:n})=>ir$4(n))){this.dirtyFlags|=2;return}else this.dirtyFlags&=-8;}attachView(n){let r=n;this._views.push(r),r.attachToAppRef(this);}detachView(n){let r=n;mr$3(this._views,r),r.detachFromAppRef();}_loadComponent(n){this.attachView(n.hostView);try{this.tick();}catch(o){this.internalErrorHandler(o);}this.components.push(n),this._injector.get(Np,[]).forEach(o=>o(n));}ngOnDestroy(){if(!this._destroyed)try{this._destroyListeners.forEach(n=>n()),this._views.slice().forEach(n=>n.destroy());}finally{this._destroyed=true,this._views=[],this._destroyListeners=[];}}onDestroy(n){return this._destroyListeners.push(n),()=>mr$3(this._destroyListeners,n)}destroy(){if(this._destroyed)throw new M$2(406,false);let n=this._injector;n.destroy&&!n.destroyed&&n.destroy();}get viewCount(){return this._views.length}static \u0275fac=function(r){return new(r||e)};static \u0275prov=_r$3({token:e,factory:e.\u0275fac})}return e})();function GE(e){return e===void 0||typeof e=="string"||e instanceof Element?{hostElement:e}:e}function mr$3(e,t){let n=e.indexOf(t);n>-1&&e.splice(n,1);}function zE(e,t,n){let r=t.get(ZE),o=()=>r.remove(e);return r.add(e,n),o}function QE(e){return (t,n)=>zE(t,n,e)}var ZE=(()=>{class e{buckets=new Map;callbackBucket=new Map;applicationRef=T$2(Rr$3);ngZone=T$2(De$3);idleService=T$2(zd$1);add(n,r){let o=Dd$1(r);this.callbackBucket.set(n,o);let i=this.buckets.get(o);i==null&&(i={idleId:null,queue:new Set},this.buckets.set(o,i)),i.queue.add(n),this.scheduleBucket(i,r);}remove(n){let r=this.callbackBucket.get(n);if(r===void 0)return;this.callbackBucket.delete(n);let o=this.buckets.get(r);o&&(o.queue.delete(n),o.queue.size===0&&(this.cancelBucket(o),this.buckets.delete(r)));}scheduleBucket(n,r){if(n.idleId!==null)return;let o=Dd$1(r),i=s=>{this.cancelBucket(n);for(let a of n.queue)if(a(),this.applicationRef._tick(),n.queue.delete(a),this.callbackBucket.delete(a),s&&s.timeRemaining()===0&&!s.didTimeout)break;n.queue.size>0?this.scheduleBucket(n,r):this.buckets.delete(o);};n.idleId=this.idleService.requestOnIdle(s=>this.ngZone.run(()=>i(s)),r);}cancelBucket(n){n.idleId!==null&&(this.idleService.cancelOnIdle(n.idleId),n.idleId=null);}ngOnDestroy(){for(let n of this.buckets.values())this.cancelBucket(n);this.buckets.clear(),this.callbackBucket.clear();}static \u0275prov=re$2({token:e,providedIn:"root",factory:()=>new e})}return e})();function Dd$1(e){return !e||e.timeout==null?"":`${e.timeout}`}function YE(e){let t=y$1(),n=B$1();if($E(t,n),!Mp(0,t))return;let r=t[J],o=kn$3(t,n),i=e(()=>KE(0,t,n),r);Tp(0,o,i);}function Ap(e,t,n){let r=t[J],o=t[m$1];if(e.loadingState!==oe$1.NOT_STARTED)return e.loadingPromise??Promise.resolve();let i=kn$3(t,n),s=FE(o,e);e.loadingState=oe$1.IN_PROGRESS,Jo$1(1,i);let a=e.dependencyResolverFn,c=r.get(Uo$2).add();return a?(e.loadingPromise=Promise.allSettled(a()).then(l=>{let u=false,p=[],f=[];for(let h=0;h<l.length;h++){let g=l[h];if(g.status==="fulfilled"){let D=g.value,_=ke$3(D)||Eo$1(D);if(_)p.push(_);else {let j=bs$2(D);j&&f.push(j);}}else {u=true,g.reason instanceof Error?g.reason:new Error(String(g.reason));break}}if(u){if(e.loadingState=oe$1.FAILED,e.errorTmplIndex===null){let g="",D=new M$2(-750,g);Cc$1(t,D);}}else {e.loadingState=oe$1.COMPLETE;let h=s.tView;if(p.length>0){h.directiveRegistry=vd$1(h.directiveRegistry,p);let g=p.map(_=>_.type),D=Mo$1(false,...g);e.providers=D;}f.length>0&&(h.pipeRegistry=vd$1(h.pipeRegistry,f));}}),e.loadingPromise.finally(()=>{e.loadingPromise=null,c();})):(e.loadingPromise=Promise.resolve().then(()=>{e.loadingPromise=null,e.loadingState=oe$1.COMPLETE,c();}),e.loadingPromise)}function KE(e,t,n){let r=t[m$1],o=t[n.index];if(!Mp(e,t))return;let i=kn$3(t,n),s=On$3(r,n);switch(Cp(i),s.loadingState){case oe$1.NOT_STARTED:ft$3(U$2.Loading,n,o),Ap(s,t,n),s.loadingState===oe$1.IN_PROGRESS&&Ed$1(s,n,o);break;case oe$1.IN_PROGRESS:ft$3(U$2.Loading,n,o),Ed$1(s,n,o);break;case oe$1.COMPLETE:ft$3(U$2.Complete,n,o);break;case oe$1.FAILED:ft$3(U$2.Error,n,o);break;}}function JE(e,t,n){return wd$1(t,n)}function XE(e){return e!=null&&(e&1)===1}function wd$1(e,t){let n=e[J],r=On$3(e[m$1],t),o=sc$1(n),i=XE(r.flags),a=kn$3(e,t)[xE]!==null;return !(i&&a&&o)}function eD(e,t,n,r,o,i,s,a,c,l){let u=y$1(),d=P$3(),p=e+O$3,f=Qt$1(u,d,e,null,0,0),h=u[J],g=sc$1(h);if(d.firstCreatePass){Be$3("NgDefer");let Pn={primaryTmplIndex:t,loadingTmplIndex:null,placeholderTmplIndex:null,errorTmplIndex:null,placeholderBlockConfig:null,loadingBlockConfig:null,dependencyResolverFn:n??null,loadingState:oe$1.NOT_STARTED,loadingPromise:null,providers:null,hydrateTriggers:null,debug:null,flags:0};OE(d,p,Pn);}let D=u[p];let _=null,j=null;if(D[at$3]?.length>0){let Pn=D[at$3][0].data;j=Pn[oc$1]??null,_=Pn[ic$2];}let gt=[null,wp.Initial,null,null,null,null,j,_,null,null];kE(u,p,gt);let Pi=null;j!==null&&g&&(Pi=h.get(sf),Pi.add(j,{lView:u,tNode:f,lContainer:D}));let el=()=>{Cp(gt),j!==null&&Pi?.cleanup([j]);};Tp(0,gt,()=>Vs$2(u,el)),sr$3(u,el);}function tD(e){let t=y$1(),n=B$1();JE(0,t,n)&&YE(QE({timeout:e}));}function Rp(e,t,n,r){let o=y$1(),i=Vt$2();if(me$2(o,i,t)){P$3();let a=lr$4();Hv(a,o,e,t,n,r);}return Rp}var Ga=class{destroy(t){}updateValue(t,n){}swap(t,n){let r=Math.min(t,n),o=Math.max(t,n),i=this.detach(o);if(o-r>1){let s=this.detach(r);this.attach(r,i),this.attach(o,s);}else this.attach(r,i);}move(t,n){this.attach(n,this.detach(t));}};function ha(e,t,n,r,o){return e===n&&Object.is(t,r)?1:Object.is(o(e,t),o(n,r))?-1:0}function nD(e,t,n,r){let o,i,s=0,a=e.length-1;if(Array.isArray(t)){v$1(r);let l=t.length-1;for(v$1(null);s<=a&&s<=l;){let u=e.at(s),d=t[s],p=ha(s,u,s,d,n);if(p!==0){p<0&&e.updateValue(s,d),s++;continue}let f=e.at(a),h=t[l],g=ha(a,f,l,h,n);if(g!==0){g<0&&e.updateValue(a,h),a--,l--;continue}let D=n(s,u),_=n(a,f),j=n(s,d);if(Object.is(j,_)){let gt=n(l,h);Object.is(gt,D)?(e.swap(s,a),e.updateValue(a,h),l--,a--):e.move(a,s),e.updateValue(s,d),s++;continue}if(o??=new gi$2,i??=Cd$1(e,s,a,n),za(e,o,s,j))e.updateValue(s,d),s++,a++;else if(i.has(j))o.set(D,e.detach(s)),a--;else {let gt=e.create(s,t[s]);e.attach(s,gt),s++,a++;}}for(;s<=l;)Td$1(e,o,n,s,t[s]),s++;}else if(t!=null){v$1(r);let l=t[Symbol.iterator]();v$1(null);let u=l.next();for(;!u.done&&s<=a;){let d=e.at(s),p=u.value,f=ha(s,d,s,p,n);if(f!==0)f<0&&e.updateValue(s,p),s++,u=l.next();else {o??=new gi$2,i??=Cd$1(e,s,a,n);let h=n(s,p);if(za(e,o,s,h))e.updateValue(s,p),s++,a++,u=l.next();else if(!i.has(h))e.attach(s,e.create(s,p)),s++,a++,u=l.next();else {let g=n(s,d);o.set(g,e.detach(s)),a--;}}}for(;!u.done;)Td$1(e,o,n,e.length,u.value),u=l.next();}for(;s<=a;)e.destroy(e.detach(a--));o?.forEach(l=>{e.destroy(l);});}function za(e,t,n,r){return t!==void 0&&t.has(r)?(e.attach(n,t.get(r)),t.delete(r),true):false}function Td$1(e,t,n,r,o){if(za(e,t,r,n(r,o)))e.updateValue(r,o);else {let i=e.create(r,o);e.attach(r,i);}}function Cd$1(e,t,n,r){let o=new Set;for(let i=t;i<=n;i++)o.add(r(i,e.at(i)));return o}var gi$2=class gi{kvMap=new Map;_vMap=void 0;has(t){return this.kvMap.has(t)}delete(t){if(!this.has(t))return  false;let n=this.kvMap.get(t);return this._vMap!==void 0&&this._vMap.has(n)?(this.kvMap.set(t,this._vMap.get(n)),this._vMap.delete(n)):this.kvMap.delete(t),true}get(t){return this.kvMap.get(t)}set(t,n){if(this.kvMap.has(t)){let r=this.kvMap.get(t);this._vMap===void 0&&(this._vMap=new Map);let o=this._vMap;for(;o.has(r);)r=o.get(r);o.set(r,n);}else this.kvMap.set(t,n);}forEach(t){for(let[n,r]of this.kvMap)if(t(r,n),this._vMap!==void 0){let o=this._vMap;for(;o.has(r);)r=o.get(r),t(r,n);}}};function rD(e,t,n,r,o,i,s,a){Be$3("NgControlFlow");let c=y$1(),l=P$3(),u=ce(l.consts,i);return Qt$1(c,l,e,t,n,r,o,u,256,s,a),$c$1}function $c$1(e,t,n,r,o,i,s,a){Be$3("NgControlFlow");let c=y$1(),l=P$3(),u=ce(l.consts,i);return Qt$1(c,l,e,t,n,r,o,u,512,s,a),$c$1}function oD(e,t){Be$3("NgControlFlow");let n=y$1(),r=Vt$2(),o=n[r]!==Q$2?n[r]:-1,i=o!==-1?mi$2(n,O$3+o):void 0,s=0;if(me$2(n,r,e)){let a=v$1(null);try{if(i!==void 0&&Sc$1(i,s),e!==-1){let c=O$3+e,l=mi$2(n,c),u=Ka(n[m$1],c),d=zf(l,u,n),p=An$3(n,u,t,{dehydratedView:d});Rn$3(l,p,s,Gt$2(u,d));}}finally{v$1(a);}}else if(i!==void 0){let a=qf(i,s);a!==void 0&&(a[H]=t);}}var Qa=class{lContainer;$implicit;$index;constructor(t,n,r){this.lContainer=t,this.$implicit=n,this.$index=r;}get $count(){return this.lContainer.length-F$2}};function iD(e){return e}function sD(e,t){return t}var Za$1=class Za{hasEmptyBlock;trackByFn;liveCollection;constructor(t,n,r){this.hasEmptyBlock=t,this.trackByFn=n,this.liveCollection=r;}};function aD(e,t,n,r,o,i,s,a,c,l,u,d,p){Be$3("NgControlFlow");let f=y$1(),h=P$3(),g=c!==void 0,D=y$1(),_=s,j=new Za$1(g,_);D[O$3+e]=j,Qt$1(f,h,e+1,t,n,r,o,ce(h.consts,i),256);}var Ya$1=class Ya extends Ga{lContainer;hostLView;templateTNode;operationsCounter=void 0;needsIndexUpdate=false;constructor(t,n,r){super(),this.lContainer=t,this.hostLView=n,this.templateTNode=r;}get length(){return this.lContainer.length-F$2}at(t){return this.getLView(t)[H].$implicit}attach(t,n){let r=n[Rt$4];this.needsIndexUpdate||=t!==this.length,Rn$3(this.lContainer,n,t,Gt$2(this.templateTNode,r)),lD(this.lContainer,t);}detach(t){return this.needsIndexUpdate||=t!==this.length-1,uD(this.lContainer,t),dD(this.lContainer,t)}create(t,n){let r=ai$3(this.lContainer,this.templateTNode.tView.ssrId);return An$3(this.hostLView,this.templateTNode,new Qa(this.lContainer,n,t),{dehydratedView:r})}destroy(t){bi$3(t[m$1],t);}updateValue(t,n){this.getLView(t)[H].$implicit=n;}reset(){this.needsIndexUpdate=false;}updateIndexes(){if(this.needsIndexUpdate)for(let t=0;t<this.length;t++)this.getLView(t)[H].$index=t;}getLView(t){return fD(this.lContainer,t)}};function cD(e){let t=v$1(null),n=ge$3();try{let r=y$1(),o=r[m$1],i=r[n],s=n+1,a=mi$2(r,s);if(i.liveCollection===void 0){let l=Ka(o,s);i.liveCollection=new Ya$1(a,r,l);}else i.liveCollection.reset();let c=i.liveCollection;if(nD(c,e,i.trackByFn,t),c.updateIndexes(),i.hasEmptyBlock){let l=Vt$2(),u=c.length===0;if(me$2(r,l,u)){let d=n+2,p=mi$2(r,d);if(u){let f=Ka(o,d),h=zf(p,f,r),g=An$3(r,f,void 0,{dehydratedView:h});Rn$3(p,g,0,Gt$2(f,h));}else o.firstUpdatePass&&uI(p),Sc$1(p,0);}}}finally{v$1(t);}}function mi$2(e,t){return e[t]}function lD(e,t){if(e.length<=F$2)return;let n=F$2+t,r=e[n],o=r?r[Fe$4]:void 0;if(r&&o&&o.detachedLeaveAnimationFns&&o.detachedLeaveAnimationFns.length>0){let i=r[J];uv(i,o),Mn$3.delete(r[Le$2]),o.detachedLeaveAnimationFns=void 0;}}function uD(e,t){if(e.length<=F$2)return;let n=F$2+t,r=e[n],o=r?r[Fe$4]:void 0;o&&o.leave&&o.leave.size>0&&(o.detachedLeaveAnimationFns=[]);}function dD(e,t){return Er$2(e,t)}function fD(e,t){return qf(e,t)}function Ka(e,t){return Dn$3(e,t)}function kp(e,t,n){let r=y$1(),o=Vt$2();if(me$2(r,o,t)){P$3();let s=lr$4();Pv(s,r,e,t,r[L$2],n);}return kp}function Ja$1(e,t,n,r,o){bc$1(t,e,n,o?"class":"style",r);}function yi$2(e,t,n,r){let o=y$1(),i=o[m$1],s=e+O$3,a=i.firstCreatePass?Rc$1(s,o,2,t,Dc$1,ko$2(),n,r):i.data[s];if(Ye$5(a)){let c=o[Te$3].tracingService;if(c&&c.componentCreate){let l=i.data[a.directiveStart+a.componentOffset];return c.componentCreate(Yf(l),()=>(bd$1(e,t,o,a,r),yi$2))}}return bd$1(e,t,o,a,r),yi$2}function bd$1(e,t,n,r,o){if(wc$1(r,n,e,t,Lp),In$3(r)){let i=n[m$1];Si$2(i,n,r),ac$1(i,r,n);}o!=null&&xr$2(n,r);}function Uc$1(){let e=P$3(),t=B$1(),n=Tc$1(t);return e.firstCreatePass&&kc$1(e,n),Ws$1(n)&&qs$1(),$s$2(),n.classesWithoutHost!=null&&Lm$1(n)&&Ja$1(e,n,y$1(),n.classesWithoutHost,true),n.stylesWithoutHost!=null&&Fm$1(n)&&Ja$1(e,n,y$1(),n.stylesWithoutHost,false),Uc$1}function Op(e,t,n,r){return yi$2(e,t,n,r),Uc$1(),Op}function Wc$1(e,t,n,r){let o=y$1(),i=o[m$1],s=e+O$3,a=i.firstCreatePass?jI(s,i,2,t,n,r):i.data[s];return wc$1(a,o,e,t,Lp),r!=null&&xr$2(o,a),Wc$1}function qc$1(){let e=B$1(),t=Tc$1(e);return Ws$1(t)&&qs$1(),$s$2(),qc$1}function Pp(e,t,n,r){return Wc$1(e,t,n,r),qc$1(),Pp}var Lp=(e,t,n,r,o)=>(ur$3(true),gf(t[L$2],r,ea()));function Gc$1(e,t,n){let r=y$1(),o=r[m$1],i=e+O$3,s=o.firstCreatePass?Rc$1(i,r,8,"ng-container",Dc$1,ko$2(),t,n):o.data[i];if(wc$1(s,r,e,"ng-container",pD),In$3(s)){let a=r[m$1];Si$2(a,r,s),ac$1(a,s,r);}return n!=null&&xr$2(r,s),Gc$1}function zc$1(){let e=P$3(),t=B$1(),n=Tc$1(t);return e.firstCreatePass&&kc$1(e,n),zc$1}function Fp(e,t,n){return Gc$1(e,t,n),zc$1(),Fp}var pD=(e,t,n,r,o)=>(ur$3(true),jy(t[L$2],""));function hD(){return y$1()}function jp(e,t,n){let r=y$1(),o=Vt$2();if(me$2(r,o,t)){P$3();let s=lr$4();Of(s,r,e,t,r[L$2],n);}return jp}var pr$4=void 0;function gD(e){let t=Math.floor(Math.abs(e)),n=e.toString().replace(/^[^.]*\.?/,"").length;return t===1&&n===0?1:5}var mD=["en",[["a","p"],["AM","PM"]],[["AM","PM"]],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],pr$4,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],pr$4,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm\u202Fa","h:mm:ss\u202Fa","h:mm:ss\u202Fa z","h:mm:ss\u202Fa zzzz"],["{1}, {0}",pr$4,pr$4,pr$4],[".",",",";","%","+","-","E","\xD7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0%","\xA4#,##0.00","#E0"],"USD","$","US Dollar",{},"ltr",gD],ga=Object.create(null);function yD(e){let t=ID(e),n=_d$1(t);if(n)return n;let r=t.split("-")[0];if(n=_d$1(r),n)return n;if(r==="en")return mD;throw new M$2(701,false)}function _d$1(e){return e in ga||(ga[e]=Oe$2.ng&&Oe$2.ng.common&&Oe$2.ng.common.locales&&Oe$2.ng.common.locales[e]),ga[e]}var vD={NumberSymbols:13,NumberFormats:14};function ID(e){return e.toLowerCase().replace(/_/g,"-")}var kr$3="en-US";function Vp(e){typeof e=="string"&&(e.toLowerCase().replace(/_/g,"-"));}function Hp(e,t,n){let r=y$1(),o=P$3(),i=B$1();return DD(o,r,r[L$2],i,e,t,n),Hp}function Bp(e,t,n){let r=y$1(),o=P$3(),i=B$1();return (i.type&3||n)&&Ac$1(i,o,r,n,r[L$2],e,t,$t$2(i,r,t)),Bp}function DD(e,t,n,r,o,i,s){let a=true,c=null;if((r.type&3||s)&&(c??=$t$2(r,t,i),Ac$1(r,e,t,s,n,o,i,c)&&(a=false)),a){let l=r.outputs?.[o],u=r.hostDirectiveOutputs?.[o];if(u&&u.length)for(let d=0;d<u.length;d+=2){let p=u[d],f=u[d+1];c??=$t$2(r,t,i),ci$2(r,t,p,f,o,c);}if(l&&l.length)for(let d of l)c??=$t$2(r,t,i),ci$2(r,t,d,o,o,c);}}function wD(e=1){return Mu(e)}function TD(e,t){let n=null,r=Yy(e);for(let o=0;o<t.length;o++){let i=t[o];if(i==="*"){n=o;continue}if(r===null?Tf(e,i,true):Xy(r,i))return o}return n}function CD(e){let t=y$1()[te$1][K$1];if(!t.projection){let n=e?e.length:1,r=t.projection=eu(n,null),o=r.slice(),i=t.child;for(;i!==null;){if(i.type!==128){let s=e?TD(i,e):0;s!==null&&(o[s]?o[s].projectionNext=i:r[s]=i,o[s]=i);}i=i.next;}}}function bD(e,t=0,n,r,o,i){let s=y$1(),a=P$3(),c=null;let l=Kt$3(a,O$3+e,16,null,null);l.projection===null&&(l.projection=t),Qs$2();let d=!s[Rt$4]||Us$1();s[te$1][K$1].projection[l.projection]===null&&c!==null?_D(s,a,c):d&&!Ii$1(l)&&Cv(a,s,l);}function _D(e,t,n){let r=O$3+n,o=t.data[r],i=e[r],s=ai$3(i,o.tView.ssrId),a=An$3(e,o,void 0,{dehydratedView:s});Rn$3(i,a,0,Gt$2(o,s));}function $p(e,t,n,r){return cp(e,t,n,r),$p}function Up(e,t,n){return ap(e,t,n),Up}function MD(e){let t=y$1(),n=P$3(),r=Lo$2();cr$4(r+1);let o=Pc$1(n,r);if(e.dirty&&uu(t)===((o.metadata.flags&2)===2)){if(o.matches===null)e.reset([]);else {let i=up(t,r);e.reset(i,Qd$1),e.notifyOnChanges();}return  true}return  false}function SD(){return Oc$1(y$1(),Lo$2())}function Wp(e,t,n,r,o){return fp(t,cp(e,n,r,o)),Wp}function qp(e,t,n,r){return fp(e,ap(t,n,r)),qp}function ND(e=1){cr$4(Lo$2()+e);}function xD(e){let t=Zs$1();return rr$3(t,O$3+e)}function zo$1(e,t){return e<<17|t<<2}function Zt$1(e){return e>>17&32767}function AD(e){return (e&2)==2}function RD(e,t){return e&131071|t<<17}function Xa$1(e){return e|2}function Nn$3(e){return (e&131068)>>2}function ma(e,t){return e&-131069|t<<2}function kD(e){return (e&1)===1}function ec$1(e){return e|1}function OD(e,t,n,r,o,i){let s=i?t.classBindings:t.styleBindings,a=Zt$1(s),c=Nn$3(s);e[r]=n;let l=false,u;if(Array.isArray(n)){let d=n;u=d[1],(u===null||hn$2(d,u)>0)&&(l=true);}else u=n;if(o)if(c!==0){let p=Zt$1(e[a+1]);e[r+1]=zo$1(p,a),p!==0&&(e[p+1]=ma(e[p+1],r)),e[a+1]=RD(e[a+1],r);}else e[r+1]=zo$1(a,0),a!==0&&(e[a+1]=ma(e[a+1],r)),a=r;else e[r+1]=zo$1(c,0),a===0?a=r:e[c+1]=ma(e[c+1],r),c=r;l&&(e[r+1]=Xa$1(e[r+1])),Md$1(e,u,r,true),Md$1(e,u,r,false),PD(t,u,e,r,i),s=zo$1(a,c),i?t.classBindings=s:t.styleBindings=s;}function PD(e,t,n,r,o){let i=o?e.residualClasses:e.residualStyles;i!=null&&typeof t=="string"&&hn$2(i,t)>=0&&(n[r+1]=ec$1(n[r+1]));}function Md$1(e,t,n,r){let o=e[n+1],i=t===null,s=r?Zt$1(o):Nn$3(o),a=false;for(;s!==0&&(a===false||i);){let c=e[s],l=e[s+1];LD(c,t)&&(a=true,e[s+1]=r?ec$1(l):Xa$1(l)),s=r?Zt$1(l):Nn$3(l);}a&&(e[n+1]=r?Xa$1(o):ec$1(o));}function LD(e,t){return e===null||t==null||(Array.isArray(e)?e[1]:e)===t?true:Array.isArray(e)&&typeof t=="string"?hn$2(e,t)>=0:false}var be$2={textEnd:0,key:0,keyEnd:0,value:0,valueEnd:0};function FD(e){return e.substring(be$2.key,be$2.keyEnd)}function jD(e){return VD(e),Gp(e,zp(e,0,be$2.textEnd))}function Gp(e,t){let n=be$2.textEnd;return n===t?-1:(t=be$2.keyEnd=HD(e,be$2.key=t,n),zp(e,t,n))}function VD(e){be$2.key=0,be$2.keyEnd=0,be$2.value=0,be$2.valueEnd=0,be$2.textEnd=e.length;}function zp(e,t,n){for(;t<n&&e.charCodeAt(t)<=32;)t++;return t}function HD(e,t,n){for(;t<n&&e.charCodeAt(t)>32;)t++;return t}function Qp(e,t,n){return Yp(e,t,n,false),Qp}function Zp(e,t){return Yp(e,t,null,true),Zp}function BD(e){UD(ZD,$D,e,true);}function $D(e,t){for(let n=jD(t);n>=0;n=Gp(t,n))Co$1(e,FD(t),true);}function Yp(e,t,n,r){let o=y$1(),i=P$3(),s=ar$3(2);if(i.firstUpdatePass&&Jp(i,e,s,r),t!==Q$2&&me$2(o,s,t)){let a=i.data[ge$3()];Xp(i,a,o,o[L$2],e,o[s+1]=KD(t,n),r,s);}}function UD(e,t,n,r){let o=P$3(),i=ar$3(2);o.firstUpdatePass&&Jp(o,null,i,r);let s=y$1();if(n!==Q$2&&me$2(s,i,n)){let a=o.data[ge$3()];if(eh$1(a,r)&&!Kp(o,i)){let c=a.classesWithoutHost;c!==null&&(n=yo$1(c,n||"")),Ja$1(o,a,s,n,r);}else YD(o,a,s,s[L$2],s[i+1],s[i+1]=QD(e,t,n),r,i);}}function Kp(e,t){return t>=e.expandoStartIndex}function Jp(e,t,n,r){let o=e.data;if(o[n+1]===null){let i=o[ge$3()],s=Kp(e,n);eh$1(i,r)&&t===null&&!s&&(t=false),t=WD(o,i,t,r),OD(o,i,t,n,s,r);}}function WD(e,t,n,r){let o=Tu(e),i=r?t.residualClasses:t.residualStyles;if(o===null)(r?t.classBindings:t.styleBindings)===0&&(n=ya(null,e,t,n,r),n=Cr$2(n,t.attrs,r),i=null);else {let s=t.directiveStylingLast;if(s===-1||e[s]!==o)if(n=ya(o,e,t,n,r),i===null){let c=qD(e,t,r);c!==void 0&&Array.isArray(c)&&(c=ya(null,e,t,c[1],r),c=Cr$2(c,t.attrs,r),GD(e,t,r,c));}else i=zD(e,t,r);}return i!==void 0&&(r?t.residualClasses=i:t.residualStyles=i),n}function qD(e,t,n){let r=n?t.classBindings:t.styleBindings;if(Nn$3(r)!==0)return e[Zt$1(r)]}function GD(e,t,n,r){let o=n?t.classBindings:t.styleBindings;e[Zt$1(o)]=r;}function zD(e,t,n){let r,o=t.directiveEnd;for(let i=1+t.directiveStylingLast;i<o;i++){let s=e[i].hostAttrs;r=Cr$2(r,s,n);}return Cr$2(r,t.attrs,n)}function ya(e,t,n,r,o){let i=null,s=n.directiveEnd,a=n.directiveStylingLast;for(a===-1?a=n.directiveStart:a++;a<s&&(i=t[a],r=Cr$2(r,i.hostAttrs,o),i!==e);)a++;return e!==null&&(n.directiveStylingLast=a),r}function Cr$2(e,t,n){let r=n?1:2,o=-1;if(t!==null)for(let i=0;i<t.length;i++){let s=t[i];typeof s=="number"?o=s:o===r&&(Array.isArray(e)||(e=e===void 0?[]:["",e]),Co$1(e,s,n?true:t[++i]));}return e===void 0?null:e}function QD(e,t,n){if(n==null||n==="")return Y$2;let r=[],o=Sr$2(n);if(Array.isArray(o))for(let i=0;i<o.length;i++)e(r,o[i],true);else if(o instanceof Set)for(let i of o)e(r,i,true);else if(typeof o=="object")for(let i in o)Object.hasOwn(o,i)&&e(r,i,o[i]);else typeof o=="string"&&t(r,o);return r}function ZD(e,t,n){let r=String(t);r!==""&&!r.includes(" ")&&Co$1(e,r,n);}function YD(e,t,n,r,o,i,s,a){o===Q$2&&(o=Y$2);let c=0,l=0,u=0<o.length?o[0]:null,d=0<i.length?i[0]:null;for(;u!==null||d!==null;){let p=c<o.length?o[c+1]:void 0,f=l<i.length?i[l+1]:void 0,h=null,g;u===d?(c+=2,l+=2,p!==f&&(h=d,g=f)):d===null||u!==null&&u<d?(c+=2,h=u):(l+=2,h=d,g=f),h!==null&&Xp(e,t,n,r,h,g,s,a),u=c<o.length?o[c]:null,d=l<i.length?i[l]:null;}}function Xp(e,t,n,r,o,i,s,a){if(!(t.type&3))return;let c=e.data,l=c[a+1],u=kD(l)?Sd$1(c,t,n,o,Nn$3(l),s):void 0;if(!vi$2(u)){vi$2(i)||AD(l)&&(i=Sd$1(c,null,n,o,a,s));let d=Fs$2(ge$3(),n);_v(r,s,d,o,i);}}function Sd$1(e,t,n,r,o,i){let s=t===null,a;for(;o>0;){let c=e[o],l=Array.isArray(c),u=l?c[1]:c,d=u===null,p=n[o+1];p===Q$2&&(p=d?Y$2:void 0);let f=d?bo$1(p,r):u===r?p:void 0;if(l&&!vi$2(f)&&(f=bo$1(c,r)),vi$2(f)&&(a=f,s))return a;let h=e[o+1];o=s?Zt$1(h):Nn$3(h);}if(t!==null){let c=i?t.residualClasses:t.residualStyles;c!=null&&(a=bo$1(c,r));}return a}function vi$2(e){return e!==void 0}function KD(e,t){return e==null||e===""||(typeof t=="string"?e=e+t:typeof e=="object"&&(e=Jn$3(Sr$2(e)))),e}function eh$1(e,t){return (e.flags&(t?8:16))!==0}function JD(e,t=""){let n=y$1(),r=P$3(),o=e+O$3,i=r.firstCreatePass?Kt$3(r,o,1,t,null):r.data[o],s=XD(r,n,i,t);n[o]=s,Vo$1()&&mc$1(r,n,s,i),jt$5(i,false);}var XD=(e,t,n,r)=>(ur$3(true),Ly(t[L$2],r));function th$1(e,t,n,r=""){return me$2(e,Vt$2(),n)?t+Qe$3(n)+r:Q$2}function ew(e,t,n,r,o,i=""){let s=Ks$1(),a=xc$1(e,s,n,o);return ar$3(2),a?t+Qe$3(n)+r+Qe$3(o)+i:Q$2}function tw(e,t,n,r,o,i,s,a=""){let c=Ks$1(),l=yI(e,c,n,o,s);return ar$3(3),l?t+Qe$3(n)+r+Qe$3(o)+i+Qe$3(s)+a:Q$2}function nh$1(e){return Qc$1("",e),nh$1}function Qc$1(e,t,n){let r=y$1(),o=th$1(r,e,t,n);return o!==Q$2&&Zc$1(r,ge$3(),o),Qc$1}function rh$1(e,t,n,r,o){let i=y$1(),s=ew(i,e,t,n,r,o);return s!==Q$2&&Zc$1(i,ge$3(),s),rh$1}function oh(e,t,n,r,o,i,s){let a=y$1(),c=tw(a,e,t,n,r,o,i,s);return c!==Q$2&&Zc$1(a,ge$3(),c),oh}function Zc$1(e,t,n){let r=Fs$2(t,e);Fy(e[L$2],r,n);}var ih$1={};function sh$1(e){Be$3("NgLet");let t=P$3(),n=y$1(),r=e+O$3,o=Kt$3(t,r,128,null,null);return jt$5(o,false),or$3(t,n,r,ih$1),sh$1}function nw(e){let t=P$3(),n=y$1(),r=ge$3();return or$3(t,n,r,e),e}function rw(e){let t=Zs$1(),n=rr$3(t,O$3+e);if(n===ih$1)throw new M$2(314,false);return n}function ow(e,t,n=""){return th$1(y$1(),e,t,n)}function Nd(e,t,n){let r=P$3();r.firstCreatePass&&ah$1(t,r.data,r.blueprint,je$4(e),n);}function ah$1(e,t,n,r,o){if(e=z$3(e),Array.isArray(e))for(let i=0;i<e.length;i++)ah$1(e[i],t,n,r,o);else {let i=P$3(),s=y$1(),a=B$1(),c=Nt$3(e)?e:z$3(e.provide),l=Rs$2(e),u=a.providerIndexes&1048575,d=a.directiveStart,p=a.providerIndexes>>20;if(Nt$3(e)||!e.multi){let f=new Ut$4(l,o,Ar$2,null),h=Ia(c,t,u+p,d);h===-1?(wa(ri$3(a,s),i,c),va(i,e,t.length),t.push(c),a.directiveStart++,a.directiveEnd++,n.push(f),s.push(f)):(n[h]=f,s[h]=f);}else {let f=Ia(c,t,u+p,d),h=Ia(c,t,u,u+p),g=f>=0&&n[f],D=h>=0&&n[h];if(!g){wa(ri$3(a,s),i,c);let _=aw(iw,n.length,o,r,l);D&&(n[h].providerFactory=_),va(i,e,t.length,0),t.push(c),a.directiveStart++,a.directiveEnd++,n.push(_),s.push(_);}else {let _=ch$1(n[f],l,r);va(i,e,f>-1?f:h,_);}r&&D&&n[h].componentProviders++;}}}function va(e,t,n,r){let o=Nt$3(t),i=su(t);if(o||i){let c=(i?z$3(t.useClass):t).prototype.ngOnDestroy;if(c){let l=e.destroyHooks||(e.destroyHooks=[]);if(!o&&t.multi){let u=l.indexOf(n);u===-1?l.push(n,[r,c]):l[u+1].push(r,c);}else l.push(n,c);}}}function ch$1(e,t,n){return n&&e.componentProviders++,e.multi.push(t)-1}function Ia(e,t,n,r){for(let o=n;o<r;o++)if(t[o]===e)return o;return  -1}function iw(e,t,n,r,o){return tc$2(this.multi,[])}function tc$2(e,t){for(let n=0;n<e.length;n++){let r=e[n];t.push(r());}return t}function aw(e,t,n,r,o,i){let s=new Ut$4(e,n,Ar$2,null);return s.multi=[],s.index=t,s.componentProviders=0,ch$1(s,o,r&&!n),s}function cw(e,t){return n=>{n.providersResolver=(r,o)=>Nd(r,o?o(e):e,false);}}function lw(e,t){let n=Oo$1()+e,r=y$1();return r[n]===Q$2?Nc$1(r,n,t()):mI(r,n)}function lh$1(e,t){let n=e[t];return n===Q$2?void 0:n}function uw(e,t,n,r,o,i){let s=t+n;return me$2(e,s,o)?Nc$1(e,s+1,i?r.call(i,o):r(o)):lh$1(e,s+1)}function dw(e,t,n,r,o,i,s){let a=t+n;return xc$1(e,a,o,i)?Nc$1(e,a+2,s?r.call(s,o,i):r(o,i)):lh$1(e,a+2)}function fw(e,t){let n=P$3(),r,o=e+O$3;n.firstCreatePass?(r=pw(t,n.pipeRegistry),n.data[o]=r,r.onDestroy&&(n.destroyHooks??=[]).push(o,r.onDestroy)):r=n.data[o];let i=r.factory||(r.factory=rt$2(r.type)),a=ee$1(Ar$2);try{let c=ni$3(!1),l=i();return ni$3(c),or$3(n,y$1(),o,l),l}finally{ee$1(a);}}function pw(e,t){if(t)for(let n=t.length-1;n>=0;n--){let r=t[n];if(e===r.name)return r}}function hw(e,t,n){let r=e+O$3,o=y$1(),i=rr$3(o,r);return uh$1(o,r)?uw(o,Oo$1(),t,i.transform,n,i):i.transform(n)}function gw(e,t,n,r){let o=e+O$3,i=y$1(),s=rr$3(i,o);return uh$1(i,o)?dw(i,Oo$1(),t,s.transform,n,r,s):s.transform(n,r)}function uh$1(e,t){return e[m$1].data[t].pure}function mw(e,t){return Ni$1(e,t)}var dh$1=(()=>{class e{applicationErrorHandler=T$2(dt$2);appRef=T$2(Rr$3);taskService=T$2(Ht$4);ngZone=T$2(De$3);zonelessEnabled=T$2(fr$3);tracing=T$2(Yt$1,{optional:true});zoneIsDefined=typeof Zone<"u"&&!!Zone.root.run;schedulerTickApplyArgs=[{data:{__scheduler_tick__:true}}];subscriptions=new G$2;angularZoneId=this.zoneIsDefined?this.ngZone._inner?.get(Zn$3):null;scheduleInRootZone=!this.zonelessEnabled&&this.zoneIsDefined&&(T$2(ia,{optional:true})??false);cancelScheduledCallback=null;useMicrotaskScheduler=false;runningTick=false;pendingRenderTaskId=null;constructor(){this.subscriptions.add(this.appRef.afterTick.subscribe(()=>{let n=this.taskService.add();if(!this.runningTick&&(this.cleanup(),!this.zonelessEnabled||this.appRef.includeAllTestViews)){this.taskService.remove(n);return}this.switchToMicrotaskScheduler(),this.taskService.remove(n);})),this.subscriptions.add(this.ngZone.onUnstable.subscribe(()=>{this.runningTick||this.cleanup();}));}switchToMicrotaskScheduler(){this.ngZone.runOutsideAngular(()=>{let n=this.taskService.add();this.useMicrotaskScheduler=true,queueMicrotask(()=>{this.useMicrotaskScheduler=false,this.taskService.remove(n);});});}notify(n){if(!this.zonelessEnabled&&n===5)return;switch(n){case 0:case 2:{this.appRef.dirtyFlags|=2;break}case 3:case 4:case 5:case 1:{this.appRef.dirtyFlags|=4;break}case 6:{this.appRef.dirtyFlags|=2;break}case 12:{this.appRef.dirtyFlags|=16;break}case 13:{this.appRef.dirtyFlags|=2;break}case 11:break;default:this.appRef.dirtyFlags|=8;}if(this.appRef.tracingSnapshot=this.tracing?.snapshot(this.appRef.tracingSnapshot)??null,!this.shouldScheduleTick())return;let r=this.useMicrotaskScheduler?ku:na;this.pendingRenderTaskId=this.taskService.add(),this.scheduleInRootZone?this.cancelScheduledCallback=Zone.root.run(()=>r(()=>this.tick())):this.cancelScheduledCallback=this.ngZone.runOutsideAngular(()=>r(()=>this.tick()));}shouldScheduleTick(){return !(this.appRef.destroyed||this.pendingRenderTaskId!==null||this.runningTick||this.appRef._runningTick||!this.zonelessEnabled&&this.zoneIsDefined&&Zone.current.get(Zn$3+this.angularZoneId))}tick(){if(this.runningTick||this.appRef.destroyed)return;if(this.appRef.dirtyFlags===0){this.cleanup();return}!this.zonelessEnabled&&this.appRef.dirtyFlags&7&&(this.appRef.dirtyFlags|=1);let n=this.taskService.add();try{this.ngZone.run(()=>{this.runningTick=!0,this.appRef._tick();},void 0,this.schedulerTickApplyArgs);}catch(r){this.applicationErrorHandler(r);}finally{this.taskService.remove(n),this.cleanup();}}ngOnDestroy(){this.subscriptions.unsubscribe(),this.cleanup();}cleanup(){if(this.runningTick=false,this.cancelScheduledCallback?.(),this.cancelScheduledCallback=null,this.pendingRenderTaskId!==null){let n=this.pendingRenderTaskId;this.pendingRenderTaskId=null,this.taskService.remove(n);}}static \u0275fac=function(r){return new(r||e)};static \u0275prov=_r$3({token:e,factory:e.\u0275fac})}return e})();function fh(){return [{provide:Re$4,useExisting:dh$1},{provide:De$3,useClass:Yn$3},{provide:fr$3,useValue:true}]}var yw=(()=>{class e{compileModuleSync(n){return new hi$2(n)}compileModuleAsync(n){return Promise.resolve(this.compileModuleSync(n))}clearCache(){}clearCacheFor(n){}getModuleId(n){}static \u0275fac=function(r){return new(r||e)};static \u0275prov=_r$3({token:e,factory:e.\u0275fac})}return e})();function vw(){return typeof $localize<"u"&&$localize.locale||kr$3}var Yc$1=new N$3("",{factory:()=>T$2(Yc$1,{optional:true,skipSelf:true})||vw()});var ki$1=class ki{destroyed=false;listeners=null;errorHandler=T$2(ze$2,{optional:true});destroyRef=T$2(Ve$4);constructor(){this.destroyRef.onDestroy(()=>{this.destroyed=true,this.listeners=null;});}subscribe(t){if(this.destroyed)throw new M$2(953,false);return (this.listeners??=[]).push(t),{unsubscribe:()=>{let n=this.listeners?.indexOf(t);n!==void 0&&n!==-1&&this.listeners?.splice(n,1);}}}emit(t){if(this.destroyed){console.warn(Kn$3(953,false));return}if(this.listeners===null)return;let n=v$1(null);try{for(let r of this.listeners)try{r(t);}catch(o){this.errorHandler?.handleError(o);}}finally{v$1(n);}}};function Iw(e,t){return jn$3(e,t?.equal)}function Ew(e){return dl$1(e)}var Dw=e=>e;function ww(e,t){if(typeof e=="function"){let n=qi$1(e,Dw,t?.equal);return ph$1(n)}else {let n=qi$1(e.source,e.computation,e.equal);return ph$1(n,e.debugName)}}function ph$1(e,t){let n=e[V],r=e;return r.set=o=>ll$1(n,o),r.update=o=>ul$1(n,o),r.asReadonly=Bo$1.bind(e),r}var vh=Symbol("InputSignalNode#UNSET"),Tw=s(r({},Vn$3),{transformFn:void 0,applyValueToInputSignal(e,t){It$3(e,t);}});function Ih(e,t){let n=Object.create(Tw);n.value=e,n.transformFn=t?.transform;function r(){if(et$2(n),n.value===vh){let o=null;throw new M$2(-950,o)}return n.value}return r[V]=n,r}var hh$1=class hh{attributeName;constructor(t){this.attributeName=t;}__NG_ELEMENT_ID__=()=>Gd$1(this.attributeName);toString(){return `HostAttributeToken ${this.attributeName}`}};function LF(e){return Cw(e)?e.default:e}function Cw(e){return e&&typeof e=="object"&&"default"in e}function FF(e){return new ki$1}function gh(e,t){return Ih(e,t)}function bw(e){return Ih(vh,e)}var jF=(gh.required=bw,gh);function mh$1(e,t){return Lc$1()}function _w(e,t){return Fc$1()}var VF=(mh$1.required=_w,mh$1);function yh(e,t){return Lc$1()}function Mw(e,t){return Fc$1()}var HF=(yh.required=Mw,yh);var $F=(()=>{class e{static __NG_ELEMENT_ID__=Nw}return e})();function Nw(e){return xw(B$1(),y$1(),(e&16)===16)}function xw(e,t,n){if(Ye$5(e)&&!n){let r=he$2(e.index,t);return new ht$3(r,r)}else if(e.type&175){let r=t[te$1];return new ht$3(r,t)}return null}var Jc$1=new N$3(""),Aw=new N$3("");function Or$2(e){return !e.moduleRef}function Rw(e){let t=Or$2(e)?e.r3Injector:e.moduleRef.injector,n=t.get(De$3);return n.run(()=>{Or$2(e)?e.r3Injector.resolveInjectorInitializers():e.moduleRef.resolveInjectorInitializers();let r=t.get(dt$2),o;if(n.runOutsideAngular(()=>{o=n.onError.subscribe({next:r});}),Or$2(e)){let i=()=>t.destroy(),s=e.platformInjector.get(Jc$1);s.add(i),t.onDestroy(()=>{o.unsubscribe(),s.delete(i);});}else {let i=()=>e.moduleRef.destroy(),s=e.platformInjector.get(Jc$1);s.add(i),e.moduleRef.onDestroy(()=>{mr$3(e.allPlatformModules,e.moduleRef),o.unsubscribe(),s.delete(i);});}return Ow(r,n,()=>{let i=t.get(Ht$4),s=i.add(),a=t.get(Hc$1);return a.runInitializers(),a.donePromise.then(()=>{let c=t.get(Yc$1,kr$3);if(Vp(c||kr$3),!t.get(Aw,!0))return Or$2(e)?t.get(Rr$3):(e.allPlatformModules.push(e.moduleRef),e.moduleRef);if(Or$2(e)){let u=t.get(Rr$3);return e.rootComponent!==void 0&&u.bootstrap(e.rootComponent),u}else return kw?.(e.moduleRef,e.allPlatformModules),e.moduleRef}).finally(()=>{i.remove(s);})})})}var kw;function Ow(e,t,n){try{let r=n();return jc$1(r)?r.catch(o=>{throw t.runOutsideAngular(()=>e(o)),o}):r}catch(r){throw t.runOutsideAngular(()=>e(r)),r}}var Oi$2=null;function Pw(e=[],t){return Ee$4.create({name:t,providers:[{provide:As$1,useValue:"platform"},{provide:Jc$1,useValue:new Set([()=>Oi$2=null])},...e]})}function Lw(e=[]){if(Oi$2)return Oi$2;let t=Pw(e);return Oi$2=t,xp(),Fw(t),t}function Fw(e){let t=e.get(Fu,null);So$1(e,()=>{t?.forEach(n=>n());});}function UF(e){let{rootComponent:t,appProviders:n,platformProviders:r,platformRef:o}=e;R$3(A$2.BootstrapApplicationStart);try{let i=o?.injector??Lw(r),s=[fh(),Pu,...n||[]],a=new Tr$2({providers:s,parent:i,debugName:"",runEnvironmentInitializers:!1});return Rw({r3Injector:a.injector,platformInjector:i,rootComponent:t})}catch(i){return Promise.reject(i)}finally{R$3(A$2.BootstrapApplicationEnd);}}function WF(e){return typeof e=="boolean"?e:e!=null&&e!=="false"}function qF(e,t=NaN){return !isNaN(parseFloat(e))&&!isNaN(Number(e))?Number(e):t}var Kc$1=Symbol("NOT_SET"),Eh=new Set,jw=s(r({},Vn$3),{kind:"afterRenderEffectPhase",consumerIsAlwaysLive:true,consumerAllowSignalWrites:true,value:Kc$1,cleanup:null,consumerMarkedDirty(){if(this.sequence.impl.executing){if(this.sequence.lastPhase===null||this.sequence.lastPhase<this.phase)return;this.sequence.erroredOrDestroyed=true;}this.sequence.scheduler.notify(7);},phaseFn(e){if(this.sequence.lastPhase=this.phase,!this.dirty)return this.signal;if(this.dirty=false,this.value!==Kc$1&&!Xt$1(this))return this.signal;try{for(let o of this.cleanup??Eh)o();}finally{this.cleanup?.clear();}let t=[];e!==void 0&&t.push(e),t.push(this.registerCleanupFn);let n=$e$3(this),r;try{r=this.userFn.apply(null,t);}finally{tt$2(this,n);}return (this.value===Kc$1||!this.equal(this.value,r))&&(this.value=r,this.version++),this.signal}}),Xc$1=class Xc extends vr$2{scheduler;lastPhase=null;nodes=[void 0,void 0,void 0,void 0];onDestroyFns=null;constructor(t,n,r,o,i,s=null){super(t,[void 0,void 0,void 0,void 0],r,false,i.get(Ve$4),s),this.scheduler=o;for(let a of fc$1){let c=n[a];if(c===void 0)continue;let l=Object.create(jw);l.sequence=this,l.phase=a,l.userFn=c,l.dirty=true,l.signal=()=>(et$2(l),l.value),l.signal[V]=l,l.registerCleanupFn=u=>(l.cleanup??=new Set).add(u),this.nodes[a]=l,this.hooks[a]=u=>l.phaseFn(u);}}afterRun(){super.afterRun(),this.lastPhase=null;}destroy(){if(this.onDestroyFns!==null)for(let t of this.onDestroyFns)t();super.destroy();for(let t of this.nodes)if(t)try{for(let n of t.cleanup??Eh)n();}finally{nt$2(t);}}};function GF(e,t){let n=T$2(Ee$4),r=n.get(Re$4),o=n.get(Ti$1),i=n.get(Yt$1,null,{optional:true});o.impl??=n.get(pc$2);let s=e;typeof s=="function"&&(s={mixedReadWrite:e});let a=n.get(wn$3,null,{optional:true}),c=new Xc$1(o.impl,[s.earlyRead,s.write,s.mixedReadWrite,s.read],a?.view,r,n,i?.snapshot(null));return o.impl.register(c),c}function zF(e,t){let n=ke$3(e),r=t.elementInjector||mn$3();return new zt$3(n).create(r,t.projectableNodes,t.hostElement,t.environmentInjector,t.directives,t.bindings)}function QF(e){let t=ke$3(e);if(!t)return null;let n=new zt$3(t);return {get selector(){return n.selector},get type(){return n.componentType},get inputs(){return n.inputs},get outputs(){return n.outputs},get ngContentSelectors(){return n.ngContentSelectors},get isStandalone(){return t.standalone},get isSignal(){return t.signals}}}function ZF(){return  false}var _$2=(()=>{class r{transform(t){if(t==null)return "-";if(!Number.isFinite(t))return "0:00";let e=t<0?"-":"",o=Math.abs(t),u=Math.floor(o/60),p=Math.floor(o%60);return `${e}${u}:${String(p).padStart(2,"0")}`}static \u0275fac=function(e){return new(e||r)};static \u0275pipe=hE({name:"formatDuration",type:r,pure:true})}return r})();function A$1(r){return `${r.targetID??0}:${r.targetInstance??0}`}function f$1(r,n){return (r-n)/1e3}function S$2(r$1,n){return r$1.map(t=>s(r({},t),{atS:f$1(t.timestamp,n)}))}var l=1,m=6603,g=291807;function d(r){return r===l?m:r<0?g:r}function h(r,n){return r.map(t=>{let e=n[t];return e?{id:t,icon:e.icon,name:e.name}:(a("windowSpells: ability id missing from ability map",t),{id:t,icon:"",name:`Ability #${t}`})})}var pn$2=null;function R$2(){return pn$2}function at$2(n){pn$2??=n;}var he$1=class he{},ee=(()=>{class n{historyGo(e){throw new Error("")}static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:()=>T$2(mn$2),providedIn:"platform"})}return n})();var mn$2=(()=>{class n extends ee{_location;_history;_doc=T$2(dr$3);constructor(){super(),this._location=window.location,this._history=window.history;}getBaseHrefFromDOM(){return R$2().getBaseHref(this._doc)}onPopState(e){let t=R$2().getGlobalEventTarget(this._doc,"window");return t.addEventListener("popstate",e,false),()=>t.removeEventListener("popstate",e)}onHashChange(e){let t=R$2().getGlobalEventTarget(this._doc,"window");return t.addEventListener("hashchange",e,false),()=>t.removeEventListener("hashchange",e)}get href(){return this._location.href}get protocol(){return this._location.protocol}get hostname(){return this._location.hostname}get port(){return this._location.port}get pathname(){return this._location.pathname}get search(){return this._location.search}get hash(){return this._location.hash}set pathname(e){this._location.pathname=e;}pushState(e,t,i){this._history.pushState(e,t,i);}replaceState(e,t,i){this._history.replaceState(e,t,i);}forward(){this._history.forward();}back(){this._history.back();}historyGo(e=0){this._history.go(e);}getState(){return this._history.state}static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:()=>new n,providedIn:"platform"})}return n})();function En$2(n,r){return n?r?n.endsWith("/")?r.startsWith("/")?n+r.slice(1):n+r:r.startsWith("/")?n+r:`${n}/${r}`:n:r}function Dn$2(n){let r=n.search(/#|\?|$/);return n[r-1]==="/"?n.slice(0,r-1)+n.slice(r):n}function j$2(n){return n&&n[0]!=="?"?`?${n}`:n}var Me$2=(()=>{class n{historyGo(e){throw new Error("")}static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:()=>T$2(rr$2),providedIn:"root"})}return n})(),nr$3=new N$3(""),rr$2=(()=>{class n extends Me$2{_platformLocation;_baseHref;_removeListenerFns=[];constructor(e,t){super(),this._platformLocation=e,this._baseHref=t??this._platformLocation.getBaseHrefFromDOM()??T$2(dr$3).location?.origin??"";}ngOnDestroy(){for(;this._removeListenerFns.length;)this._removeListenerFns.pop()();}onPopState(e){this._removeListenerFns.push(this._platformLocation.onPopState(e),this._platformLocation.onHashChange(e));}getBaseHref(){return this._baseHref}prepareExternalUrl(e){return En$2(this._baseHref,e)}path(e=false){let t=this._platformLocation.pathname+j$2(this._platformLocation.search),i=this._platformLocation.hash;return i&&e?`${t}${i}`:t}pushState(e,t,i,o){let s=this.prepareExternalUrl(i+j$2(o));this._platformLocation.pushState(e,t,s);}replaceState(e,t,i,o){let s=this.prepareExternalUrl(i+j$2(o));this._platformLocation.replaceState(e,t,s);}forward(){this._platformLocation.forward();}back(){this._platformLocation.back();}getState(){return this._platformLocation.getState()}historyGo(e=0){this._platformLocation.historyGo?.(e);}static \u0275fac=function(t){return new(t||n)(Ae$4(ee),Ae$4(nr$3,8))};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var vn$1=(()=>{class n{_subject=new ie$1;_basePath;_locationStrategy;_urlChangeListeners=[];_urlChangeSubscription=null;constructor(e){this._locationStrategy=e;let t=this._locationStrategy.getBaseHref();this._basePath=sr$2(Dn$2(yn$1(t))),this._locationStrategy.onPopState(i=>{this._subject.next({url:this.path(true),pop:true,state:i.state,type:i.type});});}ngOnDestroy(){this._urlChangeSubscription?.unsubscribe(),this._urlChangeListeners=[];}path(e=false){return this.normalize(this._locationStrategy.path(e))}getState(){return this._locationStrategy.getState()}isCurrentPathEqualTo(e,t=""){return this.path()==this.normalize(e+j$2(t))}normalize(e){return n.stripTrailingSlash(or$2(this._basePath,yn$1(e)))}prepareExternalUrl(e){return e&&e[0]!=="/"&&(e="/"+e),this._locationStrategy.prepareExternalUrl(e)}go(e,t="",i=null){this._locationStrategy.pushState(i,"",e,t),this._notifyUrlChangeListeners(this.prepareExternalUrl(e+j$2(t)),i);}replaceState(e,t="",i=null){this._locationStrategy.replaceState(i,"",e,t),this._notifyUrlChangeListeners(this.prepareExternalUrl(e+j$2(t)),i);}forward(){this._locationStrategy.forward();}back(){this._locationStrategy.back();}historyGo(e=0){this._locationStrategy.historyGo?.(e);}onUrlChange(e){return this._urlChangeListeners.push(e),this._urlChangeSubscription??=this.subscribe(t=>{this._notifyUrlChangeListeners(t.url,t.state);}),()=>{let t=this._urlChangeListeners.indexOf(e);this._urlChangeListeners.splice(t,1),this._urlChangeListeners.length===0&&(this._urlChangeSubscription?.unsubscribe(),this._urlChangeSubscription=null);}}_notifyUrlChangeListeners(e="",t){this._urlChangeListeners.forEach(i=>i(e,t));}subscribe(e,t,i){return this._subject.subscribe({next:e,error:t??void 0,complete:i??void 0})}static normalizeQueryParams=j$2;static joinWithSlash=En$2;static stripTrailingSlash=Dn$2;static \u0275fac=function(t){return new(t||n)(Ae$4(Me$2))};static \u0275prov=re$2({token:n,factory:()=>ir$3(),providedIn:"root"})}return n})();function ir$3(){return new vn$1(Ae$4(Me$2))}function or$2(n,r){if(!n||!r.startsWith(n))return r;let e=r.substring(n.length);return e===""||["/",";","?","#"].includes(e[0])?e:r}function yn$1(n){return n.replace(/\/index\.html$/,"")}function sr$2(n){if(new RegExp("^(https?:)?//").test(n)){let[,e]=n.split(/\/\/[^\/]+/);return e}return n}var dt$1=(function(n){return n[n.Decimal=0]="Decimal",n[n.Percent=1]="Percent",n[n.Currency=2]="Currency",n[n.Scientific=3]="Scientific",n})(dt$1||{});var M$1={Decimal:0,Group:1,MinusSign:5,Exponential:6,Infinity:9,CurrencyDecimal:12,CurrencyGroup:13};function te(n,r){let e=yD(n),t=e[vD.NumberSymbols][r];if(typeof t>"u"){if(r===M$1.CurrencyDecimal)return e[vD.NumberSymbols][M$1.Decimal];if(r===M$1.CurrencyGroup)return e[vD.NumberSymbols][M$1.Group]}return t}function _n$2(n,r){return yD(n)[vD.NumberFormats][r]}var ar$2=/^(\d+)?\.((\d+)(-(\d+))?)?$/,wn$2=22,Re$3=".",ge$2="0",ur$2=";",cr$3=",",ut$2="#";function lr$3(n,r,e,t,i,o,s=false){let a="",u=false;if(!isFinite(n))a=te(e,M$1.Infinity);else {let c=hr$2(n);s&&(c=fr$2(c));let f=r.minInt,d=r.minFrac,D=r.maxFrac;if(o){let b=o.match(ar$2);if(b===null)throw new M$2(2306,false);let L=b[1],I=b[3],x=b[5];L!=null&&(f=ct$1(L)),I!=null&&(d=ct$1(I)),x!=null?D=ct$1(x):I!=null&&d>D&&(D=d);let A=100;if(f>A||d>A||D>A)throw new M$2(2306,false)}gr$2(c,d,D);let E=c.digits,w=c.integerLen,$=c.exponent,v=[];for(u=E.every(b=>!b);w<f;w++)E.unshift(0);for(;w<0;w++)E.unshift(0);w>0?v=E.splice(w,E.length):(v=E,E=[0]);let C=[];for(E.length>=r.lgSize&&C.unshift(E.splice(-r.lgSize,E.length).join(""));E.length>r.gSize;)C.unshift(E.splice(-r.gSize,E.length).join(""));E.length&&C.unshift(E.join("")),a=C.join(te(e,t)),v.length&&(a+=te(e,i)+v.join("")),$&&(a+=te(e,M$1.Exponential)+"+"+$);}return n<0&&!u?a=r.negPre+a+r.negSuf:a=r.posPre+a+r.posSuf,a}function Sn$2(n,r,e){let t=_n$2(r,dt$1.Decimal),i=dr$2(t,te(r,M$1.MinusSign));return lr$3(n,i,r,M$1.Group,M$1.Decimal,e)}function dr$2(n,r="-"){let e={minInt:1,minFrac:0,maxFrac:0,posPre:"",posSuf:"",negPre:"",negSuf:"",gSize:0,lgSize:0},t=n.split(ur$2),i=t[0],o=t[1],s=i.indexOf(Re$3)!==-1?i.split(Re$3):[i.substring(0,i.lastIndexOf(ge$2)+1),i.substring(i.lastIndexOf(ge$2)+1)],a=s[0],u=s[1]||"";e.posPre=a.substring(0,a.indexOf(ut$2));for(let f=0;f<u.length;f++){let d=u.charAt(f);d===ge$2?e.minFrac=e.maxFrac=f+1:d===ut$2?e.maxFrac=f+1:e.posSuf+=d;}let c=a.split(cr$3);if(e.gSize=c[1]?c[1].length:0,e.lgSize=c[2]||c[1]?(c[2]||c[1]).length:0,o){let f=i.length-e.posPre.length-e.posSuf.length,d=o.indexOf(ut$2);e.negPre=o.substring(0,d).replace(/'/g,""),e.negSuf=o.slice(d+f).replace(/'/g,"");}else e.negPre=r+e.posPre,e.negSuf=e.posSuf;return e}function fr$2(n){if(n.digits[0]===0)return n;let r=n.digits.length-n.integerLen;return n.exponent?n.exponent+=2:(r===0?n.digits.push(0,0):r===1&&n.digits.push(0),n.integerLen+=2),n}function hr$2(n){let r=Math.abs(n)+"",e=0,t,i,o,s,a;for((i=r.indexOf(Re$3))>-1&&(r=r.replace(Re$3,"")),(o=r.search(/e/i))>0?(i<0&&(i=o),i+=+r.slice(o+1),r=r.substring(0,o)):i<0&&(i=r.length),o=0;r.charAt(o)===ge$2;o++);if(o===(a=r.length))t=[0],i=1;else {for(a--;r.charAt(a)===ge$2;)a--;for(i-=o,t=[],s=0;o<=a;o++,s++)t[s]=Number(r.charAt(o));}return i>wn$2&&(t=t.splice(0,wn$2-1),e=i-1,i=1),{digits:t,exponent:e,integerLen:i}}function gr$2(n,r,e){if(r>e)throw new M$2(2307,false);let t=n.digits,i=t.length-n.integerLen,o=Math.min(Math.max(r,i),e),s=o+n.integerLen,a=t[s];if(s>0){t.splice(Math.max(n.integerLen,s));for(let d=s;d<t.length;d++)t[d]=0;}else {i=Math.max(0,i),n.integerLen=1,t.length=Math.max(1,s=o+1),t[0]=0;for(let d=1;d<s;d++)t[d]=0;}if(a>=5)if(s-1<0){for(let d=0;d>s;d--)t.unshift(0),n.integerLen++;t.unshift(1),n.integerLen++;}else t[s-1]++;for(;i<Math.max(0,o);i++)t.push(0);let u=o!==0,c=r+n.integerLen,f=t.reduceRight(function(d,D,E,w){return D=D+d,w[E]=D<10?D:D-10,u&&(w[E]===0&&E>=c?w.pop():u=false),D>=10?1:0},0);f&&(t.unshift(f),n.integerLen++);}function ct$1(n){let r=parseInt(n);if(isNaN(r))throw new M$2(2305,false);return r}var pr$3=(()=>{class n{_viewContainerRef;_viewRef=null;ngTemplateOutletContext=null;ngTemplateOutlet=null;ngTemplateOutletInjector=null;injector=T$2(Ee$4);constructor(e){this._viewContainerRef=e;}ngOnChanges(e){if(this._shouldRecreateView(e)){let t=this._viewContainerRef;if(this._viewRef&&t.remove(t.indexOf(this._viewRef)),!this.ngTemplateOutlet){this._viewRef=null;return}let i=this._createContextForwardProxy();this._viewRef=t.createEmbeddedView(this.ngTemplateOutlet,i,{injector:this._getInjector()});}}_getInjector(){return this.ngTemplateOutletInjector==="outlet"?this.injector:this.ngTemplateOutletInjector??void 0}_shouldRecreateView(e){return !!e.ngTemplateOutlet||!!e.ngTemplateOutletInjector}_createContextForwardProxy(){return new Proxy({},{set:(e,t,i)=>this.ngTemplateOutletContext?Reflect.set(this.ngTemplateOutletContext,t,i):false,get:(e,t,i)=>{if(this.ngTemplateOutletContext)return Reflect.get(this.ngTemplateOutletContext,t,i)}})}static \u0275fac=function(t){return new(t||n)(Ar$2(xi$2))};static \u0275dir=pE({type:n,selectors:[["","ngTemplateOutlet",""]],inputs:{ngTemplateOutletContext:"ngTemplateOutletContext",ngTemplateOutlet:"ngTemplateOutlet",ngTemplateOutletInjector:"ngTemplateOutletInjector"},features:[xm$1]})}return n})();function mr$2(n,r){return new M$2(2100,false)}var Dr$1=(()=>{class n{_locale;constructor(e){this._locale=e;}transform(e,t,i){if(!yr$2(e))return null;i||=this._locale;try{let o=Er$1(e);return Sn$2(o,i,t)}catch(o){throw mr$2(n,o.message)}}static \u0275fac=function(t){return new(t||n)(Ar$2(Yc$1,16))};static \u0275pipe=hE({name:"number",type:n,pure:true})}return n})();function yr$2(n){return !(n==null||n===""||n!==n)}function Er$1(n){if(typeof n=="string"&&!isNaN(Number(n)-parseFloat(n)))return Number(n);if(typeof n!="number")throw new M$2(2309,false);return n}function pe$1(n,r){r=encodeURIComponent(r);for(let e of n.split(";")){let t=e.indexOf("="),[i,o]=t==-1?[e,""]:[e.slice(0,t),e.slice(t+1)];if(i.trim()===r)return decodeURIComponent(o)}return null}var ft$2="browser";function Ns$1(n){return n===ft$2}function Cn$2(n){return n.replace(/\\/g,"\\\\").replace(/[\n\r\f\0]/g,"").replace(/"/g,'\\"')}var An$2=n=>n.src,br$2=new N$3("",{factory:()=>An$2});var bn$1=/^((\s*\d+w\s*(,|$)){1,})$/;var Ar$1=[1,2],Tr$1=640;var Fr$1=1920,Ir$1=1080;var Ls$1=(()=>{class n{imageLoader=T$2(br$2);config=Mr$1(T$2(hm$1));renderer=T$2(hI);imgElement=T$2(Mr$2).nativeElement;injector=T$2(Ee$4);destroyRef=T$2(Ve$4);lcpObserver;_renderedSrc=null;ngSrc;ngSrcset;sizes;width;height;decoding;loading;priority=false;loaderParams;disableOptimizedSrcset=false;fill=false;placeholder;placeholderConfig;src;srcset;constructor(){this.destroyRef.onDestroy(()=>{this.renderer.removeAttribute(this.imgElement,"loading");});}ngOnInit(){Be$3("NgOptimizedImage"),this.placeholder&&this.removePlaceholderOnLoad(this.imgElement),this.setHostAttributes();}setHostAttributes(){this.fill?this.sizes||="100vw":(this.setHostAttribute("width",this.width.toString()),this.setHostAttribute("height",this.height.toString())),this.setHostAttribute("loading",this.getLoadingBehavior()),this.setHostAttribute("fetchpriority",this.getFetchPriority()),this.setHostAttribute("decoding",this.getDecoding()),this.setHostAttribute("ng-img","true");this.updateSrcAndSrcset();this.sizes?this.getLoadingBehavior()==="lazy"?this.setHostAttribute("sizes","auto, "+this.sizes):this.setHostAttribute("sizes",this.sizes):this.ngSrcset&&bn$1.test(this.ngSrcset)&&this.getLoadingBehavior()==="lazy"&&this.setHostAttribute("sizes","auto, 100vw");}ngOnChanges(e){if(e.ngSrc&&!e.ngSrc.isFirstChange()){this._renderedSrc;this.updateSrcAndSrcset(true);}}getAspectRatio(){return this.width&&this.height&&this.height!==0?this.width/this.height:null}callImageLoader(e){let t=e;this.loaderParams&&(t.loaderParams=this.loaderParams);let i=this.getAspectRatio();return i!==null&&t.width&&(t.height=Math.round(t.width/i)),this.imageLoader(t)}getLoadingBehavior(){return !this.priority&&this.loading!==void 0?this.loading:this.priority?"eager":"lazy"}getFetchPriority(){return this.priority?"high":"auto"}getDecoding(){return this.priority?"sync":this.decoding??"auto"}getRewrittenSrc(){if(!this._renderedSrc){let e={src:this.ngSrc};this._renderedSrc=this.callImageLoader(e);}return this._renderedSrc}getRewrittenSrcset(){let e=bn$1.test(this.ngSrcset);return this.ngSrcset.split(",").filter(i=>i!=="").map(i=>{i=i.trim();let o=e?parseFloat(i):parseFloat(i)*this.width;return `${this.callImageLoader({src:this.ngSrc,width:o})} ${i}`}).join(", ")}getAutomaticSrcset(){return this.sizes?this.getResponsiveSrcset():this.getFixedSrcset()}getResponsiveSrcset(){let{breakpoints:e}=this.config,t=e;return this.sizes?.trim()==="100vw"&&(t=e.filter(o=>o>=Tr$1)),t.map(o=>`${this.callImageLoader({src:this.ngSrc,width:o})} ${o}w`).join(", ")}updateSrcAndSrcset(e=false){e&&(this._renderedSrc=null);let t=this.getRewrittenSrc();this.setHostAttribute("src",t);let i;return this.ngSrcset?i=this.getRewrittenSrcset():this.shouldGenerateAutomaticSrcset()&&(i=this.getAutomaticSrcset()),i&&this.setHostAttribute("srcset",i),i}getFixedSrcset(){return Ar$1.map(t=>`${this.callImageLoader({src:this.ngSrc,width:this.width*t})} ${t}x`).join(", ")}shouldGenerateAutomaticSrcset(){let e=false;return this.sizes||(e=this.width>Fr$1||this.height>Ir$1),!this.disableOptimizedSrcset&&!this.srcset&&this.imageLoader!==An$2&&!e}generatePlaceholder(e){let{placeholderResolution:t}=this.config;return e===true?`url("${Cn$2(this.callImageLoader({src:this.ngSrc,width:t,isPlaceholder:true}))}")`:typeof e=="string"?`url("${Cn$2(e)}")`:null}shouldBlurPlaceholder(e){return !e||!e.hasOwnProperty("blur")?true:!!e.blur}removePlaceholderOnLoad(e){let t=()=>{let s=this.injector.get($F);i(),o(),this.placeholder=false,s.markForCheck();},i=this.renderer.listen(e,"load",t),o=this.renderer.listen(e,"error",t);this.destroyRef.onDestroy(()=>{i(),o();}),Rr$2(e,t);}setHostAttribute(e,t){this.renderer.setAttribute(this.imgElement,e,t);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=pE({type:n,selectors:[["img","ngSrc",""]],hostVars:18,hostBindings:function(t,i){t&2&&Qp("position",i.fill?"absolute":null)("width",i.fill?"100%":null)("height",i.fill?"100%":null)("inset",i.fill?"0":null)("background-size",i.placeholder?"cover":null)("background-position",i.placeholder?"50% 50%":null)("background-repeat",i.placeholder?"no-repeat":null)("background-image",i.placeholder?i.generatePlaceholder(i.placeholder):null)("filter",i.placeholder&&i.shouldBlurPlaceholder(i.placeholderConfig)?"blur(15px)":null);},inputs:{ngSrc:[2,"ngSrc","ngSrc",Pr$1],ngSrcset:"ngSrcset",sizes:"sizes",width:[2,"width","width",qF],height:[2,"height","height",qF],decoding:"decoding",loading:"loading",priority:[2,"priority","priority",WF],loaderParams:"loaderParams",disableOptimizedSrcset:[2,"disableOptimizedSrcset","disableOptimizedSrcset",WF],fill:[2,"fill","fill",WF],placeholder:[2,"placeholder","placeholder",Or$1],placeholderConfig:"placeholderConfig",src:"src",srcset:"srcset"},features:[xm$1]})}return n})();function Mr$1(n){let r={};return n.breakpoints&&(r.breakpoints=n.breakpoints.sort((e,t)=>e-t)),Object.assign({},ju,n,r)}function Rr$2(n,r){n.complete&&n.naturalWidth&&r();}function Pr$1(n){return typeof n=="string"?n:Sr$2(n)}function Or$1(n){return typeof n=="string"&&n!=="true"&&n!=="false"&&n!==""?n:WF(n)}var me$1=class me{_doc;constructor(r){this._doc=r;}manager},Pe$2=(()=>{class n extends me$1{constructor(e){super(e);}supports(e){return  true}addEventListener(e,t,i,o){return e.addEventListener(t,i,o),()=>this.removeEventListener(e,t,i,o)}removeEventListener(e,t,i,o){return e.removeEventListener(t,i,o)}static \u0275fac=function(t){return new(t||n)(Ae$4(dr$3))};static \u0275prov=re$2({token:n,factory:n.\u0275fac})}return n})(),Le$1=new N$3(""),mt$2=(()=>{class n{_zone;_plugins;_eventNameToPlugin=new Map;constructor(e,t){this._zone=t,e.forEach(s=>{s.manager=this;});let i=e.filter(s=>!(s instanceof Pe$2));this._plugins=i.slice().reverse();let o=e.find(s=>s instanceof Pe$2);o&&this._plugins.push(o);}addEventListener(e,t,i,o){return this._findPluginFor(t).addEventListener(e,t,i,o)}getZone(){return this._zone}_findPluginFor(e){let t=this._eventNameToPlugin.get(e);if(t)return t;if(t=this._plugins.find(o=>o.supports(e)),!t)throw new M$2(5101,false);return this._eventNameToPlugin.set(e,t),t}static \u0275fac=function(t){return new(t||n)(Ae$4(Le$1),Ae$4(De$3))};static \u0275prov=re$2({token:n,factory:n.\u0275fac})}return n})(),ht$2="ng-app-id";function Tn$2(n){for(let r of n)r.remove();}function Fn$2(n,r){let e=r.createElement("style");return e.textContent=n,e}function Nr(n,r,e,t){let i=n.head?.querySelectorAll(`style[${ht$2}="${r}"],link[${ht$2}="${r}"]`);if(!i||i.length===0)return  false;for(let o of i)o.removeAttribute(ht$2),o instanceof HTMLLinkElement?t.set(o.href.slice(o.href.lastIndexOf("/")+1),{usage:0,elements:[o]}):o.textContent&&e.set(o.textContent,{usage:0,elements:[o]});return  true}function pt$3(n,r){let e=r.createElement("link");return e.setAttribute("rel","stylesheet"),e.setAttribute("href",n),e}var Dt$3=(()=>{class n{doc;appId;nonce;inline=new Map;external=new Map;hosts=new Set;constructor(e,t,i,o={}){this.doc=e,this.appId=t,this.nonce=i,Nr(e,t,this.inline,this.external)&&this.hosts.add(e.head);}addStyles(e,t){for(let i of e)this.addUsage(i,this.inline,Fn$2);t?.forEach(i=>this.addUsage(i,this.external,pt$3));}removeStyles(e,t){for(let i of e)this.removeUsage(i,this.inline);t?.forEach(i=>this.removeUsage(i,this.external));}addUsage(e,t,i){let o=t.get(e);o?o.usage++:t.set(e,{usage:1,elements:[...this.hosts].map(s=>this.addElement(s,i(e,this.doc)))});}removeUsage(e,t){let i=t.get(e);i&&(i.usage--,i.usage<=0&&(Tn$2(i.elements),t.delete(e)));}ngOnDestroy(){for(let[,{elements:e}]of [...this.inline,...this.external])Tn$2(e);this.hosts.clear();}addHost(e){if(!this.hosts.has(e)){this.hosts.add(e);for(let[t,{elements:i}]of this.inline)i.push(this.addElement(e,Fn$2(t,this.doc)));for(let[t,{elements:i}]of this.external)i.push(this.addElement(e,pt$3(t,this.doc)));}}removeHost(e){this.hosts.delete(e);for(let t of [...this.inline.values(),...this.external.values()]){let i=[];for(let o of t.elements)o.parentNode===e?o.remove():i.push(o);t.elements=i;}}addElement(e,t){return this.nonce&&t.setAttribute("nonce",this.nonce),e.appendChild(t)}static \u0275fac=function(t){return new(t||n)(Ae$4(dr$3),Ae$4(Lu),Ae$4(pm$1,8),Ae$4(dm$1))};static \u0275prov=re$2({token:n,factory:n.\u0275fac})}return n})(),gt$4={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/",math:"http://www.w3.org/1998/Math/MathML"},yt$4=/%COMP%/g;var Mn$2="%COMP%",Lr$1=`_nghost-${Mn$2}`,xr$1=`_ngcontent-${Mn$2}`,kr$2=true,Br$1=new N$3("",{factory:()=>kr$2});function Ur$1(n){return xr$1.replace(yt$4,n)}function jr$1(n){return Lr$1.replace(yt$4,n)}function Rn$2(n,r){return r.map(e=>e.replace(yt$4,n))}var Et$2=(()=>{class n{eventManager;sharedStylesHost;appId;removeStylesOnCompDestroy;doc;ngZone;nonce;tracingService;rendererByCompId=new Map;defaultRenderer;constructor(e,t,i,o,s,a,u=null,c=null){this.eventManager=e,this.sharedStylesHost=t,this.appId=i,this.removeStylesOnCompDestroy=o,this.doc=s,this.ngZone=a,this.nonce=u,this.tracingService=c,this.defaultRenderer=new De$2(e,s,a,this.tracingService);}createRenderer(e,t){if(!e||!t)return this.defaultRenderer;let i=this.getOrCreateRenderer(e,t);return i instanceof Ne$1?i.applyToHost(e):i instanceof ye$2&&i.applyStyles(),i}getOrCreateRenderer(e,t){let i=this.rendererByCompId,o=i.get(t.id);if(!o){let s=this.doc,a=this.ngZone,u=this.eventManager,c=this.sharedStylesHost,f=this.removeStylesOnCompDestroy,d=this.tracingService;switch(t.encapsulation){case Wt$3.Emulated:o=new Ne$1(u,c,t,this.appId,f,s,a,d);break;case Wt$3.ShadowDom:return new Oe$1(u,e,t,s,a,this.nonce,d,c);case Wt$3.ExperimentalIsolatedShadowDom:return new Oe$1(u,e,t,s,a,this.nonce,d);default:o=new ye$2(u,c,t,f,s,a,d);break}i.set(t.id,o);}return o}ngOnDestroy(){this.rendererByCompId.clear();}componentReplaced(e){this.rendererByCompId.delete(e);}static \u0275fac=function(t){return new(t||n)(Ae$4(mt$2),Ae$4(Jf),Ae$4(Lu),Ae$4(Br$1),Ae$4(dr$3),Ae$4(De$3),Ae$4(pm$1),Ae$4(Yt$1,8))};static \u0275prov=re$2({token:n,factory:n.\u0275fac})}return n})(),De$2=class De{eventManager;doc;ngZone;tracingService;data=Object.create(null);throwOnSyntheticProps=true;constructor(r,e,t,i){this.eventManager=r,this.doc=e,this.ngZone=t,this.tracingService=i;}destroy(){}destroyNode=null;createElement(r,e){return e?this.doc.createElementNS(gt$4[e]||e,r):this.doc.createElement(r)}createComment(r){return this.doc.createComment(r)}createText(r){return this.doc.createTextNode(r)}appendChild(r,e){(In$2(r)?r.content:r).appendChild(e);}insertBefore(r,e,t){r&&(In$2(r)?r.content:r).insertBefore(e,t);}removeChild(r,e){e.remove();}selectRootElement(r,e){let t=typeof r=="string"?this.doc.querySelector(r):r;if(!t)throw new M$2(-5104,false);return e||(t.textContent=""),t}parentNode(r){return r.parentNode}nextSibling(r){return r.nextSibling}setAttribute(r,e,t,i){if(i){e=i+":"+e;let o=gt$4[i];o?r.setAttributeNS(o,e,t):r.setAttribute(e,t);}else r.setAttribute(e,t);}removeAttribute(r,e,t){if(t){let i=gt$4[t];i?r.removeAttributeNS(i,e):r.removeAttribute(`${t}:${e}`);}else r.removeAttribute(e);}addClass(r,e){r.classList.add(e);}removeClass(r,e){r.classList.remove(e);}setStyle(r,e,t,i){i&(si$3.DashCase|si$3.Important)?r.style.setProperty(e,t,i&si$3.Important?"important":""):r.style[e]=t;}removeStyle(r,e,t){t&si$3.DashCase?r.style.removeProperty(e):r.style[e]="";}setProperty(r,e,t){r!=null&&(r[e]=t);}setValue(r,e){r.nodeValue=e;}listen(r,e,t,i){if(typeof r=="string"&&(r=R$2().getGlobalEventTarget(this.doc,r),!r))throw new M$2(5102,false);let o=this.decoratePreventDefault(t);return this.tracingService?.wrapEventListener&&(o=this.tracingService.wrapEventListener(r,e,o)),this.eventManager.addEventListener(r,e,o,i)}decoratePreventDefault(r){return e=>{if(e==="__ngUnwrap__")return r;r(e)===false&&e.preventDefault();}}};function In$2(n){return n.tagName==="TEMPLATE"&&n.content!==void 0}var Oe$1=class Oe extends De$2{hostEl;sharedStylesHost;shadowRoot;constructor(r,e,t,i,o,s,a,u){super(r,i,o,a),this.hostEl=e,this.sharedStylesHost=u,this.shadowRoot=e.attachShadow({mode:"open"}),this.sharedStylesHost&&this.sharedStylesHost.addHost(this.shadowRoot);let c=t.styles;c=Rn$2(t.id,c);for(let d of c){let D=document.createElement("style");s&&D.setAttribute("nonce",s),D.textContent=d,this.shadowRoot.appendChild(D);}let f=t.getExternalStyles?.();if(f)for(let d of f){let D=pt$3(d,i);s&&D.setAttribute("nonce",s),this.shadowRoot.appendChild(D);}}nodeOrShadowRoot(r){return r===this.hostEl?this.shadowRoot:r}appendChild(r,e){return super.appendChild(this.nodeOrShadowRoot(r),e)}insertBefore(r,e,t){return super.insertBefore(this.nodeOrShadowRoot(r),e,t)}removeChild(r,e){return super.removeChild(null,e)}parentNode(r){return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(r)))}destroy(){this.sharedStylesHost&&this.sharedStylesHost.removeHost(this.shadowRoot);}},ye$2=class ye extends De$2{sharedStylesHost;removeStylesOnCompDestroy;styles;styleUrls;constructor(r,e,t,i,o,s,a,u){super(r,o,s,a),this.sharedStylesHost=e,this.removeStylesOnCompDestroy=i;let c=t.styles;this.styles=u?Rn$2(u,c):c,this.styleUrls=t.getExternalStyles?.(u);}applyStyles(){this.sharedStylesHost.addStyles(this.styles,this.styleUrls);}destroy(){this.removeStylesOnCompDestroy&&Mn$3.size===0&&this.sharedStylesHost.removeStyles(this.styles,this.styleUrls);}},Ne$1=class Ne extends ye$2{contentAttr;hostAttr;constructor(r,e,t,i,o,s,a,u){let c=i+"-"+t.id;super(r,e,t,o,s,a,u,c),this.contentAttr=Ur$1(c),this.hostAttr=jr$1(c);}applyToHost(r){this.applyStyles(),this.setAttribute(r,this.hostAttr,"");}createElement(r,e){let t=super.createElement(r,e);return super.setAttribute(t,this.contentAttr,""),t}};var xe$2=class n extends he$1{supportsDOMEvents=true;static makeCurrent(){at$2(new n);}onAndCancel(r,e,t,i){return r.addEventListener(e,t,i),()=>{r.removeEventListener(e,t,i);}}dispatchEvent(r,e){r.dispatchEvent(e);}remove(r){r.remove();}createElement(r,e){return e=e||this.getDefaultDocument(),e.createElement(r)}createHtmlDocument(){return document.implementation.createHTMLDocument("fakeTitle")}getDefaultDocument(){return document}isElementNode(r){return r.nodeType===Node.ELEMENT_NODE}isShadowRoot(r){return r instanceof DocumentFragment}getGlobalEventTarget(r,e){return e==="window"?window:e==="document"?r:e==="body"?r.body:null}getBaseHref(r){let e=zr$1();return e==null?null:Hr$1(e)}resetBaseElement(){Ee$3=null;}getUserAgent(){return window.navigator.userAgent}getCookie(r){return pe$1(document.cookie,r)}},Ee$3=null;function zr$1(){return Ee$3=Ee$3||document.head.querySelector("base"),Ee$3?Ee$3.getAttribute("href"):null}function Hr$1(n){return new URL(n,document.baseURI).pathname}var Pn$2=["alt","control","meta","shift"],Vr$1={"\b":"Backspace","	":"Tab","\x7F":"Delete","\x1B":"Escape",Del:"Delete",Esc:"Escape",Left:"ArrowLeft",Right:"ArrowRight",Up:"ArrowUp",Down:"ArrowDown",Menu:"ContextMenu",Scroll:"ScrollLock",Win:"OS"},Gr$1={alt:n=>n.altKey,control:n=>n.ctrlKey,meta:n=>n.metaKey,shift:n=>n.shiftKey},On$2=(()=>{class n extends me$1{constructor(e){super(e);}supports(e){return n.parseEventName(e)!=null}addEventListener(e,t,i,o){let s=n.parseEventName(t),a=n.eventCallback(s.fullKey,i,this.manager.getZone());return this.manager.getZone().runOutsideAngular(()=>R$2().onAndCancel(e,s.domEventName,a,o))}static parseEventName(e){let t=e.toLowerCase().split("."),i=t.shift();if(t.length===0||!(i==="keydown"||i==="keyup"))return null;let o=n._normalizeKey(t.pop()),s="",a=t.indexOf("code");if(a>-1&&(t.splice(a,1),s="code."),Pn$2.forEach(c=>{let f=t.indexOf(c);f>-1&&(t.splice(f,1),s+=c+".");}),s+=o,t.length!=0||o.length===0)return null;let u={};return u.domEventName=i,u.fullKey=s,u}static matchEventFullKeyCode(e,t){let i=Vr$1[e.key]||e.key,o="";return t.indexOf("code.")>-1&&(i=e.code,o="code."),i==null||!i?false:(i=i.toLowerCase(),i===" "?i="space":i==="."&&(i="dot"),Pn$2.forEach(s=>{if(s!==i){let a=Gr$1[s];a(e)&&(o+=s+".");}}),o+=i,o===t)}static eventCallback(e,t,i){return o=>{n.matchEventFullKeyCode(o,e)&&i.runGuarded(()=>t(o));}}static _normalizeKey(e){return e==="esc"?"escape":e}static \u0275fac=function(t){return new(t||n)(Ae$4(dr$3))};static \u0275prov=re$2({token:n,factory:n.\u0275fac})}return n})();async function Wr$1(n,r$1,e){let t=r({rootComponent:n},Yr$1(r$1,e));return UF(t)}function Yr$1(n,r){return {platformRef:r?.platformRef,appProviders:[...qr$1,...n?.providers??[]],platformProviders:Jr$1}}function Xr$1(){xe$2.makeCurrent();}function Zr$1(){return new ze$2}function Kr$1(){return ry(document),document}var Jr$1=[{provide:dm$1,useValue:ft$2},{provide:Fu,useValue:Xr$1,multi:true},{provide:dr$3,useFactory:Kr$1}];var qr$1=[{provide:As$1,useValue:"root"},{provide:ze$2,useFactory:Zr$1},{provide:Le$1,useClass:Pe$2,multi:true},{provide:Le$1,useClass:On$2,multi:true},Et$2,{provide:Jf,useClass:Dt$3},{provide:Dt$3,useExisting:Jf},mt$2,{provide:wr$1,useExisting:Et$2},[]];var O$2=class n{headers;normalizedNames=new Map;lazyInit;lazyUpdate=null;constructor(r){r?typeof r=="string"?this.lazyInit=()=>{this.headers=new Map,r.split(`
`).forEach(e=>{let t=e.indexOf(":");if(t>0){let i=e.slice(0,t),o=e.slice(t+1).trim();this.addHeaderEntry(i,o);}});}:typeof Headers<"u"&&r instanceof Headers?(this.headers=new Map,r.forEach((e,t)=>{this.addHeaderEntry(t,e);})):this.lazyInit=()=>{this.headers=new Map,Object.entries(r).forEach(([e,t])=>{this.setHeaderEntries(e,t);});}:this.headers=new Map;}has(r){return this.init(),this.headers.has(r.toLowerCase())}get(r){this.init();let e=this.headers.get(r.toLowerCase());return e&&e.length>0?e[0]:null}keys(){return this.init(),Array.from(this.normalizedNames.values())}getAll(r){return this.init(),this.headers.get(r.toLowerCase())||null}append(r,e){return this.clone({name:r,value:e,op:"a"})}set(r,e){return this.clone({name:r,value:e,op:"s"})}delete(r,e){return this.clone({name:r,value:e,op:"d"})}maybeSetNormalizedName(r,e){this.normalizedNames.has(e)||this.normalizedNames.set(e,r);}init(){this.lazyInit&&(this.lazyInit instanceof n?this.copyFrom(this.lazyInit):this.lazyInit(),this.lazyInit=null,this.lazyUpdate&&(this.lazyUpdate.forEach(r=>this.applyUpdate(r)),this.lazyUpdate=null));}copyFrom(r){r.init(),Array.from(r.headers.keys()).forEach(e=>{this.headers.set(e,r.headers.get(e)),this.normalizedNames.set(e,r.normalizedNames.get(e));});}clone(r){let e=new n;return e.lazyInit=this.lazyInit&&this.lazyInit instanceof n?this.lazyInit:this,e.lazyUpdate=(this.lazyUpdate||[]).concat([r]),e}applyUpdate(r){let e=r.name.toLowerCase();switch(r.op){case "a":case "s":let t=r.value;if(typeof t=="string"&&(t=[t]),t.length===0)return;this.maybeSetNormalizedName(r.name,e);let i=(r.op==="a"?this.headers.get(e):void 0)||[];i.push(...t),this.headers.set(e,i);break;case "d":let o=r.value;if(!o)this.headers.delete(e),this.normalizedNames.delete(e);else {let s=this.headers.get(e);if(!s)return;s=s.filter(a=>o.indexOf(a)===-1),s.length===0?(this.headers.delete(e),this.normalizedNames.delete(e)):this.headers.set(e,s);}break}}addHeaderEntry(r,e){let t=r.toLowerCase();this.maybeSetNormalizedName(r,t),this.headers.has(t)?this.headers.get(t).push(e):this.headers.set(t,[e]);}setHeaderEntries(r,e){let t=(Array.isArray(e)?e:[e]).map(o=>o.toString()),i=r.toLowerCase();this.headers.set(i,t),this.maybeSetNormalizedName(r,i);}forEach(r){this.init(),Array.from(this.normalizedNames.keys()).forEach(e=>r(this.normalizedNames.get(e),this.headers.get(e)));}};var _t$4=class _t{defaultValue;constructor(r){this.defaultValue=r;}},Be$2=class Be{map=new Map;set(r,e){return this.map.set(r,e),this}get(r){return this.map.has(r)||this.map.set(r,r.defaultValue()),this.map.get(r)}delete(r){return this.map.delete(r),this}has(r){return this.map.has(r)}keys(){return this.map.keys()}},Ue$2=class Ue{encodeKey(r){return Nn$2(r)}encodeValue(r){return Nn$2(r)}decodeKey(r){return decodeURIComponent(r)}decodeValue(r){return decodeURIComponent(r)}};function Qr$1(n,r){let e=new Map;return n.length>0&&n.replace(/^\?/,"").split("&").forEach(i=>{let o=i.indexOf("="),[s,a]=o==-1?[r.decodeKey(i),""]:[r.decodeKey(i.slice(0,o)),r.decodeValue(i.slice(o+1))],u=e.get(s)||[];u.push(a),e.set(s,u);}),e}var ei$1=/%(\d[a-f0-9])/gi,ti$3={40:"@","3A":":",24:"$","2C":",","3B":";","3D":"=","3F":"?","2F":"/"};function Nn$2(n){return encodeURIComponent(n).replace(ei$1,(r,e)=>ti$3[e]??r)}function ke$2(n){return `${n}`}var P$2=class n{map;encoder;updates=null;cloneFrom=null;constructor(r={}){if(this.encoder=r.encoder||new Ue$2,r.fromString){if(r.fromObject)throw new M$2(2805,false);this.map=Qr$1(r.fromString,this.encoder);}else r.fromObject?(this.map=new Map,Object.keys(r.fromObject).forEach(e=>{let t=r.fromObject[e],i=Array.isArray(t)?t.map(ke$2):[ke$2(t)];this.map.set(e,i);})):this.map=null;}has(r){return this.init(),this.map.has(r)}get(r){this.init();let e=this.map.get(r);return e?e[0]:null}getAll(r){return this.init(),this.map.get(r)||null}keys(){return this.init(),Array.from(this.map.keys())}append(r,e){return this.clone({param:r,value:e,op:"a"})}appendAll(r){let e=[];return Object.keys(r).forEach(t=>{let i=r[t];Array.isArray(i)?i.forEach(o=>{e.push({param:t,value:o,op:"a"});}):e.push({param:t,value:i,op:"a"});}),this.clone(e)}set(r,e){return this.clone({param:r,value:e,op:"s"})}delete(r,e){return this.clone({param:r,value:e,op:"d"})}toString(){return this.init(),this.keys().map(r=>{let e=this.encoder.encodeKey(r);return this.map.get(r).map(t=>e+"="+this.encoder.encodeValue(t)).join("&")}).filter(r=>r!=="").join("&")}clone(r){let e=new n({encoder:this.encoder});return e.cloneFrom=this.cloneFrom||this,e.updates=(this.updates||[]).concat(r),e}init(){this.map===null&&(this.map=new Map),this.cloneFrom!==null&&(this.cloneFrom.init(),this.cloneFrom.keys().forEach(r=>this.map.set(r,this.cloneFrom.map.get(r))),this.updates.forEach(r=>{switch(r.op){case "a":case "s":let e=(r.op==="a"?this.map.get(r.param):void 0)||[];e.push(ke$2(r.value)),this.map.set(r.param,e);break;case "d":if(r.value!==void 0){let t=this.map.get(r.param)||[],i=t.indexOf(ke$2(r.value));i!==-1&&t.splice(i,1),t.length>0?this.map.set(r.param,t):this.map.delete(r.param);}else {this.map.delete(r.param);break}}}),this.cloneFrom=this.updates=null);}};function ni$2(n){switch(n){case "DELETE":case "GET":case "HEAD":case "OPTIONS":case "JSONP":return  false;default:return  true}}function Ln$2(n){return typeof ArrayBuffer<"u"&&n instanceof ArrayBuffer}function xn$2(n){return typeof Blob<"u"&&n instanceof Blob}function kn$2(n){return typeof FormData<"u"&&n instanceof FormData}function ri$2(n){return typeof URLSearchParams<"u"&&n instanceof URLSearchParams}var vt$4="Content-Type",Bn$3="Accept",$n$2="text/plain",zn$1="application/json",ii$2=`${zn$1}, ${$n$2}, */*`,ne=class n{url;body=null;headers;context;reportProgress=false;reportUploadProgress=false;reportDownloadProgress=false;withCredentials=false;credentials;keepalive=false;cache;priority;mode;redirect;referrer;integrity;referrerPolicy;responseType="json";method;params;urlWithParams;transferCache;timeout;constructor(r,e,t,i){this.url=e,this.method=r.toUpperCase();let o;if(ni$2(this.method)||i?(this.body=t!==void 0?t:null,o=i):o=t,o){if(this.reportProgress=!!o.reportProgress,this.reportUploadProgress=!!o.reportUploadProgress,this.reportDownloadProgress=!!o.reportDownloadProgress,this.withCredentials=!!o.withCredentials,this.keepalive=!!o.keepalive,o.responseType&&(this.responseType=o.responseType),o.headers&&(this.headers=o.headers),o.context&&(this.context=o.context),o.params&&(this.params=o.params),o.priority&&(this.priority=o.priority),o.cache&&(this.cache=o.cache),o.credentials&&(this.credentials=o.credentials),typeof o.timeout=="number"){if(o.timeout<1||!Number.isInteger(o.timeout))throw new M$2(2822,"");this.timeout=o.timeout;}o.mode&&(this.mode=o.mode),o.redirect&&(this.redirect=o.redirect),o.integrity&&(this.integrity=o.integrity),o.referrer!==void 0&&(this.referrer=o.referrer),o.referrerPolicy&&(this.referrerPolicy=o.referrerPolicy),this.transferCache=o.transferCache;}if(this.headers??=new O$2,this.context??=new Be$2,!this.params)this.params=new P$2,this.urlWithParams=e;else {let s=this.params.toString();if(s.length===0)this.urlWithParams=e;else {let a=e,u="",c=e.indexOf("#");c!==-1&&(u=e.substring(c),a=e.substring(0,c));let f=a.indexOf("?"),d=f===-1?"?":f<a.length-1?"&":"";this.urlWithParams=a+d+s+u;}}}serializeBody(){return this.body===null?null:typeof this.body=="string"||Ln$2(this.body)||xn$2(this.body)||kn$2(this.body)||ri$2(this.body)?this.body:this.body instanceof P$2?this.body.toString():typeof this.body=="object"||typeof this.body=="boolean"||Array.isArray(this.body)?JSON.stringify(this.body):this.body.toString()}detectContentTypeHeader(){return this.body===null||kn$2(this.body)?null:xn$2(this.body)?this.body.type||null:Ln$2(this.body)?null:typeof this.body=="string"?$n$2:this.body instanceof P$2?"application/x-www-form-urlencoded;charset=UTF-8":typeof this.body=="object"||typeof this.body=="number"||typeof this.body=="boolean"?zn$1:null}clone(r={}){let e=r.method||this.method,t=r.url||this.url,i=r.responseType||this.responseType,o=r.keepalive??this.keepalive,s=r.priority||this.priority,a=r.cache||this.cache,u=r.mode||this.mode,c=r.redirect||this.redirect,f=r.credentials||this.credentials,d=r.referrer??this.referrer,D=r.integrity||this.integrity,E=r.referrerPolicy||this.referrerPolicy,w=r.transferCache??this.transferCache,$=r.timeout??this.timeout,v=r.body!==void 0?r.body:this.body,C=r.withCredentials??this.withCredentials,b=r.reportProgress??this.reportProgress,L=r.reportUploadProgress??this.reportUploadProgress,I=r.reportDownloadProgress??this.reportDownloadProgress,x=r.headers||this.headers,A=r.params||this.params,_e=r.context??this.context;return r.setHeaders!==void 0&&(x=Object.keys(r.setHeaders).reduce((Z,z)=>Z.set(z,r.setHeaders[z]),x)),r.setParams&&(A=Object.keys(r.setParams).reduce((Z,z)=>Z.set(z,r.setParams[z]),A)),new n(e,t,v,{params:A,headers:x,context:_e,reportProgress:b,reportUploadProgress:L,reportDownloadProgress:I,responseType:i,withCredentials:C,transferCache:w,keepalive:o,cache:a,priority:s,timeout:$,mode:u,redirect:c,credentials:f,referrer:d,integrity:D,referrerPolicy:E})}},re$1=(function(n){return n[n.Sent=0]="Sent",n[n.UploadProgress=1]="UploadProgress",n[n.ResponseHeader=2]="ResponseHeader",n[n.DownloadProgress=3]="DownloadProgress",n[n.Response=4]="Response",n[n.User=5]="User",n})(re$1||{}),ie=class{headers;status;statusText;url;ok;type;redirected;responseType;constructor(r,e=200,t="OK"){this.headers=r.headers||new O$2,this.status=r.status!==void 0?r.status:e,this.statusText=r.statusText||t,this.url=r.url||null,this.redirected=r.redirected,this.responseType=r.responseType,this.ok=this.status>=200&&this.status<300;}},je$3=class n extends ie{constructor(r={}){super(r);}type=re$1.ResponseHeader;clone(r={}){return new n({headers:r.headers||this.headers,status:r.status!==void 0?r.status:this.status,statusText:r.statusText||this.statusText,url:r.url||this.url||void 0})}},ve$1=class n extends ie{body;constructor(r={}){super(r),this.body=r.body!==void 0?r.body:null;}type=re$1.Response;clone(r={}){return new n({body:r.body!==void 0?r.body:this.body,headers:r.headers||this.headers,status:r.status!==void 0?r.status:this.status,statusText:r.statusText||this.statusText,url:r.url||this.url||void 0,redirected:r.redirected??this.redirected,responseType:r.responseType??this.responseType})}},Y$1=class Y extends ie{name="HttpErrorResponse";message;error;ok=false;constructor(r){super(r,0,"Unknown Error"),this.status>=200&&this.status<300?this.message=`Http failure during parsing for ${r.url||"(unknown url)"}`:this.message=`Http failure response for ${r.url||"(unknown url)"}: ${r.status} ${r.statusText}`,this.error=r.error||null;}},oi$2=200;var si$2=/^\)\]\}',?\n/,Hn$2=new N$3("",{factory:()=>null}),oe=(()=>{class n{fetchImpl=T$2(St$5,{optional:true})?.fetch??((...e)=>globalThis.fetch(...e));ngZone=T$2(De$3);destroyRef=T$2(Ve$4);maxResponseSize=T$2(Hn$2);handle(e){return new x(t=>{let i=new AbortController;this.doRequest(e,i.signal,t).then(Ct$4,s=>t.error(new Y$1({error:s})));let o;return e.timeout&&(o=this.ngZone.runOutsideAngular(()=>setTimeout(()=>{i.signal.aborted||i.abort(new DOMException("signal timed out","TimeoutError"));},e.timeout))),()=>{o!==void 0&&clearTimeout(o),i.abort();}})}async doRequest(e,t,i){let o=this.createRequestInit(e),s;try{let v=this.ngZone.runOutsideAngular(()=>this.fetchImpl(e.urlWithParams,r({signal:t},o)));ai$2(v),i.next({type:re$1.Sent}),s=await v;}catch(v){i.error(new Y$1({error:v,status:v.status??0,statusText:v.statusText,url:e.urlWithParams,headers:v.headers}));return}let a=new O$2(s.headers),u=s.statusText,c=s.url||e.urlWithParams,f=s.status,d=null,D=e.reportProgress||e.reportDownloadProgress;if(D&&i.next(new je$3({headers:a,status:f,statusText:u,url:c})),s.body){let v=s.headers.get("content-length"),C=v!==null?Number(v):NaN;this.maxResponseSize!==null&&Number.isFinite(C)&&C>this.maxResponseSize&&Un$2(this.maxResponseSize);let b=[],L=s.body.getReader(),I=0,x,A,_e=typeof Zone<"u"&&Zone.current,Z=false;if(await this.ngZone.runOutsideAngular(async()=>{for(;;){if(this.destroyRef.destroyed){await L.cancel(),Z=true;break}let{done:se,value:Xe}=await L.read();if(se)break;if(b.push(Xe),I+=Xe.length,this.maxResponseSize!==null&&I>this.maxResponseSize&&(await L.cancel(),Un$2(this.maxResponseSize)),D){A=e.responseType==="text"?(A??"")+(x??=new TextDecoder).decode(Xe,{stream:true}):void 0;let It=()=>i.next({type:re$1.DownloadProgress,total:Number.isFinite(C)?C:void 0,loaded:I,partialText:A});_e?_e.run(It):It();}}}),Z){i.complete();return}let z=this.concatChunks(b,I);try{let se=s.headers.get(vt$4)??"";d=this.parseBody(e,z,se,f);}catch(se){i.error(new Y$1({error:se,headers:new O$2(s.headers),status:s.status,statusText:s.statusText,url:s.url||e.urlWithParams}));return}}f===0&&(f=d?oi$2:0);let E=f>=200&&f<300,w=s.redirected,$=s.type;E?(i.next(new ve$1({body:d,headers:a,status:f,statusText:u,url:c,redirected:w,responseType:$})),i.complete()):i.error(new Y$1({error:d,headers:a,status:f,statusText:u,url:c,redirected:w,responseType:$}));}parseBody(e,t,i,o){switch(e.responseType){case "json":let s=new TextDecoder().decode(t).replace(si$2,"");if(s==="")return null;try{return JSON.parse(s)}catch(a){if(o<200||o>=300)return s;throw a}case "text":return new TextDecoder().decode(t);case "blob":return new Blob([t],{type:i});case "arraybuffer":return t.buffer}}createRequestInit(e){if(e.reportUploadProgress)throw new M$2(2824,false);let t={},i;if(i=e.credentials,e.withCredentials&&(i="include"),e.headers.forEach((o,s)=>t[o]=s.join(",")),e.headers.has(Bn$3)||(t[Bn$3]=ii$2),!e.headers.has(vt$4)){let o=e.detectContentTypeHeader();o!==null&&(t[vt$4]=o);}return {body:e.serializeBody(),method:e.method,headers:t,credentials:i,keepalive:e.keepalive,cache:e.cache,priority:e.priority,mode:e.mode,redirect:e.redirect,referrer:e.referrer,integrity:e.integrity,referrerPolicy:e.referrerPolicy}}concatChunks(e,t){let i=new Uint8Array(t),o=0;for(let s of e)i.set(s,o),o+=s.length;return i}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),St$5=class St{};function Ct$4(){}function ai$2(n){n.then(Ct$4,Ct$4);}function Un$2(n){throw new M$2(2825,false)}function Vn$2(n,r){return r(n)}function ui$1(n,r){return (e,t)=>r.intercept(e,{handle:i=>n(i,t)})}function ci$1(n,r,e){return (t,i)=>So$1(e,()=>r(t,o=>n(o,i)))}var Gn$2=new N$3(""),ze$1=new N$3("",{factory:()=>[]}),Wn$2=new N$3(""),bt$4=new N$3("",{factory:()=>true});function li$2(){let n=null;return (r,e)=>{n===null&&(n=(T$2(Gn$2,{optional:true})??[]).reduceRight(ui$1,Vn$2));let t=T$2(Uo$2);if(T$2(bt$4)){let o=t.add();return n(r,e).pipe(Ig(o))}else return n(r,e)}}var He$3=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=Ae$4(oe),i},providedIn:"root"})}return n})();var $e$2=(()=>{class n{backend;injector;chain=null;pendingTasks=T$2(Uo$2);contributeToStability=T$2(bt$4);constructor(e,t){this.backend=e,this.injector=t;}handle(e){if(this.chain===null){let t=Array.from(new Set([...this.injector.get(ze$1),...this.injector.get(Wn$2,[])]));this.chain=t.reduceRight((i,o)=>ci$1(i,o,this.injector),Vn$2);}if(this.contributeToStability){let t=this.pendingTasks.add();return this.chain(e,i=>this.backend.handle(i)).pipe(Ig(t))}else return this.chain(e,t=>this.backend.handle(t))}static \u0275fac=function(t){return new(t||n)(Ae$4(He$3),Ae$4(se))};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),At$1=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=Ae$4($e$2),i},providedIn:"root"})}return n})();function wt$3(n,r$1){return r({body:r$1},n)}var Ve$3=(()=>{class n{handler;constructor(e){this.handler=e;}request(e,t,i={}){let o;if(e instanceof ne)o=e;else {let u;i.headers instanceof O$2?u=i.headers:u=new O$2(i.headers);let c;i.params&&(i.params instanceof P$2?c=i.params:c=new P$2({fromObject:i.params})),o=new ne(e,t,i.body!==void 0?i.body:null,{headers:u,context:i.context,params:c,reportProgress:i.reportProgress,reportUploadProgress:i.reportUploadProgress,reportDownloadProgress:i.reportDownloadProgress,responseType:i.responseType||"json",withCredentials:i.withCredentials,transferCache:i.transferCache,keepalive:i.keepalive,priority:i.priority,cache:i.cache,mode:i.mode,redirect:i.redirect,credentials:i.credentials,referrer:i.referrer,referrerPolicy:i.referrerPolicy,integrity:i.integrity,timeout:i.timeout});}let s=Uh(o).pipe(pg(u=>this.handler.handle(u)));if(e instanceof ne||i.observe==="events")return s;let a=s.pipe(qn$3(u=>u instanceof ve$1));switch(i.observe||"body"){case "body":switch(o.responseType){case "arraybuffer":return a.pipe(le$1(u=>{if(u.body!==null&&!(u.body instanceof ArrayBuffer))throw new M$2(2806,false);return u.body}));case "blob":return a.pipe(le$1(u=>{if(u.body!==null&&!(u.body instanceof Blob))throw new M$2(2807,false);return u.body}));case "text":return a.pipe(le$1(u=>{if(u.body!==null&&typeof u.body!="string")throw new M$2(2808,false);return u.body}));default:return a.pipe(le$1(u=>u.body))}case "response":return a;default:throw new M$2(2809,false)}}delete(e,t={}){return this.request("DELETE",e,t)}get(e,t={}){return this.request("GET",e,t)}head(e,t={}){return this.request("HEAD",e,t)}jsonp(e,t){return this.request("JSONP",e,{params:new P$2().append(t,"JSONP_CALLBACK"),observe:"body",responseType:"json"})}options(e,t={}){return this.request("OPTIONS",e,t)}patch(e,t,i={}){return this.request("PATCH",e,wt$3(i,t))}post(e,t,i={}){return this.request("POST",e,wt$3(i,t))}put(e,t,i={}){return this.request("PUT",e,wt$3(i,t))}static \u0275fac=function(t){return new(t||n)(Ae$4(At$1))};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var di$1=new N$3("",{factory:()=>true}),fi$1="XSRF-TOKEN",hi$1=new N$3("",{factory:()=>fi$1}),gi$1="X-XSRF-TOKEN",pi$1=new N$3("",{factory:()=>gi$1}),mi$1=(()=>{class n{cookieName=T$2(hi$1);doc=T$2(dr$3);lastCookieString="";lastToken=null;parseCount=0;getToken(){let e=this.doc.cookie||"";return e!==this.lastCookieString&&(this.parseCount++,this.lastToken=pe$1(e,this.cookieName),this.lastCookieString=e),this.lastToken}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),Yn$2=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=Ae$4(mi$1),i},providedIn:"root"})}return n})();function Di$1(n,r){if(!T$2(di$1)||n.method==="GET"||n.method==="HEAD")return r(n);try{let i=T$2(ee).href,{origin:o}=new URL(i),{origin:s}=new URL(n.url,o);if(o!==s)return r(n)}catch{return r(n)}let e=T$2(Yn$2).getToken(),t=T$2(pi$1);return e!=null&&!n.headers.has(t)&&(n=n.clone({headers:n.headers.set(t,e)})),r(n)}var we$2=(function(n){return n[n.Interceptors=0]="Interceptors",n[n.LegacyInterceptors=1]="LegacyInterceptors",n[n.CustomXsrfConfiguration=2]="CustomXsrfConfiguration",n[n.NoXsrfProtection=3]="NoXsrfProtection",n[n.JsonpSupport=4]="JsonpSupport",n[n.RequestsMadeViaParent=5]="RequestsMadeViaParent",n[n.Fetch=6]="Fetch",n[n.Xhr=7]="Xhr",n})(we$2||{});function Tt$3(n,r){return {\u0275kind:n,\u0275providers:r}}function yi$1(...n){let r=[Ve$3,oe,$e$2,{provide:At$1,useExisting:$e$2},{provide:He$3,useFactory:()=>T$2(oe)},{provide:ze$1,useValue:Di$1,multi:true}];for(let e of n)r.push(...e.\u0275providers);return _o$1(r)}function Ei$1(n){return Tt$3(we$2.Interceptors,n.map(r=>({provide:ze$1,useValue:r,multi:true})))}var jn$2=new N$3("");function vi$1(){return Tt$3(we$2.LegacyInterceptors,[{provide:jn$2,useFactory:li$2},{provide:ze$1,useExisting:jn$2,multi:true}])}function wi$1(){return Tt$3(we$2.Fetch,[oe,{provide:He$3,useExisting:oe}])}var fu=(()=>{class n{_doc;constructor(e){this._doc=e;}getTitle(){return this._doc.title}setTitle(e){this._doc.title=e||"";}static \u0275fac=function(t){return new(t||n)(Ae$4(dr$3))};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Ft$3=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=re$2({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=Ae$4(Si$1),i},providedIn:"root"})}return n})(),Si$1=(()=>{class n extends Ft$3{_doc=T$2(dr$3);sanitize(e,t){if(t==null)return null;switch(e){case Di$2.NONE:return t;case Di$2.HTML:return cc$1(t,"HTML")?Sr$2(t):xy(this._doc,String(t)).toString();case Di$2.STYLE:return cc$1(t,"Style")?Sr$2(t):t;case Di$2.SCRIPT:if(cc$1(t,"Script"))return Sr$2(t);throw new M$2(5200,false);case Di$2.URL:return cc$1(t,"URL")?Sr$2(t):lc$1(String(t));case Di$2.RESOURCE_URL:if(cc$1(t,"ResourceURL"))return Sr$2(t);throw new M$2(5201,false);default:throw new M$2(5202,false)}}bypassSecurityTrustHtml(e){return uy(e)}bypassSecurityTrustStyle(e){return dy(e)}bypassSecurityTrustScript(e){return fy(e)}bypassSecurityTrustUrl(e){return py(e)}bypassSecurityTrustResourceUrl(e){return hy(e)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var Ge$2=new WeakMap,bi$2=(()=>{class n{_appRef;_injector=T$2(Ee$4);_environmentInjector=T$2(se);load(e){let t=this._appRef=this._appRef||this._injector.get(Rr$3),i=Ge$2.get(t);i||(i={loaders:new Set,refs:[]},Ge$2.set(t,i),t.onDestroy(()=>{Ge$2.get(t)?.refs.forEach(o=>o.destroy()),Ge$2.delete(t);})),i.loaders.has(e)||(i.loaders.add(e),i.refs.push(zF(e,{environmentInjector:this._environmentInjector})));}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var vu=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=cE({type:n,selectors:[["ng-component"]],exportAs:["cdkVisuallyHidden"],decls:0,vars:0,template:function(t,i){},styles:[`.cdk-visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  left: 0;
}
[dir=rtl] .cdk-visually-hidden {
  left: auto;
  right: 0;
}
`],encapsulation:2})}return n})(),We$2;function Ai(){if(We$2===void 0&&(We$2=null,typeof window<"u")){let n=window;n.trustedTypes!==void 0&&(We$2=n.trustedTypes.createPolicy("angular#components",{createHTML:r=>r}));}return We$2}function X$2(n){return Ai()?.createHTML(n)||n}function wu(n,r,e){let t=e.sanitize(Di$2.HTML,r);n.innerHTML=X$2(t||"");}function Xn$2(n){return Error(`Unable to find icon with the name "${n}"`)}function Ti(){return Error("Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.")}function Zn$2(n){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${n}".`)}function Kn$2(n){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${n}".`)}var N$2=class N{url;svgText;options;svgElement=null;constructor(r,e,t){this.url=r,this.svgText=e,this.options=t;}},qn$2=(()=>{class n{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=["material-icons","mat-ligature-font"];constructor(e,t,i,o){this._httpClient=e,this._sanitizer=t,this._errorHandler=o,this._document=i;}addSvgIcon(e,t,i){return this.addSvgIconInNamespace("",e,t,i)}addSvgIconLiteral(e,t,i){return this.addSvgIconLiteralInNamespace("",e,t,i)}addSvgIconInNamespace(e,t,i,o){return this._addSvgIconConfig(e,t,new N$2(i,null,o))}addSvgIconResolver(e){return this._resolvers.push(e),this}addSvgIconLiteralInNamespace(e,t,i,o){let s=this._sanitizer.sanitize(Di$2.HTML,i);if(!s)throw Kn$2(i);let a=X$2(s);return this._addSvgIconConfig(e,t,new N$2("",a,o))}addSvgIconSet(e,t){return this.addSvgIconSetInNamespace("",e,t)}addSvgIconSetLiteral(e,t){return this.addSvgIconSetLiteralInNamespace("",e,t)}addSvgIconSetInNamespace(e,t,i){return this._addSvgIconSetConfig(e,new N$2(t,null,i))}addSvgIconSetLiteralInNamespace(e,t,i){let o=this._sanitizer.sanitize(Di$2.HTML,t);if(!o)throw Kn$2(t);let s=X$2(o);return this._addSvgIconSetConfig(e,new N$2("",s,i))}registerFontClassAlias(e,t=e){return this._fontCssClassesByAlias.set(e,t),this}classNameForFontAlias(e){return this._fontCssClassesByAlias.get(e)||e}setDefaultFontSetClass(...e){return this._defaultFontSetClass=e,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(e){let t=this._sanitizer.sanitize(Di$2.RESOURCE_URL,e);if(!t)throw Zn$2(e);let i=this._cachedIconsByUrl.get(t);return i?Uh(Ye$4(i)):this._loadSvgIconFromConfig(new N$2(e,null)).pipe(xg(o=>this._cachedIconsByUrl.set(t,o)),le$1(o=>Ye$4(o)))}getNamedSvgIcon(e,t=""){let i=Jn$2(t,e),o=this._svgIconConfigs.get(i);if(o)return this._getSvgFromConfig(o);if(o=this._getIconConfigFromResolvers(t,e),o)return this._svgIconConfigs.set(i,o),this._getSvgFromConfig(o);let s=this._iconSetConfigs.get(t);return s?this._getSvgFromIconSetConfigs(e,s):Wh(Xn$2(i))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear();}_getSvgFromConfig(e){return e.svgText?Uh(Ye$4(this._svgElementFromConfig(e))):this._loadSvgIconFromConfig(e).pipe(le$1(t=>Ye$4(t)))}_getSvgFromIconSetConfigs(e,t){let i=this._extractIconWithNameFromAnySet(e,t);if(i)return Uh(i);let o=t.filter(s=>!s.svgText).map(s=>this._loadSvgIconSetFromConfig(s).pipe(Ll$1(a=>{let c=`Loading icon set URL: ${this._sanitizer.sanitize(Di$2.RESOURCE_URL,s.url)} failed: ${a.message}`;return this._errorHandler.handleError(new Error(c)),Uh(null)})));return rg(o).pipe(le$1(()=>{let s=this._extractIconWithNameFromAnySet(e,t);if(!s)throw Xn$2(e);return s}))}_extractIconWithNameFromAnySet(e,t){for(let i=t.length-1;i>=0;i--){let o=t[i];if(o.svgText&&o.svgText.toString().indexOf(e)>-1){let s=this._svgElementFromConfig(o),a=this._extractSvgIconFromSet(s,e,o.options);if(a)return a}}return null}_loadSvgIconFromConfig(e){return this._fetchIcon(e).pipe(xg(t=>e.svgText=t),le$1(()=>this._svgElementFromConfig(e)))}_loadSvgIconSetFromConfig(e){return e.svgText?Uh(null):this._fetchIcon(e).pipe(xg(t=>e.svgText=t))}_extractSvgIconFromSet(e,t,i){let o=e.querySelector(`[id="${t}"]`);if(!o)return null;let s=o.cloneNode(true);if(s.removeAttribute("id"),s.nodeName.toLowerCase()==="svg")return this._setSvgAttributes(s,i);if(s.nodeName.toLowerCase()==="symbol")return this._setSvgAttributes(this._toSvgElement(s),i);let a=this._svgElementFromString(X$2("<svg></svg>"));return a.appendChild(s),this._setSvgAttributes(a,i)}_svgElementFromString(e){let t=this._document.createElement("DIV");t.innerHTML=e;let i=t.querySelector("svg");if(!i)throw Error("<svg> tag not found");return i}_toSvgElement(e){let t=this._svgElementFromString(X$2("<svg></svg>")),i=e.attributes;for(let o=0;o<i.length;o++){let{name:s,value:a}=i[o];s!=="id"&&t.setAttribute(s,a);}for(let o=0;o<e.childNodes.length;o++)e.childNodes[o].nodeType===this._document.ELEMENT_NODE&&t.appendChild(e.childNodes[o].cloneNode(true));return t}_setSvgAttributes(e,t){return e.setAttribute("fit",""),e.setAttribute("height","100%"),e.setAttribute("width","100%"),e.setAttribute("preserveAspectRatio","xMidYMid meet"),e.setAttribute("focusable","false"),t&&t.viewBox&&e.setAttribute("viewBox",t.viewBox),e}_fetchIcon(e){let{url:t,options:i}=e,o=i?.withCredentials??false;if(!this._httpClient)throw Ti();if(t==null)throw Error(`Cannot fetch icon from URL "${t}".`);let s=this._sanitizer.sanitize(Di$2.RESOURCE_URL,t);if(!s)throw Zn$2(t);let a=this._inProgressUrlFetches.get(s);if(a)return a;let u=this._httpClient.get(s,{responseType:"text",withCredentials:o}).pipe(le$1(c=>X$2(c)),Ig(()=>this._inProgressUrlFetches.delete(s)),ss$2());return this._inProgressUrlFetches.set(s,u),u}_addSvgIconConfig(e,t,i){return this._svgIconConfigs.set(Jn$2(e,t),i),this}_addSvgIconSetConfig(e,t){let i=this._iconSetConfigs.get(e);return i?i.push(t):this._iconSetConfigs.set(e,[t]),this}_svgElementFromConfig(e){if(!e.svgElement){let t=this._svgElementFromString(e.svgText);this._setSvgAttributes(t,e.options),e.svgElement=t;}return e.svgElement}_getIconConfigFromResolvers(e,t){for(let i=0;i<this._resolvers.length;i++){let o=this._resolvers[i](t,e);if(o)return Fi$1(o)?new N$2(o.url,null,o.options):new N$2(o,null)}}static \u0275fac=function(t){return new(t||n)(Ae$4(Ve$3,8),Ae$4(Ft$3),Ae$4(dr$3,8),Ae$4(ze$2))};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function Ye$4(n){return n.cloneNode(true)}function Jn$2(n,r){return n+":"+r}function Fi$1(n){return !!(n.url&&n.options)}var Ii=new N$3("cdk-dir-doc",{providedIn:"root",factory:()=>T$2(dr$3)}),Mi$1=/^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;function Qn$2(n){let r=n?.toLowerCase()||"";return r==="auto"&&typeof navigator<"u"&&navigator?.language?Mi$1.test(navigator.language)?"rtl":"ltr":r==="rtl"?"rtl":"ltr"}var Ri$1=(()=>{class n{get value(){return this.valueSignal()}valueSignal=Ho$1("ltr");change=new We$3;constructor(){let e=T$2(Ii,{optional:true});if(e){let t=e.body?e.body.dir:null,i=e.documentElement?e.documentElement.dir:null;this.valueSignal.set(Qn$2(t||i||"ltr"));}}ngOnDestroy(){this.change.complete();}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var er$3=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({})}return n})();var Pi=["*"],Oi$1=new N$3("MAT_ICON_DEFAULT_OPTIONS"),Ni=new N$3("mat-icon-location",{providedIn:"root",factory:()=>{let n=T$2(dr$3),r=n?n.location:null;return {getPathname:()=>r?r.pathname+r.search:""}}}),tr$2=["clip-path","color-profile","src","cursor","fill","filter","marker","marker-start","marker-mid","marker-end","mask","stroke"],Li=tr$2.map(n=>`[${n}]`).join(", "),xi$1=/^url\(['"]?#(.*?)['"]?\)$/,Yu=(()=>{class n{_elementRef=T$2(Mr$2);_iconRegistry=T$2(qn$2);_location=T$2(Ni);_errorHandler=T$2(ze$2);_defaultColor;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;inline=false;get svgIcon(){return this._svgIcon}set svgIcon(e){e!==this._svgIcon&&(e?this._updateSvgIcon(e):this._svgIcon&&this._clearSvgElement(),this._svgIcon=e);}_svgIcon;get fontSet(){return this._fontSet}set fontSet(e){let t=this._cleanupFontValue(e);t!==this._fontSet&&(this._fontSet=t,this._updateFontIconClasses());}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(e){let t=this._cleanupFontValue(e);t!==this._fontIcon&&(this._fontIcon=t,this._updateFontIconClasses());}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=G$2.EMPTY;constructor(){let e=T$2(new hh$1("aria-hidden"),{optional:true}),t=T$2(Oi$1,{optional:true});t&&(t.color&&(this.color=this._defaultColor=t.color),t.fontSet&&(this.fontSet=t.fontSet)),e||this._elementRef.nativeElement.setAttribute("aria-hidden","true");}_splitIconName(e){if(!e)return ["",""];let t=e.split(":");switch(t.length){case 1:return ["",t[0]];case 2:return t;default:throw Error(`Invalid icon name: "${e}"`)}}ngOnInit(){this._updateFontIconClasses();}ngAfterViewChecked(){let e=this._elementsWithExternalReferences;if(e&&e.size){let t=this._location.getPathname();t!==this._previousPath&&(this._previousPath=t,this._prependPathToReferences(t));}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();}_usingFontIcon(){return !this.svgIcon}_setSvgElement(e){this._clearSvgElement();let t=this._location.getPathname();this._previousPath=t,this._cacheChildrenWithExternalReferences(e),this._prependPathToReferences(t),this._elementRef.nativeElement.appendChild(e);}_clearSvgElement(){let e=this._elementRef.nativeElement,t=e.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();t--;){let i=e.childNodes[t];(i.nodeType!==1||i.nodeName.toLowerCase()==="svg")&&i.remove();}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let e=this._elementRef.nativeElement,t=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(i=>i.length>0);this._previousFontSetClass.forEach(i=>e.classList.remove(i)),t.forEach(i=>e.classList.add(i)),this._previousFontSetClass=t,this.fontIcon!==this._previousFontIconClass&&!t.includes("mat-ligature-font")&&(this._previousFontIconClass&&e.classList.remove(this._previousFontIconClass),this.fontIcon&&e.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon);}_cleanupFontValue(e){return typeof e=="string"?e.trim().split(" ")[0]:e}_prependPathToReferences(e){let t=this._elementsWithExternalReferences;t&&t.forEach((i,o)=>{i.forEach(s=>{o.setAttribute(s.name,`url('${e}#${s.value}')`);});});}_cacheChildrenWithExternalReferences(e){let t=e.querySelectorAll(Li),i=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let o=0;o<t.length;o++)tr$2.forEach(s=>{let a=t[o],u=a.getAttribute(s),c=u?u.match(xi$1):null;if(c){let f=i.get(a);f||(f=[],i.set(a,f)),f.push({name:s,value:c[1]});}});}_updateSvgIcon(e){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),e){let[t,i]=this._splitIconName(e);t&&(this._svgNamespace=t),i&&(this._svgName=i),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(i,t).pipe(dn$2(1)).subscribe(o=>this._setSvgElement(o),o=>{let s=`Error retrieving icon ${t}:${i}! ${o.message}`;this._errorHandler.handleError(new Error(s));});}}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=cE({type:n,selectors:[["mat-icon"]],hostAttrs:["role","img",1,"mat-icon","notranslate"],hostVars:10,hostBindings:function(t,i){t&2&&(Rp("data-mat-icon-type",i._usingFontIcon()?"font":"svg")("data-mat-icon-name",i._svgName||i.fontIcon)("data-mat-icon-namespace",i._svgNamespace||i.fontSet)("fontIcon",i._usingFontIcon()?i.fontIcon:null),BD(i.color?"mat-"+i.color:""),Zp("mat-icon-inline",i.inline)("mat-icon-no-color",i.color!=="primary"&&i.color!=="accent"&&i.color!=="warn"));},inputs:{color:"color",inline:[2,"inline","inline",WF],svgIcon:"svgIcon",fontSet:"fontSet",fontIcon:"fontIcon"},exportAs:["matIcon"],ngContentSelectors:Pi,decls:1,vars:0,template:function(t,i){t&1&&(CD(),bD(0));},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
  color: var(--mat-icon-color, inherit);
}

.mat-icon {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  overflow: hidden;
}
.mat-icon.mat-icon-inline {
  font-size: inherit;
  height: inherit;
  line-height: inherit;
  width: inherit;
}
.mat-icon.mat-ligature-font[fontIcon]::before {
  content: attr(fontIcon);
}

[dir=rtl] .mat-icon-rtl-mirror {
  transform: scale(-1, 1);
}

.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon {
  display: block;
}
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon {
  margin: auto;
}
`],encapsulation:2})}return n})(),Xu=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[er$3]})}return n})();function $$1(e){return {ok:true,value:e}}function U$1(e){return {ok:false,error:e}}function F$1(e){return U$1({kind:"missing",message:e})}function z$2(e){return U$1({kind:"transient",message:e})}function X$1(e,n,t){return U$1({kind:"permanent",message:e,id:n,context:t})}var Ht$3="https://www.warcraftlogs.com/api/v2/client",f=class extends Error{status;constructor(n,t){super(n),this.status=t,this.name="WclTransportError";}},Z$1=422,tt$1=new N$3("WCL_TRANSPORT");var wt$2=new Set([0,408,429,500,502,503,504]),At=404,Ct$3=8;function Rt$3(e){let n=e;for(let t=0;n!=null&&t<Ct$3;t++){if(n instanceof Y$1||n instanceof f)return n.status;n=n instanceof Error?n.cause:null;}return  -1}function et$1(e,n){let t=Rt$3(e);return t===At?F$1("Not yet ingested."):wt$2.has(t)?z$2("WCL is unreachable right now."):X$1("Analysis data could not be loaded.",n,e)}var rt$1="a21cf850-4cf8-4591-b3e5-906aba0da145",nt$1="ZYBFec16gC0CfwaunQjSAwUCQwEXTKOFo5JkwSze";var b=class{files;slice;constructor(n,t){this.files=n,this.slice=t;}getBench(n,t){return this.files.getSlice(n,t,this.slice)}};function T$1(e,n){return {provide:e,useFactory:()=>new b(T$2(N$1),n)}}var ot$1=new N$3("BURST_DATA_SOURCE");var it$1=new N$3("ROTATION_DATA_SOURCE");var at$1=new N$3("DEFENSIVE_DATA_SOURCE");var st$1=new N$3("GEAR_DATA_SOURCE");var ct=new N$3("MAP_DATA_SOURCE");var lt$1=new N$3("NORTHERN_SKY_DATA_SOURCE");var D$1={dataBaseHref:"/data/specs/",wclClientId:rt$1,wclClientSecret:nt$1},Ae$3=[T$1(ot$1,"burst"),T$1(it$1,"rotation"),T$1(at$1,"defensive"),T$1(st$1,"gear"),T$1(ct,"positions"),T$1(lt$1,"northern-sky")];var pt$2=new N$3("DATA_FILE_TRANSPORT"),j$1="DataFileApiService is read-only in the browser",Fe$3=(()=>{class e{http=T$2(Ve$3);base=new URL(D$1.dataBaseHref,document.baseURI).href;async readJson(t){try{return $$1(await Gh(this.http.get(`${this.base}${t}`)))}catch(r){return a(`DataFileTransport.readJson ${t}`,r),et$1(r,`data-file.${t}`)}}writeJson(){throw new Error(j$1)}remove(){throw new Error(j$1)}list(){throw new Error(j$1)}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();function P$1(e){return e.ok?e:e.error.kind==="missing"?$$1([]):e}var N$1=(()=>{class e{io=T$2(pt$2);getSlice(t,r,o){return this.io.readJson(`${t}/${o}/${r}.json`)}getRulebook(t){return this.io.readJson(`${t}/rulebook.json`)}async getSpecs(){return P$1(await this.io.readJson("index.json"))}async getSpecMeta(){return P$1(await this.io.readJson("spec-meta.json"))}async getEncounters(t){return P$1(await this.io.readJson(`${t}/encounters.json`))}getPositions(t,r){return this.io.readJson(`${t}/positions/${r}.json`)}writeSlice(t,r,o,i){return this.io.writeJson(`${t}/${o}/${r}.json`,i)}writePositions(t,r,o){return this.io.writeJson(`${t}/positions/${r}.json`,o)}writeEncounters(t,r){return this.io.writeJson(`${t}/encounters.json`,r)}writeSpecs(t){return this.io.writeJson("index.json",t)}writeSpecMeta(t){return this.io.writeJson("spec-meta.json",t)}async listSpecs(){return (await this.io.list("")).filter(t=>!t.includes("."))}listSliceFiles(t,r){return this.io.list(`${t}/${r}`)}removeSlice(t,r,o){return this.io.remove(`${t}/${o}/${r}.json`)}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var mt$1="https://wow.zamimg.com/images/wow/icons/small";function $t$1(e){return `class_${e.toLowerCase().replace(/ /g,"")}`}function ut$1(e){return {metas:Object.fromEntries(e.map(n=>[n.spec,n])),classIcons:new Set(e.map(n=>n.classIcon))}}function bt$3(e){let n=new Map;for(let t of Object.values(e.metas))n.has(t.className)||n.set(t.className,{className:t.className,classLabel:t.classLabel,classIcon:t.classIcon});return [...n.values()].sort((t,r)=>t.classLabel.localeCompare(r.classLabel))}function Nt$2(e,n,t){return t.map(r=>e.metas[r]).filter(r=>!!r&&r.className===n).sort((r,o)=>r.specLabel.localeCompare(o.specLabel))}function Lt$3(e,n){return n?e.metas[n]:void 0}function kt$3(e,n){let t=$t$1(n);return e.classIcons.has(t)?`${mt$1}/${t}.jpg`:""}function Ot$2(e,n){let t=e.metas[n];return t&&t.specIcon?`${mt$1}/${t.specIcon}.jpg`:""}var dt=(()=>{class e{universe=Ho$1(ut$1([]));markHydrated;hydrated=new Promise(t=>{this.markHydrated=t;});constructor(){T$2(N$1).getSpecMeta().then(r=>this.hydrate(r.ok?r.value:[]));}hydrate(t){this.universe.set(ut$1(t)),this.markHydrated();}async resolve(t){return await this.hydrated,this.specMetaOf(t)}classList(){return bt$3(this.universe())}specsForClass(t,r){return Nt$2(this.universe(),t,r)}specMetaOf(t){return Lt$3(this.universe(),t)}classIconUrl(t){return kt$3(this.universe(),t)}specIconUrl(t){return Ot$2(this.universe(),t)}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();function Ut$3(e,n){if(e&1&&(yi$2(0,"div",3),JD(1),Uc$1()),e&2){let t=wD(2);xv(),nh$1(t.subtitle());}}function Ft$2(e,n){if(e&1&&(yi$2(0,"div",1)(1,"div",2),JD(2),Uc$1(),rD(3,Ut$3,2,1,"div",3),Uc$1()),e&2){let t=wD();xv(2),nh$1(t.heading()),xv(),oD(t.subtitle()?3:-1);}}function jt$4(e,n){if(e&1&&(yi$2(0,"mat-icon",4),JD(1),Uc$1(),yi$2(2,"div",5),JD(3),Uc$1(),yi$2(4,"div",6),JD(5),Uc$1()),e&2){wD();let t=rw(0);xv(),nh$1(t.kind==="permanent"?"error":"cloud_off"),xv(2),nh$1(t.message),xv(2),Qc$1(" ",t.kind==="permanent"?"This analysis is bugged. Retrying will not fix it.":"Retries on the next sync, or reselect the fight."," ");}}function Pt$2(e,n){if(e&1&&(yi$2(0,"div",6),JD(1),Uc$1()),e&2){let t=wD(2);xv(),nh$1(t.caption());}}function Mt$3(e,n){if(e&1&&(yi$2(0,"mat-icon",7),JD(1,"schedule"),Uc$1(),yi$2(2,"div",5),JD(3,"Waiting for top parses"),Uc$1(),rD(4,Pt$2,2,1,"div",6)),e&2){let t=wD();xv(4),oD(t.caption()?4:-1);}}var Ze$3=(()=>{class e{heading=jF("");subtitle=jF("");caption=jF("Built from the top-parse bench.");error=jF(null);static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["wl-load-state"]],hostAttrs:[1,"block"],inputs:{heading:[1,"heading"],subtitle:[1,"subtitle"],caption:[1,"caption"],error:[1,"error"]},decls:6,vars:6,consts:[[1,"bg-[var(--surface)]","border","border-[var(--border)]","rounded-[10px]","overflow-hidden"],[1,"px-4","pt-3","pb-2"],[1,"text-[17px]","font-semibold","text-[var(--text)]"],[1,"text-xs","text-[var(--muted)]","mt-0.5"],[1,"icon-seg","text-[var(--info)]"],[1,"text-[13px]","text-[var(--muted)]"],[1,"text-[11.5px]","text-[var(--muted)]/70"],[1,"icon-seg","text-[var(--muted)]"]],template:function(r,o){if(r&1&&(sh$1(0),yi$2(1,"div",0),rD(2,Ft$2,4,2,"div",1),yi$2(3,"div"),rD(4,jt$4,6,3)(5,Mt$3,5,1),Uc$1()()),r&2){let i=nw(o.error());xv(2),oD(o.heading()?2:-1),xv(),BD(ow("px-4 py-6 flex flex-col items-center gap-2 text-center ",o.heading()?"border-t border-dashed border-[var(--border)]":"")),xv(),oD(i?4:5);}},dependencies:[Xu,Yu],encapsulation:2})}return e})();var qt$1="https://www.warcraftlogs.com/oauth/token",ft$1=(()=>{class e{http=T$2(Ve$3);_token=null;_expiry=0;_inFlight=null;async getToken(){return this._token&&Date.now()<this._expiry-6e4?this._token:this._inFlight?this._inFlight:(this._inFlight=this._fetchToken().finally(()=>{this._inFlight=null;}),this._inFlight)}async _fetchToken(){let t=new URLSearchParams({grant_type:"client_credentials",client_id:D$1.wclClientId,client_secret:D$1.wclClientSecret}),r;try{r=await Gh(this.http.post(qt$1,t.toString(),{headers:{"Content-Type":"application/x-www-form-urlencoded"}}));}catch(i){let a=i instanceof Y$1?i.status:0,p=i instanceof Y$1?typeof i.error=="string"?i.error:JSON.stringify(i.error):"";throw new f(`WCL token request failed (${a}): ${p}`,a)}let o=r?.access_token;if(typeof o!="string"||o.length===0)throw new f("WCL token response carried no access_token.",0);return this._token=o,this._expiry=Date.now()+(r.expires_in||3600)*1e3,this._token}invalidate(){this._token=null,this._expiry=0;}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var ht$1=`
query($code:String!){reportData{report(code:$code){
  title
  startTime
  fights(killType:All){id name startTime endTime kill encounterID difficulty friendlyPlayers fightPercentage}
  masterData{
    actors(type:"Player"){id name subType server}
    enemies:actors(type:"NPC"){id name gameID}
    abilities{gameID name icon}
  }
}}}`,Tt$2=`
query($code:String!){reportData{report(code:$code){
  fights(killType:All){id name startTime endTime kill encounterID difficulty friendlyPlayers fightPercentage}
}}}`,gt$3=`
query($code:String!,$fightIDs:[Int]!){
  reportData{report(code:$code){playerDetails(fightIDs:$fightIDs)}}
}`,_t$3=`
query($code:String!,$fightIDs:[Int]!,$dataType:EventDataType,$sourceID:Int,$startTime:Float,$endTime:Float,$includeResources:Boolean,$hostilityType:HostilityType){
  reportData{report(code:$code){
    events(fightIDs:$fightIDs,dataType:$dataType,sourceID:$sourceID,
           startTime:$startTime,endTime:$endTime,includeResources:$includeResources,hostilityType:$hostilityType,limit:10000){data nextPageTimestamp}
  }}
}`,yt$3=`
query($code:String!,$fightIDs:[Int]!,$dataType:TableDataType){
  reportData{report(code:$code){table(fightIDs:$fightIDs,dataType:$dataType)}}
}`,St$4=`
query($code:String!,$fightIDs:[Int]!,$filter:String,$startTime:Float,$endTime:Float){
  reportData{report(code:$code){
    events(fightIDs:$fightIDs,dataType:All,filterExpression:$filter,startTime:$startTime,endTime:$endTime,limit:10000){data nextPageTimestamp}
  }}
}`,xt$2=`
query($encounterID:Int!,$className:String!,$specName:String!,$partition:Int){
  worldData{encounter(id:$encounterID){
    characterRankings(className:$className,specName:$specName,metric:dps,partition:$partition)
  }}
}`,It$2=`
query($code:String!,$fightIDs:[Int]!,$sourceID:Int){
  reportData{report(code:$code){
    events(fightIDs:$fightIDs,dataType:CombatantInfo,sourceID:$sourceID){data}
  }}
}`;function vt$3(e,n){return `query{gameData{${[...e.map(r=>`i${r}: item(id:${r}){id name}`),...n.map(r=>`e${r}: enchant(id:${r}){id name}`)].join(" ")}}}`}function Dt$2(e){return `query{gameData{${e.map(t=>`a${t}: ability(id:${t}){id name icon}`).join(" ")}}}`}var cr$2="query { rateLimitData { limitPerHour pointsSpentThisHour pointsResetIn } }",lr$2="query { gameData { classes { id name slug specs { id name slug } } } }",pr$2=`
query {
  worldData {
    expansions {
      id name
      zones {
        id name frozen
        partitions { id name }
        encounters { id name }
      }
    }
  }
}`;var _r$2=(()=>{class e{auth=T$2(ft$1);transport=T$2(tt$1);specMeta=T$2(dt);async query(t,r={}){let o=await this.auth.getToken();try{return await this.transport.query(t,r,o)}catch(i){if(i instanceof f&&i.status===401){this.auth.invalidate();let a=await this.auth.getToken();return await this.transport.query(t,r,a)}throw i}}async getReport(t){let r={code:t},i=(await this.query(ht$1,r))?.reportData?.report;if(!i)throw this.reportUnavailable(t);return i}async getReportFights(t){let r={code:t},i=(await this.query(Tt$2,r))?.reportData?.report;if(!i)throw this.reportUnavailable(t);return i.fights??[]}async getPlayerDetails(t,r){let o={code:t,fightIDs:[r]},a=(await this.query(gt$3,o))?.reportData?.report?.playerDetails?.data?.playerDetails;if(!a)throw this.reportUnavailable(t);return a}reportUnavailable(t){return new f(`WCL report ${t} is unavailable (not found, private, or expired).`,Z$1)}async getAllEvents(t,r,o,i,a,p,L=false,k){let g=[],w=i;for(;;){let A={code:t,fightIDs:[r],dataType:o,startTime:w,endTime:a};p!=null&&(A.sourceID=p),L&&(A.includeResources=true),k&&(A.hostilityType=k);let O=(await this.query(_t$3,A)).reportData.report.events;for(let Et of O.data??[])g.push(Et);if(!O.nextPageTimestamp)break;w=O.nextPageTimestamp;}return g}async getCombatantInfo(t,r,o){let i={code:t,fightIDs:[r],sourceID:o},p=(await this.query(It$2,i))?.reportData?.report;if(!p)throw this.reportUnavailable(t);return p.events?.data??[]}async getDamageDoneTable(t,r){let o={code:t,fightIDs:[r],dataType:"DamageDone"};return (await this.query(yt$3,o))?.reportData?.report?.table??null}async getResurrects(t,r,o,i){let a=[],p=o;for(;;){let L={code:t,fightIDs:[r],filter:'type = "resurrect"',startTime:p,endTime:i},g=(await this.query(St$4,L)).reportData.report.events;for(let w of g.data??[])a.push(w);if(!g.nextPageTimestamp)break;p=g.nextPageTimestamp;}return a}async getGameNames(t,r){return !t.length&&!r.length?{}:(await this.query(vt$3(t,r)))?.gameData??{}}async getAbilities(t){let r=[...new Set(t)].filter(i=>i>0);return r.length?(await this.query(Dt$2(r)))?.gameData??{}:{}}async getRankings(t,r,o){let i=await this.specMeta.resolve(t);if(!i)return null;let a={encounterID:r,className:i.className,specName:i.specName};return o!=null&&(a.partition=o),(await this.query(xt$2,a))?.worldData?.encounter?.characterRankings??null}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();function W$1(n){return n.buttons===0||n.detail===0}function Z(n){let a=n.touches&&n.touches[0]||n.changedTouches&&n.changedTouches[0];return !!a&&a.identifier===-1&&(a.radiusX==null||a.radiusX===1)&&(a.radiusY==null||a.radiusY===1)}var Mt$2;function _e$2(){if(Mt$2==null){let n=typeof document<"u"?document.head:null;Mt$2=!!(n&&(n.createShadowRoot||n.attachShadow));}return Mt$2}function Dt$1(n){if(_e$2()){let a=n.getRootNode?n.getRootNode():null;if(typeof ShadowRoot<"u"&&ShadowRoot&&a instanceof ShadowRoot)return a}return null}function y(n){return n.composedPath?n.composedPath()[0]:n.target}var kt$2;try{kt$2=typeof Intl<"u"&&Intl.v8BreakIterator;}catch{kt$2=false;}var u=(()=>{class n{_platformId=T$2(dm$1);isBrowser=this._platformId?Ns$1(this._platformId):typeof document=="object"&&!!document;EDGE=this.isBrowser&&/(edge)/i.test(navigator.userAgent);TRIDENT=this.isBrowser&&/(msie|trident)/i.test(navigator.userAgent);BLINK=this.isBrowser&&!!(window.chrome||kt$2)&&typeof CSS<"u"&&!this.EDGE&&!this.TRIDENT;WEBKIT=this.isBrowser&&/AppleWebKit/i.test(navigator.userAgent)&&!this.BLINK&&!this.EDGE&&!this.TRIDENT;IOS=this.isBrowser&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!("MSStream"in window);FIREFOX=this.isBrowser&&/(firefox|minefield)/i.test(navigator.userAgent);ANDROID=this.isBrowser&&/android/i.test(navigator.userAgent)&&!this.TRIDENT;SAFARI=this.isBrowser&&/safari/i.test(navigator.userAgent)&&this.WEBKIT;static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var G$1;function ge$1(){if(G$1==null&&typeof window<"u")try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:()=>G$1=!0}));}finally{G$1=G$1||false;}return G$1}function z$1(n){return ge$1()?n:!!n.capture}function Ct$2(n,a=0){return ye$1(n)?Number(n):arguments.length===2?a:0}function ye$1(n){return !isNaN(parseFloat(n))&&!isNaN(Number(n))}function E$1(n){return n instanceof Mr$2?n.nativeElement:n}var xe$1=new N$3("cdk-input-modality-detector-options"),Ee$2={ignoreKeys:[18,17,224,91,16]},we$1=650,Ot$1={passive:true,capture:true},Ae$2=(()=>{class n{_platform=T$2(u);_listenerCleanups;modalityDetected;modalityChanged;get mostRecentModality(){return this._modality.value}_mostRecentTarget=null;_modality=new Hn$3(null);_options;_lastTouchMs=0;_onKeydown=t=>{this._options?.ignoreKeys?.some(e=>e===t.keyCode)||(this._modality.next("keyboard"),this._mostRecentTarget=y(t));};_onMousedown=t=>{Date.now()-this._lastTouchMs<we$1||(this._modality.next(W$1(t)?"keyboard":"mouse"),this._mostRecentTarget=y(t));};_onTouchstart=t=>{if(Z(t)){this._modality.next("keyboard");return}this._lastTouchMs=Date.now(),this._modality.next("touch"),this._mostRecentTarget=y(t);};constructor(){let t=T$2(De$3),e=T$2(dr$3),o=T$2(xe$1,{optional:true});if(this._options=r(r({},Ee$2),o),this.modalityDetected=this._modality.pipe(bg(1)),this.modalityChanged=this.modalityDetected.pipe(mg()),this._platform.isBrowser){let i=T$2(wr$1).createRenderer(null,null);this._listenerCleanups=t.runOutsideAngular(()=>[i.listen(e,"keydown",this._onKeydown,Ot$1),i.listen(e,"mousedown",this._onMousedown,Ot$1),i.listen(e,"touchstart",this._onTouchstart,Ot$1)]);}}ngOnDestroy(){this._modality.complete(),this._listenerCleanups?.forEach(t=>t());}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),$=(function(n){return n[n.IMMEDIATE=0]="IMMEDIATE",n[n.EVENTUAL=1]="EVENTUAL",n})($||{}),Ie$2=new N$3("cdk-focus-monitor-default-options"),ut=z$1({passive:true,capture:true}),Nt$1=(()=>{class n{_ngZone=T$2(De$3);_platform=T$2(u);_inputModalityDetector=T$2(Ae$2);_origin=null;_lastFocusOrigin=null;_windowFocused=false;_windowFocusTimeoutId;_originTimeoutId;_originFromTouchInteraction=false;_elementInfo=new Map;_monitoredElementCount=0;_rootNodeFocusListenerCount=new Map;_detectionMode;_windowFocusListener=()=>{this._windowFocused=true,this._windowFocusTimeoutId=setTimeout(()=>this._windowFocused=false);};_document=T$2(dr$3);_stopInputModalityDetector=new ie$1;constructor(){let t=T$2(Ie$2,{optional:true});this._detectionMode=t?.detectionMode||$.IMMEDIATE;}_rootNodeFocusAndBlurListener=t=>{let e=y(t);for(let o=e;o;o=o.parentElement)t.type==="focus"?this._onFocus(t,o):this._onBlur(t,o);};monitor(t,e=false){let o=E$1(t);if(!this._platform.isBrowser||o.nodeType!==1)return Uh();let i=Dt$1(o)||this._document,s=this._elementInfo.get(o);if(s)return e&&(s.checkChildren=true),s.subject;let c={checkChildren:e,subject:new ie$1,rootNode:i};return this._elementInfo.set(o,c),this._registerGlobalListeners(c),c.subject}stopMonitoring(t){let e=E$1(t),o=this._elementInfo.get(e);o&&(o.subject.complete(),this._setClasses(e),this._elementInfo.delete(e),this._removeGlobalListeners(o));}focusVia(t,e,o){let i=E$1(t),s=this._document.activeElement;i===s?this._getClosestElementsInfo(i).forEach(([c,b])=>this._originChanged(c,e,b)):(this._setOrigin(e),typeof i.focus=="function"&&i.focus(o));}ngOnDestroy(){this._elementInfo.forEach((t,e)=>this.stopMonitoring(e));}_getWindow(){return this._document.defaultView||window}_getFocusOrigin(t){return this._origin?this._originFromTouchInteraction?this._shouldBeAttributedToTouch(t)?"touch":"program":this._origin:this._windowFocused&&this._lastFocusOrigin?this._lastFocusOrigin:t&&this._isLastInteractionFromInputLabel(t)?"mouse":"program"}_shouldBeAttributedToTouch(t){return this._detectionMode===$.EVENTUAL||!!t?.contains(this._inputModalityDetector._mostRecentTarget)}_setClasses(t,e){t.classList.toggle("cdk-focused",!!e),t.classList.toggle("cdk-touch-focused",e==="touch"),t.classList.toggle("cdk-keyboard-focused",e==="keyboard"),t.classList.toggle("cdk-mouse-focused",e==="mouse"),t.classList.toggle("cdk-program-focused",e==="program");}_setOrigin(t,e=false){this._ngZone.runOutsideAngular(()=>{if(this._origin=t,this._originFromTouchInteraction=t==="touch"&&e,this._detectionMode===$.IMMEDIATE){clearTimeout(this._originTimeoutId);let o=this._originFromTouchInteraction?we$1:1;this._originTimeoutId=setTimeout(()=>this._origin=null,o);}});}_onFocus(t,e){let o=this._elementInfo.get(e),i=y(t);!o||!o.checkChildren&&e!==i||this._originChanged(e,this._getFocusOrigin(i),o);}_onBlur(t,e){let o=this._elementInfo.get(e);!o||o.checkChildren&&t.relatedTarget instanceof Node&&e.contains(t.relatedTarget)||(this._setClasses(e),this._emitOrigin(o,null));}_emitOrigin(t,e){t.subject.observers.length&&this._ngZone.run(()=>t.subject.next(e));}_registerGlobalListeners(t){if(!this._platform.isBrowser)return;let e=t.rootNode,o=this._rootNodeFocusListenerCount.get(e)||0;o||this._ngZone.runOutsideAngular(()=>{e.addEventListener("focus",this._rootNodeFocusAndBlurListener,ut),e.addEventListener("blur",this._rootNodeFocusAndBlurListener,ut);}),this._rootNodeFocusListenerCount.set(e,o+1),++this._monitoredElementCount===1&&(this._ngZone.runOutsideAngular(()=>{this._getWindow().addEventListener("focus",this._windowFocusListener);}),this._inputModalityDetector.modalityDetected.pipe(Sg(this._stopInputModalityDetector)).subscribe(i=>{this._setOrigin(i,true);}));}_removeGlobalListeners(t){let e=t.rootNode;if(this._rootNodeFocusListenerCount.has(e)){let o=this._rootNodeFocusListenerCount.get(e);o>1?this._rootNodeFocusListenerCount.set(e,o-1):(e.removeEventListener("focus",this._rootNodeFocusAndBlurListener,ut),e.removeEventListener("blur",this._rootNodeFocusAndBlurListener,ut),this._rootNodeFocusListenerCount.delete(e));}--this._monitoredElementCount||(this._getWindow().removeEventListener("focus",this._windowFocusListener),this._stopInputModalityDetector.next(),clearTimeout(this._windowFocusTimeoutId),clearTimeout(this._originTimeoutId));}_originChanged(t,e,o){this._setClasses(t,e),this._emitOrigin(o,e),this._lastFocusOrigin=e;}_getClosestElementsInfo(t){let e=[];return this._elementInfo.forEach((o,i)=>{(i===t||o.checkChildren&&i.contains(t))&&e.push([i,o]);}),e}_isLastInteractionFromInputLabel(t){let{_mostRecentTarget:e,mostRecentModality:o}=this._inputModalityDetector;if(o!=="mouse"||!e||e===t||t.nodeName!=="INPUT"&&t.nodeName!=="TEXTAREA"||t.disabled)return  false;let i=t.labels;if(i){for(let s=0;s<i.length;s++)if(i[s].contains(e))return  true}return  false}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function Rt$2(n){return Array.isArray(n)?n:[n]}var Te$2=new Set,S$1,bt$2=(()=>{class n{_platform=T$2(u);_nonce=T$2(pm$1,{optional:true});_matchMedia;constructor(){this._matchMedia=this._platform.isBrowser&&window.matchMedia?window.matchMedia.bind(window):on$1;}matchMedia(t){return (this._platform.WEBKIT||this._platform.BLINK)&&an$1(t,this._nonce),this._matchMedia(t)}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function an$1(n,a){if(!Te$2.has(n))try{S$1||(S$1=document.createElement("style"),a&&S$1.setAttribute("nonce",a),S$1.setAttribute("type","text/css"),document.head.appendChild(S$1)),S$1.sheet&&(S$1.sheet.insertRule(`@media ${n} {body{ }}`,0),Te$2.add(n));}catch(t){console.error(t);}}function on$1(n){return {matches:n==="all"||n==="",media:n,addListener:()=>{},removeListener:()=>{}}}var Ft$1=(()=>{class n{_mediaMatcher=T$2(bt$2);_zone=T$2(De$3);_queries=new Map;_destroySubject=new ie$1;ngOnDestroy(){this._destroySubject.next(),this._destroySubject.complete();}isMatched(t){return Me$1(Rt$2(t)).some(o=>this._registerQuery(o).mql.matches)}observe(t){let o=Me$1(Rt$2(t)).map(s=>this._registerQuery(s).observable),i=eg(o);return i=un$2(i.pipe(dn$2(1)),i.pipe(bg(1),hg(0))),i.pipe(le$1(s=>{let c={matches:false,breakpoints:{}};return s.forEach(({matches:b,query:w})=>{c.matches=c.matches||b,c.breakpoints[w]=b;}),c}))}_registerQuery(t){if(this._queries.has(t))return this._queries.get(t);let e=this._mediaMatcher.matchMedia(t),i={observable:new x(s=>{let c=b=>this._zone.run(()=>s.next(b));return e.addListener(c),()=>{e.removeListener(c);}}).pipe(_g(e),le$1(({matches:s})=>({query:t,matches:s})),Sg(this._destroySubject)),mql:e};return this._queries.set(t,i),i}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function Me$1(n){return n.map(a=>a.split(",")).reduce((a,t)=>a.concat(t)).map(a=>a.trim())}function rn$1(n){if(n.type==="characterData"&&n.target instanceof Comment)return  true;if(n.type==="childList"){for(let a=0;a<n.addedNodes.length;a++)if(!(n.addedNodes[a]instanceof Comment))return  false;for(let a=0;a<n.removedNodes.length;a++)if(!(n.removedNodes[a]instanceof Comment))return  false;return  true}return  false}var De$1=(()=>{class n{create(t){return typeof MutationObserver>"u"?null:new MutationObserver(t)}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),ke$1=(()=>{class n{_mutationObserverFactory=T$2(De$1);_observedElements=new Map;_ngZone=T$2(De$3);ngOnDestroy(){this._observedElements.forEach((t,e)=>this._cleanupObserver(e));}observe(t){let e=E$1(t);return new x(o=>{let s=this._observeElement(e).pipe(le$1(c=>c.filter(b=>!rn$1(b))),qn$3(c=>!!c.length)).subscribe(c=>{this._ngZone.run(()=>{o.next(c);});});return ()=>{s.unsubscribe(),this._unobserveElement(e);}})}_observeElement(t){return this._ngZone.runOutsideAngular(()=>{if(this._observedElements.has(t))this._observedElements.get(t).count++;else {let e=new ie$1,o=this._mutationObserverFactory.create(i=>e.next(i));o&&o.observe(t,{characterData:true,childList:true,subtree:true}),this._observedElements.set(t,{observer:o,stream:e,count:1});}return this._observedElements.get(t).stream})}_unobserveElement(t){this._observedElements.has(t)&&(this._observedElements.get(t).count--,this._observedElements.get(t).count||this._cleanupObserver(t));}_cleanupObserver(t){if(this._observedElements.has(t)){let{observer:e,stream:o}=this._observedElements.get(t);e&&e.disconnect(),o.complete(),this._observedElements.delete(t);}}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),Ca=(()=>{class n{_contentObserver=T$2(ke$1);_elementRef=T$2(Mr$2);event=new We$3;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._disabled?this._unsubscribe():this._subscribe();}_disabled=false;get debounce(){return this._debounce}set debounce(t){this._debounce=Ct$2(t),this._subscribe();}_debounce;_currentSubscription=null;ngAfterContentInit(){!this._currentSubscription&&!this.disabled&&this._subscribe();}ngOnDestroy(){this._unsubscribe();}_subscribe(){this._unsubscribe();let t=this._contentObserver.observe(this._elementRef);this._currentSubscription=(this.debounce?t.pipe(hg(this.debounce)):t).subscribe(this.event);}_unsubscribe(){this._currentSubscription?.unsubscribe();}static \u0275fac=function(e){return new(e||n)};static \u0275dir=pE({type:n,selectors:[["","cdkObserveContent",""]],inputs:{disabled:[2,"cdkObserveContentDisabled","disabled",WF],debounce:"debounce"},outputs:{event:"cdkObserveContent"},exportAs:["cdkObserveContent"]})}return n})(),Ce$2=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({providers:[De$1]})}return n})();var Fe$2=(()=>{class n{_platform=T$2(u);isDisabled(t){return t.hasAttribute("disabled")}isVisible(t){return cn$1(t)&&getComputedStyle(t).visibility==="visible"}isTabbable(t){if(!this._platform.isBrowser)return  false;let e=sn$1(hn$1(t));if(e&&(Oe(e)===-1||!this.isVisible(e)))return  false;let o=t.nodeName.toLowerCase(),i=Oe(t);return t.hasAttribute("contenteditable")?i!==-1:o==="iframe"||o==="object"||this._platform.WEBKIT&&this._platform.IOS&&!pn$1(t)?false:o==="audio"?t.hasAttribute("controls")?i!==-1:false:o==="video"?i===-1?false:i!==null?true:this._platform.FIREFOX||t.hasAttribute("controls"):t.tabIndex>=0}isFocusable(t,e){return fn$1(t)&&!this.isDisabled(t)&&(e?.ignoreVisibility||this.isVisible(t))}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function sn$1(n){try{return n.frameElement}catch{return null}}function cn$1(n){return !!(n.offsetWidth||n.offsetHeight||typeof n.getClientRects=="function"&&n.getClientRects().length)}function dn$1(n){let a=n.nodeName.toLowerCase();return a==="input"||a==="select"||a==="button"||a==="textarea"}function mn$1(n){return un$1(n)&&n.type=="hidden"}function ln$1(n){return bn(n)&&n.hasAttribute("href")}function un$1(n){return n.nodeName.toLowerCase()=="input"}function bn(n){return n.nodeName.toLowerCase()=="a"}function Se$1(n){if(!n.hasAttribute("tabindex")||n.tabIndex===void 0)return  false;let a=n.getAttribute("tabindex");return !!(a&&!isNaN(parseInt(a,10)))}function Oe(n){if(!Se$1(n))return null;let a=parseInt(n.getAttribute("tabindex")||"",10);return isNaN(a)?-1:a}function pn$1(n){let a=n.nodeName.toLowerCase(),t=a==="input"&&n.type;return t==="text"||t==="password"||a==="select"||a==="textarea"}function fn$1(n){return mn$1(n)?false:dn$1(n)||ln$1(n)||n.hasAttribute("contenteditable")||Se$1(n)}function hn$1(n){return n.ownerDocument&&n.ownerDocument.defaultView||window}var pt$1=class pt{_element;_checker;_ngZone;_document;_injector;_startAnchor=null;_endAnchor=null;_hasAttached=false;startAnchorListener=()=>this.focusLastTabbableElement();endAnchorListener=()=>this.focusFirstTabbableElement();get enabled(){return this._enabled}set enabled(a){this._enabled=a,this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(a,this._startAnchor),this._toggleAnchorTabIndex(a,this._endAnchor));}_enabled=true;constructor(a,t,e,o,i=false,s){this._element=a,this._checker=t,this._ngZone=e,this._document=o,this._injector=s,i||this.attachAnchors();}destroy(){let a=this._startAnchor,t=this._endAnchor;a&&(a.removeEventListener("focus",this.startAnchorListener),a.remove()),t&&(t.removeEventListener("focus",this.endAnchorListener),t.remove()),this._startAnchor=this._endAnchor=null,this._hasAttached=false;}attachAnchors(){return this._hasAttached?true:(this._ngZone.runOutsideAngular(()=>{this._startAnchor||(this._startAnchor=this._createAnchor(),this._startAnchor.addEventListener("focus",this.startAnchorListener)),this._endAnchor||(this._endAnchor=this._createAnchor(),this._endAnchor.addEventListener("focus",this.endAnchorListener));}),this._element.parentNode&&(this._element.parentNode.insertBefore(this._startAnchor,this._element),this._element.parentNode.insertBefore(this._endAnchor,this._element.nextSibling),this._hasAttached=true),this._hasAttached)}focusInitialElementWhenReady(a){return new Promise(t=>{this._executeOnStable(()=>t(this.focusInitialElement(a)));})}focusFirstTabbableElementWhenReady(a){return new Promise(t=>{this._executeOnStable(()=>t(this.focusFirstTabbableElement(a)));})}focusLastTabbableElementWhenReady(a){return new Promise(t=>{this._executeOnStable(()=>t(this.focusLastTabbableElement(a)));})}_getRegionBoundary(a){let t=this._element.querySelectorAll(`[cdk-focus-region-${a}], [cdkFocusRegion${a}], [cdk-focus-${a}]`);return a=="start"?t.length?t[0]:this._getFirstTabbableElement(this._element):t.length?t[t.length-1]:this._getLastTabbableElement(this._element)}focusInitialElement(a){let t=this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]");if(t){if(!this._checker.isFocusable(t)){let e=this._getFirstTabbableElement(t);return e?.focus(a),!!e}return t.focus(a),true}return this.focusFirstTabbableElement(a)}focusFirstTabbableElement(a){let t=this._getRegionBoundary("start");return t&&t.focus(a),!!t}focusLastTabbableElement(a){let t=this._getRegionBoundary("end");return t&&t.focus(a),!!t}hasAttached(){return this._hasAttached}_getFirstTabbableElement(a){if(this._checker.isFocusable(a)&&this._checker.isTabbable(a))return a;let t=a.children;for(let e=0;e<t.length;e++){let o=t[e].nodeType===this._document.ELEMENT_NODE?this._getFirstTabbableElement(t[e]):null;if(o)return o}return null}_getLastTabbableElement(a){if(this._checker.isFocusable(a)&&this._checker.isTabbable(a))return a;let t=a.children;for(let e=t.length-1;e>=0;e--){let o=t[e].nodeType===this._document.ELEMENT_NODE?this._getLastTabbableElement(t[e]):null;if(o)return o}return null}_createAnchor(){let a=this._document.createElement("div");return this._toggleAnchorTabIndex(this._enabled,a),a.classList.add("cdk-visually-hidden"),a.classList.add("cdk-focus-trap-anchor"),a.setAttribute("aria-hidden","true"),a}_toggleAnchorTabIndex(a,t){a?t.setAttribute("tabindex","0"):t.removeAttribute("tabindex");}toggleAnchors(a){this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(a,this._startAnchor),this._toggleAnchorTabIndex(a,this._endAnchor));}_executeOnStable(a){sv(a,{injector:this._injector});}},vn=(()=>{class n{_checker=T$2(Fe$2);_ngZone=T$2(De$3);_document=T$2(dr$3);_injector=T$2(Ee$4);constructor(){T$2(bi$2).load(vu);}create(t,e=false){return new pt$1(t,this._checker,this._ngZone,this._document,e,this._injector)}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var Le=new N$3("liveAnnouncerElement",{providedIn:"root",factory:()=>null}),Pe$1=new N$3("LIVE_ANNOUNCER_DEFAULT_OPTIONS"),_n$1=0,gn$1=(()=>{class n{_ngZone=T$2(De$3);_defaultOptions=T$2(Pe$1,{optional:true});_liveElement;_document=T$2(dr$3);_sanitizer=T$2(Ft$3);_previousTimeout;_currentPromise;_currentResolve;constructor(){let t=T$2(Le,{optional:true});this._liveElement=t||this._createLiveElement();}announce(t,...e){let o=this._defaultOptions,i,s;return e.length===1&&typeof e[0]=="number"?s=e[0]:[i,s]=e,this.clear(),clearTimeout(this._previousTimeout),i||(i=o&&o.politeness?o.politeness:"polite"),s==null&&o&&(s=o.duration),this._liveElement.setAttribute("aria-live",i),this._liveElement.id&&this._exposeAnnouncerToModals(this._liveElement.id),this._ngZone.runOutsideAngular(()=>(this._currentPromise||(this._currentPromise=new Promise(c=>this._currentResolve=c)),clearTimeout(this._previousTimeout),this._previousTimeout=setTimeout(()=>{!t||typeof t=="string"?this._liveElement.textContent=t:wu(this._liveElement,t,this._sanitizer),typeof s=="number"&&(this._previousTimeout=setTimeout(()=>this.clear(),s)),this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;},100),this._currentPromise))}clear(){this._liveElement&&(this._liveElement.textContent="");}ngOnDestroy(){clearTimeout(this._previousTimeout),this._liveElement?.remove(),this._liveElement=null,this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;}_createLiveElement(){let t="cdk-live-announcer-element",e=this._document.getElementsByClassName(t),o=this._document.createElement("div");for(let i=0;i<e.length;i++)e[i].remove();return o.classList.add(t),o.classList.add("cdk-visually-hidden"),o.setAttribute("aria-atomic","true"),o.setAttribute("aria-live","polite"),o.id=`cdk-live-announcer-${_n$1++}`,this._document.body.appendChild(o),o}_exposeAnnouncerToModals(t){let e=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let o=0;o<e.length;o++){let i=e[o],s=i.getAttribute("aria-owns");s?s.indexOf(t)===-1&&i.setAttribute("aria-owns",s+" "+t):i.setAttribute("aria-owns",t);}}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var O$1=(function(n){return n[n.NONE=0]="NONE",n[n.BLACK_ON_WHITE=1]="BLACK_ON_WHITE",n[n.WHITE_ON_BLACK=2]="WHITE_ON_BLACK",n})(O$1||{}),Ne="cdk-high-contrast-black-on-white",Re$2="cdk-high-contrast-white-on-black",St$3="cdk-high-contrast-active",Be$1=(()=>{class n{_platform=T$2(u);_hasCheckedHighContrastMode=false;_document=T$2(dr$3);_breakpointSubscription;constructor(){this._breakpointSubscription=T$2(Ft$1).observe("(forced-colors: active)").subscribe(()=>{this._hasCheckedHighContrastMode&&(this._hasCheckedHighContrastMode=false,this._applyBodyHighContrastModeCssClasses());});}getHighContrastMode(){if(!this._platform.isBrowser)return O$1.NONE;let t=this._document.createElement("div");t.style.backgroundColor="rgb(1,2,3)",t.style.position="absolute",this._document.body.appendChild(t);let e=this._document.defaultView||window,o=e&&e.getComputedStyle?e.getComputedStyle(t):null,i=(o&&o.backgroundColor||"").replace(/ /g,"");switch(t.remove(),i){case "rgb(0,0,0)":case "rgb(45,50,54)":case "rgb(32,32,32)":return O$1.WHITE_ON_BLACK;case "rgb(255,255,255)":case "rgb(255,250,239)":return O$1.BLACK_ON_WHITE}return O$1.NONE}ngOnDestroy(){this._breakpointSubscription.unsubscribe();}_applyBodyHighContrastModeCssClasses(){if(!this._hasCheckedHighContrastMode&&this._platform.isBrowser&&this._document.body){let t=this._document.body.classList;t.remove(St$3,Ne,Re$2),this._hasCheckedHighContrastMode=true;let e=this.getHighContrastMode();e===O$1.BLACK_ON_WHITE?t.add(St$3,Ne):e===O$1.WHITE_ON_BLACK&&t.add(St$3,Re$2);}}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),yn=(()=>{class n{constructor(){T$2(Be$1)._applyBodyHighContrastModeCssClasses();}static \u0275fac=function(e){return new(e||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[Ce$2]})}return n})();var xn$1=200,ft=class{_letterKeyStream=new ie$1;_items=[];_selectedItemIndex=-1;_pressedLetters=[];_skipPredicateFn;_selectedItem=new ie$1;selectedItem=this._selectedItem;constructor(a,t){let e=typeof t?.debounceInterval=="number"?t.debounceInterval:xn$1;t?.skipPredicate&&(this._skipPredicateFn=t.skipPredicate),this.setItems(a),this._setupKeyHandler(e);}destroy(){this._pressedLetters=[],this._letterKeyStream.complete(),this._selectedItem.complete();}setCurrentSelectedItemIndex(a){this._selectedItemIndex=a;}setItems(a){this._items=a;}handleKey(a){let t=a.keyCode;a.key&&a.key.length===1?this._letterKeyStream.next(a.key.toLocaleUpperCase()):(t>=65&&t<=90||t>=48&&t<=57)&&this._letterKeyStream.next(String.fromCharCode(t));}isTyping(){return this._pressedLetters.length>0}reset(){this._pressedLetters=[];}_setupKeyHandler(a){this._letterKeyStream.pipe(xg(t=>this._pressedLetters.push(t)),hg(a),qn$3(()=>this._pressedLetters.length>0),le$1(()=>this._pressedLetters.join("").toLocaleUpperCase())).subscribe(t=>{for(let e=1;e<this._items.length+1;e++){let o=(this._selectedItemIndex+e)%this._items.length,i=this._items[o];if(!this._skipPredicateFn?.(i)&&i.getLabel?.().toLocaleUpperCase().trim().indexOf(t)===0){this._selectedItem.next(i);break}}this._pressedLetters=[];});}};function Ue$1(n,...a){return a.length?a.some(t=>n[t]):n.altKey||n.shiftKey||n.ctrlKey||n.metaKey}var ht=class{_items;_activeItemIndex=Ho$1(-1);_activeItem=Ho$1(null);_wrap=false;_typeaheadSubscription=G$2.EMPTY;_itemChangesSubscription;_vertical=true;_horizontal=null;_allowedModifierKeys=[];_homeAndEnd=false;_pageUpAndDown={enabled:false,delta:10};_effectRef;_typeahead;_skipPredicateFn=a=>a.disabled;constructor(a,t){this._items=a,a instanceof oi$3?this._itemChangesSubscription=a.changes.subscribe(e=>this._itemsChanged(e.toArray())):sa(a)&&(this._effectRef=Vu(()=>this._itemsChanged(a()),{injector:t}));}tabOut=new ie$1;change=new ie$1;skipPredicate(a){return this._skipPredicateFn=a,this}withWrap(a=true){return this._wrap=a,this}withVerticalOrientation(a=true){return this._vertical=a,this}withHorizontalOrientation(a){return this._horizontal=a,this}withAllowedModifierKeys(a){return this._allowedModifierKeys=a,this}withTypeAhead(a=200){this._typeaheadSubscription.unsubscribe();let t=this._getItemsArray();return this._typeahead=new ft(t,{debounceInterval:typeof a=="number"?a:void 0,skipPredicate:e=>this._skipPredicateFn(e)}),this._typeaheadSubscription=this._typeahead.selectedItem.subscribe(e=>{this.setActiveItem(e);}),this}cancelTypeahead(){return this._typeahead?.reset(),this}withHomeAndEnd(a=true){return this._homeAndEnd=a,this}withPageUpDown(a=true,t=10){return this._pageUpAndDown={enabled:a,delta:t},this}setActiveItem(a){let t=this._activeItem();this.updateActiveItem(a),this._activeItem()!==t&&this.change.next(this._activeItemIndex());}onKeydown(a){let t=a.keyCode,o=["altKey","ctrlKey","metaKey","shiftKey"].every(i=>!a[i]||this._allowedModifierKeys.indexOf(i)>-1);switch(t){case 9:this.tabOut.next();return;case 40:if(this._vertical&&o){this.setNextItemActive();break}else return;case 38:if(this._vertical&&o){this.setPreviousItemActive();break}else return;case 39:if(this._horizontal&&o){this._horizontal==="rtl"?this.setPreviousItemActive():this.setNextItemActive();break}else return;case 37:if(this._horizontal&&o){this._horizontal==="rtl"?this.setNextItemActive():this.setPreviousItemActive();break}else return;case 36:if(this._homeAndEnd&&o){this.setFirstItemActive();break}else return;case 35:if(this._homeAndEnd&&o){this.setLastItemActive();break}else return;case 33:if(this._pageUpAndDown.enabled&&o){let i=this._activeItemIndex()-this._pageUpAndDown.delta;this._setActiveItemByIndex(i>0?i:0,1);break}else return;case 34:if(this._pageUpAndDown.enabled&&o){let i=this._activeItemIndex()+this._pageUpAndDown.delta,s=this._getItemsArray().length;this._setActiveItemByIndex(i<s?i:s-1,-1);break}else return;default:(o||Ue$1(a,"shiftKey"))&&this._typeahead?.handleKey(a);return}this._typeahead?.reset(),a.preventDefault();}get activeItemIndex(){return this._activeItemIndex()}get activeItem(){return this._activeItem()}isTyping(){return !!this._typeahead&&this._typeahead.isTyping()}setFirstItemActive(){this._setActiveItemByIndex(0,1);}setLastItemActive(){this._setActiveItemByIndex(this._getItemsArray().length-1,-1);}setNextItemActive(){this._activeItemIndex()<0?this.setFirstItemActive():this._setActiveItemByDelta(1);}setPreviousItemActive(){this._activeItemIndex()<0&&this._wrap?this.setLastItemActive():this._setActiveItemByDelta(-1);}updateActiveItem(a){let t=this._getItemsArray(),e=typeof a=="number"?a:t.indexOf(a),o=t[e];this._activeItem.set(o??null),this._activeItemIndex.set(e),this._typeahead?.setCurrentSelectedItemIndex(e);}destroy(){this._typeaheadSubscription.unsubscribe(),this._itemChangesSubscription?.unsubscribe(),this._effectRef?.destroy(),this._typeahead?.destroy(),this.tabOut.complete(),this.change.complete();}_setActiveItemByDelta(a){this._wrap?this._setActiveInWrapMode(a):this._setActiveInDefaultMode(a);}_setActiveInWrapMode(a){let t=this._getItemsArray();for(let e=1;e<=t.length;e++){let o=(this._activeItemIndex()+a*e+t.length)%t.length,i=t[o];if(!this._skipPredicateFn(i)){this.setActiveItem(o);return}}}_setActiveInDefaultMode(a){this._setActiveItemByIndex(this._activeItemIndex()+a,a);}_setActiveItemByIndex(a,t){let e=this._getItemsArray();if(e[a]){for(;this._skipPredicateFn(e[a]);)if(a+=t,!e[a])return;this.setActiveItem(a);}}_getItemsArray(){return sa(this._items)?this._items():this._items instanceof oi$3?this._items.toArray():this._items}_itemsChanged(a){this._typeahead?.setItems(a);let t=this._activeItem();if(t){let e=a.indexOf(t);e>-1&&e!==this._activeItemIndex()&&(this._activeItemIndex.set(e),this._typeahead?.setCurrentSelectedItemIndex(e));}}};var Lt$2=class Lt extends ht{setActiveItem(a){this.activeItem&&this.activeItem.setInactiveStyles(),super.setActiveItem(a),this.activeItem&&this.activeItem.setActiveStyles();}};var ze=new Map,Pt$1=class n{_appId=T$2(Lu);static _infix=`a${Math.floor(Math.random()*1e5).toString()}`;getId(a,t=false){this._appId!=="ng"&&(a+=this._appId);let e=ze.get(a);return e===void 0?e=0:e++,ze.set(a,e),`${a}${t?n._infix+"-":""}${e}`}static \u0275fac=function(t){return new(t||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})};var Ke$1=" ";function En$1(n,a,t){let e=_t$2(n,a);t=t.trim(),!e.some(o=>o.trim()===t)&&(e.push(t),n.setAttribute(a,e.join(Ke$1)));}function wn$1(n,a,t){let e=_t$2(n,a);t=t.trim();let o=e.filter(i=>i!==t);o.length?n.setAttribute(a,o.join(Ke$1)):n.removeAttribute(a);}function _t$2(n,a){return n.getAttribute(a)?.match(/\S+/g)??[]}var He$2="cdk-describedby-message",vt$2="cdk-describedby-host",Ut$2=0,ko$1=(()=>{class n{_platform=T$2(u);_document=T$2(dr$3);_messageRegistry=new Map;_messagesContainer=null;_id=`${Ut$2++}`;constructor(){T$2(bi$2).load(vu),this._id=T$2(Lu)+"-"+Ut$2++;}describe(t,e,o){if(!this._canBeDescribed(t,e))return;let i=Bt$2(e,o);typeof e!="string"?(je$2(e,this._id),this._messageRegistry.set(i,{messageElement:e,referenceCount:0})):this._messageRegistry.has(i)||this._createMessageElement(e,o),this._isElementDescribedByMessage(t,i)||this._addMessageReference(t,i);}removeDescription(t,e,o){if(!e||!this._isElementNode(t))return;let i=Bt$2(e,o);if(this._isElementDescribedByMessage(t,i)&&this._removeMessageReference(t,i),typeof e=="string"){let s=this._messageRegistry.get(i);s&&s.referenceCount===0&&this._deleteMessageElement(i);}this._messagesContainer?.childNodes.length===0&&(this._messagesContainer.remove(),this._messagesContainer=null);}ngOnDestroy(){let t=this._document.querySelectorAll(`[${vt$2}="${this._id}"]`);for(let e=0;e<t.length;e++)this._removeCdkDescribedByReferenceIds(t[e]),t[e].removeAttribute(vt$2);this._messagesContainer?.remove(),this._messagesContainer=null,this._messageRegistry.clear();}_createMessageElement(t,e){let o=this._document.createElement("div");je$2(o,this._id),o.textContent=t,e&&o.setAttribute("role",e),this._createMessagesContainer(),this._messagesContainer.appendChild(o),this._messageRegistry.set(Bt$2(t,e),{messageElement:o,referenceCount:0});}_deleteMessageElement(t){this._messageRegistry.get(t)?.messageElement?.remove(),this._messageRegistry.delete(t);}_createMessagesContainer(){if(this._messagesContainer)return;let t="cdk-describedby-message-container",e=this._document.querySelectorAll(`.${t}[platform="server"]`);for(let i=0;i<e.length;i++)e[i].remove();let o=this._document.createElement("div");o.style.visibility="hidden",o.classList.add(t),o.classList.add("cdk-visually-hidden"),this._platform.isBrowser||o.setAttribute("platform","server"),this._document.body.appendChild(o),this._messagesContainer=o;}_removeCdkDescribedByReferenceIds(t){let e=_t$2(t,"aria-describedby").filter(o=>o.indexOf(He$2)!=0);t.setAttribute("aria-describedby",e.join(" "));}_addMessageReference(t,e){let o=this._messageRegistry.get(e);En$1(t,"aria-describedby",o.messageElement.id),t.setAttribute(vt$2,this._id),o.referenceCount++;}_removeMessageReference(t,e){let o=this._messageRegistry.get(e);o.referenceCount--,wn$1(t,"aria-describedby",o.messageElement.id),t.removeAttribute(vt$2);}_isElementDescribedByMessage(t,e){let o=_t$2(t,"aria-describedby"),i=this._messageRegistry.get(e),s=i&&i.messageElement.id;return !!s&&o.indexOf(s)!=-1}_canBeDescribed(t,e){if(!this._isElementNode(t))return  false;if(e&&typeof e=="object")return  true;let o=e==null?"":`${e}`.trim(),i=t.getAttribute("aria-label");return o?!i||i.trim()!==o:false}_isElementNode(t){return t.nodeType===this._document.ELEMENT_NODE}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function Bt$2(n,a){return typeof n=="string"?`${a||""}/${n}`:n}function je$2(n,a){n.id||(n.id=`${He$2}-${a}-${Ut$2++}`);}var Y=(function(n){return n[n.NORMAL=0]="NORMAL",n[n.NEGATED=1]="NEGATED",n[n.INVERTED=2]="INVERTED",n})(Y||{}),gt$2,L$1;function Lo$1(){if(L$1==null){if(typeof document!="object"||!document||typeof Element!="function"||!Element)return L$1=false,L$1;if(document.documentElement?.style&&"scrollBehavior"in document.documentElement.style)L$1=true;else {let n=Element.prototype.scrollTo;n?L$1=!/\{\s*\[native code\]\s*\}/.test(n.toString()):L$1=false;}}return L$1}function Po$1(){if(typeof document!="object"||!document)return Y.NORMAL;if(gt$2==null){let n=document.createElement("div"),a=n.style;n.dir="rtl",a.width="1px",a.overflow="auto",a.visibility="hidden",a.pointerEvents="none",a.position="absolute";let t=document.createElement("div"),e=t.style;e.width="2px",e.height="1px",n.appendChild(t),document.body.appendChild(n),gt$2=Y.NORMAL,n.scrollLeft===0&&(n.scrollLeft=1,gt$2=n.scrollLeft===0?Y.NEGATED:Y.INVERTED),n.remove();}return gt$2}function Uo$1(){return typeof __karma__<"u"&&!!__karma__||typeof jasmine<"u"&&!!jasmine||typeof jest<"u"&&!!jest||typeof Mocha<"u"&&!!Mocha}var j,Ve$2=["color","button","checkbox","date","datetime-local","email","file","hidden","image","month","number","password","radio","range","reset","search","submit","tel","text","time","url","week"];function Ko$1(){if(j)return j;if(typeof document!="object"||!document)return j=new Set(Ve$2),j;let n=document.createElement("input");return j=new Set(Ve$2.filter(a=>(n.setAttribute("type",a),n.type===a))),j}var An$1=new N$3("MATERIAL_ANIMATIONS"),We$1=null;function In$1(){return T$2(An$1,{optional:true})?.animationsDisabled||T$2(fm$1,{optional:true})==="NoopAnimations"?"di-disabled":(We$1??=T$2(bt$2).matchMedia("(prefers-reduced-motion)").matches,We$1?"reduced-motion":"enabled")}function K(){return In$1()!=="enabled"}function qo$1(n){return n==null?"":typeof n=="string"?n:`${n}px`}function ti$2(n){return n!=null&&`${n}`!="false"}var _$1=(function(n){return n[n.FADING_IN=0]="FADING_IN",n[n.VISIBLE=1]="VISIBLE",n[n.FADING_OUT=2]="FADING_OUT",n[n.HIDDEN=3]="HIDDEN",n})(_$1||{}),zt$2=class zt{_renderer;element;config;_animationForciblyDisabledThroughCss;state=_$1.HIDDEN;constructor(a,t,e,o=false){this._renderer=a,this.element=t,this.config=e,this._animationForciblyDisabledThroughCss=o;}fadeOut(){this._renderer.fadeOutRipple(this);}},Ze$2=z$1({passive:true,capture:true}),jt$3=class jt{_events=new Map;addHandler(a,t,e,o){let i=this._events.get(t);if(i){let s=i.get(e);s?s.add(o):i.set(e,new Set([o]));}else this._events.set(t,new Map([[e,new Set([o])]])),a.runOutsideAngular(()=>{document.addEventListener(t,this._delegateEventHandler,Ze$2);});}removeHandler(a,t,e){let o=this._events.get(a);if(!o)return;let i=o.get(t);i&&(i.delete(e),i.size===0&&o.delete(t),o.size===0&&(this._events.delete(a),document.removeEventListener(a,this._delegateEventHandler,Ze$2)));}_delegateEventHandler=a=>{let t=y(a);t&&this._events.get(a.type)?.forEach((e,o)=>{(o===t||o.contains(t))&&e.forEach(i=>i.handleEvent(a));});}},Q$1={enterDuration:225,exitDuration:150},Tn$1=800,Ge$1=z$1({passive:true,capture:true}),$e$1=["mousedown","touchstart"],Ye$3=["mouseup","mouseleave","touchend","touchcancel"],Mn$1=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=cE({type:n,selectors:[["ng-component"]],hostAttrs:["mat-ripple-style-loader",""],decls:0,vars:0,template:function(e,o){},styles:[`.mat-ripple {
  overflow: hidden;
  position: relative;
}
.mat-ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-ripple.mat-ripple-unbounded {
  overflow: visible;
}

.mat-ripple-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale3d(0, 0, 0);
  background-color: var(--mat-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent));
}
@media (forced-colors: active) {
  .mat-ripple-element {
    display: none;
  }
}
.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {
  display: none;
}
`],encapsulation:2})}return n})(),X=class n{_target;_ngZone;_platform;_containerElement;_triggerElement=null;_isPointerDown=false;_activeRipples=new Map;_mostRecentTransientRipple=null;_lastTouchStartEvent;_pointerUpEventsRegistered=false;_containerRect=null;static _eventManager=new jt$3;constructor(a,t,e,o,i){this._target=a,this._ngZone=t,this._platform=o,o.isBrowser&&(this._containerElement=E$1(e)),i&&i.get(bi$2).load(Mn$1);}fadeInRipple(a,t,e={}){let o=this._containerRect=this._containerRect||this._containerElement.getBoundingClientRect(),i=r(r({},Q$1),e.animation);e.centered&&(a=o.left+o.width/2,t=o.top+o.height/2);let s=e.radius||Dn$1(a,t,o),c=a-o.left,b=t-o.top,w=i.enterDuration,p=document.createElement("div");p.classList.add("mat-ripple-element"),p.style.left=`${c-s}px`,p.style.top=`${b-s}px`,p.style.height=`${s*2}px`,p.style.width=`${s*2}px`,e.color!=null&&(p.style.backgroundColor=e.color),p.style.transitionDuration=`${w}ms`,this._containerElement.appendChild(p);let Zt=window.getComputedStyle(p),nn=Zt.transitionProperty,Gt=Zt.transitionDuration,xt=nn==="none"||Gt==="0s"||Gt==="0s, 0s"||o.width===0&&o.height===0,N=new zt$2(this,p,e,xt);p.style.transform="scale3d(1, 1, 1)",N.state=_$1.FADING_IN,e.persistent||(this._mostRecentTransientRipple=N);let q=null;return !xt&&(w||i.exitDuration)&&this._ngZone.runOutsideAngular(()=>{let $t=()=>{q&&(q.fallbackTimer=null),clearTimeout(Yt),this._finishRippleTransition(N);},Et=()=>this._destroyRipple(N),Yt=setTimeout(Et,w+100);p.addEventListener("transitionend",$t),p.addEventListener("transitioncancel",Et),q={onTransitionEnd:$t,onTransitionCancel:Et,fallbackTimer:Yt};}),this._activeRipples.set(N,q),(xt||!w)&&this._finishRippleTransition(N),N}fadeOutRipple(a){if(a.state===_$1.FADING_OUT||a.state===_$1.HIDDEN)return;let t=a.element,e=r(r({},Q$1),a.config.animation);t.style.transitionDuration=`${e.exitDuration}ms`,t.style.opacity="0",a.state=_$1.FADING_OUT,(a._animationForciblyDisabledThroughCss||!e.exitDuration)&&this._finishRippleTransition(a);}fadeOutAll(){this._getActiveRipples().forEach(a=>a.fadeOut());}fadeOutAllNonPersistent(){this._getActiveRipples().forEach(a=>{a.config.persistent||a.fadeOut();});}setupTriggerEvents(a){let t=E$1(a);!this._platform.isBrowser||!t||t===this._triggerElement||(this._removeTriggerEvents(),this._triggerElement=t,$e$1.forEach(e=>{n._eventManager.addHandler(this._ngZone,e,t,this);}));}handleEvent(a){a.type==="mousedown"?this._onMousedown(a):a.type==="touchstart"?this._onTouchStart(a):this._onPointerUp(),this._pointerUpEventsRegistered||(this._ngZone.runOutsideAngular(()=>{Ye$3.forEach(t=>{this._triggerElement.addEventListener(t,this,Ge$1);});}),this._pointerUpEventsRegistered=true);}_finishRippleTransition(a){a.state===_$1.FADING_IN?this._startFadeOutTransition(a):a.state===_$1.FADING_OUT&&this._destroyRipple(a);}_startFadeOutTransition(a){let t=a===this._mostRecentTransientRipple,{persistent:e}=a.config;a.state=_$1.VISIBLE,!e&&(!t||!this._isPointerDown)&&a.fadeOut();}_destroyRipple(a){let t=this._activeRipples.get(a)??null;this._activeRipples.delete(a),this._activeRipples.size||(this._containerRect=null),a===this._mostRecentTransientRipple&&(this._mostRecentTransientRipple=null),a.state=_$1.HIDDEN,t!==null&&(a.element.removeEventListener("transitionend",t.onTransitionEnd),a.element.removeEventListener("transitioncancel",t.onTransitionCancel),t.fallbackTimer!==null&&clearTimeout(t.fallbackTimer)),a.element.remove();}_onMousedown(a){let t=W$1(a),e=this._lastTouchStartEvent&&Date.now()<this._lastTouchStartEvent+Tn$1;!this._target.rippleDisabled&&!t&&!e&&(this._isPointerDown=true,this.fadeInRipple(a.clientX,a.clientY,this._target.rippleConfig));}_onTouchStart(a){if(!this._target.rippleDisabled&&!Z(a)){this._lastTouchStartEvent=Date.now(),this._isPointerDown=true;let t=a.changedTouches;if(t)for(let e=0;e<t.length;e++)this.fadeInRipple(t[e].clientX,t[e].clientY,this._target.rippleConfig);}}_onPointerUp(){this._isPointerDown&&(this._isPointerDown=false,this._getActiveRipples().forEach(a=>{let t=a.state===_$1.VISIBLE||a.config.terminateOnPointerUp&&a.state===_$1.FADING_IN;!a.config.persistent&&t&&a.fadeOut();}));}_getActiveRipples(){return Array.from(this._activeRipples.keys())}_removeTriggerEvents(){let a=this._triggerElement;a&&($e$1.forEach(t=>n._eventManager.removeHandler(t,a,this)),this._pointerUpEventsRegistered&&(Ye$3.forEach(t=>a.removeEventListener(t,this,Ge$1)),this._pointerUpEventsRegistered=false));}};function Dn$1(n,a,t){let e=Math.max(Math.abs(n-t.left),Math.abs(n-t.right)),o=Math.max(Math.abs(a-t.top),Math.abs(a-t.bottom));return Math.sqrt(e*e+o*o)}var Kt$2=new N$3("mat-ripple-global-options"),bi$1=(()=>{class n{_elementRef=T$2(Mr$2);_animationsDisabled=K();color;unbounded=false;centered=false;radius=0;animation;get disabled(){return this._disabled}set disabled(t){t&&this.fadeOutAllNonPersistent(),this._disabled=t,this._setupTriggerEventsIfEnabled();}_disabled=false;get trigger(){return this._trigger||this._elementRef.nativeElement}set trigger(t){this._trigger=t,this._setupTriggerEventsIfEnabled();}_trigger;_rippleRenderer;_globalOptions;_isInitialized=false;constructor(){let t=T$2(De$3),e=T$2(u),o=T$2(Kt$2,{optional:true}),i=T$2(Ee$4);this._globalOptions=o||{},this._rippleRenderer=new X(this,t,this._elementRef,e,i);}ngOnInit(){this._isInitialized=true,this._setupTriggerEventsIfEnabled();}ngOnDestroy(){this._rippleRenderer._removeTriggerEvents();}fadeOutAll(){this._rippleRenderer.fadeOutAll();}fadeOutAllNonPersistent(){this._rippleRenderer.fadeOutAllNonPersistent();}get rippleConfig(){return {centered:this.centered,radius:this.radius,color:this.color,animation:r(r(r({},this._globalOptions.animation),this._animationsDisabled?{enterDuration:0,exitDuration:0}:{}),this.animation),terminateOnPointerUp:this._globalOptions.terminateOnPointerUp}}get rippleDisabled(){return this.disabled||!!this._globalOptions.disabled}_setupTriggerEventsIfEnabled(){!this.disabled&&this._isInitialized&&this._rippleRenderer.setupTriggerEvents(this.trigger);}launch(t,e=0,o){return typeof t=="number"?this._rippleRenderer.fadeInRipple(t,e,r(r({},this.rippleConfig),o)):this._rippleRenderer.fadeInRipple(0,0,r(r({},this.rippleConfig),t))}static \u0275fac=function(e){return new(e||n)};static \u0275dir=pE({type:n,selectors:[["","mat-ripple",""],["","matRipple",""]],hostAttrs:[1,"mat-ripple"],hostVars:2,hostBindings:function(e,o){e&2&&Zp("mat-ripple-unbounded",o.unbounded);},inputs:{color:[0,"matRippleColor","color"],unbounded:[0,"matRippleUnbounded","unbounded"],centered:[0,"matRippleCentered","centered"],radius:[0,"matRippleRadius","radius"],animation:[0,"matRippleAnimation","animation"],disabled:[0,"matRippleDisabled","disabled"],trigger:[0,"matRippleTrigger","trigger"]},exportAs:["matRipple"]})}return n})();var kn$1={capture:true},Cn$1=["focus","mousedown","mouseenter","touchstart"],Ht$2="mat-ripple-loader-uninitialized",Vt$1="mat-ripple-loader-class-name",Qe$2="mat-ripple-loader-centered",yt$2="mat-ripple-loader-disabled",Xe$3=(()=>{class n{_document=T$2(dr$3);_animationsDisabled=K();_globalRippleOptions=T$2(Kt$2,{optional:true});_platform=T$2(u);_ngZone=T$2(De$3);_injector=T$2(Ee$4);_eventCleanups;_hosts=new Map;constructor(){let t=T$2(wr$1).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>Cn$1.map(e=>t.listen(this._document,e,this._onInteraction,kn$1)));}ngOnDestroy(){let t=this._hosts.keys();for(let e of t)this.destroyRipple(e);this._eventCleanups.forEach(e=>e());}configureRipple(t,e){t.setAttribute(Ht$2,this._globalRippleOptions?.namespace??""),(e.className||!t.hasAttribute(Vt$1))&&t.setAttribute(Vt$1,e.className||""),e.centered&&t.setAttribute(Qe$2,""),e.disabled&&t.setAttribute(yt$2,"");}setDisabled(t,e){let o=this._hosts.get(t);o?(o.target.rippleDisabled=e,!e&&!o.hasSetUpEvents&&(o.hasSetUpEvents=true,o.renderer.setupTriggerEvents(t))):e?t.setAttribute(yt$2,""):t.removeAttribute(yt$2);}_onInteraction=t=>{let e=y(t);if(e instanceof HTMLElement){let o=e.closest(`[${Ht$2}="${this._globalRippleOptions?.namespace??""}"]`);o&&this._createRipple(o);}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(".mat-ripple")?.remove();let e=this._document.createElement("span");e.classList.add("mat-ripple",t.getAttribute(Vt$1)),t.append(e);let o=this._globalRippleOptions,i=this._animationsDisabled?0:o?.animation?.enterDuration??Q$1.enterDuration,s=this._animationsDisabled?0:o?.animation?.exitDuration??Q$1.exitDuration,c={rippleDisabled:this._animationsDisabled||o?.disabled||t.hasAttribute(yt$2),rippleConfig:{centered:t.hasAttribute(Qe$2),terminateOnPointerUp:o?.terminateOnPointerUp,animation:{enterDuration:i,exitDuration:s}}},b=new X(c,this._ngZone,e,this._platform,this._injector),w=!c.rippleDisabled;w&&b.setupTriggerEvents(t),this._hosts.set(t,{target:c,renderer:b,hasSetUpEvents:w}),t.removeAttribute(Ht$2);}destroyRipple(t){let e=this._hosts.get(t);e&&(e.renderer._removeTriggerEvents(),this._hosts.delete(t));}static \u0275fac=function(e){return new(e||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var qe$1=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=cE({type:n,selectors:[["structural-styles"]],decls:0,vars:0,template:function(e,o){},styles:[`.mat-focus-indicator {
  position: relative;
}
.mat-focus-indicator::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  display: var(--mat-focus-indicator-display, none);
  border-width: var(--mat-focus-indicator-border-width, 3px);
  border-style: var(--mat-focus-indicator-border-style, solid);
  border-color: var(--mat-focus-indicator-border-color, transparent);
  border-radius: var(--mat-focus-indicator-border-radius, 4px);
}
.mat-focus-indicator:focus-visible::before {
  content: "";
}

@media (forced-colors: active) {
  html {
    --mat-focus-indicator-display: block;
  }
}
`],encapsulation:2})}return n})();var On$1=["*",[["","progressIndicator",""]]],Nn$1=["*","[progressIndicator]"];function Rn$1(n,a){n&1&&(Wc$1(0,"div",1),bD(1,1),qc$1());}var Fn$1=new N$3("MAT_BUTTON_CONFIG");function Je$2(n){return n==null?void 0:qF(n)}var Wt$2=(()=>{class n{_elementRef=T$2(Mr$2);_ngZone=T$2(De$3);_animationsDisabled=K();_config=T$2(Fn$1,{optional:true});_focusMonitor=T$2(Nt$1);_cleanupClick;_renderer=T$2(hI);_rippleLoader=T$2(Xe$3);_isAnchor;_isFab=false;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled();}_disableRipple=false;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled();}_disabled=false;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t;}showProgress=jF(false,{transform:WF});constructor(){T$2(bi$2).load(qe$1);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??false,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:"mat-mdc-button-ripple"});}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,true),this._isAnchor&&this._setupAsAnchor();}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);}focus(t="program",e){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,e):this._elementRef.nativeElement.focus(e);}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?true:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:true}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled);}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation());}));}static \u0275fac=function(e){return new(e||n)};static \u0275dir=pE({type:n,hostAttrs:[1,"mat-mdc-button-base"],hostVars:15,hostBindings:function(e,o){e&2&&(Rp("disabled",o._getDisabledAttribute())("aria-disabled",o._getAriaDisabled())("tabindex",o._getTabIndex()),BD(o.color?"mat-"+o.color:""),Zp("mat-mdc-button-progress-indicator-shown",o.showProgress())("mat-mdc-button-disabled",o.disabled)("mat-mdc-button-disabled-interactive",o.disabledInteractive)("mat-unthemed",!o.color)("_mat-animation-noopable",o._animationsDisabled));},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",WF],disabled:[2,"disabled","disabled",WF],ariaDisabled:[2,"aria-disabled","ariaDisabled",WF],disabledInteractive:[2,"disabledInteractive","disabledInteractive",WF],tabIndex:[2,"tabIndex","tabIndex",Je$2],_tabindex:[2,"tabindex","_tabindex",Je$2],showProgress:[1,"showProgress"]}})}return n})(),Sn$1=(()=>{class n extends Wt$2{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:true});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=cE({type:n,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[vp],ngContentSelectors:Nn$1,decls:5,vars:1,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(e,o){e&1&&(CD(On$1),Pp(0,"span",0),bD(1),rD(2,Rn$1,2,0,"div",1),Pp(3,"span",2)(4,"span",3)),e&2&&(xv(2),oD(o.showProgress()?2:-1));},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--mat-icon-button-state-layer-size, 40px);
  height: var(--mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--mat-icon-button-state-layer-size, 40px) - var(--mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--mat-icon-button-icon-size, 24px);
  color: var(--mat-icon-button-icon-color, var(--mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--mat-icon-button-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface-variant) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-icon-button-touch-target-size, 48px);
  display: var(--mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--mat-icon-button-icon-size, 24px);
  height: var(--mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return n})();var tn$1=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[er$3]})}return n})();var Ln$1=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""]],[["","progressIndicator",""]]],Pn$1=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]","[progressIndicator]"];function Bn$2(n,a){n&1&&(Wc$1(0,"div",2),bD(1,3),qc$1());}var en$1=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),Ui=(()=>{class n extends Wt$2{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||"text");}_appearance=null;constructor(){super();let t=Un$1(this._elementRef.nativeElement);t&&this.setAppearance(t);}setAppearance(t){if(t===this._appearance)return;let e=this._elementRef.nativeElement.classList,o=this._appearance?en$1.get(this._appearance):null,i=en$1.get(t);o&&e.remove(...o),e.add(...i),this._appearance=t;}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=cE({type:n,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[vp],ngContentSelectors:Pn$1,decls:8,vars:5,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(e,o){e&1&&(CD(Ln$1),Pp(0,"span",0),bD(1),Wc$1(2,"span",1),bD(3,1),qc$1(),bD(4,2),rD(5,Bn$2,2,0,"div",2),Pp(6,"span",3)(7,"span",4)),e&2&&(Zp("mdc-button__ripple",!o._isFab)("mdc-fab__ripple",o._isFab),xv(5),oD(o.showProgress()?5:-1));},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--mat-button-text-horizontal-padding, 12px);
  height: var(--mat-button-text-container-height, 40px);
  font-family: var(--mat-button-text-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-text-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-text-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-text-label-text-transform);
  font-weight: var(--mat-button-text-label-text-weight, var(--mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--mat-button-text-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--mat-button-text-label-text-color, var(--mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--mat-button-text-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-text-touch-target-size, 48px);
  display: var(--mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-filled-container-height, 40px);
  font-family: var(--mat-button-filled-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-filled-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-filled-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-filled-label-text-transform);
  font-weight: var(--mat-button-filled-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--mat-button-filled-ripple-color, color-mix(in srgb, var(--mat-sys-on-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-state-layer-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-filled-touch-target-size, 48px);
  display: var(--mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--mat-button-filled-label-text-color, var(--mat-sys-on-primary));
  background-color: var(--mat-button-filled-container-color, var(--mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--mat-button-filled-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --mat-progress-spinner-active-indicator-color: var(--mat-button-filled-progress-active-indicator-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--mat-button-protected-container-elevation-shadow, var(--mat-sys-level1));
  height: var(--mat-button-protected-container-height, 40px);
  font-family: var(--mat-button-protected-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-protected-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-protected-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-protected-label-text-transform);
  font-weight: var(--mat-button-protected-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--mat-button-protected-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-protected-touch-target-size, 48px);
  display: var(--mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--mat-button-protected-container-shape, var(--mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--mat-button-protected-hover-container-elevation-shadow, var(--mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--mat-button-protected-focus-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--mat-button-protected-pressed-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-protected-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--mat-button-protected-disabled-container-elevation-shadow, var(--mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-outlined-container-height, 40px);
  font-family: var(--mat-button-outlined-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-outlined-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-outlined-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-outlined-label-text-transform);
  font-weight: var(--mat-button-outlined-label-text-weight, var(--mat-sys-label-large-weight));
  border-radius: var(--mat-button-outlined-container-shape, var(--mat-sys-corner-full));
  border-width: var(--mat-button-outlined-outline-width, 1px);
  padding: 0 var(--mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--mat-button-outlined-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-outlined-touch-target-size, 48px);
  display: var(--mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--mat-button-outlined-label-text-color, var(--mat-sys-primary));
  border-color: var(--mat-button-outlined-outline-color, var(--mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: var(--mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-tonal-container-height, 40px);
  font-family: var(--mat-button-tonal-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-tonal-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-tonal-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-tonal-label-text-transform);
  font-weight: var(--mat-button-tonal-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--mat-button-tonal-label-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--mat-button-tonal-container-shape, var(--mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--mat-button-tonal-ripple-color, color-mix(in srgb, var(--mat-sys-on-secondary-container) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-tonal-touch-target-size, 48px);
  display: var(--mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return n})();function Un$1(n){return n.hasAttribute("mat-raised-button")?"elevated":n.hasAttribute("mat-stroked-button")?"outlined":n.hasAttribute("mat-flat-button")?"filled":n.hasAttribute("mat-button")?"text":null}var zi=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[tn$1,er$3]})}return n})();var Mn=(()=>{class n{_renderer;_elementRef;onChange=e=>{};onTouched=()=>{};constructor(e,i){this._renderer=e,this._elementRef=i;}setProperty(e,i){this._renderer.setProperty(this._elementRef.nativeElement,e,i);}registerOnTouched(e){this.onTouched=e;}registerOnChange(e){this.onChange=e;}setDisabledState(e){this.setProperty("disabled",e);}static \u0275fac=function(i){return new(i||n)(Ar$2(hI),Ar$2(Mr$2))};static \u0275dir=pE({type:n})}return n})(),jr=(()=>{class n extends Mn{static \u0275fac=(()=>{let e;return function(r){return (e||(e=Qm$1(n)))(r||n)}})();static \u0275dir=pE({type:n,features:[vp]})}return n})(),kn=new N$3("");var Hr={provide:kn,useExisting:vo$1(()=>On),multi:true};function Wr(){let n=R$2()?R$2().getUserAgent():"";return /android (\d+)/.test(n.toLowerCase())}var Gr=new N$3(""),On=(()=>{class n extends Mn{_compositionMode;_composing=false;constructor(e,i,r){super(e,i),this._compositionMode=r,this._compositionMode==null&&(this._compositionMode=!Wr());}writeValue(e){let i=e??"";this.setProperty("value",i);}_handleInput(e){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(e);}_compositionStart(){this._composing=true;}_compositionEnd(e){this._composing=false,this._compositionMode&&this.onChange(e);}static \u0275fac=function(i){return new(i||n)(Ar$2(hI),Ar$2(Mr$2),Ar$2(Gr,8))};static \u0275dir=pE({type:n,selectors:[["input","formControlName","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControlName","",3,"ngNoCva",""],["input","formControl","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControl","",3,"ngNoCva",""],["input","ngModel","",3,"type","checkbox",3,"ngNoCva",""],["textarea","ngModel","",3,"ngNoCva",""],["","ngDefaultControl",""]],hostBindings:function(i,r){i&1&&Hp("input",function(s){return r._handleInput(s.target.value)})("blur",function(){return r.onTouched()})("compositionstart",function(){return r._compositionStart()})("compositionend",function(s){return r._compositionEnd(s.target.value)});},standalone:false,features:[cw([Hr]),vp]})}return n})();function ri$1(n){return n==null||oi$1(n)===0}function oi$1(n){return n==null?null:Array.isArray(n)||typeof n=="string"?n.length:n instanceof Set?n.size:null}var Mt$1=new N$3(""),si$1=new N$3(""),Ur=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,qe=class{static min(t){return qr(t)}static max(t){return Yr(t)}static required(t){return En(t)}static requiredTrue(t){return Xr(t)}static email(t){return $r(t)}static minLength(t){return Zr(t)}static maxLength(t){return Qr(t)}static pattern(t){return Kr(t)}static nullValidator(t){return gt$1()}static compose(t){return In(t)}static composeAsync(t){return Tn(t)}};function qr(n){return t=>{if(t.value==null||n==null)return null;let e=parseFloat(t.value);return !isNaN(e)&&e<n?{min:{min:n,actual:t.value}}:null}}function Yr(n){return t=>{if(t.value==null||n==null)return null;let e=parseFloat(t.value);return !isNaN(e)&&e>n?{max:{max:n,actual:t.value}}:null}}function En(n){return ri$1(n.value)?{required:true}:null}function Xr(n){return n.value===true?null:{required:true}}function $r(n){return ri$1(n.value)||Ur.test(n.value)?null:{email:true}}function Zr(n){return t=>{let e=t.value?.length??oi$1(t.value);return e===null||e===0?null:e<n?{minlength:{requiredLength:n,actualLength:e}}:null}}function Qr(n){return t=>{let e=t.value?.length??oi$1(t.value);return e!==null&&e>n?{maxlength:{requiredLength:n,actualLength:e}}:null}}function Kr(n){if(!n)return gt$1;let t,e;return typeof n=="string"?(e="",n.charAt(0)!=="^"&&(e+="^"),e+=n,n.charAt(n.length-1)!=="$"&&(e+="$"),t=new RegExp(e)):(e=n.toString(),t=n),i=>{if(ri$1(i.value))return null;let r=i.value;return t.test(r)?null:{pattern:{requiredPattern:e,actualValue:r}}}}function gt$1(n){return null}function Rn(n){return n!=null}function Fn(n){return jc$1(n)?xe$3(n):n}function Vn$1(n){let t={};return n.forEach(e=>{t=e!=null?r(r({},t),e):t;}),Object.keys(t).length===0?null:t}function An(n,t){return t.map(e=>e(n))}function Jr(n){return !n.validate}function Pn(n){return n.map(t=>Jr(t)?t:e=>t.validate(e))}function In(n){if(!n)return null;let t=n.filter(Rn);return t.length==0?null:function(e){return Vn$1(An(e,t))}}function ai$1(n){return n!=null?In(Pn(n)):null}function Tn(n){if(!n)return null;let t=n.filter(Rn);return t.length==0?null:function(e){let i=An(e,t).map(Fn);return rg(i).pipe(le$1(Vn$1))}}function li$1(n){return n!=null?Tn(Pn(n)):null}function xn(n,t){return n===null?[t]:Array.isArray(n)?[...n,t]:[n,t]}function Nn(n){return n._rawValidators}function Ln(n){return n._rawAsyncValidators}function ti$1(n){return n?Array.isArray(n)?n:[n]:[]}function _t$1(n,t){return Array.isArray(n)?n.includes(t):n===t}function Cn(n,t){let e=ti$1(t);return ti$1(n).forEach(r=>{_t$1(e,r)||e.push(r);}),e}function wn(n,t){return ti$1(t).filter(e=>!_t$1(n,e))}var vt$1=class vt{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(t){this._rawValidators=t||[],this._composedValidatorFn=ai$1(this._rawValidators);}_setAsyncValidators(t){this._rawAsyncValidators=t||[],this._composedAsyncValidatorFn=li$1(this._rawAsyncValidators);}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(t){this._onDestroyCallbacks.push(t);}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(t=>t()),this._onDestroyCallbacks=[];}reset(t=void 0){this.control?.reset(t);}hasError(t,e){return this.control?this.control.hasError(t,e):false}getError(t,e){return this.control?this.control.getError(t,e):null}},Fe$1=class Fe extends vt$1{name;get formDirective(){return null}get path(){return null}};var je$1="VALID",pt="INVALID",Ee$1="PENDING",He$1="DISABLED",fe$1=class fe{},yt$1=class yt extends fe$1{value;source;constructor(t,e){super(),this.value=t,this.source=e;}},Ge=class extends fe$1{pristine;source;constructor(t,e){super(),this.pristine=t,this.source=e;}},Ue=class extends fe$1{touched;source;constructor(t,e){super(),this.touched=t,this.source=e;}},Re$1=class Re extends fe$1{status;source;constructor(t,e){super(),this.status=t,this.source=e;}},bt$1=class bt extends fe$1{source;constructor(t){super(),this.source=t;}},Ve$1=class Ve extends fe$1{source;constructor(t){super(),this.source=t;}};function Bn$1(n){return (kt$1(n)?n.validators:n)||null}function eo(n){return Array.isArray(n)?ai$1(n):n||null}function zn(n,t){return (kt$1(t)?t.asyncValidators:n)||null}function to(n){return Array.isArray(n)?li$1(n):n||null}function kt$1(n){return n!=null&&!Array.isArray(n)&&typeof n=="object"}function io(n,t,e){let i=n.controls;if(!(Object.keys(i)).length)throw new M$2(1e3,"");if(!jn$1(i,e))throw new M$2(1001,"")}function no(n,t,e){n._forEachChild((i,r)=>{if(e[r]===void 0)throw new M$2(-1002,"")});}var xt$1=class xt{_pendingDirty=false;_hasOwnPendingAsyncValidator=null;_pendingTouched=false;_onCollectionChange=()=>{};_updateOn;_hasRequired=Ho$1(false);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(t,e){this._assignValidators(t),this._assignAsyncValidators(e);}get validator(){return this._composedValidatorFn}set validator(t){this._rawValidators=this._composedValidatorFn=t,this._updateHasRequiredValidator();}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(t){this._rawAsyncValidators=this._composedAsyncValidatorFn=t;}get parent(){return this._parent}get status(){return Ew(this.statusReactive)}set status(t){Ew(()=>this.statusReactive.set(t));}_status=Iw(()=>this.statusReactive());statusReactive=Ho$1(void 0);get valid(){return this.status===je$1}get invalid(){return this.status===pt}get pending(){return this.status===Ee$1}get disabled(){return this.status===He$1}get enabled(){return this.status!==He$1}errors;get pristine(){return Ew(this.pristineReactive)}set pristine(t){Ew(()=>this.pristineReactive.set(t));}_pristine=Iw(()=>this.pristineReactive());pristineReactive=Ho$1(true);get dirty(){return !this.pristine}get touched(){return Ew(this.touchedReactive)}set touched(t){Ew(()=>this.touchedReactive.set(t));}_touched=Iw(()=>this.touchedReactive());touchedReactive=Ho$1(false);get untouched(){return !this.touched}_events=new ie$1;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(t){this._assignValidators(t);}setAsyncValidators(t){this._assignAsyncValidators(t);}addValidators(t){this.setValidators(Cn(t,this._rawValidators));}addAsyncValidators(t){this.setAsyncValidators(Cn(t,this._rawAsyncValidators));}removeValidators(t){this.setValidators(wn(t,this._rawValidators));}removeAsyncValidators(t){this.setAsyncValidators(wn(t,this._rawAsyncValidators));}hasValidator(t){return _t$1(this._rawValidators,t)}hasAsyncValidator(t){return _t$1(this._rawAsyncValidators,t)}clearValidators(){this.validator=null;}clearAsyncValidators(){this.asyncValidator=null;}markAsTouched(t={}){let e=this.touched===false;this.touched=true;let i=t.sourceControl??this;t.onlySelf||this._parent?.markAsTouched(s(r({},t),{sourceControl:i})),e&&t.emitEvent!==false&&this._events.next(new Ue(true,i));}markAllAsDirty(t={}){this.markAsDirty({onlySelf:true,emitEvent:t.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsDirty(t));}markAllAsTouched(t={}){this.markAsTouched({onlySelf:true,emitEvent:t.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsTouched(t));}markAsUntouched(t={}){let e=this.touched===true;this.touched=false,this._pendingTouched=false;let i=t.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:true,emitEvent:t.emitEvent,sourceControl:i});}),t.onlySelf||this._parent?._updateTouched(t,i),e&&t.emitEvent!==false&&this._events.next(new Ue(false,i));}markAsDirty(t={}){let e=this.pristine===true;this.pristine=false;let i=t.sourceControl??this;t.onlySelf||this._parent?.markAsDirty(s(r({},t),{sourceControl:i})),e&&t.emitEvent!==false&&this._events.next(new Ge(false,i));}markAsPristine(t={}){let e=this.pristine===false;this.pristine=true,this._pendingDirty=false;let i=t.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:true,emitEvent:t.emitEvent});}),t.onlySelf||this._parent?._updatePristine(t,i),e&&t.emitEvent!==false&&this._events.next(new Ge(true,i));}markAsPending(t={}){this.status=Ee$1;let e=t.sourceControl??this;t.emitEvent!==false&&(this._events.next(new Re$1(this.status,e)),this.statusChanges.emit(this.status)),t.onlySelf||this._parent?.markAsPending(s(r({},t),{sourceControl:e}));}disable(t={}){let e=this._parentMarkedDirty(t.onlySelf);this.status=He$1,this.errors=null,this._forEachChild(r$1=>{r$1.disable(s(r({},t),{onlySelf:true}));}),this._updateValue();let i=t.sourceControl??this;t.emitEvent!==false&&(this._events.next(new yt$1(this.value,i)),this._events.next(new Re$1(this.status,i)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(s(r({},t),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(r=>r(true));}enable(t={}){let e=this._parentMarkedDirty(t.onlySelf);this.status=je$1,this._forEachChild(i=>{i.enable(s(r({},t),{onlySelf:true}));}),this.updateValueAndValidity({onlySelf:true,emitEvent:t.emitEvent}),this._updateAncestors(s(r({},t),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(i=>i(false));}_updateAncestors(t,e){t.onlySelf||(this._parent?.updateValueAndValidity(t),t.skipPristineCheck||this._parent?._updatePristine({},e),this._parent?._updateTouched({},e));}setParent(t){this._parent=t;}getRawValue(){return this.value}updateValueAndValidity(t={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let i=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===je$1||this.status===Ee$1)&&this._runAsyncValidator(i,t.emitEvent);}let e=t.sourceControl??this;t.emitEvent!==false&&(this._events.next(new yt$1(this.value,e)),this._events.next(new Re$1(this.status,e)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),t.onlySelf||this._parent?.updateValueAndValidity(s(r({},t),{sourceControl:e}));}_updateTreeValidity(t={emitEvent:true}){this._forEachChild(e=>e._updateTreeValidity(t)),this.updateValueAndValidity({onlySelf:true,emitEvent:t.emitEvent});}_setInitialStatus(){this.status=this._allControlsDisabled()?He$1:je$1;}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(t,e){if(this.asyncValidator){this.status=Ee$1,this._hasOwnPendingAsyncValidator={emitEvent:e!==false,shouldHaveEmitted:t!==false};let i=Fn(this.asyncValidator(this));this._asyncValidationSubscription=i.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:e,shouldHaveEmitted:t});});}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let t=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??false;return this._hasOwnPendingAsyncValidator=null,t}return  false}setErrors(t,e={}){this.errors=t,this._updateControlsErrors(e.emitEvent!==false,this,e.shouldHaveEmitted);}get(t){let e=t;return e==null||(Array.isArray(e)||(e=e.split(".")),e.length===0)?null:e.reduce((i,r)=>i&&i._find(r),this)}getError(t,e){let i=e?this.get(e):this;return i?.errors?i.errors[t]:null}hasError(t,e){return !!this.getError(t,e)}get root(){let t=this;for(;t._parent;)t=t._parent;return t}_updateControlsErrors(t,e,i){this.status=this._calculateStatus(),t&&this.statusChanges.emit(this.status),(t||i)&&this._events.next(new Re$1(this.status,e)),this._parent&&this._parent._updateControlsErrors(t,e,i);}_initObservables(){this.valueChanges=new We$3,this.statusChanges=new We$3;}_calculateStatus(){return this._allControlsDisabled()?He$1:this.errors?pt:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(Ee$1)?Ee$1:this._anyControlsHaveStatus(pt)?pt:je$1}_anyControlsHaveStatus(t){return this._anyControls(e=>e.status===t)}_anyControlsDirty(){return this._anyControls(t=>t.dirty)}_anyControlsTouched(){return this._anyControls(t=>t.touched)}_updatePristine(t,e){let i=!this._anyControlsDirty(),r=this.pristine!==i;this.pristine=i,t.onlySelf||this._parent?._updatePristine(t,e),r&&this._events.next(new Ge(this.pristine,e));}_updateTouched(t={},e){this.touched=this._anyControlsTouched(),this._events.next(new Ue(this.touched,e)),t.onlySelf||this._parent?._updateTouched(t,e);}_onDisabledChange=[];_registerOnCollectionChange(t){this._onCollectionChange=t;}_setUpdateStrategy(t){kt$1(t)&&t.updateOn!=null&&(this._updateOn=t.updateOn);}_parentMarkedDirty(t){return !t&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(t){return null}_assignValidators(t){this._rawValidators=Array.isArray(t)?t.slice():t,this._composedValidatorFn=eo(this._rawValidators),this._updateHasRequiredValidator();}_assignAsyncValidators(t){this._rawAsyncValidators=Array.isArray(t)?t.slice():t,this._composedAsyncValidatorFn=to(this._rawAsyncValidators);}_updateHasRequiredValidator(){Ew(()=>this._hasRequired.set(this.hasValidator(qe.required)));}};function jn$1(n,t){return Object.hasOwn(n,t)}function ro(n){return n.tagName==="INPUT"||n.tagName==="SELECT"||n.tagName==="TEXTAREA"}function oo(n,t,e,i){switch(e){case "name":n.setAttribute(t,e,i);break;case "disabled":case "readonly":case "required":i?n.setAttribute(t,e,""):n.removeAttribute(t,e);break;case "max":case "min":case "minLength":case "maxLength":i!==void 0?n.setAttribute(t,e,i.toString()):n.removeAttribute(t,e);break}}var ii$1=class ii{kind;context;control;message;constructor({kind:t,context:e,control:i}){this.kind=t,this.context=e,this.control=i;}};var so=(()=>{class n{_validator=gt$1;_onChange;_enabled;ngOnChanges(e){if(this.inputName in e){let i=this.normalizeInput(e[this.inputName].currentValue);this._enabled=this.enabled(i),this._validator=this._enabled?this.createValidator(i):gt$1,this._onChange?.();}}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._onChange=e;}enabled(e){return e!=null}static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,features:[xm$1]})}return n})();var ao={provide:Mt$1,useExisting:vo$1(()=>Hn$1),multi:true};var Hn$1=(()=>{class n extends so{required;inputName="required";normalizeInput=WF;createValidator=e=>En;enabled(e){return e}static \u0275fac=(()=>{let e;return function(r){return (e||(e=Qm$1(n)))(r||n)}})();static \u0275dir=pE({type:n,selectors:[["","required","","formControlName","",3,"type","checkbox"],["","required","","formControl","",3,"type","checkbox"],["","required","","ngModel","",3,"type","checkbox"]],hostVars:1,hostBindings:function(i,r){i&2&&Rp("required",r._enabled?"":null);},inputs:{required:"required"},standalone:false,features:[cw([ao]),vp]})}return n})();var lo=new N$3(""),Ot=new N$3("",{factory:()=>di}),di="always";function co(n,t,e=di){ci(n,t),t.valueAccessor.writeValue(n.value),(n.disabled||e==="always")&&t.valueAccessor.setDisabledState?.(n.disabled),uo(n,t),mo(n,t),fo(n,t),ho(n,t);}function Ct$1(n,t,e=true){let i=()=>{};t?.valueAccessor?.registerOnChange(i),t?.valueAccessor?.registerOnTouched(i),St$2(n,t),n&&(t._invokeOnDestroyCallbacks(),n._registerOnCollectionChange(()=>{}));}function wt$1(n,t){n.forEach(e=>{e.registerOnValidatorChange&&e.registerOnValidatorChange(t);});}function ho(n,t){if(t.valueAccessor.setDisabledState){let e=i=>{t.valueAccessor.setDisabledState(i);};n.registerOnDisabledChange(e),t._registerOnDestroy(()=>{n._unregisterOnDisabledChange(e);});}}function ci(n,t){let e=Nn(n);t.validator!==null?n.setValidators(xn(e,t.validator)):typeof e=="function"&&n.setValidators([e]);let i=Ln(n);t.asyncValidator!==null?n.setAsyncValidators(xn(i,t.asyncValidator)):typeof i=="function"&&n.setAsyncValidators([i]);let r=()=>n.updateValueAndValidity();wt$1(t._rawValidators,r),wt$1(t._rawAsyncValidators,r);}function St$2(n,t){let e=false;if(n!==null){if(t.validator!==null){let r=Nn(n);if(Array.isArray(r)&&r.length>0){let o=r.filter(s=>s!==t.validator);o.length!==r.length&&(e=true,n.setValidators(o));}}if(t.asyncValidator!==null){let r=Ln(n);if(Array.isArray(r)&&r.length>0){let o=r.filter(s=>s!==t.asyncValidator);o.length!==r.length&&(e=true,n.setAsyncValidators(o));}}}let i=()=>{};return wt$1(t._rawValidators,i),wt$1(t._rawAsyncValidators,i),e}function uo(n,t){t.valueAccessor.registerOnChange(e=>{n._pendingValue=e,n._pendingChange=true,n._pendingDirty=true,n.updateOn==="change"&&Wn$1(n,t);});}function fo(n,t){t.valueAccessor.registerOnTouched(()=>{n._pendingTouched=true,n.updateOn==="blur"&&n._pendingChange&&Wn$1(n,t),n.updateOn!=="submit"&&n.markAsTouched();});}function Wn$1(n,t){n._pendingDirty&&n.markAsDirty(),n.setValue(n._pendingValue,{emitModelToViewChange:false}),t.viewToModelUpdate(n._pendingValue),n._pendingChange=false;}function mo(n,t){let e=(i,r)=>{t.valueAccessor.writeValue(i),r&&t.viewToModelUpdate(i);};n.registerOnChange(e),t._registerOnDestroy(()=>{n._unregisterOnChange(e);});}function Gn$1(n,t){ci(n,t);}function po(n,t){return St$2(n,t)}function go(n,t){if(!n.hasOwnProperty("model"))return  false;let e=n.model;return e.isFirstChange()?true:!Object.is(t,e.currentValue)}function _o(n){return Object.getPrototypeOf(n.constructor)===jr}function Un(n,t){n._syncPendingControls(),t.forEach(e=>{let i=e.control;i.updateOn==="submit"&&i._pendingChange&&(e.viewToModelUpdate(i._pendingValue),i._pendingChange=false);});}function vo(n,t){if(!t)return null;let e,i,r;return t.forEach(o=>{o.constructor===On?e=o:_o(o)?i=o:r=o;}),r||i||e||null}function yo(n,t){let e=n.indexOf(t);e>-1&&n.splice(e,1);}var bo={provide:lo,useFactory:()=>{let n=T$2(me,{self:true});return {setParseErrors:t=>{n.setParseErrorSource(t);},set onReset(t){n.onReset=t;}}}},me=class extends vt$1{_parent=null;name=null;valueAccessor=null;isCustomControlBased=false;userOnReset;resetSubscription;set onReset(t){this.userOnReset=t,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(e=>{e instanceof Ve$1&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription?.add(this.resetSubscription));}isNativeFormElement=false;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=vo(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;constructor(t,e,i){super(),this.injector=t,this.renderer=e,this.rawValueAccessors=i,this.injector?.get(Ve$4)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe();});}setupCustomControl(){this.subscription?.unsubscribe();let t=this.injector?.get($F);if(!this.control||!t)return;let e=t.markForCheck.bind(t);this.subscription=new G$2,this.subscription.add(this.control.valueChanges.subscribe(e)),this.subscription.add(this.control.statusChanges.subscribe(e)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=this.control.events.subscribe(i=>{i instanceof Ve$1&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&this.control.addValidators(this.parseErrorsValidator);}ngControlCreate(t){!t.nativeElement.hasAttribute?.("ngNoCva")&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!t.customControl||(this.isCustomControlBased=true,t.listenToCustomControlModel(r=>{this.control?.setValue(r,{emitModelToViewChange:false}),this.control?.markAsDirty(),this.viewToModelUpdate(r);}),t.listenToCustomControlOutput("touch",()=>{this.control?.markAsTouched();}),this.customControlBindings={},this.isNativeFormElement=ro(t.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(r=>r instanceof Hn$1));}ngControlUpdate(t,e){if(!this.isCustomControlBased)return;let i=this.control,r=this.customControlBindings;Object.is(r.value,i.value)||(r.value=i.value,t.setCustomControlModelInput(i.value)),this.bindControlProperty(t,r,"touched",i.touched),this.bindControlProperty(t,r,"dirty",i.dirty),this.bindControlProperty(t,r,"valid",i.valid),this.bindControlProperty(t,r,"invalid",i.invalid),this.bindControlProperty(t,r,"pending",i.pending),this.bindControlProperty(t,r,"disabled",i.disabled),this.shouldBindRequired&&this.bindControlProperty(t,r,"required",this.isRequired);let o=i.errors;if(r.errors!==o){r.errors=o;let s=this._convertErrors(o);t.setInputOnDirectives("errors",s);}}get isRequired(){return (this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??false}get shouldBindRequired(){return  true}bindControlProperty(t,e,i,r){if(e[i]===r)return;e[i]=r;let o=t.setInputOnDirectives(i,r);this.isNativeFormElement&&!o&&(i==="disabled"||i==="required")&&this.renderer&&oo(this.renderer,t.nativeElement,i,r);}_convertErrors(t){if(t===null)return [];let e=this.control;return Object.entries(t).map(([i,r])=>new ii$1({context:r,kind:i,control:e}))}setParseErrorSource(t){if(t===void 0)return;let e=null,i=Iw(()=>{let r=t();return r.length===0?null:r.reduce((o,s)=>(o[s.kind]=s,o),{})});this.parseErrorsValidator=(()=>e).bind(this),Vu(()=>{e=i(),this.control?.updateValueAndValidity({emitEvent:false});},{injector:this.injector});}removeParseErrorsValidator(t){this.parseErrorsValidator&&(t?.removeValidators(this.parseErrorsValidator),t?.updateValueAndValidity({emitEvent:false}));}},ni$1=class ni{_cd;constructor(t){this._cd=t;}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return !!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return !!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return !!this._cd?.control?.invalid}get isPending(){return !!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var $s$1=(()=>{class n extends ni$1{constructor(e){super(e);}static \u0275fac=function(i){return new(i||n)(Ar$2(me,2))};static \u0275dir=pE({type:n,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(i,r){i&2&&Zp("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending);},standalone:false,features:[vp]})}return n})();var Dt=class extends xt$1{constructor(t,e,i){super(Bn$1(e),zn(i,e)),this.controls=t,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;registerControl(t,e){let i=this._find(t);return i||(this.controls[t]=e,e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange),e)}addControl(t,e,i={}){this.registerControl(t,e),this.updateValueAndValidity({emitEvent:i.emitEvent}),this._onCollectionChange();}removeControl(t,e={}){let i=this._find(t);i&&i._registerOnCollectionChange(()=>{}),delete this.controls[t],this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange();}setControl(t,e,i={}){let r=this._find(t);r&&r._registerOnCollectionChange(()=>{}),delete this.controls[t],e&&this.registerControl(t,e),this.updateValueAndValidity({emitEvent:i.emitEvent}),this._onCollectionChange();}contains(t){return this._find(t)?.enabled===true}setValue(t,e={}){Ew(()=>{no(this,true,t),Object.keys(t).forEach(i=>{io(this,true,i),this.controls[i].setValue(t[i],{onlySelf:true,emitEvent:e.emitEvent});}),this.updateValueAndValidity(e);});}patchValue(t,e={}){t!=null&&(Object.keys(t).forEach(i=>{let r=this._find(i);r&&r.patchValue(t[i],{onlySelf:true,emitEvent:e.emitEvent});}),this.updateValueAndValidity(e));}reset(t={},e={}){this._forEachChild((i,r$1)=>{i.reset(t?t[r$1]:null,s(r({},e),{onlySelf:true}));}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e),e?.emitEvent!==false&&this._events.next(new Ve$1(this));}getRawValue(){return this._reduceChildren({},(t,e,i)=>(t[i]=e.getRawValue(),t))}_syncPendingControls(){let t=this._reduceChildren(false,(e,i)=>i._syncPendingControls()?true:e);return t&&this.updateValueAndValidity({onlySelf:true}),t}_forEachChild(t){Object.keys(this.controls).forEach(e=>{let i=this.controls[e];i&&t(i,e);});}_setUpControls(){this._forEachChild(t=>{t.setParent(this),t._registerOnCollectionChange(this._onCollectionChange);});}_updateValue(){this.value=this._reduceValue();}_anyControls(t){for(let[e,i]of Object.entries(this.controls))if(this.contains(e)&&t(i))return  true;return  false}_reduceValue(){let t={};return this._reduceChildren(t,(e,i,r)=>((i.enabled||this.disabled)&&(e[r]=i.value),e))}_reduceChildren(t,e){let i=t;return this._forEachChild((r,o)=>{i=e(i,r,o);}),i}_allControlsDisabled(){for(let t of Object.keys(this.controls))if(this.controls[t].enabled)return  false;return Object.keys(this.controls).length>0||this.disabled}_find(t){return jn$1(this.controls,t)?this.controls[t]:null}};var xo={provide:Fe$1,useExisting:vo$1(()=>hi)},We=Promise.resolve(),hi=(()=>{class n extends Fe$1{callSetDisabledState;get submitted(){return Ew(this.submittedReactive)}_submitted=Iw(()=>this.submittedReactive());submittedReactive=Ho$1(false);_directives=new Set;form;ngSubmit=new We$3;options;constructor(e,i,r){super(),this.callSetDisabledState=r,this.form=new Dt({},ai$1(e),li$1(i));}ngAfterViewInit(){this._setUpdateStrategy();}get formDirective(){return this}get control(){return this.form}get path(){return []}get controls(){return this.form.controls}addControl(e){We.then(()=>{let i=this._findContainer(e.path);e.control=i.registerControl(e.name,e.control),e._setupWithForm(this.callSetDisabledState),e.control.updateValueAndValidity({emitEvent:false}),this._directives.add(e);});}getControl(e){return this.form.get(e.path)}removeControl(e){We.then(()=>{this._findContainer(e.path)?.removeControl(e.name),this._directives.delete(e);});}addFormGroup(e){We.then(()=>{let i=this._findContainer(e.path),r=new Dt({});Gn$1(r,e),i.registerControl(e.name,r),r.updateValueAndValidity({emitEvent:false});});}removeFormGroup(e){We.then(()=>{this._findContainer(e.path)?.removeControl?.(e.name);});}getFormGroup(e){return this.form.get(e.path)}updateModel(e,i){We.then(()=>{this.form.get(e.path).setValue(i);});}setValue(e){this.control.setValue(e);}onSubmit(e){return this.submittedReactive.set(true),Un(this.form,this._directives),this.ngSubmit.emit(e),this.form._events.next(new bt$1(this.control)),e?.target?.method==="dialog"}onReset(){this.resetForm();}resetForm(e=void 0){this.form.reset(e),this.submittedReactive.set(false);}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn);}_findContainer(e){return e.pop(),e.length?this.form.get(e):this.form}static \u0275fac=function(i){return new(i||n)(Ar$2(Mt$1,10),Ar$2(si$1,10),Ar$2(Ot,8))};static \u0275dir=pE({type:n,selectors:[["form",3,"ngNoForm","",3,"formGroup","",3,"formArray",""],["ng-form"],["","ngForm",""]],hostBindings:function(i,r){i&1&&Hp("submit",function(s){return r.onSubmit(s)})("reset",function(){return r.onReset()});},inputs:{options:[0,"ngFormOptions","options"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[cw([xo]),vp]})}return n})();function Sn(n,t){let e=n.indexOf(t);e>-1&&n.splice(e,1);}function Dn(n){return typeof n=="object"&&n!==null&&Object.keys(n).length===2&&"value"in n&&"disabled"in n}var Co=class extends xt$1{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=false;constructor(t=null,e,i){super(Bn$1(e),zn(i,e)),this._applyFormState(t),this._setUpdateStrategy(e),this._initObservables(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator}),kt$1(e)&&(e.nonNullable||e.initialValueIsDefault)&&(Dn(t)?this.defaultValue=t.value:this.defaultValue=t);}setValue(t,e={}){Ew(()=>{this.value=this._pendingValue=t,this._onChange.length&&e.emitModelToViewChange!==false&&this._onChange.forEach(i=>i(this.value,e.emitViewToModelChange!==false)),this.updateValueAndValidity(e);});}patchValue(t,e={}){this.setValue(t,e);}reset(t=this.defaultValue,e={}){this._applyFormState(t),this.markAsPristine(e),this.markAsUntouched(e),this.setValue(this.value,e),e.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=false,e?.emitEvent!==false&&this._events.next(new Ve$1(this));}_updateValue(){}_anyControls(t){return  false}_allControlsDisabled(){return this.disabled}registerOnChange(t){this._onChange.push(t);}_unregisterOnChange(t){Sn(this._onChange,t);}registerOnDisabledChange(t){this._onDisabledChange.push(t);}_unregisterOnDisabledChange(t){Sn(this._onDisabledChange,t);}_forEachChild(t){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:true,emitModelToViewChange:false}),true):false}_applyFormState(t){Dn(t)?(this.value=this._pendingValue=t.value,t.disabled?this.disable({onlySelf:true,emitEvent:false}):this.enable({onlySelf:true,emitEvent:false})):this.value=this._pendingValue=t;}};var wo=n=>n instanceof Co;var So=(()=>{class n extends Fe$1{callSetDisabledState;get submitted(){return Ew(this._submittedReactive)}set submitted(e){this._submittedReactive.set(e);}_submitted=Iw(()=>this._submittedReactive());_submittedReactive=Ho$1(false);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(e,i,r){super(),this.callSetDisabledState=r,this._setValidators(e),this._setAsyncValidators(i);}ngOnChanges(e){this.onChanges(e);}ngOnDestroy(){this.onDestroy();}onChanges(e){this._checkFormPresent(),e.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form);}onDestroy(){this.form&&(St$2(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}));}get formDirective(){return this}get path(){return []}addControl(e){let i=this.form.get(e.path);return e._setupWithForm(i,this.callSetDisabledState),i.updateValueAndValidity({emitEvent:false}),this.directives.push(e),i}getControl(e){return this.form.get(e.path)}removeControl(e){Ct$1(e.control||null,e,false),yo(this.directives,e);}addFormGroup(e){this._setUpFormContainer(e);}removeFormGroup(e){this._cleanUpFormContainer(e);}getFormGroup(e){return this.form.get(e.path)}getFormArray(e){return this.form.get(e.path)}addFormArray(e){this._setUpFormContainer(e);}removeFormArray(e){this._cleanUpFormContainer(e);}updateModel(e,i){this.form.get(e.path).setValue(i);}onReset(){this.resetForm();}resetForm(e=void 0,i={}){this.form.reset(e,i),this._submittedReactive.set(false);}onSubmit(e){return this.submitted=true,Un(this.form,this.directives),this.ngSubmit.emit(e),this.form._events.next(new bt$1(this.control)),e?.target?.method==="dialog"}_updateDomValue(){this.directives.forEach(e=>{let i=e.control,r=this.form.get(e.path);i!==r&&(Ct$1(i||null,e),wo(r)&&e._setupWithForm(r,this.callSetDisabledState));}),this.form._updateTreeValidity({emitEvent:false});}_setUpFormContainer(e){let i=this.form.get(e.path);Gn$1(i,e),i.updateValueAndValidity({emitEvent:false});}_cleanUpFormContainer(e){let i=this.form?.get(e.path);i&&po(i,e)&&i.updateValueAndValidity({emitEvent:false});}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{});}_updateValidators(){ci(this.form,this),this._oldForm&&St$2(this._oldForm,this);}_checkFormPresent(){this.form;}static \u0275fac=function(i){return new(i||n)(Ar$2(Mt$1,10),Ar$2(si$1,10),Ar$2(Ot,8))};static \u0275dir=pE({type:n,features:[vp,xm$1]})}return n})();var qn$1=new N$3(""),Do={provide:me,useExisting:vo$1(()=>Mo)},Mo=(()=>{class n extends me{_ngModelWarningConfig;callSetDisabledState;viewModel;form;set isDisabled(e){}model;update=new We$3;static _ngModelWarningSentOnce=false;_ngModelWarningSent=false;constructor(e,i,r,o,s,l,d){super(d,l,r),this._ngModelWarningConfig=o,this.callSetDisabledState=s,this._setValidators(e),this._setAsyncValidators(i);}ngOnChanges(e){if(this._isControlChanged(e)){let i=e.form.previousValue;i&&(Ct$1(i,this,false),this.removeParseErrorsValidator(i)),this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,co(this.form,this,this.callSetDisabledState)),this.form.updateValueAndValidity({emitEvent:false});}go(e,this.viewModel)&&(this.form.setValue(this.model),this.viewModel=this.model);}ngOnDestroy(){this.form&&Ct$1(this.form,this,false);}get path(){return []}get control(){return this.form}viewToModelUpdate(e){this.viewModel=e,this.update.emit(e);}_isControlChanged(e){return e.hasOwnProperty("form")}\u0275ngControlCreate(e){super.ngControlCreate(e);}\u0275ngControlUpdate(e){super.ngControlUpdate(e,true);}static \u0275fac=function(i){return new(i||n)(Ar$2(Mt$1,10),Ar$2(si$1,10),Ar$2(kn,10),Ar$2(qn$1,8),Ar$2(Ot,8),Ar$2(hI,8),Ar$2(Ee$4,8))};static \u0275dir=pE({type:n,selectors:[["","formControl",""]],inputs:{form:[0,"formControl","form"],isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"]},outputs:{update:"ngModelChange"},exportAs:["ngForm"],standalone:false,features:[cw([Do,bo]),vp,xm$1,mE(null)]})}return n})();var ko={provide:Fe$1,useExisting:vo$1(()=>ui)},ui=(()=>{class n extends So{form=null;ngSubmit=new We$3;get control(){return this.form}static \u0275fac=(()=>{let e;return function(r){return (e||(e=Qm$1(n)))(r||n)}})();static \u0275dir=pE({type:n,selectors:[["","formGroup",""]],hostBindings:function(i,r){i&1&&Hp("submit",function(s){return r.onSubmit(s)})("reset",function(){return r.onReset()});},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[cw([ko]),vp]})}return n})();var Oo=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({})}return n})();var Qs$1=(()=>{class n{static withConfig(e){return {ngModule:n,providers:[{provide:qn$1,useValue:e.warnOnNgModelWithFormControl??"always"},{provide:Ot,useValue:e.callSetDisabledState??di}]}}static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[Oo]})}return n})();var fi=class{_box;_destroyed=new ie$1;_resizeSubject=new ie$1;_resizeObserver;_elementObservables=new Map;constructor(t){this._box=t,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(t){return this._elementObservables.has(t)||this._elementObservables.set(t,new x(e=>{let i=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(t,{box:this._box}),()=>{this._resizeObserver?.unobserve(t),i.unsubscribe(),this._elementObservables.delete(t);}}).pipe(qn$3(e=>e.some(i=>i.target===t)),Cg({bufferSize:1,refCount:true}),Sg(this._destroyed))),this._elementObservables.get(t)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},Yn$1=(()=>{class n{_cleanupErrorListener;_observers=new Map;_ngZone=T$2(De$3);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,i){let r=i?.box||"content-box";return this._observers.has(r)||this._observers.set(r,new fi(r)),this._observers.get(r).observe(e)}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var Eo=["notch"],Ro=["*"],Xn$1=["iconPrefixContainer"],$n$1=["textPrefixContainer"],Zn$1=["iconSuffixContainer"],Qn$1=["textSuffixContainer"],Fo=["textField"],Vo=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],Ao=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function Po(n,t){n&1&&Op(0,"span",21);}function Io(n,t){if(n&1&&(yi$2(0,"label",20),bD(1,1),rD(2,Po,1,0,"span",21),Uc$1()),n&2){let e=wD(2);kp("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),Rp("for",e._control.disableAutomaticLabeling?null:e._control.id),xv(2),oD(!e.hideRequiredMarker&&e._control.required?2:-1);}}function To(n,t){if(n&1&&rD(0,Io,3,5,"label",20),n&2){let e=wD();oD(e._hasFloatingLabel()?0:-1);}}function No(n,t){n&1&&Op(0,"div",7);}function Lo(n,t){}function Bo(n,t){if(n&1&&Ep(0,Lo,0,0,"ng-template",13),n&2){wD(2);let e=xD(1);kp("ngTemplateOutlet",e);}}function zo(n,t){if(n&1&&(yi$2(0,"div",9),rD(1,Bo,1,1,null,13),Uc$1()),n&2){let e=wD();kp("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),xv(),oD(e._forceDisplayInfixLabel()?-1:1);}}function jo(n,t){n&1&&(yi$2(0,"div",10,2),bD(2,2),Uc$1());}function Ho(n,t){n&1&&(yi$2(0,"div",11,3),bD(2,3),Uc$1());}function Wo(n,t){}function Go(n,t){if(n&1&&Ep(0,Wo,0,0,"ng-template",13),n&2){wD();let e=xD(1);kp("ngTemplateOutlet",e);}}function Uo(n,t){n&1&&(yi$2(0,"div",14,4),bD(2,4),Uc$1());}function qo(n,t){n&1&&(yi$2(0,"div",15,5),bD(2,5),Uc$1());}function Yo(n,t){n&1&&Op(0,"div",16);}function Xo(n,t){n&1&&(yi$2(0,"div",18),bD(1,6),Uc$1());}function $o(n,t){if(n&1&&(yi$2(0,"mat-hint",22),JD(1),Uc$1()),n&2){let e=wD(2);kp("id",e._hintLabelId),xv(),nh$1(e.hintLabel);}}function Zo(n,t){if(n&1&&(yi$2(0,"div",19),rD(1,$o,2,2,"mat-hint",22),bD(2,7),Op(3,"div",23),bD(4,8),Uc$1()),n&2){let e=wD();xv(),oD(e.hintLabel?1:-1);}}var mi=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["mat-label"]]})}return n})(),gi=new N$3("MatError"),Qo=(()=>{class n{id=T$2(Pt$1).getId("mat-mdc-error-");static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["mat-error"],["","matError",""]],hostAttrs:[1,"mat-mdc-form-field-error","mat-mdc-form-field-bottom-align"],hostVars:1,hostBindings:function(i,r){i&2&&jp("id",r.id);},inputs:{id:"id"},features:[cw([{provide:gi,useExisting:n}])]})}return n})(),pi=(()=>{class n{align="start";id=T$2(Pt$1).getId("mat-mdc-hint-");static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(i,r){i&2&&(jp("id",r.id),Rp("align",null),Zp("mat-mdc-form-field-hint-end",r.align==="end"));},inputs:{align:"align",id:"id"}})}return n})(),rr$1=new N$3("MatPrefix");var or$1=new N$3("MatSuffix");var sr$1=new N$3("FloatingLabelParent"),Kn$1=(()=>{class n{_elementRef=T$2(Mr$2);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=T$2(Yn$1);_ngZone=T$2(De$3);_parent=T$2(sr$1);_resizeSubscription=new G$2;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return Ko(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(i,r){i&2&&Zp("mdc-floating-label--float-above",r.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return n})();function Ko(n){let t=n;if(t.offsetParent!==null)return t.scrollWidth;let e=t.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let i=e.scrollWidth;return e.remove(),i}var Jn$1="mdc-line-ripple--active",Et$1="mdc-line-ripple--deactivating",er$2=(()=>{class n{_elementRef=T$2(Mr$2);_cleanupTransitionEnd;constructor(){let e=T$2(De$3),i=T$2(hI);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=i.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(Et$1),e.add(Jn$1);}deactivate(){this._elementRef.nativeElement.classList.add(Et$1);}_handleTransitionEnd=e=>{let i=this._elementRef.nativeElement.classList,r=i.contains(Et$1);e.propertyName==="opacity"&&r&&i.remove(Jn$1,Et$1);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return n})(),tr$1=(()=>{class n{_elementRef=T$2(Mr$2);_ngZone=T$2(De$3);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,i=e.querySelector(".mdc-floating-label");i?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(i.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>i.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let i=this._notch.nativeElement;!this.open||!e?i.style.width="":i.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(i,r){if(i&1&&Up(Eo,5),i&2){let o;MD(o=SD())&&(r._notch=o.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(i,r){i&2&&Zp("mdc-notched-outline--notched",r.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:Ro,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(i,r){i&1&&(CD(),Pp(0,"div",1),Wc$1(1,"div",2,0),bD(3),qc$1(),Pp(4,"div",3));},encapsulation:2})}return n})(),Rt$1=(()=>{class n{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n})}return n})();var Ft=new N$3("MatFormField"),ar$1=new N$3("MAT_FORM_FIELD_DEFAULT_OPTIONS"),ir$2="fill",Jo="auto",nr$2="fixed",es$1="translateY(-50%)",lr$1=(()=>{class n{_elementRef=T$2(Mr$2);_changeDetectorRef=T$2($F);_platform=T$2(u);_idGenerator=T$2(Pt$1);_ngZone=T$2(De$3);_defaults=T$2(ar$1,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=VF("iconPrefixContainer");_textPrefixContainerSignal=VF("textPrefixContainer");_iconSuffixContainerSignal=VF("iconSuffixContainer");_textSuffixContainerSignal=VF("textSuffixContainer");_prefixSuffixContainers=Iw(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=HF(mi);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=ti$2(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||Jo}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let i=e||this._defaults?.appearance||ir$2;this._appearanceSignal.set(i);}_appearanceSignal=Ho$1(ir$2);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||nr$2}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||nr$2;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ie$1;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=K();constructor(){let e=this._defaults,i=T$2(Ri$1);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),Vu(()=>this._currentDirection=i.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=Iw(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let i=this._control,r="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(r+e.controlType),i.controlType&&this._elementRef.nativeElement.classList.add(r+i.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=i.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=i.stateChanges.pipe(_g([void 0,void 0]),le$1(()=>[i.errorState,i.userAriaDescribedBy]),wg(),qn$3(([[o,s],[l,d]])=>o!==l||s!==d)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),i.ngControl&&i.ngControl.valueChanges&&(this._valueChanges=i.ngControl.valueChanges.pipe(Sg(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),dg(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){GF({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=Iw(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let i=this._control?this._control.ngControl:null;return i&&i[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let o=this._hintChildren?this._hintChildren.find(l=>l.align==="start"):null,s=this._hintChildren?this._hintChildren.find(l=>l.align==="end"):null;o?e.push(o.id):this._hintLabel&&e.push(this._hintLabelId),s&&e.push(s.id);}else this._errorChildren&&e.push(...this._errorChildren.map(o=>o.id));let i=this._control.describedByIds,r;if(i){let o=this._describedByIds||e;r=e.concat(i.filter(s=>s&&!o.includes(s)));}else r=e;this._control.setDescribedByIds(r),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,i=this._textPrefixContainer?.nativeElement,r=this._iconSuffixContainer?.nativeElement,o=this._textSuffixContainer?.nativeElement,s=e?.getBoundingClientRect().width??0,l=i?.getBoundingClientRect().width??0,d=r?.getBoundingClientRect().width??0,h=o?.getBoundingClientRect().width??0,c=this._currentDirection==="rtl"?"-1":"1",u=`${s+l}px`,z=`calc(${c} * (${u} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,L=`var(--mat-mdc-form-field-label-transform, ${es$1} translateX(${z}))`,Y=s+l+d+h;return [L,Y]}_writeOutlinedLabelStyles(e){if(e!==null){let[i,r]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=i),r!==null&&this._notchedOutline?._setMaxWidth(r);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let i=e.getRootNode();return i&&i!==e}return document.documentElement.contains(e)}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["mat-form-field"]],contentQueries:function(i,r,o){if(i&1&&(Wp(o,r._labelChild,mi,5),$p(o,Rt$1,5)(o,rr$1,5)(o,or$1,5)(o,gi,5)(o,pi,5)),i&2){ND();let s;MD(s=SD())&&(r._formFieldControl=s.first),MD(s=SD())&&(r._prefixChildren=s),MD(s=SD())&&(r._suffixChildren=s),MD(s=SD())&&(r._errorChildren=s),MD(s=SD())&&(r._hintChildren=s);}},viewQuery:function(i,r){if(i&1&&(qp(r._iconPrefixContainerSignal,Xn$1,5)(r._textPrefixContainerSignal,$n$1,5)(r._iconSuffixContainerSignal,Zn$1,5)(r._textSuffixContainerSignal,Qn$1,5),Up(Fo,5)(Xn$1,5)($n$1,5)(Zn$1,5)(Qn$1,5)(Kn$1,5)(tr$1,5)(er$2,5)),i&2){ND(4);let o;MD(o=SD())&&(r._textField=o.first),MD(o=SD())&&(r._iconPrefixContainer=o.first),MD(o=SD())&&(r._textPrefixContainer=o.first),MD(o=SD())&&(r._iconSuffixContainer=o.first),MD(o=SD())&&(r._textSuffixContainer=o.first),MD(o=SD())&&(r._floatingLabel=o.first),MD(o=SD())&&(r._notchedOutline=o.first),MD(o=SD())&&(r._lineRipple=o.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(i,r){i&2&&Zp("mat-mdc-form-field-label-always-float",r._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",r._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",r._hasIconSuffix)("mat-form-field-invalid",r._control.errorState)("mat-form-field-disabled",r._control.disabled)("mat-form-field-autofilled",r._control.autofilled)("mat-form-field-appearance-fill",r.appearance=="fill")("mat-form-field-appearance-outline",r.appearance=="outline")("mat-form-field-hide-placeholder",r._hasFloatingLabel()&&!r._shouldLabelFloat())("mat-primary",r.color!=="accent"&&r.color!=="warn")("mat-accent",r.color==="accent")("mat-warn",r.color==="warn")("ng-untouched",r._shouldForward("untouched"))("ng-touched",r._shouldForward("touched"))("ng-pristine",r._shouldForward("pristine"))("ng-dirty",r._shouldForward("dirty"))("ng-valid",r._shouldForward("valid"))("ng-invalid",r._shouldForward("invalid"))("ng-pending",r._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[cw([{provide:Ft,useExisting:n},{provide:sr$1,useExisting:n}])],ngContentSelectors:Ao,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(i,r){if(i&1&&(CD(Vo),Ep(0,To,1,1,"ng-template",null,0,mw),yi$2(2,"div",6,1),Hp("click",function(s){return r._control.onContainerClick(s)}),rD(4,No,1,0,"div",7),yi$2(5,"div",8),rD(6,zo,2,2,"div",9),rD(7,jo,3,0,"div",10),rD(8,Ho,3,0,"div",11),yi$2(9,"div",12),rD(10,Go,1,1,null,13),bD(11),Uc$1(),rD(12,Uo,3,0,"div",14),rD(13,qo,3,0,"div",15),Uc$1(),rD(14,Yo,1,0,"div",16),Uc$1(),yi$2(15,"div",17),rD(16,Xo,2,0,"div",18)(17,Zo,5,1,"div",19),Uc$1()),i&2){let o;xv(2),Zp("mdc-text-field--filled",!r._hasOutline())("mdc-text-field--outlined",r._hasOutline())("mdc-text-field--no-label",!r._hasFloatingLabel())("mdc-text-field--disabled",r._control.disabled)("mdc-text-field--invalid",r._control.errorState),xv(2),oD(!r._hasOutline()&&!r._control.disabled?4:-1),xv(2),oD(r._hasOutline()?6:-1),xv(),oD(r._hasIconPrefix?7:-1),xv(),oD(r._hasTextPrefix?8:-1),xv(2),oD(!r._hasOutline()||r._forceDisplayInfixLabel()?10:-1),xv(2),oD(r._hasTextSuffix?12:-1),xv(),oD(r._hasIconSuffix?13:-1),xv(),oD(r._hasOutline()?-1:14),xv(),Zp("mat-mdc-form-field-subscript-dynamic-size",r.subscriptSizing==="dynamic");let s=r._getSubscriptMessageType();xv(),oD((o=s)==="error"?16:o==="hint"?17:-1);}},dependencies:[Kn$1,tr$1,pr$3,er$2,pi],styles:[`.mdc-text-field {
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
`],encapsulation:2})}return n})();var dr$1=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[Ce$2,lr$1,er$3]})}return n})();var cr$1=(()=>{class n{_animationsDisabled=K();state="unchecked";disabled=false;appearance="full";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["mat-pseudo-checkbox"]],hostAttrs:[1,"mat-pseudo-checkbox"],hostVars:12,hostBindings:function(i,r){i&2&&Zp("mat-pseudo-checkbox-indeterminate",r.state==="indeterminate")("mat-pseudo-checkbox-checked",r.state==="checked")("mat-pseudo-checkbox-disabled",r.disabled)("mat-pseudo-checkbox-minimal",r.appearance==="minimal")("mat-pseudo-checkbox-full",r.appearance==="full")("_mat-animation-noopable",r._animationsDisabled);},inputs:{state:"state",disabled:"disabled",appearance:"appearance"},decls:0,vars:0,template:function(i,r){},styles:[`.mat-pseudo-checkbox {
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 0.1), background-color 90ms cubic-bezier(0, 0, 0.2, 0.1);
}
.mat-pseudo-checkbox::after {
  position: absolute;
  opacity: 0;
  content: "";
  border-bottom: 2px solid currentColor;
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 0.1);
}
.mat-pseudo-checkbox._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-pseudo-checkbox._mat-animation-noopable::after {
  transition: none;
}

.mat-pseudo-checkbox-disabled {
  cursor: default;
}

.mat-pseudo-checkbox-indeterminate::after {
  left: 1px;
  opacity: 1;
  border-radius: 2px;
}

.mat-pseudo-checkbox-checked::after {
  left: 1px;
  border-left: 2px solid currentColor;
  transform: rotate(-45deg);
  opacity: 1;
  box-sizing: content-box;
}

.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after, .mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after {
  color: var(--mat-pseudo-checkbox-minimal-selected-checkmark-color, var(--mat-sys-primary));
}
.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled::after, .mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled::after {
  color: var(--mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-pseudo-checkbox-full {
  border-color: var(--mat-pseudo-checkbox-full-unselected-icon-color, var(--mat-sys-on-surface-variant));
  border-width: 2px;
  border-style: solid;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-disabled {
  border-color: var(--mat-pseudo-checkbox-full-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate {
  background-color: var(--mat-pseudo-checkbox-full-selected-icon-color, var(--mat-sys-primary));
  border-color: transparent;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after {
  color: var(--mat-pseudo-checkbox-full-selected-checkmark-color, var(--mat-sys-on-primary));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled {
  background-color: var(--mat-pseudo-checkbox-full-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled::after, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled::after {
  color: var(--mat-pseudo-checkbox-full-disabled-selected-checkmark-color, var(--mat-sys-surface));
}

.mat-pseudo-checkbox {
  width: 18px;
  height: 18px;
}

.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after {
  width: 14px;
  height: 6px;
  transform-origin: center;
  top: -4.2426406871px;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}
.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after {
  top: 8px;
  width: 16px;
}

.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after {
  width: 10px;
  height: 4px;
  transform-origin: center;
  top: -2.8284271247px;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after {
  top: 6px;
  width: 12px;
}
`],encapsulation:2})}return n})();var ts$1=["text"],is$1=[[["mat-icon"]],"*"],ns$1=["mat-icon","*"];function rs$1(n,t){if(n&1&&Op(0,"mat-pseudo-checkbox",1),n&2){let e=wD();kp("disabled",e.disabled)("state",e.selected?"checked":"unchecked");}}function os$1(n,t){if(n&1&&Op(0,"mat-pseudo-checkbox",3),n&2){let e=wD();kp("disabled",e.disabled);}}function ss$1(n,t){if(n&1&&(yi$2(0,"span",4),JD(1),Uc$1()),n&2){let e=wD();xv(),Qc$1("(",e.group.label,")");}}var vi=new N$3("MAT_OPTION_PARENT_COMPONENT"),yi=new N$3("MatOptgroup");var _i=class{source;isUserInput;constructor(t,e=false){this.source=t,this.isUserInput=e;}},Pt=(()=>{class n{_element=T$2(Mr$2);_changeDetectorRef=T$2($F);_parent=T$2(vi,{optional:true});group=T$2(yi,{optional:true});_signalDisableRipple=false;_selected=false;_active=false;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=T$2(Pt$1).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=Ho$1(false);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return !!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new We$3;_text;_stateChanges=new ie$1;constructor(){let e=T$2(bi$2);e.load(qe$1),e.load(vu),this._signalDisableRipple=!!this._parent&&sa(this._parent.disableRipple);}get active(){return this._active}get viewValue(){return (this._text?.nativeElement.textContent||"").trim()}select(e=true){this._selected||(this._selected=true,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}deselect(e=true){this._selected&&(this._selected=false,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent());}focus(e,i){let r=this._getHostElement();typeof r.focus=="function"&&r.focus(i);}setActiveStyles(){this._active||(this._active=true,this._changeDetectorRef.markForCheck());}setInactiveStyles(){this._active&&(this._active=false,this._changeDetectorRef.markForCheck());}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!Ue$1(e)&&(this._selectViaInteraction(),e.preventDefault());}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:true,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(true));}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e);}}ngOnDestroy(){this._stateChanges.complete();}_emitSelectionChangeEvent(e=false){this.onSelectionChange.emit(new _i(this,e));}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["mat-option"]],viewQuery:function(i,r){if(i&1&&Up(ts$1,7),i&2){let o;MD(o=SD())&&(r._text=o.first);}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(i,r){i&1&&Hp("click",function(){return r._selectViaInteraction()})("keydown",function(s){return r._handleKeydown(s)}),i&2&&(jp("id",r.id),Rp("aria-selected",r.selected)("aria-disabled",r.disabled.toString()),Zp("mdc-list-item--selected",r.selected)("mat-mdc-option-multiple",r.multiple)("mat-mdc-option-active",r.active)("mdc-list-item--disabled",r.disabled));},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",WF]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:ns$1,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(i,r){i&1&&(CD(is$1),rD(0,rs$1,1,2,"mat-pseudo-checkbox",1),bD(1),yi$2(2,"span",2,0),bD(4,1),Uc$1(),rD(5,os$1,1,1,"mat-pseudo-checkbox",3),rD(6,ss$1,2,1,"span",4),Op(7,"div",5)),i&2&&(oD(r.multiple?0:-1),xv(5),oD(!r.multiple&&r.selected&&!r.hideSingleSelectionIndicator?5:-1),xv(),oD(r.group&&r.group._inert?6:-1),xv(),kp("matRippleTrigger",r._getHostElement())("matRippleDisabled",r.disabled||r.disableRipple));},dependencies:[cr$1,bi$1],styles:[`.mat-mdc-option {
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
`],encapsulation:2})}return n})();function hr$1(n,t,e){if(e.length){let i=t.toArray(),r=e.toArray(),o=0;for(let s=0;s<n+1;s++)i[s].group&&i[s].group===r[o]&&o++;return o}return 0}function ur$1(n,t,e,i){return n<e?n:n+t>e+i?Math.max(0,n-i+t):e}var Ye$2=class Ye{_multiple;_emitChanges;compareWith;_selection=new Set;_deselectedToEmit=[];_selectedToEmit=[];_selected=null;get selected(){return this._selected||(this._selected=Array.from(this._selection.values())),this._selected}changed=new ie$1;constructor(t=false,e,i=true,r){this._multiple=t,this._emitChanges=i,this.compareWith=r,e&&e.length&&(t?e.forEach(o=>this._markSelected(o)):this._markSelected(e[0]),this._selectedToEmit.length=0);}select(...t){this._verifyValueAssignment(t),t.forEach(i=>this._markSelected(i));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}deselect(...t){this._verifyValueAssignment(t),t.forEach(i=>this._unmarkSelected(i));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}setSelection(...t){this._verifyValueAssignment(t);let e=this.selected,i=new Set(t.map(o=>this._getConcreteValue(o)));t.forEach(o=>this._markSelected(o)),e.filter(o=>!i.has(this._getConcreteValue(o,i))).forEach(o=>this._unmarkSelected(o));let r=this._hasQueuedChanges();return this._emitChangeEvent(),r}toggle(t){return this.isSelected(t)?this.deselect(t):this.select(t)}clear(t=true){this._unmarkAll();let e=this._hasQueuedChanges();return t&&this._emitChangeEvent(),e}isSelected(t){return this._selection.has(this._getConcreteValue(t))}isEmpty(){return this._selection.size===0}hasValue(){return !this.isEmpty()}sort(t){this._multiple&&this.selected&&this._selected.sort(t);}isMultipleSelection(){return this._multiple}_emitChangeEvent(){this._selected=null,(this._selectedToEmit.length||this._deselectedToEmit.length)&&(this.changed.next({source:this,added:this._selectedToEmit,removed:this._deselectedToEmit}),this._deselectedToEmit=[],this._selectedToEmit=[]);}_markSelected(t){t=this._getConcreteValue(t),this.isSelected(t)||(this._multiple||this._unmarkAll(),this.isSelected(t)||this._selection.add(t),this._emitChanges&&this._selectedToEmit.push(t));}_unmarkSelected(t){t=this._getConcreteValue(t),this.isSelected(t)&&(this._selection.delete(t),this._emitChanges&&this._deselectedToEmit.push(t));}_unmarkAll(){this.isEmpty()||this._selection.forEach(t=>this._unmarkSelected(t));}_verifyValueAssignment(t){t.length>1&&this._multiple;}_hasQueuedChanges(){return !!(this._deselectedToEmit.length||this._selectedToEmit.length)}_getConcreteValue(t,e){if(this.compareWith){e=e??this._selection;for(let i of e)if(this.compareWith(t,i))return i;return t}else return t}};var as$1=20,$e=(()=>{class n{_ngZone=T$2(De$3);_platform=T$2(u);_renderer=T$2(wr$1).createRenderer(null,null);_cleanupGlobalListener;_scrolled=new ie$1;_scrolledCount=0;scrollContainers=new Map;register(e){this.scrollContainers.has(e)||this.scrollContainers.set(e,e.elementScrolled().subscribe(()=>this._scrolled.next(e)));}deregister(e){let i=this.scrollContainers.get(e);i&&(i.unsubscribe(),this.scrollContainers.delete(e));}scrolled(e=as$1){return this._platform.isBrowser?new x(i=>{this._cleanupGlobalListener||(this._cleanupGlobalListener=this._ngZone.runOutsideAngular(()=>this._renderer.listen("document","scroll",()=>this._scrolled.next())));let r=e>0?this._scrolled.pipe(fg(e)).subscribe(i):this._scrolled.subscribe(i);return this._scrolledCount++,()=>{r.unsubscribe(),this._scrolledCount--,this._scrolledCount||(this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0);}}):Uh()}ngOnDestroy(){this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0,this.scrollContainers.forEach((e,i)=>this.deregister(i)),this._scrolled.complete();}ancestorScrolled(e,i){let r=this.getAncestorScrollContainers(e);return this.scrolled(i).pipe(qn$3(o=>!o||r.indexOf(o)>-1))}getAncestorScrollContainers(e){let i=[];return this.scrollContainers.forEach((r,o)=>{this._targetContainsElement(o,e)&&i.push(o);}),i}_targetContainsElement(e,i){let r=E$1(i),o=e.getElementRef().nativeElement;do if(r==o)return  true;while(r=r.parentElement);return  false}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),ls$1=(()=>{class n{elementRef=T$2(Mr$2);scrollDispatcher=T$2($e);ngZone=T$2(De$3);dir=T$2(Ri$1,{optional:true});_scrollElement=this.elementRef.nativeElement;_destroyed=new ie$1;_renderer=T$2(hI);_cleanupScroll;_elementScrolled=new ie$1;ngOnInit(){this._cleanupScroll=this.ngZone.runOutsideAngular(()=>this._renderer.listen(this._scrollElement,"scroll",e=>this._elementScrolled.next(e))),this.scrollDispatcher.register(this);}ngOnDestroy(){this._cleanupScroll?.(),this._elementScrolled.complete(),this.scrollDispatcher.deregister(this),this._destroyed.next(),this._destroyed.complete();}elementScrolled(){return this._elementScrolled}getElementRef(){return this.elementRef}scrollTo(e){let i=this.elementRef.nativeElement,r=this.dir&&this.dir.value=="rtl";e.left==null&&(e.left=r?e.end:e.start),e.right==null&&(e.right=r?e.start:e.end),e.bottom!=null&&(e.top=i.scrollHeight-i.clientHeight-e.bottom),r&&Po$1()!=Y.NORMAL?(e.left!=null&&(e.right=i.scrollWidth-i.clientWidth-e.left),Po$1()==Y.INVERTED?e.left=e.right:Po$1()==Y.NEGATED&&(e.left=e.right?-e.right:e.right)):e.right!=null&&(e.left=i.scrollWidth-i.clientWidth-e.right),this._applyScrollToOptions(e);}_applyScrollToOptions(e){let i=this.elementRef.nativeElement;Lo$1()?i.scrollTo(e):(e.top!=null&&(i.scrollTop=e.top),e.left!=null&&(i.scrollLeft=e.left));}measureScrollOffset(e){let i="left",r="right",o=this.elementRef.nativeElement;if(e=="top")return o.scrollTop;if(e=="bottom")return o.scrollHeight-o.clientHeight-o.scrollTop;let s=this.dir&&this.dir.value=="rtl";return e=="start"?e=s?r:i:e=="end"&&(e=s?i:r),s&&Po$1()==Y.INVERTED?e==i?o.scrollWidth-o.clientWidth-o.scrollLeft:o.scrollLeft:s&&Po$1()==Y.NEGATED?e==i?o.scrollLeft+o.scrollWidth-o.clientWidth:-o.scrollLeft:e==i?o.scrollLeft:o.scrollWidth-o.clientWidth-o.scrollLeft}static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["","cdk-scrollable",""],["","cdkScrollable",""]]})}return n})(),ds$1=20,pe=(()=>{class n{_platform=T$2(u);_listeners;_viewportSize=null;_change=new ie$1;_document=T$2(dr$3);constructor(){let e=T$2(De$3),i=T$2(wr$1).createRenderer(null,null);e.runOutsideAngular(()=>{if(this._platform.isBrowser){let r=o=>this._change.next(o);this._listeners=[i.listen("window","resize",r),i.listen("window","orientationchange",r)];}this.change().subscribe(()=>this._viewportSize=null);});}ngOnDestroy(){this._listeners?.forEach(e=>e()),this._change.complete();}getViewportSize(){this._viewportSize||this._updateViewportSize();let e={width:this._viewportSize.width,height:this._viewportSize.height};return this._platform.isBrowser||(this._viewportSize=null),e}getViewportRect(){let e=this.getViewportScrollPosition(),{width:i,height:r}=this.getViewportSize();return {top:e.top,left:e.left,bottom:e.top+r,right:e.left+i,height:r,width:i}}getViewportScrollPosition(){if(!this._platform.isBrowser)return {top:0,left:0};let e=this._document,i=this._getWindow(),r=e.documentElement,o=r.getBoundingClientRect(),s=-o.top||e.body?.scrollTop||i.scrollY||r.scrollTop||0,l=-o.left||e.body?.scrollLeft||i.scrollX||r.scrollLeft||0;return {top:s,left:l}}change(e=ds$1){return e>0?this._change.pipe(fg(e)):this._change}_getWindow(){return this._document.defaultView||window}_updateViewportSize(){let e=this._getWindow();this._viewportSize=this._platform.isBrowser?{width:e.innerWidth,height:e.innerHeight}:{width:0,height:0};}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var Xe$2=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({})}return n})(),bi=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[er$3,Xe$2,er$3,Xe$2]})}return n})();var Ze$1=class Ze{_attachedHost=null;attach(t){return this._attachedHost=t,t.attach(this)}detach(){let t=this._attachedHost;t!=null&&(this._attachedHost=null,t.detach());}get isAttached(){return this._attachedHost!=null}setAttachedHost(t){this._attachedHost=t;}},xi=class extends Ze$1{component;viewContainerRef;injector;projectableNodes;bindings;directives;constructor(t,e,i,r,o,s){super(),this.component=t,this.viewContainerRef=e,this.injector=i,this.projectableNodes=r,this.bindings=o||null,this.directives=s||null;}},Qe$1=class Qe extends Ze$1{templateRef;viewContainerRef;context;injector;constructor(t,e,i,r){super(),this.templateRef=t,this.viewContainerRef=e,this.context=i,this.injector=r;}get origin(){return this.templateRef.elementRef}attach(t,e=this.context){return this.context=e,super.attach(t)}detach(){return this.context=void 0,super.detach()}},Ci=class extends Ze$1{element;constructor(t){super(),this.element=t instanceof Mr$2?t.nativeElement:t;}},wi=class{_attachedPortal=null;_disposeFn=null;_isDisposed=false;hasAttached(){return !!this._attachedPortal}attach(t){if(t instanceof xi)return this._attachedPortal=t,this.attachComponentPortal(t);if(t instanceof Qe$1)return this._attachedPortal=t,this.attachTemplatePortal(t);if(this.attachDomPortal&&t instanceof Ci)return this._attachedPortal=t,this.attachDomPortal(t)}attachDomPortal=null;detach(){this._attachedPortal&&(this._attachedPortal.setAttachedHost(null),this._attachedPortal=null),this._invokeDisposeFn();}dispose(){this.hasAttached()&&this.detach(),this._invokeDisposeFn(),this._isDisposed=true;}setDisposeFn(t){this._disposeFn=t;}_invokeDisposeFn(){this._disposeFn&&(this._disposeFn(),this._disposeFn=null);}},It$1=class It extends wi{outletElement;_appRef;_defaultInjector;constructor(t,e,i){super(),this.outletElement=t,this._appRef=e,this._defaultInjector=i;}attachComponentPortal(t){let e;if(t.viewContainerRef){let i=t.injector||t.viewContainerRef.injector,r=i.get(Sn$3,null,{optional:true})||void 0;e=t.viewContainerRef.createComponent(t.component,{index:t.viewContainerRef.length,injector:i,ngModuleRef:r,projectableNodes:t.projectableNodes||void 0,bindings:t.bindings||void 0,directives:t.directives||void 0}),this.setDisposeFn(()=>e.destroy());}else {let i=this._appRef,r=t.injector||this._defaultInjector||Ee$4.NULL,o=r.get(se,i.injector);e=zF(t.component,{elementInjector:r,environmentInjector:o,projectableNodes:t.projectableNodes||void 0,bindings:t.bindings||void 0,directives:t.directives||void 0}),i.attachView(e.hostView),this.setDisposeFn(()=>{i.viewCount>0&&i.detachView(e.hostView),e.destroy();});}return this.outletElement.appendChild(this._getComponentRootNode(e)),this._attachedPortal=t,e}attachTemplatePortal(t){let e=t.viewContainerRef,i=e.createEmbeddedView(t.templateRef,t.context,{injector:t.injector});return i.rootNodes.forEach(r=>this.outletElement.appendChild(r)),i.detectChanges(),this.setDisposeFn(()=>{let r=e.indexOf(i);r!==-1&&e.remove(r);}),this._attachedPortal=t,i}attachDomPortal=t=>{let e=t.element;e.parentNode;let i=this.outletElement.ownerDocument.createComment("dom-portal");e.parentNode.insertBefore(i,e),this.outletElement.appendChild(e),this._attachedPortal=t,super.setDisposeFn(()=>{i.parentNode&&i.parentNode.replaceChild(e,i);});};dispose(){super.dispose(),this.outletElement.remove();}_getComponentRootNode(t){return t.hostView.rootNodes[0]}};var fr$1=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({})}return n})();var mr$1=Lo$1();function Cr$1(n){return new Tt$1(n.get(pe),n.get(dr$3))}var Tt$1=class Tt{_viewportRuler;_previousHTMLStyles={top:"",left:""};_previousScrollPosition;_isEnabled=false;_document;constructor(t,e){this._viewportRuler=t,this._document=e;}attach(){}enable(){if(this._canBeEnabled()){let t=this._document.documentElement;this._previousScrollPosition=this._viewportRuler.getViewportScrollPosition(),this._previousHTMLStyles.left=t.style.left||"",this._previousHTMLStyles.top=t.style.top||"",t.style.left=qo$1(-this._previousScrollPosition.left),t.style.top=qo$1(-this._previousScrollPosition.top),t.classList.add("cdk-global-scrollblock"),this._isEnabled=true;}}disable(){if(this._isEnabled){let t=this._document.documentElement,e=this._document.body,i=t.style,r=e.style,o=i.scrollBehavior||"",s=r.scrollBehavior||"";this._isEnabled=false,i.left=this._previousHTMLStyles.left,i.top=this._previousHTMLStyles.top,t.classList.remove("cdk-global-scrollblock"),mr$1&&(i.scrollBehavior=r.scrollBehavior="auto"),window.scroll(this._previousScrollPosition.left,this._previousScrollPosition.top),mr$1&&(i.scrollBehavior=o,r.scrollBehavior=s);}}_canBeEnabled(){if(this._document.documentElement.classList.contains("cdk-global-scrollblock")||this._isEnabled)return  false;let e=this._document.documentElement,i=this._viewportRuler.getViewportSize();return e.scrollHeight>i.height||e.scrollWidth>i.width}};function wr(n,t){return new Nt(n.get($e),n.get(De$3),n.get(pe),t)}var Nt=class{_scrollDispatcher;_ngZone;_viewportRuler;_config;_scrollSubscription=null;_overlayRef;_initialScrollPosition;constructor(t,e,i,r){this._scrollDispatcher=t,this._ngZone=e,this._viewportRuler=i,this._config=r;}attach(t){this._overlayRef,this._overlayRef=t;}enable(){if(this._scrollSubscription)return;let t=this._scrollDispatcher.scrolled(0).pipe(qn$3(e=>!e||!this._overlayRef.overlayElement.contains(e.getElementRef().nativeElement)));this._config&&this._config.threshold&&this._config.threshold>1?(this._initialScrollPosition=this._viewportRuler.getViewportScrollPosition().top,this._scrollSubscription=t.subscribe(()=>{let e=this._viewportRuler.getViewportScrollPosition().top;Math.abs(e-this._initialScrollPosition)>this._config.threshold?this._detach():this._overlayRef.updatePosition();})):this._scrollSubscription=t.subscribe(this._detach);}disable(){this._scrollSubscription&&(this._scrollSubscription.unsubscribe(),this._scrollSubscription=null);}detach(){this.disable(),this._overlayRef=null;}_detach=()=>{this.disable(),this._overlayRef.hasAttached()&&this._ngZone.run(()=>this._overlayRef.detach());}};var Ke=class{enable(){}disable(){}attach(){}};function Si(n,t){return t.some(e=>{let i=n.bottom<e.top,r=n.top>e.bottom,o=n.right<e.left,s=n.left>e.right;return i||r||o||s})}function pr$1(n,t){return t.some(e=>{let i=n.top<e.top,r=n.bottom>e.bottom,o=n.left<e.left,s=n.right>e.right;return i||r||o||s})}function et(n,t){return new Lt$1(n.get($e),n.get(pe),n.get(De$3),t)}var Lt$1=class Lt{_scrollDispatcher;_viewportRuler;_ngZone;_config;_scrollSubscription=null;_overlayRef;constructor(t,e,i,r){this._scrollDispatcher=t,this._viewportRuler=e,this._ngZone=i,this._config=r;}attach(t){this._overlayRef,this._overlayRef=t;}enable(){if(!this._scrollSubscription){let t=this._config?this._config.scrollThrottle:0;this._scrollSubscription=this._scrollDispatcher.scrolled(t).subscribe(()=>{if(this._overlayRef.updatePosition(),this._config&&this._config.autoClose){let e=this._overlayRef.overlayElement.getBoundingClientRect(),{width:i,height:r}=this._viewportRuler.getViewportSize();Si(e,[{width:i,height:r,bottom:r,right:i,top:0,left:0}])&&(this.disable(),this._ngZone.run(()=>this._overlayRef.detach()));}});}}disable(){this._scrollSubscription&&(this._scrollSubscription.unsubscribe(),this._scrollSubscription=null);}detach(){this.disable(),this._overlayRef=null;}},Sr$1=(()=>{class n{_injector=T$2(Ee$4);noop=()=>new Ke;close=e=>wr(this._injector,e);block=()=>Cr$1(this._injector);reposition=e=>et(this._injector,e);static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),Je$1=class Je{positionStrategy;scrollStrategy=new Ke;panelClass="";hasBackdrop=false;backdropClass="cdk-overlay-dark-backdrop";disableAnimations;width;height;minWidth;minHeight;maxWidth;maxHeight;direction;disposeOnNavigation=false;usePopover;eventPredicate;constructor(t){if(t){let e=Object.keys(t);for(let i of e)t[i]!==void 0&&(this[i]=t[i]);}}};var Bt$1=class Bt{connectionPair;scrollableViewProperties;constructor(t,e){this.connectionPair=t,this.scrollableViewProperties=e;}};var Dr=(()=>{class n{_attachedOverlays=[];_document=T$2(dr$3);_isAttached=false;ngOnDestroy(){this.detach();}add(e){this.remove(e),this._attachedOverlays.push(e);}remove(e){let i=this._attachedOverlays.indexOf(e);i>-1&&this._attachedOverlays.splice(i,1),this._attachedOverlays.length===0&&this.detach();}canReceiveEvent(e,i,r){return r.observers.length<1?false:e.eventPredicate?e.eventPredicate(i):true}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),Mr=(()=>{class n extends Dr{_ngZone=T$2(De$3);_renderer=T$2(wr$1).createRenderer(null,null);_cleanupKeydown;add(e){super.add(e),this._isAttached||(this._ngZone.runOutsideAngular(()=>{this._cleanupKeydown=this._renderer.listen("body","keydown",this._keydownListener);}),this._isAttached=true);}detach(){this._isAttached&&(this._cleanupKeydown?.(),this._isAttached=false);}_keydownListener=e=>{let i=this._attachedOverlays;for(let r=i.length-1;r>-1;r--){let o=i[r];if(this.canReceiveEvent(o,e,o._keydownEvents)){this._ngZone.run(()=>o._keydownEvents.next(e));break}}};static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),kr$1=(()=>{class n extends Dr{_platform=T$2(u);_ngZone=T$2(De$3);_renderer=T$2(wr$1).createRenderer(null,null);_cursorOriginalValue;_cursorStyleIsSet=false;_pointerDownEventTarget=null;_cleanups;add(e){if(super.add(e),!this._isAttached){let i=this._document.body,r={capture:true},o=this._renderer;this._cleanups=this._ngZone.runOutsideAngular(()=>[o.listen(i,"pointerdown",this._pointerDownListener,r),o.listen(i,"click",this._clickListener,r),o.listen(i,"auxclick",this._clickListener,r),o.listen(i,"contextmenu",this._clickListener,r)]),this._platform.IOS&&!this._cursorStyleIsSet&&(this._cursorOriginalValue=i.style.cursor,i.style.cursor="pointer",this._cursorStyleIsSet=true),this._isAttached=true;}}detach(){this._isAttached&&(this._cleanups?.forEach(e=>e()),this._cleanups=void 0,this._platform.IOS&&this._cursorStyleIsSet&&(this._document.body.style.cursor=this._cursorOriginalValue,this._cursorStyleIsSet=false),this._isAttached=false);}_pointerDownListener=e=>{this._pointerDownEventTarget=y(e);};_clickListener=e=>{let i=y(e),r=e.type==="click"&&this._pointerDownEventTarget?this._pointerDownEventTarget:i;this._pointerDownEventTarget=null;let o=this._attachedOverlays.slice();for(let s=o.length-1;s>-1;s--){let l=o[s],d=l._outsidePointerEvents;if(!(!l.hasAttached()||!this.canReceiveEvent(l,e,d))){if(gr$1(l.overlayElement,i)||gr$1(l.overlayElement,r))break;this._ngZone?this._ngZone.run(()=>d.next(e)):d.next(e);}}};static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();function gr$1(n,t){let e=typeof ShadowRoot<"u"&&ShadowRoot,i=t;for(;i;){if(i===n)return  true;i=e&&i instanceof ShadowRoot?i.host:i.parentNode;}return  false}var Or=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["ng-component"]],hostAttrs:["cdk-overlay-style-loader",""],decls:0,vars:0,template:function(i,r){},styles:[`.cdk-overlay-container, .cdk-global-overlay-wrapper {
  pointer-events: none;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.cdk-overlay-container {
  position: fixed;
}
@layer cdk-overlay {
  .cdk-overlay-container {
    z-index: 1000;
  }
}
.cdk-overlay-container:empty {
  display: none;
}

.cdk-global-overlay-wrapper {
  display: flex;
  position: absolute;
}
@layer cdk-overlay {
  .cdk-global-overlay-wrapper {
    z-index: 1000;
  }
}

.cdk-overlay-pane {
  position: absolute;
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  max-width: 100%;
  max-height: 100%;
}
@layer cdk-overlay {
  .cdk-overlay-pane {
    z-index: 1000;
  }
}

.cdk-overlay-backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  opacity: 0;
  touch-action: manipulation;
}
@layer cdk-overlay {
  .cdk-overlay-backdrop {
    z-index: 1000;
    transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
  }
}
@media (prefers-reduced-motion) {
  .cdk-overlay-backdrop {
    transition-duration: 1ms;
  }
}

.cdk-overlay-backdrop-showing {
  opacity: 1;
}
@media (forced-colors: active) {
  .cdk-overlay-backdrop-showing {
    opacity: 0.6;
  }
}

@layer cdk-overlay {
  .cdk-overlay-dark-backdrop {
    background: rgba(0, 0, 0, 0.32);
  }
}

.cdk-overlay-transparent-backdrop {
  transition: visibility 1ms linear, opacity 1ms linear;
  visibility: hidden;
  opacity: 1;
}
.cdk-overlay-transparent-backdrop.cdk-overlay-backdrop-showing, .cdk-high-contrast-active .cdk-overlay-transparent-backdrop {
  opacity: 0;
  visibility: visible;
}

.cdk-overlay-backdrop-noop-animation {
  transition: none;
}

.cdk-overlay-connected-position-bounding-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 1px;
  min-height: 1px;
}
@layer cdk-overlay {
  .cdk-overlay-connected-position-bounding-box {
    z-index: 1000;
  }
}

.cdk-global-scrollblock {
  position: fixed;
  width: 100%;
  overflow-y: scroll;
}

.cdk-overlay-popover {
  background: none;
  border: none;
  padding: 0;
  outline: 0;
  overflow: visible;
  position: fixed;
  pointer-events: none;
  white-space: normal;
  color: inherit;
  text-decoration: none;
  width: 100%;
  height: 100%;
  inset: auto;
  top: 0;
  left: 0;
}
.cdk-overlay-popover::backdrop {
  display: none;
}
.cdk-overlay-popover .cdk-overlay-backdrop {
  position: fixed;
  z-index: auto;
}
`],encapsulation:2})}return n})(),Er=(()=>{class n{_platform=T$2(u);_containerElement;_document=T$2(dr$3);_styleLoader=T$2(bi$2);ngOnDestroy(){this._containerElement?.remove();}getContainerElement(){return this._loadStyles(),this._containerElement||this._createContainer(),this._containerElement}_createContainer(){let e="cdk-overlay-container";if(this._platform.isBrowser||Uo$1()){let r=this._document.querySelectorAll(`.${e}[platform="server"], .${e}[platform="test"]`);for(let o=0;o<r.length;o++)r[o].remove();}let i=this._document.createElement("div");i.classList.add(e),Uo$1()?i.setAttribute("platform","test"):this._platform.isBrowser||i.setAttribute("platform","server"),this._document.body.appendChild(i),this._containerElement=i;}_loadStyles(){this._styleLoader.load(Or);}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),Di=class{_renderer;_ngZone;element;_cleanupClick;_cleanupTransitionEnd;_fallbackTimeout;constructor(t,e,i,r){this._renderer=e,this._ngZone=i,this.element=t.createElement("div"),this.element.classList.add("cdk-overlay-backdrop"),this._cleanupClick=e.listen(this.element,"click",r);}detach(){this._ngZone.runOutsideAngular(()=>{let t=this.element;clearTimeout(this._fallbackTimeout),this._cleanupTransitionEnd?.(),this._cleanupTransitionEnd=this._renderer.listen(t,"transitionend",this.dispose),this._fallbackTimeout=setTimeout(this.dispose,500),t.style.pointerEvents="none",t.classList.remove("cdk-overlay-backdrop-showing");});}dispose=()=>{clearTimeout(this._fallbackTimeout),this._cleanupClick?.(),this._cleanupTransitionEnd?.(),this._cleanupClick=this._cleanupTransitionEnd=this._fallbackTimeout=void 0,this.element.remove();}};function Mi(n){return n&&n.nodeType===1}var zt$1=class zt{_portalOutlet;_host;_pane;_config;_ngZone;_keyboardDispatcher;_document;_location;_outsideClickDispatcher;_animationsDisabled;_injector;_renderer;_backdropClick=new ie$1;_attachments=new ie$1;_detachments=new ie$1;_positionStrategy;_scrollStrategy;_locationChanges=G$2.EMPTY;_backdropRef=null;_detachContentMutationObserver;_detachContentAfterRenderRef;_disposed=false;_previousHostParent;_keydownEvents=new ie$1;_outsidePointerEvents=new ie$1;_afterNextRenderRef;constructor(t,e,i,r,o,s,l,d,h,c=false,u,N){this._portalOutlet=t,this._host=e,this._pane=i,this._config=r,this._ngZone=o,this._keyboardDispatcher=s,this._document=l,this._location=d,this._outsideClickDispatcher=h,this._animationsDisabled=c,this._injector=u,this._renderer=N,r.scrollStrategy&&(this._scrollStrategy=r.scrollStrategy,this._scrollStrategy.attach(this)),this._positionStrategy=r.positionStrategy;}get overlayElement(){return this._pane}get backdropElement(){return this._backdropRef?.element||null}get hostElement(){return this._host}get eventPredicate(){return this._config?.eventPredicate||null}attach(t){if(this._disposed)return null;this._attachHost();let e=this._portalOutlet.attach(t);return this._positionStrategy?.attach(this),this._updateStackingOrder(),this._updateElementSize(),this._updateElementDirection(),this._scrollStrategy&&this._scrollStrategy.enable(),this._afterNextRenderRef?.destroy(),this._afterNextRenderRef=sv(()=>{this.hasAttached()&&this.updatePosition();},{injector:this._injector}),this._togglePointerEvents(true),this._config.hasBackdrop&&this._attachBackdrop(),this._config.panelClass&&this._toggleClasses(this._pane,this._config.panelClass,true),this._attachments.next(),this._completeDetachContent(),this._keyboardDispatcher.add(this),this._config.disposeOnNavigation&&(this._locationChanges=this._location.subscribe(()=>this.dispose())),this._outsideClickDispatcher.add(this),typeof e?.onDestroy=="function"&&e.onDestroy(()=>{this.hasAttached()&&this._ngZone.runOutsideAngular(()=>Promise.resolve().then(()=>this.detach()));}),e}detach(){if(!this.hasAttached())return;this.detachBackdrop(),this._togglePointerEvents(false),this._positionStrategy&&this._positionStrategy.detach&&this._positionStrategy.detach(),this._scrollStrategy&&this._scrollStrategy.disable();let t=this._portalOutlet.detach();return this._detachments.next(),this._completeDetachContent(),this._keyboardDispatcher.remove(this),this._detachContentWhenEmpty(),this._locationChanges.unsubscribe(),this._outsideClickDispatcher.remove(this),t}dispose(){if(this._disposed)return;let t=this.hasAttached();this._positionStrategy&&this._positionStrategy.dispose(),this._disposeScrollStrategy(),this._backdropRef?.dispose(),this._locationChanges.unsubscribe(),this._keyboardDispatcher.remove(this),this._portalOutlet.dispose(),this._attachments.complete(),this._backdropClick.complete(),this._keydownEvents.complete(),this._outsidePointerEvents.complete(),this._outsideClickDispatcher.remove(this),this._host?.remove(),this._afterNextRenderRef?.destroy(),this._previousHostParent=this._pane=this._host=this._backdropRef=null,t&&this._detachments.next(),this._detachments.complete(),this._completeDetachContent(),this._disposed=true;}hasAttached(){return this._portalOutlet.hasAttached()}backdropClick(){return this._backdropClick}attachments(){return this._attachments}detachments(){return this._detachments}keydownEvents(){return this._keydownEvents}outsidePointerEvents(){return this._outsidePointerEvents}getConfig(){return this._config}updatePosition(){this._positionStrategy&&this._positionStrategy.apply();}updatePositionStrategy(t){t!==this._positionStrategy&&(this._positionStrategy&&this._positionStrategy.dispose(),this._positionStrategy=t,this.hasAttached()&&(t.attach(this),this.updatePosition()));}updateSize(t){this._config=r(r({},this._config),t),this._updateElementSize();}setDirection(t){this._config=s(r({},this._config),{direction:t}),this._updateElementDirection();}addPanelClass(t){this._pane&&this._toggleClasses(this._pane,t,true);}removePanelClass(t){this._pane&&this._toggleClasses(this._pane,t,false);}getDirection(){let t=this._config.direction;return t?typeof t=="string"?t:t.value:"ltr"}updateScrollStrategy(t){t!==this._scrollStrategy&&(this._disposeScrollStrategy(),this._scrollStrategy=t,this.hasAttached()&&(t.attach(this),t.enable()));}_updateElementDirection(){this._host.setAttribute("dir",this.getDirection());}_updateElementSize(){if(!this._pane)return;let t=this._pane.style;t.width=qo$1(this._config.width),t.height=qo$1(this._config.height),t.minWidth=qo$1(this._config.minWidth),t.minHeight=qo$1(this._config.minHeight),t.maxWidth=qo$1(this._config.maxWidth),t.maxHeight=qo$1(this._config.maxHeight);}_togglePointerEvents(t){this._pane.style.pointerEvents=t?"":"none";}_attachHost(){if(!this._host.parentElement){let t=this._config.usePopover?this._positionStrategy?.getPopoverInsertionPoint?.():null;Mi(t)?t.after(this._host):t?.type==="parent"?t.element.appendChild(this._host):this._previousHostParent?.appendChild(this._host);}if(this._config.usePopover)try{this._host.showPopover();}catch{}}_attachBackdrop(){let t="cdk-overlay-backdrop-showing";this._backdropRef?.dispose(),this._backdropRef=new Di(this._document,this._renderer,this._ngZone,e=>{this._backdropClick.next(e);}),this._animationsDisabled&&this._backdropRef.element.classList.add("cdk-overlay-backdrop-noop-animation"),this._config.backdropClass&&this._toggleClasses(this._backdropRef.element,this._config.backdropClass,true),this._config.usePopover?this._host.prepend(this._backdropRef.element):this._host.parentElement.insertBefore(this._backdropRef.element,this._host),!this._animationsDisabled&&typeof requestAnimationFrame<"u"?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>this._backdropRef?.element.classList.add(t));}):this._backdropRef.element.classList.add(t);}_updateStackingOrder(){!this._config.usePopover&&this._host.nextSibling&&this._host.parentNode.appendChild(this._host);}detachBackdrop(){this._animationsDisabled?(this._backdropRef?.dispose(),this._backdropRef=null):this._backdropRef?.detach();}_toggleClasses(t,e,i){let r=Rt$2(e||[]).filter(o=>!!o);r.length&&(i?t.classList.add(...r):t.classList.remove(...r));}_detachContentWhenEmpty(){let t=false;try{this._detachContentAfterRenderRef=sv(()=>{t=!0,this._detachContent();},{injector:this._injector});}catch(e){if(t)throw e;this._detachContent();}globalThis.MutationObserver&&this._pane&&(this._detachContentMutationObserver||=new globalThis.MutationObserver(()=>{this._detachContent();}),this._detachContentMutationObserver.observe(this._pane,{childList:true}));}_detachContent(){(!this._pane||!this._host||this._pane.children.length===0)&&(this._pane&&this._config.panelClass&&this._toggleClasses(this._pane,this._config.panelClass,false),this._host&&this._host.parentElement&&(this._previousHostParent=this._host.parentElement,this._host.remove()),this._completeDetachContent());}_completeDetachContent(){this._detachContentAfterRenderRef?.destroy(),this._detachContentAfterRenderRef=void 0,this._detachContentMutationObserver?.disconnect();}_disposeScrollStrategy(){let t=this._scrollStrategy;t?.disable(),t?.detach?.();}},_r$1="cdk-overlay-connected-position-bounding-box",cs$1=/([A-Za-z%]+)$/;function ki(n,t){return new jt$2(t,n.get(pe),n.get(dr$3),n.get(u),n.get(Er))}var jt$2=class jt{_viewportRuler;_document;_platform;_overlayContainer;_overlayRef;_isInitialRender=false;_lastBoundingBoxSize={width:0,height:0};_isPushed=false;_canPush=true;_growAfterOpen=false;_hasFlexibleDimensions=true;_positionLocked=false;_originRect;_overlayRect;_viewportRect;_containerRect;_viewportMargin=0;_scrollables=[];_preferredPositions=[];_origin;_pane;_isDisposed=false;_boundingBox=null;_lastPosition=null;_lastScrollVisibility=null;_positionChanges=new ie$1;_resizeSubscription=G$2.EMPTY;_offsetX=0;_offsetY=0;_transformOriginSelector;_appliedPanelClasses=[];_previousPushAmount=null;_popoverLocation="global";positionChanges=this._positionChanges;get positions(){return this._preferredPositions}constructor(t,e,i,r,o){this._viewportRuler=e,this._document=i,this._platform=r,this._overlayContainer=o,this.setOrigin(t);}attach(t){this._overlayRef&&this._overlayRef,this._validatePositions(),t.hostElement.classList.add(_r$1),this._overlayRef=t,this._boundingBox=t.hostElement,this._pane=t.overlayElement,this._isDisposed=false,this._isInitialRender=true,this._lastPosition=null,this._resizeSubscription.unsubscribe(),this._resizeSubscription=this._viewportRuler.change().subscribe(()=>{this._isInitialRender=true,this.apply();});}apply(){if(this._isDisposed||!this._platform.isBrowser)return;if(!this._isInitialRender&&this._positionLocked&&this._lastPosition){this.reapplyLastPosition();return}this._clearPanelClasses(),this._resetOverlayElementStyles(),this._resetBoundingBoxStyles(),this._viewportRect=this._getNarrowedViewportRect(),this._originRect=this._getOriginRect(),this._overlayRect=this._pane.getBoundingClientRect(),this._containerRect=this._getContainerRect();let t=this._originRect,e=this._overlayRect,i=this._viewportRect,r=this._containerRect,o=[],s;for(let l of this._preferredPositions){let d=this._getOriginPoint(t,r,l),h=this._getOverlayPoint(d,e,l),c=this._getOverlayFit(h,e,i,l);if(c.isCompletelyWithinViewport){this._isPushed=false,this._applyPosition(l,d);return}if(this._canFitWithFlexibleDimensions(c,h,i)){o.push({position:l,origin:d,overlayRect:e,boundingBoxRect:this._calculateBoundingBoxRect(d,l)});continue}(!s||s.overlayFit.visibleArea<c.visibleArea)&&(s={overlayFit:c,overlayPoint:h,originPoint:d,position:l,overlayRect:e});}if(o.length){let l=null,d=-1;for(let h of o){let c=h.boundingBoxRect.width*h.boundingBoxRect.height*(h.position.weight||1);c>d&&(d=c,l=h);}this._isPushed=false,this._applyPosition(l.position,l.origin);return}if(this._canPush){this._isPushed=true,this._applyPosition(s.position,s.originPoint);return}this._applyPosition(s.position,s.originPoint);}detach(){this._clearPanelClasses(),this._lastPosition=null,this._previousPushAmount=null,this._resizeSubscription.unsubscribe();}dispose(){this._isDisposed||(this._boundingBox&&be$1(this._boundingBox.style,{top:"",left:"",right:"",bottom:"",height:"",width:"",alignItems:"",justifyContent:""}),this._pane&&this._resetOverlayElementStyles(),this._overlayRef&&this._overlayRef.hostElement.classList.remove(_r$1),this.detach(),this._positionChanges.complete(),this._overlayRef=this._boundingBox=null,this._isDisposed=true);}reapplyLastPosition(){if(this._isDisposed||!this._platform.isBrowser)return;let t=this._lastPosition;t?(this._originRect=this._getOriginRect(),this._overlayRect=this._pane.getBoundingClientRect(),this._viewportRect=this._getNarrowedViewportRect(),this._containerRect=this._getContainerRect(),this._applyPosition(t,this._getOriginPoint(this._originRect,this._containerRect,t))):this.apply();}withScrollableContainers(t){return this._scrollables=t,this}withPositions(t){return this._preferredPositions=t,t.indexOf(this._lastPosition)===-1&&(this._lastPosition=null),this._validatePositions(),this}withViewportMargin(t){return this._viewportMargin=t,this}withFlexibleDimensions(t=true){return this._hasFlexibleDimensions=t,this}withGrowAfterOpen(t=true){return this._growAfterOpen=t,this}withPush(t=true){return this._canPush=t,this}withLockedPosition(t=true){return this._positionLocked=t,this}setOrigin(t){return this._origin=t,this}withDefaultOffsetX(t){return this._offsetX=t,this}withDefaultOffsetY(t){return this._offsetY=t,this}withTransformOriginOn(t){return this._transformOriginSelector=t,this}withPopoverLocation(t){return this._popoverLocation=t,this}getPopoverInsertionPoint(){return this._popoverLocation==="global"?null:this._popoverLocation!=="inline"?this._popoverLocation:this._origin instanceof Mr$2?this._origin.nativeElement:Mi(this._origin)?this._origin:null}_getOriginPoint(t,e,i){let r;if(i.originX=="center")r=t.left+t.width/2;else {let s=this._isRtl()?t.right:t.left,l=this._isRtl()?t.left:t.right;r=i.originX=="start"?s:l;}e.left<0&&(r-=e.left);let o;return i.originY=="center"?o=t.top+t.height/2:o=i.originY=="top"?t.top:t.bottom,e.top<0&&(o-=e.top),{x:r,y:o}}_getOverlayPoint(t,e,i){let r;i.overlayX=="center"?r=-e.width/2:i.overlayX==="start"?r=this._isRtl()?-e.width:0:r=this._isRtl()?0:-e.width;let o;return i.overlayY=="center"?o=-e.height/2:o=i.overlayY=="top"?0:-e.height,{x:t.x+r,y:t.y+o}}_getOverlayFit(t,e,i,r){let o=yr$1(e),{x:s,y:l}=t,d=this._getOffset(r,"x"),h=this._getOffset(r,"y");d&&(s+=d),h&&(l+=h);let c=0-s,u=s+o.width-i.width,N=0-l,z=l+o.height-i.height,L=this._subtractOverflows(o.width,c,u),Y=this._subtractOverflows(o.height,N,z),Vi=L*Y;return {visibleArea:Vi,isCompletelyWithinViewport:o.width*o.height===Vi,fitsInViewportVertically:Y===o.height,fitsInViewportHorizontally:L==o.width}}_canFitWithFlexibleDimensions(t,e,i){if(this._hasFlexibleDimensions){let r=i.bottom-e.y,o=i.right-e.x,s=vr$1(this._overlayRef.getConfig().minHeight),l=vr$1(this._overlayRef.getConfig().minWidth),d=t.fitsInViewportVertically||s!=null&&s<=r,h=t.fitsInViewportHorizontally||l!=null&&l<=o;return d&&h}return  false}_pushOverlayOnScreen(t,e,i){if(this._previousPushAmount&&this._positionLocked)return {x:t.x+this._previousPushAmount.x,y:t.y+this._previousPushAmount.y};let r=yr$1(e),o=this._viewportRect,s=Math.max(t.x+r.width-o.width,0),l=Math.max(t.y+r.height-o.height,0),d=Math.max(o.top-i.top-t.y,0),h=Math.max(o.left-i.left-t.x,0),c=0,u=0;return r.width<=o.width?c=h||-s:c=t.x<this._getViewportMarginStart()?o.left-i.left-t.x:0,r.height<=o.height?u=d||-l:u=t.y<this._getViewportMarginTop()?o.top-i.top-t.y:0,this._previousPushAmount={x:c,y:u},{x:t.x+c,y:t.y+u}}_applyPosition(t,e){if(this._setTransformOrigin(t),this._setOverlayElementStyles(e,t),this._setBoundingBoxStyles(e,t),t.panelClass&&this._addPanelClasses(t.panelClass),this._positionChanges.observers.length){let i=this._getScrollVisibility();if(t!==this._lastPosition||!this._lastScrollVisibility||!hs$1(this._lastScrollVisibility,i)){let r=new Bt$1(t,i);this._positionChanges.next(r);}this._lastScrollVisibility=i;}this._lastPosition=t,this._isInitialRender=false;}_setTransformOrigin(t){if(!this._transformOriginSelector)return;let e=this._boundingBox.querySelectorAll(this._transformOriginSelector),i,r=t.overlayY;t.overlayX==="center"?i="center":this._isRtl()?i=t.overlayX==="start"?"right":"left":i=t.overlayX==="start"?"left":"right";for(let o=0;o<e.length;o++)e[o].style.transformOrigin=`${i} ${r}`;}_calculateBoundingBoxRect(t,e){let i=this._viewportRect,r=this._isRtl(),o,s,l;if(e.overlayY==="top")s=t.y,o=i.height-s+this._getViewportMarginBottom();else if(e.overlayY==="bottom")l=i.height-t.y+this._getViewportMarginTop()+this._getViewportMarginBottom(),o=i.height-l+this._getViewportMarginTop();else {let z=Math.min(i.bottom-t.y+i.top,t.y),L=this._lastBoundingBoxSize.height;o=z*2,s=t.y-z,o>L&&!this._isInitialRender&&!this._growAfterOpen&&(s=t.y-L/2);}let d=e.overlayX==="start"&&!r||e.overlayX==="end"&&r,h=e.overlayX==="end"&&!r||e.overlayX==="start"&&r,c,u,N;if(h)N=i.width-t.x+this._getViewportMarginStart()+this._getViewportMarginEnd(),c=t.x-this._getViewportMarginStart();else if(d)u=t.x,c=i.right-t.x-this._getViewportMarginEnd();else {let z=Math.min(i.right-t.x+i.left,t.x),L=this._lastBoundingBoxSize.width;c=z*2,u=t.x-z,c>L&&!this._isInitialRender&&!this._growAfterOpen&&(u=t.x-L/2);}return {top:s,left:u,bottom:l,right:N,width:c,height:o}}_setBoundingBoxStyles(t,e){let i=this._calculateBoundingBoxRect(t,e);!this._isInitialRender&&!this._growAfterOpen&&(i.height=Math.min(i.height,this._lastBoundingBoxSize.height),i.width=Math.min(i.width,this._lastBoundingBoxSize.width));let r={};if(this._hasExactPosition())r.top=r.left="0",r.bottom=r.right="auto",r.maxHeight=r.maxWidth="",r.width=r.height="100%";else {let o=this._overlayRef.getConfig().maxHeight,s=this._overlayRef.getConfig().maxWidth;r.width=qo$1(i.width),r.height=qo$1(i.height),r.top=qo$1(i.top)||"auto",r.bottom=qo$1(i.bottom)||"auto",r.left=qo$1(i.left)||"auto",r.right=qo$1(i.right)||"auto",e.overlayX==="center"?r.alignItems="center":r.alignItems=e.overlayX==="end"?"flex-end":"flex-start",e.overlayY==="center"?r.justifyContent="center":r.justifyContent=e.overlayY==="bottom"?"flex-end":"flex-start",o&&(r.maxHeight=qo$1(o)),s&&(r.maxWidth=qo$1(s));}this._lastBoundingBoxSize=i,be$1(this._boundingBox.style,r);}_resetBoundingBoxStyles(){be$1(this._boundingBox.style,{top:"0",left:"0",right:"0",bottom:"0",height:"",width:"",alignItems:"",justifyContent:""});}_resetOverlayElementStyles(){be$1(this._pane.style,{top:"",left:"",bottom:"",right:"",position:"",transform:""});}_setOverlayElementStyles(t,e){let i={},r=this._hasExactPosition(),o=this._hasFlexibleDimensions,s=this._overlayRef.getConfig();if(r){let c=this._viewportRuler.getViewportScrollPosition();be$1(i,this._getExactOverlayY(e,t,c)),be$1(i,this._getExactOverlayX(e,t,c));}else i.position="static";let l="",d=this._getOffset(e,"x"),h=this._getOffset(e,"y");d&&(l+=`translateX(${d}px) `),h&&(l+=`translateY(${h}px)`),i.transform=l.trim(),s.maxHeight&&(r?i.maxHeight=qo$1(s.maxHeight):o&&(i.maxHeight="")),s.maxWidth&&(r?i.maxWidth=qo$1(s.maxWidth):o&&(i.maxWidth="")),be$1(this._pane.style,i);}_getExactOverlayY(t,e,i){let r={top:"",bottom:""},o=this._getOverlayPoint(e,this._overlayRect,t);if(this._isPushed&&(o=this._pushOverlayOnScreen(o,this._overlayRect,i)),t.overlayY==="bottom"){let s=this._document.documentElement.clientHeight;r.bottom=`${s-(o.y+this._overlayRect.height)}px`;}else r.top=qo$1(o.y);return r}_getExactOverlayX(t,e,i){let r={left:"",right:""},o=this._getOverlayPoint(e,this._overlayRect,t);this._isPushed&&(o=this._pushOverlayOnScreen(o,this._overlayRect,i));let s;if(this._isRtl()?s=t.overlayX==="end"?"left":"right":s=t.overlayX==="end"?"right":"left",s==="right"){let l=this._document.documentElement.clientWidth;r.right=`${l-(o.x+this._overlayRect.width)}px`;}else r.left=qo$1(o.x);return r}_getScrollVisibility(){let t=this._getOriginRect(),e=this._pane.getBoundingClientRect(),i=this._scrollables.map(r=>r.getElementRef().nativeElement.getBoundingClientRect());return {isOriginClipped:pr$1(t,i),isOriginOutsideView:Si(t,i),isOverlayClipped:pr$1(e,i),isOverlayOutsideView:Si(e,i)}}_subtractOverflows(t,...e){return e.reduce((i,r)=>i-Math.max(r,0),t)}_getNarrowedViewportRect(){let t=this._document.documentElement.clientWidth,e=this._document.documentElement.clientHeight,i=this._viewportRuler.getViewportScrollPosition();return {top:i.top+this._getViewportMarginTop(),left:i.left+this._getViewportMarginStart(),right:i.left+t-this._getViewportMarginEnd(),bottom:i.top+e-this._getViewportMarginBottom(),width:t-this._getViewportMarginStart()-this._getViewportMarginEnd(),height:e-this._getViewportMarginTop()-this._getViewportMarginBottom()}}_isRtl(){return this._overlayRef.getDirection()==="rtl"}_hasExactPosition(){return !this._hasFlexibleDimensions||this._isPushed}_getOffset(t,e){return e==="x"?t.offsetX==null?this._offsetX:t.offsetX:t.offsetY==null?this._offsetY:t.offsetY}_validatePositions(){}_addPanelClasses(t){this._pane&&Rt$2(t).forEach(e=>{e!==""&&this._appliedPanelClasses.indexOf(e)===-1&&(this._appliedPanelClasses.push(e),this._pane.classList.add(e));});}_clearPanelClasses(){this._pane&&(this._appliedPanelClasses.forEach(t=>{this._pane.classList.remove(t);}),this._appliedPanelClasses=[]);}_getViewportMarginStart(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.start??0}_getViewportMarginEnd(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.end??0}_getViewportMarginTop(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.top??0}_getViewportMarginBottom(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.bottom??0}_getOriginRect(){let t=this._origin;if(t instanceof Mr$2)return t.nativeElement.getBoundingClientRect();if(t instanceof Element)return t.getBoundingClientRect();let e=t.width||0,i=t.height||0;return {top:t.y,bottom:t.y+i,left:t.x,right:t.x+e,height:i,width:e}}_getContainerRect(){let t=this._overlayRef.getConfig().usePopover&&this._popoverLocation!=="global",e=this._overlayContainer.getContainerElement();t&&(e.style.display="block");let i=e.getBoundingClientRect();return t&&(e.style.display=""),i}};function be$1(n,t){for(let e in t)t.hasOwnProperty(e)&&(n[e]=t[e]);return n}function vr$1(n){if(typeof n!="number"&&n!=null){let[t,e]=n.split(cs$1);return !e||e==="px"?parseFloat(t):null}return n||null}function yr$1(n){return {top:Math.floor(n.top),right:Math.floor(n.right),bottom:Math.floor(n.bottom),left:Math.floor(n.left),width:Math.floor(n.width),height:Math.floor(n.height)}}function hs$1(n,t){return n===t?true:n.isOriginClipped===t.isOriginClipped&&n.isOriginOutsideView===t.isOriginOutsideView&&n.isOverlayClipped===t.isOverlayClipped&&n.isOverlayOutsideView===t.isOverlayOutsideView}var br$1="cdk-global-overlay-wrapper";function Rr$1(n){return new Ht$1}var Ht$1=class Ht{_overlayRef;_cssPosition="static";_topOffset="";_bottomOffset="";_alignItems="";_xPosition="";_xOffset="";_width="";_height="";_isDisposed=false;attach(t){let e=t.getConfig();this._overlayRef=t,this._width&&!e.width&&t.updateSize({width:this._width}),this._height&&!e.height&&t.updateSize({height:this._height}),t.hostElement.classList.add(br$1),this._isDisposed=false;}top(t=""){return this._bottomOffset="",this._topOffset=t,this._alignItems="flex-start",this}left(t=""){return this._xOffset=t,this._xPosition="left",this}bottom(t=""){return this._topOffset="",this._bottomOffset=t,this._alignItems="flex-end",this}right(t=""){return this._xOffset=t,this._xPosition="right",this}start(t=""){return this._xOffset=t,this._xPosition="start",this}end(t=""){return this._xOffset=t,this._xPosition="end",this}width(t=""){return this._overlayRef?this._overlayRef.updateSize({width:t}):this._width=t,this}height(t=""){return this._overlayRef?this._overlayRef.updateSize({height:t}):this._height=t,this}centerHorizontally(t=""){return this.left(t),this._xPosition="center",this}centerVertically(t=""){return this.top(t),this._alignItems="center",this}apply(){if(!this._overlayRef||!this._overlayRef.hasAttached())return;let t=this._overlayRef.overlayElement.style,e=this._overlayRef.hostElement.style,i=this._overlayRef.getConfig(),{width:r,height:o,maxWidth:s,maxHeight:l}=i,d=(r==="100%"||r==="100vw")&&(!s||s==="100%"||s==="100vw"),h=(o==="100%"||o==="100vh")&&(!l||l==="100%"||l==="100vh"),c=this._xPosition,u=this._xOffset,N=this._overlayRef.getConfig().direction==="rtl",z="",L="",Y="";d?Y="flex-start":c==="center"?(Y="center",N?L=u:z=u):N?c==="left"||c==="end"?(Y="flex-end",z=u):(c==="right"||c==="start")&&(Y="flex-start",L=u):c==="left"||c==="start"?(Y="flex-start",z=u):(c==="right"||c==="end")&&(Y="flex-end",L=u),t.position=this._cssPosition,t.marginLeft=d?"0":z,t.marginTop=h?"0":this._topOffset,t.marginBottom=this._bottomOffset,t.marginRight=d?"0":L,e.justifyContent=Y,e.alignItems=h?"flex-start":this._alignItems;}dispose(){if(this._isDisposed||!this._overlayRef)return;let t=this._overlayRef.overlayElement.style,e=this._overlayRef.hostElement,i=e.style;e.classList.remove(br$1),i.justifyContent=i.alignItems=t.marginTop=t.marginBottom=t.marginLeft=t.marginRight=t.position="",this._overlayRef=null,this._isDisposed=true;}},Fr=(()=>{class n{_injector=T$2(Ee$4);global(){return Rr$1()}flexibleConnectedTo(e){return ki(this._injector,e)}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),tt=new N$3("OVERLAY_DEFAULT_CONFIG");function Oi(n,t){n.get(bi$2).load(Or);let e=n.get(Er),i=n.get(dr$3),r=n.get(Pt$1),o=n.get(Rr$3),s=n.get(Ri$1),l=n.get(hI,null,{optional:true})||n.get(wr$1).createRenderer(null,null),d=new Je$1(t),h=n.get(tt,null,{optional:true})?.usePopover??true;d.direction=d.direction||s.value,"showPopover"in i.body?d.usePopover=t?.usePopover??h:d.usePopover=false;let c=i.createElement("div"),u=i.createElement("div");c.id=r.getId("cdk-overlay-"),c.classList.add("cdk-overlay-pane"),u.appendChild(c),d.usePopover&&(u.setAttribute("popover","manual"),u.classList.add("cdk-overlay-popover"));let N=d.usePopover?d.positionStrategy?.getPopoverInsertionPoint?.():null;return Mi(N)?N.after(u):N?.type==="parent"?N.element.appendChild(u):e.getContainerElement().appendChild(u),new zt$1(new It$1(c,o,n),u,c,d,n.get(De$3),n.get(Mr),i,n.get(vn$1),n.get(kr$1),t?.disableAnimations??n.get(fm$1,null,{optional:true})==="NoopAnimations",n.get(se),l)}var Vr=(()=>{class n{scrollStrategies=T$2(Sr$1);_positionBuilder=T$2(Fr);_injector=T$2(Ee$4);create(e){return Oi(this._injector,e)}position(){return this._positionBuilder}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})(),us$1=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"}],fs$1=new N$3("cdk-connected-overlay-scroll-strategy",{providedIn:"root",factory:()=>{let n=T$2(Ee$4);return ()=>et(n)}}),Ae$1=(()=>{class n{elementRef=T$2(Mr$2);static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["","cdk-overlay-origin",""],["","overlay-origin",""],["","cdkOverlayOrigin",""]],exportAs:["cdkOverlayOrigin"]})}return n})(),Ar=new N$3("cdk-connected-overlay-default-config"),Wt$1=(()=>{class n{_dir=T$2(Ri$1,{optional:true});_injector=T$2(Ee$4);_overlayRef;_templatePortal;_backdropSubscription=G$2.EMPTY;_attachSubscription=G$2.EMPTY;_detachSubscription=G$2.EMPTY;_positionSubscription=G$2.EMPTY;_offsetX;_offsetY;_position;_scrollStrategyFactory=T$2(fs$1);_ngZone=T$2(De$3);origin;positions;positionStrategy;get offsetX(){return this._offsetX}set offsetX(e){this._offsetX=e,this._position&&this._updatePositionStrategy(this._position);}get offsetY(){return this._offsetY}set offsetY(e){this._offsetY=e,this._position&&this._updatePositionStrategy(this._position);}width;height;minWidth;minHeight;backdropClass;panelClass;viewportMargin=0;scrollStrategy;open=false;disableClose=false;transformOriginSelector;hasBackdrop=false;lockPosition=false;flexibleDimensions=false;growAfterOpen=false;push=false;disposeOnNavigation=false;usePopover;matchWidth=false;set _config(e){typeof e!="string"&&this._assignConfig(e);}backdropClick=new We$3;positionChange=new We$3;attach=new We$3;detach=new We$3;overlayKeydown=new We$3;overlayOutsideClick=new We$3;constructor(){let e=T$2(Dr$2),i=T$2(xi$2),r=T$2(Ar,{optional:true}),o=T$2(tt,{optional:true});this.usePopover=o?.usePopover===false?null:"global",this._templatePortal=new Qe$1(e,i),this.scrollStrategy=this._scrollStrategyFactory(),r&&this._assignConfig(r);}get overlayRef(){return this._overlayRef}get dir(){return this._dir?this._dir.value:"ltr"}ngOnDestroy(){this._attachSubscription.unsubscribe(),this._detachSubscription.unsubscribe(),this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this._overlayRef?.dispose();}ngOnChanges(e){this._position&&(this._updatePositionStrategy(this._position),this._overlayRef?.updateSize({width:this._getWidth(),minWidth:this.minWidth,height:this.height,minHeight:this.minHeight}),e.origin&&this.open&&this._position.apply()),e.open&&(this.open?this.attachOverlay():this.detachOverlay());}_createOverlay(){(!this.positions||!this.positions.length)&&(this.positions=us$1);let e=this._overlayRef=Oi(this._injector,this._buildConfig());this._attachSubscription=e.attachments().subscribe(()=>this.attach.emit()),this._detachSubscription=e.detachments().subscribe(()=>this.detach.emit()),e.keydownEvents().subscribe(i=>{this.overlayKeydown.next(i),i.keyCode===27&&!this.disableClose&&!Ue$1(i)&&(i.preventDefault(),this.detachOverlay());}),this._overlayRef.outsidePointerEvents().subscribe(i=>{let r=this._getOriginElement(),o=y(i);(!r||r!==o&&!r.contains(o))&&this.overlayOutsideClick.next(i);});}_buildConfig(){let e=this._position=this.positionStrategy||this._createPositionStrategy(),i=new Je$1({direction:this._dir||"ltr",positionStrategy:e,scrollStrategy:this.scrollStrategy,hasBackdrop:this.hasBackdrop,disposeOnNavigation:this.disposeOnNavigation,usePopover:!!this.usePopover});return (this.height||this.height===0)&&(i.height=this.height),(this.minWidth||this.minWidth===0)&&(i.minWidth=this.minWidth),(this.minHeight||this.minHeight===0)&&(i.minHeight=this.minHeight),this.backdropClass&&(i.backdropClass=this.backdropClass),this.panelClass&&(i.panelClass=this.panelClass),i}_updatePositionStrategy(e){let i=this.positions.map(r=>({originX:r.originX,originY:r.originY,overlayX:r.overlayX,overlayY:r.overlayY,offsetX:r.offsetX||this.offsetX,offsetY:r.offsetY||this.offsetY,panelClass:r.panelClass||void 0}));return e.setOrigin(this._getOrigin()).withPositions(i).withFlexibleDimensions(this.flexibleDimensions).withPush(this.push).withGrowAfterOpen(this.growAfterOpen).withViewportMargin(this.viewportMargin).withLockedPosition(this.lockPosition).withTransformOriginOn(this.transformOriginSelector).withPopoverLocation(this.usePopover===null?"global":this.usePopover)}_createPositionStrategy(){let e=ki(this._injector,this._getOrigin());return this._updatePositionStrategy(e),e}_getOrigin(){return this.origin instanceof Ae$1?this.origin.elementRef:this.origin}_getOriginElement(){return this.origin instanceof Ae$1?this.origin.elementRef.nativeElement:this.origin instanceof Mr$2?this.origin.nativeElement:typeof Element<"u"&&this.origin instanceof Element?this.origin:null}_getWidth(){return this.width?this.width:this.matchWidth?this._getOriginElement()?.getBoundingClientRect?.().width:void 0}attachOverlay(){this._overlayRef||this._createOverlay();let e=this._overlayRef;e.getConfig().hasBackdrop=this.hasBackdrop,e.updateSize({width:this._getWidth()}),e.hasAttached()||e.attach(this._templatePortal),this.hasBackdrop?this._backdropSubscription=e.backdropClick().subscribe(i=>this.backdropClick.emit(i)):this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this.positionChange.observers.length>0&&(this._positionSubscription=this._position.positionChanges.pipe(Ng(()=>this.positionChange.observers.length>0)).subscribe(i=>{this._ngZone.run(()=>this.positionChange.emit(i)),this.positionChange.observers.length===0&&this._positionSubscription.unsubscribe();})),this.open=true;}detachOverlay(){this._overlayRef?.detach(),this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this.open=false;}_assignConfig(e){this.origin=e.origin??this.origin,this.positions=e.positions??this.positions,this.positionStrategy=e.positionStrategy??this.positionStrategy,this.offsetX=e.offsetX??this.offsetX,this.offsetY=e.offsetY??this.offsetY,this.width=e.width??this.width,this.height=e.height??this.height,this.minWidth=e.minWidth??this.minWidth,this.minHeight=e.minHeight??this.minHeight,this.backdropClass=e.backdropClass??this.backdropClass,this.panelClass=e.panelClass??this.panelClass,this.viewportMargin=e.viewportMargin??this.viewportMargin,this.scrollStrategy=e.scrollStrategy??this.scrollStrategy,this.disableClose=e.disableClose??this.disableClose,this.transformOriginSelector=e.transformOriginSelector??this.transformOriginSelector,this.hasBackdrop=e.hasBackdrop??this.hasBackdrop,this.lockPosition=e.lockPosition??this.lockPosition,this.flexibleDimensions=e.flexibleDimensions??this.flexibleDimensions,this.growAfterOpen=e.growAfterOpen??this.growAfterOpen,this.push=e.push??this.push,this.disposeOnNavigation=e.disposeOnNavigation??this.disposeOnNavigation,this.usePopover=e.usePopover??this.usePopover,this.matchWidth=e.matchWidth??this.matchWidth;}static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["","cdk-connected-overlay",""],["","connected-overlay",""],["","cdkConnectedOverlay",""]],inputs:{origin:[0,"cdkConnectedOverlayOrigin","origin"],positions:[0,"cdkConnectedOverlayPositions","positions"],positionStrategy:[0,"cdkConnectedOverlayPositionStrategy","positionStrategy"],offsetX:[0,"cdkConnectedOverlayOffsetX","offsetX"],offsetY:[0,"cdkConnectedOverlayOffsetY","offsetY"],width:[0,"cdkConnectedOverlayWidth","width"],height:[0,"cdkConnectedOverlayHeight","height"],minWidth:[0,"cdkConnectedOverlayMinWidth","minWidth"],minHeight:[0,"cdkConnectedOverlayMinHeight","minHeight"],backdropClass:[0,"cdkConnectedOverlayBackdropClass","backdropClass"],panelClass:[0,"cdkConnectedOverlayPanelClass","panelClass"],viewportMargin:[0,"cdkConnectedOverlayViewportMargin","viewportMargin"],scrollStrategy:[0,"cdkConnectedOverlayScrollStrategy","scrollStrategy"],open:[0,"cdkConnectedOverlayOpen","open"],disableClose:[0,"cdkConnectedOverlayDisableClose","disableClose"],transformOriginSelector:[0,"cdkConnectedOverlayTransformOriginOn","transformOriginSelector"],hasBackdrop:[2,"cdkConnectedOverlayHasBackdrop","hasBackdrop",WF],lockPosition:[2,"cdkConnectedOverlayLockPosition","lockPosition",WF],flexibleDimensions:[2,"cdkConnectedOverlayFlexibleDimensions","flexibleDimensions",WF],growAfterOpen:[2,"cdkConnectedOverlayGrowAfterOpen","growAfterOpen",WF],push:[2,"cdkConnectedOverlayPush","push",WF],disposeOnNavigation:[2,"cdkConnectedOverlayDisposeOnNavigation","disposeOnNavigation",WF],usePopover:[0,"cdkConnectedOverlayUsePopover","usePopover"],matchWidth:[2,"cdkConnectedOverlayMatchWidth","matchWidth",WF],_config:[0,"cdkConnectedOverlay","_config"]},outputs:{backdropClick:"backdropClick",positionChange:"positionChange",attach:"attach",detach:"detach",overlayKeydown:"overlayKeydown",overlayOutsideClick:"overlayOutsideClick"},exportAs:["cdkConnectedOverlay"],features:[xm$1]})}return n})(),Ei=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({providers:[Vr],imports:[er$3,fr$1,bi,bi]})}return n})();var Pr=(()=>{class n{isErrorState(e,i){return !!(e&&e.invalid&&(e.touched||i&&i.submitted))}static \u0275fac=function(i){return new(i||n)};static \u0275prov=_r$3({token:n,factory:n.\u0275fac})}return n})();var Gt$1=class Gt{_defaultMatcher;ngControl;_parentFormGroup;_parentForm;_stateChanges;errorState=false;matcher;constructor(t,e,i,r,o){this._defaultMatcher=t,this.ngControl=e,this._parentFormGroup=i,this._parentForm=r,this._stateChanges=o;}updateErrorState(){let t=this.errorState,e=this._parentFormGroup||this._parentForm,i=this.matcher||this._defaultMatcher,r=this.ngControl?this.ngControl.control:null,o=i?.isErrorState(r,e)??false;o!==t&&(this.errorState=o,this._stateChanges.next());}};var Ir=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[er$3]})}return n})();var Ri=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[tn$1,Ir,Pt,er$3]})}return n})();var _s$1=["trigger"],vs$1=["panel"],ys$1=[[["mat-select-trigger"]],"*"],bs$1=["mat-select-trigger","*"];function xs$1(n,t){if(n&1&&(yi$2(0,"span",4),JD(1),Uc$1()),n&2){let e=wD();xv(),nh$1(e.placeholder);}}function Cs$1(n,t){n&1&&bD(0);}function ws$1(n,t){if(n&1&&(yi$2(0,"span",11),JD(1),Uc$1()),n&2){let e=wD(2);xv(),nh$1(e.triggerValue);}}function Ss$1(n,t){if(n&1&&(yi$2(0,"span",5),rD(1,Cs$1,1,0)(2,ws$1,2,1,"span",11),Uc$1()),n&2){let e=wD();xv(),oD(e.customTrigger?1:2);}}function Ds$1(n,t){if(n&1){let e=hD();yi$2(0,"div",12,1),Hp("keydown",function(r){mu(e);let o=wD();return yu(o._handleKeydown(r))}),bD(2,1),Uc$1();}if(n&2){let e=wD();BD(e.panelClass),Zp("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),Rp("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Ms$1=new N$3("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let n=T$2(Ee$4);return ()=>et(n)}}),ks$1=new N$3("MAT_SELECT_CONFIG"),Lr=new N$3("MatSelectTrigger"),Fi=class{source;value;constructor(t,e){this.source=t,this.value=e;}},tc$1=(()=>{class n{_viewportRuler=T$2(pe);_changeDetectorRef=T$2($F);_elementRef=T$2(Mr$2);_dir=T$2(Ri$1,{optional:true});_idGenerator=T$2(Pt$1);_renderer=T$2(hI);_parentFormField=T$2(Ft,{optional:true});ngControl=T$2(me,{self:true,optional:true});_liveAnnouncer=T$2(gn$1);_defaultOptions=T$2(ks$1,{optional:true});_animationsDisabled=K();_popoverLocation;_initialized=new ie$1;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let i=this.options.toArray()[e];if(i){let r=this.panel.nativeElement,o=hr$1(e,this.options,this.optionGroups),s=i._getHostElement();e===0&&o===1?r.scrollTop=0:r.scrollTop=ur$1(s.offsetTop,s.offsetHeight,r.scrollTop,r.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new Fi(this,e)}_scrollStrategyFactory=T$2(Ms$1);_panelOpen=false;_compareWith=(e,i)=>e===i;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ie$1;_errorStateTracker;stateChanges=new ie$1;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=Ho$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(qe.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=ng(()=>{let e=this.options;return e?e.changes.pipe(_g(e),Mg(()=>dg(...e.map(i=>i.onSelectionChange)))):this._initialized.pipe(Mg(()=>this.optionSelectionChanges))});openedChange=new We$3;_openedStream=this.openedChange.pipe(qn$3(e=>e),le$1(()=>{}));_closedStream=this.openedChange.pipe(qn$3(e=>!e),le$1(()=>{}));selectionChange=new We$3;valueChange=new We$3;constructor(){let e=T$2(Pr),i=T$2(hi,{optional:true}),r=T$2(ui,{optional:true}),o=T$2(new hh$1("tabindex"),{optional:true}),s=T$2(tt,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new Gt$1(e,this.ngControl,r,i,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=o==null?0:parseInt(o)||0,this._popoverLocation=s?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new Ye$2(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(Sg(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(Sg(this._destroy)).subscribe(e=>{e.added.forEach(i=>i.select()),e.removed.forEach(i=>i.deselect());}),this.options.changes.pipe(_g(null),Sg(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),i=this.ngControl;if(e!==this._triggerAriaLabelledBy){let r=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?r.setAttribute("aria-labelledby",e):r.removeAttribute("aria-labelledby");}i&&(this._previousControl!==i.control&&(this._previousControl!==void 0&&i.disabled!==null&&i.disabled!==this.disabled&&(this.disabled=i.disabled),this._previousControl=i.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(dn$2(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{i(),clearTimeout(r),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,i=this._renderer.listen(e,"animationend",o=>{o.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),r=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(i=>i.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let i=e.keyCode,r=i===40||i===38||i===37||i===39,o=i===13||i===32,s=this._keyManager;if(!s.isTyping()&&o&&!Ue$1(e)||(this.multiple||e.altKey)&&r)e.preventDefault(),this.open();else if(!this.multiple){let l=this.selected;s.onKeydown(e);let d=this.selected;d&&l!==d&&this._liveAnnouncer.announce(d.viewValue,1e4);}}_handleOpenKeydown(e){let i=this._keyManager,r=e.keyCode,o=r===40||r===38,s=i.isTyping();if(o&&e.altKey)e.preventDefault(),this.close();else if(!s&&(r===13||r===32)&&i.activeItem&&!Ue$1(e))e.preventDefault(),i.activeItem._selectViaInteraction();else if(!s&&this._multiple&&r===65&&e.ctrlKey){e.preventDefault();let l=this.options.some(d=>!d.disabled&&!d.selected);this.options.forEach(d=>{d.disabled||(l?d.select():d.deselect());});}else {let l=i.activeItemIndex;i.onKeydown(e),this._multiple&&o&&e.shiftKey&&i.activeItem&&i.activeItemIndex!==l&&i.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!Ue$1(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(i=>i.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(i=>this._selectOptionByValue(i)),this._sortValues();else {let i=this._selectOptionByValue(e);i?this._keyManager.updateActiveItem(i):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let i=this.options.find(r=>{if(this._selectionModel.isSelected(r))return  false;try{return (r.value!=null||this.canSelectNullableOptions)&&this._compareWith(r.value,e)}catch{return  false}});return i&&this._selectionModel.select(i),i}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof Ae$1?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new Lt$2(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=dg(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(Sg(e)).subscribe(i=>{this._onSelect(i.source,i.isUserInput),i.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),dg(...this.options.map(i=>i._stateChanges)).pipe(Sg(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,i){let r=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(r!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),i&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),i&&this.focus())),r!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((i,r)=>this.sortComparator?this.sortComparator(i,r,e):e.indexOf(i)-e.indexOf(r)),this.stateChanges.next();}}_propagateChanges(e){let i;this.multiple?i=this.selected.map(r=>r.value):i=this.selected?this.selected.value:e,this._value=i,this.valueChange.emit(i),this._onChange(i),this.selectionChange.emit(this._getChangeEvent(i)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let i=0;i<this.options.length;i++)if(!this.options.get(i).disabled){e=i;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,i=e?e+" ":"";return this.ariaLabelledby?i+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let i=this._elementRef.nativeElement;e.length?i.setAttribute("aria-describedby",e.join(" ")):i.removeAttribute("aria-describedby");}onContainerClick(e){let i=y(e);i&&(i.tagName==="MAT-OPTION"||i.classList.contains("cdk-overlay-backdrop")||i.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=cE({type:n,selectors:[["mat-select"]],contentQueries:function(i,r,o){if(i&1&&$p(o,Lr,5)(o,Pt,5)(o,yi,5),i&2){let s;MD(s=SD())&&(r.customTrigger=s.first),MD(s=SD())&&(r.options=s),MD(s=SD())&&(r.optionGroups=s);}},viewQuery:function(i,r){if(i&1&&Up(_s$1,5)(vs$1,5)(Wt$1,5),i&2){let o;MD(o=SD())&&(r.trigger=o.first),MD(o=SD())&&(r.panel=o.first),MD(o=SD())&&(r._overlayDir=o.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(i,r){i&1&&Hp("keydown",function(s){return r._handleKeydown(s)})("focus",function(){return r._onFocus()})("blur",function(){return r._onBlur()}),i&2&&(Rp("id",r.id)("tabindex",r.disabled?-1:r.tabIndex)("aria-controls",r.panelOpen?r.id+"-panel":null)("aria-expanded",r.panelOpen)("aria-label",r.ariaLabel||null)("aria-required",r.required.toString())("aria-disabled",r.disabled.toString())("aria-invalid",r.errorState)("aria-activedescendant",r._getAriaActiveDescendant()),Zp("mat-mdc-select-disabled",r.disabled)("mat-mdc-select-invalid",r.errorState)("mat-mdc-select-required",r.required)("mat-mdc-select-empty",r.empty)("mat-mdc-select-multiple",r.multiple)("mat-select-open",r.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",WF],disableRipple:[2,"disableRipple","disableRipple",WF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:qF(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",WF],placeholder:"placeholder",required:[2,"required","required",WF],multiple:[2,"multiple","multiple",WF],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",WF],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",qF],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",WF]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[cw([{provide:Rt$1,useExisting:n},{provide:vi,useExisting:n}]),xm$1],ngContentSelectors:bs$1,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(i,r){if(i&1&&(CD(ys$1),yi$2(0,"div",2,0),Hp("click",function(){return r.open()}),yi$2(3,"div",3),rD(4,xs$1,2,1,"span",4)(5,Ss$1,3,1,"span",5),Uc$1(),yi$2(6,"div",6)(7,"div",7),Su(),yi$2(8,"svg",8),Op(9,"path",9),Uc$1()()()(),Ep(10,Ds$1,3,16,"ng-template",10),Hp("detach",function(){return r.close()})("backdropClick",function(){return r.close()})("overlayKeydown",function(s){return r._handleOverlayKeydown(s)})),i&2){let o=xD(1);xv(3),Rp("id",r._valueId),xv(),oD(r.empty?4:5),xv(6),kp("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",r._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",r._scrollStrategy)("cdkConnectedOverlayOrigin",r._preferredOverlayOrigin||o)("cdkConnectedOverlayPositions",r._positions)("cdkConnectedOverlayWidth",r._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",r._popoverLocation);}},dependencies:[Ae$1,Wt$1],styles:[`@keyframes _mat-select-enter {
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
`],encapsulation:2})}return n})(),ic$1=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275dir=pE({type:n,selectors:[["mat-select-trigger"]],features:[cw([{provide:Lr,useExisting:n}])]})}return n})(),nc$1=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=uE({type:n});static \u0275inj=zl$1({imports:[Ei,Ri,er$3,Xe$2,dr$1,Ri]})}return n})();function Br(n){return typeof n.x!="number"||typeof n.y!="number"?null:n.resourceActor===2?n.targetID??null:n.sourceID??null}var pc$1=-Math.PI/2,zr=1/100,Os$1=1/1e3,Ut$1=5;function Es$1(n){let t=new Map;for(let i of n){let r=Br(i);if(r==null)continue;let o=t.get(r);o||(o=[],t.set(r,o)),o.push({t:i.atS,x:i.x*zr,y:i.y*zr,facing:typeof i.facing=="number"?i.facing*Os$1:void 0,mapID:typeof i.mapID=="number"?i.mapID:void 0});}let e=new Map;for(let[i,r]of t)r.sort((o,s)=>o.t-s.t),e.set(i,{id:i,samples:r});return e}function Rs$1(n){let t=new Map;for(let e of n.parses)for(let i of e.enemies){if(i.game_id==null)continue;let r=t.get(i.game_id);r?i.is_boss&&(r.isBoss=true):t.set(i.game_id,{gameId:i.game_id,name:i.name,isBoss:i.is_boss});}return [...t.values()].sort((e,i)=>(i.isBoss?1:0)-(e.isBoss?1:0))}function Fs$1(n,t){let e=new Map;for(let o of t)o.gameID!=null&&e.set(o.gameID,o.id);let i=Rs$1(n).find(o=>o.isBoss)?.gameId;return {bossActorId:i!=null?e.get(i)??null:null,refActorByGameId:e}}function Vs$1(n){let{positions:t,events:e,playerId:i,enemies:r}=n,{bossActorId:o,refActorByGameId:s}=Fs$1(t,r),l=Es$1(e);return l.get(i)?.samples.length?{timelines:l,playerId:i,bossActorId:o,refActorByGameId:s}:null}var gc$1=(()=>{class n{source=T$2(ct);injector=T$2(Ee$4);positions=Ho$1(null);live=Ho$1(null);error=Ho$1(null);overlayLoading=Ho$1(false);pendingOverlay=null;overlayLoaded=false;prepareSeq=0;open=Ho$1(false);anchorTime=Ho$1(0);reference=Ho$1({kind:"boss"});preS=Ho$1(Ut$1);postS=Ho$1(Ut$1);ready=Iw(()=>!!this.positions());async loadBench(e,i){let r=await this.source.getBench(e,i);return this._applyBench(r),r}_applyBench(e){this.live.set(null),e.ok?(this.positions.set(e.value),this.error.set(null)):(e.error.kind==="permanent"&&a(e.error.id,e.error.context),this.positions.set(null),this.error.set(e.error.kind==="missing"?null:e.error));}async prepare(e,i,r,o,s){let l=++this.prepareSeq;if(this.live.set(null),this._resetOverlay(),!i?.encounterID){this.positions.set(null),this.error.set(null);return}let d=await this.source.getBench(o,i.encounterID);l===this.prepareSeq&&(this._applyBench(d),d.ok&&(this.pendingOverlay={reportCode:e,fight:i,playerId:r,positions:d.value,enemies:s,seq:l},this.open()&&await this.ensureLiveOverlay()));}openAt(e){this.anchorTime.set(e.timeS),this.reference.set(e.reference??{kind:"boss"});let i=(e.windowLengthS??0)>0;this.preS.set(i?0:Ut$1),this.postS.set(i?e.windowLengthS:Ut$1),this.open.set(true),this.ensureLiveOverlay();}close(){this.open.set(false);}clear(){this.open.set(false),this.positions.set(null),this.live.set(null),this.error.set(null),this._resetOverlay();}_resetOverlay(){this.pendingOverlay=null,this.overlayLoaded=false,this.overlayLoading.set(false);}async ensureLiveOverlay(){let e=this.pendingOverlay;if(!(!e||this.overlayLoaded||this.overlayLoading())){this.overlayLoading.set(true);try{let{reportCode:i,fight:r,playerId:o,positions:s,enemies:l}=e,d=await this.fetchLiveEvents(i,r,o);if(e.seq!==this.prepareSeq)return;let h=Vs$1({positions:s,events:S$2(d,r.startTime),playerId:o,enemies:l});if(this.live.set(h),h)this.error.set(null);else {let c=X$1("No position data for you in this pull.","map.no-player-positions");!c.ok&&c.error.kind==="permanent"&&(a(c.error.id,c.error.context),this.error.set(c.error));}this.overlayLoaded=!0;}catch(i){let r=et$1(i,"map.overlay");a(`MapFeatureService.ensureLiveOverlay ${e.reportCode}:${e.fight.id}`,i),this.live.set(null),this.error.set(!r.ok&&r.error.kind!=="missing"?r.error:null);}finally{this.overlayLoading.set(false);}}}async fetchLiveEvents(e,i,r){let{id:o,startTime:s,endTime:l}=i,d=this.injector.get(_r$2),[h,c]=await Promise.all([d.getAllEvents(e,o,"Casts",s,l,r,true),d.getAllEvents(e,o,"Casts",s,l,void 0,true,"Enemies")]);return [...h,...c]}static \u0275fac=function(i){return new(i||n)};static \u0275prov=re$2({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function Qe(e){e||(e=T$2(Ve$4));let i=new x(t=>{if(e.destroyed){t.next();return}return e.onDestroy(t.next.bind(t))});return t=>t.pipe(Sg(i))}function Xe$1(e,i){let t=T$2(Ee$4),r=new $n$3(1),n=Vu(()=>{let a;try{a=e();}catch(C){Ew(()=>r.error(C));return}Ew(()=>r.next(a));},{injector:t,manualCleanup:true});return t.get(Ve$4).onDestroy(()=>{n.destroy(),r.complete();}),r.asObservable()}function Ye$1(e,i){let r=!i?.manualCleanup?i?.injector?.get(Ve$4)??T$2(Ve$4):null,n=Ce$1(i?.equal),a;i?.requireSync?a=Ho$1({kind:0},{equal:n}):a=Ho$1({kind:1,value:i?.initialValue},{equal:n});let C,L=e.subscribe({next:v=>a.set({kind:1,value:v}),error:v=>{a.set({kind:2,error:v}),C?.();},complete:()=>{C?.();}});if(i?.requireSync&&a().kind===0)throw new M$2(601,false);return C=r?.onDestroy(L.unsubscribe.bind(L)),Iw(()=>{let v=a();switch(v.kind){case 1:return v.value;case 2:throw v.error;case 0:throw new M$2(601,false)}},{equal:i?.equal})}function Ce$1(e=Object.is){return (i,t)=>i.kind===1&&t.kind===1&&e(i.value,t.value)}var Me=["*"];var we=new N$3("MAT_CARD_CONFIG"),mt=(()=>{class e{appearance;constructor(){let t=T$2(we,{optional:true});this.appearance=t?.appearance||"raised";}static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["mat-card"]],hostAttrs:[1,"mat-mdc-card","mdc-card"],hostVars:8,hostBindings:function(r,n){r&2&&Zp("mat-mdc-card-outlined",n.appearance==="outlined")("mdc-card--outlined",n.appearance==="outlined")("mat-mdc-card-filled",n.appearance==="filled")("mdc-card--filled",n.appearance==="filled");},inputs:{appearance:"appearance"},exportAs:["matCard"],ngContentSelectors:Me,decls:1,vars:0,template:function(r,n){r&1&&(CD(),bD(0));},styles:[`.mat-mdc-card {
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
`],encapsulation:2})}return e})();var lt=(()=>{class e{static \u0275fac=function(r){return new(r||e)};static \u0275mod=uE({type:e});static \u0275inj=zl$1({imports:[er$3]})}return e})();var De=["determinateSpinner"];function Se(e,i){if(e&1&&(Su(),yi$2(0,"svg",11),Op(1,"circle",12),Uc$1()),e&2){let t=wD();Rp("viewBox",t._viewBox()),xv(),Qp("stroke-dasharray",t._strokeCircumference(),"px")("stroke-dashoffset",t._strokeCircumference()/2,"px")("stroke-width",t._circleStrokeWidth(),"%"),Rp("r",t._circleRadius());}}var ke=new N$3("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:fe})}),fe=100,Ie$1=10,ve=(()=>{class e{_elementRef=T$2(Mr$2);_noopAnimations;get color(){return this._color||this._defaultColor}set color(t){this._color=t;}_color;_defaultColor="primary";_determinateCircle;constructor(){let t=T$2(ke),r=In$1(),n=this._elementRef.nativeElement;this._noopAnimations=r==="di-disabled"&&!!t&&!t._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&r==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),t&&(t.color&&(this.color=this._defaultColor=t.color),t.diameter&&(this.diameter=t.diameter),t.strokeWidth&&(this.strokeWidth=t.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(t){this._value=Math.max(0,Math.min(100,t||0));}_value=0;get diameter(){return this._diameter}set diameter(t){this._diameter=t||0;}_diameter=fe;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(t){this._strokeWidth=t||0;}_strokeWidth;_circleRadius(){return (this.diameter-Ie$1)/2}_viewBox(){let t=this._circleRadius()*2+this.strokeWidth;return `0 0 ${t} ${t}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(r,n){if(r&1&&Up(De,5),r&2){let a;MD(a=SD())&&(n._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(r,n){r&2&&(Rp("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),BD("mat-"+n.color),Qp("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),Zp("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",qF],diameter:[2,"diameter","diameter",qF],strokeWidth:[2,"strokeWidth","strokeWidth",qF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(r,n){if(r&1&&(Ep(0,Se,2,8,"ng-template",null,0,mw),yi$2(2,"div",2,1),Su(),yi$2(4,"svg",3),Op(5,"circle",4),Uc$1()(),Nu(),yi$2(6,"div",5)(7,"div",6)(8,"div",7),Fp(9,8),Uc$1(),yi$2(10,"div",9),Fp(11,8),Uc$1(),yi$2(12,"div",10),Fp(13,8),Uc$1()()()),r&2){let a=xD(1);xv(4),Rp("viewBox",n._viewBox()),xv(),Qp("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),Rp("r",n._circleRadius()),xv(4),kp("ngTemplateOutlet",a),xv(2),kp("ngTemplateOutlet",a),xv(2),kp("ngTemplateOutlet",a);}},dependencies:[pr$3],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return e})();var he=(()=>{class e{static \u0275fac=function(r){return new(r||e)};static \u0275mod=uE({type:e});static \u0275inj=zl$1({imports:[er$3]})}return e})();function Te$1(e,i){if(e&1&&(yi$2(0,"span",2),JD(1),Uc$1()),e&2){let t=wD();xv(),nh$1(t.message());}}var St$1=(()=>{class e{message=jF("");static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["wl-loading-spinner"]],inputs:{message:[1,"message"]},decls:3,vars:2,consts:[[1,"flex","flex-col","items-center","gap-3","p-12","text-[var(--muted)]"],[3,"diameter"],[1,"text-sm"]],template:function(r,n){r&1&&(yi$2(0,"div",0),Op(1,"mat-spinner",1),rD(2,Te$1,2,1,"span",2),Uc$1()),r&2&&(xv(),kp("diameter",36),xv(),oD(n.message()?2:-1));},dependencies:[he,ve],encapsulation:2})}return e})();var Fe=()=>[import('./chunk-C0gVr-Qx.js').then(e=>e.FlyoverPanelComponent),import('./chunk-6b_cuaJz.js').then(e=>e.MapCanvasComponent)];function je(e,i){if(e&1){let t=hD();yi$2(0,"wl-flyover-panel",1),Hp("closed",function(){mu(t);let n=wD(2);return yu(n.map.close())}),Op(1,"wl-map-canvas"),Uc$1();}if(e&2){let t=wD(2);kp("loadingText",t.map.overlayLoading()?"Loading your trail...":"");}}function Ae(e,i){if(e&1&&rD(0,je,2,1,"wl-flyover-panel",0),e&2){let t=wD();oD(t.map.open()?0:-1);}}var jt$1=(()=>{class e{map=T$2(gc$1);static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["wl-map-panel"]],decls:3,vars:0,consts:[["heading","Positioning","closeLabel","Close map",3,"loadingText"],["heading","Positioning","closeLabel","Close map",3,"closed","loadingText"]],template:function(r,n){r&1&&(Dp(0,Ae,1,1),eD(1,0,Fe),tD());},encapsulation:2})}return e})();var Et=(()=>{class e{transform(t){return t?t.replace(/([A-Z])/g," $1").trim():""}static \u0275fac=function(r){return new(r||e)};static \u0275pipe=hE({name:"formatSpec",type:e,pure:true})}return e})();var Lt=(()=>{class e{specMeta=T$2(dt);transform(t){return t?this.specMeta.specIconUrl(t):""}static \u0275fac=function(r){return new(r||e)};static \u0275pipe=hE({name:"specIcon",type:e,pure:false})}return e})();var Ut=(()=>{class e{specMeta=T$2(dt);transform(t){return this.specMeta.classIconUrl(t??"")}static \u0275fac=function(r){return new(r||e)};static \u0275pipe=hE({name:"classIcon",type:e,pure:false})}return e})();function _e$1(e){return !Number.isInteger(e)||e<=0?"":`https://assets.rpglogs.com/img/warcraft/bosses/${e}-icon.jpg`}var Kt$1=(()=>{class e{transform(t){return t?_e$1(t):""}static \u0275fac=function(r){return new(r||e)};static \u0275pipe=hE({name:"bossIcon",type:e,pure:true})}return e})();function Ee(e,i){if(e&1&&Op(0,"img",0),e&2){let t=wD();kp("ngSrc",i)("width",t.size())("height",t.size())("alt",t.alt());}}var er$1=(()=>{class e{src=jF.required();alt=jF.required();size=jF(20);static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["wl-art-icon"]],hostAttrs:[1,"inline-flex","items-center","shrink-0","align-middle"],inputs:{src:[1,"src"],alt:[1,"alt"],size:[1,"size"]},decls:1,vars:1,consts:[[1,"block","rounded-sm",3,"ngSrc","width","height","alt"]],template:function(r,n){if(r&1&&rD(0,Ee,1,4,"img",0),r&2){let a;oD((a=n.src())?0:-1,a);}},dependencies:[Ls$1],encapsulation:2})}return e})();var be="wl.sel.postRaid",ye="wl.sel.preFight",xe="wl.sel.northernSky",nr$1=(()=>{class e{savePostRaid(t){this._save(be,t,"SelectionStore.savePostRaid");}loadPostRaid(){return this._load(be,"SelectionStore.loadPostRaid")}savePreFight(t){this._save(ye,t,"SelectionStore.savePreFight");}loadPreFight(){return this._load(ye,"SelectionStore.loadPreFight")}saveNorthernSky(t){this._save(xe,t,"SelectionStore.saveNorthernSky");}loadNorthernSky(){return this._load(xe,"SelectionStore.loadNorthernSky")}_save(t,r,n){try{localStorage.setItem(t,JSON.stringify(r));}catch(a$1){a(n,a$1);}}_load(t,r){try{let n=localStorage.getItem(t);return n?JSON.parse(n):null}catch(n){return a(r,n),null}}static \u0275fac=function(r){return new(r||e)};static \u0275prov=re$2({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var Re=["*"],ir$1=(()=>{class e{labelPosition="after";static \u0275fac=function(r){return new(r||e)};static \u0275cmp=cE({type:e,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(r,n){r&2&&Zp("mdc-form-field--align-end",n.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Re,decls:1,vars:0,template:function(r,n){r&1&&(CD(),bD(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return e})();var S={codec:"vp9",maxHeight:1080,fps:30,bitrateBps:4e6},E=3e3,L=720*1e3,k={preMs:5e3,postMs:5e3},D={preMs:0,postMs:0},T=1e4;function R$1(r,o,e){return r+o+e*1e3}function C(r,o,e,t){return e.map(s=>{let n=R$1(r,o,s.timeS);return {fromMs:n-t.preMs,toMs:n+s.windowLengthS*1e3+t.postMs,key:s.key}})}function F(r,o,e){return {fromMs:r+o,toMs:r+e,key:"full-pull"}}function M(r,o){return r.filter(e=>e.end>o.fromMs&&e.start<o.toMs).sort((e,t)=>e.start-t.start)}function O(r,o){return o?Math.max(0,(r.fromMs-o.start)/1e3):0}function P(r){let o=0;for(let e=1;e<r.length;e++)o+=Math.max(0,r[e].start-r[e-1].end);return o}function N(r,o,e){return r.some(t=>t.end>o&&t.start<e)}function U(r){return [`video/webm;codecs=${r.codec}`,"video/webm;codecs=vp8","video/webm"].find(e=>MediaRecorder.isTypeSupported(e))??"video/webm"}function _(r){return r instanceof DOMException&&r.name==="NotAllowedError"}var z=(()=>{class r{liveActive=Ho$1(false);isCapturing=Ho$1(false);isStarting=Ho$1(false);sourceLabel=Ho$1("");captureProfile=Ho$1(S);captureError=Ho$1(null);downloadError=Ho$1(null);recordToggleOn=Iw(()=>this.isCapturing()||this.isStarting());stream=null;segments=Ho$1([]);segIdx=0;mimeType="video/webm";liveEnabled=this.liveActive.asReadonly();status=Ho$1("");open=Ho$1(false);handle=Ho$1(null);playbackFailed=Ho$1(false);ctx=Ho$1(null);currentAnchor=null;resolved=new Map;setLive(e){this.liveActive.set(e);}setStatus(e){this.status.set(e);}async startRecording(e=S){if(this.isCapturing()||this.isStarting())return;if(!navigator.mediaDevices?.getDisplayMedia){this.captureError.set("screen recording is not available in this browser");return}this.captureError.set(null),this.isStarting.set(true);let t=null;try{t=await navigator.mediaDevices.getDisplayMedia({video:!0,audio:!1});let[s]=t.getVideoTracks();await s.applyConstraints({width:{max:1920},height:{max:e.maxHeight},frameRate:{max:e.fps}}),this.stream=t,this.captureProfile.set(e),this.mimeType=U(e),this.sourceLabel.set(s.label||"your screen"),s.addEventListener("ended",()=>this.stopRecording()),this.isCapturing.set(!0),this.cycleSegment();}catch(s){t?.getTracks().forEach(n=>n.stop()),this.stream=null,this.isCapturing.set(false),this.sourceLabel.set(""),_(s)||this.captureError.set("recording could not start"),a("LiveCaptureFeatureService.startRecording",s);}finally{this.isStarting.set(false);}}stopRecording(){this.isCapturing.set(false),this.stream?.getTracks().forEach(e=>e.stop()),this.stream=null,this.sourceLabel.set("");}cycleSegment(){if(!this.isCapturing()||!this.stream)return;let e=[],t=new MediaRecorder(this.stream,{mimeType:this.mimeType,videoBitsPerSecond:this.captureProfile().bitrateBps}),s=Date.now();t.ondataavailable=n=>{n.data.size&&e.push(n.data);},t.onerror=n=>{a("LiveCaptureFeatureService.cycleSegment",n),this.captureError.set("recording stopped unexpectedly"),this.stopRecording();},t.onstop=()=>{let n=new Blob(e,{type:this.mimeType}),i=Date.now()-L;if(n.size){let d={idx:this.segIdx++,start:s,end:Date.now(),blob:n};this.segments.update(u=>[...u.filter(p=>p.end>=i),d]);}this.isCapturing()&&this.cycleSegment();},t.start(),setTimeout(()=>{t.state==="recording"&&t.stop();},E);}prepare(e,t,s){this.ctx.set({reportCode:e,reportStartTime:t,fight:s});}clipReady=Iw(()=>{let e=this.ctx();if(!e)return  false;let t=e.reportStartTime+e.fight.startTime,s=e.reportStartTime+e.fight.endTime;return N(this.segments(),t,s)});openClip(e){this.currentAnchor=e,this.open.set(true),this.downloadError.set(null),this.playbackFailed.set(false);let t=this.ctx();if(!t){this.handle.set(null),a(`LiveCaptureFeatureService.openClip ${e.key}`,"no correlation context (report not resolved)");return}this.handle.set(this.resolveHandle(t.reportCode,t.fight.id,this.clipWindowFor(e)));}download(){let e=this.currentAnchor,t=this.handle();!e||!t||this.saveSegments(t.blobs,`${e.key}.webm`);}downloadFullPull(){let e=this.ctx();if(!e)return;let t=M(this.segments(),F(e.reportStartTime,e.fight.startTime,e.fight.endTime));this.saveSegments(t.map(s=>s.blob),"full-pull.webm");}async saveSegments(e,t){if(this.downloadError.set(null),!e.length){this.downloadError.set("Download failed."),a("LiveCaptureFeatureService.saveSegments",`no footage for ${t}`);return}try{this.triggerDownload(await A(e),t);}catch(s){this.downloadError.set("Download failed."),a("LiveCaptureFeatureService.saveSegments",s);}}onPlaybackError(){a("LiveCaptureFeatureService.onPlaybackError",this.currentAnchor?.key??""),this.playbackFailed.set(true);}close(){this.open.set(false);}clear(){this.open.set(false),this.handle.set(null),this.ctx.set(null),this.currentAnchor=null,this.resolved.clear(),this.downloadError.set(null),this.playbackFailed.set(false);}clipWindowFor(e){let{reportStartTime:t,fight:s}=this.ctx(),n=e.windowLengthS>0?D:k,[i]=C(t,s.startTime,[e],n);return i}resolveHandle(e,t,s){let n=`${e}:${t}:${s.key}`,i=this.resolved.get(n);if(i)return i;let d=M(this.segments(),s);if(!d.length)return null;let u=this.handleFor(s,d);return this.resolved.set(n,u),u}handleFor(e,t){let s=O(e,t[0]),n=(e.toMs-e.fromMs-P(t))/1e3;return {blobs:t.map(i=>i.blob),startOffsetS:s,endOffsetS:s+Math.max(0,n),mimeType:this.mimeType}}triggerDownload(e,t){let s=URL.createObjectURL(e),n=document.createElement("a");n.href=s,n.download=t,n.click(),setTimeout(()=>URL.revokeObjectURL(s),T);}static \u0275fac=function(t){return new(t||r)};static \u0275prov=re$2({token:r,factory:r.\u0275fac,providedIn:"root"})}return r})();async function G(r,o,e){B(r);try{let t=new MediaSource,s=URL.createObjectURL(t);r.src=s,await I(t),URL.revokeObjectURL(s);let n=t.addSourceBuffer(e);n.mode="sequence";for(let i of o)await W(n,await i.arrayBuffer());t.endOfStream();}catch(t){a("pipeIntoElement: MSE assembly failed, falling back to single-blob src",t),r.src=URL.createObjectURL(new Blob(o,{type:e}));}}async function A(r){let{BlobSource:o,BufferTarget:e,EncodedPacketSink:t,EncodedVideoPacketSource:s,Input:n,Output:i,WEBM:d,WebMOutputFormat:u}=await import('./chunk-DApEGF5n.js'),p=new i({format:new u,target:new e}),f=null,h,v=0;for(let x of r){let m=await new n({formats:[d],source:new o(x)}).getPrimaryVideoTrack();if(!m)continue;if(!f){f=new s(m.codec??"vp8"),p.addVideoTrack(f),await p.start();let l=await m.getDecoderConfig();h=l?{decoderConfig:l}:void 0;}let g=0;for await(let l of new t(m).packets())await f.add(l.clone({timestamp:l.timestamp+v}),h),h=void 0,g=Math.max(g,l.timestamp+l.duration);v+=g;}if(!f)throw new Error("no decodable video track in the buffered segments");await p.finalize();let w=p.target.buffer;if(!w)throw new Error("remux produced no output");return new Blob([w],{type:"video/webm"})}function B(r){r.src.startsWith("blob:")&&URL.revokeObjectURL(r.src);}function I(r){return new Promise(o=>r.addEventListener("sourceopen",()=>o(),{once:true}))}function W(r,o){return new Promise((e,t)=>{r.addEventListener("updateend",()=>e(),{once:true}),r.addEventListener("error",()=>t(new Error("append failed")),{once:true}),r.appendBuffer(o);})}var v="primary",Jt=Symbol("RouteTitle"),$n=class{params;constructor(r){this.params=r||{};}has(r){return Object.prototype.hasOwnProperty.call(this.params,r)}get(r){if(this.has(r)){let e=this.params[r];return Array.isArray(e)?e[0]:e}return null}getAll(r){if(this.has(r)){let e=this.params[r];return Array.isArray(e)?e:[e]}return []}get keys(){return Object.keys(this.params)}};function nt(i){return new $n(i)}function jn(i,r,e){for(let t=0;t<i.length;t++){let n=i[t],o=r[t];if(n[0]===":")e[n.substring(1)]=o;else if(n!==o.path)return  false}return  true}function is(i,r,e){let t=e.path.split("/"),n=t.indexOf("**");if(n===-1){if(t.length>i.length||e.pathMatch==="full"&&(r.hasChildren()||t.length<i.length))return null;let s={},d=i.slice(0,t.length);return jn(t,d,s)?{consumed:d,posParams:s}:null}if(n!==t.lastIndexOf("**"))return null;let o=t.slice(0,n),a=t.slice(n+1);if(o.length+a.length>i.length||e.pathMatch==="full"&&r.hasChildren()&&e.path!=="**")return null;let l={};return !jn(o,i.slice(0,o.length),l)||!jn(a,i.slice(i.length-a.length),l)?null:{consumed:i,posParams:l}}function qi(i){return new Promise((r,e)=>{i.pipe(Eg()).subscribe({next:t=>r(t),error:t=>e(t)});})}function Bl(i,r){if(i.length!==r.length)return  false;for(let e=0;e<i.length;++e)if(!Pe(i[e],r[e]))return  false;return  true}function Pe(i,r){let e=i?qn(i):void 0,t=r?qn(r):void 0;if(!e||!t||e.length!=t.length)return  false;let n;for(let o=0;o<e.length;o++)if(n=e[o],!ns(i[n],r[n]))return  false;return  true}function qn(i){return [...Object.keys(i),...Object.getOwnPropertySymbols(i)]}function ns(i,r){if(Array.isArray(i)&&Array.isArray(r)){if(i.length!==r.length)return  false;let e=[...i].sort(),t=[...r].sort();return e.every((n,o)=>t[o]===n)}else return i===r}function Hl(i){return i.length>0?i[i.length-1]:null}function at(i){return qh(i)?i:jc$1(i)?xe$3(Promise.resolve(i)):Uh(i)}function rs(i){return qh(i)?qi(i):Promise.resolve(i)}var Vl={exact:as,subset:ss},os={exact:$l,subset:ql,ignored:()=>true},or={paths:"exact",fragment:"ignored",matrixParams:"ignored",queryParams:"exact"},$t={paths:"subset",fragment:"ignored",matrixParams:"ignored",queryParams:"subset"};function ar(i,r$1,e){let t=i instanceof le?i:r$1.parseUrl(i);return Iw(()=>Gn(r$1.lastSuccessfulNavigation()?.finalUrl??new le,t,r(r({},$t),e)))}function Gn(i,r,e){return Vl[e.paths](i.root,r.root,e.matrixParams)&&os[e.queryParams](i.queryParams,r.queryParams)&&!(e.fragment==="exact"&&i.fragment!==r.fragment)}function $l(i,r){return Pe(i,r)}function as(i,r,e){if(!it(i.segments,r.segments)||!Hi(i.segments,r.segments,e)||i.numberOfChildren!==r.numberOfChildren)return  false;for(let t in r.children)if(!i.children[t]||!as(i.children[t],r.children[t],e))return  false;return  true}function ql(i,r){return Object.keys(r).length<=Object.keys(i).length&&Object.keys(r).every(e=>ns(i[e],r[e]))}function ss(i,r,e){return ls(i,r,r.segments,e)}function ls(i,r,e,t){if(i.segments.length>e.length){let n=i.segments.slice(0,e.length);return !(!it(n,e)||r.hasChildren()||!Hi(n,e,t))}else if(i.segments.length===e.length){if(!it(i.segments,e)||!Hi(i.segments,e,t))return  false;for(let n in r.children)if(!i.children[n]||!ss(i.children[n],r.children[n],t))return  false;return  true}else {let n=e.slice(0,i.segments.length),o=e.slice(i.segments.length);return !it(i.segments,n)||!Hi(i.segments,n,t)||!i.children[v]?false:ls(i.children[v],r,o,t)}}function Hi(i,r,e){return r.every((t,n)=>os[e](i[n].parameters,t.parameters))}var le=class{root;queryParams;fragment;_queryParamMap;constructor(r=new R([],{}),e={},t=null){this.root=r,this.queryParams=e,this.fragment=t;}get queryParamMap(){return this._queryParamMap??=nt(this.queryParams),this._queryParamMap}toString(){return Ql.serialize(this)}},R=class{segments;children;parent=null;constructor(r,e){this.segments=r,this.children=e,Object.values(e).forEach(t=>t.parent=this);}hasChildren(){return this.numberOfChildren>0}get numberOfChildren(){return Object.keys(this.children).length}toString(){return Vi(this)}},Ye=class{path;parameters;_parameterMap;constructor(r,e){this.path=r,this.parameters=e;}get parameterMap(){return this._parameterMap??=nt(this.parameters),this._parameterMap}toString(){return ds(this)}};function Gl(i,r){return it(i,r)&&i.every((e,t)=>Pe(e.parameters,r[t].parameters))}function it(i,r){return i.length!==r.length?false:i.every((e,t)=>e.path===r[t].path)}function Wl(i,r){let e=[];return Object.entries(i.children).forEach(([t,n])=>{t===v&&(e=e.concat(r(n,t)));}),Object.entries(i.children).forEach(([t,n])=>{t!==v&&(e=e.concat(r(n,t)));}),e}var kt=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:()=>new Ze})}return i})(),Ze=class{parse(r){let e=new Qn(r);return new le(e.parseRootSegment(),e.parseQueryParams(),e.parseFragment())}serialize(r){let e=`/${zt(r.root,true)}`,t=Zl(r.queryParams),n=typeof r.fragment=="string"?`#${Kl(r.fragment)}`:"";return `${e}${t}${n}`}},Ql=new Ze;function Vi(i){return i.segments.map(r=>ds(r)).join("/")}function zt(i,r){if(!i.hasChildren())return Vi(i);if(r){let e=i.children[v]?zt(i.children[v],false):"",t=[];return Object.entries(i.children).forEach(([n,o])=>{n!==v&&t.push(`${n}:${zt(o,false)}`);}),t.length>0?`${e}(${t.join("//")})`:e}else {let e=Wl(i,(t,n)=>n===v?[zt(i.children[v],false)]:[`${n}:${zt(t,false)}`]);return Object.keys(i.children).length===1&&i.children[v]!=null?`${Vi(i)}/${e[0]}`:`${Vi(i)}/(${e.join("//")})`}}function cs(i){return encodeURIComponent(i).replace(/%40/g,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",")}function ji(i){return cs(i).replace(/%3B/gi,";")}function Kl(i){return encodeURI(i)}function Wn(i){return cs(i).replace(/\(/g,"%28").replace(/\)/g,"%29").replace(/%26/gi,"&")}function $i(i){return decodeURIComponent(i)}function Ya(i){return $i(i.replace(/\+/g,"%20"))}function ds(i){return `${Wn(i.path)}${Yl(i.parameters)}`}function Yl(i){return Object.entries(i).map(([r,e])=>`;${Wn(r)}=${Wn(e)}`).join("")}function Zl(i){let r=Object.entries(i).map(([e,t])=>Array.isArray(t)?t.map(n=>`${ji(e)}=${ji(n)}`).join("&"):`${ji(e)}=${ji(t)}`).filter(e=>e);return r.length?`?${r.join("&")}`:""}var Xl=/^[^\/()?;#]+/;function Bn(i){let r=i.match(Xl);return r?r[0]:""}var Jl=/^[^\/()?;=#]+/;function ec(i){let r=i.match(Jl);return r?r[0]:""}var tc=/^[^=?&#]+/;function ic(i){let r=i.match(tc);return r?r[0]:""}var nc=/^[^&#]+/;function rc(i){let r=i.match(nc);return r?r[0]:""}var Qn=class{url;remaining;constructor(r){this.url=r,this.remaining=r;}parseRootSegment(){for(;this.consumeOptional("/"););return this.remaining===""||this.peekStartsWith("?")||this.peekStartsWith("#")?new R([],{}):new R([],this.parseChildren())}parseQueryParams(){let r={};if(this.consumeOptional("?"))do this.parseQueryParam(r);while(this.consumeOptional("&"));return r}parseFragment(){return this.consumeOptional("#")?decodeURIComponent(this.remaining):null}parseChildren(r=0){if(r>50)throw new M$2(4010,false);if(this.remaining==="")return {};this.consumeOptional("/");let e=[];for(this.peekStartsWith("(")||e.push(this.parseSegment());this.peekStartsWith("/")&&!this.peekStartsWith("//")&&!this.peekStartsWith("/(");)this.capture("/"),e.push(this.parseSegment());let t={};this.peekStartsWith("/(")&&(this.capture("/"),t=this.parseParens(true,r));let n={};return this.peekStartsWith("(")&&(n=this.parseParens(false,r)),(e.length>0||Object.keys(t).length>0)&&(n[v]=new R(e,t)),n}parseSegment(){let r=Bn(this.remaining);if(r===""&&this.peekStartsWith(";"))throw new M$2(4009,false);return this.capture(r),new Ye($i(r),this.parseMatrixParams())}parseMatrixParams(){let r={};for(;this.consumeOptional(";");)this.parseParam(r);return r}parseParam(r){let e=ec(this.remaining);if(!e)return;this.capture(e);let t="";if(this.consumeOptional("=")){let n=Bn(this.remaining);n&&(t=n,this.capture(t));}r[$i(e)]=$i(t);}parseQueryParam(r){let e=ic(this.remaining);if(!e)return;this.capture(e);let t="";if(this.consumeOptional("=")){let a=rc(this.remaining);a&&(t=a,this.capture(t));}let n=Ya(e),o=Ya(t);if(r.hasOwnProperty(n)){let a=r[n];Array.isArray(a)||(a=[a],r[n]=a),a.push(o);}else r[n]=o;}parseParens(r,e){let t={};for(this.capture("(");!this.consumeOptional(")")&&this.remaining.length>0;){let n=Bn(this.remaining),o=this.remaining[n.length];if(o!=="/"&&o!==")"&&o!==";")throw new M$2(4010,false);let a;n.indexOf(":")>-1?(a=n.slice(0,n.indexOf(":")),this.capture(a),this.capture(":")):r&&(a=v);let l=this.parseChildren(e+1);t[a??v]=Object.keys(l).length===1&&l[v]?l[v]:new R([],l),this.consumeOptional("//");}return t}peekStartsWith(r){return this.remaining.startsWith(r)}consumeOptional(r){return this.peekStartsWith(r)?(this.remaining=this.remaining.substring(r.length),true):false}capture(r){if(!this.consumeOptional(r))throw new M$2(4011,false)}};function ms(i){return i.segments.length>0?new R([],{[v]:i}):i}function hs(i){let r={};for(let[t,n]of Object.entries(i.children)){let o=hs(n);if(t===v&&o.segments.length===0&&o.hasChildren())for(let[a,l]of Object.entries(o.children))r[a]=l;else (o.segments.length>0||o.hasChildren())&&(r[t]=o);}let e=new R(i.segments,r);return oc(e)}function oc(i){if(i.numberOfChildren===1&&i.children[v]){let r=i.children[v];return new R(i.segments.concat(r.segments),r.children)}return i}function Xe(i){return i instanceof le}function us(i,r,e=null,t=null,n=new Ze){let o=ps(i);return fs(o,r,e,t,n)}function ps(i){let r;function e(o){let a={};for(let s of o.children){let d=e(s);a[s.outlet]=d;}let l=new R(o.url,a);return o===i&&(r=l),l}let t=e(i.root),n=ms(t);return r??n}function fs(i,r,e,t,n){let o=i;for(;o.parent;)o=o.parent;if(r.length===0)return Hn(o,o,o,e,t,n);let a=ac(r);if(a.toRoot())return Hn(o,o,new R([],{}),e,t,n);let l=sc(a,o,i),s=l.processChildren?Bt(l.segmentGroup,l.index,a.commands):_s(l.segmentGroup,l.index,a.commands);return Hn(o,l.segmentGroup,s,e,t,n)}function Gi(i){return typeof i=="object"&&i!=null&&!i.outlets&&!i.segmentPath}function qt(i){return typeof i=="object"&&i!=null&&i.outlets}function Za(i,r,e){i||="\u0275";let t=new le;return t.queryParams={[i]:r},e.parse(e.serialize(t)).queryParams[i]}function Hn(i,r,e,t,n,o){let a={};for(let[d,p]of Object.entries(t??{}))a[d]=Array.isArray(p)?p.map(T=>Za(d,T,o)):Za(d,p,o);let l;i===r?l=e:l=gs(i,r,e);let s=ms(hs(l));return new le(s,a,n)}function gs(i,r,e){let t={};return Object.entries(i.children).forEach(([n,o])=>{o===r?t[n]=e:t[n]=gs(o,r,e);}),new R(i.segments,t)}var Wi=class{isAbsolute;numberOfDoubleDots;commands;constructor(r,e,t){if(this.isAbsolute=r,this.numberOfDoubleDots=e,this.commands=t,r&&t.length>0&&Gi(t[0]))throw new M$2(4003,false);let n=t.find(qt);if(n&&n!==Hl(t))throw new M$2(4004,false)}toRoot(){return this.isAbsolute&&this.commands.length===1&&this.commands[0]=="/"}};function ac(i){if(typeof i[0]=="string"&&i.length===1&&i[0]==="/")return new Wi(true,0,i);let r=0,e=false,t=i.reduce((n,o,a)=>{if(typeof o=="object"&&o!=null){if(o.outlets){let l={};return Object.entries(o.outlets).forEach(([s,d])=>{l[s]=typeof d=="string"?d.split("/"):d;}),[...n,{outlets:l}]}if(o.segmentPath)return [...n,o.segmentPath]}return typeof o!="string"?[...n,o]:a===0?(o.split("/").forEach((l,s)=>{s==0&&l==="."||(s==0&&l===""?e=true:l===".."?r++:l!=""&&n.push(l));}),n):[...n,o]},[]);return new Wi(e,r,t)}var _t=class{segmentGroup;processChildren;index;constructor(r,e,t){this.segmentGroup=r,this.processChildren=e,this.index=t;}};function sc(i,r,e){if(i.isAbsolute)return new _t(r,true,0);if(!e)return new _t(r,false,NaN);if(e.parent===null)return new _t(e,true,0);let t=Gi(i.commands[0])?0:1,n=e.segments.length-1+t;return lc(e,n,i.numberOfDoubleDots)}function lc(i,r,e){let t=i,n=r,o=e;for(;o>n;){if(o-=n,t=t.parent,!t)throw new M$2(4005,false);n=t.segments.length;}return new _t(t,false,n-o)}function cc(i){return qt(i[0])?i[0].outlets:{[v]:i}}function _s(i,r,e){if(i??=new R([],{}),i.segments.length===0&&i.hasChildren())return Bt(i,r,e);let t=dc(i,r,e),n=e.slice(t.commandIndex);if(t.match&&t.pathIndex<i.segments.length){let o=new R(i.segments.slice(0,t.pathIndex),{});return o.children[v]=new R(i.segments.slice(t.pathIndex),i.children),Bt(o,0,n)}else return t.match&&n.length===0?new R(i.segments,{}):t.match&&!i.hasChildren()?Kn(i,r,e):t.match?Bt(i,0,n):Kn(i,r,e)}function Bt(i,r,e){if(e.length===0)return new R(i.segments,{});{let t=cc(e),n={};if(Object.keys(t).some(o=>o!==v)&&i.children[v]&&i.numberOfChildren===1&&i.children[v].segments.length===0){let o=Bt(i.children[v],r,e);return new R(i.segments,o.children)}return Object.entries(t).forEach(([o,a])=>{typeof a=="string"&&(a=[a]),a!==null&&(n[o]=_s(i.children[o],r,a));}),Object.entries(i.children).forEach(([o,a])=>{t[o]===void 0&&(n[o]=a);}),new R(i.segments,n)}}function dc(i,r,e){let t=0,n=r,o={match:false,pathIndex:0,commandIndex:0};for(;n<i.segments.length;){if(t>=e.length)return o;let a=i.segments[n],l=e[t];if(qt(l))break;let s=`${l}`,d=t<e.length-1?e[t+1]:null;if(n>0&&s===void 0)break;if(s&&d&&typeof d=="object"&&d.outlets===void 0){if(!Ja(s,d,a))return o;t+=2;}else {if(!Ja(s,{},a))return o;t++;}n++;}return {match:true,pathIndex:n,commandIndex:t}}function Kn(i,r,e){let t=i.segments.slice(0,r),n=0;for(;n<e.length;){let o=e[n];if(qt(o)){let s=mc(o.outlets);return new R(t,s)}if(n===0&&Gi(e[0])){let s=i.segments[r];t.push(new Ye(s.path,Xa(e[0]))),n++;continue}let a=qt(o)?o.outlets[v]:`${o}`,l=n<e.length-1?e[n+1]:null;a&&l&&Gi(l)?(t.push(new Ye(a,Xa(l))),n+=2):(t.push(new Ye(a,{})),n++);}return new R(t,{})}function mc(i){let r={};return Object.entries(i).forEach(([e,t])=>{typeof t=="string"&&(t=[t]),t!==null&&(r[e]=Kn(new R([],{}),0,t));}),r}function Xa(i){let r={};return Object.entries(i).forEach(([e,t])=>r[e]=`${t}`),r}function Ja(i,r,e){return i==e.path&&Pe(r,e.parameters)}var Ht="imperative",Q=(function(i){return i[i.NavigationStart=0]="NavigationStart",i[i.NavigationEnd=1]="NavigationEnd",i[i.NavigationCancel=2]="NavigationCancel",i[i.NavigationError=3]="NavigationError",i[i.RoutesRecognized=4]="RoutesRecognized",i[i.ResolveStart=5]="ResolveStart",i[i.ResolveEnd=6]="ResolveEnd",i[i.GuardsCheckStart=7]="GuardsCheckStart",i[i.GuardsCheckEnd=8]="GuardsCheckEnd",i[i.RouteConfigLoadStart=9]="RouteConfigLoadStart",i[i.RouteConfigLoadEnd=10]="RouteConfigLoadEnd",i[i.ChildActivationStart=11]="ChildActivationStart",i[i.ChildActivationEnd=12]="ChildActivationEnd",i[i.ActivationStart=13]="ActivationStart",i[i.ActivationEnd=14]="ActivationEnd",i[i.Scroll=15]="Scroll",i[i.NavigationSkipped=16]="NavigationSkipped",i})(Q||{}),_e=class{id;url;constructor(r,e){this.id=r,this.url=e;}},rt=class extends _e{type=Q.NavigationStart;navigationTrigger;restoredState;constructor(r,e,t="imperative",n=null){super(r,e),this.navigationTrigger=t,this.restoredState=n;}toString(){return `NavigationStart(id: ${this.id}, url: '${this.url}')`}},Ie=class extends _e{urlAfterRedirects;type=Q.NavigationEnd;constructor(r,e,t){super(r,e),this.urlAfterRedirects=t;}toString(){return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`}},re=(function(i){return i[i.Redirect=0]="Redirect",i[i.SupersededByNewNavigation=1]="SupersededByNewNavigation",i[i.NoDataFromResolver=2]="NoDataFromResolver",i[i.GuardRejected=3]="GuardRejected",i[i.Aborted=4]="Aborted",i})(re||{}),Gt=(function(i){return i[i.IgnoredSameUrlNavigation=0]="IgnoredSameUrlNavigation",i[i.IgnoredByUrlHandlingStrategy=1]="IgnoredByUrlHandlingStrategy",i})(Gt||{}),Ce=class extends _e{reason;code;type=Q.NavigationCancel;constructor(r,e,t,n){super(r,e),this.reason=t,this.code=n;}toString(){return `NavigationCancel(id: ${this.id}, url: '${this.url}')`}};function vs(i){return i instanceof Ce&&(i.code===re.Redirect||i.code===re.SupersededByNewNavigation)}var He=class extends _e{reason;code;type=Q.NavigationSkipped;constructor(r,e,t,n){super(r,e),this.reason=t,this.code=n;}},ot=class extends _e{error;target;type=Q.NavigationError;constructor(r,e,t,n){super(r,e),this.error=t,this.target=n;}toString(){return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`}},Wt=class extends _e{urlAfterRedirects;state;type=Q.RoutesRecognized;constructor(r,e,t,n){super(r,e),this.urlAfterRedirects=t,this.state=n;}toString(){return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`}},Qi=class extends _e{urlAfterRedirects;state;type=Q.GuardsCheckStart;constructor(r,e,t,n){super(r,e),this.urlAfterRedirects=t,this.state=n;}toString(){return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`}},Ki=class extends _e{urlAfterRedirects;state;shouldActivate;type=Q.GuardsCheckEnd;constructor(r,e,t,n,o){super(r,e),this.urlAfterRedirects=t,this.state=n,this.shouldActivate=o;}toString(){return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`}},Yi=class extends _e{urlAfterRedirects;state;type=Q.ResolveStart;constructor(r,e,t,n){super(r,e),this.urlAfterRedirects=t,this.state=n;}toString(){return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`}},Zi=class extends _e{urlAfterRedirects;state;type=Q.ResolveEnd;constructor(r,e,t,n){super(r,e),this.urlAfterRedirects=t,this.state=n;}toString(){return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`}},Xi=class{route;type=Q.RouteConfigLoadStart;constructor(r){this.route=r;}toString(){return `RouteConfigLoadStart(path: ${this.route.path})`}},Ji=class{route;type=Q.RouteConfigLoadEnd;constructor(r){this.route=r;}toString(){return `RouteConfigLoadEnd(path: ${this.route.path})`}},en=class{snapshot;type=Q.ChildActivationStart;constructor(r){this.snapshot=r;}toString(){return `ChildActivationStart(path: '${this.snapshot.routeConfig&&this.snapshot.routeConfig.path||""}')`}},tn=class{snapshot;type=Q.ChildActivationEnd;constructor(r){this.snapshot=r;}toString(){return `ChildActivationEnd(path: '${this.snapshot.routeConfig&&this.snapshot.routeConfig.path||""}')`}},nn=class{snapshot;type=Q.ActivationStart;constructor(r){this.snapshot=r;}toString(){return `ActivationStart(path: '${this.snapshot.routeConfig&&this.snapshot.routeConfig.path||""}')`}},rn=class{snapshot;type=Q.ActivationEnd;constructor(r){this.snapshot=r;}toString(){return `ActivationEnd(path: '${this.snapshot.routeConfig&&this.snapshot.routeConfig.path||""}')`}};var bt=class{},Qt=class{},yt=class{url;navigationBehaviorOptions;constructor(r,e){this.url=r,this.navigationBehaviorOptions=e;}};function hc(i){return !(i instanceof bt)&&!(i instanceof yt)&&!(i instanceof Qt)}var on=class{rootInjector;outlet=null;route=null;children;attachRef=null;get injector(){return this.route?.snapshot._environmentInjector??this.rootInjector}constructor(r){this.rootInjector=r,this.children=new St(this.rootInjector);}},St=(()=>{class i{rootInjector;contexts=new Map;constructor(e){this.rootInjector=e;}onChildOutletCreated(e,t){let n=this.getOrCreateContext(e);n.outlet=t,this.contexts.set(e,n);}onChildOutletDestroyed(e){let t=this.getContext(e);t&&(t.outlet=null,t.attachRef=null);}onOutletDeactivated(){let e=this.contexts;return this.contexts=new Map,e}onOutletReAttached(e){this.contexts=e;}getOrCreateContext(e){let t=this.getContext(e);return t||(t=new on(this.rootInjector),this.contexts.set(e,t)),t}getContext(e){return this.contexts.get(e)||null}static \u0275fac=function(t){return new(t||i)(Ae$4(se))};static \u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})(),an=class{_root;constructor(r){this._root=r;}get root(){return this._root.value}parent(r){let e=this.pathFromRoot(r);return e.length>1?e[e.length-2]:null}children(r){let e=Yn(r,this._root);return e?e.children.map(t=>t.value):[]}firstChild(r){let e=Yn(r,this._root);return e&&e.children.length>0?e.children[0].value:null}siblings(r){let e=Zn(r,this._root);return e.length<2?[]:e[e.length-2].children.map(n=>n.value).filter(n=>n!==r)}pathFromRoot(r){return Zn(r,this._root).map(e=>e.value)}};function Yn(i,r){if(i===r.value)return r;for(let e of r.children){let t=Yn(i,e);if(t)return t}return null}function Zn(i,r){if(i===r.value)return [r];for(let e of r.children){let t=Zn(i,e);if(t.length)return t.unshift(r),t}return []}var ge=class{value;children;constructor(r,e){this.value=r,this.children=e;}toString(){return `TreeNode(${this.value})`}};function gt(i){let r={};return i&&i.children.forEach(e=>r[e.value.outlet]=e),r}var Kt=class extends an{snapshot;constructor(r,e){super(r),this.snapshot=e,lr(this,r);}toString(){return this.snapshot.toString()}};function bs(i,r){let e=uc(i,r),t=new Hn$3([new Ye("",{})]),n=new Hn$3({}),o=new Hn$3({}),a=new Hn$3({}),l=new Hn$3(""),s=new Ve(t,n,a,l,o,v,i,e.root);return s.snapshot=e.root,new Kt(new ge(s,[]),e)}function uc(i,r){let e={},t={},n={},a=new wt([],e,n,"",t,v,i,null,{},r);return new Yt("",new ge(a,[]))}var Ve=class{urlSubject;paramsSubject;queryParamsSubject;fragmentSubject;dataSubject;outlet;component;snapshot;_futureSnapshot;_routerState;_paramMap;_queryParamMap;title;url;params;queryParams;fragment;data;constructor(r,e,t,n,o,a,l,s){this.urlSubject=r,this.paramsSubject=e,this.queryParamsSubject=t,this.fragmentSubject=n,this.dataSubject=o,this.outlet=a,this.component=l,this._futureSnapshot=s,this.title=this.dataSubject?.pipe(le$1(d=>d[Jt]))??Uh(void 0),this.url=r,this.params=e,this.queryParams=t,this.fragment=n,this.data=o;}get routeConfig(){return this._futureSnapshot.routeConfig}get root(){return this._routerState.root}get parent(){return this._routerState.parent(this)}get firstChild(){return this._routerState.firstChild(this)}get children(){return this._routerState.children(this)}get pathFromRoot(){return this._routerState.pathFromRoot(this)}get paramMap(){return this._paramMap??=this.params.pipe(le$1(r=>nt(r))),this._paramMap}get queryParamMap(){return this._queryParamMap??=this.queryParams.pipe(le$1(r=>nt(r))),this._queryParamMap}toString(){return this.snapshot?this.snapshot.toString():`Future(${this._futureSnapshot})`}},pc="always";function sr(i,r$1,e){let t,{routeConfig:n}=i;return r$1!==null&&(e==="always"||n?.path===""||!r$1.component&&!r$1.routeConfig?.loadComponent)?t={params:r(r({},r$1.params),i.params),data:r(r({},r$1.data),i.data),resolve:r(r(r(r({},i.data),r$1.data),n?.data),i._resolvedData)}:t={params:r({},i.params),data:r({},i.data),resolve:r(r({},i.data),i._resolvedData??{})},n&&ws(n)&&(t.resolve[Jt]=n.title),t}var wt=class{url;params;queryParams;fragment;data;outlet;component;routeConfig;_resolve;_resolvedData;_routerState;_paramMap;_queryParamMap;_environmentInjector;get title(){return this.data?.[Jt]}constructor(r,e,t,n,o,a,l,s,d,p){this.url=r,this.params=e,this.queryParams=t,this.fragment=n,this.data=o,this.outlet=a,this.component=l,this.routeConfig=s,this._resolve=d,this._environmentInjector=p;}get root(){return this._routerState.root}get parent(){return this._routerState.parent(this)}get firstChild(){return this._routerState.firstChild(this)}get children(){return this._routerState.children(this)}get pathFromRoot(){return this._routerState.pathFromRoot(this)}get paramMap(){return this._paramMap??=nt(this.params),this._paramMap}get queryParamMap(){return this._queryParamMap??=nt(this.queryParams),this._queryParamMap}toString(){let r=this.url.map(t=>t.toString()).join("/"),e=this.routeConfig?this.routeConfig.path:"";return `Route(url:'${r}', path:'${e}')`}},Yt=class extends an{url;constructor(r,e){super(e),this.url=r,lr(this,e);}toString(){return ys(this._root)}};function lr(i,r){r.value._routerState=i,r.children.forEach(e=>lr(i,e));}function ys(i){let r=i.children.length>0?` { ${i.children.map(ys).join(", ")} } `:"";return `${i.value}${r}`}function Vn(i){if(i.snapshot){let r=i.snapshot,e=i._futureSnapshot;i.snapshot=e,Pe(r.queryParams,e.queryParams)||i.queryParamsSubject.next(e.queryParams),r.fragment!==e.fragment&&i.fragmentSubject.next(e.fragment),Pe(r.params,e.params)||i.paramsSubject.next(e.params),Bl(r.url,e.url)||i.urlSubject.next(e.url),Pe(r.data,e.data)||i.dataSubject.next(e.data);}else i.snapshot=i._futureSnapshot,i.dataSubject.next(i._futureSnapshot.data);}function Xn(i,r){let e=Pe(i.params,r.params)&&Gl(i.url,r.url),t=!i.parent!=!r.parent;return e&&!t&&(!i.parent||Xn(i.parent,r.parent))}function ws(i){return typeof i.title=="string"||i.title===null}var Cs=new N$3(""),ei=(()=>{class i{activated=null;get activatedComponentRef(){return this.activated}_activatedRoute=null;name=v;activateEvents=new We$3;deactivateEvents=new We$3;attachEvents=new We$3;detachEvents=new We$3;routerOutletData=jF();parentContexts=T$2(St);location=T$2(xi$2);changeDetector=T$2($F);inputBinder=T$2(ti,{optional:true});supportsBindingToComponentInputs=true;ngOnChanges(e){if(e.name){let{firstChange:t,previousValue:n}=e.name;if(t)return;this.isTrackedInParentContexts(n)&&(this.deactivate(),this.parentContexts.onChildOutletDestroyed(n)),this.initializeOutletWithName();}}ngOnDestroy(){this.isTrackedInParentContexts(this.name)&&this.parentContexts.onChildOutletDestroyed(this.name),this.inputBinder?.unsubscribeFromRouteData(this);}isTrackedInParentContexts(e){return this.parentContexts.getContext(e)?.outlet===this}ngOnInit(){this.initializeOutletWithName();}initializeOutletWithName(){if(this.parentContexts.onChildOutletCreated(this.name,this),this.activated)return;let e=this.parentContexts.getContext(this.name);e?.route&&(e.attachRef?this.attach(e.attachRef,e.route):this.activateWith(e.route,e.injector));}get isActivated(){return !!this.activated}get component(){if(!this.activated)throw new M$2(4012,false);return this.activated.instance}get activatedRoute(){if(!this.activated)throw new M$2(4012,false);return this._activatedRoute}get activatedRouteData(){return this._activatedRoute?this._activatedRoute.snapshot.data:{}}detach(){if(!this.activated)throw new M$2(4012,false);this.location.detach();let e=this.activated;return this.activated=null,this._activatedRoute=null,this.detachEvents.emit(e.instance),e}attach(e,t){this.activated=e,this._activatedRoute=t,this.location.insert(e.hostView),this.inputBinder?.bindActivatedRouteToOutletComponent(this),this.attachEvents.emit(e.instance);}deactivate(){if(this.activated){let e=this.component;this.activated.destroy(),this.activated=null,this._activatedRoute=null,this.deactivateEvents.emit(e);}}activateWith(e,t){if(this.isActivated)throw new M$2(4013,false);this._activatedRoute=e;let n=this.location,a=e.snapshot.component,l=this.parentContexts.getOrCreateContext(this.name).children,s=new Jn(e,l,n.injector,this.routerOutletData);this.activated=n.createComponent(a,{index:n.length,injector:s,environmentInjector:t}),this.changeDetector.markForCheck(),this.inputBinder?.bindActivatedRouteToOutletComponent(this),this.activateEvents.emit(this.activated.instance);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["router-outlet"]],inputs:{name:"name",routerOutletData:[1,"routerOutletData"]},outputs:{activateEvents:"activate",deactivateEvents:"deactivate",attachEvents:"attach",detachEvents:"detach"},exportAs:["outlet"],features:[xm$1]})}return i})(),Jn=class{route;childContexts;parent;outletData;constructor(r,e,t,n){this.route=r,this.childContexts=e,this.parent=t,this.outletData=n;}get(r,e){return r===Ve?this.route:r===St?this.childContexts:r===Cs?this.outletData:this.parent.get(r,e)}},ti=new N$3(""),xs=(()=>{class i{options;outletDataSubscriptions=new Map;outletSeenKeys=new Map;constructor(e){this.options=e,this.options.queryParams??=true;}bindActivatedRouteToOutletComponent(e){this.unsubscribeFromRouteData(e),this.subscribeToRouteData(e);}unsubscribeFromRouteData(e){this.outletDataSubscriptions.get(e)?.unsubscribe(),this.outletDataSubscriptions.delete(e),this.outletSeenKeys.delete(e);}subscribeToRouteData(e){let{activatedRoute:t}=e,n=eg([this.options.queryParams?t.queryParams:Uh({}),t.params,t.data]).pipe(Mg(([o,a,l],s)=>(l=r(r(r({},o),a),l),s===0?Uh(l):Promise.resolve(l)))).subscribe(o=>{if(!e.isActivated||!e.activatedComponentRef||e.activatedRoute!==t||t.component===null){this.unsubscribeFromRouteData(e);return}let a=QF(t.component);if(!a){this.unsubscribeFromRouteData(e);return}let l=this.outletSeenKeys.get(e);l||(l=new Set,this.outletSeenKeys.set(e,l));for(let d of Object.keys(o))l.add(d);let s=this.options.unmatchedInputBehavior??"alwaysUndefined";for(let{templateName:d}of a.inputs){let p=o[d];(p!==void 0||s==="alwaysUndefined"||l.has(d))&&e.activatedComponentRef.setInput(d,p);}});this.outletDataSubscriptions.set(e,n);}static \u0275fac=function(t){SI();};static \u0275prov=re$2({token:i,factory:i.\u0275fac})}return i})(),cr=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["ng-component"]],exportAs:["emptyRouterOutlet"],decls:1,vars:0,template:function(t,n){t&1&&Op(0,"router-outlet");},dependencies:[ei],encapsulation:2,changeDetection:1})}return i})();function dr(i){let r$1=i.children&&i.children.map(dr),e=r$1?s(r({},i),{children:r$1}):r({},i);return !e.component&&!e.loadComponent&&(r$1||e.loadChildren)&&e.outlet&&e.outlet!==v&&(e.component=cr),e}function fc(i,r,e){let t=Zt(i,r._root,e?e._root:void 0);return new Kt(t,r)}function Zt(i,r,e){if(e&&i.shouldReuseRoute(r.value,e.value.snapshot)){let t=e.value;t._futureSnapshot=r.value;let n=gc(i,r,e);return new ge(t,n)}else {if(i.shouldAttach(r.value)){let o=i.retrieve(r.value);if(o!==null){let a=o.route;return a.value._futureSnapshot=r.value,a.children=r.children.map(l=>Zt(i,l)),a}}let t=_c(r.value),n=r.children.map(o=>Zt(i,o));return new ge(t,n)}}function gc(i,r,e){return r.children.map(t=>{for(let n of e.children)if(i.shouldReuseRoute(t.value,n.value.snapshot))return Zt(i,t,n);return Zt(i,t)})}function _c(i){return new Ve(new Hn$3(i.url),new Hn$3(i.params),new Hn$3(i.queryParams),new Hn$3(i.fragment),new Hn$3(i.data),i.outlet,i.component,i)}var Ct=class{redirectTo;navigationBehaviorOptions;constructor(r,e){this.redirectTo=r,this.navigationBehaviorOptions=e;}},ks="ngNavigationCancelingError";function sn(i,r){let{redirectTo:e,navigationBehaviorOptions:t}=Xe(r)?{redirectTo:r,navigationBehaviorOptions:void 0}:r,n=Ss(false,re.Redirect);return n.url=e,n.navigationBehaviorOptions=t,n}function Ss(i,r){let e=new Error(`NavigationCancelingError: ${""}`);return e[ks]=true,e.cancellationCode=r,e}function vc(i){return Rs(i)&&Xe(i.url)}function Rs(i){return !!i&&i[ks]}var er=class{routeReuseStrategy;futureState;currState;forwardEvent;inputBindingEnabled;constructor(r,e,t,n,o){this.routeReuseStrategy=r,this.futureState=e,this.currState=t,this.forwardEvent=n,this.inputBindingEnabled=o;}activate(r){let e=this.futureState._root,t=this.currState?this.currState._root:null;this.deactivateChildRoutes(e,t,r),Vn(this.futureState.root),this.activateChildRoutes(e,t,r);}deactivateChildRoutes(r,e,t){let n=gt(e);r.children.forEach(o=>{let a=o.value.outlet;this.deactivateRoutes(o,n[a],t),delete n[a];}),Object.values(n).forEach(o=>{this.deactivateRouteAndItsChildren(o,t);});}deactivateRoutes(r,e,t){let n=r.value,o=e?e.value:null;if(n===o)if(n.component){let a=t.getContext(n.outlet);a&&this.deactivateChildRoutes(r,e,a.children);}else this.deactivateChildRoutes(r,e,t);else o&&this.deactivateRouteAndItsChildren(e,t);}deactivateRouteAndItsChildren(r,e){r.value.component&&this.routeReuseStrategy.shouldDetach(r.value.snapshot)?this.detachAndStoreRouteSubtree(r,e):this.deactivateRouteAndOutlet(r,e);}detachAndStoreRouteSubtree(r,e){let t=e.getContext(r.value.outlet),n=t&&r.value.component?t.children:e,o=gt(r);for(let a of Object.values(o))this.deactivateRouteAndItsChildren(a,n);if(t&&t.outlet){let a=t.outlet.detach(),l=t.children.onOutletDeactivated();this.routeReuseStrategy.store(r.value.snapshot,{componentRef:a,route:r,contexts:l});}}deactivateRouteAndOutlet(r,e){let t=e.getContext(r.value.outlet),n=t&&r.value.component?t.children:e,o=gt(r);for(let a of Object.values(o))this.deactivateRouteAndItsChildren(a,n);t&&(t.outlet&&(t.outlet.deactivate(),t.children.onOutletDeactivated()),t.attachRef=null,t.route=null);}activateChildRoutes(r,e,t){let n=gt(e);r.children.forEach(o=>{this.activateRoutes(o,n[o.value.outlet],t),this.forwardEvent(new rn(o.value.snapshot));}),r.children.length&&this.forwardEvent(new tn(r.value.snapshot));}activateRoutes(r,e,t){let n=r.value,o=e?e.value:null;if(Vn(n),n===o)if(n.component){let a=t.getOrCreateContext(n.outlet);this.activateChildRoutes(r,e,a.children);}else this.activateChildRoutes(r,e,t);else if(n.component){let a=t.getOrCreateContext(n.outlet);if(this.routeReuseStrategy.shouldAttach(n.snapshot)){let l=this.routeReuseStrategy.retrieve(n.snapshot);this.routeReuseStrategy.store(n.snapshot,null),a.children.onOutletReAttached(l.contexts),a.attachRef=l.componentRef,a.route=l.route.value,a.outlet&&a.outlet.attach(l.componentRef,l.route.value),Vn(l.route.value),this.activateChildRoutes(r,null,a.children);}else a.attachRef=null,a.route=n,a.outlet&&a.outlet.activateWith(n,a.injector),this.activateChildRoutes(r,null,a.children);}else this.activateChildRoutes(r,null,t);}},ln=class{path;route;constructor(r){this.path=r,this.route=this.path[this.path.length-1];}},vt=class{component;route;constructor(r,e){this.component=r,this.route=e;}};function bc(i,r,e){let t=i._root,n=r?r._root:null;return jt(t,n,e,[t.value])}function yc(i){let r=i.routeConfig?i.routeConfig.canActivateChild:null;return !r||r.length===0?null:{node:i,guards:r}}function Rt(i,r){let e=Symbol(),t=r.get(i,e);return t===e?typeof i=="function"&&!kg(i)?i:r.get(i):t}function jt(i,r,e,t,n={canDeactivateChecks:[],canActivateChecks:[]}){let o=gt(r);return i.children.forEach(a=>{wc(a,o[a.value.outlet],e,t.concat([a.value]),n),delete o[a.value.outlet];}),Object.entries(o).forEach(([a,l])=>Vt(l,e.getContext(a),n)),n}function wc(i,r,e,t,n={canDeactivateChecks:[],canActivateChecks:[]}){let o=i.value,a=r?r.value:null,l=e?e.getContext(i.value.outlet):null;if(a&&o.routeConfig===a.routeConfig){let s=Cc(a,o,o.routeConfig.runGuardsAndResolvers);s?n.canActivateChecks.push(new ln(t)):(o.data=a.data,o._resolvedData=a._resolvedData),o.component?jt(i,r,l?l.children:null,t,n):jt(i,r,e,t,n),s&&l&&l.outlet&&l.outlet.isActivated&&n.canDeactivateChecks.push(new vt(l.outlet.component,a));}else a&&Vt(r,l,n),n.canActivateChecks.push(new ln(t)),o.component?jt(i,null,l?l.children:null,t,n):jt(i,null,e,t,n);return n}function Cc(i,r,e){if(typeof e=="function")return So$1(r._environmentInjector,()=>e(i,r));switch(e){case "pathParamsChange":return !it(i.url,r.url);case "pathParamsOrQueryParamsChange":return !it(i.url,r.url)||!Pe(i.queryParams,r.queryParams);case "always":return  true;case "paramsOrQueryParamsChange":return !Xn(i,r)||!Pe(i.queryParams,r.queryParams);default:return !Xn(i,r)}}function Vt(i,r,e){let t=gt(i),n=i.value;Object.entries(t).forEach(([o,a])=>{n.component?r?Vt(a,r.children.getContext(o),e):Vt(a,null,e):Vt(a,r,e);}),n.component?r&&r.outlet&&r.outlet.isActivated?e.canDeactivateChecks.push(new vt(r.outlet.component,n)):e.canDeactivateChecks.push(new vt(null,n)):e.canDeactivateChecks.push(new vt(null,n));}function ii(i){return typeof i=="function"}function xc(i){return typeof i=="boolean"}function kc(i){return i&&ii(i.canLoad)}function Sc(i){return i&&ii(i.canActivate)}function Rc(i){return i&&ii(i.canActivateChild)}function Tc(i){return i&&ii(i.canDeactivate)}function Ic(i){return i&&ii(i.canMatch)}function Ts(i){return i instanceof _t$5||i?.name==="EmptyError"}var Bi=Symbol("INITIAL_VALUE");function xt(){return Mg(i=>eg(i.map(r=>r.pipe(dn$2(1),_g(Bi)))).pipe(le$1(r=>{for(let e of r)if(e!==true){if(e===Bi)return Bi;if(e===false||Mc(e))return e}return  true}),qn$3(r=>r!==Bi),dn$2(1)))}function Mc(i){return Xe(i)||i instanceof Ct}function Is(i){return i.aborted?Uh(void 0).pipe(dn$2(1)):new x(r=>{let e=()=>{r.next(),r.complete();};return i.addEventListener("abort",e),()=>i.removeEventListener("abort",e)})}function Ms(i){return Sg(Is(i))}function Ec(i){return Ie$3(r$1=>{let{targetSnapshot:e,currentSnapshot:t,guards:{canActivateChecks:n,canDeactivateChecks:o}}=r$1;return o.length===0&&n.length===0?Uh(s(r({},r$1),{guardsResult:true})):Ac(o,e,t).pipe(Ie$3(a=>a&&xc(a)?Dc(e,n,i):Uh(a)),le$1(a=>s(r({},r$1),{guardsResult:a})))})}function Ac(i,r,e){return xe$3(i).pipe(Ie$3(t=>Fc(t.component,t.route,e,r)),Eg(t=>t!==true,true))}function Dc(i,r,e){return xe$3(r).pipe(pg(t=>un$2(Pc(t.route.parent,e),Lc(t.route,e),Nc(i,t.path),Oc(i,t.route))),Eg(t=>t!==true,true))}function Lc(i,r){return i!==null&&r&&r(new nn(i)),Uh(true)}function Pc(i,r){return i!==null&&r&&r(new en(i)),Uh(true)}function Oc(i,r){let e=r.routeConfig?r.routeConfig.canActivate:null;if(!e||e.length===0)return Uh(true);let t=e.map(n=>ng(()=>{let o=r._environmentInjector,a=Rt(n,o),l=Sc(a)?a.canActivate(r,i):So$1(o,()=>a(r,i));return at(l).pipe(Eg())}));return Uh(t).pipe(xt())}function Nc(i,r){let e=r[r.length-1],n=r.slice(0,r.length-1).reverse().map(o=>yc(o)).filter(o=>o!==null).map(o=>ng(()=>{let a=o.guards.map(l=>{let s=o.node._environmentInjector,d=Rt(l,s),p=Rc(d)?d.canActivateChild(e,i):So$1(s,()=>d(e,i));return at(p).pipe(Eg())});return Uh(a).pipe(xt())}));return Uh(n).pipe(xt())}function Fc(i,r,e,t){let n=r&&r.routeConfig?r.routeConfig.canDeactivate:null;if(!n||n.length===0)return Uh(true);let o=n.map(a=>{let l=r._environmentInjector,s=Rt(a,l),d=Tc(s)?s.canDeactivate(i,r,e,t):So$1(l,()=>s(i,r,e,t));return at(d).pipe(Eg())});return Uh(o).pipe(xt())}function Uc(i,r,e,t,n){let o=r.canLoad;if(o===void 0||o.length===0)return Uh(true);let a=o.map(l=>{let s=Rt(l,i),d=kc(s)?s.canLoad(r,e):So$1(i,()=>s(r,e)),p=at(d);return n?p.pipe(Ms(n)):p});return Uh(a).pipe(xt(),Es(t))}function Es(i){return Rh(xg(r=>{if(typeof r!="boolean")throw sn(i,r)}),le$1(r=>r===true))}function zc(i,r,e,t,n,o){let a=r.canMatch;if(!a||a.length===0)return Uh(true);let l=a.map(s=>{let d=Rt(s,i),p=Ic(d)?d.canMatch(r,e,n):So$1(i,()=>d(r,e,n));return at(p).pipe(Ms(o))});return Uh(l).pipe(xt(),Es(t))}var Be=class i extends Error{segmentGroup;constructor(r){super(),this.segmentGroup=r||null,Object.setPrototypeOf(this,i.prototype);}},Xt=class i extends Error{urlTree;constructor(r){super(),this.urlTree=r,Object.setPrototypeOf(this,i.prototype);}};function jc(i){throw new M$2(4e3,false)}function Bc(i){throw Ss(false,re.GuardRejected)}var tr=class{urlSerializer;urlTree;constructor(r,e){this.urlSerializer=r,this.urlTree=e;}async lineralizeSegments(r,e){let t=[],n=e.root;for(;;){if(t=t.concat(n.segments),n.numberOfChildren===0)return t;if(n.numberOfChildren>1||!n.children[v])throw jc(`${r.redirectTo}`);n=n.children[v];}}async applyRedirectCommands(r,e,t,n,o){let a=await Hc(e,n,o);if(a instanceof le)throw new Xt(a);let l=this.applyRedirectCreateUrlTree(a,this.urlSerializer.parse(a),r,t);if(a[0]==="/")throw new Xt(l);return l}applyRedirectCreateUrlTree(r,e,t,n){let o=this.createSegmentGroup(r,e.root,t,n);return new le(o,this.createQueryParams(e.queryParams,this.urlTree.queryParams),e.fragment)}createQueryParams(r,e){let t={};return Object.entries(r).forEach(([n,o])=>{if(typeof o=="string"&&o[0]===":"){let l=o.substring(1);t[n]=e[l];}else t[n]=o;}),t}createSegmentGroup(r,e,t,n){let o=this.createSegments(r,e.segments,t,n),a={};return Object.entries(e.children).forEach(([l,s])=>{a[l]=this.createSegmentGroup(r,s,t,n);}),new R(o,a)}createSegments(r,e,t,n){return e.map(o=>o.path[0]===":"?this.findPosParam(r,o,n):this.findOrReturn(o,t))}findPosParam(r,e,t){let n=t[e.path.substring(1)];if(!n)throw new M$2(4001,false);return n}findOrReturn(r,e){let t=0;for(let n of e){if(n.path===r.path)return e.splice(t),n;t++;}return r}};function Hc(i,r,e){if(typeof i=="string")return Promise.resolve(i);let t=i;return qi(at(So$1(e,()=>t(r))))}function Vc(i,r){return i.providers&&!i._injector&&(i._injector=Vc$1(i.providers,r,`Route: ${i.path}`)),i._injector??r}function Te(i){return i.outlet||v}function $c(i,r){let e=i.filter(t=>Te(t)===r);return e.push(...i.filter(t=>Te(t)!==r)),e}var ir={matched:false,consumedSegments:[],remainingSegments:[],parameters:{},positionalParamSegments:{}};function As(i){return {routeConfig:i.routeConfig,url:i.url,params:i.params,queryParams:i.queryParams,fragment:i.fragment,data:i.data,outlet:i.outlet,title:i.title,paramMap:i.paramMap,queryParamMap:i.queryParamMap}}function qc(i,r$1,e,t,n,o,a){let l=Ds(i,r$1,e);if(!l.matched)return Uh(l);let s=As(o(l));return t=Vc(r$1,t),zc(t,r$1,e,n,s,a).pipe(le$1(d=>d===true?l:r({},ir)))}function Ds(i,r$1,e){if(r$1.path==="")return r$1.pathMatch==="full"&&(i.hasChildren()||e.length>0)?r({},ir):{matched:true,consumedSegments:[],remainingSegments:e,parameters:{},positionalParamSegments:{}};let n=(r$1.matcher||is)(e,i,r$1);if(!n)return r({},ir);let o={};Object.entries(n.posParams??{}).forEach(([l,s])=>{o[l]=s.path;});let a=n.consumed.length>0?r(r({},o),n.consumed[n.consumed.length-1].parameters):o;return {matched:true,consumedSegments:n.consumed,remainingSegments:e.slice(n.consumed.length),parameters:a,positionalParamSegments:n.posParams??{}}}function es(i,r,e,t,n){return e.length>0&&Qc(i,e,t,n)?{segmentGroup:new R(r,Wc(t,new R(e,i.children))),slicedSegments:[]}:e.length===0&&Kc(i,e,t)?{segmentGroup:new R(i.segments,Gc(i,e,t,i.children)),slicedSegments:e}:{segmentGroup:new R(i.segments,i.children),slicedSegments:e}}function Gc(i,r$1,e,t){let n={};for(let o of e)if(dn(i,r$1,o)&&!t[Te(o)]){let a=new R([],{});n[Te(o)]=a;}return r(r({},t),n)}function Wc(i,r){let e={};e[v]=r;for(let t of i)if(t.path===""&&Te(t)!==v){let n=new R([],{});e[Te(t)]=n;}return e}function Qc(i,r,e,t){return e.some(n=>!dn(i,r,n)||!(Te(n)!==v)?false:!(t!==void 0&&Te(n)===t))}function Kc(i,r,e){return e.some(t=>dn(i,r,t))}function dn(i,r,e){return (i.hasChildren()||r.length>0)&&e.pathMatch==="full"?false:e.path===""}function Yc(i,r,e){return r.length===0&&!i.children[e]}var nr=class{};async function Zc(i,r,e,t,n,o,a,l){return new rr(i,r,e,t,n,a,o,l).recognize()}var Xc=31,rr=class{injector;configLoader;rootComponentType;config;urlTree;paramsInheritanceStrategy;urlSerializer;abortSignal;applyRedirects;absoluteRedirectCount=0;allowRedirects=true;constructor(r,e,t,n,o,a,l,s){this.injector=r,this.configLoader=e,this.rootComponentType=t,this.config=n,this.urlTree=o,this.paramsInheritanceStrategy=a,this.urlSerializer=l,this.abortSignal=s,this.applyRedirects=new tr(this.urlSerializer,this.urlTree);}noMatchError(r){return new M$2(4002,`'${r.segmentGroup}'`)}async recognize(){let r=es(this.urlTree.root,[],[],this.config).segmentGroup,{children:e,rootSnapshot:t}=await this.match(r),n=new ge(t,e),o=new Yt("",n),a=us(t,[],this.urlTree.queryParams,this.urlTree.fragment);return a.queryParams=this.urlTree.queryParams,o.url=this.urlSerializer.serialize(a),{state:o,tree:a}}async match(r$1){let e=new wt([],Object.freeze({}),Object.freeze(r({},this.urlTree.queryParams)),this.urlTree.fragment,Object.freeze({}),v,this.rootComponentType,null,{},this.injector);try{return {children:await this.processSegmentGroup(this.injector,this.config,r$1,v,e),rootSnapshot:e}}catch(t){if(t instanceof Xt)return this.urlTree=t.urlTree,this.match(t.urlTree.root);throw t instanceof Be?this.noMatchError(t):t}}async processSegmentGroup(r,e,t,n,o){if(t.segments.length===0&&t.hasChildren())return this.processChildren(r,e,t,o);let a=await this.processSegment(r,e,t,t.segments,n,true,o);return a instanceof ge?[a]:[]}async processChildren(r,e,t,n){let o=[];for(let s of Object.keys(t.children))s==="primary"?o.unshift(s):o.push(s);let a=[];for(let s of o){let d=t.children[s],p=$c(e,s),T=await this.processSegmentGroup(r,p,d,s,n);a.push(...T);}let l=Ls(a);return Jc(l),l}async processSegment(r,e,t,n,o,a,l){for(let s of e)try{return await this.processSegmentAgainstRoute(s._injector??r,e,s,t,n,o,a,l)}catch(d){if(d instanceof Be||Ts(d))continue;throw d}if(Yc(t,n,o))return new nr;throw new Be(t)}async processSegmentAgainstRoute(r,e,t,n,o,a,l,s){if(Te(t)!==a&&(a===v||!dn(n,o,t)))throw new Be(n);if(t.redirectTo===void 0)return this.matchSegmentAgainstRoute(r,n,t,o,a,s);if(this.allowRedirects&&l)return this.expandSegmentAgainstRouteUsingRedirect(r,n,e,t,o,a,s);throw new Be(n)}async expandSegmentAgainstRouteUsingRedirect(r,e,t,n,o,a,l){let{matched:s,parameters:d,consumedSegments:p,positionalParamSegments:T,remainingSegments:y}=Ds(e,n,o);if(!s)throw new Be(e);typeof n.redirectTo=="string"&&n.redirectTo[0]==="/"&&(this.absoluteRedirectCount++,this.absoluteRedirectCount>Xc&&(this.allowRedirects=false));let ce=this.createSnapshot(r,n,o,d,l);if(this.abortSignal.aborted)throw new Error(this.abortSignal.reason);let xe=await this.applyRedirects.applyRedirectCommands(p,n.redirectTo,T,As(ce),r),et=await this.applyRedirects.lineralizeSegments(n,xe);return this.processSegment(r,t,e,et.concat(y),a,false,l)}createSnapshot(r$1,e,t,n,o){let a=new wt(t,n,Object.freeze(r({},this.urlTree.queryParams)),this.urlTree.fragment,td(e),Te(e),e.component??e._loadedComponent??null,e,id(e),r$1),l=sr(a,o,this.paramsInheritanceStrategy);return a.params=Object.freeze(l.params),a.data=Object.freeze(l.data),a}async matchSegmentAgainstRoute(r,e,t,n,o,a){if(this.abortSignal.aborted)throw new Error(this.abortSignal.reason);let l=tt=>this.createSnapshot(r,t,tt.consumedSegments,tt.parameters,a),s=await qi(qc(e,t,n,r,this.urlSerializer,l,this.abortSignal));if(t.path==="**"&&(e.children={}),!s?.matched)throw new Be(e);r=t._injector??r;let{routes:d}=await this.getChildConfig(r,t,n),p=t._loadedInjector??r,{parameters:T,consumedSegments:y,remainingSegments:ce}=s,xe=this.createSnapshot(r,t,y,T,a),{segmentGroup:et,slicedSegments:Et}=es(e,y,ce,d,o);if(Et.length===0&&et.hasChildren()){let tt=await this.processChildren(p,d,et,xe);return new ge(xe,tt)}if(d.length===0&&Et.length===0)return new ge(xe,[]);let vn=Te(t)===o,ci=await this.processSegment(p,d,et,Et,vn?v:o,true,xe);return new ge(xe,ci instanceof ge?[ci]:[])}async getChildConfig(r,e,t){if(e.children)return {routes:e.children,injector:r};if(e.loadChildren){if(e._loadedRoutes!==void 0){let o=e._loadedNgModuleFactory;return o&&!e._loadedInjector&&(e._loadedInjector=o.create(r).injector),{routes:e._loadedRoutes,injector:e._loadedInjector}}if(this.abortSignal.aborted)throw new Error(this.abortSignal.reason);if(await qi(Uc(r,e,t,this.urlSerializer,this.abortSignal))){let o=await this.configLoader.loadChildren(r,e);return e._loadedRoutes=o.routes,e._loadedInjector=o.injector,e._loadedNgModuleFactory=o.factory,o}throw Bc()}return {routes:[],injector:r}}};function Jc(i){i.sort((r,e)=>r.value.outlet===v?-1:e.value.outlet===v?1:r.value.outlet.localeCompare(e.value.outlet));}function ed(i){let r=i.value.routeConfig;return r&&r.path===""}function Ls(i){let r=[],e=new Set;for(let t of i){if(!ed(t)){r.push(t);continue}let n=r.find(o=>t.value.routeConfig===o.value.routeConfig);n!==void 0?(n.children.push(...t.children),e.add(n)):r.push(t);}for(let t of e){let n=Ls(t.children);r.push(new ge(t.value,n));}return r.filter(t=>!e.has(t))}function td(i){return i.data||{}}function id(i){return i.resolve||{}}function nd(i,r$1,e,t,n,o,a){return Ie$3(async l=>{let{state:s$1,tree:d}=await Zc(i,r$1,e,t,l.extractedUrl,n,o,a);return s(r({},l),{targetSnapshot:s$1,urlAfterRedirects:d})})}function rd(i){return Ie$3(r=>{let{targetSnapshot:e,guards:{canActivateChecks:t}}=r;if(!t.length)return Uh(r);let n=new Set(t.map(l=>l.route)),o=new Set;for(let l of n)if(!o.has(l))for(let s of Ps(l))o.add(s);let a=0;return xe$3(o).pipe(pg(l=>n.has(l)?od(l,e,i):(l.data=sr(l,l.parent,i).resolve,Uh(void 0))),xg(()=>a++),Dg(1),Ie$3(l=>a===o.size?Uh(r):Ct$5))})}function Ps(i){let r=i.children.map(e=>Ps(e)).flat();return [i,...r]}function od(i,r$1,e){let t=i.routeConfig,n=i._resolve;return t?.title!==void 0&&!ws(t)&&(n[Jt]=t.title),ng(()=>(i.data=sr(i,i.parent,e).resolve,ad(n,i,r$1).pipe(le$1(o=>(i._resolvedData=o,i.data=r(r({},i.data),o),null)))))}function ad(i,r,e){let t=qn(i);if(t.length===0)return Uh({});let n={};return xe$3(t).pipe(Ie$3(o=>sd(i[o],r,e).pipe(Eg(),xg(a=>{if(a instanceof Ct)throw sn(new Ze,a);n[o]=a;}))),Dg(1),le$1(()=>n),Ll$1(o=>Ts(o)?Ct$5:Wh(o)))}function sd(i,r,e){let t=r._environmentInjector,n=Rt(i,t),o=n.resolve?n.resolve(r,e):So$1(t,()=>n(r,e));return at(o)}function ts(i){return Mg(r=>{let e=i(r);return e?xe$3(e).pipe(le$1(()=>r)):Uh(r)})}var mr=(()=>{class i{buildTitle(e){let t,n=e.root;for(;n!==void 0;)t=this.getResolvedTitleForRoute(n)??t,n=n.children.find(o=>o.outlet===v);return t}getResolvedTitleForRoute(e){return e.data[Jt]}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:()=>T$2(Os)})}return i})(),Os=(()=>{class i extends mr{title;constructor(e){super(),this.title=e;}updateTitle(e){let t=this.buildTitle(e);t!==void 0&&this.title.setTitle(t);}static \u0275fac=function(t){return new(t||i)(Ae$4(fu))};static \u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})(),Tt=new N$3("",{factory:()=>({})}),ni=new N$3(""),Ns=(()=>{class i{componentLoaders=new WeakMap;childrenLoaders=new WeakMap;onLoadStartListener;onLoadEndListener;compiler=T$2(yw);async loadComponent(e,t){if(this.componentLoaders.get(t))return this.componentLoaders.get(t);if(t._loadedComponent)return Promise.resolve(t._loadedComponent);this.onLoadStartListener&&this.onLoadStartListener(t);let n=(async()=>{try{let o=await rs(So$1(e,()=>t.loadComponent())),a=await Us(LF(o));return this.onLoadEndListener&&this.onLoadEndListener(t),t._loadedComponent=a,a}finally{this.componentLoaders.delete(t);}})();return this.componentLoaders.set(t,n),n}loadChildren(e,t){if(this.childrenLoaders.get(t))return this.childrenLoaders.get(t);if(t._loadedRoutes)return Promise.resolve({routes:t._loadedRoutes,injector:t._loadedInjector});this.onLoadStartListener&&this.onLoadStartListener(t);let n=(async()=>{try{let o=await Fs(t,this.compiler,e,this.onLoadEndListener);return t._loadedRoutes=o.routes,t._loadedInjector=o.injector,t._loadedNgModuleFactory=o.factory,o}finally{this.childrenLoaders.delete(t);}})();return this.childrenLoaders.set(t,n),n}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})();async function Fs(i,r,e,t){let n=await rs(So$1(e,()=>i.loadChildren())),o=await Us(LF(n)),a;o instanceof hp||Array.isArray(o)?a=o:a=await r.compileModuleAsync(o),t&&t(i);let l,s,p;return Array.isArray(a)?(s=a,true):(l=a.create(e).injector,p=a,s=l.get(ni,[],{optional:true,self:true}).flat()),{routes:s.map(dr),injector:l,factory:p}}async function Us(i){return i}var mn=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:()=>T$2(ld)})}return i})(),ld=(()=>{class i{shouldProcessUrl(e){return  true}extract(e){return e}merge(e,t){return e}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})(),zs=new N$3("");var cd=()=>{},js=new N$3(""),Bs=(()=>{class i{currentNavigation=Ho$1(null,{equal:()=>false});currentTransition=null;lastSuccessfulNavigation=Ho$1(null);events=new ie$1;transitionAbortWithErrorSubject=new ie$1;configLoader=T$2(Ns);environmentInjector=T$2(se);destroyRef=T$2(Ve$4);urlSerializer=T$2(kt);rootContexts=T$2(St);location=T$2(vn$1);inputBindingEnabled=T$2(ti,{optional:true})!==null;titleStrategy=T$2(mr);options=T$2(Tt,{optional:true})||{};paramsInheritanceStrategy=this.options.paramsInheritanceStrategy||pc;urlHandlingStrategy=T$2(mn);createViewTransition=T$2(zs,{optional:true});navigationErrorHandler=T$2(js,{optional:true});navigationId=0;get hasRequestedNavigation(){return this.navigationId!==0}transitions;afterPreactivation=()=>Uh(void 0);rootComponentType=null;destroyed=false;constructor(){let e=n=>this.events.next(new Xi(n)),t=n=>this.events.next(new Ji(n));this.configLoader.onLoadEndListener=t,this.configLoader.onLoadStartListener=e,this.destroyRef.onDestroy(()=>{this.destroyed=true;});}complete(){this.transitions?.complete();}handleNavigationRequest(e){let t=++this.navigationId;Ew(()=>{this.transitions?.next(s(r({},e),{extractedUrl:this.urlHandlingStrategy.extract(e.rawUrl),targetSnapshot:null,targetRouterState:null,guards:{canActivateChecks:[],canDeactivateChecks:[]},guardsResult:null,id:t,routesRecognizeHandler:{},beforeActivateHandler:{}}));});}setupNavigations(e){return this.transitions=new Hn$3(null),this.transitions.pipe(qn$3(t=>t!==null),Mg(t=>{let n=true,o=false,a=new AbortController,l=()=>!o&&this.currentTransition?.id===t.id;return Uh(t).pipe(Mg(s$1=>{if(this.navigationId>t.id)return this.cancelNavigationTransition(t,"",re.SupersededByNewNavigation),Ct$5;this.currentTransition=t;let d=this.lastSuccessfulNavigation();this.currentNavigation.set({id:s$1.id,initialUrl:s$1.rawUrl,extractedUrl:s$1.extractedUrl,targetBrowserUrl:typeof s$1.extras.browserUrl=="string"?this.urlSerializer.parse(s$1.extras.browserUrl):s$1.extras.browserUrl,trigger:s$1.source,extras:s$1.extras,previousNavigation:d?s(r({},d),{previousNavigation:null}):null,abort:()=>a.abort(),routesRecognizeHandler:s$1.routesRecognizeHandler,beforeActivateHandler:s$1.beforeActivateHandler});let p=!e.navigated||this.isUpdatingInternalState()||this.isUpdatedBrowserUrl(),T=s$1.extras.onSameUrlNavigation??e.onSameUrlNavigation;if(!p&&T!=="reload")return this.events.next(new He(s$1.id,this.urlSerializer.serialize(s$1.rawUrl),"",Gt.IgnoredSameUrlNavigation)),s$1.resolve(false),Ct$5;if(this.urlHandlingStrategy.shouldProcessUrl(s$1.rawUrl))return Uh(s$1).pipe(Mg(y=>(this.events.next(new rt(y.id,this.urlSerializer.serialize(y.extractedUrl),y.source,y.restoredState)),y.id!==this.navigationId?Ct$5:Promise.resolve(y))),nd(this.environmentInjector,this.configLoader,this.rootComponentType,e.config,this.urlSerializer,this.paramsInheritanceStrategy,a.signal),xg(y=>{t.targetSnapshot=y.targetSnapshot,t.urlAfterRedirects=y.urlAfterRedirects,this.currentNavigation.update(ce=>(ce.finalUrl=y.urlAfterRedirects,ce)),this.events.next(new Qt);}),Mg(y=>xe$3(t.routesRecognizeHandler.deferredHandle??Uh(void 0)).pipe(le$1(()=>y))),xg(()=>{let y=new Wt(s$1.id,this.urlSerializer.serialize(s$1.extractedUrl),this.urlSerializer.serialize(s$1.urlAfterRedirects),s$1.targetSnapshot);this.events.next(y);}));if(p&&this.urlHandlingStrategy.shouldProcessUrl(s$1.currentRawUrl)){let{id:y,extractedUrl:ce,source:xe,restoredState:et,extras:Et}=s$1,vn=new rt(y,this.urlSerializer.serialize(ce),xe,et);this.events.next(vn);let ci=bs(this.rootComponentType,this.environmentInjector).snapshot;return this.currentTransition=t=s(r({},s$1),{targetSnapshot:ci,urlAfterRedirects:ce,extras:s(r({},Et),{skipLocationChange:false,replaceUrl:false})}),this.currentNavigation.update(tt=>(tt.finalUrl=ce,tt)),Uh(t)}else return this.events.next(new He(s$1.id,this.urlSerializer.serialize(s$1.extractedUrl),"",Gt.IgnoredByUrlHandlingStrategy)),s$1.resolve(false),Ct$5}),le$1(s$1=>{let d=new Qi(s$1.id,this.urlSerializer.serialize(s$1.extractedUrl),this.urlSerializer.serialize(s$1.urlAfterRedirects),s$1.targetSnapshot);return this.events.next(d),this.currentTransition=t=s(r({},s$1),{guards:bc(s$1.targetSnapshot,s$1.currentSnapshot,this.rootContexts)}),t}),Ec(s=>this.events.next(s)),Mg(s=>{if(t.guardsResult=s.guardsResult,s.guardsResult&&typeof s.guardsResult!="boolean")throw sn(this.urlSerializer,s.guardsResult);let d=new Ki(s.id,this.urlSerializer.serialize(s.extractedUrl),this.urlSerializer.serialize(s.urlAfterRedirects),s.targetSnapshot,!!s.guardsResult);if(this.events.next(d),!l())return Ct$5;if(!s.guardsResult)return this.cancelNavigationTransition(s,"",re.GuardRejected),Ct$5;if(s.guards.canActivateChecks.length===0)return Uh(s);let p=new Yi(s.id,this.urlSerializer.serialize(s.extractedUrl),this.urlSerializer.serialize(s.urlAfterRedirects),s.targetSnapshot);if(this.events.next(p),!l())return Ct$5;let T=false;return Uh(s).pipe(rd(this.paramsInheritanceStrategy),xg({next:()=>{T=true;let y=new Zi(s.id,this.urlSerializer.serialize(s.extractedUrl),this.urlSerializer.serialize(s.urlAfterRedirects),s.targetSnapshot);this.events.next(y);},complete:()=>{T||this.cancelNavigationTransition(s,"",re.NoDataFromResolver);}}))}),ts(s=>{let d=T=>{let y=[];if(T.routeConfig?._loadedComponent)T.component=T.routeConfig?._loadedComponent;else if(T.routeConfig?.loadComponent){let ce=T._environmentInjector;y.push(this.configLoader.loadComponent(ce,T.routeConfig).then(xe=>{T.component=xe;}));}for(let ce of T.children)y.push(...d(ce));return y},p=d(s.targetSnapshot.root);return p.length===0?Uh(s):xe$3(Promise.all(p).then(()=>s))}),Mg(s$1=>{let d=fc(e.routeReuseStrategy,s$1.targetSnapshot,s$1.currentRouterState);return this.currentTransition=t=s$1=s(r({},s$1),{targetRouterState:d}),this.currentNavigation.update(p=>(p.targetRouterState=d,p)),Uh(s$1)}),ts(()=>this.afterPreactivation()),Mg(()=>{let{currentSnapshot:s,targetSnapshot:d}=t,p=this.createViewTransition?.(this.environmentInjector,s.root,d.root);return p?xe$3(p).pipe(le$1(()=>t)):Uh(t)}),dn$2(1),Mg(s=>{n=false,this.events.next(new bt);let d=t.beforeActivateHandler.deferredHandle;return d?xe$3(d.then(()=>s)):Uh(s)}),xg(s=>{new er(e.routeReuseStrategy,t.targetRouterState,t.currentRouterState,d=>this.events.next(d),this.inputBindingEnabled).activate(this.rootContexts),l()&&(o=true,this.currentNavigation.update(d=>(d.abort=cd,d)),this.lastSuccessfulNavigation.set(Ew(this.currentNavigation)),this.events.next(new Ie(s.id,this.urlSerializer.serialize(s.extractedUrl),this.urlSerializer.serialize(s.urlAfterRedirects))),this.titleStrategy?.updateTitle(s.targetRouterState.snapshot),s.resolve(true));}),Sg(Is(a.signal).pipe(qn$3(()=>!o&&n),xg(()=>{this.cancelNavigationTransition(t,a.signal.reason+"",re.Aborted);}))),xg({complete:()=>{o=true;}}),Sg(this.transitionAbortWithErrorSubject.pipe(xg(s=>{throw s}))),Ig(()=>{a.abort(),o||this.cancelNavigationTransition(t,"",re.SupersededByNewNavigation),this.currentTransition?.id===t.id&&(this.currentNavigation.set(null),this.currentTransition=null);}),Ll$1(s=>{if(o=true,this.destroyed)return t.resolve(false),Ct$5;if(Rs(s))this.events.next(new Ce(t.id,this.urlSerializer.serialize(t.extractedUrl),s.message,s.cancellationCode)),vc(s)?this.events.next(new yt(s.url,s.navigationBehaviorOptions)):t.resolve(false);else {let d=new ot(t.id,this.urlSerializer.serialize(t.extractedUrl),s,t.targetSnapshot??void 0);try{let p=So$1(this.environmentInjector,()=>this.navigationErrorHandler?.(d));if(p instanceof Ct){let{message:T,cancellationCode:y}=sn(this.urlSerializer,p);this.events.next(new Ce(t.id,this.urlSerializer.serialize(t.extractedUrl),T,y)),this.events.next(new yt(p.redirectTo,p.navigationBehaviorOptions));}else throw this.events.next(d),s}catch(p){this.options.resolveNavigationPromiseOnError?t.resolve(false):t.reject(p);}}return Ct$5}))}))}cancelNavigationTransition(e,t,n){let o=new Ce(e.id,this.urlSerializer.serialize(e.extractedUrl),t,n);this.events.next(o),e.resolve(false);}isUpdatingInternalState(){return this.currentTransition?.extractedUrl.toString()!==this.currentTransition?.currentUrlTree.toString()}isUpdatedBrowserUrl(){let e=this.urlHandlingStrategy.extract(this.urlSerializer.parse(this.location.path(true))),t=Ew(this.currentNavigation),n=t?.targetBrowserUrl??t?.extractedUrl;return e.toString()!==n?.toString()&&!t?.extras.skipLocationChange}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})();function dd(i){return i!==Ht}var Hs=new N$3("");var Vs=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:()=>T$2(md)})}return i})(),cn=class{shouldDetach(r){return  false}store(r,e){}shouldAttach(r){return  false}retrieve(r){return null}shouldReuseRoute(r,e){return r.routeConfig===e.routeConfig}shouldDestroyInjector(r){return  true}},md=(()=>{class i extends cn{static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})(),hn=(()=>{class i{urlSerializer=T$2(kt);options=T$2(Tt,{optional:true})||{};canceledNavigationResolution=this.options.canceledNavigationResolution||"replace";location=T$2(vn$1);urlHandlingStrategy=T$2(mn);urlUpdateStrategy=this.options.urlUpdateStrategy||"deferred";currentUrlTree=new le;getCurrentUrlTree(){return this.currentUrlTree}rawUrlTree=this.currentUrlTree;getRawUrlTree(){return this.rawUrlTree}createBrowserPath({finalUrl:e,initialUrl:t,targetBrowserUrl:n}){let o=e!==void 0?this.urlHandlingStrategy.merge(e,t):t,a=n??o;return a instanceof le?this.urlSerializer.serialize(a):a}routerUrlState(e){return e?.targetBrowserUrl===void 0||e?.finalUrl===void 0?{}:{\u0275routerUrl:this.urlSerializer.serialize(e.finalUrl)}}commitTransition({targetRouterState:e,finalUrl:t,initialUrl:n}){t&&e?(this.currentUrlTree=t,this.rawUrlTree=this.urlHandlingStrategy.merge(t,n),this.routerState=e):this.rawUrlTree=n;}routerState=bs(null,T$2(se));getRouterState(){return this.routerState}_stateMemento=this.createStateMemento();get stateMemento(){return this._stateMemento}updateStateMemento(){this._stateMemento=this.createStateMemento();}createStateMemento(){return {rawUrlTree:this.rawUrlTree,currentUrlTree:this.currentUrlTree,routerState:this.routerState}}restoredState(){return this.location.getState()}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:()=>T$2(hd)})}return i})(),hd=(()=>{class i extends hn{currentPageId=0;lastSuccessfulId=-1;get browserPageId(){return this.canceledNavigationResolution!=="computed"?this.currentPageId:this.restoredState()?.\u0275routerPageId??this.currentPageId}registerNonRouterCurrentEntryChangeListener(e){return this.location.subscribe(t=>{t.type==="popstate"&&setTimeout(()=>{e(t.url,t.state,"popstate",{replaceUrl:true});});})}handleRouterEvent(e,t){e instanceof rt?this.updateStateMemento():e instanceof He?this.commitTransition(t):e instanceof Wt?this.urlUpdateStrategy==="eager"&&(t.extras.skipLocationChange||this.setBrowserUrl(this.createBrowserPath(t),t)):e instanceof bt?(this.commitTransition(t),this.urlUpdateStrategy==="deferred"&&!t.extras.skipLocationChange&&this.setBrowserUrl(this.createBrowserPath(t),t)):e instanceof Ce&&!vs(e)?this.restoreHistory(t):e instanceof ot?this.restoreHistory(t,true):e instanceof Ie&&(this.lastSuccessfulId=e.id,this.currentPageId=this.browserPageId);}setBrowserUrl(e,t){let{extras:n,id:o}=t,{replaceUrl:a,state:l}=n;if(this.location.isCurrentPathEqualTo(e)||a){let s=this.browserPageId,d=r(r({},l),this.generateNgRouterState(o,s,t));this.location.replaceState(e,"",d);}else {let s=r(r({},l),this.generateNgRouterState(o,this.browserPageId+1,t));this.location.go(e,"",s);}}restoreHistory(e,t=false){if(this.canceledNavigationResolution==="computed"){let n=this.browserPageId,o=this.currentPageId-n;o!==0?this.location.historyGo(o):this.getCurrentUrlTree()===e.finalUrl&&o===0&&(this.resetInternalState(e),this.resetUrlToCurrentUrlTree());}else this.canceledNavigationResolution==="replace"&&(t&&this.resetInternalState(e),this.resetUrlToCurrentUrlTree());}resetInternalState({finalUrl:e}){this.routerState=this.stateMemento.routerState,this.currentUrlTree=this.stateMemento.currentUrlTree,this.rawUrlTree=this.urlHandlingStrategy.merge(this.currentUrlTree,e??this.rawUrlTree);}resetUrlToCurrentUrlTree(){this.location.replaceState(this.urlSerializer.serialize(this.getRawUrlTree()),"",this.generateNgRouterState(this.lastSuccessfulId,this.currentPageId));}generateNgRouterState(e,t,n){return this.canceledNavigationResolution==="computed"?r({navigationId:e,\u0275routerPageId:t},this.routerUrlState(n)):r({navigationId:e},this.routerUrlState(n))}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})();function hr(i,r){i.events.pipe(qn$3(e=>e instanceof Ie||e instanceof Ce||e instanceof ot||e instanceof He),le$1(e=>e instanceof Ie||e instanceof He?0:(e instanceof Ce?e.code===re.Redirect||e.code===re.SupersededByNewNavigation:false)?2:1),qn$3(e=>e!==2),dn$2(1)).subscribe(()=>{r();});}var st=(()=>{class i{get currentUrlTree(){return this.stateManager.getCurrentUrlTree()}get rawUrlTree(){return this.stateManager.getRawUrlTree()}disposed=false;nonRouterCurrentEntryChangeSubscription;console=T$2(WE);stateManager=T$2(hn);options=T$2(Tt,{optional:true})||{};pendingTasks=T$2(Ht$4);urlUpdateStrategy=this.options.urlUpdateStrategy||"deferred";navigationTransitions=T$2(Bs);urlSerializer=T$2(kt);location=T$2(vn$1);urlHandlingStrategy=T$2(mn);injector=T$2(se);_events=new ie$1;get events(){return this._events}get routerState(){return this.stateManager.getRouterState()}navigated=false;routeReuseStrategy=T$2(Vs);injectorCleanup=T$2(Hs,{optional:true});onSameUrlNavigation=this.options.onSameUrlNavigation||"ignore";config=T$2(ni,{optional:true})?.flat()??[];componentInputBindingEnabled=!!T$2(ti,{optional:true});currentNavigation=this.navigationTransitions.currentNavigation.asReadonly();constructor(){this.resetConfig(this.config),this.navigationTransitions.setupNavigations(this).subscribe({error:e=>{}}),this.subscribeToNavigationEvents();}eventsSubscription=new G$2;subscribeToNavigationEvents(){let e=this.navigationTransitions.events.subscribe(t=>{try{let n=this.navigationTransitions.currentTransition,o=Ew(this.navigationTransitions.currentNavigation);if(n!==null&&o!==null){if(this.stateManager.handleRouterEvent(t,o),t instanceof Ce&&t.code!==re.Redirect&&t.code!==re.SupersededByNewNavigation)this.navigated=!0;else if(t instanceof Ie)this.navigated=!0,this.injectorCleanup?.(this.routeReuseStrategy,this.routerState,this.config);else if(t instanceof yt){let a=t.navigationBehaviorOptions,l=this.urlHandlingStrategy.merge(t.url,n.currentRawUrl),s=r({scroll:n.extras.scroll,browserUrl:n.extras.browserUrl,info:n.extras.info,skipLocationChange:n.extras.skipLocationChange,replaceUrl:n.extras.replaceUrl||this.urlUpdateStrategy==="eager"||dd(n.source)},a);this.scheduleNavigation(l,Ht,null,s,{resolve:n.resolve,reject:n.reject,promise:n.promise});}}hc(t)&&this._events.next(t);}catch(n){this.navigationTransitions.transitionAbortWithErrorSubject.next(n);}});this.eventsSubscription.add(e);}resetRootComponentType(e){this.routerState.root.component=e,this.navigationTransitions.rootComponentType=e;}initialNavigation(){this.setUpLocationChangeListener(),this.navigationTransitions.hasRequestedNavigation||this.navigateToSyncWithBrowser(this.location.path(true),Ht,this.stateManager.restoredState(),{replaceUrl:true});}setUpLocationChangeListener(){this.nonRouterCurrentEntryChangeSubscription??=this.stateManager.registerNonRouterCurrentEntryChangeListener((e,t,n,o)=>{this.navigateToSyncWithBrowser(e,n,t,o);});}navigateToSyncWithBrowser(e,t,n,o){let a=n?.navigationId?n:null,l=n?.\u0275routerUrl??e;if(n?.\u0275routerUrl&&(o=s(r({},o),{browserUrl:e})),n){let d=r({},n);delete d.navigationId,delete d.\u0275routerPageId,delete d.\u0275routerUrl,Object.keys(d).length!==0&&(o.state=d);}let s$1=this.parseUrl(l);this.scheduleNavigation(s$1,t,a,o).catch(d=>{this.disposed||this.injector.get(dt$2)(d);});}get url(){return this.serializeUrl(this.currentUrlTree)}getCurrentNavigation(){return Ew(this.navigationTransitions.currentNavigation)}get lastSuccessfulNavigation(){return this.navigationTransitions.lastSuccessfulNavigation}resetConfig(e){this.config=e.map(dr),this.navigated=false;}ngOnDestroy(){this.dispose();}dispose(){this._events.unsubscribe(),this.navigationTransitions.complete(),this.nonRouterCurrentEntryChangeSubscription?.unsubscribe(),this.nonRouterCurrentEntryChangeSubscription=void 0,this.disposed=true,this.eventsSubscription.unsubscribe();}createUrlTree(e,t={}){let{relativeTo:n,queryParams:o,fragment:a,queryParamsHandling:l,preserveFragment:s}=t,d=s?this.currentUrlTree.fragment:a,p=null;switch(l??this.options.defaultQueryParamsHandling){case "merge":p=r(r({},this.currentUrlTree.queryParams),o);break;case "preserve":p=this.currentUrlTree.queryParams;break;default:p=o||null;}p!==null&&(p=this.removeEmptyProps(p));let T;try{let y=n?n.snapshot:this.routerState.snapshot.root;T=ps(y);}catch{(typeof e[0]!="string"||e[0][0]!=="/")&&(e=[]),T=this.currentUrlTree.root;}return fs(T,e,p,d??null,this.urlSerializer)}navigateByUrl(e,t={skipLocationChange:false}){let n=Xe(e)?e:this.parseUrl(e),o=this.urlHandlingStrategy.merge(n,this.rawUrlTree);return this.scheduleNavigation(o,Ht,null,t)}navigate(e,t={skipLocationChange:false}){return ud(e),this.navigateByUrl(this.createUrlTree(e,t),t)}serializeUrl(e){return this.urlSerializer.serialize(e)}parseUrl(e){try{return this.urlSerializer.parse(e)}catch{return this.console.warn(Kn$3(4018,false)),this.urlSerializer.parse("/")}}isActive(e,t){let n;if(t===true?n=r({},or):t===false?n=r({},$t):n=r(r({},$t),t),Xe(e))return Gn(this.currentUrlTree,e,n);let o=this.parseUrl(e);return Gn(this.currentUrlTree,o,n)}removeEmptyProps(e){return Object.entries(e).reduce((t,[n,o])=>(o!=null&&(t[n]=o),t),{})}scheduleNavigation(e,t,n,o,a){if(this.disposed)return Promise.resolve(false);let l,s,d;a?(l=a.resolve,s=a.reject,d=a.promise):d=new Promise((T,y)=>{l=T,s=y;});let p=this.pendingTasks.add();return hr(this,()=>{queueMicrotask(()=>this.pendingTasks.remove(p));}),this.navigationTransitions.handleNavigationRequest({source:t,restoredState:n,currentUrlTree:this.currentUrlTree,currentRawUrl:this.currentUrlTree,rawUrl:e,extras:o,resolve:l,reject:s,promise:d,currentSnapshot:this.routerState.snapshot,currentRouterState:this.routerState}),d.catch(Promise.reject.bind(Promise))}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})();function ud(i){for(let r=0;r<i.length;r++)if(i[r]==null)throw new M$2(4008,false)}var fd=(()=>{class i{router=T$2(st);stateManager=T$2(hn);fragment=Ho$1("");queryParams=Ho$1({});path=Ho$1("");serializer=T$2(kt);constructor(){this.updateState(),this.router.events?.subscribe(e=>{e instanceof Ie&&this.updateState();});}updateState(){let{fragment:e,root:t,queryParams:n}=this.stateManager.getCurrentUrlTree();this.fragment.set(e),this.queryParams.set(n),this.path.set(this.serializer.serialize(new le(t)));}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})(),It=(()=>{class i{router;route;tabIndexAttribute;renderer;el;locationStrategy;hrefAttributeValue=T$2(new hh$1("href"),{optional:true});reactiveHref=ww(()=>this.isAnchorElement?this.computeHref(this._urlTree()):this.hrefAttributeValue);get href(){return Ew(this.reactiveHref)}set href(e){this.reactiveHref.set(e);}set target(e){this._target.set(e);}get target(){return Ew(this._target)}_target=Ho$1(void 0);set queryParams(e){this._queryParams.set(e);}get queryParams(){return Ew(this._queryParams)}_queryParams=Ho$1(void 0,{equal:()=>false});set fragment(e){this._fragment.set(e);}get fragment(){return Ew(this._fragment)}_fragment=Ho$1(void 0);set queryParamsHandling(e){this._queryParamsHandling.set(e);}get queryParamsHandling(){return Ew(this._queryParamsHandling)}_queryParamsHandling=Ho$1(void 0);set state(e){this._state.set(e);}get state(){return Ew(this._state)}_state=Ho$1(void 0,{equal:()=>false});set info(e){this._info.set(e);}get info(){return Ew(this._info)}_info=Ho$1(void 0,{equal:()=>false});set relativeTo(e){this._relativeTo.set(e);}get relativeTo(){return Ew(this._relativeTo)}_relativeTo=Ho$1(void 0);set preserveFragment(e){this._preserveFragment.set(e);}get preserveFragment(){return Ew(this._preserveFragment)}_preserveFragment=Ho$1(false);set skipLocationChange(e){this._skipLocationChange.set(e);}get skipLocationChange(){return Ew(this._skipLocationChange)}_skipLocationChange=Ho$1(false);set replaceUrl(e){this._replaceUrl.set(e);}get replaceUrl(){return Ew(this._replaceUrl)}_replaceUrl=Ho$1(false);browserUrl=jF(void 0);isAnchorElement;onChanges=new ie$1;applicationErrorHandler=T$2(dt$2);options=T$2(Tt,{optional:true});reactiveRouterState=T$2(fd);constructor(e,t,n,o,a,l){this.router=e,this.route=t,this.tabIndexAttribute=n,this.renderer=o,this.el=a,this.locationStrategy=l;let s=a.nativeElement.tagName?.toLowerCase();this.isAnchorElement=s==="a"||s==="area"||!!(typeof customElements=="object"&&customElements.get(s)?.observedAttributes?.includes?.("href"));}setTabIndexIfNotOnNativeEl(e){this.tabIndexAttribute!=null||this.isAnchorElement||this.applyAttributeValue("tabindex",e);}ngOnChanges(e){this.onChanges.next(this);}routerLinkInput=Ho$1(null);set routerLink(e){e==null?(this.routerLinkInput.set(null),this.setTabIndexIfNotOnNativeEl(null)):(Xe(e)?this.routerLinkInput.set(e):this.routerLinkInput.set(Array.isArray(e)?e:[e]),this.setTabIndexIfNotOnNativeEl("0"));}onClick(e,t,n,o,a){let l=this._urlTree();if(l===null||this.isAnchorElement&&(e!==0||t||n||o||a||typeof this.target=="string"&&this.target!="_self"))return  true;let s=this.browserUrl(),d=r({skipLocationChange:this.skipLocationChange,replaceUrl:this.replaceUrl,state:this.state,info:this.info},s!==void 0&&{browserUrl:s});return this.router.navigateByUrl(l,d)?.catch(p=>{this.applicationErrorHandler(p);}),!this.isAnchorElement}ngOnDestroy(){}applyAttributeValue(e,t){let n=this.renderer,o=this.el.nativeElement;t!==null?n.setAttribute(o,e,t):n.removeAttribute(o,e);}_urlTree=Iw(()=>{this.reactiveRouterState.path(),this._preserveFragment()&&this.reactiveRouterState.fragment();let e=n=>n==="preserve"||n==="merge";(e(this._queryParamsHandling())||e(this.options?.defaultQueryParamsHandling))&&this.reactiveRouterState.queryParams();let t=this.routerLinkInput();return t===null||!this.router.createUrlTree?null:Xe(t)?t:this.router.createUrlTree(t,{relativeTo:this._relativeTo()!==void 0?this._relativeTo():this.route,queryParams:this._queryParams(),fragment:this._fragment(),queryParamsHandling:this._queryParamsHandling(),preserveFragment:this._preserveFragment()})},{equal:(e,t)=>this.computeHref(e)===this.computeHref(t)});get urlTree(){return Ew(this._urlTree)}computeHref(e){return e!==null&&this.locationStrategy?this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(e))??"":null}static \u0275fac=function(t){return new(t||i)(Ar$2(st),Ar$2(Ve),Gd$1("tabindex"),Ar$2(hI),Ar$2(Mr$2),Ar$2(Me$2))};static \u0275dir=pE({type:i,selectors:[["","routerLink",""]],hostVars:2,hostBindings:function(t,n){t&1&&Hp("click",function(a){return n.onClick(a.button,a.ctrlKey,a.shiftKey,a.altKey,a.metaKey)}),t&2&&Rp("href",n.reactiveHref(),Uy)("target",n._target());},inputs:{target:"target",queryParams:"queryParams",fragment:"fragment",queryParamsHandling:"queryParamsHandling",state:"state",info:"info",relativeTo:"relativeTo",preserveFragment:[2,"preserveFragment","preserveFragment",WF],skipLocationChange:[2,"skipLocationChange","skipLocationChange",WF],replaceUrl:[2,"replaceUrl","replaceUrl",WF],browserUrl:[1,"browserUrl"],routerLink:"routerLink"},features:[xm$1]})}return i})(),ur=(()=>{class i{router;element;renderer;cdr;links;classes=[];routerEventsSubscription;linkInputChangesSubscription;_isActive=false;get isActive(){return this._isActive}routerLinkActiveOptions={exact:false};ariaCurrentWhenActive;isActiveChange=new We$3;link=T$2(It,{optional:true});constructor(e,t,n,o){this.router=e,this.element=t,this.renderer=n,this.cdr=o,this.routerEventsSubscription=e.events.subscribe(a=>{a instanceof Ie&&this.update();});}ngAfterContentInit(){Uh(this.links.changes,Uh(null)).pipe(Wn$3()).subscribe(e=>{this.update(),this.subscribeToEachLinkOnChanges();});}subscribeToEachLinkOnChanges(){this.linkInputChangesSubscription?.unsubscribe();let e=[...this.links.toArray(),this.link].filter(t=>!!t).map(t=>t.onChanges);this.linkInputChangesSubscription=xe$3(e).pipe(Wn$3()).subscribe(t=>{this._isActive!==this.isLinkActive(this.router)(t)&&this.update();});}set routerLinkActive(e){let t=Array.isArray(e)?e:e.split(" ");this.classes=t.filter(n=>!!n);}ngOnChanges(e){this.update();}ngOnDestroy(){this.routerEventsSubscription.unsubscribe(),this.linkInputChangesSubscription?.unsubscribe();}update(){!this.links||!this.router.navigated||queueMicrotask(()=>{let e=this.hasActiveLinks();this.classes.forEach(t=>{e?this.renderer.addClass(this.element.nativeElement,t):this.renderer.removeClass(this.element.nativeElement,t);}),e&&this.ariaCurrentWhenActive!==void 0?this.renderer.setAttribute(this.element.nativeElement,"aria-current",this.ariaCurrentWhenActive.toString()):this.renderer.removeAttribute(this.element.nativeElement,"aria-current"),this._isActive!==e&&(this._isActive=e,this.cdr.markForCheck(),this.isActiveChange.emit(e));});}isLinkActive(e){let t=gd(this.routerLinkActiveOptions)?this.routerLinkActiveOptions:this.routerLinkActiveOptions.exact??false?r({},or):r({},$t);return n=>{let o=n.urlTree;return o?Ew(ar(o,e,t)):false}}hasActiveLinks(){let e=this.isLinkActive(this.router);return this.link&&e(this.link)||this.links.some(e)}static \u0275fac=function(t){return new(t||i)(Ar$2(st),Ar$2(Mr$2),Ar$2(hI),Ar$2($F))};static \u0275dir=pE({type:i,selectors:[["","routerLinkActive",""]],contentQueries:function(t,n,o){if(t&1&&$p(o,It,5),t&2){let a;MD(a=SD())&&(n.links=a);}},inputs:{routerLinkActiveOptions:"routerLinkActiveOptions",ariaCurrentWhenActive:"ariaCurrentWhenActive",routerLinkActive:"routerLinkActive"},outputs:{isActiveChange:"isActiveChange"},exportAs:["routerLinkActive"],features:[xm$1]})}return i})();function gd(i){let r=i;return !!(r.paths||r.matrixParams||r.queryParams||r.fragment)}var _d=new N$3("");function pr(i,...r){return _o$1([{provide:ni,multi:true,useValue:i},{provide:Ve,useFactory:vd},{provide:Np,multi:true,useFactory:yd},r.map(e=>e.\u0275providers)])}function vd(){return T$2(st).routerState.root}function bd(i,r){return {\u0275kind:i,\u0275providers:r}}function yd(){let i=T$2(Ee$4);return r=>{let e=i.get(Rr$3);if(r!==e.components[0])return;let t=i.get(st),n=i.get(wd);i.get(Cd)===1&&t.initialNavigation(),i.get(xd,null,{optional:true})?.setUpPreloading(),i.get(_d,null,{optional:true})?.init(),t.resetRootComponentType(e.componentTypes[0]),n.closed||(n.next(),n.complete(),n.unsubscribe());}}var wd=new N$3("",{factory:()=>new ie$1}),Cd=new N$3("",{factory:()=>1});var xd=new N$3("");function fr(i={}){return bd(8,[{provide:ti,useFactory:()=>new xs(i)}])}var kd="@",Sd=(()=>{class i{doc;delegate;zone;animationType;moduleImpl;_rendererFactoryPromise=null;scheduler=null;injector=T$2(Ee$4);loadingSchedulerFn=T$2(Rd,{optional:true});_engine;constructor(e,t,n,o,a){this.doc=e,this.delegate=t,this.zone=n,this.animationType=o,this.moduleImpl=a;}ngOnDestroy(){this._engine?.flush();}loadImpl(){let e=()=>this.moduleImpl??import('./chunk-DM84x7FA.js').then(n=>n),t;return this.loadingSchedulerFn?t=this.loadingSchedulerFn(e):t=e(),t.catch(n=>{throw new M$2(5300,false)}).then(({\u0275createEngine:n,\u0275AnimationRendererFactory:o})=>{this._engine=n(this.animationType,this.doc);let a=new o(this.delegate,this._engine,this.zone);return this.delegate=a,a})}createRenderer(e,t){let n=this.delegate.createRenderer(e,t);if(n.\u0275type===0)return n;typeof n.throwOnSyntheticProps=="boolean"&&(n.throwOnSyntheticProps=false);let o=new gr(n);return t?.data?.animation&&!this._rendererFactoryPromise&&(this._rendererFactoryPromise=this.loadImpl()),this._rendererFactoryPromise?.then(a=>{let l=a.createRenderer(e,t);o.use(l),this.scheduler??=this.injector.get(Re$4,null,{optional:true}),this.scheduler?.notify(10);}).catch(a=>{o.use(n);}),o}begin(){this.delegate.begin?.();}end(){this.delegate.end?.();}whenRenderingDone(){return this.delegate.whenRenderingDone?.()??Promise.resolve()}componentReplaced(e){this._engine?.flush(),this.delegate.componentReplaced?.(e);}static \u0275fac=function(t){SI();};static \u0275prov=re$2({token:i,factory:i.\u0275fac})}return i})(),gr=class{delegate;replay=[];\u0275type=1;constructor(r){this.delegate=r;}use(r){if(this.delegate=r,this.replay!==null){for(let e of this.replay)e(r);this.replay=null;}}get data(){return this.delegate.data}destroy(){this.replay=null,this.delegate.destroy();}createElement(r,e){return this.delegate.createElement(r,e)}createComment(r){return this.delegate.createComment(r)}createText(r){return this.delegate.createText(r)}get destroyNode(){return this.delegate.destroyNode}appendChild(r,e){this.delegate.appendChild(r,e);}insertBefore(r,e,t,n){this.delegate.insertBefore(r,e,t,n);}removeChild(r,e,t,n){this.delegate.removeChild(r,e,t,n);}selectRootElement(r,e){return this.delegate.selectRootElement(r,e)}parentNode(r){return this.delegate.parentNode(r)}nextSibling(r){return this.delegate.nextSibling(r)}setAttribute(r,e,t,n){this.delegate.setAttribute(r,e,t,n);}removeAttribute(r,e,t){this.delegate.removeAttribute(r,e,t);}addClass(r,e){this.delegate.addClass(r,e);}removeClass(r,e){this.delegate.removeClass(r,e);}setStyle(r,e,t,n){this.delegate.setStyle(r,e,t,n);}removeStyle(r,e,t){this.delegate.removeStyle(r,e,t);}setProperty(r,e,t){this.shouldReplay(e)&&this.replay.push(n=>n.setProperty(r,e,t)),this.delegate.setProperty(r,e,t);}setValue(r,e){this.delegate.setValue(r,e);}listen(r,e,t,n){return this.shouldReplay(e)&&this.replay.push(o=>o.listen(r,e,t,n)),this.delegate.listen(r,e,t,n)}shouldReplay(r){return this.replay!==null&&r.startsWith(kd)}},Rd=new N$3("");function $s(i="animations"){return Be$3("NgAsyncAnimations"),_o$1([{provide:wr$1,useFactory:()=>new Sd(T$2(dr$3),T$2(Et$2),T$2(De$3),i)},{provide:fm$1,useValue:i==="noop"?"NoopAnimations":"BrowserAnimations"}])}var Td=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(t,n){},styles:[`textarea.cdk-textarea-autosize {
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
`],encapsulation:2})}return i})(),Id={passive:true},qs=(()=>{class i{_platform=T$2(u);_ngZone=T$2(De$3);_renderer=T$2(wr$1).createRenderer(null,null);_styleLoader=T$2(bi$2);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return Ct$5;this._styleLoader.load(Td);let t=E$1(e),n=this._monitoredElements.get(t);if(n)return n.subject;let o=new ie$1,a="cdk-text-field-autofilled",l=d=>{d.animationName==="cdk-text-field-autofill-start"&&!t.classList.contains(a)?(t.classList.add(a),this._ngZone.run(()=>o.next({target:d.target,isAutofilled:true}))):d.animationName==="cdk-text-field-autofill-end"&&t.classList.contains(a)&&(t.classList.remove(a),this._ngZone.run(()=>o.next({target:d.target,isAutofilled:false})));},s=this._ngZone.runOutsideAngular(()=>(t.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(t,"animationstart",l,Id)));return this._monitoredElements.set(t,{subject:o,unlisten:s}),o}stopMonitoring(e){let t=E$1(e),n=this._monitoredElements.get(t);n&&(n.unlisten(),n.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t));}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t));}static \u0275fac=function(t){return new(t||i)};static \u0275prov=_r$3({token:i,factory:i.\u0275fac})}return i})();var Gs=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({})}return i})();var Ws=new N$3("MAT_INPUT_VALUE_ACCESSOR");var Md=["button","checkbox","file","hidden","image","radio","range","reset","submit"],Ed=new N$3("MAT_INPUT_CONFIG"),Qs=(()=>{class i{_elementRef=T$2(Mr$2);_platform=T$2(u);ngControl=T$2(me,{optional:true,self:true});_autofillMonitor=T$2(qs);_ngZone=T$2(De$3);_formField=T$2(Ft,{optional:true});_renderer=T$2(hI);_uid=T$2(Pt$1).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=T$2(Ed,{optional:true});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=false;_isNativeSelect=false;_isTextarea=false;_isInFormField=false;focused=false;stateChanges=new ie$1;controlType="mat-input";autofilled=false;get disabled(){return this._disabled}set disabled(e){this._disabled=ti$2(e),this.focused&&(this.focused=false,this.stateChanges.next());}_disabled=false;get id(){return this._id}set id(e){this._id=e||this._uid;}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(qe.required)??false}set required(e){this._required=ti$2(e);}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&Ko$1().has(this._type)&&(this._elementRef.nativeElement.type=this._type);}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next());}get readonly(){return this._readonly}set readonly(e){this._readonly=ti$2(e);}_readonly=false;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>Ko$1().has(e));constructor(){let e=T$2(hi,{optional:true}),t=T$2(ui,{optional:true}),n=T$2(Pr),o=T$2(Ws,{optional:true,self:true}),a=this._elementRef.nativeElement,l=a.nodeName.toLowerCase();o?sa(o.value)?this._signalBasedValueAccessor=o:this._inputValueAccessor=o:this._inputValueAccessor=a,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(a,"keyup",this._iOSKeyupListener);}),this._errorStateTracker=new Gt$1(n,this.ngControl,t,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=l==="select",this._isTextarea=l==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||false,this._isNativeSelect&&(this.controlType=a.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&Vu(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next();});}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next();});}ngOnChanges(){this.stateChanges.next();}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.();}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder();}focus(e){this._elementRef.nativeElement.focus(e);}updateErrorState(){this._errorStateTracker.updateErrorState();}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let t=this._elementRef.nativeElement;t.type==="number"?(t.type="text",t.setSelectionRange(0,0),t.type="number"):t.setSelectionRange(0,0);}this.focused=e,this.stateChanges.next();}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next());}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder");}}_getPlaceholder(){return this.placeholder||null}_validateType(){Md.indexOf(this._type)>-1;}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return !this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby");}onContainerClick(){this.focused||this.focus();}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let t=e.target;!t.value&&t.selectionStart===0&&t.selectionEnd===0&&(t.setSelectionRange(1,1),t.setSelectionRange(0,0));};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(t,n){t&1&&Hp("focus",function(){return n._focusChanged(true)})("blur",function(){return n._focusChanged(false)})("input",function(){return n._onInput()}),t&2&&(jp("id",n.id)("disabled",n.disabled&&!n.disabledInteractive)("required",n.required),Rp("name",n.name||null)("readonly",n._getReadonlyAttribute())("aria-disabled",n.disabled&&n.disabledInteractive?"true":null)("aria-invalid",n.empty&&n.required?null:n.errorState)("aria-required",n.required)("id",n.id),Zp("mat-input-server",n._isServer)("mat-mdc-form-field-textarea-control",n._isInFormField&&n._isTextarea)("mat-mdc-form-field-input-control",n._isInFormField)("mat-mdc-input-disabled-interactive",n.disabledInteractive)("mdc-text-field__input",n._isInFormField)("mat-mdc-native-select-inline",n._isInlineSelect()));},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",WF]},exportAs:["matInput"],features:[cw([{provide:Rt$1,useExisting:i}]),xm$1]})}return i})(),Ks=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[dr$1,dr$1,Gs,er$3]})}return i})();var un=12,Ys=(()=>{class i{document=T$2(dr$3);pollTriggers(){let e=()=>this.document.visibilityState==="visible",t=0,n=ug(un*1e3).pipe(qn$3(e)),o=ns$2(this.document,"visibilitychange").pipe(qn$3(()=>e()&&Date.now()-t>=un*1e3));return dg(n,o).pipe(le$1(()=>{t=Date.now();}))}static \u0275fac=function(t){return new(t||i)};static \u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})();var Dd=["switch"],Ld=["*"];function Pd(i,r){i&1&&(yi$2(0,"span",11),Su(),yi$2(1,"svg",13),Op(2,"path",14),Uc$1(),yi$2(3,"svg",15),Op(4,"path",16),Uc$1()());}var Od=new N$3("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),pn=class{source;checked;constructor(r,e){this.source=r,this.checked=e;}},_r=(()=>{class i{_elementRef=T$2(Mr$2);_focusMonitor=T$2(Nt$1);_changeDetectorRef=T$2($F);defaults=T$2(Od);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new pn(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=K();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new We$3;toggleChange=new We$3;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){T$2(bi$2).load(qe$1);let e=T$2(new hh$1("tabindex"),{optional:true}),t=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=t.color||"accent",this.id=this._uniqueId=T$2(Pt$1).getId("mat-mdc-slide-toggle-"),this.hideIcon=t.hideIcon??false,this.disabledInteractive=t.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new pn(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(t,n){if(t&1&&Up(Dd,5),t&2){let o;MD(o=SD())&&(n._switchElement=o.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(t,n){t&2&&(jp("id",n.id),Rp("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),BD(n.color?"mat-"+n.color:""),Zp("mat-mdc-slide-toggle-focused",n._focused)("mat-mdc-slide-toggle-checked",n.checked)("_mat-animation-noopable",n._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",WF],color:"color",disabled:[2,"disabled","disabled",WF],disableRipple:[2,"disableRipple","disableRipple",WF],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:qF(e)],checked:[2,"checked","checked",WF],hideIcon:[2,"hideIcon","hideIcon",WF],disabledInteractive:[2,"disabledInteractive","disabledInteractive",WF]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[cw([{provide:kn,useExisting:vo$1(()=>i),multi:true},{provide:Mt$1,useExisting:i,multi:true}]),xm$1],ngContentSelectors:Ld,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(t,n){if(t&1&&(CD(),yi$2(0,"div",1)(1,"button",2,0),Hp("click",function(){return n._handleClick()}),Op(3,"div",3)(4,"span",4),yi$2(5,"span",5)(6,"span",6)(7,"span",7),Op(8,"span",8),Uc$1(),yi$2(9,"span",9),Op(10,"span",10),Uc$1(),rD(11,Pd,5,0,"span",11),Uc$1()()(),yi$2(12,"label",12),Hp("click",function(a){return a.stopPropagation()}),bD(13),Uc$1()()),t&2){let o=xD(2);kp("labelPosition",n.labelPosition),xv(),Zp("mdc-switch--selected",n.checked)("mdc-switch--unselected",!n.checked)("mdc-switch--checked",n.checked)("mdc-switch--disabled",n.disabled)("mat-mdc-slide-toggle-disabled-interactive",n.disabledInteractive),kp("tabIndex",n.disabled&&!n.disabledInteractive?-1:n.tabIndex)("disabled",n.disabled&&!n.disabledInteractive),Rp("id",n.buttonId)("name",n.name)("aria-label",n.ariaLabel)("aria-labelledby",n._getAriaLabelledBy())("aria-describedby",n.ariaDescribedby)("aria-required",n.required||null)("aria-checked",n.checked)("aria-disabled",n.disabled&&n.disabledInteractive?"true":null),xv(9),kp("matRippleTrigger",o)("matRippleDisabled",n.disableRipple||n.disabled)("matRippleCentered",true),xv(),oD(n.hideIcon?-1:11),xv(),kp("for",n.buttonId),Rp("id",n._labelId);}},dependencies:[bi$1,ir$1],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Zs=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[_r,er$3]})}return i})();function Fd(i,r){if(i&1&&(yi$2(0,"span",3),Op(1,"span",6),JD(2),Uc$1()),i&2){let e=wD();xv(2),Qc$1("",e.capture.status()," ");}}function Ud(i,r){i&1&&(Op(0,"mat-progress-spinner",7),yi$2(1,"span"),JD(2,"pick a window..."),Uc$1());}function zd(i,r){if(i&1&&(Op(0,"span",8),yi$2(1,"span"),JD(2),Uc$1()),i&2){let e=wD();xv(2),Qc$1('Recording "',e.capture.sourceLabel(),'" in the background');}}function jd(i,r){if(i&1&&(yi$2(0,"span",5),JD(1),Uc$1()),i&2){let e=wD();xv(),nh$1(e.capture.captureError());}}function Bd(i,r){i&1&&(yi$2(0,"span"),JD(1,"stays in this browser session, nothing is uploaded"),Uc$1());}var Xs=(()=>{class i{capture=T$2(z);onLiveToggle(e){this.capture.setLive(e);}onRecordToggle(e){e?this.capture.startRecording():this.capture.stopRecording();}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["wl-live-controls"]],decls:13,vars:5,consts:[[1,"mt-2","flex","flex-col","gap-3"],[1,"flex","items-center","gap-3"],[3,"change","checked"],[1,"ml-auto","flex","items-center","gap-2","text-[12.5px]","text-[var(--muted)]"],[3,"change","checked","disabled"],[1,"text-[var(--critical)]"],[1,"h-[9px]","w-[9px]","rounded-full","bg-[var(--accent)]"],["mode","indeterminate","diameter","15"],[1,"h-[9px]","w-[9px]","rounded-full","bg-[var(--critical)]"]],template:function(t,n){t&1&&(yi$2(0,"div",0)(1,"div",1)(2,"mat-slide-toggle",2),Hp("change",function(a){return n.onLiveToggle(a.checked)}),JD(3," Follow latest pull "),Uc$1(),rD(4,Fd,3,1,"span",3),Uc$1(),yi$2(5,"div",1)(6,"mat-slide-toggle",4),Hp("change",function(a){return n.onRecordToggle(a.checked)}),JD(7," Record game client "),Uc$1(),yi$2(8,"span",3),rD(9,Ud,3,0)(10,zd,3,1)(11,jd,2,1,"span",5)(12,Bd,2,0,"span"),Uc$1()()()),t&2&&(xv(2),kp("checked",n.capture.liveEnabled()),xv(2),oD(n.capture.liveEnabled()&&n.capture.status()?4:-1),xv(2),kp("checked",n.capture.recordToggleOn())("disabled",n.capture.isStarting()),xv(3),oD(n.capture.isStarting()?9:n.capture.isCapturing()?10:n.capture.captureError()?11:12));},dependencies:[Zs,_r,he,ve],encapsulation:2})}return i})();var Hd=()=>[import('./chunk-C0gVr-Qx.js').then(i=>i.FlyoverPanelComponent),import('./chunk-CpyW7fgr.js').then(i=>i.ClipPlayerComponent)];function Vd(i,r){if(i&1){let e=hD();yi$2(0,"wl-flyover-panel",1),Hp("closed",function(){mu(e);let n=wD(2);return yu(n.clip.close())}),Op(1,"wl-clip-player"),Uc$1();}}function $d(i,r){if(i&1&&rD(0,Vd,2,0,"wl-flyover-panel",0),i&2){let e=wD();oD(e.clip.open()?0:-1);}}var Js=(()=>{class i{clip=T$2(z);static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["wl-clip-panel"]],decls:3,vars:0,consts:[["heading","Replay","closeLabel","Close replay"],["heading","Replay","closeLabel","Close replay",3,"closed"]],template:function(t,n){t&1&&(Dp(0,$d,1,1),eD(1,0,Hd),tD());},encapsulation:2})}return i})();var ri=class{token=0;begin(){return ++this.token}cancel(){this.token++;}isCurrent(r){return r===this.token}};var qd=()=>[import('./chunk-ONtDyqhr.js').then(i=>i.BenchEmptyBannerComponent),import('./chunk-lHHpv2yo.js').then(i=>i.PullOverviewComponent),import('./chunk-C9UfTuPh.js').then(i=>i.RotationComponent),import('./chunk-BgNrCFMn.js').then(i=>i.BurstWindowsComponent),import('./chunk-A9-4mhiM.js').then(i=>i.DefensiveComponent),import('./chunk-CuillnYm.js').then(i=>i.GearComponent)],el=(i,r)=>r.id;function Gd(i,r){if(i&1&&(yi$2(0,"span",11),Op(1,"wl-art-icon",13),fw(2,"bossIcon"),yi$2(3,"span",14),JD(4),fw(5,"formatDuration"),Uc$1()()),i&2){let e=r;xv(),kp("src",hw(2,5,e.encounterID))("alt",e.name),xv(3),oh("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",hw(5,7,e.duration_s));}}function Wd(i,r){if(i&1&&(yi$2(0,"mat-option",12)(1,"span",11),Op(2,"wl-art-icon",13),fw(3,"bossIcon"),yi$2(4,"span",14),JD(5),fw(6,"formatDuration"),Uc$1()()()),i&2){let e=r.$implicit;kp("value",e.id),xv(2),kp("src",hw(3,6,e.encounterID))("alt",e.name),xv(3),oh("",e.name," - ",e.kill?"Kill":"Wipe #"+e.attempt," - ",hw(6,8,e.duration_s));}}function Qd(i,r){if(i&1&&(Op(0,"wl-art-icon",13),fw(1,"specIcon"),fw(2,"formatSpec")),i&2){let e=r;kp("src",hw(1,2,e))("alt",hw(2,4,e));}}function Kd(i,r){if(i&1&&(Op(0,"wl-art-icon",13),fw(1,"classIcon")),i&2){let e=wD();kp("src",hw(1,2,e.spec))("alt",e.spec);}}function Yd(i,r){if(i&1&&(yi$2(0,"span",11),rD(1,Qd,3,6,"wl-art-icon",13)(2,Kd,2,4,"wl-art-icon",13),yi$2(3,"span",14),JD(4),Uc$1()()),i&2){let e,t=r,n=wD(2);xv(),oD((e=n.playerSpecs()[t.id])?1:2,e),xv(3),nh$1(t.name);}}function Zd(i,r){if(i&1&&(Op(0,"wl-art-icon",13),fw(1,"specIcon"),fw(2,"formatSpec")),i&2){let e=r;kp("src",hw(1,2,e))("alt",hw(2,4,e));}}function Xd(i,r){if(i&1&&(Op(0,"wl-art-icon",13),fw(1,"classIcon")),i&2){let e=wD().$implicit;kp("src",hw(1,2,e.spec))("alt",e.spec);}}function Jd(i,r){if(i&1&&(yi$2(0,"mat-option",12)(1,"span",11),rD(2,Zd,3,6,"wl-art-icon",13)(3,Xd,2,4,"wl-art-icon",13),yi$2(4,"span",14),JD(5),Uc$1()()()),i&2){let e,t=r.$implicit,n=wD(2);kp("value",t.id),xv(2),oD((e=n.playerSpecs()[t.id])?2:3,e),xv(3),nh$1(t.name);}}function em(i,r){if(i&1){let e=hD();yi$2(0,"div",4)(1,"div",8)(2,"mat-form-field",9)(3,"mat-label"),JD(4,"Fight"),Uc$1(),yi$2(5,"mat-select",10),Hp("selectionChange",function(){mu(e);let n=wD();return yu(n.onFightChange())}),yi$2(6,"mat-select-trigger"),rD(7,Gd,6,9,"span",11),Uc$1(),aD(8,Wd,7,10,"mat-option",12,el),Uc$1(),EI(),Uc$1(),yi$2(10,"mat-form-field",9)(11,"mat-label"),JD(12,"Player"),Uc$1(),yi$2(13,"mat-select",10),Hp("selectionChange",function(){mu(e);let n=wD();return yu(n.onPlayerChange())}),yi$2(14,"mat-select-trigger"),rD(15,Yd,5,2,"span",11),Uc$1(),aD(16,Jd,6,3,"mat-option",12,el),Uc$1(),EI(),Uc$1()()();}if(i&2){let e,t,n=wD();xv(5),kp("formControl",n.fightControl),wI(),xv(2),oD((e=n.selectedFight())?7:-1,e),xv(),cD(n.fights()),xv(5),kp("formControl",n.playerControl),wI(),xv(2),oD((t=n.selectedPlayer())?15:-1,t),xv(),cD(n.visiblePlayers());}}function tm(i,r){if(i&1&&(yi$2(0,"div",5),JD(1),Uc$1()),i&2){let e=wD();xv(),nh$1(e.notice());}}function im(i,r){i&1&&Op(0,"wl-load-state",6),i&2&&kp("error",r);}function nm(i,r){if(i&1&&Op(0,"wl-loading-spinner",7),i&2){let e=wD();kp("message",e.loadingMsg());}}function rm(i,r){if(i&1&&Op(0,"wl-bench-empty-banner",17),i&2){let e=wD(3);kp("encounter",e.selectedFight()?.name??"");}}function om(i,r){if(i&1){let e=hD();yi$2(0,"div",16),rD(1,rm,1,1,"wl-bench-empty-banner",17),yi$2(2,"wl-pull-overview",18),Hp("openMap",function(n){mu(e);let o=wD(2);return yu(o.onOpenMap(n))})("openClip",function(n){mu(e);let o=wD(2);return yu(o.onOpenClip(n))})("busyChange",function(n){mu(e);let o=wD(2);return yu(o.pullOverviewBusy.set(n))}),Uc$1(),yi$2(3,"wl-rotation",19),Hp("busyChange",function(n){mu(e);let o=wD(2);return yu(o.rotationBusy.set(n))})("availableChange",function(n){mu(e);let o=wD(2);return yu(o.rotationAvailable.set(n))}),Uc$1(),yi$2(4,"wl-burst-windows",20),Hp("openMap",function(n){mu(e);let o=wD(2);return yu(o.onOpenMap(n))})("openClip",function(n){mu(e);let o=wD(2);return yu(o.onOpenClip(n))})("busyChange",function(n){mu(e);let o=wD(2);return yu(o.burstBusy.set(n))})("availableChange",function(n){mu(e);let o=wD(2);return yu(o.burstAvailable.set(n))}),Uc$1(),yi$2(5,"wl-defensive",20),Hp("openMap",function(n){mu(e);let o=wD(2);return yu(o.onDefensiveOpenMap(n))})("openClip",function(n){mu(e);let o=wD(2);return yu(o.onOpenClip(n))})("busyChange",function(n){mu(e);let o=wD(2);return yu(o.defensiveBusy.set(n))})("availableChange",function(n){mu(e);let o=wD(2);return yu(o.defensiveAvailable.set(n))}),Uc$1(),yi$2(6,"wl-gear",21),Hp("busyChange",function(n){mu(e);let o=wD(2);return yu(o.gearBusy.set(n))})("availableChange",function(n){mu(e);let o=wD(2);return yu(o.gearAvailable.set(n))}),Uc$1()();}if(i&2){let e=wD(2);Zp("hidden",e.cardsBusy()),xv(),oD(e.benchAvailable()?-1:1),xv(),kp("report",e.reportCode())("fight",e.selectedFight())("player",e.selectedPlayerId())("showMap",e.mapReady())("showClip",e.clipReady()),xv(),kp("spec",e.spec())("encounterId",e.selectedEncounterId())("reportCode",e.reportCode())("fightId",e.selectedFightId())("playerId",e.selectedPlayerId()),xv(),kp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("showMap",e.mapReady())("showClip",e.clipReady()),xv(),kp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId())("showMap",e.mapReady())("showClip",e.clipReady()),xv(),kp("spec",e.spec())("encounterId",e.selectedEncounterId())("report",e.reportCode())("fight",e.selectedFightId())("player",e.selectedPlayerId());}}function am(i,r){if(i&1&&rD(0,om,7,32,"div",15),i&2){let e=wD();oD(e.ready()&&!e.loadingAnalysis()?0:-1);}}function ol(i){let r=i.match(/\/reports\/([a-zA-Z0-9]+)/);return r?r[1]:i.trim()}function sm(i){let r=i.match(/[#?&]fight=(\d+)/),e=r?Number(r[1]):NaN;return Number.isInteger(e)&&e>0?e:null}function al(i){return /^[a-zA-Z0-9]{16}$/.test(i)}var lm=10;function cm(i){return `${i} is a Mythic+ boss. Pick a raid pull.`}function dm(i){return i===lm}function tl(i=[]){let r$1={};return (i||[]).filter(e=>(e.encounterID||0)>0).sort((e,t)=>e.startTime-t.startTime).map(e=>{let t=e.encounterID||0;return r$1[t]=(r$1[t]||0)+1,s(r({},e),{duration_s:Math.round((e.endTime-e.startTime)/100)/10,attempt:r$1[t]})})}function mm(i=[]){return (i||[]).map(r=>({id:r.id,name:r.name,spec:r.subType||"Unknown",server:r.server||""})).sort((r,e)=>r.name.localeCompare(e.name))}function il(i,r,e){let n=i.find(o=>o.id===e)?.friendlyPlayers;return n?.length?r.filter(o=>n.includes(o.id)):r}function hm(i,r,e){let t=i[i.length-1];return t?t.id===r&&e?"skip":"analyze":"none"}function nl(i,r){if(r){let e=i.find(t=>t.name.toLowerCase()===r.toLowerCase());if(e)return e.id}return i[0]?.id??null}function um(i){let r=(i.value??"").trim();return r?al(ol(r))?null:{invalidReportCode:true}:null}function rl(i,r){for(let e of ["dps","healers","tanks","unknown"])for(let t of i[e]??[]){if(t.id!==r)continue;let n=(t.type??"").replace(/ /g,""),o=((t.specs??[])[0]?.spec??"").replace(/ /g,"");return o&&n?o+n:""}return ""}var sl=(()=>{class i{wclApi=T$2(_r$2);mapFeature=T$2(gc$1);liveCapture=T$2(z);liveSync=T$2(Ys);selectionStore=T$2(nr$1);reportControl=new Co("",{nonNullable:true,validators:[um]});fightControl=new Co(null);playerControl=new Co(null);constructor(){Vu(()=>{this.liveCapture.liveEnabled()?this.fightControl.disable():this.fightControl.enable();});}loadingReport=Ho$1(false);loadingAnalysis=Ho$1(false);loadingMsg=Ho$1("Loading\u2026");pullOverviewBusy=Ho$1(true);rotationBusy=Ho$1(true);burstBusy=Ho$1(true);defensiveBusy=Ho$1(true);gearBusy=Ho$1(true);cardsBusy=Iw(()=>this.pullOverviewBusy()||this.rotationBusy()||this.burstBusy()||this.defensiveBusy()||this.gearBusy());rotationAvailable=Ho$1(false);burstAvailable=Ho$1(false);defensiveAvailable=Ho$1(false);gearAvailable=Ho$1(false);benchAvailable=Iw(()=>this.rotationAvailable()||this.burstAvailable()||this.defensiveAvailable()||this.gearAvailable());loadError=Ho$1(null);notice=Ho$1("");fights=Ho$1([]);players=Ho$1([]);selectedFightId=Ye$1(this.fightControl.valueChanges,{initialValue:this.fightControl.value});selectedPlayerId=Ye$1(this.playerControl.valueChanges,{initialValue:this.playerControl.value});liveSyncEnabled=this.liveCapture.liveEnabled;spec=Ho$1("");playerDetailGroups=Ho$1({});reportCode=Ho$1("");reportStartTime=Ho$1(0);_enemies=[];reportRun=new ri;selectionRun=new ri;visiblePlayers=Iw(()=>il(this.fights(),this.players(),this.selectedFightId()));playerSpecs=Iw(()=>{let e=this.playerDetailGroups(),t={};for(let n of this.visiblePlayers())t[n.id]=rl(e,n.id);return t});selectedFight=Iw(()=>this.fights().find(e=>e.id===this.selectedFightId()));selectedPlayer=Iw(()=>this.visiblePlayers().find(e=>e.id===this.selectedPlayerId()));selectedEncounterId=Iw(()=>this.fights().find(e=>e.id===this.selectedFightId())?.encounterID??0);ready=Iw(()=>!!this.spec()&&!!this.reportCode()&&!!this.selectedFightId()&&!!this.selectedPlayerId()&&!!this.selectedEncounterId());mapReady=this.mapFeature.ready;onOpenMap(e){this.mapFeature.openAt(e);}onDefensiveOpenMap(e){this.mapFeature.openAt({timeS:e.timeS,windowLengthS:e.windowLengthS,reference:e.refGameId!=null?{kind:"enemy",gameId:e.refGameId}:{kind:"boss"}});}clipReady=this.liveCapture.clipReady;onOpenClip(e){this.liveCapture.openClip(e);}_pollingSub=eg([Xe$1(this.liveSyncEnabled),Xe$1(this.reportCode)]).pipe(xg(([e,t])=>{e&&!t?this.liveCapture.setStatus("Load a report to start live sync."):e||this.liveCapture.setStatus("");}),le$1(([e,t])=>e&&!!t),mg(),Mg(e=>e?dg(Uh(void 0),this.liveSync.pollTriggers()):Ct$5),Hl$1(()=>xe$3(this._pollOnce())),Qe()).subscribe();onPaste(){setTimeout(()=>{this.loadReport();});}_showError(e){e.ok||(e.error.kind==="missing"?this.notice.set(e.error.message):this.loadError.set(e.error));}async loadReport(){this.loadError.set(null),this.notice.set("");let e=this.reportControl.value,t=ol(e.trim());if(!al(t)){t&&this.notice.set("Enter a valid Warcraft Logs report URL or 16-character report code.");return}let n=this.reportRun.begin();this.reportCode.set(""),this.loadingReport.set(true),this.fights.set([]),this.players.set([]),this.spec.set(""),this.playerDetailGroups.set({}),this.selectionRun.cancel(),this.mapFeature.clear(),this.liveCapture.clear();try{this.loadingMsg.set("Fetching report from Warcraft Logs\u2026");let o=await this.wclApi.getReport(t);if(!this.reportRun.isCurrent(n))return;this._applyReport(o);let a=sm(e),s=(a!=null?this.fights().find(d=>d.id===a):void 0)??this.fights()[this.fights().length-1];this.fightControl.setValue(s?.id??null),this.fights().length||this.notice.set("No boss pulls found in this report."),this._applyAutoPlayer(),this.reportCode.set(t),await this.resolveSelection();}catch(o){a("PostRaidComponent.loadReport",o),this.reportRun.isCurrent(n)&&this._showError(et$1(o,"post-raid.load-report"));}finally{this.reportRun.isCurrent(n)&&this.loadingReport.set(false);}}_applyReport(e){this.fights.set(tl(e.fights)),this.players.set(mm(e.masterData?.actors)),this.reportStartTime.set(e.startTime),this._enemies=e.masterData?.enemies??[];}async _pollOnce(){this.loadError.set(null),this.liveCapture.setStatus("Checking for new pulls\u2026");let e=this.reportCode();try{let t=tl(await this.wclApi.getReportFights(e));if(this._pollSuperseded(e))return;let n=hm(t,this.selectedFightId(),this.ready());if(n==="none"){this.liveCapture.setStatus("No boss pulls found.");return}if(n==="skip"){this.liveCapture.setStatus(`Last updated ${new Date().toLocaleTimeString()}, polling every ${un}s`);return}let o=await this.wclApi.getReport(e);if(this._pollSuperseded(e))return;this._applyReport(o);let a=this.fights()[this.fights().length-1];if(!a){this.liveCapture.setStatus("No boss pulls found.");return}this.notice.set("");let l=this.players().find(d=>d.id===this.selectedPlayerId())?.name??null,s=il(this.fights(),this.players(),a.id);if(this.fightControl.setValue(a.id),this.playerControl.setValue(nl(s,l)),await this.resolveSelection(),this._pollSuperseded(e))return;this.liveCapture.setStatus(`Updated ${new Date().toLocaleTimeString()} - ${a.name}`);}catch(t){if(a("PostRaidComponent._pollOnce",t),this._pollSuperseded(e))return;this._showError(et$1(t,"post-raid.poll")),this.liveCapture.setStatus("Live sync error, retrying on the next check.");}}_pollSuperseded(e){return !this.liveSyncEnabled()||this.reportCode()!==e}async onFightChange(){this.liveSyncEnabled()||(this._applyAutoPlayer(),await this.resolveSelection());}async onPlayerChange(){this._persistPlayerName(),await this.resolveSelection();}async resolveSelection(){let e=this.selectionRun.begin();this.loadError.set(null);let t=this.selectedFightId(),n=this.selectedPlayerId();if(this.spec.set(""),this.loadingAnalysis.set(false),this.mapFeature.clear(),this.liveCapture.clear(),!t||!n)return;this.notice.set("");let o=this.fights().find(a=>a.id===t);if(dm(o?.difficulty)){this.notice.set(cm(o?.name??""));return}this.loadingAnalysis.set(true),this.loadingMsg.set("Fetching player data from Warcraft Logs\u2026");try{let a=await this.wclApi.getPlayerDetails(this.reportCode(),t);if(!this.selectionRun.isCurrent(e))return;this.playerDetailGroups.set(a);let l=rl(a,n);if(!l){this._showError(X$1("Could not resolve the selected player's spec.","post-raid.spec-resolve"));return}this.spec.set(l),this.pullOverviewBusy.set(!0),this.rotationBusy.set(!0),this.burstBusy.set(!0),this.defensiveBusy.set(!0),this.gearBusy.set(!0),this.loadingMsg.set("Fetching analysis data from Warcraft Logs\u2026"),o&&(this.mapFeature.prepare(this.reportCode(),o,n,l,this._enemies),this.liveCapture.prepare(this.reportCode(),this.reportStartTime(),o));}catch(a$1){a("PostRaidComponent.resolveSelection",a$1),this.selectionRun.isCurrent(e)&&this._showError(et$1(a$1,"post-raid.resolve-selection"));}finally{this.selectionRun.isCurrent(e)&&this.loadingAnalysis.set(false);}}_applyAutoPlayer(){let e=this.selectionStore.loadPostRaid()?.playerName??null;this.playerControl.setValue(nl(this.visiblePlayers(),e));}_persistPlayerName(){let e=this.players().find(t=>t.id===this.selectedPlayerId())?.name??null;e&&this.selectionStore.savePostRaid({playerName:e});}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["wl-post-raid"]],features:[cw([{provide:ar$1,useValue:{subscriptSizing:"dynamic"}}])],decls:18,vars:5,consts:[[1,"mx-auto","max-w-[860px]","px-3","md:px-4","pt-6","pb-12"],["appearance","outlined",1,"mb-5","p-4"],["appearance","outline",1,"w-full"],["matInput","","placeholder","https://www.warcraftlogs.com/reports/AbCdEfGh\u2026",3,"keydown.enter","paste","formControl"],[1,"mt-4","border-t","border-[var(--border)]","pt-4"],[1,"mb-4","rounded-lg","border","border-[var(--border)]","bg-[var(--surface)]","px-4","py-3.5","text-[13px]","text-[var(--muted)]"],[1,"mb-4",3,"error"],[3,"message"],[1,"flex","flex-wrap","gap-[14px]"],["appearance","outline",1,"flex-[1_1_200px]"],[3,"selectionChange","formControl"],[1,"flex","items-center","gap-2"],[3,"value"],[3,"src","alt"],[1,"truncate"],[1,"flex","flex-col","gap-6",3,"hidden"],[1,"flex","flex-col","gap-6"],["variant","post",3,"encounter"],[3,"openMap","openClip","busyChange","report","fight","player","showMap","showClip"],[3,"busyChange","availableChange","spec","encounterId","reportCode","fightId","playerId"],[3,"openMap","openClip","busyChange","availableChange","spec","encounterId","report","fight","player","showMap","showClip"],[3,"busyChange","availableChange","spec","encounterId","report","fight","player"]],template:function(t,n){if(t&1&&(yi$2(0,"div",0)(1,"mat-card",1)(2,"mat-form-field",2)(3,"mat-label"),JD(4,"Warcraft Logs Report URL or Code"),Uc$1(),yi$2(5,"input",3),Hp("keydown.enter",function(){return n.loadReport()})("paste",function(){return n.onPaste()}),Uc$1(),EI(),yi$2(6,"mat-error"),JD(7,"Paste a Warcraft Logs report URL or a 16-character report code."),Uc$1()(),Op(8,"wl-live-controls"),rD(9,em,18,4,"div",4),Uc$1(),rD(10,tm,2,1,"div",5),rD(11,im,1,1,"wl-load-state",6),rD(12,nm,1,1,"wl-loading-spinner",7),Dp(13,am,1,1),eD(14,13,qd),tD(),Op(16,"wl-map-panel")(17,"wl-clip-panel"),Uc$1()),t&2){let o;xv(5),kp("formControl",n.reportControl),wI(),xv(4),oD(n.fights().length?9:-1),xv(),oD(n.notice()?10:-1),xv(),oD((o=n.loadError())?11:-1,o),xv(),oD(n.loadingReport()||n.loadingAnalysis()||n.ready()&&n.cardsBusy()?12:-1);}},dependencies:[Qs$1,On,$s$1,Mo,dr$1,lr$1,mi,Qo,Ks,Qs,nc$1,tc$1,ic$1,Pt,zi,lt,mt,St$1,Ze$3,er$1,jt$1,Xs,Js,_$2,Et,Lt,Ut,Kt$1],encapsulation:2})}return i})();var ll=[{path:"",component:sl},{path:"pre",loadComponent:()=>import('./chunk-BxC3gKzy.js').then(i=>i.PreFightComponent)},{path:"**",redirectTo:""}];var Mt=class extends Map{};var pm=new N$3("ng-http-caching-ng-simple-state.config"),fn=class{constructor(r,e){this.adapterClass=r,this.adapterConfig=e;}},oi=new _t$4(()=>({}));var cl=i=>{let r=i.get("cache-control");if(r){let t=r.toLowerCase();if(t.includes("no-store"))return  false;if(t.includes("no-cache"))return  false;let n=t.match(/max-age\s*=\s*(\d+)/);return n?parseInt(n[1],10)*1e3:true}let e=i.get("expires");if(e){let t=Date.parse(e);if(!isNaN(t))return t>Date.now()}return  true},hl=new N$3("ng-http-caching.config"),ul={ALLOW_ALL:"ALLOW_ALL",DISALLOW_ALL:"DISALLOW_ALL"},ai={NONE:"NONE",ALL:"ALL",IDENTICAL:"IDENTICAL",COLLECTION:"COLLECTION"},Je={ALLOW_CACHE:"X-NG-HTTP-CACHING-ALLOW-CACHE",DISALLOW_CACHE:"X-NG-HTTP-CACHING-DISALLOW-CACHE",LIFETIME:"X-NG-HTTP-CACHING-LIFETIME",TAG:"X-NG-HTTP-CACHING-TAG"},fm=Object.values(Je),gm=1e3,_m=gm*60,pl=_m*60,vr=pl*24,fl=vr*365,vm={store:new Mt,lifetime:pl,version:ql$1.major,allowedMethod:["GET","HEAD"],cacheStrategy:ul.ALLOW_ALL,checkResponseHeaders:false,clearCacheOnMutation:ai.NONE};function dl(){return s(r({},vm),{store:new Mt})}var gl=(()=>{class i{constructor(){this.queue=new Map,this.gcLock=false,this.gcLastRun=0,this.devMode=ZF();let e=T$2(hl,{optional:true});if(e){let t=r({},e);t.store instanceof fn&&(t.store=T$2(t.store.adapterClass)),this.config=r(r({},dl()),t);}else this.config=dl();this.runGc();}getConfig(){return this.config}getQueue(){return this.queue}getStore(){return this.config.store}getFromCache(e){let t=this.getKey(e),n=this.config.store.get(t);if(n){if(this.isExpired(n)){this.clearCacheByKey(t);return}return this.deepFreeze(n.response)}}addToCache(e,t){let n={url:e.urlWithParams,response:t,request:e,addedTime:Date.now(),version:this.config.version};if(this.isValid(n)){let o=this.getKey(e);return this.config.store.set(o,n),true}return  false}deleteFromCache(e){let t=this.getKey(e);return this.clearCacheByKey(t)}clearCache(){this.config.store.clear();}clearCacheByKey(e){return this.config.store.delete(e)}clearCacheByKeys(e){let t=0;if(e)for(let n of e)this.clearCacheByKey(n)&&t++;return t}clearCacheByRegex(e){let t=[];return this.config.store.forEach((n,o)=>{e.test(o)&&t.push(o);}),this.clearCacheByKeys(t)}clearCacheByTag(e){let t=[];return this.config.store.forEach((n,o)=>{let a=n.request.headers.get(Je.TAG);a&&a.split(",").includes(e)&&t.push(o);}),this.clearCacheByKeys(t)}runGc(){if(this.gcLock||this.gcLastRun&&Date.now()-this.gcLastRun<1e3)return  false;this.gcLock=true,this.gcLastRun=Date.now();try{let e=[];this.config.store.forEach((t,n)=>{this.isExpired(t)&&e.push(n);}),this.clearCacheByKeys(e);}finally{this.gcLock=false;}return  true}clearCacheByMutation(e){let t=e.context.get(oi),n=t.clearCacheOnMutation!==void 0?t.clearCacheOnMutation:this.config.clearCacheOnMutation;if(typeof n=="function")return n(e)===true?(this.clearCache(),true):false;if(n===false||n===ai.NONE||!["POST","PUT","DELETE","PATCH"].includes(e.method))return  false;if(n===true||n===ai.ALL)return this.clearCache(),true;let o=e.urlWithParams.split("?")[0];if(n===ai.IDENTICAL){let a=new RegExp("^.*@"+this.escapeRegExp(o)+"(\\?|$)");return this.clearCacheByRegex(a),true}if(n===ai.COLLECTION){let a="^.*@"+this.escapeRegExp(o)+"(\\?|$)",l=o.split("/");if(l.length>1){l.pop();let s=l.join("/"),d="^.*@"+this.escapeRegExp(s)+"(\\?|$)";this.clearCacheByRegex(new RegExp(`(${a})|(${d})`));}else this.clearCacheByRegex(new RegExp(a));return  true}return  false}escapeRegExp(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}isExpired(e){let t=e.request.context.get(oi);if(typeof t?.isExpired=="function"){let a=t.isExpired(e);if(a!==void 0)return a}if(typeof this.config.isExpired=="function"){let a=this.config.isExpired(e);if(a!==void 0)return a}if(this.config.version!==e.version)return  true;let n=this.config.lifetime,o=e.request.headers.get(Je.LIFETIME);if(o)n=+o;else if(this.config.checkResponseHeaders){let a=cl(e.response.headers);typeof a=="number"&&(n=a);}if(n===0)return  false;if(n<0||isNaN(n))throw new Error("lifetime must be greater than or equal 0");return e.addedTime+n<Date.now()}isValid(e){let t=e.request.context.get(oi);if(typeof t.isValid=="function"){let n=t.isValid(e);if(n!==void 0)return n}if(typeof this.config.isValid=="function"){let n=this.config.isValid(e);if(n!==void 0)return n}return this.config.version!==e.version||this.config.checkResponseHeaders&&cl(e.response.headers)===false?false:e.response.ok}isCacheable(e){let t=e.context.get(oi);if(typeof t?.isCacheable=="function"){let n=t.isCacheable(e);if(n!==void 0)return n}if(typeof this.config.isCacheable=="function"){let n=this.config.isCacheable(e);if(n!==void 0)return n}return e.headers.has(Je.DISALLOW_CACHE)||this.config.cacheStrategy===ul.DISALLOW_ALL&&!e.headers.has(Je.ALLOW_CACHE)?false:this.config.allowedMethod.length===1&&this.config.allowedMethod[0]==="ALL"?true:this.config.allowedMethod.includes(e.method)}getKey(e){let t=e.context.get(oi);if(typeof t.getKey=="function"){let n=t.getKey(e);if(n!==void 0)return n}if(typeof this.config.getKey=="function"){let n=this.config.getKey(e);if(n!==void 0)return n}return e.method+"@"+e.urlWithParams}getFromQueue(e){let t=this.getKey(e),n=this.queue.get(t);if(n)return n}addToQueue(e,t){let n=this.getKey(e);this.queue.set(n,t);}deleteFromQueue(e){let t=this.getKey(e);return this.queue.delete(t)}deepFreeze(e){return !this.devMode||!e||typeof e!="object"||Object.isFrozen(e)||(Object.freeze(e),Object.keys(e).forEach(t=>this.deepFreeze(e[t]))),e}ngOnDestroy(){this.queue.clear();}static{this.\u0275fac=function(t){return new(t||i)};}static{this.\u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"});}}return i})(),ml=(()=>{class i{constructor(){this.cacheService=T$2(gl);}intercept(e,t){if(this.cacheService.runGc(),!this.cacheService.isCacheable(e))return this.sendRequest(e,t).pipe(xg(l=>{l.type===re$1.Response&&l.ok&&this.cacheService.clearCacheByMutation(e);}));let n=this.cacheService.getFromQueue(e);if(n)return n;let o=this.cacheService.getFromCache(e);if(o)return ts$2(Uh(o.clone()),Se$2);let a=this.sendRequest(e,t).pipe(xg(l=>{l.type===re$1.Response&&this.cacheService.addToCache(e,l);}),Ig(()=>{this.cacheService.deleteFromQueue(e);}),Cg({bufferSize:1,refCount:true}));return this.cacheService.addToQueue(e,a),a}sendRequest(e,t){let n=e.headers,o=false;for(let a of fm)n.has(a)&&(o=true,n=n.delete(a));return o&&(e=e.clone({headers:n})),t.handle(e)}static{this.\u0275fac=function(t){return new(t||i)};}static{this.\u0275prov=re$2({token:i,factory:i.\u0275fac});}}return i})();function _l(i){let r=[gl,{provide:Gn$2,useClass:ml,multi:true},ml];return i&&(r.push({provide:hl,useValue:i}),i.store instanceof fn&&(r.push(i.store.adapterClass),i.store.adapterConfig&&r.push({provide:pm,useValue:i.store.adapterConfig}))),_o$1(r)}var bm=1e4,ym=new Set([ht$1,Tt$2]),wm=new Set([cr$2,lr$2,pr$2]);function vl(i){return wm.has(i)?{[Je.DISALLOW_CACHE]:"1"}:ym.has(i)?{[Je.LIFETIME]:String(bm)}:{}}function bl(){return _l({store:new Mt,lifetime:fl,allowedMethod:["POST"],isCacheable:i=>i.url===Ht$3?void 0:false,getKey:i=>i.url===Ht$3?`${i.method}@${i.url}@${JSON.stringify(i.body)}`:void 0})}var yl=(()=>{class i{http=T$2(Ve$3);inaccessibleCodes=new Set;failedCodes=new Set;takeInaccessibleCodes(){let e=[...this.inaccessibleCodes];return this.inaccessibleCodes.clear(),e}takeFailedCodes(){let e=[...this.failedCodes];return this.failedCodes.clear(),e}async query(e,t,n){let o=r({Authorization:`Bearer ${n}`},vl(e)),a=t.code,l;try{l=await Gh(this.http.post(Ht$3,{query:e,variables:t},{headers:o}));}catch(s){throw s instanceof Y$1?(a&&s.status!==401&&this.failedCodes.add(a),new f(`WCL API error (${s.status})`,s.status)):s}if(l.errors?.length){let s=l.errors[0]?.message||"WCL GraphQL error";throw a&&(this.failedCodes.add(a),/permission/i.test(s)&&this.inaccessibleCodes.add(a)),new f(s,Z$1)}if(l.data===void 0)throw a&&this.failedCodes.add(a),new f("WCL response had no data",Z$1);return l.data}static \u0275fac=function(t){return new(t||i)};static \u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})();var Cm=400,xm=new Set([0,408,429,500,502,503,504]),km=new N$3("RETRY_MAX_ATTEMPTS",{factory:()=>1}),wl=(i,r)=>{let e=T$2(km);return r(i).pipe(Tg({count:e,delay:(t,n)=>{let o=t instanceof Y$1?t.status:-1;return xm.has(o)?Ue$3(Cm*2**(n-1)):Wh(()=>t)}}))};var Cl={providers:[lm$1(),pr(ll,fr()),$s(),yi$1(wi$1(),Ei$1([wl]),vi$1()),bl(),nu(()=>{T$2(qn$2).setDefaultFontSetClass("material-symbols-outlined");}),{provide:tt$1,useExisting:yl},{provide:pt$2,useExisting:Fe$3},...Ae$3]};var Sm=["*",[["mat-toolbar-row"]]],Rm=["*","mat-toolbar-row"],Tm=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return i})(),xl=(()=>{class i{_elementRef=T$2(Mr$2);_platform=T$2(u);_document=T$2(dr$3);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()));}_checkToolbarMixedModes(){this._toolbarRows.length;}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["mat-toolbar"]],contentQueries:function(t,n,o){if(t&1&&$p(o,Tm,5),t&2){let a;MD(a=SD())&&(n._toolbarRows=a);}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(t,n){t&2&&(BD(n.color?"mat-"+n.color:""),Zp("mat-toolbar-multiple-rows",n._toolbarRows.length>0)("mat-toolbar-single-row",n._toolbarRows.length===0));},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:Rm,decls:2,vars:0,template:function(t,n){t&1&&(CD(Sm),bD(0),bD(1,1));},styles:[`.mat-toolbar {
  background: var(--mat-toolbar-container-background-color, var(--mat-sys-surface));
  color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}
.mat-toolbar, .mat-toolbar h1, .mat-toolbar h2, .mat-toolbar h3, .mat-toolbar h4, .mat-toolbar h5, .mat-toolbar h6 {
  font-family: var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));
  font-size: var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));
  line-height: var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));
  font-weight: var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));
  letter-spacing: var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));
  margin: 0;
}
@media (forced-colors: active) {
  .mat-toolbar {
    outline: solid 1px;
  }
}
.mat-toolbar .mat-form-field-underline,
.mat-toolbar .mat-form-field-ripple,
.mat-toolbar .mat-focused .mat-form-field-ripple {
  background-color: currentColor;
}
.mat-toolbar .mat-form-field-label,
.mat-toolbar .mat-focused .mat-form-field-label,
.mat-toolbar .mat-select-value,
.mat-toolbar .mat-select-arrow,
.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow {
  color: inherit;
}
.mat-toolbar .mat-input-element {
  caret-color: currentColor;
}
.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed {
  --mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
  --mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}

.mat-toolbar-row, .mat-toolbar-single-row {
  display: flex;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-row, .mat-toolbar-single-row {
    height: var(--mat-toolbar-mobile-height, 56px);
  }
}

.mat-toolbar-multiple-rows {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-multiple-rows {
    min-height: var(--mat-toolbar-mobile-height, 56px);
  }
}
`],encapsulation:2})}return i})();var kl=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[er$3]})}return i})();var _n=["*"],Mm=["content"],Sl=[[["mat-drawer"],["mat-sidenav"]],[["mat-drawer-content"],["mat-sidenav-content"]],"*"],Rl=["mat-drawer, mat-sidenav","mat-drawer-content, mat-sidenav-content","*"];function Em(i,r){if(i&1){let e=hD();yi$2(0,"div",1),Hp("click",function(){mu(e);let n=wD();return yu(n._onBackdropClicked())}),Uc$1();}if(i&2){let e=wD();Zp("mat-drawer-shown",e._isShowingBackdrop());}}function Am(i,r){i&1&&(yi$2(0,"mat-drawer-content"),bD(1,2),Uc$1());}function Dm(i,r){if(i&1){let e=hD();yi$2(0,"div",1),Hp("click",function(){mu(e);let n=wD();return yu(n._onBackdropClicked())}),Uc$1();}if(i&2){let e=wD();Zp("mat-drawer-shown",e._isShowingBackdrop());}}function Lm(i,r){i&1&&(yi$2(0,"mat-sidenav-content"),bD(1,2),Uc$1());}var Pm=`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--mat-sidenav-content-text-color, var(--mat-sys-on-background));
  background-color: var(--mat-sidenav-content-background-color, var(--mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--mat-sidenav-scrim-color, color-mix(in srgb, var(--mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--mat-sidenav-container-text-color, var(--mat-sys-on-surface-variant));
  box-shadow: var(--mat-sidenav-container-elevation-shadow, none);
  background-color: var(--mat-sidenav-container-background-color, var(--mat-sys-surface));
  border-top-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  width: var(--mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`;var Om=new N$3("MAT_DRAWER_DEFAULT_AUTOSIZE",{providedIn:"root",factory:()=>false}),Cr=new N$3("MAT_DRAWER_CONTAINER"),si=(()=>{class i extends ls$1{_platform=T$2(u);_changeDetectorRef=T$2($F);_element=T$2(Mr$2);_ngZone=T$2(De$3);_isInert=false;_container=T$2(yr);ngAfterContentInit(){this._container._contentMarginChanges.subscribe(()=>this._changeDetectorRef.markForCheck());}_drawerToggled(e){e.opened?this._ngZone.runOutsideAngular(()=>{e._animationEnd.pipe(gg(50),dn$2(1)).subscribe(()=>this._updateInert());}):this._updateInert();}_updateInert(){let e=this._container._isShowingBackdrop();if(e!==this._isInert){let t=this._element.nativeElement;this._isInert=e,e?t.setAttribute("inert","true"):t.removeAttribute("inert");}}_shouldBeHidden(){if(this._platform.isBrowser)return  false;let{start:e,end:t}=this._container;return e!=null&&e.mode!=="over"&&e.opened||t!=null&&t.mode!=="over"&&t.opened}static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-drawer-content"]],hostAttrs:[1,"mat-drawer-content"],hostVars:6,hostBindings:function(t,n){t&2&&(Qp("margin-left",n._container._contentMargins.left,"px")("margin-right",n._container._contentMargins.right,"px"),Zp("mat-drawer-content-hidden",n._shouldBeHidden()));},features:[cw([{provide:ls$1,useExisting:i}]),vp],ngContentSelectors:_n,decls:1,vars:0,template:function(t,n){t&1&&(CD(),bD(0));},encapsulation:2})}return i})(),br=(()=>{class i{_elementRef=T$2(Mr$2);_focusTrapFactory=T$2(vn);_focusMonitor=T$2(Nt$1);_platform=T$2(u);_ngZone=T$2(De$3);_renderer=T$2(hI);_interactivityChecker=T$2(Fe$2);_doc=T$2(dr$3);_container=T$2(Cr,{optional:true});_focusTrap=null;_elementFocusedBeforeDrawerWasOpened=null;_eventCleanups;_isAttached=false;_anchor=null;get position(){return this._position}set position(e){e=e==="end"?"end":"start",e!==this._position&&(this._isAttached&&this._updatePositionInParent(e),this._position=e,this.onPositionChanged.emit());}_position="start";get mode(){return this._mode}set mode(e){this._mode=e,this._updateFocusTrapState(),this._modeChanged.next();}_mode="over";get disableClose(){return this._disableClose}set disableClose(e){this._disableClose=ti$2(e);}_disableClose=false;get autoFocus(){let e=this._autoFocus;return e??(this.mode==="side"?"dialog":"first-tabbable")}set autoFocus(e){(e==="true"||e==="false"||e==null)&&(e=ti$2(e)),this._autoFocus=e;}_autoFocus;get opened(){return this._opened()}set opened(e){this.toggle(ti$2(e));}_opened=Ho$1(false);_openedVia=null;_animationStarted=new ie$1;_animationEnd=new ie$1;openedChange=new We$3(true);_openedStream=this.openedChange.pipe(qn$3(e=>e),le$1(()=>{}));openedStart=this._animationStarted.pipe(qn$3(()=>this.opened),rs$2(void 0));_closedStream=this.openedChange.pipe(qn$3(e=>!e),le$1(()=>{}));closedStart=this._animationStarted.pipe(qn$3(()=>!this.opened),rs$2(void 0));_destroyed=new ie$1;onPositionChanged=new We$3;_content;_modeChanged=new ie$1;_injector=T$2(Ee$4);_changeDetectorRef=T$2($F);constructor(){this.openedChange.pipe(Sg(this._destroyed)).subscribe(e=>{e?(this._elementFocusedBeforeDrawerWasOpened=this._doc.activeElement,this._takeFocus()):this._isFocusWithinDrawer()&&this._restoreFocus(this._openedVia||"program");}),this._eventCleanups=this._ngZone.runOutsideAngular(()=>{let e=this._renderer,t=this._elementRef.nativeElement;return [e.listen(t,"keydown",n=>{n.keyCode===27&&!this.disableClose&&!Ue$1(n)&&this._ngZone.run(()=>{this.close(),n.stopPropagation(),n.preventDefault();});}),e.listen(t,"transitionend",this._handleTransitionEvent),e.listen(t,"transitioncancel",this._handleTransitionEvent)]}),this._animationEnd.subscribe(()=>{this.openedChange.emit(this.opened);});}_focusByCssSelector(e,t){let n=this._elementRef.nativeElement.querySelector(e);n&&(this._interactivityChecker.isFocusable(n)||(n.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let o=()=>{a(),l(),n.removeAttribute("tabindex");},a=this._renderer.listen(n,"blur",o),l=this._renderer.listen(n,"mousedown",o);})),n.focus(t));}_takeFocus(){if(!this._focusTrap)return;let e=this._elementRef.nativeElement;switch(this.autoFocus){case  false:case "dialog":return;case  true:case "first-tabbable":sv(()=>{!this._focusTrap.focusInitialElement()&&typeof e.focus=="function"&&e.focus();},{injector:this._injector});break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');break;default:this._focusByCssSelector(this.autoFocus);break}}_restoreFocus(e){this.autoFocus!=="dialog"&&(this._elementFocusedBeforeDrawerWasOpened?this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened,e):this._elementRef.nativeElement.blur(),this._elementFocusedBeforeDrawerWasOpened=null);}_isFocusWithinDrawer(){let e=this._doc.activeElement;return !!e&&this._elementRef.nativeElement.contains(e)}ngAfterViewInit(){this._isAttached=true,this._position==="end"&&this._updatePositionInParent("end"),this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._updateFocusTrapState());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._focusTrap?.destroy(),this._anchor?.remove(),this._anchor=null,this._animationStarted.complete(),this._animationEnd.complete(),this._modeChanged.complete(),this._destroyed.next(),this._destroyed.complete();}open(e){return this.toggle(true,e)}close(){return this.toggle(false)}_closeViaBackdropClick(){return this._setOpen(false,true,"mouse")}toggle(e=!this.opened,t){e&&t&&(this._openedVia=t);let n=this._setOpen(e,!e&&this._isFocusWithinDrawer(),this._openedVia||"program");return e||(this._openedVia=null),n}_setOpen(e,t,n){return e===this.opened?Promise.resolve(e?"open":"close"):(this._opened.set(e),(this._container?._content||this._container?._userContent)?._drawerToggled(this),this._container?._transitionsEnabled?(this._setIsAnimating(true),setTimeout(()=>this._animationStarted.next())):setTimeout(()=>{this._animationStarted.next(),this._animationEnd.next();}),this._elementRef.nativeElement.classList.toggle("mat-drawer-opened",e),!e&&t&&this._restoreFocus(n),this._changeDetectorRef.markForCheck(),this._updateFocusTrapState(),new Promise(o=>{this.openedChange.pipe(dn$2(1)).subscribe(a=>o(a?"open":"close"));}))}_setIsAnimating(e){this._elementRef.nativeElement.classList.toggle("mat-drawer-animating",e);}_getWidth(){return this._elementRef.nativeElement.offsetWidth||0}_updateFocusTrapState(){this._focusTrap&&(this._focusTrap.enabled=this.opened&&!!this._container?._isShowingBackdrop());}_updatePositionInParent(e){if(!this._platform.isBrowser)return;let t=this._elementRef.nativeElement,n=t.parentNode;e==="end"?(this._anchor||(this._anchor=this._doc.createComment("mat-drawer-anchor"),n.insertBefore(this._anchor,t)),n.appendChild(t)):this._anchor&&this._anchor.parentNode.insertBefore(t,this._anchor);}_handleTransitionEvent=e=>{let t=this._elementRef.nativeElement;e.target===t&&this._ngZone.run(()=>{e.type==="transitionend"&&this._setIsAnimating(false),this._animationEnd.next(e);});};static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["mat-drawer"]],viewQuery:function(t,n){if(t&1&&Up(Mm,5),t&2){let o;MD(o=SD())&&(n._content=o.first);}},hostAttrs:[1,"mat-drawer"],hostVars:12,hostBindings:function(t,n){t&2&&(Rp("align",null)("tabIndex",n.mode!=="side"?"-1":null),Qp("visibility",!n._container&&!n.opened?"hidden":null),Zp("mat-drawer-end",n.position==="end")("mat-drawer-over",n.mode==="over")("mat-drawer-push",n.mode==="push")("mat-drawer-side",n.mode==="side"));},inputs:{position:"position",mode:"mode",disableClose:"disableClose",autoFocus:"autoFocus",opened:"opened"},outputs:{openedChange:"openedChange",_openedStream:"opened",openedStart:"openedStart",_closedStream:"closed",closedStart:"closedStart",onPositionChanged:"positionChanged"},exportAs:["matDrawer"],ngContentSelectors:_n,decls:3,vars:0,consts:[["content",""],["cdkScrollable","",1,"mat-drawer-inner-container"]],template:function(t,n){t&1&&(CD(),yi$2(0,"div",1,0),bD(2),Uc$1());},dependencies:[ls$1],encapsulation:2})}return i})(),yr=(()=>{class i{_dir=T$2(Ri$1,{optional:true});_element=T$2(Mr$2);_ngZone=T$2(De$3);_changeDetectorRef=T$2($F);_animationDisabled=K();_transitionsEnabled=false;_allDrawers;_drawers=new oi$3;_content;_userContent;get start(){return this._start}get end(){return this._end}get autosize(){return this._autosize}set autosize(e){this._autosize=ti$2(e);}_autosize=T$2(Om);get hasBackdrop(){return this._drawerHasBackdrop(this._start)||this._drawerHasBackdrop(this._end)}set hasBackdrop(e){this._backdropOverride=e==null?null:ti$2(e);}_backdropOverride=null;backdropClick=new We$3;_start=null;_end=null;_left=null;_right=null;_destroyed=new ie$1;_doCheckSubject=new ie$1;_contentMargins={left:null,right:null};_contentMarginChanges=new ie$1;get scrollable(){return this._userContent||this._content}_injector=T$2(Ee$4);constructor(){let e=T$2(u),t=T$2(pe);this._dir?.change.pipe(Sg(this._destroyed)).subscribe(()=>{this._validateDrawers(),this.updateContentMargins();}),t.change().pipe(Sg(this._destroyed)).subscribe(()=>this.updateContentMargins()),!this._animationDisabled&&e.isBrowser&&this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._element.nativeElement.classList.add("mat-drawer-transition"),this._transitionsEnabled=true;},200);});}ngAfterContentInit(){this._allDrawers.changes.pipe(_g(this._allDrawers),Sg(this._destroyed)).subscribe(e=>{this._drawers.reset(e.filter(t=>!t._container||t._container===this)),this._drawers.notifyOnChanges();}),this._drawers.changes.pipe(_g(null)).subscribe(()=>{this._validateDrawers(),this._drawers.forEach(e=>{this._watchDrawerToggle(e),this._watchDrawerPosition(e),this._watchDrawerMode(e);}),(!this._drawers.length||this._isDrawerOpen(this._start)||this._isDrawerOpen(this._end))&&this.updateContentMargins(),this._changeDetectorRef.markForCheck();}),this._ngZone.runOutsideAngular(()=>{this._doCheckSubject.pipe(hg(10),Sg(this._destroyed)).subscribe(()=>this.updateContentMargins());});}ngOnDestroy(){this._contentMarginChanges.complete(),this._doCheckSubject.complete(),this._drawers.destroy(),this._destroyed.next(),this._destroyed.complete();}open(){this._drawers.forEach(e=>e.open());}close(){this._drawers.forEach(e=>e.close());}updateContentMargins(){let e=0,t=0;if(this._left&&this._left.opened){if(this._left.mode=="side")e+=this._left._getWidth();else if(this._left.mode=="push"){let n=this._left._getWidth();e+=n,t-=n;}}if(this._right&&this._right.opened){if(this._right.mode=="side")t+=this._right._getWidth();else if(this._right.mode=="push"){let n=this._right._getWidth();t+=n,e-=n;}}e=e||null,t=t||null,(e!==this._contentMargins.left||t!==this._contentMargins.right)&&(this._contentMargins={left:e,right:t},this._ngZone.run(()=>this._contentMarginChanges.next(this._contentMargins)));}ngDoCheck(){this._autosize&&this._isPushed()&&this._ngZone.runOutsideAngular(()=>this._doCheckSubject.next());}_watchDrawerToggle(e){e._animationStarted.pipe(Sg(this._drawers.changes)).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck();}),e.mode!=="side"&&e.openedChange.pipe(Sg(this._drawers.changes)).subscribe(()=>this._setContainerClass(e.opened));}_watchDrawerPosition(e){e.onPositionChanged.pipe(Sg(this._drawers.changes)).subscribe(()=>{sv({read:()=>this._validateDrawers()},{injector:this._injector});});}_watchDrawerMode(e){e._modeChanged.pipe(Sg(dg(this._drawers.changes,this._destroyed))).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck();});}_setContainerClass(e){let t=this._element.nativeElement.classList,n="mat-drawer-container-has-open";e?t.add(n):t.remove(n);}_validateDrawers(){this._start=this._end=null,this._drawers.forEach(e=>{e.position=="end"?(this._end!=null,this._end=e):(this._start!=null,this._start=e);}),this._right=this._left=null,this._dir&&this._dir.value==="rtl"?(this._left=this._end,this._right=this._start):(this._left=this._start,this._right=this._end);}_isPushed(){return this._isDrawerOpen(this._start)&&this._start.mode!="over"||this._isDrawerOpen(this._end)&&this._end.mode!="over"}_onBackdropClicked(){this.backdropClick.emit(),this._closeModalDrawersViaBackdrop();}_closeModalDrawersViaBackdrop(){[this._start,this._end].filter(e=>e&&!e.disableClose&&this._drawerHasBackdrop(e)).forEach(e=>e._closeViaBackdropClick());}_isShowingBackdrop(){return this._isDrawerOpen(this._start)&&this._drawerHasBackdrop(this._start)||this._isDrawerOpen(this._end)&&this._drawerHasBackdrop(this._end)}_isDrawerOpen(e){return e!=null&&e.opened}_drawerHasBackdrop(e){return this._backdropOverride==null?!!e&&e.mode!=="side":this._backdropOverride}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["mat-drawer-container"]],contentQueries:function(t,n,o){if(t&1&&$p(o,si,5)(o,br,5),t&2){let a;MD(a=SD())&&(n._content=a.first),MD(a=SD())&&(n._allDrawers=a);}},viewQuery:function(t,n){if(t&1&&Up(si,5),t&2){let o;MD(o=SD())&&(n._userContent=o.first);}},hostAttrs:[1,"mat-drawer-container"],hostVars:2,hostBindings:function(t,n){t&2&&Zp("mat-drawer-container-explicit-backdrop",n._backdropOverride);},inputs:{autosize:"autosize",hasBackdrop:"hasBackdrop"},outputs:{backdropClick:"backdropClick"},exportAs:["matDrawerContainer"],features:[cw([{provide:Cr,useExisting:i}])],ngContentSelectors:Rl,decls:4,vars:2,consts:[[1,"mat-drawer-backdrop",3,"mat-drawer-shown"],[1,"mat-drawer-backdrop",3,"click"]],template:function(t,n){t&1&&(CD(Sl),rD(0,Em,1,2,"div",0),bD(1),bD(2,1),rD(3,Am,2,0,"mat-drawer-content")),t&2&&(oD(n.hasBackdrop?0:-1),xv(3),oD(n._content?-1:3));},dependencies:[si],styles:[`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--mat-sidenav-content-text-color, var(--mat-sys-on-background));
  background-color: var(--mat-sidenav-content-background-color, var(--mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--mat-sidenav-scrim-color, color-mix(in srgb, var(--mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--mat-sidenav-container-text-color, var(--mat-sys-on-surface-variant));
  box-shadow: var(--mat-sidenav-container-elevation-shadow, none);
  background-color: var(--mat-sidenav-container-background-color, var(--mat-sys-surface));
  border-top-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  width: var(--mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-left-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-bottom-right-radius: var(--mat-sidenav-container-shape, var(--mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`],encapsulation:2})}return i})(),gn=(()=>{class i extends si{static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-sidenav-content"]],hostAttrs:[1,"mat-drawer-content","mat-sidenav-content"],features:[cw([{provide:ls$1,useExisting:i},{provide:si,useExisting:i}]),vp],ngContentSelectors:_n,decls:1,vars:0,template:function(t,n){t&1&&(CD(),bD(0));},encapsulation:2})}return i})(),xr=(()=>{class i extends br{get fixedInViewport(){return this._fixedInViewport}set fixedInViewport(e){this._fixedInViewport=ti$2(e);}_fixedInViewport=false;get fixedTopGap(){return this._fixedTopGap}set fixedTopGap(e){this._fixedTopGap=Ct$2(e);}_fixedTopGap=0;get fixedBottomGap(){return this._fixedBottomGap}set fixedBottomGap(e){this._fixedBottomGap=Ct$2(e);}_fixedBottomGap=0;static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-sidenav"]],hostAttrs:[1,"mat-drawer","mat-sidenav"],hostVars:16,hostBindings:function(t,n){t&2&&(Rp("tabIndex",n.mode!=="side"?"-1":null)("align",null),Qp("top",n.fixedInViewport?n.fixedTopGap:null,"px")("bottom",n.fixedInViewport?n.fixedBottomGap:null,"px"),Zp("mat-drawer-end",n.position==="end")("mat-drawer-over",n.mode==="over")("mat-drawer-push",n.mode==="push")("mat-drawer-side",n.mode==="side")("mat-sidenav-fixed",n.fixedInViewport));},inputs:{fixedInViewport:"fixedInViewport",fixedTopGap:"fixedTopGap",fixedBottomGap:"fixedBottomGap"},exportAs:["matSidenav"],features:[cw([{provide:br,useExisting:i}]),vp],ngContentSelectors:_n,decls:3,vars:0,consts:[["content",""],["cdkScrollable","",1,"mat-drawer-inner-container"]],template:function(t,n){t&1&&(CD(),yi$2(0,"div",1,0),bD(2),Uc$1());},dependencies:[ls$1],encapsulation:2})}return i})(),li=(()=>{class i extends yr{_allDrawers=void 0;_content=void 0;static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-sidenav-container"]],contentQueries:function(t,n,o){if(t&1&&$p(o,gn,5)(o,xr,5),t&2){let a;MD(a=SD())&&(n._content=a.first),MD(a=SD())&&(n._allDrawers=a);}},hostAttrs:[1,"mat-drawer-container","mat-sidenav-container"],hostVars:2,hostBindings:function(t,n){t&2&&Zp("mat-drawer-container-explicit-backdrop",n._backdropOverride);},exportAs:["matSidenavContainer"],features:[cw([{provide:Cr,useExisting:i},{provide:yr,useExisting:i}]),vp],ngContentSelectors:Rl,decls:4,vars:2,consts:[[1,"mat-drawer-backdrop",3,"mat-drawer-shown"],[1,"mat-drawer-backdrop",3,"click"]],template:function(t,n){t&1&&(CD(Sl),rD(0,Dm,1,2,"div",0),bD(1),bD(2,1),rD(3,Lm,2,0,"mat-sidenav-content")),t&2&&(oD(n.hasBackdrop?0:-1),xv(3),oD(n._content?-1:3));},dependencies:[gn],styles:[Pm],encapsulation:2})}return i})(),Tl=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[Xe$2,er$3,Xe$2]})}return i})();var Il=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[er$3]})}return i})();var Fm=["*"],Um=`.mdc-list {
  margin: 0;
  padding: 8px 0;
  list-style-type: none;
}
.mdc-list:focus {
  outline: none;
}

.mdc-list-item {
  display: flex;
  position: relative;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  align-items: stretch;
  cursor: pointer;
  padding-left: 16px;
  padding-right: 16px;
  background-color: var(--mat-list-list-item-container-color, transparent);
  border-radius: var(--mat-list-list-item-container-shape, var(--mat-sys-corner-none));
}
.mdc-list-item.mdc-list-item--selected {
  background-color: var(--mat-list-list-item-selected-container-color);
}
.mdc-list-item:focus {
  outline: 0;
}
.mdc-list-item.mdc-list-item--disabled {
  cursor: auto;
}
.mdc-list-item.mdc-list-item--with-one-line {
  height: var(--mat-list-list-item-one-line-container-height, 48px);
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__start {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-two-lines {
  height: var(--mat-list-list-item-two-line-container-height, 64px);
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-three-lines {
  height: var(--mat-list-list-item-three-line-container-height, 88px);
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--selected::before, .mdc-list-item.mdc-list-item--selected:focus::before, .mdc-list-item:not(.mdc-list-item--selected):focus::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: "";
  pointer-events: none;
}

a.mdc-list-item {
  color: inherit;
  text-decoration: none;
}

.mdc-list-item__start {
  fill: currentColor;
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--mat-list-list-item-leading-icon-color, var(--mat-sys-on-surface-variant));
  width: var(--mat-list-list-item-leading-icon-size, 24px);
  height: var(--mat-list-list-item-leading-icon-size, 24px);
  margin-left: 16px;
  margin-right: 32px;
}
[dir=rtl] .mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-left: 32px;
  margin-right: 16px;
}
.mdc-list-item--with-leading-icon:hover .mdc-list-item__start {
  color: var(--mat-list-list-item-hover-leading-icon-color);
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start {
  width: var(--mat-list-list-item-leading-avatar-size, 40px);
  height: var(--mat-list-list-item-leading-avatar-size, 40px);
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start, [dir=rtl] .mdc-list-item--with-leading-avatar .mdc-list-item__start {
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}

.mdc-list-item__end {
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  font-family: var(--mat-list-list-item-trailing-supporting-text-font, var(--mat-sys-label-small-font));
  line-height: var(--mat-list-list-item-trailing-supporting-text-line-height, var(--mat-sys-label-small-line-height));
  font-size: var(--mat-list-list-item-trailing-supporting-text-size, var(--mat-sys-label-small-size));
  font-weight: var(--mat-list-list-item-trailing-supporting-text-weight, var(--mat-sys-label-small-weight));
  letter-spacing: var(--mat-list-list-item-trailing-supporting-text-tracking, var(--mat-sys-label-small-tracking));
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-trailing-icon-color, var(--mat-sys-on-surface-variant));
  width: var(--mat-list-list-item-trailing-icon-size, 24px);
  height: var(--mat-list-list-item-trailing-icon-size, 24px);
}
.mdc-list-item--with-trailing-icon:hover .mdc-list-item__end {
  color: var(--mat-list-list-item-hover-trailing-icon-color);
}
.mdc-list-item.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  color: var(--mat-list-list-item-trailing-supporting-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-list-item--selected.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-selected-trailing-icon-color, var(--mat-sys-primary));
}

.mdc-list-item__content {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  align-self: center;
  flex: 1;
  pointer-events: none;
}
.mdc-list-item--with-two-lines .mdc-list-item__content, .mdc-list-item--with-three-lines .mdc-list-item__content {
  align-self: stretch;
}

.mdc-list-item__primary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: var(--mat-list-list-item-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-list-list-item-label-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-list-list-item-label-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-list-list-item-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-list-list-item-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-list-list-item-label-text-tracking, var(--mat-sys-body-large-tracking));
}
.mdc-list-item:hover .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-hover-label-text-color, var(--mat-sys-on-surface));
}
.mdc-list-item:focus .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-focus-label-text-color, var(--mat-sys-on-surface));
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text, .mdc-list-item--with-three-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}

.mdc-list-item__secondary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  margin-top: 0;
  color: var(--mat-list-list-item-supporting-text-color, var(--mat-sys-on-surface-variant));
  font-family: var(--mat-list-list-item-supporting-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-list-list-item-supporting-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-list-list-item-supporting-text-size, var(--mat-sys-body-medium-size));
  font-weight: var(--mat-list-list-item-supporting-text-weight, var(--mat-sys-body-medium-weight));
  letter-spacing: var(--mat-list-list-item-supporting-text-tracking, var(--mat-sys-body-medium-tracking));
}
.mdc-list-item__secondary-text::before {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-three-lines .mdc-list-item__secondary-text {
  white-space: normal;
  line-height: 20px;
}
.mdc-list-item--with-overline .mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: auto;
}

.mdc-list-item--with-leading-radio.mdc-list-item,
.mdc-list-item--with-leading-checkbox.mdc-list-item,
.mdc-list-item--with-leading-icon.mdc-list-item,
.mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
[dir=rtl] .mdc-list-item--with-leading-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-checkbox.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-icon.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  display: block;
  margin-top: 0;
  line-height: normal;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-trailing-icon.mdc-list-item, [dir=rtl] .mdc-list-item--with-trailing-icon.mdc-list-item {
  padding-left: 0;
  padding-right: 0;
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 16px;
}

.mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  -webkit-user-select: none;
  user-select: none;
  margin-left: 28px;
  margin-right: 16px;
}
[dir=rtl] .mdc-list-item--with-trailing-meta .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 28px;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end {
  display: block;
  line-height: normal;
  align-self: flex-start;
  margin-top: 0;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end::before, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-leading-radio .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 8px;
  margin-right: 24px;
}
[dir=rtl] .mdc-list-item--with-leading-radio .mdc-list-item__start,
[dir=rtl] .mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 24px;
  margin-right: 8px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-item--with-trailing-radio.mdc-list-item,
.mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-left: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, [dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-right: 0;
}
.mdc-list-item--with-trailing-radio .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 24px;
  margin-right: 8px;
}
[dir=rtl] .mdc-list-item--with-trailing-radio .mdc-list-item__end,
[dir=rtl] .mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 8px;
  margin-right: 24px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-three-lines .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-group__subheader {
  margin: 0.75rem 16px;
}

.mdc-list-item--disabled .mdc-list-item__start,
.mdc-list-item--disabled .mdc-list-item__content,
.mdc-list-item--disabled .mdc-list-item__end {
  opacity: 1;
}
.mdc-list-item--disabled .mdc-list-item__primary-text,
.mdc-list-item--disabled .mdc-list-item__secondary-text {
  opacity: var(--mat-list-list-item-disabled-label-text-opacity, 0.3);
}
.mdc-list-item--disabled.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--mat-list-list-item-disabled-leading-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-leading-icon-opacity, 0.38);
}
.mdc-list-item--disabled.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-disabled-trailing-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-trailing-icon-opacity, 0.38);
}

.mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing, [dir=rtl] .mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing {
  padding-left: 0;
  padding-right: 0;
}

.mdc-list-item.mdc-list-item--disabled .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-disabled-label-text-color, var(--mat-sys-on-surface));
}

.mdc-list-item:hover::before {
  background-color: var(--mat-list-list-item-hover-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}

.mdc-list-item.mdc-list-item--disabled::before {
  background-color: var(--mat-list-list-item-disabled-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}

.mdc-list-item:focus::before {
  background-color: var(--mat-list-list-item-focus-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}

.mdc-list-item--disabled .mdc-radio,
.mdc-list-item--disabled .mdc-checkbox {
  opacity: var(--mat-list-list-item-disabled-label-text-opacity, 0.3);
}

.mdc-list-item--with-leading-avatar .mat-mdc-list-item-avatar {
  border-radius: var(--mat-list-list-item-leading-avatar-shape, var(--mat-sys-corner-full));
  background-color: var(--mat-list-list-item-leading-avatar-color, var(--mat-sys-primary-container));
}

.mat-mdc-list-item-icon {
  font-size: var(--mat-list-list-item-leading-icon-size, 24px);
}

@media (forced-colors: active) {
  a.mdc-list-item--activated::after {
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
  a.mdc-list-item--activated [dir=rtl]::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-list-base {
  display: block;
}
.mat-mdc-list-base .mdc-list-item__start,
.mat-mdc-list-base .mdc-list-item__end,
.mat-mdc-list-base .mdc-list-item__content {
  pointer-events: auto;
}

.mat-mdc-list-item,
.mat-mdc-list-option {
  width: 100%;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-list-item:not(.mat-mdc-list-item-interactive),
.mat-mdc-list-option:not(.mat-mdc-list-item-interactive) {
  cursor: default;
}
.mat-mdc-list-item .mat-divider-inset,
.mat-mdc-list-option .mat-divider-inset {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
.mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-left: 72px;
}
[dir=rtl] .mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
[dir=rtl] .mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-right: 72px;
}

.mat-mdc-list-item-interactive::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  content: "";
  opacity: 0;
  pointer-events: none;
  border-radius: inherit;
}

.mat-mdc-list-item > .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-list-item:focus-visible > .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-line.mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: normal;
}
.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-unscoped-content.mdc-list-item__secondary-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

mat-action-list button {
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  outline: inherit;
  -webkit-tap-highlight-color: transparent;
  text-align: start;
}
mat-action-list button::-moz-focus-inner {
  border: 0;
}

.mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-inline-start: var(--mat-list-list-item-leading-icon-start-space, 16px);
  margin-inline-end: var(--mat-list-list-item-leading-icon-end-space, 16px);
}

.mat-mdc-nav-list .mat-mdc-list-item {
  border-radius: var(--mat-list-active-indicator-shape, var(--mat-sys-corner-full));
  --mat-focus-indicator-border-radius: var(--mat-list-active-indicator-shape, var(--mat-sys-corner-full));
}
.mat-mdc-nav-list .mat-mdc-list-item.mdc-list-item--activated {
  background-color: var(--mat-list-active-indicator-color, var(--mat-sys-secondary-container));
}
`,zm=["unscopedContent"],jm=["text"],Bm=[[["","matListItemAvatar",""],["","matListItemIcon",""]],[["","matListItemTitle",""]],[["","matListItemLine",""]],"*",[["","matListItemMeta",""]],[["mat-divider"]]],Hm=["[matListItemAvatar],[matListItemIcon]","[matListItemTitle]","[matListItemLine]","*","[matListItemMeta]","mat-divider"];var Vm=new N$3("ListOption"),Sr=(()=>{class i{_elementRef=T$2(Mr$2);static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["","matListItemTitle",""]],hostAttrs:[1,"mat-mdc-list-item-title","mdc-list-item__primary-text"]})}return i})(),$m=(()=>{class i{_elementRef=T$2(Mr$2);static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["","matListItemLine",""]],hostAttrs:[1,"mat-mdc-list-item-line","mdc-list-item__secondary-text"]})}return i})(),qm=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["","matListItemMeta",""]],hostAttrs:[1,"mat-mdc-list-item-meta","mdc-list-item__end"]})}return i})(),Ml=(()=>{class i{_listOption=T$2(Vm,{optional:true});_isAlignedAtStart(){return !this._listOption||this._listOption?._getTogglePosition()==="after"}static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,hostVars:4,hostBindings:function(t,n){t&2&&Zp("mdc-list-item__start",n._isAlignedAtStart())("mdc-list-item__end",!n._isAlignedAtStart());}})}return i})(),Gm=(()=>{class i extends Ml{static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275dir=pE({type:i,selectors:[["","matListItemAvatar",""]],hostAttrs:[1,"mat-mdc-list-item-avatar"],features:[vp]})}return i})(),Rr=(()=>{class i extends Ml{static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275dir=pE({type:i,selectors:[["","matListItemIcon",""]],hostAttrs:[1,"mat-mdc-list-item-icon"],features:[vp]})}return i})(),Wm=new N$3("MAT_LIST_CONFIG"),kr=(()=>{class i{_isNonInteractive=true;get disableRipple(){return this._disableRipple}set disableRipple(e){this._disableRipple=ti$2(e);}_disableRipple=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(ti$2(e));}_disabled=Ho$1(false);_defaultOptions=T$2(Wm,{optional:true});static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,hostVars:1,hostBindings:function(t,n){t&2&&Rp("aria-disabled",n.disabled);},inputs:{disableRipple:"disableRipple",disabled:"disabled"}})}return i})(),Qm=(()=>{class i{_elementRef=T$2(Mr$2);_ngZone=T$2(De$3);_listBase=T$2(kr,{optional:true});_platform=T$2(u);_hostElement;_isButtonElement;_noopAnimations=K();_avatars;_icons;set lines(e){this._explicitLines=Ct$2(e,null),this._updateItemLines(false);}_explicitLines=null;get disableRipple(){return this.disabled||this._disableRipple||this._noopAnimations||!!this._listBase?.disableRipple}set disableRipple(e){this._disableRipple=ti$2(e);}_disableRipple=false;get disabled(){return this._disabled()||!!this._listBase?.disabled}set disabled(e){this._disabled.set(ti$2(e));}_disabled=Ho$1(false);_subscriptions=new G$2;_rippleRenderer=null;_hasUnscopedTextContent=false;rippleConfig;get rippleDisabled(){return this.disableRipple||!!this.rippleConfig.disabled}constructor(){T$2(bi$2).load(qe$1);let e=T$2(Kt$2,{optional:true});this.rippleConfig=e||{},this._hostElement=this._elementRef.nativeElement,this._isButtonElement=this._hostElement.nodeName.toLowerCase()==="button",this._listBase&&!this._listBase._isNonInteractive&&this._initInteractiveListItem(),this._isButtonElement&&!this._hostElement.hasAttribute("type")&&this._hostElement.setAttribute("type","button");}ngAfterViewInit(){this._monitorProjectedLinesAndTitle(),this._updateItemLines(true);}ngOnDestroy(){this._subscriptions.unsubscribe(),this._rippleRenderer!==null&&this._rippleRenderer._removeTriggerEvents();}_hasIconOrAvatar(){return !!(this._avatars.length||this._icons.length)}_initInteractiveListItem(){this._hostElement.classList.add("mat-mdc-list-item-interactive"),this._rippleRenderer=new X(this,this._ngZone,this._hostElement,this._platform,T$2(Ee$4)),this._rippleRenderer.setupTriggerEvents(this._hostElement);}_monitorProjectedLinesAndTitle(){this._ngZone.runOutsideAngular(()=>{this._subscriptions.add(dg(this._lines.changes,this._titles.changes).subscribe(()=>this._updateItemLines(false)));});}_updateItemLines(e){if(!this._lines||!this._titles||!this._unscopedContent)return;e&&this._checkDomForUnscopedTextContent();let t=this._explicitLines??this._inferLinesFromContent(),n=this._unscopedContent.nativeElement;if(this._hostElement.classList.toggle("mat-mdc-list-item-single-line",t<=1),this._hostElement.classList.toggle("mdc-list-item--with-one-line",t<=1),this._hostElement.classList.toggle("mdc-list-item--with-two-lines",t===2),this._hostElement.classList.toggle("mdc-list-item--with-three-lines",t===3),this._hasUnscopedTextContent){let o=this._titles.length===0&&t===1;n.classList.toggle("mdc-list-item__primary-text",o),n.classList.toggle("mdc-list-item__secondary-text",!o);}else n.classList.remove("mdc-list-item__primary-text"),n.classList.remove("mdc-list-item__secondary-text");}_inferLinesFromContent(){let e=this._titles.length+this._lines.length;return this._hasUnscopedTextContent&&(e+=1),e}_checkDomForUnscopedTextContent(){this._hasUnscopedTextContent=Array.from(this._unscopedContent.nativeElement.childNodes).filter(e=>e.nodeType!==e.COMMENT_NODE).some(e=>!!(e.textContent&&e.textContent.trim()));}static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,contentQueries:function(t,n,o){if(t&1&&$p(o,Gm,4)(o,Rr,4),t&2){let a;MD(a=SD())&&(n._avatars=a),MD(a=SD())&&(n._icons=a);}},hostVars:4,hostBindings:function(t,n){t&2&&(Rp("aria-disabled",n.disabled)("disabled",n._isButtonElement&&n.disabled||null),Zp("mdc-list-item--disabled",n.disabled));},inputs:{lines:"lines",disableRipple:"disableRipple",disabled:"disabled"}})}return i})();var El=(()=>{class i extends Qm{_lines;_titles;_meta;_unscopedContent;_itemText;get activated(){return this._activated}set activated(e){this._activated=ti$2(e);}_activated=false;_getAriaCurrent(){return this._hostElement.nodeName==="A"&&this._activated?"page":null}_hasBothLeadingAndTrailing(){return this._meta.length!==0&&(this._avatars.length!==0||this._icons.length!==0)}static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-list-item"],["a","mat-list-item",""],["button","mat-list-item",""]],contentQueries:function(t,n,o){if(t&1&&$p(o,$m,5)(o,Sr,5)(o,qm,5),t&2){let a;MD(a=SD())&&(n._lines=a),MD(a=SD())&&(n._titles=a),MD(a=SD())&&(n._meta=a);}},viewQuery:function(t,n){if(t&1&&Up(zm,5)(jm,5),t&2){let o;MD(o=SD())&&(n._unscopedContent=o.first),MD(o=SD())&&(n._itemText=o.first);}},hostAttrs:[1,"mat-mdc-list-item","mdc-list-item"],hostVars:13,hostBindings:function(t,n){t&2&&(Rp("aria-current",n._getAriaCurrent()),Zp("mdc-list-item--activated",n.activated)("mdc-list-item--with-leading-avatar",n._avatars.length!==0)("mdc-list-item--with-leading-icon",n._icons.length!==0)("mdc-list-item--with-trailing-meta",n._meta.length!==0)("mat-mdc-list-item-both-leading-and-trailing",n._hasBothLeadingAndTrailing())("_mat-animation-noopable",n._noopAnimations));},inputs:{activated:"activated"},exportAs:["matListItem"],features:[vp],ngContentSelectors:Hm,decls:10,vars:0,consts:[["unscopedContent",""],[1,"mdc-list-item__content"],[1,"mat-mdc-list-item-unscoped-content",3,"cdkObserveContent"],[1,"mat-focus-indicator"]],template:function(t,n){t&1&&(CD(Bm),bD(0),yi$2(1,"span",1),bD(2,1),bD(3,2),yi$2(4,"span",2,0),Hp("cdkObserveContent",function(){return n._updateItemLines(true)}),bD(6,3),Uc$1()(),bD(7,4),bD(8,5),Op(9,"div",3));},dependencies:[Ca],encapsulation:2})}return i})();var Al=(()=>{class i extends kr{_isNonInteractive=false;static \u0275fac=(()=>{let e;return function(n){return (e||(e=Qm$1(i)))(n||i)}})();static \u0275cmp=cE({type:i,selectors:[["mat-nav-list"]],hostAttrs:["role","navigation",1,"mat-mdc-nav-list","mat-mdc-list-base","mdc-list"],exportAs:["matNavList"],features:[cw([{provide:kr,useExisting:i}]),vp],ngContentSelectors:Fm,decls:1,vars:0,template:function(t,n){t&1&&(CD(),bD(0));},styles:[Um],encapsulation:2})}return i})();var Dl=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[Ce$2,tn$1,Ir,er$3,Il]})}return i})();var Ym=["tooltip"],Zm=20;var Xm=new N$3("mat-tooltip-scroll-strategy",{providedIn:"root",factory:()=>{let i=T$2(Ee$4);return ()=>et(i,{scrollThrottle:Zm})}}),Jm=new N$3("mat-tooltip-default-options",{providedIn:"root",factory:()=>({showDelay:0,hideDelay:0,touchendHideDelay:1500})});var Ll="tooltip-panel",eh={passive:true},th=8,ih=8,nh=24,rh=200,Tr=(()=>{class i{_elementRef=T$2(Mr$2);_ngZone=T$2(De$3);_platform=T$2(u);_ariaDescriber=T$2(ko$1);_focusMonitor=T$2(Nt$1);_dir=T$2(Ri$1);_injector=T$2(Ee$4);_viewContainerRef=T$2(xi$2);_mediaMatcher=T$2(bt$2);_document=T$2(dr$3);_renderer=T$2(hI);_animationsDisabled=K();_defaultOptions=T$2(Jm,{optional:true});_overlayRef=null;_tooltipInstance=null;_overlayPanelClass;_portal;_position="below";_positionAtOrigin=false;_disabled=false;_tooltipClass;_viewInitialized=false;_pointerExitEventsInitialized=false;_tooltipComponent=Pl;_viewportMargin=8;_currentPosition;_cssClassPrefix="mat-mdc";_ariaDescriptionPending=false;_dirSubscribed=false;get position(){return this._position}set position(e){e!==this._position&&(this._position=e,this._overlayRef&&(this._updatePosition(this._overlayRef),this._tooltipInstance?.show(0),this._overlayRef.updatePosition()));}get positionAtOrigin(){return this._positionAtOrigin}set positionAtOrigin(e){this._positionAtOrigin=ti$2(e),this._detach(),this._overlayRef=null;}get disabled(){return this._disabled}set disabled(e){let t=ti$2(e);this._disabled!==t&&(this._disabled=t,t?this.hide(0):this._setupPointerEnterEventsIfNeeded(),this._syncAriaDescription(this.message));}get showDelay(){return this._showDelay}set showDelay(e){this._showDelay=Ct$2(e);}_showDelay;get hideDelay(){return this._hideDelay}set hideDelay(e){this._hideDelay=Ct$2(e),this._tooltipInstance&&(this._tooltipInstance._mouseLeaveHideDelay=this._hideDelay);}_hideDelay;touchGestures="auto";get message(){return this._message}set message(e){let t=this._message;this._message=e!=null?String(e).trim():"",!this._message&&this._isTooltipVisible()?this.hide(0):(this._setupPointerEnterEventsIfNeeded(),this._updateTooltipMessage()),this._syncAriaDescription(t);}_message="";get tooltipClass(){return this._tooltipClass}set tooltipClass(e){this._tooltipClass=e,this._tooltipInstance&&this._setTooltipClass(this._tooltipClass);}_eventCleanups=[];_touchstartTimeout=null;_destroyed=new ie$1;_isDestroyed=false;constructor(){let e=this._defaultOptions;e&&(this._showDelay=e.showDelay,this._hideDelay=e.hideDelay,e.position&&(this.position=e.position),e.positionAtOrigin&&(this.positionAtOrigin=e.positionAtOrigin),e.touchGestures&&(this.touchGestures=e.touchGestures),e.tooltipClass&&(this.tooltipClass=e.tooltipClass)),this._viewportMargin=th;}ngAfterViewInit(){this._viewInitialized=true,this._setupPointerEnterEventsIfNeeded(),this._focusMonitor.monitor(this._elementRef).pipe(Sg(this._destroyed)).subscribe(e=>{e?e==="keyboard"&&this._ngZone.run(()=>this.show()):this._ngZone.run(()=>this.hide(0));});}ngOnDestroy(){let e=this._elementRef.nativeElement;this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this._overlayRef&&(this._overlayRef.dispose(),this._tooltipInstance=null),this._eventCleanups.forEach(t=>t()),this._eventCleanups.length=0,this._destroyed.next(),this._destroyed.complete(),this._isDestroyed=true,this._ariaDescriber.removeDescription(e,this.message,"tooltip"),this._focusMonitor.stopMonitoring(e);}show(e=this.showDelay,t){if(this.disabled||!this.message||this._isTooltipVisible()){this._tooltipInstance?._cancelPendingAnimations();return}let n=this._createOverlay(t);this._detach(),this._portal=this._portal||new xi(this._tooltipComponent,this._viewContainerRef);let o=this._tooltipInstance=n.attach(this._portal).instance;o._triggerElement=this._elementRef.nativeElement,o._mouseLeaveHideDelay=this._hideDelay,o.afterHidden().pipe(Sg(this._destroyed)).subscribe(()=>this._detach()),this._setTooltipClass(this._tooltipClass),this._updateTooltipMessage(),o.show(e);}hide(e=this.hideDelay){let t=this._tooltipInstance;t&&(t.isVisible()?t.hide(e):(t._cancelPendingAnimations(),this._detach()));}toggle(e){this._isTooltipVisible()?this.hide():this.show(void 0,e);}_isTooltipVisible(){return !!this._tooltipInstance&&this._tooltipInstance.isVisible()}_createOverlay(e){if(this._overlayRef){let a=this._overlayRef.getConfig().positionStrategy;if((!this.positionAtOrigin||!e)&&a._origin instanceof Mr$2)return this._overlayRef;this._detach();}let t=this._injector.get($e).getAncestorScrollContainers(this._elementRef),n=`${this._cssClassPrefix}-${Ll}`,o=ki(this._injector,this.positionAtOrigin?e||this._elementRef:this._elementRef).withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`).withFlexibleDimensions(false).withViewportMargin(this._viewportMargin).withScrollableContainers(t).withPopoverLocation("global");return o.positionChanges.pipe(Sg(this._destroyed)).subscribe(a=>{this._updateCurrentPositionClass(a.connectionPair),this._tooltipInstance&&a.scrollableViewProperties.isOverlayClipped&&this._tooltipInstance.isVisible()&&this._ngZone.run(()=>this.hide(0));}),this._overlayRef=Oi(this._injector,{direction:this._dir,positionStrategy:o,panelClass:this._overlayPanelClass?[...this._overlayPanelClass,n]:n,scrollStrategy:this._injector.get(Xm)(),disableAnimations:this._animationsDisabled,eventPredicate:this._overlayEventPredicate}),this._updatePosition(this._overlayRef),this._overlayRef.detachments().pipe(Sg(this._destroyed)).subscribe(()=>this._detach()),this._overlayRef.outsidePointerEvents().pipe(Sg(this._destroyed)).subscribe(()=>this._tooltipInstance?._handleBodyInteraction()),this._overlayRef.keydownEvents().pipe(Sg(this._destroyed)).subscribe(a=>{a.preventDefault(),a.stopPropagation(),this._ngZone.run(()=>this.hide(0));}),this._defaultOptions?.disableTooltipInteractivity&&this._overlayRef.addPanelClass(`${this._cssClassPrefix}-tooltip-panel-non-interactive`),this._dirSubscribed||(this._dirSubscribed=true,this._dir.change.pipe(Sg(this._destroyed)).subscribe(()=>{this._overlayRef&&this._updatePosition(this._overlayRef);})),this._overlayRef}_detach(){this._overlayRef&&this._overlayRef.hasAttached()&&this._overlayRef.detach(),this._tooltipInstance=null;}_updatePosition(e){let t=e.getConfig().positionStrategy,n=this._getOrigin(),o=this._getOverlayPosition();t.withPositions([this._addOffset(r(r({},n.main),o.main)),this._addOffset(r(r({},n.fallback),o.fallback))]);}_addOffset(e){let t=ih,n=!this._dir||this._dir.value=="ltr";return e.originY==="top"?e.offsetY=-t:e.originY==="bottom"?e.offsetY=t:e.originX==="start"?e.offsetX=n?-t:t:e.originX==="end"&&(e.offsetX=n?t:-t),e}_getOrigin(){let e=!this._dir||this._dir.value=="ltr",t=this.position,n;t=="above"||t=="below"?n={originX:"center",originY:t=="above"?"top":"bottom"}:t=="before"||t=="left"&&e||t=="right"&&!e?n={originX:"start",originY:"center"}:(t=="after"||t=="right"&&e||t=="left"&&!e)&&(n={originX:"end",originY:"center"});let{x:o,y:a}=this._invertPosition(n.originX,n.originY);return {main:n,fallback:{originX:o,originY:a}}}_getOverlayPosition(){let e=!this._dir||this._dir.value=="ltr",t=this.position,n;t=="above"?n={overlayX:"center",overlayY:"bottom"}:t=="below"?n={overlayX:"center",overlayY:"top"}:t=="before"||t=="left"&&e||t=="right"&&!e?n={overlayX:"end",overlayY:"center"}:(t=="after"||t=="right"&&e||t=="left"&&!e)&&(n={overlayX:"start",overlayY:"center"});let{x:o,y:a}=this._invertPosition(n.overlayX,n.overlayY);return {main:n,fallback:{overlayX:o,overlayY:a}}}_updateTooltipMessage(){this._tooltipInstance&&(this._tooltipInstance.message=this.message,this._tooltipInstance._markForCheck(),sv(()=>{this._tooltipInstance&&this._overlayRef.updatePosition();},{injector:this._injector}));}_setTooltipClass(e){this._tooltipInstance&&(this._tooltipInstance.tooltipClass=e instanceof Set?Array.from(e):e,this._tooltipInstance._markForCheck());}_invertPosition(e,t){return this.position==="above"||this.position==="below"?t==="top"?t="bottom":t==="bottom"&&(t="top"):e==="end"?e="start":e==="start"&&(e="end"),{x:e,y:t}}_updateCurrentPositionClass(e){let{overlayY:t,originX:n,originY:o}=e,a;if(t==="center"?this._dir&&this._dir.value==="rtl"?a=n==="end"?"left":"right":a=n==="start"?"left":"right":a=t==="bottom"&&o==="top"?"above":"below",a!==this._currentPosition){let l=this._overlayRef;if(l){let s=`${this._cssClassPrefix}-${Ll}-`;l.removePanelClass(s+this._currentPosition),l.addPanelClass(s+a);}this._currentPosition=a;}}_setupPointerEnterEventsIfNeeded(){this._disabled||!this.message||!this._viewInitialized||this._eventCleanups.length||(this._isTouchPlatform()?this.touchGestures!=="off"&&(this._disableNativeGesturesIfNecessary(),this._addListener("touchstart",e=>{let t=e.targetTouches?.[0],n=t?{x:t.clientX,y:t.clientY}:void 0;this._setupPointerExitEventsIfNeeded(),this._touchstartTimeout&&clearTimeout(this._touchstartTimeout);let o=500;this._touchstartTimeout=setTimeout(()=>{this._touchstartTimeout=null,this.show(void 0,n);},this._defaultOptions?.touchLongPressShowDelay??o);})):this._addListener("mouseenter",e=>{this._setupPointerExitEventsIfNeeded();let t;e.x!==void 0&&e.y!==void 0&&(t=e),this.show(void 0,t);}));}_setupPointerExitEventsIfNeeded(){if(!this._pointerExitEventsInitialized){if(this._pointerExitEventsInitialized=true,!this._isTouchPlatform())this._addListener("mouseleave",e=>{let t=e.relatedTarget;(!t||!this._overlayRef?.overlayElement.contains(t))&&this.hide();}),this._addListener("wheel",e=>{if(this._isTooltipVisible()){let t=this._document.elementFromPoint(e.clientX,e.clientY),n=this._elementRef.nativeElement;t!==n&&!n.contains(t)&&this.hide();}});else if(this.touchGestures!=="off"){this._disableNativeGesturesIfNecessary();let e=()=>{this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this.hide(this._defaultOptions?.touchendHideDelay);};this._addListener("touchend",e),this._addListener("touchcancel",e);}}}_addListener(e,t){this._eventCleanups.push(this._renderer.listen(this._elementRef.nativeElement,e,t,eh));}_isTouchPlatform(){let e=this._defaultOptions?.detectHoverCapability;return typeof e=="function"?!e():this._platform.IOS||this._platform.ANDROID?true:this._platform.isBrowser?!!e&&this._mediaMatcher.matchMedia("(any-hover: none)").matches:false}_disableNativeGesturesIfNecessary(){let e=this.touchGestures;if(e!=="off"){let t=this._elementRef.nativeElement,n=t.style;(e==="on"||t.nodeName!=="INPUT"&&t.nodeName!=="TEXTAREA")&&(n.userSelect=n.msUserSelect=n.webkitUserSelect=n.MozUserSelect="none"),(e==="on"||!t.draggable)&&(n.webkitUserDrag="none"),n.touchAction="none",n.webkitTapHighlightColor="transparent";}}_syncAriaDescription(e){this._ariaDescriptionPending||(this._ariaDescriptionPending=true,this._ariaDescriber.removeDescription(this._elementRef.nativeElement,e,"tooltip"),this._isDestroyed||sv({write:()=>{this._ariaDescriptionPending=false,this.message&&!this.disabled&&this._ariaDescriber.describe(this._elementRef.nativeElement,this.message,"tooltip");}},{injector:this._injector}));}_overlayEventPredicate=e=>e.type==="keydown"?this._isTooltipVisible()&&e.keyCode===27&&!Ue$1(e):true;static \u0275fac=function(t){return new(t||i)};static \u0275dir=pE({type:i,selectors:[["","matTooltip",""]],hostAttrs:[1,"mat-mdc-tooltip-trigger"],hostVars:2,hostBindings:function(t,n){t&2&&Zp("mat-mdc-tooltip-disabled",n.disabled);},inputs:{position:[0,"matTooltipPosition","position"],positionAtOrigin:[0,"matTooltipPositionAtOrigin","positionAtOrigin"],disabled:[0,"matTooltipDisabled","disabled"],showDelay:[0,"matTooltipShowDelay","showDelay"],hideDelay:[0,"matTooltipHideDelay","hideDelay"],touchGestures:[0,"matTooltipTouchGestures","touchGestures"],message:[0,"matTooltip","message"],tooltipClass:[0,"matTooltipClass","tooltipClass"]},exportAs:["matTooltip"]})}return i})(),Pl=(()=>{class i{_changeDetectorRef=T$2($F);_elementRef=T$2(Mr$2);_isMultiline=false;message;tooltipClass;_showTimeoutId;_hideTimeoutId;_triggerElement;_mouseLeaveHideDelay;_animationsDisabled=K();_tooltip;_closeOnInteraction=false;_isVisible=false;_onHide=new ie$1;_showAnimation="mat-mdc-tooltip-show";_hideAnimation="mat-mdc-tooltip-hide";show(e){this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=setTimeout(()=>{this._toggleVisibility(true),this._showTimeoutId=void 0;},e);}hide(e){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId=setTimeout(()=>{this._toggleVisibility(false),this._hideTimeoutId=void 0;},e);}afterHidden(){return this._onHide}isVisible(){return this._isVisible}ngOnDestroy(){this._cancelPendingAnimations(),this._onHide.complete(),this._triggerElement=null;}_handleBodyInteraction(){this._closeOnInteraction&&this.hide(0);}_markForCheck(){this._changeDetectorRef.markForCheck();}_handleMouseLeave({relatedTarget:e}){(!e||!this._triggerElement.contains(e))&&(this.isVisible()?this.hide(this._mouseLeaveHideDelay):this._finalizeAnimation(false));}_onShow(){this._isMultiline=this._isTooltipMultiline(),this._markForCheck();}_isTooltipMultiline(){let e=this._elementRef.nativeElement.getBoundingClientRect();return e.height>nh&&e.width>=rh}_handleAnimationEnd({animationName:e}){(e===this._showAnimation||e===this._hideAnimation)&&this._finalizeAnimation(e===this._showAnimation);}_cancelPendingAnimations(){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=this._hideTimeoutId=void 0;}_finalizeAnimation(e){e?this._closeOnInteraction=true:this.isVisible()||this._onHide.next();}_toggleVisibility(e){let t=this._tooltip.nativeElement,n=this._showAnimation,o=this._hideAnimation;if(t.classList.remove(e?o:n),t.classList.add(e?n:o),this._isVisible!==e&&(this._isVisible=e,this._changeDetectorRef.markForCheck()),e&&!this._animationsDisabled&&typeof getComputedStyle=="function"){let a=getComputedStyle(t);(a.getPropertyValue("animation-duration")==="0s"||a.getPropertyValue("animation-name")==="none")&&(this._animationsDisabled=true);}e&&this._onShow(),this._animationsDisabled&&(t.classList.add("_mat-animation-noopable"),this._finalizeAnimation(e));}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["mat-tooltip-component"]],viewQuery:function(t,n){if(t&1&&Up(Ym,7),t&2){let o;MD(o=SD())&&(n._tooltip=o.first);}},hostAttrs:["aria-hidden","true"],hostBindings:function(t,n){t&1&&Hp("mouseleave",function(a){return n._handleMouseLeave(a)});},decls:4,vars:5,consts:[["tooltip",""],[1,"mdc-tooltip","mat-mdc-tooltip",3,"animationend"],[1,"mat-mdc-tooltip-surface","mdc-tooltip__surface"]],template:function(t,n){t&1&&(Wc$1(0,"div",1,0),Bp("animationend",function(a){return n._handleAnimationEnd(a)}),Wc$1(2,"div",2),JD(3),qc$1()()),t&2&&(BD(n.tooltipClass),Zp("mdc-tooltip--multiline",n._isMultiline),xv(3),nh$1(n.message));},styles:[`.mat-mdc-tooltip {
  position: relative;
  transform: scale(0);
  display: inline-flex;
}
.mat-mdc-tooltip::before {
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  position: absolute;
}
.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before {
  top: -8px;
}
.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before {
  bottom: -8px;
}
.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before {
  left: -8px;
}
.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before {
  right: -8px;
}
.mat-mdc-tooltip._mat-animation-noopable {
  animation: none;
  transform: scale(1);
}

.mat-mdc-tooltip-surface {
  word-break: normal;
  overflow-wrap: anywhere;
  padding: 4px 8px;
  min-width: 40px;
  max-width: 200px;
  min-height: 24px;
  max-height: 40vh;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  will-change: transform, opacity;
  background-color: var(--mat-tooltip-container-color, var(--mat-sys-inverse-surface));
  color: var(--mat-tooltip-supporting-text-color, var(--mat-sys-inverse-on-surface));
  border-radius: var(--mat-tooltip-container-shape, var(--mat-sys-corner-extra-small));
  font-family: var(--mat-tooltip-supporting-text-font, var(--mat-sys-body-small-font));
  font-size: var(--mat-tooltip-supporting-text-size, var(--mat-sys-body-small-size));
  font-weight: var(--mat-tooltip-supporting-text-weight, var(--mat-sys-body-small-weight));
  line-height: var(--mat-tooltip-supporting-text-line-height, var(--mat-sys-body-small-line-height));
  letter-spacing: var(--mat-tooltip-supporting-text-tracking, var(--mat-sys-body-small-tracking));
}
.mat-mdc-tooltip-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
.mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: left;
}
[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: right;
}

.mat-mdc-tooltip-panel {
  line-height: normal;
}
.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive {
  pointer-events: none;
}

@keyframes mat-mdc-tooltip-show {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes mat-mdc-tooltip-hide {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
.mat-mdc-tooltip-show {
  animation: mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}

.mat-mdc-tooltip-hide {
  animation: mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}
`],encapsulation:2})}return i})();var Ol=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=uE({type:i});static \u0275inj=zl$1({imports:[yn,Ei,er$3,Xe$2]})}return i})();var Nl="wl.nav.collapsed",Fl=(()=>{class i{saveCollapsed(e){try{localStorage.setItem(Nl,JSON.stringify(e));}catch(t){a("NavStateStore.saveCollapsed",t);}}loadCollapsed(){try{return localStorage.getItem(Nl)==="true"}catch(e){return a("NavStateStore.loadCollapsed",e),false}}static \u0275fac=function(t){return new(t||i)};static \u0275prov=re$2({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})();var ah=["*"],sh=()=>({exact:true});function lh(i,r){i&1&&(yi$2(0,"span",17),JD(1,"Pre-Fight"),Uc$1());}function ch(i,r){i&1&&(yi$2(0,"span",17),JD(1,"Analyze"),Uc$1());}function dh(i,r){i&1&&(yi$2(0,"span",17),JD(1,"View on GitHub"),Uc$1());}function mh(i,r){i&1&&(yi$2(0,"span",17),JD(1,"Report an issue"),Uc$1());}var Ul="https://github.com/gpolcode/warcraft-learner",hh=`${Ul}/issues/new`,uh="(max-width: 600px)",ph=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
    0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
    -1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997
    .107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.465-2.381 1.235-3.221
    -.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138
    3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221
    0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286
    0 .315.21.69.825.57C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>`,zl=(()=>{class i{githubUrl=Ul;newIssueUrl=hh;breakpoints=T$2(Ft$1);navState=T$2(Fl);isMobile=Ye$1(this.breakpoints.observe(uh).pipe(le$1(e=>e.matches)),{initialValue:false});mobileOpen=Ho$1(false);desktopCollapsed=Ho$1(this.navState.loadCollapsed());sidenavMode=Iw(()=>this.isMobile()?"over":"side");sidenavOpened=Iw(()=>this.isMobile()?this.mobileOpen():true);railCollapsed=Iw(()=>!this.isMobile()&&this.desktopCollapsed());container=VF(li);constructor(){T$2(qn$2).addSvgIconLiteral("github",T$2(Ft$3).bypassSecurityTrustHtml(ph)),Vu(()=>{this.railCollapsed(),requestAnimationFrame(()=>this.container()?.updateContentMargins());});}toggleNav(){this.isMobile()?this.mobileOpen.update(e=>!e):(this.desktopCollapsed.update(e=>!e),this.navState.saveCollapsed(this.desktopCollapsed()));}onNavigate(){this.isMobile()&&this.mobileOpen.set(false);}onOpenedChange(e){this.isMobile()&&this.mobileOpen.set(e);}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["wl-page-nav"]],viewQuery:function(t,n){t&1&&qp(n.container,li,5),t&2&&ND();},hostAttrs:[1,"flex","flex-col","h-[100dvh]"],ngContentSelectors:ah,decls:40,vars:22,consts:[["pre","routerLinkActive"],["post","routerLinkActive"],[1,"border-b","border-[var(--border)]","gap-2","shrink-0"],["mat-icon-button","","aria-label","Toggle navigation menu",3,"click"],["routerLink","/","aria-label","warcraft-learner home",1,"flex","items-center","gap-2","no-underline","text-[var(--gold)]","font-semibold","text-[15px]"],["viewBox","0 0 32 32","aria-hidden","true","focusable","false",1,"w-6","h-6","shrink-0"],["d","M16 4 L27 7 L27 15.5 C27 21.5 22.5 26.5 16 29 C9.5 26.5 5 21.5 5 15.5 L5 7 Z",1,"fill-[var(--gold)]"],[1,"fill-[var(--surface)]"],["x","9.5","y","18","width","3","height","4","rx","1"],["x","14.5","y","14","width","3","height","8","rx","1"],["x","19.5","y","10","width","3","height","12","rx","1"],[1,"flex-1","min-h-0"],[1,"border-r","border-[var(--border)]",3,"openedChange","mode","opened"],[1,"flex","flex-col","h-full","py-2"],[1,"flex-1","px-3"],["mat-list-item","","routerLink","/pre","routerLinkActive","","aria-label","Pre-Fight","matTooltipPosition","right",3,"click","activated","matTooltip"],["matListItemIcon",""],["matListItemTitle",""],["mat-list-item","","routerLink","/","routerLinkActive","","aria-label","Analyze","matTooltipPosition","right",3,"click","routerLinkActiveOptions","activated","matTooltip"],[1,"px-3","pt-1"],["mat-list-item","","target","_blank","rel","noopener noreferrer","aria-label","View on GitHub","matTooltipPosition","right",3,"href","matTooltip"],["matListItemIcon","","svgIcon","github"],["mat-list-item","","target","_blank","rel","noopener noreferrer","aria-label","Report an issue on GitHub","matTooltipPosition","right",3,"href","matTooltip"],[1,"overflow-auto"],[1,"block"]],template:function(t,n){if(t&1&&(CD(),yi$2(0,"mat-toolbar",2)(1,"button",3),Hp("click",function(){return n.toggleNav()}),yi$2(2,"mat-icon"),JD(3,"menu"),Uc$1()(),yi$2(4,"a",4),Su(),yi$2(5,"svg",5),Op(6,"path",6),yi$2(7,"g",7),Op(8,"rect",8)(9,"rect",9)(10,"rect",10),Uc$1()(),Nu(),yi$2(11,"span"),JD(12,"warcraft-learner"),Uc$1()()(),yi$2(13,"mat-sidenav-container",11)(14,"mat-sidenav",12),Hp("openedChange",function(a){return n.onOpenedChange(a)}),yi$2(15,"div",13)(16,"div",14)(17,"mat-nav-list")(18,"a",15,0),Hp("click",function(){return n.onNavigate()}),yi$2(20,"mat-icon",16),JD(21,"lightbulb"),Uc$1(),rD(22,lh,2,0,"span",17),Uc$1(),yi$2(23,"a",18,1),Hp("click",function(){return n.onNavigate()}),yi$2(25,"mat-icon",16),JD(26,"analytics"),Uc$1(),rD(27,ch,2,0,"span",17),Uc$1()()(),yi$2(28,"div",19)(29,"mat-nav-list")(30,"a",20),Op(31,"mat-icon",21),rD(32,dh,2,0,"span",17),Uc$1(),yi$2(33,"a",22)(34,"mat-icon",16),JD(35,"bug_report"),Uc$1(),rD(36,mh,2,0,"span",17),Uc$1()()()()(),yi$2(37,"mat-sidenav-content",23)(38,"main",24),bD(39),Uc$1()()()),t&2){let o=xD(19),a=xD(24);xv(14),Zp("nav-drawer-modal",n.isMobile())("nav-drawer-full",!n.isMobile()&&!n.railCollapsed())("nav-drawer-rail",n.railCollapsed()),kp("mode",n.sidenavMode())("opened",n.sidenavOpened()),xv(4),kp("activated",o.isActive)("matTooltip",n.railCollapsed()?"Pre-Fight":""),xv(4),oD(n.railCollapsed()?-1:22),xv(),kp("routerLinkActiveOptions",lw(21,sh))("activated",a.isActive)("matTooltip",n.railCollapsed()?"Analyze":""),xv(4),oD(n.railCollapsed()?-1:27),xv(3),kp("href",n.githubUrl,If)("matTooltip",n.railCollapsed()?"View on GitHub":""),xv(2),oD(n.railCollapsed()?-1:32),xv(),kp("href",n.newIssueUrl,If)("matTooltip",n.railCollapsed()?"Report an issue":""),xv(3),oD(n.railCollapsed()?-1:36);}},dependencies:[It,ur,kl,xl,Tl,xr,li,gn,Dl,Al,El,Rr,Sr,zi,Sn$1,Xu,Yu,Ol,Tr],encapsulation:2})}return i})();var jl=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=cE({type:i,selectors:[["wl-root"]],hostAttrs:[1,"block"],decls:2,vars:0,template:function(t,n){t&1&&(yi$2(0,"wl-page-nav"),Op(1,"router-outlet"),Uc$1());},dependencies:[ei,zl],encapsulation:2})}return i})();Wr$1(jl,Cl).catch(i=>a("bootstrapApplication",i));export{$$1 as $,et$1 as A,B,aD as C,Dr$1 as D,fw as E,FF as F,G,Hp as H,cD as I,JD as J,hw as K,X$1 as L,M$2 as M,ND as N,Op as O,gw as P,Qc$1 as Q,Iw as R,Sn$1 as S,T$2 as T,Ui as U,VF as V,Zp as W,Xu as X,Yu as Y,Ze$3 as Z,_$2 as _,r as a,kn as a$,ww as a0,iD as a1,Wc$1 as a2,Bp as a3,qc$1 as a4,Rp as a5,BD as a6,Pp as a7,jp as a8,Qp as a9,N$1 as aA,EI as aB,wI as aC,lt$1 as aD,dr$3 as aE,_r$3 as aF,uE as aG,zl$1 as aH,er$3 as aI,Mr$2 as aJ,$F as aK,De$3 as aL,K as aM,N$3 as aN,We$3 as aO,bi$2 as aP,qe$1 as aQ,hh$1 as aR,Pt$1 as aS,bi$1 as aT,ir$1 as aU,xm$1 as aV,WF as aW,CD as aX,Su as aY,Nu as aZ,bD as a_,gc$1 as aa,nr$1 as ab,dt as ac,Co as ad,Ye$1 as ae,Qs$1 as af,$s$1 as ag,Mo as ah,dr$1 as ai,lr$1 as aj,mi as ak,nc$1 as al,tc$1 as am,ic$1 as an,Pt as ao,lt as ap,mt as aq,St$1 as ar,er$1 as as,jt$1 as at,Et as au,Ut as av,Lt as aw,Kt$1 as ax,cw as ay,ar$1 as az,Vu as b,Mt$1 as b0,vo$1 as b1,qF as b2,Up as b3,MD as b4,SD as b5,rh$1 as b6,it$1 as b7,f$1 as b8,s as b9,A$1 as ba,at$1 as bb,d as bc,h as bd,hE as be,sh$1 as bf,nw as bg,sD as bh,rw as bi,sv as bj,Ls$1 as bk,If as bl,Rs$1 as bm,pc$1 as bn,v$2 as bo,w$1 as bp,u$1 as bq,ot$1 as br,st$1 as bs,Ve$4 as c,cE as d,zi as e,rD as f,Uc$1 as g,hD as h,yu as i,xv as j,kp as k,jF as l,mu as m,nh$1 as n,oD as o,Ho$1 as p,qp as q,re$2 as r,a as s,t,_r$2 as u,S$2 as v,wD as w,xD as x,yi$2 as y,z};//# sourceMappingURL=main-BS3F3ATR.js.map
