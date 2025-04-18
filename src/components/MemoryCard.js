import React from "react";

const MemoryCard = ({ memory, onEdit, onDelete }) => {
  if (!memory) {
    return (
      <div className="p-4 bg-red-500 text-white rounded shadow">
        Memory not available.
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-4 w-80 text-black hover:shadow-blue-500 transition-all duration-300 ease-in-out flex flex-col justify-between">
      
      {/* Display image if available */}
      {memory.image && (
        <img
          src={memory.image}
          alt={memory.title}
          className="rounded-lg mb-3 object-cover h-40 w-full"
        />
      )}

      {/* Memory title */}
      <h3 className="text-xl font-bold mb-1 break-words">
        {memory.title}
      </h3>

      {/* Memory description */}
      <p className="text-gray-200 text-sm mb-2 break-words">
        {memory.description}
      </p>

      {/* Memory category */}
      <span className="text-xs uppercase tracking-wider bg-blue-500 text-white px-2 py-1 rounded-full mb-3 self-start">
        {memory.category}
      </span>

      {/* Action buttons for Edit & Delete */}
      <div className="flex justify-end gap-3 mt-auto">
        <button
          onClick={() => onEdit(memory._id)}  // Pass MongoDB ID to edit
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(memory._id)} // Pass MongoDB ID to delete
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MemoryCard;
