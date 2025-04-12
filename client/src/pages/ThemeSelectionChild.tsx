import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Theme, Profile } from '@shared/schema';
import { COLORS, THEME_COLORS } from '@/lib/colors';
import { 
  Rocket, 
  History, 
  Sparkles, 
  GraduationCap, 
  ArrowLeft, 
  Globe, 
  BookOpen, 
  Dna,
  CircleUser,
  ChevronRight,
  Beaker 
} from 'lucide-react';

export default function ThemeSelectionChild() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Parse profile ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('profileId');
    if (id) {
      setProfileId(parseInt(id));
    }
  }, []);

  // Get themes
  const { data: themes, isLoading } = useQuery<Theme[]>({
    queryKey: ['/api/themes'],
  });

  // Get user's selected profile
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['/api/profiles', profileId],
    enabled: !!profileId,
  });

  // Mutation to update user's theme preference
  const updateThemeMutation = useMutation({
    mutationFn: async ({ themeId }: { themeId: number }) => {
      if (!profileId) throw new Error('No profile selected');
      
      const response = await apiRequest(
        'PATCH',
        `/api/profiles/${profileId}`,
        { themeId }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Theme Updated',
        description: 'Your theme preference has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', profileId] });
      
      // Navigate to stories for this theme
      const themeId = selectedTheme?.id || 1;
      navigate(`/regional-stories/${themeId}?profileId=${profileId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update theme: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setShowDialog(true);
  };

  const confirmThemeSelection = () => {
    if (selectedTheme) {
      updateThemeMutation.mutate({ themeId: selectedTheme.id });
    }
    setShowDialog(false);
  };

  const goBack = () => {
    navigate('/profiles');
  };

  if (isLoading || profileLoading || !themes) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${COLORS.APP_BACKGROUND}`}>
        <div className={`animate-pulse ${COLORS.TEXT_PRIMARY} text-2xl`}>Loading themes...</div>
      </div>
    );
  }

  // Filter available themes - for now only show Voyages and Realistic Fiction
  const availableThemes = themes.filter(theme => 
    theme.name === 'Voyages' || theme.name === 'Realistic Fiction'
  );

  return (
    <div className={`min-h-screen ${COLORS.APP_BACKGROUND} ${COLORS.TEXT_PRIMARY}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-12">
          <Button variant="ghost" onClick={goBack} className={`mr-4 ${COLORS.TEXT_TERTIARY} hover:${COLORS.TEXT_PRIMARY}`}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Profiles
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            {profile && (
              <div className={`h-10 w-10 rounded-full ${profile.avatar || 'bg-purple-500'} flex items-center justify-center mr-3`}>
                <span className="text-lg font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span>Choose Your Learning Adventure</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {availableThemes.map((theme) => {
            // Customize theme card content based on theme name
            let icon, color, description, bgClass;
            
            switch (theme.name) {
              case 'Space Explorers':
                icon = <Rocket className="h-12 w-12 text-blue-300" />;
                color = 'from-blue-800 to-indigo-900';
                bgClass = 'bg-gradient-to-b from-blue-800/60 to-indigo-900/60';
                description = 'Journey through our solar system and beyond, learning about astronomy, physics, and space exploration.';
                break;
              case 'Historical Journeys':
                icon = <History className="h-12 w-12 text-amber-300" />;
                color = 'from-amber-800 to-red-900';
                bgClass = 'bg-gradient-to-b from-amber-800/60 to-red-900/60';
                description = 'Travel back in time to important historical periods and civilizations around the world.';
                break;
              case 'Voyages':
                icon = <Globe className="h-12 w-12 text-emerald-300" />;
                color = 'from-emerald-800 to-teal-900';
                bgClass = 'bg-gradient-to-b from-emerald-800/60 to-teal-900/60';
                description = 'Explore different regions of the world, learning about geography, cultures, and natural wonders.';
                break;
              case 'Realistic Fiction':
                icon = <BookOpen className="h-12 w-12 text-purple-300" />;
                color = 'from-purple-800 to-fuchsia-900';
                bgClass = 'bg-gradient-to-b from-purple-800/60 to-fuchsia-900/60';
                description = 'Experience everyday adventures that blend math, science, and language arts in relatable scenarios.';
                break;
              case 'Science Mysteries':
                icon = <Beaker className="h-12 w-12 text-cyan-300" />;
                color = 'from-cyan-800 to-blue-900';
                bgClass = 'bg-gradient-to-b from-cyan-800/60 to-blue-900/60';
                description = 'Solve scientific puzzles and experiments while learning about chemistry, biology, and physics.';
                break;
              default:
                icon = <Sparkles className="h-12 w-12 text-blue-300" />;
                color = 'from-blue-800 to-indigo-900';
                bgClass = 'bg-gradient-to-b from-blue-800/60 to-indigo-900/60';
                description = 'Choose from a variety of themed learning adventures that blend academic subjects.';
            }
            
            return (
              <Card 
                key={theme.id}
                className={`border border-${color} backdrop-blur-md ${bgClass} hover:shadow-lg hover:border-white/50 transition-all duration-300 cursor-pointer overflow-hidden group`}
                onClick={() => handleThemeSelect(theme)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transform translate-x-16 -translate-y-16"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/10 rounded-lg">
                      {icon}
                    </div>
                    <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-white/70" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-4">{theme.name}</CardTitle>
                  <CardDescription className={COLORS.TEXT_SECONDARY}>
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-white/70" />
                      <span className="text-white/80">Perfect for Grade {profile?.grade || '1-8'}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-white/70" />
                      <span className="text-white/80">5+ Interactive Stories</span>
                    </div>
                    <div className="flex items-center">
                      <Dna className="h-5 w-5 mr-2 text-white/70" />
                      <span className="text-white/80">Cross-Subject Learning</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className={`w-full ${COLORS.BUTTON_SECONDARY} backdrop-blur-md`}>
                    Select This Theme
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={`${COLORS.DIALOG_BG} ${COLORS.DIALOG_BORDER} ${COLORS.TEXT_PRIMARY}`}>
          <DialogHeader>
            <DialogTitle>Confirm Theme Selection</DialogTitle>
            <DialogDescription className={COLORS.TEXT_SECONDARY}>
              {selectedTheme && (
                <>You've selected the <span className={`${COLORS.TEXT_PRIMARY} font-semibold`}>{selectedTheme.name}</span> theme.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className={COLORS.TEXT_MUTED}>
              This theme will be used to personalize your learning experience. 
              You can change your theme selection later from your profile settings.
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className={COLORS.BUTTON_OUTLINE}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmThemeSelection}
              className={COLORS.BUTTON_PRIMARY}
            >
              Continue with this Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}