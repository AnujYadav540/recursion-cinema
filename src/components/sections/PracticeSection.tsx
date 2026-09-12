/**
 * PracticeSection - Important recursion problems with direct links to coding platforms
 * Organized by difficulty level with platform dropdown selection
 */

import { useState } from 'react';
import './PracticeSection.css';

type Platform = 'all' | 'leetcode' | 'gfg' | 'hackerrank';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PracticeProblem {
  name: string;
  difficulty: Difficulty;
  category: string;
  links: {
    leetcode?: string;
    gfg?: string;
    hackerrank?: string;
  };
}

// Important recursion problems with direct links
const PRACTICE_PROBLEMS: PracticeProblem[] = [
  // ============ EASY ============
  {
    name: 'Factorial',
    difficulty: 'easy',
    category: 'Basic',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/factorial5739/1',
      hackerrank: 'https://www.hackerrank.com/challenges/30-recursion/problem'
    }
  },
  {
    name: 'Fibonacci Number',
    difficulty: 'easy',
    category: 'Basic',
    links: {
      leetcode: 'https://leetcode.com/problems/fibonacci-number/',
      gfg: 'https://www.geeksforgeeks.org/problems/print-first-n-fibonacci-numbers1002/1'
    }
  },
  {
    name: 'Sum of Digits',
    difficulty: 'easy',
    category: 'Basic',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/sum-of-digits1742/1',
      hackerrank: 'https://www.hackerrank.com/challenges/recursive-digit-sum/problem'
    }
  },
  {
    name: 'Power of Two',
    difficulty: 'easy',
    category: 'Basic',
    links: {
      leetcode: 'https://leetcode.com/problems/power-of-two/',
      gfg: 'https://www.geeksforgeeks.org/problems/power-of-2-1587115620/1'
    }
  },
  {
    name: 'Climbing Stairs',
    difficulty: 'easy',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/climbing-stairs/',
      gfg: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1'
    }
  },
  {
    name: 'Binary Search',
    difficulty: 'easy',
    category: 'Divide & Conquer',
    links: {
      leetcode: 'https://leetcode.com/problems/binary-search/',
      gfg: 'https://www.geeksforgeeks.org/problems/binary-search-1587115620/1'
    }
  },
  {
    name: 'GCD (Euclidean)',
    difficulty: 'easy',
    category: 'Math',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1',
      hackerrank: 'https://www.hackerrank.com/challenges/functional-programming-warmups-in-recursion---gcd/problem'
    }
  },
  {
    name: 'Reverse String',
    difficulty: 'easy',
    category: 'String',
    links: {
      leetcode: 'https://leetcode.com/problems/reverse-string/',
      gfg: 'https://www.geeksforgeeks.org/problems/reverse-a-string/1'
    }
  },

  // ============ MEDIUM ============
  {
    name: 'Pow(x, n)',
    difficulty: 'medium',
    category: 'Math',
    links: {
      leetcode: 'https://leetcode.com/problems/powx-n/',
      gfg: 'https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1'
    }
  },
  {
    name: 'Tower of Hanoi',
    difficulty: 'medium',
    category: 'Classic',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/tower-of-hanoi-1587115621/1',
      hackerrank: 'https://www.hackerrank.com/challenges/tower-of-hanoi/problem'
    }
  },
  {
    name: 'Generate Parentheses',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/generate-parentheses/',
      gfg: 'https://www.geeksforgeeks.org/problems/generate-all-possible-parentheses/1'
    }
  },
  {
    name: 'Subsets',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/subsets/',
      gfg: 'https://www.geeksforgeeks.org/problems/subsets-1613027340/1'
    }
  },
  {
    name: 'Permutations',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/permutations/',
      gfg: 'https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1'
    }
  },
  {
    name: 'Combination Sum',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/combination-sum/',
      gfg: 'https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1'
    }
  },
  {
    name: 'House Robber',
    difficulty: 'medium',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/house-robber/',
      gfg: 'https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1'
    }
  },
  {
    name: 'Coin Change',
    difficulty: 'medium',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/coin-change/',
      gfg: 'https://www.geeksforgeeks.org/problems/coin-change2448/1'
    }
  },
  {
    name: 'Unique Paths',
    difficulty: 'medium',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/unique-paths/',
      gfg: 'https://www.geeksforgeeks.org/problems/number-of-unique-paths5339/1'
    }
  },
  {
    name: 'Jump Game',
    difficulty: 'medium',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/jump-game/',
      gfg: 'https://www.geeksforgeeks.org/problems/jump-game/1'
    }
  },
  {
    name: 'Word Search',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/word-search/',
      gfg: 'https://www.geeksforgeeks.org/problems/word-search/1'
    }
  },
  {
    name: 'Letter Combinations',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
      gfg: 'https://www.geeksforgeeks.org/problems/possible-words-from-phone-digits-1587115620/1'
    }
  },
  {
    name: 'Rat in a Maze',
    difficulty: 'medium',
    category: 'Backtracking',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1',
      hackerrank: 'https://www.hackerrank.com/challenges/ctci-recursive-staircase/problem'
    }
  },
  {
    name: '0/1 Knapsack',
    difficulty: 'medium',
    category: 'DP',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1',
      hackerrank: 'https://www.hackerrank.com/challenges/unbounded-knapsack/problem'
    }
  },
  {
    name: 'Subset Sum',
    difficulty: 'medium',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/partition-equal-subset-sum/',
      gfg: 'https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1'
    }
  },
  {
    name: 'Number of Islands',
    difficulty: 'medium',
    category: 'DFS',
    links: {
      leetcode: 'https://leetcode.com/problems/number-of-islands/',
      gfg: 'https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1'
    }
  },

  // ============ HARD ============
  {
    name: 'N-Queens',
    difficulty: 'hard',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/n-queens/',
      gfg: 'https://www.geeksforgeeks.org/problems/n-queen-problem0315/1'
    }
  },
  {
    name: 'Sudoku Solver',
    difficulty: 'hard',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/sudoku-solver/',
      gfg: 'https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1'
    }
  },
  {
    name: 'Word Break II',
    difficulty: 'hard',
    category: 'Backtracking',
    links: {
      leetcode: 'https://leetcode.com/problems/word-break-ii/',
      gfg: 'https://www.geeksforgeeks.org/problems/word-break-part-23249/1'
    }
  },
  {
    name: 'Regular Expression Matching',
    difficulty: 'hard',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/regular-expression-matching/',
      gfg: 'https://www.geeksforgeeks.org/problems/wildcard-pattern-matching/1'
    }
  },
  {
    name: 'Edit Distance',
    difficulty: 'hard',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/edit-distance/',
      gfg: 'https://www.geeksforgeeks.org/problems/edit-distance3702/1'
    }
  },
  {
    name: 'Longest Common Subsequence',
    difficulty: 'hard',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/longest-common-subsequence/',
      gfg: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1'
    }
  },
  {
    name: 'Matrix Chain Multiplication',
    difficulty: 'hard',
    category: 'DP',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1',
      hackerrank: 'https://www.hackerrank.com/challenges/matrix-chain-multiplication/problem'
    }
  },
  {
    name: 'Egg Drop Problem',
    difficulty: 'hard',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/super-egg-drop/',
      gfg: 'https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1'
    }
  },
  {
    name: 'Palindrome Partitioning II',
    difficulty: 'hard',
    category: 'DP',
    links: {
      leetcode: 'https://leetcode.com/problems/palindrome-partitioning-ii/',
      gfg: 'https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1'
    }
  },
  {
    name: 'M-Coloring Problem',
    difficulty: 'hard',
    category: 'Backtracking',
    links: {
      gfg: 'https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1',
      hackerrank: 'https://www.hackerrank.com/challenges/graph-coloring/problem'
    }
  }
];

