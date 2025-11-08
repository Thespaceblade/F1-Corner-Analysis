# Chatbot Use Cases - Quick Reference

This document provides a quick reference of all use cases the chatbot should handle, organized by category.

## Corner Performance Queries

### Basic Corner Queries
1. ✅ "Who was fastest at corner X?"
2. ✅ "Who won corner X at [track]?"
3. ✅ "What's the fastest corner time at turn X?"
4. ✅ "Show me all corner times for corner X"
5. ✅ "Who was slowest at corner X?"

### Corner Comparisons
6. ✅ "Compare corner X performance between VER and HAM"
7. ✅ "Which driver is fastest at corner X?"
8. ✅ "Who has the best corner X time across all sessions?"
9. ✅ "Compare corner X between Q and R"

### Corner Analysis
10. ✅ "What's the average corner time for corner X?"
11. ✅ "Show me speed data for corner X"
12. ✅ "What's the entry/apex/exit speed at corner X?"
13. ✅ "Which corner type is fastest on average?"

## Driver Performance Queries

### Driver Strengths/Weaknesses
14. ✅ "Which corner is VER strongest at?"
15. ✅ "Which corner is HAM weakest at?"
16. ✅ "What are VER's best corners?"
17. ✅ "Where does VER struggle most?"

### Driver Comparisons
18. ✅ "Compare VER and NOR overall corner performance"
19. ✅ "Who is faster between VER and HAM at corners?"
20. ✅ "Compare VER's corner performance to the field average"
21. ✅ "Which driver has the best overall corner times?"

### Driver Statistics
22. ✅ "What's VER's average corner time?"
23. ✅ "How many corners did VER win?"
24. ✅ "What's VER's best corner time?"
25. ✅ "Show me VER's corner performance breakdown"

## Track & Session Queries

### Session Information
26. ✅ "What sessions are available for Monaco 2025?"
27. ✅ "What drivers participated in Monaco 2025 Qualifying?"
28. ✅ "How many laps did VER complete in Monaco Q?"
29. ✅ "What's the fastest lap time at Monaco 2025?"

### Track Information
30. ✅ "How many corners does Monaco have?"
31. ✅ "What are the corner types at Monaco?"
32. ✅ "Show me all corners at Monaco"
33. ✅ "What's the track length at Monaco?"

### Session Comparison
34. ✅ "Compare corner performance between Q and R at Monaco"
35. ✅ "How did corner times change from FP1 to Q?"
36. ✅ "Compare Monaco 2024 vs 2025 corner times"

## Comparative Analysis Queries

### Cross-Session Comparisons
37. ✅ "Which driver has the best corner X time across all sessions?"
38. ✅ "Compare corner X performance across all Monaco 2025 sessions"
39. ✅ "Who improved most at corner X between FP1 and Q?"

### Multi-Driver Comparisons
40. ✅ "Compare top 3 drivers at corner X"
41. ✅ "Who are the fastest drivers at slow corners?"
42. ✅ "Compare VER, HAM, and NOR at corner X"

### Historical Comparisons
43. ✅ "Compare Monaco 2024 vs 2025 corner times"
44. ✅ "How did VER's corner X time change from 2024 to 2025?"
45. ✅ "What's the historical best corner X time at Monaco?"

## Statistical Queries

### Corner Type Analysis
46. ✅ "What's the average corner time for slow corners?"
47. ✅ "Which corner type is fastest on average?"
48. ✅ "Compare slow, medium, and fast corner performance"
49. ✅ "What's the speed difference between corner types?"

### Aggregate Statistics
50. ✅ "What's the average corner time across all corners?"
51. ✅ "What's the standard deviation of corner times?"
52. ✅ "Which corner has the most variation in times?"
53. ✅ "What's the fastest corner overall?"

### Speed Analysis
54. ✅ "What's the speed difference between entry and exit at corner X?"
55. ✅ "Which corner has the highest apex speed?"
56. ✅ "What's the average apex speed for fast corners?"
57. ✅ "Show me speed profiles for corner X"

## Time-Based Queries

### Performance Over Time
58. ✅ "How did VER's corner X time improve over the session?"
59. ✅ "Show me corner X times over the session"
60. ✅ "What was VER's best lap and which corners made it fast?"
61. ✅ "How did corner times change as the session progressed?"

### Lap Analysis
62. ✅ "Which lap had the best corner X time?"
63. ✅ "What was VER's best lap?"
64. ✅ "Show me VER's corner breakdown for his best lap"
65. ✅ "Which corners were fastest on VER's best lap?"

## Tyre Compound Queries

### Compound Analysis
66. ✅ "How do corner times differ between soft and medium tyres?"
67. ✅ "Which compound is fastest at corner X?"
68. ✅ "Compare corner performance on different tyre compounds"
69. ✅ "What's the tyre effect on corner X times?"

### Tyre Life Analysis
70. ✅ "How do corner times change with tyre age?"
71. ✅ "What's the effect of tyre life on corner X?"
72. ✅ "Compare corner performance on fresh vs old tyres"

