import { useState } from 'react';
import './LearnSection.css';

interface Topic {
  id: string;
  title: string;
  icon: string;
  content: JSX.Element;
}

const LearnSection = () => {
  const [activeTopic, setActiveTopic] = useState<string>('what-is');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const topics: Topic[] = [
    {
      id: 'what-is',
      title: 'What is Recursion?',
      icon: '🔄',
      content: (
        <div className="topic-content">
          <h3>Understanding Recursion</h3>
          <p>
            Recursion is when a function calls itself to solve a problem. Think of it like looking into two mirrors facing each other - you see reflections of reflections!
          </p>
          <div className="example-box">
            <h4>Real-World Example: Searching Through Folders 📁</h4>
            <p>
              Imagine searching for a file on your computer. You open a folder, and inside you find more folders. 
              You open each folder, and if it contains more folders, you open those too! 
              You keep going until you find the file or reach folders with no subfolders.
            </p>
            <p className="highlight">
              <strong>That's recursion!</strong> Each folder-opening is like a function call, and empty folders (or finding the file) are your base cases.
            </p>
          </div>
          <div className="code-example">
            <h4>Simple Example: Countdown</h4>
            <pre>{`void countdown(int n) {
    if (n == 0) {           // Base case
        System.out.println("Blast off!");
        return;
    }
    System.out.println(n);  // Do something
    countdown(n - 1);       // Recursive call
}`}</pre>
          </div>
        </div>
      ),
    },
    {
      id: 'base-case',
      title: 'Base Case vs Recursive Case',
      icon: '🎯',
      content: (
        <div className="topic-content">
          <h3>The Two Essential Parts</h3>
          <p>Every recursive function needs TWO things:</p>
          
          <div className="two-column">
            <div className="column">
              <h4>1️⃣ Base Case (Stop Condition)</h4>
              <p>This is where recursion STOPS. Without it, your function runs forever!</p>
              <div className="mini-example">
                <pre>{`if (n == 0) {
    return 1;  // STOP!
}`}</pre>
              </div>
            </div>
            
            <div className="column">
              <h4>2️⃣ Recursive Case (Keep Going)</h4>
              <p>This is where the function calls itself with a SMALLER problem.</p>
              <div className="mini-example">
                <pre>{`return n * factorial(n - 1);
// Call yourself with n-1`}</pre>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <h4>⚠️ Common Mistake: Missing Base Case</h4>
            <pre>{`// BAD - Infinite recursion!
int factorial(int n) {
    return n * factorial(n - 1);  // Never stops!
}

// GOOD - Has base case
int factorial(int n) {
    if (n == 0) return 1;         // Stops here!
    return n * factorial(n - 1);
}`}</pre>
          </div>
        </div>
      ),
    },
    {
      id: 'call-stack',
      title: 'How the Call Stack Works',
      icon: '📚',
      content: (
        <div className="topic-content">
          <h3>Understanding the Call Stack</h3>
          <p>
            When a function calls itself, each call gets added to a "stack" (like stacking plates). 
            When a function finishes, it gets removed from the top.
          </p>
          
          <div className="example-box">
            <h4>Example: factorial(3)</h4>
            <div className="stack-visual">
              <div className="stack-step">
                <strong>Step 1:</strong> Call factorial(3)
                <div className="stack-frame">factorial(3)</div>
              </div>
              <div className="stack-step">
                <strong>Step 2:</strong> factorial(3) calls factorial(2)
                <div className="stack-frame">factorial(2)</div>
                <div className="stack-frame">factorial(3)</div>
              </div>
              <div className="stack-step">
                <strong>Step 3:</strong> factorial(2) calls factorial(1)
                <div className="stack-frame">factorial(1)</div>
                <div className="stack-frame">factorial(2)</div>
                <div className="stack-frame">factorial(3)</div>
              </div>
              <div className="stack-step">
                <strong>Step 4:</strong> factorial(1) calls factorial(0)
                <div className="stack-frame">factorial(0) → returns 1</div>
                <div className="stack-frame">factorial(1)</div>
                <div className="stack-frame">factorial(2)</div>
                <div className="stack-frame">factorial(3)</div>
              </div>
              <div className="stack-step">
                <strong>Step 5:</strong> Now they return one by one!
                <p className="return-flow">
                  factorial(0) returns 1 → factorial(1) returns 1 → 
                  factorial(2) returns 2 → factorial(3) returns 6
                </p>
              </div>
            </div>
          </div>

          <div className="tip-box">
            <h4>💡 Key Insight</h4>
            <p>
              The stack grows DOWN (adding calls) until it hits the base case, 
              then shrinks UP (returning values). This is why recursion is also called "divide and conquer"!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'patterns',
      title: 'Common Recursion Patterns',
      icon: '🔀',
      content: (
        <div className="topic-content">
          <h3>Recursion Patterns You'll See Everywhere</h3>
          
          <div className="pattern-card">
            <h4>1. Linear Recursion (One Call)</h4>
            <p>Function calls itself once per execution.</p>
            <pre>{`int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n - 1);  // One recursive call
}`}</pre>
            <p className="pattern-use">Use for: Counting, summing, factorial</p>
          </div>

          <div className="pattern-card">
            <h4>2. Binary Recursion (Two Calls)</h4>
            <p>Function calls itself twice - creates a tree!</p>
            <pre>{`int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);  // Two calls!
}`}</pre>
            <p className="pattern-use">Use for: Fibonacci, tree traversal, merge sort</p>
          </div>

          <div className="pattern-card">
            <h4>3. Tail Recursion (Last Thing)</h4>
            <p>Recursive call is the LAST thing the function does.</p>
            <pre>{`int factorial(int n, int acc) {
    if (n == 0) return acc;
    return factorial(n-1, n * acc);  // Nothing after this!
}`}</pre>
            <p className="pattern-use">Use for: Optimization (some languages optimize this)</p>
          </div>

          <div className="pattern-card">
            <h4>4. Multiple Recursion (Many Calls)</h4>
            <p>Function calls itself multiple times in different ways.</p>
            <pre>{`void printPermutations(String str, String prefix) {
    if (str.length() == 0) {
        System.out.println(prefix);
    } else {
        for (int i = 0; i < str.length(); i++) {
            printPermutations(
                str.substring(0,i) + str.substring(i+1),
                prefix + str.charAt(i)
            );  // Multiple recursive calls in loop!
        }
    }
}`}</pre>
            <p className="pattern-use">Use for: Permutations, combinations, backtracking</p>
          </div>
        </div>
      ),
    },
    {
      id: 'when-to-use',
      title: 'When to Use Recursion',
      icon: '🤔',
      content: (
        <div className="topic-content">
          <h3>Recursion vs Iteration: When to Choose?</h3>
          
          <div className="comparison">
            <div className="use-recursion">
              <h4>✅ Use Recursion When:</h4>
              <ul>
                <li>Problem naturally breaks into smaller sub-problems</li>
                <li>Working with tree or graph structures</li>
                <li>Implementing divide-and-conquer algorithms</li>
                <li>Code becomes much simpler than iteration</li>
                <li>Backtracking problems (exploring all possibilities)</li>
              </ul>
              <div className="example-list">
                <strong>Perfect for:</strong>
                <span className="tag">Tree Traversal</span>
                <span className="tag">Merge Sort</span>
                <span className="tag">Quick Sort</span>
                <span className="tag">DFS</span>
                <span className="tag">Backtracking</span>
              </div>
            </div>

            <div className="use-iteration">
              <h4>✅ Use Iteration When:</h4>
              <ul>
                <li>Simple counting or looping</li>
                <li>Performance is critical (recursion has overhead)</li>
                <li>Risk of stack overflow with deep recursion</li>
                <li>Problem is naturally sequential</li>
              </ul>
              <div className="example-list">
                <strong>Better for:</strong>
                <span className="tag">Simple Loops</span>
                <span className="tag">Array Iteration</span>
                <span className="tag">Counting</span>
              </div>
            </div>
          </div>

          <div className="comparison-example">
            <h4>Same Problem, Two Ways:</h4>
            <div className="side-by-side">
              <div>
                <strong>Recursive:</strong>
                <pre>{`int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n-1);
}`}</pre>
              </div>
              <div>
                <strong>Iterative:</strong>
                <pre>{`int sum(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}`}</pre>
              </div>
            </div>
            <p className="note">For simple problems like this, iteration is usually better. But for trees? Recursion wins!</p>
          </div>
        </div>
      ),
    },
    {
      id: 'complexity',
      title: 'Time & Space Complexity',
      icon: '⚡',
      content: (
        <div className="topic-content">
          <h3>Understanding Recursion Performance</h3>
          
          <div className="complexity-card">
            <h4>Time Complexity</h4>
            <p>How many times does the function call itself?</p>
            
            <div className="complexity-example">
              <strong>Linear Recursion: O(n)</strong>
              <pre>{`int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n-1);
}
// Calls: n → n-1 → n-2 → ... → 0
// Total calls: n times = O(n)`}</pre>
            </div>

            <div className="complexity-example">
              <strong>Binary Recursion: O(2ⁿ)</strong>
              <pre>{`int fibonacci(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
// Each call makes 2 more calls!
// Total calls: 2^n = O(2^n) - SLOW!`}</pre>
              <p className="warning">⚠️ This is why naive Fibonacci is slow for large n!</p>
            </div>

            <div className="complexity-example">
              <strong>Divide & Conquer: O(n log n)</strong>
              <pre>{`void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int mid = (l + r) / 2;
        mergeSort(arr, l, mid);      // Half
        mergeSort(arr, mid+1, r);    // Half
        merge(arr, l, mid, r);
    }
}
// Splits in half each time = O(n log n)`}</pre>
            </div>
          </div>

          <div className="complexity-card">
            <h4>Space Complexity</h4>
            <p>How much memory does the call stack use?</p>
            
            <div className="space-example">
              <p>
                <strong>Rule of thumb:</strong> Space = Maximum depth of recursion
              </p>
              <ul>
                <li><code>factorial(n)</code> → Stack depth = n → Space: O(n)</li>
                <li><code>fibonacci(n)</code> → Stack depth = n → Space: O(n)</li>
                <li><code>binarySearch(n)</code> → Stack depth = log n → Space: O(log n)</li>
              </ul>
            </div>

            <div className="warning-box">
              <h4>⚠️ Stack Overflow!</h4>
              <p>
                If recursion goes too deep (usually 1000-10000 calls), you'll get a 
                <strong> StackOverflowError</strong>. This happens when the call stack runs out of memory!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes',
      icon: '⚠️',
      content: (
        <div className="topic-content">
          <h3>Avoid These Common Pitfalls</h3>
          
          <div className="mistake-card">
            <h4>❌ Mistake 1: Forgetting Base Case</h4>
            <pre className="bad">{`// BAD - Infinite recursion!
int countdown(int n) {
    System.out.println(n);
    countdown(n - 1);  // Never stops!
}`}</pre>
            <pre className="good">{`// GOOD - Has base case
int countdown(int n) {
    if (n == 0) return;  // STOP!
    System.out.println(n);
    countdown(n - 1);
}`}</pre>
          </div>

          <div className="mistake-card">
            <h4>❌ Mistake 2: Not Making Progress</h4>
            <pre className="bad">{`// BAD - n never changes!
int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n);  // Same n!
}`}</pre>
            <pre className="good">{`// GOOD - n gets smaller
int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n - 1);  // n-1 is smaller!
}`}</pre>
          </div>

          <div className="mistake-card">
            <h4>❌ Mistake 3: Wrong Base Case</h4>
            <pre className="bad">{`// BAD - Misses n=1
int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}
// factorial(-1) → infinite!`}</pre>
            <pre className="good">{`// GOOD - Handles edge cases
int factorial(int n) {
    if (n <= 1) return 1;  // Covers 0 and 1
    return n * factorial(n - 1);
}`}</pre>
          </div>

          <div className="mistake-card">
            <h4>❌ Mistake 4: Modifying Parameters Wrong</h4>
            <pre className="bad">{`// BAD - Modifies original array
void process(int[] arr) {
    if (arr.length == 0) return;
    arr[0] = 0;  // Changes original!
    process(Arrays.copyOfRange(arr, 1, arr.length));
}`}</pre>
            <pre className="good">{`// GOOD - Uses index instead
void process(int[] arr, int index) {
    if (index >= arr.length) return;
    System.out.println(arr[index]);
    process(arr, index + 1);
}`}</pre>
          </div>

          <div className="tip-box">
            <h4>💡 Debugging Tips</h4>
            <ul>
              <li>Print parameters at the start of each call</li>
              <li>Check if your problem is getting SMALLER</li>
              <li>Test with small inputs first (n=0, n=1, n=2)</li>
              <li>Use our visualizer to see the call stack!</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming',
      icon: '💎',
      content: (
        <div className="topic-content">
          <h3>Making Recursion Faster with DP</h3>
          <p>
            Dynamic Programming (DP) is recursion + memory. We save results so we don't recalculate them!
          </p>
          
          <div className="dp-comparison">
            <div className="without-dp">
              <h4>❌ Without DP: Slow Fibonacci</h4>
              <pre>{`int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
// fib(5) calls fib(3) twice!
// fib(4) calls fib(3) again!
// Lots of repeated work = O(2^n)`}</pre>
              <div className="tree-visual">
                <pre>{`        fib(5)
       /      \\
    fib(4)   fib(3)  ← Calculated twice!
    /   \\     /   \\
 fib(3) fib(2) ...
 /   \\
...  ...`}</pre>
              </div>
            </div>

            <div className="with-dp">
              <h4>✅ With DP: Fast Fibonacci</h4>
              <pre>{`int fib(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];  // Already calculated!
    
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}
// Each fib(n) calculated only once!
// Time: O(n) instead of O(2^n)`}</pre>
            </div>
          </div>

          <div className="dp-types">
            <h4>Two DP Approaches:</h4>
            
            <div className="dp-type">
              <h5>1. Memoization (Top-Down)</h5>
              <p>Start from the problem, save results as you go.</p>
              <pre>{`int fib(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    
    int result = fib(n-1, memo) + fib(n-2, memo);
    memo.put(n, result);
    return result;
}`}</pre>
              <p className="note">This is recursion + caching!</p>
            </div>

            <div className="dp-type">
              <h5>2. Tabulation (Bottom-Up)</h5>
              <p>Start from base case, build up to the answer.</p>
              <pre>{`int fib(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`}</pre>
              <p className="note">This is iteration + table!</p>
            </div>
          </div>

          <div className="tip-box">
            <h4>💡 When to Use DP?</h4>
            <ul>
              <li>Problem has <strong>overlapping subproblems</strong> (same calculation multiple times)</li>
              <li>Problem has <strong>optimal substructure</strong> (optimal solution uses optimal sub-solutions)</li>
              <li>Examples: Fibonacci, Longest Common Subsequence, Knapsack, Coin Change</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'backtracking',
      title: 'Backtracking',
      icon: '🔙',
      content: (
        <div className="topic-content">
          <h3>Exploring All Possibilities</h3>
          <p>
            Backtracking is recursion that tries different paths. If a path doesn't work, 
            we "backtrack" and try another one!
          </p>
          
          <div className="example-box">
            <h4>Think of it like a Maze 🌟</h4>
            <p>
              You're in a maze. At each intersection, you pick a path. If it leads to a dead end, 
              you go back and try a different path. That's backtracking!
            </p>
          </div>

          <div className="backtracking-pattern">
            <h4>The Backtracking Pattern:</h4>
            <pre>{`void backtrack(state, choices) {
    if (isGoal(state)) {
        // Found a solution!
        saveSolution(state);
        return;
    }
    
    for (choice in choices) {
        if (isValid(choice)) {
            makeChoice(choice);           // Try it
            backtrack(newState, newChoices);  // Recurse
            undoChoice(choice);           // Backtrack!
        }
    }
}`}</pre>
          </div>

          <div className="backtracking-example">
            <h4>Example: N-Queens Problem</h4>
            <p>Place N queens on an N×N chessboard so none attack each other.</p>
            <pre>{`void solveNQueens(int row, int[] board) {
    if (row == N) {
        printSolution(board);  // Found a solution!
        return;
    }
    
    for (int col = 0; col < N; col++) {
        if (isSafe(row, col, board)) {
            board[row] = col;              // Place queen
            solveNQueens(row + 1, board);  // Try next row
            board[row] = -1;               // Remove queen (backtrack!)
        }
    }
}`}</pre>
          </div>

          <div className="backtracking-example">
            <h4>Example: Generate All Subsets</h4>
            <pre>{`void subsets(int[] nums, int index, List<Integer> current) {
    if (index == nums.length) {
        System.out.println(current);  // Print subset
        return;
    }
    
    // Choice 1: Include nums[index]
    current.add(nums[index]);
    subsets(nums, index + 1, current);
    current.remove(current.size() - 1);  // Backtrack!
    
    // Choice 2: Don't include nums[index]
    subsets(nums, index + 1, current);
}`}</pre>
          </div>

          <div className="tip-box">
            <h4>💡 Backtracking Use Cases</h4>
            <ul>
              <li><strong>Permutations & Combinations:</strong> Generate all arrangements</li>
              <li><strong>Sudoku Solver:</strong> Try numbers, backtrack if invalid</li>
              <li><strong>Maze Solving:</strong> Try paths, backtrack from dead ends</li>
              <li><strong>N-Queens:</strong> Place queens, backtrack if attacked</li>
              <li><strong>Word Search:</strong> Try letters, backtrack if no match</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'divide-conquer',
      title: 'Divide & Conquer',
      icon: '✂️',
      content: (
        <div className="topic-content">
          <h3>Break Big Problems into Small Ones</h3>
          <p>
            Divide & Conquer splits a problem into smaller pieces, solves each piece, 
            then combines the results. It's like teamwork!
          </p>
          
          <div className="dc-steps">
            <h4>The Three Steps:</h4>
            <div className="step-card">
              <span className="step-number">1</span>
              <div>
                <h5>Divide</h5>
                <p>Split the problem into smaller sub-problems</p>
              </div>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <div>
                <h5>Conquer</h5>
                <p>Solve each sub-problem recursively</p>
              </div>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <div>
                <h5>Combine</h5>
                <p>Merge the solutions together</p>
              </div>
            </div>
          </div>

          <div className="dc-example">
            <h4>Example: Merge Sort</h4>
            <pre>{`void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return;  // Base case
    
    // 1. DIVIDE: Split array in half
    int mid = (left + right) / 2;
    
    // 2. CONQUER: Sort each half
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    
    // 3. COMBINE: Merge sorted halves
    merge(arr, left, mid, right);
}`}</pre>
            <div className="visual-example">
              <pre>{`[38, 27, 43, 3, 9, 82, 10]
         ↓ DIVIDE
    [38, 27, 43, 3]  [9, 82, 10]
         ↓ DIVIDE
  [38, 27] [43, 3]  [9, 82] [10]
      ↓ DIVIDE
 [38] [27] [43] [3] [9] [82] [10]
      ↓ CONQUER & COMBINE
  [27, 38] [3, 43]  [9, 82] [10]
         ↓ COMBINE
    [3, 27, 38, 43]  [9, 10, 82]
         ↓ COMBINE
    [3, 9, 10, 27, 38, 43, 82]`}</pre>
            </div>
          </div>

          <div className="dc-example">
            <h4>Example: Binary Search</h4>
            <pre>{`int binarySearch(int[] arr, int target, int left, int right) {
    if (left > right) return -1;  // Not found
    
    // 1. DIVIDE: Check middle
    int mid = (left + right) / 2;
    
    if (arr[mid] == target) return mid;  // Found!
    
    // 2. CONQUER: Search one half
    if (target < arr[mid]) {
        return binarySearch(arr, target, left, mid - 1);
    } else {
        return binarySearch(arr, target, mid + 1, right);
    }
    // 3. COMBINE: Not needed here!
}`}</pre>
          </div>

          <div className="comparison-box">
            <h4>Divide & Conquer vs Regular Recursion</h4>
            <table>
              <tr>
                <th>Divide & Conquer</th>
                <th>Regular Recursion</th>
              </tr>
              <tr>
                <td>Splits problem into independent parts</td>
                <td>Reduces problem size by small amount</td>
              </tr>
              <tr>
                <td>Usually O(n log n) or O(log n)</td>
                <td>Usually O(n) or O(2^n)</td>
              </tr>
              <tr>
                <td>Examples: Merge Sort, Quick Sort, Binary Search</td>
                <td>Examples: Factorial, Fibonacci, Countdown</td>
              </tr>
            </table>
          </div>

          <div className="tip-box">
            <h4>💡 Famous Divide & Conquer Algorithms</h4>
            <ul>
              <li><strong>Merge Sort:</strong> O(n log n) sorting</li>
              <li><strong>Quick Sort:</strong> O(n log n) average sorting</li>
              <li><strong>Binary Search:</strong> O(log n) searching</li>
              <li><strong>Strassen's Matrix Multiplication:</strong> Faster matrix multiplication</li>
              <li><strong>Closest Pair of Points:</strong> Computational geometry</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="learn" className={`learn-section ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="learn-container">
        <div className="learn-header">
          <h2>📚 Learn Recursion</h2>
          <p>Master recursion with easy-to-understand explanations and examples</p>
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="learn-content">
          <div className="topic-sidebar">
            {topics.map((topic) => (
              <button
                key={topic.id}
                className={`topic-button ${activeTopic === topic.id ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic.id)}
              >
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-title">{topic.title}</span>
              </button>
            ))}
          </div>

          <div className="topic-display">
            {topics.find((t) => t.id === activeTopic)?.content}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnSection;
