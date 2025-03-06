export const handleAddNewIncident = async (formData) => {
    try {
      const response = await fetch('/api/new-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addition: formData }),
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const updatedData = await response.json();
      setIncidentData(updatedData);
      setShowAddNew(false);
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };


  export const handleUpdateIncident = async (formData) => {
    try {
      const incidentToUpdate =
        displayedIncident || (selectedIncidents.length === 1 ? selectedIncidents[0] : null);

      if (!incidentToUpdate) {
        throw new Error("No single incident to update");
      }

      const response = await fetch('/api/update-incident', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: incidentToUpdate.id,
          update: formData 
        }),
      });
      if (!response.ok) throw new Error('Failed to update incident');

      const updatedData = await response.json();
      setIncidentData(updatedData);
      setShowUpdate(false);
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };

 export const handleDeleteIncidents = async (selectedIncidents) => {
  try {
    const idArray = selectedIncidents.map((inc) => inc.id);

    const response = await fetch("/api/delete-incident", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idArray }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete incidents");
    }

    const updatedData = await response.json();
    return updatedData
  } catch (error) {
    console.error(error);
    return error.message;
  }
};