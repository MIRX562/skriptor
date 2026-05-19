import streamlit as st
import pandas as pd
import json
import os
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import io

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
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}"

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
        
        # Round VRAM to integer
        if 'peak_vram_mb' in df.columns:
            df['peak_vram_mb'] = df['peak_vram_mb'].round(0).fillna(0).astype(int)
            
        # Calculate Speed (1/RTF)
        if 'rtf' in df.columns:
            df['speed_x'] = df['rtf'].apply(lambda x: 1.0 / x if x > 0 else 0.0)
            df['speed_fmt'] = df['speed_x'].apply(lambda x: f"{x:.1f}x" if x > 0 else "N/A")

        # Define proper model order
        model_order = ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo", "turbo_v3"]
        df['model'] = pd.Categorical(df['model'], categories=[m for m in model_order if m in df['model'].unique()] + [m for m in df['model'].unique() if m not in model_order], ordered=True)
    
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

if not filtered_df.empty:
    with st.expander("📊 Dataset Overview", expanded=True):
        ds_data = []
        
        # Calculate durations from the actual results to ensure accuracy even for older JSONs
        # We drop duplicates because each audio file might have multiple rows (one per model)
        unique_audios = filtered_df.drop_duplicates(subset=['dataset', 'audio_file'])
        ds_durations = unique_audios.groupby('dataset')['duration_sec'].sum()
        ds_files = unique_audios.groupby('dataset')['audio_file'].count()
        
        # Segments might vary or be constant, we'll take the max or first if we can't be sure
        # but the safest is to use the filtered_df counts
        total_files = 0
        total_segments = 0
        total_duration = 0
        
        for ds_name in sorted(filtered_df['dataset'].unique()):
            duration = ds_durations.get(ds_name, 0)
            file_count = ds_files.get(ds_name, 0)
            
            # Get segment count from metadata if available
            segments = ds_stats.get(ds_name, {}).get('total_segments', 0)
            
            ds_data.append({
                "Dataset": ds_name,
                "Total Files": file_count,
                "Total Segments": segments,
                "Total Duration": format_time(duration)
            })
            total_files += file_count
            total_segments += segments
            total_duration += duration
            
        # Add Grand Total row
        ds_data.append({
            "Dataset": "**Grand Total**",
            "Total Files": total_files,
            "Total Segments": total_segments,
            "Total Duration": f"**{format_time(total_duration)}**"
        })
        
        st.table(pd.DataFrame(ds_data))

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
tab_summary, tab_overview, tab_linguistic, tab_efficiency, tab_files, tab_comparison, tab_raw = st.tabs([
    "📊 Performance Summary",
    "📈 General Overview", 
    "🗣️ Linguistic Deep Dive",
    "⚡ Efficiency & Resources",
    "🏆 Hardest Files",
    "🔎 Transcription Comparison",
    "📄 Detailed Data"
])

