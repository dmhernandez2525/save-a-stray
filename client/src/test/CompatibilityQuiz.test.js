import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Compatibility Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const QUESTIONS = [
    { id: 'living', question: 'What is your living situation?', options: [
      { label: 'House with large yard', value: 'house_large' },
      { label: 'House with small yard', value: 'house_small' },
      { label: 'Apartment', value: 'apartment' },
      { label: 'Condo/Townhouse', value: 'condo' }
    ]},
    { id: 'activity', question: 'How active is your lifestyle?', options: [
      { label: 'Very active (daily runs/hikes)', value: 'very_active' },
      { label: 'Moderately active (daily walks)', value: 'moderate' },
      { label: 'Low activity (relaxed)', value: 'low' },
      { label: 'Varies day to day', value: 'varies' }
    ]},
    { id: 'experience', question: 'What is your pet experience level?', options: [
      { label: 'First-time pet owner', value: 'first_time' },
      { label: 'Some experience', value: 'some' },
      { label: 'Experienced pet owner', value: 'experienced' },
      { label: 'Professional/breeder background', value: 'professional' }
    ]},
    { id: 'time', question: 'How much time can you dedicate to a pet daily?', options: [
      { label: '1-2 hours', value: 'low' },
      { label: '3-4 hours', value: 'moderate' },
      { label: '5+ hours', value: 'high' },
      { label: 'Home most of the day', value: 'full' }
    ]},
    { id: 'preference', question: 'Do you have a pet type preference?', options: [
      { label: 'Dogs', value: 'Dog' },
      { label: 'Cats', value: 'Cat' },
      { label: 'Small animals', value: 'Small' },
      { label: 'No preference', value: 'any' }
    ]}
  ];

  function getResults(answers) {
    const results = [];
    if (answers.preference === 'Dog' || answers.preference === 'any') {
      if (answers.activity === 'very_active' && (answers.living === 'house_large' || answers.living === 'house_small')) {
        results.push({ type: 'Dog', traits: ['Energetic', 'Loyal', 'Trainable'] });
      } else if (answers.activity === 'low' || answers.living === 'apartment') {
        results.push({ type: 'Dog', traits: ['Gentle', 'Low-energy', 'Apartment-friendly'] });
      } else {
        results.push({ type: 'Dog', traits: ['Adaptable', 'Friendly', 'Moderate exercise'] });
      }
    }
    if (answers.preference === 'Cat' || answers.preference === 'any') {
      if (answers.time === 'low' || answers.time === 'moderate') {
        results.push({ type: 'Cat', traits: ['Independent', 'Low-maintenance', 'Quiet'] });
      } else {
        results.push({ type: 'Cat', traits: ['Affectionate', 'Playful', 'Social'] });
      }
    }
    if (answers.preference === 'Small' || answers.preference === 'any') {
      results.push({ type: 'Small', traits: ['Space-efficient', 'Gentle', 'Low-noise'] });
    }
    return results.length > 0 ? results : [{ type: 'Dog', traits: ['Friendly', 'Adaptable'] }];
  }

  const MockQuiz = ({ onNavigate }) => {
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [answers, setAnswers] = React.useState({});
    const [showResults, setShowResults] = React.useState(false);

    const selectAnswer = (questionId, value) => {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    };

    if (showResults) {
      const results = getResults(answers);
      return (
        <div data-testid="quiz-container">
          <div data-testid="results-section">
            <h2 data-testid="results-title">Your Results</h2>
            <p data-testid="results-subtitle">Based on your lifestyle, here are our recommendations:</p>
            {results.map((result, idx) => (
              <div key={idx} data-testid={`result-card-${idx}`}>
                <h3 data-testid={`result-type-${idx}`}>{result.type}</h3>
                <div data-testid={`result-traits-${idx}`}>
                  {result.traits.map(t => <span key={t} data-testid={`trait-${t}`}>{t}</span>)}
                </div>
                <button data-testid={`browse-btn-${idx}`} onClick={() => onNavigate && onNavigate(`/Landing?type=${result.type}`)}>
                  Browse {result.type}s
                </button>
              </div>
            ))}
            <button data-testid="retake-btn" onClick={() => { setCurrentQuestion(0); setAnswers({}); setShowResults(false); }}>
              Retake Quiz
            </button>
          </div>
        </div>
      );
    }

    const q = QUESTIONS[currentQuestion];
    return (
      <div data-testid="quiz-container">
        <h1 data-testid="quiz-title">Pet Compatibility Quiz</h1>
        <p data-testid="quiz-subtitle">Answer a few questions to find your perfect pet match</p>
        <div data-testid="question-section">
          <span data-testid="question-progress">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
          <div data-testid="progress-dots">
            {QUESTIONS.map((_, i) => (
              <div key={i} data-testid={`dot-${i}`} className={i <= currentQuestion ? 'active' : 'inactive'} />
            ))}
          </div>
          <h2 data-testid="question-text">{q.question}</h2>
          <div data-testid="options-list">
            {q.options.map(opt => (
              <button key={opt.value} data-testid={`option-${opt.value}`} onClick={() => selectAnswer(q.id, opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  it('should render quiz title and subtitle', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    expect(screen.getByTestId('quiz-title')).toHaveTextContent('Pet Compatibility Quiz');
    expect(screen.getByTestId('quiz-subtitle')).toHaveTextContent('Answer a few questions to find your perfect pet match');
  });

  it('should show first question on load', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    expect(screen.getByTestId('question-text')).toHaveTextContent('What is your living situation?');
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 1 of 5');
  });

  it('should display all options for current question', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    expect(screen.getByTestId('option-house_large')).toBeInTheDocument();
    expect(screen.getByTestId('option-house_small')).toBeInTheDocument();
    expect(screen.getByTestId('option-apartment')).toBeInTheDocument();
    expect(screen.getByTestId('option-condo')).toBeInTheDocument();
  });

  it('should advance to next question when option selected', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    expect(screen.getByTestId('question-text')).toHaveTextContent('How active is your lifestyle?');
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 2 of 5');
  });

  it('should show progress dots', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    expect(screen.getByTestId('dot-0')).toBeInTheDocument();
    expect(screen.getByTestId('dot-4')).toBeInTheDocument();
  });

  it('should navigate through all questions', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 2 of 5');
    fireEvent.click(screen.getByTestId('option-very_active'));
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 3 of 5');
    fireEvent.click(screen.getByTestId('option-experienced'));
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 4 of 5');
    fireEvent.click(screen.getByTestId('option-high'));
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 5 of 5');
  });

  it('should show results after answering all questions', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    expect(screen.getByTestId('results-section')).toBeInTheDocument();
    expect(screen.getByTestId('results-title')).toHaveTextContent('Your Results');
  });

  it('should show active dog recommendation for active lifestyle with large yard', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    expect(screen.getByTestId('result-type-0')).toHaveTextContent('Dog');
    expect(screen.getByTestId('trait-Energetic')).toBeInTheDocument();
    expect(screen.getByTestId('trait-Loyal')).toBeInTheDocument();
  });

  it('should show apartment-friendly dog for apartment dwellers', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-apartment'));
    fireEvent.click(screen.getByTestId('option-low'));
    fireEvent.click(screen.getByTestId('option-first_time'));
    fireEvent.click(screen.getByTestId('option-low'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    expect(screen.getByTestId('result-type-0')).toHaveTextContent('Dog');
    expect(screen.getByTestId('trait-Apartment-friendly')).toBeInTheDocument();
  });

  it('should show independent cat for low time availability', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-apartment'));
    fireEvent.click(screen.getByTestId('option-moderate'));
    fireEvent.click(screen.getByTestId('option-some'));
    fireEvent.click(screen.getByTestId('option-low'));
    fireEvent.click(screen.getByTestId('option-Cat'));
    expect(screen.getByTestId('result-type-0')).toHaveTextContent('Cat');
    expect(screen.getByTestId('trait-Independent')).toBeInTheDocument();
  });

  it('should show social cat for high time availability', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_small'));
    fireEvent.click(screen.getByTestId('option-moderate'));
    fireEvent.click(screen.getByTestId('option-some'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Cat'));
    expect(screen.getByTestId('result-type-0')).toHaveTextContent('Cat');
    expect(screen.getByTestId('trait-Affectionate')).toBeInTheDocument();
  });

  it('should show multiple results for "any" preference', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-any'));
    expect(screen.getByTestId('result-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('result-card-2')).toBeInTheDocument();
  });

  it('should show browse button for each result', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    expect(screen.getByTestId('browse-btn-0')).toHaveTextContent('Browse Dogs');
  });

  it('should call navigate with correct filter when Browse clicked', () => {
    const handleNavigate = vi.fn();
    render(<MemoryRouter><MockQuiz onNavigate={handleNavigate} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    fireEvent.click(screen.getByTestId('browse-btn-0'));
    expect(handleNavigate).toHaveBeenCalledWith('/Landing?type=Dog');
  });

  it('should show retake button on results page', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    expect(screen.getByTestId('retake-btn')).toBeInTheDocument();
  });

  it('should reset quiz when retake is clicked', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-house_large'));
    fireEvent.click(screen.getByTestId('option-very_active'));
    fireEvent.click(screen.getByTestId('option-experienced'));
    fireEvent.click(screen.getByTestId('option-high'));
    fireEvent.click(screen.getByTestId('option-Dog'));
    fireEvent.click(screen.getByTestId('retake-btn'));
    expect(screen.getByTestId('question-text')).toHaveTextContent('What is your living situation?');
    expect(screen.getByTestId('question-progress')).toHaveTextContent('Question 1 of 5');
  });

  it('should show small animal results', () => {
    render(<MemoryRouter><MockQuiz /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('option-apartment'));
    fireEvent.click(screen.getByTestId('option-low'));
    fireEvent.click(screen.getByTestId('option-first_time'));
    fireEvent.click(screen.getByTestId('option-low'));
    fireEvent.click(screen.getByTestId('option-Small'));
    expect(screen.getByTestId('result-type-0')).toHaveTextContent('Small');
    expect(screen.getByTestId('trait-Space-efficient')).toBeInTheDocument();
  });
});
