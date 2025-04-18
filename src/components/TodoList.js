import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTodoId, setEditTodoId] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // assume there are more at first

    const fetchTodos = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/.netlify/functions/todos?page=${page}`);
            if (page === 1) {
                setTodos(res.data);
            } else {
                setTodos(prev => [...prev, ...res.data]);
            }
            if (res.data.length === 0) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
            setError('An error occurred while fetching todos.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveTodo = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const todoData = { text, image };

            if (isEditMode) {
                await axios.put('/.netlify/functions/todos', { id: editTodoId, ...todoData, completed: false });
            } else {
                await axios.post('/.netlify/functions/todos', todoData);
            }

            setText('');
            setImage(null);
            setImagePreview(null); 

            setIsModalOpen(false);
            setIsEditMode(false);
            setEditTodoId(null);
            setPage(1);    // Reset to page 1 on change
            setHasMore(true);
            fetchTodos(1);
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
            setPage(1);    // Reset to first page
            setHasMore(true);
            fetchTodos(1);
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
            setPage(1);    // Reset to first page
            setHasMore(true);
            fetchTodos(1);
        } catch (error) {
            console.error('Error deleting todo:', error);
            setError('An error occurred while deleting the todo.');
        } finally {
            setLoading(false);
        }
    };

    const editTodo = (id, currentText, currentImage) => {
        setIsEditMode(true);
        setEditTodoId(id);
        setText(currentText);
        setImage(currentImage);
        setImagePreview(currentImage);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchTodos(page);
    }, [page]);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl mb-4 font-bold text-center">My To-Do List</h1>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Add New Todo Button */}
            <div className="fixed bottom-4 right-4 sm:relative sm:bottom-auto sm:right-auto sm:mb-6 sm:flex sm:justify-center">
                <button
                    className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition sm:px-4 sm:py-2 sm:rounded sm:bg-blue-500"
                    onClick={() => {
                        setText('');
                        setImage(null);
                        setImagePreview(null);
                        setIsEditMode(false);
                        setIsModalOpen(true);
                    }}
                >
                    <FaPlus className="sm:hidden text-2xl" />
                    <span className="hidden sm:block">Add New Memory</span>
                </button>
            </div>

            {/* Modal for Adding/Editing Todo */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl mb-4">{isEditMode ? 'Edit The Memory' : 'Add a New Memory'}</h2>

                        <div className="flex flex-col gap-2 mb-2">
                            <input
                                className="border p-2"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="New Task"
                            /> 
                            <input
                                type="file"
                                accept="image/*"
                                className="border p-2"
                                onChange={handleImageChange}
                            /> 
                            <input
                                type="text"
                                className="border p-2"
                                placeholder="or paste Image URL"
                                onChange={(e) => {
                                    setImage(e.target.value);
                                    setImagePreview(e.target.value);
                                }}
                                value={image && !image.startsWith('data:') ? image : ''}
                            />
                            
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mt-2 rounded w-full h-48 object-cover"
                                />
                            )}
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

            {/* Todo List Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {todos.map(todo => (
                    <div key={todo._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex flex-col">
                            <img
                                src={todo.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHURB9ii8O885EHuKuUJOLPmU270GbnAVHJQ&s"}
                                alt="Todo"
                                className="rounded mb-2 w-full h-48 object-cover"
                            />
                            <div className="flex flex-col">
                                <span
                                    onClick={() => toggleTodo(todo._id, todo.completed)}
                                    className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
                                >
                                    {todo.text}
                                </span>
                                <div className="flex justify-center gap-2 mt-2">
                                    <button
                                        className="text-yellow-500 hover:text-yellow-600"
                                        onClick={() => editTodo(todo._id, todo.text, todo.image)}
                                    >
                                        <FaEdit className="text-yellow-500" />
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => deleteTodo(todo._id)}
                                    >
                                        <FaTrash className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-4">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoList;
