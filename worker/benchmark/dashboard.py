import streamlit as st
import pandas as pd
import json
import os
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="Skriptor Benchmark Dashboard", layout="wide")

st.title("🎙️ Skriptor: Whisper Model Benchmarking")
st.markdown("Interactive analysis of accuracy and resource usage across Whisper models.")

results_path = os.path.join(os.path.dirname(__file__), 'benchmark_results.json')

if not os.path.exists(results_path):
    st.error(f"Results file not found at {results_path}. Please run the benchmark script first.")
    st.stop()

with open(results_path, 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Sidebar filters
st.sidebar.header("Filters")
selected_models = st.sidebar.multiselect("Select Models", options=df['model'].unique(), default=df['model'].unique())
selected_datasets = st.sidebar.multiselect("Select Datasets", options=df['dataset'].unique(), default=df['dataset'].unique())

filtered_df = df[df['model'].isin(selected_models) & df['dataset'].isin(selected_datasets)]

# Layout
col1, col2 = st.columns(2)

with col1:
    st.subheader("Accuracy (WER) vs Model")
    fig_wer = px.box(filtered_df, x="model", y="wer", color="model", 
                     category_orders={"model": ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]},
                     title="Word Error Rate Distribution")
    st.plotly_chart(fig_wer, use_container_width=True)

with col2:
    st.subheader("Efficiency (RTF) vs Model")
    fig_rtf = px.box(filtered_df, x="model", y="rtf", color="model",
                     category_orders={"model": ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]},
                     title="Real-Time Factor (Processing Time / Audio Duration)")
    st.plotly_chart(fig_rtf, use_container_width=True)

st.divider()

col_cer1, col_cer2 = st.columns(2)
with col_cer1:
    st.subheader("Character Error Rate (CER) vs Model")
    fig_cer = px.box(filtered_df, x="model", y="cer", color="model",
                     category_orders={"model": ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]},
                     title="Character Error Rate Distribution")
    st.plotly_chart(fig_cer, use_container_width=True)

with col_cer2:
    st.subheader("WER vs CER Correlation")
    fig_corr = px.scatter(filtered_df, x="wer", y="cer", color="model", hover_data=['audio_file'],
                          title="Word Error Rate vs Character Error Rate")
    st.plotly_chart(fig_corr, use_container_width=True)

st.divider()

col3, col4 = st.columns(2)

with col3:
    st.subheader("Memory Usage (RAM/VRAM)")
    mem_df = filtered_df.groupby('model').agg({'peak_ram_mb': 'max', 'peak_vram_mb': 'max'}).reset_index()
    fig_mem = go.Figure(data=[
        go.Bar(name='Peak RAM (MB)', x=mem_df['model'], y=mem_df['peak_ram_mb']),
        go.Bar(name='Peak VRAM (MB)', x=mem_df['model'], y=mem_df['peak_vram_mb'])
    ])
    fig_mem.update_layout(barmode='group', title="Memory Consumption by Model Size")
    st.plotly_chart(fig_mem, use_container_width=True)

with col4:
    st.subheader("Accuracy vs Speed Trade-off")
    fig_scatter = px.scatter(filtered_df.groupby('model').agg({'wer': 'mean', 'rtf': 'mean'}).reset_index(), 
                             x="rtf", y="wer", text="model", size_max=60,
                             title="WER vs RTF (Lower Left is Better)")
    fig_scatter.update_traces(textposition='top center')
    st.plotly_chart(fig_scatter, use_container_width=True)

st.divider()

st.subheader("Raw Data View")
st.dataframe(filtered_df.sort_values(['model', 'wer']))
