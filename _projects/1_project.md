---
layout: page
title: Embodied Agents in Simulated Environments
description: 
img: assets/img/embodied.jpg
importance: 1
category: ongoing
related_publications: false
---


**Context.** Vision Language Models have been used as a reward model for embodied agents for quite some time. Visual cues such as images and textual instructions have been used to guide agents to solve rudimentary tasks. In some cases [[furl]](https://arxiv.org/abs/2406.00645), cosine similarity betweeen visual cues and textual instructions have been used to generate VLM based rewards and align the agent towards goal task.

<!-- Alignment between **visual cues** and **B** is given by:
$$
Alignment = \frac{\mathbf{visual cues} \cdot \mathbf{B}}{\|\mathbf{visual cues}\| \|\mathbf{B}\|}
$$ -->

But in the long duration sparse reward tasks visual and textual reward alignment isn't enough. The agent fails at long duration complex task when rewards are provided at the end of the episode. Now the question becomes:

> **Can pretrained vision-language models provide reward signals and critique agent behavior in natural language?**

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/embodied.jpg" title="Meta World" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Meta-World long duration sparse reward MT10 tasks
</div>

To resolve this issue, I have been working on infusing VLM based textual feedback based on the work done on the episode. The feedback will provide historical context to the agent and provide guidance on what mistake the agent has done and what it needs to do correct its mistakes, as well as, what it should do to complete the task. 

I have designed and integrated a **Qwen 2.5VL-3B** VLM driven “episodic reflection” module, automatically generating rich, natural-language self-assessments of each trial—highlighting successes and pinpointing failure causes—to provide the agent with human-like introspection. Episodic reflection will enable reward alignment towards the goal task. For the reward function, I have crafted a semantically aware dense grounded reward mode which fuses verbal reflections and CLIP-style vision–language alignment from task descriptions and goal images.

The agent is trained using the **Soft Actor Critic** algorithm where usually the state space is the visual observation. To enrich the representation capability of the agent, natural language feedback along with the visual observations are utilized as the state space to guide the agent towards goal task. 

    ---
    Work is still in process 
    Expected Completion Date: September, 2025
    ---

<!-- ############################################### -->
{% comment %}
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.
</div>
{% endcomment %}

<!-- You can also put regular text between your rows of images, even citations {% cite einstein1950meaning %}.
Say you wanted to write a bit about your project before you posted the rest of the images.
You describe how you toiled, sweated, _bled_ for your project, and then... you reveal its glory in the next row of images. -->

{% comment %}
<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    You can also have artistically styled 2/3 + 1/3 images, like these.
</div>
{% endcomment %}

<!-- The code is simple.
Just wrap your images with `<div class="col-sm">` and place them inside `<div class="row">` (read more about the <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap Grid</a> system).
To make images responsive, add `img-fluid` class to each; for rounded corners and shadows use `rounded` and `z-depth-1` classes.
Here's the code for the last row of images above: -->

{% comment %}
{% raw %}
```html
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-4 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
``` 


{% endraw %}
{% endcomment %}