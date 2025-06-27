import React from 'react';
import Background from './components/Background';
import './components/Background.css';
import ResearchTimeline from './components/ResearchTimeline';
import './components/ResearchTimeline.css';
import './App.css';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Background/>
      <ResearchTimeline />
      <Footer />
    </div>
  );
}

export default App;