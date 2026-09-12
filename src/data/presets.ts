/**
 * Code preset examples for Recursion Cinema
 * Organized by complexity: Simple → Intermediate → Advanced → DP → Backtracking
 * 
 * Each example has detailed line-by-line comments to help students understand:
 * - What each line does
 * - Why it's needed
 * - How the recursion works
 */

export interface PresetExample {
  name: string;
  category: 'simple' | 'intermediate' | 'advanced' | 'dp' | 'backtracking';
  code: string;
}

export const EXAMPLES: Record<string, PresetExample> = {
  // ============ SIMPLE EXAMPLES ============
  // These teach basic recursion with single recursive calls
  
  countdown: { 
    name: 'Countdown', 
    category: 'simple', 
    code: `// Count down from n to 0
// Returns how many steps taken
int countdown(int n) {
    // Base case: stop when n reaches 0
    if (n <= 0) { return 0; }
    // Recursive: count this step (1) + remaining steps
    return 1 + countdown(n - 1);
}
// Start counting down from 5
countdown(5);`
  },
  
  countUp: { 
    name: 'Count Up', 
    category: 'simple', 
    code: `// Count from 1 to n
// Returns the final count
int countUp(int n) {
    // Base case: nothing to count
    if (n <= 0) { return 0; }
    // First count smaller numbers, then add 1
    return countUp(n - 1) + 1;
}
// Count up to 5: 1,2,3,4,5
countUp(5);`
  },

  sumRange: { 
    name: 'Sum 1 to N', 
    category: 'simple', 
    code: `// Add all numbers from 1 to n
// Example: sum(5) = 5+4+3+2+1 = 15
int sum(int n) {
    // Base case: sum of 0 or less is 0
    if (n <= 0) { return 0; }
    // Add n to sum of all smaller numbers
    // sum(5) = 5 + sum(4) = 5 + 4 + sum(3)...
    return n + sum(n - 1);
}
// Calculate 1+2+3+4+5 = 15
sum(5);`
  },
  
  factorial: { 
    name: 'Factorial', 
    category: 'simple', 
    code: `// Multiply all numbers from 1 to n
// Example: 5! = 5*4*3*2*1 = 120
int factorial(int n) {
    // Base case: 0! = 1! = 1
    if (n <= 1) { return 1; }
    // n! = n * (n-1)!
    // 5! = 5 * 4! = 5 * 4 * 3!...
    return n * factorial(n - 1);
}
// Calculate 5! = 120
factorial(5);`
  },
  
  multiply: { 
    name: 'Multiply (Repeated Addition)', 
    category: 'simple', 
    code: `// Multiply using only addition
// a * b = a + a + a... (b times)
int multiply(int a, int b) {
    // Base case: anything * 0 = 0
    if (b == 0) { return 0; }
    // a * b = a + a * (b-1)
    // 4 * 3 = 4 + 4 * 2 = 4 + 4 + 4 * 1
    return a + multiply(a, b - 1);
}
// Calculate 4 * 3 = 12
multiply(4, 3);`
  },
  
  sumDigits: { 
    name: 'Sum of Digits', 
    category: 'simple', 
    code: `// Add all digits in a number
// Example: 1234 -> 1+2+3+4 = 10
int sumDigits(int n) {
    // Base case: no more digits
    if (n == 0) { return 0; }
    // n % 10 gets last digit (1234 % 10 = 4)
    // n / 10 removes last digit (1234 / 10 = 123)
    return (n % 10) + sumDigits(n / 10);
}
// Sum digits of 1234 = 1+2+3+4 = 10
sumDigits(1234);`
  },
  
  countDigits: { 
    name: 'Count Digits', 
    category: 'simple', 
    code: `// Count how many digits in a number
// Example: 1234 has 4 digits
int countDigits(int n) {
    // Base case: no more digits to count
    if (n == 0) { return 0; }
    // Count 1 for current digit + count remaining
    // n / 10 removes the last digit
    return 1 + countDigits(n / 10);
}
// Count digits in 1234 = 4
countDigits(1234);`
  },

  // ============ INTERMEDIATE EXAMPLES ============
  // These teach multiple parameters and branching recursion
  
  fibonacci: { 
    name: 'Fibonacci', 
    category: 'intermediate', 
    code: `// Fibonacci sequence: 0,1,1,2,3,5,8,13...
// Each number = sum of previous two
int fib(int n) {
    // Base cases: fib(0)=0, fib(1)=1
    if (n <= 1) { return n; }
    // fib(n) = fib(n-1) + fib(n-2)
    // fib(6) = fib(5) + fib(4)
    // Creates a tree of recursive calls!
    return fib(n - 1) + fib(n - 2);
}
// Calculate 6th Fibonacci = 8
fib(6);`
  },
  
  power: { 
    name: 'Power (Exponent)', 
    category: 'intermediate', 
    code: `// Calculate base^exp (base to the power exp)
// Example: 2^5 = 2*2*2*2*2 = 32
int power(int base, int exp) {
    // Base case: anything^0 = 1
    if (exp == 0) { return 1; }
    // base^exp = base * base^(exp-1)
    // 2^5 = 2 * 2^4 = 2 * 2 * 2^3...
    return base * power(base, exp - 1);
}
// Calculate 2^5 = 32
power(2, 5);`
  },
  
  fastPower: { 
    name: 'Fast Power (Efficient)', 
    category: 'intermediate', 
    code: `// Efficient power using squaring trick
// 2^8 = (2^4)^2 = ((2^2)^2)^2
int fastPower(int base, int exp) {
    // Base case: anything^0 = 1
    if (exp == 0) { return 1; }
    // If exp is even: base^exp = (base^(exp/2))^2
    if (exp % 2 == 0) {
        int half = fastPower(base, exp / 2);
        return half * half;
    }
    // If exp is odd: base^exp = base * base^(exp-1)
    return base * fastPower(base, exp - 1);
}
// Calculate 2^8 = 256 (only 4 multiplications!)
fastPower(2, 8);`
  },
  
  gcd: { 
    name: 'GCD (Euclidean)', 
    category: 'intermediate', 
    code: `// Greatest Common Divisor using Euclid's algorithm
// gcd(48, 18) = 6 (largest number dividing both)
int gcd(int a, int b) {
    // Base case: gcd(a, 0) = a
    if (b == 0) { return a; }
    // Euclid's insight: gcd(a,b) = gcd(b, a%b)
    // gcd(48,18) = gcd(18,12) = gcd(12,6) = gcd(6,0) = 6
    return gcd(b, a % b);
}
// Find GCD of 48 and 18 = 6
gcd(48, 18);`
  },
  
  lcm: { 
    name: 'LCM (using GCD)', 
    category: 'intermediate', 
    code: `// Least Common Multiple using GCD
// lcm(4, 6) = 12 (smallest number divisible by both)
int gcd(int a, int b) {
    // GCD helper using Euclid's algorithm
    if (b == 0) { return a; }
    return gcd(b, a % b);
}
int lcm(int a, int b) {
    // Formula: lcm(a,b) = (a*b) / gcd(a,b)
    return (a * b) / gcd(a, b);
}
// Find LCM of 4 and 6 = 12
lcm(4, 6);`
  },

  isPalindrome: { 
    name: 'Palindrome Number', 
    category: 'intermediate', 
    code: `// Check if number reads same backwards
// 12321 is palindrome (12321 reversed = 12321)
int reverse(int n, int rev) {
    // Base case: no more digits
    if (n == 0) { return rev; }
    // Build reversed number digit by digit
    // rev*10 shifts left, n%10 gets last digit
    return reverse(n / 10, rev * 10 + n % 10);
}
int isPalindrome(int n) {
    // Compare original with reversed
    if (n == reverse(n, 0)) { return 1; }
    return 0;
}
// Check if 12321 is palindrome = 1 (yes)
isPalindrome(12321);`
  },
  
  binarySearch: { 
    name: 'Binary Search', 
    category: 'intermediate', 
    code: `// Find target in sorted array
// Returns index or -1 if not found
int binarySearch(int[] arr, int target, int left, int right) {
    // Base case: search space exhausted
    if (left > right) { return -1; }
    // Find middle index
    int mid = left + (right - left) / 2;
    // Found it!
    if (arr[mid] == target) { return mid; }
    // Target is smaller - search left half
    if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid - 1);
    }
    // Target is larger - search right half
    return binarySearch(arr, target, mid + 1, right);
}
// Find 7 in sorted array, returns index 3
binarySearch(new int[]{1, 3, 5, 7, 9, 11, 13}, 7, 0, 6);`
  },
  
  arrayLength: { 
    name: 'Array Sum (with size)', 
    category: 'intermediate', 
    code: `// Sum all array elements
// Uses index i to track position
int arrSum(int[] arr, int size, int i) {
    // Base case: reached end of array
    if (i >= size) { return 0; }
    // Add current element + sum of rest
    // arr[i] is current, recurse for i+1 onwards
    return arr[i] + arrSum(arr, size, i + 1);
}
// Sum [5,10,15,20] = 50
arrSum(new int[]{5, 10, 15, 20}, 4, 0);`
  },
  
  arrayMax: { 
    name: 'Array Max (with size)', 
    category: 'intermediate', 
    code: `// Find maximum element in array
// maxSoFar tracks the best we've seen
int arrMax(int[] arr, int size, int i, int maxSoFar) {
    // Base case: checked all elements
    if (i >= size) { return maxSoFar; }
    // Update max if current element is larger
    int newMax = maxSoFar;
    if (arr[i] > maxSoFar) { newMax = arr[i]; }
    // Continue checking rest of array
    return arrMax(arr, size, i + 1, newMax);
}
// Find max in [34,89,12,67] = 89
arrMax(new int[]{34, 89, 12, 67}, 4, 0, 0);`
  },
  
  countOccurrences: { 
    name: 'Count Occurrences', 
    category: 'intermediate', 
    code: `// Count how many times target appears in array
int countOccur(int[] arr, int size, int target, int i) {
    // Base case: checked all elements
    if (i >= size) { return 0; }
    // Count 1 if match, 0 otherwise
    int count = 0;
    if (arr[i] == target) { count = 1; }
    // Add to count from rest of array
    return count + countOccur(arr, size, target, i + 1);
}
// Count 2s in [1,2,3,2,4,2] = 3
countOccur(new int[]{1, 2, 3, 2, 4, 2}, 6, 2, 0);`
  },

  // ============ ADVANCED EXAMPLES ============
  // These teach divide & conquer and complex patterns
  
  divideConquerSum: { 
    name: 'Sum (Divide & Conquer)', 
    category: 'advanced', 
    code: `// Sum array by dividing in half
// Same pattern as merge sort!
int dcSum(int[] arr, int l, int r) {
    // Base case: single element
    if (l == r) { return arr[l]; }
    // Find middle point
    int m = l + (r - l) / 2;
    // Sum left half
    int leftSum = dcSum(arr, l, m);
    // Sum right half
    int rightSum = dcSum(arr, m + 1, r);
    // Combine results
    return leftSum + rightSum;
}
// Sum [10,20,30,40] using D&C = 100
dcSum(new int[]{10, 20, 30, 40}, 0, 3);`
  },
  
  divideConquerMax: { 
    name: 'Max (Divide & Conquer)', 
    category: 'advanced', 
    code: `// Find max by dividing array in half
int dcMax(int[] arr, int l, int r) {
    // Base case: single element is the max
    if (l == r) { return arr[l]; }
    // Find middle point
    int m = l + (r - l) / 2;
    // Find max in left half
    int leftMax = dcMax(arr, l, m);
    // Find max in right half
    int rightMax = dcMax(arr, m + 1, r);
    // Return the larger of the two
    if (leftMax > rightMax) { return leftMax; }
    return rightMax;
}
// Find max in [64,34,89,12] = 89
dcMax(new int[]{64, 34, 89, 12}, 0, 3);`
  },
  
  divideConquerMin: { 
    name: 'Min (Divide & Conquer)', 
    category: 'advanced', 
    code: `// Find min by dividing array in half
int dcMin(int[] arr, int l, int r) {
    // Base case: single element is the min
    if (l == r) { return arr[l]; }
    // Find middle point
    int m = l + (r - l) / 2;
    // Find min in left half
    int leftMin = dcMin(arr, l, m);
    // Find min in right half
    int rightMin = dcMin(arr, m + 1, r);
    // Return the smaller of the two
    if (leftMin < rightMin) { return leftMin; }
    return rightMin;
}
// Find min in [64,34,89,12] = 12
dcMin(new int[]{64, 34, 89, 12}, 0, 3);`
  },
  
  countEven: { 
    name: 'Count Even (Divide & Conquer)', 
    category: 'advanced', 
    code: `// Count even numbers using divide & conquer
int countEven(int[] arr, int l, int r) {
    // Base case: check single element
    if (l == r) {
        // Even if divisible by 2
        if (arr[l] % 2 == 0) { return 1; }
        return 0;
    }
    // Find middle point
    int m = l + (r - l) / 2;
    // Count evens in left half
    int leftCount = countEven(arr, l, m);
    // Count evens in right half
    int rightCount = countEven(arr, m + 1, r);
    // Total = left + right
    return leftCount + rightCount;
}
// Count evens in [1,2,3,4,5,6] = 3
countEven(new int[]{1, 2, 3, 4, 5, 6}, 0, 5);`
  },
  
  towerOfHanoi: { 
    name: 'Tower of Hanoi', 
    category: 'advanced', 
    code: `// Classic puzzle: move n disks between pegs
// Returns number of moves needed
int hanoi(int n, int from, int to, int aux) {
    // Base case: 1 disk = 1 move
    if (n == 1) { return 1; }
    // Step 1: Move n-1 disks from source to auxiliary
    int moves1 = hanoi(n - 1, from, aux, to);
    // Step 2: Move largest disk (counts as 1 move)
    // Step 3: Move n-1 disks from auxiliary to target
    int moves2 = hanoi(n - 1, aux, to, from);
    // Total = moves1 + 1 + moves2
    return moves1 + 1 + moves2;
}
// Moves for 3 disks = 7 (2^n - 1)
hanoi(3, 1, 3, 2);`
  },

  tribonacci: { 
    name: 'Tribonacci', 
    category: 'advanced', 
    code: `// Like Fibonacci but sum of 3 previous numbers
// Sequence: 0,0,1,1,2,4,7,13,24...
int trib(int n) {
    // Base cases for first 3 numbers
    if (n == 0) { return 0; }
    if (n == 1) { return 0; }
    if (n == 2) { return 1; }
    // trib(n) = trib(n-1) + trib(n-2) + trib(n-3)
    // Creates even more branches than Fibonacci!
    return trib(n-1) + trib(n-2) + trib(n-3);
}
// Calculate 7th Tribonacci = 13
trib(7);`
  },
  
  catalanNumber: { 
    name: 'Catalan Number', 
    category: 'advanced', 
    code: `// Catalan numbers: 1,1,2,5,14,42...
// Used in: BST count, valid parentheses, etc.
int catalan(int n) {
    // Base case: C(0) = C(1) = 1
    if (n <= 1) { return 1; }
    // C(n) = sum of C(i) * C(n-1-i) for i=0 to n-1
    int result = 0;
    int i = 0;
    while (i < n) {
        // Multiply left and right subtree counts
        result = result + catalan(i) * catalan(n - 1 - i);
        i = i + 1;
    }
    return result;
}
// Calculate C(4) = 14
catalan(4);`
  },
  
  combinations: { 
    name: 'Combinations (nCr)', 
    category: 'advanced', 
    code: `// Calculate n choose r (Pascal's Triangle)
// C(5,2) = 10 ways to choose 2 items from 5
int nCr(int n, int r) {
    // Base cases: C(n,0) = C(n,n) = 1
    if (r == 0) { return 1; }
    if (r == n) { return 1; }
    // Pascal's identity: C(n,r) = C(n-1,r-1) + C(n-1,r)
    // Either include item n or don't
    return nCr(n - 1, r - 1) + nCr(n - 1, r);
}
// Calculate C(5,2) = 10
nCr(5, 2);`
  },
  
  ackermann: { 
    name: 'Ackermann Function', 
    category: 'advanced', 
    code: `// Famous deeply recursive function
// Grows EXTREMELY fast! Use small inputs only
int ack(int m, int n) {
    // Base case: A(0,n) = n+1
    if (m == 0) { return n + 1; }
    // A(m,0) = A(m-1,1)
    if (n == 0) { return ack(m - 1, 1); }
    // A(m,n) = A(m-1, A(m,n-1))
    // Notice: inner call before outer!
    return ack(m - 1, ack(m, n - 1));
}
// A(2,2) = 7 (try larger values carefully!)
ack(2, 2);`
  },
  
  // --- Tail Recursion Examples ---
  tailFactorial: { 
    name: 'Factorial (Tail Recursive)', 
    category: 'intermediate', 
    code: `// Tail recursive factorial - more efficient!
// Accumulator carries the running product
int factTail(int n, int acc) {
    // Base case: return accumulated result
    if (n <= 1) { return acc; }
    // Tail call: nothing to do after recursion
    // acc builds up: 1 -> 5 -> 20 -> 60 -> 120
    return factTail(n - 1, n * acc);
}
// Calculate 5! with accumulator starting at 1
factTail(5, 1);`
  },
  
  tailSum: { 
    name: 'Sum (Tail Recursive)', 
    category: 'intermediate', 
    code: `// Tail recursive sum - more efficient!
// Accumulator carries the running total
int sumTail(int n, int acc) {
    // Base case: return accumulated sum
    if (n <= 0) { return acc; }
    // Tail call: add n to accumulator, recurse
    // acc builds up: 0 -> 5 -> 9 -> 12 -> 14 -> 15
    return sumTail(n - 1, acc + n);
}
// Sum 1 to 5 with accumulator starting at 0
sumTail(5, 0);`
  },

  // --- Math Problems ---
  isPrime: { 
    name: 'Prime Check', 
    category: 'intermediate', 
    code: `// Check if n is prime (only divisible by 1 and itself)
// Returns 1 if prime, 0 if not
int checkPrime(int n, int div) {
    // If div*div > n, no divisors found = prime
    if (div * div > n) { return 1; }
    // Found a divisor = not prime
    if (n % div == 0) { return 0; }
    // Try next potential divisor
    return checkPrime(n, div + 1);
}
int isPrime(int n) {
    // Numbers < 2 are not prime
    if (n < 2) { return 0; }
    // Start checking from divisor 2
    return checkPrime(n, 2);
}
// Check if 17 is prime = 1 (yes)
isPrime(17);`
  },
  
  sumOfSquares: { 
    name: 'Sum of Squares', 
    category: 'simple', 
    code: `// Sum of squares: 1² + 2² + ... + n²
// Example: sumSq(4) = 1+4+9+16 = 30
int sumSq(int n) {
    // Base case: no more terms
    if (n <= 0) { return 0; }
    // n² + sum of smaller squares
    // n*n is n squared
    return n * n + sumSq(n - 1);
}
// Calculate 1²+2²+3²+4² = 30
sumSq(4);`
  },
  
  geometricSum: { 
    name: 'Geometric Sum', 
    category: 'intermediate', 
    code: `// Geometric series: 1 + r + r² + ... + r^n
// Example: geoSum(2,4) = 1+2+4+8+16 = 31
int geoSum(int r, int n) {
    // Base case: r^0 = 1
    if (n == 0) { return 1; }
    // geoSum(r,n) = r * geoSum(r,n-1) + 1
    // Builds: 1 -> 3 -> 7 -> 15 -> 31
    return geoSum(r, n - 1) * r + 1;
}
// Calculate 1+2+4+8+16 = 31
geoSum(2, 4);`
  },
  
  // --- Staircase/Climbing Problems ---
  climbStairs: { 
    name: 'Climb Stairs (1 or 2 steps)', 
    category: 'intermediate', 
    code: `// Ways to climb n stairs
// Can take 1 or 2 steps at a time
int climb(int n) {
    // Base cases: 1 way to stay, 1 way for 1 stair
    if (n <= 1) { return 1; }
    // From stair n, we could have come from:
    // - stair n-1 (took 1 step)
    // - stair n-2 (took 2 steps)
    // Same as Fibonacci!
    return climb(n - 1) + climb(n - 2);
}
// Ways to climb 5 stairs = 8
climb(5);`
  },
  
  climbStairs3: { 
    name: 'Climb Stairs (1, 2, or 3 steps)', 
    category: 'advanced', 
    code: `// Ways to climb n stairs
// Can take 1, 2, or 3 steps at a time
int climb3(int n) {
    // Base case: exactly 1 way to reach step 0
    if (n == 0) { return 1; }
    // Invalid: can't have negative steps
    if (n < 0) { return 0; }
    // Sum ways from all possible previous steps
    // Like Tribonacci pattern!
    return climb3(n-1) + climb3(n-2) + climb3(n-3);
}
// Ways to climb 4 stairs = 7
climb3(4);`
  },
  
  // --- Number Theory ---
  digitalRoot: { 
    name: 'Digital Root', 
    category: 'simple', 
    code: `// Keep summing digits until single digit
// Example: 9875 -> 29 -> 11 -> 2
int sumDig(int n) {
    // Sum all digits of n
    if (n == 0) { return 0; }
    return (n % 10) + sumDig(n / 10);
}
int digitalRoot(int n) {
    // Base case: already single digit
    if (n < 10) { return n; }
    // Sum digits and repeat
    return digitalRoot(sumDig(n));
}
// Digital root of 9875 = 2
digitalRoot(9875);`
  },
  
  reverseNumber: { 
    name: 'Reverse Number', 
    category: 'simple', 
    code: `// Reverse digits of a number
// Example: 1234 -> 4321
int reverseNum(int n, int rev) {
    // Base case: no more digits
    if (n == 0) { return rev; }
    // rev*10 shifts digits left
    // n%10 gets last digit of n
    // n/10 removes last digit of n
    return reverseNum(n / 10, rev * 10 + n % 10);
}
// Reverse 1234 = 4321
reverseNum(1234, 0);`
  },

  // --- Array Problems ---
  isSorted: { 
    name: 'Check Sorted Array', 
    category: 'intermediate', 
    code: `// Check if array is sorted in ascending order
// Returns 1 if sorted, 0 if not
int isSorted(int[] arr, int size, int i) {
    // Base case: reached end = sorted
    if (i >= size - 1) { return 1; }
    // If current > next, not sorted
    if (arr[i] > arr[i + 1]) { return 0; }
    // Check rest of array
    return isSorted(arr, size, i + 1);
}
// Check if [1,3,5,7,9] is sorted = 1 (yes)
isSorted(new int[]{1, 3, 5, 7, 9}, 5, 0);`
  },
  
  firstIndex: { 
    name: 'First Index of Element', 
    category: 'intermediate', 
    code: `// Find first occurrence of target in array
// Returns index or -1 if not found
int firstIdx(int[] arr, int size, int target, int i) {
    // Base case: not found
    if (i >= size) { return -1; }
    // Found it! Return current index
    if (arr[i] == target) { return i; }
    // Keep searching forward
    return firstIdx(arr, size, target, i + 1);
}
// Find first 3 in [5,3,7,3,9] = index 1
firstIdx(new int[]{5, 3, 7, 3, 9}, 5, 3, 0);`
  },
  
  lastIndex: { 
    name: 'Last Index of Element', 
    category: 'intermediate', 
    code: `// Find last occurrence of target in array
// Search from end to beginning
int lastIdx(int[] arr, int target, int i) {
    // Base case: searched entire array
    if (i < 0) { return -1; }
    // Found it! Return current index
    if (arr[i] == target) { return i; }
    // Keep searching backward
    return lastIdx(arr, target, i - 1);
}
// Find last 3 in [5,3,7,3,9] = index 3
lastIdx(new int[]{5, 3, 7, 3, 9}, 3, 4);`
  },
  
  // --- Classic Interview Problems ---
  minCoins: { 
    name: 'Minimum Coins', 
    category: 'advanced', 
    code: `// Min coins to make amount using coins 1,3,4
int minCoins(int amount) {
    // Base case: 0 amount needs 0 coins
    if (amount == 0) { return 0; }
    // Invalid: negative amount
    if (amount < 0) { return 999; }
    // Try each coin denomination
    int c1 = 1 + minCoins(amount - 1);
    int c3 = 1 + minCoins(amount - 3);
    int c4 = 1 + minCoins(amount - 4);
    // Return minimum of all choices
    int min = c1;
    if (c3 < min) { min = c3; }
    if (c4 < min) { min = c4; }
    return min;
}
// Min coins for 6 = 2 (3+3 or 4+1+1)
minCoins(6);`
  },
  
  subsetSum: { 
    name: 'Subset Sum Exists', 
    category: 'advanced', 
    code: `// Can we make target sum from array elements?
// Returns 1 if possible, 0 if not
int subsetSum(int[] arr, int size, int i, int target) {
    // Found a valid subset!
    if (target == 0) { return 1; }
    // No more elements to try
    if (i >= size) { return 0; }
    // Target became negative - invalid
    if (target < 0) { return 0; }
    // Choice 1: Include arr[i] in subset
    int include = subsetSum(arr, size, i+1, target - arr[i]);
    // Choice 2: Exclude arr[i] from subset
    int exclude = subsetSum(arr, size, i+1, target);
    // Return true if either choice works
    if (include == 1) { return 1; }
    return exclude;
}
// Can [3,7,1,8] make sum 11? = 1 (3+8 or 3+7+1)
subsetSum(new int[]{3, 7, 1, 8}, 4, 0, 11);`
  },

  // ============ DYNAMIC PROGRAMMING EXAMPLES ============
  // Classic DP problems showing recursive approach
  // These help students understand overlapping subproblems
  
  dpFibonacci: { 
    name: 'Fibonacci (DP Classic)', 
    category: 'dp', 
    code: `// Classic DP: Fibonacci
// Shows overlapping subproblems clearly
// fib(5) calls fib(3) multiple times!
int fib(int n) {
    // Base cases: fib(0)=0, fib(1)=1
    if (n <= 1) { return n; }
    // Notice: fib(n-1) and fib(n-2) share subproblems
    // This is why memoization helps!
    return fib(n - 1) + fib(n - 2);
}
// Calculate fib(6) = 8
fib(6);`
  },
  
  dpClimbStairs: { 
    name: 'Climbing Stairs', 
    category: 'dp', 
    code: `// DP: Ways to climb n stairs
// Can take 1 or 2 steps at a time
// Same as Fibonacci pattern!
int climb(int n) {
    // Base cases: 1 way for 0 or 1 stairs
    if (n <= 1) { return 1; }
    // Ways = ways to reach (n-1) + ways to reach (n-2)
    // Because we can take 1 or 2 steps
    return climb(n - 1) + climb(n - 2);
}
// Ways to climb 5 stairs = 8
climb(5);`
  },
  
  dpMinCost: { 
    name: 'Min Cost Climbing Stairs', 
    category: 'dp', 
    code: `// DP: Min cost to reach top of stairs
// cost[i] = cost to step on stair i
int minCost(int[] cost, int size, int i) {
    // Reached or passed the top
    if (i >= size) { return 0; }
    // Option 1: Take 1 step
    int one = cost[i] + minCost(cost, size, i + 1);
    // Option 2: Take 2 steps
    int two = cost[i] + minCost(cost, size, i + 2);
    // Return cheaper option
    if (one < two) { return one; }
    return two;
}
int solve(int[] cost, int size) {
    // Can start from step 0 or step 1
    int a = minCost(cost, size, 0);
    int b = minCost(cost, size, 1);
    if (a < b) { return a; }
    return b;
}
// Min cost for [10,15,20] = 15
solve(new int[]{10, 15, 20}, 3);`
  },
  
  dpHouseRobber: { 
    name: 'House Robber', 
    category: 'dp', 
    code: `// DP: Max money without robbing adjacent houses
// Classic include/exclude pattern
int rob(int[] nums, int size, int i) {
    // No more houses to rob
    if (i >= size) { return 0; }
    // Option 1: Rob this house, skip next
    int steal = nums[i] + rob(nums, size, i + 2);
    // Option 2: Skip this house, try next
    int skip = rob(nums, size, i + 1);
    // Return better option
    if (steal > skip) { return steal; }
    return skip;
}
// Max from [2,7,9,3,1] = 12 (2+9+1)
rob(new int[]{2, 7, 9, 3, 1}, 5, 0);`
  },
  
  dpMaxSubarray: { 
    name: 'Max Subarray Sum', 
    category: 'dp', 
    code: `// DP: Maximum sum of contiguous subarray
// Kadane's algorithm - recursive version
int maxEnd(int[] arr, int size, int i) {
    // Base case: end of array
    if (i >= size) { return 0; }
    // Max sum ending at next position
    int next = maxEnd(arr, size, i + 1);
    // Either extend previous subarray or start new
    int extend = arr[i] + next;
    if (extend > arr[i]) { return extend; }
    return arr[i];
}
int maxSub(int[] arr, int size, int i, int best) {
    // Checked all starting positions
    if (i >= size) { return best; }
    // Max sum starting at position i
    int curr = maxEnd(arr, size, i);
    // Update best if current is better
    int newBest = best;
    if (curr > best) { newBest = curr; }
    // Try next starting position
    return maxSub(arr, size, i + 1, newBest);
}
// Max subarray in [-2,1,-3,4,-1] = 4
maxSub(new int[]{-2, 1, -3, 4, -1}, 5, 0, -999);`
  },

  dpJumpGame: { 
    name: 'Jump Game (Can Reach End?)', 
    category: 'dp', 
    code: `// DP: Can we reach the last index?
// nums[i] = max jump length from position i
int canJump(int[] nums, int size, int i) {
    // Reached or passed the end!
    if (i >= size - 1) { return 1; }
    // Max jump from current position
    int maxJump = nums[i];
    // Try all possible jumps
    int j = 1;
    while (j <= maxJump) {
        // If any jump leads to end, return true
        if (canJump(nums, size, i + j) == 1) {
            return 1;
        }
        j = j + 1;
    }
    // No jump worked
    return 0;
}
// Can reach end from [2,3,1,1,4]? = 1 (yes)
canJump(new int[]{2, 3, 1, 1, 4}, 5, 0);`
  },
  
  dpPerfectSquares: { 
    name: 'Perfect Squares', 
    category: 'dp', 
    code: `// DP: Min perfect squares that sum to n
// Example: 12 = 4+4+4 = 3 squares
int minSquares(int n) {
    // Base case: 0 needs 0 squares
    if (n <= 0) { return 0; }
    // Start with worst case (all 1s)
    int min = n;
    // Try each perfect square <= n
    int i = 1;
    while (i * i <= n) {
        // Use square i*i, solve for remainder
        int curr = 1 + minSquares(n - i * i);
        if (curr < min) { min = curr; }
        i = i + 1;
    }
    return min;
}
// Min squares for 12 = 3 (4+4+4)
minSquares(12);`
  },
  
  dpCoinChange: { 
    name: 'Coin Change (Min Coins)', 
    category: 'dp', 
    code: `// DP: Min coins to make amount
// Coins available: 1, 2, 5
int coinChange(int amount) {
    // Base case: 0 amount needs 0 coins
    if (amount == 0) { return 0; }
    // Invalid: negative amount
    if (amount < 0) { return 999; }
    // Try each coin denomination
    int c1 = 1 + coinChange(amount - 1);
    int c2 = 1 + coinChange(amount - 2);
    int c5 = 1 + coinChange(amount - 5);
    // Return minimum
    int min = c1;
    if (c2 < min) { min = c2; }
    if (c5 < min) { min = c5; }
    return min;
}
// Min coins for 6 = 2 (5+1 or 2+2+2)
coinChange(6);`
  },
  
  dpCoinChangeWays: { 
    name: 'Coin Change (Count Ways)', 
    category: 'dp', 
    code: `// DP: Number of ways to make amount
// Coins available: 1, 2, 3
int countWays(int amount, int coin) {
    // Found a valid combination!
    if (amount == 0) { return 1; }
    // Invalid amount
    if (amount < 0) { return 0; }
    // No more coin types to try
    if (coin > 3) { return 0; }
    // Option 1: Use current coin again
    int use = countWays(amount - coin, coin);
    // Option 2: Move to next coin type
    int skip = countWays(amount, coin + 1);
    return use + skip;
}
// Ways to make 4 = 4 (1111,112,22,13)
countWays(4, 1);`
  },
  
  dpTribonacci: { 
    name: 'Tribonacci', 
    category: 'dp', 
    code: `// DP: Sum of previous 3 numbers
// T(n) = T(n-1) + T(n-2) + T(n-3)
// Sequence: 0,0,1,1,2,4,7,13...
int trib(int n) {
    // Base cases
    if (n == 0) { return 0; }
    if (n == 1) { return 0; }
    if (n == 2) { return 1; }
    // Sum of three previous values
    // More overlapping subproblems than Fibonacci!
    return trib(n-1) + trib(n-2) + trib(n-3);
}
// Calculate T(6) = 7
trib(6);`
  },

  // --- Knapsack Pattern ---
  dpSubsetSum: { 
    name: '0/1 Knapsack (Subset Sum)', 
    category: 'dp', 
    code: `// DP: Can subset sum to target?
// Classic 0/1 Knapsack pattern
int subsetSum(int[] arr, int size, int i, int target) {
    // Found valid subset!
    if (target == 0) { return 1; }
    // No more elements
    if (i >= size) { return 0; }
    // Target went negative
    if (target < 0) { return 0; }
    // Choice 1: Take current element
    int take = subsetSum(arr, size, i+1, target - arr[i]);
    // Choice 2: Skip current element
    int skip = subsetSum(arr, size, i+1, target);
    // Either choice works?
    if (take == 1) { return 1; }
    return skip;
}
// Can [3,34,4,12,5,2] make 9? = 1 (4+5)
subsetSum(new int[]{3, 34, 4, 12, 5, 2}, 6, 0, 9);`
  },
  
  dpPartitionEqual: { 
    name: 'Partition Equal Subset', 
    category: 'dp', 
    code: `// DP: Can partition into 2 equal sum subsets?
// Sum must be even, find subset = sum/2
int canPartition(int[] arr, int size, int i, int target) {
    // Found subset with target sum!
    if (target == 0) { return 1; }
    // No more elements
    if (i >= size) { return 0; }
    // Target went negative
    if (target < 0) { return 0; }
    // Choice 1: Include in first subset
    int take = canPartition(arr, size, i+1, target - arr[i]);
    // Choice 2: Include in second subset
    int skip = canPartition(arr, size, i+1, target);
    if (take == 1) { return 1; }
    return skip;
}
// Can [1,5,11,5] partition? = 1 (1+5+5=11)
canPartition(new int[]{1, 5, 11, 5}, 4, 0, 11);`
  },
  
  dpTargetSum: { 
    name: 'Target Sum (+/- Signs)', 
    category: 'dp', 
    code: `// DP: Ways to assign +/- to reach target
// Example: [1,1,1,1,1] target=3 has 5 ways
int targetSum(int[] arr, int size, int i, int target) {
    // Used all elements, check if target reached
    if (i >= size) {
        if (target == 0) { return 1; }
        return 0;
    }
    // Choice 1: Add current element (+)
    int add = targetSum(arr, size, i+1, target - arr[i]);
    // Choice 2: Subtract current element (-)
    int sub = targetSum(arr, size, i+1, target + arr[i]);
    // Total ways = sum of both choices
    return add + sub;
}
// Ways to make 3 from [1,1,1,1,1] = 5
targetSum(new int[]{1, 1, 1, 1, 1}, 5, 0, 3);`
  },
  
  dpKnapsack01: { 
    name: '0/1 Knapsack (Max Value)', 
    category: 'dp', 
    code: `// DP: Max value within weight capacity
// Each item can be taken at most once
int knapsack(int[] wt, int[] val, int size, int i, int cap) {
    // No more items
    if (i >= size) { return 0; }
    // No capacity left
    if (cap <= 0) { return 0; }
    // Choice 1: Skip this item
    int skip = knapsack(wt, val, size, i+1, cap);
    // Choice 2: Take this item (if it fits)
    int take = 0;
    if (wt[i] <= cap) {
        take = val[i] + knapsack(wt, val, size, i+1, cap - wt[i]);
    }
    // Return better choice
    if (take > skip) { return take; }
    return skip;
}
// Max value: weights[1,2,3], values[6,10,12], cap=5
knapsack(new int[]{1, 2, 3}, new int[]{6, 10, 12}, 3, 0, 5);`
  },
  
  dpUnboundedKnapsack: { 
    name: 'Unbounded Knapsack', 
    category: 'dp', 
    code: `// DP: Max value with unlimited items
// Can take same item multiple times
int unbounded(int[] wt, int[] val, int size, int cap) {
    // No capacity left
    if (cap <= 0) { return 0; }
    int maxVal = 0;
    // Try each item
    int i = 0;
    while (i < size) {
        // If item fits, try taking it
        if (wt[i] <= cap) {
            // Take item, can take again (same i)
            int curr = val[i] + unbounded(wt, val, size, cap - wt[i]);
            if (curr > maxVal) { maxVal = curr; }
        }
        i = i + 1;
    }
    return maxVal;
}
// Max value: wt[1,3,4], val[10,40,50], cap=8
unbounded(new int[]{1, 3, 4}, new int[]{10, 40, 50}, 3, 8);`
  },

  // --- Grid DP Problems ---
  dpUniquePaths: { 
    name: 'Unique Paths in Grid', 
    category: 'dp', 
    code: `// DP: Paths from (0,0) to (m-1,n-1)
// Can only move right or down
int uniquePaths(int m, int n) {
    // Reached edge - only 1 way to continue
    if (m == 1) { return 1; }
    if (n == 1) { return 1; }
    // Paths = paths going down + paths going right
    // Each cell can be reached from above or left
    return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
}
// Paths in 3x3 grid = 6
uniquePaths(3, 3);`
  },
  
  // --- String DP Problems ---
  dpPalindromeCheck: { 
    name: 'Is Palindrome (Recursive)', 
    category: 'dp', 
    code: `// DP: Check if array is palindrome
// Compare first and last, then recurse inward
int isPalin(int[] arr, int left, int right) {
    // Pointers crossed = palindrome!
    if (left >= right) { return 1; }
    // Mismatch found = not palindrome
    if (arr[left] != arr[right]) { return 0; }
    // Check inner portion
    return isPalin(arr, left + 1, right - 1);
}
// Is [1,2,3,2,1] palindrome? = 1 (yes)
isPalin(new int[]{1, 2, 3, 2, 1}, 0, 4);`
  },
  
  // --- Combinatorics DP ---
  dpCatalan: { 
    name: 'Catalan Numbers', 
    category: 'dp', 
    code: `// DP: Catalan number C(n)
// Used in: BST count, valid parentheses, etc.
int catalan(int n) {
    // Base case: C(0) = C(1) = 1
    if (n <= 1) { return 1; }
    // C(n) = sum of C(i) * C(n-1-i)
    int result = 0;
    int i = 0;
    while (i < n) {
        // Left subtree * right subtree combinations
        result = result + catalan(i) * catalan(n - 1 - i);
        i = i + 1;
    }
    return result;
}
// C(4) = 14
catalan(4);`
  },
  
  dpBinomialCoeff: { 
    name: 'Binomial Coefficient (nCr)', 
    category: 'dp', 
    code: `// DP: n choose r (Pascal's Triangle)
// C(n,r) = C(n-1,r-1) + C(n-1,r)
int nCr(int n, int r) {
    // Base cases: C(n,0) = C(n,n) = 1
    if (r == 0) { return 1; }
    if (r == n) { return 1; }
    // Pascal's identity
    // Either include nth item or don't
    return nCr(n - 1, r - 1) + nCr(n - 1, r);
}
// C(5,2) = 10
nCr(5, 2);`
  },
  
  dpBellNumber: { 
    name: 'Bell Numbers (Partitions)', 
    category: 'dp', 
    code: `// DP: Ways to partition a set
// Bell(3) = 5: {abc},{a,bc},{b,ac},{c,ab},{a,b,c}
int bell(int n, int k) {
    // Empty set has 1 partition
    if (n == 0) { return 1; }
    // Can't have 0 non-empty subsets
    if (k == 0) { return 0; }
    // Either: add to existing subset (k ways)
    // Or: create new subset
    return k * bell(n - 1, k) + bell(n - 1, k - 1);
}
int bellNum(int n) {
    // Sum over all possible subset counts
    int sum = 0;
    int k = 1;
    while (k <= n) {
        sum = sum + bell(n, k);
        k = k + 1;
    }
    return sum;
}
// Bell(4) = 15
bellNum(4);`
  },

  // --- Classic DP Interview Problems ---
  dpRodCutting: { 
    name: 'Rod Cutting', 
    category: 'dp', 
    code: `// DP: Max profit from cutting rod
// prices[i] = price of length i+1
int cutRod(int[] prices, int size, int n) {
    // No rod left to cut
    if (n <= 0) { return 0; }
    int maxVal = 0;
    // Try each possible first cut
    int i = 0;
    while (i < n && i < size) {
        // Cut piece of length i+1, solve for rest
        int curr = prices[i] + cutRod(prices, size, n - i - 1);
        if (curr > maxVal) { maxVal = curr; }
        i = i + 1;
    }
    return maxVal;
}
// Max profit: prices[1,5,8,9,10], rod length 4
cutRod(new int[]{1, 5, 8, 9, 10}, 5, 4);`
  },
  
  dpWordBreak: { 
    name: 'Word Break (Simplified)', 
    category: 'dp', 
    code: `// DP: Can string be segmented into words?
// Simplified: check if lengths can sum to n
int wordBreak(int[] lens, int size, int n) {
    // Successfully segmented entire string
    if (n == 0) { return 1; }
    // Try each word length
    int i = 0;
    while (i < size) {
        // If word fits, try using it
        if (lens[i] <= n) {
            if (wordBreak(lens, size, n - lens[i]) == 1) {
                return 1;
            }
        }
        i = i + 1;
    }
    // No valid segmentation found
    return 0;
}
// Can segment length 7 with words [2,3,4]? = 1
wordBreak(new int[]{2, 3, 4}, 3, 7);`
  },
  
  dpMaxProduct: { 
    name: 'Max Product Cutting', 
    category: 'dp', 
    code: `// DP: Max product from cutting rope
// Cut rope of length n into parts
int maxProduct(int n) {
    // Must make at least one cut
    if (n <= 2) { return 1; }
    int maxProd = 0;
    // Try each first cut position
    int i = 1;
    while (i < n) {
        // Option 1: Don't cut remaining part
        int curr = i * (n - i);
        // Option 2: Cut remaining part further
        int withCut = i * maxProduct(n - i);
        if (withCut > curr) { curr = withCut; }
        if (curr > maxProd) { maxProd = curr; }
        i = i + 1;
    }
    return maxProd;
}
// Max product for rope length 5 = 6 (2*3)
maxProduct(5);`
  },
  
  dpCountBST: { 
    name: 'Count BSTs (Unique BSTs)', 
    category: 'dp', 
    code: `// DP: Number of unique BSTs with n nodes
// This equals Catalan number!
int countBST(int n) {
    // Empty or single node = 1 BST
    if (n <= 1) { return 1; }
    int count = 0;
    // Try each node as root
    int i = 1;
    while (i <= n) {
        // Nodes 1 to i-1 go left, i+1 to n go right
        int left = countBST(i - 1);
        int right = countBST(n - i);
        // Multiply: each left with each right
        count = count + left * right;
        i = i + 1;
    }
    return count;
}
// Unique BSTs with 4 nodes = 14
countBST(4);`
  },
  
  dpPaintFence: { 
    name: 'Paint Fence', 
    category: 'dp', 
    code: `// DP: Ways to paint n posts with k colors
// Rule: No more than 2 adjacent same color
int paintFence(int n, int k) {
    // No posts = no ways
    if (n == 0) { return 0; }
    // 1 post = k color choices
    if (n == 1) { return k; }
    // 2 posts = k*k (any combination)
    if (n == 2) { return k * k; }
    // For post n:
    // Same as n-1: (k-1) * ways(n-2)
    // Different from n-1: (k-1) * ways(n-1)
    int same = (k - 1) * paintFence(n - 2, k);
    int diff = (k - 1) * paintFence(n - 1, k);
    return same + diff;
}
// Ways to paint 3 posts with 2 colors = 6
paintFence(3, 2);`
  },
  
  dpCountSubsets: { 
    name: 'Count Subsets with Sum', 
    category: 'dp', 
    code: `// DP: Count subsets that sum to target
int countSubsets(int[] arr, int size, int i, int sum) {
    // Found a valid subset!
    if (sum == 0) { return 1; }
    // No more elements
    if (i >= size) { return 0; }
    // Sum went negative
    if (sum < 0) { return 0; }
    // Choice 1: Include current element
    int take = countSubsets(arr, size, i+1, sum - arr[i]);
    // Choice 2: Exclude current element
    int skip = countSubsets(arr, size, i+1, sum);
    // Total = both choices
    return take + skip;
}
// Count subsets of [1,2,3,3] summing to 6 = 3
countSubsets(new int[]{1, 2, 3, 3}, 4, 0, 6);`
  },

  dpMaxSumNoAdjacent: { 
    name: 'Max Sum No Adjacent', 
    category: 'dp', 
    code: `// DP: Max sum without adjacent elements
// Same as House Robber pattern
int maxSum(int[] arr, int size, int i) {
    // No more elements
    if (i >= size) { return 0; }
    // Choice 1: Take current, skip next
    int take = arr[i] + maxSum(arr, size, i + 2);
    // Choice 2: Skip current, consider next
    int skip = maxSum(arr, size, i + 1);
    // Return better choice
    if (take > skip) { return take; }
    return skip;
}
// Max sum from [5,5,10,100,10,5] = 110
maxSum(new int[]{5, 5, 10, 100, 10, 5}, 6, 0);`
  },
  
  dpStaircase: { 
    name: 'Staircase (Variable Steps)', 
    category: 'dp', 
    code: `// DP: Ways to climb with 1 to k steps
int climbK(int n, int k) {
    // Reached exactly step n
    if (n == 0) { return 1; }
    // Overshot - invalid
    if (n < 0) { return 0; }
    // Try each step size from 1 to k
    int ways = 0;
    int step = 1;
    while (step <= k) {
        ways = ways + climbK(n - step, k);
        step = step + 1;
    }
    return ways;
}
// Ways to climb 4 stairs with 1-3 steps = 7
climbK(4, 3);`
  },

  dpFriendsPairing: { 
    name: 'Friends Pairing Problem', 
    category: 'dp', 
    code: `// DP: Ways to pair n friends
// Each friend can stay single or pair with one other
int friendsPair(int n) {
    // Base cases: 1 or 2 friends
    if (n <= 2) { return n; }
    // Option 1: nth friend stays single
    int single = friendsPair(n - 1);
    // Option 2: nth friend pairs with one of (n-1) others
    int paired = (n - 1) * friendsPair(n - 2);
    return single + paired;
}
// Ways for 4 friends = 10
friendsPair(4);`
  },
  
  dpTilingProblem: { 
    name: 'Tiling Problem (2xN)', 
    category: 'dp', 
    code: `// DP: Ways to tile 2xN board with 2x1 tiles
// Same as Fibonacci pattern!
int tiling(int n) {
    // Base cases
    if (n <= 2) { return n; }
    // Place vertical tile: leaves 2x(n-1)
    // Place 2 horizontal tiles: leaves 2x(n-2)
    return tiling(n - 1) + tiling(n - 2);
}
// Ways to tile 2x5 board = 8
tiling(5);`
  },
  
  dpEggDrop: { 
    name: 'Egg Drop Problem', 
    category: 'dp', 
    code: `// DP: Min trials to find critical floor
// e = eggs, f = floors
int eggDrop(int e, int f) {
    // 0 or 1 floor needs that many trials
    if (f <= 1) { return f; }
    // 1 egg: must try each floor from bottom
    if (e == 1) { return f; }
    int minTrials = 999;
    // Try dropping from each floor
    int x = 1;
    while (x <= f) {
        // Egg breaks: check floors below with e-1 eggs
        int breaks = eggDrop(e - 1, x - 1);
        // Egg survives: check floors above with e eggs
        int survives = eggDrop(e, f - x);
        // Worst case of the two
        int worst = breaks;
        if (survives > worst) { worst = survives; }
        // 1 trial + worst case
        int trials = 1 + worst;
        if (trials < minTrials) { minTrials = trials; }
        x = x + 1;
    }
    return minTrials;
}
// Min trials: 2 eggs, 6 floors = 3
eggDrop(2, 6);`
  },
  
  dpPalindromePartition: { 
    name: 'Palindrome Partitioning', 
    category: 'dp', 
    code: `// DP: Min cuts for palindrome partitions
int isPalin(int[] arr, int i, int j) {
    // Check if arr[i..j] is palindrome
    while (i < j) {
        if (arr[i] != arr[j]) { return 0; }
        i = i + 1;
        j = j - 1;
    }
    return 1;
}
int minCuts(int[] arr, int size, int i, int j) {
    // Single element or empty
    if (i >= j) { return 0; }
    // Already palindrome: no cuts needed
    if (isPalin(arr, i, j) == 1) { return 0; }
    int minC = 999;
    // Try each cut position
    int k = i;
    while (k < j) {
        // 1 cut + cuts for left + cuts for right
        int cuts = 1 + minCuts(arr, size, i, k) + 
                   minCuts(arr, size, k+1, j);
        if (cuts < minC) { minC = cuts; }
        k = k + 1;
    }
    return minC;
}
// Min cuts for [1,2,1,2,1]
minCuts(new int[]{1, 2, 1, 2, 1}, 5, 0, 4);`
  },

  // ============ BACKTRACKING EXAMPLES ============
  // Classic backtracking: explore choices, recurse, backtrack if invalid
  // Shows the "try → recurse → undo" pattern in recursion tree
  
  btCountSubsets: { 
    name: 'Count All Subsets', 
    category: 'backtracking', 
    code: `// Backtracking: Count all possible subsets
// For each element: include or exclude
// 2^n subsets for n elements
int countSubsets(int n, int i) {
    // Processed all elements = found 1 subset
    if (i >= n) { return 1; }
    // Choice 1: Include element i
    int include = countSubsets(n, i + 1);
    // Choice 2: Exclude element i
    int exclude = countSubsets(n, i + 1);
    // Total = both branches
    return include + exclude;
}
// Subsets of 3 elements = 8 (2^3)
countSubsets(3, 0);`
  },
  
  btCountPermutations: { 
    name: 'Count Permutations', 
    category: 'backtracking', 
    code: `// Backtracking: Count permutations of n elements
// n! permutations total
int countPerm(int n, int used) {
    // All positions filled = found 1 permutation
    if (used == n) { return 1; }
    int count = 0;
    // Try placing each remaining element
    int i = 0;
    while (i < n) {
        // Each unused element can go in current position
        count = count + countPerm(n, used + 1);
        i = i + 1;
    }
    return count;
}
// Permutations of 3 elements = 6 (3!)
countPerm(3, 0);`
  },
  
  btGenerateBinary: { 
    name: 'Generate Binary Strings', 
    category: 'backtracking', 
    code: `// Backtracking: Count binary strings of length n
// At each position: choose 0 or 1
int countBinary(int n, int pos) {
    // Filled all positions = found 1 string
    if (pos >= n) { return 1; }
    // Choice 1: Put 0 at current position
    int with0 = countBinary(n, pos + 1);
    // Choice 2: Put 1 at current position
    int with1 = countBinary(n, pos + 1);
    // Total = both choices
    return with0 + with1;
}
// Binary strings of length 3 = 8
countBinary(3, 0);`
  },
  
  btNQueensCount: { 
    name: 'N-Queens (Count Solutions)', 
    category: 'backtracking', 
    code: `// Backtracking: Count N-Queens solutions
// Place n queens on nxn board, no attacks
int isSafe(int[] cols, int row, int col) {
    // Check all previously placed queens
    int i = 0;
    while (i < row) {
        // Same column?
        if (cols[i] == col) { return 0; }
        // Same diagonal? (slope = 1 or -1)
        int rowDiff = row - i;
        int colDiff = col - cols[i];
        if (colDiff == rowDiff || colDiff == -rowDiff) { return 0; }
        i = i + 1;
    }
    return 1;
}
int nQueens(int[] cols, int n, int row) {
    // Placed all queens = found solution
    if (row >= n) { return 1; }
    int count = 0;
    // Try each column for current row
    int col = 0;
    while (col < n) {
        if (isSafe(cols, row, col) == 1) {
            cols[row] = col;
            count = count + nQueens(cols, n, row + 1);
            // Backtrack: column will be overwritten
        }
        col = col + 1;
    }
    return count;
}
// Solutions for 4-Queens = 2
nQueens(new int[]{0, 0, 0, 0}, 4, 0);`
  },
  
  btSubsetSumK: { 
    name: 'Subsets with Sum K', 
    category: 'backtracking', 
    code: `// Backtracking: Count subsets summing to k
// Classic include/exclude pattern
int countSubsetsK(int[] arr, int size, int i, int k) {
    // Found subset with exact sum!
    if (k == 0) { return 1; }
    // No more elements or sum went negative
    if (i >= size) { return 0; }
    if (k < 0) { return 0; }
    // Choice 1: Include arr[i] in subset
    int include = countSubsetsK(arr, size, i+1, k - arr[i]);
    // Choice 2: Exclude arr[i] from subset
    int exclude = countSubsetsK(arr, size, i+1, k);
    return include + exclude;
}
// Subsets of [1,2,3,4,5] summing to 6 = 3
countSubsetsK(new int[]{1, 2, 3, 4, 5}, 5, 0, 6);`
  },
  
  btPartitionKSubsets: { 
    name: 'Partition into K Equal Subsets', 
    category: 'backtracking', 
    code: `// Backtracking: Can partition into k equal sum subsets?
// Each element must be in exactly one subset
// Note: This simplified version checks feasibility
int canPartitionK(int[] arr, int size, int i, int k, int currSum, int targetSum) {
    // All k subsets formed!
    if (k == 1) { return 1; }
    // Current subset complete, start next
    if (currSum == targetSum) {
        return canPartitionK(arr, size, 0, k-1, 0, targetSum);
    }
    // No more elements for current subset
    if (i >= size) { return 0; }
    // Sum exceeded target
    if (currSum > targetSum) { return 0; }
    // Skip if element already "used" (value is 0)
    if (arr[i] == 0) {
        return canPartitionK(arr, size, i+1, k, currSum, targetSum);
    }
    // Choice 1: Include arr[i] in current subset
    int temp = arr[i];
    arr[i] = 0;
    int include = canPartitionK(arr, size, i+1, k, currSum + temp, targetSum);
    arr[i] = temp;
    if (include == 1) { return 1; }
    // Choice 2: Skip arr[i] for now
    return canPartitionK(arr, size, i+1, k, currSum, targetSum);
}
// Can [4,3,2,3,5,2,1] partition into 4 subsets of sum 5? = 1
canPartitionK(new int[]{4, 3, 2, 3, 5, 2, 1}, 7, 0, 4, 0, 5);`
  },
  
  btLetterCombinations: { 
    name: 'Phone Letter Combinations', 
    category: 'backtracking', 
    code: `// Backtracking: Count letter combinations from phone digits
// 2=abc(3), 3=def(3), 4=ghi(3), etc.
int letterCount(int digit) {
    // Each digit maps to 3 or 4 letters
    if (digit == 7) { return 4; }
    if (digit == 9) { return 4; }
    return 3;
}
int countCombinations(int[] digits, int size, int i) {
    // Processed all digits = found 1 combination
    if (i >= size) { return 1; }
    // Get letter count for current digit
    int letters = letterCount(digits[i]);
    // Each letter choice leads to more combinations
    return letters * countCombinations(digits, size, i + 1);
}
// Combinations for [2,3] = 9 (3*3)
countCombinations(new int[]{2, 3}, 2, 0);`
  },
  
  btKnightTour: { 
    name: 'Knight Tour (Count Moves)', 
    category: 'backtracking', 
    code: `// Backtracking: Count valid knight moves from position
// Knight moves in L-shape: 2+1 or 1+2
int isValid(int x, int y, int n) {
    // Check if position is on board
    if (x >= 0 && x < n && y >= 0 && y < n) { return 1; }
    return 0;
}
int countMoves(int x, int y, int n, int depth) {
    // Reached max depth
    if (depth <= 0) { return 1; }
    int count = 0;
    // All 8 possible knight moves
    if (isValid(x+2, y+1, n) == 1) { count = count + countMoves(x+2, y+1, n, depth-1); }
    if (isValid(x+2, y-1, n) == 1) { count = count + countMoves(x+2, y-1, n, depth-1); }
    if (isValid(x-2, y+1, n) == 1) { count = count + countMoves(x-2, y+1, n, depth-1); }
    if (isValid(x-2, y-1, n) == 1) { count = count + countMoves(x-2, y-1, n, depth-1); }
    if (isValid(x+1, y+2, n) == 1) { count = count + countMoves(x+1, y+2, n, depth-1); }
    if (isValid(x+1, y-2, n) == 1) { count = count + countMoves(x+1, y-2, n, depth-1); }
    if (isValid(x-1, y+2, n) == 1) { count = count + countMoves(x-1, y+2, n, depth-1); }
    if (isValid(x-1, y-2, n) == 1) { count = count + countMoves(x-1, y-2, n, depth-1); }
    return count;
}
// Count 2-move sequences from (0,0) on 5x5 board
countMoves(0, 0, 5, 2);`
  },
  
  btPalindromePartition: { 
    name: 'Palindrome Partition Count', 
    category: 'backtracking', 
    code: `// Backtracking: Count palindrome partitions
int isPalin(int[] arr, int start, int end) {
    // Check if arr[start..end] is palindrome
    while (start < end) {
        if (arr[start] != arr[end]) { return 0; }
        start = start + 1;
        end = end - 1;
    }
    return 1;
}
int countPartitions(int[] arr, int size, int start) {
    // Partitioned entire array = found 1 way
    if (start >= size) { return 1; }
    int count = 0;
    // Try each possible first palindrome
    int end = start;
    while (end < size) {
        // If arr[start..end] is palindrome
        if (isPalin(arr, start, end) == 1) {
            // Count partitions of remaining
            count = count + countPartitions(arr, size, end + 1);
        }
        end = end + 1;
    }
    return count;
}
// Partitions of [1,2,1] = 2 ([1][2][1], [1,2,1])
countPartitions(new int[]{1, 2, 1}, 3, 0);`
  },
  
  btCountDerangements: { 
    name: 'Count Derangements', 
    category: 'backtracking', 
    code: `// Backtracking: Count derangements (no element in original position)
// D(n) = (n-1) * (D(n-1) + D(n-2))
int derangements(int n) {
    // Base cases
    if (n == 1) { return 0; }
    if (n == 2) { return 1; }
    // For element n:
    // - Put it in one of (n-1) positions
    // - If swapped with element at that position: D(n-2)
    // - If not swapped: D(n-1)
    return (n - 1) * (derangements(n - 1) + derangements(n - 2));
}
// Derangements of 4 elements = 9
derangements(4);`
  },
  
  btCountInversions: { 
    name: 'Count Inversions', 
    category: 'backtracking', 
    code: `// Backtracking: Count inversions in array
// Inversion: i < j but arr[i] > arr[j]
int countInv(int[] arr, int size, int i, int j) {
    // Checked all pairs
    if (i >= size - 1) { return 0; }
    if (j >= size) {
        // Move to next i, reset j
        return countInv(arr, size, i + 1, i + 2);
    }
    // Count 1 if inversion found
    int inv = 0;
    if (arr[i] > arr[j]) { inv = 1; }
    // Continue checking remaining pairs
    return inv + countInv(arr, size, i, j + 1);
}
// Inversions in [2,4,1,3,5] = 3
countInv(new int[]{2, 4, 1, 3, 5}, 5, 0, 1);`
  },
  
  btMaxPathSum: { 
    name: 'Max Path Sum (Tree)', 
    category: 'backtracking', 
    code: `// Backtracking: Max path sum in binary tree (array form)
// Tree stored as array: left=2i+1, right=2i+2
int maxPath(int[] tree, int size, int i) {
    // Out of bounds (null node)
    if (i >= size) { return 0; }
    // Leaf node
    if (2*i+1 >= size) { return tree[i]; }
    // Get max path from left and right subtrees
    int left = maxPath(tree, size, 2*i + 1);
    int right = maxPath(tree, size, 2*i + 2);
    // Take better path + current node
    int best = left;
    if (right > left) { best = right; }
    return tree[i] + best;
}
// Max path in tree [10,5,15,3,7,12,20]
maxPath(new int[]{10, 5, 15, 3, 7, 12, 20}, 7, 0);`
  },
  
  btStringPermCount: { 
    name: 'String Permutation Count', 
    category: 'backtracking', 
    code: `// Backtracking: Count permutations of array elements
// Uses swap-based approach
int permCount(int[] arr, int size, int idx) {
    // Filled all positions = found 1 permutation
    if (idx >= size) { return 1; }
    int count = 0;
    // Try each element at current position
    int i = idx;
    while (i < size) {
        // Swap arr[idx] with arr[i]
        int temp = arr[idx];
        arr[idx] = arr[i];
        arr[i] = temp;
        // Count permutations with this choice
        count = count + permCount(arr, size, idx + 1);
        // Backtrack: swap back
        temp = arr[idx];
        arr[idx] = arr[i];
        arr[i] = temp;
        i = i + 1;
    }
    return count;
}
// Permutations of [1,2,3] = 6
permCount(new int[]{1, 2, 3}, 3, 0);`
  },
};

// Placeholder for custom code
export const CUSTOM_PLACEHOLDER = `// Write your own recursive function!
// Example structure:
int myFunction(int n) {
    // Base case: when to stop
    if (n <= 0) { return 0; }
    // Recursive case: call yourself
    return 1 + myFunction(n - 1);
}
// Call your function
myFunction(5);`;