with tab_summary:
    st.subheader("📊 Aggregate Model Performance")
    
    # Calculate summary metrics per model
    summary_df = filtered_df.groupby('model', observed=True).agg({
        'wer_pct': ['mean', 'median', 'std'],
        'cer_pct': 'mean',
        'speed_x': 'mean',
        'peak_vram_mb': 'max',
        'processing_time_sec': 'mean'
    }).reset_index()
    
    # Flatten columns
    summary_df.columns = ['Model', 'Avg WER (%)', 'Median WER (%)', 'WER StdDev', 'Avg CER (%)', 'Avg Speed (x)', 'Peak VRAM (MB)', 'Avg Time (s)']
    
    # Calculate Ratios (Efficiency Scores)
    # 1. Accuracy/Speed Ratio: How much accuracy you get per unit of processing time (simplified as Speed * Accuracy%)
    summary_df['Acc/Speed Ratio'] = (summary_df['Avg Speed (x)'] * (100 - summary_df['Avg WER (%)'])) / 100
    
    # 2. Accuracy/Resource Ratio: How much accuracy you get per MB of VRAM
    summary_df['Acc/VRAM Ratio'] = (100 - summary_df['Avg WER (%)']) / summary_df['Peak VRAM (MB)']
    
    # Key Highlights
    best_wer = summary_df.loc[summary_df['Avg WER (%)'].idxmin()]
    best_value_speed = summary_df.loc[summary_df['Acc/Speed Ratio'].idxmax()]
    best_value_vram = summary_df.loc[summary_df['Acc/VRAM Ratio'].idxmax()]
    
    h_col1, h_col2, h_col3 = st.columns(3)
    with h_col1:
        st.metric("🎯 Most Accurate", f"{best_wer['Model']}", f"{best_wer['Avg WER (%)']:.2f}% WER", delta_color="inverse")
    with h_col2:
        st.metric("⚖️ Best Acc/Speed Balance", f"{best_value_speed['Model']}", f"Score: {best_value_speed['Acc/Speed Ratio']:.2f}")
        st.caption("Highest accuracy relative to speed")
    with h_col3:
        st.metric("💎 Best Acc/VRAM Balance", f"{best_value_vram['Model']}", f"{best_value_vram['Acc/VRAM Ratio']:.4f} acc/MB")
        st.caption("Highest accuracy relative to memory")
    
    st.divider()
    
    # Display the summary table
    st.dataframe(
        summary_df.style.background_gradient(subset=['Avg WER (%)'], cmap="RdYlGn_r")
                    .background_gradient(subset=['Acc/Speed Ratio'], cmap="RdYlGn")
                    .background_gradient(subset=['Acc/VRAM Ratio'], cmap="RdYlGn")
                    .format({
                        'Avg WER (%)': '{:.2f}%',
                        'Median WER (%)': '{:.2f}%',
                        'WER StdDev': '{:.2f}',
                        'Avg CER (%)': '{:.2f}%',
                        'Avg Speed (x)': '{:.1f}x',
                        'Peak VRAM (MB)': '{:d}',
                        'Avg Time (s)': '{:.1f}s',
                        'Acc/Speed Ratio': '{:.2f}',
                        'Acc/VRAM Ratio': '{:.4f}'
                    }),
        width='stretch',
        hide_index=True
    )
    
    # Visual comparison of Accuracy vs Speed
    st.subheader("🏆 Accuracy vs. Speed Ranking")
    fig_summary = go.Figure()
    
    fig_summary.add_trace(go.Bar(
        x=summary_df['Model'],
        y=summary_df['Avg WER (%)'],
        name='Accuracy (lower is better)',
        marker_color='rgb(55, 83, 109)',
        yaxis='y'
    ))
    
    fig_summary.add_trace(go.Scatter(
        x=summary_df['Model'],
        y=summary_df['Avg Speed (x)'],
        name='Speed (higher is better)',
        marker_color='rgb(26, 118, 255)',
        yaxis='y2',
        mode='lines+markers'
    ))
    
    fig_summary.update_layout(
        title='Average WER % and Speed Multiplier by Model',
        xaxis=dict(title='Model Size'),
        yaxis=dict(title='Avg WER (%)', side='left'),
        yaxis2=dict(title='Avg Speed (x)', side='right', overlaying='y', range=[0, summary_df['Avg Speed (x)'].max() * 1.2]),
        legend=dict(x=0.01, y=0.99),
        hovermode="x unified"
    )
    
    st.plotly_chart(fig_summary, width='stretch')

with tab_overview:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Accuracy (WER) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "wer", "Word Error Rate (%)", is_pct=True), width='stretch')
    with col2:
        st.subheader("Efficiency (Speed) vs Model")
        st.plotly_chart(plot_metric(filtered_df, "speed_x", "Speed Multiplier (x)"), width='stretch')
    
    st.divider()
    
    col_cer1, col_cer2 = st.columns(2)
    with col_cer1:
        st.subheader("Character Error Rate (CER)")
        st.plotly_chart(plot_metric(filtered_df, "cer", "Character Error Rate (%)", is_pct=True), width='stretch')
    with col_cer2:
        st.subheader("WER vs CER Correlation")
        fig_corr = px.scatter(filtered_df, x="wer_pct", y="cer_pct", color="model", 
                            hover_data=['audio_file', 'model', 'duration_fmt'],
                            labels={'wer_pct': 'WER (%)', 'cer_pct': 'CER (%)'},
                            title="Word Error Rate vs Character Error Rate")
        fig_corr.update_layout(xaxis_ticksuffix="%", yaxis_ticksuffix="%")
        st.plotly_chart(fig_corr, width='stretch')

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
            st.plotly_chart(fig_wpm, width='stretch')
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
            st.plotly_chart(fig_lex, width='stretch')
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
            st.plotly_chart(fig_wordlen, width='stretch')
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
            st.plotly_chart(fig_cs, width='stretch')
        else:
            st.info("Code-switching data not available.")
    st.divider()
    st.subheader("🏆 Model Extreme Cases & Linguistic Features")
    st.markdown("Analysis of the easiest (Best) and hardest (Worst) files for each model size.")

    extreme_data = []
    for model in sorted(filtered_df['model'].unique()):
        model_df = filtered_df[filtered_df['model'] == model]
        if model_df.empty: continue
        
        # Best case
        best_idx = model_df['wer_pct'].idxmin()
        best = model_df.loc[best_idx]
        extreme_data.append({
            "Model": model,
            "Type": "🟢 Best Case",
            "File": best['audio_file'],
            "Duration": best.get('duration_fmt', '00:00:00'),
            "WER (%)": best['wer_pct'],
            "WPM": best.get('wpm', 0),
            "Lex. Density": best.get('lexical_density', 0),
            "Word Len": best.get('avg_word_len', 0),
            "CS Score": best.get('cs_score', 0)
        })
        
        # Worst case
        worst_idx = model_df['wer_pct'].idxmax()
        worst = model_df.loc[worst_idx]
        extreme_data.append({
            "Model": model,
            "Type": "🔴 Worst Case",
            "File": worst['audio_file'],
            "Duration": worst.get('duration_fmt', '00:00:00'),
            "WER (%)": worst['wer_pct'],
            "WPM": worst.get('wpm', 0),
            "Lex. Density": worst.get('lexical_density', 0),
            "Word Len": worst.get('avg_word_len', 0),
            "CS Score": worst.get('cs_score', 0)
        })
    if extreme_data:
        extreme_df = pd.DataFrame(extreme_data)
        st.dataframe(
            extreme_df.style.format({
                "WER (%)": "{:.2f}%",
                "WPM": "{:.1f}",
                "Lex. Density": "{:.4f}",
                "Word Len": "{:.2f}",
                "CS Score": "{:.4f}"
            }).background_gradient(subset=["WER (%)"], cmap="RdYlGn_r"),
            width='stretch',
            hide_index=True
        )

