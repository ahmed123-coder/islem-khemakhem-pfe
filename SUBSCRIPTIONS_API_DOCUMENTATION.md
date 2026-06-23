# Subscriptions API Documentation / توثيق واجهة برمجة التطبيقات للاشتراكات

## English Documentation

### Overview
The Subscriptions API allows administrators to manage all orders (subscriptions) in the system. This includes viewing, updating, and deleting subscription records.

---

### Base URL
```
/api/admin/orders
```

---

### Endpoints

#### 1. Get All Orders (Subscriptions)
**Endpoint:** `GET /api/admin/orders`

**Description:** Fetches all orders/subscriptions with complete details including client, consultant, and service tier information.

**Request:**
```http
GET /api/admin/orders
```

**Response:** `200 OK`
```json
[
  {
    "id": "clxxx123",
    "status": "ACTIVE",
    "messagesUsed": 5,
    "callMinutesUsed": 30,
    "createdAt": "2024-01-15T10:30:00Z",
    "closedAt": null,
    "client": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "consultant": {
      "id": "cons123",
      "name": "Jane Smith"
    },
    "serviceTier": {
      "id": "tier123",
      "tierType": "PREMIUM",
      "price": "99.99",
      "service": {
        "name": "Business Consulting"
      }
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

#### 2. Update Order
**Endpoint:** `PUT /api/admin/orders`

**Description:** Updates an existing order's status, messages used, or call minutes used.

**Request:**
```http
PUT /api/admin/orders
Content-Type: application/json

