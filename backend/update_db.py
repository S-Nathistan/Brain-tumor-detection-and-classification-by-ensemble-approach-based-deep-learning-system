from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import ProgrammingError
from backend.core.config import settings


def _is_duplicate_column_error(exc: ProgrammingError) -> bool:
    pgcode = getattr(getattr(exc, "orig", None), "pgcode", None)
    if pgcode == "42701":
        return True
    msg = str(exc).lower()
    return "duplicate column" in msg or "already exists" in msg


def _is_table_exists_error(exc: ProgrammingError) -> bool:
    pgcode = getattr(getattr(exc, "orig", None), "pgcode", None)
    if pgcode == "42P07":
        return True
    msg = str(exc).lower()
    return "already exists" in msg


def _add_columns(conn, table_name: str, columns_to_add: list[tuple[str, str]]) -> None:
    existing = {col["name"] for col in inspect(conn).get_columns(table_name)}
    for column_name, column_ddl in columns_to_add:
        if column_name in existing:
            print(f"  '{column_name}' already exists on {table_name}")
            continue
        try:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_ddl}"))
            print(f"  Added '{column_name}' to {table_name}")
        except ProgrammingError as e:
            if _is_duplicate_column_error(e):
                print(f"  '{column_name}' already exists on {table_name}")
            else:
                raise


