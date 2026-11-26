import os
import joblib
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set plot aesthetics
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']
plt.rcParams['font.size'] = 11
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['figure.titlesize'] = 14

out_dir = os.path.join(os.path.dirname(__file__), "documentation", "report_figures")
os.makedirs(out_dir, exist_ok=True)

# Load data and models
csv_path = "backend/app/ml/data/cpcb_air_quality.csv"
df = pd.read_csv(csv_path)

lr_model = joblib.load("backend/app/ml/artifacts/linear_regression_model.joblib")
rf_model = joblib.load("backend/app/ml/artifacts/random_forest_model.joblib")
ann_model = joblib.load("backend/app/ml/artifacts/ann_model.joblib")
scaler = joblib.load("backend/app/ml/artifacts/preprocessor.joblib")

with open("backend/app/ml/artifacts/metrics.json") as f:
    metrics = json.load(f)

FEATURE_NAMES = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']
X = df[FEATURE_NAMES]
y = df['aqi']

# Split 80/20 test split (matching train.py)
from sklearn.model_selection import train_test_split
_, X_test, _, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
X_test_scaled = scaler.transform(X_test)

lr_preds = np.clip(lr_model.predict(X_test_scaled), 0, 500)
rf_preds = np.clip(rf_model.predict(X_test_scaled), 0, 500)
ann_preds = np.clip(ann_model.predict(X_test_scaled), 0, 500)

print("Data & models loaded. Generating figures...")

# -------------------------------------------------------------------------
# Figure 1: System Architecture Diagram
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
ax.axis('off')

# Boxes
boxes = [
    ("Presentation Tier\n(React.js 18 + Tailwind CSS)", 0.05, 0.65, 0.25, 0.25, '#EFF6FF', '#1D4ED8'),
    ("Application Service Tier\n(Python FastAPI REST API)", 0.38, 0.65, 0.25, 0.25, '#F0FDF4', '#15803D'),
    ("ML Engine & Pipelines\n(LR, RF, ANN / Scikit-Learn)", 0.70, 0.65, 0.26, 0.25, '#FFFBEB', '#B45309'),
    ("Client-Side State &\nInteractive Visualizations\n(Recharts, Lucide, Axios)", 0.05, 0.15, 0.25, 0.35, '#F8FAFC', '#475569'),
    ("Security & Validation Tier\n• JWT Token & Bcrypt\n• Pydantic v2 Bounds\n• ReportLab PDF Export", 0.38, 0.15, 0.25, 0.35, '#F8FAFC', '#475569'),
    ("Persistence Tier\n• PostgreSQL 16 (Primary)\n• SQLite (Zero-Downtime)\n• Serialized Joblib Artifacts", 0.70, 0.15, 0.26, 0.35, '#F8FAFC', '#475569')
]

for title, x, y_pos, w, h, bg, border in boxes:
    rect = patches.FancyBboxPatch((x, y_pos), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  linewidth=2, edgecolor=border, facecolor=bg)
    ax.add_patch(rect)
    ax.text(x + w/2, y_pos + h/2, title, ha='center', va='center', fontsize=9.5, weight='bold', color='#0F172A')

# Connective arrows
arrow_props = dict(facecolor='#1E293B', edgecolor='#1E293B', width=1.5, headwidth=7, headlength=7, shrink=0.08)
ax.annotate('', xy=(0.38, 0.77), xytext=(0.30, 0.77), arrowprops=arrow_props)
ax.annotate('', xy=(0.30, 0.75), xytext=(0.38, 0.75), arrowprops=arrow_props)
ax.annotate('', xy=(0.70, 0.77), xytext=(0.63, 0.77), arrowprops=arrow_props)
ax.annotate('', xy=(0.63, 0.75), xytext=(0.70, 0.75), arrowprops=arrow_props)

ax.annotate('', xy=(0.175, 0.50), xytext=(0.175, 0.65), arrowprops=arrow_props)
ax.annotate('', xy=(0.505, 0.50), xytext=(0.505, 0.65), arrowprops=arrow_props)
ax.annotate('', xy=(0.83, 0.50), xytext=(0.83, 0.65), arrowprops=arrow_props)

plt.title("Figure 4.1: Overall System Architecture of AirGuard Platform", fontsize=13, weight='bold', pad=15)
plt.tight_layout()
fig1_path = os.path.join(out_dir, "fig1_system_architecture.png")
plt.savefig(fig1_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig1_path)

# -------------------------------------------------------------------------
# Figure 2: ML Training & Inference Pipeline
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
ax.axis('off')

