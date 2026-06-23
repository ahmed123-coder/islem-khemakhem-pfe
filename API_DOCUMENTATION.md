# توثيق واجهات برمجة التطبيقات - API Documentation

## 1. API جدول المواعيد - Schedule API

### المسار - Route
```
GET /api/consultants/schedule
```

### الوصف - Description

**بالعربية:**
هذه الواجهة تُستخدم لجلب جدول مواعيد جميع المستشارين النشطين مع حجوزاتهم خلال فترة زمنية محددة. تُستخدم لعرض الأوقات المتاحة والمحجوزة لكل مستشار.

**English:**
This API fetches the schedule of all active consultants with their reservations during a specified time period. Used to display available and booked time slots for each consultant.

---

### المعاملات - Parameters

| المعامل - Parameter | النوع - Type | مطلوب - Required | الافتراضي - Default | الوصف - Description |
|---------------------|--------------|------------------|---------------------|---------------------|
| `startDate` | string | لا - No | تاريخ اليوم - Today | تاريخ البداية بصيغة ISO (مثال: 2024-03-01) - Start date in ISO format |
| `days` | number | لا - No | 7 | عدد الأيام المطلوبة - Number of days to fetch |

---

### مثال الطلب - Request Example

```javascript
// جلب جدول المواعيد لمدة 7 أيام من اليوم
// Fetch schedule for 7 days from today
fetch('/api/consultants/schedule')

// جلب جدول المواعيد لمدة 14 يوم من تاريخ محدد
// Fetch schedule for 14 days from specific date
fetch('/api/consultants/schedule?startDate=2024-03-01&days=14')
```

---

### الاستجابة - Response

```json
[
  {
    "id": "consultant-id-123",
    "name": "محمد أحمد - Mohamed Ahmed",
    "specialty": "إدارة الموارد البشرية - HR Management",
    "bio": "مستشار متخصص - Specialized consultant",
    "imageUrl": "/images/consultant.jpg",
    "isActive": true,
    "reservations": [
      {
        "id": "reservation-id-456",
        "startTime": "2024-03-01T10:00:00.000Z",
        "endTime": "2024-03-01T12:00:00.000Z"
      },
      {
        "id": "reservation-id-789",
        "startTime": "2024-03-01T14:00:00.000Z",
        "endTime": "2024-03-01T16:00:00.000Z"
      }
    ]
  }
]
```

---

### شرح الكود - Code Explanation

```typescript
export async function GET(request: Request) {
  try {
    // 1. استخراج المعاملات من الرابط
    // Extract parameters from URL
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const days = parseInt(searchParams.get('days') || '7')

    // 2. جلب المستشارين مع حجوزاتهم
    // Fetch consultants with their reservations
    const consultants = await prisma.consultant.findMany({
      where: { isActive: true }, // فقط المستشارين النشطين - Only active consultants
      include: {
        reservations: {
          where: {
            startTime: {
              gte: new Date(startDate), // من تاريخ البداية - From start date
              lt: new Date(new Date(startDate).getTime() + days * 24 * 60 * 60 * 1000) // حتى نهاية الفترة - Until end of period
            }
          }
        }
      },
      orderBy: { name: 'asc' } // ترتيب أبجدي - Alphabetical order
    })

    return NextResponse.json(consultants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}
```

**شرح الخطوات - Step by Step:**

1. **استخراج المعاملات - Extract Parameters**: نحصل على `startDate` و `days` من الرابط
2. **البحث في قاعدة البيانات - Database Query**: نجلب المستشارين النشطين فقط
3. **تضمين الحجوزات - Include Reservations**: نجلب الحجوزات التي تبدأ في الفترة المحددة
4. **الترتيب - Sorting**: نرتب المستشارين حسب الاسم
5. **الإرجاع - Return**: نرجع البيانات بصيغة JSON

---

## 2. API إنشاء الطلب والحجز - Purchase API

### المسار - Route
```
POST /api/client/purchase
```

### الوصف - Description

**بالعربية:**
هذه الواجهة تُستخدم لإنشاء طلب جديد وحجز موعد مع مستشار. تتحقق من عدم وجود تعارض في المواعيد قبل إنشاء الحجز.

**English:**
This API creates a new order and books an appointment with a consultant. It checks for scheduling conflicts before creating the reservation.

