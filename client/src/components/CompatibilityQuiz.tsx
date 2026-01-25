import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { PawPrint, ArrowLeft, ArrowRight, RotateCcw, Home, Dog, Cat, Rabbit, CheckCircle2 } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; icon?: string }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "living",
    question: "What is your living situation?",
    options: [
      { label: "House with large yard", value: "house_large" },
      { label: "House with small yard", value: "house_small" },
      { label: "Apartment", value: "apartment" },
      { label: "Condo/Townhouse", value: "condo" }
    ]
  },
  {
    id: "activity",
    question: "How active is your lifestyle?",
    options: [
      { label: "Very active (daily runs/hikes)", value: "very_active" },
      { label: "Moderately active (daily walks)", value: "moderate" },
      { label: "Low activity (relaxed)", value: "low" },
      { label: "Varies day to day", value: "varies" }
    ]
  },
  {
    id: "experience",
    question: "What is your pet experience level?",
    options: [
      { label: "First-time pet owner", value: "first_time" },
      { label: "Some experience", value: "some" },
      { label: "Experienced pet owner", value: "experienced" },
      { label: "Professional/breeder background", value: "professional" }
    ]
  },
  {
    id: "time",
    question: "How much time can you dedicate to a pet daily?",
    options: [
      { label: "1-2 hours", value: "low" },
      { label: "3-4 hours", value: "moderate" },
      { label: "5+ hours", value: "high" },
      { label: "Home most of the day", value: "full" }
    ]
  },
  {
    id: "preference",
    question: "Do you have a pet type preference?",
    options: [
      { label: "Dogs", value: "Dog" },
      { label: "Cats", value: "Cat" },
      { label: "Small animals", value: "Small" },
      { label: "No preference", value: "any" }
    ]
  }
];

interface QuizResult {
  type: string;
  icon: typeof Dog;
  description: string;
  traits: string[];
}

const CompatibilityQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const selectAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const getResults = (): QuizResult[] => {
    const results: QuizResult[] = [];

    if (answers.preference === "Dog" || answers.preference === "any") {
      if (answers.activity === "very_active" && (answers.living === "house_large" || answers.living === "house_small")) {
        results.push({
          type: "Dog",
          icon: Dog,
          description: "Active breeds like Labrador, Golden Retriever, or Border Collie would be a great match!",
          traits: ["Energetic", "Loyal", "Trainable"]
        });
      } else if (answers.activity === "low" || answers.living === "apartment") {
        results.push({
          type: "Dog",
          icon: Dog,
          description: "Calmer breeds like Bulldog, Cavalier King Charles, or Shih Tzu would suit your lifestyle.",
          traits: ["Gentle", "Low-energy", "Apartment-friendly"]
        });
      } else {
        results.push({
          type: "Dog",
          icon: Dog,
          description: "Medium-energy breeds like Beagle, Cocker Spaniel, or Poodle could be perfect.",
          traits: ["Adaptable", "Friendly", "Moderate exercise"]
        });
      }
    }

    if (answers.preference === "Cat" || answers.preference === "any") {
      if (answers.time === "low" || answers.time === "moderate") {
        results.push({
          type: "Cat",
          icon: Cat,
          description: "Independent cats are perfect for your schedule. Consider adult cats who are already comfortable alone.",
          traits: ["Independent", "Low-maintenance", "Quiet"]
        });
      } else {
        results.push({
          type: "Cat",
          icon: Cat,
          description: "Social cat breeds like Ragdoll or Siamese would enjoy your companionship.",
          traits: ["Affectionate", "Playful", "Social"]
        });
      }
    }

    if (answers.preference === "Small" || answers.preference === "any") {
      results.push({
        type: "Small",
        icon: Rabbit,
        description: "Small animals like rabbits, guinea pigs, or hamsters are great for smaller spaces.",
        traits: ["Space-efficient", "Gentle", "Low-noise"]
      });
    }

    return results.length > 0 ? results : [{
      type: "Dog",
      icon: Dog,
      description: "Based on your answers, a medium-energy companion dog would be a good starting point.",
      traits: ["Friendly", "Adaptable"]
    }];
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue-50 to-background dark:from-warm-gray-900 dark:to-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <div className="bg-white/80 dark:bg-warm-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to home</span>
            </Link>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-sky-blue-500" />
              <span className="font-capriola text-lg hidden sm:inline">Pet Match Quiz</span>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container-tight py-8 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-blue-100 dark:bg-sky-blue-900/30 flex items-center justify-center">
              <PawPrint className="h-8 w-8 text-sky-blue-500" />
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
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
                    {QUESTIONS[currentQuestion].question}
                  </h2>
                  <div className="grid gap-3">
                    {QUESTIONS[currentQuestion].options.map((opt) => {
                      const isSelected = answers[QUESTIONS[currentQuestion].id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => selectAnswer(QUESTIONS[currentQuestion].id, opt.value)}
                          className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-sky-blue-500 bg-sky-blue-50 dark:bg-sky-blue-900/20 shadow-md"
                              : "border-border hover:border-sky-blue-300 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-sky-blue-500 bg-sky-blue-500"
                                : "border-muted-foreground/30"
                            }`}>
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <span className={`font-medium ${isSelected ? "text-sky-blue-700 dark:text-sky-blue-300" : "text-foreground"}`}>
                              {opt.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <div className="flex gap-1.5">
                    {QUESTIONS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => i < currentQuestion && setCurrentQuestion(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === currentQuestion
                            ? "bg-sky-blue-500"
                            : i < currentQuestion
                            ? "bg-sky-blue-300 cursor-pointer hover:bg-sky-blue-400"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-24" /> {/* Spacer */}
                </div>
              </>
            ) : (
              /* Results */
              <div className="space-y-6">
                {getResults().map((result, idx) => {
                  const Icon = result.icon;
                  return (
                    <Card key={idx} variant="elevated" className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-24 p-6 bg-gradient-to-br from-sky-blue-500 to-sky-blue-600 flex items-center justify-center">
                            <Icon className="h-12 w-12 text-white" />
                          </div>
                          <div className="flex-1 p-5 sm:p-6">
                            <h3 className="font-capriola text-xl text-foreground mb-2">
                              {result.type === "Small" ? "Small Animals" : `${result.type}s`}
                            </h3>
                            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                              {result.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {result.traits.map((trait) => (
                                <Badge key={trait} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              variant="skyBlue"
                              size="sm"
                              onClick={() => navigate(`/Landing?type=${result.type}`)}
                              className="w-full sm:w-auto"
                            >
                              Browse {result.type === "Small" ? "Small Animals" : `${result.type}s`}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={resetQuiz}
                    className="flex-1 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="flex-1 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompatibilityQuiz;
