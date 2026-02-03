from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from api_client import api_client

class LoginWindow(QWidget):
    loginSuccess = pyqtSignal(str)  # Emits token
    goToRegister = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(15)

        title = QLabel("Welcome Back")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #f5f7fa; margin-bottom: 10px;")
        layout.addWidget(title, alignment=Qt.AlignCenter)

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        self.username_input.setStyleSheet("padding: 10px; border-radius: 5px; border: 1px solid #4fd1c5; color: white; background: rgba(255,255,255,0.1);")
        layout.addWidget(self.username_input)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setStyleSheet("padding: 10px; border-radius: 5px; border: 1px solid #4fd1c5; color: white; background: rgba(255,255,255,0.1);")
        layout.addWidget(self.password_input)

        login_btn = QPushButton("Login")
        login_btn.setCursor(Qt.PointingHandCursor)
        login_btn.setStyleSheet("""
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
        login_btn.clicked.connect(self.handle_login)
        layout.addWidget(login_btn)

        reg_link = QPushButton("Don't have an account? Register")
        reg_link.setCursor(Qt.PointingHandCursor)
        reg_link.setStyleSheet("background: transparent; color: #4fd1c5; border: none; text-align: center;")
        reg_link.clicked.connect(self.goToRegister.emit)
        layout.addWidget(reg_link)

        container = QWidget()
        container.setLayout(layout)
        container.setFixedWidth(400)
        container.setStyleSheet("background-color: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px;")
        
        main_layout = QVBoxLayout()
        main_layout.addWidget(container, alignment=Qt.AlignCenter)
        self.setLayout(main_layout)

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        if not username or not password:
            QMessageBox.warning(self, "Error", "Please fill in all fields")
            return

        result = api_client.login(username, password)
        if result["success"]:
            self.loginSuccess.emit(result["token"])
        else:
            QMessageBox.critical(self, "Login Failed", result["error"])
