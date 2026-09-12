/**
 * 🧪 Forms Test Page
 *
 * Test all form components
 */

'use client'

import { LoginForm } from '@/components/forms/login-form'
import {
  MultiStepForm,
  type MultiStepFormValues,
} from '@/components/forms/multi-step-form'
import { ProfileForm, type ProfileFormValues } from '@/components/forms/profile-form'
import { RegisterForm } from '@/components/forms/register-form'
import { SearchForm, type SearchFormValues } from '@/components/forms/search-form'
import { SettingsForm, type SettingsFormValues } from '@/components/forms/settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export default function FormsTestPage() {
  const [activeTab, setActiveTab] = useState('login')

  // Mock handlers
  const handleLogin = async (values: any) => {
    console.log('Login:', values)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  }

  const handleRegister = async (values: any) => {
    console.log('Register:', values)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    console.log('Profile Update:', values)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleAvatarChange = async (file: File) => {
    console.log('Avatar Change:', file.name)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleSettingsSave = async (values: SettingsFormValues) => {
    console.log('Settings:', values)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleSearch = (values: SearchFormValues) => {
    console.log('Search:', values)
  }

  const handleMultiStepSubmit = async (values: MultiStepFormValues) => {
    console.log('Multi-Step Form:', values)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">Form Components Test</h1>
        <p className="text-muted-foreground">
          Test all form components with validation and error handling
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="wizard">Wizard</TabsTrigger>
        </TabsList>

        {/* Login Form Tab */}
        <TabsContent value="login" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Login Form</CardTitle>
              <CardDescription>
                Test login with validation, password visibility toggle, and remember me
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <LoginForm
                onSubmit={handleLogin as any}
                onForgotPassword={() => alert('Forgot password clicked')}
                onSignUp={() => setActiveTab('register')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Credentials (with MSW)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> john@example.com</p>
                <p><strong>Password:</strong> password (any password works in mock)</p>
                <p className="text-muted-foreground">
                  Or use any email from the mock users
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Register Form Tab */}
        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Register Form</CardTitle>
              <CardDescription>
                Test registration with password strength indicator and terms checkbox
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RegisterForm
                onSubmit={handleRegister}
                onSignIn={() => setActiveTab('login')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Password strength indicator (5 levels)</li>
                <li>Password confirmation validation</li>
                <li>Email format validation</li>
                <li>Terms and conditions checkbox</li>
                <li>Password visibility toggles</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Form Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Form</CardTitle>
              <CardDescription>
                Test profile update with avatar upload and multiple fields
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfileForm
                defaultValues={{
                  name: 'John Doe',
                  email: 'john@example.com',
                  bio: 'Software developer and tech enthusiast',
                  phone: '+1 (555) 123-4567',
                  website: 'https://johndoe.com',
                  location: 'San Francisco, CA',
                  company: 'Acme Inc.',
                  role: 'admin',
                }}
                avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                onSubmit={handleProfileUpdate}
                onAvatarChange={handleAvatarChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Avatar upload with preview</li>
                <li>File type and size validation</li>
                <li>Multiple field types (text, email, url, tel, textarea, select)</li>
                <li>Grid layout for better organization</li>
                <li>Form reset functionality</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Form Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings Form</CardTitle>
              <CardDescription>
                Comprehensive user preferences with notifications, privacy, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SettingsForm
                onSubmit={handleSettingsSave}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Notifications preferences (email, push, SMS)</li>
                <li>Privacy settings (profile visibility, contact info)</li>
                <li>Display preferences (theme, language, timezone)</li>
                <li>Security options (2FA, session timeout)</li>
                <li>Switch components for boolean settings</li>
                <li>Select dropdowns for multiple choice</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Form Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search Form</CardTitle>
              <CardDescription>
                Comprehensive search with filters, price range, ratings, and sorting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchForm onSearch={handleSearch} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Text search with real-time query</li>
                <li>Category and brand filtering</li>
                <li>Price range slider</li>
                <li>Minimum rating filter with slider</li>
                <li>Sort by multiple criteria (price, rating, date, popularity)</li>
                <li>Quick filters (in stock, on sale, free shipping)</li>
                <li>Active filter badges with remove capability</li>
                <li>Collapsible advanced filters section</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Step Form Tab */}
        <TabsContent value="wizard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Step Wizard Form</CardTitle>
              <CardDescription>
                Complete registration process with step-by-step validation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <MultiStepForm onSubmit={handleMultiStepSubmit} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>4 steps: Personal Info → Company → Payment → Review</li>
                <li>Visual progress bar and step indicators</li>
                <li>Step-by-step validation before proceeding</li>
                <li>Data persistence across steps</li>
                <li>Review summary before final submission</li>
                <li>Back/Next navigation with disabled states</li>
                <li>Icons for each step</li>
                <li>Responsive design for mobile/tablet</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Validation Testing:</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Try submitting empty forms to see validation errors</li>
              <li>Enter invalid email formats</li>
              <li>Test password strength with different combinations</li>
              <li>Try mismatched passwords in register form</li>
              <li>Upload invalid file types for avatar</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">API Integration:</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Check browser console for form submission values</li>
              <li>All forms have loading states during submission</li>
              <li>Toast notifications show success/error messages</li>
              <li>MSW intercepts login/register API calls</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Features to Test:</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Password visibility toggles</li>
              <li>Remember me checkbox</li>
              <li>Terms and conditions validation</li>
              <li>Avatar upload and preview</li>
              <li>Form reset functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
