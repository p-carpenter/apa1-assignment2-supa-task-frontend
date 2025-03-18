"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect, useMemo } from "react";
import styles from "./Catalog.module.css";
import layoutStyles from "../components/layouts/Layout.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";
import { CatalogFilters } from "../components/ui/filters";
import IncidentGrid from "@/app/components/ui/catalog/IncidentGrid";
import { useAuth } from "../contexts/AuthContext.jsx";
import { handleDeleteIncidents } from "./crudHandlers";

import AdminControls from "../components/ui/catalog/AdminControls";
import IncidentModals from "../components/ui/catalog/IncidentModals";

import {
  getIncidentYear,
  filterIncidents,
  sortIncidents,
} from "@/app/utils/incidents/incidentGridUtils";

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

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(0);

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
    return filterIncidents(
      incidents,
      searchQuery,
      selectedYears,
      selectedCategories
    );
  }, [incidents, searchQuery, selectedYears, selectedCategories]);

  const sortedIncidents = useMemo(() => {
    return sortIncidents(filteredIncidents, sortOrder);
  }, [filteredIncidents, sortOrder]);

  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "CATALOG VIEW",
    { text: `${filteredIncidents.length} RECORDS RETRIEVED`, blink: true },
  ];

  const handleIncidentSelect = (incident, e) => {
    if (selectionMode) {
      e.preventDefault();
      toggleIncidentSelection(incident);
      return;
    }

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

    if (selectionMode) {
      setSelectedIncidents([]);
    }
  };

  const handleDelete = async () => {
    if (selectedIncidents.length === 0) {
      alert("Please select incidents to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIncidents.length} incident(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await handleDeleteIncidents(selectedIncidents);

      if (typeof result === "string") {
        alert(result);
        return;
      }

      if (Array.isArray(result)) {
        setIncidents(result);
      } else {
        console.error("Invalid response from delete handler:", result);
        alert("An error occurred while deleting incidents");
      }

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

              {/* Admin Controls Component */}
              {isAuthenticated && (
                <AdminControls
                  selectionMode={selectionMode}
                  toggleSelectionMode={toggleSelectionMode}
                  handleAddNew={handleAddNew}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  isLoading={incidentsLoading}
                  hasFilteredIncidents={hasFilteredIncidents}
                  selectedIncidents={selectedIncidents}
                  isDeleting={isDeleting}
                />
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

      {/* Incident Modals Component */}
      <IncidentModals
        showAddModal={showAddModal}
        closeAddModal={() => setShowAddModal(false)}
        showEditModal={showEditModal}
        closeEditModal={() => setShowEditModal(false)}
        selectedIncidents={selectedIncidents}
        currentEditIndex={currentEditIndex}
        moveToNextEdit={moveToNextEdit}
      />
    </>
  );
};

export default Catalog;
