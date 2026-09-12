'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { AdminDoctor, adminService } from '@/services/admin.service';
import {
    Briefcase,
    Building2,
    Calendar,
    DollarSign,
    Mail,
    MapPin,
    Phone,
    Search,
    Stethoscope,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [page, activeSearch]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDoctors({ page, limit: 10, search: activeSearch });

      let data = response.data.data || [];
       if (activeSearch) {
        const lowerSearch = activeSearch.toLowerCase();
        data = data.filter(d =>
            (d.fullName?.toLowerCase().includes(lowerSearch) ?? false) ||
            (d.email?.toLowerCase().includes(lowerSearch) ?? false)
        );
      }

      setDoctors(data);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load doctors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor Management
          </h1>
          <p className="mt-1 text-gray-600">
            Total {doctors.length} doctors registered
          </p>
        </div>
        <div className="relative">
            <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={handleSearch}
            />
             <Input
            placeholder="Search doctors..."
            className="pl-8 w-[250px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="transition-shadow hover:shadow-xl hover:scale-[1.02] duration-300"
          >
            <CardContent className="p-6">
              {/* Header: Avatar & Name */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-500">
                  <AvatarImage src={doctor.profileImage} alt={doctor.fullName} />
                  <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                    {(doctor.fullName || 'Doctor')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.fullName || 'Unnamed Doctor'}</h3>
                    <Badge variant="outline" className="capitalize">
                      {doctor.gender}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.city}, {doctor.country}</span>
                  </div>
                </div>
              </div>

              {/* Speciality & Experience */}
              <div className="mt-4 flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-1 text-sm">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                  <span className="capitalize">{doctor.speciality}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span>{doctor.experience} yrs</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span>{doctor.consultFee} LYD</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 border-t pt-3 space-y-2 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{doctor.phoneNumber}</span>
                </div>
              </div>

              {/* Clinic Info */}
              <div className="mt-4 border-t pt-3 space-y-2 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{doctor.clinicName}</span>
                </div>
                {doctor.joinClinicDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>Joined: {new Date(doctor.joinClinicDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* License & DOB */}
              <div className="mt-4 flex flex-col gap-1 text-gray-500 text-sm">
                <div className="bg-gray-50 p-2 rounded-md font-mono text-sm text-gray-900">
                  License: {doctor.licenseNumber}
                </div>
                <div>DOB: {new Date(doctor.dateOfBirth).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              onClick={() => setPage(p)}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
            >
              {p}
            </Button>
          ))}
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
