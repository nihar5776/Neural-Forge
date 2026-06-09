import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ClipboardList, AlertCircle, RefreshCw, CheckCircle, XCircle, Brain, Trophy, ChevronRight, Play, ArrowLeft, Award, HelpCircle } from 'lucide-react';

export default function Quiz() {
  // Page states: 'setup', 'playing', 'results'
  const [gameState, setGameState] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup forms
  const [quizMode, setQuizMode] = useState('jd'); // 'jd' or 'skills'
  const [jobTitleList, setJobTitleList] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [difficulty, setDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Quiz gameplay states
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionString }
  


  // Fetch report history for setup dropdowns & fetch quiz history
  const loadSetupData = async () => {
    try {
      // 1. Fetch analyzed reports to pre-populate jobs and skill gaps
      const reportData = await api.get('/api/interview/history');
      const reports = reportData.reports || [];
      
      // Extract unique job titles
      const titles = [...new Set(reports.map(r => r.title || r.jobDescription).filter(Boolean))];
      setJobTitleList(titles);
      if (titles.length > 0) {
        setSelectedJobTitle(titles[0]);
      }
      
      // Extract unique skill gaps
      const allGaps = [];
      reports.forEach(r => {
        if (r.skillGaps && Array.isArray(r.skillGaps)) {
          r.skillGaps.forEach(g => {
            if (g.skill) allGaps.push(g.skill);
          });
        }
      });
      const uniqueGaps = [...new Set(allGaps)];
      setAvailableSkills(uniqueGaps);
      if (uniqueGaps.length > 0) {
        setSelectedSkills([uniqueGaps[0]]);
      }
    } catch (err) {
      console.error("Failed to load coaching history for quiz:", err);
    }
  };

  useEffect(() => {
    loadSetupData();
  }, []);

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const cleanSkill = customSkillInput.trim();
    if (!selectedSkills.includes(cleanSkill)) {
      setSelectedSkills(prev => [...prev, cleanSkill]);
      if (!availableSkills.includes(cleanSkill)) {
        setAvailableSkills(prev => [...prev, cleanSkill]);
      }
    }
    setCustomSkillInput('');
  };

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setError('');

    if (quizMode === 'jd' && !selectedJobTitle) {
      setError('Please select a target job profile.');
      return;
    }
    if (quizMode === 'skills' && selectedSkills.length === 0) {
      setError('Please select or enter at least one skill.');
      return;
    }

    const parsedNum = Number(numQuestions);
    if (isNaN(parsedNum) || parsedNum < 1 || !Number.isInteger(parsedNum)) {
      setError('Please enter a valid positive integer for the number of questions (minimum 1).');
      return;
    }
    if (parsedNum > 30) {
      setError('Please enter a number of questions between 1 and 30.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: quizMode,
        numQuestions: parsedNum,
        difficulty,
        jobTitle: quizMode === 'jd' ? selectedJobTitle : undefined,
        skills: quizMode === 'skills' ? selectedSkills : undefined
      };
      
      const data = await api.post('/api/quiz/generate', payload);
      setQuizData(data.quiz);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setGameState('playing');
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.message || "Failed to generate quiz questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: option
    }));
  };

  const handleNext = () => {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const selected = answers[currentQuestionIdx] || '';
    const correct = currentQuestion.correctAnswer || '';
    const isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();

    if (isCorrect) {
      setDifficulty(prev => {
        if (prev === 'Easy') return 'Medium';
        if (prev === 'Medium') return 'Hard';
        return 'Hard';
      });
    }

    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Grade the quiz
    const gradedQuestions = quizData.questions.map((q, idx) => {
      const selected = answers[idx] || '';
      const correct = q.correctAnswer || '';
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correct,
        selectedAnswer: selected,
        isCorrect: selected.trim().toLowerCase() === correct.trim().toLowerCase(),
        explanation: q.explanation
      };
    });

    // Adjust difficulty level one final time if the last question is correct
    const lastQuestionGraded = gradedQuestions[currentQuestionIdx];
    let finalDifficulty = difficulty;
    if (lastQuestionGraded && lastQuestionGraded.isCorrect) {
      if (difficulty === 'Easy') finalDifficulty = 'Medium';
      else if (difficulty === 'Medium') finalDifficulty = 'Hard';
    }
    setDifficulty(finalDifficulty);

    const correctCount = gradedQuestions.filter(q => q.isCorrect).length;
    const finalScore = Math.round((correctCount / quizData.questions.length) * 100);

    setQuizData(prev => ({
      ...prev,
      score: finalScore,
      questions: gradedQuestions
    }));
    setGameState('results');
  };

  const getQuizScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (gameState === 'playing') {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const totalQuestions = quizData.questions.length;
    const isAnswered = answers[currentQuestionIdx] !== undefined;

    return (
      <div className="quiz-play-container animate-fade-in">
        <div className="dashboard-header-row">
          <button className="btn-secondary back-btn" onClick={() => {
            if (window.confirm("Exit quiz? Your progress will be lost.")) setGameState('setup');
          }}>
            <ArrowLeft size={16} /> Exit Quiz
          </button>
          <h2>{quizData.title || 'Interview Quiz'}</h2>
        </div>

        <div className="quiz-progress-bar-card card">
          <div className="quiz-progress-header">
            <span>Question {currentQuestionIdx + 1} of {totalQuestions}</span>
            <span className="difficulty-badge">{difficulty}</span>
          </div>
          <div className="progress-track-bar">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="active-question-card card animate-fade-in">
          <div className="question-prompt-header">
            <HelpCircle className="q-icon" size={24} />
            <h3>{currentQuestion.question}</h3>
          </div>

          <div className="quiz-options-list">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = answers[currentQuestionIdx] === option;
              return (
                <button
                  key={idx}
                  className={`quiz-option-row-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(option)}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="quiz-nav-row">
          <button 
            className="btn-secondary" 
            onClick={handlePrev} 
            disabled={currentQuestionIdx === 0}
          >
            Previous
          </button>
          
          {currentQuestionIdx === totalQuestions - 1 ? (
            <button 
              className="btn-primary submit-quiz-btn" 
              onClick={handleSubmitQuiz} 
              disabled={loading}
            >
              {loading ? <RefreshCw className="spinner" size={18} /> : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={!isAnswered}
            >
              Next Question <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const scoreColor = getQuizScoreColor(quizData.score);
    return (
      <div className="quiz-results-container animate-fade-in">
        <div className="dashboard-header-row">
          <button className="btn-primary" onClick={() => setGameState('setup')}>
            Take Another Quiz
          </button>
          <h2>Quiz Results</h2>
        </div>

        <div className="results-summary-card card">
          <div className="score-ring-wrapper">
            <div 
              className="progress-circle animate-scale-in" 
              style={{ '--progress': quizData.score, background: `conic-gradient(${scoreColor} calc(var(--progress) * 1%), var(--border-color) 0)` }}
            >
              <span className="progress-text">{quizData.score}%</span>
            </div>
            <div className="results-score-info">
              <Trophy className="trophy-icon animate-float" size={32} style={{ color: scoreColor }} />
              <h3>Quiz Completed!</h3>
              <p>
                You got {quizData.questions.filter(q => q.isCorrect).length} out of {quizData.questions.length} questions correct.
                {quizData.score >= 80 ? ' Fantastic job! You have strong grasp of these concepts.' : 
                 quizData.score >= 50 ? ' Good try, but a bit more reading and preparation is advised.' : 
                 ' Significant gaps in understanding. Go back to study guides.'}
              </p>
            </div>
          </div>
        </div>

        <h3 className="section-title">Question Breakdown</h3>
        <div className="results-breakdown-list">
          {quizData.questions.map((q, idx) => (
            <div key={idx} className={`result-question-card card ${q.isCorrect ? 'correct-border' : 'incorrect-border'} stagger-item`}>
              <div className="result-q-header">
                {q.isCorrect ? (
                  <CheckCircle size={22} className="correct-icon" />
                ) : (
                  <XCircle size={22} className="incorrect-icon" />
                )}
                <h4>Question {idx + 1}: {q.question}</h4>
              </div>

              <div className="result-options-list-review">
                {q.options.map((option, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isSelected = q.selectedAnswer === option;
                  const isCorrectAnswer = q.correctAnswer === option;
                  
                  let styleClass = '';
                  if (isCorrectAnswer) styleClass = 'correct-choice';
                  else if (isSelected) styleClass = 'incorrect-choice';

                  return (
                    <div key={oIdx} className={`result-option-row-review ${styleClass} stagger-item`}>
                      <span className="option-letter">{letter}</span>
                      <span className="option-text">{option}</span>
                      {isCorrectAnswer && <span className="answer-badge correct">Correct Answer</span>}
                      {isSelected && !isCorrectAnswer && <span className="answer-badge incorrect">Your Answer</span>}
                    </div>
                  );
                })}
              </div>

              <div className="ai-explanation-box">
                <Brain size={18} className="brain-icon" />
                <div className="explanation-content">
                  <strong>AI Explanation:</strong>
                  <p>{q.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-setup-container animate-fade-in">
      <div className="page-header">
        <h1>Interview Prep Quiz</h1>
        <p className="subtitle">Test your tech skills and job knowledge through customized, dynamically generated MCQs</p>
      </div>

      {error && (
        <div className="auth-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-card card">
          <div className="loading-content">
            <div className="pulse-sparkle">
              <Brain size={36} className="sparkle-icon spinner" />
            </div>
            <h2>Generating Dynamic Interview Quiz...</h2>
            <p className="job-agent-searching-hint">
              AI is compiling multiple-choice questions matching difficulty "{difficulty}" and questions count "{numQuestions}".
            </p>
            <div className="search-status-bar">
              <div className="status-progress-track">
                <div className="status-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-setup-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {/* Settings Column */}
          <div className="form-column" style={{ width: '100%', maxWidth: '600px' }}>
            <form onSubmit={handleStartQuiz} className="quiz-setup-card card">
              <h3>Quiz Configuration</h3>

              <div className="form-group">
                <label className="section-label">Quiz Scope Mode</label>
                <div className="mode-toggle-buttons">
                  <button
                    type="button"
                    className={`btn-secondary mode-btn ${quizMode === 'jd' ? 'active-mode' : ''}`}
                    onClick={() => setQuizMode('jd')}
                  >
                    Target Job Profile
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary mode-btn ${quizMode === 'skills' ? 'active-mode' : ''}`}
                    onClick={() => setQuizMode('skills')}
                  >
                    Target Skills
                  </button>
                </div>
              </div>

              {quizMode === 'jd' ? (
                <div className="form-group animate-fade-in">
                  <label htmlFor="jobTitleSelect" className="section-label">Select Job Profile *</label>
                  {jobTitleList.length === 0 ? (
                    <div className="no-history-warning">
                      No analyzed job profiles found. Upload a resume first to extract targets!
                    </div>
                  ) : (
                    <select
                      id="jobTitleSelect"
                      className="resume-dropdown-select"
                      value={selectedJobTitle}
                      onChange={(e) => setSelectedJobTitle(e.target.value)}
                    >
                      {jobTitleList.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="form-group animate-fade-in">
                  <label className="section-label">Select Target Skills *</label>
                  
                  {availableSkills.length > 0 && (
                    <div className="skills-checkbox-grid">
                      {availableSkills.map((skill, idx) => (
                        <label key={idx} className="skill-chk-label">
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={() => handleToggleSkill(skill)}
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="add-custom-skill-row">
                    <input
                      type="text"
                      placeholder="Add another skill (e.g. Docker, SQL)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddCustomSkill}>
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="numQuestionsInput" className="section-label">Number of Questions</label>
                <input
                  id="numQuestionsInput"
                  type="number"
                  min="1"
                  max="30"
                  className="resume-dropdown-select"
                  placeholder="Enter number of questions (1-30)"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary start-analysis-btn"
                disabled={(quizMode === 'jd' && !selectedJobTitle) || (quizMode === 'skills' && selectedSkills.length === 0)}
              >
                <Play size={16} /> Generate & Start Quiz
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
