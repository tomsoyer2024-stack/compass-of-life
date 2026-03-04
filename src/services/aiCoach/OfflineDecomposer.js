/**
 * OfflineDecomposer.js
 * A lightweight, rule-based engine to provide instant steps without API calls.
 * Handles common categories: Health, Work, Cleaning, Shopping, Learning.
 */
export const OfflineDecomposer = {
    Decompose(goal) {
        const g = goal.toLowerCase();

        // 1. HEALTH & FITNESS
        if (g.match(/(run|jog|walk|drive|fitness|gym|workout|sport|exercise|train)/)) {
            return {
                type: 'steps',
                steps: [
                    { title: "Put on workout gear", completed: false },
                    { title: "Fill water bottle", completed: false },
                    { title: "Warm up (5 mins)", completed: false },
                    { title: "Main activity (20 mins)", completed: false },
                    { title: "Cool down & Stretch", completed: false }
                ]
            };
        }

        // 2. LEARNING / READING
        if (g.match(/(read|learn|study|course|lesson|book|exam)/)) {
            return {
                type: 'steps',
                steps: [
                    { title: "Clear desk/space", completed: false },
                    { title: "Open book/course material", completed: false },
                    { title: "Set timer for 25 mins (Pomodoro)", completed: false },
                    { title: "Review key concepts", completed: false },
                    { title: "Write summary", completed: false }
                ]
            };
        }

        // 3. CLEANING / CHORES
        if (g.match(/(clean|wash|tidy|organize|declutter|trash|dishes|laundry)/)) {
            return {
                type: 'steps',
                steps: [
                    { title: "Put on music/podcast", completed: false },
                    { title: "Gather supplies (bags, sprays)", completed: false },
                    { title: "Clear visible clutter first", completed: false },
                    { title: "Wipe surfaces", completed: false },
                    { title: "Take out trash", completed: false }
                ]
            };
        }

        // 4. BUYING / SHOPPING
        if (g.match(/(buy|purchase|shop|get|order|find)/)) {
            return {
                type: 'steps',
                steps: [
                    { title: "Define budget & specs", completed: false },
                    { title: "Compare 3 options online", completed: false },
                    { title: "Check reviews/ratings", completed: false },
                    { title: "Check for coupons/deals", completed: false },
                    { title: "Make purchase", completed: false }
                ]
            };
        }

        // 5. WORK / PROJECT
        if (g.match(/(write|email|call|meeting|report|presentation|code|debug)/)) {
            return {
                type: 'steps',
                steps: [
                    { title: "Define the desired outcome", completed: false },
                    { title: "Gather necessary info/files", completed: false },
                    { title: "Draft outline/key points", completed: false },
                    { title: "Execute first draft", completed: false },
                    { title: "Review and refine", completed: false }
                ]
            };
        }

        // No match found
        return null;
    }
};
