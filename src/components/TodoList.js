import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');

    const fetchTodos = async () => {
        const res = await axios.get('/.netlify/functions/todos');
        setTodos(res.data);
    };

    const addTodo = async () => {
        if (!text.trim()) return;
        await axios.post('/.netlify/functions/todos', { text });
        setText('');
        fetchTodos();
    };

    const toggleTodo = async (id, completed) => {
        await axios.put('/.netlify/functions/todos', { id, completed: !completed });
        fetchTodos();
    };

    const deleteTodo = async (id) => {
        await axios.delete(`/.netlify/functions/todos?id=${id}`);
        fetchTodos();
    };

    useEffect(() => { fetchTodos(); }, []);

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl mb-4">My To-Do List</h1>
            <div className="flex mb-2">
                <input
                    className="border p-2 flex-grow"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="New Task"
                />
                <button className="bg-blue-500 text-white px-4" onClick={addTodo}>Add</button>
            </div>
            <ul>
                {todos.map(todo => (
                    <li key={todo._id} className="flex justify-between items-center mb-2">
                        <span
                            onClick={() => toggleTodo(todo._id, todo.completed)}
                            className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
                        >
                            {todo.text}
                        </span>
                        <button className="text-red-500" onClick={() => deleteTodo(todo._id)}>X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
