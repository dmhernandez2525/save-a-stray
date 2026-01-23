import React, { Component } from "react";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
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

interface QuizProps extends WithRouterProps {}

interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  showResults: boolean;
}

interface QuizResult {
  type: string;
  description: string;
  traits: string[];
}

class CompatibilityQuiz extends Component<QuizProps, QuizState> {
  constructor(props: QuizProps) {
    super(props);
    this.state = { currentQuestion: 0, answers: {}, showResults: false };
  }

  selectAnswer(questionId: string, value: string) {
    const newAnswers = { ...this.state.answers, [questionId]: value };
    this.setState({ answers: newAnswers });
    if (this.state.currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => this.setState({ currentQuestion: this.state.currentQuestion + 1 }), 300);
    } else {
      setTimeout(() => this.setState({ showResults: true }), 300);
    }
  }

  getResults(): QuizResult[] {
    const { answers } = this.state;
    const results: QuizResult[] = [];

    if (answers.preference === "Dog" || answers.preference === "any") {
      if (answers.activity === "very_active" && (answers.living === "house_large" || answers.living === "house_small")) {
        results.push({ type: "Dog", description: "Active breeds like Labrador, Golden Retriever, or Border Collie would be a great match!", traits: ["Energetic", "Loyal", "Trainable"] });
      } else if (answers.activity === "low" || answers.living === "apartment") {
        results.push({ type: "Dog", description: "Calmer breeds like Bulldog, Cavalier King Charles, or Shih Tzu would suit your lifestyle.", traits: ["Gentle", "Low-energy", "Apartment-friendly"] });
      } else {
        results.push({ type: "Dog", description: "Medium-energy breeds like Beagle, Cocker Spaniel, or Poodle could be perfect.", traits: ["Adaptable", "Friendly", "Moderate exercise"] });
      }
    }

    if (answers.preference === "Cat" || answers.preference === "any") {
      if (answers.time === "low" || answers.time === "moderate") {
        results.push({ type: "Cat", description: "Independent cats are perfect for your schedule. Consider adult cats who are already comfortable alone.", traits: ["Independent", "Low-maintenance", "Quiet"] });
      } else {
        results.push({ type: "Cat", description: "Social cat breeds like Ragdoll or Siamese would enjoy your companionship.", traits: ["Affectionate", "Playful", "Social"] });
      }
    }

    if (answers.preference === "Small" || answers.preference === "any") {
      results.push({ type: "Small", description: "Small animals like rabbits, guinea pigs, or hamsters are great for smaller spaces.", traits: ["Space-efficient", "Gentle", "Low-noise"] });
    }

    return results.length > 0 ? results : [{ type: "Dog", description: "Based on your answers, a medium-energy companion dog would be a good starting point.", traits: ["Friendly", "Adaptable"] }];
  }

  renderQuestion() {
    const q = QUESTIONS[this.state.currentQuestion];
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Question {this.state.currentQuestion + 1} of {QUESTIONS.length}
          </span>
          <div className="flex gap-1">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i <= this.state.currentQuestion ? "bg-sky-blue" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
        <h2 className="text-xl font-capriola text-gray-800 mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => this.selectAnswer(q.id, opt.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                this.state.answers[q.id] === opt.value
                  ? "border-sky-blue bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-gray-800 font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  renderResults() {
    const results = this.getResults();
    return (
      <div>
        <h2 className="text-2xl font-capriola text-sky-blue mb-2 text-center">Your Results</h2>
        <p className="text-muted-foreground text-center mb-6">Based on your lifestyle, here are our recommendations:</p>
        <div className="space-y-4">
          {results.map((result, idx) => (
            <Card key={idx} className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-capriola text-sky-blue text-lg mb-1">{result.type}</h3>
                <p className="text-gray-700 text-sm mb-3">{result.description}</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {result.traits.map((trait) => (
                    <span key={trait} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{trait}</span>
                  ))}
                </div>
                <Button
                  variant="salmon"
                  size="sm"
                  onClick={() => this.props.navigate(`/Landing?type=${result.type}`)}
                >
                  Browse {result.type}s
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => this.setState({ currentQuestion: 0, answers: {}, showResults: false })}>
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="max-w-xl mx-auto p-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sky-blue font-capriola text-2xl text-center">
              Pet Compatibility Quiz
            </CardTitle>
            <p className="text-muted-foreground text-center text-sm">
              Answer a few questions to find your perfect pet match
            </p>
          </CardHeader>
          <CardContent>
            {this.state.showResults ? this.renderResults() : this.renderQuestion()}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withRouter(CompatibilityQuiz);
