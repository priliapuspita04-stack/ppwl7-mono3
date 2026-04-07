import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultApp from './App2';
import ClassroomApp from './App3';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultApp />} />
        <Route path="/classroom" element={<ClassroomApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;