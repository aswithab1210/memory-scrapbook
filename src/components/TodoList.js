import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

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

    // Add a new todo
    const addTodo = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            await axios.post('/.netlify/functions/todos', { text });
            setText('');
            fetchTodos();
            setIsModalOpen(false); // Close the modal after adding
        } catch (error) {
            console.error('Error adding todo:', error);
            setError('An error occurred while adding the todo.');
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

    // UseEffect to fetch todos when component mounts
    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl mb-4">My To-Do List</h1>

            {/* Display loading state */}
            {loading && <p>Loading...</p>}

            {/* Display error if there's one */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Button to open modal */}
            <button
                className="bg-blue-500 text-white px-4 py-2 mb-4"
                onClick={() => setIsModalOpen(true)}
            >
                Add New Todo
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl mb-4">Add a New Todo</h2>
                        <div className="flex mb-2">
                            <input
                                className="border p-2 flex-grow"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="New Task"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-blue-500 text-white px-4 py-2"
                                onClick={addTodo}
                            >
                                Add
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2"
                                onClick={() => setIsModalOpen(false)} // Close modal
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render todo list */}
            <div className="grid grid-cols-1 gap-4">
                {todos.map(todo => (
                    <div key={todo._id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center">
                            <span
                                onClick={() => toggleTodo(todo._id, todo.completed)}
                                className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
                            >
                                {todo.text}
                            </span>
                            <button className="text-red-500" onClick={() => deleteTodo(todo._id)}>X</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList;
