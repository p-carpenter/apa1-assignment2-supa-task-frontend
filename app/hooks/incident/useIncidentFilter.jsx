// import { useCallback, useMemo } from "react";
// import { useIncidents } from "@/app/contexts/IncidentContext";

// const useIncidentFilter = (incidents) => {
//   const {
//     activeFilter,
//     setActiveFilter,
//     searchQuery,
//     setSearchQuery,
//     handleFilterClick,
//   } = useIncidents();

//   // Filter incidents based on category and search
//   const filteredIncidents = useMemo(() => {
//     if (!incidents || !incidents.length) return [];

//     let result = [...incidents];

//     if (activeFilter) {
//       result = result.filter(
//         (incident) =>
//           incident.category &&
//           incident.category.toLowerCase() === activeFilter.toLowerCase()
//       );
//     }

//     if (searchQuery && searchQuery.trim() !== "") {
//       const query = searchQuery.toLowerCase().trim();
//       result = result.filter((incident) => {
//         return (
//           (incident.name && incident.name.toLowerCase().includes(query)) ||
//           (incident.description &&
//             incident.description.toLowerCase().includes(query))
//         );
//       });
//     }

//     return result;
//   }, [incidents, activeFilter, searchQuery]);

//   // Handle search input changes
//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchQuery(e.target.value);
//     },
//     [setSearchQuery]
//   );

//   return {
//     activeFilter,
//     searchQuery,
//     filteredIncidents,
//     handleFilterClick,
//     handleSearchChange,
//   };
// };

// export default useIncidentFilter;
