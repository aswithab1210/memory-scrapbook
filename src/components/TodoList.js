import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTodoId, setEditTodoId] = useState(null);


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


    const saveTodo = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            if (isEditMode) {
                await axios.put('/.netlify/functions/todos', { id: editTodoId, text, completed: false });
            } else 
            {
                await axios.post('/.netlify/functions/todos', { text });
            }
            setText('');
            fetchTodos();
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditTodoId(null);
        } catch (error) {
            console.error('Error saving todo:', error);
            setError('An error occurred while saving the todo.');
        } finally {
            setLoading(false);
        }
    };


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


    const editTodo = (id, currentText) => {
        setIsEditMode(true);
        setEditTodoId(id);
        setText(currentText);
        setIsModalOpen(true);
    };


    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl mb-4 font-bold text-center">My To-Do List</h1>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="flex justify-center mb-6">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => setIsModalOpen(true)}
                >
                    Add New Todo
                </button>
            </div>




            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl mb-4">{isEditMode ? 'Edit Todo' : 'Add a New Todo'}</h2>
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={saveTodo}
                            >
                                {isEditMode ? 'Save Changes' : 'Add'}
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {todos.map(todo => (
                    <div key={todo._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex justify-between items-center">
                            <span
                                onClick={() => toggleTodo(todo._id, todo.completed)}
                                className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
                            >
                                {todo.text}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    className="text-yellow-500 hover:text-yellow-600"
                                    onClick={() => editTodo(todo._id, todo.text)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => deleteTodo(todo._id)}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList;
