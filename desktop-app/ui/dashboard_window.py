from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QScrollArea, QMessageBox, QFrame
)
from PyQt5.QtCore import Qt, pyqtSignal
from api_client import api_client
from ui.components import ClickableCard, ToastNotification
from ui.flow_layout import FlowLayout

class DashboardWindow(QWidget):
    logoutSignal = pyqtSignal()
    viewDetailsSignal = pyqtSignal(int)
    uploadSignal = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        # Toast
        self.toast = ToastNotification(self)

        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(40, 40, 40, 40)
        main_layout.setSpacing(20)

        # Header
        header_layout = QHBoxLayout()
        title_box = QVBoxLayout()
        title = QLabel("Dashboard")
        title.setStyleSheet("font-size: 32px; font-weight: bold; color: #f5f7fa;")
        subtitle = QLabel("Welcome back")
        subtitle.setStyleSheet("font-size: 14px; color: rgba(255,255,255,0.6);")
        
        title_box.addWidget(title)
        title_box.addWidget(subtitle)

        logout_btn = QPushButton("Logout")
        logout_btn.setCursor(Qt.PointingHandCursor)
        logout_btn.setStyleSheet("""
            QPushButton {
                background-color: rgba(229, 62, 62, 0.2); 
                color: #fc8181; 
                padding: 10px 20px; 
                border-radius: 8px; 
                font-weight: bold;
                border: 1px solid rgba(229, 62, 62, 0.3);
            }
            QPushButton:hover {
                background-color: rgba(229, 62, 62, 0.4);
            }
        """)
        logout_btn.clicked.connect(self.logoutSignal.emit)

        header_layout.addLayout(title_box)
        header_layout.addStretch()
        header_layout.addWidget(logout_btn)
        main_layout.addLayout(header_layout)

        # Actions Row
        action_layout = QHBoxLayout()
        section_title = QLabel("Recent Datasets")
        section_title.setStyleSheet("font-size: 20px; color: #4fd1c5; font-weight: bold;")
        
        refresh_btn = QPushButton("Refresh")
        refresh_btn.setCursor(Qt.PointingHandCursor)
        refresh_btn.setStyleSheet("background-color: transparent; color: #4fd1c5; font-weight: bold; border: none;")
        refresh_btn.clicked.connect(self.load_data)

        upload_btn = QPushButton("+ Upload New")
        upload_btn.setCursor(Qt.PointingHandCursor)
        upload_btn.setStyleSheet("""
            QPushButton {
                background-color: #38a169; 
                color: white; 
                padding: 10px 20px; 
                border-radius: 8px; 
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2f855a;
            }
        """)
        upload_btn.clicked.connect(self.uploadSignal.emit)

        action_layout.addWidget(section_title)
        action_layout.addStretch()
        action_layout.addWidget(refresh_btn)
        action_layout.addWidget(upload_btn)
        main_layout.addLayout(action_layout)

        # Scroll Area for Cards
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        
        self.cards_container = QWidget()
        self.cards_container.setStyleSheet("background: transparent;")
        self.flow_layout = FlowLayout(self.cards_container, margin=0, spacing=20)
        
        scroll.setWidget(self.cards_container)
        main_layout.addWidget(scroll)

        self.setLayout(main_layout)

    def load_data(self):
        # Clear existing cards
        while self.flow_layout.count():
            item = self.flow_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        result = api_client.get_history()
        
        if result["success"]:
            datasets = result["data"]
            if not datasets:
                lbl = QLabel("No datasets found.")
                lbl.setStyleSheet("color: rgba(255,255,255,0.5); font-size: 16px;")
                self.flow_layout.addWidget(lbl)
                return

            for ds in datasets:
                uploaded = ds["uploaded_at"].replace("T", " ").split(".")[0]
                summary = ds.get("summary", {})
                count = summary.get("total_equipment", 0)
                
                card = ClickableCard(
                    ds["dataset_id"],
                    ds["dataset_name"],
                    uploaded,
                    count
                )
                card.clicked.connect(self.on_card_click)
                self.flow_layout.addWidget(card)
        else:
            self.toast.show_message(f"Failed to load: {result['error']}", is_error=True)

    def on_card_click(self, dataset_id):
        self.viewDetailsSignal.emit(dataset_id)

    # Ensure toast resizes with window
    def resizeEvent(self, event):
        super().resizeEvent(event)
        if self.toast.isVisible():
             rect = self.rect()
             self.toast.move(
                rect.center().x() - self.toast.width() // 2,
                rect.bottom() - 100
             )
