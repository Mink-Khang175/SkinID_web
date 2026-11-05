// Additive repairs only: never reprice orders, delete documents or invent owners.
export function buildRepairPlan(documents) {
  const writes = [];
  const warnings = [];
  const byPath = new Map(documents.map(doc => [doc.name.split('/documents/')[1], doc]));
  for (const document of documents) {
    const path = document.name.split('/documents/')[1];
    if (!/^orders\/[^/]+$/.test(path)) continue;
    const fields = {};
    for (const key of ['createdAt', 'updatedAt', 's3SyncedAt']) {
      const value = document.fields?.[key]?.stringValue;
      if (!value) continue;
      // Locale-formatted dates are ambiguous: flag them for manual review.
      if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value))) {
        fields[key] = { timestampValue: new Date(value).toISOString() };
      } else warnings.push({ path, issue: `invalid_timestamp:${key}` });
    }
    const uid = document.fields?.userId?.stringValue;
    if (!uid || !byPath.has(`users/${uid}`)) warnings.push({ path, issue: 'missing_user_profile' });
    if (Object.keys(fields).length) writes.push({
      update: { name: document.name, fields },
      updateMask: { fieldPaths: Object.keys(fields) },
      currentDocument: { updateTime: document.updateTime }
    });
  }
  if (!byPath.has('settings/campaign_config')) {
    const active = documents.filter(doc => /^campaigns\/[^/]+$/.test(doc.name.split('/documents/')[1]) && doc.fields?.active?.booleanValue === true);
    if (active.length === 1) {
      const campaign = active[0];
      writes.push({
        update: {
          name: campaign.name.split('/documents/')[0] + '/documents/settings/campaign_config',
          fields: { ...campaign.fields, salesChannel: { stringValue: 'store' } }
        },
        currentDocument: { exists: false }
      });
    } else if (active.length > 1) warnings.push({ path: 'settings/campaign_config', issue: 'multiple_active_campaigns' });
  }
  return { writes, warnings };
}
