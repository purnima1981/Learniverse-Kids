import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Profile, InsertProfile } from '@shared/schema';
import { 
  UserCircle, Plus, Edit, Star, LogOut, ChevronRight, Rocket, GraduationCap, 
  Sparkles, Pencil, Trash2 
} from 'lucide-react';

// Define avatar colors
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-emerald-500',
];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  grade: z.string().min(1, "Please select a grade"),
  gender: z.string().min(1, "Please select a gender option"),
  avatarColor: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSelection() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      grade: '',
      gender: '',
      avatarColor: AVATAR_COLORS[0],
    }
  });

  // Reset form when opening to add a new profile
  useEffect(() => {
    if (showAddProfile && !editingProfile) {
      form.reset({
        name: '',
        grade: '',
        gender: '',
        avatarColor: AVATAR_COLORS[0],
      });
      setAvatarColor(AVATAR_COLORS[0]);
    }
  }, [showAddProfile, editingProfile, form]);

  // Set form values when editing a profile
  useEffect(() => {
    if (editingProfile) {
      form.reset({
        name: editingProfile.name,
        grade: editingProfile.grade,
        gender: editingProfile.gender,
        avatarColor: editingProfile.avatar || AVATAR_COLORS[0],
      });
      setAvatarColor(editingProfile.avatar || AVATAR_COLORS[0]);
    }
  }, [editingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertProfile) => {
      const response = await apiRequest('POST', '/api/profiles', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Created',
        description: 'The profile has been created successfully',
      });
      setShowAddProfile(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Profile> }) => {
      const response = await apiRequest('PATCH', `/api/profiles/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'The profile has been updated successfully',
      });
      setEditingProfile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const setDefaultProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await apiRequest('POST', `/api/profiles/${profileId}/default`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Default Profile Set',
        description: 'The default profile has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Set Default Profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      await apiRequest('DELETE', `/api/profiles/${profileId}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Profile Deleted',
        description: 'The profile has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Delete Profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    const profileData = {
      ...data,
      userId: user?.id as number,
      avatar: avatarColor,
    };

    if (editingProfile) {
      await updateProfileMutation.mutateAsync({ id: editingProfile.id, data: profileData });
    } else {
      await createProfileMutation.mutateAsync(profileData);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    navigate(`/theme-selection?profileId=${profile.id}`);
  };

  const handleParentSelect = () => {
    navigate('/dashboard'); // Parent goes straight to dashboard
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900">
        <div className="animate-pulse text-white text-2xl">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Who's Learning Today?</h1>
          <p className="text-xl text-blue-200">Choose a profile to continue your learning journey</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {/* Parent Profile Card */}
          <Card 
            className="bg-blue-800/40 backdrop-blur-md border border-blue-700/30 shadow-xl overflow-hidden 
                      hover:border-blue-400 transition-all cursor-pointer group"
            onClick={handleParentSelect}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{user.firstName} (Parent)</h3>
              <p className="text-sm text-blue-200">Account Manager</p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5 mx-auto text-blue-300" />
              </div>
            </CardContent>
          </Card>

          {/* Child Profile Cards */}
          {profiles?.map((profile) => (
            <Card 
              key={profile.id}
              className="bg-blue-800/40 backdrop-blur-md border border-blue-700/30 shadow-xl overflow-hidden 
                        hover:border-blue-400 transition-all cursor-pointer group"
              onClick={() => handleProfileSelect(profile)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full relative">
                <div className="relative">
                  <div className={`h-24 w-24 rounded-full ${profile.avatar || 'bg-purple-500'} flex items-center justify-center mb-4`}>
                    <span className="text-3xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  {profile.isDefault && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{profile.name}</h3>
                <p className="text-sm text-blue-200">Grade {profile.grade}</p>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 justify-center">
                  <Dialog>
                    <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-700/50">
                        <Edit className="h-4 w-4 text-blue-200" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-blue-900 border-blue-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-100">Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Profile name" 
                                    className="bg-blue-800/50 border-blue-700/50 text-white"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-300" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-100">Grade</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-blue-800/50 border-blue-700/50 text-white">
                                      <SelectValue placeholder="Select a grade" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-blue-900 border-blue-700 text-white">
                                    {Array.from({ length: 8 }, (_, i) => i + 1).map((grade) => (
                                      <SelectItem key={grade} value={grade.toString()}>
                                        Grade {grade}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-300" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-100">Gender</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-blue-800/50 border-blue-700/50 text-white">
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-blue-900 border-blue-700 text-white">
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-300" />
                              </FormItem>
                            )}
                          />
                          <div>
                            <FormLabel className="text-blue-100">Avatar Color</FormLabel>
                            <div className="grid grid-cols-5 gap-2 mt-2">
                              {AVATAR_COLORS.map((color) => (
                                <div
                                  key={color}
                                  className={`h-8 w-8 rounded-full ${color} cursor-pointer 
                                            ${color === avatarColor ? 'ring-2 ring-white' : ''}`}
                                  onClick={() => setAvatarColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between mt-6">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteProfileMutation.mutate(profile.id);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </Button>
                            <div className="space-x-2">
                              <DialogClose asChild>
                                <Button variant="outline" className="border-blue-600 text-blue-200 hover:bg-blue-800">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-blue-700/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultProfileMutation.mutate(profile.id);
                    }}
                  >
                    <Star className={`h-4 w-4 ${profile.isDefault ? 'text-yellow-400' : 'text-blue-200'}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Profile Card */}
          <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
            <DialogTrigger asChild>
              <Card className="bg-blue-800/20 backdrop-blur-md border border-blue-700/30 border-dashed shadow-xl 
                              hover:bg-blue-800/40 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="h-24 w-24 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    <Plus className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-300">Add Profile</h3>
                  <p className="text-sm text-blue-200 mt-1">Create a new child profile</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-blue-900 border-blue-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Profile</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Profile name" 
                            className="bg-blue-800/50 border-blue-700/50 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Grade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-blue-800/50 border-blue-700/50 text-white">
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-blue-900 border-blue-700 text-white">
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-blue-800/50 border-blue-700/50 text-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-blue-900 border-blue-700 text-white">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel className="text-blue-100">Avatar Color</FormLabel>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {AVATAR_COLORS.map((color) => (
                        <div
                          key={color}
                          className={`h-8 w-8 rounded-full ${color} cursor-pointer 
                                    ${color === avatarColor ? 'ring-2 ring-white' : ''}`}
                          onClick={() => setAvatarColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Create Profile
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Logout button */}
        <div className="mt-12 text-center">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-blue-300 hover:text-white hover:bg-blue-800/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}