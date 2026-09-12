/**
 * 🧪 Toast Notifications Test Page
 *
 * Test all toast variants and features
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toastError, toastInfo, toastLoading, toastPromise, toastSuccess, toastWarning } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ToastsTestPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = () => {
    toastSuccess({
      description: 'Your changes have been saved successfully!',
    });
  };

  const handleError = () => {
    toastError({
      description: 'Failed to save changes. Please try again.',
    });
  };

  const handleWarning = () => {
    toastWarning({
      description: 'You have unsaved changes. Please save before leaving.',
    });
  };

  const handleInfo = () => {
    toastInfo({
      description: 'New features are now available. Check them out!',
    });
  };

  const handleLoading = () => {
    toastLoading({
      description: 'Processing your request...',
    });
  };

  const handleCustomTitle = () => {
    toastSuccess({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handlePromiseSuccess = async () => {
    setIsLoading(true);
    const mockApiCall = new Promise((resolve) => {
      setTimeout(() => resolve({ data: 'Success' }), 2000);
    });

    toastPromise(mockApiCall, {
      loading: 'Saving your data...',
      success: 'Data saved successfully!',
      error: 'Failed to save data',
    });

    // Wait for the promise to complete before resetting loading state
    await mockApiCall.finally(() => {
      setIsLoading(false);
    });
  };

  const handlePromiseError = async () => {
    setIsLoading(true);
    const mockApiCall = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network error')), 2000);
    });

    toastPromise(mockApiCall, {
      loading: 'Attempting to connect...',
      success: 'Connected successfully!',
      error: 'Connection failed. Please check your network.',
    });

    // Wait for the promise to complete before resetting loading state
    await mockApiCall.catch(() => { }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleMultipleToasts = () => {
    toastInfo({ description: 'First notification' });
    setTimeout(() => toastWarning({ description: 'Second notification' }), 500);
    setTimeout(() => toastSuccess({ description: 'Third notification' }), 1000);
  };

  const handleCustomToast = () => {
    toastInfo({
      title: 'New Feature',
      description: 'Check out our new dashboard with advanced analytics and reporting tools!',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">Toast Notifications Test</h1>
        <p className="text-muted-foreground">
          Production-grade toast system with multiple variants and features
        </p>
      </div>

      {/* Basic Variants */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Toast Variants</CardTitle>
          <CardDescription>
            Test all available toast variants with icons and colors
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Button
            onClick={handleSuccess}
            variant="outline"
            className="flex items-center gap-2 border-green-200 bg-green-50 hover:bg-green-100"
          >
            <CheckCircle2 className="size-4 text-green-600" />
            Success Toast
          </Button>

          <Button
            onClick={handleError}
            variant="outline"
            className="flex items-center gap-2 border-red-200 bg-red-50 hover:bg-red-100"
          >
            <XCircle className="size-4 text-red-600" />
            Error Toast
          </Button>

          <Button
            onClick={handleWarning}
            variant="outline"
            className="flex items-center gap-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
          >
            <AlertTriangle className="size-4 text-yellow-600" />
            Warning Toast
          </Button>

          <Button
            onClick={handleInfo}
            variant="outline"
            className="flex items-center gap-2 border-blue-200 bg-blue-50 hover:bg-blue-100"
          >
            <Info className="size-4 text-blue-600" />
            Info Toast
          </Button>

          <Button
            onClick={handleLoading}
            variant="outline"
            className="flex items-center gap-2 border-gray-200 bg-gray-50 hover:bg-gray-100"
          >
            <Loader2 className="size-4 animate-spin text-gray-600" />
            Loading Toast
          </Button>

          <Button
            onClick={handleCustomToast}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Info className="size-4 text-blue-600" />
            New Feature
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>
            Test custom titles, promise handling, and multiple toasts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button onClick={handleCustomTitle} variant="outline">
            Custom Title
          </Button>

          <Button onClick={handleMultipleToasts} variant="outline">
            Multiple Toasts
          </Button>

          <Button
            onClick={handlePromiseSuccess}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Promise Success'}
          </Button>

          <Button
            onClick={handlePromiseError}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Promise Error'}
          </Button>
        </CardContent>
      </Card>

      {/* Features List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Production Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">✨ Toast Variants</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Success - Green with checkmark icon</li>
                <li>Error - Red with X icon</li>
                <li>Warning - Yellow with warning icon</li>
                <li>Info - Blue with info icon</li>
                <li>Loading - Gray with spinning loader</li>
                <li>Destructive - Default destructive variant</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">🚀 Helper Functions</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>toastSuccess() - Quick success notifications</li>
                <li>toastError() - Quick error notifications</li>
                <li>toastWarning() - Quick warning notifications</li>
                <li>toastInfo() - Quick info notifications</li>
                <li>toastLoading() - Quick loading notifications</li>
                <li>toastPromise() - Async operation handling</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">💡 Smart Defaults</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Auto-dismiss after 5 seconds</li>
                <li>Max 3 concurrent toasts</li>
                <li>Automatic icon colors</li>
                <li>Default titles for each variant</li>
                <li>Smooth animations</li>
                <li>Mobile-responsive design</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">🎨 Customization</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Custom titles and descriptions</li>
                <li>Custom icons with colors</li>
                <li>Action buttons</li>
                <li>Manual dismiss control</li>
                <li>Type-safe with TypeScript</li>
                <li>Accessibility support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Code examples for implementing toasts in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold text-sm">Basic Usage:</h3>
            <pre className="rounded-md bg-gray-100 p-4 text-xs overflow-x-auto">
              {`// Success notification
toastSuccess({
  description: 'Profile updated successfully!'
});

// Error notification
toastError({
  description: 'Failed to save changes'
});

// Custom title
toastWarning({
  title: 'Unsaved Changes',
  description: 'Please save before leaving'
});`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-sm">Promise Handling:</h3>
            <pre className="rounded-md bg-gray-100 p-4 text-xs overflow-x-auto">
              {`// Automatic loading → success/error
await toastPromise(
  saveProfile(),
  {
    loading: 'Saving profile...',
    success: 'Profile saved!',
    error: 'Failed to save profile'
  }
);`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-sm">Custom Toast:</h3>
            <pre className="rounded-md bg-gray-100 p-4 text-xs overflow-x-auto">
              {`import { toastInfo } from '@/hooks/use-toast';

toastInfo({
  title: 'New Feature',
  description: 'Check out our new dashboard!'
});`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