with tab_efficiency:
    col_eff1, col_eff2 = st.columns(2)
    
    with col_eff1:
        st.subheader("Memory Usage (VRAM)")
        if 'peak_vram_mb' in filtered_df.columns:
            vram_compare = filtered_df.groupby('model', observed=True)['peak_vram_mb'].max().reset_index()
            fig_vram = px.bar(vram_compare, x="model", y="peak_vram_mb", color="model",
                              title="Peak VRAM Consumption (MB)")
            st.plotly_chart(fig_vram, width='stretch')
        
    with col_eff2:
        st.subheader("Accuracy vs Speed Trade-off")
        pareto_df = filtered_df.groupby('model', observed=True).agg({'wer_pct': 'mean', 'speed_x': 'mean'}).reset_index()
        fig_scatter = px.scatter(pareto_df, x="speed_x", y="wer_pct", color="model", text="model",
                                 labels={'wer_pct': 'Avg WER (%)', 'speed_x': 'Avg Speed (x)'},
                                 title="WER vs Speed (Higher Right is Better)")
        fig_scatter.update_layout(yaxis_ticksuffix="%")
        fig_scatter.update_traces(textposition='top center')
        st.plotly_chart(fig_scatter, width='stretch')

with tab_files:
    st.subheader("🏆 Hardest Files to Transcribe")
    hardest_files = filtered_df.groupby('audio_file').agg({
        'wer_pct': 'mean',
        'dataset': 'first',
        'duration_fmt': 'first'
    }).sort_values('wer_pct', ascending=False).head(20).reset_index()
    hardest_files.columns = ['Audio File', 'Avg WER (%)', 'Dataset', 'Duration (MM:SS)']
    st.table(hardest_files.style.format({'Avg WER (%)': '{:.2f}%'}))

