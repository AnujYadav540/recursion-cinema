/**
 * Practice Links for Recursion Cinema
 * Maps preset examples to their corresponding practice problems on LeetCode, GFG, HackerRank, etc.
 * 
 * Priority: GFG > LeetCode > HackerRank > CodingNinjas > InterviewBit > Article
 * Format: presetKey -> { platform, url, difficulty }
 */

export interface PracticeLink {
  platform: 'leetcode' | 'gfg' | 'hackerrank' | 'codingninjas' | 'interviewbit' | 'article';
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PRACTICE_LINKS: Record<string, PracticeLink> = {
  // ============ SIMPLE ============
  countdown: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/how-to-solve-problems-related-to-number-digits-using-recursion/',
    difficulty: 'easy'
  },
  countUp: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/how-to-solve-problems-related-to-number-digits-using-recursion/',
    difficulty: 'easy'
  },
  sumRange: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/sum-of-first-n-terms5843/1',
    difficulty: 'easy'
  },
  factorial: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/factorial5739/1',
    difficulty: 'easy'
  },
  multiply: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/multiply-two-numbers-without-using-multiply-division-bitwise-operators-and-no-loops/',
    difficulty: 'easy'
  },
  sumDigits: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/sum-of-digits1742/1',
    difficulty: 'easy'
  },
  countDigits: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/count-digits5716/1',
    difficulty: 'easy'
  },
  sumOfSquares: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/sum-of-squares-of-first-n-natural-numbers2914/1',
    difficulty: 'easy'
  },
  digitalRoot: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/digital-root/1',
    difficulty: 'easy'
  },
  reverseNumber: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/reverse-integer/',
    difficulty: 'medium'
  },
  
  // ============ INTERMEDIATE ============
  fibonacci: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/fibonacci-number/',
    difficulty: 'easy'
  },
  power: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/powx-n/',
    difficulty: 'medium'
  },
  fastPower: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/powx-n/',
    difficulty: 'medium'
  },
  gcd: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1',
    difficulty: 'easy'
  },
  lcm: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/lcm-and-gcd4516/1',
    difficulty: 'easy'
  },
  isPalindrome: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/palindrome-number/',
    difficulty: 'easy'
  },
  binarySearch: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/binary-search/',
    difficulty: 'easy'
  },
  arrayLength: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/sum-of-array-elements2502/1',
    difficulty: 'easy'
  },
  arrayMax: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/find-maximum-element-in-an-array4227/1',
    difficulty: 'easy'
  },
  countOccurrences: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/count-the-occurrences-of-an-element-in-an-array/1',
    difficulty: 'easy'
  },
  tailFactorial: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/tail-recursion/',
    difficulty: 'easy'
  },
  tailSum: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/tail-recursion/',
    difficulty: 'easy'
  },
  isPrime: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/prime-number2314/1',
    difficulty: 'easy'
  },
  geometricSum: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/program-sum-geometric-series/',
    difficulty: 'easy'
  },
  climbStairs: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'easy'
  },
  isSorted: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1',
    difficulty: 'easy'
  },
  firstIndex: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/first-occurrence-of-x-in-a-sorted-array/1',
    difficulty: 'easy'
  },
  lastIndex: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/last-occurrence-of-x-in-a-sorted-array/1',
    difficulty: 'easy'
  },
  
  // ============ ADVANCED ============
  divideConquerSum: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/divide-and-conquer-algorithm-introduction/',
    difficulty: 'medium'
  },
  divideConquerMax: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/',
    difficulty: 'medium'
  },
  divideConquerMin: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/',
    difficulty: 'medium'
  },
  countEven: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/count-even-odd-numbers-array/',
    difficulty: 'easy'
  },
  towerOfHanoi: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/tower-of-hanoi-1587115621/1',
    difficulty: 'medium'
  },
  tribonacci: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/n-th-tribonacci-number/',
    difficulty: 'easy'
  },
  catalanNumber: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/nth-catalan-number0817/1',
    difficulty: 'medium'
  },
  combinations: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/ncr1019/1',
    difficulty: 'medium'
  },
  ackermann: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/ackermann-function/1',
    difficulty: 'medium'
  },
  climbStairs3: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1',
    difficulty: 'medium'
  },
  minCoins: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'medium'
  },
  subsetSum: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1',
    difficulty: 'medium'
  },
  
  // ============ DYNAMIC PROGRAMMING ============
  dpFibonacci: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/fibonacci-number/',
    difficulty: 'easy'
  },
  dpClimbStairs: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'easy'
  },
  dpMinCost: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
    difficulty: 'easy'
  },
  dpHouseRobber: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/house-robber/',
    difficulty: 'medium'
  },
  dpMaxSubarray: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/maximum-subarray/',
    difficulty: 'medium'
  },
  dpJumpGame: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/jump-game/',
    difficulty: 'medium'
  },
  dpPerfectSquares: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/perfect-squares/',
    difficulty: 'medium'
  },
  dpCoinChange: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'medium'
  },
  dpCoinChangeWays: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/coin-change-ii/',
    difficulty: 'medium'
  },
  dpTribonacci: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/n-th-tribonacci-number/',
    difficulty: 'easy'
  },
  dpSubsetSum: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1',
    difficulty: 'medium'
  },
  dpPartitionEqual: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    difficulty: 'medium'
  },
  dpTargetSum: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/target-sum/',
    difficulty: 'medium'
  },
  dpKnapsack01: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1',
    difficulty: 'medium'
  },
  dpUnboundedKnapsack: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1',
    difficulty: 'medium'
  },
  dpUniquePaths: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/unique-paths/',
    difficulty: 'medium'
  },
  dpPalindromeCheck: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/valid-palindrome/',
    difficulty: 'easy'
  },
  dpCatalan: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/nth-catalan-number0817/1',
    difficulty: 'medium'
  },
  dpBinomialCoeff: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/ncr1019/1',
    difficulty: 'medium'
  },
  dpBellNumber: {
    platform: 'article',
    url: 'https://www.geeksforgeeks.org/bell-numbers-number-of-ways-to-partition-a-set/',
    difficulty: 'medium'
  },
  dpRodCutting: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/rod-cutting0840/1',
    difficulty: 'medium'
  },
  dpWordBreak: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/word-break/',
    difficulty: 'medium'
  },
  dpMaxProduct: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/maximum-product-cutting--170645/1',
    difficulty: 'medium'
  },
  dpCountBST: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/unique-binary-search-trees/',
    difficulty: 'medium'
  },
  dpPaintFence: {
    platform: 'codingninjas',
    url: 'https://www.naukri.com/code360/problems/ninja-and-the-fence_3210208',
    difficulty: 'medium'
  },
  dpCountSubsets: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1',
    difficulty: 'medium'
  },
  dpMaxSumNoAdjacent: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1',
    difficulty: 'medium'
  },
  dpStaircase: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1',
    difficulty: 'medium'
  },
  dpFriendsPairing: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/friends-pairing-problem5425/1',
    difficulty: 'medium'
  },
  dpTilingProblem: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/domino-and-tromino-tiling/',
    difficulty: 'medium'
  },
  dpEggDrop: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/super-egg-drop/',
    difficulty: 'hard'
  },
  dpPalindromePartition: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/palindrome-partitioning-ii/',
    difficulty: 'hard'
  },
  
  // ============ BACKTRACKING ============
  btCountSubsets: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/subsets/',
    difficulty: 'medium'
  },
  btCountPermutations: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/permutations/',
    difficulty: 'medium'
  },
  btGenerateBinary: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/generate-all-binary-strings/1',
    difficulty: 'easy'
  },
  btNQueensCount: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/n-queens/',
    difficulty: 'hard'
  },
  btSubsetSumK: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1',
    difficulty: 'medium'
  },
  btPartitionKSubsets: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/',
    difficulty: 'medium'
  },
  btLetterCombinations: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
    difficulty: 'medium'
  },
  btKnightTour: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/knight-walk4521/1',
    difficulty: 'hard'
  },
  btPalindromePartition: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/palindrome-partitioning/',
    difficulty: 'medium'
  },
  btCountDerangements: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/count-derangements/1',
    difficulty: 'medium'
  },
  btCountInversions: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1',
    difficulty: 'medium'
  },
  btMaxPathSum: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/gold-mine-problem2608/1',
    difficulty: 'medium'
  },
  btStringPermCount: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/permutations-ii/',
    difficulty: 'medium'
  },
  btGraphColoring: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1',
    difficulty: 'medium'
  },
  btCombinationsK: {
    platform: 'leetcode',
    url: 'https://leetcode.com/problems/combinations/',
    difficulty: 'medium'
  },
  btMaze4Dir: {
    platform: 'gfg',
    url: 'https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1',
    difficulty: 'medium'
  },
};

// Platform display names and colors
export const PLATFORM_INFO = {
  leetcode: { name: 'LeetCode', color: '#FFA116', icon: '🟠' },
  gfg: { name: 'GeeksforGeeks', color: '#2F8D46', icon: '🟢' },
  hackerrank: { name: 'HackerRank', color: '#00EA64', icon: '🟩' },
  codingninjas: { name: 'Coding Ninjas', color: '#F97316', icon: '🟧' },
  interviewbit: { name: 'InterviewBit', color: '#3B82F6', icon: '🔵' },
  article: { name: 'Read Article', color: '#8B5CF6', icon: '📖' }
};

export const DIFFICULTY_INFO = {
  easy: { name: 'Easy', color: '#00B8A3' },
  medium: { name: 'Medium', color: '#FFC01E' },
  hard: { name: 'Hard', color: '#FF375F' }
};
