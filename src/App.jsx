import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  EyeOff, 
  Flag, 
  RotateCcw, 
  Home, 
  Play,
  Calendar,
  History,
  Trash2
} from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // History of interviews state
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prep_easy_history') || '[]');
    } catch {
      return [];
    }
  });

  // Interview Mode state variables
  const [activeTab, setActiveTab] = useState('study'); // 'study' or 'interview'
  const [interviewState, setInterviewState] = useState('setup'); // 'setup', 'active', 'results'
  const [studentName, setStudentName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluations, setEvaluations] = useState({}); // { [questionId]: 'correct' | 'incorrect' }
  const [showAnswerInInterview, setShowAnswerInInterview] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/questions?categoryId=${categoryId}`);
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Reset interview states when switching categories
    setActiveTab('study');
    setInterviewState('setup');
    setStudentName('');
    setCurrentQuestionIndex(0);
    setEvaluations({});
    setShowAnswerInInterview(false);
    fetchQuestions(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setExpandedQuestions({});
    // Reset interview states when going back
    setActiveTab('study');
    setInterviewState('setup');
    setStudentName('');
    setCurrentQuestionIndex(0);
    setEvaluations({});
    setShowAnswerInInterview(false);
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Interview Mode helper functions
  const startInterview = () => {
    if (!studentName.trim()) return;
    setEvaluations({});
    setCurrentQuestionIndex(0);
    setShowAnswerInInterview(false);
    setInterviewState('active');
  };

  const handleEvaluation = (questionId, status) => {
    setEvaluations(prev => ({
      ...prev,
      [questionId]: status
    }));
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswerInInterview(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswerInInterview(false);
    }
  };

  const endInterview = () => {
    const correctCount = Object.values(evaluations).filter(v => v === 'correct').length;
    const evaluatedCount = Object.keys(evaluations).filter(id => evaluations[id] === 'correct' || evaluations[id] === 'incorrect').length;
    const percentage = evaluatedCount > 0 ? Math.round((correctCount * 100) / evaluatedCount) : 0;

    const newRecord = {
      id: Date.now().toString(),
      studentName: studentName.trim(),
      categoryName: selectedCategory.name,
      correctCount,
      evaluatedCount,
      percentage,
      date: new Date().toLocaleDateString('uz-UZ', { 
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    };

    const updatedHistory = [newRecord, ...history].slice(0, 10);
    localStorage.setItem('prep_easy_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    setInterviewState('results');
  };

  const clearAllHistory = () => {
    if (window.confirm("Barcha suhbatlar tarixini o'chirishni xohlaysizmi?")) {
      localStorage.removeItem('prep_easy_history');
      setHistory([]);
    }
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem('prep_easy_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const resetInterview = () => {
    setInterviewState('setup');
    setStudentName('');
    setEvaluations({});
    setCurrentQuestionIndex(0);
    setShowAnswerInInterview(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo-text" onClick={handleBackToCategories}>PrepEasy</h1>
          <p className="subtitle-text">Master your technical interviews with ease</p>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {error && (
          <div className="alert-card error-card">
            <p><strong>Error:</strong> {error}</p>
            <button className="btn-retry" onClick={selectedCategory ? () => fetchQuestions(selectedCategory.id) : fetchCategories}>
              Retry Connection
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading content, please wait...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Category Grid View */}
            {!selectedCategory ? (
              <div className="view-categories animate-fade-in">
                <div className="section-title-container">
                  <h2>Choose a Topic</h2>
                  <p>Select a category to begin browsing interview questions and answers.</p>
                </div>

                {categories.length === 0 ? (
                  <div className="no-content-card">
                    <h3>No topics available</h3>
                    <p>The database has no categories yet. Head over to the admin panel to add some!</p>
                  </div>
                ) : (
                  <div className="category-grid">
                    {categories.map((cat) => (
                      <div 
                        className="category-card" 
                        key={cat.id} 
                        onClick={() => handleCategoryClick(cat)}
                      >
                        <div className="card-top-icon">
                          <span>{cat.name.charAt(0)}</span>
                        </div>
                        <h3 className="card-name">{cat.name}</h3>
                        <p className="card-meta">
                          {cat.questionCount} {cat.questionCount === 1 ? 'Question' : 'Questions'}
                        </p>
                        <span className="card-action">Start Studying &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent History Section */}
                {history.length > 0 && (
                  <div className="recent-history-section">
                    <div className="history-section-header">
                      <h3>
                        <History size={18} style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '8px' }} /> Oxirgi o'tkazilgan suhbatlar
                      </h3>
                      <button className="btn-clear-history" onClick={clearAllHistory}>
                        <Trash2 size={14} /> Tarixni tozalash
                      </button>
                    </div>

                    <div className="history-list">
                      {history.map((item) => (
                        <div className="history-item-card animate-fade-in" key={item.id}>
                          <div className="history-item-main">
                            <div className="history-item-student">
                              O'quvchi: <strong>{item.studentName}</strong>
                            </div>
                            <div className="history-item-meta">
                              <span className="meta-badge">Mavzu: <strong>{item.categoryName}</strong></span>
                              <span className="history-item-date">
                                <Calendar size={12} style={{ marginRight: '4px', display: 'inline-flex', verticalAlign: 'middle' }} /> {item.date}
                              </span>
                            </div>
                          </div>
                          
                          <div className="history-item-right">
                            <div className={`history-item-score ${
                              item.percentage >= 80 ? 'score-high' : 
                              item.percentage >= 50 ? 'score-medium' : 'score-low'
                            }`}>
                              {item.percentage}% ({item.correctCount}/{item.evaluatedCount})
                            </div>
                            <button className="btn-delete-item" onClick={() => deleteHistoryItem(item.id)} title="O'chirish">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Questions Accordion View / Interview View */
              <div className="view-questions animate-fade-in">
                <div className="navigation-bar">
                  <button className="btn-back" onClick={handleBackToCategories}>
                    &larr; Back to Topics
                  </button>
                  <div className="current-category-badge">
                    Topic: <strong>{selectedCategory.name}</strong>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className="no-content-card">
                    <h3>No questions found</h3>
                    <p>No questions have been added to this topic yet. Check back soon!</p>
                  </div>
                ) : (
                  <>
                    <div className="mode-tabs">
                      <button 
                        className={`tab-btn ${activeTab === 'study' ? 'active' : ''}`}
                        onClick={() => setActiveTab('study')}
                      >
                        <span className="tab-icon"><BookOpen size={16} /></span> O'rganish rejimi
                      </button>
                      <button 
                        className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('interview')}
                      >
                        <span className="tab-icon"><Users size={16} /></span> Suhbat rejimi
                      </button>
                    </div>

                    {activeTab === 'study' ? (
                      <div className="accordion-list">
                        <div className="section-title-container" style={{ marginBottom: '24px' }}>
                          <h2>Practice Questions</h2>
                          <p>Click on any question below to reveal its detailed answer model.</p>
                        </div>
                        {questions.map((q) => {
                          const isExpanded = !!expandedQuestions[q.id];
                          return (
                            <div 
                              className={`accordion-item ${isExpanded ? 'expanded' : ''}`}
                              key={q.id}
                            >
                              <button 
                                className="accordion-header" 
                                onClick={() => toggleQuestion(q.id)}
                                aria-expanded={isExpanded}
                              >
                                <span className="accordion-title">{q.questionText}</span>
                                <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
                              </button>
                              
                              <div className="accordion-collapse">
                                <div className="accordion-body">
                                  <p className="answer-text">{q.answerText}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="interview-container">
                        {interviewState === 'setup' && (
                          <div className="interview-card setup-card animate-fade-in">
                            <h3>Suhbatni boshlash</h3>
                            <p>Ushbu mavzu bo'yicha o'quvchi bilan jonli suhbat (savol-javob) o'tkazing va baholab boring.</p>
                            
                            <div className="form-group">
                              <label htmlFor="studentName">O'quvchining ismi va familiyasi:</label>
                              <input 
                                type="text"
                                id="studentName"
                                placeholder="Masalan: Eshmatov Toshmat"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="student-input"
                              />
                            </div>
                            
                            <button 
                              className="btn-primary start-btn" 
                              onClick={startInterview}
                              disabled={!studentName.trim()}
                            >
                              <Play size={16} style={{ marginRight: '8px' }} /> Suhbatni boshlash
                            </button>
                          </div>
                        )}

                        {interviewState === 'active' && (
                          <div className="interview-card active-card animate-fade-in">
                            <div className="interview-header">
                              <div className="student-info">
                                O'quvchi: <strong>{studentName}</strong>
                              </div>
                              <div className="question-counter">
                                Savol: <strong>{currentQuestionIndex + 1} / {questions.length}</strong>
                              </div>
                            </div>

                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill" 
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                              ></div>
                            </div>

                            <div className="interview-question-box">
                              <p className="interview-question-text">
                                {questions[currentQuestionIndex]?.questionText}
                              </p>
                            </div>

                            <div className="interview-answer-box">
                              <button 
                                className="btn-toggle-answer"
                                onClick={() => setShowAnswerInInterview(!showAnswerInInterview)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                {showAnswerInInterview ? (
                                  <>
                                    <EyeOff size={15} /> Javobni yashirish
                                  </>
                                ) : (
                                  <>
                                    <Eye size={15} /> Javobni ko'rsatish
                                  </>
                                )}
                              </button>
                              
                              {showAnswerInInterview && (
                                <div className="interview-answer-text animate-fade-in">
                                  <strong>Namuna javob:</strong>
                                  <p>{questions[currentQuestionIndex]?.answerText}</p>
                                </div>
                              )}
                            </div>

                            {/* Evaluation Status */}
                            <div className="evaluation-status-bar">
                              {evaluations[questions[currentQuestionIndex]?.id] === 'correct' && (
                                <span className="badge badge-success">
                                  <CheckCircle2 size={14} /> To'g'ri topildi deb belgilandi
                                </span>
                              )}
                              {evaluations[questions[currentQuestionIndex]?.id] === 'incorrect' && (
                                <span className="badge badge-error">
                                  <XCircle size={14} /> Noto'g'ri topildi deb belgilandi
                                </span>
                              )}
                            </div>

                            {/* Correct / Incorrect buttons */}
                            <div className="evaluation-controls">
                              <button 
                                className={`btn-eval btn-correct ${evaluations[questions[currentQuestionIndex]?.id] === 'correct' ? 'active' : ''}`}
                                onClick={() => handleEvaluation(questions[currentQuestionIndex]?.id, 'correct')}
                              >
                                <ThumbsUp size={16} /> To'g'ri topdi
                              </button>
                              <button 
                                className={`btn-eval btn-incorrect ${evaluations[questions[currentQuestionIndex]?.id] === 'incorrect' ? 'active' : ''}`}
                                onClick={() => handleEvaluation(questions[currentQuestionIndex]?.id, 'incorrect')}
                              >
                                <ThumbsDown size={16} /> Noto'g'ri topdi
                              </button>
                            </div>

                            {/* Navigation controls: Prev < Current > Next */}
                            <div className="navigation-controls">
                              <button 
                                className="btn-nav"
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              >
                                <ChevronLeft size={16} /> Oldingi
                              </button>
                              
                              <button 
                                className="btn-nav"
                                onClick={nextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              >
                                Keyingi <ChevronRight size={16} />
                              </button>
                            </div>

                            <div className="interview-actions">
                              <button className="btn-end-interview" onClick={endInterview} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Flag size={16} /> Suhbatni yakunlash
                              </button>
                            </div>
                          </div>
                        )}

                        {interviewState === 'results' && (() => {
                          const correctCount = Object.values(evaluations).filter(v => v === 'correct').length;
                          const incorrectCount = Object.values(evaluations).filter(v => v === 'incorrect').length;
                          const evaluatedCount = Object.keys(evaluations).filter(id => evaluations[id] === 'correct' || evaluations[id] === 'incorrect').length;
                          
                          // Percentage formula based on evaluated questions
                          const valuePerQuestion = evaluatedCount > 0 ? (100 / evaluatedCount).toFixed(2) : 0;
                          const percentage = evaluatedCount > 0 ? Math.round((correctCount * 100) / evaluatedCount) : 0;
                          
                          return (
                            <div className="interview-card results-card animate-fade-in">
                              <h3>Suhbat natijalari</h3>
                              
                              <div className="results-summary">
                                <div className="result-row">
                                  <span>O'quvchi:</span>
                                  <strong>{studentName}</strong>
                                </div>
                                <div className="result-row">
                                  <span>Mavzu:</span>
                                  <strong>{selectedCategory.name}</strong>
                                </div>
                                <div className="result-row">
                                  <span>Baholangan savollar soni:</span>
                                  <strong>{evaluatedCount} ta</strong>
                                </div>
                                <div className="result-row">
                                  <span>To'g'ri javoblar:</span>
                                  <strong className="text-success">{correctCount} ta</strong>
                                </div>
                                <div className="result-row">
                                  <span>Noto'g'ri javoblar:</span>
                                  <strong className="text-error">{incorrectCount} ta</strong>
                                </div>
                                
                                {evaluatedCount > 0 ? (
                                  <div className="formula-box">
                                    <div className="formula-line">
                                      Savol qiymati: <code>100 / {evaluatedCount} = {valuePerQuestion}%</code>
                                    </div>
                                    <div className="formula-line">
                                      Natija foizi: <code>{correctCount} * {valuePerQuestion}% = {percentage}%</code>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="formula-box">
                                    <div className="formula-line text-muted">
                                      Hech qanday savol baholanmadi.
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="percentage-display">
                                <div className="percentage-circle">
                                  <span className="percentage-value">{percentage}%</span>
                                  <span className="percentage-label">Umumiy natija</span>
                                </div>
                              </div>

                              <h4 style={{ marginTop: '32px', marginBottom: '16px' }}>Savollar bo'yicha batafsil:</h4>
                              <div className="results-table-container">
                                <table className="results-table">
                                  <thead>
                                    <tr>
                                      <th>№</th>
                                      <th>Savol</th>
                                      <th>Natija</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {questions.map((q, index) => {
                                      const status = evaluations[q.id];
                                      return (
                                        <tr key={q.id}>
                                          <td>{index + 1}</td>
                                          <td className="table-q-text">{q.questionText}</td>
                                          <td>
                                            {status === 'correct' && <span className="status-badge status-correct">To'g'ri</span>}
                                            {status === 'incorrect' && <span className="status-badge status-incorrect">Noto'g'ri</span>}
                                            {!status && <span className="status-badge status-unanswered">Baholanmagan</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              <div className="results-actions">
                                <button className="btn-secondary" onClick={resetInterview}>
                                  <RotateCcw size={16} /> Yangi suhbat boshlash
                                </button>
                                <button className="btn-primary" onClick={handleBackToCategories}>
                                  <Home size={16} /> Bosh sahifaga qaytish
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} PrepEasy. All rights reserved. Clean, responsive, performant.</p>
      </footer>
    </div>
  );
}

export default App;
