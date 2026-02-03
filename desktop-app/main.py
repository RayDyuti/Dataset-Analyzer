import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QStackedWidget
from PyQt5.QtCore import Qt

from ui.login_window import LoginWindow
from ui.register_window import RegisterWindow
from ui.dashboard_window import DashboardWindow
from ui.upload_window import UploadWindow
from ui.summary_window import SummaryWindow

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("FOSSEE Data Visualizer")
        self.resize(1000, 700)
        self.setStyleSheet("background-color: #0f2027;")  # Global dark background

        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)

        # Initialize UI Components
        self.login_window = LoginWindow()
        self.register_window = RegisterWindow()
        self.dashboard_window = DashboardWindow()
        self.upload_window = UploadWindow()
        self.summary_window = SummaryWindow()

        # Add to Stack
        self.stacked_widget.addWidget(self.login_window)       # Index 0
        self.stacked_widget.addWidget(self.register_window)    # Index 1
        self.stacked_widget.addWidget(self.dashboard_window)   # Index 2
        self.stacked_widget.addWidget(self.upload_window)      # Index 3
        self.stacked_widget.addWidget(self.summary_window)     # Index 4

        # Connect Signals
        self.connect_signals()

    def connect_signals(self):
        # Login -> Dashboard / Register
        self.login_window.loginSuccess.connect(self.on_login_success)
        self.login_window.goToRegister.connect(lambda: self.stacked_widget.setCurrentIndex(1))

        # Register -> Login
        self.register_window.goToLogin.connect(lambda: self.stacked_widget.setCurrentIndex(0))
        self.register_window.registerSuccess.connect(lambda: self.stacked_widget.setCurrentIndex(0))

        # Dashboard -> Logout / Upload / Details
        self.dashboard_window.logoutSignal.connect(self.on_logout)
        self.dashboard_window.uploadSignal.connect(lambda: self.stacked_widget.setCurrentIndex(3))
        self.dashboard_window.viewDetailsSignal.connect(self.on_view_details)

        # Upload -> Dashboard / Cancel
        self.upload_window.uploadSuccess.connect(self.on_upload_success)
        self.upload_window.cancelSignal.connect(lambda: self.stacked_widget.setCurrentIndex(2))

        # Summary -> Back
        self.summary_window.backSignal.connect(lambda: self.stacked_widget.setCurrentIndex(2))

    def on_login_success(self, token):
        # Token is already set in API client by LoginWindow
        self.dashboard_window.load_data()
        self.stacked_widget.setCurrentIndex(2)  # Go to Dashboard

    def on_logout(self):
        from api_client import api_client
        api_client.set_token(None)
        self.stacked_widget.setCurrentIndex(0)  # Go to Login

    def on_upload_success(self):
        self.dashboard_window.load_data()
        self.stacked_widget.setCurrentIndex(2)  # Go to Dashboard

    def on_view_details(self, dataset_id):
        self.summary_window.load_data(dataset_id)
        self.stacked_widget.setCurrentIndex(4)  # Go to Summary

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # Set global font (optional)
    font = app.font()
    font.setFamily("Segoe UI")
    font.setPointSize(10)
    app.setFont(font)

    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
