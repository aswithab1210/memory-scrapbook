import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
    const [isEditMode, setIsEditMode] = useState(false); // Check if it's in edit mode
    const [editTodoId, setEditTodoId] = useState(null); // Store the ID of the todo being edited

    // Fetch todos from the backend
    const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/.netlify/functions/todos');
            setTodos(res.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
            setError('An error occurred while fetching todos.');
        } finally {
            setLoading(false);
        }
    };

    // Add or update a todo
    const saveTodo = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            if (isEditMode) {
                // Update an existing todo
                await axios.put('/.netlify/functions/todos', { id: editTodoId, text, completed: false }); // Include the text
            } else {
                // Add a new todo
                await axios.post('/.netlify/functions/todos', { text });
            }
            setText('');
            fetchTodos();
            setIsModalOpen(false); // Close the modal after saving
            setIsEditMode(false); // Reset edit mode
            setEditTodoId(null); // Reset edit todo ID
        } catch (error) {
            console.error('Error saving todo:', error);
            setError('An error occurred while saving the todo.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle todo completion status
    const toggleTodo = async (id, completed) => {
        setLoading(true);
        try {
            await axios.put('/.netlify/functions/todos', { id, completed: !completed });
            fetchTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
            setError('An error occurred while toggling the todo.');
        } finally {
            setLoading(false);
        }
    };

    // Delete a todo
    const deleteTodo = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/.netlify/functions/todos?id=${id}`);
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
            setError('An error occurred while deleting the todo.');
        } finally {
            setLoading(false);
        }
    };

    // Open the modal in edit mode
    const editTodo = (id, currentText) => {
        setIsEditMode(true);
        setEditTodoId(id);
        setText(currentText);
        setIsModalOpen(true);
    };

    // UseEffect to fetch todos when component mounts
    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-xl">
            <h1 className="text-4xl text-white text-center mb-6 font-bold tracking-wide">My Futuristic To-Do List</h1>

            {/* Display loading state */}
            {loading && <p className="text-white text-center">Loading...</p>}

            {/* Display error if there's one */}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Button to open modal */}
            <button
                className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg focus:outline-none mb-6 transform transition duration-300 hover:scale-105"
                onClick={() => setIsModalOpen(true)}
            >
                Add New Todo
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 backdrop-blur-lg bg-opacity-30">
                        <h2 className="text-xl text-white mb-4 text-center">{isEditMode ? 'Edit Todo' : 'Add a New Todo'}</h2>
                        <div className="flex mb-4">
                            <input
                                className="border border-gray-400 p-2 w-full rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter your task"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg focus:outline-none"
                                onClick={saveTodo}
                            >
                                {isEditMode ? 'Save Changes' : 'Add'}
                            </button>
                            <button
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg focus:outline-none"
                                onClick={() => setIsModalOpen(false)} // Close modal
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render todo list */}
            <div className="space-y-6">
                {todos.map(todo => (
                    <div key={todo._id} className="bg-gradient-to-r from-blue-400 to-purple-600 p-4 rounded-xl shadow-lg flex justify-between items-center hover:scale-105 transform transition duration-300">
                        <span
                            onClick={() => toggleTodo(todo._id, todo.completed)}
                            className={`cursor-pointer text-white text-lg ${todo.completed ? 'line-through text-gray-400' : 'hover:text-yellow-300'}`}
                        >
                            {todo.text}
                        </span>
                        <div className="flex space-x-4">
                            <button
                                className="text-yellow-500 hover:text-yellow-300"
                                onClick={() => editTodo(todo._id, todo.text)} // Edit button
                            >
                                ✎
                            </button>
                            <button
                                className="text-red-500 hover:text-red-300"
                                onClick={() => deleteTodo(todo._id)} // Delete button
                            >
                                ✘
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList;
