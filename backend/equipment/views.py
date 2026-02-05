import pandas as pd

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .models import Dataset, Equipment
from .serializers import (
    DatasetSummarySerializer,
    EquipmentScatterSerializer,
)

from .validators import validate_equipment_row


# --------------------------------------------------
# 🔹 Helper function
# --------------------------------------------------
# --------------------------------------------------
# 🔹 Helper function (V2: Intelligent Analytics)
# --------------------------------------------------
def build_dataset_summary(equipments):
    if not equipments.exists():
        return {}

    # Convert to DataFrame for powerful analysis
    df = pd.DataFrame(list(equipments.values(
        "equipment_name", "equipment_type", "flowrate", "pressure", "temperature"
    )))

    # 1. Base Stats
    summary = {
        "total_equipment": len(df),
        "average_flowrate": df["flowrate"].mean(),
        "average_pressure": df["pressure"].mean(),
        "average_temperature": df["temperature"].mean(),
        "equipment_type_distribution": df["equipment_type"].value_counts().to_dict(),
        "anomalies": [],
        "insights": ""
    }

    # 2. Anomaly Detection (Z-Score > 3)
    metrics = ["flowrate", "pressure", "temperature"]
    anomalies = []

    for metric in metrics:
        mean = df[metric].mean()
        std = df[metric].std()
        
        if std > 0:
            # Find outliers
            outliers = df[abs(df[metric] - mean) > (3 * std)]
            for _, row in outliers.iterrows():
                anomalies.append({
                    "equipment_name": row["equipment_name"],
                    "metric": metric.capitalize(),
                    "value": row[metric],
                    "severity": "Critical" if abs(row[metric] - mean) > (4 * std) else "Warning",
                    "reason": f"Value is significantly {'higher' if row[metric] > mean else 'lower'} than average."
                })

    summary["anomalies"] = anomalies[:10] # Limit to top 10

    # 3. "AI" Insight Generator (NLP-Lite)
    insight_parts = []
    
    # Check for overall health
    if not anomalies:
        insight_parts.append("Overall system health is Optimal. No statistical anomalies detected across active sensors.")
    else:
        insight_parts.append(f"Detected {len(anomalies)} operational anomalies. Critical attention required for equipment highlighted in red.")

    # Check for Temperature Trends
    if df["temperature"].mean() > 40:
        insight_parts.append("Warning: High average thermal baseline detected (>40°C). Consider inspecting cooling subsystems.")
    
    # Check for Pressure consistency
    p_std = df["pressure"].std() if len(df) > 1 else 0
    if p_std > (df["pressure"].mean() * 0.2):
        insight_parts.append("Caution: High pressure variance detected. This may indicate unstable valve operations or sensor calibration issues.")

    summary["insights"] = " ".join(insight_parts)

    return summary


