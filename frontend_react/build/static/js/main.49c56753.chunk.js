(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{20:function(t,e,a){t.exports=a(42)},39:function(t,e,a){},42:function(t,e,a){"use strict";a.r(e);var n=a(0),i=a.n(n),s=a(18),r=a.n(s),c=a(7),o=a(19),l=a(2),u=a.n(l),h=a(4),d=a(9),p=a(10),m=a(13),f=a(11),y=a(12),b=a(1),k=a(3),v=a(5),g=a(8),C=function(){return i.a.createElement("div",{style:{height:10,width:"100%"}})},O=function(t){function e(t){var a;Object(d.a)(this,e),(a=Object(m.a)(this,Object(f.a)(e).call(this,t))).state={filterLimits:{"completion-chart":[0,100],"attrition-chart":[0,100],"certification-chart":[0,100]}};var n=v([]);return a.completion=n.dimension(function(t){return t.completion_prediction}),a.attrition=n.dimension(function(t){return t.attrition_prediction}),a.certification=n.dimension(function(t){return t.certification_prediction}),a.completions=a.completion.group(Math.floor),a.attritions=a.attrition.group(Math.floor),a.certifications=a.certification.group(Math.floor),a.anonUserId=n.dimension(function(t){return t.anon_user_id}),a.charts=[],a.idLookup={},a.initialized=!1,a.onAttrClick=a.onAttrClick.bind(Object(b.a)(Object(b.a)(a))),a.onCompNoCertClick=a.onCompNoCertClick.bind(Object(b.a)(Object(b.a)(a))),a.filter=a.filter.bind(Object(b.a)(Object(b.a)(a))),a}return Object(y.a)(e,t),Object(p.a)(e,[{key:"componentDidMount",value:function(){this.props.syncChart({filter:this.filter})}},{key:"shouldComponentUpdate",value:function(t,e){return t.filteredStudents!==this.props.filteredStudents||JSON.stringify(e.filterLimits)!==JSON.stringify(this.state.filterLimits)}},{key:"componentDidUpdate",value:function(){this.renderCharts(this.props.allStudents,this.props.filteredStudents)}},{key:"onAttrClick",value:function(){var t=[[0,70],[80,100],[0,70]];this.charts.forEach(function(e,a){e.filter(t[a])})}},{key:"onCompNoCertClick",value:function(){var t=[[80,100],null,[0,20]];this.charts.forEach(function(e,a){e.filter(t[a])})}},{key:"barChart",value:function(t){var e,a=this;this.barChart.id||(this.barChart.id=0),t in this.idLookup?e=this.idLookup[t]:(this.idLookup[t]=this.barChart.id,e=this.barChart.id);var n,i={top:10,right:10,bottom:20,left:10},s=k.scale.linear().range([100,0]);this.barChart.id+=1;var r,o,l,u,h,d=k.svg.axis().orient("bottom"),p=k.svg.brush(),m=function(){var a=n.range()[1],c=s.range()[0];s.domain([0,h.top(1)[0].value]);var o=k.select("#".concat(t)),u=o.select("g");if(u.empty()){(u=o.append("svg").attr("width",a+i.left+i.right).attr("height",c+i.top+i.bottom).append("g").attr("transform","translate("+i.left+","+i.top+")")).append("clipPath").attr("id","clip-"+e).append("rect").attr("width",a).attr("height",c),u.selectAll(".bar").data(["background","foreground"]).enter().append("path").attr("class",function(t){return t+" bar"}).datum(l.all()),u.selectAll(".foreground.bar").attr("clip-path","url(#clip-"+e+")"),u.append("g").attr("class","axis").attr("transform","translate(0,"+c+")").call(d);var m=u.append("g").attr("class","brush").call(p);m.selectAll("rect").attr("height",c),m.selectAll(".resize").append("path").attr("d",function(t){var e=+("e"===t),a=e?1:-1,n=c/3;return"M"+.5*a+","+n+"A6,6 0 0 "+e+" "+6.5*a+","+(n+6)+"V"+(2*n-6)+"A6,6 0 0 "+e+" "+.5*a+","+2*n+"ZM"+2.5*a+","+(n+8)+"V"+(2*n-8)+"M"+4.5*a+","+(n+8)+"V"+(2*n-8)})}if(r)if(r=!1,u.selectAll(".brush").call(p),p.empty())u.selectAll("#clip-"+e+" rect").attr("x",0).attr("width",a);else{var f=p.extent();u.selectAll("#clip-"+e+" rect").attr("x",n(f[0])).attr("width",n(f[1])-n(f[0]))}u.selectAll(".bar").attr("d",function(t){var e,a=[],i=-1,r=t.length;for(i+=1;i<r;)e=t[i],a.push("M",n(e.key),",",c,"V",s(e.value),"h9V",c),i+=1;return a.join("")})};return p.on("brushstart.chart",function(){k.select("#".concat(t)).select(".title button").style("display",null)}),p.on("brush.chart",function(){var i=k.select("#".concat(t)).select("g"),s=p.extent();u&&i.select(".brush").call(p.extent(s=s.map(u))).selectAll(".resize").style("display",null),i.select("#clip-"+e+" rect").attr("x",n(s[0])).attr("width",n(s[1])-n(s[0])),o.filterRange(s),a.setState({filterLimits:Object(c.a)({},a.state.filterLimits,Object(g.a)({},"".concat(t),s))}),a.props.syncChart({filterLimits:a.state.filterLimits})}),p.on("brushend.chart",function(){if(p.empty()){var a=k.select("#".concat(t));a.select(".title button").style("display","none"),a.select("#clip-"+e+" rect").attr("x",null).attr("width","100%"),o.filterAll()}}),m.margin=function(t){return t?(i=t,m):i},m.x=function(t){return t?(n=t,d.scale(n),p.x(n),m):n},m.y=function(t){return t?(s=t,m):s},m.dimension=function(t){return t?(o=t,m):o},m.all=function(t){return t?(h=t,m):h},m.filter=function(e){return e?(p.extent(e),o.filterRange(e),a.setState({filterLimits:Object(c.a)({},a.state.filterLimits,Object(g.a)({},"".concat(t),e))})):(p.clear(),o.filterAll(),a.setState({filterLimits:Object(c.a)({},a.state.filterLimits,Object(g.a)({},"".concat(t),[0,100]))})),a.props.syncChart(a.state.filterLimits),r=!0,m(),m},m.group=function(t){return t?(l=t,m):l},m.round=function(t){return t?(u=t,m):u},k.rebind(m,p,"on")}},{key:"filter",value:function(t){for(var e=0;e<this.charts.length;e+=1)this.charts[e].filter(t[e])}},{key:"reset",value:function(t){this.charts[t].filter(null)}},{key:"renderCharts",value:function(t,e){if(!e||!t)return null;this.initialized||(this.completion=e.dimension(function(t){return t.completion_prediction}),this.attrition=e.dimension(function(t){return t.attrition_prediction}),this.certification=e.dimension(function(t){return t.certification_prediction}),this.completions=this.completion.group(Math.floor),this.attritions=this.attrition.group(Math.floor),this.certifications=this.certification.group(Math.floor),this.anonUserId=e.dimension(function(t){return t.anon_user_id}),this.initialized=!0);var a=[this.barChart("completion-chart").all(t.dimension(function(t){return t.completion_prediction}).group(Math.floor)).dimension(this.completion).group(this.completions).x(k.scale.linear().domain([0,100]).rangeRound([0,900])),this.barChart("attrition-chart").all(t.dimension(function(t){return t.attrition_prediction}).group(Math.floor)).dimension(this.attrition).group(this.attritions).x(k.scale.linear().domain([0,100]).rangeRound([0,900])),this.barChart("certification-chart").all(t.dimension(function(t){return t.certification_prediction}).group(Math.floor)).dimension(this.certification).group(this.certifications).x(k.scale.linear().domain([0,100]).rangeRound([0,900]))];return a.forEach(function(t){return t()}),this.charts=a,this.props.forceRerender(),a}},{key:"render",value:function(){var t=this;return i.a.createElement("div",null,i.a.createElement("p",{style:{float:"left",clear:"left",marginTop:"30px"}},"Analytics pre-sets to try: ",i.a.createElement("button",{type:"button",id:"comp-no-cert",onClick:this.onCompNoCertClick},"Predicted to complete but not to earn a certificate"),i.a.createElement("div",{style:{width:5,height:10,display:"inline-block"}}),i.a.createElement("button",{type:"button",id:"attr-no-comp-cert",onClick:this.onAttrClick},"Predicted to attrit and not complete")),i.a.createElement(C,null),i.a.createElement("div",{id:"charts"},i.a.createElement("div",{id:"completion-chart",className:"chart"},i.a.createElement("div",{className:"title"},"Completion % chance"," ",i.a.createElement("button",{className:"reset",onClick:function(){return t.reset(0)},style:{display:"none",color:"black"}},"reset"))),i.a.createElement("div",{id:"attrition-chart",className:"chart"},i.a.createElement("div",{className:"title"},"Attrition % chance"," ",i.a.createElement("button",{className:"reset",onClick:function(){return t.reset(1)},style:{display:"none",color:"black"}},"reset"))),i.a.createElement("div",{id:"certification-chart",className:"chart"},i.a.createElement("div",{className:"title"},"Certification % chance"," ",i.a.createElement("button",{className:"reset",onClick:function(){return t.reset(2)},style:{display:"none",color:"black"}},"reset")))),i.a.createElement("aside",{id:"totals"},i.a.createElement("span",{id:"active"},"".concat(this.anonUserId.top(1/0).length>0?this.anonUserId.top(1/0).length:"-"," ")),i.a.createElement("span",{id:"percentage"},"(",Math.round(100*this.anonUserId.top(1/0).length/this.props.allStudents.size()),"%)"," "),"of"," ",i.a.createElement("span",{id:"total"},this.props.allStudents.size()>0?this.props.allStudents.size():"-")," ","learners selected"," "))}}]),e}(i.a.Component),j=(a(39),function(t){function e(t){var a;return Object(d.a)(this,e),(a=Object(m.a)(this,Object(f.a)(e).call(this,t))).state={analyticsOptions:[],dropdownValue:"",instructorEmail:"",emailButtonError:"",analyticsRadio:!0,analyticsDisplay:"block",allRadio:!1,emailButtonClicked:!1,totalActiveLearners:0,emailSubject:"",emailBody:"",instructorName:"",emailSentMessage:"",oldSubject:"",automatedChecked:!1,automatedDisplay:"inline",automated2Display:"inline",saveChangesDisplay:"none",tipDisplay:"none",allRecipientsDisplay:"none",recipientsDisplay:"block",filter:function(){},filterLimits:{"completion-chart":[0,100],"attrition-chart":[0,100],"certification-chart":[0,100]}},a.onEmailButtonClick=a.onEmailButtonClick.bind(Object(b.a)(Object(b.a)(a))),a.onLoad=a.onLoad.bind(Object(b.a)(Object(b.a)(a))),a.onAnalyticsRadioClick=a.onAnalyticsRadioClick.bind(Object(b.a)(Object(b.a)(a))),a.onAllRadioClick=a.onAllRadioClick.bind(Object(b.a)(Object(b.a)(a))),a.getAnalytics=a.getAnalytics.bind(Object(b.a)(Object(b.a)(a))),a.getAll=a.getAll.bind(Object(b.a)(Object(b.a)(a))),a.setInstructorEmail=a.setInstructorEmail.bind(Object(b.a)(Object(b.a)(a))),a.setEmailSubject=a.setEmailSubject.bind(Object(b.a)(Object(b.a)(a))),a.clearDrop=a.clearDrop.bind(Object(b.a)(Object(b.a)(a))),a.makeName=a.makeName.bind(Object(b.a)(Object(b.a)(a))),a.sendEmails=a.sendEmails.bind(Object(b.a)(Object(b.a)(a))),a.sendPolicy=a.sendPolicy.bind(Object(b.a)(Object(b.a)(a))),a.loadData=a.loadData.bind(Object(b.a)(Object(b.a)(a))),a.onAutomatedClick=a.onAutomatedClick.bind(Object(b.a)(Object(b.a)(a))),a.setEmailBody=a.setEmailBody.bind(Object(b.a)(Object(b.a)(a))),a.setInstructorName=a.setInstructorName.bind(Object(b.a)(Object(b.a)(a))),a.optSelected=a.optSelected.bind(Object(b.a)(Object(b.a)(a))),a.onCheckTipMouseOver=a.onCheckTipMouseOver.bind(Object(b.a)(Object(b.a)(a))),a.onCheckTipMouseOut=a.onCheckTipMouseOut.bind(Object(b.a)(Object(b.a)(a))),a.saveChanges=a.saveChanges.bind(Object(b.a)(Object(b.a)(a))),a.onSaveChangesClick=a.onSaveChangesClick.bind(Object(b.a)(Object(b.a)(a))),a.forceRerender=a.forceRerender.bind(Object(b.a)(Object(b.a)(a))),a.syncChart=a.syncChart.bind(Object(b.a)(Object(b.a)(a))),a.allStudents=v([]),a.filteredStudents=v([]),a.anonUserId=a.filteredStudents.dimension(function(t){return t.anon_user_id}),a}return Object(y.a)(e,t),Object(p.a)(e,[{key:"componentWillMount",value:function(){this.onLoad()}},{key:"onAutomatedClick",value:function(t){this.setState({automatedChecked:t.target.checked})}},{key:"onEmailButtonClick",value:function(){var t=Object(h.a)(u.a.mark(function t(){return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(""!==this.state.instructorEmail&&this.state.instructorEmail.includes("@")){t.next=4;break}this.setState({emailButtonError:"You have entered an invalid Instructor Email"}),t.next=20;break;case 4:if(!this.state.emailButtonClicked){t.next=19;break}return t.next=7,this.sendEmails(this.anonUserId.top(1/0).map(function(t){return t.anon_user_id}));case 7:return t.next=9,this.sendPolicy(this.anonUserId.top(1/0).map(function(t){return t.anon_user_id}),this.state.filterLimits["completion-chart"],this.state.filterLimits["attrition-chart"],this.state.filterLimits["certification-chart"]);case 9:if(!this.state.analyticsRadio){t.next=14;break}return t.next=12,this.getAnalytics();case 12:t.next=16;break;case 14:return t.next=16,this.getAll();case 16:this.setState({emailButtonClicked:!1}),t.next=20;break;case 19:this.setState({emailButtonClicked:!0});case 20:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"onLoad",value:function(){var t=Object(h.a)(u.a.mark(function t(){return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.loadData("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/predictions"));case 2:return t.next=4,this.getAnalytics();case 4:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"onAllRadioClick",value:function(){this.setState({analyticsDisplay:"none",allRadio:!0,analyticsRadio:!1,automatedDisplay:"none",automated2Display:"none",allRecipientsDisplay:"block",recipientsDisplay:"none",saveChangesDisplay:"none"}),this.state.filter([[0,100],[0,100],[0,100]]),this.getAll()}},{key:"onAnalyticsRadioClick",value:function(){this.setState({analyticsDisplay:"block",automatedDisplay:"inline",automated2Display:"inline",allRecipientsDisplay:"none",recipientsDisplay:"block",analyticsRadio:!0,allRadio:!1}),this.state.filter([null,null,null]),this.getAnalytics()}},{key:"onCheckTipMouseOut",value:function(){this.setState({tipDisplay:"none"})}},{key:"onCheckTipMouseOver",value:function(){this.setState({tipDisplay:"block"})}},{key:"onSaveChangesClick",value:function(){var t=Object(h.a)(u.a.mark(function t(){return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.saveChanges(this.anonUserId.top(1/0).map(function(t){return t.anon_user_id}),this.state.filterLimits["completion-chart"],this.state.filterLimits["attrition-chart"],this.state.filterLimits["certification-chart"]);case 2:return t.next=4,this.getAnalytics();case 4:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"setEmailBody",value:function(t){this.setState({emailBody:t.target.value})}},{key:"setEmailSubject",value:function(t){this.setState({emailSubject:t.target.value})}},{key:"setInstructorEmail",value:function(t){this.setState({instructorEmail:t.target.value})}},{key:"getAll",value:function(){var t=Object(h.a)(u.a.mark(function t(){var e,a,n,s,r;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,fetch("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/all"),{method:"GET"});case 2:return e=t.sent,t.next=5,e.json();case 5:if(e=t.sent){for(a=[i.a.createElement("option",{selected:!0,value:JSON.stringify({subject:"",comp:null,attr:null,cert:null,body:"",reply:"",from:""})},"Load Past Communications")],n=Object.keys(e),s=0;s<n.length;s+=1)r=this.makeName(e[n[s]].timestamp,e[n[s]].subject),a.push(i.a.createElement("option",{value:JSON.stringify(e[n[s]])},r));this.setState({analyticsOptions:a})}case 7:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"getAnalytics",value:function(){var t=Object(h.a)(u.a.mark(function t(){var e,a,n,s,r;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,fetch("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/analytics"),{method:"GET"});case 2:return e=t.sent,t.next=5,e.json();case 5:if(e=t.sent){for(this.clearDrop(),a=[],n=Object.keys(e),s=0;s<n.length;s+=1)r=this.makeName(e[n[s]].timestamp,e[n[s]].subject),"true"===e[n[s]].auto&&(r="(Active) ".concat(r)),a.push(i.a.createElement("option",{value:JSON.stringify(e[n[s]])},r));this.setState({analyticsOptions:[].concat(Object(o.a)(this.state.analyticsOptions),a)})}case 7:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"setInstructorName",value:function(t){this.setState({instructorName:t.target.value})}},{key:"syncChart",value:function(t){this.setState(Object(c.a)({},t))}},{key:"sendEmails",value:function(){var t=Object(h.a)(u.a.mark(function t(e){var a,n,i=this;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=this.state.allRadio,n=window.location.href.split("+")[1],t.next=4,fetch("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/email"),{method:"POST",body:JSON.stringify({ids:e,subject:this.state.emailSubject,body:this.state.emailBody,reply:this.state.instructorEmail,from:this.state.instructorName,pass:"test-email4657",ann:a,course:n})});case 4:if(!t.sent){t.next=11;break}return t.next=8,this.saveChanges(this.anonUserId.top(1/0).map(function(t){return t.anon_user_id}),this.state.filterLimits["completion-chart"],this.state.filterLimits["attrition-chart"],this.state.filterLimits["certification-chart"]);case 8:this.state.analyticsRadio?this.getAnalytics():this.getAll(),this.setState({emailSentMessage:"Successfully Sent!",emailButtonClicked:!1}),setTimeout(function(){i.setState({emailSentMessage:""})},7500);case 11:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"saveChanges",value:function(){var t=Object(h.a)(u.a.mark(function t(e,a,n,i){var s;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return s=this.state.automatedChecked,t.next=3,fetch("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/changes"),{method:"POST",body:JSON.stringify({old_subject:this.state.oldSubject,ids:e,from:this.state.instructorName,reply:this.state.instructorEmail,subject:this.state.emailSubject,body:this.state.emailBody,comp:a,attr:n,cert:i,auto:s})});case 3:t.sent&&console.log("Policy Successfully Saved!");case 5:case"end":return t.stop()}},t,this)}));return function(e,a,n,i){return t.apply(this,arguments)}}()},{key:"sendPolicy",value:function(){var t=Object(h.a)(u.a.mark(function t(e,a,n,i){var s,r;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return s=this.state.automatedChecked,r=this.state.analyticsRadio,t.next=4,fetch("https://".concat("askoski.berkeley.edu",":").concat("1302","/api/save"),{method:"POST",body:JSON.stringify({ids:e,from:this.state.instructorName,reply:this.state.instructorEmail,subject:this.state.emailSubject,body:this.state.emailBody,comp:a,attr:n,cert:i,auto:s,analytics:r,timestamp:new Date})});case 4:t.sent&&console.log("Policy Successfullly Sent!");case 6:case"end":return t.stop()}},t,this)}));return function(e,a,n,i){return t.apply(this,arguments)}}()},{key:"clearDrop",value:function(){this.setState({dropdownValue:"",analyticsOptions:[i.a.createElement("option",{selected:!0,value:JSON.stringify({subject:"",comp:null,attr:null,cert:null,body:"",reply:"",from:""})},"Load Past Communications")]})}},{key:"forceRerender",value:function(){console.log(this.state.totalActiveLearners),this.setState({totalActiveLearners:0})}},{key:"loadData",value:function(){var t=Object(h.a)(u.a.mark(function t(e,a){var n,i,s;return u.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(!a){t.next=6;break}return t.next=3,k.json(e);case 3:n=t.sent,t.next=13;break;case 6:return t.next=8,fetch(e,{headers:{Authorization:"Basic ".concat(btoa("".concat("test-username1342",":").concat("test-pass7089")))},method:"GET"});case 8:return n=t.sent,t.next=11,n.text();case 11:n=t.sent,n=k.csv.parse(n);case 13:for(i=n,s=0;s<i.length;s+=1)i[s].index=s,i[s].completion_prediction=+i[s].completion_prediction,i[s].attrition_prediction=+i[s].attrition_prediction,i[s].certification_prediction=+i[s].certification_prediction;this.allStudents=v(i),this.filteredStudents=v(i),this.anonUserId=this.filteredStudents.dimension(function(t){return t.anon_user_id});case 18:case"end":return t.stop()}},t,this)}));return function(e,a){return t.apply(this,arguments)}}()},{key:"makeName",value:function(t,e){var a=new Date(t).toDateString().split(" ");return"".concat(a[1]," ").concat(a[2]," ").concat(a[3]," - ").concat(e)}},{key:"optSelected",value:function(t){var e=JSON.parse(t);this.setState({oldSubject:e.subject}),this.state.filter([e.comp,e.attr,e.cert]),this.setState({emailSubject:e.subject,emailBody:e.body,instructorEmail:e.reply,instructorName:e.from}),"true"===e.auto?this.setState({automatedChecked:!0,saveChangesDisplay:"none"}):this.setState({automatedChecked:!1,saveChangesDisplay:"none"}),"true"===e.analytics&&this.setState({saveChangesDisplay:"inline-block"})}},{key:"render",value:function(){var t=this;return i.a.createElement("div",{style:{padding:20}},i.a.createElement("h1",{style:{marginBottom:"0.5em"}},"Communicator"),i.a.createElement("h3",null,"Select recipients by:"),i.a.createElement(C,null),i.a.createElement("form",{className:"radios"},i.a.createElement("div",null,i.a.createElement("input",{type:"radio",id:"analyticsRadio",name:"type",value:"analytics",checked:this.state.analyticsRadio,onChange:this.onAnalyticsRadioClick}),"Analytics",i.a.createElement("input",{type:"radio",id:"allRadio",name:"type",value:"all",checked:this.state.allRadio,onChange:this.onAllRadioClick}),"All Learners")),i.a.createElement("select",{id:"myDropdown",onChange:function(e){t.optSelected(e.target.value)}},this.state.dropdownValue,this.state.analyticsOptions),i.a.createElement("div",{id:"analytics",style:{display:this.state.analyticsDisplay}},i.a.createElement(O,{allStudents:this.allStudents,filteredStudents:this.filteredStudents,forceRerender:this.forceRerender,syncChart:this.syncChart})),i.a.createElement("form",{style:{borderStyle:"solid",padding:"20px",marginTop:"50px",minHeight:550}},i.a.createElement("h3",null,"Compose Email"),i.a.createElement(C,null),i.a.createElement("h6",{id:"recipients",style:{display:this.state.recipientsDisplay}},"Recipients: ",this.anonUserId.top(1/0).length," Learners"),i.a.createElement("h6",{id:"all-recipients",style:{display:this.state.allRecipientsDisplay}},"Recipients: ",this.anonUserId.top(1/0).length," Learners"),i.a.createElement("div",{style:{marginTop:"20px"}},i.a.createElement("h4",null,"From"),i.a.createElement(C,null),i.a.createElement("input",{id:"from-name",type:"text",placeholder:"Instructor Name",value:this.state.instructorName,onChange:this.setInstructorName}),i.a.createElement("input",{id:"reply-to",type:"text",placeholder:"Instructor Email",value:this.state.instructorEmail,onChange:this.setInstructorEmail}),i.a.createElement("p",{id:"email-button-error"},this.state.emailButtonError),i.a.createElement("div",null,i.a.createElement(C,null),i.a.createElement("h4",null,"Subject"),i.a.createElement("input",{id:"email-subject",type:"text",placeholder:"Subject",value:this.state.emailSubject,onChange:this.setEmailSubject}),i.a.createElement(C,null),i.a.createElement("h4",null,"Body"),i.a.createElement("textarea",{id:"email-body",placeholder:"Use [:fullname:] to insert learner's full name and [:firstname:] to insert learner's last name",value:this.state.emailBody,onChange:this.setEmailBody}),i.a.createElement(C,null),i.a.createElement("button",{type:"button",id:"emailButton",onClick:this.onEmailButtonClick,style:{backgroundColor:this.state.emailButtonClicked?"red":"#e4e4e4",backgroundImage:this.state.emailButtonClicked?"linear-gradient(red,#8b0000)":"linear-gradient(#e4e4e4,#d1c9c9)"}},t.state.emailButtonClicked?(t.state.analyticsRadio,"Are you sure you want to send this email to ".concat(t.anonUserId.top(1/0).length," students?")):"Send email to selected learners"),i.a.createElement("input",{id:"automated",type:"checkbox",checked:this.state.automatedChecked,onChange:this.onAutomatedClick,onMouseOver:this.onCheckTipMouseOver,onMouseOut:this.onCheckTipMouseOut,onFocus:function(){},onBlur:function(){},style:{display:this.state.automatedDisplay}}),i.a.createElement("p",{id:"automated2",style:{display:this.state.automated2Display,marginTop:-10},onMouseOver:this.onCheckTipMouseOver,onMouseOut:this.onCheckTipMouseOut,onFocus:function(){},onBlur:function(){}},"Automatically check for and send to new matches found daily"),i.a.createElement("p",{id:"tip",style:{display:this.state.tipDisplay}},"Tip: Enabling this feature will check everyday for learners who meet the analytics criteria of this communication and will send this email to them (learners will never recieve an email twice)."),i.a.createElement("p",{style:{color:"green"}},this.state.emailSentMessage),i.a.createElement("p",null,"*Please check the maximum daily recipient limit of your email provider. For example, Gmail is 500 per day.*")))),i.a.createElement("button",{href:"#",type:"button",id:"saveChanges",className:"save",style:{display:this.state.saveChangesDisplay},onClick:this.onSaveChangesClick},"Save Changes"))}}]),e}(n.Component));r.a.render(i.a.createElement(j,null),document.getElementById("cahl-communicator-container"))}},[[20,2,1]]]);
//# sourceMappingURL=main.49c56753.chunk.js.map