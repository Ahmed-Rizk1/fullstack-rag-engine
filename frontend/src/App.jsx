import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Settings, ChevronDown, Paperclip, Sparkles, ArrowRight, Expand, X, Loader2, ArrowUp, Zap, FileText } from 'lucide-react';
import './index.css';

function App() {
  const [projectId, setProjectId] = useState('1');
  const [fileId, setFileId] = useState(localStorage.getItem('minirag_file_id') || '');
  const [fileName, setFileName] = useState(localStorage.getItem('minirag_file_name') || '');
  
  const [uploadStatus, setUploadStatus] = useState({ state: 'idle', msg: '' }); 
  const [processStatus, setProcessStatus] = useState({ state: 'idle', msg: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome. I am ready to analyze your documents. Upload a file below to begin.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [chunkSize, setChunkSize] = useState(500);
  const [overlapSize, setOverlapSize] = useState(50);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, uploadStatus, processStatus]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFileName(uploadedFile.name);
    setUploadStatus({ state: 'loading', msg: `Uploading ${uploadedFile.name}...` });
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const response = await axios.post(`/api/v1/data/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data?.file_id) {
        setFileId(response.data.file_id);
        localStorage.setItem('minirag_file_id', response.data.file_id);
        localStorage.setItem('minirag_file_name', uploadedFile.name);
        setUploadStatus({ state: 'success', msg: 'File uploaded.' });
      }
    } catch (err) {
      setUploadStatus({ state: 'error', msg: 'Upload failed.' });
    }
  };

  const handleProcess = async () => {
    if (!fileId) return;
    setProcessStatus({ state: 'loading', msg: 'Vectorizing document...' });
    setIsSettingsOpen(false);
    
    try {
      await axios.post(`/api/v1/data/process-and-push/${projectId}`, {
        file_id: fileId,
        chunk_size: parseInt(chunkSize),
        overlap_size: parseInt(overlapSize),
        do_reset: 1
      });
      
      setProcessStatus({ state: 'success', msg: 'Ingestion started. You can chat now.' });
    } catch (err) {
      setProcessStatus({ state: 'error', msg: 'Ingestion failed.' });
    }
  };

  const handleSendMessage = async (e, forceText = null) => {
    if (e) e.preventDefault();
    const textToSend = forceText || inputVal;
    if (!textToSend.trim()) return;

    setInputVal('');
    const curTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      const response = await axios.post(`/api/v1/nlp/index/answer/${projectId}`, {
        text: textToSend,
        limit: 3
      });
      
      if (response.data && response.data.answer) {
        setMessages(prev => [...prev, { role: 'bot', text: response.data.answer, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to backend.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: 'Chat cleared. Session reset.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setFileId('');
    setFileName('');
    localStorage.removeItem('minirag_file_id');
    localStorage.removeItem('minirag_file_name');
  };

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <Sparkles size={18} className="icon-blue" />
          <span>New AI chat</span>
          <ChevronDown size={16} color="#9ca3af" />
        </div>
        
        <div className="header-center">
          <span>{isDarkMode ? 'Dark' : 'Personalize'}</span>
          <div className={`toggle-switch ${!isDarkMode ? 'off' : ''}`} onClick={() => setIsDarkMode(!isDarkMode)}>
            <div className="toggle-knob"></div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="Settings">
            <Settings size={18} />
          </button>
          <button className="icon-btn" onClick={toggleFullscreen} title="Toggle Fullscreen"><Expand size={18} /></button>
          <button className="icon-btn" onClick={clearChat} title="Clear Session"><X size={18} /></button>
        </div>
      </header>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="settings-panel">
          <h3><Settings size={16} /> Advanced Setup</h3>
          
          <div className="input-field">
            <label>Project ID</label>
            <input type="number" value={projectId} onChange={e => setProjectId(e.target.value)} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="input-field">
              <label>Chunk Size</label>
              <input type="number" value={chunkSize} onChange={e => setChunkSize(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Overlap</label>
              <input type="number" value={overlapSize} onChange={e => setOverlapSize(e.target.value)} />
            </div>
          </div>
          
          <button 
            className="process-btn" 
            onClick={handleProcess}
            disabled={!fileId || processStatus.state === 'loading'}
          >
            {processStatus.state === 'loading' ? 'Processing...' : 'Process & Vectorize Document'}
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="chat-body" onClick={() => isSettingsOpen && setIsSettingsOpen(false)}>
        {fileName && (
          <div className="doc-chip">
            <FileText size={18} className="icon-blue" />
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
               <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Active Document</span>
               <span>{fileName}</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="bot-header">
                <span style={{ color: '#6b7280' }}>•</span>
                <span>Mini-RAG Response</span>
                <span className="timestamp">{msg.time}</span>
              </div>
            )}
            
            <div style={{ paddingLeft: msg.role === 'bot' ? '16px' : '0', borderLeft: msg.role === 'bot' ? '2px solid #e5e7eb' : 'none' }}>
               {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="message bot">
              <div className="bot-header">
                <span style={{ color: '#6b7280' }}>•</span>
                <span>Getting detailed response...</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area-wrapper">
        <div className="input-box">
          
          {/* Upload Status Indication */}
          {uploadStatus.msg && uploadStatus.state !== 'idle' && (
             <div className="file-upload-indicator">
                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  {uploadStatus.state === 'loading' && <Loader2 size={14} className="animate-spin" />}
                  {uploadStatus.msg}
                </span>
                <X size={14} className="close-btn" onClick={() => setUploadStatus({state: 'idle', msg: ''})} />
             </div>
          )}

           {/* Process Status Indication */}
           {processStatus.msg && processStatus.state !== 'idle' && (
             <div className="file-upload-indicator" style={{ background: '#f0fdf4', color: '#166534', borderBottom: '1px solid #dcfce7' }}>
                <span>{processStatus.msg}</span>
                <X size={14} className="close-btn" onClick={() => setProcessStatus({state: 'idle', msg: ''})} />
             </div>
          )}

          {/* Suggestions - Visible when no input */}
          {!inputVal && messages.length < 3 && (
            <div className="suggestions">
              <div className="suggestion-item" onClick={() => handleSendMessage(null, "Summarize this document")}>
                <ArrowRight size={14} className="suggestion-icon"/> Summarize this document
              </div>
              <div className="suggestion-item" onClick={() => handleSendMessage(null, "What are the key findings?")}>
                <ArrowRight size={14} className="suggestion-icon"/> What are the key findings?
              </div>
              <div className="suggestion-item" onClick={() => handleSendMessage(null, "Extract the main actionable items")}>
                <ArrowRight size={14} className="suggestion-icon"/> Extract the main actionable items
              </div>
            </div>
          )}
          
          <form className="input-row" onSubmit={e => handleSendMessage(e, null)}>
            <div className="action-elements">
              <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload Document">
                <Paperclip size={18} />
              </button>
              <input type="file" className="hidden-file-input" ref={fileInputRef} onChange={handleFileUpload} />
              
              <div className="model-badge">
                <Zap size={14} className="icon-blue" />
                Mini-RAG 1.0
              </div>
            </div>
            
            <input 
              type="text" 
              placeholder="Ask AI anything about the document..." 
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            
            <button type="submit" className="send-btn" disabled={!inputVal.trim() && !isTyping}>
              <ArrowUp size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;

