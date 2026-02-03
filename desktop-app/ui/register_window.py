from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from api_client import api_client

class RegisterWindow(QWidget):
    registerSuccess = pyqtSignal()
    goToLogin = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(15)

        title = QLabel("Create Account")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #f5f7fa; margin-bottom: 10px;")
        layout.addWidget(title, alignment=Qt.AlignCenter)

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        self.username_input.setStyleSheet("padding: 10px; border-radius: 5px; border: 1px solid #4fd1c5; color: white; background: rgba(255,255,255,0.1);")
        layout.addWidget(self.username_input)

        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Email")
        self.email_input.setStyleSheet("padding: 10px; border-radius: 5px; border: 1px solid #4fd1c5; color: white; background: rgba(255,255,255,0.1);")
        layout.addWidget(self.email_input)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setStyleSheet("padding: 10px; border-radius: 5px; border: 1px solid #4fd1c5; color: white; background: rgba(255,255,255,0.1);")
        layout.addWidget(self.password_input)

        reg_btn = QPushButton("Register")
        reg_btn.setCursor(Qt.PointingHandCursor)
        reg_btn.setStyleSheet("""
            QPushButton {
                background-color: #4fd1c5;
                color: #102a43;
                padding: 10px;
                border-radius: 5px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #38b2ac;
            }
        """)
        reg_btn.clicked.connect(self.handle_register)
        layout.addWidget(reg_btn)

        login_link = QPushButton("Already have an account? Login")
        login_link.setCursor(Qt.PointingHandCursor)
        login_link.setStyleSheet("background: transparent; color: #4fd1c5; border: none; text-align: center;")
        login_link.clicked.connect(self.goToLogin.emit)
        layout.addWidget(login_link)

        container = QWidget()
        container.setLayout(layout)
        container.setFixedWidth(400)
        container.setStyleSheet("background-color: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px;")
        
        main_layout = QVBoxLayout()
        main_layout.addWidget(container, alignment=Qt.AlignCenter)
        self.setLayout(main_layout)

    def handle_register(self):
        username = self.username_input.text()
        email = self.email_input.text()
        password = self.password_input.text()

        if not username or not email or not password:
            QMessageBox.warning(self, "Error", "Please fill in all fields")
            return

        result = api_client.register(username, email, password)
        if result["success"]:
            QMessageBox.information(self, "Success", "Registration successful! Please login.")
            self.registerSuccess.emit()
        else:
            QMessageBox.critical(self, "Registration Failed", result["error"])