## Edge Cases & Error Scenarios

### Missing Data
73. ✅ "Who won corner 50 at Monaco?" (Corner doesn't exist)
74. ✅ "Who won corner X at [track] 2030?" (Year doesn't exist)
75. ✅ "Who won corner X for driver XYZ?" (Invalid driver)
76. ✅ "Show me data for [track] that doesn't exist"

### Ambiguous Queries
77. ✅ "Who won corner X?" (No track/year specified)
78. ✅ "Who was fastest?" (No corner specified)
79. ✅ "Compare drivers" (No drivers specified)
80. ✅ "Show me corner data" (Too vague)

### Context-Dependent Queries
81. ✅ "Who won corner X?" (After mentioning track in previous message)
82. ✅ "Compare him to VER" (Referring to previous driver)
83. ✅ "What about corner Y?" (Following up on corner X query)
84. ✅ "Show me the same for HAM" (Context from previous query)

## Complex Analytical Queries

### Multi-Factor Analysis
85. ✅ "Which driver is best at slow corners on soft tyres?"
86. ✅ "Compare VER and HAM at corner X on different compounds"
87. ✅ "What's the best corner X time on fresh soft tyres?"
88. ✅ "Show me corner performance by tyre compound and corner type"

### Trend Analysis
89. ✅ "How have corner X times improved over the season?"
90. ✅ "What's the trend in corner performance?"
91. ✅ "Which corners show the most improvement over time?"
92. ✅ "Compare corner performance trends between drivers"

### Performance Insights
93. ✅ "Why was VER faster at corner X?"
94. ✅ "What makes corner X difficult?"
95. ✅ "Which corners are most important for lap time?"
96. ✅ "What's the correlation between corner X and overall lap time?"

## General Queries

### Help & Information
97. ✅ "What can you tell me about?"
98. ✅ "What data do you have?"
99. ✅ "How do I ask about corner performance?"
100. ✅ "What tracks are available?"

### Greetings & Small Talk
101. ✅ "Hello"
102. ✅ "Hi"
103. ✅ "Thanks"
104. ✅ "Goodbye"

---

## Query Patterns

### Pattern 1: Single Corner, Single Driver
- "Who was fastest at corner X?"
- "VER's corner X time"
- "What's the best corner X time?"

### Pattern 2: Single Corner, Multiple Drivers
- "Compare VER and HAM at corner X"
- "Who are the top 3 at corner X?"
- "Show me all drivers at corner X"

### Pattern 3: Multiple Corners, Single Driver
- "VER's best corners"
- "Where is VER strongest?"
- "VER's corner performance breakdown"

### Pattern 4: Multiple Corners, Multiple Drivers
- "Compare VER and HAM overall"
- "Top drivers at slow corners"
- "Corner performance comparison"

### Pattern 5: Session Comparison
- "Compare Q and R at corner X"
- "FP1 vs Q corner times"
- "Session comparison at Monaco"

### Pattern 6: Statistical Analysis
- "Average corner time for slow corners"
- "Corner type performance comparison"
- "Speed analysis for corner X"

### Pattern 7: Time-Based Analysis
- "How did corner X improve over session?"
- "Corner X times over time"
- "Best lap corner breakdown"

### Pattern 8: Tyre Analysis
- "Corner X on soft vs medium"
- "Tyre compound effect on corners"
- "Best corner X time on soft tyres"

---

## Response Quality Criteria

### Accuracy
- ✅ Correct data extraction
- ✅ Accurate calculations
- ✅ Proper driver/track/corner identification
- ✅ Correct time/speed values

### Clarity
- ✅ Clear, natural language
- ✅ Specific numbers when relevant
- ✅ Proper units (seconds, km/h)
- ✅ Context included (track, year, session)

### Completeness
- ✅ Answers the question fully
- ✅ Includes relevant details
- ✅ Provides context when needed
- ✅ Suggests follow-up questions

### Helpfulness
- ✅ Handles ambiguous queries
- ✅ Suggests alternatives when data missing
- ✅ Provides relevant follow-up suggestions
- ✅ Explains limitations when needed

---

## Testing Scenarios

### Happy Path Tests
1. ✅ Simple corner query with all parameters
2. ✅ Driver comparison query
3. ✅ Statistical query
4. ✅ Session information query

### Edge Case Tests
5. ✅ Missing track/year parameters
6. ✅ Invalid corner number
7. ✅ Invalid driver code
8. ✅ Non-existent session
9. ✅ No data available

### Error Handling Tests
10. ✅ Database unavailable
11. ✅ JSON file missing
12. ✅ Invalid query format
13. ✅ Rate limiting
14. ✅ Timeout scenarios

### Performance Tests
15. ✅ Response time < 3 seconds
16. ✅ Handles multiple concurrent requests
17. ✅ Caching effectiveness
18. ✅ Database query optimization

---

**Total Use Cases**: 104+
**Categories**: 8
**Query Patterns**: 8
**Test Scenarios**: 18