{
  "id": "clxxx123",
  "status": "COMPLETED",
  "messagesUsed": 10,
  "callMinutesUsed": 45
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order ID |
| status | string | No | Order status (PENDING, ACTIVE, COMPLETED, CANCELLED) |
| messagesUsed | number | No | Number of messages used |
| callMinutesUsed | number | No | Number of call minutes used |

**Response:** `200 OK`
```json
{
  "id": "clxxx123",
  "status": "COMPLETED",
  "messagesUsed": 10,
  "callMinutesUsed": 45,
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

#### 3. Delete Order
**Endpoint:** `DELETE /api/admin/orders/[id]`

**Description:** Permanently deletes an order/subscription from the system.

**Request:**
```http
DELETE /api/admin/orders/clxxx123
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order ID to delete |

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Order Status Values
- `PENDING` - Order is pending activation
- `ACTIVE` - Order is currently active
- `COMPLETED` - Order has been completed
- `CANCELLED` - Order has been cancelled

---

### Error Responses
All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

---

## التوثيق بالعربية

### نظرة عامة
تتيح واجهة برمجة التطبيقات للاشتراكات للمسؤولين إدارة جميع الطلبات (الاشتراكات) في النظام. يشمل ذلك عرض وتحديث وحذف سجلات الاشتراكات.

---

### الرابط الأساسي
```
/api/admin/orders
```

---

### نقاط النهاية

#### 1. الحصول على جميع الطلبات (الاشتراكات)
**نقطة النهاية:** `GET /api/admin/orders`

**الوصف:** يجلب جميع الطلبات/الاشتراكات مع التفاصيل الكاملة بما في ذلك معلومات العميل والمستشار ومستوى الخدمة.

**الطلب:**
```http
GET /api/admin/orders
```

**الاستجابة:** `200 OK`
```json
[
  {
    "id": "clxxx123",
    "status": "ACTIVE",
    "messagesUsed": 5,
    "callMinutesUsed": 30,
    "createdAt": "2024-01-15T10:30:00Z",
    "closedAt": null,
    "client": {
      "id": "user123",
      "name": "أحمد محمد",
      "email": "ahmed@example.com"
    },
    "consultant": {
      "id": "cons123",
      "name": "فاطمة علي"
    },
    "serviceTier": {
      "id": "tier123",
      "tierType": "PREMIUM",
      "price": "99.99",
      "service": {
        "name": "استشارات الأعمال"
      }
    }
  }
]
```

**رموز الحالة:**
- `200` - نجاح
- `500` - خطأ في الخادم

---

#### 2. تحديث الطلب
**نقطة النهاية:** `PUT /api/admin/orders`

**الوصف:** يحدث طلب موجود من حيث الحالة أو الرسائل المستخدمة أو دقائق المكالمات المستخدمة.

**الطلب:**
```http
PUT /api/admin/orders
Content-Type: application/json

{
  "id": "clxxx123",
  "status": "COMPLETED",
  "messagesUsed": 10,
  "callMinutesUsed": 45
}
```

**معاملات جسم الطلب:**
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string | نعم | معرف الطلب |
| status | string | لا | حالة الطلب (PENDING, ACTIVE, COMPLETED, CANCELLED) |
| messagesUsed | number | لا | عدد الرسائل المستخدمة |
| callMinutesUsed | number | لا | عدد دقائق المكالمات المستخدمة |

**الاستجابة:** `200 OK`
```json
{
  "id": "clxxx123",
  "status": "COMPLETED",
  "messagesUsed": 10,
  "callMinutesUsed": 45,
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

**رموز الحالة:**
- `200` - نجاح
- `500` - خطأ في الخادم

---

#### 3. حذف الطلب
**نقطة النهاية:** `DELETE /api/admin/orders/[id]`

**الوصف:** يحذف طلب/اشتراك بشكل دائم من النظام.

**الطلب:**
```http
DELETE /api/admin/orders/clxxx123
```

**معاملات الرابط:**
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string | نعم | معرف الطلب المراد حذفه |

**الاستجابة:** `200 OK`
```json
{
  "success": true
}
```

**رموز الحالة:**
- `200` - نجاح
- `500` - خطأ في الخادم

---

### قيم حالة الطلب
- `PENDING` - الطلب في انتظار التفعيل
- `ACTIVE` - الطلب نشط حالياً
- `COMPLETED` - تم إكمال الطلب
- `CANCELLED` - تم إلغاء الطلب

---

### استجابات الأخطاء
قد تُرجع جميع نقاط النهاية استجابات خطأ بالتنسيق التالي:

```json
{
  "error": "وصف رسالة الخطأ"
}
```

---

## Usage Examples / أمثلة الاستخدام

### JavaScript/TypeScript Example
```javascript
// Fetch all subscriptions
const getSubscriptions = async () => {
  const response = await fetch('/api/admin/orders');
  const data = await response.json();
  return data;
};

// Update subscription
const updateSubscription = async (id, updates) => {
  const response = await fetch('/api/admin/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  return await response.json();
};

// Delete subscription
const deleteSubscription = async (id) => {
  const response = await fetch(`/api/admin/orders/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

### مثال JavaScript/TypeScript
```javascript
// جلب جميع الاشتراكات
const getSubscriptions = async () => {
  const response = await fetch('/api/admin/orders');
  const data = await response.json();
  return data;
};

// تحديث الاشتراك
const updateSubscription = async (id, updates) => {
  const response = await fetch('/api/admin/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  return await response.json();
};

// حذف الاشتراك
const deleteSubscription = async (id) => {
  const response = await fetch(`/api/admin/orders/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

---

## Notes / ملاحظات

### English
- All endpoints require admin authentication
- Deleting an order will cascade delete related messages, calls, and missions
- The `closedAt` field is automatically set when status changes to COMPLETED or CANCELLED
- Price is returned as a string to maintain decimal precision

### العربية
- تتطلب جميع نقاط النهاية مصادقة المسؤول
- حذف الطلب سيؤدي إلى حذف الرسائل والمكالمات والمهام المرتبطة تلقائياً
- يتم تعيين حقل `closedAt` تلقائياً عند تغيير الحالة إلى COMPLETED أو CANCELLED
- يتم إرجاع السعر كنص للحفاظ على دقة الأرقام العشرية
