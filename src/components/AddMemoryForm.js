import React, { useState, useEffect } from "react";

const AddMemoryForm = ({ onSave, onClose, editMemoryId, memories }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const categories = ["Vacation", "Family", "Work"];

  // If in edit mode, load the memory details
  useEffect(() => {
    if (editMemoryId) {
      const memory = memories.find((memory) => memory._id === editMemoryId);
      if (memory) {
        setTitle(memory.title);
        setDescription(memory.description);
        setCategory(memory.category);
        setImage(memory.image); // Assume image is stored in base64 format
      }
    }
  }, [editMemoryId, memories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category) {
      setError("Title and Category are required.");
      return;
    }

    const newMemory = { title, description, category, image };

    // If editing, use PUT request logic, otherwise use POST for new memory
    if (editMemoryId) {
      newMemory.id = editMemoryId; // Include memory ID for updates
      onSave("PUT", newMemory); // Send PUT request for editing
    } else {
      onSave("POST", newMemory); // Send POST request for new memory
    }

    // Clear form and close modal
    setTitle("");
    setDescription("");
    setCategory("");
    setImage(null);
    setError("");
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-4">
          {editMemoryId ? "Edit Memory" : "Add Memory"}
        </h2>
        {error && (
          <div className="bg-red-500 text-white p-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Image
            </label>
            <input
              type="file"
              id="image"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              onChange={handleImageUpload}
            />
            {/* Display the image preview if there's an uploaded image */}
            {image && (
              <img
                src={image}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover"
              />
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {editMemoryId ? "Save Changes" : "Add Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryForm;
