'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Navigation - Common
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  bookings: { en: 'Bookings', ar: 'الحجوزات' },
  bookingRequests: { en: 'Booking Requests', ar: 'طلبات الحجز' },
  appointments: { en: 'Appointments', ar: 'المواعيد' },
  schedules: { en: 'Schedules', ar: 'مواعيد العمل' },
  financials: { en: 'Financials', ar: 'المالية' },
  reports: { en: 'Reports', ar: 'التقارير والمطابقة' },
  allDoctors: { en: 'All Doctors', ar: 'جميع الأطباء' },
  clinics: { en: 'Clinics', ar: 'العيادات' },
  doctors: { en: 'Doctors', ar: 'الأطباء' },
  patients: { en: 'Patients', ar: 'المرضى' },
  banners: { en: 'Banners', ar: 'الإعلانات والبانرات' },
  specialists: { en: 'Specialists', ar: 'التخصصات الطبية' },
  insurance: { en: 'Insurance', ar: 'شركات التأمين' },
  prepaidCards: { en: 'Prepaid Cards', ar: 'البطاقات مسبقة الدفع' },
  controlAi: { en: 'Control AI', ar: 'التحكم بالذكاء الاصطناعي' },
  otpSystem: { en: 'OTP System', ar: 'نظام التحقق (OTP)' },
  notificationTemplates: { en: 'Notification Templates', ar: 'قوالب الإشعارات' },
  legalAgreements: { en: 'Legal Agreements', ar: 'الاتفاقيات والسياسات' },
  clinicSubscriptions: { en: 'Clinic Subscriptions', ar: 'اشتراكات العيادات' },
  patientSubscriptions: { en: 'Patient Subscriptions', ar: 'اشتراكات المرضى' },
  clinicAdmin: { en: 'Clinic Admin', ar: 'مسؤول العيادة' },
  clinicStaff: { en: 'Clinic Staff', ar: 'طاقم العيادة' },
  forFamily: { en: 'For', ar: 'لصالح' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },

  // Clinic Dashboard KPIs & Statuses
  activeDoctors: { en: 'Active Doctors', ar: 'الأطباء المعتمدون' },
  pendingAppointments: { en: 'Pending Requests', ar: 'طلبات الحجز المعلقة' },
  confirmedAppointments: { en: 'Confirmed', ar: 'مؤكدة' },
  completedAppointments: { en: 'Completed', ar: 'مكتملة' },
  cancelledAppointments: { en: 'Cancelled', ar: 'ملغاة' },
  noShowAppointments: { en: 'No Show', ar: 'لم يحضر' },
  operationalKpis: { en: 'Operational Overview', ar: 'نظرة عامة على التشغيل' },
  appointmentStatuses: { en: 'Appointment Lifecycle', ar: 'مراحل ومسار المواعيد' },

  // Topbar & Greetings
  goodMorning: { en: 'Good Morning', ar: 'صباح الخير' },
  goodAfternoon: { en: 'Good Afternoon', ar: 'مساء الخير' },
  goodEvening: { en: 'Good Evening', ar: 'مساء الخير' },
  welcomeBack: { en: 'Welcome back!', ar: 'مرحباً بك مجدداً!' },
  clinicOverview: { en: "Here's your clinic overview.", ar: 'إليك نظرة عامة على نشاط العيادة.' },
  adminOverview: { en: 'Overview of system statistics', ar: 'نظرة شاملة على إحصائيات النظام' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  clinicManager: { en: 'Clinic Manager', ar: 'مدير العيادة' },
  platformAdmin: { en: 'Platform Administrator', ar: 'مدير المنصة' },
  language: { en: 'Language', ar: 'اللغة' },
  english: { en: 'English', ar: 'الإنجليزية' },
  arabic: { en: 'العربية', ar: 'العربية' },

  // Admin Dashboard Specific
  adminDashboard: { en: 'Admin Dashboard', ar: 'لوحة تحكم المسؤول' },
  systemStatistics: { en: 'System Statistics', ar: 'إحصائيات النظام العامة' },
  clinicManagement: { en: 'Clinic Management', ar: 'إدارة العيادات' },
  doctorManagement: { en: 'Doctor Management', ar: 'إدارة الأطباء' },
  patientManagement: { en: 'Patient Management', ar: 'إدارة المرضى' },
  clinicDoctors: { en: 'Clinic Doctors', ar: 'أطباء العيادة' },
  clinicDoctorsDesc: { en: 'Manage and view all registered doctors under your clinic.', ar: 'إدارة واستعراض جميع الأطباء المسجلين لدى عيادتك.' },
  manageClinics: { en: 'Manage Clinics', ar: 'إدارة العيادات' },
  manageClinicsDesc: { en: 'View and verify registered clinics', ar: 'استعراض والتحقق من العيادات المسجلة' },
  manageDoctors: { en: 'Manage Doctors', ar: 'إدارة الأطباء' },
  manageDoctorsDesc: { en: 'View all registered doctors', ar: 'استعراض جميع الأطباء المسجلين والتحقق منهم' },
  managePatients: { en: 'Manage Patients', ar: 'إدارة المرضى' },
  managePatientsDesc: { en: 'View and manage patient accounts', ar: 'استعراض وإدارة حسابات وسجلات المرضى' },
  verified: { en: 'Verified', ar: 'تم التحقق' },
  unverified: { en: 'Unverified', ar: 'غير موثق' },
  verifyClinic: { en: 'Verify Clinic', ar: 'توثيق العيادة' },
  verifyDoctor: { en: 'Verify Doctor', ar: 'توثيق الطبيب' },
  addFunds: { en: 'Add Funds', ar: 'إضافة رصيد' },
  walletBalance: { en: 'Wallet balance', ar: 'رصيد المحفظة' },
  serviceFee: { en: 'Service fee', ar: 'رسوم الخدمة' },
  globalNotification: { en: 'Global Notification', ar: 'إشعار عام' },
  searchClinics: { en: 'Search clinics...', ar: 'البحث عن عيادات...' },
  searchDoctors: { en: 'Search doctors...', ar: 'البحث عن أطباء...' },
  searchPatients: { en: 'Search patients...', ar: 'البحث عن مرضى...' },
  addNewPatient: { en: 'Add New Patient', ar: 'إضافة مريض جديد' },
  profileIncomplete: { en: 'Profile Incomplete', ar: 'الملف غير مكتمل' },
  noLocation: { en: 'No location', ar: 'لا يوجد موقع' },
  clinicsRegistered: { en: 'clinics registered', ar: 'عيادة مسجلة' },
  doctorsRegistered: { en: 'doctors registered', ar: 'طبيب مسجل' },
  patientsRegistered: { en: 'patients registered', ar: 'مريض مسجل' },
  noDoctorsFound: { en: 'No doctors found', ar: 'لم يتم العثور على أطباء' },
  noPatientsFound: { en: 'No patients found', ar: 'لم يتم العثور على مرضى' },
  academicQualifications: { en: 'Academic & Professional Qualifications', ar: 'المؤهلات الأكاديمية والمهنية' },
  noQualificationsRecorded: { en: 'No qualifications recorded.', ar: 'لا توجد مؤهلات مسجلة.' },
  independentDoctor: { en: 'Independent Doctor', ar: 'طبيب مستقل' },
  independent: { en: 'Independent', ar: 'مستقل' },
  yearsExperience: { en: 'yrs', ar: 'سنوات' },
  general: { en: 'General', ar: 'عام' },
  unnamedDoctor: { en: 'Unnamed Doctor', ar: 'طبيب غير معرّف' },
  medicalSpecialist: { en: 'Medical Specialist', ar: 'أخصائي طبي' },
  male: { en: 'Male', ar: 'ذكر' },
  female: { en: 'Female', ar: 'أنثى' },
  gender: { en: 'Gender', ar: 'الجنس' },
  more: { en: 'more', ar: 'المزيد' },
  clearSearch: { en: 'Clear Search', ar: 'مسح البحث' },
  noDoctorsSearchMatch: { en: 'No doctors matched your search.', ar: 'لم يتم العثور على أطباء يطابقون بحثك.' },
  noDoctorsRegistered: { en: 'There are currently no registered doctors in the system.', ar: 'لا يوجد أطباء مسجلون في النظام حالياً.' },
  filesSelected: { en: 'files selected', ar: 'ملفات محددة' },
  aboutDoctor: { en: 'About Doctor', ar: 'نبذة عن الطبيب' },
  professionalCredentials: { en: 'Professional Credentials & Clinic', ar: 'المؤهلات المهنية والعيادة' },
  medicalLicenseNumber: { en: 'Medical License Number', ar: 'رقم ترخيص مزاولة المهنة' },
  consultationFee: { en: 'Consultation Fee', ar: 'رسوم الكشف' },
  associatedClinic: { en: 'Associated Clinic', ar: 'العيادة التابع لها' },
  personalContactInfo: { en: 'Personal & Contact Information', ar: 'المعلومات الشخصية وبيانات الاتصال' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  emailAddress: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  dateOfBirth: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  address: { en: 'Address', ar: 'العنوان' },
  passingYear: { en: 'Passing Year', ar: 'سنة التخرج' },
  degreeQualification: { en: 'Degree / Qualification', ar: 'الدرجة العلمية / المؤهل' },
  qualifications: { en: 'Qualifications', ar: 'المؤهلات' },
  years: { en: 'Years', ar: 'سنوات' },
  patientServiceFee: { en: 'Patient Service Fee', ar: 'رسوم خدمة المرضى' },
  patientServiceFeeDesc: { en: 'Set the service fee amount for patients based on their country', ar: 'تحديد رسوم الخدمة للمرضى حسب الدولة' },
  saveFees: { en: 'Save Fees', ar: 'حفظ الرسوم' },
  currentFee: { en: 'Current', ar: 'الحالي' },
  unnamedPatient: { en: 'Unnamed Patient', ar: 'مريض بدون اسم' },
  updateWallet: { en: 'Update Wallet', ar: 'تحديث المحفظة' },
  notify: { en: 'Notify', ar: 'إشعار' },
  banPatient: { en: 'Ban Patient', ar: 'حظر المريض' },
  unbanPatient: { en: 'Unban Patient', ar: 'إلغاء حظر المريض' },
  registered: { en: 'Registered', ar: 'تاريخ التسجيل' },
  viewProfile: { en: 'View Profile', ar: 'عرض الملف الشخصي' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  experience: { en: 'Experience', ar: 'الخبرة' },
  license: { en: 'License', ar: 'الترخيص' },
  dob: { en: 'DOB', ar: 'تاريخ الميلاد' },
  free: { en: 'Free', ar: 'مجاني' },
  unverify: { en: 'Unverify', ar: 'إلغاء التوثيق' },
  confirmVerifyClinic: { en: 'Are you sure you want to verify', ar: 'هل أنت متأكد من رغبتك في توثيق' },
  confirmUnverifyClinic: { en: 'Are you sure you want to unverify', ar: 'هل أنت متأكد من رغبتك في إلغاء توثيق' },
  confirmVerifyDoctor: { en: 'Are you sure you want to verify', ar: 'هل أنت متأكد من رغبتك في توثيق' },
  confirmUnverifyDoctor: { en: 'Are you sure you want to unverify', ar: 'هل أنت متأكد من رغبتك في إلغاء توثيق' },
  enterWalletAmount: { en: 'Enter wallet amount', ar: 'أدخل مبلغ المحفظة' },
  updateWalletDesc: { en: 'Update the wallet balance for', ar: 'تحديث رصيد المحفظة لـ' },
  sendGlobalClinicNotification: { en: 'Send Global Clinic Notification', ar: 'إرسال إشعار عام للعيادات' },
  sendClinicNotification: { en: 'Send Clinic Notification', ar: 'إرسال إشعار للعيادة' },
  sendGlobalClinicDesc: { en: 'Send a notification to all or selected registered clinics in the system.', ar: 'إرسال إشعار لجميع العيادات المسجلة أو المحددة في النظام.' },
  sendClinicDesc: { en: 'Send a notification to', ar: 'إرسال إشعار إلى' },
  selectClinicsToNotify: { en: 'Select Clinics to Notify', ar: 'تحديد العيادات المستلمة للإشعار' },
  clinicRecipient: { en: 'Clinic Recipient', ar: 'العيادة المستلمة' },
  searchClinicsInList: { en: 'Search clinics in this list...', ar: 'البحث عن عيادات في هذه القائمة...' },
  loadingClinicsList: { en: 'Loading clinics list...', ar: 'جاري تحميل قائمة العيادات...' },
  noClinicsFound: { en: 'No clinics found', ar: 'لم يتم العثور على عيادات' },
  sendGlobalPatientNotification: { en: 'Send Global Patient Notification', ar: 'إرسال إشعار عام للمرضى' },
  sendPatientNotification: { en: 'Send Patient Notification', ar: 'إرسال إشعار للمريض' },
  sendGlobalPatientDesc: { en: 'Send a notification to all or selected registered patients in the system.', ar: 'إرسال إشعار لجميع المرضى المسجلين أو المحددين في النظام.' },
  selectPatientsToNotify: { en: 'Select Patients to Notify', ar: 'تحديد المرضى المستلمين للإشعار' },
  patientRecipient: { en: 'Patient Recipient', ar: 'المريض المستلم' },
  searchPatientsInList: { en: 'Search patients in this list...', ar: 'البحث عن مرضى في هذه القائمة...' },
  loadingPatientsList: { en: 'Loading patients list...', ar: 'جاري تحميل قائمة المرضى...' },
  enterNotificationTitle: { en: 'Enter notification title', ar: 'أدخل عنوان الإشعار' },
  enterNotificationDesc: { en: 'Enter notification description', ar: 'أدخل نص الإشعار' },
  title: { en: 'Title', ar: 'العنوان' },
  description: { en: 'Description', ar: 'الوصف' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  deselectAll: { en: 'Deselect All', ar: 'إلغاء تحديد الكل' },
  selectedCount: { en: 'Selected', ar: 'المحدد' },
  sendToCount: { en: 'Send to', ar: 'إرسال إلى' },
  sendNotification: { en: 'Send Notification', ar: 'إرسال الإشعار' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  processing: { en: 'Processing...', ar: 'جاري المعالجة...' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  success: { en: 'Success', ar: 'تم بنجاح' },
  error: { en: 'Error', ar: 'خطأ' },
  name: { en: 'Name', ar: 'الاسم' },
  image: { en: 'Image', ar: 'الصورة' },
  about: { en: 'About', ar: 'نبذة' },
  editSpecialist: { en: 'Edit Specialist', ar: 'تعديل التخصص' },
  updateSpecialistInfo: { en: 'Update specialist information', ar: 'تحديث بيانات التخصص' },
  imageOptional: { en: 'Image (optional - leave empty to keep current)', ar: 'الصورة (اختياري - اتركه فارغاً للاحتفاظ بالحالية)' },
  logoOptional: { en: 'Logo (optional - leave empty to keep current)', ar: 'الشعار (اختياري - اتركه فارغاً للاحتفاظ بالحالي)' },
  editInsurance: { en: 'Edit Insurance Provider', ar: 'تعديل شركة التأمين' },
  updateInsuranceInfo: { en: 'Update insurance provider information', ar: 'تحديث بيانات شركة التأمين' },
  creating: { en: 'Creating...', ar: 'جاري الإنشاء...' },
  updating: { en: 'Updating...', ar: 'جاري التحديث...' },
  deleting: { en: 'Deleting...', ar: 'جاري الحذف...' },
  confirmDeleteSpecialist: { en: 'Are you sure you want to delete this specialist?', ar: 'هل أنت متأكد من رغبتك في حذف هذا التخصص؟' },
  confirmDeleteInsurance: { en: 'Are you sure you want to delete this insurance company?', ar: 'هل أنت متأكد من رغبتك في حذف شركة التأمين هذه؟' },
  createdAt: { en: 'Created At', ar: 'تاريخ الإنشاء' },
  topUpDate: { en: 'TopUp Date', ar: 'تاريخ الشحن' },
  downloading: { en: 'Downloading...', ar: 'جاري التحميل...' },
  downloadComplete: { en: 'Download complete.', ar: 'اكتمل التحميل بنجاح.' },
  preparingFile: { en: 'Preparing your file.', ar: 'جاري تجهيز الملف.' },
  titleAndDescRequired: { en: 'Title and description are required', ar: 'العنوان والوصف كلاهما مطلوب' },
  validationError: { en: 'Validation Error', ar: 'خطأ في التحقق من البيانات' },
  all: { en: 'All', ar: 'الكل' },
  banned: { en: 'Banned', ar: 'محظور' },
  unban: { en: 'Unban', ar: 'إلغاء الحظر' },
  ban: { en: 'Ban', ar: 'حظر' },
  accessDenied: { en: 'Access Denied', ar: 'تم رفض الوصول' },
  noPermission: { en: 'You do not have permission to access this page.', ar: 'ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.' },
  noPermissionDashboard: { en: 'You do not have permission to access the dashboard.', ar: 'ليس لديك الصلاحيات الكافية للوصول إلى لوحة التحكم.' },
  loadingBookings: { en: 'Loading bookings...', ar: 'جاري تحميل الحجوزات...' },
  thisClinic: { en: 'this clinic', ar: 'هذه العيادة' },
  thisPatient: { en: 'this patient', ar: 'هذا المريض' },
  confirmStatusChange: { en: 'Are you sure you want to', ar: 'هل أنت متأكد من رغبتك في' },

  // Banners
  allBanners: { en: 'All Banners', ar: 'جميع الإعلانات والبانرات' },
  addBanner: { en: 'Add Banner', ar: 'إضافة إعلان' },
  uploadBanners: { en: 'Upload Banners', ar: 'رفع إعلانات' },
  upload: { en: 'Upload', ar: 'رفع' },
  uploading: { en: 'Uploading...', ar: 'جاري الرفع...' },
  bannerImages: { en: 'Banner Images', ar: 'صور الإعلانات' },
  noBannersFound: { en: 'No banners found', ar: 'لم يتم العثور على أي إعلانات' },
  addYourFirstBanner: { en: 'Add Your First Banner', ar: 'أضف أول إعلان لك' },

  // Specialists & Insurance
  specialistCategories: { en: 'Specialist Categories', ar: 'أقسام التخصصات الطبية' },
  addSpecialist: { en: 'Add Specialist', ar: 'إضافة تخصص' },
  createSpecialist: { en: 'Create Specialist', ar: 'إنشاء تخصص طبي' },
  allSpecialists: { en: 'All Specialists', ar: 'جميع التخصصات' },
  noSpecialistsFound: { en: 'No specialists found', ar: 'لم يتم العثور على أي تخصص' },
  addInsurance: { en: 'Add Insurance', ar: 'إضافة شركة تأمين' },
  createInsurance: { en: 'Create Insurance', ar: 'إنشاء شركة تأمين' },
  allInsurance: { en: 'All Insurance Companies', ar: 'جميع شركات التأمين' },
  noInsuranceFound: { en: 'No insurance found', ar: 'لم يتم العثور على شركات تأمين' },
  insuranceCompanies: { en: 'Insurance Companies', ar: 'شركات التأمين' },
  manageInsurance: { en: 'Manage insurance companies', ar: 'إدارة شركات ووثائق التأمين' },

  // Prepaid Cards
  downloadDetails: { en: 'Download Details', ar: 'تحميل كشف البطاقات' },
  generateCards: { en: 'Generate Cards', ar: 'توليد بطاقات جديدة' },
  createCards: { en: 'Create Cards', ar: 'إنشاء بطاقات' },
  managePrepaidCards: { en: 'Manage and track prepaid cards', ar: 'إدارة ومتابعة البطاقات مسبقة الدفع' },
  totalCards: { en: 'Total Cards', ar: 'إجمالي البطاقات' },
  usedCards: { en: 'Used Cards', ar: 'البطاقات المستخدمة' },
  unusedCards: { en: 'Unused Cards', ar: 'البطاقات غير المستخدمة' },
  totalSales: { en: 'Total Sales', ar: 'إجمالي المبيعات' },
  cardNumber: { en: 'Card Number', ar: 'رقم البطاقة' },
  amount: { en: 'Amount', ar: 'المبلغ' },
  amountUsd: { en: 'Amount (USD)', ar: 'المبلغ (دولار)' },
  used: { en: 'Used', ar: 'مستخدمة' },
  unused: { en: 'Unused', ar: 'غير مستخدمة' },
  usedBy: { en: 'Used By', ar: 'المستخدم' },
  serialNumber: { en: 'Serial Number', ar: 'الرقم التسلسلي' },
  cardCode: { en: 'Card Code', ar: 'كود البطاقة' },
  balance: { en: 'Balance', ar: 'الرصيد' },
  searchCards: { en: 'Search cards...', ar: 'البحث عن البطاقات...' },
  generatePrepaidCards: { en: 'Generate Prepaid Cards', ar: 'توليد بطاقات مسبقة الدفع' },
  quantity: { en: 'Quantity', ar: 'الكمية' },
  generate: { en: 'Generate', ar: 'توليد' },
  generating: { en: 'Generating...', ar: 'جاري التوليد...' },
  updateCard: { en: 'Update Card', ar: 'تعديل البطاقة' },
  deleteCard: { en: 'Delete Card', ar: 'حذف البطاقة' },
  deleteCardConfirm: { en: 'Are you sure you want to delete this card? This action cannot be undone.', ar: 'هل أنت متأكد من رغبتك في حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.' },
  noCardsFound: { en: 'No cards found.', ar: 'لم يتم العثور على أي بطاقات.' },
  denomination: { en: 'Denomination', ar: 'الفئة' },
  allDenominations: { en: 'All Denominations', ar: 'جميع الفئات' },
  allStatuses: { en: 'All Statuses', ar: 'جميع الحالات' },
  cardsSelected: { en: 'cards selected', ar: 'بطاقات محددة' },
  exportSelected: { en: 'Export Selected', ar: 'تصدير المحدد' },
  deleteSelected: { en: 'Delete Selected', ar: 'حذف المحدد' },
  clearSelection: { en: 'Clear Selection', ar: 'إلغاء التحديد' },
  bulkDeleteConfirmTitle: { en: 'Bulk Delete Prepaid Cards', ar: 'حذف البطاقات مسبقة الدفع' },
  bulkDeleteConfirmDesc: { en: 'Are you sure you want to delete the selected unused cards? Used cards will be safely protected from deletion to preserve financial audit history.', ar: 'هل أنت متأكد من حذف البطاقات غير المستخدمة المحددة؟ سيتم حماية أي بطاقات مستخدمة للحفاظ على السجلات المالية.' },
  usedCardDeleteProtected: { en: 'Used cards cannot be deleted as they are tied to financial ledger records.', ar: 'لا يمكن حذف البطاقات المستخدمة لارتباطها بالسجلات المالية.' },
  exportAllFiltered: { en: 'Export Filtered', ar: 'تصدير المفلتر' },

  // Control AI & OTP
  controlAiDesc: { en: 'Manage AI chat availability and usage limits.', ar: 'إدارة توفر المحادثة بالذكاء الاصطناعي وحدود الاستخدام.' },
  aiChatSettings: { en: 'AI Chat Settings', ar: 'إعدادات المحادثة الذكية (AI)' },
  aiChatSubtitle: { en: 'Configure how patients interact with AI assistance', ar: 'تخصيص تجربة تفاعل المرضى مع المساعد الذكي' },
  enableAiChat: { en: 'Enable AI Chat', ar: 'تفعيل المحادثة الذكية' },
  aiChatActive: { en: 'AI Chat is currently active for patients', ar: 'المحادثة الذكية مفعلة حالياً للمرضى' },
  aiChatDisabled: { en: 'AI Chat is currently disabled', ar: 'المحادثة الذكية معطلة حالياً' },
  chatLimit: { en: 'Chat Limit', ar: 'حد الرسائل المسموح به' },
  chatLimitDesc: { en: 'Free messages allowed per user within a rolling 24-hour window (tied to real clock time)', ar: 'الرسائل المجانية المسموح بها لكل مستخدم خلال نافذة متحركة لـ 24 ساعة حقيقية' },
  enterLimit: { en: 'Enter limit...', ar: 'أدخل الحد...' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  aiUsageMonitoring: { en: 'Usage Monitoring (Rolling 24h)', ar: 'مراقبة الاستخدام (نافذة 24 ساعة)' },
  aiTotalQueries24h: { en: 'Queries (Last 24h)', ar: 'الاستفسارات (آخر 24 ساعة)' },
  aiActiveUsers24h: { en: 'Active Users (Last 24h)', ar: 'المستخدمون النشطون (آخر 24 ساعة)' },
  aiRecommendations24h: { en: 'Doctor Recommendations', ar: 'توصيات الأطباء' },
  aiProviderStatus: { en: 'AI Provider & Engine Status', ar: 'حالة مزود الذكاء الاصطناعي والمحرك' },
  aiProviderName: { en: 'Provider / Model', ar: 'المزود / النموذج' },
  aiEngineStatus: { en: 'Engine Status', ar: 'حالة المحرك' },
  aiCredentialsSafety: { en: 'Credentials Security', ar: 'أمان بيانات الاعتماد' },
  aiCredentialsSafetyDesc: { en: 'Server-side secured only; never exposed client-side. Prior team access fully revoked.', ar: 'محمية على الخادم فقط؛ لا يتم كشفها على العميل. تم إلغاء وصول الفرق السابقة بالكامل.' },
  rollingWindowNotice: { en: 'Rolling 24-hour window tied to real clock time — never per-session, never inconsistently reset.', ar: 'نافذة زمنية متحركة لـ 24 ساعة بتوقيت الساعة الحقيقي — لا تعاد في كل جلسة ولا تفقد اتساقها.' },
  otpDeliveryChannels: { en: 'OTP Delivery Channels', ar: 'قنوات تسليم رموز التحقق (OTP)' },
  manageOtp: { en: 'Manage your OTP delivery channels.', ar: 'إدارة قنوات إرسال رمز التحقق (OTP).' },
  deliveryChannels: { en: 'Delivery Channels', ar: 'قنوات الإرسال' },
  deliveryChannelsDesc: { en: 'Enable or disable specific channels for sending OTPs.', ar: 'تفعيل أو تعطيل قنوات محددة لإرسال رموز التحقق.' },
  smsDesc: { en: 'Send OTP via traditional SMS messages.', ar: 'إرسال رمز التحقق عبر الرسائل النصية القصيرة SMS.' },
  whatsappDesc: { en: 'Send OTP via WhatsApp messages.', ar: 'إرسال رمز التحقق عبر رسائل الواتساب.' },

  // Legal Agreements
  legalAgreementsTitle: { en: 'Legal Agreements & Policies', ar: 'الاتفاقيات والسياسات القانونية' },
  legalAgreementsDesc: { en: 'Manage terms of service, version controls, effective dates, and audit trail of user acceptances.', ar: 'إدارة شروط الخدمة، والتحكم بالإصدارات، وتواريخ السريان، وسجلات موافقة المستخدمين.' },
  allDocuments: { en: 'All Documents', ar: 'جميع الوثائق' },
  activePatientPolicy: { en: 'Active Patient Policy', ar: 'سياسة المرضى السارية' },
  activeDoctorAgreement: { en: 'Active Doctor Agreement', ar: 'اتفاقية الأطباء السارية' },
  activeClinicAgreement: { en: 'Active Clinic Agreement', ar: 'اتفاقية العيادات السارية' },
  defaultRegEntry: { en: 'Default registration entry point', ar: 'نقطة الدخول الافتراضية للتسجيل' },
  forPractitioners: { en: 'For independent verified practitioners', ar: 'للممارسين المعتمدين المستقلين' },
  forMedicalCenters: { en: 'For medical centers and clinics', ar: 'للمراكز الطبية والعيادات' },
  englishText: { en: 'English Text', ar: 'النص باللغة الإنجليزية' },
  arabicText: { en: 'Arabic Text (النص العربي)', ar: 'النص باللغة العربية' },
  registeredUser: { en: 'Registered User', ar: 'مستخدم مسجل' },
  noPhone: { en: 'No phone', ar: 'لا يوجد هاتف' },
  activeVersion: { en: 'Active Version', ar: 'الإصدار النشط' },
  legalDocumentsAndHistory: { en: 'Legal Documents & Version History', ar: 'الوثائق القانونية وسجل الإصدارات' },
  legalDocHistoryDesc: { en: 'Historical records are never erased. Publishing a new version archives the previous version and records new user acceptances.', ar: 'السجلات التاريخية لا تُحذف أبداً. نشر إصدار جديد يؤرشف الإصدار السابق ويسجل موافقات المستخدمين الجديدة.' },
  reacceptance: { en: 'Re-acceptance', ar: 'إعادة الموافقة' },
  acceptedUsers: { en: 'Accepted Users', ar: 'المستخدمون الموافقون' },
  noLegalDocsFound: { en: 'No legal documents found. Click "Publish New Version" to create one.', ar: 'لم يتم العثور على وثائق قانونية. انقر فوق "نشر إصدار جديد" للإنشاء.' },
  publishLegalDoc: { en: 'Publish New Legal Document Version', ar: 'نشر إصدار جديد من الوثيقة القانونية' },
  publishLegalDocDesc: { en: 'Publishing a new version will make it the active agreement for the selected role. Previous acceptance records are preserved.', ar: 'نشر إصدار جديد سيجعله الاتفاق الساري للدور المحدد، مع الاحتفاظ بكافة السجلات السابقة.' },
  targetRole: { en: 'Target Role', ar: 'الفئة المستهدفة' },
  versionNumber: { en: 'Version Number', ar: 'رقم الإصدار' },
  docTitleEn: { en: 'Document Title (English)', ar: 'عنوان الوثيقة (بالإنجليزية)' },
  docTitleAr: { en: 'Document Title (Arabic - Optional)', ar: 'عنوان الوثيقة (بالعربية - اختياري)' },
  contentEn: { en: 'Content (English)', ar: 'المحتوى (بالإنجليزية)' },
  contentAr: { en: 'Content (Arabic - Optional)', ar: 'المحتوى (بالعربية - اختياري)' },
  requireReacceptanceNotice: { en: 'Require re-acceptance from existing users', ar: 'طلب إعادة الموافقة من المستخدمين الحاليين' },
  requireReacceptanceDesc: { en: 'When enabled, all existing users of this role will be prompted to accept this new version upon their next app session.', ar: 'عند التفعيل، سيُطلب من جميع المستخدمين الحاليين لهذا الدور الموافقة على هذا الإصدار في جلستهم القادمة.' },
  acceptanceAuditTrail: { en: 'Acceptance Audit Trail', ar: 'سجل تدقيق موافقات المستخدمين' },
  noAcceptancesYet: { en: 'No user acceptances recorded yet for this version.', ar: 'لم يتم تسجيل موافقات للمستخدمين على هذا الإصدار بعد.' },
  acceptedDateTime: { en: 'Accepted Date & Time', ar: 'تاريخ ووقت الموافقة' },
  ipAddress: { en: 'IP Address', ar: 'عنوان IP' },

  // Subscriptions
  clinicPlatformSubscriptions: { en: 'Clinic Platform Subscriptions', ar: 'اشتراكات منصة العيادات' },
  clinicSubscriptionsDesc: { en: 'Manage subscription pricing for clinics by country', ar: 'إدارة أسعار اشتراكات العيادات بحسب الدولة' },
  patientPlatformSubscriptions: { en: 'Patient Platform Subscriptions', ar: 'اشتراكات منصة المرضى' },
  patientSubscriptionsDesc: { en: 'Manage subscription pricing for patients by country', ar: 'إدارة أسعار اشتراكات المرضى بحسب الدولة' },
  monthlyPrice: { en: 'Monthly Price', ar: 'السعر الشهري' },
  annualPrice: { en: 'Annual Price', ar: 'السعر السنوي' },
  addSubscription: { en: 'Add Subscription', ar: 'إضافة باقة اشتراك' },
  editSubscription: { en: 'Edit Subscription', ar: 'تعديل باقة الاشتراك' },
  createSubscription: { en: 'Create Subscription', ar: 'إنشاء باقة اشتراك' },
  updateSubscriptionPricing: { en: 'Update subscription pricing for this country', ar: 'تحديث تسعير الاشتراك لهذه الدولة' },
  setSubscriptionPricing: { en: 'Set subscription pricing for a new country', ar: 'تحديد تسعير الاشتراك لدولة جديدة' },
  country: { en: 'Country', ar: 'الدولة' },
  selectCountry: { en: 'Select country', ar: 'اختر الدولة' },
  perMonth: { en: 'per month', ar: 'شهرياً' },
  updated: { en: 'Updated:', ar: 'تم التحديث:' },
  noSubscriptionsFound: { en: 'No subscriptions found', ar: 'لم يتم العثور على أي باقات اشتراك' },
  addYourFirstSubscription: { en: 'Add Your First Subscription', ar: 'أضف أول باقة اشتراك' },
  countryCannotBeChanged: { en: 'Country cannot be changed. Delete and create new if needed.', ar: 'لا يمكن تعديل الدولة. احذف وأنشئ من جديد إذا لزم الأمر.' },

  // Clinic Dashboard Specific
  quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
  manageBookings: { en: 'Manage Bookings', ar: 'إدارة الحجوزات' },
  manageBookingsDesc: { en: 'View and manage all patient appointments', ar: 'استعراض ومتابعة جميع مواعيد المرضى' },
  viewDoctors: { en: 'View Doctors', ar: 'استعراض الأطباء' },
  viewDoctorsDesc: { en: 'Check doctor profiles and schedules', ar: 'التحقق من ملفات الأطباء وجداول عملهم' },

  // Stats
  totalAppointments: { en: 'Total Appointments', ar: 'إجمالي المواعيد' },
  todayAppointments: { en: "Today's Appointments", ar: 'مواعيد اليوم' },
  totalBookings: { en: 'Total Bookings', ar: 'إجمالي الحجوزات' },
  totalDoctors: { en: 'Total Doctors', ar: 'إجمالي الأطباء' },
  totalPatients: { en: 'Total Patients', ar: 'إجمالي المرضى' },
  totalClinics: { en: 'Total Clinics', ar: 'إجمالي العيادات' },
  recentBookings: { en: 'Recent Bookings', ar: 'أحدث الحجوزات' },
  overview: { en: 'Overview', ar: 'نظرة عامة' },

  // Actions & Buttons
  view: { en: 'View', ar: 'عرض' },
  edit: { en: 'Edit', ar: 'تعديل' },
  update: { en: 'Update', ar: 'تحديث' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  walletAmount: { en: 'Wallet amount', ar: 'مبلغ المحفظة' },
  createNewVersionTitle: { en: 'Create new version based on this document', ar: 'إنشاء إصدار جديد بناءً على هذه الوثيقة' },
  publish: { en: 'Publish', ar: 'نشر' },
  publishNewVersion: { en: 'Publish New Version', ar: 'نشر إصدار جديد' },
  newVersion: { en: 'New Version', ar: 'إصدار جديد' },
  acceptances: { en: 'Acceptances', ar: 'الموافقات' },
  close: { en: 'Close', ar: 'إغلاق' },
  search: { en: 'Search', ar: 'بحث' },
  searchPlaceholder: { en: 'Search...', ar: 'بحث...' },
  filter: { en: 'Filter', ar: 'تصفية' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  status: { en: 'Status', ar: 'الحالة' },
  role: { en: 'Role', ar: 'الدور' },
  version: { en: 'Version', ar: 'الإصدار' },
  date: { en: 'Date', ar: 'التاريخ' },
  dateTime: { en: 'Date / Time', ar: 'التاريخ / الوقت' },
  queue: { en: 'Queue', ar: 'الدور / الطابور' },
  effectiveDate: { en: 'Effective Date', ar: 'تاريخ السريان' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },

  // Table Headers
  no: { en: 'NO', ar: 'م' },
  patient: { en: 'Patient', ar: 'المريض' },
  doctor: { en: 'Doctor', ar: 'الطبيب' },
  clinic: { en: 'Clinic', ar: 'العيادة' },
  allDoctorsOpt: { en: 'All Doctors', ar: 'جميع الأطباء' },
  allStatusOpt: { en: 'All Status', ar: 'جميع الحالات' },
  noBookingsFound: { en: 'No bookings found', ar: 'لم يتم العثور على أي حجوزات' },

  // Statuses
  active: { en: 'Active', ar: 'نشط' },
  archived: { en: 'Archived', ar: 'مؤرشف' },
  pending: { en: 'Pending', ar: 'معلق' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  inProgress: { en: 'In Progress', ar: 'قيد التنفيذ' },
  arrived: { en: 'Arrived', ar: 'وصل' },
  noShow: { en: 'No Show', ar: 'لم يحضر' },
  noShowReasonNotice: {
    en: 'Please specify the reason for No Show. This reason will remain visible to the patient.',
    ar: 'يرجى تحديد سبب عدم الحضور. سيظل هذا السبب مرئياً للمريض.',
  },
  noShowReasonPlaceholder: {
    en: 'e.g., Patient did not arrive during the time period',
    ar: 'مثال: لم يحضر المريض خلال الفترة الزمنية المحددة',
  },
  reasonNotice: {
    en: 'Please specify the reason for this action.',
    ar: 'يرجى تحديد سبب هذا الإجراء.',
  },
  reasonPlaceholder: {
    en: 'Enter reason here...',
    ar: 'أدخل السبب هنا...',
  },
  mandatory: { en: 'Mandatory', ar: 'إلزامي' },
  optional: { en: 'Optional', ar: 'اختياري' },

  // Responsive & Accessibility
  openMenu: { en: 'Open menu', ar: 'فتح القائمة' },
  closeMenu: { en: 'Close menu', ar: 'إغلاق القائمة' },
  switchLanguage: { en: 'Switch Language', ar: 'تبديل اللغة' },

  // Auth (Login / Verify OTP)
  signIn: { en: 'Sign In', ar: 'تسجيل الدخول' },
  enterPhoneNumber: { en: 'Enter phone number', ar: 'أدخل رقم الهاتف' },
  chooseOtpMethod: { en: 'Choose how to receive your code', ar: 'اختر طريقة استلام الرمز' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  sms: { en: 'SMS', ar: 'رسالة نصية' },
  smsCode: { en: 'SMS code', ar: 'رمز عبر SMS' },
  sending: { en: 'Sending...', ar: 'جاري الإرسال...' },
  continue: { en: 'Continue', ar: 'متابعة' },
  agreeTerms: { en: 'By signing in, you agree to our Terms of Service and Privacy Policy', ar: 'بتسجيل الدخول، فإنك توافق على شروط الخدمة وسياسة الخصوصية' },
  back: { en: 'Back', ar: 'رجوع' },
  verifyOtp: { en: 'Verify OTP', ar: 'التحقق من الرمز' },
  enterCodeSentTo: { en: 'Enter the 6-digit code sent to', ar: 'أدخل الرمز المكون من 6 أرقام المرسل إلى' },
  codeExpiresIn: { en: 'Code expires in', ar: 'تنتهي صلاحية الرمز خلال' },
  hurryUp: { en: 'Hurry up!', ar: 'أسرع!' },
  verifying: { en: 'Verifying...', ar: 'جاري التحقق...' },
  didntReceiveCode: { en: "Didn't receive the code?", ar: 'لم يصلك الرمز؟' },
  requestNewCode: { en: 'Request new code', ar: 'طلب رمز جديد' },

  // Countries
  libya: { en: 'Libya', ar: 'ليبيا' },
  tunisia: { en: 'Tunisia', ar: 'تونس' },
  egypt: { en: 'Egypt', ar: 'مصر' },
  algeria: { en: 'Algeria', ar: 'الجزائر' },
  feeFor: { en: 'Fee for', ar: 'الرسوم لـ' },

  // Placeholders & misc
  specialistPlaceholder: { en: 'e.g., Cardiologist', ar: 'مثال: طبيب قلب' },
  insurancePlaceholder: { en: 'e.g., AARP Health Insurance', ar: 'مثال: شركة التأمين الصحي' },
  legalTitlePlaceholder: { en: 'e.g. Patient Terms of Service & Privacy Policy', ar: 'مثال: شروط خدمة المريض وسياسة الخصوصية' },
  legalContentPlaceholder: { en: 'Enter detailed legal terms, obligations, cancellation rules...', ar: 'أدخل الشروط القانونية التفصيلية والالتزامات وقواعد الإلغاء...' },
  notificationFor: { en: 'Notification for', ar: 'إشعار لـ' },
  globalUpdateAllPatients: { en: 'Global Update for All Patients', ar: 'تحديث عام لجميع المرضى' },
  globalUpdateAllClinics: { en: 'Global Update for All Clinics', ar: 'تحديث عام لجميع العيادات' },

  // Verifications & Blue Badge
  blueBadgeVerifications: { en: 'Blue Badge Verifications', ar: 'توثيق الشارة الزرقاء' },
  verificationRequestsRegistered: { en: 'verification requests registered', ar: 'طلب توثيق مسجل' },
  searchVerifications: { en: 'Search applicants by name, phone...', ar: 'البحث في المتقدمين بالاسم، الهاتف...' },
  totalRequests: { en: 'Total Requests', ar: 'إجمالي الطلبات' },
  allApplicants: { en: 'All registered applicants', ar: 'جميع المتقدمين المسجلين' },
  pendingReview: { en: 'Pending Review', ar: 'قيد المراجعة' },
  needsAdminReview: { en: 'Needs review', ar: 'بانتظار مراجعة المسؤول' },
  allCaughtUp: { en: 'All caught up', ar: 'لا توجد طلبات معلقة' },
  approved: { en: 'Approved', ar: 'تمت الموافقة' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  verifiedEntities: { en: 'Verified credentials', ar: 'بيانات موثقة' },
  liveBadges: { en: 'Live Badges', ar: 'الشارات النشطة' },
  visibleInMobileApp: { en: 'Visible in mobile app', ar: 'ظاهرة في تطبيق المرضى' },
  badgeActive: { en: 'Badge Active', ar: 'الشارة مفعلة' },
  badgeOn: { en: 'Badge On', ar: 'الشارة مفعلة' },
  badgeOff: { en: 'Badge Off', ar: 'الشارة معطلة' },
  approvalRequired: { en: 'Approval required', ar: 'تتطلب الموافقة أولاً' },
  notActive: { en: 'Not active', ar: 'غير مفعلة' },
  reviewAndDocs: { en: 'Review & Docs', ar: 'المراجعة والمستندات' },
  review: { en: 'Review', ar: 'مراجعة' },
  applicant: { en: 'Applicant', ar: 'مقدم الطلب' },
  type: { en: 'Type', ar: 'النوع' },
  contact: { en: 'Contact', ar: 'بيانات الاتصال' },
  liveBadge: { en: 'Live Badge', ar: 'الشارة المباشرة' },
  documents: { en: 'Documents', ar: 'المستندات' },
  submittedDate: { en: 'Submitted', ar: 'تاريخ التقديم' },
  documentsAttached: { en: 'documents attached', ar: 'مستندات مرفقة' },
  noVerificationsFound: { en: 'No verification requests found', ar: 'لم يتم العثور على أي طلبات توثيق' },
  noApplicantsMatchFilter: { en: 'No applicants match your active filter criteria.', ar: 'لا يوجد متقدمون يطابقون معايير البحث المحددة.' },
  noVerificationsSubmitted: { en: 'There are currently no verification requests submitted.', ar: 'لا توجد طلبات توثيق مقدمة في الوقت الحالي.' },
  clearFilters: { en: 'Clear Filters', ar: 'إلغاء التصفية' },
  allStatus: { en: 'All Status', ar: 'جميع الحالات' },
  reviewVerificationApp: { en: 'Review Verification Application', ar: 'مراجعة طلب التوثيق' },
  submittedVerificationDocs: { en: 'Submitted Verification Documents', ar: 'مستندات التوثيق المرفقة' },
  noDocsAttachedYet: { en: 'No documents attached yet.', ar: 'لا توجد مستندات مرفقة حتى الآن.' },
  notesFromApplicant: { en: 'Notes from Applicant', ar: 'ملاحظات مقدم الطلب' },
  arabicDisclaimerTitle: { en: 'Arabic Disclaimer (Displayed on mobile app upon clicking badge)', ar: 'إخلاء المسؤولية القانوني (يظهر في التطبيق عند النقر على الشارة)' },
  selectDecision: { en: 'Select Decision', ar: 'تحديد القرار' },
  approveApplication: { en: 'Approve Application', ar: 'الموافقة على الطلب' },
  rejectApplication: { en: 'Reject Application', ar: 'رفض الطلب' },
  activateBadgeImmediately: { en: 'Activate Blue Badge Immediately', ar: 'تفعيل الشارة الزرقاء فوراً' },
  activateBadgeImmediatelyDesc: { en: 'When enabled, badge will be visible immediately on the public patient app.', ar: 'عند التفعيل، ستظهر الشارة مباشرة في تطبيق المرضى للعامة.' },
  adminFeedbackNote: { en: 'Admin Feedback Note', ar: 'ملاحظة وتوجيهات المسؤول' },
  requiredForRejection: { en: '(Required for Rejection)', ar: '(مطلوبة في حالة الرفض)' },
  optionalFeedback: { en: '(Optional)', ar: '(اختياري)' },
  specifyRejectionReason: { en: 'Please specify reason for rejection so applicant can rectify...', ar: 'يرجى كتابة سبب الرفض ليتمكن مقدم الطلب من تعديله...' },
  additionalNotesPlaceholder: { en: 'Additional approval notes...', ar: 'ملاحظات إضافية...' },
  confirmDecision: { en: 'Confirm Decision', ar: 'تأكيد القرار' },
  openOriginal: { en: 'Open Original', ar: 'فتح المستند الأصلي' },
  preview: { en: 'Preview', ar: 'معاينة' },
  locationNa: { en: 'Location N/A', ar: 'الموقع غير متوفر' },
  manager: { en: 'Manager', ar: 'المدير' },

  // Platform Financials & Section 10 Ledger
  platformFinancialsTitle: { en: 'Platform Financials & Wallet Ledger', ar: 'المالية العامة وسجل المحفظة للمنصة' },
  platformFinancialsSub: {
    en: 'Section 10 Traceable Ledger: Platform Revenue, Service Fees, Wallet Liabilities, Clinic Payables, and Referrals.',
    ar: 'سجل المعاملات المالية الموثق (المادة 10): إيرادات المنصة، رسوم الخدمات، التزامات المحافظ، مستحقات العيادات، والإحالات.',
  },
  patientServiceFees: { en: 'Patient Service Fees', ar: 'رسوم خدمات المرضى' },
  clinicServiceFees: { en: 'Clinic Service Fees', ar: 'رسوم خدمات العيادات' },
  activeWalletLiability: { en: 'Active Wallet Liability', ar: 'التزامات المحافظ النشطة' },
  frozenWalletBalances: { en: 'Frozen Wallet Balances', ar: 'أرصدة المحافظ المجمدة' },
  platformFeeRetained: { en: 'Platform service fee retained', ar: 'رسوم خدمة المنصة المحتجزة' },
  percentageCommissionFees: { en: 'Percentage commission fees', ar: 'رسوم العمولات النسبية' },
  totalUserWalletBalances: { en: 'Total user wallet balances', ar: 'إجمالي أرصدة محافظ المستخدمين' },
  heldDuringPendingAppointments: { en: 'Held during pending appointments', ar: 'محتجزة خلال المواعيد المعلقة' },
  countryPatientFees: { en: 'Country-Specific Patient Service Fees', ar: 'رسوم خدمات المرضى حسب الدولة' },
  countryFeesDesc: { en: 'Fixed booking service fee charged to patients per country tier (in LYD).', ar: 'رسوم حجز ثابتة تفرض على المرضى حسب فئة كل دولة (بالدينار الليبي).' },
  settlementsStatusBreakdown: { en: 'Settlements Status Breakdown', ar: 'تفصيل حالات تسويات المستحقات' },
  settlementsDesc: { en: 'Current state of provider payout liabilities.', ar: 'الوضع الحالي لالتزامات صرف مستحقات مقدمي الخدمة.' },
  requestSettlement: { en: 'Request Settlement', ar: 'طلب تسوية مستحقات' },
  requestPayoutTitle: { en: 'Request Settlement Payout', ar: 'طلب صرف مستحقات' },
  requestPayoutDesc: {
    en: 'Submit a formal settlement payout request. Platform finance team will review and process the transfer.',
    ar: 'تقديم طلب رسمي لصرف المستحقات المالية. سيقوم الفريق المالي بمراجعة الطلب وتحويل المبلغ.',
  },
  withdrawableNet: { en: 'Net Withdrawable', ar: 'الرصيد القابل للسحب' },
  pendingInReview: { en: 'Pending in Settlements', ar: 'معلق قيد المراجعة' },
  clinicSettlementsSection: { en: 'Settlement Requests & Provider Payouts', ar: 'طلبات التسوية ومستحقات العيادة' },
  noSettlementsYet: { en: 'No settlement payout requests recorded yet', ar: 'لم يتم تسجيل أي طلبات تسوية حتى الآن' },
  settlementPrompt: {
    en: 'When your available balance is eligible, click "Request Settlement" to initiate payout.',
    ar: 'عندما يتوفر رصيد قابل للسحب، اضغط على "طلب تسوية مستحقات" لبدء عملية الصرف.',
  },
  settlementNum: { en: 'Settlement #', ar: 'رقم التسوية' },
  refReceipt: { en: 'Ref / Receipt', ar: 'المرجع / الإيصال' },
  viewReceipt: { en: 'Receipt Proof', ar: 'إيصال التحويل' },
  pendingSettlements: { en: 'Already in Pending Settlement', ar: 'معلق مسبقاً في طلبات أخرى' },
  alreadyInPendingSettlement: { en: 'Already in Pending Settlement', ar: 'معلق مسبقاً في طلبات أخرى' },
  pendingSettlementsAlert: { en: 'Pending Settlements', ar: 'تسويات معلقة' },
  pendingVerificationsAlert: { en: 'Blue Badge Verifications', ar: 'توثيق الشارة الزرقاء' },
  openComplaintsAlert: { en: 'Complaints & Disputes', ar: 'الشكاوى والنزاعات' },
  maxEligiblePayout: { en: 'Eligible Withdrawable', ar: 'الحد الأقصى المتاح للصرف' },
  payoutAmount: { en: 'Payout Amount (LYD)', ar: 'مبلغ الصرف (د.ل)' },
  useMax: { en: 'Use Max', ar: 'كامل الرصيد' },
  settlementRemarks: { en: 'Bank Account / IBAN or Payout Remarks', ar: 'الحساب البنكي / الآيبان أو ملاحظات الصرف' },
  settlementRemarksPlaceholder: {
    en: 'Specify bank name, account number/IBAN, or any remarks for the finance team...',
    ar: 'حدد اسم المصرف، رقم الحساب أو الآيبان، وأي ملاحظات للفريق المالي...',
  },
  settlementAuditNotice: {
    en: 'Once submitted, the requested amount is held in review. Platform Finance will disburse funds via bank transfer with uploaded receipt proof.',
    ar: 'بمجرد التقديم، يتم حجز المبلغ المطلوب للمراجعة. ستقوم المالية بالتحويل المصرفي ورفع إيصال الإيداع.',
  },
  submitRequest: { en: 'Submit Request', ar: 'إرسال الطلب' },
  submitting: { en: 'Submitting...', ar: 'جاري الإرسال...' },
  enterValidAmount: { en: 'Please enter a valid payout amount (greater than 0 LYD).', ar: 'يرجى إدخال مبلغ صحيح للصرف (أكبر من 0 دينار ليبي).' },
  exceedsWithdrawable: { en: 'Requested amount exceeds withdrawable balance', ar: 'المبلغ المطلوب يتجاوز الرصيد المتاح للسحب' },
  settlementRequestCreated: {
    en: 'Settlement payout request submitted successfully and is now under review.',
    ar: 'تم إرسال طلب تسوية المستحقات بنجاح وهو قيد المراجعة حالياً.',
  },
  failedSettlementRequest: { en: 'Failed to submit settlement request', ar: 'فشل في إرسال طلب التسوية' },
  relatedTransactions: { en: 'Related Transactions', ar: 'المعاملات المرتبطة' },
  timelineDates: { en: 'Timeline Dates', ar: 'التواريخ والمراحل' },
  recentWalletTransactions: { en: 'Recent Wallet Transactions & Disbursements', ar: 'معاملات المحفظة والتحويلات الأخيرة' },
  records: { en: 'Records', ar: 'سجلات' },
  adjustWallet: { en: 'Wallet Adjustment', ar: 'تعديل رصيد المحفظة' },
  manualWalletAdjustment: { en: 'Administrative Wallet Adjustment', ar: 'تعديل إداري لرصيد المحفظة' },
  walletAdjustmentDesc: { en: "Directly credit or debit a user's wallet with mandatory audit trail logging.", ar: 'إضافة أو خصم مباشر من محفظة المستخدم مع التوثيق الإلزامي في سجل التدقيق.' },
  targetUserId: { en: 'User ID (or Patient / Clinic / Doctor ID)', ar: 'معرّف المستخدم (أو معرّف المريض / العيادة / الطبيب)' },
  adjustAmount: { en: 'Adjustment Amount (LYD)', ar: 'مبلغ التعديل (دينار ليبي)' },
  adjustAmountHint: { en: 'Positive value credits the wallet; negative value debits.', ar: 'القيمة الموجبة تضيف للرصيد، والقيمة السالبة تخصم منه.' },
  execute: { en: 'Execute Adjustment', ar: 'تنفيذ التعديل' },
  traceableFinancialLedger: { en: 'Section 10 — Traceable Financial Ledger', ar: 'المادة 10 — سجل المعاملات المالية الموثق' },
  traceableLedgerDesc: {
    en: 'Unified audit ledger traceable by Transaction ID, Booking ID, User, Clinic, Doctor, Amount, Type, Status, Date, and Reference.',
    ar: 'سجل تدقيق موحد قابل للتتبع حسب معرّف المعاملة، معرّف الحجز، المستخدم، العيادة، الطبيب، المبلغ، النوع، الحالة، التاريخ، والمرجع.',
  },
  policyNoteTitle: { en: 'Section 10 Policy: Segregated Financial Streams & Priority 3 Doctor Payables', ar: 'سياسة المادة 10: فصل المسارات المالية ومستحقات الأطباء طبقاً للأولوية 3' },
  policyNoteClinic: { en: 'Clinic Payables: For clinic-based appointments, payouts are made directly to the clinic entity.', ar: 'مستحقات العيادات: لمواعيد العيادات، تصرف المستحقات مباشرة للكيان المؤسسي للعيادة.' },
  policyNoteDoctor: { en: 'Doctor Payables: Exclusively preserved for platform-supervised services such as Remote Consultations (Phase 2), not general appointments.', ar: 'مستحقات الأطباء: مخصصة حصرياً للخدمات الخاضعة لإشراف المنصة مثل الاستشارات عن بُعد (المرحلة 2).' },
  policyNoteReferral: { en: 'Referrals: Preserved 1 LYD bonus credited to both referrer and referred user upon qualifying booking.', ar: 'نظام الإحالات: مكافأة 1 دينار محفوظة تودع لكل من المحيل والمحال عند إتمام الحجز المؤهل.' },
  exportCsv: { en: 'Export CSV', ar: 'تصدير كملف CSV' },
  allStreams: { en: 'All Streams', ar: 'جميع المسارات' },
  platformRevenue: { en: 'Platform Revenue', ar: 'إيرادات المنصة' },
  serviceFees: { en: 'Service Fees', ar: 'رسوم الخدمات' },
  walletTransactions: { en: 'Wallet Tx', ar: 'معاملات المحفظة' },
  refunds: { en: 'Refunds', ar: 'الاستردادات' },
  prepaidCardTx: { en: 'Prepaid Cards', ar: 'البطاقات المسبقة' },
  adjustments: { en: 'Adjustments', ar: 'التسويات الإدارية' },
  clinicPayables: { en: 'Clinic Payables', ar: 'مستحقات العيادات' },
  referrals: { en: 'Referrals', ar: 'الإحالات (1 د.ل)' },
  searchFilter: { en: 'Search Filter', ar: 'تصفية البحث' },
  ledgerSearchPlaceholder: { en: 'Search Transaction ID, Booking #, User, Clinic, Doctor, Note...', ar: 'ابحث بمعرف المعاملة، رقم الحجز، المستخدم، العيادة، الطبيب، الملاحظة...' },
  fromDate: { en: 'From Date', ar: 'من تاريخ' },
  toDate: { en: 'To Date', ar: 'إلى تاريخ' },
  clearAllFilters: { en: 'Clear All Filters', ar: 'إلغاء جميع الفلاتر' },
  applyFilters: { en: 'Apply Filters', ar: 'تطبيق الفلاتر' },
  transactionId: { en: 'Transaction ID', ar: 'معرّف المعاملة' },
  bookingId: { en: 'Booking ID', ar: 'معرّف الحجز' },
  userParty: { en: 'User / Party', ar: 'المستخدم / الطرف' },
  typeCategory: { en: 'Type / Category', ar: 'النوع / التصنيف' },
  reference: { en: 'Reference', ar: 'المرجع' },
  showing: { en: 'Showing', ar: 'عرض' },
  to: { en: 'to', ar: 'إلى' },
  of: { en: 'of', ar: 'من أصل' },
  transactions: { en: 'transactions', ar: 'معاملة' },
  pageOf: { en: 'Page', ar: 'صفحة' },
  noTransactionsFound: { en: 'No transactions found', ar: 'لم يتم العثور على أي معاملات' },
  noTransactionsFoundDesc: { en: 'Try adjusting your category, search keywords, or date range.', ar: 'جرب تغيير التصنيف، كلمات البحث، أو نطاق التواريخ.' },
  loadingLedger: { en: 'Loading traceable ledger entries...', ar: 'جاري تحميل سجل المعاملات المالية الموثقة...' },
  lyd: { en: 'LYD', ar: 'د.ل' },

  // Analytics & Reconciliation Reports
  platformAnalyticsReports: { en: 'Platform Analytics & Payment Reconciliation', ar: 'التحليلات الشاملة ومطابقة الحسابات المالية' },
  financialReports: { en: 'Payment Reconciliation & Reports', ar: 'تقارير التسوية والمطابقة المالية' },
  superAdminTier: { en: 'Platform Admin', ar: 'مدير المنصة' },
  clinicAdminOnly: { en: 'Clinic Admin', ar: 'مسؤول العيادة' },
  reconciliationSubtitle: { en: 'Audit consultation revenues, doctor earnings, and Salama platform reconciliation in real time (LYD).', ar: 'تدقيق إيرادات الاستشارات، أتعاب الأطباء، ومطابقة حسابات منصة سلامة في الوقت الفعلي (د.ل).' },
  grossConsultFees: { en: 'Gross Consult Fees', ar: 'إجمالي أتعاب الاستشارات' },
  completedConsultations: { en: 'From completed appointments', ar: 'من المواعيد المكتملة' },
  netClinicReceivable: { en: 'Net Clinic Receivable', ar: 'صافي مستحقات العيادة' },
  netReceivableDesc: { en: 'Total consult fees payable to clinics', ar: 'إجمالي أتعاب الاستشارات المستحقة للعيادات' },
  salamaFeeRetained: { en: 'Salama Platform Fees', ar: 'رسوم منصة سلامة' },
  capturedPlatformFee: { en: 'Captured platform service fee revenue', ar: 'إيرادات رسوم الخدمة المحصلة للمنصة' },
  bookingVolume: { en: 'Booking Volume', ar: 'حجم الحجوزات' },
  filterAnalyticsReports: { en: 'Filter Analytics & Reconciliation', ar: 'تصفية التحليلات والمطابقة المالية' },
  searchPatientOrDoctor: { en: 'Search patient, doctor, clinic...', ar: 'ابحث عن مريض، طبيب، عيادة...' },
  allClinics: { en: 'All Clinics', ar: 'جميع العيادات' },
  allSpecialties: { en: 'All Specialties', ar: 'جميع التخصصات' },
  allLocations: { en: 'All Locations', ar: 'جميع المواقع والمدن' },
  allPeriods: { en: 'All Periods', ar: 'جميع الفترات' },
  todayDaily: { en: 'Today (Daily)', ar: 'اليوم (يومي)' },
  thisWeek: { en: 'This Week', ar: 'هذا الأسبوع' },
  thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
  lastMonth: { en: 'Last Month', ar: 'الشهر الماضي' },
  customDateRange: { en: 'Custom Range', ar: 'نطاق مخصص' },
  clinicReconciliationBreakdown: { en: 'Clinic Performance & Payment Reconciliation Breakdown', ar: 'تفصيل أداء العيادات ومطابقة الحسابات المالية' },
  doctorReconciliationBreakdown: { en: 'Doctor Performance & Revenue Breakdown', ar: 'تفصيل أداء الأطباء والإيرادات' },
  consultRevenue: { en: 'Consult Fees', ar: 'أتعاب الاستشارات' },
  salamaFee: { en: 'Platform Fees', ar: 'رسوم المنصة' },
  generatedRevenue: { en: 'Generated Fees', ar: 'الأتعاب المحققة' },
  itemizedReconciliation: { en: 'Itemized Booking Settlement Ledger', ar: 'سجل تسوية المواعيد التفصيلي' },
  recordsFound: { en: 'records found', ar: 'سجل متوفر' },
  noReconciliationRecords: { en: 'No reconciliation records found', ar: 'لا توجد سجلات مطابقة مسجلة' },
  adjustFilters: { en: 'Try adjusting your search or date filters.', ar: 'جرب تعديل خيارات البحث أو الفلاتر الزمنية.' },
  serial: { en: 'Serial', ar: 'الرقم التسلسلي' },
  consultFee: { en: 'Consult Fee', ar: 'أجر الاستشارة' },
  platformFee: { en: 'Salama Fee', ar: 'رسوم سلامة' },
  netReceivable: { en: 'Net Receivable', ar: 'صافي المستحق' },
  showingPage: { en: 'Page', ar: 'الصفحة' },
  restrictedAccess: { en: 'Access Restricted', ar: 'تم حظر الوصول' },
  staffRestrictedReportsMsg: { en: 'Financial reports and payment reconciliations are restricted to Clinic Admins and Platform Admins. Clinic Staff have access to day-to-day booking operations only.', ar: 'التقارير المالية ومطابقة الحسابات مقتصرة على مسؤولي العيادات وإدارة المنصة فقط. طاقم العيادة لديهم صلاحيات للعمليات اليومية للحجز فقط.' },
  noDataToExport: { en: 'There are no records to export.', ar: 'لا توجد بيانات متاحة للتصدير.' },
  reconciliationDownloaded: { en: 'Payment reconciliation report downloaded successfully in LYD.', ar: 'تم تحميل تقرير المطابقة المالية بنجاح بالدينار الليبي.' },
  failedExport: { en: 'Failed to generate CSV export file.', ar: 'فشل إنشاء ملف التصدير CSV.' },
  failedToLoadReports: { en: 'Failed to load reconciliation reports', ar: 'فشل تحميل تقارير المطابقة المالية' },
  exportCSV: { en: 'Export CSV', ar: 'تصدير CSV' },
  applyFilter: { en: 'Filter', ar: 'تطبيق' },
  bookingsExported: { en: 'Bookings exported successfully.', ar: 'تم تصدير الحجوزات بنجاح.' },
};

/**
 * Sentence-level translations (English text -> Arabic).
 * Used by `tr()` for toast messages, confirm() popups and validation errors,
 * so a plain English sentence can be translated without a dedicated key.
 */
export const messages: Record<string, string> = {
  'Success': 'تم بنجاح',
  'Error': 'خطأ',
  'API Error': 'خطأ في الخادم',
  'Validation Error': 'خطأ في التحقق',
  'Publish Failed': 'فشل النشر',
  'Access Denied': 'تم رفض الوصول',
  'Copied!': 'تم النسخ!',
  'Downloading...': 'جاري التحميل...',
  'Preparing your file.': 'جاري تجهيز الملف.',
  'Download complete.': 'اكتمل التحميل.',
  'Notification Sent': 'تم إرسال الإشعار',
  'Global Notification Queued': 'تمت جدولة الإشعار العام',
  'You do not have permission to access this page': 'ليس لديك صلاحية للوصول إلى هذه الصفحة',

  // Success messages
  'AI Chat settings saved successfully': 'تم حفظ إعدادات المحادثة الذكية بنجاح',
  'OTP System settings saved successfully': 'تم حفظ إعدادات نظام التحقق بنجاح',
  'Banner deleted successfully': 'تم حذف الإعلان بنجاح',
  'Banner created successfully': 'تم إنشاء الإعلان بنجاح',
  'Card deleted successfully': 'تم حذف البطاقة بنجاح',
  'Card updated successfully': 'تم تحديث البطاقة بنجاح',
  'Prepaid cards created successfully': 'تم إنشاء البطاقات مسبقة الدفع بنجاح',
  'Clinic notification sent successfully': 'تم إرسال الإشعار للعيادة بنجاح',
  'Patient notification sent successfully': 'تم إرسال الإشعار للمريض بنجاح',
  'Notification saved successfully.': 'تم حفظ الإشعار بنجاح.',
  'Notification saved to database successfully.': 'تم حفظ الإشعار بنجاح.',
  'Insurance deleted successfully': 'تم حذف شركة التأمين بنجاح',
  'Specialist deleted successfully': 'تم حذف التخصص بنجاح',
  'Subscription deleted successfully': 'تم حذف الاشتراك بنجاح',
  'Service fee updated successfully': 'تم تحديث رسوم الخدمة بنجاح',
  'Patient service fees updated successfully': 'تم تحديث رسوم خدمة المرضى بنجاح',
  'Wallet updated successfully': 'تم تحديث المحفظة بنجاح',
  'OTP verified successfully': 'تم التحقق من الرمز بنجاح',

  // Error messages
  'Could not publish new version': 'تعذر نشر الإصدار الجديد',
  'Failed to create banner': 'فشل إنشاء الإعلان',
  'Failed to create cards': 'فشل إنشاء البطاقات',
  'Failed to create insurance': 'فشل إنشاء شركة التأمين',
  'Failed to create specialist': 'فشل إنشاء التخصص',
  'Failed to delete banner': 'فشل حذف الإعلان',
  'Failed to delete card': 'فشل حذف البطاقة',
  'Failed to delete insurance': 'فشل حذف شركة التأمين',
  'Failed to delete specialist': 'فشل حذف التخصص',
  'Failed to delete subscription': 'فشل حذف الاشتراك',
  'Failed to download details': 'فشل تحميل التفاصيل',
  'Failed to filter bookings': 'فشل تصفية الحجوزات',
  'Failed to load banners': 'فشل تحميل الإعلانات',
  'Failed to load bookings': 'فشل تحميل الحجوزات',
  'Failed to load clinic stats': 'فشل تحميل إحصائيات العيادة',
  'Failed to load clinics': 'فشل تحميل العيادات',
  'Failed to load clinics list': 'فشل تحميل قائمة العيادات',
  'Failed to load doctors': 'فشل تحميل الأطباء',
  'Failed to load insurances': 'فشل تحميل شركات التأمين',
  'Failed to load legal documents': 'فشل تحميل الوثائق القانونية',
  'Failed to load patient list': 'فشل تحميل قائمة المرضى',
  'Failed to load patients': 'فشل تحميل المرضى',
  'Failed to load prepaid cards': 'فشل تحميل البطاقات مسبقة الدفع',
  'Failed to load specialists': 'فشل تحميل التخصصات',
  'Failed to load statistics': 'فشل تحميل الإحصائيات',
  'Failed to load subscriptions': 'فشل تحميل الاشتراكات',
  'Failed to load user acceptances': 'فشل تحميل موافقات المستخدمين',
  'Failed to save subscription': 'فشل حفظ الاشتراك',
  'Failed to send notification': 'فشل إرسال الإشعار',
  'Failed to send OTP': 'فشل إرسال رمز التحقق',
  'Failed to update AI Chat settings': 'فشل تحديث إعدادات المحادثة الذكية',
  'Failed to update appointment status': 'فشل تحديث حالة الموعد',
  'Failed to update card': 'فشل تحديث البطاقة',
  'Failed to update clinic': 'فشل تحديث العيادة',
  'Failed to update insurance': 'فشل تحديث شركة التأمين',
  'Failed to update patient status': 'فشل تحديث حالة المريض',
  'Failed to update service fee': 'فشل تحديث رسوم الخدمة',
  'Failed to update service fees': 'فشل تحديث رسوم الخدمة',
  'Failed to update settings': 'فشل تحديث الإعدادات',
  'Failed to update specialist': 'فشل تحديث التخصص',
  'Failed to update wallet': 'فشل تحديث المحفظة',
  'Invalid OTP': 'رمز التحقق غير صحيح',
  'Phone number not found': 'رقم الهاتف غير موجود',
  'Failed to load verifications': 'فشل تحميل طلبات التوثيق',
  'Failed to toggle badge': 'فشل تعديل حالة الشارة',
  'Action failed': 'فشلت العملية',
  'Badge Activated': 'تم تفعيل الشارة',
  'Badge Deactivated': 'تم إلغاء تفعيل الشارة',

  // Validation
  'Please enter a valid phone number': 'يرجى إدخال رقم هاتف صحيح',
  'Please enter a valid service fee': 'يرجى إدخال رسوم خدمة صحيحة',
  'Please enter a valid wallet amount': 'يرجى إدخال مبلغ محفظة صحيح',
  'Please enter the complete 6-digit code': 'يرجى إدخال الرمز المكون من 6 أرقام كاملاً',
  'Please fill in Title, Content, and Version': 'يرجى تعبئة العنوان والمحتوى والإصدار',
  'Please select at least one clinic to notify': 'يرجى اختيار عيادة واحدة على الأقل',
  'Please select at least one image': 'يرجى اختيار صورة واحدة على الأقل',
  'Please select at least one patient to notify': 'يرجى اختيار مريض واحد على الأقل',
  'Title and description are required': 'العنوان والوصف مطلوبان',

  // Suspension logic
  suspend: 'تعليق الحساب',
  suspended: 'معلق',
  active: 'نشط',
  activate: 'تفعيل الحساب',
  suspendDoctor: 'تعليق حساب الطبيب',
  activateDoctor: 'تفعيل حساب الطبيب',
  suspendClinic: 'تعليق حساب العيادة',
  activateClinic: 'تفعيل حساب العيادة',
  suspendWarningTitle: 'تحذير هام بشأن التعليق',
  suspendWarningDesc: 'سيؤدي تعليق هذا الحساب إلى إلغاء المواعيد القادمة. تُحرر المبالغ المحجوزة للطلبات المعلقة، وتُسترد قيمة الاستشارة المؤهلة من المواعيد المؤكدة. رسوم الخدمة المحصلة عند التأكيد غير قابلة للاسترداد.',
  suspendDoctorConfirmText: 'هل أنت متأكد من تعليق هذا الطبيب؟ سيتم إلغاء مواعيده القادمة، مع تحرير المبالغ المحجوزة للطلبات المعلقة واسترداد قيمة الاستشارة المؤهلة للمواعيد المؤكدة. رسوم الخدمة المحصلة عند التأكيد غير قابلة للاسترداد.',
  suspendClinicConfirmText: 'هل أنت متأكد من تعليق هذه العيادة؟ سيتم إلغاء مواعيدها القادمة، مع تحرير المبالغ المحجوزة للطلبات المعلقة واسترداد قيمة الاستشارة المؤهلة للمواعيد المؤكدة. رسوم الخدمة المحصلة عند التأكيد غير قابلة للاسترداد.',
  activateDoctorConfirmText: 'هل أنت متأكد من إعادة تفعيل حساب هذا الطبيب؟',
  activateClinicConfirmText: 'هل أنت متأكد من إعادة تفعيل حساب هذه العيادة؟',
  doctorStatusUpdated: 'تم تحديث حالة الطبيب بنجاح',
  clinicStatusUpdated: 'تم تحديث حالة العيادة بنجاح',
  appointmentsCancelledAndRefunded: 'تم إلغاء المواعيد وتسوية المبالغ وفق سياسة الرسوم',

  // Confirm popups
  'Are you sure you want to delete this banner?': 'هل أنت متأكد من حذف هذا الإعلان؟',
  'Are you sure you want to delete this insurance?': 'هل أنت متأكد من حذف شركة التأمين هذه؟',
  'Are you sure you want to delete this specialist?': 'هل أنت متأكد من حذف هذا التخصص؟',
};

/** Patterns for dynamic English sentences: [regex, arabic builder] */
const messagePatterns: Array<[RegExp, (m: RegExpMatchArray, tr: (s: string) => string) => string]> = [
  [/^(.+) copied to clipboard$/, (m, tr) => `تم نسخ ${tr(m[1] || '')}`],
  [/^Appointment status updated to (.+)$/, (m, tr) => `تم تحديث حالة الموعد إلى ${tr(m[1] || '')}`],
  [/^Are you sure you want to delete subscription for (.+)\?$/, (m, tr) => `هل أنت متأكد من حذف اشتراك ${tr(m[1] || '')}؟`],
  [/^Clinic verified successfully$/, () => 'تم توثيق العيادة بنجاح'],
  [/^Clinic unverified successfully$/, () => 'تم إلغاء توثيق العيادة بنجاح'],
  [/^Doctor suspended successfully.*$/, () => 'تم تعليق حساب الطبيب وإلغاء مواعيده القادمة وتسوية المبالغ وفق سياسة الرسوم بنجاح'],
  [/^Doctor activated successfully.*$/, () => 'تم تفعيل حساب الطبيب بنجاح'],
  [/^Clinic suspended successfully.*$/, () => 'تم تعليق حساب العيادة وإلغاء مواعيدها القادمة وتسوية المبالغ وفق سياسة الرسوم بنجاح'],
  [/^Clinic activated successfully.*$/, () => 'تم تفعيل حساب العيادة بنجاح'],
  [/^Patient banned successfully$/, () => 'تم حظر المريض بنجاح'],
  [/^Patient unbanned successfully$/, () => 'تم إلغاء حظر المريض بنجاح'],
  [/^Version (.+) published successfully!$/, (m) => `تم نشر الإصدار ${m[1] || ''} بنجاح!`],
  [/^Please enter a valid amount for (.+)$/, (m, tr) => `يرجى إدخال مبلغ صحيح لـ ${tr(m[1] || '')}`],
  [/^OTP sent via (.+)$/, (m, tr) => `تم إرسال رمز التحقق عبر ${tr(m[1] || '')}`],
  [/^Queued notifications for (\d+) patients successfully\.?$/, (m) => `تمت جدولة الإشعارات لـ ${m[1] || ''} مريض بنجاح.`],
  [/^Queued notifications for (\d+) clinics successfully\.?$/, (m) => `تمت جدولة الإشعارات لـ ${m[1] || ''} عيادة بنجاح.`],
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  t: (key: string, fallback?: string) => string;
  /** Translate a plain English sentence (toasts, confirms, errors). Returns input unchanged if unknown. */
  tr: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'salama_dashboard_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLang === 'ar' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    } catch {
      // localStorage unavailable or restricted
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // localStorage write error handled
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const isRTL = language === 'ar';
  const dir: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', language);
      if (isRTL) {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, dir, isRTL, mounted]);

  const t = (key: string, fallback?: string): string => {
    if (translations[key]) {
      return translations[key][language] || fallback || key;
    }
    return fallback || key;
  };

  const tr = (text: string): string => translateText(text, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isRTL,
        dir,
        t,
        tr,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Reverse lookup: English value -> Arabic, built once from the key dictionary
const englishToArabic: Record<string, string> = Object.values(translations).reduce(
  (acc, { en, ar }) => {
    if (!(en in acc)) acc[en] = ar;
    return acc;
  },
  {} as Record<string, string>
);

/** Translate a plain English sentence into the given language. */
export function translateText(text: string, language: Language): string {
  if (language === 'en' || typeof text !== 'string' || !text) return text;
  const trimmed = text.trim();
  if (messages[trimmed]) return messages[trimmed];
  if (englishToArabic[trimmed]) return englishToArabic[trimmed];
  const self = (s: string) => translateText(s, language);
  for (const [re, build] of messagePatterns) {
    const m = trimmed.match(re);
    if (m) return build(m, self);
  }
  return text;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
