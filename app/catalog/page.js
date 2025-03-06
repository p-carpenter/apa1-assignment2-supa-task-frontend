"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect, useMemo } from "react";
import "./catalog.styles.css";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui";

import { CatalogFilters, IncidentGrid } from "../components/layouts";
import { Button } from "../components/ui/buttons";
import { useAuth } from '../contexts/AuthContext.jsx';
import { handleDeleteIncidents } from './crudHandlers';
import AddIncidentForm from "../components/ui/forms/AddIncidentForm";
import EditIncidentForm from "../components/ui/forms/EditIncidentForm";

const Catalog = () => {
  const { incidents, setIncidents, setDisplayedIncident, setCurrentIncidentIndex } =
    useIncidents();
  const [selectedYears, setSelectedYears] = useState(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [sortOrder, setSortOrder] = useState("year-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeSearch, setRealTimeSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Selection mode and selected incidents
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(0);

  const getIncidentYear = (incident) => {
    if (!incident || !incident.incident_date) return null;
    try {
      return new Date(incident.incident_date).getFullYear();
    } catch (error) {
      console.error("Error extracting year:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!incidents || !incidents.length) return;
    setIsLoading(false);

    const years = incidents
      .map((incident) => getIncidentYear(incident))
      .filter((year) => year !== null)
      .map((year) => year.toString());

    const uniqueYears = [...new Set(years)].sort();
    setYearsAvailable(uniqueYears);
  }, [incidents]);

  const categories = useMemo(() => {
    if (!incidents || !incidents.length) return [];

    const cats = incidents
      .map((incident) => incident.category)
      .filter((category) => category)
      .reduce((acc, category) => {
        if (!acc.includes(category)) {
          acc.push(category);
        }
        return acc;
      }, []);

    return cats.sort();
  }, [incidents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(realTimeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [realTimeSearch]);

  const filteredIncidents = useMemo(() => {
    if (!incidents || !incidents.length) return [];

    return incidents.filter((incident) => {
      if (!incident) return false;

      const year = getIncidentYear(incident);

      const matchesYear =
        selectedYears.includes("all") ||
        (year && selectedYears.includes(year.toString()));

      const matchesCategory =
        selectedCategories.includes("all") ||
        (incident.category && selectedCategories.includes(incident.category));

      const matchesSearch =
        searchQuery === "" ||
        (incident.name &&
          incident.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (incident.category &&
          incident.category
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (incident.description &&
          incident.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (year && year.toString().includes(searchQuery));

      return matchesYear && matchesCategory && matchesSearch;
    });
  }, [incidents, selectedYears, selectedCategories, searchQuery]);

  const sortedIncidents = useMemo(() => {
    if (!filteredIncidents.length) return [];

    return [...filteredIncidents].sort((a, b) => {
      const yearA = getIncidentYear(a) || 0;
      const yearB = getIncidentYear(b) || 0;

      switch (sortOrder) {
        case "year-asc":
          return yearA - yearB;
        case "year-desc":
          return yearB - yearA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "severity-asc":
          return (a.severity || 0) - (b.severity || 0);
        case "severity-desc":
          return (b.severity || 0) - (a.severity || 0);
        default:
          return yearB - yearA;
      }
    });
  }, [filteredIncidents, sortOrder]);

  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "CATALOG VIEW",
    { text: `${filteredIncidents.length} RECORDS RETRIEVED`, blink: true },
  ];

  const handleIncidentSelect = (incident, e) => {
    // If in selection mode, handle selection instead of navigation
    if (selectionMode) {
      e.preventDefault();
      toggleIncidentSelection(incident);
      return;
    }
    
    // Normal navigation behavior
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index >= 0 ? index : 0);
    setDisplayedIncident(incident);
  };

  const toggleIncidentSelection = (incident) => {
    setSelectedIncidents(prev => {
      const isSelected = prev.some(inc => inc.id === incident.id);
      if (isSelected) {
        return prev.filter(inc => inc.id !== incident.id);
      } else {
        return [...prev, incident];
      }
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    // Clear selections when exiting selection mode
    if (selectionMode) {
      setSelectedIncidents([]);
    }
  };
  
  const handleDelete = async () => {
    if (selectedIncidents.length === 0) {
      alert("Please select incidents to delete");
      return;
    }
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${selectedIncidents.length} incident(s)?`)) {
      return;
    }
    
    // Set loading state
    setIsDeleting(true);
    
    try {
      // Call the delete handler from crudHandlers.js
      const result = await handleDeleteIncidents(selectedIncidents);
      
      // Check if the result is an error message string
      if (typeof result === 'string') {
        alert(result);
        return;
      }
      
      // Ensure we have a valid array of incidents
      if (Array.isArray(result)) {
        // Update the incidents state with the updated data
        setIncidents(result);
      } else {
        console.error("Invalid response from delete handler:", result);
        alert("An error occurred while deleting incidents");
      }
      
      // After deletion, exit selection mode and clear selections
      setSelectionMode(false);
      setSelectedIncidents([]);
    } catch (error) {
      console.error("Error deleting incidents:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    if (selectedIncidents.length === 0) {
      alert("Please select incidents to edit");
      return;
    }
    
    // Start editing the first selected incident
    setShowEditModal(true);
    setCurrentEditIndex(0);
  };
  
  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const moveToNextEdit = () => {
    if (currentEditIndex < selectedIncidents.length - 1) {
      setCurrentEditIndex(currentEditIndex + 1);
    } else {
      setShowEditModal(false);
      setSelectionMode(false);
      setSelectedIncidents([]);
    }
  };

  const { isAuthenticated } = useAuth();

  return (
    <>
      <div className="circuit-background"></div>

      <div className="archive-container catalog-container">
        <ConsoleWindow title="tech-incidents-catalog" statusItems={statusItems}>
            <ConsoleSection command='query tech_incidents.db --search="*" --list' commandParts={
                {
                  baseCommand: "query",
                  args: ["tech_incidents.db"],
                  flags: ['search="*"', "--list"]
                }
              }>

            <CommandOutput title="INCIDENT CATALOG"
            subtitle={`All documented technical mishaps since ${yearsAvailable[0] || "1985"}`}
            showGlitch={true}
            showLoadingBar={true}>
            Found incidents.
                </CommandOutput>
          </ConsoleSection>

          <CatalogFilters
            searchQuery={realTimeSearch}
            onSearchChange={setRealTimeSearch}
            selectedYears={selectedYears}
            yearsAvailable={yearsAvailable}
            onYearChange={setSelectedYears}
            selectedCategories={selectedCategories}
            categories={categories}
            onCategoryChange={setSelectedCategories}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          <ConsoleSection>
            <div className="command-output-with-controls">
              <CommandOutput>
                Displaying {sortedIncidents.length} incidents
                {selectionMode && ` (${selectedIncidents.length} selected)`}
              </CommandOutput>
              
              {isAuthenticated && (
                <div className="admin-controls">
                  {!selectionMode ? (
                    <>
                      <Button 
                        className="admin-button"
                        label="Add New" 
                        onClick={handleAddNew}
                      />
                      <Button 
                        className="admin-button"
                        label="Select" 
                        onClick={toggleSelectionMode}
                      />
                    </>
                  ) : (
                    <>
                      <Button 
                        className="admin-button"
                        label="Cancel" 
                        onClick={toggleSelectionMode}
                      />
                      <Button 
                        className={`admin-button ${selectedIncidents.length === 0 ? 'disabled' : ''}`}
                        label={`Delete (${selectedIncidents.length})`}
                        onClick={handleDelete}
                        disabled={isDeleting}
                      />
                      <Button 
                        className={`admin-button ${selectedIncidents.length === 0 ? 'disabled' : ''}`}
                        label={`Edit (${selectedIncidents.length})`}
                        onClick={handleEdit}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <IncidentGrid
              incidents={sortedIncidents}
              isLoading={isLoading || isDeleting}
              emptyMessage="No matching incidents found."
              onIncidentSelect={handleIncidentSelect}
              getIncidentYear={getIncidentYear}
              selectionMode={selectionMode}
              selectedIncidents={selectedIncidents}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>

      {/* Add New Incident Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setShowAddModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="modal-title">Add New Technical Incident</h2>
            <div className="modal-content">
              <AddIncidentForm onClose={() => setShowAddModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Incident Modal */}
      {showEditModal && selectedIncidents.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setShowEditModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="modal-title">
              Edit Incident ({currentEditIndex + 1}/{selectedIncidents.length})
            </h2>
            <div className="modal-content">
              <EditIncidentForm 
                incident={selectedIncidents[currentEditIndex]}
                onClose={() => setShowEditModal(false)}
                onNext={moveToNextEdit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Catalog;