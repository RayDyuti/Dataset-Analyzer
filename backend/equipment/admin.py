from django.contrib import admin
from .models import Dataset, Equipment


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'uploaded_at')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'equipment_name',
        'equipment_type',
        'flowrate',
        'pressure',
        'temperature',
        'dataset',
        'created_at',
    )
    list_filter = ('equipment_type', 'dataset')
    search_fields = ('equipment_name',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
