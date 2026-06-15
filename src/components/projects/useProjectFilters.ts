import { useState, useEffect, useMemo } from "react";
import { Project } from "@/lib/supabase";

export const useProjectFilters = (projects: Project[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extract all unique technologies from projects
  const availableTechnologies = useMemo(() => {
    if (!projects) return [];
    
    const techSet = new Set<string>();
    
    projects.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => techSet.add(tech));
      }
    });
    
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter and sort projects based on current filters
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects
      .filter(project => {
        // Filter by search query
        if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filter by selected technology
        if (selectedTech && (!project.technologies || !project.technologies.includes(selectedTech))) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected sorting option
        switch (sortBy) {
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "impact":
            // Sort by impact score if available, otherwise keep default order
            if (a.impact_score !== undefined && b.impact_score !== undefined) {
              return b.impact_score - a.impact_score;
            }
            return 0;
          // Remove date sorting since created_at doesn't exist in the Project type
          default:
            return 0;
        }
      });
  }, [projects, searchQuery, selectedTech, sortBy]);

  // Reset filters when projects change
  useEffect(() => {
    setSearchQuery("");
    setSelectedTech(null);
    setSortBy("default");
  }, [projects]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    availableTechnologies,
    filteredProjects
  };
};