with tab_comparison:
    st.subheader("🔎 Source vs. Generated Transcription")
    
    # Scan for available comparison TSV files
    results_dir = os.path.dirname(__file__)
    tsv_files = sorted([f for f in os.listdir(results_dir) if f.endswith('.tsv') and f.startswith('benchmark-transcription-result')], reverse=True)
    
    if not tsv_files:
        st.warning("⚠️ No transcription comparison (.tsv) files found in the benchmark folder.")
    else:
        # Match selected JSON file to select a default TSV file if possible
        default_index = 0
        if selected_file:
            # Check for common environment sub-strings like '4090', '2000', 'a2000', 'a5000'
            for i, tsv_file in enumerate(tsv_files):
                matched = False
                for kw in ["4090", "2000", "a2000", "a5000", "a3000", "a4000", "a6000"]:
                    if kw in selected_file.lower() and kw in tsv_file.lower():
                        default_index = i
                        matched = True
                        break
                if matched:
                    break
        
        selected_tsv = st.selectbox(
            "📂 Select Transcription Result File (TSV)",
            options=tsv_files,
            index=default_index,
            help="Switch between transcription output files from different runs/environments."
        )
        
        tsv_path = os.path.join(results_dir, selected_tsv)
        
        try:
            comp_df = pd.read_csv(tsv_path, sep='\t')
            
            if comp_df.empty:
                st.info("The transcription result file is empty.")
            else:
                # 1. Select Audio File
                available_files = sorted(comp_df['audio_file'].unique())
                selected_audio = st.selectbox("Select Audio File to Compare", options=available_files)
                
                if selected_audio:
                    file_results = comp_df[comp_df['audio_file'] == selected_audio]
                    
                    # 2. Filter Chips for Model Selection
                    available_models = sorted(file_results['model'].unique())
                    
                    # Using radio with horizontal=True as "filter chips"
                    selected_model = st.radio(
                        "Select Model Result", 
                        options=available_models,
                        horizontal=True
                    )
                    
                    if selected_model:
                        model_result = file_results[file_results['model'] == selected_model].iloc[0]
                        
                        source_text = model_result.get('source_text', "N/A")
                        gen_text = model_result.get('generated_text', "N/A")
                        
                        # Metadata for this run
                        wer_val = filtered_df[(filtered_df['audio_file'] == selected_audio) & (filtered_df['model'] == selected_model)]['wer_pct'].values
                        wer_display = f"{wer_val[0]:.2f}%" if len(wer_val) > 0 else "N/A"
                        
                        st.caption(f"Model: **{selected_model}** | Audio: **{selected_audio}** | WER: **{wer_display}**")
                        
                        # Create nested sub-tabs
                        subtab_sidebyside, subtab_diff = st.tabs(["📄 Side-by-Side View", "🔎 Word-Level Highlighted Diff"])
                        
                        with subtab_sidebyside:
                            col_src, col_gen = st.columns(2)
                            
                            with col_src:
                                st.markdown("### 📄 Source Transcript")
                                src_display = source_text if pd.notna(source_text) else "Empty source text"
                                st.markdown(
                                    f"""
                                    <div style="background-color: #000000; color: #ffffff; padding: 1.25rem; border-radius: 8px; font-family: monospace; font-size: 0.95rem; line-height: 1.6; border: 1px solid #333333; min-height: 250px; max-height: 450px; overflow-y: auto; white-space: pre-wrap;">{src_display}</div>
                                    """,
                                    unsafe_allow_html=True
                                )
                                
                            with col_gen:
                                st.markdown("### 🤖 Generated Transcript")
                                gen_display = gen_text if pd.notna(gen_text) else "Empty generated text"
                                st.markdown(
                                    f"""
                                    <div style="background-color: #000000; color: #ffffff; padding: 1.25rem; border-radius: 8px; font-family: monospace; font-size: 0.95rem; line-height: 1.6; border: 1px solid #333333; min-height: 250px; max-height: 450px; overflow-y: auto; white-space: pre-wrap;">{gen_display}</div>
                                    """,
                                    unsafe_allow_html=True
                                )
                                
                        with subtab_diff:
                            if pd.notna(source_text) and pd.notna(gen_text):
                                import difflib
                                
                                def color_diff_html(ref, hyp):
                                    ref_words = str(ref).split()
                                    hyp_words = str(hyp).split()
                                    
                                    d = difflib.Differ()
                                    diff = list(d.compare(ref_words, hyp_words))
                                    
                                    result = []
                                    for word in diff:
                                        if word.startswith('  '):
                                            result.append(f"<span style='color: #ffffff;'>{word[2:]}</span>")
                                        elif word.startswith('- '):
                                            result.append(f"<span style='color: #ff5252; background-color: rgba(255, 82, 82, 0.15); text-decoration: line-through; padding: 1px 3px; border-radius: 3px;'>{word[2:]}</span>")
                                        elif word.startswith('+ '):
                                            result.append(f"<span style='color: #69f0ae; background-color: rgba(105, 240, 174, 0.15); font-weight: bold; padding: 1px 3px; border-radius: 3px;'>{word[2:]}</span>")
                                    return " ".join(result)
                                
                                diff_html = color_diff_html(source_text, gen_text)
                                st.markdown(
                                    f"""
                                    <div style="background-color: #000000; color: #ffffff; padding: 1.5rem; border-radius: 8px; font-family: monospace; font-size: 0.95rem; line-height: 1.8; border: 1px solid #333333; max-height: 500px; overflow-y: auto;">
                                        {diff_html}
                                    </div>
                                    """,
                                    unsafe_allow_html=True
                                )
                                st.caption("Legend: <span style='color: #ff5252; text-decoration: line-through;'>Removed words</span> | <span style='color: #69f0ae; font-weight: bold;'>Added words</span>", unsafe_allow_html=True)
                            else:
                                st.info("Transcription text not available for diffing.")
        
        except Exception as e:
            st.error(f"Error loading transcription comparison: {e}")

