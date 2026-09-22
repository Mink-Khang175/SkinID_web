/* Shop categories are not routine steps: body wash must not enter a face routine.
 * Explicit exceptions refer to catalogue IDs, never incidental words in ingredients.
 */
const SHOP_CATEGORY_OVERRIDES = {
    'rilastil-1856': ['sunscreen'],
    'rilastil-2085': ['moisturizer'],
    'rilastil-1125': ['moisturizer'],
    'rilastil-1939': ['special'],
    'rilastil-1936': ['special'],
    'rilastil-1872': ['cleanser', 'special'],
    'rilastil-1871': ['cleanser', 'special'],
    'rilastil-1867': ['cleanser', 'special']
};

function normalizeProductBrand(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getProductCategories(product) {
    const brand = normalizeProductBrand(product.brandSlug || product.brand);
    if (brand === 'twon' || brand === 'dvah') return ['special'];
    if (SHOP_CATEGORY_OVERRIDES[product.id]) return SHOP_CATEGORY_OVERRIDES[product.id];
    return product.stepType ? [product.stepType.toLowerCase().trim()] : [];
}

function normalizeProductSearch(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

function getProductBenefits(product) {
    if (Array.isArray(product.benefits) && product.benefits.length > 0) {
        return product.benefits.map(b => String(b).toLowerCase().trim());
    }
    return [];
}

function filterProducts(products, { brand = 'all', step = 'all', benefit = 'all', query = '' } = {}) {
    const targetBrand = normalizeProductBrand(brand);
    const targetStep = String(step || 'all').toLowerCase().trim();
    const targetBenefit = String(benefit || 'all').toLowerCase().trim();
    const search = normalizeProductSearch(query);
    return products.filter(product => {
        if (targetBrand !== 'all' && targetBrand &&
            normalizeProductBrand(product.brandSlug || product.brand) !== targetBrand) return false;
        if (targetStep !== 'all' && !getProductCategories(product).includes(targetStep)) return false;
        if (targetBenefit !== 'all' && targetBenefit) {
            const benefits = getProductBenefits(product);
            if (!benefits.includes(targetBenefit)) return false;
        }
        const text = [product.name, product.brand, product.brandSlug, product.fullIngredients,
            ...(product.keyActives || []), ...(product.mainActives || [])].join(' ');
        return !search || normalizeProductSearch(text).includes(search);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeProductBrand, getProductCategories, getProductBenefits, filterProducts };
}
