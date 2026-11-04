# Model prompts for the Intelligent UI library (#205)

33 prompts, 10 marked **Opus** for the `claude-opus-5-5` cross-check. Every prompt goes to `claude-sonnet-5-5`. The _Aims at_ line is a hint for review only and isn't sent to the model.

## Forms and inputs (6)

- **forms-01** · **Opus**: I'm running a summer soccer camp for kids aged 6 to 12. Make a sign-up form: child's name, date of birth, parent's email, T-shirt size, any allergies or medical notes, and a box they must tick to agree to the photo policy.
  - _Aims at:_ Form, Input rules (email, required), DatePicker min/max, Select, TextArea, Checkbox required, @ToAssistant
- **forms-02**: Help me pick a bike. Ask what my budget is, what I'll mostly ride on (road, gravel, trails or around town), how tall I am, and whether I want electric. Then I'll send it to you.
  - _Aims at:_ RadioGroup cards, Slider with unit and marks, Input number, SegmentedControl, Form
- **forms-03**: Three of us share a $2,450 a month rent. The bedrooms are 14, 11 and 9 square metres. Split the rent fairly by room size, let us change the sizes, and show each share to the cent so it adds up exactly.
  - _Aims at:_ @Allocate, @Format currency, Input number, @Default, @Clamp, Table
- **forms-04**: Make me a to-do list for moving apartments. I want to add tasks, tick them off, delete them, and see how many are left, with a button to copy what is left as a list. Start it with a few obvious ones.
  - _Aims at:_ Input, Button @Append, Checkbox lineThrough, IconButton @RemoveAt or @Remove, @Filter, @Count, @Plural, @Reset, @Join, @CopyToClipboard
- **forms-05**: I want to leave feedback on my hotel stay: a 1 to 5 rating, which things were good (room, staff, breakfast, location, wifi), a comment of up to 500 characters, and whether they may contact me. Send it when I'm done.
  - _Aims at:_ RadioGroup pills, Pressable chips with @Toggle/@Includes, TextArea maxLength, Checkbox, Form, @ToAssistant
- **forms-06**: I'll paste the names for our 5-a-side football night, separated by commas. Clean them up, drop duplicates and shuffle them into teams of 5. Here they are: sam, Priya , jo, Mateo, ana, sam, Kofi, lena, Raj, tom, Mei, Oskar, jo, Beatriz
  - _Aims at:_ TextArea, @Split, @Trim, @Capitalize, @Unique, @Shuffle in @Set, @Chunk, @Each, Grid, Card

## Charts and data (5)

- **charts-01** · **Opus**: Here's my spending for the first half of the year. Rent was 1,400 every month. Groceries: 420, 395, 450, 410, 470, 430. Transport: 160, 150, 175, 140, 190, 165. Eating out: 210, 180, 260, 240, 300, 280. Subscriptions: 45 each month. Show me where my money goes, how each month stacks up, a heatmap by category and month, and how June compares with May.
  - _Aims at:_ Chart stacked bar, donut format percent, @Pivot, @GroupBy, @Sum, @Change, @MixColor, @Format currency/percent, Table, Grid
- **charts-02**: Compare five years of running costs for a Tesla Model 3 and a Toyota Corolla if I drive 15,000 km a year. Let me change the yearly distance, the petrol price and the electricity price.
  - _Aims at:_ Slider, Input number, @Range, @Each, @Cumulative, Chart line, Table, SearchImage, @Format currency
- **charts-03** · **Opus**: Mortgage calculator: a $450,000 house, 20% down, 6.2% interest. Show the monthly payment and the total interest over 30 years, and let me compare it with a 15-year loan.
  - _Aims at:_ @Payment, SegmentedControl, Slider, Chart area, @Format currency/compact, Popover, Badge
- **charts-04**: These are my 5k times this season: 31:10, 30:42, 29:55, 30:20, 29:01, 28:47, 28:30, 28:55, 27:58. Am I getting faster? Show the trend with a moving average, my best and average time, and how my times spread out.
  - _Aims at:_ @MovingAvg, @Stats, @Min, @Avg, @Duration clock, @Histogram, Chart line and bar, Badge
- **charts-05**: My daughter was born on 14 March 2025. How old is she in months and weeks today, and when are her checkups at 2, 4, 6, 9, 12, 15 and 18 months? Mark which ones are already past.
  - _Aims at:_ @Today, @MonthsBetween, @DaysBetween, @AddMonths, @FormatDate, List timeline, ListItem marker, Badge

## Maps and routes (4)

- **maps-01** · **Opus**: Plan a one-day walking route in Kyoto that takes in Fushimi Inari, Kiyomizu-dera, Gion and the Philosopher's Path, with roughly how long each walk between them takes.
  - _Aims at:_ Map route, MapMarker icon, List timeline, SearchImage, @Convert, @Duration, Badge
- **maps-02**: Find me 8 good coffee shops in Melbourne's CBD, grouped as laptop-friendly, specialty or brunch, on a map I can click to see the details of each one, with a button that opens the place in Google Maps.
  - _Aims at:_ Map selected binding, MapMarker category, @Find, @Filter, Card, Link, SearchImage, @OpenUrl
- **maps-03**: We're driving from San Francisco to Los Angeles along Highway 1 over three days. Where should we stay each night, and what's worth stopping for each day?
  - _Aims at:_ Map route with many markers, SegmentedControl day filter, @Filter, @Flatten or @Concat, Carousel, SearchImage, Badge
- **maps-04**: Where were the seven wonders of the ancient world? Put them on a map and tell me which one still stands.
  - _Aims at:_ Map fitted across continents, MapMarker emoji icons, Table, Badge, Popover

## Drawing and Svg (4)

