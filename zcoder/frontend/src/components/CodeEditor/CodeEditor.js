// CodeEditor.js - Enhanced with Theme Support and Bug Fixes

import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import AceEditor from 'react-ace';
import axios from 'axios';

// Import modes
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';

// Import themes
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';

// Import extensions
import 'ace-builds/src-noconflict/ext-language_tools';

import './CodeEditor.css';

const CodeEditor = () => {
    const currentTheme = useSelector((state) => state.theme?.currentTheme || 'light');
    const editorRef = useRef(null);
    
    // State management
    const [language, setLanguage] = useState('java');
    const [code, setCode] = useState(getDefaultCode('java'));
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aceTheme, setAceTheme] = useState(currentTheme === 'dark' ? 'monokai' : 'github');

    // Default code templates
    function getDefaultCode(lang) {
        const templates = {
            java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
            python: `print("Hello, World!")`,
            c_cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
        };
        return templates[lang] || '';
    }

    // Handle language change
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        setCode(getDefaultCode(newLanguage));
        setOutput('');
    };

    // Handle code change
    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    // Handle theme change
    const handleThemeChange = (event) => {
        setAceTheme(event.target.value);
    };

    // Handle run code
    const handleRunCode = async () => {
        if (!code.trim()) {
            setOutput('Error: Please enter some code to execute.');
            return;
        }

        setIsLoading(true);
        setOutput('');

        try {
            // You may need to adjust this endpoint based on your backend setup
            const response = await axios.post('/api/code/execute', { 
                language, 
                code 
            });
            
            if (response.data.output) {
                setOutput(response.data.output);
            } else if (response.data.error) {
                setOutput(`Error: ${response.data.error}`);
            } else {
                setOutput('Code executed successfully (no output)');
            }
        } catch (error) {
            console.error('Error executing code:', error);
            if (error.response) {
                setOutput(`Server Error: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                setOutput('Network Error: Unable to connect to the server. Please check if your backend is running.');
            } else {
                setOutput(`Error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Clear output
    const clearOutput = () => {
        setOutput('');
    };

    // Handle editor load
    const onEditorLoad = (editor) => {
        editor.setFontSize(16);
        editor.getSession().setUseWrapMode(true);
        editor.focus();
    };

    return (
        <div className="code-editor-container">
            <div className="editor-wrapper">
                <div className="editor-controls">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <select value={language} onChange={handleLanguageChange}>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="c_cpp">C++</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                        
                        <div className="theme-selector">
                            <label>Theme:</label>
                            <select value={aceTheme} onChange={handleThemeChange}>
                                <option value="monokai">Dark</option>
                                <option value="tomorrow">Light</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        className="run-button" 
                        onClick={handleRunCode}
                        disabled={isLoading}
                    >
                        {isLoading && <div className="loading-spinner"></div>}
                        {isLoading ? 'Running...' : '▶ Run Code'}
                    </button>
                </div>

                <div className="ace-editor-wrapper">
                    <AceEditor
                        ref={editorRef}
                        mode={language}
                        theme={aceTheme}
                        onChange={handleCodeChange}
                        onLoad={onEditorLoad}
                        value={code}
                        name="code-editor"
                        width="100%"
                        height="100%"
                        fontSize={16}
                        showPrintMargin={true}
                        showGutter={true}
                        highlightActiveLine={true}
                        editorProps={{ 
                            $blockScrolling: true,
                            $useWorker: false
                        }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 4,
                            useWorker: false
                        }}
                        placeholder="Start typing your code here..."
                    />
                </div>
            </div>

            <div className="output-wrapper">
                <div className="output-header">
                    <label>Output</label>
                    <button className="clear-output" onClick={clearOutput}>
                        Clear
                    </button>
                </div>
                <div className={`output-content ${isLoading ? 'loading' : ''} ${output.startsWith('Error') ? 'error' : 'success'}`}>
                    {isLoading ? (
                        <div>
                            <div className="loading-spinner"></div>
                            Executing code...
                        </div>
                    ) : (
                        output
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
