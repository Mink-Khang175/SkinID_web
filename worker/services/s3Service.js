/**
 * S3 Retail Software Integration Service (ES3 / m.present.es3.vn / m.fm.es3.vn)
 * Manages authentication, token caching, customer sync, order payload mapping, and resilient API dispatching.
 */

import { getS3Config } from '../app/env.js';

let cachedToken = null;
let tokenExpiresAt = 0;
let cachedAccount = '';

/**
 * Reset token cache (useful for tests)
 */
export function resetS3TokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
  cachedAccount = '';
}

/**
 * Retrieve or refresh authentication token from S3 API
 * Endpoint: POST /Vision/Accounts/Login/v3
 */
export async function getOrRefreshToken(config, fetchFn = fetch) {
  const now = Date.now();
  const account = `${config.baseUrl}:${config.username}:${config.password}`;
  if (cachedToken && cachedAccount === account && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const baseUrl = (config.baseUrl || 'https://m.es3.vn').replace(/\/+$/, '');
  const loginUrl = `${baseUrl}/Vision/Accounts/Login/v3`;

  const response = await fetchFn(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      Username: config.username,
      Password: config.password
    })
  });

  if (!response.ok) {
    throw new Error(`S3 Login HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const token = data.AuthenticationData?.AccessToken;
  if (!token) {
    throw new Error(`S3 Login failed: ${data.Message || 'No AccessToken returned'}`);
  }

  cachedToken = token;
  cachedAccount = account;
  // Tokens typically expire in 24h (86400s)
  tokenExpiresAt = now + 86400 * 1000;

  return cachedToken;
}

/**
 * Create or sync customer on S3 POS
 * Endpoint: POST /Vision/Customers/Search & POST /Vision/Customers
 */
export async function syncCustomerToS3({ customer, token, config = {}, fetchFn = fetch }) {
  const phone = String(customer?.phone || '').trim();
  const baseUrl = (config?.baseUrl || 'https://m.es3.vn').replace(/\/+$/, '');

  // 1. Search existing customer by phone if available
  if (phone) {
    try {
      const searchRes = await fetchFn(`${baseUrl}/Vision/Customers/Search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ KeySearch: phone })
      });
      if (searchRes.ok) {
        const matches = await searchRes.json().catch(() => []);
        if (Array.isArray(matches) && matches.length > 0 && matches[0]?.Id) {
          return Number(matches[0].Id);
        }
      }
    } catch (err) {
      console.warn('[S3 Customer Search Warning]', err.message);
    }
  }

  if (!phone && !customer?.name) return 0;

  // 2. Create new customer if not found
  const custUrl = `${baseUrl}/Vision/Customers`;
  const fullName = String(customer.name || 'Khách hàng SkinID').trim();
  const nameParts = fullName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[0] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : fullName;

  try {
    const res = await fetchFn(custUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Id: 0,
        FirstName: firstName,
        LastName: lastName,
        BirthdayDay: 0,
        BirthdayMonth: 0,
        Email: customer.email || '',
        Company: 'SkinID Web Customer',
        Address: customer.address || '',
        Phone: phone,
        Mobile: phone,
        Fax: '',
        Notes: `Đăng ký từ SkinID.vn | SĐT: ${phone}`,
        Gender: 'M',
        City: 'Hồ Chí Minh',
        Country: 'VN',
        IsActive: true,
        IsCustomer: true,
        CustomerCategoryIds: ''
      })
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.Success && data.SingleData) {
        return Number(data.SingleData);
      }
    }
  } catch (err) {
    console.warn('[S3 Customer Create Warning]', err.message);
  }

  // Create returns Success:false / SingleData:0 when the phone already exists
  // (e.g. the search above raced or failed). Re-search before giving up, because
  // CustomerId 0 makes S3 reject the whole preorder/invoice with code 01.
  if (phone) {
    try {
      const retry = await fetchFn(`${baseUrl}/Vision/Customers/Search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ KeySearch: phone })
      });
      if (retry.ok) {
        const matches = await retry.json().catch(() => []);
        if (Array.isArray(matches) && matches.length > 0 && matches[0]?.Id) {
          return Number(matches[0].Id);
        }
      }
    } catch (err) {
      console.warn('[S3 Customer Re-search Warning]', err.message);
    }
  }

  return 0;
}

/**
 * Map SkinID order to S3 PreOrder payload
 * Follows "Tài liệu API tích hợp ES3 v1.4" Section 8
 */
export function mapOrderToS3Payload(order, config, customerId = 0) {
  const isBankTransfer = order.paymentMethod === 'bank_transfer';
  const orderId = String(order.id || order.orderId || '').trim();
  const branchId = Number(config.branchId || 9099);
  const cashierId = Number(config.cashierId || 16614);

  const preOrderItems = (order.items || []).map((item, index) => {
    const unitPrice = Number(item.price || item.unitPrice || 0);
    const quantity = Number(item.quantity || 1);
    const productId = Number(item.s3ProductId || item.skuNumber || 0);
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error(`Chưa ánh xạ mã S3 cho sản phẩm ${item.productId || item.sku || item.name || index}.`);
    }
    const code = String(item.productCode || item.sku || '').trim();
    const rawName = String(item.name || item.productName || 'Sản phẩm SkinID').trim();
    const productName = code && !rawName.includes(code)
      ? `[${code}] ${rawName}`.slice(0, 200)
      : rawName.slice(0, 200);

    return {
      YS_ProductID: productId,
      QuantitySold: quantity,
      PriceSold: unitPrice,
      Discount: "0",
      Attributes: code ? `SKU: ${code}` : "",
      AttributeKey: "",
      ReferenceCode: 0,
      UnitCost: unitPrice,
      MultiUOMKey: "",
      PromotionsKey: "",
      ProductName: productName,
      UOMDisplay: "Cái",
      ImageUrl: item.imageUrl || "",
      YS_PreOrderItemID: 0,
      CurrentQuantityFree: 0,
      CurrentAmountFree: 0,
      TotalQuantityFree: 0,
      TotalAmountFree: 0,
      BaseUOMID: 0,
      UOMID: 0,
      ExchangedVal: 0,
      OriginalPrice: unitPrice,
      IsChangedPrice: false,
      UOMs: null,
      Promotions: null,
      ProductVAT: "0",
      ProductVATTaxAmount: 0
    };
  });

  // S3 rejects the entire preorder with code 01 when CustomerID is 0.
  const resolvedCustomerId = Number(customerId || order.s3CustomerId || 0);
  if (!Number.isSafeInteger(resolvedCustomerId) || resolvedCustomerId <= 0) {
    throw new Error(`Không xác định được mã khách hàng S3 cho đơn ${orderId}.`);
  }

  return {
    PreOrder: {
      YS_PreOrderID: 0,
      Cashier: cashierId,
      CustomerID: resolvedCustomerId,
      InvoiceDiscount: Number(order.discountAmount || 0),
      TotalAmount: Number(order.subtotal || order.total || 0),
      InvoiceAmount: Number(order.total || 0),
      CustomerReceived: order.paymentStatus === 'paid' ? Number(order.total || 0) : 0,
      Notes: `[SkinID Đơn: #${orderId.slice(0, 8)}] ${order.note || ''} | ${isBankTransfer ? 'Vietcombank 1063583549' : 'COD'}`.trim(),
      PromotionName: order.couponCode ? `Voucher ${order.couponCode}` : "",
      PromotionAmount: Number(order.discountAmount || 0),
      PromotionDiscount: order.discountAmount ? String(order.discountAmount) : "0",
      PromotionDiscountAmount: Number(order.discountAmount || 0),
      NgayLayHang: null,
      HadChangedProductPrice: false,
      HadDiscountProduct: Number(order.discountAmount || 0) > 0,
      VAT: 0,
      VATTaxAmount: 0
    },
    PreOrderPayments: [],
    PreOrderItems: preOrderItems,
    StorefrontOrderID: 0,
    SelectedBranch: branchId,
    RequestId: `SKINID-${orderId.slice(0, 16) || Date.now()}`
  };
}

/**
 * Map SkinID order to S3 sales invoice payload
 * Follows "Tài liệu API tích hợp ES3 v1.4" Section 3: deducts stock and issues the e-invoice.
 */
export function mapOrderToS3InvoicePayload(order, config, customerId = 0) {
  const isBankTransfer = order.paymentMethod === 'bank_transfer';
  const orderId = String(order.id || order.orderId || '').trim();
  const branchId = Number(config.branchId || 9099);
  const cashierId = Number(config.cashierId || 16614);
  const total = Number(order.total || 0);
  const discount = Number(order.discountAmount || 0);
  const sourceItems = Array.isArray(order.items) ? order.items : [];
  if (!sourceItems.length) {
    throw new Error(`Đơn ${orderId} không có sản phẩm để xuất hoá đơn.`);
  }

  const items = sourceItems.map((item, index) => {
    const unitPrice = Number(item.price || item.unitPrice || 0);
    const quantity = Number(item.quantity || 1);
    const productId = Number(item.s3ProductId || item.skuNumber || 0);
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error(`Chưa ánh xạ mã S3 cho sản phẩm ${item.productId || item.sku || item.name || index}.`);
    }
    const code = String(item.productCode || item.sku || '').trim();
    const rawName = String(item.name || item.productName || 'Sản phẩm SkinID').trim();
    const productName = code && !rawName.includes(code)
      ? `[${code}] ${rawName}`.slice(0, 200)
      : rawName.slice(0, 200);

    return {
      YS_ProductID: productId,
      QuantitySold: quantity,
      PriceSold: unitPrice,
      Discount: "0",
      Attributes: code ? `SKU: ${code}` : "",
      AttributeKey: "",
      ReferenceCode: 0,
      UnitCost: unitPrice,
      MultiUOMKey: "",
      PromotionsKey: "",
      ProductName: productName,
      UOMDisplay: "Cái",
      ImageUrl: item.imageUrl || "",
      ProductVAT: "0",
      ProductVATTaxAmount: 0
    };
  });

  // AddNewPreOrder does not return YS_PreOrderID, so the invoice stands alone.
  // S3 rejects the whole request with code 01 when CustomerId is 0, so never send it.
  const resolvedCustomerId = Number(customerId || order.s3CustomerId || 0);
  if (!Number.isSafeInteger(resolvedCustomerId) || resolvedCustomerId <= 0) {
    throw new Error(`Không xác định được mã khách hàng S3 cho đơn ${orderId}.`);
  }

  return {
    RequestId: `SKINID-INV-${orderId.slice(0, 16) || Date.now()}`,
    BranchId: branchId,
    Cashier: cashierId,
    CustomerId: resolvedCustomerId,
    InvoiceAmount: total,
    TotalAmount: Number(order.subtotal || total),
    InvoiceDiscount: discount ? String(discount) : "0",
    Notes: `[SkinID Đơn: #${orderId.slice(0, 8)}] ${order.note || ''} | ${isBankTransfer ? 'Vietcombank 1063583549' : 'COD'}`.trim(),
    CustomerReceived: total,
    ReferenceCode: 0,
    DownPayment: 0,
    PreOrderId: 0,
    InvoiceDate: new Date().toISOString(),
    CompleteWithCOD: !isBankTransfer,
    GetPrintReceipt: false,
    SendMailToCustomer: true,
    Payments: isBankTransfer
      ? [{ PaymentOption: config.paymentOptionTransfer || 48797, PaymentAmount: total }]
      : null,
    Items: items,
    ManageRGBs: []
  };
}

