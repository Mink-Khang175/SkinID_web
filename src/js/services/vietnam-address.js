/** Vietnam's two-level administrative units, effective from 01/07/2025. */
(function initializeVietnamAddressService() {
    const API_BASE = 'https://provinces.open-api.vn/api/v2';
    const provinces = [
        [1, 'Thành phố Hà Nội'], [4, 'Tỉnh Cao Bằng'], [8, 'Tỉnh Tuyên Quang'],
        [11, 'Tỉnh Điện Biên'], [12, 'Tỉnh Lai Châu'], [14, 'Tỉnh Sơn La'],
        [15, 'Tỉnh Lào Cai'], [19, 'Tỉnh Thái Nguyên'], [20, 'Tỉnh Lạng Sơn'],
        [22, 'Tỉnh Quảng Ninh'], [24, 'Tỉnh Bắc Ninh'], [25, 'Tỉnh Phú Thọ'],
        [31, 'Thành phố Hải Phòng'], [33, 'Tỉnh Hưng Yên'], [37, 'Tỉnh Ninh Bình'],
        [38, 'Tỉnh Thanh Hóa'], [40, 'Tỉnh Nghệ An'], [42, 'Tỉnh Hà Tĩnh'],
        [44, 'Tỉnh Quảng Trị'], [46, 'Thành phố Huế'], [48, 'Thành phố Đà Nẵng'],
        [51, 'Tỉnh Quảng Ngãi'], [52, 'Tỉnh Gia Lai'], [56, 'Tỉnh Khánh Hòa'],
        [66, 'Tỉnh Đắk Lắk'], [68, 'Tỉnh Lâm Đồng'], [75, 'Tỉnh Đồng Nai'],
        [79, 'Thành phố Hồ Chí Minh'], [80, 'Tỉnh Tây Ninh'], [82, 'Tỉnh Đồng Tháp'],
        [86, 'Tỉnh Vĩnh Long'], [91, 'Tỉnh An Giang'], [92, 'Thành phố Cần Thơ'],
        [96, 'Tỉnh Cà Mau']
    ].map(([code, name]) => ({ code, name }));
    const wardCache = new Map();

    function fillOptions(select, items, placeholder, selectedCode = '') {
        if (!select) return;
        select.replaceChildren(new Option(placeholder, ''));
        items.forEach(item => select.add(new Option(item.name, String(item.code), false, String(item.code) === String(selectedCode || ''))));
    }

    async function getWards(provinceCode) {
        const code = Number(provinceCode);
        if (!Number.isInteger(code)) return [];
        if (wardCache.has(code)) return wardCache.get(code);
        const response = await fetch(`${API_BASE}/p/${code}?depth=2`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Không thể tải danh sách phường/xã.');
        const payload = await response.json();
        const wards = Array.isArray(payload.wards) ? payload.wards.map(({ code: wardCode, name }) => ({ code: wardCode, name })) : [];
        wardCache.set(code, wards);
        return wards;
    }

    async function bindForm({ provinceId, wardId, selectedProvinceCode = '', selectedWardCode = '' }) {
        const provinceSelect = document.getElementById(provinceId);
        const wardSelect = document.getElementById(wardId);
        if (!provinceSelect || !wardSelect) return;
        fillOptions(provinceSelect, provinces, 'Chọn tỉnh/thành', selectedProvinceCode);

        const loadSelectedWards = async (wardCode = '') => {
            wardSelect.disabled = true;
            fillOptions(wardSelect, [], provinceSelect.value ? 'Đang tải phường/xã…' : 'Chọn tỉnh/thành trước');
            if (!provinceSelect.value) return;
            try {
                const wards = await getWards(provinceSelect.value);
                fillOptions(wardSelect, wards, 'Chọn phường/xã', wardCode);
                wardSelect.disabled = false;
            } catch (error) {
                fillOptions(wardSelect, [], 'Không tải được — chọn lại tỉnh');
                wardSelect.disabled = false;
            }
        };

        if (provinceSelect.dataset.addressBound !== 'true') {
            provinceSelect.addEventListener('change', () => loadSelectedWards());
            provinceSelect.dataset.addressBound = 'true';
        }
        await loadSelectedWards(selectedWardCode);
    }

    function readForm({ provinceId, wardId, line1Id }) {
        const provinceSelect = document.getElementById(provinceId);
        const wardSelect = document.getElementById(wardId);
        const line1 = document.getElementById(line1Id)?.value.trim() || '';
        const provinceCode = Number(provinceSelect?.value || 0);
        const wardCode = Number(wardSelect?.value || 0);
        const provinceName = provinceSelect?.selectedOptions?.[0]?.text || '';
        const wardName = wardSelect?.selectedOptions?.[0]?.text || '';
        const fullAddress = [line1, wardName, provinceName].filter(Boolean).join(', ');
        return { line1, wardCode, wardName, provinceCode, provinceName, fullAddress };
    }

    window.VietnamAddress = Object.freeze({ bindForm, readForm, provinces });
})();
