"""One-off: clear all data except the Super Admin user.

Truncates every public table except `users`, then deletes all users whose
role is not "Super Admin". Run from project root:
    python -m backend.wipe_dummy_data
"""
import sys
from sqlalchemy import text
from backend.db.database import engine

SUPER_ADMIN_ROLE = "Super Admin"


def main():
    with engine.begin() as conn:
        tables = [
            r[0]
            for r in conn.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
            ))
        ]
        if "users" not in tables:
            print("No 'users' table found. Aborting.")
            sys.exit(1)

        survivors = conn.execute(text(
            "SELECT id, email FROM users WHERE role = :r"
        ), {"r": SUPER_ADMIN_ROLE}).fetchall()
        if not survivors:
            print(f"No user with role '{SUPER_ADMIN_ROLE}' found. Aborting.")
            sys.exit(1)

        to_truncate = [t for t in tables if t != "users"]
        if to_truncate:
            cols = ", ".join(f'"{t}"' for t in to_truncate)
            conn.execute(text(
                f"TRUNCATE {cols} RESTART IDENTITY CASCADE"
            ))

        deleted = conn.execute(text(
            "DELETE FROM users WHERE role <> :r"
        ), {"r": SUPER_ADMIN_ROLE}).rowcount

    print("Truncated tables:", ", ".join(to_truncate) or "(none)")
    print(f"Deleted {deleted} non-super-admin user(s).")
    print("Kept Super Admin user(s):", ", ".join(s[1] for s in survivors))


if __name__ == "__main__":
    main()
