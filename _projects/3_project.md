---
layout: page
title: Open World Amodal Counting
description: 
img: assets/img/countocc.jpg
importance: 2
category: research
related_publications: false
---

I am working on the [CAPTURe](https://arxiv.org/abs/2504.15485) benchmark, which evaluates the ability of vision-language models (VLMs) to perform amodal counting—inferring the number of occluded objects based on visible patterns. This task reflects critical spatial reasoning skills that current VLMs largely lack. 

My goal is to develop a system that improves counting accuracy under occlusion by enhancing pattern recognition, integrating visual and textual cues, and exploring hybrid approaches such as inpainting pipelines, coordinate extraction, or reasoning modules.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/capture.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Occluded image example with an output from GPT4-o. People can easily infer the missing number of cups and correctly reason over occluded patterns, models generally struggle to reason over these occluded scenes.
</div>

    ---
    Project is currently under review at CVPR 2026
    ---

## 📝 Citation

```bibtex
@article{arib2025counting,
  title={Counting Through Occlusion: Framework for Open World Amodal Counting},
  author={Arib, Safaeid Hossain and Akter, Rabeya and Chowdhury, Abdul Monaf and Sourov, Md Jubair Ahmed and Hasan, Md Mehedi},
  journal={arXiv preprint arXiv:2511.12702},
  year={2025}
}
```