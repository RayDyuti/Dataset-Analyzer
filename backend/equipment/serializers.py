from rest_framework import serializers
from .models import Dataset, Equipment


# 🔹 Equipment output serializer
class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = [
            'id',
            'equipment_name',
            'equipment_type',
            'flowrate',
            'pressure',
            'temperature',
            'created_at',
        ]


# 🔹 Dataset output serializer (nested)
class DatasetSerializer(serializers.ModelSerializer):
    equipments = EquipmentSerializer(many=True, read_only=True)

    class Meta:
        model = Dataset
        fields = [
            'id',
            'name',
            'uploaded_at',
            'equipments',
        ]


# 🔹 Dataset summary serializer (computed data)
class DatasetSummarySerializer(serializers.Serializer):
    total_equipment = serializers.IntegerField()
    average_flowrate = serializers.FloatField(allow_null=True)
    average_pressure = serializers.FloatField(allow_null=True)
    average_temperature = serializers.FloatField(allow_null=True)
    equipment_type_distribution = serializers.DictField()
    anomalies = serializers.ListField(child=serializers.DictField())
    insights = serializers.CharField()


class EquipmentScatterSerializer(serializers.ModelSerializer):
    x = serializers.FloatField(source="temperature")
    y = serializers.FloatField(source="pressure")

    class Meta:
        model = Equipment
        fields = [
            "x",
            "y",
            "flowrate",
            "equipment_type",
        ]
