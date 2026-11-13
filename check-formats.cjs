const assert=require('node:assert/strict');require('./dist/parser.js');const parse=require('./dist/parser-formats.js');const base=new Date(2026,10,13);
const rows=[['2026-11-14','09:00–09:30','每周项目例会','线上会议'],['2026-11-14','14:00–15:30','阅读论文并整理笔记','图书馆'],['2026-11-14','18:30–19:30','健身训练','健身房'],['2026-11-15','10:00–11:00','采购生活用品','超市'],['2026-11-15','15:00–16:00','和朋友喝咖啡','校门口咖啡店'],['2026-11-16','08:30–09:00','英语听力练习','宿舍'],['2026-11-16','19:00–20:30','整理实验数据','实验室'],['2026-11-17','14:00–15:00','课程小组讨论','教学楼 302']];
for(const sep of ['|','\t',',']){let input=['日期'+sep+'时间'+sep+'日程名称'+sep+'地点',...(sep==='|'?['---|---|---|---']:[]),...rows.map(r=>r.join(sep))].join('\n');if(sep==='|')input=input.split('\n').map(s=>'| '+s+' |').join('\n');let got=parse(input,base);assert.equal(got.length,8);rows.forEach((r,i)=>{let c=got[i];assert.equal(c.date,r[0]);assert.equal(c.start,r[1].split('–')[0]);assert.equal(c.end,r[1].split('–')[1]);assert.equal(c.title,r[2]);assert.equal(c.location,r[3]);assert.equal(c.repeat,1)})}
let c=parse('地点\t日程名称\t结束时间\t日期\t开始时间\n会议室\t项目讨论\t10:30\t2026/11/14\t09:00',base)[0];assert.equal(c.start,'09:00');assert.equal(c.end,'10:30');assert.equal(c.location,'会议室');
c=parse('明天下午3点到4点 汇报 @会议室',base)[0];assert.equal(c.date,'2026-11-14');assert.equal(c.start,'15:00');assert.equal(c.end,'16:00');assert.equal(c.location,'会议室');assert.equal(c.title,'汇报');
let a=parse('2026-11-14\n09:00-09:30 项目讨论\n14:00～15:30 阅读',base);assert.equal(a.length,2);assert.equal(a[1].date,'2026-11-14');assert.equal(a[1].end,'15:30');
a=parse('课程计划\n1.每日学习\n2.下周汇报',base);assert.equal(a.length,2);assert.equal(a[0].repeat,7);assert.equal(a[1].date,'');
c=parse('日期,时间,日程名称,地点\n2026-02-30,09:00–10:00,讨论,线上',base)[0];assert.equal(c.date,'');
c=parse('日期,时间,日程名称,地点\n2026-11-14,09:00–10:00,"讨论,计划",线上',base)[0];assert.equal(c.title,'讨论,计划');
console.log('All 8 rows verified across Markdown, TSV and CSV; ranges, reordered columns, date headings, ambiguity and quoted CSV passed.');