def update_db():
    engine = create_engine(settings.DATABASE_URL)
    with engine.begin() as conn:

        # ── users table ──────────────────────────────────────────────────────────
        print("Checking users table…")
        _add_columns(conn, "users", [
            ("name",                            "VARCHAR(255)"),
            ("role",                            "VARCHAR(50) DEFAULT 'Clinician'"),
            ("mobile",                          "VARCHAR(20)"),
            ("status",                          "BOOLEAN DEFAULT TRUE"),
            ("password_reset_token_hash",       "VARCHAR(255)"),
            ("password_reset_token_expires_at", "TIMESTAMP WITH TIME ZONE"),
            ("department",                      "VARCHAR(100)"),
            ("qualification",                   "VARCHAR(255)"),
            ("license_number",                  "VARCHAR(100)"),
            ("gender",                          "VARCHAR(20)"),
            ("profile_picture",                 "VARCHAR(500)"),
        ])

        # ── patients table ───────────────────────────────────────────────────────
        print("Checking patients table…")
        _add_columns(conn, "patients", [
            ("doctor_notes",          "TEXT"),
            ("scan_report",           "VARCHAR(200)"),
            ("updated_at",            "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),
            ("presenting_complaint",   "TEXT"),
            ("symptom_analysis",      "TEXT"),
            ("differential_analysis", "TEXT"),
            ("complications",         "TEXT"),
            ("risk_factor",           "TEXT"),
            ("systemic_review",       "TEXT"),
            ("past_medical_history",  "TEXT"),
            ("family_history",        "TEXT"),
            ("social_history",        "TEXT"),
            ("allergy_history",       "TEXT"),
            ("examination_findings",  "TEXT"),
            ("muscle_power",          "TEXT"),
            ("reflex",                "TEXT"),
            ("assigned_doctor_id",    "INTEGER REFERENCES users(id) ON DELETE SET NULL"),
            ("from_location",         "VARCHAR(100)"),
            ("occupation",            "VARCHAR(100)"),
        ])

        # Drop old string-based assigned_doctor column if it still exists
        existing_patient_cols = {col["name"] for col in inspect(conn).get_columns("patients")}
        if "assigned_doctor" in existing_patient_cols:
            conn.execute(text("ALTER TABLE patients DROP COLUMN assigned_doctor"))
            print("  Dropped legacy 'assigned_doctor' column from patients")

        # ── admissions table (create if missing) ─────────────────────────────────
        print("Checking admissions table…")
        existing_tables = inspect(conn).get_table_names()
        if "admissions" not in existing_tables:
            try:
                conn.execute(text("""
                    CREATE TABLE admissions (
                        id              SERIAL PRIMARY KEY,
                        patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                        episode_number  INTEGER DEFAULT 1,
                        admission_date  VARCHAR(50),
                        discharge_date  VARCHAR(50),
                        status          VARCHAR(20) DEFAULT 'Active',
                        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                print("  Created admissions table")
            except ProgrammingError as e:
                if _is_table_exists_error(e):
                    print("  admissions table already exists")
                else:
                    raise
        else:
            print("  admissions table already exists")

        # ── documents table ─────────────────────────────────────────────────────
        print("Checking documents table…")
        if "documents" in inspect(conn).get_table_names():
            _add_columns(conn, "documents", [
                ("description",  "VARCHAR(500)"),
                ("admission_id", "INTEGER REFERENCES admissions(id) ON DELETE SET NULL"),
            ])
        else:
            print("  documents table not found, skipping")

        # ── results table ────────────────────────────────────────────────────────
        print("Checking results table…")
        _add_columns(conn, "results", [
            ("patient_id",      "INTEGER"),
            ("admission_id",    "INTEGER REFERENCES admissions(id)"),
            ("confirmed_label", "VARCHAR(100)"),
            ("pathology_grade", "VARCHAR(10)"),
            ("confirmed_by",    "INTEGER REFERENCES users(id)"),
            ("confirmed_at",    "TIMESTAMP WITH TIME ZONE"),
        ])

        # ── treatment_plans table ────────────────────────────────────────────────
        print("Checking treatment_plans table…")
        if "treatment_plans" in inspect(conn).get_table_names():
            _add_columns(conn, "treatment_plans", [
                ("admission_id", "INTEGER REFERENCES admissions(id) ON DELETE SET NULL"),
            ])
        else:
            print("  treatment_plans table not found, skipping")

        # ── caretakers table ─────────────────────────────────────────────────────
        print("Checking caretakers table…")
        if "caretakers" not in inspect(conn).get_table_names():
            try:
                conn.execute(text("""
                    CREATE TABLE caretakers (
                        id           SERIAL PRIMARY KEY,
                        patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                        name         VARCHAR(100) NOT NULL,
                        phone        VARCHAR(50) NOT NULL,
                        relation     VARCHAR(50),
                        created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                print("  Created caretakers table")
            except ProgrammingError as e:
                if _is_table_exists_error(e):
                    print("  caretakers table already exists")
                else:
                    raise
        else:
            print("  caretakers table already exists")

        # ── checkins table ──────────────────────────────────────────────────────
        print("Checking checkins table…")
        if "checkins" not in inspect(conn).get_table_names():
            try:
                conn.execute(text("""
                    CREATE TABLE checkins (
                        id                    SERIAL PRIMARY KEY,
                        patient_id            INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                        submitted_by_role     VARCHAR(20) NOT NULL DEFAULT 'patient',
                        trigger_source        VARCHAR(100) NOT NULL DEFAULT 'Patient taps "Daily Check-in"',
                        reminder_frequency    VARCHAR(50) NOT NULL DEFAULT 'Weekly reminder',
                        headache              VARCHAR(50) NOT NULL,
                        seizure               VARCHAR(50) NOT NULL,
                        energy                VARCHAR(50) NOT NULL,
                        nausea                VARCHAR(50) NOT NULL,
                        medication            VARCHAR(50) NOT NULL,
                        overall               VARCHAR(50) NOT NULL,
                        note                  TEXT,
                        score                 INTEGER NOT NULL,
                        level                 VARCHAR(20) NOT NULL,
                        emergency             BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                print("  Created checkins table")
            except ProgrammingError as e:
                if _is_table_exists_error(e):
                    print("  checkins table already exists")
                else:
                    raise
        else:
            print("  checkins table already exists")

        # ── chat_messages table ────────────────────────────────────────────────
        print("Checking chat_messages table…")
        if "chat_messages" not in inspect(conn).get_table_names():
            try:
                conn.execute(text("""
                    CREATE TABLE chat_messages (
                        id              SERIAL PRIMARY KEY,
                        patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                        user_message    TEXT NOT NULL,
                        bot_reply       TEXT NOT NULL,
                        topic           VARCHAR(100),
                        emergency       BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                print("  Created chat_messages table")
            except ProgrammingError as e:
                if _is_table_exists_error(e):
                    print("  chat_messages table already exists")
                else:
                    raise
        else:
            print("  chat_messages table already exists")

        print("DB update complete.")


if __name__ == "__main__":
    update_db()
