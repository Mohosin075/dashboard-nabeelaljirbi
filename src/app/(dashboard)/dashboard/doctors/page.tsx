'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { bookingService, Doctor } from '@/services/booking.service';
import {
    Building2,
    Calendar,
    DollarSign,
    MapPin,
    Stethoscope,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getDoctors();
      setDoctors(res.data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load doctors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Doctor Management
        </h1>
        <p className="text-gray-600">
          Total {doctors.length} doctors registered
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="group relative overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {/* TOP STRIP */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="p-5">
              {/* PROFILE */}
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={doctor.profileImage} />
                    <AvatarFallback>
                      {(doctor.name || 'Doctor')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {doctor.name || 'Unnamed Doctor'}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {doctor.city}, {doctor.country}
                  </div>
                </div>

                {/* Gender not available in API */}
                {/* <Badge className="h-fit bg-indigo-50 text-indigo-700">
                  {doctor.gender}
                </Badge> */}
              </div>

              {/* META */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {/* Speciality - note spelling difference if any, service has 'specialty' */}
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-indigo-500" />
                  {doctor.specialty}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  {doctor.experience} yrs experience
                </div>

                {/* Email not available in API */}
                {/* <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span className="truncate">{doctor.email}</span>
                </div> */}

                {/* Phone not available in API */}
                {/* <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  {doctor.phoneNumber}
                </div> */}
              </div>

              {/* CLINIC */}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm">
                <Building2 className="h-4 w-4 text-indigo-500" />
                {doctor.clinic ?? 'Independent Doctor'}
              </div>

              {/* FOOTER */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-lg font-bold text-indigo-600">
                  <DollarSign className="h-5 w-5" />
                  {doctor.fee} LYD
                </div>

                <Button
                  size="sm"
                  className="rounded-full bg-indigo-600 px-5 hover:bg-indigo-700"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
