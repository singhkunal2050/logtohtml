(()=>{"use strict";var n={919:(n,t,e)=>{e.d(t,{A:()=>u});var o=e(601),r=e.n(o),i=e(314),l=e.n(i)()(r());l.push([n.id,'/* Styles for the log window */\n#dynamic-log-window {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  width: 98vw;\n  height: 40%;\n  overflow-y: scroll;\n  background-color: #282828;\n  color: white;\n  font-family: monospace;\n  font-size: 12px;\n  z-index: 9999;\n  display: block;\n  word-break: break-all;\n  /* Firefox-specific scrollbar styling */\n  scrollbar-width: thin;\n  scrollbar-color: #6b6b6b #282828;\n}\n\n/* WebKit-specific scrollbar styling for Chrome, Safari, etc. */\n#dynamic-log-window::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n#dynamic-log-window::-webkit-scrollbar-track {\n  background: #282828;\n}\n#dynamic-log-window::-webkit-scrollbar-thumb {\n  background-color: #6b6b6b;\n  border-radius: 4px;\n}\n\n/* Styles for the toggle button */\n#toggle-button {\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: 10000;\n  background-color: #282828;\n  color: rgb(175, 175, 175);\n  border: none;\n  padding: 10px;\n  cursor: pointer;\n  border-radius: 16px 0 0 0;\n}\n\n/* Log window top header */\n#filter-section {\n  display: flex;\n  padding: 6px;\n  background-color: rgb(51, 51, 51);\n  border-bottom: 1px solid #6b6b6b;\n}\n\n/* Log level filter dropdown */\n#log-filter {\n  color: rgb(140, 140, 140);\n  background-color: rgb(62, 62, 62);\n  border: 1px solid rgb(107, 107, 107);\n  border-radius: 16px;\n  cursor: pointer;\n  padding: 5px;\n}\n\n/* Clear logs button */\n#clear-logs {\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 5px;\n}\n\n/* Search input */\n#log-search {\n  background: rgb(62, 62, 62);\n  border: 1px solid rgb(107, 107, 107);\n  border-radius: 16px;\n  padding: 0px 15px;\n  color: rgb(171, 165, 165);\n}\n\n.log-message {\n  padding: 5px;\n  margin-bottom: 6px;\n  border-bottom: 1px solid #444;\n}\n\n#log-window-header {\n  position: sticky;\n  top: 0;\n  gap: 10px;\n  z-index: 100;\n}\n\n#log-window-sections {\n  background: #3d3d3d;\n  display: flex;\n  border-bottom: 1px solid #6b6b6b;\n\n  .log-window-section-tab {\n    padding: 10px;\n    cursor: pointer;\n\n    &:hover {\n      background: #6b6b6b;\n    }\n\n    &[data-active="true"] {\n      color: #a8c7fa;\n      border-bottom: 2px solid #a8c7fa;\n    }\n  }\n}\n\n\n/* Network tab container */\n#network-list {\n  padding: 10px;\n  font-family: monospace;\n  font-size: 12px;\n  color: white;\n}\n\n/* Each network request entry */\n#network-list > div {\n  background: #333;\n  padding: 8px;\n  margin-bottom: 8px;\n  border-radius: 6px;\n  border-left: 4px solid #4caf50; /* Green for successful requests */\n  word-break: break-word;\n}\n\n/* Failed requests */\n#network-list > div[data-status="FAILED"] {\n  border-left-color: #ff4d4d; /* Red for errors */\n}\n\n/* Request URL & method */\n#network-list strong {\n  font-size: 13px;\n  color: #a8c7fa;\n}\n\n/* Status & duration */\n#network-list span {\n  font-size: 12px;\n  font-weight: bold;\n}\n\n/* Request details section */\n#network-list details {\n  background: #222;\n  padding: 6px;\n  border-radius: 4px;\n  margin-top: 4px;\n}\n\n/* Summary (expandable section) */\n#network-list summary {\n  cursor: pointer;\n  font-size: 12px;\n  font-weight: bold;\n  color: #f1c40f; /* Yellow highlight */\n}\n\n/* JSON response styling */\n#network-list pre {\n  background: #1e1e1e;\n  color: #e6e6e6;\n  padding: 6px;\n  border-radius: 4px;\n  overflow-x: auto;\n  font-size: 11px;\n  line-height: 1.4;\n}\n\n/* Scrollbar styling */\n#network-list pre::-webkit-scrollbar {\n  width: 6px;\n}\n#network-list pre::-webkit-scrollbar-thumb {\n  background: #6b6b6b;\n  border-radius: 3px;\n}\n\n\n/* Network tab container */\n#network-list {\n  padding: 10px;\n  font-family: monospace;\n  font-size: 12px;\n  color: white;\n\n  /* Each network request entry */\n  > div {\n    background: #333;\n    padding: 8px;\n    margin-bottom: 8px;\n    border-radius: 6px;\n    border-left: 4px solid #4caf50; /* Green for successful requests */\n    word-break: break-word;\n\n    &[data-status="FAILED"] {\n      border-left-color: #ff4d4d; /* Red for errors */\n    }\n\n    /* Request URL & method */\n    strong {\n      font-size: 13px;\n      color: #a8c7fa;\n    }\n\n    /* Status & duration */\n    span {\n      font-size: 12px;\n      font-weight: bold;\n    }\n\n    /* Request details section */\n    details {\n      background: #222;\n      padding: 6px;\n      border-radius: 4px;\n      margin-top: 4px;\n\n      summary {\n        cursor: pointer;\n        font-size: 12px;\n        font-weight: bold;\n        color: #f1c40f; /* Yellow highlight */\n      }\n\n      pre {\n        background: #1e1e1e;\n        color: #e6e6e6;\n        padding: 6px;\n        border-radius: 4px;\n        overflow-x: auto;\n        font-size: 11px;\n        line-height: 1.4;\n\n        /* Scrollbar styling */\n        &::-webkit-scrollbar {\n          width: 6px;\n        }\n\n        &::-webkit-scrollbar-thumb {\n          background: #6b6b6b;\n          border-radius: 3px;\n        }\n      }\n    }\n  }\n}\n\n',""]);const u=l},314:n=>{n.exports=function(n){var t=[];return t.toString=function(){return this.map((function(t){var e="",o=void 0!==t[5];return t[4]&&(e+="@supports (".concat(t[4],") {")),t[2]&&(e+="@media ".concat(t[2]," {")),o&&(e+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),e+=n(t),o&&(e+="}"),t[2]&&(e+="}"),t[4]&&(e+="}"),e})).join("")},t.i=function(n,e,o,r,i){"string"==typeof n&&(n=[[null,n,void 0]]);var l={};if(o)for(var u=0;u<this.length;u++){var _=this[u][0];null!=_&&(l[_]=!0)}for(var c=0;c<n.length;c++){var a=[].concat(n[c]);o&&l[a[0]]||(void 0!==i&&(void 0===a[5]||(a[1]="@layer".concat(a[5].length>0?" ".concat(a[5]):""," {").concat(a[1],"}")),a[5]=i),e&&(a[2]?(a[1]="@media ".concat(a[2]," {").concat(a[1],"}"),a[2]=e):a[2]=e),r&&(a[4]?(a[1]="@supports (".concat(a[4],") {").concat(a[1],"}"),a[4]=r):a[4]="".concat(r)),t.push(a))}},t}},601:n=>{n.exports=function(n){return n[1]}}},t={};function e(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={id:o,exports:{}};return n[o](i,i.exports,e),i.exports}e.n=n=>{var t=n&&n.__esModule?()=>n.default:()=>n;return e.d(t,{a:t}),t},e.d=(n,t)=>{for(var o in t)e.o(t,o)&&!e.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:t[o]})},e.o=(n,t)=>Object.prototype.hasOwnProperty.call(n,t);var o,r,i,l,u,_,c,a,s,f,p,d={},h=[],b=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,y=Array.isArray;function g(n,t){for(var e in t)n[e]=t[e];return n}function v(n){n&&n.parentNode&&n.parentNode.removeChild(n)}function m(n,t,e){var r,i,l,u={};for(l in t)"key"==l?r=t[l]:"ref"==l?i=t[l]:u[l]=t[l];if(arguments.length>2&&(u.children=arguments.length>3?o.call(arguments,2):e),"function"==typeof n&&null!=n.defaultProps)for(l in n.defaultProps)void 0===u[l]&&(u[l]=n.defaultProps[l]);return w(n,u,r,i,null)}function w(n,t,e,o,l){var u={type:n,props:t,key:e,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:null==l?++i:l,__i:-1,__u:0};return null==l&&null!=r.vnode&&r.vnode(u),u}function k(n){return n.children}function x(n,t){this.props=n,this.context=t}function S(n,t){if(null==t)return n.__?S(n.__,n.__i+1):null;for(var e;t<n.__k.length;t++)if(null!=(e=n.__k[t])&&null!=e.__e)return e.__e;return"function"==typeof n.type?S(n):null}function C(n){var t,e;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,t=0;t<n.__k.length;t++)if(null!=(e=n.__k[t])&&null!=e.__e){n.__e=n.__c.base=e.__e;break}return C(n)}}function E(n){(!n.__d&&(n.__d=!0)&&l.push(n)&&!T.__r++||u!==r.debounceRendering)&&((u=r.debounceRendering)||_)(T)}function T(){for(var n,t,e,o,i,u,_,a=1;l.length;)l.length>a&&l.sort(c),n=l.shift(),a=l.length,n.__d&&(e=void 0,i=(o=(t=n).__v).__e,u=[],_=[],t.__P&&((e=g({},o)).__v=o.__v+1,r.vnode&&r.vnode(e),U(t.__P,e,o,t.__n,t.__P.namespaceURI,32&o.__u?[i]:null,u,null==i?S(o):i,!!(32&o.__u),_),e.__v=o.__v,e.__.__k[e.__i]=e,R(u,e,_),e.__e!=i&&C(e)));T.__r=0}function O(n,t,e,o,r,i,l,u,_,c,a){var s,f,p,b,y,g,v=o&&o.__k||h,m=t.length;for(_=P(e,t,v,_,m),s=0;s<m;s++)null!=(p=e.__k[s])&&(f=-1===p.__i?d:v[p.__i]||d,p.__i=s,g=U(n,p,f,r,i,l,u,_,c,a),b=p.__e,p.ref&&f.ref!=p.ref&&(f.ref&&D(f.ref,null,p),a.push(p.ref,p.__c||b,p)),null==y&&null!=b&&(y=b),4&p.__u||f.__k===p.__k?_=L(p,_,n):"function"==typeof p.type&&void 0!==g?_=g:b&&(_=b.nextSibling),p.__u&=-7);return e.__e=y,_}function P(n,t,e,o,r){var i,l,u,_,c,a=e.length,s=a,f=0;for(n.__k=new Array(r),i=0;i<r;i++)null!=(l=t[i])&&"boolean"!=typeof l&&"function"!=typeof l?(_=i+f,(l=n.__k[i]="string"==typeof l||"number"==typeof l||"bigint"==typeof l||l.constructor==String?w(null,l,null,null,null):y(l)?w(k,{children:l},null,null,null):void 0===l.constructor&&l.__b>0?w(l.type,l.props,l.key,l.ref?l.ref:null,l.__v):l).__=n,l.__b=n.__b+1,u=null,-1!==(c=l.__i=A(l,e,_,s))&&(s--,(u=e[c])&&(u.__u|=2)),null==u||null===u.__v?(-1==c&&(r>a?f--:r<a&&f++),"function"!=typeof l.type&&(l.__u|=4)):c!=_&&(c==_-1?f--:c==_+1?f++:(c>_?f--:f++,l.__u|=4))):n.__k[i]=null;if(s)for(i=0;i<a;i++)null!=(u=e[i])&&!(2&u.__u)&&(u.__e==o&&(o=S(u)),I(u,u));return o}function L(n,t,e){var o,r;if("function"==typeof n.type){for(o=n.__k,r=0;o&&r<o.length;r++)o[r]&&(o[r].__=n,t=L(o[r],t,e));return t}n.__e!=t&&(t&&n.type&&!e.contains(t)&&(t=S(n)),e.insertBefore(n.__e,t||null),t=n.__e);do{t=t&&t.nextSibling}while(null!=t&&8==t.nodeType);return t}function A(n,t,e,o){var r,i,l=n.key,u=n.type,_=t[e];if(null===_&&null==n.key||_&&l==_.key&&u===_.type&&!(2&_.__u))return e;if(o>(null==_||2&_.__u?0:1))for(r=e-1,i=e+1;r>=0||i<t.length;){if(r>=0){if((_=t[r])&&!(2&_.__u)&&l==_.key&&u===_.type)return r;r--}if(i<t.length){if((_=t[i])&&!(2&_.__u)&&l==_.key&&u===_.type)return i;i++}}return-1}function H(n,t,e){"-"==t[0]?n.setProperty(t,null==e?"":e):n[t]=null==e?"":"number"!=typeof e||b.test(t)?e:e+"px"}function j(n,t,e,o,r){var i;n:if("style"==t)if("string"==typeof e)n.style.cssText=e;else{if("string"==typeof o&&(n.style.cssText=o=""),o)for(t in o)e&&t in e||H(n.style,t,"");if(e)for(t in e)o&&e[t]===o[t]||H(n.style,t,e[t])}else if("o"==t[0]&&"n"==t[1])i=t!=(t=t.replace(a,"$1")),t=t.toLowerCase()in n||"onFocusOut"==t||"onFocusIn"==t?t.toLowerCase().slice(2):t.slice(2),n.l||(n.l={}),n.l[t+i]=e,e?o?e.t=o.t:(e.t=s,n.addEventListener(t,i?p:f,i)):n.removeEventListener(t,i?p:f,i);else{if("http://www.w3.org/2000/svg"==r)t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=t&&"height"!=t&&"href"!=t&&"list"!=t&&"form"!=t&&"tabIndex"!=t&&"download"!=t&&"rowSpan"!=t&&"colSpan"!=t&&"role"!=t&&"popover"!=t&&t in n)try{n[t]=null==e?"":e;break n}catch(n){}"function"==typeof e||(null==e||!1===e&&"-"!=t[4]?n.removeAttribute(t):n.setAttribute(t,"popover"==t&&1==e?"":e))}}function N(n){return function(t){if(this.l){var e=this.l[t.type+n];if(null==t.u)t.u=s++;else if(t.u<e.t)return;return e(r.event?r.event(t):t)}}}function U(n,t,e,o,i,l,u,_,c,a){var s,f,p,d,h,b,m,w,S,C,E,T,P,L,A,H,j,N=t.type;if(void 0!==t.constructor)return null;128&e.__u&&(c=!!(32&e.__u),l=[_=t.__e=e.__e]),(s=r.__b)&&s(t);n:if("function"==typeof N)try{if(w=t.props,S="prototype"in N&&N.prototype.render,C=(s=N.contextType)&&o[s.__c],E=s?C?C.props.value:s.__:o,e.__c?m=(f=t.__c=e.__c).__=f.__E:(S?t.__c=f=new N(w,E):(t.__c=f=new x(w,E),f.constructor=N,f.render=q),C&&C.sub(f),f.props=w,f.state||(f.state={}),f.context=E,f.__n=o,p=f.__d=!0,f.__h=[],f._sb=[]),S&&null==f.__s&&(f.__s=f.state),S&&null!=N.getDerivedStateFromProps&&(f.__s==f.state&&(f.__s=g({},f.__s)),g(f.__s,N.getDerivedStateFromProps(w,f.__s))),d=f.props,h=f.state,f.__v=t,p)S&&null==N.getDerivedStateFromProps&&null!=f.componentWillMount&&f.componentWillMount(),S&&null!=f.componentDidMount&&f.__h.push(f.componentDidMount);else{if(S&&null==N.getDerivedStateFromProps&&w!==d&&null!=f.componentWillReceiveProps&&f.componentWillReceiveProps(w,E),!f.__e&&(null!=f.shouldComponentUpdate&&!1===f.shouldComponentUpdate(w,f.__s,E)||t.__v==e.__v)){for(t.__v!=e.__v&&(f.props=w,f.state=f.__s,f.__d=!1),t.__e=e.__e,t.__k=e.__k,t.__k.some((function(n){n&&(n.__=t)})),T=0;T<f._sb.length;T++)f.__h.push(f._sb[T]);f._sb=[],f.__h.length&&u.push(f);break n}null!=f.componentWillUpdate&&f.componentWillUpdate(w,f.__s,E),S&&null!=f.componentDidUpdate&&f.__h.push((function(){f.componentDidUpdate(d,h,b)}))}if(f.context=E,f.props=w,f.__P=n,f.__e=!1,P=r.__r,L=0,S){for(f.state=f.__s,f.__d=!1,P&&P(t),s=f.render(f.props,f.state,f.context),A=0;A<f._sb.length;A++)f.__h.push(f._sb[A]);f._sb=[]}else do{f.__d=!1,P&&P(t),s=f.render(f.props,f.state,f.context),f.state=f.__s}while(f.__d&&++L<25);f.state=f.__s,null!=f.getChildContext&&(o=g(g({},o),f.getChildContext())),S&&!p&&null!=f.getSnapshotBeforeUpdate&&(b=f.getSnapshotBeforeUpdate(d,h)),H=s,null!=s&&s.type===k&&null==s.key&&(H=M(s.props.children)),_=O(n,y(H)?H:[H],t,e,o,i,l,u,_,c,a),f.base=t.__e,t.__u&=-161,f.__h.length&&u.push(f),m&&(f.__E=f.__=null)}catch(n){if(t.__v=null,c||null!=l)if(n.then){for(t.__u|=c?160:128;_&&8==_.nodeType&&_.nextSibling;)_=_.nextSibling;l[l.indexOf(_)]=null,t.__e=_}else for(j=l.length;j--;)v(l[j]);else t.__e=e.__e,t.__k=e.__k;r.__e(n,t,e)}else null==l&&t.__v==e.__v?(t.__k=e.__k,t.__e=e.__e):_=t.__e=F(e.__e,t,e,o,i,l,u,c,a);return(s=r.diffed)&&s(t),128&t.__u?void 0:_}function R(n,t,e){for(var o=0;o<e.length;o++)D(e[o],e[++o],e[++o]);r.__c&&r.__c(t,n),n.some((function(t){try{n=t.__h,t.__h=[],n.some((function(n){n.call(t)}))}catch(n){r.__e(n,t.__v)}}))}function M(n){return"object"!=typeof n||null==n?n:y(n)?n.map(M):g({},n)}function F(n,t,e,i,l,u,_,c,a){var s,f,p,h,b,g,m,w=e.props,k=t.props,x=t.type;if("svg"==x?l="http://www.w3.org/2000/svg":"math"==x?l="http://www.w3.org/1998/Math/MathML":l||(l="http://www.w3.org/1999/xhtml"),null!=u)for(s=0;s<u.length;s++)if((b=u[s])&&"setAttribute"in b==!!x&&(x?b.localName==x:3==b.nodeType)){n=b,u[s]=null;break}if(null==n){if(null==x)return document.createTextNode(k);n=document.createElementNS(l,x,k.is&&k),c&&(r.__m&&r.__m(t,u),c=!1),u=null}if(null===x)w===k||c&&n.data===k||(n.data=k);else{if(u=u&&o.call(n.childNodes),w=e.props||d,!c&&null!=u)for(w={},s=0;s<n.attributes.length;s++)w[(b=n.attributes[s]).name]=b.value;for(s in w)if(b=w[s],"children"==s);else if("dangerouslySetInnerHTML"==s)p=b;else if(!(s in k)){if("value"==s&&"defaultValue"in k||"checked"==s&&"defaultChecked"in k)continue;j(n,s,null,b,l)}for(s in k)b=k[s],"children"==s?h=b:"dangerouslySetInnerHTML"==s?f=b:"value"==s?g=b:"checked"==s?m=b:c&&"function"!=typeof b||w[s]===b||j(n,s,b,w[s],l);if(f)c||p&&(f.__html===p.__html||f.__html===n.innerHTML)||(n.innerHTML=f.__html),t.__k=[];else if(p&&(n.innerHTML=""),O("template"===t.type?n.content:n,y(h)?h:[h],t,e,i,"foreignObject"==x?"http://www.w3.org/1999/xhtml":l,u,_,u?u[0]:e.__k&&S(e,0),c,a),null!=u)for(s=u.length;s--;)v(u[s]);c||(s="value","progress"==x&&null==g?n.removeAttribute("value"):void 0!==g&&(g!==n[s]||"progress"==x&&!g||"option"==x&&g!==w[s])&&j(n,s,g,w[s],l),s="checked",void 0!==m&&m!==n[s]&&j(n,s,m,w[s],l))}return n}function D(n,t,e){try{if("function"==typeof n){var o="function"==typeof n.__u;o&&n.__u(),o&&null==t||(n.__u=n(t))}else n.current=t}catch(n){r.__e(n,e)}}function I(n,t,e){var o,i;if(r.unmount&&r.unmount(n),(o=n.ref)&&(o.current&&o.current!==n.__e||D(o,null,t)),null!=(o=n.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(n){r.__e(n,t)}o.base=o.__P=null}if(o=n.__k)for(i=0;i<o.length;i++)o[i]&&I(o[i],t,e||"function"!=typeof n.type);e||v(n.__e),n.__c=n.__=n.__e=void 0}function q(n,t,e){return this.constructor(n,e)}o=h.slice,r={__e:function(n,t,e,o){for(var r,i,l;t=t.__;)if((r=t.__c)&&!r.__)try{if((i=r.constructor)&&null!=i.getDerivedStateFromError&&(r.setState(i.getDerivedStateFromError(n)),l=r.__d),null!=r.componentDidCatch&&(r.componentDidCatch(n,o||{}),l=r.__d),l)return r.__E=r}catch(t){n=t}throw n}},i=0,x.prototype.setState=function(n,t){var e;e=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=g({},this.state),"function"==typeof n&&(n=n(g({},e),this.props)),n&&g(e,n),null!=n&&this.__v&&(t&&this._sb.push(t),E(this))},x.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),E(this))},x.prototype.render=k,l=[],_="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,c=function(n,t){return n.__v.__b-t.__v.__b},T.__r=0,a=/(PointerCapture)$|Capture$/i,s=0,f=N(!1),p=N(!0);var z,W,B,$,J={log:"transparent",debug:"#264445",error:"#4e3434",warn:"#413c26"},G="console",V=["all","log","debug","error","warn"],Y=0,K=[],Z=r,Q=Z.__b,X=Z.__r,nn=Z.diffed,tn=Z.__c,en=Z.unmount,on=Z.__;function rn(n,t){Z.__h&&Z.__h(W,n,Y||t),Y=0;var e=W.__H||(W.__H={__:[],__h:[]});return n>=e.__.length&&e.__.push({}),e.__[n]}function ln(n){return Y=1,function(n,t){var e=rn(z++,2);if(e.t=n,!e.__c&&(e.__=[fn(void 0,t),function(n){var t=e.__N?e.__N[0]:e.__[0],o=e.t(t,n);t!==o&&(e.__N=[o,e.__[1]],e.__c.setState({}))}],e.__c=W,!W.__f)){var o=function(n,t,o){if(!e.__c.__H)return!0;var i=e.__c.__H.__.filter((function(n){return!!n.__c}));if(i.every((function(n){return!n.__N})))return!r||r.call(this,n,t,o);var l=e.__c.props!==n;return i.forEach((function(n){if(n.__N){var t=n.__[0];n.__=n.__N,n.__N=void 0,t!==n.__[0]&&(l=!0)}})),r&&r.call(this,n,t,o)||l};W.__f=!0;var r=W.shouldComponentUpdate,i=W.componentWillUpdate;W.componentWillUpdate=function(n,t,e){if(this.__e){var l=r;r=void 0,o(n,t,e),r=l}i&&i.call(this,n,t,e)},W.shouldComponentUpdate=o}return e.__N||e.__}(fn,n)}function un(){for(var n;n=K.shift();)if(n.__P&&n.__H)try{n.__H.__h.forEach(an),n.__H.__h.forEach(sn),n.__H.__h=[]}catch(t){n.__H.__h=[],Z.__e(t,n.__v)}}Z.__b=function(n){W=null,Q&&Q(n)},Z.__=function(n,t){n&&t.__k&&t.__k.__m&&(n.__m=t.__k.__m),on&&on(n,t)},Z.__r=function(n){X&&X(n),z=0;var t=(W=n.__c).__H;t&&(B===W?(t.__h=[],W.__h=[],t.__.forEach((function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0}))):(t.__h.forEach(an),t.__h.forEach(sn),t.__h=[],z=0)),B=W},Z.diffed=function(n){nn&&nn(n);var t=n.__c;t&&t.__H&&(t.__H.__h.length&&(1!==K.push(t)&&$===Z.requestAnimationFrame||(($=Z.requestAnimationFrame)||cn)(un)),t.__H.__.forEach((function(n){n.u&&(n.__H=n.u),n.u=void 0}))),B=W=null},Z.__c=function(n,t){t.some((function(n){try{n.__h.forEach(an),n.__h=n.__h.filter((function(n){return!n.__||sn(n)}))}catch(e){t.some((function(n){n.__h&&(n.__h=[])})),t=[],Z.__e(e,n.__v)}})),tn&&tn(n,t)},Z.unmount=function(n){en&&en(n);var t,e=n.__c;e&&e.__H&&(e.__H.__.forEach((function(n){try{an(n)}catch(n){t=n}})),e.__H=void 0,t&&Z.__e(t,e.__v))};var _n="function"==typeof requestAnimationFrame;function cn(n){var t,e=function(){clearTimeout(o),_n&&cancelAnimationFrame(t),setTimeout(n)},o=setTimeout(e,100);_n&&(t=requestAnimationFrame(e))}function an(n){var t=W,e=n.__c;"function"==typeof e&&(n.__c=void 0,e()),W=t}function sn(n){var t=W;n.__c=n.__(),W=t}function fn(n,t){return"function"==typeof t?t(n):t}function pn(n){var t=n.activeTab,e=n.setActiveTab,o=n.clearLogs,r=n.filter,i=n.setFilter,l=n.search,u=n.setSearch;return m("div",{id:"log-window-header"},m("div",{id:"log-window-sections"},m("div",{className:"log-window-section-tab","data-tab":"console","data-active":"console"===t,onClick:function(){return e("console")}},"Console"),m("div",{className:"log-window-section-tab","data-tab":"network","data-active":"network"===t,onClick:function(){return e("network")}},"Network")),m("div",{id:"filter-section"},m("select",{id:"log-filter",value:r,onChange:function(n){return i(n.target.value)}},V.map((function(n){return m("option",{value:n},n.toLocaleUpperCase())}))),m("div",{id:"clear-logs",onClick:o},m("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24"},m("path",{fill:"none",stroke:"#6b6b6b","stroke-width":"2",d:"M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M5,5 L19,19"}))),m("input",{id:"log-search",placeholder:"Search...",value:l,onInput:function(n){return u(n.target.value)}})))}function dn(n){return dn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},dn(n)}function hn(n){var t=n.activeTab,e=n.logs,o=n.networkRequests,r=n.filter;return"all"!==r&&(e=e.filter((function(n){return n.type===r}))),m("div",{id:"log-content"},"console"===t&&m("div",{id:"log-list"},e.map((function(n,t){return m("div",{key:t,class:"log-message","data-type":n.type,style:{backgroundColor:J[n.type]||"transparent"}},m("div",null,"[",n.timestamp,"] [",n.type.toUpperCase(),"] ",n.message),n.details.some((function(n){return"object"===dn(n)&&null!==n}))&&m("details",{style:{opacity:.8,marginTop:"5px"}},m("summary",null,"View Details (",n.type,")"),m("pre",{style:{whiteSpace:"pre-wrap",color:"#ccc",padding:"5px"}},JSON.stringify(n.details,null,2))))}))),"network"===t&&m("div",{id:"network-list"},o.map((function(n,t){return m("div",{key:t,class:"network-message"},m("div",null,m("strong",null,n.method," ",n.url),m("span",{style:{color:200===n.status?"green":"red",marginLeft:"10px"}},n.status," (",n.duration," ms)")),m("details",null,m("summary",{style:{cursor:"pointer",color:"#007bff"}},"Request Details"),m("pre",{style:{whiteSpace:"pre-wrap",color:"#ccc",padding:"5px"}},JSON.stringify(n,null,2))))}))))}const bn="0.0.11";function yn(n){return function(n){if(Array.isArray(n))return mn(n)}(n)||function(n){if("undefined"!=typeof Symbol&&null!=n[Symbol.iterator]||null!=n["@@iterator"])return Array.from(n)}(n)||vn(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function gn(n,t){return function(n){if(Array.isArray(n))return n}(n)||function(n,t){var e=null==n?null:"undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(null!=e){var o,r,i,l,u=[],_=!0,c=!1;try{if(i=(e=e.call(n)).next,0===t){if(Object(e)!==e)return;_=!1}else for(;!(_=(o=i.call(e)).done)&&(u.push(o.value),u.length!==t);_=!0);}catch(n){c=!0,r=n}finally{try{if(!_&&null!=e.return&&(l=e.return(),Object(l)!==l))return}finally{if(c)throw r}}return u}}(n,t)||vn(n,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function vn(n,t){if(n){if("string"==typeof n)return mn(n,t);var e={}.toString.call(n).slice(8,-1);return"Object"===e&&n.constructor&&(e=n.constructor.name),"Map"===e||"Set"===e?Array.from(n):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?mn(n,t):void 0}}function mn(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,o=Array(t);e<t;e++)o[e]=n[e];return o}function wn(){var n=gn(ln([]),2),t=n[0],e=n[1],o=gn(ln([]),2),r=o[0],i=(o[1],gn(ln(!0),2)),l=i[0],u=i[1],_=gn(ln(G),2),c=_[0],a=_[1],s=gn(ln("all"),2),f=s[0],p=s[1];return function(n,t){var o=rn(z++,3);!Z.__s&&function(n,t){return!n||n.length!==t.length||t.some((function(t,e){return t!==n[e]}))}(o.__H,t)&&(o.__=function(){e(yn(window.__logBuffer));var n=function(n){e((function(t){return[].concat(yn(t),[n.detail])}))};return window.addEventListener("new-log",n),function(){return window.removeEventListener("new-log",n)}},o.u=t,W.__H.__h.push(o))}(0,[]),m(k,null,m("button",{id:"toggle-button",onClick:function(){return u(!l)}},l?"Hide Logs ▼":"Show Logs ▲"),l&&m("div",{id:"dynamic-log-window",class:"dynamic-log-window"},m(pn,{activeTab:c,setActiveTab:a,setFilter:p,clearLogs:function(){c===G&&e([])}}),m(hn,{activeTab:c,filter:f,logs:t,networkRequests:r})))}var kn=e(919);function xn(n){return xn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},xn(n)}function Sn(n,t){for(var e=0;e<t.length;e++){var o=t[e];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(n,Cn(o.key),o)}}function Cn(n){var t=function(n){if("object"!=xn(n)||!n)return n;var t=n[Symbol.toPrimitive];if(void 0!==t){var e=t.call(n,"string");if("object"!=xn(e))return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(n)}(n);return"symbol"==xn(t)?t:t+""}function En(n){var t="function"==typeof Map?new Map:void 0;return En=function(n){if(null===n||!function(n){try{return-1!==Function.toString.call(n).indexOf("[native code]")}catch(t){return"function"==typeof n}}(n))return n;if("function"!=typeof n)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(n))return t.get(n);t.set(n,e)}function e(){return function(n,t,e){if(Tn())return Reflect.construct.apply(null,arguments);var o=[null];o.push.apply(o,t);var r=new(n.bind.apply(n,o));return e&&On(r,e.prototype),r}(n,arguments,Pn(this).constructor)}return e.prototype=Object.create(n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),On(e,n)},En(n)}function Tn(){try{var n=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(n){}return(Tn=function(){return!!n})()}function On(n,t){return On=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,t){return n.__proto__=t,n},On(n,t)}function Pn(n){return Pn=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(n){return n.__proto__||Object.getPrototypeOf(n)},Pn(n)}var Ln=function(n){function t(){var n;return function(n,t){if(!(n instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=function(n,t,e){return t=Pn(t),function(n,t){if(t&&("object"==xn(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(n){if(void 0===n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}(n)}(n,Tn()?Reflect.construct(t,e||[],Pn(n).constructor):t.apply(n,e))}(this,t)).attachShadow({mode:"open"}),n.renderUI(),console.log("Log Window Rendered"),n}return function(n,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");n.prototype=Object.create(t&&t.prototype,{constructor:{value:n,writable:!0,configurable:!0}}),Object.defineProperty(n,"prototype",{writable:!1}),t&&On(n,t)}(t,n),function(n,t){return t&&Sn(n.prototype,t),Object.defineProperty(n,"prototype",{writable:!1}),n}(t,[{key:"renderUI",value:function(){var n=this.shadowRoot;n.innerHTML="";var t=document.createElement("style");t.textContent=kn.A,n.appendChild(t),function(n,t,e){var i,l,u,_;t==document&&(t=document.documentElement),r.__&&r.__(n,t),l=(i="function"==typeof e)?null:e&&e.__k||t.__k,u=[],_=[],U(t,n=(!i&&e||t).__k=m(k,null,[n]),l||d,d,t.namespaceURI,!i&&e?[e]:l?null:t.firstChild?o.call(t.childNodes):null,u,!i&&e?e:l?l.__e:t.firstChild,i,_),R(u,n,_)}(m(wn,null),n)}}])}(En(HTMLElement));function An(n){return An="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},An(n)}var Hn;customElements.define("log-window",Ln);var jn=null!==(Hn=bn)?Hn:"debug";if("true"===new URLSearchParams(window.location.search).get("logtohtml")){(function(){var n=[],t={log:console.log,debug:console.debug,error:console.error,warn:console.warn};function e(t,e){var o={type:t,timestamp:(new Date).toISOString(),details:e,message:e.map((function(n){return"object"===An(n)?JSON.stringify(n):n})).join(" ")};n.push(o),window.dispatchEvent(new CustomEvent("new-log",{detail:o}))}console.log=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];t.log.apply(t,o),e("log",o)},console.debug=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];t.debug.apply(t,o),e("debug",o)},console.error=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];t.error.apply(t,o),e("error",o)},console.warn=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];t.warn.apply(t,o),e("warn",o)},window.__logBuffer=n})(),console.log("[LOGTOHTML] Library version: ".concat(jn));var Nn=document.createElement("log-window");document.body.appendChild(Nn)}})();