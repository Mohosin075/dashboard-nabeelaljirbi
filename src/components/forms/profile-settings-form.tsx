/**
 * 👤 Profile Settings Form Component
 *
 * Form for updating basic profile information
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '../../lib/stores/auth.store';

// Validation schema
const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  profilePhoto: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  isLoading?: boolean | undefined;
  defaultValues?: {
    displayName?: string;
    email?: string;
    profilePhoto?: string;
  };
}

export function ProfileSettingsForm({
  onSubmit,
  isLoading: externalLoading,
  defaultValues,
}: ProfileSettingsFormProps) {
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.profilePhoto || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: defaultValues?.displayName || user?.name || '',
      email: defaultValues?.email || user?.email || '',
      profilePhoto: defaultValues?.profilePhoto || user?.image || '',
    },
  });

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Set file in form
      form.setValue('profilePhoto', file);
      form.clearErrors('profilePhoto');
    }
  };

  // Remove selected photo
  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(defaultValues?.profilePhoto || null);
    form.setValue('profilePhoto', '');
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);

      // Call parent onSubmit
      await onSubmit(values);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || externalLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Profile Photo */}
        <FormField
          control={form.control}
          name="profilePhoto"
          render={() => (
            <FormItem>
              <FormLabel>Photo Profile</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                    ) : (
                      <>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultValues?.displayName || 'admin'}`}
                        />
                        <AvatarFallback>
                          {defaultValues?.displayName?.substring(0, 2).toUpperCase() || 'AD'}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex gap-2">
                    <label htmlFor="photo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Edit
                        </span>
                      </Button>
                      <input
                        id="photo-upload"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhotoChange}
                        disabled={isLoading}
                      />
                    </label>
                    {previewUrl && previewUrl !== defaultValues?.profilePhoto && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Upload a profile photo (Max 5MB, JPG/PNG/WEBP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Name */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  readOnly={true}
                  disabled={true}
                  {...field}
                  value={user?.email}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
}
