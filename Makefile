.PHONY: install test run-fixture run-live serve simulate clean

install:
	pip install -r requirements.txt

test:
	pytest -v

run-fixture:
	python -m jobradar run --source greenhouse_figma --mode fixture --fixture-dir fixtures

run-live:
	python -m jobradar run --source greenhouse_figma --mode live

serve:
	python -m jobradar serve --host 0.0.0.0 --port 8000

simulate:
	python -m jobradar simulate --source greenhouse_figma --fixture-dir fixtures

clean:
	python -c "import os, glob; [os.remove(f) for f in glob.glob('*.db*')]"
