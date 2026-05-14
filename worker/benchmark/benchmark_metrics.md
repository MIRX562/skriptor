# Skriptor Benchmark Metrics & Dashboard Guide

This document outlines the metrics and analytical tools available in the Skriptor Benchmarking Dashboard.

## 📊 Performance Metrics

### Accuracy
*   **WER (%)**: Word Error Rate. The primary metric for ASR accuracy. Calculated as `(Substitutions + Deletions + Insertions) / Total Words`.
*   **CER (%)**: Character Error Rate. Useful for identifying minor spelling or casing issues that might not affect word-level understanding.
*   **WER StdDev**: Standard deviation of WER across all files in a dataset. High values indicate inconsistent model performance.

### Efficiency
*   **Speed Multiplier (x)**: How many times faster than real-time the model processed the audio. `Speed = 1 / RTF`.
*   **RTF**: Real-Time Factor. `Processing Time / Audio Duration`.
*   **Peak VRAM (MB)**: Maximum GPU memory consumed during transcription.
*   **Peak RAM (MB)**: Maximum system memory consumed.
*   **CPU (%)**: Peak CPU utilization during the process.

### Composite Ratios (Value Metrics)
*   **Acc/Speed Ratio**: A balance score where higher is better. It rewards models that maintain high accuracy while increasing speed.
*   **Acc/VRAM Ratio**: Accuracy per unit of memory. Helps identify the most "lean" models for deployment on constrained hardware.

---

## 🗣️ Linguistic Metrics

These metrics are calculated for every audio file to help correlate linguistic complexity with model performance.

*   **WPM (Words Per Minute)**: Measures the speed of speech. Helps identify if a model fails specifically on fast speakers.
*   **Lexical Density**: The ratio of content words to total words. Higher density typically means more complex, information-heavy speech.
*   **Avg Word Length**: Average characters per word. A proxy for vocabulary complexity.
*   **CS Score (Code-Switching)**: A heuristic score indicating the presence of multiple languages or technical jargon (based on non-dictionary word frequency).

---

## 🔎 Dashboard Tabs & Tools

### 1. 📊 Performance Summary
A high-level view ranking models by Accuracy, Speed, and Resource Efficiency. Includes "Best Value" badges for different hardware constraints.

### 2. 📈 General Overview
Box plots showing the distribution of WER and Speed across all models, plus WER vs. CER correlation scatter plots.

### 3. 🗣️ Linguistic Deep Dive
Analyzes how linguistic features impact accuracy. Includes:
*   Correlation scatter plots with trendlines (requires `statsmodels`).
*   **Model Extreme Cases**: A table showing the "Best Case" and "Worst Case" files for every model, including their specific linguistic traits.

### 4. ⚡ Efficiency & Resources
VRAM consumption comparisons and the "Accuracy vs. Speed Trade-off" Pareto-style chart.

### 5. 🏆 Hardest Files
A ranked list of the 20 files that caused the highest average error rates across all models.

### 6. 🔎 Transcription Comparison
A side-by-side text viewer that highlights differences between the **Source (Ground Truth)** and the **Generated Text**. Includes a Switcher to compare different model outputs for the same file.

### 7. 📄 Detailed Data
The raw data table containing every single metric for every transcription run. Fully searchable and sortable.

---

## 📥 Data Export
The dashboard supports exporting the currently filtered view into:
*   **CSV**: Raw data for external processing.
*   **Excel (.xlsx)**: Includes both raw data and a pre-calculated "Model Summary" sheet.
*   **Markdown (.md)**: A formatted table of the results for documentation or reports.
