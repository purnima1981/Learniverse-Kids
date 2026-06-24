/**
 * Comprehensive topic matrix for Math Olympiad preparation
 * Covers grades 1-8, 7 categories, with grade-appropriate topics.
 * Inspired by: Math Kangaroo, IMO, SOF IMO, ASSET Math, AMC 8
 */

export interface TopicDefinition {
  title: string;
  description: string;
  category: string;
  gradeLevel: number;
  subtopics: string[]; // Used in prompt to guide question generation
}

export const TOPIC_MATRIX: TopicDefinition[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // GRADE 1-2
  // ══════════════════════════════════════════════════════════════════════════

  // Arithmetic
  { title: "Addition & Subtraction Basics", description: "Single and double digit addition and subtraction with regrouping", category: "arithmetic", gradeLevel: 1, subtopics: ["single-digit addition", "subtraction within 20", "missing number problems", "word problems"] },
  { title: "Skip Counting & Patterns", description: "Count by 2s, 5s, 10s and identify simple number patterns", category: "arithmetic", gradeLevel: 1, subtopics: ["skip counting by 2", "skip counting by 5", "skip counting by 10", "number patterns"] },
  { title: "Place Value & Comparison", description: "Understand tens and ones, compare numbers up to 100", category: "arithmetic", gradeLevel: 2, subtopics: ["tens and ones", "comparing numbers", "ordering numbers", "expanded form"] },
  { title: "Addition & Subtraction within 100", description: "Two-digit addition and subtraction with and without regrouping", category: "arithmetic", gradeLevel: 2, subtopics: ["two-digit addition", "two-digit subtraction", "regrouping", "estimation"] },

  // Geometry
  { title: "Shapes & Their Properties", description: "Identify basic 2D shapes and their attributes", category: "geometry", gradeLevel: 1, subtopics: ["circles", "triangles", "squares", "rectangles", "sides and corners"] },
  { title: "Symmetry & Spatial Sense", description: "Lines of symmetry, flips, slides, and turns", category: "geometry", gradeLevel: 2, subtopics: ["line symmetry", "mirror images", "spatial reasoning", "left-right orientation"] },

  // Logical Reasoning
  { title: "Simple Logic Puzzles", description: "Basic deduction, odd one out, and pattern recognition", category: "logical-reasoning", gradeLevel: 1, subtopics: ["odd one out", "what comes next", "sorting and classifying", "simple deduction"] },
  { title: "Picture Patterns & Sequences", description: "Visual pattern recognition and sequence completion", category: "logical-reasoning", gradeLevel: 2, subtopics: ["repeating patterns", "growing patterns", "picture sequences", "pattern rules"] },

  // Data Handling
  { title: "Reading Simple Charts", description: "Read and interpret picture graphs and simple bar charts", category: "data-handling", gradeLevel: 2, subtopics: ["picture graphs", "tally marks", "simple bar graphs", "comparing data"] },

  // ══════════════════════════════════════════════════════════════════════════
  // GRADE 3-4
  // ══════════════════════════════════════════════════════════════════════════

  // Arithmetic
  { title: "Multiplication Mastery", description: "Multiplication facts, properties, and multi-digit multiplication", category: "arithmetic", gradeLevel: 3, subtopics: ["times tables", "commutative property", "distributive property", "word problems"] },
  { title: "Division & Remainders", description: "Division concepts, long division, and interpreting remainders", category: "arithmetic", gradeLevel: 3, subtopics: ["equal sharing", "long division", "remainders", "division word problems"] },
  { title: "Speed Arithmetic", description: "Quick mental math: addition, subtraction, multiplication tricks for olympiad speed rounds", category: "arithmetic", gradeLevel: 3, subtopics: ["mental math strategies", "number bonds", "estimation", "operation shortcuts"] },
  { title: "Fractions Fundamentals", description: "Understanding fractions, comparing, and simple operations", category: "arithmetic", gradeLevel: 4, subtopics: ["fraction concepts", "equivalent fractions", "comparing fractions", "adding fractions with like denominators"] },
  { title: "Decimals & Money", description: "Decimal notation, place value, and money calculations", category: "arithmetic", gradeLevel: 4, subtopics: ["decimal place value", "comparing decimals", "adding decimals", "money problems"] },

  // Number Theory
  { title: "Odd & Even Number Properties", description: "Properties of odd and even numbers in operations", category: "number-theory", gradeLevel: 3, subtopics: ["odd+odd", "even+even", "odd+even", "multiplication patterns"] },
  { title: "Factors & Multiples", description: "Master GCD, LCM, prime factorization — essential for math olympiad problems", category: "number-theory", gradeLevel: 4, subtopics: ["factor pairs", "common factors", "multiples", "LCM and GCD"] },

  // Geometry
  { title: "Perimeter & Area Basics", description: "Calculate perimeter and area of rectangles and simple shapes", category: "geometry", gradeLevel: 3, subtopics: ["perimeter of rectangles", "perimeter of irregular shapes", "area of rectangles", "area by counting squares"] },
  { title: "Angles & Triangles", description: "Properties of triangles, angle relationships, and geometric reasoning", category: "geometry", gradeLevel: 4, subtopics: ["types of angles", "measuring angles", "triangle classification", "angle sum property"] },

  // Algebra
  { title: "Number Sentences & Variables", description: "Solve simple equations with unknown values", category: "algebra", gradeLevel: 3, subtopics: ["missing number equations", "balance problems", "input-output tables", "simple variables"] },
  { title: "Patterns & Sequences", description: "Identify and extend number patterns, arithmetic sequences", category: "algebra", gradeLevel: 4, subtopics: ["arithmetic sequences", "pattern rules", "growing patterns", "function tables"] },

  // Logical Reasoning
  { title: "Logic Puzzles", description: "Olympiad-style logical reasoning: deductions and clever thinking", category: "logical-reasoning", gradeLevel: 3, subtopics: ["if-then reasoning", "process of elimination", "logic grids", "word puzzles"] },
  { title: "Math Kangaroo Style Problems", description: "Competition-style problems requiring creative thinking", category: "logical-reasoning", gradeLevel: 4, subtopics: ["trick questions", "working backwards", "guess and check", "systematic listing"] },

  // Combinatorics
  { title: "Basic Counting", description: "Systematic counting, tree diagrams, and organized listing", category: "combinatorics", gradeLevel: 3, subtopics: ["organized listing", "tree diagrams", "counting outcomes", "arrangements"] },
  { title: "Combinations & Arrangements", description: "Simple permutations and combinations in everyday contexts", category: "combinatorics", gradeLevel: 4, subtopics: ["choosing from a group", "ordering objects", "path counting", "ice cream combinations"] },

  // Data Handling
  { title: "Graphs & Data Analysis", description: "Read, create, and interpret various types of graphs", category: "data-handling", gradeLevel: 3, subtopics: ["bar graphs", "line plots", "interpreting data", "mean and mode basics"] },
  { title: "Probability Basics", description: "Understand likelihood, certain, impossible, and likely events", category: "data-handling", gradeLevel: 4, subtopics: ["certain vs impossible", "equally likely", "comparing chances", "simple experiments"] },

  // ══════════════════════════════════════════════════════════════════════════
  // GRADE 5-6
  // ══════════════════════════════════════════════════════════════════════════

  // Arithmetic
  { title: "Fraction Operations", description: "Add, subtract, multiply, and divide fractions and mixed numbers", category: "arithmetic", gradeLevel: 5, subtopics: ["adding unlike fractions", "subtracting fractions", "multiplying fractions", "dividing fractions"] },
  { title: "Decimal Operations", description: "Multiply and divide decimals, convert between fractions and decimals", category: "arithmetic", gradeLevel: 5, subtopics: ["multiplying decimals", "dividing decimals", "fraction-decimal conversion", "repeating decimals"] },
  { title: "Percentages", description: "Understanding percentages, conversions, and real-world applications", category: "arithmetic", gradeLevel: 6, subtopics: ["percentage of a number", "fraction-decimal-percent conversion", "discount and tax", "percentage increase/decrease"] },
  { title: "Ratio & Proportion", description: "Understand ratios, proportions, and their applications", category: "arithmetic", gradeLevel: 6, subtopics: ["equivalent ratios", "unit rates", "proportion problems", "scale drawings"] },

  // Number Theory
  { title: "Prime Numbers & Factorization", description: "Identify primes, prime factorization, and use in problem solving", category: "number-theory", gradeLevel: 5, subtopics: ["prime identification", "composite numbers", "prime factorization", "factor trees"] },
  { title: "Divisibility Rules", description: "Master divisibility tests for 2-12 and apply to problem solving", category: "number-theory", gradeLevel: 5, subtopics: ["divisibility by 2,3,4,5", "divisibility by 6,8,9", "divisibility by 11", "applying rules to large numbers"] },
  { title: "Divisibility & Remainders", description: "Divisibility rules, modular arithmetic, and remainder problems", category: "number-theory", gradeLevel: 6, subtopics: ["remainder patterns", "modular arithmetic basics", "Chinese remainder theorem intuition", "last digit problems"] },

  // Geometry
  { title: "Area of Triangles & Parallelograms", description: "Calculate areas using formulas and decomposition", category: "geometry", gradeLevel: 5, subtopics: ["triangle area formula", "parallelogram area", "trapezoid area", "composite shapes"] },
  { title: "Circles & Pi", description: "Circumference, area of circles, and pi applications", category: "geometry", gradeLevel: 6, subtopics: ["circumference", "area of circles", "semicircles and quarter circles", "pi estimation"] },
  { title: "Perimeter, Area & Volume", description: "Calculate perimeters, areas, and volumes of various shapes", category: "geometry", gradeLevel: 6, subtopics: ["surface area of cuboids", "volume of prisms", "nets of 3D shapes", "composite volumes"] },

  // Algebra
  { title: "Algebraic Expressions", description: "Write, simplify, and evaluate algebraic expressions", category: "algebra", gradeLevel: 5, subtopics: ["writing expressions", "evaluating expressions", "like terms", "simplification"] },
  { title: "Linear Equations", description: "Solve one-step and two-step equations", category: "algebra", gradeLevel: 6, subtopics: ["one-step equations", "two-step equations", "equations with fractions", "word problem translation"] },
  { title: "Inequalities & Number Line", description: "Solve and graph simple inequalities", category: "algebra", gradeLevel: 6, subtopics: ["inequality symbols", "solving inequalities", "graphing on number line", "compound inequalities"] },

  // Logical Reasoning
  { title: "Advanced Logic & Deduction", description: "Complex logical puzzles requiring multi-step deduction", category: "logical-reasoning", gradeLevel: 5, subtopics: ["truth-tellers and liars", "knights and knaves", "Sudoku-style logic", "constraint satisfaction"] },
  { title: "Mathematical Olympiad Reasoning", description: "AMC/Kangaroo style problems requiring insight and creativity", category: "logical-reasoning", gradeLevel: 6, subtopics: ["pigeonhole principle", "invariants", "extremal principle", "parity arguments"] },

  // Combinatorics
  { title: "Counting & Probability", description: "Permutations, combinations, and basic probability", category: "combinatorics", gradeLevel: 5, subtopics: ["factorial counting", "permutations", "combinations", "multiplication principle"] },
  { title: "Probability with Fractions", description: "Calculate probabilities of compound events", category: "combinatorics", gradeLevel: 6, subtopics: ["independent events", "dependent events", "complementary probability", "expected value intuition"] },

  // Data Handling
  { title: "Mean, Median, Mode & Range", description: "Calculate and interpret measures of central tendency", category: "data-handling", gradeLevel: 5, subtopics: ["calculating mean", "finding median", "identifying mode", "range and outliers"] },
  { title: "Data Interpretation", description: "Analyze complex charts, misleading graphs, and draw conclusions", category: "data-handling", gradeLevel: 6, subtopics: ["pie charts", "double bar graphs", "line graphs", "misleading statistics"] },

  // ══════════════════════════════════════════════════════════════════════════
  // GRADE 7-8
  // ══════════════════════════════════════════════════════════════════════════

  // Arithmetic
  { title: "Integers & Rational Numbers", description: "Operations with negative numbers and rational number properties", category: "arithmetic", gradeLevel: 7, subtopics: ["integer operations", "absolute value", "rational number operations", "number line placement"] },
  { title: "Exponents & Scientific Notation", description: "Laws of exponents and scientific notation", category: "arithmetic", gradeLevel: 8, subtopics: ["exponent rules", "negative exponents", "scientific notation", "very large and very small numbers"] },
  { title: "Square Roots & Irrational Numbers", description: "Perfect squares, square roots, and introduction to irrationals", category: "arithmetic", gradeLevel: 8, subtopics: ["perfect squares", "estimating square roots", "simplifying radicals", "rational vs irrational"] },

  // Number Theory
  { title: "Number Theory for Competitions", description: "Advanced divisibility, Euler's theorem ideas, and Diophantine equations", category: "number-theory", gradeLevel: 7, subtopics: ["GCD and LCM advanced", "Euclidean algorithm", "digit sum properties", "perfect numbers"] },
  { title: "Modular Arithmetic", description: "Clock arithmetic, congruences, and competition applications", category: "number-theory", gradeLevel: 8, subtopics: ["modular addition/multiplication", "solving congruences", "Fermat's little theorem idea", "last digit patterns"] },

  // Geometry
  { title: "Pythagorean Theorem & Applications", description: "Prove and apply the Pythagorean theorem in various contexts", category: "geometry", gradeLevel: 7, subtopics: ["Pythagorean theorem", "Pythagorean triples", "distance formula", "3D applications"] },
  { title: "Similarity & Congruence", description: "Triangle congruence and similarity criteria and proofs", category: "geometry", gradeLevel: 7, subtopics: ["SSS, SAS, ASA, AAS", "similar triangles", "scale factor", "indirect measurement"] },
  { title: "Coordinate Geometry", description: "Slope, distance, midpoint, and line equations on the coordinate plane", category: "geometry", gradeLevel: 8, subtopics: ["plotting points", "slope calculation", "distance formula", "midpoint formula"] },
  { title: "Transformations", description: "Translations, reflections, rotations, and dilations", category: "geometry", gradeLevel: 8, subtopics: ["translations", "reflections", "rotations", "dilations and similarity"] },

  // Algebra
  { title: "Linear Equations & Graphs", description: "Solve and graph linear equations, understand slope-intercept form", category: "algebra", gradeLevel: 7, subtopics: ["slope-intercept form", "graphing lines", "parallel and perpendicular", "systems introduction"] },
  { title: "Systems of Equations", description: "Solve systems of two equations by substitution and elimination", category: "algebra", gradeLevel: 8, subtopics: ["substitution method", "elimination method", "graphical solutions", "word problems with systems"] },
  { title: "Polynomials & Factoring", description: "Operations with polynomials and basic factoring techniques", category: "algebra", gradeLevel: 8, subtopics: ["polynomial addition", "polynomial multiplication", "factoring GCF", "difference of squares"] },
  { title: "Quadratic Equations Introduction", description: "Solve simple quadratics and understand parabolas", category: "algebra", gradeLevel: 8, subtopics: ["factoring quadratics", "quadratic formula", "completing the square", "parabola properties"] },

  // Logical Reasoning
  { title: "Proof Techniques", description: "Introduction to mathematical proof: direct, contradiction, and induction ideas", category: "logical-reasoning", gradeLevel: 7, subtopics: ["direct proof", "proof by contradiction", "counterexamples", "proof by cases"] },
  { title: "Competition Problem Solving", description: "Advanced AMC 8 / MATHCOUNTS style multi-step problems", category: "logical-reasoning", gradeLevel: 8, subtopics: ["multi-step reasoning", "optimization", "construction problems", "counting arguments"] },

  // Combinatorics
  { title: "Advanced Counting", description: "Inclusion-exclusion, stars and bars, and bijection principles", category: "combinatorics", gradeLevel: 7, subtopics: ["inclusion-exclusion", "complementary counting", "overcounting and correction", "stars and bars"] },
  { title: "Probability & Expected Value", description: "Conditional probability, geometric probability, and expected value", category: "combinatorics", gradeLevel: 8, subtopics: ["conditional probability", "Bayes' theorem intuition", "geometric probability", "expected value"] },

  // Data Handling
  { title: "Statistical Analysis", description: "Interquartile range, box plots, and standard deviation concepts", category: "data-handling", gradeLevel: 7, subtopics: ["quartiles", "box and whisker plots", "standard deviation intuition", "comparing distributions"] },
  { title: "Scatter Plots & Correlation", description: "Analyze bivariate data, trend lines, and correlation", category: "data-handling", gradeLevel: 8, subtopics: ["scatter plots", "positive/negative correlation", "line of best fit", "interpolation and extrapolation"] },
];
