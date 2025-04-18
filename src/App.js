// src/App.js
import React, { useState, useEffect } from "react";
import MemoryCard from "./components/MemoryCard";
import AddMemoryForm from "./components/AddMemoryForm";
import axios from "axios";
import Papa from "papaparse";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";

const App = () => {
  const [memories, setMemories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editMemoryId, setEditMemoryId] = useState(null);

  const apiBase = "/.netlify/functions/models/memory";  // Adjusted to match your backend

  // Fetch all memories
  useEffect(() => {
    axios.get(apiBase)
      .then(response => {
        setMemories(response.data);
      })
      .catch(err => {
        console.error("Error fetching memories:", err);
      });
  }, []);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === "All Categories" ? "" : category);
  };

  // Add or Edit Memory
  const handleAddMemory = (memory) => {
    if (editMemoryId) {
      // PUT request (Update)
      axios.put(apiBase, { id: editMemoryId, ...memory })
        .then(() => {
          setMemories(prev =>
            prev.map(item => item._id === editMemoryId ? { _id: editMemoryId, ...memory } : item)
          );
          setIsModalOpen(false);
          setEditMemoryId(null);
        })
        .catch(err => console.error("Error updating memory:", err));
    } else {
      // POST request (Create)
      axios.post(apiBase, memory)
        .then(response => {
          const newMemory = { _id: response.data.insertedId || response.data._id, ...memory };
          setMemories(prev => [...prev, newMemory]);
          setIsModalOpen(false);
        })
        .catch(err => console.error("Error adding memory:", err));
    }
  };

  // Open Edit Modal
  const handleEdit = (id) => {
    setEditMemoryId(id);
    setIsModalOpen(true);
  };

  // Delete memory
  const handleDelete = (id) => {
    axios.delete(`${apiBase}?id=${id}`)
      .then(() => {
        setMemories(prev => prev.filter(memory => memory._id !== id));
      })
      .catch(err => console.error("Error deleting memory:", err));
  };

  // Export to CSV
  const handleExport = () => {
    const memoriesToExport = memories.map(
      ({ title, description, category, date }) => ({ title, description, category, date })
    );
    const csv = Papa.unparse(memoriesToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "memories.csv";
    link.click();
  };

  const filteredMemories = selectedCategory
    ? memories.filter(memory => memory.category === selectedCategory)
    : memories;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Nav */}
      <TopNav/>

      {/* Layout */}
      <div className="flex flex-1 pt-16 pb-16 sm:pb-0">
        <Sidebar
          onCategoryChange={handleCategoryChange}
          setIsModalOpen={setIsModalOpen}
          handleExport={handleExport}
          memories={memories}
        />

        <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex justify-center sm:justify-start sm:items-start items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                onEdit={() => handleEdit(memory._id)}
                onDelete={() => handleDelete(memory._id)}
              />
            ))}
          </div>

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <AddMemoryForm
              onSave={handleAddMemory}
              onClose={() => {
                setIsModalOpen(false);
                setEditMemoryId(null);
              }}
              editMemoryId={editMemoryId}
              memories={memories}
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default App;
