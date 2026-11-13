/* Local Chinese schedule extraction. Ambiguous dates remain for user review. */
(function(root){
function parseScheduleText(text,base=new Date()){
 const format=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const add=n=>{let d=new Date(base.getFullYear(),base.getMonth(),base.getDate());d.setDate(d.getDate()+n);return format(d)};
 const lines=text.replace(/\r/g,'').split(/[\n；;]+/).map(s=>s.trim()).filter(Boolean);let topic='',out=[];
 const numbered=/^(?:\d+[.、．)）]|[一二三四五六七八九十]+[、.．]|[-•●])\s*/;
 for(let i=0;i<lines.length;i++){
  let raw=lines[i],body=raw.replace(numbered,'');
  if(!numbered.test(raw)&&lines[i+1]&&numbered.test(lines[i+1])&&!/今天|明天|周|星期|每日|每天|\d/.test(body)){topic=body.replace(/[：:]$/,'');continue}
  let date='',hints=[],daily=/每日|每天/.test(body),m;
  if((m=body.match(/(?:(\d{4})[-年/])?(\d{1,2})[-月/](\d{1,2})日?/))){let y=Number(m[1]||base.getFullYear()),mo=+m[2],da=+m[3],d=new Date(y,mo-1,da);if(d.getMonth()===mo-1&&d.getDate()===da)date=format(d);else hints.push('日期无效，请修改')}
  else if(/大后天/.test(body))date=add(3);else if(/后天/.test(body))date=add(2);else if(/明天/.test(body))date=add(1);else if(/今天|今日/.test(body)||daily)date=add(0);
  else if((m=body.match(/(下下|下|本|这)?(?:周|星期)([一二三四五六日天])/))){const wd='一二三四五六日'.indexOf(m[2]==='天'?'日':m[2]),cur=(base.getDay()+6)%7;let n=wd-cur+(m[1]==='下下'?14:m[1]==='下'?7:0);if(!m[1]&&n<0)n+=7;date=add(n)}
  else if(/下周|下星期/.test(body)){hints.push('只提到下周，请选择具体日期')}
  if(!date&&!hints.length)hints.push('未提供日期，请补充');
  let start='',end='';m=body.match(/(上午|下午|晚上|中午|早上)?\s*(\d{1,2})(?:[:：](\d{2})|[点时](半|\d{1,2}分?)?)/);
  if(m){let h=+m[2],min=m[3]?+m[3]:m[4]==='半'?30:parseInt(m[4]||'0');if(/下午|晚上|中午/.test(m[1]||'')&&h<12)h+=12;if(h<24&&min<60){start=String(h).padStart(2,'0')+':'+String(min).padStart(2,'0');if(h<23)end=String(h+1).padStart(2,'0')+':'+String(min).padStart(2,'0');hints.push('结束时间暂按 1 小时估算，请确认')}}
  if(!start)hints.push('未提供时间，请补充');if(daily)hints.push('每日安排：默认生成 7 天，可调整天数');
  const type=/考试|测验|期中|期末/.test(body)?'exam':/汇报|分享|答辩|报告/.test(body)?'report':/课程|上课|学习|刷.*课/.test(body)?'course':'life';
  out.push({title:(topic?topic+' · ':'')+body,date,start,end,type,repeat:daily?7:1,hints,raw});
 }
 return out;
}
root.parseScheduleText=parseScheduleText;if(typeof module!=='undefined')module.exports=parseScheduleText;
})(typeof window!=='undefined'?window:globalThis);