# --------------------------------------------------
# 🔹 CSV Upload
# --------------------------------------------------
class CSVUploadView(APIView):
    permission_classes = [IsAuthenticated]
    MAX_ROWS = 25_000

    def post(self, request):
        file = request.FILES.get("file")

        if not file or not file.name.endswith(".csv"):
            return Response(
                {"error": "Please upload a valid CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            df = pd.read_csv(file)
        except Exception:
            return Response(
                {"error": "Unable to read CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if df.empty:
            return Response(
                {"error": "CSV file contains no data rows."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(df) > self.MAX_ROWS:
            return Response(
                {
                    "error": "CSV file exceeds maximum allowed rows.",
                    "max_rows": self.MAX_ROWS,
                    "received_rows": len(df),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        expected_columns = [
            "Equipment Name",
            "Type",
            "Flowrate",
            "Pressure",
            "Temperature",
        ]

        if list(df.columns) != expected_columns:
            return Response(
                {
                    "error": "CSV column headers are invalid.",
                    "expected_columns": expected_columns,
                    "received_columns": list(df.columns),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        dataset = Dataset.objects.create(
            user=request.user,
            name=file.name,
            uploaded_at=timezone.now(),
        )

        created_count = 0
        errors = []
        seen_equipment_keys = set()

        for index, row in df.iterrows():
            try:
                cleaned = validate_equipment_row(row)

                key = (
                    cleaned["equipment_name"].strip().lower(),
                    cleaned["equipment_type"].strip().lower(),
                )

                if key in seen_equipment_keys:
                    continue

                seen_equipment_keys.add(key)

                Equipment.objects.create(
                    dataset=dataset,
                    equipment_name=cleaned["equipment_name"],
                    equipment_type=cleaned["equipment_type"],
                    flowrate=cleaned["flowrate"],
                    pressure=cleaned["pressure"],
                    temperature=cleaned["temperature"],
                )

                created_count += 1

            except ValidationError as e:
                errors.append({"row": index + 1, "errors": e.detail})

        return Response(
            {
                "dataset_id": dataset.id,
                "dataset_name": dataset.name,
                "total_rows": len(df),
                "inserted": created_count,
                "failed": len(errors),
                "errors": errors,
            },
            status=status.HTTP_201_CREATED,
        )


# --------------------------------------------------
# 🔹 Single Dataset Summary
# --------------------------------------------------
class DatasetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(
            Dataset,
            id=dataset_id,
            user=request.user,
        )

        equipments = Equipment.objects.filter(dataset=dataset)

        if not equipments.exists():
            return Response(
                {"error": "No equipment data available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        summary = build_dataset_summary(equipments)
        serializer = DatasetSummarySerializer(summary)

        return Response(serializer.data, status=status.HTTP_200_OK)




class DatasetScatterView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(
            Dataset,
            id=dataset_id,
            user=request.user,
        )

        equipments = Equipment.objects.filter(dataset=dataset)

        if not equipments.exists():
            return Response(
                {"error": "No equipment data available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EquipmentScatterSerializer(equipments, many=True)

        return Response(
            {
                "dataset_id": dataset.id,
                "points": serializer.data,
            },
            status=status.HTTP_200_OK,
        )




# --------------------------------------------------
# 🔹 Last 5 Dataset Summaries
# --------------------------------------------------
class DatasetHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datasets = (
            Dataset.objects.filter(user=request.user)
            .order_by("-uploaded_at")[:5]
        )

        response = []

        for dataset in datasets:
            equipments = Equipment.objects.filter(dataset=dataset)

            if not equipments.exists():
                continue

            summary = build_dataset_summary(equipments)

            response.append(
                {
                    "dataset_id": dataset.id,
                    "dataset_name": dataset.name,
                    "uploaded_at": dataset.uploaded_at,
                    "summary": summary,
                }
            )

        return Response(response, status=status.HTTP_200_OK)


# --------------------------------------------------
# 🔹 Dataset PDF Report (Advanced Charts Edition)
# --------------------------------------------------
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4


class DatasetReportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(
            Dataset,
            id=dataset_id,
            user=request.user,
        )

        equipments = Equipment.objects.filter(dataset=dataset)

        if not equipments.exists():
            return Response(
                {"error": "No equipment data available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create DataFrame for analysis
        df = pd.DataFrame(list(equipments.values("flowrate", "pressure", "temperature", "equipment_type")))
        
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="dataset_{dataset.id}_report_comprehensive.pdf"'

        doc = SimpleDocTemplate(
            response,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()
        # Custom Styles
        styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Title'], fontSize=28, spaceAfter=20, textColor=colors.darkblue))
        styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontSize=14, alignment=1, spaceAfter=6, textColor=colors.gray))
        
        elements = []

        # ==========================================================
        # 1. COVER PAGE
        # ==========================================================
        elements.append(Spacer(1, 100))
        elements.append(Paragraph("EQUIPMENT ANALYTICS", styles["CoverSub"]))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Comprehensive Dataset Analysis Report", styles["CoverTitle"]))
        elements.append(Spacer(1, 20))
        
        # Metadata Box
        meta_data = [
            ["Dataset Name:", dataset.name],
            ["Dataset ID:", str(dataset.id)],
            ["Uploaded By:", request.user.username],
            ["Generated Date:", timezone.now().strftime('%B %d, %Y')],
            ["Total Records:", str(len(df))],
        ]
        meta_table = Table(meta_data, colWidths=[120, 300])
        meta_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONT', (1, 0), (1, -1), 'Helvetica'),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.darkslategray),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 150))
        
        elements.append(Paragraph("CONFIDENTIAL", styles["CoverSub"]))
        elements.append(PageBreak())

        # ==========================================================
        # 2. STATISTICAL SUMMARY
        # ==========================================================
        elements.append(Paragraph("1. Statistical Executive Summary", styles["Heading1"]))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Descriptive statistics for key operational metrics (Flowrate, Pressure, Temperature).", styles["Normal"]))
        elements.append(Spacer(1, 12))

        # Compute Describe
        desc = df[["flowrate", "pressure", "temperature"]].describe().round(2).reset_index()
        # Rename columns for display
        desc_data = [["Statistic", "Flowrate (m³/h)", "Pressure (Pa)", "Temperature (°C)"]]
        for _, row in desc.iterrows():
            stat_name = row['index'].capitalize()
            if stat_name == "Count": stat_name = "Total Count"
            desc_data.append([stat_name, row['flowrate'], row['pressure'], row['temperature']])

        stat_table = Table(desc_data, colWidths=[120, 120, 120, 120])
        stat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.aliceblue]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(stat_table)
        elements.append(Spacer(1, 24))

        # Group by Equipment Type
        elements.append(Paragraph("Breakdown by Equipment Type", styles["Heading2"]))
        type_counts = df["equipment_type"].value_counts().reset_index()
        type_counts.columns = ["Type", "Count"]
        
        type_data = [["Equipment Type", "Count", "% Share"]]
        total = len(df)
        for _, row in type_counts.iterrows():
            share = (row['Count'] / total) * 100
            type_data.append([row['Type'], row['Count'], f"{share:.1f}%"])

        type_table = Table(type_data, colWidths=[200, 100, 100], hAlign='LEFT')
        type_table.setStyle(TableStyle([
             ('BACKGROUND', (0, 0), (-1, 0), colors.black),
             ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
             ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ]))
        elements.append(type_table)
        elements.append(PageBreak())

        # ==========================================================
        # 3. ADVANCED VISUALIZATIONS
        # ==========================================================
        elements.append(Paragraph("2. Visual Analytics", styles["Heading1"]))
        elements.append(Spacer(1, 12))

        import matplotlib.pyplot as plt
        import seaborn as sns
        from io import BytesIO

        # -- A. DISTRIBUTION HISTOGRAMS --
        elements.append(Paragraph("A. Metric Distributions", styles["Heading2"]))
        
        fig, axes = plt.subplots(1, 3, figsize=(10, 3.5))
        sns.histplot(df['flowrate'], ax=axes[0], color='skyblue', kde=True)
        axes[0].set_title('Flowrate Dist.')
        
        sns.histplot(df['pressure'], ax=axes[1], color='salmon', kde=True)
        axes[1].set_title('Pressure Dist.')
        
        sns.histplot(df['temperature'], ax=axes[2], color='lightgreen', kde=True)
        axes[2].set_title('Temperature Dist.')
        
        plt.tight_layout()
        
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=120)
        plt.close(fig)
        buf.seek(0)
        
        # Add Image to PDF
        from reportlab.platypus import Image
        img = Image(buf, width=480, height=160)
        elements.append(img)
        elements.append(Spacer(1, 20))

        # -- B. CORRELATION HEATMAP --
        elements.append(Paragraph("B. Correlation Matrix", styles["Heading2"]))
        elements.append(Paragraph("Analyzes the linear relationship between variables. (1.0 = Perfect Positive, -1.0 = Perfect Negative)", styles["Normal"]))
        elements.append(Spacer(1, 10))

        plt.figure(figsize=(6, 4))
        corr = df[["flowrate", "pressure", "temperature"]].corr()
        sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", linewidths=0.5)
        plt.tight_layout()
        
        buf2 = BytesIO()
        plt.savefig(buf2, format='png', dpi=120)
        plt.close()
        buf2.seek(0)
        
        img2 = Image(buf2, width=400, height=250)
        elements.append(img2)
        elements.append(PageBreak())

        # ==========================================================
        # 4. RAW DATA SAMPLE
        # ==========================================================
        elements.append(Paragraph("3. Raw Data Sample (First 20 Rows)", styles["Heading1"]))
        elements.append(Spacer(1, 10))
        
        raw_data = [["Name", "Type", "Flow", "Pres", "Temp"]]
        for _, row in df.head(20).iterrows():
            raw_data.append([
                row['equipment_type'][:15], # Truncate if long
                row['equipment_type'],
                f"{row['flowrate']:.1f}",
                f"{row['pressure']:.1f}",
                f"{row['temperature']:.1f}",
            ])
            
        raw_table = Table(raw_data, colWidths=[100, 100, 80, 80, 80])
        raw_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        elements.append(raw_table)

        # Footer Function
        def add_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont("Helvetica", 9)
            canvas.drawString(40, 30, "Generated by Equipment Analytics")
            canvas.drawRightString(A4[0]-40, 30, f"Page {doc.page} | Confidential")
            canvas.restoreState()

        doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)
        return response


# --------------------------------------------------
# 🔹 Dataset Excel Export (V2 Detail)
# --------------------------------------------------
class DatasetExportExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(
            Dataset,
            id=dataset_id,
            user=request.user,
        )

        equipments = Equipment.objects.filter(dataset=dataset)

        if not equipments.exists():
            return Response(
                {"error": "No equipment data available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create DataFrame
        df = pd.DataFrame(list(equipments.values(
            "equipment_name", "equipment_type", "flowrate", "pressure", "temperature"
        )))
        
        # Rename columns for professional look
        df.columns = ["Equipment Name", "Type", "Flowrate (m3/h)", "Pressure (Pa)", "Temperature (C)"]

        # Prepare Response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="dataset_{dataset.id}_export.xlsx"'

        # Export to Excel
        with pd.ExcelWriter(response, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Sensor Data')

        return response
