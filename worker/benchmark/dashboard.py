import streamlit as st
import pandas as pd
import json
import os
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

st.set_page_config(page_title="Skriptor Benchmark Dashboard", layout="wide")

st.title("🎙️ Skriptor: Whisper Model Benchmarking")
st.markdown("Interactive analysis of accuracy and resource usage across Whisper models.")

# Helper to load data
def load_benchmark_data(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Handle both new format (dict) and legacy format (list)
    if isinstance(data, dict):
        df = pd.DataFrame(data.get('results', []))
        device_info = data.get('device_info', {})
        dataset_stats = data.get('dataset_stats', {})
    else:
        df = pd.DataFrame(data)
        device_info = {}
        dataset_stats = {}
    
    if not df.empty and 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    return df, device_info, dataset_stats

# Scan for all result files
results_dir = os.path.dirname(__file__)
result_files = [f for f in os.listdir(results_dir) if f.endswith('.json') and (f.startswith('results_') or f == 'benchmark_results.json')]

# Sidebar filters
st.sidebar.header("📂 Data Selection")
selected_files = st.sidebar.multiselect(
    "Select Result Files", 
    options=result_files, 
    default=['benchmark_results.json'] if 'benchmark_results.json' in result_files else (result_files[:1] if result_files else [])
)

if not selected_files:
    st.warning("Please select at least one result file.")
    st.stop()

# Load all selected data
all_data = []
for f in selected_files:
    path = os.path.join(results_dir, f)
    df, dev_info, ds_stats = load_benchmark_data(path)
    if not df.empty:
        # Add source file name for identification
        df['source_file'] = f
        # Create a more descriptive "device_tag"
        gpu_name = dev_info.get('gpu', 'CPU Only')
        cpu_name = dev_info.get('cpu', 'Unknown CPU').split(' ')[0] # Shorten
        df['device_tag'] = f"{gpu_name} ({cpu_name})"
        all_data.append((df, dev_info, ds_stats))

if not all_data:
    st.error("No valid data found in selected files.")
    st.stop()

# Combine dataframes for comparison
combined_df = pd.concat([item[0] for item in all_data])

# Filters
st.sidebar.divider()
st.sidebar.header("🔍 Filters")
selected_models = st.sidebar.multiselect("Select Models", options=combined_df['model'].unique(), default=combined_df['model'].unique())
selected_datasets = st.sidebar.multiselect("Select Datasets", options=combined_df['dataset'].unique(), default=combined_df['dataset'].unique())

filtered_df = combined_df[combined_df['model'].isin(selected_models) & combined_df['dataset'].isin(selected_datasets)]

# Display Device Info if only one is selected or show comparison table
if len(selected_files) == 1:
    _, dev_info, ds_stats = all_data[0]
    if dev_info:
        st.info(f"**Hardware:** {dev_info.get('cpu')} | {dev_info.get('gpu')} ({dev_info.get('vram_gb')}GB VRAM) | RAM: {dev_info.get('ram_gb')}GB")
    
    if ds_stats:
        with st.expander("📊 Dataset Overview"):
            cols = st.columns(len(ds_stats))
            for i, (ds_name, stats) in enumerate(ds_stats.items()):
                with cols[i]:
                    st.metric(ds_name, f"{stats['total_files']} files")
                    st.caption(f"{stats['total_segments']} segments, ~{stats['avg_words_per_segment']} words/seg")
else:
    with st.expander("💻 Hardware Comparison"):
        compare_info = []
        for df, dev_info, _ in all_data:
            compare_info.append({
                "File": df['source_file'].iloc[0],
                "CPU": dev_info.get('cpu', 'N/A'),
                "GPU": dev_info.get('gpu', 'N/A'),
                "VRAM (GB)": dev_info.get('vram_gb', 'N/A'),
                "RAM (GB)": dev_info.get('ram_gb', 'N/A')
            })
        st.table(pd.DataFrame(compare_info))

# Layout - Comparison or Single Run
st.divider()

# Plotting function to handle comparison
def plot_metric(df, metric, title, is_comparison):
    color_by = "device_tag" if is_comparison else "model"
    fig = px.box(df, x="model", y=metric, color=color_by,
                 category_orders={"model": ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]},
                 title=title)
    return fig

