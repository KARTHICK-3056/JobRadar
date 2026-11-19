"""Command-line interface for JobRadar."""
import argparse
from pathlib import Path
import sys
import logging

from jobradar.core.config import load_settings
from jobradar.core.pipeline import RunPipeline
from jobradar.db.engine import SessionLocal, init_db
from jobradar.scheduler.scheduler import JobRadarScheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jobradar.cli")


def main():
    parser = argparse.ArgumentParser(
        prog="python -m jobradar",
        description="JobRadar: Versioned Change-Tracking System for Internship and Job Listings",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Command: run
    run_parser = subparsers.add_parser("run", help="Execute crawl run for a source")
    run_parser.add_argument("--source", required=True, help="Source ID (e.g. greenhouse_figma)")
    run_parser.add_argument(
        "--mode",
        choices=["live", "fixture"],
        default="fixture",
        help="Run mode: live HTTP or offline fixture replay",
    )
    run_parser.add_argument(
        "--fixture-dir",
        default="fixtures",
        help="Directory containing fixture files",
    )
    run_parser.add_argument(
        "--fixture-file",
        default=None,
        help="Specific fixture file path (optional)",
    )

    # Command: simulate
    sim_parser = subparsers.add_parser("simulate", help="Simulate 3 successive refresh cycles (v1, v2, v3)")
    sim_parser.add_argument("--source", default="greenhouse_figma", help="Source ID to simulate")
    sim_parser.add_argument("--fixture-dir", default="fixtures", help="Fixture directory")

    # Command: sources
    subparsers.add_parser("sources", help="List configured sources and status")

    # Command: init-db
    subparsers.add_parser("init-db", help="Initialize SQLite database tables")

    # Command: serve
    serve_parser = subparsers.add_parser("serve", help="Start FastAPI web server")
    serve_parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    serve_parser.add_argument("--port", type=int, default=8000, help="Bind port")
    serve_parser.add_argument("--reload", action="store_true", help="Enable auto-reload")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    init_db()
    settings = load_settings()

    if args.command == "init-db":
        print("Database initialized successfully.")
        return

    elif args.command == "sources":
        print(f"\n{'ID':<22} {'TYPE':<12} {'INTERVAL':<10} {'NAME'}")
        print("-" * 65)
        for s in settings.sources:
            print(f"{s.id:<22} {s.type:<12} {s.refresh_interval_minutes:<10} {s.name}")
        print()

    elif args.command == "run":
        source_cfg = next((s for s in settings.sources if s.id == args.source), None)
        if not source_cfg:
            logger.error("Source '%s' not found in configuration", args.source)
            sys.exit(1)

        fixture_payload = None
        if args.mode == "fixture":
            fpath = None
            if args.fixture_file:
                fpath = Path(args.fixture_file)
            else:
                # Default fixture mapping
                fdir = Path(args.fixture_dir)
                if source_cfg.type == "greenhouse":
                    fpath = fdir / "greenhouse_v1.json"
                elif source_cfg.type == "lever":
                    fpath = fdir / "lever_v1.json"
                elif source_cfg.type == "html":
                    fpath = fdir / "html_v1.html"

            if fpath and fpath.exists():
                fixture_payload = fpath.read_text(encoding="utf-8")
                logger.info("Loaded fixture payload from: %s", fpath)
            else:
                logger.error("Fixture file not found: %s", fpath)
                sys.exit(1)

        pipeline = RunPipeline(settings)
        session = SessionLocal()
        try:
            run = pipeline.execute_run(
                session=session,
                source_cfg=source_cfg,
                mode=args.mode,
                fixture_payload=fixture_payload,
            )
            print("\n" + "=" * 50)
            print("RUN SUMMARY")
            print("=" * 50)
            print(f"Run ID:     {run.run_id}")
            print(f"Source:     {run.source_id}")
            print(f"Mode:       {run.mode}")
            print(f"Status:     {run.status}")
            print(f"Parsed:     {run.parsed_count}")
            print(f"Added:      {run.new_count}")
            print(f"Updated:    {run.updated_count}")
            print(f"Removed:    {run.removed_count}")
            print(f"Duplicate:  {run.duplicate_count}")
            print(f"Failed:     {run.failed_count}")
            print("=" * 50 + "\n")
        finally:
            session.close()

    elif args.command == "simulate":
        scheduler = JobRadarScheduler(settings)
        runs = scheduler.simulate_refresh_cycles(
            source_id=args.source,
            fixture_dir=Path(args.fixture_dir),
        )
        print("\n" + "=" * 60)
        print(f"SIMULATION COMPLETE: 3 REFRESH CYCLES FOR {args.source}")
        print("=" * 60)
        for idx, r in enumerate(runs, start=1):
            print(f"Cycle {idx}: Status={r.status:<10} New={r.new_count:<4} Updated={r.updated_count:<4} Removed={r.removed_count:<4} Duplicate={r.duplicate_count}")
        print("=" * 60 + "\n")

    elif args.command == "serve":
        import uvicorn
        uvicorn.run("jobradar.api.app:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