const PLATFORM_CONFIG = {
  leetcode: { name: 'LeetCode', icon: '🟠', color: '#FFA116' },
  gfg: { name: 'GeeksforGeeks', icon: '🟢', color: '#2F8D46' },
  hackerrank: { name: 'HackerRank', icon: '🟩', color: '#00EA64' }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: '#00B8A3' },
  medium: { label: 'Medium', color: '#FFC01E' },
  hard: { label: 'Hard', color: '#FF375F' }
};

const PracticeSection = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  const filteredProblems = PRACTICE_PROBLEMS.filter(problem => {
    const difficultyMatch = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const platformMatch = selectedPlatform === 'all' || problem.links[selectedPlatform];
    return difficultyMatch && platformMatch;
  });

  const getLink = (problem: PracticeProblem): string | null => {
    if (selectedPlatform !== 'all' && problem.links[selectedPlatform]) {
      return problem.links[selectedPlatform]!;
    }
    // Return first available link
    return problem.links.leetcode || problem.links.gfg || problem.links.hackerrank || null;
  };

  const getPlatformForLink = (problem: PracticeProblem): keyof typeof PLATFORM_CONFIG | null => {
    if (selectedPlatform !== 'all' && problem.links[selectedPlatform]) {
      return selectedPlatform;
    }
    if (problem.links.leetcode) return 'leetcode';
    if (problem.links.gfg) return 'gfg';
    if (problem.links.hackerrank) return 'hackerrank';
    return null;
  };

  return (
    <section id="practice" className="practice-section">
      <div className="practice-container">
        <h2 className="practice-title">
          <span className="title-icon">🎯</span>
          Practice Problems
        </h2>
        <p className="practice-subtitle">
          Master recursion with these curated problems from top coding platforms
        </p>

        <div className="practice-filters">
          <div className="filter-group">
            <label>Platform:</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="filter-select"
            >
              <option value="all">All Platforms</option>
              <option value="leetcode">🟠 LeetCode</option>
              <option value="gfg">🟢 GeeksforGeeks</option>
              <option value="hackerrank">🟩 HackerRank</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Difficulty:</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>
        </div>

        <div className="problems-grid">
          {filteredProblems.map((problem, index) => {
            const link = getLink(problem);
            const platform = getPlatformForLink(problem);
            const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
            
            return (
              <a
                key={index}
                href={link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="problem-card"
              >
                <div className="problem-header">
                  <span className="problem-name">{problem.name}</span>
                  <span 
                    className="problem-difficulty"
                    style={{ background: diffConfig.color }}
                  >
                    {diffConfig.label}
                  </span>
                </div>
                <div className="problem-footer">
                  <span className="problem-category">{problem.category}</span>
                  {platform && (
                    <span className="problem-platform">
                      {PLATFORM_CONFIG[platform].icon} {PLATFORM_CONFIG[platform].name}
                    </span>
                  )}
                </div>
                <div className="available-platforms">
                  {problem.links.leetcode && <span className="platform-dot leetcode" title="LeetCode">🟠</span>}
                  {problem.links.gfg && <span className="platform-dot gfg" title="GeeksforGeeks">🟢</span>}
                  {problem.links.hackerrank && <span className="platform-dot hackerrank" title="HackerRank">🟩</span>}
                </div>
              </a>
            );
          })}
        </div>

        <p className="problems-count">
          Showing {filteredProblems.length} of {PRACTICE_PROBLEMS.length} problems
        </p>
      </div>
    </section>
  );
};

export default PracticeSection;
