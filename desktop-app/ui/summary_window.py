from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QScrollArea, QFileDialog, QFrame
)
from PyQt5.QtCore import Qt, pyqtSignal
from api_client import api_client
from ui.components import StatBox, ToastNotification

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib
import textwrap

matplotlib.use('Qt5Agg')

class MplCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        self.fig = Figure(figsize=(width, height), dpi=dpi)
        self.axes = self.fig.add_subplot(111)
        
        # Modern Dark Theme for Plots
        self.fig.patch.set_facecolor('#172b36') # Slightly lighter than bg
        self.axes.set_facecolor('#172b36')
        
        # Spines
        for spine in self.axes.spines.values():
            spine.set_edgecolor((1, 1, 1, 0.2))
            
        # Ticks & Labels
        self.axes.tick_params(colors=(1, 1, 1, 0.7), which='both')
        self.axes.xaxis.label.set_color('white')
        self.axes.yaxis.label.set_color('white')
        self.axes.title.set_color('white')
        self.axes.title.set_fontweight('bold')
        self.axes.grid(True, color=(1, 1, 1, 0.05), linestyle='--')
            
        super(MplCanvas, self).__init__(self.fig)

class SummaryWindow(QWidget):
    backSignal = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.dataset_id = None
        self.initUI()

    def initUI(self):
        self.toast = ToastNotification(self)

        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)

        # Scroll Area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        
        content_widget = QWidget()
        content_widget.setStyleSheet("background: transparent;")
        self.layout = QVBoxLayout(content_widget)
        self.layout.setContentsMargins(40, 40, 40, 40)
        self.layout.setSpacing(30)

        # Header
        header = QHBoxLayout()
        
        back_btn = QPushButton("← Back")
        back_btn.setCursor(Qt.PointingHandCursor)
        back_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent; 
                color: rgba(255,255,255,0.7); 
                font-weight: bold;
                border: none;
                font-size: 16px;
                text-align: left;
            }
            QPushButton:hover {
                color: white;
            }
        """)
        back_btn.clicked.connect(self.backSignal.emit)
        
        header_text = QVBoxLayout()
        self.title_label = QLabel("Dataset Summary")
        self.title_label.setStyleSheet("font-size: 32px; font-weight: bold; color: #f5f7fa;")
        self.id_label = QLabel("ID: --")
        self.id_label.setStyleSheet("font-size: 14px; color: rgba(255,255,255,0.5);")
        header_text.addWidget(self.title_label)
        header_text.addWidget(self.id_label)
        
        self.download_btn = QPushButton("Download Report")
        self.download_btn.setCursor(Qt.PointingHandCursor)
        self.download_btn.setStyleSheet("""
            QPushButton {
                background-color: #2b6cb0; 
                color: white; 
                padding: 10px 20px; 
                border-radius: 8px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2c5282;
            }
        """)
        self.download_btn.clicked.connect(self.download_report)
        
        header.addWidget(back_btn)
        header.addSpacing(20)
        header.addLayout(header_text)
        header.addStretch()
        header.addWidget(self.download_btn)
        self.layout.addLayout(header)

        # Stats Grid
        self.stats_layout = QHBoxLayout()
        self.stats_layout.setSpacing(15)
        self.layout.addLayout(self.stats_layout)

        # Charts Area
        charts_header = QLabel("Visual Analysis")
        charts_header.setStyleSheet("font-size: 20px; font-weight: bold; color: #f5f7fa; margin-top: 20px;")
        self.layout.addWidget(charts_header)

        charts_layout = QHBoxLayout()
        charts_layout.setSpacing(20)
        
        self.bar_frame = QFrame()
        self.bar_frame.setStyleSheet("background: rgba(255,255,255,0.05); border-radius: 15px;")
        self.bar_layout = QVBoxLayout(self.bar_frame)
        self.bar_layout.setContentsMargins(10, 10, 10, 10)
        
        self.scatter_frame = QFrame()
        self.scatter_frame.setStyleSheet("background: rgba(255,255,255,0.05); border-radius: 15px;")
        self.scatter_layout = QVBoxLayout(self.scatter_frame)
        self.scatter_layout.setContentsMargins(10, 10, 10, 10)
        
        charts_layout.addWidget(self.bar_frame)
        charts_layout.addWidget(self.scatter_frame)
        self.layout.addLayout(charts_layout)

        scroll.setWidget(content_widget)
        main_layout.addWidget(scroll)
        self.setLayout(main_layout)

    def load_data(self, dataset_id):
        self.dataset_id = dataset_id
        self.id_label.setText(f"Dataset ID: {dataset_id}")
        
        # Clear previous widgets
        self.clear_layout(self.stats_layout)
        self.clear_layout(self.bar_layout)
        self.clear_layout(self.scatter_layout)

        # Fetch data
        summary_res = api_client.get_dataset_summary(dataset_id)
        scatter_res = api_client.get_scatter_data(dataset_id)

        if not summary_res["success"]:
            self.toast.show_message("Failed to load summary", is_error=True)
            return

        data = summary_res["data"]
         
        # Populate Stats using StatBox
        self.stats_layout.addWidget(StatBox("Total Equipment", data.get("total_equipment", 0)))
        self.stats_layout.addWidget(StatBox("Avg Flowrate", f"{data.get('average_flowrate', 0):.2f}"))
        self.stats_layout.addWidget(StatBox("Avg Pressure", f"{data.get('average_pressure', 0):.2f}"))
        self.stats_layout.addWidget(StatBox("Avg Temperature", f"{data.get('average_temperature', 0):.2f}"))

        # Render Bar Chart
        if "equipment_type_distribution" in data:
            dist = data["equipment_type_distribution"]
            canvas = MplCanvas(self, width=5, height=4, dpi=100)
            labels = [textwrap.fill(k, 10) for k in dist.keys()]
            values = list(dist.values())
            
            # Customizing bar chart
            bars = canvas.axes.bar(labels, values, color='#4fd1c5', alpha=0.8, width=0.6)
            canvas.axes.set_title("Equipment Type Distribution")
            self.bar_layout.addWidget(canvas)

        # Render Scatter Chart
        if scatter_res["success"]:
            points = scatter_res["data"]["points"]
            canvas = MplCanvas(self, width=5, height=4, dpi=100)
            
            x_vals = [p['x'] for p in points] # Temp
            y_vals = [p['y'] for p in points] # Pressure
            
            types = list(set([p['equipment_type'] for p in points]))
            colors = [types.index(p['equipment_type']) for p in points]
            
            scatter = canvas.axes.scatter(x_vals, y_vals, c=colors, cmap='cool', alpha=0.9, s=50, edgecolors='white', linewidth=0.5)
            canvas.axes.set_title("Pressure vs Temperature")
            canvas.axes.set_xlabel("Temperature")
            canvas.axes.set_ylabel("Pressure")
            self.scatter_layout.addWidget(canvas)

    def clear_layout(self, layout):
        while layout.count():
            child = layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

    def download_report(self):
        if not self.dataset_id:
            return
            
        path, _ = QFileDialog.getSaveFileName(self, "Save Report", f"dataset_{self.dataset_id}_report.pdf", "PDF Files (*.pdf)")
        if path:
            result = api_client.download_report(self.dataset_id, path)
            if result["success"]:
                self.toast.show_message("Report downloaded successfully!")
            else:
                self.toast.show_message(f"Download failed: {result['error']}", is_error=True)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if self.toast.isVisible():
             rect = self.rect()
             self.toast.move(
                rect.center().x() - self.toast.width() // 2,
                rect.bottom() - 100
             )
