import requests
import os

class APIClient:
    BASE_URL = "http://127.0.0.1:8000/api"

    def __init__(self):
        self.token = None

    def set_token(self, token):
        self.token = token

    def _get_headers(self, multipart=False):
        headers = {}
        if self.token:
            headers["Authorization"] = f"Token {self.token}"
        if not multipart:
            headers["Content-Type"] = "application/json"
        return headers

    def login(self, username, password):
        url = f"{self.BASE_URL}/auth/login/"
        payload = {"username": username, "password": password}
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            self.token = data.get("token")
            return {"success": True, "token": self.token}
        except requests.exceptions.HTTPError as e:
            msg = "Login failed"
            if e.response is not None:
                try:
                    msg = e.response.json().get("non_field_errors", ["Invalid credentials"])[0]
                except:
                    pass
            return {"success": False, "error": msg}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def register(self, username, email, password):
        url = f"{self.BASE_URL}/auth/register/"
        payload = {"username": username, "email": email, "password": password}
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return {"success": True}
        except requests.exceptions.HTTPError as e:
            msg = "Registration failed"
            if e.response is not None:
                try:
                    # Generic error handling primarily for simple messages
                    data = e.response.json()
                    msg = str(data)
                except:
                    pass
            return {"success": False, "error": msg}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_history(self):
        url = f"{self.BASE_URL}/history/"
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_dataset_summary(self, dataset_id):
        url = f"{self.BASE_URL}/summary/{dataset_id}/"
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_scatter_data(self, dataset_id):
        url = f"{self.BASE_URL}/datasets/{dataset_id}/scatter/"
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def upload_dataset(self, file_path):
        url = f"{self.BASE_URL}/upload/"
        try:
            filename = os.path.basename(file_path)
            # requests handles multipart boundaries automatically when 'files' is passed
            with open(file_path, 'rb') as f:
                files = {'file': (filename, f, 'text/csv')}
                # Do NOT set Content-Type header manually for multipart/form-data
                response = requests.post(url, headers=self._get_headers(multipart=True), files=files)
                response.raise_for_status()
                return {"success": True, "data": response.json()}
        except requests.exceptions.HTTPError as e:
            msg = "Upload failed"
            if e.response is not None:
                try:
                    msg = e.response.json().get("error", "Unknown error")
                except:
                    pass
            return {"success": False, "error": msg}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def download_report(self, dataset_id, save_path):
        url = f"{self.BASE_URL}/report/{dataset_id}/"
        try:
            response = requests.get(url, headers=self._get_headers(), stream=True)
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Global instance
api_client = APIClient()