---

### البيانات المطلوبة - Request Body

```json
{
  "serviceTierId": "tier-id-123",
  "consultantId": "consultant-id-456",
  "startTime": "2024-03-01T10:00:00.000Z",
  "endTime": "2024-03-01T12:00:00.000Z"
}
```

| الحقل - Field | النوع - Type | مطلوب - Required | الوصف - Description |
|---------------|--------------|------------------|---------------------|
| `serviceTierId` | string | نعم - Yes | معرف مستوى الخدمة (Basic/Standard/Premium) - Service tier ID |
| `consultantId` | string | نعم - Yes | معرف المستشار - Consultant ID |
| `startTime` | string (ISO) | نعم - Yes | وقت بداية الحجز - Reservation start time |
| `endTime` | string (ISO) | نعم - Yes | وقت نهاية الحجز - Reservation end time |

---

### مثال الطلب - Request Example

```javascript
const response = await fetch('/api/client/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceTierId: 'tier-basic-123',
    consultantId: 'consultant-456',
    startTime: '2024-03-01T10:00:00.000Z',
    endTime: '2024-03-01T12:00:00.000Z'
  })
})

const data = await response.json()
```

---

### الاستجابة الناجحة - Success Response (200)

```json
{
  "order": {
    "id": "order-id-789",
    "clientId": "client-id-123",
    "consultantId": "consultant-id-456",
    "serviceTierId": "tier-id-123",
    "status": "PENDING",
    "messagesUsed": 0,
    "callMinutesUsed": 0,
    "createdAt": "2024-03-01T09:00:00.000Z"
  },
  "reservation": {
    "id": "reservation-id-999",
    "clientId": "client-id-123",
    "consultantId": "consultant-id-456",
    "serviceTierId": "tier-id-123",
    "startTime": "2024-03-01T10:00:00.000Z",
    "endTime": "2024-03-01T12:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2024-03-01T09:00:00.000Z"
  },
  "consultant": {
    "id": "consultant-id-456",
    "name": "محمد أحمد - Mohamed Ahmed",
    "specialty": "إدارة الموارد البشرية - HR Management"
  }
}
```

---

### رسائل الخطأ - Error Responses

| الكود - Code | الرسالة - Message | السبب - Reason |
|--------------|-------------------|----------------|
| 401 | Unauthorized | المستخدم غير مسجل دخول أو ليس عميل - User not logged in or not a client |
| 400 | Missing required fields | بيانات ناقصة - Missing data |
| 404 | Service tier not found | مستوى الخدمة غير موجود - Service tier doesn't exist |
| 404 | Consultant not found | المستشار غير موجود - Consultant doesn't exist |
| 409 | Ce créneau est déjà réservé | الموعد محجوز مسبقاً - Time slot already booked |
| 500 | Purchase failed | خطأ في الخادم - Server error |

---

### شرح الكود - Code Explanation

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. التحقق من صلاحية المستخدم
    // Verify user authentication
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. استخراج البيانات من الطلب
    // Extract data from request
    const { serviceTierId, consultantId, startTime, endTime } = await request.json()

    // 3. التحقق من وجود جميع البيانات المطلوبة
    // Validate required fields
    if (!serviceTierId || !consultantId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 4. التحقق من وجود مستوى الخدمة
    // Verify service tier exists
    const serviceTier = await prisma.serviceTier.findUnique({
      where: { id: serviceTierId },
      include: { service: true }
    })

    if (!serviceTier) {
      return NextResponse.json({ error: 'Service tier not found' }, { status: 404 })
    }

    // 5. التحقق من وجود المستشار
    // Verify consultant exists
    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })
    }

    // 6. التحقق من عدم وجود تعارض في المواعيد
    // Check for overlapping reservations
    const overlapping = await prisma.reservation.findFirst({
      where: {
        consultantId: consultantId,
        OR: [
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },    // يبدأ قبل نهاية الموعد المطلوب
              { endTime: { gt: new Date(startTime) } }     // ينتهي بعد بداية الموعد المطلوب
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({ error: 'Ce créneau est déjà réservé' }, { status: 409 })
    }

    // 7. إنشاء الطلب
    // Create order
    const order = await prisma.order.create({
      data: {
        clientId: user.id,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        status: 'PENDING'
      }
    })

    // 8. إنشاء الحجز
    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        clientId: user.id,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING'
      }
    })

    // 9. إنشاء إشعار للعميل
    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ORDER',
        title: 'Commande créée',
        message: `Votre commande pour ${serviceTier.service.name} (${serviceTier.tierType}) a été créée. Appel prévu le ${new Date(startTime).toLocaleDateString()} de ${new Date(startTime).getHours()}h à ${new Date(endTime).getHours()}h.`
      }
    })

    // 10. إرجاع النتيجة
    // Return result
    return NextResponse.json({
      order,
      reservation,
      consultant: {
        id: consultant.id,
        name: consultant.name,
        specialty: consultant.specialty
      }
    })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
