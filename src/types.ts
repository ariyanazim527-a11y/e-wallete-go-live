export interface StepOverview {
  stepNumber: number;
  title: string;
  conceptGoal: string;
  isCompleted?: boolean;
}

export interface ProblemData {
  transcribedProblem: string;
  category: string;
  topic: string;
  prerequisites: string[];
  stepsOverview: StepOverview[];
  openingTeacherMessage: string;
  socraticPrompts: string[];
  pedagogicalReflection?: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isWhyExplanation?: boolean;
  pedagogicalReflection?: string;
}

export interface SampleProblem {
  id: string;
  title: string;
  category: string;
  latex: string;
  difficulty: string;
  prompt: string;
  whyThisProblem: string;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: 'calc-substitution',
    title: 'Algebraic U-Substitution with Back-Substitution',
    category: 'Calculus',
    difficulty: 'AP Calculus / Calc 1',
    latex: '\\int x \\sqrt{x - 1} \\, dx',
    prompt: 'Evaluate the indefinite integral: \\int x \\sqrt{x - 1} \\, dx',
    whyThisProblem: 'Students often get confused when an extra x remains after substituting u = x - 1.',
  },
  {
    id: 'implicit-diff',
    title: 'Implicit Differentiation of the Folium',
    category: 'Calculus',
    difficulty: 'Calc 1',
    latex: 'x^3 + y^3 = 6xy \\quad \\text{Find } \\frac{dy}{dx}',
    prompt: 'Find dy/dx for the curve x^3 + y^3 = 6xy using implicit differentiation.',
    whyThisProblem: 'Requires applying the product rule to 6xy and gathering dy/dx terms.',
  },
  {
    id: 'parts-calc',
    title: 'Integration by Parts (Logarithmic)',
    category: 'Calculus',
    difficulty: 'Calc 2',
    latex: '\\int x^2 \\ln(x) \\, dx',
    prompt: 'Evaluate the integral: \\int x^2 \\ln(x) \\, dx using integration by parts.',
    whyThisProblem: 'Classic LIATE rule dilemma: choosing u = ln(x) rather than u = x^2.',
  },
  {
    id: 'quad-completing',
    title: 'Solving by Completing the Square',
    category: 'Algebra',
    difficulty: 'Algebra 2',
    latex: '2x^2 + 8x - 14 = 0',
    prompt: 'Solve for x by completing the square: 2x^2 + 8x - 14 = 0',
    whyThisProblem: 'Requires factoring out the leading coefficient 2 before completing the square.',
  },
  {
    id: 'limit-lhôpital',
    title: 'Indeterminate Limit with Exponential & Polynomial',
    category: 'Calculus',
    difficulty: 'AP Calculus',
    latex: '\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}',
    prompt: 'Evaluate the limit: \\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}',
    whyThisProblem: 'Requires verifying 0/0 form and recognizing the need for consecutive derivatives or Taylor intuition.',
  },
];