st.divider()

with tab_raw:
    st.subheader("📄 All Benchmark Metrics")
    st.markdown("Detailed breakdown of every recorded metric (excluding zero-sum SDI counts).")
    
    # Define metrics to show
    metric_cols = [
        'model', 'dataset', 'audio_file', 'duration_fmt', 'wer_pct', 'cer_pct',
        'speed_x', 'wpm', 'lexical_density', 'avg_word_len', 'cs_score',
        'peak_cpu_percent', 'peak_ram_mb', 'peak_vram_mb'
    ]
    
    # Filter for available columns
    available_cols = [c for c in metric_cols if c in filtered_df.columns]
    
    # Display names
    rename_map = {
        'model': 'Model',
        'dataset': 'Dataset',
        'audio_file': 'File',
        'duration_fmt': 'Duration',
        'wer_pct': 'WER (%)',
        'cer_pct': 'CER (%)',
        'speed_x': 'Speed (x)',
        'wpm': 'WPM',
        'lexical_density': 'Lexical Density',
        'avg_word_len': 'Avg Word Len',
        'cs_score': 'CS Score',
        'peak_cpu_percent': 'CPU (%)',
        'peak_ram_mb': 'RAM (MB)',
        'peak_vram_mb': 'VRAM (MB)'
    }
    
    display_df = filtered_df[available_cols].copy()
    display_df.rename(columns=rename_map, inplace=True)
    
    st.dataframe(
        display_df,
        width='stretch',
        hide_index=True,
        column_config={
            "WER (%)": st.column_config.NumberColumn(format="%.2f%%"),
            "CER (%)": st.column_config.NumberColumn(format="%.2f%%"),
            "Speed (x)": st.column_config.NumberColumn(format="%.1fx"),
            "Lexical Density": st.column_config.NumberColumn(format="%.4f"),
            "CS Score": st.column_config.NumberColumn(format="%.4f"),
            "CPU (%)": st.column_config.NumberColumn(format="%.1f%%"),
            "RAM (MB)": st.column_config.NumberColumn(format="%d"),
            "VRAM (MB)": st.column_config.NumberColumn(format="%d"),
        }
    )

st.sidebar.divider()
st.sidebar.header("📥 Export")
if st.sidebar.button("Prepare Exports"):
    # CSV
    csv = filtered_df.to_csv(index=False).encode('utf-8')
    st.sidebar.download_button("Download CSV", csv, "benchmark_results.csv", "text/csv", width='stretch')
    
    # Excel
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        filtered_df.to_excel(writer, index=False, sheet_name='Raw Results')
        # Add a comprehensive summary sheet
        summary = filtered_df.groupby('model', observed=True).agg({
            'wer_pct': ['mean', 'median', 'std'],
            'cer_pct': 'mean',
            'speed_x': 'mean',
            'peak_vram_mb': 'max',
            'wpm': 'mean',
            'lexical_density': 'mean',
            'cs_score': 'mean'
        }).reset_index()
        
        summary.columns = ['Model', 'Avg WER (%)', 'Median WER (%)', 'WER StdDev', 'Avg CER (%)', 'Avg Speed (x)', 'Peak VRAM (MB)', 'Avg WPM', 'Avg Lexical Density', 'Avg CS Score']
        
        # Add Efficiency Ratios
        summary['Acc/Speed Ratio'] = (summary['Avg Speed (x)'] * (100 - summary['Avg WER (%)'])) / 100
        summary['Acc/VRAM Ratio'] = (100 - summary['Avg WER (%)']) / summary['Peak VRAM (MB)']
        
        summary.to_excel(writer, index=False, sheet_name='Model Summary')
    
    st.sidebar.download_button(
        label="Download Excel (.xlsx)",
        data=buffer.getvalue(),
        file_name=f"benchmark_results_{datetime.now().strftime('%Y%m%d')}.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        width='stretch'
    )
    
    # Markdown
    md_output = "## Benchmark Results\n\n"
    md_output += display_df.to_markdown(index=False)
    st.sidebar.download_button(
        label="Download Markdown (.md)",
        data=md_output,
        file_name=f"benchmark_results_{datetime.now().strftime('%Y%m%d')}.md",
        mime="text/markdown",
        width='stretch'
    )
