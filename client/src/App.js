import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

const Calls = {
  "Short Call (5ms)": 'shortCall',
  "Long Call (10ms)": 'longCall',
  "Heavy Call": 'heavyCall',
};

function App() {
  const [calls, setCalls] = useState([]);

  async function handleCall(endpoint) {
    const idx_guid = uuidv4();

    setCalls(prevCalls => {
      const newCalls = [...prevCalls];
      newCalls.push({ idx_guid, endpoint, starTime: new Date() });
      return newCalls;
    });

    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "accepts": "application/json"
      }
    };
    return await fetch(endpoint, settings)
      .then(res => res.text())
      .then(text => {
        setCalls(prevCalls => {
          const newCalls = [...prevCalls];
          const idx = newCalls.findIndex(call => call.idx_guid === idx_guid);
          newCalls[idx] = { ...newCalls[idx], endTime: new Date(), result: text };
          return newCalls;
        });
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => handleCall(Calls['Short Call (5ms)'])}>Short Call (5ms)</button>
        <button onClick={() => handleCall(Calls['Long Call (10ms)'])}>Long Call (10ms)</button>
        <button onClick={() => handleCall(Calls['Heavy Call'])}>Heavy Call</button>
      </header>
      <body>
        <div>
          <table>
            <tr>
              <th>Call</th>
              <th>Duration</th>
              <th>Server Response</th>
            </tr>
            {calls.map((call, idx) => (
              <tr key={idx}>
                <td>{call.endpoint}</td>
                <td>{call.endTime ? call.endTime - call.starTime : 'In Progress'}</td>
                <td>{call.result}</td>
              </tr>
            ))}
          </table>
        </div>
      </body>
    </div>
  );
}

export default App;
