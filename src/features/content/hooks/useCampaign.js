import { useEffect, useState } from 'react';
import { fetchCampaign } from '../services/contentRepository.js';
import { DEFAULT_CAMPAIGN } from '../../../data/siteContent.js';

export function useCampaign() {
  const [campaign, setCampaign] = useState(() => DEFAULT_CAMPAIGN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCampaign()
      .then((data) => {
        if (!mounted || !data) return;
        setCampaign((prev) => ({
          ...prev,
          ...data,
          combos: Array.isArray(data.combos) && data.combos.length ? data.combos : prev.combos,
          flashSale: Array.isArray(data.flashSale) && data.flashSale.length ? data.flashSale : prev.flashSale,
          steps: Array.isArray(data.steps) && data.steps.length ? data.steps : prev.steps
        }));
      })
      .catch((err) => {
        console.warn('[useCampaign] Error fetching campaign from Firestore:', err?.message || err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const onUpdate = (event) => {
      const data = event?.detail?.campaign;
      if (data && mounted) {
        setCampaign((prev) => ({
          ...prev,
          ...data,
          combos: Array.isArray(data.combos) && data.combos.length ? data.combos : prev.combos,
          flashSale: Array.isArray(data.flashSale) && data.flashSale.length ? data.flashSale : prev.flashSale,
          steps: Array.isArray(data.steps) && data.steps.length ? data.steps : prev.steps
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('skinid:campaign-updated', onUpdate);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('skinid:campaign-updated', onUpdate);
      }
    };
  }, []);

  return {
    campaign,
    combos: campaign.combos || DEFAULT_CAMPAIGN.combos,
    flashSale: campaign.flashSale || DEFAULT_CAMPAIGN.flashSale,
    steps: campaign.steps || DEFAULT_CAMPAIGN.steps,
    loading
  };
}
