## Learning Planner

### Overview

- Help users design free, personalised learning plans.
- Counter trend of platforms pushing low-value, paywalled courses
- Focus on using high-quality, freely available content from the web
- Structured learning without locking into a platform.

### Key Features:

- Tool to curate and organise learning plans (inspired by university course structure).
- Weekly modules. In this project its referred to as `Segments`
- Assigned readings/media. Referred to as `Resources`
- Projects or deliverables. Referred to as `Tasks` that are attached to `Segments` within a `LearningPlan`
- Periodized Timelines. `LearningPlan` and `Segments` have start and end dates.
- Community:
  - users can publish and share `LearningPlans`
  - plans serve as templates or starting points for other. Similar to forking a Github repo
- AI integration (planned)
  - Assist in creating structured learning plans.
  - can recommend resources based on `LearningPlan` objectives

### Database Design

![database design diagram](https://github.com/suha-nathan/ellev2/blob/main/elle-db-design.png)

### Frontend and UI/UX Design

View the planned frontend design here - [figma design](https://www.figma.com/design/FJvbTGWvBUxe0lgRgR4lHw/ellev2?node-id=0-1&t=97aVsSVQXVDPu6ju-1)

#### Design Goals/Evaluation Criteria

1. Ease of Use

    - Intuitive multi-step input. `Learning Plan` > `Segments` > `Tasks`. Need clean UI for `Segment` and `Task` nesting
    - Ease of editing plan when falling behind.
    - Flexible enough to add/delete/move segments
    - Search and Navigation for existing/public plans

2. Responsive Design

    - 12-8-4 column system grid system in responsive web design.
    - consistent gutter and column width sizes throughout layout for consistent design
    - Wireframing Process:
      <ol type="a">
      <li> What are the main screens and what type of content do you want to include in each? </li>
      <li>Brainstorm - wireframe/sketch ideas for a screen on paper.</li>
      <li>Identify components/ideas that pop out/might work well and why.</li>
      <li>Re-arrange and make a composite if necessary. Repeat for all different screens</li>
      </ol>

3. Differentiation From Current Tools

    - Notion. Couldn't just use a Notion template? Caveat: Structure and Progress tracking
    - Trello. Task based, kanban style project management. Caveat:
    - Udemy/Coursera
    - Obsidian/Roam
  
    Possible Differentiators from current tools:
    
    - Forkable public learning plans
    - Rich resource Linking to `LearningPlan`/`Segment`/`Task`
    - Learning pacing and reminders. Similar to a LMS platform
    - AI powered planning/content search
