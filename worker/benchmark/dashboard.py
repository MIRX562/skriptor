import streamlit as st
import pandas as pd
import json
import os
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Check for statsmodels (required for trendlines)
HAS_STATSMODELS = False
try:
    import statsmodels
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False

st.set_page_config(page_title="Skriptor Benchmark Dashboard", layout="wide")

st.title("🎙️ Skriptor: Whisper Model Benchmarking")
st.markdown("Interactive analysis of accuracy and resource usage across Whisper models.")

# Helper to format time
def format_time(seconds):
    if pd.isna(seconds): return "N/A"
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02d}:{secs:02d}"

if not HAS_STATSMODELS:
    st.sidebar.warning("⚠️ Trendlines disabled (statsmodels not found). Run `pip install statsmodels` to enable them.")

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
    
    if not df.empty:
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Add formatted columns for display
        df['wer_pct'] = df['wer'] * 100
        df['cer_pct'] = df['cer'] * 100
        df['duration_fmt'] = df['duration_sec'].apply(format_time)
        df['processing_fmt'] = df['processing_time_sec'].apply(format_time)
    
    return df, device_info, dataset_stats

# Scan for all result files
results_dir = os.path.dirname(__file__)
result_files = sorted([f for f in os.listdir(results_dir) if f.endswith('.json') and (f.startswith('results_') or f == 'benchmark_results.json')], reverse=True)

# Sidebar filters
st.sidebar.header("📂 Data Selection")
selected_file = st.sidebar.selectbox(
    "Select Result File", 
    options=result_files, 
    index=0 if result_files else None
)

if not selected_file:
    st.warning("No benchmark results found. Run benchmark.py first.")
    st.stop()

# Load selected data
path = os.path.join(results_dir, selected_file)
df, dev_info, ds_stats = load_benchmark_data(path)

if df.empty:
    st.error("No valid data found in selected file.")
    st.stop()

# Filters
st.sidebar.divider()
st.sidebar.header("🔍 Filters")
selected_models = st.sidebar.multiselect("Select Models", options=df['model'].unique(), default=df['model'].unique())
selected_datasets = st.sidebar.multiselect("Select Datasets", options=df['dataset'].unique(), default=df['dataset'].unique())

filtered_df = df[df['model'].isin(selected_models) & df['dataset'].isin(selected_datasets)]

# Display Device Info
if dev_info:
    st.info(f"**Hardware:** {dev_info.get('cpu')} | {dev_info.get('gpu')} ({dev_info.get('vram_gb')}GB VRAM) | RAM: {dev_info.get('ram_gb')}GB")

if ds_stats:
    with st.expander("📊 Dataset Overview"):
        cols = st.columns(len(ds_stats))
        for i, (ds_name, stats) in enumerate(ds_stats.items()):
            with cols[i]:
                st.metric(ds_name, f"{stats.get('total_files', 'N/A')} files")
                segments = stats.get('total_segments', 'N/A')
                avg_words = stats.get('avg_words_per_segment')
                if avg_words:
                    st.caption(f"{segments} segments, ~{avg_words} words/seg")
                else:
                    st.caption(f"{segments} segments")

st.divider()