steps = [
    ("1. Ingestion\n12,000 CPCB\nObservations", 0.02, 0.35, 0.15, 0.4, '#EFF6FF', '#2563EB'),
    ("2. Preprocessing\nMissing Marker Check\n& Duplicate Removal", 0.20, 0.35, 0.17, 0.4, '#F0FDF4', '#16A34A'),
    ("3. Scaling\nStandardScaler\n(Fitted on X_train)", 0.40, 0.35, 0.16, 0.4, '#FEF9C3', '#CA8A04'),
    ("4. Modeling\nLinear Reg, RF,\nANN (MLP)", 0.59, 0.35, 0.16, 0.4, '#FDF2F8', '#DB2777'),
    ("5. Inference & Output\nAQI [0-500] Clamp,\nCPCB Category & Advice", 0.78, 0.35, 0.19, 0.4, '#F5F3FF', '#7C3AED')
]

for title, x, y_pos, w, h, bg, border in steps:
    rect = patches.FancyBboxPatch((x, y_pos), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  linewidth=2, edgecolor=border, facecolor=bg)
    ax.add_patch(rect)
    ax.text(x + w/2, y_pos + h/2, title, ha='center', va='center', fontsize=9, weight='bold', color='#1E293B')

for i in range(len(steps)-1):
    x_start = steps[i][1] + steps[i][3]
    x_end = steps[i+1][1]
    ax.annotate('', xy=(x_end, 0.55), xytext=(x_start, 0.55),
                arrowprops=dict(facecolor='#475569', edgecolor='#475569', width=2, headwidth=8, headlength=8))

plt.title("Figure 4.2: End-to-End Machine Learning Pipeline Workflow", fontsize=13, weight='bold', pad=15)
plt.tight_layout()
fig2_path = os.path.join(out_dir, "fig2_ml_pipeline.png")
plt.savefig(fig2_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig2_path)

# -------------------------------------------------------------------------
# Figure 3: R² Score Comparison
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)
models_names = ['Linear Regression', 'Artificial Neural\nNetwork (ANN)', 'Random Forest\nRegression']
r2_vals = [0.9067, 0.9984, 0.9996]
colors = ['#3B82F6', '#8B5CF6', '#10B981']

bars = ax.bar(models_names, r2_vals, color=colors, width=0.55, edgecolor='#1E293B', linewidth=1.2)
ax.set_ylim(0.85, 1.01)
ax.set_ylabel("Coefficient of Determination ($R^2$ Score)", weight='bold')
ax.set_title("Figure 6.1: Coefficient of Determination ($R^2$) Across Algorithms", weight='bold', pad=12)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f"{height:.4f}\n({height*100:.2f}%)",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=10, weight='bold')

plt.tight_layout()
fig3_path = os.path.join(out_dir, "fig3_model_r2_comparison.png")
plt.savefig(fig3_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig3_path)

# -------------------------------------------------------------------------
# Figure 4: Error Metrics Comparison (MAE, RMSE)
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
x_indices = np.arange(len(models_names))
width = 0.32

mae_vals = [20.8727, 2.4827, 0.6965]
rmse_vals = [28.6464, 3.7327, 1.9153]

rects1 = ax.bar(x_indices - width/2, mae_vals, width, label='Mean Absolute Error (MAE)', color='#F59E0B', edgecolor='#78350F')
rects2 = ax.bar(x_indices + width/2, rmse_vals, width, label='Root Mean Squared Error (RMSE)', color='#EF4444', edgecolor='#7F1D1D')

ax.set_ylabel("Error Metric Value (AQI Units)", weight='bold')
ax.set_title("Figure 6.2: Comparative MAE and RMSE Across Algorithms", weight='bold', pad=12)
ax.set_xticks(x_indices)
ax.set_xticklabels(models_names)
ax.legend(frameon=True)

for rect in rects1:
    h = rect.get_height()
    ax.annotate(f"{h:.2f}", xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9)
for rect in rects2:
    h = rect.get_height()
    ax.annotate(f"{h:.2f}", xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9)

plt.tight_layout()
fig4_path = os.path.join(out_dir, "fig4_error_metrics_comparison.png")
plt.savefig(fig4_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig4_path)

# -------------------------------------------------------------------------
# Figure 5: Actual vs. Predicted Scatter Plots (All 3 Models)
# -------------------------------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(14, 4.5), dpi=300, sharey=True)

# Subsample 400 points for clear visualization
indices = np.random.RandomState(42).choice(len(y_test), 400, replace=False)
y_sub = y_test.iloc[indices]
lr_sub = lr_preds[indices]
rf_sub = rf_preds[indices]
ann_sub = ann_preds[indices]

# Linear Regression
axes[0].scatter(y_sub, lr_sub, color='#3B82F6', alpha=0.5, s=20)
axes[0].plot([0, 500], [0, 500], 'r--', lw=1.5)
axes[0].set_title("Linear Regression ($R^2 = 0.9067$)", fontsize=11, weight='bold')
axes[0].set_xlabel("Actual CPCB AQI", weight='bold')
axes[0].set_ylabel("Predicted AQI", weight='bold')
axes[0].set_xlim(0, 520)
axes[0].set_ylim(0, 520)

