import Editor from './editor/Editor';
import useUIStore from './store/uiStore';
import './App.css';

function App() {
  const pageOrientation = useUIStore((s) => s.pageOrientation);

  return (
    <div className={`app ${pageOrientation}`}>
      <header className="app-header">
        <h1>📝 Document Editor</h1>
      </header>
      <main className="app-main">
        <Editor />
      </main>
    </div>
  );
}

export default App;
