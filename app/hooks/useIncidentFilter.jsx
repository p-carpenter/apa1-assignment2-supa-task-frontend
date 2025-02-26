import { useState, useMemo } from "react";
import { useIncidents } from "../contexts/IncidentContext";

const useIncidentFilter = () => {
  const { incidents } = useIncidents();
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Category filter
      if (activeFilter && incident.category !== activeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          incident.name.toLowerCase().includes(query) ||
          incident.category.toLowerCase().includes(query) ||
          (incident.severity && incident.severity.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [incidents, activeFilter, searchQuery]);

  const handleFilterClick = (category) => {
    setActiveFilter(activeFilter === category ? null : category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  return {
    activeFilter,
    searchQuery,
    filteredIncidents,
    handleFilterClick,
    handleSearchChange,
    handleSearchClear,
  };
};

export default useIncidentFilter;
