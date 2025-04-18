import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { FaPlus, FaList, FaFileExport } from "react-icons/fa";

const Sidebar = ({ onCategoryChange, setIsModalOpen }) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [todos, setTodos] = useState([]); // Storing fetched todos
  const categories = ["All Categories", "Family", "Work", "Vacation"];

  const listItemClass =
    "py-2 px-4 text-white cursor-pointer hover:bg-blue-600 rounded-md flex items-center gap-2";

  // Fetch todos when component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("/.netlify/functions/todos"); // Adjust URL if necessary
        if (!response.ok) {
          throw new Error(`Error fetching todos: ${response.statusText}`);
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  const handleExport = async () => {
    try {
      // Assuming we're working with todos data already fetched
      if (!Array.isArray(todos) || todos.length === 0) {
        alert("No data to export.");
        return;
      }

      const csv = Papa.unparse(
        todos.map(({ _id, title, category, description }) => ({
          ID: _id,
          Title: title,
          Category: category,
          Description: description
        }))
      );

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "todos_export.csv";
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Error exporting todos. Check console for details.");
    }
  };

  // Function to add new todo/memory
  const handleAddTodo = async (newTodo) => {
    try {
      const response = await fetch("/.netlify/functions/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (!response.ok) {
        throw new Error("Error adding todo.");
      }

      // Refresh todos list
      const newTodoData = await response.json();
      setTodos((prevTodos) => [...prevTodos, newTodoData]);
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo.");
    }
  };

  return (
    <>
      {/* Large screen sidebar */}
      <div className="w-64 h-full bg-gray-800 text-white p-6 space-y-6 hidden sm:block">
        {/* Add Todo */}
        <div className={listItemClass} onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Todo
        </div>

        {/* Categories Toggle */}
        <div>
          <div
            className={`${listItemClass} justify-between`}
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <span className="flex items-center gap-2">
              <FaList /> Categories
            </span>
            <span>{isCategoriesOpen ? "−" : "+"}</span>
          </div>

          {isCategoriesOpen && (
            <ul className="mt-2 space-y-2">
              {categories.map((category) => (
                <li
                  key={category}
                  className={listItemClass}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Export Button */}
        <div className={listItemClass} onClick={handleExport}>
          <FaFileExport /> Export Todos
        </div>
      </div>

      {/* Bottom navigation for smaller screens */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-10 shadow-md">
        <button className={listItemClass} onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Todo
        </button>

        <button
          className={listItemClass}
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
        >
          <FaList /> Categories
        </button>

        <button className={listItemClass} onClick={handleExport}>
          <FaFileExport /> Export Todos
        </button>

        {isCategoriesOpen && (
          <div className="absolute bottom-16 left-0 right-0 bg-gray-800 text-white p-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li
                  key={category}
                  className={listItemClass}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
