import { Routes, Route } from 'react-router-dom';
import { Toolbox } from './components/Toolbox';
import { ToolPage } from './components/ToolPage';

function App() {
  const handleSelectTool = (toolId: string) => {
    window.location.href = `/tool/${toolId}`;
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Toolbox onSelectTool={handleSelectTool} />} />
        <Route path="/tool/:toolId" element={<ToolPage />} />
      </Routes>
    </div>
  );
}

export default App;
