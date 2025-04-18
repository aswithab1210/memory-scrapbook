import React from 'react';
import TodoList from './components/TodoList';
import TopNav from './components/TopNav';

function App() {
  return (
    <div className="App">
      <div>
        <TopNav/>
      </div>
      <div>
        <TodoList />
      </div>
    </div>
  );
}

export default App;
