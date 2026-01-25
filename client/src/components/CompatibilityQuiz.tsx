import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { PawPrint, ArrowLeft, ArrowRight, RotateCcw, Home, Dog, Cat, Rabbit, CheckCircle2 } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface QuizOption {
  label: string;
  value: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

interface QuizResult {
  type: string;
  icon: typeof Dog;
  description: string;
  traits: string[];
}

type QuizAnswers = Record<string, string>;

// =============================================================================
// Constants
// =============================================================================

const QUESTIONS: QuizQuestion[] = [
  {
    id: "living",
    question: "What is your living situation?",
    options: [
      { label: "House with large yard", value: "house_large" },
      { label: "House with small yard", value: "house_small" },
      { label: "Apartment", value: "apartment" },
      { label: "Condo/Townhouse", value: "condo" },
    ],
  },
  {
    id: "activity",
    question: "How active is your lifestyle?",
    options: [
      { label: "Very active (daily runs/hikes)", value: "very_active" },
      { label: "Moderately active (daily walks)", value: "moderate" },
      { label: "Low activity (relaxed)", value: "low" },
      { label: "Varies day to day", value: "varies" },
    ],
  },
  {
    id: "experience",
    question: "What is your pet experience level?",
    options: [
      { label: "First-time pet owner", value: "first_time" },
      { label: "Some experience", value: "some" },
      { label: "Experienced pet owner", value: "experienced" },
      { label: "Professional/breeder background", value: "professional" },
    ],
  },
  {
    id: "time",
    question: "How much time can you dedicate to a pet daily?",
    options: [
      { label: "1-2 hours", value: "low" },
      { label: "3-4 hours", value: "moderate" },
      { label: "5+ hours", value: "high" },
      { label: "Home most of the day", value: "full" },
    ],
  },
  {
    id: "preference",
    question: "Do you have a pet type preference?",
    options: [
      { label: "Dogs", value: "Dog" },
      { label: "Cats", value: "Cat" },
      { label: "Small animals", value: "Small" },
      { label: "No preference", value: "any" },
    ],
  },
];

// =============================================================================
// Result Calculation
// =============================================================================

function calculateResults(answers: QuizAnswers): QuizResult[] {
  const results: QuizResult[] = [];
  const { preference, activity, living, time } = answers;

  // Dog recommendations
  if (preference === "Dog" || preference === "any") {
    if (activity === "very_active" && (living === "house_large" || living === "house_small")) {
      results.push({
        type: "Dog",
        icon: Dog,
        description: "Active breeds like Labrador, Golden Retriever, or Border Collie would be a great match!",
        traits: ["Energetic", "Loyal", "Trainable"],
      });
    } else if (activity === "low" || living === "apartment") {
      results.push({
        type: "Dog",
        icon: Dog,
        description: "Calmer breeds like Bulldog, Cavalier King Charles, or Shih Tzu would suit your lifestyle.",
        traits: ["Gentle", "Low-energy", "Apartment-friendly"],
      });
    } else {
      results.push({
        type: "Dog",
        icon: Dog,
        description: "Medium-energy breeds like Beagle, Cocker Spaniel, or Poodle could be perfect.",
        traits: ["Adaptable", "Friendly", "Moderate exercise"],
      });
    }
  }

  // Cat recommendations
  if (preference === "Cat" || preference === "any") {
    if (time === "low" || time === "moderate") {
      results.push({
        type: "Cat",
        icon: Cat,
        description: "Independent cats are perfect for your schedule. Consider adult cats who are already comfortable alone.",
        traits: ["Independent", "Low-maintenance", "Quiet"],
      });
    } else {
      results.push({
        type: "Cat",
        icon: Cat,
        description: "Social cat breeds like Ragdoll or Siamese would enjoy your companionship.",
        traits: ["Affectionate", "Playful", "Social"],
      });
    }
  }

  // Small animal recommendations
  if (preference === "Small" || preference === "any") {
    results.push({
      type: "Small",
      icon: Rabbit,
      description: "Small animals like rabbits, guinea pigs, or hamsters are great for smaller spaces.",
      traits: ["Space-efficient", "Gentle", "Low-noise"],
    });
  }

  // Default recommendation
  if (results.length === 0) {
    results.push({
      type: "Dog",
      icon: Dog,
      description: "Based on your answers, a medium-energy companion dog would be a good starting point.",
      traits: ["Friendly", "Adaptable"],
    });
  }

  return results;
}

// =============================================================================
// Subcomponents
// =============================================================================

interface QuizOptionButtonProps {
  option: QuizOption;
  isSelected: boolean;
  onSelect: () => void;
  questionId: string;
}

function QuizOptionButton({ option, isSelected, onSelect, questionId }: QuizOptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-sky-blue-500 bg-sky-blue-50 dark:bg-sky-blue-900/20 shadow-md"
          : "border-border hover:border-sky-blue-300 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? "border-sky-blue-500 bg-sky-blue-500" : "border-muted-foreground/30"
          }`}
          aria-hidden="true"
        >
          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
        </div>
        <span className={`font-medium ${isSelected ? "text-sky-blue-700 dark:text-sky-blue-300" : "text-foreground"}`}>
          {option.label}
        </span>
      </div>
    </button>
  );
}

interface ProgressDotsProps {
  total: number;
  current: number;
  onNavigate: (index: number) => void;
}

function ProgressDots({ total, current, onNavigate }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5" role="tablist" aria-label="Quiz progress">
      {Array.from({ length: total }, (_, i) => {
        const canNavigate = i < current;
        const isCurrent = i === current;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Question ${i + 1}${isCurrent ? " (current)" : canNavigate ? " (completed)" : ""}`}
            onClick={() => canNavigate && onNavigate(i)}
            disabled={!canNavigate}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isCurrent
                ? "bg-sky-blue-500"
                : canNavigate
                ? "bg-sky-blue-300 cursor-pointer hover:bg-sky-blue-400"
                : "bg-muted-foreground/20 cursor-default"
            }`}
          />
        );
      })}
    </div>
  );
}

interface ResultCardProps {
  result: QuizResult;
  onBrowse: () => void;
}

function ResultCard({ result, onBrowse }: ResultCardProps) {
  const Icon = result.icon;
  const displayName = result.type === "Small" ? "Small Animals" : `${result.type}s`;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-24 p-6 bg-gradient-to-br from-sky-blue-500 to-sky-blue-600 flex items-center justify-center">
            <Icon className="h-12 w-12 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 p-5 sm:p-6">
            <h3 className="font-capriola text-xl text-foreground mb-2">{displayName}</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">{result.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.traits.map((trait) => (
                <Badge key={trait} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
            <Button variant="skyBlue" size="sm" onClick={onBrowse} className="w-full sm:w-auto">
              Browse {displayName}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Interactive quiz to help users find compatible pets based on their lifestyle.
 * Collects preferences about living situation, activity level, and experience.
 */
export default function CompatibilityQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const results = useMemo(() => {
    if (!showResults) return [];
    return calculateResults(answers);
  }, [showResults, answers]);

  const handleSelectAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
  }, [currentQuestion]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  }, []);

  const handleBrowse = useCallback((type: string) => {
    navigate(`/Landing?type=${type}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue-50 to-background dark:from-warm-gray-900 dark:to-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <header className="bg-white/80 dark:bg-warm-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to home</span>
            </Link>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-sky-blue-500" aria-hidden="true" />
              <span className="font-capriola text-lg hidden sm:inline">Pet Match Quiz</span>
            </div>
            <div className="w-20" aria-hidden="true" />
          </div>
        </div>
      </header>

      <main className="container-tight py-8 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-blue-100 dark:bg-sky-blue-900/30 flex items-center justify-center">
              <PawPrint className="h-8 w-8 text-sky-blue-500" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-capriola text-foreground">
              {showResults ? "Your Perfect Match" : "Pet Compatibility Quiz"}
            </CardTitle>
            <CardDescription className="text-base">
              {showResults
                ? "Based on your lifestyle, here are our recommendations"
                : "Answer a few questions to find your perfect pet match"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {!showResults ? (
              <>
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {currentQuestion + 1} of {QUESTIONS.length}
                    </span>
                    <span className="text-sm font-medium text-sky-blue-600 dark:text-sky-blue-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" aria-label="Quiz progress" />
                </div>

                {/* Question */}
                <div className="mb-6" role="radiogroup" aria-labelledby="question-label">
                  <h2 id="question-label" className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
                    {question.question}
                  </h2>
                  <div className="grid gap-3" aria-live="polite">
                    {question.options.map((opt) => (
                      <QuizOptionButton
                        key={opt.value}
                        option={opt}
                        questionId={question.id}
                        isSelected={answers[question.id] === opt.value}
                        onSelect={() => handleSelectAnswer(question.id, opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <ProgressDots
                    total={QUESTIONS.length}
                    current={currentQuestion}
                    onNavigate={setCurrentQuestion}
                  />
                  <div className="w-24" aria-hidden="true" />
                </div>
              </>
            ) : (
              /* Results */
              <div className="space-y-6" aria-live="polite">
                {results.map((result, idx) => (
                  <ResultCard
                    key={`${result.type}-${idx}`}
                    result={result}
                    onBrowse={() => handleBrowse(result.type)}
                  />
                ))}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleReset} className="flex-1 gap-2">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Retake Quiz
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")} className="flex-1 gap-2">
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
