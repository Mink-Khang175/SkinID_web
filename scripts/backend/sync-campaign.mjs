import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadServerEnv } from '../dev/server-env.mjs';
import { commitWrites, documentName, encodeFields } from '../../worker/firestore.js';
import { requiredFirebaseEnv } from '../../worker/app/env.js';
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from '../../src/data/promotions.js';

const root = resolve(import.meta.dirname, '../..');

export function buildCampaignData() {
  const campaign = {
    id: 'twon_dvah_flashsale_2026',
    title: "Đại Tiệc Dưỡng Trắng & Hương Thơm — TWON x D'VAH",
    subtitle: 'Ưu Đãi Độc Quyền Đến 50% & Quà Tặng Nàng Thơ',
    badge: 'SIÊU SALE ĐẶC BIỆT',
    basisPolicy: 'Chính sách bán hàng Fieldman (15/04/2026)',
    active: true,
    salesChannel: 'store',
    steps: CAMPAIGN_STEPS,
    combos: CURATED_COMBOS,
    flashSale: RETAIL_50_DEALS,
    updatedAtIso: new Date().toISOString()
  };

  return {
    campaign,
    combos: CURATED_COMBOS,
    flashSale: RETAIL_50_DEALS
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { campaign, combos, flashSale } = buildCampaignData();
  const env = loadServerEnv(root);
  console.log(`Prepared campaign data: 1 main campaign, ${combos.length} combos, ${flashSale.length} flash sale deals. Target: ${env.FIREBASE_PROJECT_ID}.`);

  if (process.argv.includes('--apply')) {
    if (!process.argv.includes(`--project=${env.FIREBASE_PROJECT_ID}`)) {
      throw new Error(`Cần chỉ định --project=${env.FIREBASE_PROJECT_ID} để xác nhận ghi.`);
    }
    requiredFirebaseEnv(env);

    const writes = [
      // 1. Ghi vào settings/campaign_config (tương thích trực tiếp với contentRepository.js)
      {
        update: {
          name: documentName(env, 'settings/campaign_config'),
          fields: encodeFields(campaign)
        },
        updateMask: { fieldPaths: Object.keys(campaign) }
      }
    ];

    await commitWrites(env, writes);
    console.log(`Successfully synced campaign data to Firestore (${writes.length} documents written).`);
  } else {
    console.log('Validation only. No Firebase writes. Run with --apply --project=<project-id> to write.');
  }
}
