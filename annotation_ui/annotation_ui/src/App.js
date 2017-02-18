import React, { Component } from 'react';
import './App.css';
import ImgUploader from './components/ImgUploader';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Annotation UI</h2>
        </div>
        <ImgUploader />
      </div>
    );
  }
}

export default App;
