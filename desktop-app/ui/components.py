from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QGraphicsDropShadowEffect, 
    QHBoxLayout, QFrame
)
from PyQt5.QtCore import Qt, QPropertyAnimation, QPoint, QTimer, pyqtSignal, QRect

class ToastNotification(QWidget):
    def __init__(self, parent):
        super().__init__(parent)
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.SubWindow)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_ShowWithoutActivating)
        
        self.layout = QVBoxLayout()
        self.label = QLabel("")
        self.label.setStyleSheet("""
            background-color: #48bb78; 
            color: white; 
            padding: 15px 25px; 
            border-radius: 8px; 
            font-weight: bold;
            font-size: 14px;
        """)
        
        # Shadow
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(20)
        shadow.setColor(Qt.black)
        shadow.setOffset(0, 5)
        self.label.setGraphicsEffect(shadow)
        
        self.layout.addWidget(self.label)
        self.setLayout(self.layout)
        self.hide()

        self.timer = QTimer()
        self.timer.timeout.connect(self.hide_toast)

    def show_message(self, message, is_error=False):
        color = "#e53e3e" if is_error else "#48bb78"
        self.label.setStyleSheet(f"""
            background-color: {color}; 
            color: white; 
            padding: 15px 25px; 
            border-radius: 8px; 
            font-weight: bold;
            font-size: 14px;
        """)
        self.label.setText(message)
        self.adjustSize()
        
        # Position at bottom center
        parent_rect = self.parent().rect()
        self.move(
            parent_rect.center().x() - self.width() // 2,
            parent_rect.bottom() - 100
        )
        
        self.show()
        self.raise_()
        self.timer.start(3000) # Hide after 3 seconds

    def hide_toast(self):
        self.hide()
        self.timer.stop()



from datetime import datetime

class ClickableCard(QFrame):
    clicked = pyqtSignal(int) # Emits dataset ID

    def __init__(self, dataset_id, title, date_str, equipment_count, anomaly_count=0):
        super().__init__()
        self.dataset_id = dataset_id
        self.setCursor(Qt.PointingHandCursor)
        self.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
            }
        """)
        self.setFixedSize(280, 200)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        title_top = QHBoxLayout()
        title_lbl = QLabel(title)
        title_lbl.setWordWrap(True)
        title_lbl.setStyleSheet("font-size: 18px; font-weight: bold; color: white; background: transparent;")
        title_top.addWidget(title_lbl)
        
        if anomaly_count > 0:
            anomaly_lbl = QLabel(f"⚠️ {anomaly_count}")
            anomaly_lbl.setStyleSheet("""
                background-color: #f6e05e; 
                color: #744210; 
                padding: 2px 8px; 
                border-radius: 4px; 
                font-weight: 800; 
                font-size: 11px;
            """)
            title_top.addStretch()
            title_top.addWidget(anomaly_lbl)

        # Format Date
        formatted_date = date_str
        try:
            clean_date = date_str.replace("T", " ").split(".")[0]
            dt_obj = datetime.strptime(clean_date, "%Y-%m-%d %H:%M:%S")
            formatted_date = dt_obj.strftime("%b %d, %Y • %H:%M")
        except:
            pass

        date_lbl = QLabel(f"Uploaded: {formatted_date}")
        date_lbl.setStyleSheet("font-size: 12px; color: rgba(255,255,255,0.6); background: transparent;")
        
        count_lbl = QLabel(f"{equipment_count} Equipments")
        count_lbl.setStyleSheet("font-size: 14px; color: #4fd1c5; font-weight: bold; margin-top: 10px; background: transparent;")
        
        layout.addLayout(title_top)
        layout.addWidget(date_lbl)
        layout.addStretch()
        layout.addWidget(count_lbl)
        self.setLayout(layout)

        # Hover Animation
        self.default_y = 0

    def enterEvent(self, event):
        self.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
        """)
        super().enterEvent(event)

    def leaveEvent(self, event):
        self.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
                border: none;
            }
        """)
        super().leaveEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.clicked.emit(self.dataset_id)


from settings_manager import settings_manager

class StatBox(QFrame):
    def __init__(self, label, value):
        super().__init__()
        self.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 10px;
            }
        """)
        layout = QVBoxLayout()
        
        # Determine unit type from label
        unit = settings_manager.get_unit(label)
        converted_val = settings_manager.convert_value(value, label)
        
        lbl = QLabel(f"{label} ({unit})" if unit else label)
        lbl.setAlignment(Qt.AlignCenter)
        lbl.setStyleSheet("color: rgba(255,255,255,0.7); font-size: 11px; background: transparent;")
        
        val = QLabel(str(converted_val))
        val.setAlignment(Qt.AlignCenter)
        val.setStyleSheet("color: white; font-size: 20px; font-weight: bold; background: transparent;")
        
        layout.addWidget(lbl)
        layout.addWidget(val)
        self.setLayout(layout)
