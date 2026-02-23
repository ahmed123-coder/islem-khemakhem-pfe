# دليل استخدام النظام للعملاء (Clients)

## 🚀 كيفية شراء Subscription

### الخطوة 1: التسجيل
1. اذهب إلى `/register`
2. أدخل بياناتك:
   - Email
   - Password
   - Name
3. اضغط "Register"

### الخطوة 2: تسجيل الدخول
1. اذهب إلى `/login`
2. أدخل:
   - Email: `client@consultpro.com`
   - Password: `client123`
3. اضغط "Login"

### الخطوة 3: اختيار Subscription
1. اذهب إلى `/pricing`
2. ستشاهد 3 خطط:
   - **Essential** (99 TND/شهر):
     - Business Strategy فقط
     - 50 رسالة
     - 1 مهمة
   
   - **Pro** (199 TND/شهر) - الأكثر شعبية:
     - Business Strategy
     - Digital Transformation
     - 200 رسالة
     - 5 مهام
   
   - **Premium** (399 TND/شهر):
     - جميع الخدمات (Business Strategy + Digital Transformation + Financial Advisory)
     - رسائل غير محدودة
     - مهام غير محدودة

3. اختر بين الدفع الشهري أو السنوي
4. اضغط "Choisir ce plan"

### الخطوة 4: بعد الشراء
بعد شراء الـ Subscription، ستتمكن من:

1. **رؤية الخدمات المتاحة**:
   - اذهب إلى `/client`
   - ستشاهد الخدمات المرتبطة بالـ Package الخاص بك

2. **اختيار مستشار**:
   - كل خدمة تعرض المستشارين المتخصصين فيها
   - مثال: إذا اشتريت Pro Package:
     - Business Strategy → Consultant Expert
     - Digital Transformation → Marie Dupont

3. **إنشاء Mission**:
   - اختر خدمة
   - اختر مستشار من المتخصصين في هذه الخدمة
   - أنشئ Mission جديدة

## 📊 مثال عملي

### سيناريو: أنت عميل تريد استشارة في التحول الرقمي

```typescript
// 1. تسجيل الدخول
POST /api/auth/login
{
  "email": "client@consultpro.com",
  "password": "client123"
}

// 2. عرض الـ Packages المتاحة
GET /pricing
// ستشاهد 3 خطط

// 3. شراء Pro Package (يحتوي على Digital Transformation)
POST /api/client/subscribe
{
  "packageId": "pro-package-id",
  "billingCycle": "MONTHLY"
}

// 4. عرض الخدمات المتاحة في الـ Package
GET /api/packages?packageId=pro-package-id
// Response:
{
  "id": "pro-package-id",
  "subscription_plans": { "name": "Pro" },
  "services": [
    {
      "service": {
        "id": "service-1",
        "title": "Business Strategy",
        "consultants": [
          {
            "consultant": {
              "id": "consultant-1",
              "name": "Consultant Expert",
              "specialty": "Business Strategy"
            }
          }
        ]
      }
    },
    {
      "service": {
        "id": "service-2",
        "title": "Digital Transformation",
        "consultants": [
          {
            "consultant": {
              "id": "consultant-2",
              "name": "Marie Dupont",
              "specialty": "Digital Transformation"
            }
          }
        ]
      }
    }
  ]
}

// 5. إنشاء Mission مع Marie Dupont للتحول الرقمي
POST /api/missions
{
  "title": "Digital Transformation Strategy",
  "description": "Need help with digital transformation",
  "consultantId": "consultant-2",
  "serviceId": "service-2"
}
```

## 🎯 الفوائد للعميل

### عند شراء Essential:
- تحصل على خدمة واحدة: Business Strategy
- يمكنك اختيار من المستشارين المتخصصين في Business Strategy

### عند شراء Pro:
- تحصل على خدمتين: Business Strategy + Digital Transformation
- يمكنك اختيار مستشارين مختلفين لكل خدمة

### عند شراء Premium:
- تحصل على جميع الخدمات الثلاثة
- وصول كامل لجميع المستشارين المتخصصين

## 📱 واجهة المستخدم

### صفحة Pricing (`/pricing`)
```
┌─────────────────────────────────────────┐
│         Nos Offres                      │
│  Choisissez le plan qui correspond      │
│                                         │
│  [Mensuel] [Annuel]                    │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Essential│ │ Pro  │ │Premium│        │
│  │99 TND │ │199 TND│ │399 TND│        │
│  │       │ │       │ │       │        │
│  │[Choisir]│[Choisir]│[Choisir]│       │
│  └──────┘  └──────┘  └──────┘         │
└─────────────────────────────────────────┘
```

### بعد الشراء - Dashboard (`/client`)
```
┌─────────────────────────────────────────┐
│  Your Subscription: Pro                 │
│  Status: ACTIVE                         │
│                                         │
│  Available Services:                    │
│  ┌─────────────────────────────────┐   │
│  │ Business Strategy               │   │
│  │ Consultants:                    │   │
│  │  - Consultant Expert            │   │
│  │  [Create Mission]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Digital Transformation          │   │
│  │ Consultants:                    │   │
│  │  - Marie Dupont                 │   │
│  │  [Create Mission]               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🔑 حسابات تجريبية

```
Client:
Email: client@consultpro.com
Password: client123

Admin:
Email: admin@consultpro.com
Password: admin123

Consultant 1:
Email: consultant@consultpro.com
Password: consultant123

Consultant 2:
Email: consultant2@consultpro.com
Password: consultant123
```

## 🛠️ API Endpoints للعميل

```typescript
// عرض جميع الـ Packages
GET /pricing

// شراء Subscription
POST /api/client/subscribe
Body: { packageId, billingCycle }

// عرض Subscription الحالي
GET /api/client/subscription

// عرض الخدمات والمستشارين المتاحين
GET /api/packages?packageId=xxx

// إنشاء Mission
POST /api/missions
Body: { title, description, consultantId, serviceId }

// عرض Missions الخاصة بك
GET /api/client/missions
```

الآن النظام جاهز للاستخدام! 🎉
