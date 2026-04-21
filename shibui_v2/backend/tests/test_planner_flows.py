from datetime import datetime, timedelta, timezone


def create_template(client, auth_headers):
    response = client.post(
        "/api/planner/templates",
        headers=auth_headers,
        json={
            "name": "Deep Work Sprint",
            "category": "flow",
            "subcategory": "Deep Work",
            "default_duration_minutes": 60,
            "default_intensity": 7,
        },
    )
    assert response.status_code == 201
    return response.json()


def create_block(client, auth_headers, template_id, starts_at, duration_minutes=60):
    ends_at = starts_at + timedelta(minutes=duration_minutes)
    response = client.post(
        "/api/planner/blocks",
        headers=auth_headers,
        json={
            "task_template_id": template_id,
            "starts_at": starts_at.isoformat(),
            "ends_at": ends_at.isoformat(),
            "planned_duration_minutes": duration_minutes,
            "intensity_override": 8,
            "notes": "Focused session",
            "status": "pending",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_template_block_reflection_and_summary_flow(client, auth_headers):
    template = create_template(client, auth_headers)
    starts_at = datetime.now(timezone.utc)
    block = create_block(client, auth_headers, template["id"], starts_at, duration_minutes=45)

    template_list = client.get("/api/planner/templates", headers=auth_headers)
    assert template_list.status_code == 200
    assert len(template_list.json()) == 1

    block_list = client.get("/api/planner/blocks", headers=auth_headers)
    assert block_list.status_code == 200
    assert len(block_list.json()) == 1

    reflection_response = client.post(
        "/api/planner/reflections",
        headers=auth_headers,
        json={
            "scheduled_block_id": block["id"],
            "mood_before": 5,
            "mood_after": 8,
            "actual_duration_minutes": 50,
            "intensity": 7,
            "notes": "Strong session",
            "reflected_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    assert reflection_response.status_code == 201
    reflection = reflection_response.json()
    assert reflection["scheduled_block_id"] == block["id"]

    reflection_list = client.get("/api/planner/reflections", headers=auth_headers)
    assert reflection_list.status_code == 200
    assert len(reflection_list.json()) == 1

    summary_response = client.get("/api/planner/weekly-summary", headers=auth_headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["flow_minutes"] == 50
    assert summary["completed_blocks"] == 1
    assert summary["balance_score"] is not None


def test_block_update_and_delete_flow(client, auth_headers):
    template = create_template(client, auth_headers)
    starts_at = datetime.now(timezone.utc)
    block = create_block(client, auth_headers, template["id"], starts_at, duration_minutes=30)

    updated_response = client.patch(
        f"/api/planner/blocks/{block['id']}",
        headers=auth_headers,
        json={
            "task_template_id": template["id"],
            "starts_at": starts_at.isoformat(),
            "ends_at": (starts_at + timedelta(minutes=90)).isoformat(),
            "planned_duration_minutes": 90,
            "intensity_override": 9,
            "notes": "Extended focus block",
            "status": "in_progress",
        },
    )

    assert updated_response.status_code == 200
    updated_block = updated_response.json()
    assert updated_block["planned_duration_minutes"] == 90
    assert updated_block["status"] == "in_progress"

    delete_response = client.delete(f"/api/planner/blocks/{block['id']}", headers=auth_headers)
    assert delete_response.status_code == 204

    block_list = client.get("/api/planner/blocks", headers=auth_headers)
    assert block_list.status_code == 200
    assert block_list.json() == []


def test_template_update_and_delete_flow(client, auth_headers):
    template = create_template(client, auth_headers)

    update_response = client.patch(
        f"/api/planner/templates/{template['id']}",
        headers=auth_headers,
        json={
            "name": "Updated Flow Sprint",
            "category": "flow",
            "subcategory": "Planning",
            "default_duration_minutes": 90,
            "default_intensity": 8,
        },
    )

    assert update_response.status_code == 200
    updated_template = update_response.json()
    assert updated_template["name"] == "Updated Flow Sprint"
    assert updated_template["default_duration_minutes"] == 90

    delete_response = client.delete(
        f"/api/planner/templates/{template['id']}",
        headers=auth_headers,
    )
    assert delete_response.status_code == 204

    template_list = client.get("/api/planner/templates", headers=auth_headers)
    assert template_list.status_code == 200
    assert template_list.json() == []


def test_reflection_update_delete_and_history_flow(client, auth_headers):
    template = create_template(client, auth_headers)
    starts_at = datetime.now(timezone.utc)
    block = create_block(client, auth_headers, template["id"], starts_at, duration_minutes=45)

    reflection_response = client.post(
        "/api/planner/reflections",
        headers=auth_headers,
        json={
            "scheduled_block_id": block["id"],
            "mood_before": 4,
            "mood_after": 7,
            "actual_duration_minutes": 45,
            "intensity": 6,
            "notes": "Initial reflection",
            "reflected_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert reflection_response.status_code == 201
    reflection = reflection_response.json()

    update_response = client.patch(
        f"/api/planner/reflections/{reflection['id']}",
        headers=auth_headers,
        json={
            "mood_before": 5,
            "mood_after": 9,
            "actual_duration_minutes": 50,
            "intensity": 8,
            "notes": "Improved session",
            "reflected_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert update_response.status_code == 200
    updated_reflection = update_response.json()
    assert updated_reflection["mood_after"] == 9
    assert updated_reflection["actual_duration_minutes"] == 50

    history_response = client.get("/api/planner/history", headers=auth_headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["task_name"] == template["name"]
    assert history[0]["reflection_id"] == reflection["id"]
    assert history[0]["mood_after"] == 9

    delete_response = client.delete(
        f"/api/planner/reflections/{reflection['id']}",
        headers=auth_headers,
    )
    assert delete_response.status_code == 204

    reflection_list = client.get("/api/planner/reflections", headers=auth_headers)
    assert reflection_list.status_code == 200
    assert reflection_list.json() == []


def test_planner_endpoints_require_authentication(client):
    template_response = client.get("/api/planner/templates")
    blocks_response = client.get("/api/planner/blocks")
    summary_response = client.get("/api/planner/weekly-summary")

    assert template_response.status_code == 401
    assert blocks_response.status_code == 401
    assert summary_response.status_code == 401


def test_block_creation_rejects_invalid_time_range(client, auth_headers):
    template = create_template(client, auth_headers)
    starts_at = datetime.now(timezone.utc)
    ends_at = starts_at - timedelta(minutes=15)

    response = client.post(
        "/api/planner/blocks",
        headers=auth_headers,
        json={
            "task_template_id": template["id"],
            "starts_at": starts_at.isoformat(),
            "ends_at": ends_at.isoformat(),
            "planned_duration_minutes": 15,
            "intensity_override": 5,
            "notes": "Invalid schedule",
            "status": "pending",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Block end time must be after start time."


def test_duplicate_reflection_returns_conflict(client, auth_headers):
    template = create_template(client, auth_headers)
    starts_at = datetime.now(timezone.utc)
    block = create_block(client, auth_headers, template["id"], starts_at, duration_minutes=30)

    payload = {
        "scheduled_block_id": block["id"],
        "mood_before": 4,
        "mood_after": 7,
        "actual_duration_minutes": 30,
        "intensity": 6,
        "notes": "First reflection",
        "reflected_at": datetime.now(timezone.utc).isoformat(),
    }

    first_response = client.post("/api/planner/reflections", headers=auth_headers, json=payload)
    second_response = client.post("/api/planner/reflections", headers=auth_headers, json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "This block already has a reflection."
