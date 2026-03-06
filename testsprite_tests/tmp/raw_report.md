
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** wonderful-kalam
- **Date:** 2026-03-06
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 get current patient queue without authentication
- **Test Code:** [TC001_get_current_patient_queue_without_authentication.py](./TC001_get_current_patient_queue_without_authentication.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 22, in <module>
  File "<string>", line 14, in test_get_current_patient_queue_without_authentication
AssertionError: Expected status code 200 but got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/48b35231-e89b-4c0d-ab4b-fb54ea55b0ba/4a1424b8-b613-4187-8714-49ac5dad3309
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 get doctor examination queue with valid token
- **Test Code:** [TC002_get_doctor_examination_queue_with_valid_token.py](./TC002_get_doctor_examination_queue_with_valid_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 36, in <module>
  File "<string>", line 18, in test_get_doctor_examination_queue_with_valid_token
AssertionError: Login failed with status 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/48b35231-e89b-4c0d-ab4b-fb54ea55b0ba/16caa769-dd4e-4520-bf78-ef100378e86c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 get doctor examination queue without token
- **Test Code:** [TC003_get_doctor_examination_queue_without_token.py](./TC003_get_doctor_examination_queue_without_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 16, in <module>
  File "<string>", line 12, in test_get_doctor_examination_queue_without_token
AssertionError: Expected status code 401 but got 405

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/48b35231-e89b-4c0d-ab4b-fb54ea55b0ba/1188eac6-103e-48fe-9824-76282be0dbf6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 get admin schedule list with valid token
- **Test Code:** [TC004_get_admin_schedule_list_with_valid_token.py](./TC004_get_admin_schedule_list_with_valid_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 34, in <module>
  File "<string>", line 17, in test_get_admin_schedule_list_with_valid_token
AssertionError: Admin login failed with status 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/48b35231-e89b-4c0d-ab4b-fb54ea55b0ba/e4801d36-ae7e-422a-926e-15ee33ce6a23
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 get admin schedule list without token
- **Test Code:** [TC005_get_admin_schedule_list_without_token.py](./TC005_get_admin_schedule_list_without_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/48b35231-e89b-4c0d-ab4b-fb54ea55b0ba/dfc0e8aa-1266-42ab-82ef-c08f9bb912bc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **20.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---