/**
 * Issue the sales invoice for a delivered order. Deducts stock once and raises the
 * e-invoice through whatever provider the branch has enabled in S3.
 * Never throws: the caller decides how to record an uncertain outcome.
 */
export async function issueInvoiceToS3({ orderId, order, env = {}, timeoutMs = 8000, fetchFn = fetch }) {
  const config = getS3Config(env);
  if (!config.enabled) {
    return { success: false, skipped: true, reason: 's3_sync_disabled', s3InvoiceStatus: 'disabled' };
  }

  const normalizedOrder = { ...order, id: orderId || order.id || order.orderId };
  let dispatched = false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const timedFetch = (url, options = {}) => fetchFn(url, { ...options, signal: controller.signal });

  try {
    // Validate product mappings before authenticating or creating a customer.
    // CustomerId only exists after syncCustomerToS3, so use a placeholder here.
    mapOrderToS3InvoicePayload(normalizedOrder, config, 1);
    const token = await getOrRefreshToken(config, timedFetch);
    const customerId = await syncCustomerToS3({
      customer: normalizedOrder.customer,
      token,
      config,
      fetchFn: timedFetch
    });

    const payload = mapOrderToS3InvoicePayload(normalizedOrder, config, customerId);
    const baseUrl = (config.baseUrl || 'https://m.es3.vn').replace(/\/+$/, '');

    controller.signal.throwIfAborted();
    dispatched = true;
    const response = await timedFetch(`${baseUrl}/Vision/Invoices/Save/v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.ok && (responseData.code === '00' || responseData.code === 0 || responseData.success)) {
      return {
        success: true,
        s3InvoiceStatus: 'issued',
        s3InvoiceRequestId: payload.RequestId,
        s3CustomerId: customerId || undefined,
        issuedAt: new Date().toISOString()
      };
    }

    const errorMsg = responseData.message || responseData.Message || `HTTP ${response.status}`;
    console.warn(`[S3 Invoice Warning] Order #${normalizedOrder.id}:`, errorMsg);
    return { success: false, s3InvoiceStatus: 'needs_review', needsReview: true, error: errorMsg };
  } catch (error) {
    const isTimeout = error.name === 'AbortError' || error.message?.includes('aborted');
    const errorMsg = isTimeout ? `S3 API request timed out (> ${Math.round(timeoutMs / 1000)}s)` : (error.message || 'Unknown S3 network error');
    console.warn(`[S3 Invoice Fail-Safe] Order #${normalizedOrder.id}:`, errorMsg);
    // Nothing reached S3, but the order still needs attention: parking it as
    // 'pending' would silently strand it with no error recorded anywhere.
    return {
      success: false,
      s3InvoiceStatus: dispatched ? 'needs_review' : 'failed',
      needsReview: true,
      error: errorMsg
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Send order to S3 POS API with strict fail-safe resilience
 * Never throws an unhandled error so customer checkout is NEVER interrupted.
 */
export async function syncOrderToS3({ orderId, order, env = {}, timeoutMs = 4000, fetchFn = fetch }) {
  const config = getS3Config(env);

  if (!config.enabled) {
    return {
      success: false,
      skipped: true,
      reason: 's3_sync_disabled',
      s3SyncStatus: 'disabled'
    };
  }

  const normalizedOrder = {
    ...order,
    id: orderId || order.id || order.orderId
  };
  let dispatched = false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const timedFetch = (url, options = {}) => fetchFn(url, { ...options, signal: controller.signal });
  try {
    // Validate all product mappings before authenticating or creating a customer.
    // CustomerId only exists after syncCustomerToS3, so use a placeholder here.
    mapOrderToS3Payload(normalizedOrder, config, 1);
    const token = await getOrRefreshToken(config, timedFetch);

    // Sync or create customer profile on S3
    const customerId = await syncCustomerToS3({
      customer: normalizedOrder.customer,
      token,
      config,
      fetchFn: timedFetch
    });

    const payload = mapOrderToS3Payload(normalizedOrder, config, customerId);
    const baseUrl = (config.baseUrl || 'https://m.present.es3.vn').replace(/\/+$/, '');
    const postUrl = `${baseUrl}/Vision/AddNewPreOrder/v2`;

    controller.signal.throwIfAborted();
    dispatched = true;
    const response = await timedFetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller?.signal
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.ok && (responseData.success || responseData.code === '00' || responseData.code === 0)) {
      const s3OrderId = responseData.code === '00' ? (payload.RequestId) : (responseData.PreOrderID || payload.RequestId);
      return {
        success: true,
        s3OrderId: String(s3OrderId),
        s3CustomerId: customerId || undefined,
        s3SyncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        needsReview: false
      };
    }

    const errorMsg = responseData.message || responseData.Message || `HTTP ${response.status}`;
    console.warn(`[S3 Sync Warning] Order #${normalizedOrder.id} failed to sync to S3:`, errorMsg);

    return {
      success: false,
      s3SyncStatus: 'needs_review',
      needsReview: true,
      error: errorMsg,
    };
  } catch (error) {
    const isTimeout = error.name === 'AbortError' || error.message?.includes('aborted');
    const errorMsg = isTimeout ? 'S3 API request timed out (> 4s)' : (error.message || 'Unknown S3 network error');
    console.warn(`[S3 Sync Fail-Safe] Order #${normalizedOrder.id}:`, errorMsg);

    return {
      success: false,
      s3SyncStatus: dispatched ? 'needs_review' : 'pending',
      needsReview: dispatched,
      error: errorMsg
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