# Plotting helper
def plot_metric(df, metric, title, is_pct=False):
    y_col = f"{metric}_pct" if is_pct else metric
    fig = px.box(df, x="model", y=y_col, color="model",
                 category_orders={"model": ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo", "turbo_v3"]},
                 title=title)
    if is_pct:
        fig.update_layout(yaxis_ticksuffix="%")
    return fig

# Tabs
tab_overview, tab_linguistic, tab_efficiency, tab_files = st.tabs([
    "📈 General Overview", 
    "🗣️ Linguistic Deep Dive",
    "⚡ Efficiency & Resources",
    "🏆 Hardest Files"
])

with tab_overview:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Accuracy (WER) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "wer", "Word Error Rate (%)", is_pct=True), use_container_width=True)
    with col2:
        st.subheader("Efficiency (RTF) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "rtf", "Real-Time Factor (Speed)"), use_container_width=True)
    
    st.divider()
    
    col_cer1, col_cer2 = st.columns(2)
    with col_cer1:
        st.subheader("Character Error Rate (CER)")
        st.plotly_chart(plot_metric(filtered_df, "cer", "Character Error Rate (%)", is_pct=True), use_container_width=True)
    with col_cer2:
        st.subheader("WER vs CER Correlation")
        fig_corr = px.scatter(filtered_df, x="wer_pct", y="cer_pct", color="model", 
                            hover_data=['audio_file', 'model', 'duration_fmt'],
                            labels={'wer_pct': 'WER (%)', 'cer_pct': 'CER (%)'},
                            title="Word Error Rate vs Character Error Rate")
        fig_corr.update_layout(xaxis_ticksuffix="%", yaxis_ticksuffix="%")
        st.plotly_chart(fig_corr, use_container_width=True)

with tab_linguistic:
    col_ling1, col_ling2 = st.columns(2)
    trend_opt = "ols" if HAS_STATSMODELS else None

    with col_ling1:
        st.subheader("Accuracy vs. Speech Rate")
        if 'wpm' in filtered_df.columns and not filtered_df['wpm'].isna().all():
            fig_wpm = px.scatter(filtered_df, x="wpm", y="wer_pct", color="model", 
                                 hover_data=['audio_file', 'duration_fmt'], trendline=trend_opt,
                                 labels={'wer_pct': 'WER (%)'},
                                 title="WER vs. Words Per Minute")
            fig_wpm.update_layout(yaxis_ticksuffix="%")
            st.plotly_chart(fig_wpm, use_container_width=True)
        else:
            st.info("WPM data not available.")
            
    with col_ling2:
        st.subheader("Accuracy vs. Lexical Density")
        if 'lexical_density' in filtered_df.columns and not filtered_df['lexical_density'].isna().all():
            fig_lex = px.scatter(filtered_df, x="lexical_density", y="wer_pct", color="model",
                                 hover_data=['audio_file', 'duration_fmt'], trendline=trend_opt,
                                 labels={'wer_pct': 'WER (%)'},
                                 title="WER vs. Lexical Density")
            fig_lex.update_layout(yaxis_ticksuffix="%")
            st.plotly_chart(fig_lex, use_container_width=True)
        else:
            st.info("Lexical data not available.")

    st.divider()
    
    col_ling3, col_ling4 = st.columns(2)
    with col_ling3:
        st.subheader("Sentence Complexity")
        if 'avg_word_len' in filtered_df.columns and not filtered_df['avg_word_len'].isna().all():
            fig_wordlen = px.scatter(filtered_df, x="avg_word_len", y="wer_pct", color="model",
                                    hover_data=['audio_file', 'duration_fmt'], trendline=trend_opt,
                                    labels={'wer_pct': 'WER (%)'},
                                    title="WER vs. Avg Word Length")
            fig_wordlen.update_layout(yaxis_ticksuffix="%")
            st.plotly_chart(fig_wordlen, use_container_width=True)
        else:
            st.info("Word length data not available.")

    with col_ling4:
        st.subheader("Code-Switching Score")
        if 'cs_score' in filtered_df.columns and not filtered_df['cs_score'].isna().all():
            fig_cs = px.scatter(filtered_df, x="cs_score", y="wer_pct", color="model",
                               hover_data=['audio_file', 'duration_fmt'], trendline=trend_opt,
                               labels={'wer_pct': 'WER (%)'},
                               title="WER vs. Code-Switching Score")
            fig_cs.update_layout(yaxis_ticksuffix="%")
            st.plotly_chart(fig_cs, use_container_width=True)
        else:
            st.info("Code-switching data not available.")

with tab_efficiency:
    col_eff1, col_eff2 = st.columns(2)
    
    with col_eff1:
        st.subheader("Memory Usage (VRAM)")
        if 'peak_vram_mb' in filtered_df.columns:
            vram_compare = filtered_df.groupby('model')['peak_vram_mb'].max().reset_index()
            fig_vram = px.bar(vram_compare, x="model", y="peak_vram_mb", color="model",
                              title="Peak VRAM Consumption (MB)")
            st.plotly_chart(fig_vram, use_container_width=True)
        
    with col_eff2:
        st.subheader("Accuracy vs Speed Trade-off")
        pareto_df = filtered_df.groupby('model').agg({'wer_pct': 'mean', 'rtf': 'mean'}).reset_index()
        fig_scatter = px.scatter(pareto_df, x="rtf", y="wer_pct", color="model", text="model",
                                 labels={'wer_pct': 'Avg WER (%)', 'rtf': 'Avg RTF'},
                                 title="WER vs RTF (Lower Left is Better)")
        fig_scatter.update_layout(yaxis_ticksuffix="%")
        fig_scatter.update_traces(textposition='top center')
        st.plotly_chart(fig_scatter, use_container_width=True)

with tab_files:
    st.subheader("🏆 Hardest Files to Transcribe")
    hardest_files = filtered_df.groupby('audio_file').agg({
        'wer_pct': 'mean',
        'dataset': 'first',
        'duration_fmt': 'first'
    }).sort_values('wer_pct', ascending=False).head(20).reset_index()
    hardest_files.columns = ['Audio File', 'Avg WER (%)', 'Dataset', 'Duration (MM:SS)']
    st.table(hardest_files.style.format({'Avg WER (%)': '{:.2f}%'}))

st.divider()

st.subheader("Detailed Data View")
# Prepare a clean display dataframe
display_df = filtered_df[['model', 'audio_file', 'wer_pct', 'cer_pct', 'duration_fmt', 'processing_fmt', 'rtf', 'peak_vram_mb', 'dataset']]
display_df.columns = ['Model', 'Audio File', 'WER (%)', 'CER (%)', 'Duration', 'Proc. Time', 'RTF', 'Peak VRAM (MB)', 'Dataset']
st.table(display_df.sort_values(['Model', 'WER (%)'], ascending=[True, False]).head(50).style.format({
    'WER (%)': '{:.2f}%',
    'CER (%)': '{:.2f}%'
}))

# Sidebar Downloads
st.sidebar.divider()
st.sidebar.header("📥 Export")
if st.sidebar.button("Prepare Export"):
    csv = filtered_df.to_csv(index=False).encode('utf-8')
    st.sidebar.download_button("Download CSV", csv, "benchmark_export.csv", "text/csv")
