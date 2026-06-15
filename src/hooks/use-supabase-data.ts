
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, Skill, Certification } from '@/lib/supabase';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn("Supabase projects query failed, using local fallback data:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn("Supabase projects query threw error, using local fallback data:", err);
        return [];
      }
    },
    retry: false,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('category');
        
        if (error) {
          console.warn("Supabase skills query failed:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn("Supabase skills query threw error:", err);
        return [];
      }
    },
    retry: false,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: async (): Promise<Certification[]> => {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn("Supabase certifications query failed:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn("Supabase certifications query threw error:", err);
        return [];
      }
    },
    retry: false,
  });
}

