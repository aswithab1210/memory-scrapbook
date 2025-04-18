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
    const [hasMore, setHasMore] = useState(true);

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
        } catch (err) {
            setError('Failed to fetch todos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos(page);
    }, [page]);

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
            setPage(1);
            setHasMore(true);
            fetchTodos(1);
        } catch (err) {
            setError('Error saving todo');
        } finally {
            setLoading(false);
        }
    };

    const deleteTodo = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/.netlify/functions/todos?id=${id}`);
            setPage(1);
            setHasMore(true);
            fetchTodos(1);
        } catch (err) {
            setError('Error deleting todo');
        } finally {
            setLoading(false);
        }
    };

    const toggleTodo = async (id, completed) => {
        setLoading(true);
        try {
            await axios.put('/.netlify/functions/todos', { id, completed: !completed });
            fetchTodos(1);
            setPage(1);
            setHasMore(true);
        } catch (err) {
            setError('Error toggling todo');
        } finally {
            setLoading(false);
        }
    };

    const editTodo = (id, text, image) => {
        setIsEditMode(true);
        setEditTodoId(id);
        setText(text);
        setImage(image);
        setImagePreview(image);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">My To-Do List</h1>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="fixed bottom-4 right-4 sm:static sm:mb-6 sm:flex sm:justify-center">
                <button
                    onClick={() => {
                        setText('');
                        setImage(null);
                        setImagePreview(null);
                        setIsEditMode(false);
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                >
                    <FaPlus className="inline mr-2" />
                    Add New Memory
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h2 className="text-xl mb-4">{isEditMode ? 'Edit Memory' : 'Add Memory'}</h2>
                        <input
                            type="text"
                            placeholder="Memory text"
                            className="border p-2 mb-2 w-full"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="border p-2 mb-2 w-full"
                            onChange={handleImageChange}
                        />
                        <input
                            type="text"
                            placeholder="Paste image URL"
                            className="border p-2 mb-2 w-full"
                            value={image && !image.startsWith('data:') ? image : ''}
                            onChange={(e) => {
                                setImage(e.target.value);
                                setImagePreview(e.target.value);
                            }}
                        />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="rounded mb-2 h-40 w-full object-cover" />}

                        <div className="flex justify-end gap-2">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={saveTodo}>
                                {isEditMode ? 'Update' : 'Add'}
                            </button>
                            <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                {todos.map(todo => (
                    <div key={todo._id} className="bg-white p-4 rounded shadow hover:shadow-lg">
                        <img
                            src={todo.image || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                            className="rounded mb-3 h-48 w-full object-cover"
                            alt="Todo"
                        />
                        <p
                            onClick={() => toggleTodo(todo._id, todo.completed)}
                            className={`cursor-pointer mb-2 ${todo.completed ? 'line-through text-gray-400' : ''}`}
                        >
                            {todo.text}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => editTodo(todo._id, todo.text, todo.image)}>
                                <FaEdit className="text-yellow-500" />
                            </button>
                            <button onClick={() => deleteTodo(todo._id)}>
                                <FaTrash className="text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoList;
