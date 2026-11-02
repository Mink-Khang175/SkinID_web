const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = read('src/data/legalPolicies.js');
const context = vm.createContext({});
vm.runInContext(source.replace(/^export \{.*\} from .*;\r?\n/gm,'').replace(/export (const|function)/g,'$1'),context);
const policies = vm.runInContext('POLICY_LIST',context);

test('PDF V2 includes the operator page and all 10 chapters without losing numbered clauses', () => {
  assert.equal(policies.length,11);
  const counts=[0,11,4,9,4,5,5,6,4,3,3];
  for (const policy of policies) {
    assert.equal(policy.version,'2.0');
    assert.equal(policy.sections.length,counts[policy.number],policy.title);
    assert.equal(new Set(policy.sections.map(s=>s.id)).size,policy.sections.length);
    policy.sections.forEach((section,i)=>{
      assert.equal(section.id,`${policy.number}-${i+1}`);
      assert(section.blocks.length,section.heading);
    });
  }
});

test('PDF internal notes and publication checklist do not appear in customer policy data', () => {
  assert.doesNotMatch(source,/Ghi chú nội bộ|Phụ lục – Danh mục kiểm tra|Phụ lục này dành cho nội bộ|Chỉ công bố mục này khi/);
  assert.match(source,/356\/2025\/NĐ-CP/);
  assert.doesNotMatch(source,/Nghị định 13\/2023/);
});

test('all extracted tables have the right number of columns and no merged-cell duplication', () => {
  let count=0;
  for(const p of policies)for(const block of [...p.intro,...p.sections.flatMap(s=>s.blocks)]){
    if(block.type!=='table')continue;
    count++;
    for(const row of block.rows){assert.equal(row.length,block.headers.length);assert(row.every(cell=>typeof cell==='string'&&cell.length));}
  }
  assert.equal(count,9);
});

test('consumer protections, separate AI consent and financial details survive PDF conversion', () => {
  assert.match(source,/không phải điều kiện bắt buộc/);
  assert.match(source,/không làm mất quyền khiếu nại/);
  assert.match(source,/không phải là lý do để SkinID từ chối trách nhiệm/);
  assert.match(source,/Sự đồng ý riêng, mặc định TẮT/);
  assert.match(source,/1063583549/);
  assert.match(source,/operation@fieldman.vn/);
  assert.match(source,/30.000đ cho đơn dưới 500.000đ/);
});

test('only unresolved PDF fields are flagged and equipment terms retain planned status', () => {
  const operator=policies.find(p=>p.number===0);
  assert(operator.pendingFields.includes('[SỐ / LINK XÁC NHẬN]'));
  for(const p of policies)for(const field of p.pendingFields){assert.match(field,/^\[[^\[\]]+\]$/);assert(!field.includes('"type"'));}
  assert.equal(policies.find(p=>p.number===9).status,'planned');
});
