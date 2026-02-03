from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QPushButton, QFileDialog, 
    QMessageBox, QProgressBar
)
from PyQt5.QtCore import Qt, pyqtSignal
from api_client import api_client
from ui.components import ToastNotification

class UploadWindow(QWidget):
    uploadSuccess = pyqtSignal()
    cancelSignal = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.file_path = None
        self.initUI()

    def initUI(self):
        self.toast = ToastNotification(self)

        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(20)

        title = QLabel("Upload Dataset")
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: #f5f7fa;")
        layout.addWidget(title, alignment=Qt.AlignCenter)

        subtitle = QLabel("Supported format: .CSV")
        subtitle.setStyleSheet("color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 20px;")
        layout.addWidget(subtitle, alignment=Qt.AlignCenter)

        # Upload Box
        self.upload_box = QPushButton("\n📁\n\nClick to Select CSV File")
        self.upload_box.setFixedSize(400, 200)
        self.upload_box.setCursor(Qt.PointingHandCursor)
        self.upload_box.setStyleSheet("""
            QPushButton {
                background-color: rgba(255, 255, 255, 0.05);
                border: 2px dashed rgba(255, 255, 255, 0.2);
                border-radius: 15px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: rgba(255, 255, 255, 0.08);
                border-color: #4fd1c5;
                color: #4fd1c5;
            }
        """)
        self.upload_box.clicked.connect(self.browse_file)
        layout.addWidget(self.upload_box, alignment=Qt.AlignCenter)

        self.file_label = QLabel("")
        self.file_label.setStyleSheet("color: #4fd1c5; font-weight: bold; margin-top: 10px;")
        layout.addWidget(self.file_label, alignment=Qt.AlignCenter)

        # Actions
        btn_layout = QVBoxLayout()
        btn_layout.setSpacing(10)
        
        self.upload_btn = QPushButton("Upload Now")
        self.upload_btn.setCursor(Qt.PointingHandCursor)
        self.upload_btn.setFixedSize(200, 45)
        self.upload_btn.setEnabled(False)
        self.upload_btn.setStyleSheet("""
            QPushButton {
                background-color: #38a169;
                color: white;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.3);
            }
        """)
        self.upload_btn.clicked.connect(self.upload_file)

        cancel_btn = QPushButton("Cancel")
        cancel_btn.setCursor(Qt.PointingHandCursor)
        cancel_btn.setStyleSheet("background: transparent; color: #e53e3e; text-decoration: underline; border: none;")
        cancel_btn.clicked.connect(self.cancelSignal.emit)

        btn_layout.addWidget(self.upload_btn, alignment=Qt.AlignCenter)
        btn_layout.addWidget(cancel_btn, alignment=Qt.AlignCenter)
        layout.addLayout(btn_layout)

        # Main Container
        main = QVBoxLayout()
        main.addLayout(layout)
        self.setLayout(main)

    def browse_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, 'Open CSV', '', "CSV Files (*.csv)")
        if fname:
            self.file_path = fname
            name = fname.split("/")[-1]
            self.file_label.setText(f"Selected: {name}")
            self.upload_btn.setEnabled(True)
            self.upload_box.setStyleSheet("""
                QPushButton {
                    background-color: rgba(79, 209, 197, 0.1);
                    border: 2px solid #4fd1c5;
                    border-radius: 15px;
                    color: #4fd1c5;
                }
            """)

    def upload_file(self):
        if not self.file_path:
            return

        self.upload_btn.setText("Uploading...")
        self.upload_btn.setEnabled(False)
        self.repaint() 

        result = api_client.upload_dataset(self.file_path)
        
        self.upload_btn.setText("Upload Now")
        self.upload_btn.setEnabled(True)

        if result["success"]:
            # Show toast instead of Popup
            self.toast.show_message("Dataset uploaded successfully!")
            # Delay emitting success so user sees toast
            QTimer.singleShot(1500, self.finish_upload)
        else:
            self.toast.show_message(f"Upload Failed: {result['error']}", is_error=True)
    
    def finish_upload(self):
        self.uploadSuccess.emit()
        self.reset()
    
    def reset(self):
        self.file_path = None
        self.file_label.setText("")
        self.upload_btn.setEnabled(False)
        self.upload_box.setText("\n📁\n\nClick to Select CSV File")
        self.upload_box.setStyleSheet("""
            QPushButton {
                background-color: rgba(255, 255, 255, 0.05);
                border: 2px dashed rgba(255, 255, 255, 0.2);
                border-radius: 15px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: rgba(255, 255, 255, 0.08);
                border-color: #4fd1c5;
                color: #4fd1c5;
            }
        """)

    # Ensure toast resizes with window
    def resizeEvent(self, event):
        super().resizeEvent(event)
        if self.toast.isVisible():
             rect = self.rect()
             self.toast.move(
                rect.center().x() - self.toast.width() // 2,
                rect.bottom() - 100
             )

from PyQt5.QtCore import QTimer
