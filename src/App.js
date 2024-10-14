import './App.css';
import Graph from "react-graph-vis";
import React, { useState } from "react";

const DEFAULT_PARAMS = {
  "model": "claude-3-opus-20240229",
  "max_tokens": 800,
  "temperature": 0.3
}

const SELECTED_PROMPT = "STATELESS"

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#34495e"
  }
};

function App() {

  const [graphState, setGraphState] = useState({
    nodes: [],
    edges: []
  });

  const clearState = () => {
    setGraphState({
      nodes: [],
      edges: []
    })
  };

  const updateGraph = (updates) => {
    // ... (keep the updateGraph function as is)
  };

  const queryStatelessPrompt = (prompt, apiKey) => {
    fetch('prompts/stateless.prompt')
      .then(response => response.text())
      .then(text => text.replace("$prompt", prompt))
      .then(prompt => {
        console.log(prompt)

        const params = { 
          ...DEFAULT_PARAMS, 
          messages: [
            { role: "user", content: prompt }
          ]
        };

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': String(apiKey),
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(params)
        };
        fetch('https://api.anthropic.com/v1/messages', requestOptions)
          .then(response => {
            if (!response.ok) {
              switch (response.status) {
                case 401:
                  throw new Error('Please double-check your API key.');
                case 429:
                  throw new Error('You exceeded your current quota, please check your plan and billing details.');
                default:
                  throw new Error('Something went wrong with the request, please check the Network log');
              }
            }
            return response.json();
          })
          .then((response) => {
            const text = response.content[0].text;
            console.log(text);

            const updates = JSON.parse(text);
            console.log(updates);

            updateGraph(updates);

            document.getElementsByClassName("searchBar")[0].value = "";
            document.body.style.cursor = 'default';
            document.getElementsByClassName("generateButton")[0].disabled = false;
          }).catch((error) => {
            console.log(error);
            alert(error);
          });
      })
  };

  const queryStatefulPrompt = (prompt, apiKey) => {
    fetch('prompts/stateful.prompt')
      .then(response => response.text())
      .then(text => text.replace("$prompt", prompt))
      .then(text => text.replace("$state", JSON.stringify(graphState)))
      .then(prompt => {
        console.log(prompt)

        const params = { 
          ...DEFAULT_PARAMS, 
          messages: [
            { role: "user", content: prompt }
          ]
        };

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': String(apiKey),
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(params)
        };
        fetch('https://api.anthropic.com/v1/messages', requestOptions)
          .then(response => {
            if (!response.ok) {
              switch (response.status) {
                case 401:
                  throw new Error('Please double-check your API key.');
                case 429:
                  throw new Error('You exceeded your current quota, please check your plan and billing details.');
                default:
                  throw new Error('Something went wrong with the request, please check the Network log');
              }
            }
            return response.json();
          })
          .then((response) => {
            const text = response.content[0].text;
            console.log(text);

            const new_graph = JSON.parse(text);

            setGraphState(new_graph);

            document.getElementsByClassName("searchBar")[0].value = "";
            document.body.style.cursor = 'default';
            document.getElementsByClassName("generateButton")[0].disabled = false;
          }).catch((error) => {
            console.log(error);
            alert(error);
          });
      })
  };

  const queryPrompt = (prompt, apiKey) => {
    if (SELECTED_PROMPT === "STATELESS") {
      queryStatelessPrompt(prompt, apiKey);
    } else if (SELECTED_PROMPT === "STATEFUL") {
      queryStatefulPrompt(prompt, apiKey);
    } else {
      alert("Please select a prompt");
      document.body.style.cursor = 'default';
      document.getElementsByClassName("generateButton")[0].disabled = false;
    }
  }

  const createGraph = () => {
    document.body.style.cursor = 'wait';

    document.getElementsByClassName("generateButton")[0].disabled = true;
    const prompt = document.getElementsByClassName("searchBar")[0].value;
    const apiKey = document.getElementsByClassName("apiKeyTextField")[0].value;

    queryPrompt(prompt, apiKey);
  }

  return (
    <div className='container'>
      <h1 className="headerText">GraphGPT with Claude 🔎</h1>
      <p className='subheaderText'>Build complex, directed graphs to add structure to your ideas using natural language. Understand the relationships between people, systems, and maybe solve a mystery.</p>
      <p className='opensourceText'><a href="https://github.com/varunshenoy/graphgpt">GraphGPT is open-source</a>&nbsp;🎉</p>
      <center>
        <div className='inputContainer'>
          <input className="searchBar" placeholder="Describe your graph..."></input>
          <input className="apiKeyTextField" type="password" placeholder="Enter your Anthropic API key..."></input>
          <button className="generateButton" onClick={createGraph}>Generate</button>
          <button className="clearButton" onClick={clearState}>Clear</button>
        </div>
      </center>
      <div className='graphContainer'>
        <Graph graph={graphState} options={options} style={{ height: "640px" }} />
      </div>
      <p className='footer'>Pro tip: don't take a screenshot! You can right-click and save the graph as a .png  📸</p>
    </div>
  );
}

export default App;
