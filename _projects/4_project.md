---
layout: page
title: Human Activity Detection
description: 
img: assets/img/u_action_abs.jpg
importance: 2
category: research
---

**U-ActionNet** is a unified multi-stage neural network framework for human action recognition from aerial videos that blends spatial and temporal streams. It is designed to capture long-term motion, appearance and behavior patterns effectively from aerial videos with complex human-object-human interactions.


## 🧠 Motivation

Aerial action recognition is particularly challenging due to:
- Complex object manipulation under occlusion and motion
- Diverse temporal lengths and scene compositions
- Multiple actors in the frame in non-trivial actions

Previous methods either:
- Focused on short-term features (e.g., optical flow, CNNs)
- Or lacked unified temporal modeling across long horizons

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/u_action_abs.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Flow of Human Action Recognition (HAR) framework employing Unmanned Aerial Vehicle (UAV) technology in surveillance systems
</div>

**U-ActionNet** addresses this gap by introducing:
- Multi-stage feature extraction with region of interest extraction using _YOLO_
- Fusion of spectral and temporal features to understand motion patterns
- Modular design to handle both short-term and long-term dependencies
- Edge device compatible low compute lightweight version

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/u_action_model.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    U-ActionNet architecture incorporates an Object Localization Block (green), m-C3D Block for feature extraction (red), Fourier Substance Separation Block (blue), Fourier Self-Attention Block (blue), and two Dense Layers (yellow)
</div>

---

## ⚙️ Key Features

- **Multi-Stage Transformer Backbone**:
  - Region of Interest extraction using _YOLO_
  - Feature Extraction using modified C3D module

- **Fourier Based Action Recognition**:
  - Fourier Substance Separation module isolates dynamic action rich regions from static regions
  - Fourier Self-Attention captures and memorises context from the aerial videos

- **Compatibility**:
    - For the serverside heavy duty serverside model 
    - For edge device, key frame based lightweight model 
    
---


## 📝 Citation

```bibtex
@article{chowdhury2024u,
  title={U-ActionNet: Dual-pathway fourier networks with region-of-interest module for efficient action recognition in UAV surveillance},
  author={Chowdhury, Abdul Monaf and Imran, Ahsan and Hasan, Md Mehedi and Ahmed, Riad and Azad, Akm and Alyami, Salem A},
  journal={IEEE Access},
  year={2024},
  publisher={IEEE}
}
```

