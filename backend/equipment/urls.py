from django.urls import path
from .views import DatasetScatterView

from .views import (
    CSVUploadView,
    DatasetSummaryView,
    DatasetHistoryView,
    DatasetReportPDFView,
)

urlpatterns = [
    # CSV upload
    path(
        "upload/",
        CSVUploadView.as_view(),
        name="csv-upload",
    ),

    # Summary for a single dataset
    path(
        "summary/<int:dataset_id>/",
        DatasetSummaryView.as_view(),
        name="dataset-summary",
    ),

    # Last 5 uploaded datasets summary
    path(
        "history/",
        DatasetHistoryView.as_view(),
        name="dataset-history",
    ),

    # 📄 PDF report generation
    path(
        "report/<int:dataset_id>/",
        DatasetReportPDFView.as_view(),
        name="dataset-pdf-report",
    ),

       path(
        "datasets/<int:dataset_id>/scatter/",
        DatasetScatterView.as_view(),
        name="dataset-scatter",
    ),
]
