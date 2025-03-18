"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect, useMemo } from "react";
import styles from "./Catalog.module.css";
import layoutStyles from "../components/layouts/Layout.module.css";
import modalStyles from "../components/ui/modals/Modal.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";

import { CatalogFilters } from "../components/ui/filters";
import IncidentGrid from "./IncidentGrid";
import { Button } from "../components/ui/buttons";
import { useAuth } from "../contexts/AuthContext.jsx";
import { handleDeleteIncidents } from "./crudHandlers";
import AddIncidentForm from "../components/forms/AddIncidentForm";
import EditIncidentForm from "../components/forms/EditIncidentForm";

const Catalog = () => {
  const {
    incidents,
    setIncidents,
    setDisplayedIncident,
    setCurrentIncidentIndex,
    isLoading: incidentsLoading,
  } = useIncidents();

  const [selectedYears, setSelectedYears] = useState(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [sortOrder, setSortOrder] = useState("year-desc");
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
    }, 100);

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

    // Helper function to convert severity text to numeric value for sorting
    const getSeverityValue = (severity) => {
      switch (severity) {
        case "Low":
          return 1;
        case "Moderate":
          return 2;
        case "High":
          return 3;
        case "Critical":
          return 4;
        default:
          return 0; // For unknown or undefined values
      }
    };

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
          return getSeverityValue(a.severity) - getSeverityValue(b.severity);
        case "severity-desc":
          return getSeverityValue(b.severity) - getSeverityValue(a.severity);
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
    setSelectedIncidents((prev) => {
      const isSelected = prev.some((inc) => inc.id === incident.id);
      if (isSelected) {
        return prev.filter((inc) => inc.id !== incident.id);
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
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIncidents.length} incident(s)?`
      )
    ) {
      return;
    }

    // Set loading state
    setIsDeleting(true);

    try {
      const result = await handleDeleteIncidents(selectedIncidents);

      if (typeof result === "string") {
        alert(result);
        return;
      }

      // Ensure a valid array of incidents
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

  const hasFilteredIncidents =
    filteredIncidents && filteredIncidents.length > 0;

  return (
    <>
      <div className={layoutStyles.archiveContainer}>
        <ConsoleWindow title="tech-incidents-catalog" statusItems={statusItems}>
          <ConsoleSection
            command='query tech_incidents.db --search="*" --list'
            commandParts={{
              baseCommand: "query",
              args: ["tech_incidents.db"],
              flags: ['search="*"', "--list"],
            }}
          >
            <CommandOutput
              title="INCIDENT CATALOG"
              subtitle={`All documented technical mishaps since ${yearsAvailable[0] || "1985"}`}
              showGlitch={true}
              showLoadingBar={true}
            >
              {incidentsLoading
                ? "Retrieving incidents..."
                : "Found incidents."}
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
            <div className={styles.commandOutputWithControls}>
              <CommandOutput>
                {incidentsLoading ? (
                  "Retrieving incidents..."
                ) : (
                  <>
                    Displaying {sortedIncidents.length} incidents
                    {selectionMode && ` (${selectedIncidents.length} selected)`}
                  </>
                )}
              </CommandOutput>

              {isAuthenticated && (
                <div className={styles.adminControls}>
                  {!selectionMode ? (
                    <>
                      <button
                        className={`${layoutStyles.homeButton} ${styles.adminButton}`}
                        id="add-incident"
                        onClick={handleAddNew}
                        disabled={incidentsLoading}
                      >
                        Add New
                      </button>
                      <button
                        className={`${layoutStyles.homeButton} ${styles.adminButton}`}
                        id="select-incident"
                        onClick={toggleSelectionMode}
                        disabled={incidentsLoading || !hasFilteredIncidents}
                      >
                        Select
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`${layoutStyles.homeButton} ${styles.adminButton}`}
                        id="cancel-selection"
                        onClick={toggleSelectionMode}
                      >
                        Cancel
                      </button>
                      <button
                        className={`${layoutStyles.homeButton} ${styles.adminButton} ${selectedIncidents.length === 0 ? styles.disabled : ""}`}
                        onClick={handleDelete}
                        disabled={isDeleting || selectedIncidents.length === 0}
                        id="delete-incident"
                      >
                        {`Delete (${selectedIncidents.length})`}
                      </button>
                      <button
                        className={`${layoutStyles.homeButton} ${styles.adminButton} ${selectedIncidents.length === 0 ? styles.disabled : ""}`}
                        onClick={handleEdit}
                        disabled={selectedIncidents.length === 0}
                        id="edit-incident"
                      >
                        {`Edit (${selectedIncidents.length})`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <IncidentGrid
              incidents={sortedIncidents}
              isLoading={incidentsLoading || isDeleting}
              emptyMessage={
                incidentsLoading
                  ? "Loading incidents..."
                  : "No matching incidents found."
              }
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
        <div
          className={modalStyles.modalOverlay}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={modalStyles.closeModal}
              onClick={() => setShowAddModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className={modalStyles.modalTitle}>
              Add New Technical Incident
            </h2>
            <div className={modalStyles.modalContent}>
              <AddIncidentForm onClose={() => setShowAddModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Incident Modal */}
      {showEditModal && selectedIncidents.length > 0 && (
        <div
          className={modalStyles.modalOverlay}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={modalStyles.closeModal}
              onClick={() => setShowEditModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className={modalStyles.modalTitle}>
              Edit Incident ({currentEditIndex + 1}/{selectedIncidents.length})
            </h2>
            <div className={modalStyles.modalContent}>
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
