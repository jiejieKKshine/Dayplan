// Structured formats take precedence over the original prose extractor.
(function(root){
const original=root.parseScheduleText;
function parseScheduleText(text,base=new Date()){
 const trim=s=>String(s||'').trim().replace(/^\*\*(.*?)\*\*$/,'$1');
 const aliases={date:['日期','date'],time:['时间','时段','time'],start:['开始时间','开始','start'],end:['结束时间','结束','end'],title:['日程名称','日程','活动名称','活动','事项','任务','标题','名称','title','event'],location:['地点','位置','场地','location'],notes:['备注','说明','notes']};
 const field=s=>Object.keys(aliases).find(k=>aliases[k].includes(trim(s).toLowerCase()));
 function cells(s){if(s.includes('\t'))return s.split('\t').map(trim);if(s.includes('|'))return s.replace(/^\|/,'').replace(/\|$/,'').split('|').map(trim);let out=[],cur='',quote=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'){if(quote&&s[i+1]==='"'){cur+='"';i++}else quote=!quote}else if((c===','||c==='，')&&!quote){out.push(trim(cur));cur=''}else cur+=c}out.push(trim(cur));return out}
 const clock='(凌晨|早上|上午|中午|下午|晚上)?\\s*(\\d{1,2})(?:[:：](\\d{2})|[点时](半|\\d{1,2}分?)?)?';
 function times(s){let m=s.match(new RegExp(clock+'\\s*[–—−~～至到-]\\s*'+clock));if(!m||!(m[1]||m[3]||m[5]||m[7]||/[点时]/.test(m[0])))return null;
  const convert=(p,h,min,cn)=>{h=+h;min=min?+min:cn==='半'?30:parseInt(cn||'0');if(h>23||min>59)return '';if(/下午|晚上|中午/.test(p||'')&&h<12)h+=12;return String(h).padStart(2,'0')+':'+String(min).padStart(2,'0')};return {start:convert(m[1],m[2],m[3],m[4]),end:convert(m[5]||m[1],m[6],m[7],m[8]),token:m[0]}}
 function make(title,ds,ts,location,raw,notes){const safeDate=ds.replace(/(\d{4})\.(\d{1,2})\.(\d{1,2})/g,'$1-$2-$3');let c=original(safeDate+' '+ts+' '+title,base)[0]||{hints:[]},range=times(ts);c.title=trim(title);c.location=trim(location);c.notes=notes||'';c.raw=raw;c.repeat=1;if(range){c.start=range.start;c.end=range.end;c.hints=c.hints.filter(h=>!h.includes('时间')&&!h.includes('每日'))}if(!ds.trim()){c.date='';c.hints=c.hints.filter(h=>!h.includes('日期'));c.hints.push('未提供日期，请补充')}if(!ts.trim()){c.start='';c.end='';c.hints=c.hints.filter(h=>!h.includes('时间'));c.hints.push('未提供时间，请补充')}if(!c.start&&range)c.hints.push('时间无效，请修改');if(c.start&&c.end&&c.end<=c.start)c.hints.push('结束时间需晚于开始时间，跨天请分开记录');if(/每周|每星期/.test(title))c.hints.push('检测到每周安排，本次仅导入所列日期');return c}
 const lines=String(text).replace(/\r/g,'').split('\n').map(trim).filter(s=>s&&!/^```/.test(s));let out=[],headers=null,prose=[],context='';
 function flush(){if(!prose.length)return;for(const c of original(prose.join('\n'),base)){let dateToken=(c.raw.match(/(?:(?:\d{4})[-年/.])?\d{1,2}[-月/.]\d{1,2}日?/)||[])[0]||(c.raw.match(/大后天|后天|明天|今天|今日|(下下|下|本|这)?(?:周|星期)[一二三四五六日天]/)||[])[0]||'',raw=c.raw.replace(dateToken,''),range=times(raw);if(range){c.start=range.start;c.end=range.end;c.hints=c.hints.filter(h=>!h.includes('时间'));}let loc=raw.match(/(?:地点\s*[:：]|@|＠)\s*(.+)$/)||raw.match(/(?:^|\s|[，,])在\s*(.+)$/);c.location=loc?trim(loc[1]):'';c.title=c.title.replace(dateToken,'');if(range)c.title=c.title.replace(range.token,'');if(loc)c.title=c.title.replace(loc[0],'');c.title=c.title.replace(/^[\s,，:：]+|[\s,，:：]+$/g,'').trim();out.push(c)}prose=[]}
 for(const raw of lines){const cs=cells(raw),fs=cs.map(field);if(cs.length>1&&fs.includes('title')&&(fs.includes('date')||fs.includes('time')||fs.includes('start'))){flush();headers=fs;continue}if(cs.length>1&&cs.every(s=>/^:?-{2,}:?$/.test(s)||!s))continue;
  if(headers&&cs.length>1){flush();let row={};headers.forEach((k,i)=>{if(k)row[k]=cs[i]||''});out.push(make(row.title,row.date||'',row.time||[row.start,row.end].filter(Boolean).join('–'),row.location,raw,row.notes));continue}
  headers=null;
  if(cs.length>=3&&/\d{1,2}[-月/.]\d{1,2}/.test(cs[0])&&/[:：点时]/.test(cs[1])){flush();out.push(make(cs[2],cs[0],cs[1],cs[3],raw,cs[4]));continue}
  // A date heading applies to the subsequent activity lines.
  if(/^(?:\d{4}[-年/.])?\d{1,2}[-月/.]\d{1,2}日?\s*[:：]?$/.test(raw)){flush();context=raw.replace(/[:：]$/,'');continue}
  prose.push(context&&!/(?:(?:\d{4})[-年/])?\d{1,2}[-月/]\d{1,2}|今天|明天|后天|周[一二三四五六日天]/.test(raw)?context+' '+raw.replace(/^\d+[.、)）]\s*/,''):raw);
 }flush();return out;
}
root.parseScheduleText=parseScheduleText;if(typeof module!=='undefined')module.exports=parseScheduleText;
})(typeof window!=='undefined'?window:globalThis);
