---
layout: page
title: Time Series Forecasting
description: 
img: assets/img/t3_time.jpg
importance: 1
category: research
related_publications: false
---
### **T3Time** accepted for a Poster @AAAI 26
---

**T3Time** is a novel trimodal time series forecasting framework that leverages fourier, time series, and prompt domains to integrate both temporal semantics and autoregressive modeling. It is designed to exploit the full generalization potential of large-scale pre-trained models while addressing challenges specific to multivariate temporal data.

## 🧠 Motivation

Recent advances in time series forecasting have been driven by deep learning based architectures, particularly transformer based. With the development of foundation models, LLMs have also been utilized for long term time series forecasting. 

However, these approaches often:
- Fails to generalize short/long duration
- Has poor representation capability 


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/t3_time.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Overview of T3Time's Framework
</div>

**T3Time** introduces a novel framework that:
- Fuses three different modalities; Time, Frequency, Prompt
- Integrates multi-head cross modal alignment(CMA) dynamically to align the modalities
- Blends residual time-spectral features with CMA heads for fine grained feature representation


---

## ⚙️ Key Features

- **TriModal**: To better represent time series data, three different modalities i.e. time, spectral, and LLM-based have been used to represent the temporal information

- **Multi Head Dynamic CMA**:
  - Multiple Cross Modal Alignment heads are implemented to align the time and spectral representations
  - Dynamic Multi Head CMA allows to dynamically select the most important modality aligned head for the particular task

- **Residual Connection**:
  -   For fine grained representation, prior time-spectral features are further ingrained with the CMA representations enabling a richer context aware representations. 
    
- **Backbone Compatibility**:
  - Compatible with GPT-2/3/4-style decoders


---

## 📊 Results Summary

**T3Time** consistently outperforms strong baselines across multiple benchmarks. Average results are given below:

| Dataset   | MSE ↓      | MAE ↓      | 
|:----------|:-----------|:-----------|
| ETTm1     | **0.372**  | _0.393_    | 
| ETTm2     | _0.279_    | **0.322**  | 
| ETTh1     | **0.418**  | **0.430**  | 
| ETTh2     | **0.348**  | **0.390**  | 
| ECL       | **0.170**  | **0.266**  | 
| Weather   | **0.244**  | **0.275**  | 
| ILI       | **1.705**  | **0.835**  | 
| Exchange  | **0.353**  | **0.401**  | 


See the full table in the [T3Time paper](https://www.arxiv.org/abs/2508.04251) 

---

## 📝 Citation

```bibtex
@article{chowdhury2025t3time,
  title={T3Time: Token-Timestamp Transformers for Time Series Forecasting},
  author={Chowdhury, Monaf and Others},
  journal={arXiv preprint arXiv:2508.04251},
  year={2025}
}
```