```

---

### منطق كشف التعارض - Overlap Detection Logic

**بالعربية:**
لكشف التعارض في المواعيد، نتحقق من أن الحجز الجديد لا يتداخل مع أي حجز موجود:

```
الحجز الموجود: 10:00 - 12:00
الحجز الجديد: 11:00 - 13:00

التعارض موجود لأن:
- بداية الحجز الموجود (10:00) < نهاية الحجز الجديد (13:00) ✓
- نهاية الحجز الموجود (12:00) > بداية الحجز الجديد (11:00) ✓
```

**English:**
To detect scheduling conflicts, we check if the new reservation overlaps with any existing reservation:

```
Existing reservation: 10:00 - 12:00
New reservation: 11:00 - 13:00

Conflict exists because:
- Existing start (10:00) < New end (13:00) ✓
- Existing end (12:00) > New start (11:00) ✓
```

---

### أمثلة التعارض - Overlap Examples

#### مثال 1 - Example 1: تعارض كامل - Full Overlap
```
موجود - Existing: |====10h-12h====|
جديد - New:        |====10h-12h====|
النتيجة - Result: ❌ تعارض - Conflict
```

#### مثال 2 - Example 2: تعارض جزئي - Partial Overlap
```
موجود - Existing: |====10h-12h====|
جديد - New:              |====11h-13h====|
النتيجة - Result: ❌ تعارض - Conflict
```

#### مثال 3 - Example 3: لا يوجد تعارض - No Overlap
```
موجود - Existing: |====10h-12h====|
جديد - New:                        |====13h-15h====|
النتيجة - Result: ✅ مسموح - Allowed
```

#### مثال 4 - Example 4: حجوزات متتالية - Back-to-back
```
موجود - Existing: |====10h-12h====|
جديد - New:                      |====12h-14h====|
النتيجة - Result: ✅ مسموح - Allowed
```

---

## سيناريو الاستخدام الكامل - Complete Usage Scenario

### بالعربية:

1. **العميل يختار الخدمة**: يختار "إدارة الموارد البشرية"
2. **يختار المستوى**: يختار "Premium" (500€)
3. **يعرض الجدول**: يستدعي `/api/consultants/schedule` لرؤية المواعيد المتاحة
4. **يختار الموعد**: يختار المستشار "محمد" يوم الاثنين 1 مارس من 10:00 إلى 12:00
5. **يؤكد الحجز**: يستدعي `/api/client/purchase` لإنشاء الطلب والحجز
6. **يتلقى التأكيد**: يحصل على إشعار بنجاح الحجز

### English:

1. **Client selects service**: Chooses "HR Management"
2. **Selects tier**: Chooses "Premium" (500€)
3. **Views schedule**: Calls `/api/consultants/schedule` to see available slots
4. **Selects appointment**: Chooses consultant "Mohamed" on Monday March 1st from 10:00 to 12:00
5. **Confirms booking**: Calls `/api/client/purchase` to create order and reservation
6. **Receives confirmation**: Gets notification of successful booking

---

## ملاحظات مهمة - Important Notes

**بالعربية:**
- الأوقات يجب أن تكون بصيغة ISO 8601
- يتم التحقق من التعارض تلقائياً
- يتم إنشاء إشعار للعميل عند كل حجز
- الحجوزات تبدأ بحالة PENDING
- يجب أن يكون المستخدم مسجل دخول كعميل

**English:**
- Times must be in ISO 8601 format
- Overlap detection is automatic
- A notification is created for the client on each booking
- Reservations start with PENDING status
- User must be logged in as a client