is_comparison = len(selected_files) > 1

# Layout - Tabs for better organization
tab_overview, tab_errors, tab_linguistic, tab_efficiency = st.tabs([
    "📈 General Overview", 
    "🎯 Error Analysis", 
    "🗣️ Linguistic Deep Dive",
    "⚡ Efficiency & Resources"
])

with tab_overview:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Accuracy (WER) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "wer", "Word Error Rate Distribution", is_comparison), use_container_width=True)
    with col2:
        st.subheader("Efficiency (RTF) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "rtf", "Real-Time Factor (Speed)", is_comparison), use_container_width=True)
    
    st.divider()
    
    col_cer1, col_cer2 = st.columns(2)
    with col_cer1:
        st.subheader("Character Error Rate (CER)")
        st.plotly_chart(plot_metric(filtered_df, "cer", "Character Error Rate Distribution", is_comparison), use_container_width=True)
    with col_cer2:
        st.subheader("WER vs CER Correlation")
        fig_corr = px.scatter(filtered_df, x="wer", y="cer", color="device_tag" if is_comparison else "model", 
                            hover_data=['audio_file', 'model'],
                            title="Word Error Rate vs Character Error Rate")
        st.plotly_chart(fig_corr, use_container_width=True)

with tab_errors:
    st.subheader("Error Decomposition (WER)")
    st.markdown("Understanding why models fail: Substitutions (S), Deletions (D), or Insertions (I).")
    
    # Safety check for new error metrics
    error_cols = ['wer_sub', 'wer_del', 'wer_ins']
    if all(col in filtered_df.columns for col in error_cols):
        # Prepare data for stacked bar chart
        error_types = filtered_df.groupby(['model', 'device_tag']).agg({
            'wer_sub': 'sum',
            'wer_del': 'sum',
            'wer_ins': 'sum'
        }).reset_index()
        
        # Melt for plotly
        error_melted = error_types.melt(id_vars=['model', 'device_tag'], value_vars=['wer_sub', 'wer_del', 'wer_ins'],
                                       var_name='error_type', value_name='count')
        
        fig_err_type = px.bar(error_melted, x="model", y="count", color="error_type", 
                             facet_col="device_tag" if is_comparison else None,
                             title="Total Error Types across Dataset",
                             labels={'count': 'Total Words', 'error_type': 'Error Type'})
        st.plotly_chart(fig_err_type, use_container_width=True)
    else:
        st.info("Detailed error decomposition (S/I/D) is not available in these results. Please re-run the benchmark with the latest script.")
    
    st.divider()
    
    st.subheader("🏆 Hardest Files to Transcribe")
    st.markdown("Audio files that resulted in the highest average WER across all selected models.")
    hardest_files = filtered_df.groupby('audio_file').agg({
        'wer': 'mean',
        'dataset': 'first',
        'duration_sec': 'first'
    }).sort_values('wer', ascending=False).head(10).reset_index()
    
    hardest_files.columns = ['Audio File', 'Avg WER', 'Dataset', 'Duration (s)']
    st.table(hardest_files.style.format({'Avg WER': '{:.4f}', 'Duration (s)': '{:.2f}'}))

with tab_linguistic:
    col_ling1, col_ling2 = st.columns(2)
    
    with col_ling1:
        st.subheader("Accuracy vs. Speech Rate")
        st.markdown("Does speaking faster (WPM) make the model less accurate?")
        if 'wpm' in filtered_df.columns and not filtered_df['wpm'].isna().all():
            fig_wpm = px.scatter(filtered_df, x="wpm", y="wer", color="model", 
                                 hover_data=['audio_file'], trendline="ols",
                                 title="WER vs. Words Per Minute")
            st.plotly_chart(fig_wpm, use_container_width=True)
        else:
            st.info("WPM data not available in this result set.")
            
    with col_ling2:
        st.subheader("Accuracy vs. Lexical Density")
        st.markdown("Does a richer vocabulary (unique/total words) correlate with more errors?")
        if 'lexical_density' in filtered_df.columns and not filtered_df['lexical_density'].isna().all():
            fig_lex = px.scatter(filtered_df, x="lexical_density", y="wer", color="model",
                                 hover_data=['audio_file'], trendline="ols",
                                 title="WER vs. Lexical Density")
            st.plotly_chart(fig_lex, use_container_width=True)
        else:
            st.info("Lexical data not available in this result set.")

    st.divider()
    
    col_ling3, col_ling4 = st.columns(2)
    with col_ling3:
        st.subheader("Sentence Complexity (Word Length)")
        st.markdown("Average characters per word. Higher values usually indicate more formal or technical language.")
        if 'avg_word_len' in filtered_df.columns and not filtered_df['avg_word_len'].isna().all():
            fig_wordlen = px.scatter(filtered_df, x="avg_word_len", y="wer", color="model",
                                    hover_data=['audio_file'], trendline="ols",
                                    title="WER vs. Avg Word Length")
            st.plotly_chart(fig_wordlen, use_container_width=True)
        else:
            st.info("Word length data not available.")

    with col_ling4:
        st.subheader("Code-Switching (Indo-English)")
        st.markdown("Heuristic score for English word presence in the Indonesian dataset.")
        if 'cs_score' in filtered_df.columns and not filtered_df['cs_score'].isna().all():
            fig_cs = px.scatter(filtered_df, x="cs_score", y="wer", color="model",
                               hover_data=['audio_file'], trendline="ols",
                               title="WER vs. Code-Switching Score")
            st.plotly_chart(fig_cs, use_container_width=True)
        else:
            st.info("Code-switching data not available.")

with tab_efficiency:
    col_eff1, col_eff2 = st.columns(2)
    
    with col_eff1:
        st.subheader("Memory Usage (VRAM)")
        vram_compare = filtered_df.groupby(['model', 'device_tag'])['peak_vram_mb'].max().reset_index()
        fig_vram = px.bar(vram_compare, x="model", y="peak_vram_mb", color="device_tag", barmode="group",
                          title="Peak VRAM Consumption (MB)")
        st.plotly_chart(fig_vram, use_container_width=True)
        
    with col_eff2:
        st.subheader("Accuracy vs Speed Trade-off")
        pareto_df = filtered_df.groupby(['model', 'device_tag']).agg({'wer': 'mean', 'rtf': 'mean'}).reset_index()
        fig_scatter = px.scatter(pareto_df, x="rtf", y="wer", color="device_tag", text="model",
                                 title="WER vs RTF (Lower Left is Better)")
        fig_scatter.update_traces(textposition='top center')
        st.plotly_chart(fig_scatter, use_container_width=True)
    
    st.divider()
    
    st.subheader("💎 VRAM Efficiency Score")
    st.markdown("How much 'accuracy' are we getting per MB of VRAM? (Higher is better)")
    
    if 'peak_vram_mb' in filtered_df.columns and not filtered_df['peak_vram_mb'].isna().all():
        # Score = (1 - WER) / (VRAM_GB + 1) -> simple heuristic
        eff_df = filtered_df.copy()
        eff_df['vram_gb'] = eff_df['peak_vram_mb'] / 1024
        eff_df['eff_score'] = (1 - eff_df['wer']) / (eff_df['vram_gb'] + 0.1) # Add small epsilon
        
        fig_eff = px.box(eff_df, x="model", y="eff_score", color="device_tag" if is_comparison else "model",
                         title="Accuracy per VRAM (WER-Adjusted Efficiency)")
        st.plotly_chart(fig_eff, use_container_width=True)
    else:
        st.info("VRAM data not available. Efficiency score cannot be calculated.")

st.divider()

st.subheader("Detailed Data View")
st.dataframe(filtered_df.sort_values(['device_tag', 'model', 'wer']))

# Sidebar Downloads
st.sidebar.divider()
st.sidebar.header("📥 Export Selected")
if st.sidebar.button("Prepare Export"):
    # Current visible data
    csv = filtered_df.to_csv(index=False).encode('utf-8')
    st.sidebar.download_button(
        "Download CSV",
        csv,
        "benchmark_export.csv",
        "text/csv"
    )

