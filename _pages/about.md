---
layout: home
title: about
permalink: /

# ---- hero ----
kicker: Research Assistant · AVIS Lab, University of Dhaka
tagline: I work on embodied agents that learn *long-horizon skills* from *offline data* and from *language feedback*.
status: Applying for PhD positions · Fall 2027 # links to the PhD section below

profile:
  image: prof_pic.jpg
  alt: Portrait of Abdul Monaf Chowdhury

links:
  - { label: Email, icon: fa-solid fa-envelope, url: "mailto:monafabdul15@gmail.com" }
  - { label: CV, icon: fa-solid fa-file-lines, url: /assets/pdf/resume.pdf }
  - { label: Scholar, icon: ai ai-google-scholar, url: "https://scholar.google.com/citations?user=LBoyI9cAAAAJ" }
  - { label: GitHub, icon: fa-brands fa-github, url: "https://github.com/monaf-chowdhury" }
  - { label: LinkedIn, icon: fa-brands fa-linkedin, url: "https://www.linkedin.com/in/monaf-chowdhury" }
  - { label: X, icon: fa-brands fa-x-twitter, url: "https://x.com/monaf_chowdhury" }

# ---- research ----
research:
  lead: >-
    I want agents that can carry out long, multi-step tasks in the real world. That takes value estimates
    that stay accurate over long horizons, feedback that tells an agent *where* an attempt went wrong and
    not just *that* it failed, and representations that bring together what an agent sees, reads and
    measures. My work so far follows three threads.
  threads:
    - title: Offline goal-conditioned RL
      tone: sky
      text: >-
        Learning to reach any goal from a fixed dataset. I study value learning that stays correct over
        long horizons and under stochastic dynamics, and which representations actually help a
        goal-reaching agent act better.
      projects:
        - { label: GTRL, url: /projects/gtrl.html }
        - { label: Goal representations, url: /projects/goal-representations.html }
    - title: Language-guided embodied agents
      tone: teal
      text: >-
        Vision–language models as critics for robot learning: structured reflections on failed
        episodes, grounded in time and turned into dense reward shaping for manipulation.
      projects:
        - { label: LAGEA, url: /projects/lagea.html }
    - title: Multimodal learning
      tone: indigo
      text: >-
        Fusing complementary views of one signal, such as time, frequency and language, or the
        visible and hidden parts of a scene, into representations that hold up with little data.
      projects:
        - { label: T3Time, url: /projects/t3time.html }
        - { label: CountOCC, url: /projects/countocc.html }

# ---- PhD ----
phd:
  kicker: Fall 2027
  title: Looking for a PhD position
  text: >-
    I'm applying to PhD programs starting in **Fall 2027**. I want to keep building embodied agents that
    learn long-horizon skills, where reinforcement learning, vision–language models and robot
    manipulation meet. My first-author work has appeared at **ICML 2026** and **AAAI 2026**.


    If you work on robot learning, embodied AI or reinforcement learning and think we'd be a good fit,
    I'd love to hear from you.
  directions_title: What I want to work on
  directions:
    - title: Long-horizon RL from offline data
      text: Value learning and planning that chain short behaviours into long tasks without compounding error.
    - title: Language as a learning signal
      text: Feedback from vision–language models that is grounded in time and tells a robot what to fix.
    - title: Multimodal agents in the real world
      text: Agents that fuse vision, language and other senses so they act reliably outside simulation.
  actions:
    - { label: Email me, icon: fa-solid fa-envelope, url: "mailto:monafabdul15@gmail.com", primary: true }
    - { label: Download CV, icon: fa-solid fa-arrow-down, url: /assets/pdf/resume.pdf }

# ---- news & publications ----
announcements:
  enabled: true # includes a list of news items
  scrollable: true # the list scrolls inside a fixed-height box
  limit: # leave blank to include all the news in the `_news` folder

# Project pages to feature, by file name in _projects/. Title, authors, venue, summary and
# links are read from each project page, so they stay in sync.
featured:
  - gtrl
  - goal-representations
  - lagea
  - t3time

visitor_map:
  enabled: true
  title: Global visitors
  description: A live snapshot of where visitors have been dropping in from. Click anywhere on the map to open the more detailed view.
  note: Powered by MapMyVisitors.
  stats_url: https://mapmyvisitors.com/web/1c2l4
  widget_id: rTuVfwRztL_rGV-aJs_NC5jLGSvWohL70zq6GglW844
  text_color: ffffff
  ocean_color: 3d84b8
  map_type: n
  width: a
---

I'm a Research Assistant at the **AVIS Lab**, University of Dhaka, working on offline goal-conditioned reinforcement learning and long-horizon robot manipulation. Most recently, I grounded divide-and-conquer value learning with temporal differences so it holds up under stochastic dynamics ([GTRL](/projects/gtrl.html)), and turned a vision–language model's reflections on failed episodes into reward for robot manipulation ([LAGEA](/projects/lagea.html), ICML 2026).

Before this, I was a Research Assistant at the [MAIM Lab](https://www.maimlab.com/), building a wearable fetal-movement monitor for stillbirth prevention, a [Wellcome Leap In Utero](https://wellcomeleap.org/inutero/) project with [Dr. Abhishek Kumar Ghosh](https://www.du.ac.bd/faculty/faculty_details/RME/2318) and [Dr. Niamh Nowlan](https://people.ucd.ie/niamh.nowlan). I hold a BSc in Robotics and Mechatronics Engineering from the University of Dhaka (2024), where [Dr. Md Mehedi Hasan](https://www.du.ac.bd/faculty/faculty_details/HSS/4706) supervised my thesis on UAV-based human action recognition.

<!-- https://claude.ai/artifact/9TAK384Mtz9Gxb4fdKQmyd
Select colour based on here. _sass\_variables.scss -> $paper-color: #f9f6f0;
 -->
