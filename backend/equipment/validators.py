from rest_framework.exceptions import ValidationError


def _parse_float(value, field_name, min_value=None):
    """
    Helper to parse float fields safely.
    """
    if value is None or value == "":
        return None

    try:
        value = float(value)
    except (TypeError, ValueError):
        raise ValidationError(f"{field_name} must be a number")

    if min_value is not None and value <= min_value:
        raise ValidationError(f"{field_name} must be greater than {min_value}")

    return value


def validate_equipment_row(row):
    """
    Validate a single CSV row.
    Returns cleaned data or raises ValidationError.
    """

    errors = {}

    equipment_name = row.get("Equipment Name")
    equipment_type = row.get("Type")

    if not equipment_name or str(equipment_name).strip() == "":
        errors["equipment_name"] = "Equipment Name is required"

    if not equipment_type or str(equipment_type).strip() == "":
        errors["equipment_type"] = "Type is required"

    # Numeric fields
    try:
        flowrate = _parse_float(row.get("Flowrate"), "Flowrate", min_value=0)
    except ValidationError as e:
        errors["flowrate"] = str(e)

    try:
        pressure = _parse_float(row.get("Pressure"), "Pressure", min_value=-1)
    except ValidationError as e:
        errors["pressure"] = str(e)

    try:
        temperature = _parse_float(row.get("Temperature"), "Temperature")
    except ValidationError as e:
        errors["temperature"] = str(e)

    if errors:
        raise ValidationError(errors)

    return {
        "equipment_name": equipment_name,
        "equipment_type": equipment_type,
        "flowrate": flowrate,
        "pressure": pressure,
        "temperature": temperature,
    }