- **drawing-01** · **Opus**: How do I tie a bowline knot? Show me step by step with a drawing for each step.
  - _Aims at:_ Svg, Path, Line with Polygon arrow, SvgText, $step, Button, Pressable strip
- **drawing-02** · **Opus**: Explain how a four-stroke car engine works, with a diagram I can step through intake, compression, power and exhaust.
  - _Aims at:_ Svg, G transform driven by state, Rect, Circle, Line, SegmentedControl or Slider
- **drawing-03**: Draw my living room to scale: 5 m by 4 m, a 2.2 m sofa against one long wall, the TV opposite, a 1.2 m round dining table in a corner and the door on a short wall. Can an armchair fit? Let me slide it around.
  - _Aims at:_ Svg, Rect, Ellipse, Circle, SvgText, Slider moving shapes, @Convert
- **drawing-04**: Show me why the moon has phases, with the sun, Earth and moon drawn, and a slider for the day of the month.
  - _Aims at:_ Svg, Circle, Ellipse, Path, Polyline or Polygon, Slider, @Lerp, Math

## Flashcards, quizzes and steps (5)

- **learning-01**: Make me flashcards for 15 common Spanish verbs, with an example sentence on the back, a way to shuffle them, and a button that picks one at random for me to practise.
  - _Aims at:_ Flashcard in Carousel or Grid, hint, @Shuffle and @Pick in @Set, Badge
- **learning-02** · **Opus**: Quiz me on world capitals: 10 multiple-choice questions, show my score as I go, and celebrate if I get them all right.
  - _Aims at:_ RadioGroup or Pressable, @Set score, @IndexOf or $index, @Count, Celebration, Badge, @Reset
- **learning-03**: Teach me the quadratic formula and give me three practice problems where I can type my answers and check them.
  - _Aims at:_ Math, Markdown, Input number, @Sqrt, @Pow, @Round, Popover hints, Badge
- **learning-04**: Walk me through making sourdough bread over two days, with a timer for each rest and fold, the clock time each step is due if I start now, and let me tick off each step.
  - _Aims at:_ List timeline, ListItem marker, Timer, Checkbox, @Duration, @Pad, @AddDays, @Now, @FormatDate time
- **learning-05**: I'm learning Python. Explain list comprehensions with a few examples, link a good video if you know one, and end with a short quiz.
  - _Aims at:_ Code, Markdown, Quote, YouTube, Link, RadioGroup quiz, Divider

## Small games (3)

- **games-01** · **Opus**: Let's play tic-tac-toe, me against the page.
  - _Aims at:_ Grid of Pressable, $board, @Update or index logic, @Includes, Celebration, Button @Reset
- **games-02**: Make a snake game I can play with the arrow keys.
  - _Aims at:_ HtmlView with canvas and a game loop
- **games-03**: Number guessing game: pick a number from 1 to 100, tell me higher or lower after each guess, and count my guesses.
  - _Aims at:_ @Random in @Set, Input number, @Append or @Prepend history, @Reverse, @Count, @Last, Celebration, @Reset

## Edge cases (6)

- **edge-01**: Show me the full text of all ten amendments in the US Bill of Rights, with a one-line plain-English note under each.
  - _Aims at:_ Long text: Markdown, Quote, List, Popover, Text maxLines
- **edge-02** · **Opus**: Build me an expense tracker for this month. I haven't spent anything yet, so start it empty, but give me totals, a chart by category and a daily chart that fill in as I add entries, and let me look at just a date range.
  - _Aims at:_ Empty data: @Sum/@Avg/@Stats of [], Chart with no rows, @Bucket, @Today, @StartOf, @Percent with total 0, Form inputs, @Append, DatePicker with @Between
- **edge-03** · **Opus**: List all 50 US states with their capital, population and the year they joined the union. Let me filter by region, sort by any column, and page through them 10 at a time.
  - _Aims at:_ Many items: Table with 50 rows, Select, SegmentedControl, @Sort, @Filter, @Top, @Slice or @Take paging, @Format compact
- **edge-04**: Show me the whole periodic table, all 118 elements, laid out like the real thing, and let me tap an element for its details.
  - _Aims at:_ Many items and limits: Grid past 12 columns, Pressable, $selected, Popover, @Find, @Chunk
- **edge-05**: Make a card for guests with our wifi. The network is TheVeryLongNetworkNameForOurHouseOnMapleStreet_5GHz_Extended and the password is Xk9#mQ2$vL8@pR4!nW6^tY1&zB3*hJ7%cD5. Add copy buttons for both.
  - _Aims at:_ Long unbroken strings at phone width: Code, Text, @CopyToClipboard, IconButton
- **edge-06**: My dog Rex is lost. Make a poster using his photo at https://example.invalid/photos/rex-golden-retriever.jpg. He's a 4-year-old golden retriever with a red collar, last seen near Riverside Park on Tuesday evening. My number is 555-0142.
  - _Aims at:_ Broken image URL: Image fallback to a found photo, Title, Badge, Text, @FormatDate

## Coverage

- The hints name 48 of the 55 components. The rest (Col, Row, Box, Spacer, Caption, Label, Icon) are layout and text pieces almost every program uses.
- They name 65 of the 73 @functions in the prompt. The rest (@First, @Max, @Abs, @Floor, @Ceil, @Upper, @Lower, @Replace) are left to the known-answer @function checks, since no natural request needs them.
- They name all five action steps: @ToAssistant, @OpenUrl, @Set, @Reset and @CopyToClipboard.
- Some prompts push the library's limits:
  - a periodic table that needs more than Grid's 12 columns;
  - an empty tracker;
  - 50-row and 118-item lists;
  - long unbroken strings at phone width;
  - a broken image URL;
  - a world-wide map fit;
  - an HtmlView game loop;
  - a Timer;
  - `time` formatting from @Now.
