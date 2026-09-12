# Salama Clinic Manager - Setup Guide

This guide provides instructions for setting up and running the Salama clinic management system.

## 🚀 Features

- **Phone-based Authentication**: Login with phone number and OTP verification
- **Dashboard**: View clinic statistics and metrics
- **Booking Management**: Manage patient appointments with filtering and status updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- An active Salama API account

## 🔧 Installation

1. **Install dependencies**:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Configure environment variables**:
   The `.env.local` file is already configured with the Salama API URL:

```
NEXT_PUBLIC_API_URL=https://api.salamaapp.ly/api/v1
```

3. **Run the development server**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**:
   Navigate to [http://localhost:3000/login](http://localhost:3000/login)

## 🔐 Authentication Flow

### Login Page (`/login`)

1. Enter your phone number (e.g., `+218612241597`)
2. Select OTP delivery method (WhatsApp or SMS)
3. Click "Continue" to receive the OTP

### OTP Verification (`/verify-otp`)

1. Enter the 6-digit code you received
2. The code expires after 5 minutes
3. Click "Verify OTP" to sign in
4. You'll be redirected to the dashboard upon successful verification

### Authentication Response

After successful verification, you receive:

- `accessToken`: Used for API authentication
- `refreshToken`: For refreshing the session
- `role`: User role (e.g., MANAGER)
- `profileCompleted`: Whether profile setup is complete

## 📊 Dashboard Features

### Statistics Overview (`/dashboard`)

View key metrics:

- Total Appointments
- Today's Appointments
- Pending Appointments
- Confirmed Appointments
- Completed Appointments
- Cancelled Appointments

**API**: `GET /clinic/manager-stats`

### Booking Management (`/dashboard/bookings`)

Features:

- Filter by status (Pending, In Progress, Confirmed)
- Filter by doctor
- View patient and doctor details
- Update appointment status to "In Progress"
- Responsive table view

**APIs Used**:

- `GET /clinic/manager/booking-history?status=PENDING`
- `GET /clinic/manager/doctors`
- `POST /clinic/update/appointment-status`

## 🔄 API Integration

### Base URL

```
https://api.salamaapp.ly/api/v1
```

### Endpoints

#### Send OTP

```http
POST /auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+8801996117525",
  "otpSender": "sms" // or "whatsapp"
}
```

#### Verify OTP

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+8801996117528",
  "otp": "412653"
}
```

#### Get Clinic Stats

```http
GET /clinic/manager-stats
Authorization: Bearer {accessToken}
```

#### Get Booking History

```http
GET /clinic/manager/booking-history?status=PENDING&doctorId={doctorId}
Authorization: Bearer {accessToken}
```

#### Get Doctors List

```http
GET /clinic/manager/doctors
Authorization: Bearer {accessToken}
```

#### Update Appointment Status

```http
POST /clinic/update/appointment-status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bookingId": "cmk867tn80009tcb89c150uth",
  "status": "INPROGRESS"
}
```

## 🗂 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page
│   │   └── verify-otp/      # OTP verification page
│   └── (dashboard)/         # Dashboard pages
│       └── dashboard/       # Dashboard home & bookings
├── components/
│   ├── dashboard-sidebar.tsx   # Sidebar navigation
│   ├── dashboard-topbar.tsx    # Top bar with user menu
│   └── ui/                     # Reusable UI components
├── services/
│   ├── auth.service.ts         # Authentication API calls
│   └── booking.service.ts      # Booking & clinic API calls
├── stores/
│   └── auth-store.ts           # Zustand auth state management
└── lib/
    └── api-client.ts           # Axios instance with interceptors
```

## 🔒 Authentication State Management

The app uses Zustand with persistence for auth state:

```typescript
// Access auth state
const { accessToken, isAuthenticated, phoneNumber } = useAuthStore();

// Set auth data (after login)
setAuth({
  accessToken,
  refreshToken,
  role,
  profileCompleted,
});

// Logout
logout();
```

## 🎨 Styling

The app uses:

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for pre-built components
- **Lucide React** for icons

## 🧪 Testing Login

Use the following flow to test:

1. Go to `/login`
2. Enter a phone number registered in the Salama system
3. Select WhatsApp or SMS
4. Enter the OTP received
5. You'll be redirected to the dashboard

## 🚨 Troubleshooting

### "Phone number not found"

- Ensure the phone number is registered in the Salama system
- Include the country code (e.g., +218...)

### "Invalid OTP"

- Check if the OTP has expired (5-minute limit)
- Ensure you're entering the correct 6-digit code

### "Failed to load bookings"

- Verify your access token is valid
- Check if you have the MANAGER role
- Ensure the API is accessible

### Redirect loop on dashboard

- Clear browser localStorage
- Re-login to refresh the auth token

## 📱 Responsive Design

The application is fully responsive:

- **Mobile**: Collapsible sidebar, touch-friendly controls
- **Tablet**: Optimized layout with readable tables
- **Desktop**: Full sidebar with all features visible

## 🔄 Auto Token Refresh

The API client automatically:

- Adds `Authorization: Bearer {token}` to all requests
- Redirects to `/login` on 401 (Unauthorized) responses
- Clears auth state on token expiration

## 📄 License

See LICENSE file for details.

## 🆘 Support

For issues or questions, contact the Salama API team.
