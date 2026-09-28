import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateSnippet from './pages/CreateSnippet';
import BrowseSnippets from './pages/BrowseSnippets';
import ViewSnippet from './pages/ViewSnippet';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateSnippet />} />
            <Route path="/snippets" element={<BrowseSnippets />} />
            <Route path="/s/:id" element={<ViewSnippet />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