# Random Forest
axes[1].scatter(y_sub, rf_sub, color='#10B981', alpha=0.5, s=20)
axes[1].plot([0, 500], [0, 500], 'r--', lw=1.5)
axes[1].set_title("Random Forest ($R^2 = 0.9996$)", fontsize=11, weight='bold')
axes[1].set_xlabel("Actual CPCB AQI", weight='bold')
axes[1].set_xlim(0, 520)

# ANN
axes[2].scatter(y_sub, ann_sub, color='#8B5CF6', alpha=0.5, s=20)
axes[2].plot([0, 500], [0, 500], 'r--', lw=1.5)
axes[2].set_title("Artificial Neural Network ($R^2 = 0.9984$)", fontsize=11, weight='bold')
axes[2].set_xlabel("Actual CPCB AQI", weight='bold')
axes[2].set_xlim(0, 520)

plt.suptitle("Figure 6.3: Actual vs. Predicted AQI Scatter Distributions (Held-Out Test Set)", fontsize=13, weight='bold', y=1.03)
plt.tight_layout()
fig5_path = os.path.join(out_dir, "fig5_actual_vs_predicted.png")
plt.savefig(fig5_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig5_path)

# -------------------------------------------------------------------------
# Figure 6: Residual Distribution (Error Histograms)
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)

lr_res = y_test - lr_preds
rf_res = y_test - rf_preds
ann_res = y_test - ann_preds

ax.hist(lr_res, bins=40, range=(-40, 40), alpha=0.4, color='#3B82F6', label='Linear Regression Residuals', edgecolor='none')
ax.hist(ann_res, bins=40, range=(-40, 40), alpha=0.5, color='#8B5CF6', label='ANN Residuals', edgecolor='none')
ax.hist(rf_res, bins=40, range=(-40, 40), alpha=0.7, color='#10B981', label='Random Forest Residuals', edgecolor='none')

ax.set_xlabel("Prediction Error ($Actual - Predicted$)", weight='bold')
ax.set_ylabel("Frequency", weight='bold')
ax.set_title("Figure 6.4: Residual Error Distribution of Models on Test Data", weight='bold', pad=12)
ax.axvline(0, color='red', linestyle='--', lw=1.2)
ax.legend(frameon=True)

plt.tight_layout()
fig6_path = os.path.join(out_dir, "fig6_residual_distribution.png")
plt.savefig(fig6_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig6_path)

# -------------------------------------------------------------------------
# Figure 7: CPCB AQI Category Distribution
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)

def classify_cat(val):
    if val <= 50: return "Good"
    elif val <= 100: return "Satisfactory"
    elif val <= 200: return "Moderate"
    elif val <= 300: return "Poor"
    elif val <= 400: return "Very Poor"
    else: return "Severe"

cats = df['aqi'].apply(classify_cat).value_counts()
cat_order = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
counts = [cats.get(c, 0) for c in cat_order]
colors_cat = ['#16A34A', '#84CC16', '#EAB308', '#F97316', '#DC2626', '#7F1D1D']

bars = ax.bar(cat_order, counts, color=colors_cat, edgecolor='#334155', width=0.55)
ax.set_ylabel("Observation Count", weight='bold')
ax.set_title("Figure 3.1: Distribution of CPCB AQI Categories in Ground-Truth Dataset", weight='bold', pad=12)

for bar in bars:
    h = bar.get_height()
    pct = (h / len(df)) * 100
    ax.annotate(f"{h}\n({pct:.1f}%)", xy=(bar.get_x() + bar.get_width()/2, h), xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8.5, weight='bold')

plt.tight_layout()
fig7_path = os.path.join(out_dir, "fig7_aqi_category_distribution.png")
plt.savefig(fig7_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig7_path)

# -------------------------------------------------------------------------
# Figure 8: Correlation Heatmap
# -------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 6.5), dpi=300)
corr = df[FEATURE_NAMES + ['aqi']].corr()

cax = ax.matshow(corr, cmap='coolwarm', vmin=-1, vmax=1)
fig.colorbar(cax)

ticks = range(len(corr.columns))
ax.set_xticks(ticks)
ax.set_yticks(ticks)
labels = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temp', 'Humidity', 'AQI']
ax.set_xticklabels(labels, rotation=45, ha='left')
ax.set_yticklabels(labels)

for i in range(len(corr.columns)):
    for j in range(len(corr.columns)):
        val = corr.iloc[i, j]
        color = 'white' if abs(val) > 0.55 else 'black'
        ax.text(j, i, f"{val:.2f}", ha='center', va='center', color=color, fontsize=8.5)

plt.title("Figure 3.2: Correlation Matrix of Environmental Features and AQI", weight='bold', pad=25)
plt.tight_layout()
fig8_path = os.path.join(out_dir, "fig8_correlation_heatmap.png")
plt.savefig(fig8_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig8_path)

print("All 8 figures successfully generated!")
