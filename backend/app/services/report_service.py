import io
import csv
import datetime
from typing import List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from backend.app.models.prediction import Prediction

def generate_csv_report(predictions: List[Prediction]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Prediction ID", "Date & Time", "Predicted AQI", "Category", 
        "PM2.5 (µg/m³)", "PM10 (µg/m³)", "NO2 (µg/m³)", "SO2 (µg/m³)", 
        "CO (mg/m³)", "O3 (µg/m³)", "Temperature (°C)", "Humidity (%)", 
        "Health Recommendation", "Model Used"
    ])
    
    for p in predictions:
        env = p.environmental_data
        writer.writerow([
            p.id,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "",
            p.predicted_aqi,
            p.category,
            env.pm25 if env else "",
            env.pm10 if env else "",
            env.no2 if env else "",
            env.so2 if env else "",
            env.co if env else "",
            env.o3 if env else "",
            env.temperature if env else "",
            env.humidity if env else "",
            p.health_recommendation,
            p.model_used
        ])
        
    return output.getvalue()

def generate_pdf_report(predictions: List[Prediction], user_name: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#1E40AF'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=14
    )
    table_header_style = ParagraphStyle(
        'TH',
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.white
    )
    cell_style = ParagraphStyle(
        'TD',
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor('#0F172A')
    )
    
    story = []
    
    # Brand Header
    story.append(Paragraph("AirGuard — Environmental Intelligence Report", title_style))
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    story.append(Paragraph(f"Generated for: <b>{user_name}</b> | Timestamp: {now_str} | Total Records: {len(predictions)}", subtitle_style))
    story.append(Spacer(1, 10))
    
    # Summary metrics
    if predictions:
        aqi_values = [p.predicted_aqi for p in predictions]
        avg_aqi = sum(aqi_values) / len(aqi_values)
        max_aqi = max(aqi_values)
        min_aqi = min(aqi_values)
        
        summary_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Average AQI", f"{avg_aqi:.1f}", "Max Recorded AQI", f"{max_aqi:.1f}"],
            ["Total Predictions", str(len(predictions)), "Min Recorded AQI", f"{min_aqi:.1f}"]
        ]
        summary_table = Table(summary_data, colWidths=[120, 140, 120, 140])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFF6FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))
        
    # Table data
    table_data = [[
        Paragraph("ID", table_header_style),
        Paragraph("Date", table_header_style),
        Paragraph("AQI", table_header_style),
        Paragraph("Category", table_header_style),
        Paragraph("PM2.5", table_header_style),
        Paragraph("PM10", table_header_style),
        Paragraph("Temp", table_header_style),
        Paragraph("Advisory", table_header_style)
    ]]
    
    for p in predictions[:50]:  # Up to 50 latest records
        env = p.environmental_data
        rec_summary = p.health_recommendation[:60] + "..." if len(p.health_recommendation) > 60 else p.health_recommendation
        table_data.append([
            Paragraph(str(p.id), cell_style),
            Paragraph(p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "", cell_style),
            Paragraph(f"<b>{p.predicted_aqi:.1f}</b>", cell_style),
            Paragraph(p.category, cell_style),
            Paragraph(f"{env.pm25:.1f}" if env else "-", cell_style),
            Paragraph(f"{env.pm10:.1f}" if env else "-", cell_style),
            Paragraph(f"{env.temperature:.1f}°C" if env else "-", cell_style),
            Paragraph(rec_summary, cell_style)
        ])
        
    t = Table(table_data, colWidths=[30, 80, 45, 75, 45, 45, 45, 175])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(t)
    
    doc.build(story)
    return buffer.getvalue()

