import json
import os
import pandas as pd
from tabulate import tabulate

def generate_report():
    results_path = os.path.join(os.path.dirname(__file__), 'benchmark_results.json')
    if not os.path.exists(results_path):
        print("Error: benchmark_results.json not found.")
        return

    with open(results_path, 'r') as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    
    # 1. Summary by Model
    summary_model = df.groupby('model').agg({
        'wer': 'mean',
        'cer': 'mean',
        'rtf': 'mean',
        'processing_time_sec': 'mean',
        'peak_ram_mb': 'max',
        'peak_vram_mb': 'max',
        'peak_cpu_percent': 'mean'
    }).reindex(["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]).dropna()

    # 2. Summary by Dataset
    summary_dataset = df.groupby(['dataset', 'model']).agg({
        'wer': 'mean',
        'cer': 'mean',
        'rtf': 'mean'
    }).unstack()

    # Generate Markdown Report
    report_md = "# Whisper Model Benchmarking Report\n\n"
    report_md += f"Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    report_md += "## Executive Summary\n"
    report_md += "This report summarizes the performance, accuracy, and resource utilization of various Whisper models on the Skriptor dataset.\n\n"
    
    report_md += "### Model Comparison (Averages)\n"
    report_md += tabulate(summary_model, headers='keys', tablefmt='github') + "\n\n"
    
    report_md += "### Accuracy (WER) per Dataset\n"
    report_md += tabulate(summary_dataset['wer'], headers='keys', tablefmt='github') + "\n\n"
    
    report_md += "### Accuracy (CER) per Dataset\n"
    report_md += tabulate(summary_dataset['cer'], headers='keys', tablefmt='github') + "\n\n"

    report_md += "## Analysis\n"
    report_md += "### Accuracy vs Model Size\n"
    report_md += "As expected, larger models generally provide lower Word Error Rate (WER). `large-v3` and `turbo` usually offer the best performance for complex audio, while `small` or `medium` offer a good balance for general Indonesian transcription. `turbo` is particularly interesting for its speed-to-accuracy ratio.\n\n"
    
    report_md += "### Resource Efficiency\n"
    report_md += "The Real-Time Factor (RTF) increases significantly with model size. `tiny` and `base` are extremely fast but less accurate. `large-v3` requires substantial VRAM and processing time.\n\n"

    report_md += "## Raw Data\n"
    report_md += "The full raw data is exported to `benchmarking_raw.xlsx` for further analysis.\n"

    with open(os.path.join(os.path.dirname(__file__), 'benchmarking_report.md'), 'w') as f:
        f.write(report_md)

    # Generate Excel Report
    excel_path = os.path.join(os.path.dirname(__file__), 'benchmarking_raw.xlsx')
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Raw Results', index=False)
        summary_model.to_excel(writer, sheet_name='Model Summary')
        summary_dataset.to_excel(writer, sheet_name='Dataset Summary')

    print(f"Reports generated:\n- {os.path.join(os.path.dirname(__file__), 'benchmarking_report.md')}\n- {excel_path}")

if __name__ == "__main__":
    generate_report()
