# نظام ربط Packages - Services - Consultants

## البنية الهرمية

```
Package (Essential/Pro/Premium)
  └── Services (استراتيجية التحول الرقمي، استشارات مالية، ...)
       └── Consultants (متخصصين في هذه الخدمة)
```

## API Endpoints

### 1. ربط Service بـ Package
```typescript
// POST /api/admin/package-services
await fetch('/api/admin/package-services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    packageId: "package-id",
    serviceId: "service-id"
  })
})

// DELETE /api/admin/package-services?packageId=xxx&serviceId=yyy
await fetch('/api/admin/package-services?packageId=xxx&serviceId=yyy', {
  method: 'DELETE'
})
```

### 2. ربط Consultant بـ Service
```typescript
// POST /api/admin/consultant-services
await fetch('/api/admin/consultant-services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consultantId: "consultant-id",
    serviceId: "service-id"
  })
})

// DELETE /api/admin/consultant-services?consultantId=xxx&serviceId=yyy
await fetch('/api/admin/consultant-services?consultantId=xxx&serviceId=yyy', {
  method: 'DELETE'
})
```

### 3. جلب Package مع Services و Consultants
```typescript
// GET /api/packages?packageId=xxx
const response = await fetch('/api/packages?packageId=xxx')
const packageData = await response.json()

// Structure:
{
  id: "package-id",
  subscription_plans: { name: "Essential", ... },
  services: [
    {
      service: {
        id: "service-id",
        title: "استراتيجية التحول الرقمي",
        consultants: [
          {
            consultant: {
              id: "consultant-id",
              name: "محمد",
              specialty: "تحول رقمي"
            }
          }
        ]
      }
    }
  ]
}
```

## الصفحات الإدارية

### 1. إدارة Packages (/admin/subscription-packages)
- عرض جميع الـ Packages
- إضافة/تعديل/حذف Package
- **جديد**: زر "Services" لكل Package
- عند الضغط على "Services" تظهر قائمة بجميع الخدمات
- يمكن إضافة أو إزالة خدمة من الـ Package

### 2. إدارة Consultants (/admin/consultants)
- عرض جميع المستشارين
- حذف مستشار
- **جديد**: زر "Manage Services" لكل مستشار
- عند الضغط تظهر قائمة بجميع الخدمات
- يمكن إضافة أو إزالة خدمة للمستشار

## مثال عملي

### السيناريو: إنشاء Package Essential مع خدماته ومستشاريه

```typescript
// 1. إنشاء Package (موجود مسبقاً)
const essentialPackage = await prisma.subscription_packages.create({
  data: {
    planId: "essential-plan-id",
    priceMonthly: 299,
    priceYearly: 2990,
    currency: "TND"
  }
})

// 2. إنشاء Services (موجود مسبقاً)
const digitalService = await prisma.service.create({
  data: {
    title: "استراتيجية التحول الرقمي",
    description: "..."
  }
})

const financialService = await prisma.service.create({
  data: {
    title: "استشارات مالية",
    description: "..."
  }
})

// 3. ربط Services بـ Package (جديد)
await prisma.packageService.create({
  data: {
    packageId: essentialPackage.id,
    serviceId: digitalService.id
  }
})

await prisma.packageService.create({
  data: {
    packageId: essentialPackage.id,
    serviceId: financialService.id
  }
})

// 4. إنشاء Consultants (موجود مسبقاً)
const mohamed = await prisma.consultant.create({
  data: {
    name: "محمد",
    email: "mohamed@example.com",
    password: "hashed",
    specialty: "تحول رقمي"
  }
})

const fatima = await prisma.consultant.create({
  data: {
    name: "فاطمة",
    email: "fatima@example.com",
    password: "hashed",
    specialty: "استشارات مالية"
  }
})

// 5. ربط Consultants بـ Services (جديد)
await prisma.consultantService.create({
  data: {
    consultantId: mohamed.id,
    serviceId: digitalService.id
  }
})

await prisma.consultantService.create({
  data: {
    consultantId: fatima.id,
    serviceId: financialService.id
  }
})

// 6. جلب البيانات الكاملة
const fullPackage = await prisma.subscription_packages.findUnique({
  where: { id: essentialPackage.id },
  include: {
    services: {
      include: {
        service: {
          include: {
            consultants: {
              include: {
                consultant: true
              }
            }
          }
        }
      }
    }
  }
})
```

## الملفات المضافة

1. `/src/app/api/admin/package-services/route.ts` - API لربط Package-Service
2. `/src/app/api/admin/consultant-services/route.ts` - API لربط Consultant-Service
3. `/src/app/api/packages/route.ts` - API لجلب Packages مع Services و Consultants
4. تحديث `/src/app/admin/subscription-packages/page.tsx` - إضافة إدارة Services
5. تحديث `/src/app/admin/consultants/page.tsx` - إضافة إدارة Services

## كيفية الاستخدام

1. افتح `/admin/subscription-packages`
2. اضغط على زر "Services" بجانب أي Package
3. ستظهر قائمة بجميع الخدمات المتاحة
4. اضغط "Add" لإضافة خدمة أو "Remove" لإزالتها

5. افتح `/admin/consultants`
6. اضغط على "Manage Services" بجانب أي مستشار
7. ستظهر قائمة بجميع الخدمات
8. اضغط "Add" لإضافة خدمة أو "Remove" لإزالتها

الآن النظام جاهز للاستخدام! 🎉
